#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix i18n issues in SGC Command v0.30"""

import re

# Fix ui.js - replace hardcoded event strings with I18N.T() calls
with open('game/ui.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace event strings
replacements = [
    ("'🌀 Incoming Wormhole: Unautorisierte Toraktivierung aus dem Omega-Sektor!'", "I18N.T('game.event.wormhole')"),
    ("'📡 Tok'ra Alert: Geheime Nachricht durch das Sternentor übermittelt!'", "I18N.T('game.event.tokra')"),
    ("'⚠️ Gate Alarm: Chevron 5 hat sich ohne Befehl entsperrt!'", "I18N.T('game.event.alarm')"),
    ("'🌌 Stargate Pulse: Energieanomalie im Naquadah-Kern detected!'", "I18N.T('game.event.pulse')"),
    ("'🛸 Alien Contact: Ungewöhnliches Signal von P3X-888!'", "I18N.T('game.event.contact')"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Add doDay() call before events
old_code = "if(typeof SFX!=='undefined')SFX.music(UI.tab==='map'?'map':'base');\n\t\n\t// Zufälliges Stargate-Event"
new_code = "// Zuerst den Tag beenden (Ressourcen, Heilung, etc.)\n\tif(typeof doDay==='function')doDay();\n\t// Dann zufälliges Stargate-Event"
content = content.replace(old_code, new_code)

with open('game/ui.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed ui.js event strings")

# Fix i18n-game.js - add missing keys
with open('game/i18n-game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the location to insert new keys (after game.dyn.btn.funeral_play)
insert_marker = "'game.dyn.btn.funeral_play': '🕊 Trauermusik abspielen',"
if insert_marker in content:
    new_keys = """     'game.medbay.title': '🏥 Krankenstation · Ebene 21',
     'game.medbay.chief': 'CHEFÄRZTIN DR. JANET FRAISER · CHEYENNE MOUNTAIN KOMPLEX',
     'game.medbay.status': 'BIO-TELEMETRIE: ♥ 72 BPM · NORMALER SINUSRHYTHMUS · SCHWINGUNG STABIL',
     'game.medbay.healrate': 'Stations-Heilung: <b style="color:#4ade80">+{0} HP/Tag</b> {1}',
     'game.medbay.noPatients': '✔ Keine Patienten auf Station',
     'game.medbay.allhealthy': 'Alle Teammitglieder von SG-1 und den Unterstützungseinheiten sind voll einsatzfähig und haben 100% HP.',
     'game.medbay.patients': '🩺 Patientenakte & Stationäre Belegung ({0} Verwundete)',
     'game.medbay.inbed': '🛏 Im Krankenbett',
     'game.medbay.outpatient': 'Ambulant',
     'game.medbay.health': 'Gesundheit (HP):',
     'game.medbay.injuries': 'Verletzungen:',
     'game.medbay.fatigue': 'Erschöpfung:',
     'game.medbay.morale': 'Moral:',
     'game.medbay.btn.treat_all': '💊 Alle Verwundeten erstversorgen (-15 ✚ pro Soldat)',
     'game.medbay.btn.incident': '☣ Stargate-Medizinvorfall simulieren (Broca / Symbiont / Heilwürfel)',
     'game.medbay.btn.back': '🏢 Zur Basisansicht (Ebene 21 ausbauen)',
     'game.research.title': '🔬 SGC Forschungslabor',
     'game.research.subtitle': 'CHEFWISSENSCHAFTLERIN DR. SARAH CARTER · NAQUADAH-ANALYSE & TECHNOLOGIE-ENTWICKLUNG',
     'game.research.points': 'Forschungspunkte: <b style="color:#38bdf8">{0}</b>',
     'game.research.done': 'Fertiggestellt',
     'game.research.locked': '🔒 Erfordert: {0}',
     'game.research.btn.research': '🔬 Forschen ({0} RP)',
     'game.research.btn.complete': '✔ Fertiggestellt',
     'game.research.btn.next': 'Nächste Technologie',
     'game.research.cat.weapons': '🔫 Waffentechnologie',
     'game.research.cat.defense': '🛡 Verteidigung & Schilde',
     'game.research.cat.space': '🚀 Raumfahrt & Antriebe',
     'game.research.cat.medical': '🏥 Medizin & Biotechnologie',
     'game.research.cat.comms': '📡 Kommunikation & Sensorik',
     'game.day.next': 'Tag abschließen & Nächster Tag ›',
     'game.day.report': 'SGC Tagesbericht · Tag {0}',
     'game.day.chapter': 'Kapitel',
     'game.day.leadership': 'Leitung:',
     'game.day.status_ready': 'TOR: BEREITSCHAFT',
     'game.day.achievements': 'ERFOLGE',
     'game.day.enemies': 'FEINDE BESIEGT',
     'game.day.discovered': 'ERFORSCHT',
     'game.day.personnel': 'PERSONAL',
     'game.day.colonies': 'AUSSENPOSTEN',
     'game.day.log': '📋 TAGES-PROTOKOLL & ERTRÄGE',
     'game.day.story': '☕ SGC LOGBUCH-NOTIZ & BEGEBENHEIT',
     'game.day.quiet': 'Ein ruhiger Tag im Cheyenne Mountain Komplex.',
     'game.event.wormhole': '🌀 Incoming Wormhole: Unautorisierte Toraktivierung aus dem Omega-Sektor!',
     'game.event.tokra': '📡 Tok\\'ra Alert: Geheime Nachricht durch das Sternentor übermittelt!',
     'game.event.alarm': '⚠️ Gate Alarm: Chevron 5 hat sich ohne Befehl entsperrt!',
     'game.event.pulse': '🌌 Stargate Pulse: Energieanomalie im Naquadah-Kern detected!',
     'game.event.contact': '🛸 Alien Contact: Ungewöhnliches Signal von P3X-888!',
"""
    content = content.replace(insert_marker, insert_marker + "\n" + new_keys)
    with open('game/i18n-game.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Added missing i18n keys to i18n-game.js")
else:
    print("✗ Could not find insertion point in i18n-game.js")

# Fix Tok'ra escape in i18n-game.js
with open('game/i18n-game.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'game.event.tokra': '📡 Tok'ra Alert:",
    "'game.event.tokra': '📡 Tok\\'ra Alert:"
)

with open('game/i18n-game.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed Tok'ra escape sequence")
print("✓ Done!")

