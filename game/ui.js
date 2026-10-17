'use strict';
// ===================== SGC COMMAND v2 – UI =====================
// Jagged-Alliance-Style: Bottom-Panel mit Unit-Info, Aktionen, Gate-Timer, Log.
// Hilfe-Modal (Steuerung), Sound (SFX), klare Kampf-Hinweise.

const $=id=>document.getElementById(id);
const UI={tab:'base',menuOpen:false};
const RES_ICON={ore:'⛏',tech:'⚙',medicine:'✚',food:'🍞'};
const RES_DE={ore:'Erz',tech:'Tech',medicine:'Medizin',food:'Nahrung'};
const TYPE_DE={hostile:'feindlich',neutral:'neutral',allied:'verbündet',empty:'unbewohnt',base:'Basis',space:'Orbit'};
const ENEMY_DE={jaffa:'Jaffa',veteran:'Veteran',elite:'Elite',goauld:"Goa'uld",repl:'Replikant',drone:'Drone',queen:'Königin'};
let GATE_STATE=null;
let combatPanDrag=null;
// sfx() kommt aus combat.js (global) – hier NICHT erneut deklarieren!
// Waffen-Sprite-Cache für das Combat-Panel (drawWeapon aus art2.js, 1× pro Waffe)
const _wCache={};
function weaponSprite(type){
 if(!type||typeof drawWeapon!=='function')return '';
 if(!_wCache[type]){
  const cv=document.createElement('canvas');cv.width=48;cv.height=24;
  drawWeapon(cv.getContext('2d'),type,8,4,1);
  _wCache[type]=cv.toDataURL();
 }
 return _wCache[type];
}

function toast(msg){if(!msg)return;const t=$('toast');t.textContent=msg;t.className='show';clearTimeout(toast.h);toast.h=setTimeout(()=>t.className='',2600);}
function act(r){if(r&&r.msg)toast(r.msg);save();renderAll();}
function bar(v,col){return `<span class="bar"><i style="width:${Math.max(0,Math.min(100,v))}%;background:${col}"></i></span>`;}
function pic(m,cls){return `<img class="${cls||'pt'}" src="${portrait(m)}" title="${m.name}">`;}
function setTab(t){UI.tab=t;sfx('click');
 document.querySelectorAll('.pane').forEach(p=>p.style.display=p.id==='pane-'+t?'block':'none');
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
 renderAll();}

// ===================== Hilfe-Modal =====================
// ===================== Pause-Menü (Escape) =====================
function showMenu(){if(UI.menuOpen)return;UI.menuOpen=true;$('menu').style.display='flex';
 const sel=$('menu-diff');if(sel)sel.value=S.difficulty||'easy';sfx('click');}
function hideMenu(){UI.menuOpen=false;$('menu').style.display='none';}
function toggleMenu(){if(UI.menuOpen)hideMenu();else showMenu();}
function replayOpeningCinematic(){
 hideMenu();
 startOpeningCinematic(()=>{
  S.introSeen=true;save();
  if(!S.pilotBriefingSeen&&!S.done.includes('1-1')&&S.day===1)showPilotOpening();
 });
}

function showHelp(){
 hideMenu();
 const m=$('modal');
 m.style.display='flex';
 m.innerHTML=`<div class="mbox help">
  <h3>📖 ANLEITUNG</h3>
  <div class="mbody">
   <h4>🏗 BASIS (Cheyenne Mountain)</h4>
   <div>Das SGC ist ein Berg. <b>Oben</b>: Parkplatz &amp; Eingang. <b>Unten</b>: der Gateraum.
   Wähle rechts einen Raum-Typ, dann ein freies Feld. Weise Staff zu (Roster-Tab),
   um Produktion &amp; Heilung zu bekommen. Achte auf das <b>Power-Budget</b> (⚡).</div>
   <h4>🗺 STERNENKARTE</h4>
   <div>Klicke auf einen Planeten mit <b>!</b> (offene Mission). Wähle dein Team (max. 6,
   SG-1 vorausgewählt) und drücke <b>▶ Mission starten</b>.</div>
   <h4>⚔ KAMPF (das Wichtigste!)</h4>
   <div><b>1.</b> Klicke auf eine deiner Einheiten → <span style="color:#4fc3f7">BLAU</span> = wo sie laufen kann.</div>
   <div><b>2.</b> Klicke ein <span style="color:#4fc3f7">BLAUES FELD</span> → sie bewegt sich (1 AP).</div>
   <div><b>3.</b> Klicke einen <span style="color:#ef4444">ROTEN GEGNER (✛)</span> → sie <b>SCHIESST</b> (1 AP).</div>
   <div><b>4.</b> <b>⏸ Warten</b> → übergib den Rest der AP an die nächste Einheit.</div>
   <div style="margin-top:6px">Jede Einheit hat <b>2 AP</b> pro Runde. Leichte Deckung gibt von vorn −20, schwere Deckung −40 Prozentpunkte auf gegnerische Treffer; Angriffe von hinten umgehen den Schutz (+15 Prozentpunkte). Gelb markierte Kisten und Trümmer können beschossen und zerstört werden.</div>
   <div>Die Einsatzkarte füllt das Browserfenster oberhalb der Aktionsleiste. Verschiebe die Ansicht mit <b>Pfeiltasten, WASD, Ziehen oder der Minimap</b>. Beim Auswählen einer Einheit außerhalb des Sichtfensters springt die Kamera zu ihr.</div>
   <div><b>Friedlicher Erstkontakt:</b> Klicke auf die gold markierte Person. Dein Team nähert sich ohne Gewalt; schließe anschließend den Dialog ab.</div>
    ${C.active&&C.mission.peaceful?'<div style="margin-top:6px"><b>Erstkontakt:</b> Klicke die gold markierte Person an, nähere dich ihr und schließe den Dialog ab. Es gibt keine Gegner und keine Extraktion.</div>':'<div style="margin-top:6px">🌀 <b>One-Way-Gate:</b> Ihr kommt durchs Gate auf den Planeten. Zum Zurückkehren müsst ihr das Gate <b>neu wählen</b> (Extrahieren).<br><b>Mission-Ende:</b> Sieg = alle Gegner besiegt (100% Beute) · Extraktion = ganzes Team am Gate (50% Beute).<br>Es gibt <b>keine Zeit-Begrenzung</b> – Runden laufen, bis die Mission fertig ist.</div>'}
    <h4>⚔ SCHWIERIGKEIT</h4>
    <div><b>Leicht</b> (Default) · <b>Normal</b> · <b>Hart</b> – im Pause-Menü (ESC) änderbar, gilt ab der nächsten Mission.
    Die Missionen werden zusätzlich von Kapitel zu Kapitel schwerer.</div>
   <h4>💀 TOD</h4>
   <div><b>Rekruten</b> sterben permanent (Gedenktafel). <b>SG-1</b> stirbt nie (Duplikat-Klausel).
   2+ SG-1-Mitglieder down → Auto-Extraktion (50% Beute).</div>
   <h4>TIPS</h4>
       <div>• Teal'c kommt nach der 1. Mission dazu (Chakram: +8 vs Jaffa). • Carter: Gate-Genius (Talent).
    • Deckung mit Blickrichtung halten; Flanken vermeiden. • Nicht alle 6 schicken – 3 SG-1 + Rekruten reicht oft.
    • Willst du abbrechen? Ganzes Team zum Gate bringen → <b>🌀 Extrahieren</b>.</div>
  </div>
  <button onclick="$('modal').style.display='none'">Verstanden</button>
 </div>`;
}

