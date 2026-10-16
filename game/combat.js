'use strict';
// ===================== SGC COMMAND v2 – Combat =====================
// Taktischer Grid-Kampf (X-COM-Style). 20×15 Tiles, 2 AP, Deckung, LOS.
// Mission endet bei SIEG (alle Gegner tot) oder EXTRAKTION (Team am Gate).
// One-Way-Gate (Lore): ihr kommt durchs Gate, müsst es aber NEU WÄHLEN, um zurück.
// KEINE Zeit-Begrenzung – Runden laufen, bis die Mission fertig ist.
// Rekruten sterben permanent.
// Rendering: drawSoldier() (art.js) für Spieler, drawEnemyBody() für Feinde.
// FX-System: Schadenszahlen, Treffer-Flash, Mündungsfeuer, Tracer, Tod.
// Sound: SFX (sound.js). UX: Angriffsziele SOFORT bei Auswahl sichtbar.

const C={active:false,map:[],units:{},nextId:1,round:1,phase:'player',gatePos:null,objective:null,selected:null,moveRange:[],atkRange:[],result:null,log:[],mission:null,teamIds:[],hover:null,fx:[],shake:0,firstHint:true,firstJaffa:false,tutorial:null,dialogueActive:false,sceneFlags:{}};
const TILE=48,GW=20,GH=15;
const sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};

// ---------- FX-System ----------
function addFx(fx){fx.t0=performance.now();C.fx.push(fx);if(C.fx.length>80)C.fx.shift();}
function spawnDamage(x,y,val,color){addFx({type:'dmg',x,y,val,color:color||'#fff'});}
function spawnFlash(x,y,color){addFx({type:'flash',x,y,color:color||'#fff'});}
function spawnMuzzle(x,y){addFx({type:'muzzle',x,y});}
function spawnTrace(x0,y0,x1,y1){addFx({type:'trace',x0,y0,x1,y1});}
function spawnDeath(x,y){addFx({type:'death',x,y});}
function updateFx(){const now=performance.now();C.fx=C.fx.filter(f=>now-f.t0<700);C.shake=Math.max(0,C.shake*0.82-0.15);}

