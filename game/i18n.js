/* =====================================================================
   SGC Command · i18n.js (v0.30)
   Zentrale Sprachverwaltung (Deutsch/English) für Portal & Spiel-UI.

   Design:
   - Flat Key-Tabelle pro Sprache:  I18N.tables.de / I18N.tables.en
   - Registrierung:  I18N.add('de', { 'key': '…', … })  (mehrfach aufrufbar)
   - Lookup:         I18N.T('key', [param0, param1])  → {0},{1}-Interpolation
                     Fallback-Kette: aktuelle Sprache → 'de' → Key selbst
   - DOM:            data-i18n       → textContent
                     data-i18n-html  → innerHTML (rich text, <b>/<code>)
                     data-i18n-title → title-Attribut (Tooltip)
   - Persistenz:     localStorage['sgc_lang'] (de|en), <html lang="…">
   - Dynamik:        I18N.onChange(fn) — Callback nach setLang()
                     (Re-Render von Kampfoverlays, Menüs, Story-Panel …)

   Test-Vertrag (test-browser.js):
   - Key-Parität: DE- und EN-Tabelle müssen exakt dieselben Keys tragen.
   - DOM-Abdeckung: keine deutschen Zeichenketten mehr hart im HTML
     (Scanner prüft äöüß + deutsche Marker-Wörter, ausgenommen sind
     unterbäume mit data-i18n*-Attributen, da dort der DE-Default liegt).
   ===================================================================== */
(function () {
  'use strict';

  var I18N = {
    lang: 'de',
    defaultLang: 'de',
    storageKey: 'sgc_lang',
    tables: { de: {}, en: {}, es: {}, zh: {}, ja: {}, ru: {}, fr: {}, pt: {}, ar: {} },
    _listeners: []
  };

  function validLang(l) {
    return typeof l === 'string' && Object.prototype.hasOwnProperty.call(I18N.tables, l);
  }

  function getStorage() {
    try { return (typeof localStorage !== 'undefined') ? localStorage : null; } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------
     Lookup: key → übersetzter Wert ({n}-Parameter-Ersetzung)
     ------------------------------------------------------------------ */
  I18N.T = function (key, params) {
    var t = I18N.tables[I18N.lang] || {};
    var v;
    if (Object.prototype.hasOwnProperty.call(t, key)) {
      v = t[key];
    } else if (I18N.lang !== 'en' && I18N.lang !== 'de' && Object.prototype.hasOwnProperty.call(I18N.tables.en, key)) {
      v = I18N.tables.en[key];
    } else if (I18N.lang !== 'de' && Object.prototype.hasOwnProperty.call(I18N.tables.de, key)) {
      v = I18N.tables.de[key]; // Fallback auf Deutsch
    } else {
      return String(key); // fehlend → Key als Diagnose-Anzeige
    }
    v = String(v);
    if (params && params.length) {
      for (var i = 0; i < params.length; i++) {
        v = v.split('{' + i + '}').join(String(params[i]));
      }
    }
    return v;
  };

  /* Schlüssel in `lang` registrieren (merge, mehrfach aufrufbar) */
  I18N.add = function (lang, table) {
    if (!validLang(lang) || !table) return;
    for (var k in table) {
      if (Object.prototype.hasOwnProperty.call(table, k)) I18N.tables[lang][k] = table[k];
    }
  };

  /* Keys, die in der Gegen-Tabelle existieren, aber in `lang` fehlen */
  I18N.missing = function (lang) {
    var target = I18N.tables[lang] || {};
    var other = (lang === 'de') ? I18N.tables.en : I18N.tables.de;
    var out = [];
    for (var k in other) {
      if (Object.prototype.hasOwnProperty.call(other, k) && !Object.prototype.hasOwnProperty.call(target, k)) out.push(k);
    }
    out.sort();
    return out;
  };

  /* ------------------------------------------------------------------
     Statische DOM-Anwendung (alle data-i18n*-Elemente unter root)
     ------------------------------------------------------------------ */
  I18N.applyStaticI18n = function (root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    var i, nodes, key;

    nodes = root.querySelectorAll('[data-i18n]');
    for (i = 0; i < nodes.length; i++) {
      key = nodes[i].getAttribute('data-i18n');
      if (key) nodes[i].textContent = I18N.T(key);
    }
    nodes = root.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < nodes.length; i++) {
      key = nodes[i].getAttribute('data-i18n-html');
      if (key) nodes[i].innerHTML = I18N.T(key);
    }
    nodes = root.querySelectorAll('[data-i18n-title]');
    for (i = 0; i < nodes.length; i++) {
      key = nodes[i].getAttribute('data-i18n-title');
      if (key) nodes[i].title = I18N.T(key);
    }
    nodes = root.querySelectorAll('[data-i18n-aria]');
    for (i = 0; i < nodes.length; i++) {
      key = nodes[i].getAttribute('data-i18n-aria');
      if (key) nodes[i].setAttribute('aria-label', I18N.T(key));
    }
  };

  /* ------------------------------------------------------------------
     Sprache wechseln (persistiert + DOM + dynamische Listener)
     ------------------------------------------------------------------ */
  I18N.setLang = function (lang) {
    if (!validLang(lang)) lang = I18N.defaultLang;
    I18N.lang = lang;
    var store = getStorage();
    if (store) {
      try { store.setItem(I18N.storageKey, lang); } catch (e) { /* headless */ }
    }
    var doc = (typeof document !== 'undefined') ? document : null;
    if (doc && doc.documentElement) doc.documentElement.lang = lang;
    I18N.applyStaticI18n(doc);
    for (var i = 0; i < I18N._listeners.length; i++) {
      try { I18N._listeners[i](lang); } catch (e) { /* Listener-Fehler dürfen die UI nicht brechen */ }
    }
    return I18N.lang;
  };

  /* Dynamische Re-Render-Callback registrieren (R2/R3: Menüs, Overlays) */
  I18N.onChange = function (fn) {
    if (typeof fn === 'function') I18N._listeners.push(fn);
  };

  /* Initiale Sprache aus localStorage laden (Default: de) */
  I18N.init = function () {
    var l = I18N.defaultLang;
    var store = getStorage();
    if (store) {
      try {
        var saved = store.getItem(I18N.storageKey);
        if (validLang(saved)) l = saved;
      } catch (e) { /* headless */ }
    }
    I18N.setLang(l);
    return I18N.lang;
  };

  /* Auto-Init: sobald DOM bereit (headless-VM ohne readyState: kein Auto-Start) */
  function autoInit() { I18N.init(); }
  try {
    var doc = typeof document !== 'undefined' ? document : null;
    if (doc) {
      if (doc.readyState && doc.readyState !== 'loading') autoInit();
      else if (doc.addEventListener) doc.addEventListener('DOMContentLoaded', autoInit);
    }
  } catch (e) { /* headless */ }

  /* Global exponieren (Browser: window === globalThis; Test-VM: Kontext-Global) */
  if (typeof globalThis !== 'undefined') globalThis.I18N = I18N;
  else global.I18N = I18N;
  if (typeof module !== 'undefined' && module.exports) module.exports = I18N;
})(function () {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  return this;
}());
