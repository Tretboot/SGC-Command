'use strict';
// ===================== SGC COMMAND v2 – Engine =====================
// X-COM-Struktur: Basis-Management + taktischer Grid-Kampf.
// Neglect ist raus. Mission endet bei Sieg oder Extraktion (One-Way-Gate).
// Alle Spiellogik = pure Funktionen. Kein DOM-Zugriff hier.

const SAVE_KEY='sgc-command-v4';
const CLASS_DE={leader:'Leader',fighter:'Kämpfer',scientist:'Wissenschaftler',medic:'Sanitäter',engineer:'Ingenieur'};
const CLASS_EN={leader:'Leader',fighter:'Fighter',scientist:'Scientist',medic:'Medic',engineer:'Engineer'};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const ri=n=>rnd(0,n-1);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// Waffen: [min, max, range, hitBase]
const WEAPONS={
  rifle:{name:'Rifle',nameEn:'Rifle',min:9,max:13,range:4,hit:70,cost:{ore:15}},
  shotgun:{name:'Shotgun',nameEn:'Shotgun',min:14,max:18,range:2,hit:90,cost:{ore:20}},
  pistol:{name:'Pistol',nameEn:'Pistol',min:7,max:10,range:3,hit:70,cost:{ore:10}},
  zat:{name:"Zat'nik'tel",nameEn:"Zat'nik'tel",min:12,max:16,range:4,hit:78,cost:{ore:30,tech:10},minChap:1},
  staff:{name:'Staff',nameEn:'Staff',min:7,max:11,range:3,hit:70,cost:{ore:25,tech:5},minChap:2},
  staffLong:{name:'Langer Staff',nameEn:'Long Staff',min:12,max:16,range:5,hit:70,cost:{ore:35,tech:10},minChap:2},
  melee:{name:'Melee',nameEn:'Melee',min:5,max:9,range:1,hit:95},
  chakram:{name:'Chakram',nameEn:'Chakram',min:16,max:22,range:1,hit:95},
  hammer:{name:'Hammer',nameEn:'Hammer',min:14,max:19,range:1,hit:95},
  throw:{name:'Wurf',nameEn:'Throw',min:15,max:22,range:7,hit:70,ignoreCover:true},
};

// Rüstungen (INVENTAR-SPEC.md §4)
const ARMORS={
  light:{name:'Leichte Weste',nameEn:'Light Vest',reduction:0.10,movePenalty:0,cost:{ore:10},desc:'−10% Schaden erlitten',descEn:'−10% damage taken'},
  medium:{name:'Komposit-Rüstung',nameEn:'Composite Armor',reduction:0.20,movePenalty:0,cost:{ore:25,tech:5},desc:'−20% Schaden erlitten',descEn:'−20% damage taken'},
  heavy:{name:'Schwere Naquadah-Platte',nameEn:'Heavy Naquadah Plate',reduction:0.30,movePenalty:1,cost:{ore:40,tech:10},desc:'−30% Schaden, −1 Bewegung',descEn:'−30% damage, −1 movement'},
};

// Spezial-Items (INVENTAR-SPEC.md §5)
const SPECIALS={
  medkit:{name:'Medkit',nameEn:'Medkit',icon:'✚',cost:{medicine:5},desc:'+15 HP im Einsatz (1×/Mission)',descEn:'+15 HP in combat (1×/mission)'},
  shield:{name:'Persönlicher Schild',nameEn:'Personal Shield',icon:'🛡',cost:{tech:15},desc:'Halbiert Schaden für 2 Runden',descEn:'Halves damage for 2 rounds'},
  smoke:{name:'Rauchgranate',nameEn:'Smoke Grenade',icon:'💨',cost:{ore:10},desc:'+25% Ausweichen für 2 Runden',descEn:'+25% evasion for 2 rounds'},
  emp:{name:'EMP-Impuls',nameEn:'EMP Pulse',icon:'⚡',cost:{tech:20},desc:'Nächster Gegner verliert 1 AP & 8 HP',descEn:'Next enemy loses 1 AP & 8 HP'},
};

// Kommandanten für Hammonds Büro / Klemmbrett (ROADMAP.md §1.5.2)
const COMMANDERS={
  hammond:{id:'hammond',name:'Gen. George Hammond',title:'USAF · Stargate Command',titleEn:'USAF · Stargate Command',color:'#e8b040',quote:'„Gehen Sie mit Gott, SG-1.“',quoteEn:'"Go with God, SG-1."',bonus:'+10% Moral-Regeneration & Sandwich-Aktion',bonusEn:'+10% morale regeneration & sandwich action',portraitId:12},
  weir:{id:'weir',name:'Dr. Elizabeth Weir',title:'Zivile Leitung · IOA',titleEn:'Civilian Lead · IOA',color:'#38bdf8',quote:'„Diplomatie ist unsere erste Verteidigungslinie.“',quoteEn:'"Diplomacy is our first line of defense."',bonus:'+25% Forschungspunkte (Labor) & +15% Kontakt-Beute',bonusEn:'+25% research points (lab) & +15% contact loot',portraitId:1},
  landry:{id:'landry',name:'Gen. Hank Landry',title:'USAF · Taktische Leitung',titleEn:'USAF · Tactical Command',color:'#4ade80',quote:'„Feuerkraft löst Probleme, bevor sie entstehen.“',quoteEn:'"Firepower solves problems before they happen."',bonus:'+10 Basis-Power & +10% Waffenschaden',bonusEn:'+10 base power & +10% weapon damage',portraitId:0},
};

// SG-Teams (KONZEPT-v3.md §2+4 & Progressions-Gatter ROADMAP.md §1.5.1)
const SG_TEAMS={
  sg1:{id:'sg1',name:'SG-1',role:'Flaggschiff & Erkundung',roleEn:'Flagship & Exploration',color:'#4fc3f7',unlockChap:0,leadId:0},
  sg2:{id:'sg2',name:'SG-2',role:'Taktischer Sturmtrupp',roleEn:'Tactical Assault',color:'#4ade80',unlockChap:0,leadId:5},
  sg3:{id:'sg3',name:'SG-3',role:'Schwere Marines',roleEn:'Heavy Marines',color:'#f97316',unlockChap:1,leadId:8},
  sg4:{id:'sg4',name:'SG-4',role:'Medizin & Diplomatie',roleEn:'Medicine & Diplomacy',color:'#a78bfa',unlockChap:2,leadId:4},
  sg5:{id:'sg5',name:'SG-5',role:'Spezialeinheit',roleEn:'Special Ops',color:'#facc15',unlockChap:3,leadId:7},
};

// Crafting-Rezepte (INVENTAR-SPEC.md §3)
const RECIPES={
  rifle:   {name:'🔫 Sturmgewehr (P90/M16)',nameEn:'🔫 Assault Rifle (P90/M16)',cat:'weapons',item:'rifle',cost:{ore:15}},
  shotgun: {name:'🔫 Combat Shotgun',nameEn:'🔫 Combat Shotgun',cat:'weapons',item:'shotgun',cost:{ore:20}},
  zat:     {name:"⚡ Zat'nik'tel",nameEn:"⚡ Zat'nik'tel",cat:'weapons',item:'zat',cost:{ore:30,tech:10},req:'W2'},
  staff:   {name:'🔥 Jaffa-Stabwaffe',nameEn:'🔥 Jaffa Staff Weapon',cat:'weapons',item:'staff',cost:{ore:25,tech:5}},
  medium:  {name:'🛡 Komposit-Rüstung (−20%)',nameEn:'🛡 Composite Armor (−20%)',cat:'armor',item:'medium',cost:{ore:25,tech:5}},
  heavy:   {name:'🛡 Naquadah-Platte (−30%)',nameEn:'🛡 Naquadah Plate (−30%)',cat:'armor',item:'heavy',cost:{ore:40,tech:10},req:'S1'},
  medkit:  {name:'✚ Medkit (+15 HP)',nameEn:'✚ Medkit (+15 HP)',cat:'special',item:'medkit',cost:{medicine:5}},
  shield:  {name:'🛡 Persönlicher Schild',nameEn:'🛡 Personal Shield',cat:'special',item:'shield',cost:{tech:15},req:'S1'},
  smoke:   {name:'💨 Rauchgranate',nameEn:'💨 Smoke Grenade',cat:'special',item:'smoke',cost:{ore:10}},
  emp:     {name:'⚡ EMP-Impuls',nameEn:'⚡ EMP Pulse',cat:'special',item:'emp',cost:{tech:20}},
};

// Feind-Typen
const ENEMIES={
  jaffa:{name:'Jaffa',nameEn:'Jaffa',hp:32,move:5,weapon:'staff',melee:'melee',color:'#e8a040'},
  veteran:{name:'Jaffa Veteran',nameEn:'Jaffa Veteran',hp:46,move:5,weapon:'staff',melee:'melee',color:'#d06030'},
  elite:{name:'Elite Jaffa',nameEn:'Elite Jaffa',hp:60,move:6,weapon:'staffLong',melee:'melee',color:'#a040a0'},
  goauld:{name:"Goa'uld",nameEn:"Goa'uld",hp:220,move:3,weapon:'throw',melee:'melee',color:'#ffd700'},
  repl:{name:'Replikant',nameEn:'Replicator',hp:50,move:7,weapon:'staff',melee:'melee',color:'#909090'},
  drone:{name:'Drone',nameEn:'Drone',hp:25,move:7,weapon:'staff',melee:null,color:'#c0c0c0'},
    queen:{name:'Königin',nameEn:'Queen',hp:320,move:4,weapon:'staffLong',melee:'melee',color:'#606060'},
 };

 // ===================== Schwierigkeit =====================
 // Drei Stufen. Skaliert Gegner-HP/-Schaden/-Anzahl, Spieler-Schaden.
 // 'easy' ist Default: Zeit zum Reinkommen + Testen. Die Progression (Kapitel,
 // chapterScale in combat.js) macht es zusätzlich nach und nach schwerer –
 // unabhängig von der gewählten Stufe. Werte hier tunen = Balance anpassen.
 const DIFFICULTY={
  easy:{name:'Leicht',nameEn:'Easy',color:'#4ade80',desc:'Zum Reinkommen. Weniger & schwächere Gegner, mehr Zeit.',descEn:'For getting started. Fewer & weaker enemies, more time.',
    enemyHp:0.7,enemyDmg:0.7,enemyCount:0.7,playerDmg:1.25},
  normal:{name:'Normal',nameEn:'Normal',color:'#facc15',desc:'Wie in der Serie.',descEn:'Just like in the series.',
    enemyHp:1.0,enemyDmg:1.0,enemyCount:1.0,playerDmg:1.0},
  hard:{name:'Hart',nameEn:'Hard',color:'#ef4444',desc:'Die Jaffa meinen es ernst. Mehr Gegner, weniger Zeit.',descEn:'The Jaffa mean business. More enemies, less time.',
    enemyHp:1.3,enemyDmg:1.3,enemyCount:1.25,playerDmg:1.0},
 };

// Charaktere (SG-1 + Rekruten)
const POOL=[
 {name:"Jack O'Neill",cls:'leader',hp:80,move:5,weapon:'rifle',sg1:true,talent:"Chekhov's Pencil: 1×/Mission verhindert Extraktion",talentEn:"Chekhov's Pencil: 1×/mission prevents extraction"},
 {name:'Samantha Carter',cls:'engineer',hp:75,move:5,weapon:'rifle',sg1:true,talent:'Gate-Genius: Extraktion-Beute +10%',talentEn:'Gate Genius: extraction loot +10%'},
 {name:'Daniel Jackson',cls:'scientist',hp:60,move:5,weapon:'pistol',sg1:true,talent:'Schwachpunkt: +25% Schaden 3 Runden',talentEn:'Weak Spot: +25% damage 3 rounds'},
 {name:"Teal'c",cls:'fighter',hp:95,move:6,weapon:'rifle',melee:'chakram',sg1:true,talent:'Chakram: +8 Schaden vs Jaffa',talentEn:'Chakram: +8 damage vs Jaffa'},
 {name:'Teyla Emmagan',cls:'medic',hp:70,move:5,weapon:'pistol',talent:'Heilung: +10 HP Verbündeter (1×/Mission)',talentEn:'Healing: +10 HP to an ally (1×/mission)'},
 {name:'Cameron Mitchell',cls:'fighter',hp:75,move:5,weapon:'rifle',talent:'Stoiker: Fatigue-Regen ×2',talentEn:'Stoic: fatigue regen ×2'},
 {name:'Vala Mal Doran',cls:'scientist',hp:65,move:5,weapon:'pistol',talent:'Tech-Beute +40%',talentEn:'Tech loot +40%'},
 {name:'Ronon Dex',cls:'fighter',hp:90,move:5,weapon:'shotgun',talent:'Hammer: +25% Schaden',talentEn:'Hammer: +25% damage'},
 {name:'John Sheppard',cls:'leader',hp:80,move:5,weapon:'rifle',talent:'Improvisation: 1×/Mission +20% Schaden',talentEn:'Improvisation: 1×/mission +20% damage'},
 {name:'Dr. Beale',cls:'medic',hp:70,move:5,weapon:'pistol',talent:'MedBay-Boost: +50% Heilung',talentEn:'MedBay Boost: +50% healing'},
 {name:'Eli Wallace',cls:'scientist',hp:55,move:4,weapon:'pistol',talent:'Forschung ×2',talentEn:'Research ×2'},
 {name:"Ba'al",cls:'scientist',hp:70,move:5,weapon:'pistol',talent:"Goa'uld-Wissen: +25% vs Goa'uld",talentEn:"Goa'uld knowledge: +25% vs Goa'uld"},
 {name:'General Hammond',cls:'leader',hp:60,move:4,weapon:'pistol',talent:'Sandwich: 1×/Kapitel +20 Morale',talentEn:'Sandwich: 1×/chapter +20 morale'},
 {name:'Major West',cls:'fighter',hp:75,move:5,weapon:'rifle',talent:'Diplomat: -1 Bedrohung neutral',talentEn:'Diplomat: -1 threat (neutral)'},
  {name:'Apophis (Ra)',cls:'leader',hp:85,move:5,weapon:'rifle',talent:'Götter-Charisma: +5% Schaden',talentEn:'God-Charisma: +5% damage'},
 ];
 // Cannon Fodder: 24 generierte Rekruten (deterministisch via art2.js, Seed 100+i).
 // registerRecruit() trägt Name+Look+Akte in LOOKS/DOSSIERS ein – portrait() und
 // drawSoldier() funktionieren damit sofort. Klassen rotiert, Waffen nach Klasse.
 const RECRUIT_SEEDS=[100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123];
 const _RC=['fighter','fighter','medic','engineer','scientist','leader'];
 const _RW={fighter:'rifle',medic:'pistol',engineer:'rifle',scientist:'pistol',leader:'rifle'};
 RECRUIT_SEEDS.forEach((seed,i)=>{
  const reg=registerRecruit(seed,_RC[i%_RC.length]);
  POOL.push({name:reg.name,cls:reg.cls,hp:60+((seed*7)%21),move:5,weapon:_RW[reg.cls],
   talent:reg.dossier.trait+': '+reg.dossier.bio,
   talentEn:(reg.dossier.traitEn||reg.dossier.trait)+': '+(reg.dossier.bioEn||reg.dossier.bio)});
 });
   const START=[0,1,2]; // Teal'c (3) kommt erst nach Mission 1-1 (Serien-Timeline: bei der 1. Mission ist er noch nicht dabei)

