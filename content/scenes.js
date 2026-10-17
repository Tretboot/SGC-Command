'use strict';

const MISSION_BRIEFINGS={
 '1-1':{
  objective:'Chulak · Kontakt herstellen und Teal’c aus der Gefangenschaft befreien.',
  lines:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'Ein Aufklärungsteam hat auf Chulak eine Gruppe Gefangener entdeckt. Einer von ihnen kennt die Abläufe der Jaffa aus nächster Nähe.'},
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Das Gate-Signal ist stabil. Vor Ort sollten wir die Ruinen als Deckung nutzen und den Rückweg freihalten.'},
   {speaker:"Jack O'Neill",role:'Teamführung · SG-1',portraitId:0,text:'Verstanden. Wir holen die Gefangenen heraus und finden unterwegs heraus, wem wir trauen können.'}
  ]
 },
 '1-2':{
  objective:'Abydos · Friedlichen Erstkontakt herstellen und Vertrauen gewinnen.',
  lines:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'Ein Dorf auf Abydos hat unser Aufklärungsteam entdeckt. Es gibt keinen Hinweis auf eine unmittelbare Bedrohung. Ihr Auftrag ist Kontakt, nicht Konfrontation.'},
   {speaker:'Daniel Jackson',role:'Archäologe · SG-1',portraitId:2,text:'Ihre Sprache und Bräuche ähneln denen anderer Siedlungen, aber wir sollten nichts voraussetzen. Ich bitte um die erste Audienz.'},
   {speaker:"Jack O'Neill",role:'Teamführung · SG-1',portraitId:0,text:'Waffen gesichert, Daniel spricht zuerst. Falls jemand fragt: Wir sind Reisende mit sehr ungewöhnlichem Gepäck.'}
  ]
 },
 '2-2':{
  objective:'Serenno · Friedlichen Kontakt mit der Alpha-Gemeinschaft herstellen.',
  lines:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'Die Bewohner der Alpha-Kolonie haben unser Team bemerkt. Es gibt keine feindlichen Signaturen. Hören Sie sich ihre Anliegen an und bieten Sie Zusammenarbeit an.'},
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Die Kolonie betreibt ein eigenes Labor. Ein Austausch könnte beiden Seiten helfen, aber die Entscheidung liegt bei ihnen.'},
   {speaker:"Jack O'Neill",role:'Teamführung · SG-1',portraitId:0,text:'Wir lassen die Waffen gesichert und die Erwartungen niedrig. Ein guter Anfang wäre, nicht gleich etwas kaputtzumachen.'}
  ]
 },
 '2-6':{
  objective:'P5C-353 · Khepras Kommandozentrum ausschalten.',
  lines:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'Unsere Quellen melden, dass Khepra die umliegenden Siedlungen unter seine Kontrolle gebracht hat. Wir beenden die Überwachung und sichern die Anlage.'},
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Die Energiequelle ist ungewöhnlich stark. Sobald wir in Reichweite sind, kann ich den Kontrollknoten lokalisieren.'}
  ]
 },
 '3-5':{
  objective:'Apophis’ Flaggschiff · Das Kommandozentrum erreichen und den Angriff stoppen.',
  lines:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'Das feindliche Schiff steuert auf besiedeltes Gebiet zu. Ihr Auftrag ist, seine Führung zu unterbrechen und den Weg für eine Evakuierung zu öffnen.'},
   {speaker:'Teal’c',role:'Krieger · SG-1',portraitId:3,text:'Die Wachen werden den Zugang verteidigen. Haltet zusammen; ein einzelner Vorstoß wird sie nicht aufhalten.'}
  ]
 },
 '4-5':{
  objective:'Nexus · Die Replikator-Königin aufspüren und ihren Schwarm stoppen.',
  lines:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'Die Ausbreitung hat die Außenposten erreicht. Wir brauchen eine sichere Route zur Quelle, bevor weitere Einheiten verloren gehen.'},
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Der Schwarm reagiert auf Energie. Begrenzte Feuerstöße und Deckung geben uns die beste Chance, nahe genug heranzukommen.'}
  ]
 },
 '5-6':{
  objective:'Erde · Das SGC erreichen und den letzten Angriff abwehren.',
  lines:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'Das Gate ist wieder offen, aber die Verteidigung hält nicht lange. Bringt das Team nach Hause und schützt den Gateraum.'},
   {speaker:"Jack O'Neill",role:'Teamführung · SG-1',portraitId:0,text:'Letzter Einsatz. Keine Abkürzungen, keine Alleingänge. Wir gehen gemeinsam rein und gemeinsam wieder raus.'}
  ]
 }
};

