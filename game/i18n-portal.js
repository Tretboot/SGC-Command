/* =====================================================================
   SGC Command · i18n-portal.js (v0.30)
   DE/EN-Tabellen für das Portal (index.html / hub.html).

   Voraussetzungen:  i18n.js (Engine)
   Schlüsselraum:    portal.*
   Bindung:          data-i18n / data-i18n-html / data-i18n-title im HTML
   Regel:            Jeder Key muss in DE und EN existieren — wird durch
                     `node test-browser.js` (i18n key parity) erzwungen.
   ===================================================================== */
(function () {
  'use strict';
  if (typeof I18N === 'undefined') throw new Error('i18n-portal.js benötigt i18n.js');
  /* ---------- A: Kopfzeile, Branding, Navigation, Sprach-Toggle ---------- */
  I18N.add('de', {
    'portal.title': 'SGC Command – Stargate Command 0.39 ("Blue Monday: Die 80s/90s Hit Jukebox")',
    'portal.brand.sub': 'Stargate Command · 0.39 · "Blue Monday: Die 80s/90s Hit Jukebox"',
    'portal.nav.game': 'Spiel',
    'portal.nav.wiki': 'Datenbank & Lore',
    'portal.nav.about': 'Über & Labor',
    'portal.lang.btn': 'EN',
    'portal.lang.title': 'Sprache wechseln (Switch to English)'
  });
  I18N.add('en', {
    'portal.title': 'SGC Command – Stargate Command 0.39 ("Blue Monday: The 80s/90s Hit Jukebox")',
    'portal.brand.sub': 'Stargate Command · 0.39 · "Blue Monday: The 80s/90s Hit Jukebox"',
    'portal.nav.game': 'Game',
    'portal.nav.wiki': 'Database & Lore',
    'portal.nav.about': 'About & Lab',
    'portal.lang.btn': 'DE',
    'portal.lang.title': 'Switch language (Zu Deutsch)'
  });

  /* ---------- B: Spiel-Tab (Iframe-Karte) ---------- */
  I18N.add('de', {
    'portal.game.title': '🎮 SGC Command 0.39 Live-Instanz',
    'portal.game.sub': 'Dual-Engine: Isometrisch Voxel (Pixel-Art) ⇄ 3D-ASCII (CP437, Taste [V]) · SGC-AMP v2.80',
    'portal.game.openTab': '↗ In neuem Tab öffnen',
    'portal.game.fullscreen': '⛶ Vollbild',
    'portal.game.status': '<b>Status:</b> Betriebsbereit · SGC-AMP v2.80 · C&C Hell March, Lo-Fi & Foothold Remixes aktiv · Strudel Core Online',
    'portal.game.controls': 'Steuerung: <b>WASD/Pfeile</b> = Kamera · <b>Q/E</b> = 90° Drehung · <b>V</b> = Pixel/ASCII (8-Bit) · <b>TAB</b> = Nächstes Mitglied · <b>ESC</b> = Menü'
  });
  I18N.add('en', {
    'portal.game.title': '🎮 SGC Command 0.39 Live Instance',
    'portal.game.sub': 'Dual Engine: Isometric Voxel (Pixel-Art) ⇄ 3D-ASCII (CP437, Key [V]) · SGC-AMP v2.80',
    'portal.game.openTab': '↗ Open in new tab',
    'portal.game.fullscreen': '⛶ Fullscreen',
    'portal.game.status': '<b>Status:</b> Operational · SGC-AMP v2.80 · C&C Hell March, Lo-Fi & Foothold Remixes active · Strudel Core Online',
    'portal.game.controls': 'Controls: <b>WASD/Arrows</b> = Camera · <b>Q/E</b> = 90° Rotation · <b>V</b> = Pixel/ASCII (8-Bit) · <b>TAB</b> = Next Member · <b>ESC</b> = Menu'
  });

  /* ---------- C: Wiki-Tab (Datenbank & Handbuch) ---------- */
  I18N.add('de', {
    'portal.wiki.h2': '📚 SGC Datenbank & Handbuch',
    'portal.wiki.intro': 'Willkommen im Archiv des Cheyenne Mountain Complex (Ebene 28). Zugriff autorisiert für Stufe 4+ Personal.',
    'portal.wiki.planets.h3': '🪐 Planetensysteme',
    'portal.wiki.planets.1': "<b>Abydos (P4X-544):</b> Wüstenwelt, antike Pyramiden, Ra-Kult.",
    'portal.wiki.planets.2': "<b>Chulak:</b> Dschungel/Heimatwelt der Jaffa-Krieger unter Apophis.",
    'portal.wiki.planets.3': '<b>Planet Alpha:</b> SGC-Außenposten und Zufluchtsort.',
    'portal.wiki.planets.4': '<b>Tollana:</b> Hochtechnisierte neutrale Zivilisation mit Ionenkanonen.',
    'portal.wiki.planets.5': "<b>Kern-Systeme:</b> Ha'tak-Flottenverbände und Goa'uld-Festungen.",
    'portal.wiki.gear.h3': '🛡 Taktische Ausrüstung',
    'portal.wiki.gear.1': '<b>FN P90 Sturmgewehr:</b> Hohe Kadenz, Reichweite 5.',
    'portal.wiki.gear.2': "<b>Zat'nik'tel:</b> Betäubung / Energieschock, Reichweite 4.",
    'portal.wiki.gear.3': '<b>Jaffa-Stabwaffe:</b> Plasma-Entladung mit hoher Zerstörungskraft.',
    'portal.wiki.gear.4': '<b>Persönlicher Schutzschild:</b> Absorbiert Schaden für 2 Runden.',
    'portal.wiki.gear.5': '<b>Auto-Turret & Reaktor:</b> Feldbau-Strukturen im Gefecht.',
    'portal.wiki.colony.h3': '🏗 Kolonie-Management',
    'portal.wiki.colony.1': '<b>Stargate-Ring:</b> Primäre Verbindung zur Erde (Sektor 2,2).',
    'portal.wiki.colony.2': '<b>Naquadah-Mine:</b> Ertrag +6 Erz/Tag (-2 Energie).',
    'portal.wiki.colony.3': '<b>Forschungslabor:</b> Ertrag +5 Tech/Tag (-3 Energie).',
    'portal.wiki.colony.4': '<b>Schutzschild-Kuppel:</b> Kraftfeld schützt Kolonie (+30 Def).',
    'portal.wiki.colony.5': '<b>UAV-Hangar:</b> Luftpatrouillen & Vorwarnung vor Jaffa-Raids.'
  });
  I18N.add('en', {
    'portal.wiki.h2': '📚 SGC Database & Manual',
    'portal.wiki.intro': 'Welcome to the archives of the Cheyenne Mountain Complex (Level 28). Access authorized for Level 4+ personnel.',
    'portal.wiki.planets.h3': '🪐 Planetary Systems',
    'portal.wiki.planets.1': '<b>Abydos (P4X-544):</b> Desert world, ancient pyramids, Ra-cult.',
    'portal.wiki.planets.2': "<b>Chulak:</b> Jungle/homeworld of the Jaffa warriors under Apophis.",
    'portal.wiki.planets.3': '<b>Planet Alpha:</b> SGC outpost and refuge.',
    'portal.wiki.planets.4': '<b>Tollana:</b> Highly advanced neutral civilization with ion cannons.',
    'portal.wiki.planets.5': "<b>Core Systems:</b> Ha'tak fleet formations and Goa'uld fortresses.",
    'portal.wiki.gear.h3': '🛡 Tactical Equipment',
    'portal.wiki.gear.1': '<b>FN P90 Assault Rifle:</b> High rate of fire, range 5.',
    'portal.wiki.gear.2': "<b>Zat'nik'tel:</b> Stun / energy shock, range 4.",
    'portal.wiki.gear.3': '<b>Jaffa Staff Weapon:</b> Plasma discharge with high destructive power.',
    'portal.wiki.gear.4': '<b>Personal Shield:</b> Absorbs damage for 2 rounds.',
    'portal.wiki.gear.5': '<b>Auto-Turret & Reactor:</b> Field-built structures in combat.',
    'portal.wiki.colony.h3': '🏗 Colony Management',
    'portal.wiki.colony.1': '<b>Stargate Ring:</b> Primary link to Earth (Sector 2,2).',
    'portal.wiki.colony.2': '<b>Naquadah Mine:</b> Yield +6 ore/day (-2 energy).',
    'portal.wiki.colony.3': '<b>Research Lab:</b> Yield +5 tech/day (-3 energy).',
    'portal.wiki.colony.4': '<b>Shield Dome:</b> Force field protects the colony (+30 Def).',
    'portal.wiki.colony.5': '<b>UAV Hangar:</b> Air patrols & early warning against Jaffa raids.'
  });

  /* ---------- D: Log-Tab (Kopf + Schnell-Buttons) ---------- */
  I18N.add('de', {
    "portal.logs.h2": "📜 SGC Captain's Log Archive",
    'portal.logs.quick.027': 'Log 027 (Trotz Contentrot)',
    'portal.logs.quick.026': 'Log 026 (In der Tat)',
    'portal.logs.quick.023': 'Log 023 (Mission-UI & Intro-Audio)',
    'portal.logs.quick.022': 'Log 022 (Soundtrack Fett & Polish)'
  });
  I18N.add('en', {
    "portal.logs.h2": "📜 SGC Captain's Log Archive",
    'portal.logs.quick.027': 'Log 027 (Despite Contentrot)',
    'portal.logs.quick.026': 'Log 026 (In Fact)',
    'portal.logs.quick.023': 'Log 023 (Mission UI & Intro Audio)',
    'portal.logs.quick.022': 'Log 022 (Soundtrack Fat & Polish)'
  });

  /* ---------- E: Captain's Log 027 ---------- */
  I18N.add('de', {
    'portal.log027.tag': 'Aktueller Durchgang 027',
    'portal.log027.date': '23. Oktober 2026 · SGC Krisen-System, Woolsey-Audit, Replikatoren & Contentrot',
    'portal.log027.title': 'Captain\'s Log 027 – „Trotz Contentrot – Unautorisierte Toraktivierung“',
    'portal.log027.lead': 'Dramatischer Tagesabschluss mit Notfall-Krisen, Richard Woolsey NID-Revision, Replikator-Alarm und Winamp-Eastereggs',
    'portal.log027.li1': '<b>SGC Krisen- & Vorfall-System bei Tag-Ende:</b> ~55% Chance auf dramatische Zwischenfälle mit Entscheidungsauswahl: Unautorisierte Toraktivierung (Iris schließen vs. SG-3 Feuerschutz), Richard Woolseys NID-Revision (blauer Wackelpudding vs. Daniels Steuervortrag), Replikator-Invasion in den WebAudio-Leitungen und Altair-Harlans Duplikate („Comtrya!“).',
    'portal.log027.li2': '<b>Meta-AI Humor & Eastereggs:</b> Contentrot-Notizen, Reese\'s Replikator-Spielzeug, Zitate von O\'Neill & Teal\'c sowie geheime Klick-Eastereggs auf dem Winamp-LCD-Display.',
    'portal.log027.li3': '<b>Stabilität & Budget:</b> 172 automatisierte Tests grün (0 Fehler), Release-Paket mit ~625 KB strikt unter der 1,44 MB Floppy-Disk-Grenze.'
  });
  I18N.add('en', {
    'portal.log027.tag': 'Current Round 027',
    'portal.log027.date': 'October 23, 2026 · SGC Crisis System, Woolsey Audit, Replicators & Contentrot',
    'portal.log027.title': 'Captain\'s Log 027 – "Despite Contentrot – Unauthorized Gate Activation"',
    'portal.log027.lead': 'Dramatic end of day with emergency crises, Richard Woolsey NID review, replicator alarm and Winamp easter eggs',
    'portal.log027.li1': '<b>SGC Crisis & Incident System at end of day:</b> ~55% chance of dramatic incidents with a decision choice: Unauthorized Gate Activation (close Iris vs. SG-3 fire suppression), Richard Woolsey\'s NID Review (wobbly blue jelly vs. Daniel\'s control briefing), Replicator invasion of the WebAudio lines and Altair Harlan\'s duplicates ("Comtrya!").',
    'portal.log027.li2': '<b>Meta-AI Humor & Easter Eggs:</b> Contentrot notes, Reese\'s replicator toys, quotes from O\'Neill & Teal\'c and secret click easter eggs on the Winamp LCD display.',
    'portal.log027.li3': '<b>Stability & Budget:</b> 172 automated tests green (0 errors), release package at ~625 KB strictly below the 1.44 MB floppy-disk limit.'
  });

  /* ---------- F: Captain's Log 026 ---------- */
  I18N.add('de', {
    'portal.log026.tag': 'Aktueller Durchgang 026',
    'portal.log026.date': '23. Oktober 2026 · Taktische Level-Überarbeitung, Beutesystem & Level-Editor',
    'portal.log026.title': 'Captain\'s Log 026 – „In der Tat – Fast ein Spiel“',
    'portal.log026.lead': 'Stadt-Plaza-Design, X-COM/JA2-Deckungslogik, taktische Beutekisten mit Team-Banter & SGC Level Editor',
    'portal.log026.li1': '<b>Taktische Level-Überarbeitung (Stadt & Welten):</b> Enge 1-Kachel-Engpässe im Stadtsektor beseitigt. Neues Design mit 3-Kachel-Boulevards, offenem Marktplatz (Plaza), Ruinen mit Fenstern/Türen und doppelten Flussbrücken für echte Flankenmanöver.',
    'portal.log026.li2': '<b>In-Combat Beutesystem & Team-Banter:</b> Prozedural platzierte Goa\'uld-Vorratskisten, Naquadah-Kanister und Antiker-Datenkristalle auf dem Schlachtfeld. Bergung triggert authentische Stargate-Felddialoge (O\'Neill, Carter, Jackson, Teal\'c) und belohnt mit Ressourcen und Spezials.',
    'portal.log026.li3': '<b>SGC Tactical Level Editor (<code>tools/leveleditor.html</code>):</b> Vollwertiges Autorenwerkzeug mit 2:1 Isometrie- & 2D-Rasteransicht, Terrain-/Deckungs-Pinsel, Höhenverstellung (+1/-1 Z), Presets und sofortigem <code>MAPS[]</code>-Code-Export.',
    'portal.log026.li4': '<b>Rundenabschluss & Outro-Audio:</b> Rundenende per Enter/Button und Stargate Outro Theme beim Tagesabschluss mit SGC-Tagesbericht und Logbuch-Geschichten.'
  });
  I18N.add('en', {
    'portal.log026.tag': 'Current Round 026',
    'portal.log026.date': 'October 23, 2026 · Tactical Level Overhaul, Loot System & Level Editor',
    'portal.log026.title': 'Captain\'s Log 026 – "In Fact – Almost a Game"',
    'portal.log026.lead': 'City plaza design, X-COM/JA2 cover logic, tactical loot crates with team banter & SGC level editor',
    'portal.log026.li1': '<b>Tactical Level Overhaul (City & Worlds):</b> Tight 1-tile chokepoints in the city sector eliminated. New design with 3-tile boulevards, an open town square (plaza), ruins with windows/doors and double river bridges for real flank maneuvers.',
    'portal.log026.li2': '<b>In-Combat Loot System & Team Banter:</b> Procedurally placed Goa\'uld supply crates, naquadah canisters and Ancient data crystals on the battlefield. Recovery triggers authentic Stargate field dialogue (O\'Neill, Carter, Jackson, Teal\'c) and rewards resources and specials.',
    'portal.log026.li3': '<b>SGC Tactical Level Editor (<code>tools/leveleditor.html</code>):</b> Full authoring tool with 2:1 isometric & 2D grid view, terrain/cover brushes, height adjustment (+1/-1 Z), presets and instant <code>MAPS[]</code> code export.',
    'portal.log026.li4': '<b>Round End & Outro Audio:</b> Round end via Enter/button and the Stargate outro theme at the end of the day, with SGC daily report and logbook stories.'
  });

  /* ---------- G: Captain's Log 024 ---------- */
  I18N.add('de', {
    'portal.log024.tag': 'Aktueller Durchgang 024',
    'portal.log024.date': '22. Oktober 2026 · 10× Performance, Sound-Vollendung & Stabilität',
    'portal.log024.title': 'Captain\'s Log 024 – Feldtauglich & Sound-Vollendung',
    'portal.log024.lead': 'Wartungszyklus, 10-facher Kampffluss, Winamp-Spektrum und Musik-Dramaturgie',
    'portal.log024.li1': '<b>Missionsabschluss & „Weiter“-Button:</b> Namenskollision zwischen Strudels Notenparser (<code>window.note</code>) und der internen Logging-Funktion behoben. Der Kampfabschluss ist wieder uneingeschränkt funktionsfähig (inkl. Enter/Leertaste).',
    'portal.log024.li2': '<b>10-facher Performance-Boost:</b> Beseitigung von Layout-Thrashing (<code>resizeCombatViewport</code>) und dirty-state HTML-Caching senkten die Framedauer im Kampf von 90 ms (~11 FPS) auf 8 ms (120+ FPS).',
    'portal.log024.li3': '<b>Musik-Dramaturgie:</b> Intro leitet beim ersten Klick oder Betreten der Basis auf Remix 1 (<code>theme_remix_0</code>) über; die Sternenkarte spielt nahtlos Remix 3 (<code>theme_remix_2</code>).',
    'portal.log024.li4': '<b>Winamp-Spektrum & Audio:</b> 28-Band-Spektrumanalysator mit logarithmischen Frequenzbändern und flüssig fallenden Peak-Kappen verfeinert; unterbrochene WebAudio-Zustände werden robust abgefangen.',
    'portal.log024.li5': '<b>Neuer Song:</b> 🌌 Stargate × Melancholic Ambient Phaser Remix (74 BPM, D-Dorisch mit nativem Phaser-DSP) ergänzt das Repertoire.',
    'portal.log024.li6': '<b>Bereinigung & Release:</b> Versehentliche temporäre Testdaten wurden bereinigt und durch <code>.gitignore</code> dauerhaft abgeschirmt. Neue Version als <code>release/SGC-Command-v026.zip</code> hinterlegt.'
  });
  I18N.add('en', {
    'portal.log024.tag': 'Current Round 024',
    'portal.log024.date': 'October 22, 2026 · 10× Performance, Sound Completion & Stability',
    'portal.log024.title': 'Captain\'s Log 024 – Field-Ready & Sound Completion',
    'portal.log024.lead': 'Maintenance cycle, 10× combat flow, Winamp spectrum and music dramaturgy',
    'portal.log024.li1': '<b>Mission completion & "Continue" button:</b> Name collision between Strudel\'s note parser (<code>window.note</code>) and the internal logging function fixed. Combat completion is fully functional again (incl. Enter/Space).',
    'portal.log024.li2': '<b>10× Performance Boost:</b> Eliminating layout thrashing (<code>resizeCombatViewport</code>) and dirty-state HTML caching reduced combat frame time from 90 ms (~11 FPS) to 8 ms (120+ FPS).',
    'portal.log024.li3': '<b>Music Dramaturgy:</b> The intro hands over to Remix 1 (<code>theme_remix_0</code>) on first click or when entering the base; the starmap plays Remix 3 (<code>theme_remix_2</code>) seamlessly.',
    'portal.log024.li4': '<b>Winamp Spectrum & Audio:</b> Refined 28-band spectrum analyser with logarithmic frequency bands and smoothly falling peak caps; interrupted WebAudio states are robustly caught.',
    'portal.log024.li5': '<b>New Song:</b> 🌌 Stargate × Melancholic Ambient Phaser Remix (74 BPM, D Dorian with native phaser DSP) joins the repertoire.',
    'portal.log024.li6': '<b>Cleanup & Release:</b> Accidental temporary test data cleaned up and permanently shielded via <code>.gitignore</code>. New version stored as <code>release/SGC-Command-v026.zip</code>.'
  });

  /* ---------- H: Captain's Log 023 ---------- */
  I18N.add('de', {
    'portal.log023.date': '22. Oktober 2026 · Mission UI, Intro-Audio & Release-Polish',
    'portal.log023.title': 'Captain\'s Log 023 – Einsatzbereit',
    'portal.log023.lead': 'Mission-Interaktion, Intro-Sound und Release-Bereinigung',
    'portal.log023.li1': '<b>Kampf während Ankunftsdialogen:</b> Das Story-Panel blockiert nicht mehr die ganze Einsatzkarte. Eigene Einheiten können bereits ausgewählt werden; Bewegungs- und Angriffsaktionen bleiben bis zum Ende des Dialogs gesperrt.',
    'portal.log023.li2': '<b>Intro-Musik:</b> Die Titelmusik wird beim Intro vorbereitet. Ein eigener Audio-Button ermöglicht das browserkonforme Freischalten, ohne die Sequenz zu überspringen.',
    'portal.log023.li3': '<b>Responsive Aktionsleiste:</b> Das untere Kampfpanel bleibt bei schmalen und niedrigen Viewports sichtbar und scrollbar.',
    'portal.log023.li4': '<b>Qualitätssicherung:</b> Tests ergänzen Auswahl- und Panelprüfungen. Das Release-Paket v0.23 enthält den geprüften Stand und die aktuelle Dokumentation.'
  });
  I18N.add('en', {
    'portal.log023.date': 'October 22, 2026 · Mission UI, Intro Audio & Release Polish',
    'portal.log023.title': 'Captain\'s Log 023 – Mission Ready',
    'portal.log023.lead': 'Mission interaction, intro sound and release cleanup',
    'portal.log023.li1': '<b>Combat during arrival dialogue:</b> The story panel no longer blocks the whole mission map. Own units can already be selected; movement and attack actions stay locked until the end of the dialogue.',
    'portal.log023.li2': '<b>Intro Music:</b> The title music is prepared at the intro. A dedicated audio button enables browser-compliant unlocking without skipping the sequence.',
    'portal.log023.li3': '<b>Responsive Action Bar:</b> The bottom combat panel stays visible and scrollable on narrow and short viewports.',
    'portal.log023.li4': '<b>Quality Assurance:</b> Tests add selection and panel checks. Release package v0.23 contains the verified state and current documentation.'
  });

  /* ---------- I: Captain's Log 022 (DE) ---------- */
  I18N.add('de', {
    'portal.log022.tag': 'Aktueller Durchgang 022',
    'portal.log022.date': '22. Oktober 2026 · Schicht: Gemini 3.8 Flash (Polishing & Stabilisierung)',
    'portal.log022.title': 'Captain\'s Log 022 – "...aber der Soundtrack ist jetzt Fett!"',
    'portal.log022.lead': 'Autoren-Schichten: Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash',
    'portal.log022.li1': '<b>Lautstärkeregler repariert:</b> Interne Superdough- und WebAudio-Knoten werden nun strikt über <code>SFX.master</code> und <code>SFX.analyser</code> geroutet. Volle Lautstärkekontrolle und <code>localStorage</code>-Persistenz im Winamp-Header.',
    'portal.log022.li2': '<b>Neuer Soundtrack: C&C Hell March & Lo-Fi Chillhop:</b> Zwei neue handgefertigte Stargate-Themen hinzugefügt: <code>theme_remix_cnc</code> ("🪖 Stargate × C&C Hell March Industrial Remix", 132 BPM, 909-Kick, verzerrter Bass, Fanfare) und <code>theme_remix_lofi</code> ("☕ Stargate × Midnight Lo-Fi Chillhop", 84 BPM, Rhodes Piano, Tape Saturation, sanfter Beat).',
    'portal.log022.li3': '<b>Combat-UI Layout-Fix:</b> <code>#combat-ui</code> wurde direkt in <code>#combat-overlay</code> verschoben und dynamisch per CSS-Flexbox verankert. Das Aktionspanel wird in keiner Bildschirmauflösung und in keinem Iframe mehr abgeschnitten.',
    'portal.log022.li4': '<b>Menü-General entfernt:</b> Die manuelle Kommandantenauswahl im Pause-Menü wurde entfernt, da Generäle über das Kampagnen- und Quest-System freigeschaltet werden.',
    'portal.log022.li5': '<b>Hub-Navigation entschlackt:</b> Aufdringliche Abzeichen entfernt; Forschungsnotizen, Winamp-Labor und Downloads in den aufgeräumten Bereich <b>"ℹ️ Über & Labor"</b> konsolidiert.',
    'portal.log022.li6': '<b>Entschlackung des Release-Pakets:</b> Unnötige schwere Screenshot-PNGs aus dem Paket entfernt, um die ZIP-Downloadgröße minimal zu halten.',
    'portal.log022.li7': '<b>Gemeinfreie NASA-Assets:</b> Kuratierter Katalog gemeinfreier Weltraum- und Planetenbilder (Mars-Dünen, Eye of the Sahara, Webb Cosmic Cliffs, Cassini-Eiswelten) in <code>references/NASA-ASSETS.md</code> hinterlegt.',
    'portal.log022.li8': '<b>Test-Abdeckung:</b> 74 automatisierte Assertions in <code>test-browser.js</code> laufen mit 0 Fehlern durch (100% grün).'
  });

  /* ---------- I: Captain's Log 022 (EN) ---------- */
  I18N.add('en', {
    'portal.log022.tag': 'Current Round 022',
    'portal.log022.date': 'October 22, 2026 · Layer: Gemini 3.8 Flash (Polishing & Stabilization)',
    'portal.log022.title': 'Captain\'s Log 022 – "...but the soundtrack is now Fat!"',
    'portal.log022.lead': 'Author layers: Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash',
    'portal.log022.li1': '<b>Volume slider repaired:</b> Internal Superdough and WebAudio nodes are now strictly routed via <code>SFX.master</code> and <code>SFX.analyser</code>. Full volume control and <code>localStorage</code> persistence in the Winamp header.',
    'portal.log022.li2': '<b>New Soundtrack: C&C Hell March & Lo-Fi Chillhop:</b> Two new handcrafted Stargate themes added: <code>theme_remix_cnc</code> ("🪖 Stargate × C&C Hell March Industrial Remix", 132 BPM, 909 kick, distorted bass, fanfare) and <code>theme_remix_lofi</code> ("☕ Stargate × Midnight Lo-Fi Chillhop", 84 BPM, Rhodes piano, tape saturation, soft beat).',
    'portal.log022.li3': '<b>Combat-UI Layout Fix:</b> <code>#combat-ui</code> moved directly into <code>#combat-overlay</code> and dynamically anchored via CSS flexbox. The action panel is no longer clipped at any screen resolution or in any iframe.',
    'portal.log022.li4': '<b>Menu general removed:</b> Manual commander selection in the pause menu removed, since generals are unlocked via the campaign and quest system.',
    'portal.log022.li5': '<b>Hub navigation slimmed:</b> Pushy badges removed; research notes, Winamp lab and downloads consolidated into the tidy <b>"ℹ️ About & Lab"</b> area.',
    'portal.log022.li6': '<b>Release package slimming:</b> Unnecessary heavy screenshot PNGs removed from the package to keep the ZIP download size minimal.',
    'portal.log022.li7': '<b>Public-domain NASA assets:</b> Curated catalog of public-domain space and planet images (Mars dunes, Eye of the Sahara, Webb Cosmic Cliffs, Cassini ice worlds) stored in <code>references/NASA-ASSETS.md</code>.',
    'portal.log022.li8': '<b>Test coverage:</b> 74 automated assertions in <code>test-browser.js</code> run through with 0 errors (100% green).'
  });

  /* ---------- J: Captain's Log 021 (DE) ---------- */
  I18N.add('de', {
    'portal.log021.tag': 'Durchgang 021',
    'portal.log021.date': '22. Oktober 2026 · Schicht: Gemini 3.8 Flash (Fertigstellung)',
    'portal.log021.title': 'Captain\'s Log 021 – Winamp Retro-Player, Oszilloskop, 8-Bit Chiptune & Switch Angel Audio-Fixes',
    'portal.log021.lead': 'Autoren-Schichten: Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash',
    'portal.log021.li1': '<b>Switch Angel Laufzeit-Reparaturen:</b> AST-Präprozessor normalisiert veraltete HTML-String-Methoden (<code>String.sub</code>) und sichert <code>String.prototype.seg</code>, <code>add</code> und <code>pk</code> ab. Alle 20 Stücke (inkl. <code>extra_slippy</code>, <code>Lets_Talk</code>, <code>MUTEK4am</code>, <code>did_i_make_this</code>, <code>AUTOTOMATONE</code>) starten sofort.',
    'portal.log021.li2': '<b>SGC-AMP v2.80 Retro-Player:</b> Vollwertiges Winamp v2 Interface mit grünem LCD-Matrix-Display, eindeutigen Status-Plaketten (PLAYING/PAUSED/STOPPED), Playlist-Suchfilter und klappbarem Live-Coding-Drawer.',
    'portal.log021.li3': '<b>Echtzeit-Oszilloskop & 28-Band-Spektrumanalysator:</b> 60 FPS HTML5-Canvas direkt an den WebAudio <code>AnalyserNode</code> angebunden.',
    'portal.log021.li4': '<b>Automatischer 8-Bit Chiptune Modus:</b> Gekoppelt an die Umschaltung in den 3D-ASCII-Look (Taste <code>V</code>); reine Rechteckwellen und 40-Hz-Arpeggio-Flutter; auch manuell schaltbar.',
    'portal.log021.li5': '<b>Stargate Theme MIDI Direct:</b> Zerlegung der MIDI-Spuren in 16-Step Takte mit spezifischen Strudel-Instrumenten ($MELODY Waldhorn, $BASS E-Bass, $HARMONY Power-Brass, $DRUMS Pauken & Orchester-Kit).',
    'portal.log021.li6': '<b>Schlankheitskur:</b> Bereinigung um 50+ MB schwere WAV-Dateien; <code>references/</code> als saubere Inbox für künftige Drops vorbereitet.'
  });

  /* ---------- J: Captain's Log 021 (EN) ---------- */
  I18N.add('en', {
    'portal.log021.tag': 'Round 021',
    'portal.log021.date': 'October 22, 2026 · Layer: Gemini 3.8 Flash (Finalization)',
    'portal.log021.title': 'Captain\'s Log 021 – Winamp Retro Player, Oscilloscope, 8-Bit Chiptune & Switch Angel Audio Fixes',
    'portal.log021.lead': 'Author layers: Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash',
    'portal.log021.li1': '<b>Switch Angel runtime repairs:</b> AST pre-processor normalizes outdated HTML string methods (<code>String.sub</code>) and secures <code>String.prototype.seg</code>, <code>add</code> and <code>pk</code>. All 20 tracks (incl. <code>extra_slippy</code>, <code>Lets_Talk</code>, <code>MUTEK4am</code>, <code>did_i_make_this</code>, <code>AUTOTOMATONE</code>) start instantly.',
    'portal.log021.li2': '<b>SGC-AMP v2.80 Retro Player:</b> Full Winamp v2 interface with green LCD matrix display, unambiguous status badges (PLAYING/PAUSED/STOPPED), playlist search filter and collapsible live-coding drawer.',
    'portal.log021.li3': '<b>Real-Time Oscilloscope & 28-Band Spectrum Analyser:</b> 60 FPS HTML5 canvas directly wired to the WebAudio <code>AnalyserNode</code>.',
    'portal.log021.li4': '<b>Automatic 8-Bit Chiptune Mode:</b> Coupled to the switch into the 3D-ASCII look (key <code>V</code>); pure square waves and 40 Hz arpeggio flutter; also manually switchable.',
    'portal.log021.li5': '<b>Stargate Theme MIDI Direct:</b> Breakdown of the MIDI tracks into 16-step bars with specific Strudel instruments ($MELODY french horn, $BASS E-bass, $HARMONY power brass, $DRUMS timpani & orchestral kit).',
    'portal.log021.li6': '<b>Diet:</b> Cleanup removing 50+ MB heavy WAV files; <code>references/</code> prepared as a clean inbox for future drops.'
  });

  /* ---------- K: Captain's Log 020 (DE) ---------- */
  I18N.add('de', {
    'portal.log020.tag': 'Durchgang 020',
    'portal.log020.date': '22. Oktober 2026 · Schichten: Gemini 4 Argon, Claude 5.5, Gemini 3.8 Flash',
    'portal.log020.title': 'Captain\'s Log 020 – Dual-Gfx (Pixel-Voxel ⇄ 3D-ASCII), Civ Kolonien & Strudel Engine Core',
    'portal.log020.lead': 'Autoren-Schichten: Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash',
    'portal.log020.li1': '<b>2:1 Isometrische Voxel-Engine:</b> Echte 3D-Höhenstufen, Diamant-Picking, Obelisk-Top/Left/Right-Shading und 4-Wege-Kameradrehung (<code>Q</code>/<code>E</code>).',
    'portal.log020.li2': '<b>CP437 3D-ASCII Engine:</b> Retro-Terminal-Grafik inspiriert von <code>asciiid</code> und <code>asciicker</code>; nahtlos mit Taste <code>V</code> umschaltbar.',
    'portal.log020.li3': '<b>Persistenter Koloniebau (Civ / SimCity / Total War Rome):</b> Planetare Außenposten mit Minen, Reaktoren, Forschungslaboren, Schutzschilden und UAV-Hangars auf einem 6×5 Sektoren-Gitter.',
    'portal.log020.li4': '<b>Strudel Core & WebAudio Fallback:</b> Autonome Live-Pattern-Synthese mit prozeduralen Drum-WAVs ohne externe Server.',
    'portal.log020.li5': '<b>Spielfeld-Tanzen & Gamepad Dual-Rumble:</b> Audio-reaktiver Bounce (<code>ISO.beatPulse</code>) und taktile Controller-Vibration.',
    'portal.log020.li6': '<b>Squad-Cycling & Keybindings:</b> Nächstes SG-Mitglied mit <code>Tab</code> und freie Tastenbelegungs-Konfiguration.'
  });

  /* ---------- K: Captain's Log 020 (EN) ---------- */
  I18N.add('en', {
    'portal.log020.tag': 'Round 020',
    'portal.log020.date': 'October 22, 2026 · Layers: Gemini 4 Argon, Claude 5.5, Gemini 3.8 Flash',
    'portal.log020.title': 'Captain\'s Log 020 – Dual-Gfx (Pixel-Voxel ⇄ 3D-ASCII), Civ Colonies & Strudel Engine Core',
    'portal.log020.lead': 'Author layers: Gemini 4 Argon, Claude 5.5 Sonnet, Gemini 3.8 Flash',
    'portal.log020.li1': '<b>2:1 Isometric Voxel Engine:</b> True 3D height levels, diamond picking, obelisk top/left/right shading and 4-way camera rotation (<code>Q</code>/<code>E</code>).',
    'portal.log020.li2': '<b>CP437 3D-ASCII Engine:</b> Retro terminal graphics inspired by <code>asciiid</code> and <code>asciicker</code>; seamlessly switchable with key <code>V</code>.',
    'portal.log020.li3': '<b>Persistent Colony Building (Civ / SimCity / Total War Rome):</b> Planetary outposts with mines, reactors, research labs, shields and UAV hangars on a 6×5 sector grid.',
    'portal.log020.li4': '<b>Strudel Core & WebAudio Fallback:</b> Autonomous live pattern synthesis with procedural drum WAVs, no external servers.',
    'portal.log020.li5': '<b>Playfield Dancing & Gamepad Dual Rumble:</b> Audio-reactive bounce (<code>ISO.beatPulse</code>) and haptic controller vibration.',
    'portal.log020.li6': '<b>Squad Cycling & Keybindings:</b> Next SG member with <code>Tab</code> and free keybind configuration.'
  });

  /* ---------- L: Über & Labor (Subnavigation) ---------- */
  I18N.add('de', {
    'portal.about.soundlab': '🎵 Strudel & Winamp Lab',
    'portal.about.study': '📄 Forschungsnotizen & Architektur',
    'portal.about.editor': '🗺️ Level-Editor',
    'portal.about.downloads': '📦 Offline-Paket & Download',
    'portal.about.license': '⚖️ Lizenzen & Danksagung'
  });
  I18N.add('en', {
    'portal.about.soundlab': '🎵 Strudel & Winamp Lab',
    'portal.about.study': '📄 Research Notes & Architecture',
    'portal.about.editor': '🗺️ Level Editor',
    'portal.about.downloads': '📦 Offline Package & Download',
    'portal.about.license': '⚖️ Licenses & Acknowledgments'
  });

  /* ---------- M: Sound Lab (DE) ---------- */
  I18N.add('de', {
    'portal.lab.h2': '🎵 Strudel Core, SGC-AMP v2.80 & ReBirth-338 Sound Studio',
    'portal.lab.intro': 'Die Sound-Engine von SGC Command basiert auf modernster algorithmischer Live-Pattern-Synthese nach dem Vorbild von <b>Strudel</b> und <b>TidalCycles</b>, kombiniert mit einem retro Winamp-Player, ReBirth RB-338 Synthesizer-Rack mit Roland Soundbanks und einem Strudel.cc Live-Code Interface.',
    'portal.lab.c1.h3': '🪖 Neue Remixes: C&C Hell March & Lo-Fi Chillhop',
    'portal.lab.c1.p': 'Der Stargate-Soundtrack wurde um zwei neue, handgefertigte Strudel-Remixe erweitert:',
    'portal.lab.c1.li1': '<b>🪖 Stargate × C&C Hell March Remix:</b> 132 BPM, Frank-Klepacki-Industrial-Vibe, treibende Roland TR-909 Kick, verzerrter E-Bass Chug, schneidende Brass-Fanfare für dramatische Bodengefechte und Bosskämpfe.',
    'portal.lab.c1.li2': '<b>☕ Stargate × Midnight Lo-Fi Chillhop Remix:</b> 84 BPM, entspannte Half-Time Beats, Rhodes E-Piano mit Tape-Saturation, sanfte Flöte und dezentes Vinyl-Knistern für Basenbau und Forschung.',
    'portal.lab.c2.h3': '🎛 ReBirth RB-338 Rack & Roland Soundbanks',
    'portal.lab.c2.p': 'Inspiriert von der legendären Propellerhead ReBirth RB-338 Software:',
    'portal.lab.c2.li1': '<b>TB-303 Acid Bass Rack:</b> Soundbanks für <code>303 Saw</code>, <code>303 Sq</code>, <code>SH-101</code>, <code>Sub</code>, <code>Slap</code>, <code>8-Bit</code> und <code>Reese</code>. Drehregler für Cutoff, Resonanz, Env Mod, Decay, Distortion und Tune.',
    'portal.lab.c2.li2': '<b>Roland Drum Machine:</b> 1-Klick Soundbank-Wechsler für <b>Kick</b> (<code>TR-909</code>, <code>TR-808</code>, <code>TR-707</code>, <code>LinnDrum</code>, <code>8-Bit</code>, <code>Acoustic</code>, <code>Acid</code>) und <b>Hi-Hat</b> (<code>TR-909</code>, <code>TR-808</code>, <code>TR-707</code>, <code>LinnDrum</code>, <code>8-Bit</code>, <code>Noise Sweep</code>).',
    'portal.lab.c2.li3': '<b>Hot-Injection in den Code:</b> Button <code>[ ✍ SOUNDBANKS ANWENDEN ]</code> überträgt die ausgewählten Sounds direkt in den Code-Text.',
    'portal.lab.c3.h3': '📻 SGC-AMP v2.80 (Winamp Retro Player)',
    'portal.lab.c3.p': 'Optisch und funktional an das legendäre Winamp v2 angelehnt:',
    'portal.lab.c3.li1': '<b>Grünes Phosphor-LCD:</b> Marquee-Lauftext, Spielzeit, BPM, CPS und Bitrate.',
    'portal.lab.c3.li2': '<b>Status-Badges:</b> Klar visualisiert mit <code>[ ▶ PLAYING ]</code> (pulsierend grün), <code>[ ⏸ PAUSED ]</code> (bernstein) und <code>[ ⏹ STOPPED ]</code> (rot).',
    'portal.lab.c3.li3': '<b>Echtzeit-Oszilloskop / Visualizer:</b> HTML5-Canvas greift über einen <code>AnalyserNode</code> das Gesamtsignal ab – umschaltbar zwischen grüner Phosphor-Welle und 28-Band-Spektrumanalysator.',
    'portal.lab.c3.li4': '<b>Master-Lautstärkeregler:</b> Steuert den AudioContext Master-Gain mit linear-to-exponential Scaling und <code>localStorage</code>-Speicherung.',
    'portal.lab.c4.h3': '👾 Automatischer 8-Bit Chiptune Modus',
    'portal.lab.c4.p': 'Spielfeld-Ästhetik und Akustik greifen nahtlos ineinander:',
    'portal.lab.c4.li1': '<b>Kopplung an ASCII-Look:</b> Beim Wechsel in den 3D-ASCII-Modus (Taste <code>V</code>) schaltet die Audio-Engine automatisch in den 8-Bit Chiptune-Modus.',
    'portal.lab.c4.li2': '<b>NES- & C64-Klangcharakter:</b> Reine Rechteckwellen (<code>square</code>), angehobene Filterfrequenzen und <b>40-Hz-Arpeggio-Flutter</b> für gehaltene Akkorde.',
    'portal.lab.c4.li3': '<b>Manuelle Kontrolle:</b> Jederzeit auch im Pixel-Modus über den Player-Button <code>[ 👾 8-Bit: AN/AUS ]</code> umschaltbar.'
  });

  /* ---------- M: Sound Lab (EN) ---------- */
  I18N.add('en', {
    'portal.lab.h2': '🎵 Strudel Core, SGC-AMP v2.80 & ReBirth-338 Sound Studio',
    'portal.lab.intro': 'The sound engine of SGC Command is based on state-of-the-art algorithmic live pattern synthesis in the spirit of <b>Strudel</b> and <b>TidalCycles</b>, combined with a retro Winamp player, a ReBirth RB-338 synthesizer rack with Roland soundbanks and a Strudel.cc live-code interface.',
    'portal.lab.c1.h3': '🪖 New Remixes: C&C Hell March & Lo-Fi Chillhop',
    'portal.lab.c1.p': 'The Stargate soundtrack was extended by two new handcrafted Strudel remixes:',
    'portal.lab.c1.li1': '<b>🪖 Stargate × C&C Hell March Remix:</b> 132 BPM, Frank Klepacki industrial vibe, driving Roland TR-909 kick, distorted E-bass chug, cutting brass fanfare for dramatic ground battles and boss fights.',
    'portal.lab.c1.li2': '<b>☕ Stargate × Midnight Lo-Fi Chillhop Remix:</b> 84 BPM, relaxed half-time beats, Rhodes E-piano with tape saturation, soft flute and subtle vinyl crackle for base building and research.',
    'portal.lab.c2.h3': '🎛 ReBirth RB-338 Rack & Roland Soundbanks',
    'portal.lab.c2.p': 'Inspired by the legendary Propellerhead ReBirth RB-338 software:',
    'portal.lab.c2.li1': '<b>TB-303 Acid Bass Rack:</b> Soundbanks for <code>303 Saw</code>, <code>303 Sq</code>, <code>SH-101</code>, <code>Sub</code>, <code>Slap</code>, <code>8-Bit</code> and <code>Reese</code>. Knobs for cutoff, resonance, env mod, decay, distortion and tune.',
    'portal.lab.c2.li2': '<b>Roland Drum Machine:</b> 1-click soundbank switcher for <b>Kick</b> (<code>TR-909</code>, <code>TR-808</code>, <code>TR-707</code>, <code>LinnDrum</code>, <code>8-Bit</code>, <code>Acoustic</code>, <code>Acid</code>) and <b>Hi-Hat</b> (<code>TR-909</code>, <code>TR-808</code>, <code>TR-707</code>, <code>LinnDrum</code>, <code>8-Bit</code>, <code>Noise Sweep</code>).',
    'portal.lab.c2.li3': '<b>Hot Injection into the Code:</b> Button <code>[ ✍ APPLY SOUNDBANKS ]</code> transfers the selected sounds directly into the code text.',
    'portal.lab.c3.h3': '📻 SGC-AMP v2.80 (Winamp Retro Player)',
    'portal.lab.c3.p': 'Visually and functionally modeled on the legendary Winamp v2:',
    'portal.lab.c3.li1': '<b>Green Phosphor LCD:</b> Marquee scroll text, playtime, BPM, CPS and bitrate.',
    'portal.lab.c3.li2': '<b>Status Badges:</b> Clearly visualized with <code>[ ▶ PLAYING ]</code> (pulsing green), <code>[ ⏸ PAUSED ]</code> (amber) and <code>[ ⏹ STOPPED ]</code> (red).',
    'portal.lab.c3.li3': '<b>Real-Time Oscilloscope / Visualizer:</b> HTML5 canvas taps the full signal via an <code>AnalyserNode</code> – switchable between green phosphor wave and 28-band spectrum analyser.',
    'portal.lab.c3.li4': '<b>Master Volume Slider:</b> Controls the AudioContext master gain with linear-to-exponential scaling and <code>localStorage</code> persistence.',
    'portal.lab.c4.h3': '👾 Automatic 8-Bit Chiptune Mode',
    'portal.lab.c4.p': 'Playfield aesthetic and acoustics interlock seamlessly:',
    'portal.lab.c4.li1': '<b>Coupling to ASCII Look:</b> When switching to 3D-ASCII mode (key <code>V</code>) the audio engine automatically switches to 8-bit chiptune mode.',
    'portal.lab.c4.li2': '<b>NES & C64 Sound Character:</b> Pure square waves (<code>square</code>), raised filter frequencies and <b>40 Hz arpeggio flutter</b> for sustained chords.',
    'portal.lab.c4.li3': '<b>Manual Control:</b> Anytime, also in pixel mode, via the player button <code>[ 👾 8-Bit: ON/OFF ]</code>.'
  });

  /* ---------- N: Projektstudie (DE, Kopf + Tabelle) ---------- */
  I18N.add('de', {
    'portal.study.tag': 'Projektstudie · Multi-Agent Pair Programming',
    'portal.study.faculty': 'Fachbereich Humanwissenschaften & Informatik',
    'portal.study.subtitle': 'Ein iterativer Software-Engineering-Feldversuch am Beispiel von SGC Command v0.35',
    'portal.study.summary': '<b>Zusammenfassung (Abstract):</b> Die vorliegende Untersuchung evaluiert die Fähigkeiten, Robustheit und Schnittstellen-Disziplin moderner LLM-Agenten (Gemini 4 Argon, Claude Opus 5.5, Gemini 3.8 Flash, Qwen 3.8 / 3.5) bei der iterativen Konstruktion einer retro-futuristischen Spielarchitektur ohne externe Bundler. Am Praxisbeispiel wurden 2:1 isometrische Voxel-Projektionen, CP437/ASCII-3D-Rendering, eine MIDI-zu-Strudel-Transpiler-Bridge, der retro Winamp-Player <code>SGC-AMP v2.80</code> mit Echtzeit-Oszilloskop, automatische 8-Bit-Chiptune-Akustik, persistente planetare Kolonien (Civ / SimCity / Total War Rome), audio-reaktives Spielfeld-Tanzen und Gamepad-Dual-Rumble-Haptik erfolgreich koordiniert.',
    'portal.study.h2.1': '1. Beteiligte Modell-Schichten & Meilensteine',
    'portal.study.th.1': 'Schicht',
    'portal.study.th.2': 'Modell',
    'portal.study.th.3': 'Kernbeiträge & Meilensteine',
    'portal.study.th.4': 'Architektonische Herausforderung',
    'portal.study.r1.s': 'Schicht 1',
    'portal.study.r1.c': 'Konzeption der 2:1 Isometrie, Diamant-Picking, Obelisk.js Geometrie-Integration, initiales CP437/ASCII-Rendering, Lizenz-Audit.',
    'portal.study.r1.h': 'Verzicht auf externe Bundler; Standalone-Kompilierung im Browser.',
    'portal.study.r2.s': 'Schicht 2',
    'portal.study.r2.c': 'Engine-Stabilisierung, prozedurale WebAudio-Sample-Synthese, Inventar & Waffenkammer-Crafting, Hammonds Klemmbrett.',
    'portal.study.r2.h': 'Etablierung des headless Test-Harnischs (<code>test-browser.js</code>).',
    'portal.study.r3.s': 'Schicht 3',
    'portal.study.r3.c': 'Standard-MIDI-Parser, Krumhansl Key-Finder, Stargate Theme × Switch Angel Remix, SongGen-Algorithmus, Koloniebau (<code>S.colonies</code>), Audio-Tanz, Gamepad-Rumble, Tastenbelegungs-Modal, <b>Winamp-Style SGC-AMP v2.80 Player</b> mit Live-Oszilloskop, C&C Hell March und Lo-Fi Remixes, automatischer <b>8-Bit Chiptune-Modus</b> gekoppelt an ASCII-3D, AST-Normalisierung für Switch-Angel-Tracks, Flexbox-Combat-UI-Fix, Master-Volume-Routing, Bereinigung von Großdateien, 209 von 209 Tests grün.',
    'portal.study.r3.h': 'Integration heterogener Strudel-Tracks, Iframe-Docking ohne Viewport-Clipping, 100% Pass in Test-Suite.',
    'portal.study.r4.s': 'Schicht 4',
    'portal.study.r4.c': 'Krankenstation (Ebene 21, Dr. Janet Fraiser & Carolyn Lam), 5 Behandlungswege mit Heilungs-Loop, Downed-Evakuierung & Notfallabzug, SGC-Inzidentsystem (<code>SGC_INCIDENTS</code>), SGC Tactical Level Editor.',
    'portal.study.r4.h': 'Feature-Dichte unter geschlossenem Day-Loop; Test-Suite auf 209 Prüfungen erweitert.',
    'portal.study.r5.s': 'Schicht 5 (Aktuell)',
    'portal.study.r5.c': 'Studien-Revision (Paper in English), Authorship-Korrektur (obelisk.js → Max Huang / nosir), Versions- & Test-Zahlen, finaler Release v0.29.',
    'portal.study.r5.h': 'Authorship unter Modell-Identitäts-Ungewissheit (Studie, Abschnitt 6.1).',
    'portal.study.r5.model': '<b>Qwen 3.8 27b</b> (Uni-gehostet via virtUOS Kiwi)'
  });

  /* ---------- N: Project Study (EN, head + table) ---------- */
  I18N.add('en', {
    'portal.study.tag': 'Project Study · Multi-Agent Pair Programming',
    'portal.study.faculty': 'Department of Humanities & Computer Science',
    'portal.study.subtitle': 'An iterative software-engineering field trial using SGC Command v0.35 as a case study',
    'portal.study.summary': '<b>Summary (Abstract):</b> This study evaluates the capabilities, robustness and interface discipline of modern LLM agents (Gemini 4 Argon, Claude Opus 5.5, Gemini 3.8 Flash, Qwen 3.8 / 3.5) in the iterative construction of a retro-futuristic game architecture without external bundlers. In the practice example, 2:1 isometric voxel projection, CP437/ASCII-3D rendering, a MIDI-to-Strudel transpiler bridge, the retro Winamp player <code>SGC-AMP v2.80</code> with real-time oscilloscope, automatic 8-bit chiptune acoustics, persistent planetary colonies (Civ / SimCity / Total War Rome), audio-reactive playfield dancing and gamepad dual-rumble haptics were successfully coordinated.',
    'portal.study.h2.1': '1. Involved Model Layers & Milestones',
    'portal.study.th.1': 'Layer',
    'portal.study.th.2': 'Model',
    'portal.study.th.3': 'Core Contributions & Milestones',
    'portal.study.th.4': 'Architectural Challenge',
    'portal.study.r1.s': 'Layer 1',
    'portal.study.r1.c': 'Concept of the 2:1 isometric, diamond picking, obelisk.js geometry integration, initial CP437/ASCII rendering, license audit.',
    'portal.study.r1.h': 'Waiving external bundlers; standalone compilation in the browser.',
    'portal.study.r2.s': 'Layer 2',
    'portal.study.r2.c': 'Engine stabilization, procedural WebAudio sample synthesis, inventory & armory crafting, Hammond\'s clipboard.',
    'portal.study.r2.h': 'Establishment of the headless test harness (<code>test-browser.js</code>).',
    'portal.study.r3.s': 'Layer 3',
    'portal.study.r3.c': 'Standard MIDI parser, Krumhansl key finder, Stargate Theme × Switch Angel remix, SongGen algorithm, colony building (<code>S.colonies</code>), audio dance, gamepad rumble, keybind modal, <b>Winamp-style SGC-AMP v2.80 player</b> with live oscilloscope, C&C Hell March and Lo-Fi remixes, automatic <b>8-bit chiptune mode</b> coupled to ASCII-3D, AST normalization for Switch Angel tracks, flexbox combat-UI fix, master volume routing, large-file cleanup, 209 of 209 tests green.',
    'portal.study.r3.h': 'Integration of heterogeneous Strudel tracks, iframe docking without viewport clipping, 100% pass in the test suite.',
    'portal.study.r4.s': 'Layer 4',
    'portal.study.r4.c': 'Infirmary (Level 21, Dr. Janet Fraiser & Carolyn Lam), 5 treatment paths with healing loop, downed evacuation & emergency withdrawal, SGC incident system (<code>SGC_INCIDENTS</code>), SGC Tactical Level Editor.',
    'portal.study.r4.h': 'Feature density under a closed day loop; test suite extended to 209 checks.',
    'portal.study.r5.s': 'Layer 5 (Current)',
    'portal.study.r5.c': 'Study revision (paper in English), authorship correction (obelisk.js → Max Huang / nosir), version & test figures, final release v0.29.',
    'portal.study.r5.h': 'Authorship under model-identity uncertainty (study, section 6.1).',
    'portal.study.r5.model': '<b>Qwen 3.8 27b</b> (university-hosted via virtUOS Kiwi)'
  });

  /* ---------- N: Projektstudie (DE, Mathematik + Fazit) ---------- */
  I18N.add('de', {
    'portal.study.h2.2': '2. Wichtigste mathematische & algorithmische Innovationen',
    'portal.study.m1.h3': '📐 2:1 Isometrische Projektion & Picking',
    'portal.study.m1.p': 'Umrechnung von Gitter- auf Bildschirmkoordinaten unter Einbezug von Höhensäulen (<code>baseZ</code> + <code>blockH</code>):',
    'portal.study.m1.pre': 'x_screen = W/2 + (x - y) * (tw / 2)\ny_screen = H/2 + (x + y) * (th / 2) - z * tz',
    'portal.study.m1.note': 'Die analytische Rückprojektion (Ray-to-Diamond Picking) garantiert pixelgenaues Anklicken von Feldern und Einheiten selbst bei 90°-Kameradrehung (<code>Q</code>/<code>E</code>).',
    'portal.study.m2.h3': '🎼 Krumhansl-Schmuckler Tonarterkennung',
    'portal.study.m2.p': 'Deterministische Tonartbestimmung der Stargate-Main-Theme-MIDI-Datei durch Korrelation der Notendauern mit empirischen Dur/Moll-Gewichtungsprofilen:',
    'portal.study.m2.pre': 'Key = argmax_{r, mode} sum_{i=0}^{11} hist[(i+r)%12] * Profile_mode[i]\nErgebnis: G-Dur (Root 7), 165 BPM, 35 Takte, 1.380 Events',
    'portal.study.h2.3': '3. Wissenschaftliches Fazit',
    'portal.study.conclusion': 'Der Versuch belegt, dass deterministische Test-Harnische (<code>node test-browser.js</code> mit aktuell 377 Prüfungen) und strukturierte Übergabe-Dokumente (<code>HANDOFF.md</code>) die kritischen Erfolgsfaktoren für multi-modale LLM-Softwareprojekte darstellen. Da die selbstgemeldete Modell-Identität der Agenten bei Modellwechseln nicht unabhängig verifizierbar ist, bleibt die exakte Code-Authorship je Modell heuristisch (siehe Studie, Abschnitt 6.1). Durch die Zero-Dependency-Architektur bleibt das Projekt zu 100 % wartbar, quelloffen und ohne externe Abhängigkeitsrisiken lokal lauffähig.'
  });

  /* ---------- N: Project Study (EN, math + conclusion) ---------- */
  I18N.add('en', {
    'portal.study.h2.2': '2. Key Mathematical & Algorithmic Innovations',
    'portal.study.m1.h3': '📐 2:1 Isometric Projection & Picking',
    'portal.study.m1.p': 'Conversion from grid to screen coordinates including height columns (<code>baseZ</code> + <code>blockH</code>):',
    'portal.study.m1.pre': 'x_screen = W/2 + (x - y) * (tw / 2)\ny_screen = H/2 + (x + y) * (th / 2) - z * tz',
    'portal.study.m1.note': 'The analytical back-projection (Ray-to-Diamond Picking) guarantees pixel-precise clicking of fields and units even with 90° camera rotation (<code>Q</code>/<code>E</code>).',
    'portal.study.m2.h3': '🎼 Krumhansl-Schmuckler Key Detection',
    'portal.study.m2.p': 'Deterministic key detection of the Stargate main theme MIDI file by correlating note durations with empirical major/minor weighting profiles:',
    'portal.study.m2.pre': 'Key = argmax_{r, mode} sum_{i=0}^{11} hist[(i+r)%12] * Profile_mode[i]\nResult: G Major (Root 7), 165 BPM, 35 bars, 1,380 events',
    'portal.study.h2.3': '3. Scientific Conclusion',
    'portal.study.conclusion': 'The experiment demonstrates that deterministic test harnesses (<code>node test-browser.js</code> with currently 377 checks) and structured handoff documents (<code>HANDOFF.md</code>) are the critical success factors for multi-modal LLM software projects. Since the self-reported model identity of the agents at model switches cannot be independently verified, the exact code authorship per model remains heuristic (see study, section 6.1). Thanks to the zero-dependency architecture, the project remains 100% maintainable, open source and locally runnable without external dependency risks.'
  });

  /* ---------- O: Level-Editor-Panel ---------- */
  I18N.add('de', {
    'portal.editor.p': 'Ein vollwertiges, browserbasiertes Autorenwerkzeug zur Erstellung, visuellen Prüfung und dynamischen Skriptierung taktischer Gefechtskarten nach X-COM- und Jagged-Alliance-Prinzipien (Deckungs-Klassen, breite Boulevards, Flankenwege, Missions-Spawns und Beute-Caches).',
    'portal.editor.dual': '📐 Dual-Mode: 2:1 Isometrie & 2D-Raster',
    'portal.editor.desc': 'Unterstützt Pinsel-Malen, Flutfüllen, Höhenstufen (+1/-1 Z), Deckungs-Hierarchie (Halb-/Voll-Deckung), Stargate-Platzierung, taktische Beute-Kisten und sofortigen Export als <code>MAPS[]</code>-JavaScript-Array.',
    'portal.editor.open': '🚀 Level-Editor im Vollbild öffnen'
  });
  I18N.add('en', {
    'portal.editor.p': 'A full browser-based authoring tool for creating, visually reviewing and dynamically scripting tactical battle maps following X-COM and Jagged Alliance principles (cover classes, wide boulevards, flank routes, mission spawns and loot caches).',
    'portal.editor.dual': '📐 Dual-Mode: 2:1 Isometric & 2D Grid',
    'portal.editor.desc': 'Supports brush painting, flood fill, height levels (+1/-1 Z), cover hierarchy (half/full cover), Stargate placement, tactical loot crates and instant export as a <code>MAPS[]</code> JavaScript array.',
    'portal.editor.open': '🚀 Open Level Editor Fullscreen'
  });

  /* ---------- P: Downloads-Panel ---------- */
  I18N.add('de', {
    'portal.dl.h2': '📦 Offline-Paket & Download',
    'portal.dl.p': 'Lade das schlanke, bereinigte Release-Paket herunter. Vollständig offline lauffähig ohne Installation oder Node-Server.',
    'portal.dl.meta': 'Schlankes Release 0.39 · 80s/90s Hit Jukebox (7 Vault-Tracks) · 3D-WebGL & 9 Sprachen · Doku',
    'portal.dl.btn': '⬇ Release ZIP Herunterladen',
    'portal.dl.h3': 'Installation & Schnellstart',
    'portal.dl.li1': 'ZIP-Archiv in ein beliebiges Verzeichnis entpacken.',
    'portal.dl.li2': '<code>index.html</code> (dieses Portal) oder <code>game/index.html</code> direkt im Browser per Doppelklick öffnen (kein lokaler Webserver nötig).',
    'portal.dl.li3': 'Optional: Lokale Tests mit <code>node test-browser.js</code> ausführen (benötigt lediglich Node.js ohne npm-Pakete).'
  });
  I18N.add('en', {
    'portal.dl.h2': '📦 Offline Package & Download',
    'portal.dl.p': 'Download the lean, cleaned-up release package. Fully runnable offline without installation or a Node server.',
    'portal.dl.meta': 'Lean release 0.39 · 80s/90s hit jukebox (7 vault tracks) · 3D-WebGL & 9 languages · docs',
    'portal.dl.btn': '⬇ Download Release ZIP',
    'portal.dl.h3': 'Installation & Quick Start',
    'portal.dl.li1': 'Extract the ZIP archive into any directory.',
    'portal.dl.li2': 'Open <code>index.html</code> (this portal) or <code>game/index.html</code> directly in the browser by double-clicking (no local web server needed).',
    'portal.dl.li3': 'Optional: run local tests with <code>node test-browser.js</code> (requires only Node.js, no npm packages).'
  });

  /* ---------- Q: Lizenzen & Danksagung ---------- */
  I18N.add('de', {
    'portal.lic.h2': '⚖️ Lizenzen, Danksagungen & Bildquellen',
    'portal.lic.h3.1': 'Projekt-Lizenz',
    'portal.lic.p.1': 'Das Projekt steht unter der <b>GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)</b>. Dies garantiert, dass die originale <code>@strudel/web</code>-Engine und die Switch-Angel-Prebake-Bibliotheken in voller Lizenzkonformität betrieben werden können.',
    'portal.lic.h3.2': 'Danksagung: Switch Angel',
    'portal.lic.p.2': 'Ein besonderer Dank gilt der Live-Coderin <b>Switch Angel</b> für ihre visionären Strudel-Skripte und rhythmischen Pattern. Sämtliche eingebetteten Tracks dienen der Demonstration und Weiterentwicklung der algorithmischen Sound-Engine in einem universitären Forschungskontext.',
    'portal.lic.h3.3': 'Gemeinfreie Weltraum-Bilder (NASA / Public Domain)',
    'portal.lic.p.3': 'Für künftige visuelle Erweiterungen (Abydos-Dünen, Exoplaneten, James Webb Deep Fields, Cassini-Eiswelten) wurden gemeinfreie Aufnahmen der NASA, des JPL und der ESA kuratiert. Details und Verlinkungen finden sich in <code>references/NASA-ASSETS.md</code>.',
    'portal.lic.h3.4': 'Open-Source-Komponenten',
    'portal.lic.li1': '<b>obelisk.js</b> – Isometrisches Pixel-Voxel Rendering (MIT Lizenz)',
    'portal.lic.li2': '<b>asciiid & asciicker</b> – CP437 ASCII-3D Terrain- und Raytracing-Inspirationen (MIT Lizenz)',
    'portal.lic.li3': '<b>Strudel REPL & Superdough</b> – Algorithmische Live-Synthese (AGPLv3)'
  });
  I18N.add('en', {
    'portal.lic.h2': '⚖️ Licenses, Acknowledgments & Image Sources',
    'portal.lic.h3.1': 'Project License',
    'portal.lic.p.1': 'The project is licensed under the <b>GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)</b>. This guarantees that the original <code>@strudel/web</code> engine and the Switch Angel prebake libraries can be operated in full license compliance.',
    'portal.lic.h3.2': 'Acknowledgments: Switch Angel',
    'portal.lic.p.2': 'A special thanks goes to the live coder <b>Switch Angel</b> for her visionary Strudel scripts and rhythmic patterns. All embedded tracks serve the demonstration and further development of the algorithmic sound engine in an academic research context.',
    'portal.lic.h3.3': 'Public Domain Space Images (NASA / Public Domain)',
    'portal.lic.p.3': 'For future visual extensions (Abydos dunes, exoplanets, James Webb deep fields, Cassini ice worlds), public-domain images from NASA, JPL and ESA were curated. Details and links are in <code>references/NASA-ASSETS.md</code>.',
    'portal.lic.h3.4': 'Open Source Components',
    'portal.lic.li1': '<b>obelisk.js</b> – Isometric pixel-voxel rendering (MIT license)',
    'portal.lic.li2': '<b>asciiid & asciicker</b> – CP437 ASCII-3D terrain and raytracing inspirations (MIT license)',
    'portal.lic.li3': '<b>Strudel REPL & Superdough</b> – Algorithmic live synthesis (AGPLv3)'
  });

  /* ---------- S: Gemeinsame Log-Bausteine ---------- */
  I18N.add('de', {
    'portal.logsum': 'Zusammenfassung der Maßnahmen:'
  });
  I18N.add('en', {
    'portal.logsum': 'Summary of measures:'
  });

  /* ---------- R: Footer ---------- */
  I18N.add('de', {
    'portal.footer.1': '◎ STARGATE COMMAND · SGC COMMAND 0.39 · "Blue Monday: Die 80s/90s Hit Jukebox"',
    'portal.footer.2': 'Entwickelt im autonomen Multi-Agenten-Pair-Programming (Gemini 4 Argon · Claude Opus 5.5 · Gemini 3.8 Flash · Qwen 3.8 / 3.5) · Lizenziert unter AGPL-3.0-or-later'
  });
  I18N.add('en', {
    'portal.footer.1': '◎ STARGATE COMMAND · SGC COMMAND 0.39 · "Blue Monday: The 80s/90s Hit Jukebox"',
    'portal.footer.2': 'Developed via autonomous multi-agent pair programming (Gemini 4 Argon · Claude Opus 5.5 · Gemini 3.8 Flash · Qwen 3.8 / 3.5) · Licensed under AGPL-3.0-or-later'
  });

})();