// ===================== Header =====================
function renderHeader(){
 const ch=CHAPTERS[S.chapter];
 $('res').innerHTML=Object.keys(S.res).map(k=>`<span class="res" title="${RES_DE[k]}">${RES_ICON[k]} ${Math.floor(S.res[k])}</span>`).join('')+
  `<span class="res" title="Forschungspunkte">🔬 ${Math.floor(S.research.rp)}</span>`;
 $('chap').innerHTML=`<b>${ch.title}</b><small>${ch.sub}</small>`;
 const pw=powerGen(),pu=powerUse();
   const D=diff();
  $('round').innerHTML=`Tag <b>${S.day}</b> · <span class="integ" title="Power">⚡ ${pw>=pu?pw-pu:0}/${pw} ${bar(pw>=pu?100:pu/pw*100,pw>=pu?'#4ade80':'#ef4444')}</span> · <span class="diff" style="color:${D.color}" title="Schwierigkeit (im Pause-Menü änderbar)">⚔ ${D.name}</span>`;
 $('go').disabled=!!S.over||C.active||GR.phase!=='idle';
}

// ===================== Basis (Shelter-Grid) =====================
function renderBaseSide(){
 const pw=powerGen(),pu=powerUse(),ok=pw>=pu;
 const headlines=[
  'Kantine meldet: Kaffeeversorgung stabil. Mitarbeitende widersprechen.',
  'Aufzugverkehr normal. Niemand hat den Knopf zum 28. Stock gefunden.',
  'Forschung dementiert ein Gerücht über empfindungsfähigen Wackelpudding.',
  'Sicherheitsstufe bleibt gleich. Die Formulare wurden trotzdem verdoppelt.',
  'Wurmloch-Team bittet darum, den blauen Ereignishorizont nicht anzufassen.'
 ];
 const headline=headlines[(Math.max(1,S.day)-1)%headlines.length];
 const activeStaff=S.roster.filter(m=>m.recruited&&!m.dead).length;
 let h=`<section class="base-news" aria-label="Mountain Network Nachrichten">
  <div class="base-news-head"><span>⦿ MOUNTAIN NETWORK</span><b><i></i> NACHRICHTEN</b></div>
  <div class="base-news-tag">AUSGABE ${String(S.day).padStart(2,'0')} · CHEYENNE MOUNTAIN</div>
  <div class="base-news-title">${headline}</div>
  <div class="base-news-footer"><span>PERSONAL <b>${activeStaff}</b></span><span>AUFZUG <b>BETRIEBSBEREIT</b></span></div>
 </section>`;
 h+=`<h3>Power-Budget</h3><div class="gbox">Produktion <b style="color:${ok?'#4ade80':'#ef4444'}">${pw}</b> · Verbrauch <b>${pu}</b> ${ok?'✔':'⚠ OFFLINE'}</div>`;
 h+=`<h3>Bau</h3>`;
 if(B.buildMode){
  h+=`<div class="warnbox item">Baumodus: <b>${ROOMS[B.buildType].name}</b> – klicke auf ein freies Feld. <button onclick="B.buildMode=false;renderAll()">Abbrechen</button></div>`;
 } else {
  h+=`<div class="bgrid">`+Object.keys(ROOMS).filter(t=>t!=='gate').map(t=>{
   const R=ROOMS[t],cost=Object.entries(R.cost).map(e=>RES_ICON[e[0]]+e[1]).join(' ')||'–';
   return `<button class="item" style="text-align:left" onclick="B.buildMode=true;B.buildType='${t}';renderAll()"><b>${R.icon} ${R.name}</b><br><small>${R.desc} · ${cost} · ${R.power>0?'+':''}${R.power}P</small></button>`;
  }).join('')+`</div>`;
 }
 h+=`<h3>Räume</h3>`;
 const rooms=Object.values(S.base.rooms);
 h+=rooms.map(r=>{
  const R=ROOMS[r.type],out=roomOutput(r);
  const staff=r.staff.map(id=>S.roster[id]).filter(m=>m.recruited&&!m.dead);
  return `<div class="item ${B.selRoom===r.id?'warnbox':''}" onclick="B.selRoom=${r.id};renderAll()">
   <b>${R.icon} ${R.name}</b> ${r.type!=='gate'?`<button class="small" style="float:right" onclick="event.stopPropagation();act(demolishRoom(${r.id}))">✕</button>`:''}
   <br><small>Staff ${staff.length}/${R.staff} ${out?`· Output ${out}`:''}
   ${staff.length?'<br>'+staff.map(m=>`<span class="tag" style="background:#1a2535;color:#4fc3f7">${m.name.split(' ')[0]}</span>`).join(' '):''}</small></div>`;
 }).join('');
 const q=S.research.queue&&TECH.find(t=>t[0]===S.research.queue);
 h+=`<h3>Forschung</h3><p>${q?`Aktuell: <b>${q[1]}</b> ${bar(S.research.rp/q[3]*100,'#4fc3f7')} ${Math.floor(S.research.rp)}/${q[3]}`:'Keine Forschung gewählt.'}</p><div class="tree">`;
 [['g','Gate-Netz'],['w','Waffentechnik'],['s','Schilde']].forEach(([br,nm])=>{
  h+=`<div><h4>${nm}</h4>`+TECH.filter(t=>t[4]===br).map(t=>{
   const done=S.research.done.includes(t[0]),av=techAvailable(t);
   return `<button class="tech ${done?'done':''} ${S.research.queue===t[0]?'on':''}" ${(!av&&!done)?'disabled':''} onclick="act(setResearch('${S.research.queue===t[0]?'':t[0]}'))"><b>${t[0]} ${t[1]}</b><br><small>${t[2]} · ${t[3]} RP</small></button>`;
  }).join('')+'</div>';});
 h+='</div>';
 if(S.memorial.length){
  h+=`<h3>Gedenktafel</h3><div class="gbox" style="border-color:#ef4444">${S.memorial.map(n=>`<div>🕯 ${n}</div>`).join('')}</div>`;
 }
 if(S.roster[12].recruited)h+=`<br><button ${S.sandUsed?'disabled':''} onclick="act(sandwich())">🥪 Hammonds Sandwich (1×/Kapitel)</button>`;
 $('base-side').innerHTML=h;
}

