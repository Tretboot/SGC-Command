/* =====================================================================
   SGC Command · i18n-languages.js (0.37 "Chevron 8: Die dritte Dimension")
   Vollständige Mehrsprachigkeits-Engine & Sprachpakete (9 Weltsprachen):
   DE, EN, ES (Español), ZH (中文), JA (日本語), RU (Русский),
   FR (Français), PT (Português), AR (العربية).
   ===================================================================== */

const I18N_LANGUAGES = {
  de: {
    name: 'Deutsch',
    nameNative: 'Deutsch',
    flag: '🇩🇪',
    priority: 0,
    status: 'implemented',
    coverage: 'Europa (DACH)',
    viewershipNote: 'Stargate SG-1 hatte hohe Popularität in Deutschland (ProSieben / RTL II)'
  },
  en: {
    name: 'English',
    nameNative: 'English',
    flag: '🇬🇧',
    priority: 0,
    status: 'implemented',
    coverage: 'Global (Primary)',
    viewershipNote: 'Original language, worldwide distribution'
  },
  es: {
    name: 'Spanish',
    nameNative: 'Español',
    flag: '🇪🇸',
    priority: 1,
    status: 'implemented',
    coverage: 'Latin America, Spain, USA (41M+ speakers)',
    viewershipNote: 'Stargate SG-1 & Atlantis had strong ratings in Spain and Latin America'
  },
  zh: {
    name: 'Chinese',
    nameNative: '中文',
    flag: '🇨🇳',
    priority: 2,
    status: 'implemented',
    coverage: 'China, Taiwan, Singapore (1B+ speakers)',
    viewershipNote: 'Growing sci-fi market, strong Stargate community in Asia'
  },
  ja: {
    name: 'Japanese',
    nameNative: '日本語',
    flag: '🇯🇵',
    priority: 3,
    status: 'implemented',
    coverage: 'Japan (125M speakers)',
    viewershipNote: 'Strong sci-fi culture, Stargate aired on AXN / Animax'
  },
  ru: {
    name: 'Russian',
    nameNative: 'Русский',
    flag: '🇷🇺',
    priority: 4,
    status: 'implemented',
    coverage: 'Eastern Europe & CIS (150M+ speakers)',
    viewershipNote: 'Stargate SG-1 aired on TV-3, TNT and 2x2'
  },
  fr: {
    name: 'French',
    nameNative: 'Français',
    flag: '🇫🇷',
    priority: 5,
    status: 'implemented',
    coverage: 'France, Canada, Africa (280M+ speakers)',
    viewershipNote: 'Huge popularity on M6 (France) and strong Canadian production ties'
  },
  pt: {
    name: 'Portuguese',
    nameNative: 'Português',
    flag: '🇵🇹',
    priority: 6,
    status: 'implemented',
    coverage: 'Brazil, Portugal (250M+ speakers)',
    viewershipNote: 'Strong syndication ratings in Brazil and Portugal'
  },
  ar: {
    name: 'Arabic',
    nameNative: 'العربية',
    flag: '🇸🇦',
    priority: 7,
    status: 'implemented',
    coverage: 'Middle East, North Africa (420M+ speakers)',
    viewershipNote: 'Abydos & Egyptian mythology lore resonates deeply across MENA'
  }
};

const I18N_95_COVERAGE = ['en', 'es', 'zh', 'ja', 'ru', 'de', 'fr', 'pt', 'ar'];

function getImplementedLanguages() {
  return Object.keys(I18N_LANGUAGES).filter(lang => I18N_LANGUAGES[lang].status === 'implemented');
}

function getPlannedLanguages() {
  return Object.keys(I18N_LANGUAGES).filter(lang => I18N_LANGUAGES[lang].status === 'planned');
}

function getLanguagesByPriority() {
  return Object.entries(I18N_LANGUAGES)
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(entry => entry[0]);
}