const MISSION_SCENES={
 '1-1':{
  arrival:[
   {speaker:'Daniel Jackson',role:'Archäologe · SG-1',portraitId:2,text:'Diese Markierungen erzählen von Familien, nicht von Armeen. Wenn Teal’c uns helfen will, sollten wir zuerst die Gefangenen finden.'},
   {speaker:'Teal’c',role:'Gefangener Jaffa',portraitId:3,text:'Ihr seid weit von eurer Welt entfernt. Zeigt mir, dass ihr gekommen seid, um Menschen zu retten.'}
  ],
  firstKill:[
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Wache ausgeschaltet. Die Patrouille wird den Ausfall bemerken – wir sollten den Weg zu den Zellen sichern.'}
  ]
 },
 '1-2':{
  arrival:[
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Keine bewaffneten Signaturen in Reichweite. Das ist wohl zum ersten Mal heute eine gute Nachricht.'}
  ],
  contact:[
   {speaker:'Daniel Jackson',role:'Archäologe · SG-1',portraitId:2,text:'Wir kommen in Frieden und möchten verstehen, wer hier lebt. Das Sternentor verbindet unsere Welten, aber wir entscheiden selbst, was diese Verbindung bedeutet.'},
   {speaker:'Siedlungssprecher',role:'Stimme des Dorfes',portraitId:4,text:'Ihr seid durch den alten Ring gekommen und habt eure Waffen gesenkt. Setzt euch zu uns. Wir werden einander zuhören, bevor wir über Fremde urteilen.'},
   {speaker:"Jack O'Neill",role:'Teamführung · SG-1',portraitId:0,text:'Abgemacht. Wir teilen Informationen, keine Überraschungen. Daniel, ich glaube, das zählt als guter erster Tag.'}
  ]
 },
 '2-2':{
  arrival:[
   {speaker:'Daniel Jackson',role:'Archäologe · SG-1',portraitId:2,text:'Die Kolonie hat sich ihren Alltag selbst aufgebaut. Wir sollten erklären, woher wir kommen, und fragen, was sie brauchen.'}
  ],
  contact:[
   {speaker:'Daniel Jackson',role:'Archäologe · SG-1',portraitId:2,text:'Wir reisen durch das Tor und suchen keine Herrschaft über andere Welten. Wenn ihr möchtet, können wir Wissen und Hilfe anbieten, ohne euch etwas vorzuschreiben.'},
   {speaker:'Koloniegesandte',role:'Vertretung der Alpha-Gemeinschaft',portraitId:13,text:'Wir werden selbst entscheiden, wie viel wir teilen. Dass ihr zuerst gefragt habt, ist ein guter Anfang. Lasst uns weiterreden.'},
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Einverstanden. Wir stellen unsere Forschung offen vor und halten uns an die Regeln der Kolonie.'}
  ]
 },
 '2-6':{
  arrival:[
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Ich messe mehrere Energiequellen. Eine davon passt zu einem zentralen Steuersystem – wir müssen näher heran.'}
  ],
  firstKill:[
   {speaker:'Jack O’Neill',role:'Teamführung · SG-1',portraitId:0,text:'Der Alarm ist jetzt sicher unterwegs. Wir bleiben in Bewegung und geben ihnen keine Zeit, sich neu zu formieren.'}
  ]
 },
 '3-5':{
  arrival:[
   {speaker:'Teal’c',role:'Krieger · SG-1',portraitId:3,text:'Ich kenne diese Formation. Die Wachen werden den Korridor nicht verlassen. Wir müssen sie aus ihrer Position zwingen.'}
  ],
  firstKill:[
   {speaker:'Daniel Jackson',role:'Archäologe · SG-1',portraitId:2,text:'Die Anzeigen zeigen eine Kursänderung. Wenn wir das Kommando unterbrechen, können die Bewohner entkommen.'}
  ]
 },
 '4-5':{
  arrival:[
   {speaker:'Samantha Carter',role:'Wissenschaftliche Offizierin',portraitId:1,text:'Der Schwarm verdichtet sich hinter den Mauern. Die Königin dürfte im Zentrum sein; offene Flächen sollten wir vermeiden.'}
  ],
  firstKill:[
   {speaker:'Jack O’Neill',role:'Teamführung · SG-1',portraitId:0,text:'Ziel bestätigt. Deckung halten und zusammenbleiben – wir arbeiten uns Stück für Stück vor.'}
  ]
 },
 '5-6':{
  arrival:[
   {speaker:'General Hammond',role:'Einsatzleitung · SGC',portraitId:12,text:'SG-1, wir haben euch. Der Gateraum ist noch nicht sicher. Bringt die Eindringlinge zum Rückzug und haltet die Verbindung offen.'}
  ],
  firstKill:[
   {speaker:'Teal’c',role:'Krieger · SG-1',portraitId:3,text:'Der Druck lässt nach. Sichert den Raum, damit das Personal des SGC zurückkehren kann.'}
  ]
 }
};