// ===================== Sternenkarte =====================
function drawMap(cv,now){
 const c=cv.getContext('2d'),W=cv.width,Ht=cv.height;
 let g=c.createRadialGradient(W/2,Ht/2,50,W/2,Ht/2,W*.7);g.addColorStop(0,'#101a2e');g.addColorStop(1,'#04060b');c.fillStyle=g;c.fillRect(0,0,W,Ht);
 [[220,140,'#3b1d6e'],[640,360,'#0e3a55'],[820,150,'#5a1a2a']].forEach(([x,y,col])=>{const n=c.createRadialGradient(x,y,0,x,y,220);n.addColorStop(0,col+'66');n.addColorStop(1,col+'00');c.fillStyle=n;c.fillRect(x-220,y-220,440,440);});
 STARS.forEach(s=>{c.fillStyle=`rgba(255,255,255,${.35+.35*Math.sin(now/900+s.p)})`;c.fillRect(s.x,s.y,s.r,s.r);});
 c.strokeStyle='rgba(79,195,247,.07)';c.lineWidth=1;
 for(let x=0;x<W;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,Ht);c.stroke();}
 for(let y=0;y<Ht;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
 MAP.nodes=[];const sgc=PLANETS.sgc;
 const vis=id=>PLANETS[id].ch<=S.chapter;
 for(const id in PLANETS){if(!vis(id))continue;const P=PLANETS[id];if(P.sgc)continue;
  const disc=S.planets[id].disc;
  c.setLineDash(disc?[]:[3,7]);
  c.strokeStyle=disc?'rgba(79,195,247,.4)':'rgba(120,140,170,.25)';
  c.globalAlpha=disc?.5+.25*Math.sin(now/500):1;
  c.beginPath();c.moveTo(sgc.x,sgc.y);c.lineTo(P.x,P.y);c.stroke();
  c.globalAlpha=1;c.setLineDash([]);}
 for(const id in PLANETS){if(!vis(id))continue;const P=PLANETS[id],disc=S.planets[id].disc;
  const r=P.sgc?20:disc?14:11;MAP.nodes.push({id,x:P.x,y:P.y,r:r+8});
  if(MAP.sel===id){c.strokeStyle='#fff';c.lineWidth=2;c.setLineDash([4,3]);c.beginPath();c.arc(P.x,P.y,r+14,0,7);c.stroke();c.setLineDash([]);}
  const col=P.sgc?'#4fc3f7':disc?(P.type==='hostile'?'#ef4444':P.type==='empty'?'#4ade80':P.type==='space'?'#a78bfa':'#facc15'):'#5a6a80';
  const gl=c.createRadialGradient(P.x,P.y,2,P.x,P.y,r*2.4);gl.addColorStop(0,col+'88');gl.addColorStop(1,col+'00');c.fillStyle=gl;c.beginPath();c.arc(P.x,P.y,r*2.4,0,7);c.fill();
  if(!disc){c.fillStyle='#1b2433';c.strokeStyle='#5a6a80';c.lineWidth=2;c.setLineDash([3,3]);c.beginPath();c.arc(P.x,P.y,r,0,7);c.fill();c.stroke();c.setLineDash([]);
   c.fillStyle='#8a9ab0';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText('?',P.x,P.y+6);}
  else if(P.sgc){c.fillStyle='#0f2a3f';c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.arc(P.x,P.y,r,0,7);c.fill();c.stroke();
   c.beginPath();c.arc(P.x,P.y,r-8,0,7);c.stroke();c.fillStyle=col;for(let i=0;i<7;i++){const a=i/7*6.28;c.fillRect(P.x+Math.cos(a)*(r-3)-1,P.y+Math.sin(a)*(r-3)-1,3,3);}}
  else{const pg=c.createRadialGradient(P.x-4,P.y-4,2,P.x,P.y,r);
   const base=P.type==='hostile'?'#7a2a2a':P.type==='empty'?'#2a5a4a':P.type==='space'?'#241a40':'#4a5a3a';
   pg.addColorStop(0,shade(base,50));pg.addColorStop(1,base);c.fillStyle=pg;c.beginPath();c.arc(P.x,P.y,r,0,7);c.fill();c.strokeStyle=col;c.lineWidth=2;c.stroke();}
  const hasM=openMissions().some(o=>o.planet===id);
  if(disc&&hasM){c.fillStyle='#f2c230';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText('!',P.x+r+6,P.y-r+4+Math.sin(now/250)*2);}
  c.fillStyle=disc?'#d6e4f0':'#6b7a90';c.font='12px sans-serif';c.textAlign='center';c.fillText(disc?P.name:'Unbekannt',P.x,P.y+r+18);
 }
 c.textAlign='left';
 c.fillStyle='rgba(6,10,16,.7)';c.fillRect(8,Ht-40,232,32);c.font='11px sans-serif';
 [['#ef4444','feindlich'],['#facc15','neutral'],['#4ade80','unbewohnt'],['#a78bfa','Orbit']].forEach(([col,l],i)=>{c.fillStyle=col;c.fillRect(14+(i%2)*116,Ht-32,8,8);c.fillStyle='#b8c6d6';c.fillText(l,26+(i%2)*116,Ht-24);});
}
function renderMapSide(){
 if(!MAP.sel){
  $('map-side').innerHTML=`<h3>Sternenkarte</h3><p class="dim">Klicke auf einen Planeten. „!" = offene Mission. „?" = unentdeckt.</p>
  <h3>Offene Missionen</h3>`+openMissions().map(m=>
   `<div class="item" onclick="MAP.sel='${m.planet}';renderAll()" style="cursor:pointer"><b>${m.name}</b> <small>${PLANETS[m.planet].name}</small></div>`).join('');
  return;
 }
 const P=PLANETS[MAP.sel],disc=S.planets[MAP.sel].disc;
 let h=`<h3>${disc?P.name:'Unbekanntes Signal'}</h3>`;
 if(!disc){h+=`<p class="dim">Ein ungewähltes Gate-Signal.</p><button onclick="discover('${MAP.sel}');act({ok:true})">🛰 Sonde senden</button>`;return;}
 h+=`<p>${TYPE_DE[P.type]}</p>`;
 const ms=openMissions().filter(m=>m.planet===MAP.sel);
 if(ms.length){
  ms.forEach(m=>{
       h+=`<div class="item"><b>${m.name}</b><br><small>${m.goal}<br>${m.peaceful?'Missionstyp: Friedlicher Erstkontakt · keine Feinde':`Gegner: ${Object.entries(m.enemies).map(e=>e[1]+'× '+ENEMY_DE[e[0]]).join(', ')||'keine'}`}<br>${m.peaceful?'Zivilisten ansprechen und den Dialog abschließen.':m.tutorial?'Tutorial: Bewegung · Deckung · Schießen · Aktionspunkte · Teal’c':'Ende: Sieg (100%) oder Extraktion am Gate (50%)'}<br>Beute: ${Object.entries(m.reward).map(e=>RES_ICON[e[0]]+e[1]).join(' ')||'–'}</small></div>`;
  });
  const avail=S.roster.filter(m=>m.recruited&&!m.dead);
  h+=`<h3>Team-Auswahl <small>(max 6)</small></h3><div id="team-pick">`+
   avail.map(m=>`<label class="gl"><input type="checkbox" class="tpick" value="${m.id}" ${(ms[0].tutorial||m.sg1)?'checked':''} ${ms[0].tutorial?'disabled':''}> ${pic(m)} <span>${m.name.split(' ')[0]}</span></label>`).join('')+`</div>`;
  h+=`<button id="launch" style="width:100%;margin-top:8px;background:#1f6f3a;border-color:#34c76a">▶ Mission starten</button>`;
 } else {h+=`<p class="dim">Keine offenen Missionen auf diesem Planeten.</p>`;}
 $('map-side').innerHTML=h;
 const btn=$('launch');
 if(btn)btn.onclick=()=>{
  const ids=[...document.querySelectorAll('.tpick:checked')].map(c=>parseInt(c.value)).slice(0,6);
  if(!ids.length){toast('Wähle mindestens ein Team-Mitglied.');return;}
  launchMission(ms[0],ids);
 };
}

