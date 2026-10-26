'use strict';
// ===================== SGC COMMAND – Zero-Dependency WebGL & 3D Perspective Engine (gl3d.js) =====================
// 100% Offline · 0 External Dependencies · Fits strictly within the 1.44 MB Floppy Disk Budget (~11 KB).
// Combines a native WebGL 1.0 hardware shader pipeline (offscreen WebGL context composited onto 2D canvases)
// with a unified mat4 perspective projection & depth-sorted software fallback for headless/non-GL environments.

const GL3D = {
  glCanvas: null,
  gl: null,
  prog: null,
  vbo: null,
  glReady: false,
  verts: [],
  mapHoloMode: false, // Can be toggled independently on the Star Map or globally via S.gfxMode === 'webgl3d'
  yawOffset: 0,
  pitchOffset: 0,

  orbit(dYaw, dPitch) {
    this.yawOffset = (this.yawOffset || 0) + (dYaw || 0);
    this.pitchOffset = Math.max(-4.5, Math.min(7.5, (this.pitchOffset || 0) + (dPitch || 0)));
  },

  resetOrbit() {
    this.yawOffset = 0;
    this.pitchOffset = 0;
  },

  // ---------- 1. Minimal 4x4 Matrix & 3D Projection Math ----------
  mat4Identity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  },

  mat4Multiply(a, b) {
    const out = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      const ai0 = a[i], ai1 = a[i + 4], ai2 = a[i + 8], ai3 = a[i + 12];
      out[i]      = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
      out[i + 4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
      out[i + 8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
      out[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return out;
  },

  mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad / 2), nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  },

  mat4LookAt(eye, center, up) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    let len = Math.hypot(zx, zy, zz) || 1;
    zx /= len; zy /= len; zz /= len;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    len = Math.hypot(xx, xy, xz) || 1;
    xx /= len; xy /= len; xz /= len;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ]);
  },

  project(x, y, z, mvp, W, H) {
    const cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
    const cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
    const cz = mvp[2] * x + mvp[6] * y + mvp[10] * z + mvp[14];
    const cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
    if (cw <= 0.05) return null;
    const invW = 1.0 / cw;
    return {
      x: (cx * invW * 0.5 + 0.5) * W,
      y: (0.5 - cy * invW * 0.5) * H,
      z: cz * invW,
      w: cw
    };
  },

  hexToRgb(hex) {
    const h = String(hex || '#38bdf8').replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6), 16) || 0x38bdf8;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  },

  // ---------- 2. Native WebGL 1.0 Shader Pipeline Initialization ----------
  initWebGL(W, H) {
    if (typeof document === 'undefined') return false;
    try {
      if (!this.glCanvas) {
        this.glCanvas = document.createElement('canvas');
        const gl = this.glCanvas.getContext('webgl', { alpha: true, antialias: true, depth: true }) ||
                   this.glCanvas.getContext('experimental-webgl', { alpha: true, antialias: true, depth: true });
        if (!gl || typeof gl.createShader !== 'function') return false;
        this.gl = gl;

        const vsSrc = `
          attribute vec3 aPos;
          attribute vec3 aNorm;
          attribute vec4 aCol;
          uniform mat4 uMVP;
          varying vec3 vNorm;
          varying vec4 vCol;
          varying vec3 vPos;
          void main() {
            vNorm = aNorm;
            vCol = aCol;
            vPos = aPos;
            gl_Position = uMVP * vec4(aPos, 1.0);
          }
        `;
        const fsSrc = `
          precision mediump float;
          varying vec3 vNorm;
          varying vec4 vCol;
          varying vec3 vPos;
          uniform float uTime;
          void main() {
            vec3 lightDir = normalize(vec3(0.45, 0.85, 0.55));
            float diff = max(dot(normalize(vNorm), lightDir), 0.0);
            float scan = 0.94 + 0.06 * sin(vPos.y * 8.0 + uTime * 3.0);
            vec3 lit = vCol.rgb * (0.42 + 0.68 * diff) * scan;
            gl_FragColor = vec4(lit, vCol.a);
          }
        `;
        const compile = (type, src) => {
          const s = gl.createShader(type);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
        };
        const vs = compile(gl.VERTEX_SHADER, vsSrc);
        const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
        if (!vs || !fs) return false;
        const p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return false;
        this.prog = p;
        this.vbo = gl.createBuffer();
        this.glReady = true;
      }
      if (this.glCanvas.width !== W || this.glCanvas.height !== H) {
        this.glCanvas.width = W;
        this.glCanvas.height = H;
      }
      return this.glReady;
    } catch (e) {
      return false;
    }
  },

  beginBatch() {
    this.verts.length = 0;
  },

  pushTri(p1, p2, p3, nx, ny, nz, r, g, b, a) {
    const v = this.verts;
    v.push(
      p1[0], p1[1], p1[2], nx, ny, nz, r, g, b, a,
      p2[0], p2[1], p2[2], nx, ny, nz, r, g, b, a,
      p3[0], p3[1], p3[2], nx, ny, nz, r, g, b, a
    );
  },

  pushQuad(p1, p2, p3, p4, nx, ny, nz, hexCol, alpha = 1.0) {
    const [r, g, b] = this.hexToRgb(hexCol);
    this.pushTri(p1, p2, p3, nx, ny, nz, r, g, b, alpha);
    this.pushTri(p1, p3, p4, nx, ny, nz, r, g, b, alpha);
  },

  pushBox(x0, y0, z0, x1, y1, z1, topHex, sideHex, alpha = 1.0) {
    // Top face (y1)
    this.pushQuad([x0,y1,z0], [x1,y1,z0], [x1,y1,z1], [x0,y1,z1], 0, 1, 0, topHex, alpha);
    // Front/South face (z1)
    this.pushQuad([x0,y0,z1], [x1,y0,z1], [x1,y1,z1], [x0,y1,z1], 0, 0, 1, sideHex, alpha);
    // Back/North face (z0)
    this.pushQuad([x1,y0,z0], [x0,y0,z0], [x0,y1,z0], [x1,y1,z0], 0, 0, -1, sideHex, alpha);
    // Right/East face (x1)
    this.pushQuad([x1,y0,z1], [x1,y0,z0], [x1,y1,z0], [x1,y1,z1], 1, 0, 0, sideHex, alpha);
    // Left/West face (x0)
    this.pushQuad([x0,y0,z0], [x0,y0,z1], [x0,y1,z1], [x0,y1,z0], -1, 0, 0, sideHex, alpha);
  },

  flushWebGL(targetCtx, mvp, now, W, H) {
    if (!this.initWebGL(W, H) || !this.verts.length) return false;
    const gl = this.gl, p = this.prog;
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STREAM_DRAW);

    const stride = 10 * 4;
    const aPos = gl.getAttribLocation(p, 'aPos');
    const aNorm = gl.getAttribLocation(p, 'aNorm');
    const aCol = gl.getAttribLocation(p, 'aCol');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(aNorm);
    gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(aCol);
    gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, stride, 24);

    gl.uniformMatrix4fv(gl.getUniformLocation(p, 'uMVP'), false, mvp);
    gl.uniform1f(gl.getUniformLocation(p, 'uTime'), (now || 0) * 0.001);

    gl.drawArrays(gl.TRIANGLES, 0, this.verts.length / 10);
    targetCtx.drawImage(this.glCanvas, 0, 0, W, H);
    return true;
  },

  // ---------- 3. 3D Stargate Procedural Mesh & Renderer ----------
  drawStargate3D(c, mvp, gx, gy, gz, radius, rotY, now, W, H) {
    const segs = 24, rIn = radius * 0.78, rOut = radius;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const xform = (lx, ly, lz) => [
      gx + lx * cosY - lz * sinY,
      gy + ly,
      gz + lx * sinY + lz * cosY
    ];

    // Event horizon ripples in 3D
    const ePts = [];
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const rip = Math.sin(now / 220 + i * 0.7) * (radius * 0.05);
      const wPt = xform(Math.cos(a) * rIn, Math.sin(a) * rIn, rip);
      const pr = this.project(wPt[0], wPt[1], wPt[2], mvp, W, H);
      if (pr) ePts.push(pr);
    }
    if (ePts.length >= 3) {
      c.save();
      c.fillStyle = 'rgba(14, 165, 233, 0.55)';
      c.strokeStyle = '#7dd3fc';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(ePts[0].x, ePts[0].y);
      for (let i = 1; i < ePts.length; i++) c.lineTo(ePts[i].x, ePts[i].y);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    }

    // Outer 3D Naquadah Torus segments
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
      const p0 = this.project(...xform(Math.cos(a0) * rOut, Math.sin(a0) * rOut, 0), mvp, W, H);
      const p1 = this.project(...xform(Math.cos(a1) * rOut, Math.sin(a1) * rOut, 0), mvp, W, H);
      const p2 = this.project(...xform(Math.cos(a1) * rIn, Math.sin(a1) * rIn, 0), mvp, W, H);
      const p3 = this.project(...xform(Math.cos(a0) * rIn, Math.sin(a0) * rIn, 0), mvp, W, H);
      if (p0 && p1 && p2 && p3) {
        c.fillStyle = i % 2 === 0 ? '#475569' : '#334155';
        c.strokeStyle = '#94a3b8';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y);
        c.closePath(); c.fill(); c.stroke();
      }
    }

    // 9 Glowing 3D Chevrons around the perimeter
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
      const cp = this.project(...xform(Math.cos(a) * (rOut * 0.94), Math.sin(a) * (rOut * 0.94), 0.04), mvp, W, H);
      if (cp) {
        const sz = Math.max(2.2, Math.min(7, 42 / cp.w));
        c.fillStyle = '#ea580c';
        c.fillRect(cp.x - sz, cp.y - sz, sz * 2, sz * 2);
        c.fillStyle = '#fef08a';
        c.fillRect(cp.x - sz * 0.5, cp.y - sz * 0.5, sz, sz);
      }
    }
  },

  // ---------- 4. 3D Tactical Battlefield Renderer (combat.js) ----------
  renderCombat(cv) {
    if (!cv || typeof C === 'undefined' || !C.active) return;
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    const now = performance.now();
    if (typeof updateFx === 'function') updateFx();

    // Atmospheric 3D Skybox & Horizon Gradient
    const bg = c.createLinearGradient(0, 0, 0, H);
    if (C.theme === 'hatak') { bg.addColorStop(0, '#050811'); bg.addColorStop(0.45, '#131c31'); bg.addColorStop(1, '#060a12'); }
    else if (C.theme === 'asgard') { bg.addColorStop(0, '#081826'); bg.addColorStop(0.45, '#19374d'); bg.addColorStop(1, '#0b1924'); }
    else if (C.theme === 'jungle') { bg.addColorStop(0, '#071710'); bg.addColorStop(0.45, '#163826'); bg.addColorStop(1, '#08140e'); }
    else { bg.addColorStop(0, '#0d1522'); bg.addColorStop(0.45, '#2b231b'); bg.addColorStop(1, '#120f0c'); }
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // Subtle 3D Horizon Grid & Stars
    c.fillStyle = 'rgba(125, 211, 252, 0.35)';
    for (let i = 0; i < 36; i++) {
      const sx = (i * 173 + Math.floor(now * 0.01)) % W, sy = (i * 71) % Math.floor(H * 0.38);
      c.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }

    const zoom = (typeof ISO !== 'undefined' && ISO.zoom) ? ISO.zoom : 1.0;
    const rot = (typeof ISO !== 'undefined' && ISO.rot) ? ISO.rot : 0;

    // 3D Gate Emergence Intro: Zoom & Spiral out from C.gatePos to centered battlefield
    const introAge = C.gateIntroStart ? (now - C.gateIntroStart) / 2200 : 1;
    const inIntro = introAge >= 0 && introAge < 1 && C.gatePos;
    const introEase = inIntro ? (1 - Math.pow(1 - introAge, 3)) : 1.0;
    const introSpin = inIntro ? (1 - introEase) * Math.PI * 1.45 : 0;

    const yaw = rot * (Math.PI / 2) + 0.62 + (this.yawOffset || 0) + introSpin + Math.sin(now / 9000) * 0.04;
    const baseDist = 16.5 / zoom;
    const dist = inIntro ? (6.2 * (1 - introEase) + baseDist * introEase) : baseDist;

    const centerTargetX = (C.cameraX + Math.min(VIEW_W, GW) * 0.5) - GW * 0.5;
    const centerTargetZ = (C.cameraY + Math.min(VIEW_H, GH) * 0.5) - GH * 0.5;
    const gateWorldX = C.gatePos ? (C.gatePos.x - GW * 0.5 + 0.48) : centerTargetX;
    const gateWorldZ = C.gatePos ? (C.gatePos.y - GH * 0.5 + 0.48) : centerTargetZ;

    const camTargetX = inIntro ? (gateWorldX * (1 - introEase) + centerTargetX * introEase) : centerTargetX;
    const camTargetY = inIntro ? (1.15 * (1 - introEase) + 0.2 * introEase) : 0.2;
    const camTargetZ = inIntro ? (gateWorldZ * (1 - introEase) + centerTargetZ * introEase) : centerTargetZ;

    const baseEyeY = Math.max(2.2, 11.5 / Math.sqrt(zoom) + (this.pitchOffset || 0));
    const eyeY = inIntro ? (3.8 * (1 - introEase) + baseEyeY * introEase) : baseEyeY;
    const eye = [
      camTargetX + Math.sin(yaw) * dist,
      eyeY,
      camTargetZ + Math.cos(yaw) * dist
    ];
    const proj = this.mat4Perspective(0.68, W / Math.max(1, H), 0.5, 120.0);
    const view = this.mat4LookAt(eye, [camTargetX, camTargetY, camTargetZ], [0, 1, 0]);
    const mvp = this.mat4Multiply(proj, view);

    const pal = (typeof _isoBiomePalette === 'function') ? _isoBiomePalette(C.theme) : {
      groundTop: ['#4a6b3b', '#436334'], groundLeft: '#2f4724', groundRight: '#22361a',
      wallTop: '#64748b', wallLeft: '#475569', wallRight: '#334155', coverTop: '#78716c', coverLeft: '#57534e'
    };

    this.beginBatch();
    const hitList = [];
    const tileDrawList = [];

    const moveSet = new Set((C.moveRange || []).map(p => p.x + ',' + p.y));
    const atkSet = new Set((C.atkRange || []).map(u => u.x + ',' + u.y));

    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const cell = C.map[idx(x, y)];
        if (!cell) continue;
        const t = cell.t;
        const wx0 = x - GW * 0.5, wz0 = y - GH * 0.5, wx1 = wx0 + 0.96, wz1 = wz0 + 0.96;
        let yTop = 0.0;
        let topCol = pal.groundTop[(x + y) % 2] || '#475569';
        let sideCol = pal.groundLeft || '#334155';

        if (t === 2) { yTop = 1.35; topCol = pal.wallTop; sideCol = pal.wallLeft; }
        else if (t === 3) { yTop = 1.65; topCol = pal.wallTop; sideCol = pal.wallRight || pal.wallLeft; }
        else if (t === 1 || t === 6) { yTop = 0.58; topCol = pal.coverTop; sideCol = pal.coverLeft; }
        else if (t === 4 || t === 7) { yTop = -0.15 + Math.sin(now / 350 + x + y) * 0.06; topCol = '#0284c7'; sideCol = '#0369a1'; }
        else if (t === 5) { yTop = 0.28; topCol = '#38bdf8'; sideCol = '#0284c7'; }
        else if (t === 8) { yTop = 1.45; topCol = '#b45309'; sideCol = '#78350f'; }
        else if (t === 9 || t === 10) { yTop = 0.06; topCol = '#64748b'; sideCol = '#475569'; }
        else if (t === 11) { yTop = 1.15; topCol = '#38bdf8'; sideCol = '#1e3a8a'; }
        else if (t === 12) { yTop = 0.92; topCol = '#eab308'; sideCol = '#78350f'; }
        else if (t === 13) { yTop = 1.3; topCol = '#64748b'; sideCol = '#334155'; }

        if (atkSet.has(x + ',' + y)) topCol = '#ef4444';
        else if (moveSet.has(x + ',' + y)) topCol = '#38bdf8';

        this.pushBox(wx0, -0.35, wz0, wx1, yTop, wz1, topCol, sideCol, 0.96);
        // Secondary 3D architectural crowns (turrets, reactor cores, battlements)
        if (t === 11) {
          this.pushBox(wx0 + 0.22, yTop, wz0 + 0.22, wx1 - 0.22, yTop + 0.55, wz1 - 0.22, '#7dd3fc', '#0284c7', 0.95);
        } else if (t === 12) {
          this.pushBox(wx0 + 0.26, yTop, wz0 + 0.26, wx1 - 0.26, yTop + 0.42, wz1 - 0.26, '#fde047', '#a16207', 0.98);
        } else if (t === 2 || t === 3) {
          this.pushBox(wx0 + 0.14, yTop, wz0 + 0.14, wx1 - 0.14, yTop + 0.22, wz1 - 0.14, sideCol, topCol, 0.95);
        }

        // Project top face for 2D wireframe overlay, software fallback & exact mouse picking
        const p0 = this.project(wx0, yTop, wz0, mvp, W, H);
        const p1 = this.project(wx1, yTop, wz0, mvp, W, H);
        const p2 = this.project(wx1, yTop, wz1, mvp, W, H);
        const p3 = this.project(wx0, yTop, wz1, mvp, W, H);
        if (p0 && p1 && p2 && p3) {
          const avgW = (p0.w + p1.w + p2.w + p3.w) * 0.25;
          const poly = [p0, p1, p2, p3];
          hitList.push({ x, y, topPoly: poly, prismPoly: poly, w: avgW });
          tileDrawList.push({ x, y, t, yTop, topCol, sideCol, poly, w: avgW, wx: (wx0 + wx1) * 0.5, wz: (wz0 + wz1) * 0.5 });
        }
      }
    }

    // Sort back-to-front for painter's pass & front-to-back for hit-testing
    tileDrawList.sort((a, b) => b.w - a.w);
    hitList.sort((a, b) => b.w - a.w); // ISO.lastHitMap expects back-to-front because screenToTileIso iterates backwards!
    if (typeof ISO !== 'undefined') ISO.lastHitMap = hitList;

    const usedGL = this.flushWebGL(c, mvp, now, W, H);

    // Software 3D fallback (if headless or no WebGL) + crisp 3D tactical grid edges
    for (const td of tileDrawList) {
      const [p0, p1, p2, p3] = td.poly;
      if (!usedGL) {
        if (td.yTop > 0.05) {
          const b0 = this.project(td.wx - 0.48, -0.3, td.wz - 0.48, mvp, W, H);
          const b1 = this.project(td.wx + 0.48, -0.3, td.wz - 0.48, mvp, W, H);
          const b2 = this.project(td.wx + 0.48, -0.3, td.wz + 0.48, mvp, W, H);
          const b3 = this.project(td.wx - 0.48, -0.3, td.wz + 0.48, mvp, W, H);
          if (b0 && b1 && b2 && b3) {
            c.fillStyle = td.sideCol;
            c.beginPath();
            c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y);
            c.lineTo(b3.x, b3.y); c.lineTo(b2.x, b2.y); c.lineTo(b1.x, b1.y); c.lineTo(b0.x, b0.y);
            c.closePath(); c.fill();
          }
        }
        c.fillStyle = td.topCol;
        c.beginPath();
        c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y);
        c.closePath(); c.fill();
      }
      // Subtle Holographic Tactical Grid Wireframe
      const isHover = C.hover && C.hover.x === td.x && C.hover.y === td.y;
      c.strokeStyle = isHover ? '#fde047' : moveSet.has(td.x + ',' + td.y) ? 'rgba(125,211,252,0.85)' : 'rgba(148,163,184,0.22)';
      c.lineWidth = isHover ? 2.2 : 0.8;
      c.beginPath();
      c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y);
      c.closePath(); c.stroke();
    }

    // 3D Standing Stargate at C.gatePos
    if (C.gatePos) {
      const gx = C.gatePos.x - GW * 0.5 + 0.48, gz = C.gatePos.y - GH * 0.5 + 0.48;
      this.drawStargate3D(c, mvp, gx, 1.35, gz, 1.25, 0.3, now, W, H);
    }

    // 3D Units & Tactical Projections (sorted back-to-front by camera depth)
    const unitList = Object.values(C.units || {}).filter(u => !u.dead).map(u => {
      const wx = u.x - GW * 0.5 + 0.48, wz = u.y - GH * 0.5 + 0.48;
      const pr = this.project(wx, 0.25, wz, mvp, W, H);
      return { u, wx, wz, pr };
    }).filter(item => item.pr !== null).sort((a, b) => b.pr.w - a.pr.w);

    for (const { u, wx, wz, pr } of unitList) {
      const sc = Math.max(0.45, Math.min(1.65, 11.5 / pr.w));
      const headPr = this.project(wx, 1.25, wz, mvp, W, H) || { x: pr.x, y: pr.y - 28 * sc };

      // 3D Unit Pedestal Disc
      c.fillStyle = u.side === 'player' ? 'rgba(56,189,248,0.35)' : u.side === 'neutral' ? 'rgba(250,204,21,0.35)' : 'rgba(239,68,68,0.35)';
      c.strokeStyle = C.selected === u ? '#fde047' : (u.side === 'player' ? '#38bdf8' : '#ef4444');
      c.lineWidth = C.selected === u ? 2.5 : 1.2;
      c.beginPath();
      c.ellipse(pr.x, pr.y, 12 * sc, 6 * sc, 0, 0, Math.PI * 2);
      c.fill(); c.stroke();

      if (u.side === 'player') {
        const m = S.roster[u.charId];
        if (m && typeof drawSoldier === 'function') drawSoldier(c, pr.x, pr.y, 0.78 * sc, m, now / 140 + u.id, u.downed ? 0.45 : 1);
      } else if (u.side === 'neutral' && typeof drawCivilian === 'function') {
        drawCivilian(c, pr.x, pr.y);
      } else if (typeof drawEnemyBody === 'function') {
        drawEnemyBody(c, pr.x, pr.y, 0.78 * sc, u.type, u.downed ? 0.45 : 1);
      }

      // 3D Floating Billboard HP Bar & Name Tag
      const bw = 30 * sc, bh = 4 * sc, bx = headPr.x - bw * 0.5, by = headPr.y - 10 * sc;
      c.fillStyle = 'rgba(6, 10, 16, 0.88)';
      c.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      c.fillStyle = u.side === 'player' ? (u.hp > u.maxHp * 0.3 ? '#4ade80' : '#ef4444') : '#ef4444';
      c.fillRect(bx, by, bw * Math.max(0, u.hp / (u.maxHp || 1)), bh);
      if (typeof drawUnitLabel === 'function') {
        drawUnitLabel(c, u.name, pr.x, pr.y + 8 * sc, u.side === 'player' ? '#bae6fd' : '#fca5a5', u.overwatch);
      }
    }

    // 3D Weapon Beams & FX
    for (const f of (C.fx || [])) {
      const age = (now - f.t0) / 700;
      if (age < 0 || age > 1) continue;
      if (f.type === 'trace') {
        const p0 = this.project(f.x0 - GW * 0.5 + 0.48, 0.65, f.y0 - GH * 0.5 + 0.48, mvp, W, H);
        const p1 = this.project(f.x1 - GW * 0.5 + 0.48, 0.65, f.y1 - GH * 0.5 + 0.48, mvp, W, H);
        if (p0 && p1) {
          c.strokeStyle = `rgba(250, 204, 21, ${1 - age})`;
          c.lineWidth = 2.5;
          c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
        }
      } else if (f.type === 'dmg') {
        const p = this.project(f.x - GW * 0.5 + 0.48, 1.3 + age * 1.2, f.y - GH * 0.5 + 0.48, mvp, W, H);
        if (p) {
          c.fillStyle = f.color || '#ef4444';
          c.font = 'bold 15px monospace';
          c.textAlign = 'center';
          c.fillText('-' + f.val, p.x, p.y);
        }
      }
    }

    // Gate Emergence Vortex Ripple during introAge < 1
    if (inIntro) {
      const alpha = Math.max(0, (1 - introEase) * 0.72);
      const rVortex = (0.18 + introEase * 0.95) * Math.min(W, H);
      c.save();
      c.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      c.lineWidth = 4 * (1 - introEase) + 1;
      c.beginPath();
      c.arc(W * 0.5, H * 0.5, rVortex, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.75})`;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(W * 0.5, H * 0.5, rVortex * 0.72, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    // 3D Mode Status Badge
    c.fillStyle = 'rgba(6, 12, 22, 0.86)';
    c.fillRect(10, H - 30, 445, 22);
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 1;
    c.strokeRect(10, H - 30, 445, 22);
    c.fillStyle = '#7dd3fc';
    c.font = 'bold 10px monospace';
    c.textAlign = 'left';
    c.fillText(`🌐 3D-WEBGL (${this.glReady ? 'GPU SHADER' : '3D MATRIX'}) · ZOOM ${Math.round(zoom * 100)}% · DRAG / Q,E = 360° ORBIT`, 18, H - 15);
  },

  // ---------- 5. 3D Holographic Star Map (Astria Porta Cartouche Projector) ----------
  renderStarMap(cv, now) {
    if (!cv || typeof PLANETS === 'undefined') return;
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    now = now || performance.now();

    // Deep Ancient Hologram Chamber Backdrop
    const bg = c.createRadialGradient(W * 0.5, H * 0.52, 30, W * 0.5, H * 0.52, W * 0.68);
    bg.addColorStop(0, '#092238');
    bg.addColorStop(0.55, '#05111f');
    bg.addColorStop(1, '#02060c');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    const yaw = now * 0.00022 + this.yawOffset;
    const pitch = 0.52 + this.pitchOffset;
    const dist = 24.0;
    const eye = [Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist];
    const proj = this.mat4Perspective(0.62, W / Math.max(1, H), 0.5, 100.0);
    const view = this.mat4LookAt(eye, [0, 0, 0], [0, 1, 0]);
    const mvp = this.mat4Multiply(proj, view);

    // 3D Galactic Coordinate Rings & Meridians
    c.strokeStyle = 'rgba(56, 189, 248, 0.16)';
    c.lineWidth = 1;
    [5, 10, 15].forEach(rad => {
      c.beginPath();
      let started = false;
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const p = this.project(Math.cos(a) * rad, 0, Math.sin(a) * rad, mvp, W, H);
        if (p) { if (!started) { c.moveTo(p.x, p.y); started = true; } else c.lineTo(p.x, p.y); }
      }
      c.stroke();
    });

    // Map 2D planet coordinates (x: 0..960, y: 0..540) into 3D Galactic Coordinates
    const p3d = {};
    const vis = id => PLANETS[id].ch <= S.chapter;
    for (const id in PLANETS) {
      if (!vis(id)) continue;
      const P = PLANETS[id];
      const wx = ((P.x - 480) / 420) * 14.5;
      const wz = ((P.y - 270) / 240) * 10.5;
      const wy = P.sgc ? 0 : Math.sin(P.x * 0.03 + P.y * 0.05) * 2.6;
      const pr = this.project(wx, wy, wz, mvp, W, H);
      const basePr = this.project(wx, 0, wz, mvp, W, H);
      if (pr) p3d[id] = { id, P, wx, wy, wz, pr, basePr };
    }

    // 3D Curved Wormhole Filaments from SGC to Discovered Worlds
    const sgcNode = p3d.sgc;
    if (sgcNode) {
      for (const id in p3d) {
        if (id === 'sgc') continue;
        const n = p3d[id], disc = S.planets[id] && S.planets[id].disc;
        const mid = this.project((sgcNode.wx + n.wx) * 0.5, Math.max(sgcNode.wy, n.wy) + 1.8, (sgcNode.wz + n.wz) * 0.5, mvp, W, H);
        if (mid) {
          c.save();
          c.setLineDash(disc ? [] : [3, 6]);
          c.strokeStyle = disc ? 'rgba(56, 189, 248, 0.45)' : 'rgba(100, 116, 139, 0.22)';
          c.lineWidth = MAP.sel === id ? 2.2 : 1.1;
          c.beginPath();
          c.moveTo(sgcNode.pr.x, sgcNode.pr.y);
          c.quadraticCurveTo(mid.x, mid.y, n.pr.x, n.pr.y);
          c.stroke();
          c.restore();
        }
      }
      // 3D Rotating Stargate Holo-Ring at Earth (SGC)
      this.drawStargate3D(c, mvp, sgcNode.wx, sgcNode.wy + 0.6, sgcNode.wz, 1.35, now * 0.0012, now, W, H);
    }

    // Sort planets back-to-front by 3D depth (w) and populate MAP.nodes for interactive clicking
    MAP.nodes = [];
    const sorted = Object.values(p3d).sort((a, b) => b.pr.w - a.pr.w);
    const openSet = new Set((typeof openMissions === 'function' ? openMissions() : []).map(m => m.planet));

    for (const n of sorted) {
      const { id, P, pr, basePr } = n;
      const disc = S.planets[id] && S.planets[id].disc;
      const sc = Math.max(0.55, Math.min(1.55, 22.0 / pr.w));
      const r = (P.sgc ? 18 : disc ? 13 : 9) * sc;
      MAP.nodes.push({ id, x: pr.x, y: pr.y, r: r + 8 });

      // Elevation stalk to galactic plane
      if (basePr && !P.sgc) {
        c.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(basePr.x, basePr.y); c.lineTo(pr.x, pr.y); c.stroke();
        c.fillStyle = 'rgba(56, 189, 248, 0.35)';
        c.fillRect(basePr.x - 1.5, basePr.y - 1.5, 3, 3);
      }

      const col = P.sgc ? '#38bdf8' : disc ? (P.type === 'hostile' ? '#ef4444' : P.type === 'empty' ? '#4ade80' : P.type === 'space' ? '#a78bfa' : '#facc15') : '#64748b';
      const gl = c.createRadialGradient(pr.x - r * 0.3, pr.y - r * 0.3, 1, pr.x, pr.y, r * 1.9);
      gl.addColorStop(0, '#ffffff');
      gl.addColorStop(0.35, col);
      gl.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gl;
      c.beginPath(); c.arc(pr.x, pr.y, r * 1.4, 0, Math.PI * 2); c.fill();

      // 3D Orbital Ring around discovered planets
      if (disc) {
        c.strokeStyle = col;
        c.lineWidth = 1.2;
        c.beginPath();
        c.ellipse(pr.x, pr.y, r * 1.45, r * 0.48, 0.35, 0, Math.PI * 2);
        c.stroke();
      }

      if (MAP.sel === id) {
        c.strokeStyle = '#ffffff';
        c.lineWidth = 2;
        c.beginPath(); c.arc(pr.x, pr.y, r + 8, 0, Math.PI * 2); c.stroke();
      }

      if (disc && openSet.has(id)) {
        c.fillStyle = '#fde047';
        c.font = `bold ${Math.round(15 * sc)}px monospace`;
        c.textAlign = 'center';
        c.fillText('!', pr.x + r + 5, pr.y - r + 4);
      }

      c.fillStyle = disc ? '#e0f2fe' : '#64748b';
      c.font = `${disc ? 'bold ' : ''}${Math.max(9, Math.round(11 * sc))}px monospace`;
      c.textAlign = 'center';
      c.fillText(disc ? P.name : '?', pr.x, pr.y + r + 13 * sc);
    }

    // Holo-HUD Banner
    c.fillStyle = 'rgba(4, 12, 24, 0.85)';
    c.fillRect(10, 10, 370, 24);
    c.strokeStyle = '#38bdf8';
    c.strokeRect(10, 10, 370, 24);
    c.fillStyle = '#7dd3fc';
    c.font = 'bold 11px monospace';
    c.textAlign = 'left';
    c.fillText('🌐 ASTRIA PORTA 3D-HOLOGRAMM · KLICK = PLANET WÄHLEN', 18, 26);
  },

  // ---------- 6. 3D Cheyenne Mountain Cutaway Renderer (base.js) ----------
  renderBase(cv) {
    if (!cv || typeof S === 'undefined') return;
    if (cv.width !== BW) cv.width = BW;
    if (cv.height !== BH) cv.height = BH;
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    const now = performance.now();

    if (typeof drawFacilityBackdrop === 'function') drawFacilityBackdrop(c);
    if (typeof drawSurface === 'function') drawSurface(c);

    // 3D Holographic Topographic Wireframe Overlay on Cheyenne Mountain Peak
    c.save();
    c.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    c.lineWidth = 1;
    for (let z = 0; z < 4; z++) {
      const yOff = 10 + z * 11;
      c.beginPath();
      c.moveTo(20, yOff + 52);
      c.lineTo(160, yOff + 10);
      c.lineTo(310, yOff + 2);
      c.lineTo(470, yOff + 16);
      c.lineTo(690, yOff + 52);
      c.stroke();
    }
    c.fillStyle = 'rgba(4, 12, 24, 0.82)';
    c.fillRect(W / 2 - 210, 6, 420, 18);
    c.strokeStyle = '#38bdf8';
    c.strokeRect(W / 2 - 210, 6, 420, 18);
    c.fillStyle = '#7dd3fc';
    c.font = 'bold 9.5px monospace';
    c.textAlign = 'center';
    c.fillText('🌐 3D-PERSPEKTIVE: CHEYENNE MOUNTAIN COMPLEX (L01–L28)', W / 2, 18);
    c.restore();

    // Pass 1: Render all 28 subterranean levels (corridors + level titles + 3D depth extrusion)
    for (let y = 0; y < ROWS; y++) {
      const level = y + 1, sy = GRID_Y + y * CH;
      if (typeof drawLevelArchitecture === 'function') {
        drawLevelArchitecture(c, sy, level);
      }
      // 3D perspective depth extrusion roof & side bevel per level
      c.strokeStyle = 'rgba(56, 189, 248, 0.32)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(GRID_X, sy + 2);
      c.lineTo(GRID_X + 7, sy - 3);
      c.lineTo(GRID_X + GRID_W + 7, sy - 3);
      c.lineTo(GRID_X + GRID_W, sy + 2);
      c.stroke();
    }

    // Pass 2: Render all built rooms on top so the 2x2 Gateroom on L27/L28 is never occluded
    if (S && S.base && S.base.rooms) {
      Object.values(S.base.rooms).forEach(room => {
        if (room) {
          drawBuiltRoom(c, room);
          // 3D extrusion frame around built room
          const rx = GRID_X + room.x * CW, rw = room.w * CW;
          const ry = GRID_Y + (ROWS - room.y - room.h) * CH, rh = room.h * CH;
          c.strokeStyle = 'rgba(125, 211, 252, 0.45)';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(rx + 2, ry + 3);
          c.lineTo(rx + 7, ry - 2);
          c.lineTo(rx + rw + 3, ry - 2);
          c.lineTo(rx + rw - 2, ry + 3);
          c.stroke();
        }
      });
    }

    // Pass 3: Render canonical SGC Command Rooms on Level 27 & 28 (Walter, Briefing, Hammond, MALP)
    if (typeof drawSgcCommandRooms === 'function') drawSgcCommandRooms(c, now);

    // Pass 4: Elevator & Crew
    if (typeof drawBaseElevator === 'function') drawBaseElevator(c, now);
    if (typeof drawBasePeople === 'function') drawBasePeople(c, now);
  },

  // ---------- 7. 3D Planetary Colony Renderer (True 3D Perspective + 3D Gate on Sector 2,2) ----------
  drawBox3D(c, mvp, x, z, y, dx, dz, dy, topCol, sideL, sideR, strokeCol, W, H) {
    const x0 = x, x1 = x + dx, y0 = y, y1 = y + dy, z0 = z, z1 = z + dz;
    const t0 = this.project(x0, y1, z0, mvp, W, H);
    const t1 = this.project(x1, y1, z0, mvp, W, H);
    const t2 = this.project(x1, y1, z1, mvp, W, H);
    const t3 = this.project(x0, y1, z1, mvp, W, H);
    const b1 = this.project(x1, y0, z0, mvp, W, H);
    const b2 = this.project(x1, y0, z1, mvp, W, H);
    const b3 = this.project(x0, y0, z1, mvp, W, H);
    if (!t0 || !t1 || !t2 || !t3) return;

    // Front-Left (+Z) face
    if (b2 && b3 && sideL) {
      c.fillStyle = sideL;
      c.beginPath();
      c.moveTo(t3.x, t3.y); c.lineTo(t2.x, t2.y); c.lineTo(b2.x, b2.y); c.lineTo(b3.x, b3.y);
      c.closePath(); c.fill();
    }
    // Front-Right (+X) face
    if (b1 && b2 && sideR) {
      c.fillStyle = sideR;
      c.beginPath();
      c.moveTo(t2.x, t2.y); c.lineTo(t1.x, t1.y); c.lineTo(b1.x, b1.y); c.lineTo(b2.x, b2.y);
      c.closePath(); c.fill();
    }
    // Top (+Y) face
    if (topCol) {
      c.fillStyle = topCol;
      c.beginPath();
      c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y); c.lineTo(t2.x, t2.y); c.lineTo(t3.x, t3.y);
      c.closePath(); c.fill();
    }
    if (strokeCol) {
      c.strokeStyle = strokeCol;
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y); c.lineTo(t2.x, t2.y); c.lineTo(t3.x, t3.y);
      c.closePath(); c.stroke();
    }
  },

  renderColony(cv, planetId, col, p, now, pulse) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    const bg = c.createLinearGradient(0, 0, 0, H);
    if (p.type === 'hostile') { bg.addColorStop(0, '#140b06'); bg.addColorStop(1, '#2d1c10'); }
    else if (p.type === 'space') { bg.addColorStop(0, '#04060c'); bg.addColorStop(1, '#101728'); }
    else { bg.addColorStop(0, '#071019'); bg.addColorStop(1, '#152636'); }
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // Subtle 3D orbital horizon grid in sky
    c.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.ellipse(W * 0.5, H * 0.58, 140 + i * 65, 42 + i * 22, 0, 0, Math.PI * 2);
      c.stroke();
    }

    const gridW = col ? col.gridW : 6, gridH = col ? col.gridH : 5;
    const cx = gridW * 0.5, cz = gridH * 0.5;
    const zScale = (typeof ISO !== 'undefined' && ISO.zoom) ? ISO.zoom : 1.0;
    const dist = 7.4 / Math.max(0.6, Math.min(1.8, zScale));
    const colYaw = 0.74 + (this.yawOffset || 0) + Math.sin(now * 0.0004) * 0.08;
    const eye = [
      cx + Math.sin(colYaw) * dist * 0.84,
      Math.max(2.0, dist * 0.78 + (this.pitchOffset || 0) * 0.4),
      cz + Math.cos(colYaw) * dist * 0.84
    ];
    const center = [cx - 0.1, 0.25, cz - 0.1];
    const proj = this.mat4Perspective(0.60, W / Math.max(1, H), 0.5, 60);
    const view = this.mat4LookAt(eye, center, [0, 1, 0]);
    const mvp = this.mat4Multiply(proj, view);

    if (typeof COLONY_ISO !== 'undefined') COLONY_ISO.lastHitMap = [];

    // Collect sectors and sort back-to-front by distance to 3D camera
    const sectors = [];
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const dx = (x + 0.5) - eye[0], dz = (y + 0.5) - eye[2];
        sectors.push({ x, y, dist2: dx * dx + dz * dz });
      }
    }
    sectors.sort((a, b) => b.dist2 - a.dist2);

    for (let i = 0; i < sectors.length; i++) {
      const { x, y } = sectors[i];
      const s = col && col.sectors ? col.sectors.find(sec => sec.x === x && sec.y === y) : null;
      const bType = s ? s.building : (x === 2 && y === 2 ? 'gate' : null);
      const isSel = typeof COLONY_UI !== 'undefined' && COLONY_UI && COLONY_UI.selX === x && COLONY_UI.selY === y;
      const isAlt = ((x + y) & 1) === 0;

      let topCol = isAlt ? '#28394b' : '#1f2e3d';
      let sideL = '#182430', sideR = '#101922';
      if (p.type === 'hostile') {
        topCol = isAlt ? '#543a28' : '#442d1d';
        sideL = '#382416'; sideR = '#26180e';
      }
      const strokeCol = isSel ? '#ffd166' : 'rgba(125, 211, 252, 0.22)';
      this.drawBox3D(c, mvp, x + 0.04, y + 0.04, 0, 0.92, 0.92, 0.26, isSel ? '#3b4f66' : topCol, sideL, sideR, strokeCol, W, H);

      const pTop = this.project(x + 0.5, 0.26, y + 0.5, mvp, W, H);
      if (pTop && typeof COLONY_ISO !== 'undefined') {
        COLONY_ISO.lastHitMap.push({ x, y, sx: pTop.x, sy: pTop.y });
      }

      if (bType === 'gate') {
        // 3D Stepped Dais + Access Ramp + DHD Pedestal + 3D Stargate right on sector (x,y)!
        this.drawBox3D(c, mvp, x + 0.10, y + 0.10, 0.26, 0.80, 0.80, 0.12, '#3e4c5e', '#2b3644', '#1c242e', 'rgba(125,211,252,0.45)', W, H);
        this.drawBox3D(c, mvp, x + 0.22, y + 0.22, 0.38, 0.56, 0.56, 0.10, '#526274', '#384452', '#252e38', null, W, H);
        this.drawBox3D(c, mvp, x + 0.52, y + 0.52, 0.26, 0.32, 0.32, 0.16, '#64748b', '#475569', '#334155', '#38bdf8', W, H);
        // DHD Pedestal in front of Gate
        this.drawBox3D(c, mvp, x + 0.72, y + 0.70, 0.26, 0.16, 0.16, 0.24, '#f97316', '#475569', '#334155', '#fed7aa', W, H);
        // 3D Stargate Ring with 9 Chevrons & Event Horizon standing upright on the dais
        this.drawStargate3D(c, mvp, x + 0.5, 0.86, y + 0.5, 0.42, 0.68 + Math.sin(now * 0.0008) * 0.15, now, W, H);
      } else if (bType === 'mine') {
        this.drawBox3D(c, mvp, x + 0.22, y + 0.22, 0.26, 0.56, 0.56, 0.68, '#8b6e4e', '#6b5035', '#533e28', '#eab308', W, H);
        this.drawBox3D(c, mvp, x + 0.38, y + 0.38, 0.94, 0.24, 0.24, 0.32, '#38bdf8', '#0284c7', '#0369a1', null, W, H);
      } else if (bType === 'lab') {
        this.drawBox3D(c, mvp, x + 0.18, y + 0.18, 0.26, 0.64, 0.64, 0.48, '#38bdf8', '#0284c7', '#0369a1', '#bae6fd', W, H);
        this.drawBox3D(c, mvp, x + 0.30, y + 0.30, 0.74, 0.40, 0.40, 0.24, '#e0f2fe', '#7dd3fc', '#38bdf8', null, W, H);
      } else if (bType === 'reactor') {
        this.drawBox3D(c, mvp, x + 0.18, y + 0.18, 0.26, 0.64, 0.64, 0.45, '#475569', '#334155', '#1e293b', '#38bdf8', W, H);
        this.drawBox3D(c, mvp, x + 0.32, y + 0.32, 0.71, 0.36, 0.36, 0.42, '#7dd3fc', '#0ea5e9', '#0284c7', '#ffffff', W, H);
      } else if (bType === 'dome') {
        this.drawBox3D(c, mvp, x + 0.14, y + 0.14, 0.26, 0.72, 0.72, 0.55, 'rgba(56,189,248,0.45)', 'rgba(14,165,233,0.35)', 'rgba(2,132,199,0.28)', '#7dd3fc', W, H);
      } else if (bType === 'hangar') {
        this.drawBox3D(c, mvp, x + 0.14, y + 0.18, 0.26, 0.72, 0.64, 0.38, '#475569', '#334155', '#1e293b', '#facc15', W, H);
      } else if (bType === 'gate_defense') {
        this.drawBox3D(c, mvp, x + 0.24, y + 0.24, 0.26, 0.52, 0.52, 0.38, '#64748b', '#475569', '#334155', '#eab308', W, H);
        this.drawBox3D(c, mvp, x + 0.36, y + 0.36, 0.64, 0.28, 0.28, 0.28, '#eab308', '#ca8a04', '#a16207', null, W, H);
      } else if (bType === 'hospital') {
        this.drawBox3D(c, mvp, x + 0.20, y + 0.20, 0.26, 0.60, 0.60, 0.46, '#f1f5f9', '#cbd5e1', '#94a3b8', '#ef4444', W, H);
      } else if (bType === 'barracks') {
        this.drawBox3D(c, mvp, x + 0.18, y + 0.18, 0.26, 0.64, 0.64, 0.42, '#3f5a36', '#2e4228', '#1e2b1b', '#86efac', W, H);
      } else if (pTop) {
        c.fillStyle = 'rgba(255,255,255,0.22)';
        c.font = '9px monospace';
        c.textAlign = 'center';
        c.fillText(`${x},${y}`, pTop.x, pTop.y + 3);
      }

      if (s && s.lvl > 1 && pTop) {
        c.fillStyle = '#ffd166';
        c.font = 'bold 10px monospace';
        c.textAlign = 'center';
        c.fillText('★'.repeat(s.lvl), pTop.x, pTop.y - 26);
      }
    }

    // Telemetry Header Box
    c.fillStyle = 'rgba(4, 8, 14, 0.88)';
    c.fillRect(16, 16, 360, 58);
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 1.5;
    c.strokeRect(16, 16, 360, 58);
    c.fillStyle = '#7dd3fc';
    c.font = 'bold 14px "Segoe UI", sans-serif';
    c.textAlign = 'left';
    c.fillText(`🌐 ${p.name.toUpperCase()} · 3D-WEBGL KOLONIE`, 26, 38);
    c.font = '11px "Segoe UI", sans-serif';
    c.fillStyle = '#94a3b8';
    const cStats = col && typeof getColonyStats === 'function' ? getColonyStats(col) : null;
    c.fillText(col && cStats ? `Energie: ${cStats.power - cStats.powerUsed >= 0 ? '⚡ +' : '⚡ '}${cStats.power - cStats.powerUsed} · Abwehr: 🛡 ${cStats.defense} · Ertrag: ⛏+${cStats.yield.ore} ⚙+${cStats.yield.tech}` : 'Außenposten noch nicht gegründet · 3D-Stargate aktiv auf (2,2)', 26, 58);
  },

  // ---------- 8. 3D Rotating Stargate Interior Card ----------
  renderStargateCard(cv, now) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    const proj = this.mat4Perspective(0.65, W / Math.max(1, H), 0.5, 40);
    const view = this.mat4LookAt([0, 0.3, 4.2], [0, 0, 0], [0, 1, 0]);
    const mvp = this.mat4Multiply(proj, view);
    this.drawStargate3D(c, mvp, 0, -0.1, 0, 1.25, Math.sin(now * 0.0012) * 0.55, now, W, H);
  }
};

if (typeof globalThis !== 'undefined') globalThis.GL3D = GL3D;