function startCombat(mission,teamIds){
  C.active=true;C.mission=mission;C.teamIds=teamIds;
  C.theme=mission.theme||mission.map;C.tileCache={};
  C.round=1;C.phase='player';
  // Schwierigkeit + Progression: D = gewählte Stufe, chapterScale = wird mit
  // jedem Kapitel +5% schwerer (unabhängig von der Stufe). Feind-HP/Schaden/
  // Anzahl skalieren mit D * chapterScale; Spieler-Schaden mit D.
  // KEIN Gate-Timer mehr: Runden laufen, bis Sieg oder Rückkehr zum Gate.
  const D=diff(),chapterScale=1+S.chapter*0.05;
  C.result=null;C.log=[];C.selected=null;C.moveRange=[];C.atkRange=[];C.nextId=1;C.units={};C.hover=null;C.fx=[];C.shake=0;
  C.tutorial=mission.tutorial?{step:0}:null;
  C.dialogueActive=false;C.sceneFlags={};
  C.firstHint=!mission.tutorial;
  C.firstJaffa=false;
  // Erster Jaffa-Kontakt: einmaliger narrativer Beat – der erste Jaffa ist "etwas Besonderes".
  const hasJaffa=mission.enemies&&['jaffa','veteran','elite'].some(t=>mission.enemies[t]>0);
  if(hasJaffa&&!S.jaffaSeen){
    S.jaffaSeen=true;C.firstJaffa=true;
    clog('⚠ ERSTER KONTAKT: Jaffa!');
    clog('   „Krieger, die an einen Gott glauben. Respekt. Aber sie schießen trotzdem.“ – O\'Neill');
  }
  const tmpl=MAPS[mission.map]||MAPS.desert;
  C.map=[];let gatePos=null;
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
    const ch=tmpl[y][x];let t=0;
    if(ch==='l')t=1;else if(ch==='H')t=2;else if(ch==='#')t=3;else if(ch==='~')t=4;
    else if(ch==='G'&&!gatePos){t=5;gatePos={x,y};}
    C.map.push({t});
  }
  if(!gatePos){gatePos={x:Math.floor(GW/2),y:Math.floor(GH/2)};C.map[idx(gatePos.x,gatePos.y)].t=5;}
  C.gatePos=gatePos;
  // Ziel: defense = N Runden überleben, assault = alle Gegner besiegen.
  // Beides kann auch per EXTRAKTION (Rückkehr zum Gate) beendet werden.
  C.objective=mission.type==='defense'?{type:'survive',rounds:10}:{type:'kill'};
  // Spawn: Das Team kommt durchs Gate -> spawnt in den freien Tiles direkt am
  // Gate (Chebyshev-Radius 2, nächstgelegene zuerst, ohne Kollision). So steht
  // das ganze Team am Start "am Gate" und kann bei Bedarf sofort extrahieren
  // (One-Way-Ausweg: Gate neu wählen). Gate-Tiles selbst sind nicht begehbar.
  const spawnTiles=[];
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    const x=gatePos.x+dx,y=gatePos.y+dy;
    if(isWalkable(x,y))spawnTiles.push({x,y,d:Math.max(Math.abs(dx),Math.abs(dy))});
  }
  spawnTiles.sort((a,b)=>a.d-b.d);
  const usedSpawn=new Set();
  teamIds.forEach(id=>{
    const m=S.roster[id];if(!m||!m.recruited||m.dead)return;
    const pos=spawnTiles.find(t=>!usedSpawn.has(idx(t.x,t.y)))||{x:gatePos.x,y:gatePos.y};
    usedSpawn.add(idx(pos.x,pos.y));
    const uid=C.nextId++;
    C.units[uid]={id:uid,side:'player',name:m.name,cls:m.cls,
      x:pos.x,y:pos.y,
      hp:m.hp,maxHp:m.maxHp,move:m.move,ap:2,
      weapon:m.weapon,melee:m.melee,sg1:m.sg1,
      downed:false,dead:false,charId:m.id,specialUsed:false};
  });
  const eCount=mission.enemies,edges=getSpawnEdges(),scriptedSpawns=mission.enemySpawns||[];
  let spawnIndex=0;
  for(const type in eCount){
    // Anzahl: Leicht ~70% (min. 1), Normal 100%, Hart ~125% – skaliert mit Kapitel.
    const n=Math.max(1,Math.round(eCount[type]*D.enemyCount*chapterScale));
    for(let i=0;i<n;i++){
      const E=ENEMIES[type],uid=C.nextId++,pos=scriptedSpawns[spawnIndex++]||edges[ri(edges.length)];
      const hp=Math.round(E.hp*D.enemyHp*chapterScale);
      C.units[uid]={id:uid,side:'enemy',type,name:E.name,
        x:pos.x,y:pos.y,hp:hp,maxHp:hp,move:E.move,ap:2,
        weapon:E.weapon,melee:E.melee,color:E.color,downed:false,dead:false};
    }
  }
  clog(`Mission: ${mission.name} · ${mission.goal}`);
  if(mission.tutorial){
    clog('🎯 Teal’c entscheidet sich erst, wenn SG-1 den Einsatz erfolgreich abschließt.');
    clog('   Bewege Jack, nutze Deckung, feuere auf die Wachen und lerne „Warten“.');
  } else {
    clog(`🌀 Ihr kommt durchs Gate. One-Way – zum Zurückkehren müsst ihr es neu wählen.`);
    clog(`   Sieg = alle Gegner besiegt (100% Beute) · Extraktion = ganzes Team am Gate (50%).`);
  }
  nextUnit();
  playCombatScene('arrival');
}