// ===================== Mission-Flow =====================
function launchMission(mission,teamIds){
 const briefing=MISSION_BRIEFINGS&&MISSION_BRIEFINGS[mission.id];
 if(briefing){
  showStorySequence(briefing.lines,`FELDBRIEFING · ${mission.name}`,'Tor anwählen',()=>activateMission(mission,teamIds),'briefing',briefing.objective);
  return;
 }
 activateMission(mission,teamIds);
}
function activateMission(mission,teamIds){
 GATE_STATE={teams:[{members:teamIds,mission:0}],roster:S.roster};
 $('gate-overlay').style.display='flex';
 sfx('gate');
 playGate([mission.planet],[{planet:mission.planet,members:teamIds}],()=>{
  $('gate-overlay').style.display='none';
  startCombat(mission,teamIds);
  document.body.style.overflow='hidden';
  $('combat-overlay').style.display='flex';
  $('combat-end').style.display='none';
  renderAll();
 });
}
function showStorySequence(lines,title,buttonText,onComplete,kind,objective){
 const host=$('story-dialogue');
 let index=0;
 const isCombat=kind==='field';
 if(isCombat)C.dialogueActive=true;
 const render=()=>{
  const line=lines[index],member=S.roster[line.portraitId],image=member?portrait(member):'';
  const last=index===lines.length-1;
  host.innerHTML=`<div class="story-box ${kind||''}">
   <div class="story-kicker">${isCombat?'EINSATZPROTOKOLL':'STARGATE COMMAND · EINSATZPLANUNG'}</div>
   <h2>${title}</h2>
   ${objective?`<div class="story-objective"><span>AUFTRAG</span>${objective}</div>`:''}
   <div class="story-speaker">
    ${image?`<img src="${image}" alt="">`:''}
    <div><b>${line.speaker}</b><small>${line.role}</small></div>
   </div>
   <p class="story-line">${line.text}</p>
   <div class="story-controls"><span>${String(index+1).padStart(2,'0')} / ${String(lines.length).padStart(2,'0')} · ENTER WEITER</span>
    <button id="story-next">${last?buttonText:'Weiter'} <span>›</span></button>
   </div>
  </div>`;
  host.style.display='flex';
  $('story-next').onclick=()=>{
   if(index<lines.length-1){index++;render();return;}
   host.style.display='none';host.innerHTML='';
   if(isCombat)C.dialogueActive=false;
   onComplete();
  };
 };
 render();
}
function playCombatScene(trigger){
 if(!C.active||C.dialogueActive)return;
 const scenes=MISSION_SCENES&&MISSION_SCENES[C.mission.id],lines=scenes&&scenes[trigger];
 if(!lines||C.sceneFlags[trigger])return;
 C.sceneFlags[trigger]=true;
 showStorySequence(lines,`${PLANETS[C.mission.planet].name} · ${C.mission.name}`,'Weiter',()=>{
  if(trigger==='contact'){C.contactComplete=true;checkEnd();renderCombatUI();resizeCombatViewport();}
 },'field');
}
function showPilotOpening(){
 const lines=[
  {speaker:'General Hammond',role:'Kommandierender Offizier · SGC',portraitId:12,text:'Das Tor hat uns eine Verbindung zu Welten geöffnet, die wir kaum verstehen. Heute beginnt die erste Mission unserer neuen Einheit.'},
  {speaker:'Jack O’Neill',role:'Teamführung · SG-1',portraitId:0,text:'Dann sollten wir die Theorie kurz halten. Wir sehen uns auf der anderen Seite.'}
 ];
 showStorySequence(lines,'ERSTER EINSATZ · CHULAK','Sternenkarte öffnen',()=>{
  S.pilotBriefingSeen=true;save();MAP.sel='chulak';setTab('map');
 },'briefing','Ein unbekanntes Signal führt SG-1 zu einer Entscheidung, die das Team verändern wird.');
}
function combatClick(e){
 if(C.justPanned){C.justPanned=false;return;}
 if(!C.active||C.result)return;
 const cv=$('combat-cv'),r=cv.getBoundingClientRect(),sx=cv.width/r.width,sy=cv.height/r.height;
 const mx=(e.clientX-r.left)*sx,my=(e.clientY-r.top)*sy;
 const tx=Math.floor(mx/TILE)+C.cameraX,ty=Math.floor(my/TILE)+C.cameraY;
 if(!inB(tx,ty))return;
 const u=unitAt(tx,ty);
 if(u&&u.side==='neutral'){interactWithContact(u);return;}
 if(u&&u.side==='player'&&!u.downed&&u.ap>0){playerSelect(u);sfx('click');return;}
 if(C.selected){
  if(C.moveRange.some(p=>p.x===tx&&p.y===ty)){playerMove(C.selected,tx,ty);return;}
  if(u&&u.side==='enemy'&&C.atkRange.includes(u)){playerAttack(C.selected,u);return;}
  if(u&&u.side==='enemy'&&dist(C.selected.x,C.selected.y,tx,ty)<=1&&C.selected.melee&&C.selected.ap>0&&tutorialAllowsAttack(C.selected)){const sel=C.selected;if(C.tutorial&&C.tutorial.step===2&&sel.charId===0)C.tutorial.step=3;sel.facing=facingToward(sel,u);sel.ap--;C.firstHint=false;doMelee(sel,u);C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];checkEnd();if(!C.result&&sel.ap<=0)nextUnit();return;}
  if(C.coverRange.some(p=>p.x===tx&&p.y===ty)){playerAttackTerrain(C.selected,tx,ty);return;}
  C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];
 }
}
function combatHover(e){
 if(!C.active)return;
 const cv=$('combat-cv'),r=cv.getBoundingClientRect(),sx=cv.width/r.width,sy=cv.height/r.height;
 const mx=(e.clientX-r.left)*sx,my=(e.clientY-r.top)*sy;
 C.hover={x:Math.floor(mx/TILE)+C.cameraX,y:Math.floor(my/TILE)+C.cameraY};
}
function combatPan(dx,dy){
 if(!C.active)return;
 panCombatCamera(C.cameraX+dx,C.cameraY+dy);
}
function combatPointerDown(e){
 if(!C.active||C.result)return;
 combatPanDrag={id:e.pointerId,x:e.clientX,y:e.clientY,cameraX:C.cameraX,cameraY:C.cameraY,moved:false};
 if(e.target.setPointerCapture)e.target.setPointerCapture(e.pointerId);
}
function combatPointerMove(e){
 combatHover(e);
 if(!combatPanDrag||combatPanDrag.id!==e.pointerId)return;
 const cv=$('combat-cv'),rect=cv.getBoundingClientRect();
 const dx=e.clientX-combatPanDrag.x,dy=e.clientY-combatPanDrag.y;
 if(Math.abs(dx)+Math.abs(dy)>6)combatPanDrag.moved=true;
 if(combatPanDrag.moved){
  panCombatCamera(combatPanDrag.cameraX-Math.round(dx*cv.width/rect.width/TILE),
   combatPanDrag.cameraY-Math.round(dy*cv.height/rect.height/TILE));
  e.preventDefault();
 }
}
function combatPointerUp(e){
 if(!combatPanDrag||combatPanDrag.id!==e.pointerId)return;
 C.justPanned=combatPanDrag.moved;combatPanDrag=null;
}
function combatEnd(){
 if(!C.result)return;
 applyCombatResult();
 $('combat-overlay').style.display='none';
 document.body.style.overflow='';
 $('combat-end').style.display='none';
 showReport();
}