// Planeten (Sternenkarte + Missions-Kontext)
const PLANETS={
 sgc:{name:'SGC – Cheyenne Mountain',x:105,y:275,type:'base',ch:0,sgc:true,address:'28-26-5-36-11-29',desc:'Kommandozentrale der Erde im Cheyenne Mountain Komplex.',descEn:'Earth command center in the Cheyenne Mountain complex.'},
 p3x478:{name:'P3X-478',x:255,y:150,type:'neutral',ch:0,desc:'Ruhige Welt mit verstreuten Antiker-Markern.',descEn:'Quiet world with scattered Ancient markers.'},
 chulak:{name:'Chulak',x:385,y:320,type:'hostile',ch:0,address:'9-2-23-15-37-20',desc:'Heimatwelt von Teal\'c und Hauptrekrutierungsort der Apophis-Jaffa.',descEn:'Home world of Teal\'c and main recruitment ground of the Apophis Jaffa.'},
 abydos:{name:'Abydos (P4X-544)',x:300,y:370,type:'hostile',ch:0,address:'27-7-15-32-12-30',desc:'Wüstenplanet von Kasuf und Sha\'re, einst von Ra beherrscht.',descEn:'Desert planet of Kasuf and Sha\'re, once ruled by Ra.'},
 cimmeria:{name:'Cimmeria (P3X-974)',x:270,y:210,type:'neutral',ch:0,address:'3-12-8-21-14-19',desc:'Asgard-Schutzwelt unter dem Hammer von Thor.',descEn:'Asgard-protected world under the Hammer of Thor.'},
 p4x639:{name:'P4X-639',x:325,y:195,type:'empty',ch:0,address:'22-14-9-18-35-3',desc:'Antiker-Zeitschleifen-Station (Kein Ende in Sicht).',descEn:'Ancient time-loop station (no end in sight).'},
 p2x416:{name:'P2X-416',x:215,y:265,type:'neutral',ch:0,desc:'Bedrosianer und Optricianer im Streit um das Tor.',descEn:'Bedrosians and Optricians in a dispute over the gate.'},
 p5c353:{name:'P5C-353',x:395,y:255,type:'empty',ch:0,desc:'Ausgestorbener Planet mit einer mysteriösen Sphäre.',descEn:'Died-out planet with a mysterious sphere.'},
 orbit1:{name:'Orbit P3X-478b',x:385,y:95,type:'space',ch:0,desc:'Trümmerfeld im Orbit nach Thors Raumschiff-Verteidigung.',descEn:'Debris field in orbit after Thor\'s ship defense.'},
 p2u744:{name:'P2U-744',x:480,y:185,type:'neutral',ch:1,desc:'Ehemaliger Naquadah-Außenposten der Goa\'uld.',descEn:'Former Goa\'uld Naquadah outpost.'},
 alpha:{name:'Planet Alpha',x:535,y:340,type:'neutral',ch:1,address:'3-28-9-19-24-18',desc:'Geheimer Alpha-Außenposten der Tau\'ri.',descEn:'Secret Tau\'ri Alpha outpost.'},
 tollana:{name:'Tollana (P4X-377)',x:425,y:140,type:'neutral',ch:1,address:'4-29-8-19-22-10',desc:'Heimat der Tollaner mit Ionenkanonen & Phasenverschiebung.',descEn:'Home of the Tollan with ion cannons & phase shifting.'},
 vorash:{name:'Vorash',x:515,y:275,type:'hostile',ch:1,address:'17-25-8-3-12-19',desc:'Tok\'ra-Wüstenbasis mit Kristalltunneln.',descEn:'Tok\'ra desert base with crystal tunnels.'},
 langara:{name:'Langara (P3S-452)',x:585,y:220,type:'neutral',ch:1,address:'9-18-27-3-14-22',desc:'Heimat von Jonas Quinn, reich an instabilem Naquadria.',descEn:'Home of Jonas Quinn, rich in unstable naquadria.'},
 hadante:{name:'Hadante',x:340,y:430,type:'hostile',ch:1,address:'8-21-14-29-3-18',desc:'Unterirdische Gefängniswelt ohne DHD (Linea).',descEn:'Underground prison world without DHD (Linea).'},
 p3x888:{name:'P3X-888',x:470,y:390,type:'hostile',ch:1,address:'14-8-22-31-19-4',desc:'Urwelt der Goa\'uld-Symbionten und wilden Unas.',descEn:'Origin world of the Goa\'uld symbiotes and wild Unas.'},
 mobius:{name:'Planet Möbius',x:625,y:105,type:'neutral',ch:1,desc:'Historischer Zeitschleifen-Nexus.',descEn:'Historic time-loop nexus.'},
 newground:{name:'New Ground',x:660,y:420,type:'neutral',ch:1,desc:'Territorium der Optricianischen Gemeinschaft.',descEn:'Territory of the Optrician community.'},
 p7j989:{name:'P7J-989',x:450,y:440,type:'empty',ch:1,desc:'Garten-Kuppel mit der virtuellen Realität der Hüter.',descEn:'Garden dome with the Guardians\' virtual reality.'},
 delmak:{name:'Delmak',x:670,y:290,type:'hostile',ch:2,address:'1-18-9-24-31-15',desc:'Festungswelt des Sokar und spätere Bastion von Ba\'al.',descEn:'Fortress world of Sokar and later bastion of Ba\'al.'},
 tartarus:{name:'Tartarus',x:715,y:160,type:'hostile',ch:2,address:'19-14-22-7-35-12',desc:'Anubis\' Brutstätte der unaufhaltsamen Kull-Krieger.',descEn:'Anubis\' breeding ground of unstoppable Kull warriors.'},
 kheb:{name:'Kheb (P9C-882)',x:610,y:370,type:'empty',ch:2,address:'26-35-14-8-19-2',desc:'Heiliger Antiker-Tempel der Aufgestiegenen & Oma Desala.',descEn:'Holy Ancient temple of the Ascended & Grandma Desala.'},
 othala:{name:'Othala (Ida-Galaxie)',x:870,y:80,type:'space',ch:2,address:'3-14-22-8-19-29',desc:'Heimatgalaxie der Asgard und Flottenwerft von Thor.',descEn:'Home galaxy of the Asgard and Thor\'s fleetyard.'},
 p5u666:{name:'P5U-666',x:735,y:235,type:'hostile',ch:2,desc:'Uralte Tempelruinen mit astronomischen Karten.',descEn:'Ancient temple ruins with astronomical maps.'},
 ennui:{name:'Ennui',x:800,y:355,type:'neutral',ch:2,desc:'Herrschaftsbereich eines abtrünnigen Goa\'uld-Prinzen.',descEn:'Domain of a renegade Goa\'uld prince.'},
 dakara:{name:'Dakara',x:790,y:215,type:'hostile',ch:3,address:'28-3-14-26-11-7',desc:'Ursprung der Jaffa-Kultur mit der Antiker-Superwaffe.',descEn:'Origin of Jaffa culture with the Ancient super-weapon.'},
 camelot:{name:'Camelot (PX1-591)',x:840,y:290,type:'neutral',ch:3,address:'11-20-14-9-27-3',desc:'Merlins Bibliothek, der Sangreal und die Artus-Sage.',descEn:'Merlin\'s library, the Holy Grail and the Arthurian legend.'},
 proclarush:{name:'Proclarush Taonas',x:880,y:380,type:'hostile',ch:3,address:'18-29-3-14-22-7',desc:'Lava-überströmte Antiker-Kuppel mit ZPM-Kammer.',descEn:'Lava-flooded Ancient dome with ZPM chamber.'},
 kern:{name:'Kern-Systeme',x:850,y:120,type:'hostile',ch:3,desc:'Stark befestigtes Goa\'uld-Territorium.',descEn:'Heavily fortified Goa\'uld territory.'},
 nexus:{name:'Orbit-Nexus',x:765,y:480,type:'space',ch:3,desc:'Knotenpunkt des replizierten Netzwerks.',descEn:'Hub of the replicated network.'},
 ori:{name:'Ori-Welt (Celestis)',x:905,y:255,type:'hostile',ch:4,desc:'Zentrum der Priore und der Ori-Armada.',descEn:'Center of the Preta and the Ori armada.'},
 flag:{name:"Apophis' Flaggschiff",x:910,y:440,type:'space',ch:4,desc:'Schweres Ha\'tak-Flaggschiff im Angriffsmodus.',descEn:'Heavy Ha\'tak flagship in attack mode.'},
  urgo:{name:'P4X-884 (Urgo)',x:190,y:170,type:'neutral',ch:0,desc:'Heimatwelt des künstlichen KI-Wesens Urgo.',descEn:'Homeworld of the AI entity Urgo.'},
  kallana:{name:'Kallana',x:780,y:410,type:'space',ch:3,address:'31-19-4-14-8-22',desc:'Kollabierte Welt und Standort des ersten Ori-Supergates.',descEn:'Collapsed world and site of the first Ori Supergate.'},
  pangar:{name:'Pangar (P4X-523)',x:440,y:200,type:'neutral',ch:1,address:'14-22-8-3-12-19',desc:'Quelle von Tretonin aus der Tok\'ra-Königin Egeria.',descEn:'Source of Tretonin from Tok\'ra Queen Egeria.'},
  p3x666:{name:'P3X-666',x:560,y:460,type:'hostile',ch:2,address:'9-14-28-3-18-22',desc:'Schauplatz heftiger Gefechte mit Jaffa-Angriffstruppen.',descEn:'Site of fierce skirmishes with Jaffa strike forces.'},
  p3r272:{name:'P3R-272',x:360,y:115,type:'empty',ch:1,address:'29-3-14-22-7-18',desc:'Verlassener Antiker-Tempel mit dem Wissensspeicher.',descEn:'Abandoned Ancient temple housing the Knowledge Repository.'},
  p3x984:{name:'Alpha-Standort (P3X-984)',x:610,y:190,type:'neutral',ch:1,address:'3-28-9-19-24-18',desc:'Geheimer Rückzugsort des SGC für Notfall-Evakuierungen.',descEn:'Secret SGC fallback site for emergency evacuations.'},
  p3x584:{name:'P3X-584',x:720,y:330,type:'hostile',ch:2,desc:'Anubis\' genetisches Klonlabor (Prototyp Khalek).',descEn:'Anubis\' genetic cloning lab (Prototype Khalek).'},
  hebridan:{name:'Hebridan',x:680,y:110,type:'neutral',ch:2,address:'12-8-21-14-19-3',desc:'Fortschrittliche Welt der Serrakin & Tech Con Group.',descEn:'Advanced world of the Serrakin & Tech Con Group.'},
  tagrea:{name:'Tagrea (P4X-351)',x:520,y:130,type:'neutral',ch:1,address:'22-7-18-29-3-14',desc:'Vergrabene Tor-Adresse und Landeplatz der Prometheus.',descEn:'Buried gate address and landing site of the Prometheus.'},
  vis_uban:{name:'Vis Uban (P4X-650)',x:640,y:250,type:'empty',ch:2,address:'18-22-7-14-29-3',desc:'Unvollendete Stadt der Antiker („Große Seuche“).',descEn:'Unfinished city of the Ancients ("Great Plague").'},
  argos:{name:'Argos (P3X-8596)',x:230,y:340,type:'neutral',ch:0,desc:'Pelops\' Testgelände für beschleunigtes Altern.',descEn:'Pelops\' test ground for accelerated aging.'},
  nox:{name:'Nox-Heimatwelt (P3X-774)',x:310,y:85,type:'empty',ch:0,address:'1-25-3-14-22-8',desc:'Schwebende Städte einer der vier großen Völker.',descEn:'Floating cities of one of the four Great Races.'},
  p3w451:{name:'P3W-451',x:470,y:90,type:'space',ch:1,desc:'Planet im Gravitationsfeld eines Schwarzen Lochs (Zeitdilatation).',descEn:'Planet in the gravity well of a black hole (time dilation).'},
  hanka:{name:'Hanka (P8X-987)',x:360,y:290,type:'neutral',ch:0,address:'14-3-22-8-19-29',desc:'Cassandras Heimatwelt, von Nirrti mit Naquadah-Sporen infiziert.',descEn:'Cassandra\'s home world, infected by Nirrti with naquadah spores.'},
  madrona:{name:'Madrona (PX7-941)',x:420,y:360,type:'neutral',ch:1,address:'8-19-24-3-14-22',desc:'Welt des Wettersteins (von abtrünnigen NID-Agenten entwendet).',descEn:'World of the Touchstone (stolen by rogue NID operatives).'},
};