function inB(x,y){return x>=0&&y>=0&&x<GW&&y<GH;}
function idx(x,y){return y*GW+x;}
function isWalkable(x,y){if(!inB(x,y))return false;const t=C.map[idx(x,y)].t;return t===0||t===1||t===2;}
function blocksLOS(x,y){if(!inB(x,y))return true;const t=C.map[idx(x,y)].t;return t===3||t===4||t===5;}
function los(x0,y0,x1,y1){
  let dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy,x=x0,y=y0;
  while(!(x===x1&&y===y1)){
    const e2=2*err;
    if(e2>-dy){err-=dy;x+=sx;}
    if(e2<dx){err+=dx;y+=sy;}
    if(x===x1&&y===y1)break;
    if(blocksLOS(x,y))return false;
  }
  return true;
}
function dist(x0,y0,x1,y1){return Math.max(Math.abs(x1-x0),Math.abs(y1-y0));}
function unitAt(x,y){return Object.values(C.units).find(u=>!u.dead&&!u.downed&&u.x===x&&u.y===y);}
function getSpawnEdges(){
  const e=[];
  for(let x=0;x<GW;x++){if(isWalkable(x,0))e.push({x,y:0});if(isWalkable(x,GH-1))e.push({x,y:GH-1});}
  for(let y=0;y<GH;y++){if(isWalkable(0,y))e.push({x:0,y});if(isWalkable(GW-1,y))e.push({x:GW-1,y});}
  return e.length?e:[{x:0,y:0}];
}
function moveRange(unit){
  const range=[],visited=new Map(),queue=[{x:unit.x,y:unit.y,cost:0}];
  visited.set(idx(unit.x,unit.y),0);
  while(queue.length){
    const cur=queue.shift();
    if(cur.cost>0)range.push({x:cur.x,y:cur.y});
    if(cur.cost>=unit.ap)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nx=cur.x+dx,ny=cur.y+dy,ni=idx(nx,ny);
      if(visited.has(ni)||!isWalkable(nx,ny)||unitAt(nx,ny))continue;
      visited.set(ni,cur.cost+1);
      queue.push({x:nx,y:ny,cost:cur.cost+1});
    }
  }
  return range;
}
function attackTargets(unit){
  const targets=[],w=WEAPONS[unit.weapon];
  for(const u of Object.values(C.units)){
    if(u.side===unit.side||u.dead||u.downed)continue;
    const d=dist(unit.x,unit.y,u.x,u.y);
    if(d<=w.range&&los(unit.x,unit.y,u.x,u.y))targets.push(u);
  }
  return targets;
}
function doAttack(attacker,target){
  const w=WEAPONS[attacker.weapon];
  let hit=w.hit;
  if(attacker.x!==target.x&&attacker.y!==target.y)hit-=20;
  const tt=C.map[idx(target.x,target.y)].t;
  if(tt===1)hit-=25;if(tt===2)hit-=50;
  if(w.ignoreCover)hit+=25;
  const at=C.map[idx(attacker.x,attacker.y)].t;
  if(at===1)hit+=10;if(at===2)hit+=15;
  hit=clamp(hit,10,95);
  spawnTrace(attacker.x,attacker.y,target.x,target.y);
  spawnMuzzle(attacker.x,attacker.y);
  if(w.name==='Shotgun')sfx('shotgun');else sfx('shoot');
      if(Math.random()*100<hit){
    let dmg=rnd(w.min,w.max);
    if(attacker.name==="Teal'c"&&target.type&&target.type.startsWith('jaffa')&&dist(attacker.x,attacker.y,target.x,target.y)<=1&&attacker.melee==='chakram')dmg+=8;
    if(attacker.side==='player'){
      if(has('W2')&&target.type&&['goauld','repl','drone','queen'].includes(target.type))dmg=Math.round(dmg*1.2);
      if(has('W3'))dmg=Math.round(dmg*1.1);
      dmg=Math.round(dmg*diff().playerDmg); // Schwierigkeit: Spieler-Schaden
    }
    if(attacker.side==='enemy')dmg=Math.round(dmg*diff().enemyDmg); // Schwierigkeit: Gegner-Schaden
    target.hp-=dmg;
    spawnDamage(target.x,target.y,dmg,'#ffd23a');
    spawnFlash(target.x,target.y,'#ff5555');
    sfx('hit');
    if(dmg>15)C.shake=6;
    clog(`${attacker.name} → ${target.name}: ${dmg} Schaden`);
    if(target.hp<=0){target.hp=0;killUnit(target);}
    return true;
  } else {clog(`${attacker.name} verfehlt ${target.name}.`);sfx('miss');return false;}
}
function doMelee(attacker,target){
  const w=WEAPONS[attacker.melee]||WEAPONS.melee;
  let dmg=rnd(w.min,w.max);
  if(attacker.name==="Teal'c"&&target.type&&target.type.startsWith('jaffa'))dmg+=8;
  if(attacker.side==='player')dmg=Math.round(dmg*diff().playerDmg); // Schwierigkeit: Spieler-Schaden
  else dmg=Math.round(dmg*diff().enemyDmg); // Schwierigkeit: Gegner-Schaden
  target.hp-=dmg;
  sfx('melee');
  spawnFlash(target.x,target.y,'#ff8844');
  spawnDamage(target.x,target.y,dmg,'#ff8844');
  C.shake=4;
  clog(`${attacker.name} melee → ${target.name}: ${dmg}`);
  if(target.hp<=0){target.hp=0;killUnit(target);}
}
function killUnit(u){
  if(u.side==='enemy'){
    u.dead=true;spawnDeath(u.x,u.y);sfx('death');clog(`💀 ${u.name} zerstört.`);
    // Jaffa-Toten: Zähler + einmaliger „First Blood"-Bonus (der erste Jaffa ist etwas Besonderes).
    if(u.type&&u.type.startsWith('jaffa')){
      S.jaffaKills=(S.jaffaKills||0)+1;
      if(S.jaffaKills===1){
        clog('★ Erster Jaffa besiegt! +30 XP, +10 Morale (Team).');
        Object.values(C.units).forEach(p=>{if(p.side==='player'){const m=S.roster[p.charId];if(m){m.xp+=30;m.morale=Math.min(100,m.morale+10);}}});
      }
    }
    playCombatScene('firstKill');
  }
  else{u.downed=true;sfx('death');clog(`⚠ ${u.name} ist DOWN!`);checkDowned();}
}
function checkDowned(){
  const downed=Object.values(C.units).filter(u=>u.side==='player'&&u.downed);
  if(downed.length>=2&&!C.result){C.result='extracted';clog('⚡ 2+ Mitglieder down → Auto-Extraktion!');}
}
// ---------- Spieler-Aktionen ----------
function playerSelect(unit){
  if(unit.side!=='player'||unit.dead||unit.downed||unit.ap<=0)return;
  if(C.tutorial&&C.tutorial.step===0&&unit.charId===0)C.tutorial.step=1;
  C.selected=unit;C.moveRange=moveRange(unit);C.atkRange=tutorialAllowsAttack(unit)?attackTargets(unit):[];
}
function tutorialAllowsAttack(unit){return !C.tutorial||unit.charId!==0||C.tutorial.step>=2;}
function playerMove(unit,x,y){
  const d=dist(unit.x,unit.y,x,y);
  if(d>unit.move||!isWalkable(x,y)||unitAt(x,y))return;
  if(C.tutorial&&C.tutorial.step<=1&&unit.charId===0)C.tutorial.step=2;
  unit.x=x;unit.y=y;unit.ap--;C.firstHint=false;
  if(unit.ap>0){C.selected=unit;C.moveRange=moveRange(unit);C.atkRange=attackTargets(unit);}
  else{C.selected=null;C.moveRange=[];C.atkRange=[];nextUnit();}
}
function playerAttack(unit,target){
  if(unit.ap<1)return;
  if(C.tutorial&&C.tutorial.step===2&&unit.charId===0)C.tutorial.step=3;
  unit.ap--;C.firstHint=false;
  doAttack(unit,target);
  if(unit.ap>0){C.selected=unit;C.moveRange=moveRange(unit);C.atkRange=attackTargets(unit);}
  else{C.selected=null;C.moveRange=[];C.atkRange=[];}
  checkEnd();
  if(!C.result&&unit.ap<=0)nextUnit();
}
function playerWait(unit){
  if(C.tutorial&&C.tutorial.step===3)C.tutorial.step=4;
  unit.ap=0;C.firstHint=false;C.selected=null;C.moveRange=[];C.atkRange=[];
  nextUnit();
}
function nextUnit(){
  if(C.result)return;
  const units=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead&&!u.downed&&u.ap>0);
  if(units.length===0){endPlayerPhase();return;}
  C.selected=units[0];C.moveRange=moveRange(C.selected);C.atkRange=tutorialAllowsAttack(C.selected)?attackTargets(C.selected):[];
}
// ---------- Gegner-Phase (AI) ----------
function endPlayerPhase(){
  if(C.result)return;
  C.phase='enemy';
  const enemies=Object.values(C.units).filter(u=>u.side==='enemy'&&!u.dead&&!u.downed);
  enemies.forEach(e=>{if(!C.result)enemyAct(e);});
  if(!C.result)endRound();
}
function enemyAct(u){
  let ap=2;
  while(ap>0&&!C.result){
    const target=nearestPlayer(u);
    if(!target)break;
    const d=dist(u.x,u.y,target.x,target.y);
    const w=WEAPONS[u.weapon];
    const inRange=d<=w.range&&los(u.x,u.y,target.x,target.y);
    if(inRange){doAttack(u,target);ap--;}
    else if(d<=1&&u.melee){doMelee(u,target);ap--;}
    else{
      const step=bestStep(u,target);
      if(step){u.x=step.x;u.y=step.y;ap--;}
      else break;
    }
  }
}
function nearestPlayer(u){
  let best=null,bd=999;
  for(const p of Object.values(C.units)){
    if(p.side!=='player'||p.dead||p.downed)continue;
    const d=dist(u.x,u.y,p.x,p.y);
    if(d<bd){bd=d;best=p;}
  }
  return best;
}
function bestStep(u,target){
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let best=null,bd=dist(u.x,u.y,target.x,target.y);
  for(const[dx,dy]of dirs){
    const nx=u.x+dx,ny=u.y+dy;
    if(!isWalkable(nx,ny)||unitAt(nx,ny))continue;
    const nd=dist(nx,ny,target.x,target.y);
    if(nd<bd){
      const t=C.map[idx(nx,ny)].t;
      const cover=t===1?0.1:t===2?0.2:0;
      const score=nd-cover;
      if(!best||score<best.score)best={x:nx,y:ny,score};
    }
  }
  return best;
}
function endRound(){
  if(C.result)return;
  C.round++;
  Object.values(C.units).forEach(u=>{if(!u.dead&&!u.downed)u.ap=2;});
  checkEnd();
  if(!C.result){C.phase='player';nextUnit();}
}
function checkEnd(){
  if(C.result)return;
  const enemies=Object.values(C.units).filter(u=>u.side==='enemy'&&!u.dead);
  const players=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead);
  if(enemies.length===0){C.result='victory';sfx('victory');clog('✔ Alle Gegner besiegt!');return;}
  if(players.length===0||players.every(p=>p.downed)){C.result='defeat';sfx('defeat');clog('💀 Team ausgelöscht.');return;}
  if(C.objective.type==='survive'&&C.round>C.objective.rounds){C.result='victory';sfx('victory');clog('✔ Halte-Mission erfolgreich!');return;}
}
// One-Way-Gate: Extraktion = das Gate NEU WÄHLEN, um zurück zu kommen.
// Funktioniert nur, wenn das ganze (überlebende) Team in Gate-Nähe steht.
function gateReady(){
  const players=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead);
  return {at:players.filter(p=>dist(p.x,p.y,C.gatePos.x,C.gatePos.y)<=2).length,total:players.length};
}
function extract(){
  if(C.result)return false;
  const g=gateReady();
  if(g.at<g.total){clog(`⚠ Extraktion nicht möglich: nur ${g.at}/${g.total} am Gate.`);return false;}
  C.result='extracted';sfx('gate');clog('🌀 Gate neu gewählt – Team extrahiert. (50% Beute)');
  return true;
}
function clog(t){C.log.unshift(t);if(C.log.length>100)C.log.pop();}
function applyCombatResult(){
  // Backfill für alte Saves (v4 ohne jaffaSeen/jaffaKills)
  if(S.jaffaSeen===undefined)S.jaffaSeen=false;
  if(S.jaffaKills===undefined)S.jaffaKills=0;
  const m=C.mission,result=C.result;
  const teamUnits=Object.values(C.units).filter(u=>u.side==='player');
  teamUnits.forEach(u=>{
    const m=S.roster[u.charId];if(!m)return;
    if(u.dead){
      if(m.sg1){note(`⚠ ${m.name} down. Duplikat-Klausel greift.`);m.hp=Math.max(10,m.hp-30);m.injuries+=2;}
      else{m.dead=true;S.memorial.push(m.name);note(`💀 ${m.name} ist gefallen. Gedenktafel angebracht.`);
        S.roster.forEach(x=>{if(x.recruited&&!x.dead)x.morale=Math.max(0,x.morale-10);});}
    } else {m.hp=u.hp;m.fatigue=Math.min(100,m.fatigue+20);m.morale=Math.max(0,m.morale-5);}
  });
  failQuests();
  // Extraktion schließt normale Missionen ab; der Pilotauftrag braucht den Sieg, damit Teal’c mitkommt.
  if(result==='victory'||result==='extracted'){
    if(m.tutorial&&result!=='victory'){
      note('⚠ Teal’c bleibt auf Chulak. SG-1 muss den Einsatz erfolgreich abschließen.');
    } else {
      const full=result==='victory';
      const lootPct=full?1:(0.5+(has('G1')?0.1:0));
      S.done.push(m.id);
      advanceQuests(m.id);
      for(const k in m.reward)S.res[k]=(S.res[k]||0)+Math.round(m.reward[k]*lootPct);
      note(full?`✔ ${m.name}: ${m.text}`:`🌀 ${m.name}: Extraktion (${Math.round(lootPct*100)}% Beute).`);
      teamUnits.forEach(u=>{const m=S.roster[u.charId];if(m&&!m.dead)m.xp+=Math.round((20+S.chapter*5)*(full?1:0.5));});
      if(m.recruit!==undefined&&!S.roster[m.recruit].recruited){
        S.roster[m.recruit].recruited=true;
        note(m.recruit===3&&m.id==='1-1'?'🤝 Teal’c widersetzt sich Apophis und schließt sich SG-1 an.':`＋ Neuer Rekrut: ${S.roster[m.recruit].name}`);
      }
    }
  }
  else if(result==='defeat'){S.integrity=Math.max(0,S.integrity-10);note(`💀 Niederlage bei ${m.name}.`);}
  C.active=false;save();
}