// ===================== Jagged-Alliance-Style Combat UI =====================
function renderCombatUI(){
 const panel=$('combat-ui');if(!panel)return;
 // Beim Ergebnis: Panel ausblenden, damit der #combat-end-Button (unten im Overlay)
 // nicht vom Panel (z-index:6) verdeckt wird. Der Report-Modal zeigt danach das Log.
 if(!C.active||C.result){panel.style.display='none';return;}
 panel.style.display='flex';
 const sel=C.selected;
 let h='';
 if(sel){
  const m=S.roster[sel.charId];
  const w=WEAPONS[sel.weapon];
  h+=`<div class="cui-left">
   <div class="cui-portrait">${m?pic(m,'pt big'):''}</div>
   <div class="cui-info">
    <div class="cui-name">${sel.name}</div>
    <div class="cui-class">${CLASS_DE[sel.cls]} · Lv ${m?m.lvl:'?'}</div>
    <div class="cui-bars">
     <div>HP ${bar(sel.hp/sel.maxHp*100,sel.hp>sel.maxHp*0.3?'#4ade80':'#ef4444')} ${sel.hp}/${sel.maxHp}</div>
     <div>AP <span class="cui-ap">${'●'.repeat(sel.ap)}${'○'.repeat(2-sel.ap)}</span></div>
    </div>
    <div class="cui-weapon">${w?`<img class="cui-wspr" src="${weaponSprite(sel.weapon)}" alt="">`:''}${w?w.name:'–'} ${w?w.min+'–'+w.max:''} (R.${w?w.range:''})</div>
    ${sel.melee?`<div class="cui-melee">⚔ ${WEAPONS[sel.melee]?WEAPONS[sel.melee].name:'Melee'}</div>`:''}
   </div>
  </div>`;
 } else {
  h+=`<div class="cui-left"><div class="cui-info"><div class="cui-name" style="color:#6b7a90">Keine Einheit ausgewählt</div><div class="cui-class">Klicke auf eine Einheit</div></div></div>`;
 }
 h+=`<div class="cui-actions">`;
 if(sel&&sel.ap>0&&!C.result){
  h+=`<button class="cui-btn" onclick="if(C.selected)playerWait(C.selected)">⏸ Warten</button>`;
  h+=`<button class="cui-btn" onclick="if(C.selected)playerSelect(C.selected)">🔄 Neu wählen</button>`;
 }
 if(C.result){
  h+=`<button class="cui-btn cui-btn-go" onclick="combatEnd()">▶ Weiter</button>`;
 }
 h+=`<button class="cui-btn" onclick="showHelp()">❓ Hilfe</button>`;
 h+=`</div>`;
   // Gate-Status + Extrahieren-Button (One-Way-Gate)
  const g=gateReady();
  const gReady=g.at===g.total&&g.total>0;
  h+=`<div class="cui-right">
   <div class="cui-gate">${C.mission&&C.mission.peaceful?`🤝 Erstkontakt: ${C.contactComplete?'hergestellt':'goldene Person ansprechen'}`:C.mission&&C.mission.tutorial?'🎯 Ziel: Teal’c sicher herausbringen':`🌀 Gate: <b style="color:${gReady?'#4ade80':'#8a9ab0'}">${g.at}/${g.total}</b> ${gReady?'bereit':'am Gate'}`}</div>
   ${gReady&&!(C.mission&&(C.mission.tutorial||C.mission.peaceful))?`<button class="cui-btn cui-btn-go" onclick="extract()">🌀 Extrahieren (50%)</button>`:''}
   <div class="cui-log">${C.log.slice(0,4).map(l=>`<div class="${/✔|💀|🌀/.test(l)?'ok':/⚠|⚡/.test(l)?'bad':''}">${l}</div>`).join('')}</div>
  </div>`;
 panel.innerHTML=h;
}