// Kompakte Startsektoren, die der Combat-Renderer um Landschaft und Wege erweitert.
// . offen, l leichte Deckung, H schwere Deckung, # Wand/Gebäude, ~ Wasser/Gefahr, b Trümmer, G Gate
const MAPS={
 // Abydos-Ruinen: Tempel-Zentrum, offene Dünen, Oase mit Doppelquerung, weite Flanken
 desert:[
 '..##..l......l..##..',
 '#..#....H..H....#..#',
 '#..#...l....l...#..#',
 '..##............##..',
 '.....l..~~~~..l.....',
 '.H......~..~......H.',
 '.l...l...GG...l...l.',
 '.H......~..~......H.',
 '.....l..~~~~..l.....',
 '..##............##..',
 '#..#...l....l...#..#',
 '#..#....H..H....#..#',
 '..##..l......l..##..',
 '....l..........l....',
 '..H...l......l...H..'],
 jungle:[
 '...l.l........l.l...',
 '.l....H..##..H....l.',
 '....l....#....l.....',
 '..H...l......l...H..',
 '..l.............l...',
 '~~~~==~~~~~~~~==~~~~',
 '....l..........l....',
 '..H......GG......H..',
 '....l..........l....',
 '~~~~==~~~~~~~~==~~~~',
 '..l.............l...',
 '..H...l......l...H..',
 '....l....#....l.....',
 '.l....H..##..H....l.',
 '...l.l........l.l...'],
 chulak:[
 '..H...l......l...H..',
 '....l..........l....',
 '#..#....####....#..#',
 '#..#....#..#....#..#',
 '....l..........l....',
 '..H....l.##.l....H..',
 '.......l....l.......',
 '....l....GG....l....',
 '.......l....l.......',
 '..H....l.##.l....H..',
 '....l..........l....',
 '#..#....####....#..#',
 '#..#....#..#....#..#',
 '....l..........l....',
 '..H...l......l...H..'],
 city:[
 // Taktischer Stadtsektor: Breite Boulevards (3 Kacheln), offener Marktplatz, Ruinenfassaden mit Türen, kein Engpass
 '####..l......l..####',
 '#......H....H......#',
 '#..l............l..#',
 '....l..######..l....',
 '.......#....#.......',
 '..H....l....l....H..',
 '....l..........l....',
 '..l....l.##.l....l..',
 '....l..........l....',
 '..H....l....l....H..',
 '.......#....#.......',
 '....l..######..l....',
 '#..l............l..#',
 '#......H....H......#',
 '####..l..GG..l..####'],
 sgc:[
 '######..############',
 '#GG..#..#....l.l...#',
 '#GG..#..#..........#',
 '#....#..#...l...##.#',
 '#..l.H..H...H...##.#',
 '###.##..############',
 '#......#...l........#',
 '#..l...#...#...l....#',
 '#......#...#.########',
 '####.###...#.#......#',
 '#......#...#.#..H...#',
 '#..##..#...#.#......#',
 '#..##..#...#...##...#',
 '#......#...#...##...#',
 '####################'],
};

// Kapitel & Missionen
const CHAPTERS=[
 {title:'Kapitel 1 – Erste Schritte',titleEn:'Chapter 1 – First Steps',sub:'Ein Tor, eine Basis, ein Gott mit schlechtem Lebenslauf.',subEn:'One gate, one base, one god with a bad resume.',missions:[
     {id:'1-1',name:'Der erste Schritt',nameEn:'The First Step',planet:'chulak',goal:'SG-1 durch Chulak führen und Teal’cs Seitenwechsel ermöglichen',goalEn:'Lead SG-1 through Chulak and enable Teal’c’s switch of sides',map:'chulak',theme:'jungle',type:'assault',enemies:{jaffa:3},enemySpawns:[{x:4,y:6},{x:15,y:6},{x:4,y:9}],tutorial:true,timer:30,reward:{ore:80,tech:20},recruit:3,text:'Teal’c schließt sich SG-1 an',textEn:'Teal’c joins SG-1'},
   {id:'1-2',name:'Das Dorf am Fluss',nameEn:'The Village by the River',planet:'abydos',goal:'Friedlichen Erstkontakt herstellen und Vertrauen gewinnen',goalEn:'Establish peaceful first contact and win trust',map:'village',theme:'jungle',type:'contact',peaceful:true,contact:{id:'village-elder',name:'Siedlungssprecher',nameEn:'Settlement Speaker',x:22,y:13},enemies:{},reward:{ore:60,medicine:15,food:20},text:'Ein neuer Verbündeter auf Abydos',textEn:'A new ally on Abydos'},
   {id:'1-3',name:'Stand Orders',nameEn:'Stand Orders',planet:'p2x416',goal:'Halte-Mission 10 Runden',goalEn:'Hold mission for 10 rounds',map:'desert',theme:'desert',type:'defense',enemies:{jaffa:12},timer:28,reward:{ore:75,tech:25},recruit:12,text:'Jaffa-Anatomie I',textEn:'Jaffa Anatomy I'},
   {id:'1-4',name:'Steuern beim Schatzamt',nameEn:'Taxes at the Treasury',planet:'abydos',goal:'Steuereintreiber fassen',goalEn:'Catch the tax collector',map:'city',theme:'city',type:'assault',enemies:{jaffa:8,elite:1},timer:28,reward:{ore:70,tech:30},recruit:9,text:'Trelak befreit',textEn:'Trelak freed'},
       {id:'1-6',name:'Ebene 28: Infiltrationsalarm',nameEn:'Level 28: Foothold Infiltration',planet:'sgc',goal:'Verteidige Ebene 28 gegen Infiltratoren',goalEn:'Defend Level 28 against alien infiltrators',map:'sgc',theme:'sgc',type:'defense',enemies:{jaffa:4,veteran:3},timer:26,reward:{ore:85,tech:40},text:'Ebene 28 gesichert',textEn:'Level 28 secured'},
    {id:'1-5',name:'38 Minuten',nameEn:'38 Minutes',planet:'orbit1',goal:'Thor reparieren, Raid abwehren',goalEn:'Repair Thor, repel the raid',map:'asgard',theme:'asgard',type:'defense',enemies:{jaffa:12,veteran:2,elite:1},timer:17,reward:{tech:40,ore:60},recruit:5,text:'Dock Thor, Asgard-Deckung',textEn:'Dock Thor, Asgard cover'},
 ]},
 {title:'Kapitel 2 – Das Netz wächst',titleEn:'Chapter 2 – The Network Grows',sub:'Das Telefon hat jetzt mehrere Leitungen.',subEn:'The phone now has several lines.',missions:[
  {id:'2-1',name:'Netz',nameEn:'The Network',planet:'p2u744',goal:'Jaffa-Nachbasis sabotieren',goalEn:'Sabotage the Jaffa backup base',map:'jungle',theme:'jungle',type:'assault',enemies:{jaffa:8,veteran:4},timer:28,reward:{tech:15,ore:10},recruit:6,text:'Antiquitäten-Lizenz',textEn:'Antiques license'},
  {id:'2-2',name:'Serenno',nameEn:'Serenno',planet:'alpha',goal:'Friedlichen Kontakt mit der Alpha-Gemeinschaft herstellen',goalEn:'Establish peaceful contact with the Alpha community',map:'village',theme:'jungle',type:'contact',peaceful:true,contact:{id:'alpha-envoy',name:'Koloniegesandte',nameEn:'Colony Envoy',x:10,y:13},enemies:{},reward:{ore:25,food:10},recruit:13,text:'Alpha-Gemeinschaft',textEn:'Alpha community'},
  {id:'2-3',name:'Alpha',nameEn:'Alpha',planet:'p7j989',goal:'Chain-Dial-Verteidigung',goalEn:'Chain-dial defense',map:'sgc',type:'defense',enemies:{jaffa:4,veteran:4,elite:2},timer:28,reward:{ore:20,tech:10},text:'+1 Dial-Kapazität',textEn:'+1 dial capacity'},
  {id:'2-4',name:'Das Auge',nameEn:'The Eye',planet:'mobius',goal:'Lens-Grundstation zerstören',goalEn:'Destroy the Lens base station',map:'jungle',theme:'jungle',type:'assault',enemies:{veteran:10,elite:4},timer:28,reward:{tech:20},recruit:10,text:'Gate-Netzwerk I',textEn:'Gate Network I'},
  {id:'2-5',name:'Das besteuerte Reich',nameEn:'The Taxed Empire',planet:'newground',goal:'Zwei-Schicht-Army vernichten',goalEn:'Destroy the two-shift army',map:'city',theme:'city',type:'assault',enemies:{jaffa:14,veteran:6,elite:2},timer:32,reward:{food:20,ore:15},recruit:8,text:'Bündnis New Ground',textEn:'New Ground alliance'},
     {id:'2-7',name:'Der Wissensspeicher',nameEn:'The Ancient Repository',planet:'p3r272',goal:'Antiker-Speicher untersuchen und Exfil',goalEn:'Investigate Ancient repository and exfiltrate',map:'desert',theme:'asgard',type:'assault',enemies:{veteran:6,elite:4},timer:28,reward:{tech:50},text:'Antiker-Datenfragment',textEn:'Ancient data fragment'},
   {id:'2-6',name:'Der erste Gott',nameEn:'The First God',planet:'p5c353',goal:'Khepra besiegen',goalEn:'Defeat Khepra',map:'hatak',theme:'hatak',type:'assault',enemies:{veteran:8,elite:10,goauld:1},timer:22,reward:{tech:25,ore:20},text:'Khepra tot',textEn:'Khepra dead'},
 ]},
 {title:'Kapitel 3 – Bedrohungen',titleEn:'Chapter 3 – Threats',sub:'Jetzt hat jeder die Telefonnummer.',subEn:'Now everyone has the phone number.',missions:[
  {id:'3-1',name:'Gärten des Pharao',nameEn:'Gardens of the Pharaoh',planet:'p5u666',goal:'Kalender beschaffen',goalEn:'Obtain the calendar',map:'city',type:'assault',enemies:{veteran:10,elite:4},timer:28,reward:{tech:20},recruit:7,text:'Asgard-Karte',textEn:'Asgard map'},
  {id:'3-2',name:'Sohn des Pharao',nameEn:'Son of the Pharaoh',planet:'ennui',goal:'Prinz Kaelo befreien',goalEn:'Free Prince Kaelo',map:'jungle',type:'defense',enemies:{veteran:8,elite:6},timer:30,reward:{ore:25,medicine:5},text:'Kaelo als Reservist',textEn:'Kaelo as a reservist'},
  {id:'3-3',name:'Die Schlange',nameEn:'The Snake',planet:'kern',goal:'Symbiont fassen',goalEn:'Capture the symbiote',map:'hatak',theme:'hatak',type:'assault',enemies:{elite:12,veteran:2},timer:28,reward:{tech:25},text:'2 Gate-Adressen',textEn:'2 gate addresses'},
  {id:'3-4',name:'Überfall',nameEn:'Ambush',planet:'sgc',goal:'Doppelt-Gate-Verteidigung',goalEn:'Double gate defense',map:'sgc',type:'defense',enemies:{veteran:8,elite:8},timer:28,reward:{ore:30,tech:15},text:'Gate-Verteidigung',textEn:'Gate defense'},
     {id:'3-6',name:'Die Helden von P3X-666',nameEn:'The Heroes of P3X-666',planet:'p3x666',goal:'Bedrängtes SG-13 Team evakuieren',goalEn:'Evacuate pinned-down SG-13 team',map:'jungle',theme:'jungle',type:'defense',enemies:{jaffa:8,veteran:6,elite:4},timer:30,reward:{medicine:45,tech:35},text:'SG-13 gerettet',textEn:'SG-13 saved'},
   {id:'3-5',name:'Apophis',nameEn:'Apophis',planet:'flag',goal:'Apophis besiegen',goalEn:'Defeat Apophis',map:'hatak',theme:'hatak',type:'assault',enemies:{elite:8,veteran:12,goauld:1},timer:32,reward:{tech:30,ore:25},text:'Apophis tot',textEn:'Apophis dead'},
 ]},
 {title:'Kapitel 4 – Replikatoren',titleEn:'Chapter 4 – Replicators',sub:'Strand, Sand, Drohnen, das Geräusch.',subEn:'Beach, sand, drones, the sound.',missions:[
  {id:'4-1',name:'B-612',nameEn:'B-612',planet:'p5u666',goal:'Scan + Exfil',goalEn:'Scan + exfil',map:'desert',type:'assault',enemies:{drone:6,repl:4},timer:30,reward:{tech:15},text:'Replikat-Studie',textEn:'Replicate study'},
  {id:'4-2',name:'Die Wehr',nameEn:'The Militia',planet:'ennui',goal:'Dorf verteidigen',goalEn:'Defend the village',map:'jungle',type:'defense',enemies:{drone:10,repl:6},timer:28,reward:{ore:25,food:10},text:'Jaffa befreit',textEn:'Jaffa freed'},
  {id:'4-3',name:'Die Höhle',nameEn:'The Cave',planet:'kern',goal:'Mine sichern',goalEn:'Secure the mine',map:'city',type:'assault',enemies:{repl:4,drone:8},timer:28,reward:{tech:20},text:'Replikat-Kanone',textEn:'Replicate cannon'},
  {id:'4-4',name:'Der Stock',nameEn:'The Staff',planet:'p7j989',goal:'Knoten zerstören',goalEn:'Destroy the node',map:'desert',type:'assault',enemies:{repl:6,drone:8},timer:28,reward:{tech:25},text:'Stock-Knoten',textEn:'Staff node'},
     {id:'4-6',name:'Der Klon des Anubis',nameEn:'Prototype of Anubis',planet:'p3x584',goal:'Genetisches Labor neutralisieren',goalEn:'Neutralize genetic laboratory',map:'city',type:'assault',enemies:{elite:8,drone:6,repl:4},timer:28,reward:{tech:45,ore:35},text:'Genetische Proben gesichert',textEn:'Genetic samples secured'},
   {id:'4-5',name:'Die Königin',nameEn:'The Queen',planet:'nexus',goal:'Königin besiegen',goalEn:'Defeat the queen',map:'hatak',theme:'hatak',type:'assault',enemies:{repl:6,drone:8,queen:1},timer:32,reward:{tech:30,ore:25},text:'Königin tot',textEn:'Queen dead'},
 ]},
 {title:'Kapitel 5 – Das Ende',titleEn:'Chapter 5 – The End',sub:'Neue Götter mit Marketingplan.',subEn:'New gods with a marketing plan.',missions:[
  {id:'5-1',name:'Die Sitzung',nameEn:'The Board Meeting',planet:'ori',goal:'3 Lords besiegen',goalEn:'Defeat 3 Lords',map:'hatak',theme:'hatak',type:'assault',enemies:{elite:8,goauld:3},timer:32,reward:{tech:30},text:'Lords besiegt',textEn:'Lords defeated'},
  {id:'5-2',name:'Das zweite Gate',nameEn:'The Second Gate',planet:'flag',goal:'Gate-Knoten B zerstören',goalEn:'Destroy gate node B',map:'sgc',type:'defense',enemies:{veteran:8,elite:10},timer:28,reward:{tech:25,ore:20},text:'Gate-Verteidigung',textEn:'Gate defense'},
  {id:'5-3',name:'Antiker Tor',nameEn:'Ancient Door',planet:'p5u666',goal:'Antike Tür öffnen',goalEn:'Open the ancient door',map:'jungle',theme:'jungle',type:'assault',enemies:{elite:8},timer:28,reward:{tech:30},text:'Antike Tür',textEn:'Ancient door'},
  {id:'5-4',name:'Galaxy-Mitte',nameEn:'Galaxy Center',planet:'kern',goal:'Amon besiegen',goalEn:'Defeat Amon',map:'hatak',theme:'hatak',type:'assault',enemies:{elite:10,goauld:1},timer:32,reward:{tech:30,ore:25},text:'Amon tot',textEn:'Amon dead'},
  {id:'5-5',name:'Der Plan',nameEn:'The Plan',planet:'nexus',goal:'Super-Gate überlasten',goalEn:'Overload the super-gate',map:'hatak',theme:'hatak',type:'assault',enemies:{elite:12,goauld:2},timer:32,reward:{tech:35},text:'Super-Gate',textEn:'Super-Gate'},
     {id:'5-7',name:'Das Supergate von Kallana',nameEn:'The Supergate of Kallana',planet:'kallana',goal:'Ori-Brückenkopf kollabieren lassen',goalEn:'Collapse the Ori bridgehead',map:'desert',type:'assault',enemies:{elite:10,goauld:2},timer:32,reward:{tech:60,ore:50},text:'Supergate zerstört',textEn:'Supergate destroyed'},
   {id:'5-6',name:'Home',nameEn:'Home',planet:'sgc',goal:'Zuhause',goalEn:'Home',map:'desert',type:'defense',enemies:{veteran:12},timer:30,reward:{},text:'Zuhause',textEn:'Home'},
 ]},
];

