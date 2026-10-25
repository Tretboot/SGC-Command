/* =====================================================================
   SGC Command · hex-render.js (v0.34) – Hex-Kampfdarstellung
   Ein Renderer, drei Stile – passend zum Grafikmodus:
     pixel   → Hex-"Prismen" mit Höhe (Mauern stehen hoch), Lichtkante,
               Bodentextur per deterministischem Rauschen (kein Flackern)
     ascii   → Glyphen im Hex-Raster, Phosphor-Farben (asciicker-Gefühl)
     topdown → flache, klare 2D-Hexes (Brettspiel-Look)
   Geometrie "pointy-top": Breite = √3·s, Reihenabstand = 1,5·s.
   Pixel-Mittelpunkt von (x,y): px = W·(x + ½·(y&1)), py = 1,5·s·y.
   Mausklick → Feld: Pixel → axial (HEX.fromPixel) → offset (x,y).
   ===================================================================== */
(function () {
  'use strict';
  var S_ = TILE * 0.58, HW = Math.sqrt(3) * S_, RH = 1.5 * S_; // Hex-Radius, -Breite, Reihenhöhe
  /* Paletten je Missions-Thema: [Boden, Boden2, leichte Deckung, schwere, Wand, Wasser/Spezial] */
  var PAL = {
    desert: ['#b89a64', '#a5864f', '#8a6d3b', '#6b5530', '#5a4630', '#c9a24a'],
    jungle: ['#3d6b3a', '#335c31', '#4f7a2e', '#2f4a22', '#24361c', '#2b6b7a'],
    hatak:  ['#3a3f4c', '#333845', '#6b5a2a', '#8a7330', '#1f232c', '#c9a227'],
    asgard: ['#9fb3b8', '#8ea4aa', '#6f8790', '#56707a', '#3b4d55', '#a8e0ff'],
    city:   ['#6d6d74', '#62626a', '#8b7b5b', '#4d4d55', '#35353d', '#4a6b8a']
  };
  function pal() { return PAL[C.theme] || PAL.desert; }
  function hash(x, y) { var h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function center(x, y) { return { x: HW * (x + 0.5 * (y & 1)) + HW / 2, y: RH * y + S_ }; }
  function hexPath(c, cx, cy, r) { c.beginPath(); for (var i = 0; i < 6; i++) { var a = Math.PI / 180 * (60 * i - 30); c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } c.closePath(); }
  function tileKind(t) { return t === 1 || t === 6 ? 'light' : t === 2 ? 'heavy' : (t === 3 || t === 4 || t === 5 || t === 8 || t === 13) ? 'wall' : (t === 9 || t === 10) ? 'special' : 'floor'; }
  var GLYPH = { floor: '.', light: '▒', heavy: '▓', wall: '█', special: '◊' };

  function drawTilePixel(c, x, y, t, P) {
    var p = center(x, y), k = tileKind(t), h = k === 'wall' ? 18 : k === 'heavy' ? 10 : k === 'light' ? 5 : 0, n = hash(x, y);
    var top = k === 'wall' ? P[4] : k === 'heavy' ? P[3] : k === 'light' ? P[2] : k === 'special' ? P[5] : (n > 0.5 ? P[0] : P[1]);
    if (h) { // Seitenwand: gleiche Form, nach unten versetzt und dunkler → Höhe
      c.fillStyle = 'rgba(0,0,0,.45)'; hexPath(c, p.x, p.y, S_ - 1); c.fill();
      c.save(); c.translate(0, -h); }
    hexPath(c, p.x, p.y, S_ - 1); c.fillStyle = top; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 1; c.stroke();
    // Bodendetails: Steinchen/Grasbüschel, deterministisch aus dem Hash
    if (k === 'floor') { c.fillStyle = 'rgba(0,0,0,.12)'; for (var i = 0; i < 3; i++) { var a = hash(x + i * 7, y) * 6.28, d = hash(x, y + i * 5) * S_ * 0.6; c.fillRect(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 2, 2); } }
    if (k === 'wall' || k === 'heavy') { c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(p.x - S_ * 0.5, p.y - S_ * 0.55, S_, 2); } // Lichtkante
    if (k === 'special') { c.globalAlpha = 0.5 + 0.3 * Math.sin(performance.now() / 400 + x); c.fillStyle = '#fff'; hexPath(c, p.x, p.y, S_ * 0.35); c.fill(); c.globalAlpha = 1; }
    if (h) c.restore();
  }
  function drawTileAscii(c, x, y, t) {
    var p = center(x, y), k = tileKind(t);
    hexPath(c, p.x, p.y, S_ - 1); c.fillStyle = '#030803'; c.fill(); c.strokeStyle = 'rgba(124,252,138,.10)'; c.stroke();
    c.fillStyle = k === 'floor' ? 'rgba(124,252,138,' + (0.25 + hash(x, y) * 0.25) + ')' : k === 'special' ? '#ffb000' : '#7CFC8a';
    c.font = 'bold ' + Math.round(S_ * 0.9) + 'px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(GLYPH[k], p.x, p.y);
  }
  function drawTileFlat(c, x, y, t, P) {
    var p = center(x, y), k = tileKind(t);
    hexPath(c, p.x, p.y, S_ - 1.5);
    c.fillStyle = k === 'wall' ? P[4] : k === 'heavy' ? P[3] : k === 'light' ? P[2] : k === 'special' ? P[5] : P[0]; c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5; c.stroke();
    if (k === 'light' || k === 'heavy') { c.fillStyle = 'rgba(0,0,0,.35)'; c.font = Math.round(S_ * 0.7) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(k === 'heavy' ? '⛊' : '◖', p.x, p.y); }
  }
  function drawSoldier(c, cx, cy, col, ascii) { // kleiner Pixel-Soldat (Kopf, Körper, Waffe)
    if (ascii) { c.fillStyle = col; c.font = 'bold ' + Math.round(S_) + 'px monospace'; c.fillText('@', cx, cy); return; }
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(cx, cy + 12, 10, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#3f5a3a'; c.fillRect(cx - 6, cy - 6, 12, 14);     // Uniform
    c.fillStyle = '#e0b48a'; c.fillRect(cx - 4, cy - 14, 8, 8);      // Kopf
    c.fillStyle = col; c.fillRect(cx - 6, cy - 6, 12, 3);            // Teamfarbe
    c.fillStyle = '#222'; c.fillRect(cx + 4, cy - 2, 9, 3);          // P90
  }
  function drawUnits(c, mode) {
    var ascii = mode === 'ascii';
    Object.values(C.units).forEach(function (u) {
      if (u.dead) return; var p = center(u.x, u.y);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      if (u.side === 'player') {
        if (C.selected === u) { c.strokeStyle = '#4fc3f7'; c.lineWidth = 2; hexPath(c, p.x, p.y, S_ - 3); c.stroke(); }
        drawSoldier(c, p.x, p.y, u.downed ? '#666' : '#4fc3f7', ascii);
      } else if (u.side === 'neutral') {
        if (ascii) { c.fillStyle = '#ffe493'; c.font = 'bold ' + Math.round(S_) + 'px monospace'; c.fillText('☺', p.x, p.y); }
        else if (typeof drawCivilian === 'function') drawCivilian(c, p.x, p.y);
      } else {
        if (ascii) { c.fillStyle = '#ff5555'; c.font = 'bold ' + Math.round(S_) + 'px monospace'; c.fillText(u.type && u.type.indexOf('jaffa') === 0 ? 'J' : 'E', p.x, p.y); }
        else if (typeof drawEnemyBody === 'function') drawEnemyBody(c, p.x, p.y, 0.7, u.type, u.downed ? 0.4 : 1);
        if (C.atkRange.indexOf(u) >= 0) { c.strokeStyle = '#ef4444'; c.lineWidth = 2; hexPath(c, p.x, p.y, S_ - 3); c.stroke(); }
      }
      // HP-Balken
      var w = HW * 0.7; c.fillStyle = '#111'; c.fillRect(p.x - w / 2, p.y - S_ + 2, w, 3);
      c.fillStyle = u.side === 'player' ? '#4ade80' : '#ef4444'; c.fillRect(p.x - w / 2, p.y - S_ + 2, w * Math.max(0, u.hp) / Math.max(1, u.maxHp), 3);
      if (typeof drawUnitLabel === 'function' && !ascii) drawUnitLabel(c, u.name, p.x, p.y + S_ - 2, u.side === 'player' ? '#93c5fd' : '#f87171');
    });
  }
  function drawFx(c) {
    var now = performance.now();
    C.fx.forEach(function (f) {
      var age = (now - f.t0) / 700; if (age > 1) return; c.globalAlpha = 1 - age;
      if (f.type === 'dmg') { var p = center(f.x, f.y); c.fillStyle = f.color; c.font = 'bold 16px monospace'; c.fillText('-' + f.val, p.x, p.y - S_ - age * 24); }
      else if (f.type === 'trace') { var a = center(f.x0, f.y0), b = center(f.x1, f.y1); c.strokeStyle = '#ffd23a'; c.lineWidth = 2; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
      else if (f.x !== undefined) { var q = center(f.x, f.y); c.fillStyle = f.color || '#ffd23a'; c.beginPath(); c.arc(q.x, q.y, 8 + age * 18, 0, 7); c.fill(); }
      c.globalAlpha = 1;
    });
  }
  function renderCombatHex(cv) {
    var c = cv.getContext('2d'), W = cv.width, H = cv.height, mode = typeof getGfxMode === 'function' ? getGfxMode() : 'pixel', P = pal();
    if (typeof updateFx === 'function') updateFx();
    c.fillStyle = mode === 'ascii' ? '#020402' : '#0a0e14'; c.fillRect(0, 0, W, H);
    c.save();
    if (C.shake > 0.3) c.translate((Math.random() - 0.5) * C.shake, (Math.random() - 0.5) * C.shake);
    c.translate(-C.cameraX * HW, -C.cameraY * RH);
    var x0 = Math.max(0, C.cameraX - 1), y0 = Math.max(0, C.cameraY - 1), x1 = Math.min(GW, C.cameraX + Math.ceil(W / HW) + 2), y1 = Math.min(GH, C.cameraY + Math.ceil(H / RH) + 2);
    for (var y = y0; y < y1; y++) for (var x = x0; x < x1; x++) {
      var t = C.map[idx(x, y)].t;
      if (mode === 'ascii') drawTileAscii(c, x, y, t); else if (mode === 'topdown') drawTileFlat(c, x, y, t, P); else drawTilePixel(c, x, y, t, P);
    }
    // Bewegungs- und Hover-Markierungen
    c.lineWidth = 2;
    C.moveRange.forEach(function (m) { var p = center(m.x, m.y); hexPath(c, p.x, p.y, S_ - 4); c.fillStyle = 'rgba(79,195,247,.22)'; c.fill(); c.strokeStyle = 'rgba(79,195,247,.7)'; c.stroke(); });
    if (C.hover && inB(C.hover.x, C.hover.y)) { var hp = center(C.hover.x, C.hover.y); hexPath(c, hp.x, hp.y, S_ - 2); c.strokeStyle = '#fff'; c.stroke(); }
    if (C.gatePos) { var g = center(C.gatePos.x, C.gatePos.y); c.strokeStyle = '#38bdf8'; c.lineWidth = 3; c.beginPath(); c.arc(g.x, g.y, S_ * 0.8, 0, 7); c.stroke(); }
    drawUnits(c, mode); drawFx(c);
    c.restore();
    if (mode === 'ascii') { c.fillStyle = 'rgba(0,0,0,.18)'; for (var sy = 0; sy < H; sy += 3) c.fillRect(0, sy, W, 1); } // Scanlines
    c.fillStyle = '#7CFC8a'; c.font = '11px monospace'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('⬡ HEX-TAKTIK · H = umschalten', 8, 8);
  }
  function hexTileFromMouse(mx, my) {
    var wx = mx + C.cameraX * HW - HW / 2, wy = my + C.cameraY * RH - S_;
    var a = HEX.fromPixel(wx, wy, S_); // axial
    return { x: a.q + ((a.r - (a.r & 1)) >> 1), y: a.r };
  }
  /* --- Einhängen (Wrapper) --- */
  var origRender = renderCombat, origPick = getCombatTileFromMouse;
  globalThis.renderCombat = function (cv) { return hexOn() ? renderCombatHex(cv) : origRender(cv); };
  globalThis.getCombatTileFromMouse = function (cv, mx, my) { return hexOn() ? hexTileFromMouse(mx, my) : origPick(cv, mx, my); };
  globalThis.toggleHexMode = function () {
    if (typeof S === 'undefined' || !S) return; S.hexMode = !hexOn(); if (typeof save === 'function') save();
    if (C.active && C.selected) { C.moveRange = moveRange(C.selected); C.atkRange = attackTargets(C.selected); }
    if (typeof toast === 'function') toast(S.hexMode ? '⬡ Hex-Taktik aktiv (6 Richtungen)' : '▦ Quadrat-Raster (8 Richtungen)');
  };
  document.addEventListener('keydown', function (e) { if ((e.key === 'h' || e.key === 'H') && !e.target.closest('input,textarea,select,[contenteditable]')) toggleHexMode(); });
  globalThis.HEX_RENDER = { center: center, render: renderCombatHex, pick: hexTileFromMouse };
})();