// ===================== Roster =====================
function renderRoster(){
 // Quest-Panel (aktive + erledigte Quests)
 const qs=(S.quests||[]);
 if(qs.length){
  let qh='<div style="grid-column:1/-1;background:#0f1622;border:1px solid #243248;border-radius:6px;padding:8px;margin-bottom:4px"><h3 style="margin:0 0 6px">📋 Quests</h3>';
  qs.forEach(q=>{
    const col=q.status==='done'?'#4ade80':q.status==='failed'?'#f87171':'#4fc3f7';
    const ico=q.status==='done'?'✔':q.status==='failed'?'💀':'📌';
    qh+=`<div class="item" style="border-color:${col}"><b style="color:${col}">${ico} ${q.title}</b> <small>${q.char} · Kap. ${q.chapter}</small><br><small>${q.status==='active'?q.intro:q.status==='done'?q.epilogue:q.fail}</small></div>`;
  });
  qh+='</div>';
  $('roster-body').insertAdjacentHTML('afterbegin',qh);
 }
 const rec=S.roster.filter(m=>m.recruited);
 $('roster-body').innerHTML=rec.map(m=>{
  const dos=typeof DOSSIERS!=='undefined'&&DOSSIERS[m.name];
  return `<div class="rc" title="${m.talent}">${pic(m,'pt big')}<div class="ri">
   <b>${m.name}</b> <small>${CLASS_DE[m.cls]} · Lv ${m.lvl}${m.sg1?' · <span class="ok">SG-1</span>':''}${m.injuries?` · 🩹${m.injuries}`:''}</small>
   <div class="bars">❤${bar(m.hp/m.maxHp*100,'#4ade80')} 💤${bar(m.fatigue,'#facc15')} ☺${bar(m.morale,'#60a5fa')}</div>
   <small class="tal">${m.talent}</small>
   <div style="display:flex;gap:4px;align-items:center">
   <select onchange="act(assignRoom(${m.id},parseInt(this.value)))"><option value="-1" ${m.room<0?'selected':''}>Bank</option>
   ${Object.values(S.base.rooms).map(r=>`<option value="${r.id}" ${m.room===r.id?'selected':''}>${ROOMS[r.type].name}</option>`).join('')}</select>
   ${dos?`<button class="small" onclick="showDossier(${m.id})" title="Akte öffnen">📋</button>`:''}</div></div></div>`;
 }).join('');
 // Rekrutierungsbüro: nicht aktivierte Chars aus dem POOL
 const waiting=S.roster.filter(m=>!m.recruited);
 if(waiting.length){
  $('roster-body').innerHTML+=`<div class="dim" style="grid-column:1/-1;margin-top:8px">📋 Rekrutierungsbüro – ${waiting.length} Kandidaten warten auf ihre Episode</div>`+
   waiting.map(m=>`<div class="rc dim" title="${m.talent}">${pic(m,'pt big')}<div class="ri">
    <b>${m.name}</b> <small>${CLASS_DE[m.cls]} · wird in einer Mission rekrutiert</small>
    <small class="tal">${m.talent}</small></div></div>`).join('');
 }
}
// ===================== Dossier-Modal (Akte) =====================
function showDossier(id){
 const m=S.roster[id];if(!m)return;
 const dos=DOSSIERS[m.name];
 const mEl=$('modal');
 let h=`<h3>📋 Personalakte · ${m.name}</h3><div class="mbody">`;
 h+=`<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">${pic(m,'pt big')}<div><b>${dos.file}</b><br><small>${CLASS_DE[m.cls]} · ${m.sg1?'SG-1':'Rekrut'}</small></div></div>`;
 h+=`<div><b>Biografie:</b> ${dos.bio}</div>`;
 h+=`<div><b>Besonderheit:</b> ${dos.trait}</div>`;
 if(dos.relatives&&dos.relatives.length){
  h+=`<h4>Verwandte</h4>`+dos.relatives.map(r=>`<div>👤 <b>${r.name}</b> (${r.rel}) – ${r.trait}<br><small class="warn">Quest-Hook: ${r.quest}</small></div>`).join('');
 }
 h+=`</div><button onclick="$('modal').style.display='none'">Schließen</button>`;
 mEl.style.display='flex';
 mEl.innerHTML=`<div class="mbox help">${h}</div>`;
}

