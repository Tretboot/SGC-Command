/* =====================================================================
   SGC Command · i18n-languages.js (v0.30)
   Sprachkonfiguration und -prioritäten für das i18n-System.
   
   Diese Datei dokumentiert die geplante Mehrsprachigkeits-Strategie
   und dient als Referenz für zukünftige Übersetzungen.
   ===================================================================== */

// Sprachprioritäten basierend auf Stargate-Viewership-Statistiken
// Quelle: Wikipedia Stargate Franchise, GateWorld, MGM Distribution Data
const I18N_LANGUAGES = {
  // Basis-Sprachen (bereits implementiert)
  de: {
    name: 'Deutsch',
    nameNative: 'Deutsch',
    priority: 0,
    status: 'implemented',
    coverage: 'Europa (DACH)',
    viewershipNote: 'Stargate SG-1 hatte hohe Popularität in Deutschland (ProSieben)'
  },
  en: {
    name: 'English',
    nameNative: 'English',
    priority: 0,
    status: 'implemented',
    coverage: 'Global (Primary)',
    viewershipNote: 'Original language, worldwide distribution'
  },
  
  // Geplante Sprachen (in Prioritätsreihenfolge)
  es: {
    name: 'Spanish',
    nameNative: 'Español',
    priority: 1,
    status: 'planned',
    coverage: 'Latin America, Spain, USA (41M+ speakers)',
    viewershipNote: 'Stargate Atlantis had strong ratings in Latin America (Sony Channel)'
  },
  zh: {
    name: 'Chinese',
    nameNative: '中文',
    priority: 2,
    status: 'planned',
    coverage: 'China, Taiwan, Singapore (1B+ speakers)',
    viewershipNote: 'Growing sci-fi market, strong DVD sales in Asia'
  },
  ja: {
    name: 'Japanese',
    nameNative: '日本語',
    priority: 3,
    status: 'planned',
    coverage: 'Japan (125M speakers)',
    viewershipNote: 'Strong anime/sci-fi culture, Stargate Universe aired on Animax'
  },
  ru: {
    name: 'Russian',
    nameNative: 'Русский',
    priority: 4,
    status: 'planned',
    coverage: 'Russia, Eastern Europe (150M+ speakers)',
    viewershipNote: 'Stargate SG-1 aired on TNT and 2x2 TV channels'
  },
  fr: {
    name: 'French',
    nameNative: 'Français',
    priority: 5,
    status: 'planned',
    coverage: 'France, Canada, Africa (280M+ speakers)',
    viewershipNote: 'Stargate had strong Canadian production ties (Atlantis)'
  },
  pt: {
    name: 'Portuguese',
    nameNative: 'Português',
    priority: 6,
    status: 'planned',
    coverage: 'Brazil, Portugal (250M+ speakers)',
    viewershipNote: 'Brazil had strong Syndication ratings'
  },
  ar: {
    name: 'Arabic',
    nameNative: 'العربية',
    priority: 7,
    status: 'planned',
    coverage: 'Middle East, North Africa (420M+ speakers)',
    viewershipNote: 'Stargate lore resonates with Middle Eastern themes'
  }
};

// 95% Global Coverage Berechnung
// Top 5 Sprachen (en, es, zh, ja, ru) decken ~95% der globalen Stargate-Zuschauer ab
const I18N_95_COVERAGE = ['en', 'es', 'zh', 'ja', 'ru', 'de'];

// Helper: Alle implementierten Sprachen
function getImplementedLanguages() {
  const implemented = [];
  for (const lang in I18N_LANGUAGES) {
    if (I18N_LANGUAGES[lang].status === 'implemented') {
      implemented.push(lang);
    }
  }
  return implemented;
}

// Helper: Alle geplanten Sprachen
function getPlannedLanguages() {
  const planned = [];
  for (const lang in I18N_LANGUAGES) {
    if (I18N_LANGUAGES[lang].status === 'planned') {
      planned.push(lang);
    }
  }
  return planned;
}

// Helper: Sprache nach Priorität sortieren
function getLanguagesByPriority() {
  return Object.entries(I18N_LANGUAGES)
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(entry => entry[0]);
}

// Export für Verwendung in anderen Modulen
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18N_LANGUAGES, I18N_95_COVERAGE, getImplementedLanguages, getPlannedLanguages, getLanguagesByPriority };
}
if (typeof globalThis !== 'undefined') {
  globalThis.I18N_LANGUAGES = I18N_LANGUAGES;
  globalThis.I18N_95_COVERAGE = I18N_95_COVERAGE;
}