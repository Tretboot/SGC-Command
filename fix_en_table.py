#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add EN translations to i18n-game.js"""

# Read the file
with open('game/i18n-game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the EN section start (after I18N.add('en', {)
en_marker = "I18N.add('en', {"
en_start = content.find(en_marker)

if en_start == -1:
    print("✗ Could not find EN section")
    exit(1)

# Find the end of the EN section (the closing }); before the next I18N.add)
# We need to find the first '});' after the EN marker
en_section_end = content.find("  });\n", en_start + len(en_marker))

if en_section_end == -1:
    print("✗ Could not find end of EN section")
    exit(1)

# New EN translations
en_translations = """     /* Krankenstation */
     'game.medbay.title': '🏥 Medbay · Level 21',
     'game.medbay.chief': 'CHIEF MEDICAL OFFICER DR. JANET FRAISER · CHEYENNE MOUNTAIN COMPLEX',
     'game.medbay.status': 'BIO-TELEMETRY: ♥ 72 BPM · NORMAL SINUS RHYTHM · SIGNAL STABLE',
     'game.medbay.healrate': 'Station Healing: <b style="color:#4ade80">+{0} HP/Day</b> {1}',
     'game.medbay.noPatients': '✔ No Patients on Ward',
     'game.medbay.allhealthy': 'All SG-1 and support team members are fully operational with 100% HP.',
     'game.medbay.patients': '🩺 Patient Records & Ward Occupancy ({0} Wounded)',
     'game.medbay.inbed': '🛏 In Hospital Bed',
     'game.medbay.outpatient': 'Outpatient',
     'game.medbay.health': 'Health (HP):',
     'game.medbay.injuries': 'Injuries:',
     'game.medbay.fatigue': 'Fatigue:',
     'game.medbay.morale': 'Morale:',
     'game.medbay.btn.treat_all': '💊 Treat All Wounded (-15 ✚ per Soldier)',
     'game.medbay.btn.incident': '☣ Simulate Stargate Medical Incident (Broca / Symbiote / Healing Device)',
     'game.medbay.btn.back': '🏢 Return to Base View (Expand Level 21)',
     /* Forschung */
     'game.research.title': '🔬 SGC Research Laboratory',
     'game.research.subtitle': 'CHIEF SCIENTIST DR. SARAH CARTER · NAQUADAH ANALYSIS & TECHNOLOGY DEVELOPMENT',
     'game.research.points': 'Research Points: <b style="color:#38bdf8">{0}</b>',
     'game.research.done': 'Completed',
     'game.research.locked': '🔒 Requires: {0}',
     'game.research.btn.research': '🔬 Research ({0} RP)',
     'game.research.btn.complete': '✔ Completed',
     'game.research.btn.next': 'Next Technology',
     'game.research.cat.weapons': '🔫 Weapon Technology',
     'game.research.cat.defense': '🛡 Defense & Shields',
     'game.research.cat.space': '🚀 Spaceflight & Propulsion',
     'game.research.cat.medical': '🏥 Medicine & Biotechnology',
     'game.research.cat.comms': '📡 Communication & Sensors',
     /* Tag-Loop & Events */
     'game.day.next': 'End Day & Start Next Day ›',
     'game.day.report': 'SGC Daily Report · Day {0}',
     'game.day.chapter': 'Chapter',
     'game.day.leadership': 'Leadership:',
     'game.day.status_ready': 'GATE: READY',
     'game.day.achievements': 'ACHIEVEMENTS',
     'game.day.enemies': 'ENEMIES DEFEATED',
     'game.day.discovered': 'DISCOVERED',
     'game.day.personnel': 'PERSONNEL',
     'game.day.colonies': 'OUTPOSTS',
     'game.day.log': '📋 DAILY LOG & REWARDS',
     'game.day.story': '☕ SGC LOGBOOK NOTE & INCIDENT',
     'game.day.quiet': 'A quiet day at the Cheyenne Mountain Complex.',
     /* Stargate Events */
     'game.event.wormhole': '🌀 Incoming Wormhole: Unauthorized Gate Activation from Omega Sector!',
     'game.event.tokra': '📡 Tok\'ra Alert: Secret Message Transmitted Through the Stargate!',
     'game.event.alarm': '⚠️ Gate Alarm: Chevron 5 Unlocked Without Authorization!',
     'game.event.pulse': '🌌 Stargate Pulse: Energy Anomaly Detected in Naquadah Core!',
     'game.event.contact': '🛸 Alien Contact: Unusual Signal from P3X-888!',

"""

# Insert the new translations before the closing });
insert_pos = en_section_end
content = content[:insert_pos] + en_translations + content[insert_pos:]

# Write back
with open('game/i18n-game.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added EN translations to i18n-game.js")
print("✓ Done!")