// ---------- Feind-Body (Pixel-Stil, analog zu drawSoldier) ----------
function drawEnemyBody(c,x,y,sc,type,alpha){
  c.save();c.globalAlpha=alpha||1;
  const colors={
    jaffa:{skin:'#c8a060',robe:'#8a6a30',accent:'#e8c040',weapon:'#4a3a20'},
    veteran:{skin:'#b89050',robe:'#6a4a20',accent:'#d06030',weapon:'#4a3a20'},
    elite:{skin:'#a88040',robe:'#4a2a40',accent:'#a040a0',weapon:'#3a2a40'},
    goauld:{skin:'#d9a882',robe:'#c8a040',accent:'#ffd700',weapon:'#8a7030'},
    repl:{skin:'#909090',robe:'#606060',accent:'#c0c0c0',weapon:'#404040'},
    drone:{skin:'#c0c0c0',robe:'#808080',accent:'#e0e0e0',weapon:'#505050'},
    queen:{skin:'#606060',robe:'#404040',accent:'#808080',weapon:'#303030'},
  };
  const col=colors[type]||colors.jaffa;
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y,8*sc,3*sc,0,0,7);c.fill();
  c.fillStyle=col.robe;c.fillRect(x-4*sc,y-10*sc,3*sc,10*sc);c.fillRect(x+1*sc,y-10*sc,3*sc,10*sc);
  c.fillStyle=col.robe;c.fillRect(x-6*sc,y-22*sc,12*sc,13*sc);
  c.fillStyle=col.accent;c.fillRect(x-6*sc,y-22*sc,12*sc,2*sc);
  if(type==='goauld')c.fillRect(x-2*sc,y-20*sc,4*sc,8*sc);
  c.fillStyle=shade(col.robe,-20);c.fillRect(x-9*sc,y-21*sc,3*sc,9*sc);c.fillRect(x+6*sc,y-21*sc,3*sc,9*sc);
  c.fillStyle=col.weapon;c.fillRect(x+7*sc,y-24*sc,2*sc,14*sc);
  c.fillStyle=col.accent;c.fillRect(x+7*sc,y-25*sc,2*sc,2*sc);
  c.fillStyle=col.skin;c.beginPath();c.arc(x,y-26*sc,5*sc,0,7);c.fill();
  const eyeCol=type==='goauld'?'#ffd700':'#1a1a1a';
  c.fillStyle=eyeCol;c.fillRect(x-3*sc,y-27*sc,2*sc,1.5*sc);c.fillRect(x+1*sc,y-27*sc,2*sc,1.5*sc);
  if(type==='jaffa'||type==='veteran'||type==='elite'){c.fillStyle=col.accent;c.fillRect(x-1*sc,y-29*sc,2*sc,2*sc);}
  c.restore();
}

