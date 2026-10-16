'use strict';
// ===================== SGC COMMAND v2 – Intros & Flavor =====================
// CHAPTER_INTROS: 5 Kapitel-Einleitungen (Hammond-Stil)
// BOSS_INTROS: 5 Boss-Intros (Drohung + Kontext)
// MISSION_FLAVOR: 27 Missions-Flavor-Texte (max 20 Wörter, trockener Humor)

const CHAPTER_INTROS=[
 {chapter:0,title:'Kapitel 1 – Erste Schritte',
  text:'Der Berg ist neu. Die Formulare sind alt. Das Gate funktioniert – mostly. SG-1 ist da. Die Jaffa kommen. Hammond isst ein Sandwich. Es wird nie benannt. Willkommen, Kommandant. Der Kaffee ist noch schlecht.'},
 {chapter:1,title:'Kapitel 2 – Das Netz wächst',
  text:'Das Telefon hat jetzt mehrere Leitungen. Die Gates ticken. Die Formulare stapeln sich. Hammond hat jetzt zwei Sandwiches. Es werden nie benannt. Das Netz wächst. Die Formulare wachsen schneller.'},
 {chapter:2,title:'Kapitel 3 – Bedrohungen',
  text:'Jetzt hat jeder die Telefonnummer. Die Goa\'uld wissen, wo der Berg ist. Die Replikator-Königin vermehrt sich in der Kantine. Hammond isst ein Sandwich. Es wird nie benannt. Aber es ist weniger.'},
 {chapter:3,title:'Kapitel 4 – Replikatoren',
  text:'Strand. Sand. Drohnen. Das Geräusch. Die Königin ist in der Kantine. Sie hat die Wackelpudding-Formel. Hammond isst kein Sandwich. Es ist weg. Die Formulare sind nass.'},
 {chapter:4,title:'Kapitel 5 – Das Ende',
  text:'Neue Götter mit Marketingplan. Die Ori haben eine Website. Die Goa\'uld haben eine Flotte. Hammond isst ein Sandwich. Es wird nie benannt. Aber es ist das letzte. Danach: Kaffee. Der ist auch schlecht.'}
];

const BOSS_INTROS=[
 {id:'2-6',boss:'Khepra',name:'Khepra – Der Pharao',
  text:'Khepra sitzt im Kontrollraum. Er hat einen Thron. Der Thron ist aus Steinen. Die Steine sind aus dem Berg. "Du bist in meinem Haus", sagt er. "Du wirst mein Gast sein." Er lacht. Der Lacht ist nicht lustig. "Du wirst mein Sklave sein."'},
 {id:'3-5',boss:'Apophis',name:'Apophis – Der Gott',
  text:'Apophis steht im Gateraum. Er hat eine Flotte. Die Flotte hat Schiffe. Die Schiffe haben Waffen. "Ich bin ein Gott", sagt er. "Du bist ein Insekt." Er lacht. Der Lacht ist nicht lustig. "Du wirst sterben."'},
 {id:'4-5',boss:'queen',name:'Die Königin',
  text:'Die Königin ist in der Kantine. Sie hat die Wackelpudding-Formel. Sie hat 1000 Drohnen. "Du bist in meinem Haus", sagt sie. "Du wirst mein Material sein." Sie lacht. Der Lacht ist ein Geräusch. "Du wirst mich füttern."'},
 {id:'5-1',boss:'lords',name:'Drei Lords',
  text:'Drei Lords stehen im Kontrollraum. Anubis. Amonet. Heru-ur. "Wir sind Götter", sagen sie. "Du bist ein Insekt." Sie lachen. Der Lacht ist nicht lustig. "Du wirst sterben." Sie sagen es gleichzeitig. Es klingt wie ein Formular.'},
 {id:'5-4',boss:'Amonet',name:'Amonet – Die Eiserne',
  text:'Amonet steht im Gateraum. Sie hat eine Flotte. Die Flotte hat Eis. "Ich bin eine Göttin", sagt sie. "Du bist ein Insekt." Sie lacht. Der Lacht ist kalt. "Du wirst einfrieren."'}
];

const MISSION_FLAVOR={
 '1-1':'Chulak. Drei Entscheidungen. Eine davon verändert SG-1 für immer. – Hammond',
 '1-2':'Abydos. Tempel. Stabwaffe. "Zuerst Kaffee, dann Planet." – O\'Neill',
 '1-3':'Zwölf Jaffa. Zehn Runden. "Halte die Position." – Hammond',
 '1-4':'Steuereintreiber. Stadt. "Sie wollen 40.000 Credits." – Vala',
 '1-5':'Thor. Orbit. 38 Minuten. "Beschwerden bitte schriftlich." – Thor',
 '2-1':'Labor. Notizen. "Vater hatte recht." – Carter',
 '2-2':'Alpha. Brack. "Kontakt, Bündnis, Maut." – Brack',
 '2-3':'Chain-Dial. Verteidigung. "Das Netz wächst." – Hammond',
 '2-4':'Möbius. Lens. "Das Auge sieht." – Möbius-Prinzipal',
 '2-5':'New Ground. Maut. "Zwei-Schicht-Army." – New Ground',
 '2-6':'Khepra. Pharao. "Du bist in meinem Haus." – Khepra',
 '3-1':'P5U-666. Kalender. "Gärten des Pharao." – Jackson',
 '3-2':'Ennui. Prinz. "Sohn des Pharao." – Kaelo',
 '3-3':'Kern-Systeme. Symbiont. "Die Schlange." – Carter',
 '3-4':'SGC. Doppelt-Gate. "Überfall." – Hammond',
 '3-5':'Flaggschiff. Apophis. "Ich bin ein Gott." – Apophis',
 '4-1':'B-612. Replikatoren. "Strand, Sand, Drohnen." – Hammond',
 '4-2':'Ennui. Dorf. "Die Wehr." – Dorf',
 '4-3':'Kern-Systeme. Mine. "Die Höhle." – Replikator',
 '4-4':'P7J-989. Knoten. "Der Stock." – Replikator',
 '4-5':'Nexus. Königin. "Du wirst mich füttern." – Königin',
 '5-1':'Ori-Welt. Drei Lords. "Wir sind Götter." – Lords',
 '5-2':'Flaggschiff. Gate-Knoten. "Das zweite Gate." – Apophis',
 '5-3':'P5U-666. Antike Tür. "Antiker Tor." – Ancient',
 '5-4':'Kern-Systeme. Amonet. "Du wirst einfrieren." – Amonet',
 '5-5':'Nexus. Super-Gate. "Der Plan." – Ori',
 '5-6':'SGC. Zuhause. "Home." – Hammond'
};