// Tech-Tree (Gate, Waffen, Schilde, Antiker/Alien-Wissen)
const TECH=[
 ['G1','Gate-Stabilisierer','Extraktion-Beute +10%','Gate Stabilizer','Extraction loot +10%',20,'g',null],
 ['G2','Fast Dialing','+1 Dial-Kapazität','Fast Dialing','+1 dial capacity',25,'g','G1'],
 ['G3','Subraum-Puffer','Verringert Erkundungsrisiko um 15%','Subspace Buffer','Reduces exploration threat by 15%',40,'g','G2'],
 ['W1','Stunner','+5 Morale nach Sieg','Stunner','+5 morale after victory',20,'w',null],
 ['W2','Zat',"+20% Schaden vs Goa'uld/Replikatoren",'Zat',"+20% damage vs Goa'uld/replicators",30,'w','W1'],
 ['W3','Shielded Weapons','+10% Schaden','Shielded Weapons','+10% damage',45,'w','W2'],
 ['W4','Trinium-Munition','+15% Panzerdurchschlagskraft','Trinium Munitions','+15% armor piercing damage',55,'w','W3'],
 ['S1','Personal Shields','−20% Schaden erlitten','Personal Shields','−20% damage taken',25,'s',null],
 ['S2','Team Shield','+25% max HP','Team Shield','+25% max HP',45,'s','S1'],
 ['S3','Naquadah-Legierung','+15% Basis-Integrität & Abwehr','Naquadah Alloy','+15% base integrity & defense',50,'s','S2'],
 ['A1','Kristall-Datenbank','+30% schnellere Forschungspunkte (RP)','Crystal Database','+30% faster research point gain',30,'a',null],
 ['A2','Antike Heilmatrix','+50% Heilungsrate in der Krankenstation','Ancient Healing Matrix','+50% healing rate in Infirmary',45,'a','A1'],
 ['A3','ZPM-Interface','Maximale Energie-Effizienz (+25 permanente Energie)','ZPM Interface','Maximum energy efficiency (+25 permanent power)',65,'a','A2'],
];

// Basis-Events (Bürokratie-Humor)
const EVENTS=[
 'Formular 27B/6 wurde in dreifacher Ausführung abgelehnt. Niemand weiß, warum.',
 'Das Pentagon fragt, ob "Gate" auch ohne "Stern" funktioniert.',
 'Die Kantine meldet: Wieder Wackelpudding. Morale-Effekt: keiner (Gewohnheit).',
 'Ein Senator verlangt einen Report in zwei Absätzen. Er bekommt drei.',
 'Thor lässt ausrichten: "Beschwerden bitte schriftlich." Die Asgard lesen nicht.',
 'Sicherheitsrichtlinie Gate-Netz überarbeitet. Gültig ab gestern.',
 'Jemand hat Dr. Jacksons Kaffeetasse in Quarantäne gestellt.',
 'C. ist 9 Tage lang im Labor. O\'Neill: "Teal\'c, Lunch. (C.)"',
 'Kaffee aus. −5 Morale (3 Tage). Das einzige Event ohne Counter.',
 'O\'Neill\'s Knie. +3 Morale (alle). "Er macht Witze."',
];

 // English mirror of EVENTS (Bürokratie-Humor)
const EVENTS_EN=[
 'Form 27B/6 was rejected in triplicate. Nobody knows why.',
 'The Pentagon asks whether "Gate" also works without the "Star".',
 'The canteen reports: wobbly pudding again. Morale effect: none (habit).',
 'A senator demands a report in two paragraphs. He gets three.',
 'Thor sends a message: "Please submit complaints in writing." The Asgard don\'t read.',
 'Security policy for the gate network revised. Effective yesterday.',
 'Someone put Dr. Jackson\'s coffee mug in quarantine.',
 'C. has been in the lab for 9 days. O\'Neill: "Teal\'c, lunch. (C.)"',
 'Coffee out. −5 morale (3 days). The only event without a counter.',
 'O\'Neill\'s knee. +3 morale (all). "He tells jokes."',
];

const BASE_COLS=8,BASE_LEVELS=28;
const BASE_ROOM_LEVEL={
 gate:{level:28,x:0},generator:{level:9,x:0},lab:{level:19,x:2},
 workshop:{level:16,x:2},barracks:{level:25,x:2},medbay:{level:21,x:2},
 training:{level:18,x:4},armory:{level:16,x:5},water:{level:4,x:2},
 storage:{level:4,x:4},canteen:{level:3,x:2},
};

// Raum-Typen (Shelter-Basis)
const ROOMS={
 gate:{name:'Torraum & Gate',nameEn:'Gateroom & Gate',w:2,h:2,power:-10,staff:0,cost:{},icon:'◎',desc:'Torraum & Stargate (Level 28/27)',descEn:'Gateroom & Stargate (Level 28/27)'},
 generator:{name:'Generator',nameEn:'Generator',w:1,h:1,power:10,staff:1,cost:{ore:220},icon:'⚡',desc:'+10 Power',descEn:'+10 power'},
 lab:{name:'Labor',nameEn:'Lab',w:1,h:1,power:-2,staff:2,cost:{ore:350,tech:30},icon:'🔬',desc:'+10 RP/Staff',descEn:'+10 RP/staff'},
 workshop:{name:'Werkstatt',nameEn:'Workshop',w:1,h:1,power:-3,staff:2,cost:{ore:300,tech:30},icon:'🛠',desc:'+Erz/Staff',descEn:'+Ore/staff'},
 barracks:{name:'Kaserne',nameEn:'Barracks',w:1,h:1,power:-1,staff:4,cost:{ore:220},icon:'🛏',desc:'Beherbergt 4, +Morale',descEn:'Houses 4, +morale'},
 medbay:{name:'MedBay',nameEn:'MedBay',w:1,h:1,power:-2,staff:2,cost:{ore:380,tech:25},icon:'⚕',desc:'+10 HP/Staff',descEn:'+10 HP/staff'},
 training:{name:'Training',nameEn:'Training',w:1,h:2,power:-2,staff:2,cost:{ore:500,tech:50},icon:'🏋',desc:'+2 XP/Staff',descEn:'+2 XP/staff'},
 armory:{name:'Armory',nameEn:'Armory',w:1,h:2,power:-2,staff:1,cost:{ore:450,tech:50},icon:'🔫',desc:'+Schaden',descEn:'+damage'},
 water:{name:'Wasserwerk',nameEn:'Water Works',w:1,h:1,power:-1,staff:1,cost:{ore:260,tech:20},icon:'💧',desc:'Life-Support (Pflicht)',descEn:'Life support (required)'},
 storage:{name:'Lager',nameEn:'Storage',w:1,h:1,power:0,staff:0,cost:{ore:180},icon:'📦',desc:'+Kapazität',descEn:'+capacity'},
 canteen:{name:'Kantine',nameEn:'Canteen',w:1,h:1,power:-1,staff:1,cost:{ore:250},icon:'🍽',desc:'+Morale',descEn:'+morale'},
};

// ===================== Zustand =====================
let S=null;

function defaultInventory(){
  const spec={medkit:3,shield:1,smoke:1,emp:0};
  return {
    weapons:{rifle:2,shotgun:1,pistol:2,zat:0,staff:0,staffLong:0},
    armor:{light:2,medium:1,heavy:0},
    special:spec,
    specials:spec,
  };
}

// ===================== Offworld Koloniebau & Persistente Planeten (Civ / SimCity Layer) =====================
const COLONY_BUILDINGS={
  gate:{id:'gate',name:'Stargate-Ring',nameEn:'Stargate Ring',icon:'⛩',cost:{},power:0,def:10,yield:{},desc:'Planetares Sternentor & Verbindung zur Erde (fest)',descEn:'Planetary stargate & link to Earth (fixed)'},
  gate_defense:{id:'gate_defense',name:'Gate-Befestigung',nameEn:'Gate Fortress',icon:'🧱',cost:{ore:20,tech:5},power:0,def:20,yield:{},desc:'Sandsäcke & Flak-Stellungen um das Gate (+20 Verteidigung)',descEn:'Sandbags & flak positions around the gate (+20 defense)'},
  mine:{id:'mine',name:'Naquadah-Mine',nameEn:'Naquadah Mine',icon:'⛏',cost:{ore:35,tech:10},power:-2,def:0,yield:{ore:6},desc:'Tiefenbohrung nach Naquadah-Erz (+6 Erz/Tag, -2 Energie)',descEn:'Deep drilling for naquadah ore (+6 ore/day, -2 energy)'},
  lab:{id:'lab',name:'Antiker-Forschungslabor',nameEn:'Ancient Research Lab',icon:'🔬',cost:{ore:30,tech:20},power:-3,def:0,yield:{tech:5},desc:'Analyse außerirdischer Relikte (+5 Tech/Tag, -3 Energie)',descEn:'Analysis of alien relics (+5 tech/day, -3 energy)'},
  hangar:{id:'hangar',name:'UAV & Jumper-Hangar',nameEn:'UAV & Jumper Hangar',icon:'🛸',cost:{ore:45,tech:25},power:-2,def:15,yield:{tech:2,ore:2},desc:'Luftaufklärung & Patrouillen (+15 Verteidigung, +2 Erz, +2 Tech)',descEn:'Aerial recon & patrols (+15 defense, +2 ore, +2 tech)'},
  reactor:{id:'reactor',name:'Naquadah-Reaktor',nameEn:'Naquadah Reactor',icon:'⚡',cost:{ore:40,tech:15},power:12,def:5,yield:{},desc:'Kompakt-Reaktor (+12 Energie für die Kolonie)',descEn:'Compact reactor (+12 energy for the colony)'},
  dome:{id:'dome',name:'Schutzschild-Kuppel',nameEn:'Shield Dome',icon:'🛡',cost:{ore:50,tech:30},power:-4,def:30,yield:{},desc:'Antiker-Kraftfeldkuppel (+30 Verteidigung, schützt Kolonie)',descEn:'Ancient force-field dome (+30 defense, protects the colony)'},
  hospital:{id:'hospital',name:'Feldlazarett',nameEn:'Field Hospital',icon:'✚',cost:{ore:25,tech:10},power:-1,def:0,yield:{medicine:2},desc:'Medizinische Station (+2 Medizin/Tag, heilt Truppen)',descEn:'Medical station (+2 medicine/day, heals troops)'},
  barracks:{id:'barracks',name:'SG-Garnisonslager',nameEn:'SG Garrison Camp',icon:'🏕',cost:{ore:30,tech:10},power:-1,def:15,yield:{},desc:'Stationierte Wachmannschaft (+15 Verteidigung)',descEn:'Stationed garrison (+15 defense)'},
};