// ===================== Log =====================
function renderLog(){$('log-body').innerHTML=S.log.slice(0,120).map(l=>`<div>${l}</div>`).join('');}

// ===================== Report =====================
function showReport(){
 const m=$('modal');
 const body=S.rlog.map(l=>`<div class="${/✔|🏆|★|＋|🔬/.test(l)?'ok':/⚡|💥|💀|⚠/.test(l)?'bad':/⏱/.test(l)?'warn':''}">${l}</div>`).join('')||'<div class="dim">Ein ruhiger Tag im SGC.</div>';
 m.style.display='flex';
 m.innerHTML=`<div class="mbox"><h3>Tagesbericht · Tag ${S.day}</h3><div class="mbody">${body}</div><button onclick="$('modal').style.display='none';renderAll()">Weiter</button></div>`;
 renderAll();
}

// ===================== Render-Orchestrator =====================
function renderAll(){
 renderHeader();
 if(UI.tab==='base'){renderBaseSide();}
 else if(UI.tab==='map'){renderMapSide();}
 else if(UI.tab==='roster'){renderRoster();}
 else if(UI.tab==='log'){renderLog();}
 renderCombatUI();
 resizeCombatViewport();
 const ov=$('over');
 if(S.over){ov.style.display='flex';ov.innerHTML=`<div><h2>${S.over==='win'?'🏆 Kampagne gewonnen':'💀 SGC verloren'}</h2><p>${S.over==='win'?'SG-1 verliert nie. Der Papierkram wird dennoch Jahre dauern.':'Die Integrität des SGC ist erschöpft.'}</p><button onclick="resetGame(true)">Neues Spiel</button></div>`;}
 else ov.style.display='none';
}

