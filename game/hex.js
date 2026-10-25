/* =====================================================================
   SGC Command · hex.js (v0.32) – Hex-Grid-Grundlagen (Roadmap Phase 6)
   Axiale Koordinaten (q, r); die dritte Würfelachse ist s = -q - r.
   Referenz: Red Blob Games, "Hexagonal Grids" (Amit Patel) – die
   Standardquelle für diese Formeln. "Pointy-top"-Ausrichtung.
   ===================================================================== */
(function () {
  'use strict';
  var DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]; // 6 Nachbarn
  var HEX = {
    key: function (q, r) { return q + ',' + r; },
    neighbors: function (q, r) { return DIRS.map(function (d) { return { q: q + d[0], r: r + d[1] }; }); },
    /* Abstand = halbe Summe der Würfel-Differenzen */
    distance: function (a, b) { return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2; },
    /* Runden auf das nächste Hex: größte Rundungsabweichung neu berechnen */
    round: function (q, r) {
      var s = -q - r, rq = Math.round(q), rr = Math.round(r), rs = Math.round(s);
      var dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
      if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
      return { q: rq, r: rr };
    },
    /* Sichtlinie: lineare Interpolation + Runden (für Deckung/Schuss) */
    line: function (a, b) {
      var n = HEX.distance(a, b), out = [];
      for (var i = 0; i <= n; i++) { var t = n ? i / n : 0; out.push(HEX.round(a.q + (b.q - a.q) * t + 1e-6, a.r + (b.r - a.r) * t + 1e-6)); }
      return out;
    },
    toPixel: function (q, r, size) { return { x: size * Math.sqrt(3) * (q + r / 2), y: size * 1.5 * r }; },
    fromPixel: function (x, y, size) { return HEX.round((Math.sqrt(3) / 3 * x - y / 3) / size, (2 / 3 * y) / size); },
    /* Erreichbare Felder mit Bewegungspunkten (Breitensuche, blocked(q,r) → bool) */
    reachable: function (start, moves, blocked) {
      var seen = {}, front = [start]; seen[HEX.key(start.q, start.r)] = 0;
      for (var k = 1; k <= moves; k++) {
        var next = [];
        front.forEach(function (h) { HEX.neighbors(h.q, h.r).forEach(function (n) {
          var key = HEX.key(n.q, n.r); if (key in seen || (blocked && blocked(n.q, n.r))) return; seen[key] = k; next.push(n); }); });
        front = next;
      }
      return seen;
    }
  };
  globalThis.HEX = HEX;
  if (typeof module !== 'undefined' && module.exports) module.exports = HEX;
})();