function defaultKeybinds(){
  return {
    moveUp:'KeyW',moveDown:'KeyS',moveLeft:'KeyA',moveRight:'KeyD',
    rotateLeft:'KeyQ',rotateRight:'KeyE',cycleGfx:'KeyV',
    nextUnit:'Tab',endTurn:'Space',pause:'Escape',
    zoomIn:'Equal',zoomOut:'Minus',
    overwatch:'KeyO'
  };
}

function createColonyState(planetId){
  const p=PLANETS[planetId];
  const gridW=6,gridH=5;
  const sectors=[];
  for(let y=0;y<gridH;y++){
    for(let x=0;x<gridW;x++){
      if(x===2&&y===2){
        sectors.push({x,y,building:'gate',lvl:1,hp:100});
      }else if((x===1&&y===2)||(x===3&&y===2)){
        sectors.push({x,y,building:'gate_defense',lvl:1,hp:60});
      }else{
        sectors.push({x,y,building:null,lvl:0,hp:0});
      }
    }
  }
  return {
    planet:planetId,
    name:p?(p.name+' Außenposten'):'Kolonie',
    founded:true,
    dayFounded:typeof S!=='undefined'&&S?S.day:1,
    sectors,
    gridW,
    gridH
  };
}

function getColonyStats(col){
  if(!col||!col.sectors)return {power:0,powerUsed:0,defense:0,yield:{ore:0,tech:0,medicine:0},buildingsCount:0};
  let power=0,powerUsed=0,defense=0;
  const yld={ore:0,tech:0,medicine:0};
  let count=0;
  col.sectors.forEach(s=>{
    if(!s.building)return;
    const b=COLONY_BUILDINGS[s.building];
    if(!b)return;
    count++;
    const mult=1+(s.lvl-1)*0.5;
    if(b.power>0)power+=Math.round(b.power*mult);
    else powerUsed+=Math.abs(b.power);
    defense+=Math.round(b.def*mult);
    if(b.yield){
      for(const k in b.yield)yld[k]=(yld[k]||0)+Math.round((b.yield[k]||0)*mult);
    }
  });
  return {power,powerUsed,defense,yield:yld,buildingsCount:count};
}

function foundColony(planetId){
  if(!S.planets[planetId]||!S.planets[planetId].disc)return R(false,'Planet noch nicht erforscht.');
  if(S.colonies[planetId])return R(false,'Kolonie existiert bereits.');
  const cost={ore:40,tech:20};
  for(const k in cost)if(S.res[k]<cost[k])return R(false,`Nicht genug ${k} (${cost[k]} benötigt).`);
  for(const k in cost)S.res[k]-=cost[k];
  S.colonies[planetId]=createColonyState(planetId);
  const p=PLANETS[planetId];
  note(`🪐 Neuer Außenposten gegründet: ${p?p.name:planetId}!`);
  return R(true,`Außenposten auf ${p?p.name:planetId} errichtet.`);
}

function buildColonySector(planetId,x,y,type){
  const col=S.colonies[planetId];if(!col)return R(false,'Kolonie nicht gefunden.');
  const s=col.sectors.find(sec=>sec.x===x&&sec.y===y);
  if(!s)return R(false,'Ungültiger Sektor.');
  if(s.building)return R(false,'Sektor bereits bebaut.');
  const b=COLONY_BUILDINGS[type];if(!b)return R(false,'Unbekanntes Gebäude.');
  for(const k in b.cost)if(S.res[k]<(b.cost[k]||0))return R(false,`Nicht genug ${k}.`);
  for(const k in b.cost)S.res[k]-=(b.cost[k]||0);
  s.building=type;s.lvl=1;s.hp=80;
  note(`🏗 ${b.name} im Sektor (${x},${y}) errichtet.`);
  return R(true,`${b.name} gebaut.`);
}

function upgradeColonySector(planetId,x,y){
  const col=S.colonies[planetId];if(!col)return R(false,'Kolonie nicht gefunden.');
  const s=col.sectors.find(sec=>sec.x===x&&sec.y===y);
  if(!s||!s.building)return R(false,'Kein Gebäude vorhanden.');
  if(s.lvl>=3)return R(false,'Bereits maximale Stufe.');
  const b=COLONY_BUILDINGS[s.building];
  const upCost={ore:Math.round(25*s.lvl),tech:Math.round(15*s.lvl)};
  for(const k in upCost)if(S.res[k]<(upCost[k]||0))return R(false,`Nicht genug ${k} für Upgrade.`);
  for(const k in upCost)S.res[k]-=(upCost[k]||0);
  s.lvl++;s.hp+=40;
  note(`⬆ ${b.name} auf Stufe ${s.lvl} aufgewertet!`);
  return R(true,`${b.name} nun Stufe ${s.lvl}.`);
}

function demolishColonySector(planetId,x,y){
  const col=S.colonies[planetId];if(!col)return R(false,'Kolonie nicht gefunden.');
  const s=col.sectors.find(sec=>sec.x===x&&sec.y===y);
  if(!s||!s.building)return R(false,'Kein Gebäude vorhanden.');
  if(s.building==='gate')return R(false,'Das Stargate kann nicht abgerissen werden!');
  s.building=null;s.lvl=0;s.hp=0;
  note(`🔨 Sektor (${x},${y}) zurückgebaut.`);
  return R(true,'Sektor geräumt.');
}

function defaultTeamForChar(i,p){
  if(p.sg1||i<=3)return 'sg1';
  if(i===5||i===15||i===16)return 'sg2';
  if(i===8||i===17||i===18)return 'sg3';
  if(i===4||i===19||i===20)return 'sg4';
  if(i===7||i===21||i===22)return 'sg5';
  return 'sg'+(2+(i%4));
}

function newGame(){
  const roster=POOL.map((p,i)=>({
    id:i,name:p.name,cls:p.cls,hp:p.hp,maxHp:p.hp,move:p.move,
    weapon:p.weapon,melee:p.melee||null,armor:i===3?'medium':(i===0?'light':null),
    special:i===1?'medkit':(i===2?'smoke':null),
    sg1:!!p.sg1,team:defaultTeamForChar(i,p),talent:p.talent,
    lvl:1,xp:0,morale:85,fatigue:0,injuries:0,dead:false,room:-1,
    recruited:START.includes(i)
  }));
  const base={grid:Array(BASE_COLS*BASE_LEVELS).fill(null),rooms:{},nextId:1};
  addRoom(base,'gate',0,0);
  addRoom(base,'generator',0,BASE_LEVELS-9);
  addRoom(base,'generator',1,BASE_LEVELS-9);
  addRoom(base,'lab',2,BASE_LEVELS-19);
  addRoom(base,'workshop',2,BASE_LEVELS-16);
  addRoom(base,'barracks',2,BASE_LEVELS-25);
  addRoom(base,'medbay',2,BASE_LEVELS-21);
  addRoom(base,'water',2,BASE_LEVELS-4);
  addRoom(base,'armory',5,BASE_LEVELS-16);
  S={
    v:4,day:1,chapter:0,integrity:100,
    res:{ore:800,tech:140,medicine:50,food:80},
    inventory:defaultInventory(),
    commander:'hammond',
    gfxMode:'pixel', // 'pixel' (Isometric Voxel) | 'ascii' (asciiid-Mode) | 'topdown'
    audioDance:true,
    controllerVibration:true,
    keybinds:defaultKeybinds(),
    customTracks:{},
    unlockedTracks:['theme_fanfare','theme_remix_0','theme_remix_2','theme_outro','base','map'],
    colonies:{},
    roster,base,
    planets:{},
    research:{rp:0,queue:null,done:[]},
    done:[],log:[],rlog:[],
    over:null,memorial:[],sandUsed:false,quests:[],
    difficulty:'easy',jaffaSeen:false,jaffaKills:0,
    introSeen:false,pilotBriefingSeen:false,
  };
  for(const id in PLANETS)S.planets[id]={disc:PLANETS[id].ch<=0};
  note('Willkommen, Kommandant. SG-1 verliert nie – dieses Dokument regelt nur, wie.');
}

function addRoom(base,type,x,y){
  const R=ROOMS[type];
  const id=base.nextId++;
  base.rooms[id]={id,type,x,y,w:R.w,h:R.h,staff:[]};
  for(let dy=0;dy<R.h;dy++)for(let dx=0;dx<R.w;dx++){
    base.grid[(y+dy)*BASE_COLS+(x+dx)]=id;
  }
  return id;
}

function save(){
  try{
    const data=JSON.stringify(S);
    localStorage.setItem(SAVE_KEY,data);
    const activeSlot=(typeof SGC_SAVES!=='undefined'&&SGC_SAVES.activeSlot)||'slot1';
    localStorage.setItem('sgc_save_'+activeSlot,data);
  }catch(e){}
}

function ensureGateLayout(base){
  if(!base||!base.rooms||!base.grid)return;
  const gateRoom=Object.values(base.rooms).find(r=>r.type==='gate');
  if(!gateRoom)return;
  if(gateRoom.x!==0||gateRoom.y!==0||gateRoom.w!==2||gateRoom.h!==2){
    for(let i=0;i<base.grid.length;i++){
      if(base.grid[i]===gateRoom.id)base.grid[i]=null;
    }
    for(let dy=0;dy<2;dy++){
      for(let dx=0;dx<2;dx++){
        const occId=base.grid[(0+dy)*BASE_COLS+(0+dx)];
        if(occId&&occId!==gateRoom.id){
          const displaced=base.rooms[occId];
          if(displaced&&displaced.type!=='gate'){
            displaced.x=BASE_COLS-1;
          }
          base.grid[(0+dy)*BASE_COLS+(0+dx)]=null;
        }
      }
    }
    gateRoom.x=0;gateRoom.y=0;gateRoom.w=2;gateRoom.h=2;
    for(let dy=0;dy<2;dy++){
      for(let dx=0;dx<2;dx++){
        base.grid[(0+dy)*BASE_COLS+(0+dx)]=gateRoom.id;
      }
    }
  }
}

function load(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(s&&s.v===4){
      S=s;
      migrateBaseLevels();
      ensureGateLayout(S.base);
      if(!S.planets)S.planets={};
      for(const id in PLANETS)if(!S.planets[id])S.planets[id]={disc:PLANETS[id].ch<=(S.chapter||0)};
      if(S.pilotBriefingSeen===undefined)S.pilotBriefingSeen=false;
      if(S.introSeen===undefined)S.introSeen=false;
      if(!S.inventory)S.inventory=defaultInventory();
      if(!S.commander)S.commander='hammond';
      if(!S.gfxMode)S.gfxMode='pixel';
      if(!S.colonies)S.colonies={};
      if(S.audioDance===undefined)S.audioDance=true;
      if(S.controllerVibration===undefined)S.controllerVibration=true;
      if(!S.keybinds)S.keybinds=defaultKeybinds();
      if(!S.customTracks)S.customTracks={};
      if(!S.unlockedTracks)S.unlockedTracks=['theme_fanfare','theme_remix_0','theme_remix_2','theme_outro','base','map'];
      if(!S.res)S.res={ore:800,tech:140,medicine:50,food:80};
      if(S.res.ore<300)S.res.ore=Math.max(S.res.ore,600);
      if(S.res.tech<40)S.res.tech=Math.max(S.res.tech,100);
      if(S.res.medicine<20)S.res.medicine=Math.max(S.res.medicine,40);
      if(S.res.food<30)S.res.food=Math.max(S.res.food,60);
      if(S.integrity===undefined)S.integrity=100;
      if(S.base&&S.base.rooms&&!Object.values(S.base.rooms).some(r=>r.type==='medbay')){
        addRoom(S.base,'medbay',2,BASE_LEVELS-21);
      }
      (S.roster||[]).forEach((m,i)=>{
        if(m.armor===undefined)m.armor=null;
        if(m.special===undefined)m.special=null;
        if(!m.team)m.team=defaultTeamForChar(i,m);
      });
      return true;
    }
    function migrateBaseLevels(){
      if(!S.base||S.base.grid.length===BASE_COLS*BASE_LEVELS)return;
      const grid=Array(BASE_COLS*BASE_LEVELS).fill(null);
      const rooms=Object.values(S.base.rooms).sort((a,b)=>a.id-b.id);
      rooms.forEach(r=>{
        const spec=ROOMS[r.type],preferred=BASE_ROOM_LEVEL[r.type]||{level:Math.max(1,BASE_LEVELS-Math.round((r.y||0)*2)),x:r.x||0};
        if(spec){r.w=spec.w;r.h=spec.h;}
        const preferredY=BASE_LEVELS-preferred.level;
        let placed=false;
        for(let radius=0;radius<BASE_LEVELS&&!placed;radius++){
          const rows=radius===0?[preferredY]:[preferredY-radius,preferredY+radius];
          for(const y of rows){
            if(y<0||y+r.h>BASE_LEVELS)continue;
            for(let offset=0;offset<BASE_COLS&&!placed;offset++){
              const x=(preferred.x+offset)%BASE_COLS;
              if(x+r.w>BASE_COLS)continue;
              let clear=true;
              for(let dy=0;dy<r.h;dy++)for(let dx=0;dx<r.w;dx++)if(grid[(y+dy)*BASE_COLS+x+dx]!==null)clear=false;
              if(!clear)continue;
              r.x=x;r.y=y;placed=true;
              for(let dy=0;dy<r.h;dy++)for(let dx=0;dx<r.w;dx++)grid[(y+dy)*BASE_COLS+x+dx]=r.id;
            }
          }
        }
        if(!placed)throw new Error(`Could not migrate base room ${r.id} (${r.type}) into the 28-level layout.`);
      });
      S.base.grid=grid;
    }
  }catch(e){
    if(typeof console!=='undefined'&&console.error)console.error('Spielstand konnte nicht geladen werden; ein neues Spiel wird gestartet.',e);
  }
  return false;
}

