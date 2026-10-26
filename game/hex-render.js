/* =====================================================================
   SGC Command · hex-render.js (v0.37) – 3D-Hex-Prismen & Taktik-Renderer
   Ein Renderer, drei Stile – passend zum Grafikmodus + stufenloser Zoom:
     pixel   → Echte 3D-Hex-Prismen mit 3 schattierten Seitenflächen,
               innerer Bevel-Lichtkante, Biom-Details, 3D-Stargate mit
               9 Chevrons & Ereignishorizont sowie SG-1 Charakter-Sprites
     ascii   → CP437/ASCII-Glyphen im Hex-Raster, Phosphor-Farben
     topdown → Klare 2D-Taktik-Hexes mit Höhenschatten & Deckungs-Icons
   Inkl. vollem Zoom-Support (ISO.zoom 0.50..2.25) & Gate-Austritts-Intro!
   ===================================================================== */
(function () {
  'use strict';
  function getZ() { return (typeof ISO !== 'undefined' && ISO.zoom) ? ISO.zoom : 1.0; }
  function getS() { return TILE * 0.58 * getZ(); }
  function getHW() { return Math.sqrt(3) * getS(); }
  function getRH() { return 1.5 * getS(); }

  /* Paletten je Missions-Thema: [Boden1, Boden2, leichte Deckung, schwere Deckung, Wand, Spezial/Wasser, KlippeL, KlippeR] */
  var PAL = {
    desert: ['#c8a468', '#ba9456', '#9b7b45', '#7c6236', '#664f2c', '#d4af37', '#8a6d3b', '#634d28'],
    jungle: ['#396836', '#30592d', '#4c7832', '#2d4c22', '#22381a', '#28748a', '#26421d', '#192e13'],
    hatak:  ['#353d4b', '#2d3440', '#6e5c2b', '#8f7734', '#1f242d', '#d4af37', '#232832', '#161a22'],
    asgard: ['#8fa6b0', '#7e96a0', '#637c87', '#4d6570', '#364852', '#7dd3fc', '#526872', '#3b4d56'],
    city:   ['#5c6068', '#50545c', '#7d735d', '#454850', '#32353d', '#38bdf8', '#3d4047', '#282a30'],
    sgc:    ['#333d4b', '#2b3440', '#526273', '#3e4c5c', '#242e3a', '#38bdf8', '#222b36', '#161c24']
  };
  function pal() { return PAL[C.theme] || PAL.desert; }
  function hash(x, y) { var h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function center(x, y) {
    var S_ = getS(), HW = Math.sqrt(3) * S_, RH = 1.5 * S_;
    return { x: HW * (x + 0.5 * (y & 1)) + HW / 2, y: RH * y + S_ };
  }
  function hexVerts(cx, cy, r) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 180 * (60 * i - 30);
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
  }
  function hexPath(c, cx, cy, r) {
    c.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 180 * (60 * i - 30);
      if (i === 0) c.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      else c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    c.closePath();
  }
  function tileKind(t) {
    if (t === 4 || t === 7) return 'water';
    if (t === 1 || t === 6) return 'light';
    if (t === 2) return 'heavy';
    if (t === 3 || t === 8 || t === 13) return 'wall';
    if (t === 5 || t === 9 || t === 10 || t === 11 || t === 12) return 'special';
    return 'floor';
  }
  var GLYPH = { floor: '·', water: '≈', light: '▒', heavy: '▓', wall: '█', special: '◊' };

  function drawHexPrism3D(c, cx, cy, r, h, topCol, sideColL, sideColM, sideColR, bevelCol) {
    var topY = cy - h;
    if (h > 1) {
      // Bodenschatten
      c.fillStyle = 'rgba(0,0,0,0.35)';
      hexPath(c, cx + h * 0.22, cy + h * 0.18, r);
      c.fill();
      // 3 vordere Seitenflächen des Pointy-Top-Hexagons: (v0->v1 rechts, v1->v2 vorne-rechts, v2->v3 vorne-links)
      var vTop = hexVerts(cx, topY, r);
      var vBot = hexVerts(cx, cy, r);
      var faces = [
        { a: 2, b: 3, col: sideColL }, // vorne-links
        { a: 1, b: 2, col: sideColM }, // vorne-rechts
        { a: 0, b: 1, col: sideColR }, // rechts
        { a: 3, b: 4, col: sideColL }  // links
      ];
      for (var fi = 0; fi < faces.length; fi++) {
        var f = faces[fi];
        c.fillStyle = f.col;
        c.beginPath();
        c.moveTo(vTop[f.a].x, vTop[f.a].y);
        c.lineTo(vTop[f.b].x, vTop[f.b].y);
        c.lineTo(vBot[f.b].x, vBot[f.b].y);
        c.lineTo(vBot[f.a].x, vBot[f.a].y);
        c.closePath();
        c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.28)';
        c.lineWidth = 0.8;
        c.stroke();
      }
    }
    // Top-Hexagon
    hexPath(c, cx, topY, r);
    c.fillStyle = topCol;
    c.fill();
    c.strokeStyle = bevelCol || 'rgba(255,255,255,0.14)';
    c.lineWidth = 1;
    c.stroke();
    // Innere 3D-Bevel-Facette
    if (r > 10) {
      hexPath(c, cx, topY, r * 0.82);
      c.strokeStyle = h > 2 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)';
      c.lineWidth = 0.8;
      c.stroke();
    }
  }

  function drawTilePixel(c, x, y, t, P, now) {
    var S_ = getS(), z = getZ(), p = center(x, y), k = tileKind(t), n = hash(x, y);
    var baseH = (k === 'water') ? 0 : Math.round((2 + (n > 0.65 ? 2 : 0)) * z);
    var structH = k === 'wall' ? Math.round(20 * z) : k === 'heavy' ? Math.round(12 * z) : k === 'light' ? Math.round(6 * z) : (t === 11 || t === 12) ? Math.round(14 * z) : 0;
    var totalH = baseH + structH;
    var top = k === 'water' ? '#0369a1' : k === 'wall' ? P[4] : k === 'heavy' ? P[3] : k === 'light' ? P[2] : k === 'special' ? P[5] : (n > 0.5 ? P[0] : P[1]);
    var sideL = structH > 0 ? P[6] : 'rgba(20,28,38,0.85)';
    var sideM = structH > 0 ? P[4] : 'rgba(15,22,30,0.92)';
    var sideR = structH > 0 ? P[7] : 'rgba(10,15,22,0.96)';

    drawHexPrism3D(c, p.x, p.y, S_ - 0.8, totalH, top, sideL, sideM, sideR, k === 'water' ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.14)');
    var ty = p.y - totalH;

    // Biom- & Struktur-Details auf der Oberfläche
    if (k === 'water') {
      var wave = Math.sin(now / 380 + x * 0.9 + y * 0.7) * 0.5 + 0.5;
      c.strokeStyle = 'rgba(125,211,252,' + (0.25 + wave * 0.35) + ')';
      c.lineWidth = 1.2 * z;
      hexPath(c, p.x, ty, S_ * (0.45 + wave * 0.22));
      c.stroke();
    } else if (k === 'floor') {
      c.fillStyle = 'rgba(0,0,0,0.15)';
      for (var i = 0; i < 3; i++) {
        var a = hash(x + i * 7, y) * 6.28, d = hash(x, y + i * 5) * S_ * 0.55;
        c.fillRect(p.x + Math.cos(a) * d, ty + Math.sin(a) * d, 2 * z, 2 * z);
      }
      if (C.theme === 'jungle' && n > 0.62) {
        c.fillStyle = '#4ade80';
        c.fillRect(p.x - 2 * z, ty - 2 * z, 3 * z, 3 * z);
      }
    } else if (k === 'light' || k === 'heavy') {
      // Deckungs-Krone (Sandsäcke / Felsen / Brustwehr)
      drawHexPrism3D(c, p.x, ty, S_ * 0.58, Math.round(3 * z), P[2], P[6], P[4], P[7], 'rgba(255,255,255,0.22)');
    } else if (t === 11) {
      // Naquadah-Reaktor-Kern
      drawHexPrism3D(c, p.x, ty, S_ * 0.48, Math.round(7 * z), '#38bdf8', '#0284c7', '#0369a1', '#075985', '#bae6fd');
    } else if (t === 12) {
      // Auto-Geschützturm
      drawHexPrism3D(c, p.x, ty, S_ * 0.45, Math.round(6 * z), '#eab308', '#a16207', '#854d0e', '#713f12', '#fef08a');
    } else if (k === 'special') {
      c.globalAlpha = 0.45 + 0.3 * Math.sin(now / 360 + x);
      c.fillStyle = '#e0f2fe';
      hexPath(c, p.x, ty, S_ * 0.42);
      c.fill();
      c.globalAlpha = 1;
    }
    return ty;
  }

  function drawTileAscii(c, x, y, t) {
    var S_ = getS(), p = center(x, y), k = tileKind(t);
    hexPath(c, p.x, p.y, S_ - 1);
    c.fillStyle = k === 'water' ? '#021019' : '#030803';
    c.fill();
    c.strokeStyle = k === 'water' ? 'rgba(56,189,248,0.28)' : 'rgba(124,252,138,0.16)';
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = k === 'water' ? '#38bdf8' : k === 'floor' ? 'rgba(124,252,138,' + (0.28 + hash(x, y) * 0.25) + ')' : k === 'special' ? '#ffb000' : '#7CFC8a';
    c.font = 'bold ' + Math.max(8, Math.round(S_ * 0.85)) + 'px monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(GLYPH[k] || '·', p.x, p.y);
  }

  function drawTileFlat(c, x, y, t, P) {
    var S_ = getS(), p = center(x, y), k = tileKind(t);
    hexPath(c, p.x, p.y, S_ - 1.2);
    c.fillStyle = k === 'water' ? '#0284c7' : k === 'wall' ? P[4] : k === 'heavy' ? P[3] : k === 'light' ? P[2] : k === 'special' ? P[5] : P[0];
    c.fill();
    c.strokeStyle = 'rgba(15,23,42,0.55)';
    c.lineWidth = 1.4;
    c.stroke();
    hexPath(c, p.x, p.y, S_ * 0.84);
    c.strokeStyle = 'rgba(255,255,255,0.08)';
    c.lineWidth = 0.8;
    c.stroke();
    if (k === 'light' || k === 'heavy') {
      c.fillStyle = 'rgba(255,255,255,0.75)';
      c.font = 'bold ' + Math.max(8, Math.round(S_ * 0.65)) + 'px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(k === 'heavy' ? '⛊' : '⛉', p.x, p.y);
    }
  }

  function drawHexStargate(c, gx, gy, mode, now) {
    var S_ = getS(), z = getZ();
    if (mode === 'ascii') {
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 2;
      hexPath(c, gx, gy, S_ * 0.92);
      c.stroke();
      c.fillStyle = '#7dd3fc';
      c.font = 'bold ' + Math.max(10, Math.round(S_ * 0.85)) + 'px monospace';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('⛩', gx, gy);
      return;
    }
    // 1. Hexagonal Stepped Stone Dais
    drawHexPrism3D(c, gx, gy, S_ * 0.96, Math.round(6 * z), '#475569', '#334155', '#1e293b', '#0f172a', '#64748b');
    drawHexPrism3D(c, gx, gy - 6 * z, S_ * 0.76, Math.round(4 * z), '#64748b', '#475569', '#334155', '#1e293b', '#94a3b8');
    var gateY = gy - 16 * z;
    var rOut = S_ * 0.78, rIn = S_ * 0.58;

    // 2. Glowing Event Horizon Vortex
    var pulse = 0.5 + 0.5 * Math.sin(now / 220);
    var eg = c.createRadialGradient(gx, gateY, rIn * 0.1, gx, gateY, rIn);
    eg.addColorStop(0, '#ffffff');
    eg.addColorStop(0.35, '#7dd3fc');
    eg.addColorStop(0.75, '#0284c7');
    eg.addColorStop(1, '#0c4a6e');
    c.fillStyle = eg;
    c.beginPath();
    c.arc(gx, gateY, rIn, 0, Math.PI * 2);
    c.fill();

    // Ripple rings inside the puddle
    c.strokeStyle = 'rgba(224,242,254,' + (0.35 + 0.35 * pulse) + ')';
    c.lineWidth = 1.2 * z;
    c.beginPath();
    c.arc(gx, gateY, rIn * (0.35 + 0.35 * ((now / 600) % 1)), 0, Math.PI * 2);
    c.stroke();

    // 3. Naquadah Ring & 9 Glowing Chevrons
    c.strokeStyle = '#334155';
    c.lineWidth = Math.max(3, 5.5 * z);
    c.beginPath();
    c.arc(gx, gateY, (rIn + rOut) * 0.5, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = '#94a3b8';
    c.lineWidth = Math.max(1, 1.5 * z);
    c.beginPath();
    c.arc(gx, gateY, rOut, 0, Math.PI * 2);
    c.stroke();

    for (var i = 0; i < 9; i++) {
      var a = (i / 9) * Math.PI * 2 - Math.PI / 2;
      var cx = gx + Math.cos(a) * ((rIn + rOut) * 0.5);
      var cy = gateY + Math.sin(a) * ((rIn + rOut) * 0.5);
      var sz = Math.max(2, 2.8 * z);
      c.fillStyle = '#ea580c';
      c.fillRect(cx - sz, cy - sz, sz * 2, sz * 2);
      c.fillStyle = '#fef08a';
      c.fillRect(cx - sz * 0.5, cy - sz * 0.5, sz, sz);
    }
  }

  function drawFallbackSoldier(c, cx, cy, col, ascii, z) {
    if (ascii) {
      c.fillStyle = col;
      c.font = 'bold ' + Math.max(10, Math.round(getS())) + 'px monospace';
      c.fillText('@', cx, cy);
      return;
    }
    c.fillStyle = 'rgba(0,0,0,.35)';
    c.beginPath();
    c.ellipse(cx, cy + 10 * z, 9 * z, 3.5 * z, 0, 0, 7);
    c.fill();
    c.fillStyle = '#3f5a3a';
    c.fillRect(cx - 5 * z, cy - 6 * z, 10 * z, 13 * z);
    c.fillStyle = '#e0b48a';
    c.fillRect(cx - 3.5 * z, cy - 13 * z, 7 * z, 7 * z);
    c.fillStyle = col;
    c.fillRect(cx - 5 * z, cy - 6 * z, 10 * z, 2.5 * z);
    c.fillStyle = '#222';
    c.fillRect(cx + 3 * z, cy - 2 * z, 8 * z, 2.5 * z);
  }

  function drawUnits(c, mode, now) {
    var ascii = mode === 'ascii', S_ = getS(), HW = getHW(), z = getZ();
    var units = Object.values(C.units || {}).filter(function (u) { return !u.dead; });
    units.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    units.forEach(function (u) {
      var p = center(u.x, u.y);
      var uy = p.y - (mode === 'pixel' ? 3 * z : 0);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      if (u.side === 'player') {
        if (C.selected === u) {
          c.strokeStyle = '#fde047';
          c.lineWidth = 2.4 * z;
          hexPath(c, p.x, uy, S_ - 3 * z);
          c.stroke();
        }
        var m = (typeof S !== 'undefined' && S && S.roster) ? S.roster[u.charId] : null;
        if (!ascii && m && typeof window !== 'undefined' && typeof window.drawSoldier === 'function') {
          window.drawSoldier(c, p.x, uy + 6 * z, 0.68 * z, m, now / 140 + (u.id || 0), u.downed ? 0.45 : 1);
        } else {
          drawFallbackSoldier(c, p.x, uy, u.downed ? '#666' : '#4fc3f7', ascii, z);
        }
      } else if (u.side === 'neutral') {
        if (ascii) {
          c.fillStyle = '#ffe493';
          c.font = 'bold ' + Math.max(10, Math.round(S_)) + 'px monospace';
          c.fillText('☺', p.x, uy);
        } else if (typeof drawCivilian === 'function') {
          drawCivilian(c, p.x, uy);
        }
      } else {
        if (C.atkRange && C.atkRange.indexOf(u) >= 0) {
          c.strokeStyle = '#ef4444';
          c.lineWidth = 2.4 * z;
          hexPath(c, p.x, uy, S_ - 3 * z);
          c.stroke();
        }
        if (ascii) {
          c.fillStyle = '#ff5555';
          c.font = 'bold ' + Math.max(10, Math.round(S_)) + 'px monospace';
          c.fillText(u.type && u.type.indexOf('jaffa') === 0 ? 'J' : 'E', p.x, uy);
        } else if (typeof drawEnemyBody === 'function') {
          drawEnemyBody(c, p.x, uy + 4 * z, 0.72 * z, u.type, u.downed ? 0.4 : 1);
        }
      }
      // HP-Balken
      var w = HW * 0.72, bh = Math.max(3, 3.5 * z), by = uy - S_ + 2 * z;
      c.fillStyle = 'rgba(6,10,16,0.88)';
      c.fillRect(p.x - w / 2 - 1, by - 1, w + 2, bh + 2);
      c.fillStyle = u.side === 'player' ? (u.hp > u.maxHp * 0.3 ? '#4ade80' : '#f59e0b') : '#ef4444';
      c.fillRect(p.x - w / 2, by, w * Math.max(0, u.hp) / Math.max(1, u.maxHp), bh);
      if (typeof drawUnitLabel === 'function' && !ascii) {
        drawUnitLabel(c, u.name, p.x, uy + S_ - 2 * z, u.side === 'player' ? '#93c5fd' : '#f87171', u.overwatch);
      }
    });
  }

  function drawFx(c, now) {
    var S_ = getS(), z = getZ();
    (C.fx || []).forEach(function (f) {
      var age = (now - f.t0) / 700;
      if (age < 0 || age > 1) return;
      c.globalAlpha = 1 - age;
      if (f.type === 'dmg') {
        var p = center(f.x, f.y);
        c.fillStyle = f.color || '#ef4444';
        c.font = 'bold ' + Math.max(12, Math.round(16 * z)) + 'px monospace';
        c.fillText('-' + f.val, p.x, p.y - S_ - age * 24 * z);
      } else if (f.type === 'trace') {
        var a = center(f.x0, f.y0), b = center(f.x1, f.y1);
        c.strokeStyle = f.color || '#ffd23a';
        c.lineWidth = Math.max(1.5, 2.5 * z);
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      } else if (f.x !== undefined) {
        var q = center(f.x, f.y);
        c.fillStyle = f.color || '#ffd23a';
        c.beginPath();
        c.arc(q.x, q.y, (8 + age * 18) * z, 0, 7);
        c.fill();
      }
      c.globalAlpha = 1;
    });
  }

  function renderCombatHex(cv) {
    if (!cv || typeof C === 'undefined' || !C.active) return;
    var c = cv.getContext('2d'), W = cv.width, H = cv.height;
    var mode = typeof getGfxMode === 'function' ? getGfxMode() : 'pixel';
    var P = pal(), now = performance.now();
    var S_ = getS(), HW = getHW(), RH = getRH(), z = getZ();
    if (typeof updateFx === 'function') updateFx();

    c.fillStyle = mode === 'ascii' ? '#020402' : '#080d14';
    c.fillRect(0, 0, W, H);
    c.save();

    // Gate Emergence Camera Intro (Spiral-Zoom aus dem Stargate auf das zentrierte Spielfeld)
    var introAge = C.gateIntroStart ? (now - C.gateIntroStart) / 2100 : 1;
    if (introAge >= 0 && introAge < 1 && C.gatePos) {
      var ease = 1 - Math.pow(1 - introAge, 3);
      var gp = center(C.gatePos.x, C.gatePos.y);
      var gxScreen = gp.x - C.cameraX * HW, gyScreen = gp.y - C.cameraY * RH;
      var pivX = gxScreen * (1 - ease) + (W * 0.5) * ease;
      var pivY = gyScreen * (1 - ease) + (H * 0.5) * ease;
      var introScale = 1 + (1 - ease) * 1.35;
      var introRot = (1 - ease) * 0.95;
      c.translate(W * 0.5, H * 0.5);
      c.scale(introScale, introScale);
      c.rotate(introRot);
      c.translate(-pivX, -pivY);
    }

    if (C.shake > 0.3) c.translate((Math.random() - 0.5) * C.shake, (Math.random() - 0.5) * C.shake);
    c.translate(-C.cameraX * HW, -C.cameraY * RH);

    var x0 = Math.max(0, Math.floor(C.cameraX - 2)), y0 = Math.max(0, Math.floor(C.cameraY - 2));
    var x1 = Math.min(GW, Math.ceil(C.cameraX + W / HW + 3)), y1 = Math.min(GH, Math.ceil(C.cameraY + H / RH + 3));
    for (var y = y0; y < y1; y++) {
      for (var x = x0; x < x1; x++) {
        var cell = C.map[idx(x, y)];
        if (!cell) continue;
        var t = cell.t;
        if (mode === 'ascii') drawTileAscii(c, x, y, t);
        else if (mode === 'topdown') drawTileFlat(c, x, y, t, P);
        else drawTilePixel(c, x, y, t, P, now);
      }
    }

    // Bewegungs-, Deckungs- und Hover-Markierungen
    c.lineWidth = Math.max(1.5, 2 * z);
    (C.moveRange || []).forEach(function (m) {
      var p = center(m.x, m.y);
      hexPath(c, p.x, p.y - (mode === 'pixel' ? 2 * z : 0), S_ - 3 * z);
      c.fillStyle = 'rgba(56,189,248,0.24)';
      c.fill();
      c.strokeStyle = 'rgba(125,211,252,0.85)';
      c.stroke();
    });
    if (C.hover && inB(C.hover.x, C.hover.y)) {
      var hp = center(C.hover.x, C.hover.y);
      hexPath(c, hp.x, hp.y - (mode === 'pixel' ? 3 * z : 0), S_ - 1.5 * z);
      c.strokeStyle = '#fde047';
      c.lineWidth = Math.max(2, 2.5 * z);
      c.stroke();
    }

    // Stargate auf C.gatePos
    if (C.gatePos) {
      var g = center(C.gatePos.x, C.gatePos.y);
      drawHexStargate(c, g.x, g.y, mode, now);
    }

    // Taktische Beutekisten (C.loot)
    if (Array.isArray(C.loot)) {
      C.loot.forEach(function (l) {
        if (l.collected) return;
        var lp = center(l.x, l.y);
        drawHexPrism3D(c, lp.x, lp.y - 2 * z, S_ * 0.36, Math.round(5 * z), '#f59e0b', '#b45309', '#92400e', '#78350f', '#fef08a');
      });
    }

    drawUnits(c, mode, now);
    drawFx(c, now);
    c.restore();

    if (mode === 'ascii') {
      c.fillStyle = 'rgba(0,0,0,.18)';
      for (var sy = 0; sy < H; sy += 3) c.fillRect(0, sy, W, 1);
    }
    c.fillStyle = 'rgba(6, 12, 20, 0.85)';
    c.fillRect(8, 8, 290, 22);
    c.strokeStyle = '#4ade80';
    c.lineWidth = 1;
    c.strokeRect(8, 8, 290, 22);
    c.fillStyle = '#7CFC8a';
    c.font = 'bold 11px monospace';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText('⬡ 3D-HEX-TAKTIK · ZOOM ' + Math.round(z * 100) + '% · [H] UMSCHALTEN', 14, 19);

    if (typeof drawCombatMinimap === 'function') drawCombatMinimap();
  }

  function hexTileFromMouse(mx, my) {
    var S_ = getS(), HW = getHW(), RH = getRH();
    var wx = mx + C.cameraX * HW - HW / 2, wy = my + C.cameraY * RH - S_;
    var a = HEX.fromPixel(wx, wy, S_); // axial mit aktuellem Zoom-Radius S_
    return { x: a.q + ((a.r - (a.r & 1)) >> 1), y: a.r };
  }

  /* --- Einhängen (Wrapper) --- */
  var origRender = renderCombat, origPick = getCombatTileFromMouse;
  globalThis.renderCombat = function (cv) { return hexOn() ? renderCombatHex(cv) : origRender(cv); };
  globalThis.getCombatTileFromMouse = function (cv, mx, my) { return hexOn() ? hexTileFromMouse(mx, my) : origPick(cv, mx, my); };
  globalThis.toggleHexMode = function () {
    if (typeof S === 'undefined' || !S) return; S.hexMode = !hexOn(); if (typeof save === 'function') save();
    if (C.active && C.selected) { C.moveRange = moveRange(C.selected); C.atkRange = attackTargets(C.selected); }
    if (typeof toast === 'function') toast(S.hexMode ? '⬡ Hex-Taktik aktiv (6 Richtungen · Zoom aktiv)' : '▦ Quadrat-Raster (8 Richtungen)');
  };
  document.addEventListener('keydown', function (e) { if ((e.key === 'h' || e.key === 'H') && !e.target.closest('input,textarea,select,[contenteditable]')) toggleHexMode(); });
  globalThis.HEX_RENDER = { center: center, render: renderCombatHex, pick: hexTileFromMouse, getS: getS };
})();