// ---------- Rendering ----------
function renderCombat(cv){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height;
  c.clearRect(0,0,W,H);
  updateFx();
  c.save();
  if(C.shake>0.3)c.translate((Math.random()-0.5)*C.shake,(Math.random()-0.5)*C.shake);
  // Cache jede Weltzelle einzeln, damit drawTile seine Koordinaten-Details beibehält.
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
    const t=C.map[idx(x,y)].t,px=x*TILE,py=y*TILE;
    const key=C.theme+'_'+t+'_'+x+'_'+y;
    if(!C.tileCache[key]){
      const oc=document.createElement('canvas');oc.width=TILE;oc.height=TILE;
      const tileCtx=oc.getContext('2d');
      tileCtx.translate(-x*TILE,-y*TILE);
      drawTile(tileCtx,C.theme,t,x*TILE,y*TILE);
      C.tileCache[key]=oc;
    }
    c.drawImage(C.tileCache[key],px,py);
    c.strokeStyle='rgba(255,255,255,0.04)';c.lineWidth=1;c.strokeRect(px,py,TILE,TILE);
  }
  // Bewegungsbereich (blau)
  C.moveRange.forEach(({x,y})=>{c.fillStyle='rgba(79,195,247,0.18)';c.fillRect(x*TILE+1,y*TILE+1,TILE-2,TILE-2);
    c.fillStyle='rgba(79,195,247,0.5)';c.fillRect(x*TILE+TILE/2-2,y*TILE+TILE/2-2,4,4);});
  // Angriffsziele (rot) – SOFORT bei Auswahl sichtbar
  C.atkRange.forEach(u=>{c.fillStyle='rgba(239,68,68,0.28)';c.fillRect(u.x*TILE,u.y*TILE,TILE,TILE);
    c.strokeStyle='rgba(239,68,68,0.85)';c.lineWidth=2;c.strokeRect(u.x*TILE+2,u.y*TILE+2,TILE-4,TILE-4);
    c.fillStyle='#ef4444';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText('✛',u.x*TILE+TILE/2,u.y*TILE+TILE/2+5);});
  // Gate-Marker: pulsierender Portal-Ring + Label. Das Team kommt hierher,
  // um zu extrahieren (One-Way: Gate neu wählen). performance.now() inline,
  // da die gemeinsame `now`-Variable erst weiter unten deklariert wird.
  {
    const pn=performance.now(),gx=C.gatePos.x*TILE+TILE/2,gy=C.gatePos.y*TILE+TILE/2;
    const pulse=0.5+0.5*Math.sin(pn/300);
    c.save();
    c.strokeStyle=`rgba(79,195,247,${0.5+0.4*pulse})`;c.lineWidth=3;
    c.beginPath();c.arc(gx,gy,18+3*pulse,0,7);c.stroke();
    c.strokeStyle=`rgba(138,216,255,${0.3+0.3*pulse})`;c.lineWidth=1.5;
    c.beginPath();c.arc(gx,gy,24+4*pulse,0,7);c.stroke();
    c.fillStyle=`rgba(79,195,247,${0.15+0.15*pulse})`;c.beginPath();c.arc(gx,gy,16,0,7);c.fill();
    c.fillStyle='#8ad8ff';c.font='bold 10px monospace';c.textAlign='center';
    c.fillText('GATE',gx,gy-26);
    c.restore();
  }
  // Units
  const now=performance.now();
  for(const u of Object.values(C.units)){
    if(u.dead)continue;
    const px=u.x*TILE,py=u.y*TILE;
    const cx=px+TILE/2,cy=py+TILE-6;
    if(u.side==='player'){
      const m=S.roster[u.charId];
      if(m){
        const alpha=u.downed?0.4:1;
        const bob=Math.sin(now/400+u.id)*0.4;
        drawSoldier(c,cx,cy+bob,0.75,m,0,alpha);
        c.fillStyle='#1a1a1a';c.fillRect(px+4,py+TILE-5,TILE-8,4);
        c.fillStyle=u.hp>u.maxHp*0.3?'#4ade80':'#ef4444';
        c.fillRect(px+4,py+TILE-5,(TILE-8)*u.hp/u.maxHp,4);
        c.fillStyle='#d6e0ec';c.font='bold 9px monospace';c.textAlign='center';
        c.fillText(u.name.split(' ')[0],cx,py+TILE+9);
        c.fillStyle='#4fc3f7';c.font='9px monospace';c.textAlign='left';
        c.fillText('AP:'+u.ap,px+2,py+10);
        if(u.downed){c.fillStyle='rgba(239,68,68,0.4)';c.fillRect(px,py,TILE,TILE);
          c.fillStyle='#fff';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText('✚',cx,py+TILE/2+5);}
      }
      if(C.selected===u){
        c.strokeStyle='#4fc3f7';c.lineWidth=3;c.strokeRect(px+1,py+1,TILE-2,TILE-2);
        c.strokeStyle='rgba(79,195,247,0.4)';c.lineWidth=1;c.strokeRect(px-1,py-1,TILE+2,TILE+2);
      }
    } else {
      const alpha=u.downed?0.4:1;
      drawEnemyBody(c,cx,cy,0.75,u.type,alpha);
      c.fillStyle='#1a1a1a';c.fillRect(px+4,py+TILE-5,TILE-8,4);
      c.fillStyle='#ef4444';c.fillRect(px+4,py+TILE-5,(TILE-8)*u.hp/u.maxHp,4);
      c.fillStyle='#f87171';c.font='bold 9px monospace';c.textAlign='center';
      c.fillText(u.name,cx,py+TILE+9);
      if(C.atkRange.includes(u)){
        c.fillStyle='#ef4444';
        c.beginPath();c.moveTo(px+TILE/2,py-4);c.lineTo(px+TILE/2-4,py-10);c.lineTo(px+TILE/2+4,py-10);c.closePath();c.fill();
      }
    }
  }
  // FX
  const nowFx=performance.now();
  C.fx.forEach(f=>{
    const age=(nowFx-f.t0)/700;
    if(f.type==='dmg'){
      const px=f.x*TILE+TILE/2,py=f.y*TILE-age*24;
      c.globalAlpha=1-age;c.fillStyle=f.color;c.font='bold 16px monospace';c.textAlign='center';
      c.fillText('-'+f.val,px,py);c.globalAlpha=1;
    } else if(f.type==='flash'){
      const px=f.x*TILE+TILE/2,py=f.y*TILE+TILE/2;
      c.globalAlpha=(1-age)*0.7;c.fillStyle=f.color;c.beginPath();c.arc(px,py,10+age*20,0,7);c.fill();c.globalAlpha=1;
    } else if(f.type==='muzzle'){
      const px=f.x*TILE+TILE/2,py=f.y*TILE+TILE/2;
      c.globalAlpha=(1-age)*0.9;c.fillStyle='#ffd23a';c.beginPath();c.arc(px,py,6+age*8,0,7);c.fill();c.globalAlpha=1;
    } else if(f.type==='trace'){
      c.globalAlpha=(1-age)*0.6;c.strokeStyle='#ffd23a';c.lineWidth=2;
      c.beginPath();c.moveTo(f.x0*TILE+TILE/2,f.y0*TILE+TILE/2);c.lineTo(f.x1*TILE+TILE/2,f.y1*TILE+TILE/2);c.stroke();c.globalAlpha=1;
    } else if(f.type==='death'){
      const px=f.x*TILE+TILE/2,py=f.y*TILE+TILE/2;
      c.globalAlpha=(1-age)*0.8;c.fillStyle='#888';
      for(let i=0;i<6;i++){const a=i/6*6.28;c.beginPath();c.arc(px+Math.cos(a)*age*20,py+Math.sin(a)*age*20,4*(1-age),0,7);c.fill();}
      c.globalAlpha=1;
    }
  });
  c.restore(); // shake
  // Hover-Info
  if(C.hover&&C.hover.x!==undefined){
    const hx=C.hover.x,hy=C.hover.y;
    if(inB(hx,hy)){
      const hu=unitAt(hx,hy);
      if(hu){
        const bx=Math.min(hx*TILE+TILE+4,W-150),by=Math.max(40,hy*TILE-10);
        c.fillStyle='rgba(6,10,16,0.92)';c.fillRect(bx,by,140,52);
        c.strokeStyle='#4fc3f7';c.lineWidth=1;c.strokeRect(bx,by,140,52);
        c.fillStyle=hu.side==='player'?'#4ade80':'#f87171';c.font='bold 11px monospace';c.textAlign='left';
        c.fillText(hu.name,bx+6,by+15);
        c.fillStyle='#d6e0ec';c.font='10px monospace';
        c.fillText(`HP ${hu.hp}/${hu.maxHp} · Bew ${hu.move}`,bx+6,by+29);
        const w=WEAPONS[hu.weapon];
        if(w)c.fillText(`${w.name} ${w.min}–${w.max} (R.${w.range})`,bx+6,by+43);
      }
    }
  }
  // HUD (oben)
  c.fillStyle='rgba(6,10,16,0.9)';c.fillRect(0,0,W,32);
  c.strokeStyle='#243248';c.lineWidth=1;c.strokeRect(0,0,W,32);
  c.fillStyle='#e8b040';c.font='bold 13px monospace';c.textAlign='left';
  const phase=C.phase==='player'?'▶ SPIELER':'⚔ GEGNER';
  const goal=C.objective.type==='survive'?`Halte ${C.objective.rounds} Runden`:'Alle Gegner besiegen';
  c.fillText(`Runde ${C.round}  ·  ${phase}  ·  🎯 ${goal}`,10,21);
  const g=gateReady();
  c.fillStyle=(g.at===g.total&&g.total>0)?'#4ade80':'#8a9ab0';c.font='bold 12px monospace';c.textAlign='right';
  c.fillText(`🌀 Gate: ${g.at}/${g.total} bereit`,W-12,21);
  c.textAlign='left';
  // Ersthinweis
  if(C.firstHint&&!C.result){
    c.fillStyle='rgba(6,10,16,0.94)';c.fillRect(W/2-280,H-96,560,74);
    c.strokeStyle='#4fc3f7';c.lineWidth=2;c.strokeRect(W/2-280,H-96,560,74);
    c.fillStyle='#4fc3f7';c.font='bold 14px monospace';c.textAlign='center';
    c.fillText('SO KÄMPFST DU',W/2,H-74);
    c.fillStyle='#d6e0ec';c.font='12px monospace';
    c.fillText('1. Einheit anklicken   2. BLAU = bewegen · ROTER GEGNER = schießen   3. ⏸ Warten',W/2,H-52);
    c.fillStyle='#8a9ab0';c.font='10px monospace';
    c.fillText('(Hinweis verschwindet nach der ersten Aktion)',W/2,H-32);
  }
  if(C.tutorial&&!C.result){
    const steps=[
      ['1 · JACK WÄHLEN','Klicke Jack an. Blau zeigt seine möglichen Bewegungsfelder.'],
      ['2 · BEWEGUNG & DECKUNG','Bewege Jack auf ein blaues Feld. Bäume und Trümmer geben Deckung.'],
      ['3 · JETZT FEUERN','Klicke einen rot markierten Jaffa an, um zu schießen.'],
      ['4 · AKTIONSPUNKTE','„Warten“ gibt die übrigen Aktionspunkte deiner Einheit ab.'],
      ['5 · TEAL’C HERAUSHOLEN','Besiege die Wachen. Teal’c hat sich gegen Apophis entschieden.'],
    ];
    const [title,text]=steps[Math.min(C.tutorial.step,steps.length-1)];
    const tw=580,th=66,tx=(W-tw)/2,ty=H-100;
    c.fillStyle='rgba(5,10,18,.94)';c.fillRect(tx,ty,tw,th);
    c.strokeStyle='#e8b040';c.lineWidth=2;c.strokeRect(tx,ty,tw,th);
    c.fillStyle='#e8b040';c.font='bold 13px monospace';c.textAlign='center';
    c.fillText(`CHULAK · EINSATZLEITFADEN  ${title}`,W/2,ty+22);
    c.fillStyle='#d6e0ec';c.font='12px monospace';
    c.fillText(text,W/2,ty+46);
  }
  // Ergebnis
  if(C.result){
    c.fillStyle='rgba(0,0,0,0.6)';c.fillRect(0,0,W,H);
    c.fillStyle=C.result==='victory'?'#4ade80':'#ef4444';c.font='bold 36px monospace';c.textAlign='center';
    const tealcJoins=C.mission&&C.mission.tutorial&&C.result==='victory';
    const rt=tealcJoins?'TEAL’C WECHSELT DIE SEITEN':
      ({victory:'✔ SIEG',defeat:'💀 NIEDERLAGE',extracted:'🌀 EXTRAKTION'}[C.result]||C.result);
    c.fillText(rt,W/2,tealcJoins?H/2-40:H/2);
    if(tealcJoins&&S.roster[3])drawSoldier(c,W/2,H/2+105,1.25,S.roster[3],0,1);
    c.fillStyle='#d6e0ec';c.font='14px monospace';
    c.fillText(tealcJoins?'Ein neuer Verbündeter für SG-1.':'Klicke auf "Weiter" unten.',W/2,tealcJoins?H/2+145:H/2+30);
  }
}