// ===================== Multi-Slot Savegames & Cookie-Clicker Export/Import =====================
const SGC_SAVES = {
  activeSlot: (typeof localStorage !== 'undefined' && localStorage.getItem('sgc_active_slot')) || 'slot1',
  slots: ['slot1', 'slot2', 'slot3'],

  getSlotKey(id) { return `sgc_save_${id || this.activeSlot}`; },

  saveToSlot(slotId) {
    const id = slotId || this.activeSlot;
    const key = this.getSlotKey(id);
    const data = JSON.stringify(S);
    try {
      localStorage.setItem(key, data);
      localStorage.setItem(SAVE_KEY, data);
      localStorage.setItem('sgc_active_slot', id);
      this.activeSlot = id;
      return true;
    } catch(e) { return false; }
  },

  loadFromSlot(slotId) {
    const id = slotId || this.activeSlot;
    const key = this.getSlotKey(id);
    try {
      let raw = localStorage.getItem(key);
      if(!raw && id === 'slot1') raw = localStorage.getItem(SAVE_KEY);
      if(!raw) return false;
      const parsed = JSON.parse(raw);
      if(parsed && parsed.v === 4) {
        S = parsed;
        localStorage.setItem(SAVE_KEY, raw);
        localStorage.setItem('sgc_active_slot', id);
        this.activeSlot = id;
        load();
        return true;
      }
    } catch(e) { return false; }
    return false;
  },

  deleteSlot(slotId) {
    try {
      localStorage.removeItem(this.getSlotKey(slotId));
      return true;
    } catch(e) { return false; }
  },

  getSlotInfo(slotId) {
    const key = this.getSlotKey(slotId);
    try {
      let raw = localStorage.getItem(key);
      if(!raw && slotId === 'slot1') raw = localStorage.getItem(SAVE_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      const aliveUnits = (parsed.roster || []).filter(u => u.recruited && !u.dead).length;
      return {
        id: slotId,
        day: parsed.day || 1,
        chapter: (parsed.chapter !== undefined ? parsed.chapter + 1 : 1),
        commander: parsed.commander || 'hammond',
        ore: (parsed.res && parsed.res.ore) || 0,
        tech: (parsed.res && parsed.res.tech) || 0,
        rp: (parsed.research && parsed.research.rp) || 0,
        units: aliveUnits,
        raw
      };
    } catch(e) { return null; }
  },

  exportString(slotId) {
    const info = this.getSlotInfo(slotId || this.activeSlot);
    const raw = (info && info.raw) || JSON.stringify(S);
    try {
      return btoa(unescape(encodeURIComponent(raw)));
    } catch(e) {
      return raw;
    }
  },

  importString(inputStr) {
    if(!inputStr || typeof inputStr !== 'string') return { ok: false, err: 'Ungültige Eingabe.' };
    let jsonStr = inputStr.trim();
    if(!jsonStr.startsWith('{')) {
      try {
        jsonStr = decodeURIComponent(escape(atob(jsonStr)));
      } catch(e) {
        try { jsonStr = atob(jsonStr); } catch(e2) { return { ok: false, err: 'Base64-Dekodierung fehlgeschlagen.' }; }
      }
    }
    try {
      const parsed = JSON.parse(jsonStr);
      if(!parsed || parsed.v !== 4 || !parsed.res || !parsed.roster) {
        return { ok: false, err: 'Ungültiges SGC-Savegame-Format (Version 4 erwartet).' };
      }
      S = parsed;
      this.saveToSlot(this.activeSlot);
      load();
      return { ok: true };
    } catch(err) {
      return { ok: false, err: 'JSON-Parse-Fehler: ' + err.message };
    }
  },

  presets: {
    sgc_defense: {
      name: 'SGC Ebene 28: Infiltrationsalarm (Foothold)',
      desc: 'Alarmstufe Rot im Cheyenne Mountain Complex! Feindliche Truppen dringen durch das Tor auf Ebene 28 ein. SG-1 verteidigt Torraum & Kontrollraum.',
      create() {
        newGame();
        S.commander = 'hammond';
        S.day = 12;
        S.chapter = 1;
        S.res = { ore: 950, tech: 220, medicine: 90, food: 100 };
        [0, 1, 2, 3].forEach(id => {
          if(S.roster[id]) {
            S.roster[id].recruited = true;
            S.roster[id].lvl = 3;
            S.roster[id].maxHp = 55;
            S.roster[id].hp = 55;
            S.roster[id].armor = 'medium';
          }
        });
        return JSON.stringify(S);
      }
    },

    fresh: {
      name: 'Frischer Start (Tag 1)',
      desc: 'General Hammond, unberührtes Tornetzwerk, Standard-Ressourcen.',
      create() {
        newGame();
        return JSON.stringify(S);
      }
    },
    research_lab: {
      name: 'Forschung & Ausbau (Ebene 19)',
      desc: 'Samantha Carter, voll besetztes Labor auf Ebene 19, 180 RP, G1 erforscht, Reaktor aktiv.',
      create() {
        newGame();
        S.commander = 'carter';
        S.day = 5;
        S.chapter = 1;
        S.res = { ore: 1200, tech: 280, medicine: 80, food: 110 };
        if(!S.research) S.research = { rp: 180, queue: 'W1', done: ['G1'] };
        else { S.research.rp = 180; S.research.queue = 'W1'; S.research.done = ['G1']; }
        addRoom(S.base, 'lab', 4, BASE_LEVELS - 19);
        addRoom(S.base, 'generator', 2, BASE_LEVELS - 25);
        return JSON.stringify(S);
      }
    },
    medbay_crisis: {
      name: 'Hospital-Notfall (Ebene 21)',
      desc: 'Dr. Janet Fraiser, 2 schwer verwundete Soldaten mit Verletzungen, Vorräte an Medizin & Tretonin.',
      create() {
        newGame();
        S.day = 8;
        S.chapter = 1;
        S.res = { ore: 600, tech: 90, medicine: 120, food: 70 };
        if(S.roster[0]) { S.roster[0].hp = 14; S.roster[0].injuries = 2; S.roster[0].fatigue = 60; }
        if(S.roster[1]) { S.roster[1].hp = 22; S.roster[1].injuries = 1; S.roster[1].fatigue = 45; }
        if(!S.inventory) S.inventory = defaultInventory();
        S.inventory.specials.tretonin = 3;
        S.inventory.specials.medkit = 4;
        return JSON.stringify(S);
      }
    },
    endgame: {
      name: 'Endgame & Antiker-Tech (Kapitel 3)',
      desc: 'General Landry, Antiker-Kristalldatenbank & ZPM erforscht, Kolonien auf Abydos & Alpha, Zat-Gewehre.',
      create() {
        newGame();
        S.commander = 'landry';
        S.day = 24;
        S.chapter = 2;
        S.res = { ore: 2800, tech: 650, medicine: 240, food: 320 };
        S.research = { rp: 340, queue: null, done: ['G1', 'G2', 'W1', 'W2', 'S1', 'S2', 'A1', 'A2', 'A3'] };
        S.colonies = {
          abydos: { name: 'Abydos Minenkolonie', power: 45, defense: 60, orePerDay: 18, techPerDay: 8, grid: {} },
          alpha: { name: 'Alpha-Stützpunkt', power: 30, defense: 80, orePerDay: 12, techPerDay: 15, grid: {} }
        };
        (S.roster || []).forEach(u => {
          if(u.recruited) {
            u.lvl = 5;
            u.maxHp = 70;
            u.hp = 70;
            u.weapon = 'zat';
            u.armor = 'heavy';
          }
        });
        return JSON.stringify(S);
      }
    }
  },

  loadPreset(presetKey) {
    const p = this.presets[presetKey];
    if(!p) return false;
    const jsonStr = p.create();
    return this.importString(jsonStr).ok;
  }
};
if(typeof window !== 'undefined'){ window.SGC_SAVES = SGC_SAVES; }
if(typeof globalThis !== 'undefined'){ globalThis.SGC_SAVES = SGC_SAVES; }

function gameNote(t){
  if(typeof S==='undefined'||!S)return;
  const l=`[T${S.day}] ${t}`;
  S.log.unshift(l);
  if(S.log.length>200)S.log.pop();
  S.rlog.push(t);
}
function note(t){
  if(typeof window!=='undefined'&&window.strudel&&typeof window.strudel.note==='function'){
    if(typeof t!=='string'||!/[✔💀⚠🩹🎁🤝🪐🏗⬆🔫🎖🖥🏆★＋🔬⚡💥⏱·’üäöß]|(?:^[A-Z][a-z]{3,})/.test(t)){
      try{return window.strudel.note(t);}catch(e){}
    }
  }
  return gameNote(t);
}
if(typeof window!=='undefined'){window.gameNote=gameNote;window.note=note;}
if(typeof globalThis!=='undefined'){globalThis.gameNote=gameNote;globalThis.note=note;}

// Power-Budget
function powerGen(){
  const base=Object.values(S.base.rooms).filter(r=>r.type==='generator').length*10;
  return base+(S.commander==='landry'?10:0);
}
function powerUse(){return Object.values(S.base.rooms).reduce((s,r)=>s+Math.max(0,-ROOMS[r.type].power),0);}
function powerOk(){return powerGen()>=powerUse();}

// Raum-Output
function roomOutput(r){
  const R=ROOMS[r.type];
  const staff=r.staff.map(id=>S.roster[id]).filter(m=>m.recruited&&!m.dead);
  if(!staff.length||!powerOk())return 0;
  let mult=staff.length===1?1:1.8;
  if(r.type==='lab'&&staff.some(m=>m.cls==='scientist'))mult*=1.5;
  if(r.type==='lab'&&S.commander==='weir')mult*=1.25;
  if(r.type==='workshop'&&staff.some(m=>m.cls==='engineer'))mult*=1.5;
  return Math.round(mult*10);
}

// ===================== Tag-Ende =====================
// ===================== Quest-Engine (15 Dossier-Hooks) =====================
// QUESTS (content/quests.js) werden bei Kapitel-Erreichen + rekrutiertem Char aktiv.
// advanceQuests(missionId) schaltet bei Sieg der Hook-Mission die Quest ab (Reward+Epilog).
// failQuests() scheitert eine Quest, wenn ihr Char stirbt (nur Rekruten – SG-1 stirbt nie).
function activeQuests(){return (S.quests||[]).filter(q=>q.status==='active');}
function checkQuests(){
  if(typeof QUESTS==='undefined')return;
  S.quests=S.quests||[];
  QUESTS.forEach(q=>{
    if(S.quests.some(s=>s.id===q.id))return;      // schon bekannt
    if(S.chapter<q.chapter)return;                 // noch zu früh
    const m=S.roster[q.charId];
    if(!m||!m.recruited||m.dead)return;            // Char nicht da / tot
    S.quests.push(Object.assign({},q,{stepIndex:0,status:'active'}));
    note(`📋 Neue Quest: ${q.title} (${q.char})`);S.rlog.push(`📋 Neue Quest: ${q.title} (${q.char})`);
  });
}
function unlockTrack(trackKey){
  if(typeof S==='undefined'||!S)return;
  S.unlockedTracks=S.unlockedTracks||['theme_fanfare','theme_remix_0','theme_remix_2','theme_outro','base','map'];
  if(!S.unlockedTracks.includes(trackKey)){
    S.unlockedTracks.push(trackKey);
    save();
    const tr=typeof STRUDEL_TRACKS!=='undefined'&&STRUDEL_TRACKS[trackKey];
    const name=tr?(tr.title||tr.name):trackKey;
    if(typeof toast==='function')toast(`🎵 Neuer Soundtrack im SGC-AMP freigeschaltet: ${name}!`);
    note(`🎵 Neuer Soundtrack im SGC-AMP freigeschaltet: ${name}`);
  }
}

function advanceQuests(missionId){
  (S.quests||[]).forEach(q=>{
    if(q.status!=='active')return;
    if(q.missionId!==missionId)return;
    q.status='done';q.stepIndex=q.steps.length;
    note(`✔ Quest abgeschlossen: ${q.title}`);S.rlog.push(`✔ Quest: ${q.title}`);
    note(`   ${q.epilogue}`);S.rlog.push(`   ${q.epilogue}`);
    note(`   🎁 ${q.reward}`);S.rlog.push(`   🎁 ${q.reward}`);
    if(q.id==='q-asgard'||q.unlockTrack==='theme_asgard') unlockTrack('theme_asgard');
    if(q.id==='q-atlantis'||q.unlockTrack==='theme_atlantis') unlockTrack('theme_atlantis');
  });
}
function failQuests(){
  (S.quests||[]).forEach(q=>{
    if(q.status!=='active')return;
    const m=S.roster[q.charId];
    if(m&&m.dead){q.status='failed';note(`💀 Quest gescheitert: ${q.title}`);S.rlog.push(`💀 Quest gescheitert: ${q.title}`);note(`   ${q.fail}`);S.rlog.push(`   ${q.fail}`);}
  });
}
function endDay(){
  if(S.over)return;
  S.rlog=[];
  const rooms=Object.values(S.base.rooms);
  let rp=0,ore=0,heal=0,xp=0;
  rooms.forEach(r=>{
    const out=roomOutput(r);
    if(r.type==='lab')rp+=out;
    if(r.type==='workshop')ore+=out;
    if(r.type==='medbay')heal+=out;
    if(r.type==='training')xp+=out;
  });
  S.research.rp+=rp;
  S.res.ore+=ore;
  if(rp||ore||heal||xp)S.rlog.push(`🏗 Produktion: 🔬+${rp} · ⛏+${ore} · ✚${heal} · 🎓${xp}`);
  S.rlog.push(`📦 Passive Versorgung: ⛏+50 · ⚙+15 · ✚+10 · 🍞+15`);
  const qId=S.research.queue;
  const qTech=qId&&getTech(qId);
  if(qTech&&S.research.rp>=qTech.cost){
    S.research.rp-=qTech.cost;
    S.research.done.push(qTech.id);
    S.research.queue=null;
    const msg=`🔬 Forschung abgeschlossen: ${qTech.name}`;
    note(msg);
    S.rlog.push(msg);
  }
  // Passive Income
  S.res.ore+=50;S.res.tech+=15;S.res.medicine+=10;S.res.food+=15;
  // Kolonien: Tägliche Produktion & Verteidigungscheck
  if(S.colonies){
    let colOre=0,colTech=0,colMed=0;
    Object.values(S.colonies).forEach(col=>{
      if(!col||!col.founded)return;
      const stats=getColonyStats(col);
      colOre+=stats.yield.ore||0;
      colTech+=stats.yield.tech||0;
      colMed+=stats.yield.medicine||0;
      const p=PLANETS[col.planet];
      if(p&&(p.type==='hostile'||p.type==='space')&&Math.random()<0.25){
        if(stats.defense>=25){
          note(`🛡 ${col.name}: Feindlicher Jaffa-Überfall durch Garnison & Abwehr zurückgeschlagen!`);
          S.rlog.push(`🛡 ${col.name}: Feindangriff erfolgreich abgewehrt (Verteidigung: ${stats.defense})`);
        }else{
          const dmg=Math.min(15,Math.round(25-stats.defense));
          note(`⚠️ ${col.name}: Jaffa-Raid durchbrach schwache Abwehr! (${dmg} Erz geplündert)`);
          S.rlog.push(`⚠️ ${col.name}: Jaffa-Raid (-${dmg} Erz)`);
          S.res.ore=Math.max(0,S.res.ore-dmg);
        }
      }
    });
    if(colOre||colTech||colMed){
      S.res.ore+=colOre;S.res.tech+=colTech;S.res.medicine+=colMed;
      S.rlog.push(`🪐 Kolonien-Ertrag: ⛏+${colOre} · ⚙+${colTech} · ✚+${colMed}`);
    }
  }
  // Krankenstation- & Personal-Tick (Ebene 21)
  const medbayRoom=Object.values(S.base.rooms).find(r=>r.type==='medbay');
  const hasMedbay=!!medbayRoom;
  const medStaff=(medbayRoom&&medbayRoom.staff.filter(id=>S.roster[id]&&S.roster[id].recruited&&!S.roster[id].dead).length)||0;
  const medBoost=1+(medStaff*0.5);

  const rec=S.roster.filter(m=>m.recruited&&!m.dead);
  const healedLog=[];
  rec.forEach(m=>{
    const inMedbay=m.room>=0&&S.base.rooms[m.room]&&S.base.rooms[m.room].type==='medbay';
    const isWounded=m.hp<m.maxHp||(m.injuries||0)>0||(m.fatigue||0)>0;
    
    if(inMedbay){
      // Intensiv-Bettruhe auf Ebene 21
      const gain=Math.round(35*medBoost);
      const prev=m.hp;
      m.hp=Math.min(m.maxHp,m.hp+gain);
      m.fatigue=0;
      if(m.injuries>0&&Math.random()<0.85)m.injuries--;
      m.morale=Math.min(100,m.morale+5);
      if(prev<m.maxHp||m.injuries>0)healedLog.push(`${m.name.split(' ')[0]} (+${gain} HP${m.injuries===0?', genesen':''})`);
    }else if(hasMedbay&&isWounded){
      // SGC-Ambulanz-Betreuung
      const gain=Math.round(18*medBoost);
      m.hp=Math.min(m.maxHp,m.hp+gain);
      m.fatigue=Math.max(0,m.fatigue-25);
      if(m.injuries>0&&Math.random()<0.40)m.injuries--;
      m.morale=Math.min(100,m.morale+3);
    }else{
      // Kasernenruhe
      if(m.room>=0){
        const r=S.base.rooms[m.room];
        if(r.type==='barracks')m.morale=Math.min(100,m.morale+3);
        if(r.type==='training')m.xp+=Math.round(xp/2);
        if(r.type==='canteen')m.morale=Math.min(100,m.morale+2);
      }else{
        m.morale=Math.min(100,m.morale+2);
      }
      m.hp=Math.min(m.maxHp,m.hp+8);
      m.fatigue=Math.max(0,m.fatigue-15);
      if(m.injuries>0&&Math.random()<0.20)m.injuries--;
    }
    while(m.lvl<12&&m.xp>=30*m.lvl){m.xp-=30*m.lvl;m.lvl++;m.maxHp+=5;m.hp=m.maxHp;note(`★ ${m.name} erreicht Level ${m.lvl}`);}
  });
  if(healedLog.length>0){
    S.rlog.push(`🏥 Krankenstation (Ebene 21): ${healedLog.join(', ')}`);
  }
  if(Math.random()<0.45)note('📎 '+((typeof I18N!=='undefined'&&I18N.lang==='en')?EVENTS_EN:EVENTS)[ri(10)]);
  // Kapitel-Check
  const ch=CHAPTERS[S.chapter];
  if(ch.missions.every(m=>S.done.includes(m.id))){
    if(S.chapter>=CHAPTERS.length-1){S.over='win';note(I18N.T('game.log.campaign_win'));S.rlog.push(I18N.T('game.log.campaign_win_short'));}
    else{S.chapter++;S.sandUsed=false;S.res.tech+=10;const chTitle=(I18N.lang==='en')?(CHAPTERS[S.chapter].titleEn||CHAPTERS[S.chapter].title):CHAPTERS[S.chapter].title;note(I18N.T('game.log.chapter_start',[chTitle]));S.rlog.push(I18N.T('game.log.new_chapter',[chTitle]));}
  }
  if(S.integrity<=0&&!S.over)S.over='loss';
  checkQuests();
  S.day++;
  save();
}

// ===================== Aktionen =====================
const R=(ok,msg)=>({ok,msg});
function assignRoom(id,roomId){
  const m=S.roster[id];
  if(m.room>=0){const old=S.base.rooms[m.room];if(old)old.staff=old.staff.filter(x=>x!==id);}
  if(roomId<0){m.room=-1;return R(true);}
  const r=S.base.rooms[roomId];
  if(!r)return R(false,'Raum nicht gefunden.');
  if(r.staff.length>=ROOMS[r.type].staff)return R(false,'Raum voll.');
  r.staff.push(id);m.room=roomId;
  return R(true);
}
function buildRoom(type,x,y){
  const RT=ROOMS[type];
  if(!RT||type==='gate')return R(false,'Nicht baubar.');
  if(x<0||y<0||x+RT.w>BASE_COLS||y+RT.h>BASE_LEVELS)return R(false,'Außerhalb des Grids.');
  for(let dy=0;dy<RT.h;dy++)for(let dx=0;dx<RT.w;dx++){
    if(S.base.grid[(y+dy)*BASE_COLS+(x+dx)]!==null)return R(false,'Zelle belegt.');
  }
  for(const k in RT.cost)if(S.res[k]<RT.cost[k])return R(false,`Nicht genug ${k}.`);
  for(const k in RT.cost)S.res[k]-=RT.cost[k];
  addRoom(S.base,type,x,y);
  note(`🏗 ${RT.name} gebaut.`);
  return R(true);
}
function demolishRoom(roomId){
  const r=S.base.rooms[roomId];
  if(!r||r.type==='gate')return R(false,'Nicht abreißbar.');
  for(let dy=0;dy<r.h;dy++)for(let dx=0;dx<r.w;dx++){
    S.base.grid[(r.y+dy)*BASE_COLS+(r.x+dx)]=null;
  }
  r.staff.forEach(id=>{S.roster[id].room=-1;});
  delete S.base.rooms[roomId];
  note('Raum abgerissen.');
  return R(true);
}
function getTech(tOrId){
  if(!tOrId) return null;
  const t = typeof tOrId === 'string' ? TECH.find(x => x[0] === tOrId) : tOrId;
  if(!t) return null;
  const isEn = typeof I18N !== 'undefined' && I18N.lang === 'en';
  const hasEn = t.length >= 8;
  const cost = hasEn ? t[5] : t[3];
  const branch = hasEn ? t[6] : t[4];
  const prereq = hasEn ? t[7] : t[5];
  const name = (isEn && hasEn && t[3]) ? t[3] : t[1];
  const desc = (isEn && hasEn && t[4]) ? t[4] : t[2];
  return {
    id: t[0],
    name,
    desc,
    cost,
    branch,
    prereq,
    raw: t
  };
}

function setResearch(id){
  if(!id){ S.research.queue=null; return R(true); }
  const tech = getTech(id);
  if(!tech) return R(false, 'Technologie nicht gefunden.');
  if(!techAvailable(tech)) return R(false, 'Voraussetzungen nicht erfüllt.');
  S.research.queue = tech.id;
  note(`🔬 Forschung gestartet: ${tech.name} (${tech.cost} RP)`);
  return R(true, `${tech.name} wird erforscht.`);
}

function techAvailable(tOrId){
  const tech = getTech(tOrId);
  if(!tech || !S.research || !S.research.done) return false;
  if(S.research.done.includes(tech.id)) return false;
  return !tech.prereq || S.research.done.includes(tech.prereq);
}

function has(t){return S.research && S.research.done && S.research.done.includes(t);}
// Schwierigkeit: aktuelle Stufe + Setter (gilt ab der nächsten Mission)
function diff(){return DIFFICULTY[S.difficulty]||DIFFICULTY.normal;}
function setDifficulty(d){if(!DIFFICULTY[d])return R(false,'Unbekannte Schwierigkeit.');
 S.difficulty=d;note(`⚔ Schwierigkeit: ${DIFFICULTY[d].name} (gilt ab der nächsten Mission).`);
 return R(true,DIFFICULTY[d].name);}
function sandwich(){
  if(!S.roster[12].recruited||S.sandUsed)return R(false,'Nicht verfügbar.');
  S.sandUsed=true;
  S.roster.forEach(m=>{if(m.recruited&&!m.dead)m.morale=Math.min(100,m.morale+20);});
  note('🥪 Hammond serviert Sandwiches: alle Morale +20.');
  return R(true,'Morale +20 für alle.');
}

// ===================== Krankenstation (Ebene 21 / Dr. Janet Fraiser) =====================
function healPatient(charId, method){
  const m = S.roster[charId];
  if(!m) return R(false, 'Patient nicht im SGC-Roster gefunden.');
  if(m.dead) return R(false, `${m.name} ist gefallen und kann nicht mehr behandelt werden.`);

  if(method === 'rest'){
    const medbay = Object.values(S.base.rooms).find(r => r.type === 'medbay');
    if(!medbay) return R(false, 'Keine Krankenstation im SGC vorhanden!');
    if(m.room === medbay.id) return R(false, `${m.name} belegt bereits ein Bett auf Ebene 21.`);
    const res = assignRoom(charId, medbay.id);
    if(res.ok) note(`🛏 ${m.name} wurde auf Ebene 21 stationär aufgenommen.`);
    return res;
  }

  if(method === 'medicine'){
    const cost = 15;
    if((S.res.medicine || 0) < cost) return R(false, `Nicht genug Medizin (${cost} ✚ benötigt).`);
    if(m.hp >= m.maxHp && (m.injuries || 0) === 0 && (m.fatigue || 0) === 0){
      return R(false, `${m.name} ist vollkommen diensttauglich.`);
    }
    S.res.medicine -= cost;
    const gained = Math.min(35, m.maxHp - m.hp);
    m.hp = Math.min(m.maxHp, m.hp + 35);
    if(m.injuries > 0) m.injuries--;
    m.fatigue = Math.max(0, (m.fatigue || 0) - 30);
    m.morale = Math.min(100, (m.morale || 70) + 5);
    note(`💊 Erstversorgung: ${m.name} versorgt (+${gained} HP, Wunden verbunden).`);
    return R(true, `${m.name} erstversorgt (+${gained} HP).`);
  }

  if(method === 'tech_goauld'){
    const techCost = 20, oreCost = 15;
    if((S.res.tech || 0) < techCost) return R(false, `Nicht genug Tech (${techCost} ⚙ benötigt).`);
    if((S.res.ore || 0) < oreCost) return R(false, `Nicht genug Naquadah/Erz (${oreCost} ⛏ benötigt).`);
    if(m.hp >= m.maxHp && (m.injuries || 0) === 0){
      return R(false, `${m.name} weist keine Traumata auf.`);
    }
    S.res.tech -= techCost;
    S.res.ore -= oreCost;
    m.hp = m.maxHp;
    m.injuries = 0;
    m.fatigue = 0;
    m.morale = 100;
    note(`✨ Antikes Heilgerät pulsiert: ${m.name} vollständig regeneriert (100% HP)!`);
    return R(true, `Zelluläre Regeneration: ${m.name} vollständig geheilt!`);
  }

  if(method === 'tretonin'){
    const medCost = 10, techCost = 10;
    if((S.res.medicine || 0) < medCost) return R(false, `Nicht genug Medizin (${medCost} ✚ benötigt).`);
    if((S.res.tech || 0) < techCost) return R(false, `Nicht genug Tech (${techCost} ⚙ benötigt).`);
    S.res.medicine -= medCost;
    S.res.tech -= techCost;
    m.hp = Math.min(m.maxHp, m.hp + 50);
    m.maxHp = Math.min(115, m.maxHp + 5);
    if(m.injuries > 0) m.injuries = Math.max(0, m.injuries - 1);
    m.fatigue = 0;
    m.morale = Math.min(100, (m.morale || 70) + 15);
    note(`🧪 Tretonin verabreicht: ${m.name} gestärkt (+50 HP, MaxHP +5, Moral +15).`);
    return R(true, `Tretonin verabreicht: Vitalwerte über Normalwert stabilisiert!`);
  }

  if(method === 'surgery'){
    const medCost = 25, techCost = 10;
    if((S.res.medicine || 0) < medCost) return R(false, `Nicht genug Medizin (${medCost} ✚ benötigt).`);
    if((S.res.tech || 0) < techCost) return R(false, `Nicht genug Tech (${techCost} ⚙ benötigt).`);
    if(m.hp >= Math.round(m.maxHp * 0.75) && (m.injuries || 0) === 0){
      return R(false, `Kein chirurgischer Eingriff erforderlich.`);
    }
    S.res.medicine -= medCost;
    S.res.tech -= techCost;
    m.hp = Math.max(m.hp, Math.round(m.maxHp * 0.85));
    m.injuries = 0;
    m.fatigue = 15;
    m.morale = Math.min(100, (m.morale || 70) + 10);
    note(`💉 Not-Operation Dr. Fraiser: ${m.name} gerettet (Wunden versorgt, HP 85%).`);
    return R(true, `Not-Operation erfolgreich: ${m.name} außer Lebensgefahr!`);
  }

  return R(false, 'Unbekannte Behandlungsmethode.');
}

function healAllEmergency(){
  let count = 0;
  const wounded = S.roster.filter(m => m.recruited && !m.dead && (m.hp < m.maxHp || (m.injuries || 0) > 0));
  if(wounded.length === 0) return R(false, 'Keine verwundeten Soldaten vorhanden.');
  for(const m of wounded){
    if((S.res.medicine || 0) < 15) break;
    const res = healPatient(m.id, 'medicine');
    if(res.ok) count++;
  }
  if(count === 0) return R(false, 'Nicht genügend Medizin für eine Erstversorgung.');
  return R(true, `${count} Soldat(en) von Dr. Fraiser erstversorgt!`);
}

const MEDBAY_INCIDENTS = [
  {
    id: 'broca_divide',
    title: '☣ DAS BROCA-VIRUS (DIE SEUCHE)',
    kicker: 'NOTFALL-QUARANTÄNE AUF EBENE 21',
    color: '#ef4444',
    speaker: "Dr. Janet Fraiser",
    role: "Chefärztin des SGC",
    text: '„Sir! Das Rückkehrer-Team zeigt akute Verhaltensmutationen! Jack hat mich gerade angeknurrt und versucht, mit einem Knochen den Defibrillator zu zertrümmern. Es ist das primitive Broca-Virus!“',
    subtext: 'Dr. Fraiser hat sich in der Isolierzelle verbarrikadiert und analysiert das Hormonmuster.',
    choices: [
      {
        label: 'Sedativum & Antiserum synthetisieren',
        desc: 'Kostet 20 Medizin, heilt alle Infizierten und stellt die Ordnung wieder her.',
        cost: {medicine: 20},
        effect: () => {
          S.res.medicine = Math.max(0, (S.res.medicine || 0) - 20);
          S.roster.forEach(m => { if(m.recruited && !m.dead){ m.morale = Math.min(100, m.morale + 10); m.injuries = 0; } });
          note('💊 Antiserum erfolgreich injiziert: Jack bittet Dr. Fraiser mit rotem Kopf um Entschuldigung.');
        }
      },
      {
        label: 'Jack mit der Betäubungswaffe stoppen & DNA-Probe sequenzieren',
        desc: 'Bringt +25 Tech-Erkenntnisse über retrovirale Antiker-Biologie.',
        effect: () => {
          S.res.tech = (S.res.tech || 0) + 25;
          const jack = S.roster[0]; if(jack) jack.hp = Math.max(20, jack.hp - 10);
          note('🔬 DNA sequenziert (+25 Tech). Jack wacht mit Beule auf: "Janet... mein Kopf dröhnt."');
        }
      }
    ]
  },
  {
    id: 'symbiote_crisis',
    title: '🐍 GOA\'ULD-SYMBIONTEN-ISOLIERUNG',
    kicker: 'CHIRURGISCHE ALARMSTUFE ROT',
    color: '#a855f7',
    speaker: "Dr. Janet Fraiser",
    role: "Chefärztin des SGC",
    text: '„Röntgenaufnahme bestätigt: Ein jugendlicher Goa\'uld-Symbiont hat sich um den Hirnstamm eines geretteten Soldaten gewickelt! Wenn wir nicht sofort handeln, übernimmt die Schlange die Kontrolle!“',
    subtext: 'Teal\'c bietet an, mit Kelno\'reem die Gehirnwellen zu beruhigen.',
    choices: [
      {
        label: 'Präzisions-Skalpell von Dr. Fraiser & Kryo-Schock',
        desc: 'Rettet den Wirt vollständig und entfernt alle Wunden (+15 Moral für SGC).',
        cost: {medicine: 15, tech: 10},
        effect: () => {
          S.res.medicine = Math.max(0, (S.res.medicine || 0) - 15);
          S.res.tech = Math.max(0, (S.res.tech || 0) - 10);
          S.roster.forEach(m => { if(m.recruited && !m.dead) m.morale = Math.min(100, m.morale + 15); });
          note('💉 Dr. Fraiser extrahiert die Larve millimetergenau. Wirt ist frei und wohlauf!');
        }
      },
      {
        label: 'Tok\'ra-Extraktor & Symbionten-Geheimnisse studieren',
        desc: 'Bringt wertvolles Goa\'uld-Forschungswissen (+30 Tech).',
        effect: () => {
          S.res.tech = (S.res.tech || 0) + 30;
          note('⚡ Tok\'ra-Feld aktiv: Symbiont in Stasiskammer isoliert (+30 Tech für das SGC).');
        }
      }
    ]
  },
  {
    id: 'ancient_healing_cube',
    title: '✨ RESONANZ DES ANTIKEN HEILGERÄTS',
    kicker: 'EBENE 21 MEDIZINISCHE ENERGIEWELLE',
    color: '#38bdf8',
    speaker: "Dr. Janet Fraiser",
    role: "Chefärztin des SGC",
    text: '„General, das Antike Handgerät hat bei der Behandlung eine harmonische Schwingung aufgebaut! Das Licht heilt die Zellstrukturen unserer Verwundeten mit unglaublicher Geschwindigkeit!“',
    subtext: 'Major Carter meldet, dass die Energiekupplung der Krankenstation sanft summt.',
    choices: [
      {
        label: 'Heilungs-Feld auf die gesamte Station ausdehnen',
        desc: 'Alle anwesenden Soldaten werden sofort um +40 HP geheilt.',
        effect: () => {
          S.roster.forEach(m => { if(m.recruited && !m.dead) m.hp = Math.min(m.maxHp, m.hp + 40); });
          note('✨ Das warme Licht durchströmt die Krankenstation: Alle Wunden schließen sich schlagartig!');
        }
      },
      {
        label: 'Überschüssige Energie in die Naquadah-Puffer einspeisen',
        desc: 'Sichert +35 Naquadah und +15 Tech für die Basissysteme.',
        effect: () => {
          S.res.ore = (S.res.ore || 0) + 35;
          S.res.tech = (S.res.tech || 0) + 15;
          note('🔋 Puffer aufgeladen: +35 Erz, +15 Tech aus der Antiker-Resonanz gewonnen.');
        }
      }
    ]
  }
];
function openMissions(){
  const next=CHAPTERS[S.chapter].missions.find(m=>!S.done.includes(m.id));
  return next?[next]:[];
}
function curMissions(){return CHAPTERS[S.chapter].missions;}
function discover(id){if(S.planets[id]&&!S.planets[id].disc){S.planets[id].disc=true;note(`🛰 Neu entdeckt: ${PLANETS[id].name}`);}}

// ===================== Inventar, SG-Teams & Kommandanten (Phase 1 / 1.5) =====================
function craftItem(catOrKey,maybeKey){
  if(!S.inventory)S.inventory=defaultInventory();
  if(!S.inventory.specials)S.inventory.specials=S.inventory.special;
  let cat=catOrKey,key=maybeKey;
  if(!key&&RECIPES[catOrKey]){
    cat=RECIPES[catOrKey].cat;
    key=RECIPES[catOrKey].item;
  }
  if(cat==='specials')cat='special';
  const table=cat==='weapons'?WEAPONS:cat==='armor'?ARMORS:cat==='special'?SPECIALS:null;
  const spec=table&&table[key];
  if(!spec||!spec.cost)return R(false,'Item nicht herstellbar.');
  if(spec.minChap&&S.chapter<spec.minChap)return R(false,`Erst ab Kapitel ${spec.minChap+1} verfügbar.`);
  for(const k in spec.cost)if((S.res[k]||0)<spec.cost[k])return R(false,`Nicht genug ${k}.`);
  for(const k in spec.cost)S.res[k]-=spec.cost[k];
  S.inventory[cat][key]=(S.inventory[cat][key]||0)+1;
  note(`🔫 Armory hergestellt: ${spec.name} (Bestand: ${S.inventory[cat][key]})`);
  return R(true,`${spec.name} hergestellt!`);
}

function equipItem(charId,slot,key){
  const m=S.roster[charId];
  if(!m)return R(false,'Charakter nicht gefunden.');
  if(!S.inventory)S.inventory=defaultInventory();
  if(!S.inventory.specials)S.inventory.specials=S.inventory.special;
  const cat=slot==='weapon'?'weapons':slot==='armor'?'armor':slot==='special'?'special':null;
  if(!cat)return R(false,'Ungültiger Slot.');
  const prev=m[slot];
  if(prev===key||(prev===null&&!key))return R(true);
  const unlim=(slot==='weapon'&&['pistol','rifle'].includes(key))||(slot==='armor'&&key==='light');
  if(key&&!unlim){
    if((S.inventory[cat][key]||0)<=0)return R(false,'Nicht im Lagerbestand (in Armory herstellen).');
    S.inventory[cat][key]--;
  }
  const prevUnlim=(slot==='weapon'&&['pistol','rifle'].includes(prev))||(slot==='armor'&&prev==='light');
  if(prev&&!prevUnlim){
    S.inventory[cat][prev]=(S.inventory[cat][prev]||0)+1;
  }
  m[slot]=key||null;
  return R(true,`${m.name.split(' ')[0]} ausgerüstet.`);
}

function assignTeam(charId,teamId){
  const m=S.roster[charId];
  if(!m)return R(false,'Charakter nicht gefunden.');
  const tSpec=Array.isArray(SG_TEAMS)?SG_TEAMS.find(t=>t.id===teamId):SG_TEAMS[teamId];
  if(!tSpec)return R(false,'Team existiert nicht.');
  if(S.chapter<tSpec.unlockChap)return R(false,`${tSpec.name} wird erst in Kapitel ${tSpec.unlockChap+1} freigeschaltet.`);
  m.team=teamId;
  return R(true,`${m.name.split(' ')[0]} → ${tSpec.name}`);
}

function setCommander(cmdId){
  if(!COMMANDERS[cmdId])return R(false,'Unbekannter Kommandant.');
  S.commander=cmdId;
  note(`🎖 Kommandowechsel: ${COMMANDERS[cmdId].name} übernimmt die Leitung des SGC.`);
  return R(true,`${COMMANDERS[cmdId].name} im Dienst.`);
}

if(typeof window!=='undefined'){
  window.COLONY_BUILDINGS=COLONY_BUILDINGS;
  window.defaultKeybinds=defaultKeybinds;
  window.createColonyState=createColonyState;
  window.getColonyStats=getColonyStats;
  window.foundColony=foundColony;
  window.buildColonySector=buildColonySector;
  window.upgradeColonySector=upgradeColonySector;
  window.demolishColonySector=demolishColonySector;
}
if(typeof module!=='undefined'&&module.exports){
  module.exports={
    COLONY_BUILDINGS,defaultKeybinds,createColonyState,getColonyStats,
    foundColony,buildColonySector,upgradeColonySector,demolishColonySector
  };
}