function doDay(){
 if(S.over||C.active||GR.phase!=='idle')return;
 endDay();
 showReport();
}
function resetGame(force){
 if(!force&&!confirm('Neues Spiel starten? Der Spielstand geht verloren.'))return;
 newGame();save();$('modal').style.display='none';$('combat-overlay').style.display='none';document.body.style.overflow='';hideMenu();MAP.sel=null;setTab('base');
 startOpeningCinematic(()=>{S.introSeen=true;save();showPilotOpening();});
}
function toggleSound(){
 if(typeof SFX!=='undefined'){
  const muted=SFX.toggle();
  const b=$('sound');if(b)b.textContent=muted?'🔇':'🔊';
 }
}

// ===================== Frame-Loop =====================
function frame(now){
 if(UI.menuOpen){requestAnimationFrame(frame);return;} // Pause: nichts rendern/fortschreiten
 if(C.active){
  renderCombat($('combat-cv'));
  renderCombatUI();
  resizeCombatViewport();
  $('combat-end').style.display=C.result?'inline-block':'none';
 }
 else if(GR.phase!=='idle'&&GATE_STATE){drawGateroom($('gate-cv'),now,GATE_STATE);}
 else if(UI.tab==='base'){renderBase($('base-cv'));}
 else if(UI.tab==='map'){drawMap($('map-cv'),now);}
 requestAnimationFrame(frame);
}

// ===================== Init =====================
function init(){
 if(!load())newGame();
 resizeCombatViewport();
 window.addEventListener('resize',resizeCombatViewport);
 document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
 $('go').onclick=doDay;$('reset').onclick=()=>resetGame(false);
 $('gate-cv').onclick=()=>skipGate();
 $('base-cv').onclick=e=>baseClick(e.clientX,e.clientY);
 $('map-cv').onclick=e=>{const cv=e.target,r=cv.getBoundingClientRect(),sx=cv.width/r.width,x=(e.clientX-r.left)*sx,y=(e.clientY-r.top)*sx;
  const hit=MAP.nodes.find(n=>Math.hypot(n.x-x,n.y-y)<n.r);MAP.sel=hit?hit.id:null;renderAll();};
 $('combat-cv').onclick=combatClick;
 $('combat-cv').onmousemove=combatHover;
 $('combat-cv').onpointerdown=combatPointerDown;
 $('combat-cv').onpointermove=combatPointerMove;
 $('combat-cv').onpointerup=combatPointerUp;
 $('combat-cv').onpointercancel=combatPointerUp;
 $('combat-minimap').onclick=panCombatToMinimap;
 $('combat-minimap').onpointerdown=panCombatToMinimap;
 $('combat-minimap').onpointermove=e=>{if(e.buttons)panCombatToMinimap(e);};
 $('combat-end').onclick=combatEnd;
 if($('help'))$('help').onclick=showHelp;
 if($('sound'))$('sound').onclick=toggleSound;
 // Escape = Pause-Menü (außer in Eingabefeldern)
 document.addEventListener('keydown',e=>{
  if(C.active&&!C.result&&!C.dialogueActive&&!UI.menuOpen){
   const pans={ArrowLeft:[-2,0],a:[-2,0],A:[-2,0],ArrowRight:[2,0],d:[2,0],D:[2,0],
    ArrowUp:[0,-2],w:[0,-2],W:[0,-2],ArrowDown:[0,2],s:[0,2],S:[0,2]};
   const pan=pans[e.key];
   if(pan){e.preventDefault();combatPan(pan[0],pan[1]);return;}
  }
  if((e.key==='Enter'||e.key===' ')&&$('story-dialogue').style.display==='flex'){
   e.preventDefault();$('story-next')?.click();return;
  }
  if(e.key==='Escape'){
   if($('intro-overlay').style.display==='flex'||$('story-dialogue').style.display==='flex')return;
   const t=document.activeElement;if(t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'))return;toggleMenu();
  }
 });
 setTab('base');
 if(!S.introSeen){
  MAP.sel='chulak';setTab('map');
  startOpeningCinematic(()=>{
   S.introSeen=true;save();
   if(!S.pilotBriefingSeen&&!S.done.includes('1-1')&&S.day===1)showPilotOpening();
  });
 } else if(!S.pilotBriefingSeen&&!S.done.includes('1-1')&&S.day===1){
  MAP.sel='chulak';setTab('map');showPilotOpening();
 }
 requestAnimationFrame(frame);
}
window.addEventListener('load',init);