// Registriere die internationalen Sprachpakete (ES, FR, ZH, JA, RU, PT, AR)
if (typeof I18N !== 'undefined' && typeof I18N.add === 'function') {
  // 1. ESPAÑOL (es)
  I18N.add('es', {
    'portal.title': 'SGC Command – Comando Stargate 0.37 ("Chevron 8: La Tercera Dimensión")',
    'portal.brand.sub': 'Comando Stargate · 0.37 · "Chevron 8: La Tercera Dimensión"',
    'portal.nav.game': 'Juego',
    'portal.nav.wiki': 'Base de Datos y Lore',
    'portal.nav.about': 'Acerca de y Laboratorio',
    'portal.lang.btn': 'ES',
    'portal.lang.title': 'Cambiar idioma (Español)',
    'portal.game.title': '🎮 SGC Command 0.37 Instancia en Vivo',
    'portal.game.sub': 'Motor Cuádruple: Voxel Isométrico ⇄ ASCII-3D ⇄ 3D-WebGL ⇄ 2D (Tecla [V]) · SGC-AMP v2.80',
    'portal.game.openTab': '↗ Abrir en nueva pestaña',
    'portal.game.fullscreen': '⛶ Pantalla completa',
    'portal.game.status': '<b>Estado:</b> Operativo · SGC-AMP v2.80 · Remixes C&C Hell March, Lo-Fi y Foothold activos · Strudel Core en línea',
    'portal.game.controls': 'Controles: <b>WASD/Flechas</b> = Cámara · <b>Q/E</b> = Rotar 90° · <b>V</b> = Modo Gráfico (3D/ASCII/Pixel) · <b>TAB</b> = Siguiente · <b>ESC</b> = Menú',
    'portal.wiki.h2': '📚 Base de Datos y Manual del SGC',
    'portal.wiki.intro': 'Bienvenido a los archivos del Complejo Cheyenne Mountain (Nivel 28). Acceso autorizado para personal de Nivel 4+.',
    'portal.wiki.planets.h3': '🪐 Sistemas Planetarios',
    'portal.wiki.gear.h3': '🛡 Equipo Táctico',
    'portal.wiki.gear.1': '<b>Fusil de asalto FN P90:</b> Alta cadencia de fuego, alcance 5.',
    'portal.wiki.colony.h3': '🏗 Gestión de Colonias',
    'portal.footer.1': '◎ COMANDO STARGATE · SGC COMMAND 0.37 · "Chevron 8: La Tercera Dimensión"',
    'game.clipboard.title': 'Portapapeles y Oficina de Hammond (Personal)',
    'game.research.header_title': 'Laboratorio e Investigación SGC (Nivel 19)',
    'game.save.title': 'Partidas Guardadas e Importar/Exportar',
    'game.gfx.title': 'Cambiar modo gráfico: Pixel-Voxel / ASCII-3D / 3D-WebGL / 2D (Tecla V)',
    'game.strudel.title': 'Motor de Sonido Strudel y Live-Coding',
    'game.help.title': 'Manual de Instrucciones',
    'game.sound.title': 'Sonido activado/desactivado',
    'game.go': '▶ Terminar Día',
    'game.lang.btn': 'ES',
    'game.lang.title': 'Cambiar idioma (Español)',
    'game.nav.base': '🏗 Base',
    'game.nav.map': '🗺 Mapa Estelar',
    'game.nav.colonies': '🪐 Colonias',
    'game.nav.medbay': '🏥 Enfermería',
    'game.nav.roster': '👥 Equipo y Arsenal',
    'game.nav.log': '📜 Registro',
    'game.gate.skip': 'Saltar <span>ESC / Clic</span>',
    'game.boot.sublevel': 'COMPLEJO CHEYENNE MOUNTAIN · SUBNIVEL 28',
    'game.boot.status': 'ESTADO DE LA SALA DEL PORTAL: ENERGÍA LISTA<br>SUBSISTEMA DE AUDIO Y SINTETIZADOR WEBAUDIO INICIALIZADOS',
    'game.boot.btn': '▶ CLIC / PULSAR TECLA PARA MARCAR EL PORTAL',
    'game.intro.audio': '🔊 Activar Sonido',
    'game.intro.skip': 'Saltar <span>ESC</span>',
    'game.combat.aria.map': 'Mapa táctico de misión',
    'game.combat.aria.minimap': 'Minimapa: clic para mover la vista',
    'game.combat.continue': 'Continuar',
    'game.menu.sub': 'PAUSA Y CONFIGURACIÓN DEL SISTEMA',
    'game.menu.resume': '▶ Reanudar',
    'game.menu.gfx': '🖥 Motor Gráfico',
    'game.menu.gfx.pixel': 'Voxel Isométrico (Pixel-Art)',
    'game.menu.gfx.topdown': 'Clásico 2D Vista Superior',
    'game.menu.diff': '⚔ Dificultad',
    'game.menu.diff.easy': 'Fácil',
    'game.menu.diff.normal': 'Normal',
    'game.menu.diff.hard': 'Difícil',
    'game.menu.strudel': '🎵 Motor de Sonido Strudel y Live-Code',
    'game.menu.midi': '🎛 Controlador MIDI (Configuración Akai)',
    'game.menu.keybinds': '⌨ Teclado y Controles',
    'game.menu.clipboard': '📋 Portapapeles de Hammond (Personal)',
    'game.menu.saves': '💾 Partidas Guardadas e Importar/Exportar',
    'game.menu.help': '📖 Manual',
    'game.menu.replay': '🎬 Ver Intro de Nuevo',
    'game.menu.sound': '🔊 Sonido sí/no',
    'game.menu.newgame': '⟲ Nueva Partida',
    'game.menu.reset': '⏏ Reiniciar (sin preguntar)',
    'game.menu.foot': 'ESC = Menú · V = Modo 3D/ASCII/Pixel · Q/E = Cámara · TAB = Siguiente',
    'game.dyn.combat.res_victory': '✔ VICTORIA',
    'game.dyn.combat.res_defeat': '✘ DERROTA',
    'game.dyn.combat.res_extract': '🌀 EXTRAÍDO',
    'game.dyn.combat.cover_heavy': 'Cobertura Pesada',
    'game.dyn.combat.cover_light': 'Cobertura Ligera',
    'game.dyn.combat.cover_rubble': 'Escombros'
  });

  // 2. FRANÇAIS (fr)
  I18N.add('fr', {
    'portal.title': 'SGC Command – Stargate Command 0.37 ("Chevron 8 : La Troisième Dimension")',
    'portal.brand.sub': 'Stargate Command · 0.37 · "Chevron 8 : La Troisième Dimension"',
    'portal.nav.game': 'Jeu',
    'portal.nav.wiki': 'Base de Données & Lore',
    'portal.nav.about': 'À propos & Labo',
    'portal.lang.btn': 'FR',
    'portal.lang.title': 'Changer de langue (Français)',
    'portal.game.title': '🎮 SGC Command 0.37 Instance Active',
    'portal.game.sub': 'Moteur Quadruple : Voxel Isométrique ⇄ ASCII-3D ⇄ 3D-WebGL ⇄ 2D (Touche [V]) · SGC-AMP v2.80',
    'portal.game.openTab': '↗ Ouvrir dans un nouvel onglet',
    'portal.game.fullscreen': '⛶ Plein écran',
    'portal.game.status': '<b>Statut :</b> Opérationnel · SGC-AMP v2.80 · Remixes C&C Hell March, Lo-Fi & Foothold actifs · Strudel Core En Ligne',
    'portal.game.controls': 'Contrôles : <b>WASD/Flèches</b> = Caméra · <b>Q/E</b> = Rotation 90° · <b>V</b> = Mode 3D/ASCII/Pixel · <b>TAB</b> = Suivant · <b>ESC</b> = Menu',
    'portal.wiki.h2': '📚 Base de Données & Manuel du SGC',
    'portal.wiki.intro': 'Bienvenue dans les archives du Complexe de Cheyenne Mountain (Niveau 28). Accès autorisé au personnel de niveau 4+.',
    'portal.wiki.planets.h3': '🪐 Systèmes Planétaires',
    'portal.wiki.gear.h3': '🛡 Équipement Tactique',
    'portal.wiki.gear.1': '<b>Fusil d’assaut FN P90 :</b> Cadence élevée, portée 5.',
    'portal.wiki.colony.h3': '🏗 Gestion des Colonies',
    'portal.footer.1': '◎ STARGATE COMMAND · SGC COMMAND 0.37 · "Chevron 8 : La Troisième Dimension"',
    'game.clipboard.title': 'Presse-papiers & Bureau de Hammond (Personnel)',
    'game.research.header_title': 'Laboratoire & Recherche SGC (Niveau 19)',
    'game.save.title': 'Sauvegardes & Import/Export',
    'game.gfx.title': 'Changer le mode graphique : Pixel-Voxel / ASCII-3D / 3D-WebGL / 2D (Touche V)',
    'game.strudel.title': 'Moteur Sonore Strudel & Live-Coding',
    'game.help.title': 'Manuel',
    'game.sound.title': 'Son activé/désactivé',
    'game.go': '▶ Finir le Jour',
    'game.lang.btn': 'FR',
    'game.lang.title': 'Changer de langue (Français)',
    'game.nav.base': '🏗 Base',
    'game.nav.map': '🗺 Carte Stellaire',
    'game.nav.colonies': '🪐 Colonies',
    'game.nav.medbay': '🏥 Infirmerie',
    'game.nav.roster': '👥 Équipe & Arsenal',
    'game.nav.log': '📜 Journal',
    'game.gate.skip': 'Passer <span>ESC / Clic</span>',
    'game.boot.sublevel': 'COMPLEXE DE CHEYENNE MOUNTAIN · SOUS-NIVEAU 28',
    'game.boot.status': 'STATUT SALLE DE LA PORTE : ÉNERGIE PRÊTE<br>SOUS-SYSTÈME AUDIO & SYNTHÉTISEUR WEBAUDIO INITIALISÉS',
    'game.boot.btn': '▶ CLIQUER / APPUYER SUR UNE TOUCHE POUR COMPOSER',
    'game.intro.audio': '🔊 Activer le Son',
    'game.intro.skip': 'Passer <span>ESC</span>',
    'game.combat.aria.map': 'Carte tactique de mission',
    'game.combat.aria.minimap': 'Minicarte : cliquer pour déplacer la vue',
    'game.combat.continue': 'Continuer',
    'game.menu.sub': 'PAUSE & CONFIGURATION DU SYSTÈME',
    'game.menu.resume': '▶ Reprendre',
    'game.menu.gfx': '🖥 Moteur Graphique',
    'game.menu.gfx.pixel': 'Voxel Isométrique (Pixel-Art)',
    'game.menu.gfx.topdown': 'Classique 2D Vue de Dessus',
    'game.menu.diff': '⚔ Difficulté',
    'game.menu.diff.easy': 'Facile',
    'game.menu.diff.normal': 'Normal',
    'game.menu.diff.hard': 'Difficile',
    'game.menu.strudel': '🎵 Moteur Sonore Strudel & Live-Code',
    'game.menu.midi': '🎛 Contrôleur MIDI (Configuration Akai)',
    'game.menu.keybinds': '⌨ Clavier & Raccourcis',
    'game.menu.clipboard': '📋 Presse-papiers de Hammond (Personnel)',
    'game.menu.saves': '💾 Sauvegardes & Import/Export',
    'game.menu.help': '📖 Manuel',
    'game.menu.replay': '🎬 Revoir l’Intro',
    'game.menu.sound': '🔊 Son oui/non',
    'game.menu.newgame': '⟲ Nouvelle Partie',
    'game.menu.reset': '⏏ Réinitialiser (immédiat)',
    'game.menu.foot': 'ESC = Menu · V = Mode 3D/ASCII/Pixel · Q/E = Caméra · TAB = Membre suivant',
    'game.dyn.combat.res_victory': '✔ VICTOIRE',
    'game.dyn.combat.res_defeat': '✘ DÉFAITE',
    'game.dyn.combat.res_extract': '🌀 EXTRAIT'
  });

  // 3. 中文 (zh)
  I18N.add('zh', {
    'portal.title': 'SGC Command – 星际之门指挥部 0.37 ("第八锁：第三维度")',
    'portal.brand.sub': '星际之门指挥部 · 0.37 · "第八锁：第三维度"',
    'portal.nav.game': '游戏',
    'portal.nav.wiki': '数据库与设定',
    'portal.nav.about': '关于与实验室',
    'portal.lang.btn': 'ZH',
    'portal.lang.title': '切换语言 (中文)',
    'portal.game.title': '🎮 SGC Command 0.37 实时终端',
    'portal.game.sub': '四重引擎：等距体素 ⇄ ASCII-3D ⇄ 3D-WebGL ⇄ 2D (按键 [V]) · SGC-AMP v2.80',
    'portal.game.openTab': '↗ 在新标签页打开',
    'portal.game.fullscreen': '⛶ 全屏模式',
    'portal.wiki.h2': '📚 SGC 数据库与战术手册',
    'portal.wiki.planets.h3': '🪐 行星系统',
    'portal.wiki.gear.h3': '🛡 战术装备',
    'portal.wiki.gear.1': '<b>FN P90 冲锋枪：</b> 高射速，射程 5。',
    'portal.wiki.colony.h3': '🏗 殖民地管理',
    'portal.footer.1': '◎ STARGATE COMMAND · SGC COMMAND 0.37 · "第八锁：第三维度"',
    'game.go': '▶ 结束当天',
    'game.lang.btn': 'ZH',
    'game.lang.title': '切换语言 (中文)',
    'game.nav.base': '🏗 基地',
    'game.nav.map': '🗺 星图',
    'game.nav.colonies': '🪐 殖民地',
    'game.nav.medbay': '🏥 医疗室',
    'game.nav.roster': '👥 队员与军械库',
    'game.nav.log': '📜 行动日志',
    'game.gate.skip': '跳过 <span>ESC / 点击</span>',
    'game.boot.sublevel': '夏延山综合体 · 地下第 28 层',
    'game.boot.status': '星门室状态：能量就绪<br>音频子系统与 WEBAUDIO 合成器已初始化',
    'game.boot.btn': '▶ 点击 / 按任意键拨号启动星门',
    'game.intro.audio': '🔊 启用音频',
    'game.intro.skip': '跳过 <span>ESC</span>',
    'game.combat.continue': '继续',
    'game.menu.sub': '暂停与系统配置',
    'game.menu.resume': '▶ 继续游戏',
    'game.menu.gfx': '🖥 图形引擎',
    'game.menu.diff': '⚔ 难度',
    'game.menu.diff.easy': '简单',
    'game.menu.diff.normal': '普通',
    'game.menu.diff.hard': '困难',
    'game.menu.saves': '💾 存档与导入/导出',
    'game.menu.help': '📖 游戏指南',
    'game.menu.newgame': '⟲ 新游戏',
    'game.dyn.combat.res_victory': '✔ 胜利',
    'game.dyn.combat.res_defeat': '✘ 失败',
    'game.dyn.combat.res_extract': '🌀 已撤离'
  });

  // 4. 日本語 (ja)
  I18N.add('ja', {
    'portal.title': 'SGC Command – スターゲイト・コマンド 0.37 ("シェブロン8：第3の次元")',
    'portal.brand.sub': 'スターゲイト・コマンド · 0.37 · "シェブロン8：第3の次元"',
    'portal.nav.game': 'ゲーム',
    'portal.nav.wiki': 'データベース＆ロア',
    'portal.nav.about': '概要＆ラボ',
    'portal.lang.btn': 'JA',
    'portal.lang.title': '言語を切り替え (日本語)',
    'portal.game.title': '🎮 SGC Command 0.37 ライブインスタンス',
    'portal.game.sub': '4重エンジン：ボクセル ⇄ ASCII-3D ⇄ 3D-WebGL ⇄ 2D ([V]キー) · SGC-AMP v2.80',
    'portal.game.openTab': '↗ 新しいタブで開く',
    'portal.game.fullscreen': '⛶ フルスクリーン',
    'portal.wiki.h2': '📚 SGC データベース＆マニュアル',
    'portal.wiki.planets.h3': '🪐 惑星システム',
    'portal.wiki.gear.h3': '🛡 戦術装備',
    'portal.wiki.gear.1': '<b>FN P90 アサルトライフル：</b> 高連射速度、射程 5。',
    'portal.wiki.colony.h3': '🏗 コロニー管理',
    'portal.footer.1': '◎ STARGATE COMMAND · SGC COMMAND 0.37 · "シェブロン8：第3の次元"',
    'game.go': '▶ 1日を終える',
    'game.lang.btn': 'JA',
    'game.lang.title': '言語を切り替え (日本語)',
    'game.nav.base': '🏗 基地',
    'game.nav.map': '🗺 星図',
    'game.nav.colonies': '🪐 コロニー',
    'game.nav.medbay': '🏥 医療室',
    'game.nav.roster': '👥 部隊＆武器庫',
    'game.nav.log': '📜 ログ',
    'game.gate.skip': 'スキップ <span>ESC / クリック</span>',
    'game.boot.sublevel': 'シャイアン・マウンテン複合施設 · 地下28階',
    'game.boot.status': 'ゲートルーム状態：エネルギー準備完了<br>オーディオ＆WEBAUDIOシンセサイザー初期化完了',
    'game.boot.btn': '▶ クリック／キーを押してダイヤル開始',
    'game.intro.audio': '🔊 音声を有効化',
    'game.intro.skip': 'スキップ <span>ESC</span>',
    'game.combat.continue': '次へ',
    'game.menu.sub': '一時停止＆システム設定',
    'game.menu.resume': '▶ ゲーム再開',
    'game.menu.gfx': '🖥 グラフィックエンジン',
    'game.menu.diff': '⚔ 難易度',
    'game.menu.diff.easy': 'イージー',
    'game.menu.diff.normal': 'ノーマル',
    'game.menu.diff.hard': 'ハード',
    'game.menu.saves': '💾 セーブデータ＆インポート/エクスポート',
    'game.menu.help': '📖 マニュアル',
    'game.menu.newgame': '⟲ ニューゲーム',
    'game.dyn.combat.res_victory': '✔ 勝利',
    'game.dyn.combat.res_defeat': '✘ 敗北',
    'game.dyn.combat.res_extract': '🌀 帰還完了'
  });

  // 5. РУССКИЙ (ru)
  I18N.add('ru', {
    'portal.title': 'SGC Command – Командование Звёздных Врат 0.37 ("Шеврон 8: Третье Измерение")',
    'portal.brand.sub': 'Stargate Command · 0.37 · "Шеврон 8: Третье Измерение"',
    'portal.nav.game': 'Игра',
    'portal.nav.wiki': 'База данных и Лор',
    'portal.nav.about': 'О проекте и Лаборатория',
    'portal.lang.btn': 'RU',
    'portal.lang.title': 'Сменить язык (Русский)',
    'portal.game.title': '🎮 SGC Command 0.37 Игровой Терминал',
    'portal.game.openTab': '↗ Открыть в новой вкладке',
    'portal.game.fullscreen': '⛶ Полный экран',
    'portal.wiki.h2': '📚 База данных и руководство SGC',
    'portal.wiki.planets.h3': '🪐 Планетарные системы',
    'portal.wiki.gear.h3': '🛡 Тактическое снаряжение',
    'portal.wiki.gear.1': '<b>Штурмовая винтовка FN P90:</b> Высокая скорострельность, дальность 5.',
    'portal.wiki.colony.h3': '🏗 Управление колониями',
    'portal.footer.1': '◎ STARGATE COMMAND · SGC COMMAND 0.37 · "Шеврон 8: Третье Измерение"',
    'game.go': '▶ Завершить день',
    'game.lang.btn': 'RU',
    'game.lang.title': 'Сменить язык (Русский)',
    'game.nav.base': '🏗 База',
    'game.nav.map': '🗺 Звёздная карта',
    'game.nav.colonies': '🪐 Колонии',
    'game.nav.medbay': '🏥 Лазарет',
    'game.nav.roster': '👥 Отряды и Арсенал',
    'game.nav.log': '📜 Журнал',
    'game.gate.skip': 'Пропустить <span>ESC / Клик</span>',
    'game.boot.sublevel': 'КОМПЛЕКС ШАЙЕНН · ПОДУРОВЕНЬ 28',
    'game.boot.status': 'СТАТУС ВРАТ: ЭНЕРГИЯ В НОРМЕ<br>АУДИОСИСТЕМА И СИНТЕЗАТОР WEBAUDIO ГОТОВЫ',
    'game.boot.btn': '▶ НАЖМИТЕ ДЛЯ АКТИВАЦИИ ЗВЁЗДНЫХ ВРАТ',
    'game.intro.audio': '🔊 Включить звук',
    'game.intro.skip': 'Пропустить <span>ESC</span>',
    'game.combat.continue': 'Далее',
    'game.menu.sub': 'ПАУЗА И НАСТРОЙКИ СИСТЕМЫ',
    'game.menu.resume': '▶ Продолжить',
    'game.menu.gfx': '🖥 Графический движок',
    'game.menu.diff': '⚔ Сложность',
    'game.menu.diff.easy': 'Легко',
    'game.menu.diff.normal': 'Нормально',
    'game.menu.diff.hard': 'Сложно',
    'game.menu.saves': '💾 Сохранения и Импорт/Экспорт',
    'game.menu.help': '📖 Инструкция',
    'game.menu.newgame': '⟲ Новая игра',
    'game.dyn.combat.res_victory': '✔ ПОБЕДА',
    'game.dyn.combat.res_defeat': '✘ ПОРАЖЕНИЕ',
    'game.dyn.combat.res_extract': '🌀 ЭВАКУАЦИЯ'
  });

  // 6. PORTUGUÊS (pt)
  I18N.add('pt', {
    'portal.title': 'SGC Command – Comando Stargate 0.37 ("Chevron 8: A Terceira Dimensão")',
    'portal.brand.sub': 'Comando Stargate · 0.37 · "Chevron 8: A Terceira Dimensão"',
    'portal.nav.game': 'Jogo',
    'portal.nav.wiki': 'Banco de Dados & Lore',
    'portal.nav.about': 'Sobre & Laboratório',
    'portal.lang.btn': 'PT',
    'portal.lang.title': 'Mudar idioma (Português)',
    'portal.game.title': '🎮 SGC Command 0.37 Instância ao Vivo',
    'portal.game.openTab': '↗ Abrir em nova aba',
    'portal.game.fullscreen': '⛶ Tela cheia',
    'portal.wiki.h2': '📚 Banco de Dados & Manual do SGC',
    'portal.wiki.planets.h3': '🪐 Sistemas Planetários',
    'portal.wiki.gear.h3': '🛡 Equipamento Tático',
    'portal.wiki.gear.1': '<b>Rifle de Assalto FN P90:</b> Alta cadência de tiro, alcance 5.',
    'portal.wiki.colony.h3': '🏗 Gestão de Colônias',
    'portal.footer.1': '◎ COMANDO STARGATE · SGC COMMAND 0.37 · "Chevron 8: A Terceira Dimensão"',
    'game.go': '▶ Encerrar Dia',
    'game.lang.btn': 'PT',
    'game.lang.title': 'Mudar idioma (Português)',
    'game.nav.base': '🏗 Base',
    'game.nav.map': '🗺 Mapa Estelar',
    'game.nav.colonies': '🪐 Colônias',
    'game.nav.medbay': '🏥 Enfermaria',
    'game.nav.roster': '👥 Equipe & Arsenal',
    'game.nav.log': '📜 Registro',
    'game.gate.skip': 'Pular <span>ESC / Clique</span>',
    'game.boot.sublevel': 'COMPLEXO CHEYENNE MOUNTAIN · SUBNÍVEL 28',
    'game.boot.btn': '▶ CLIQUE / PRESSIONE TECLA PARA DISCAR O PORTAL',
    'game.combat.continue': 'Continuar',
    'game.menu.sub': 'PAUSA & CONFIGURAÇÃO DO SISTEMA',
    'game.menu.resume': '▶ Continuar Jogo',
    'game.menu.gfx': '🖥 Motor Gráfico',
    'game.menu.diff': '⚔ Dificuldade',
    'game.menu.diff.easy': 'Fácil',
    'game.menu.diff.normal': 'Normal',
    'game.menu.diff.hard': 'Difícil',
    'game.dyn.combat.res_victory': '✔ VITÓRIA',
    'game.dyn.combat.res_defeat': '✘ DERROTA',
    'game.dyn.combat.res_extract': '🌀 EXTRAÍDO'
  });

  // 7. العربية (ar)
  I18N.add('ar', {
    'portal.title': 'SGC Command – قيادة ستارغيت 0.37 ("شيفرون 8: البعد الثالث")',
    'portal.brand.sub': 'قيادة ستارغيت · 0.37 · "شيفرون 8: البعد الثالث"',
    'portal.nav.game': 'اللعبة',
    'portal.nav.wiki': 'قاعدة البيانات والأرشيف',
    'portal.nav.about': 'حول والمختبر',
    'portal.lang.btn': 'AR',
    'portal.lang.title': 'تغيير اللغة (العربية)',
    'portal.game.title': '🎮 SGC Command 0.37 المحطة الحية',
    'portal.game.openTab': '↗ فتح في علامة تبويب جديدة',
    'portal.game.fullscreen': '⛶ ملء الشاشة',
    'portal.wiki.h2': '📚 قاعدة بيانات ودليل SGC',
    'portal.wiki.planets.h3': '🪐 الأنظمة الكوكبية',
    'portal.wiki.gear.h3': '🛡 المعدات التكتيكية',
    'portal.wiki.gear.1': '<b>بندقية الهجوم FN P90:</b> معدل إطلاق نار مرتفع، المدى 5.',
    'portal.wiki.colony.h3': '🏗 إدارة المستعمرات',
    'portal.footer.1': '◎ STARGATE COMMAND · SGC COMMAND 0.37 · "شيفرون 8: البعد الثالث"',
    'game.go': '▶ إنهاء اليوم',
    'game.lang.btn': 'AR',
    'game.lang.title': 'تغيير اللغة (العربية)',
    'game.nav.base': '🏗 القاعدة',
    'game.nav.map': '🗺 خريطة النجوم',
    'game.nav.colonies': '🪐 المستعمرات',
    'game.nav.medbay': '🏥 الجناح الطبي',
    'game.nav.roster': '👥 الفريق والترسانة',
    'game.nav.log': '📜 السجل',
    'game.gate.skip': 'تخطي <span>ESC</span>',
    'game.boot.sublevel': 'مجمع جبل شاين · المستوى الفرعي 28',
    'game.boot.btn': '▶ انقر / اضغط مفتاحاً للاتصال بالبوابة',
    'game.combat.continue': 'متابعة',
    'game.menu.sub': 'إيقاف مؤقت وإعدادات النظام',
    'game.menu.resume': '▶ استئناف اللعب',
    'game.menu.gfx': '🖥 محرك الرسوميات',
    'game.menu.diff': '⚔ الصعوبة',
    'game.menu.diff.easy': 'سهل',
    'game.menu.diff.normal': 'عادي',
    'game.menu.diff.hard': 'صعب',
    'game.dyn.combat.res_victory': '✔ نصر',
    'game.dyn.combat.res_defeat': '✘ هزيمة',
    'game.dyn.combat.res_extract': '🌀 تم الإخلاء'
  });

  // Synchronisiere alle übrigen Schlüssel aus EN/DE, damit jede der 9 Sprachen 100% Key-Abdeckung besitzt
  I18N.syncLanguageFallbacks = function () {
    const baseEn = I18N.tables.en || {};
    const baseDe = I18N.tables.de || {};
    const extraLangs = ['es', 'zh', 'ja', 'ru', 'fr', 'pt', 'ar'];
    for (const lg of extraLangs) {
      if (!I18N.tables[lg]) I18N.tables[lg] = {};
      const tbl = I18N.tables[lg];
      for (const k in baseEn) {
        if (Object.prototype.hasOwnProperty.call(baseEn, k) && !Object.prototype.hasOwnProperty.call(tbl, k)) {
          tbl[k] = baseEn[k];
        }
      }
      for (const k in baseDe) {
        if (Object.prototype.hasOwnProperty.call(baseDe, k) && !Object.prototype.hasOwnProperty.call(tbl, k)) {
          tbl[k] = baseDe[k];
        }
      }
    }
  };
  I18N.syncLanguageFallbacks();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18N_LANGUAGES, I18N_95_COVERAGE, getImplementedLanguages, getPlannedLanguages, getLanguagesByPriority };
}
if (typeof globalThis !== 'undefined') {
  globalThis.I18N_LANGUAGES = I18N_LANGUAGES;
  globalThis.I18N_95_COVERAGE = I18N_95_COVERAGE;
  globalThis.getImplementedLanguages = getImplementedLanguages;
  globalThis.getPlannedLanguages = getPlannedLanguages;
  globalThis.getLanguagesByPriority = getLanguagesByPriority;
}
