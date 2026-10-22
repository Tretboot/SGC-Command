'use strict';
// ===================== SGC COMMAND v2 – Combat =====================
// Taktischer Grid-Kampf (X-COM-Style). 64×48 Welt, Vollbildkamera, Deckung, LOS.
// Mission endet bei SIEG (alle Gegner tot) oder EXTRAKTION (Team am Gate).
// One-Way-Gate (Lore): ihr kommt durchs Gate, müsst es aber NEU WÄHLEN, um zurück.
// KEINE Zeit-Begrenzung – Runden laufen, bis die Mission fertig ist.
// Rekruten sterben permanent.
// Rendering: drawSoldier() (art.js) für Spieler, drawEnemyBody() für Feinde.
// FX-System: Schadenszahlen, Treffer-Flash, Mündungsfeuer, Tracer, Tod.
// Sound: SFX (sound.js). UX: Angriffsziele SOFORT bei Auswahl sichtbar.

const C={active:false,map:[],units:{},nextId:1,round:1,phase:'player',gatePos:null,objective:null,selected:null,moveRange:[],atkRange:[],coverRange:[],result:null,log:[],mission:null,teamIds:[],hover:null,fx:[],shake:0,firstHint:true,firstJaffa:false,tutorial:null,dialogueActive:false,sceneFlags:{},cameraX:0,cameraY:0,mapVersion:0,
 distance(x0,y0,x1,y1){return Math.max(Math.abs(x1-x0),Math.abs(y1-y0));}};
const TILE=48;
let VIEW_W=20,VIEW_H=15;
let GW=VIEW_W,GH=VIEW_H;
const sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};

function facingToward(from,to){
 return {x:Math.sign(to.x-from.x),y:Math.sign(to.y-from.y)};
}
function terrainTile(ch){
 if(ch==='l')return 1;
 if(ch==='H')return 2;
 if(ch==='#')return 3;
 if(ch==='~')return 4;
 if(ch==='b')return 6;
 if(ch==='w')return 7;
 if(ch==='V')return 8;
 if(ch==='=')return 9;
 if(ch==='p')return 10;
 return 0;
}
function createShipMap(theme){
 const width=64,height=48,tiles=Array.from({length:height},()=>Array(width).fill('.'));
 const set=(x,y,ch)=>{if(x>=0&&y>=0&&x<width&&y<height)tiles[y][x]=ch;};
 for(let x=0;x<width;x++){set(x,0,'#');set(x,height-1,'#');}
 for(let y=0;y<height;y++){set(0,y,'#');set(width-1,y,'#');}
 for(const x of [20,42])for(let y=1;y<height-1;y++)if(![5,6,14,15,23,24,32,33,41,42].includes(y))set(x,y,'#');
 for(const y of [15,31])for(let x=1;x<width-1;x++)if(![5,6,19,20,31,32,41,42,56,57].includes(x))set(x,y,'#');
 for(const [x,y]of[[5,5],[9,5],[25,5],[33,5],[47,5],[55,5],[5,23],[16,23],[25,23],[37,23],[47,23],[56,23],[5,40],[16,40],[25,40],[37,40],[47,40],[56,40]])set(x,y,'l');
 for(const [x,y]of[[7,8],[27,8],[37,8],[53,8],[7,26],[27,26],[37,26],[53,26],[7,37],[27,37],[37,37],[53,37]])set(x,y,'H');
 set(31,23,'G');
 return tiles.map(row=>row.join(''));
}
function createVillageMap(){
 const width=32,height=24,tiles=Array.from({length:height},()=>Array(width).fill('.'));
 const set=(x,y,ch)=>{if(x>=0&&y>=0&&x<width&&y<height)tiles[y][x]=ch;};
 for(let x=1;x<width-1;x++){set(x,7,'w');set(x,8,'w');}
 for(let x=14;x<=17;x++){set(x,7,'=');set(x,8,'=');}
 for(let y=0;y<height;y++){set(15,y,'p');set(16,y,'p');}
 for(let x=0;x<width;x++)set(x,13,'p');
 for(const [hx,hy]of[[3,3],[8,3],[22,3],[27,3],[3,17],[8,17],[22,17],[27,17]]){
  for(let dy=0;dy<3;dy++)for(let dx=0;dx<3;dx++)set(hx+dx,hy+dy,'V');
 }
 set(15,20,'G');
 return tiles.map(row=>row.join(''));
}
function expandBattleMap(rows,mapName){
 const worldWidth=64,worldHeight=48,offsetX=Math.floor((worldWidth-Math.max(...rows.map(row=>row.length)))/2);
 const offsetY=Math.floor((worldHeight-rows.length)/2);
 const theme=mapName==='hatak'||mapName==='asgard'?mapName:(C.mission.theme||mapName);
 const cells=Array.from({length:worldWidth*worldHeight},()=>({t:0}));
 let gate=null;
 for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){
  const ch=rows[y][x],wx=x+offsetX,wy=y+offsetY;
  if(ch==='G'&&!gate){gate={x:wx,y:wy};cells[wy*worldWidth+wx]={t:5};}
  else{
   const t=terrainTile(ch);
   cells[wy*worldWidth+wx]={t,hp:t===1?30:t===2?55:t===6?24:0};
  }
 }
 if(mapName==='hatak'||mapName==='asgard')return {width:worldWidth,height:worldHeight,offsetX:0,offsetY:0,cells,gate};
 const sourceLeft=offsetX,sourceRight=offsetX+Math.max(...rows.map(row=>row.length))-1;
 const sourceTop=offsetY,sourceBottom=offsetY+rows.length-1;
 const landmarkTiles=mapName==='chulak'?[[1,2],[2,2],[16,2],[17,2],[1,11],[2,11],[16,11],[17,11]]:
  mapName==='abydos'?[[2,1],[3,1],[15,10],[16,10],[2,12],[3,12]]:[];
 landmarkTiles.forEach(([x,y])=>{
  const wx=x+offsetX,wy=y+offsetY,index=wy*worldWidth+wx;
  if(cells[index].t===0)cells[index]={t:3,hp:0};
 });
 const seed=Array.from(mapName).reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
 const hash=(x,y)=>{let n=Math.imul(x+seed,374761393)^Math.imul(y+seed*3,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;};
 const outer=(x,y)=>x<sourceLeft||x>sourceRight||y<sourceTop||y>sourceBottom;
 for(let y=1;y<worldHeight-1;y++)for(let x=1;x<worldWidth-1;x++){
  if(!outer(x,y))continue;
  const n=hash(x,y);
  let t=0;
  if(theme==='jungle'){
   const riverX=Math.floor(worldWidth*.2+Math.sin(y*.19+seed)*1.6);
   const farRiverX=Math.floor(worldWidth*.79+Math.sin(y*.17-seed)*1.8);
   const riverLane=Math.abs(x-riverX)<=0||Math.abs(x-farRiverX)<=0;
   const bridge=[5,12,19,26,33,40].includes(y);
   const village=([[7,9],[55,37]]).some(([vx,vy])=>Math.abs(x-vx)<=3&&Math.abs(y-vy)<=2);
   if(village){
    const road=Math.abs(y-(x<16?9:37))===0||Math.abs(x-(x<16?7:55))===0;
    const house=((x+seed)%5===0&&(y+seed)%3===0)||((x+seed)%5===1&&(y+seed)%3===0);
    if(house)t=8;else if(road)t=10;
   }else if(riverLane)t=bridge?9:7;
   else{
   const grove=(Math.sin(x*.71+seed)*Math.cos(y*.63-seed)+1)/2;
   if(grove>.74&&n>.24)t=n>.7?2:1;
   }
  }else if(theme==='desert'){
   const ridge=(Math.sin(x*.48+seed)*Math.cos(y*.52-seed)+1)/2;
   if(ridge>.88&&n>.44)t=n>.81?2:1;
   else if(n>.986)t=6;
  }else if(theme==='city'){
   const isRoad=(x%8===0||y%7===0);
   const nearBlock=(x%8>=1&&x%8<=3&&y%7>=1&&y%7<=4);
   if(isRoad)t=10;
   else if(nearBlock&&n>.35)t=n>.81?3:2;
   else if(n>.985)t=6;
  }else if(theme==='hatak'){
   if(n>.90)t=n>.975?2:1;
  }else if(theme==='sgc'){
   const serviceBay=(x%9>=2&&x%9<=5&&y%8>=1&&y%8<=5);
   if(serviceBay&&n>.3)t=n>.82?3:1;
   else if(n>.99)t=6;
  }else if(n>.94)t=n>.985?2:1;
  if(t){const index=y*worldWidth+x;cells[index]={t,hp:t===1?30:t===2?55:t===6?24:0};}
 }
 return {width:worldWidth,height:worldHeight,offsetX,offsetY,cells,gate};
}
function panCombatCamera(x,y){
 C.cameraX=clamp(x,0,Math.max(0,GW-VIEW_W));
 C.cameraY=clamp(y,0,Math.max(0,GH-VIEW_H));
}
function resizeCombatViewport(){
 const cv=document.getElementById('combat-cv'),wrap=cv?cv.parentElement:null;
 if(!cv)return;
 const width=Math.max(1,wrap&&wrap.clientWidth?wrap.clientWidth:window.innerWidth);
 const height=Math.max(1,wrap&&wrap.clientHeight?wrap.clientHeight:(window.innerHeight-100));
 if(cv.width!==width)cv.width=width;
 if(cv.height!==height)cv.height=height;
 VIEW_W=Math.max(1,Math.ceil(width/TILE));VIEW_H=Math.max(1,Math.ceil(height/TILE));
 panCombatCamera(C.cameraX,C.cameraY);
}
function drawCombatMinimap(){
 const cv=document.getElementById('combat-minimap');
 if(!cv||!C.active||!C.map.length)return;
 const c=cv.getContext('2d'),w=cv.width,h=cv.height,tw=w/GW,th=h/GH;
 c.clearRect(0,0,w,h);c.fillStyle='#101822';c.fillRect(0,0,w,h);
 const colors={0:'#536b3c',1:'#315831',2:'#193820',3:'#7c6951',4:'#236a91',5:'#4fc3f7',6:'#9b7350',7:'#276e92',8:'#b89661',9:'#c8b078',10:'#9a8457',11:'#4fc3f7',12:'#e8b040',13:'#7be1e8',14:'#a78bfa'};
 for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
  const type=C.map[idx(x,y)].t;
  c.fillStyle=colors[type]||'#536b3c';c.fillRect(x*tw,y*th,Math.ceil(tw),Math.ceil(th));
 }
 for(const u of Object.values(C.units)){
  if(u.dead||u.downed)continue;
  c.fillStyle=u.side==='player'?'#51cfff':u.side==='enemy'?'#f05c57':'#ffe493';
  c.fillRect(u.x*tw,u.y*th,Math.max(2,tw*1.5),Math.max(2,th*1.5));
 }
 c.strokeStyle='#effaff';c.lineWidth=2;
 c.strokeRect(C.cameraX*tw,C.cameraY*th,Math.min(VIEW_W,GW)*tw,Math.min(VIEW_H,GH)*th);
}
function panCombatToMinimap(e){
 if(!C.active)return;
 const cv=document.getElementById('combat-minimap'),rect=cv.getBoundingClientRect();
 const x=clamp((e.clientX-rect.left)/rect.width,0,1)*GW;
 const y=clamp((e.clientY-rect.top)/rect.height,0,1)*GH;
 panCombatCamera(Math.round(x-VIEW_W/2),Math.round(y-VIEW_H/2));
}

// ---------- FX & Haptik-System ----------
function triggerHapticFeedback(intensity=0.4,durationMs=120){
  if(typeof navigator==='undefined'||!navigator.getGamepads)return;
  if(typeof S!=='undefined'&&S&&S.controllerVibration===false)return;
  try{
    const gamepads=navigator.getGamepads();
    if(!gamepads)return;
    for(let i=0;i<gamepads.length;i++){
      const gp=gamepads[i];
      if(gp&&gp.vibrationActuator&&typeof gp.vibrationActuator.playEffect==='function'){
        gp.vibrationActuator.playEffect('dual-rumble',{
          startDelay:0,
          duration:Math.max(30,Math.min(1000,durationMs)),
          weakMagnitude:Math.max(0,Math.min(1.0,intensity*0.7)),
          strongMagnitude:Math.max(0,Math.min(1.0,intensity))
        }).catch(()=>{});
      }
    }
  }catch(e){}
}
if(typeof window!=='undefined')window.triggerHapticFeedback=triggerHapticFeedback;

function addFx(fx){fx.t0=performance.now();C.fx.push(fx);if(C.fx.length>80)C.fx.shift();}
function spawnDamage(x,y,val,color){
  addFx({type:'dmg',x,y,val,color:color||'#fff'});
  triggerHapticFeedback(Math.min(1.0,0.25+(val||10)*0.02),120);
  if(typeof ISO!=='undefined')ISO.beatPulse=Math.max(ISO.beatPulse||0,0.7);
}
function spawnFlash(x,y,color){addFx({type:'flash',x,y,color:color||'#fff'});}
function spawnMuzzle(x,y){addFx({type:'muzzle',x,y});}
function spawnTrace(x0,y0,x1,y1){addFx({type:'trace',x0,y0,x1,y1});}
function spawnDeath(x,y){addFx({type:'death',x,y});triggerHapticFeedback(0.7,240);}
function updateFx(){const now=performance.now();C.fx=C.fx.filter(f=>now-f.t0<700);C.shake=Math.max(0,C.shake*0.82-0.15);}

function centerCombatCameraOn(tx,ty){
  C.cameraX=Math.max(0,Math.min(GW-VIEW_W,Math.round(tx-VIEW_W/2)));
  C.cameraY=Math.max(0,Math.min(GH-VIEW_H,Math.round(ty-VIEW_H/2)));
}

function cycleSGMember(dir=1){
  if(!C.active||C.result)return;
  const playerUnits=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead);
  if(!playerUnits.length)return;
  let idx=playerUnits.indexOf(C.selected);
  if(idx===-1)idx=0;
  else idx=(idx+dir+playerUnits.length)%playerUnits.length;
  const next=playerUnits[idx];
  playerSelect(next);
  centerCombatCameraOn(next.x,next.y);
  sfx('select');
  if(typeof renderCombatUI==='function')renderCombatUI();
}
if(typeof window!=='undefined'){
  window.cycleSGMember=cycleSGMember;
  window.centerCombatCameraOn=centerCombatCameraOn;
}

function startCombat(mission,teamIds){
  C.active=true;C.mission=mission;C.teamIds=teamIds;
  C.theme=mission.theme||mission.map;C.tileCache={};
  C.round=1;C.phase='player';
  // Schwierigkeit + Progression: D = gewählte Stufe, chapterScale = wird mit
  // jedem Kapitel +5% schwerer (unabhängig von der Stufe). Feind-HP/Schaden/
  // Anzahl skalieren mit D * chapterScale; Spieler-Schaden mit D.
  // KEIN Gate-Timer mehr: Runden laufen, bis Sieg oder Rückkehr zum Gate.
  const D=diff(),chapterScale=1+S.chapter*0.05;
  C.result=null;C.log=[];C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];C.nextId=1;C.units={};C.hover=null;C.fx=[];C.shake=0;C.cameraX=0;C.cameraY=0;C.mapVersion++;C.contactComplete=false;C.buildType=null;
  C.tutorial=mission.tutorial?{step:0}:null;
  C.dialogueActive=false;C.sceneFlags={};
  C.firstHint=!mission.tutorial&&!mission.peaceful;
  C.firstJaffa=false;
  if(typeof SFX!=='undefined'&&SFX.syncContext){
    const isBoss=mission.enemies&&(mission.enemies.goauld||mission.enemies.queen);
    SFX.syncContext(mission.peaceful?'peaceful':isBoss?'boss':'combat');
  }
  // Erster Jaffa-Kontakt: einmaliger narrativer Beat – der erste Jaffa ist "etwas Besonderes".
  const hasJaffa=mission.enemies&&['jaffa','veteran','elite'].some(t=>mission.enemies[t]>0);
  if(hasJaffa&&!S.jaffaSeen){
    S.jaffaSeen=true;C.firstJaffa=true;
    clog('⚠ ERSTER KONTAKT: Jaffa!');
    clog('   „Krieger, die an einen Gott glauben. Respekt. Aber sie schießen trotzdem.“ – O\'Neill');
  }
  const tmpl=mission.map==='hatak'||mission.map==='asgard'?createShipMap(mission.map):
   mission.map==='village'?createVillageMap():MAPS[mission.map]||MAPS.desert;
  const world=expandBattleMap(tmpl,mission.map);
  GW=world.width;GH=world.height;C.map=world.cells;let gatePos=world.gate;
  if(!gatePos){gatePos={x:Math.floor(GW/2),y:Math.floor(GH/2)};C.map[idx(gatePos.x,gatePos.y)]={t:5};}
  C.gatePos=gatePos;
  panCombatCamera(gatePos.x-Math.floor(VIEW_W/2),gatePos.y-Math.floor(VIEW_H/2));
  // Ziel: defense = N Runden überleben, assault = alle Gegner besiegen.
  // Beides kann auch per EXTRAKTION (Rückkehr zum Gate) beendet werden.
  C.objective=mission.peaceful?{type:'contact'}:mission.type==='defense'?{type:'survive',rounds:10}:{type:'kill'};
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
    const arm=typeof ARMORS!=='undefined'&&m.armor&&ARMORS[m.armor];
    const effMove=Math.max(2,m.move-(arm?arm.movePenalty:0));
    C.units[uid]={id:uid,side:'player',name:m.name,cls:m.cls,
      x:pos.x,y:pos.y,
      hp:m.hp,maxHp:m.maxHp,move:effMove,ap:2,
      weapon:m.weapon,melee:m.melee,armor:m.armor||null,special:m.special||null,
      shieldTurns:0,smokeTurns:0,sg1:m.sg1,
      downed:false,dead:false,charId:m.id,specialUsed:false,facing:{x:0,y:1}};
  });
  if(mission.peaceful&&mission.contact){
    const contactPos={x:mission.contact.x+world.offsetX,y:mission.contact.y+world.offsetY};
    if(!isWalkable(contactPos.x,contactPos.y)||unitAt(contactPos.x,contactPos.y))throw new Error(`Invalid peaceful contact spawn for ${mission.id}.`);
    const uid=C.nextId++;
    C.units[uid]={id:uid,side:'neutral',type:'civilian',name:mission.contact.name,x:contactPos.x,y:contactPos.y,
      hp:1,maxHp:1,move:0,ap:0,downed:false,dead:false,facing:{x:0,y:1},contactId:mission.contact.id};
  }
  const eCount=mission.enemies,edges=getSpawnEdges(),scriptedSpawns=(mission.enemySpawns||[]).map(p=>({x:p.x+world.offsetX,y:p.y+world.offsetY}));
  let spawnIndex=0;
  for(const type in eCount){
    // Anzahl: Leicht ~70% (min. 1), Normal 100%, Hart ~125% – skaliert mit Kapitel.
    const n=Math.max(1,Math.round(eCount[type]*D.enemyCount*chapterScale));
    for(let i=0;i<n;i++){
      const E=ENEMIES[type],uid=C.nextId++;
      let pos=scriptedSpawns[spawnIndex++];
      if(!pos||!isWalkable(pos.x,pos.y)||unitAt(pos.x,pos.y))pos=edges.find(p=>!unitAt(p.x,p.y))||{x:gatePos.x,y:gatePos.y};
      const hp=Math.round(E.hp*D.enemyHp*chapterScale);
      C.units[uid]={id:uid,side:'enemy',type,name:E.name,
        x:pos.x,y:pos.y,hp:hp,maxHp:hp,move:E.move,ap:2,
        weapon:E.weapon,melee:E.melee,color:E.color,downed:false,dead:false,facing:{x:0,y:1}};
    }
  }
  Object.values(C.units).forEach(unit=>{
    const opposition=Object.values(C.units).filter(other=>other.side!==unit.side);
    const nearest=opposition.sort((a,b)=>C.distance(unit.x,unit.y,a.x,a.y)-C.distance(unit.x,unit.y,b.x,b.y))[0];
    if(nearest)unit.facing=facingToward(unit,nearest);
  });
  clog(`Mission: ${mission.name} · ${mission.goal}`);
  if(mission.peaceful){
    clog('🤝 Friedlicher Auftrag: Es gibt keine feindlichen Einheiten.');
    clog(`   Klicke ${mission.contact.name} an, um Kontakt aufzunehmen.`);
  } else if(mission.tutorial){
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
function isWalkable(x,y){if(!inB(x,y))return false;const t=C.map[idx(x,y)].t;return t===0||t===1||t===2||t===6||t===9||t===10;}
function blocksLOS(x,y){if(!inB(x,y))return true;const t=C.map[idx(x,y)].t;return t===3||t===4||t===5||t===8||t===13;}
function coverRating(unit){
 if(!unit||!inB(unit.x,unit.y))return 0;
 const t=C.map[idx(unit.x,unit.y)].t;
 return t===2?2:(t===1||t===6?1:0);
}
function coverTargets(unit){
 const targets=[],range=WEAPONS[unit.weapon].range;
 for(let y=Math.max(0,unit.y-range);y<=Math.min(GH-1,unit.y+range);y++)
  for(let x=Math.max(0,unit.x-range);x<=Math.min(GW-1,unit.x+range);x++){
   const tile=C.map[idx(x,y)];
   if((tile.t===1||tile.t===2||tile.t===6)&&C.distance(unit.x,unit.y,x,y)>0&&C.distance(unit.x,unit.y,x,y)<=range&&los(unit.x,unit.y,x,y))
    targets.push({x,y});
  }
 return targets;
}
function coverFacing(target,attacker){
 const facing=target.facing||{x:0,y:0},bearing=facingToward(target,attacker);
 return facing.x*bearing.x+facing.y*bearing.y;
}
function visibleCombatUnit(unit){
 const x=unit.x-C.cameraX,y=unit.y-C.cameraY;
 return x>=0&&y>=0&&x<VIEW_W&&y<VIEW_H;
}
function focusCombatUnit(unit){
 if(!visibleCombatUnit(unit))panCombatCamera(unit.x-Math.floor(VIEW_W/2),unit.y-Math.floor(VIEW_H/2));
}
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
function unitAt(x,y){return Object.values(C.units).find(u=>!u.dead&&!u.downed&&u.x===x&&u.y===y);}
function getSpawnEdges(){
  const candidates=[];
  for(let y=1;y<GH-1;y++)for(let x=1;x<GW-1;x++){
   const distance=C.distance(x,y,C.gatePos.x,C.gatePos.y);
   const visible=x>=C.cameraX+1&&x<C.cameraX+VIEW_W-1&&y>=C.cameraY+1&&y<C.cameraY+VIEW_H-1;
   if(visible&&distance>=5&&distance<=9&&isWalkable(x,y))candidates.push({x,y});
  }
  if(candidates.length)return candidates;
  const e=[];
  for(let x=0;x<GW;x++){if(isWalkable(x,0))e.push({x,y:0});if(isWalkable(x,GH-1))e.push({x,y:GH-1});}
  for(let y=0;y<GH;y++){if(isWalkable(0,y))e.push({x:0,y});if(isWalkable(GW-1,y))e.push({x:GW-1,y});}
  return e.length?e:[{x:C.gatePos.x,y:C.gatePos.y}];
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
      if(visited.has(ni)||!canWalkStep(cur.x,cur.y,nx,ny)||unitAt(nx,ny))continue;
      visited.set(ni,cur.cost+1);
      queue.push({x:nx,y:ny,cost:cur.cost+1});
    }
  }
  return range;
}
function canWalkStep(x,y,nx,ny){
 if(!isWalkable(nx,ny))return false;
 const dx=nx-x,dy=ny-y;
 return !dx||!dy||(isWalkable(x+dx,y)&&isWalkable(x,y+dy));
}
function attackTargets(unit){
  const targets=[],w=WEAPONS[unit.weapon];
  for(const u of Object.values(C.units)){
    if(u.side===unit.side||u.dead||u.downed)continue;
    const d=C.distance(unit.x,unit.y,u.x,u.y);
    if(d<=w.range&&los(unit.x,unit.y,u.x,u.y))targets.push(u);
  }
  return targets;
}
function doAttack(attacker,target){
  const w=WEAPONS[attacker.weapon]||WEAPONS.rifle;
  attacker.facing=facingToward(attacker,target);
  let hit=w.hit;
  if(attacker.x!==target.x&&attacker.y!==target.y)hit-=20;
  const cover=coverRating(target),coverAngle=coverFacing(target,attacker);
  if(cover&&coverAngle>=0.5)hit-=cover===2?40:20;
  else if(cover&&coverAngle<=-0.5)hit+=15;
  if(target.smokeTurns>0)hit-=25;
  if(w.ignoreCover)hit+=25;
  const attackerCover=coverRating(attacker);
  if(attackerCover)hit+=attackerCover===2?12:7;
  hit=clamp(hit,10,95);
  spawnTrace(attacker.x,attacker.y,target.x,target.y);
  spawnMuzzle(attacker.x,attacker.y);
  if(attacker.weapon==='shotgun')sfx('shotgun');
  else if(attacker.weapon==='zat')sfx('zat');
  else if(attacker.weapon==='staff'||attacker.weapon==='staffLong')sfx('staff');
  else sfx('shoot');
  if(Math.random()*100<hit){
    let dmg=rnd(w.min,w.max);
    if(attacker.name==="Teal'c"&&target.type&&target.type.startsWith('jaffa')&&C.distance(attacker.x,attacker.y,target.x,target.y)<=1&&attacker.melee==='chakram')dmg+=8;
    if(attacker.weapon==='zat'&&target.type&&['goauld','repl','drone','queen'].includes(target.type))dmg=Math.round(dmg*1.25);
    if(attacker.side==='player'){
      if(has('W2')&&target.type&&['goauld','repl','drone','queen'].includes(target.type))dmg=Math.round(dmg*1.2);
      if(has('W3'))dmg=Math.round(dmg*1.1);
      if(S.commander==='landry')dmg=Math.round(dmg*1.1);
      dmg=Math.round(dmg*diff().playerDmg); // Schwierigkeit: Spieler-Schaden
    }
    if(attacker.side==='enemy')dmg=Math.round(dmg*diff().enemyDmg); // Schwierigkeit: Gegner-Schaden
    const arm=target.armor&&typeof ARMORS!=='undefined'&&ARMORS[target.armor];
    if(arm)dmg=Math.max(1,Math.round(dmg*(1-arm.reduction)));
    if(target.shieldTurns>0)dmg=Math.max(1,Math.round(dmg*0.5));
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
function useSpecial(unit){
  if(!unit||unit.side!=='player'||unit.specialUsed||!unit.special||unit.ap<1)return false;
  unit.specialUsed=true;unit.ap--;C.firstHint=false;
  sfx('special');
  if(unit.special==='medkit'){
    unit.hp=Math.min(unit.maxHp,unit.hp+15);
    spawnFlash(unit.x,unit.y,'#4ade80');
    clog(`✚ ${unit.name} nutzt Medkit (+15 HP).`);
  }else if(unit.special==='shield'){
    unit.shieldTurns=2;
    spawnFlash(unit.x,unit.y,'#4fc3f7');
    clog(`🛡 ${unit.name} aktiviert Persönlichen Schild (2 Runden).`);
  }else if(unit.special==='smoke'){
    unit.smokeTurns=2;
    spawnFlash(unit.x,unit.y,'#94a3b8');
    clog(`💨 ${unit.name} wirft Rauchgranate (+25% Ausweichen).`);
  }else if(unit.special==='emp'){
    const enemies=Object.values(C.units).filter(e=>e.side==='enemy'&&!e.dead&&C.distance(unit.x,unit.y,e.x,e.y)<=5);
    enemies.sort((a,b)=>C.distance(unit.x,unit.y,a.x,a.y)-C.distance(unit.x,unit.y,b.x,b.y));
    if(enemies[0]){
      const t=enemies[0];
      t.ap=Math.max(0,(t.ap||2)-1);
      t.hp=Math.max(0,t.hp-8);
      spawnTrace(unit.x,unit.y,t.x,t.y);
      spawnDamage(t.x,t.y,8,'#4fc3f7');
      clog(`⚡ ${unit.name} EMP → ${t.name}: 8 Schaden & −1 AP.`);
      if(t.hp<=0)killUnit(t);
    }else{
      clog(`⚡ ${unit.name} zündet EMP-Impuls (kein Ziel in R.5).`);
    }
  }
  if(unit.ap>0){C.selected=unit;C.moveRange=moveRange(unit);C.atkRange=attackTargets(unit);C.coverRange=coverTargets(unit);}
  else{C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];nextUnit();}
  checkEnd();
  return {ok:true,msg:`${SPECIALS[unit.special]?SPECIALS[unit.special].name:'Spezial-Item'} eingesetzt!`};
}
function playerAttackTerrain(unit,x,y){
 if(unit.ap<1||!inB(x,y)||!coverTargets(unit).some(tile=>tile.x===x&&tile.y===y))return false;
 const tile=C.map[idx(x,y)],weapon=WEAPONS[unit.weapon];
 unit.facing=facingToward(unit,{x,y});unit.ap--;C.firstHint=false;
 spawnTrace(unit.x,unit.y,x,y);spawnMuzzle(unit.x,unit.y);sfx(weapon.name==='Shotgun'?'shotgun':'shoot');
 const hit=clamp(weapon.hit+(unit.x!==x&&unit.y!==y?-20:0),10,95);
 if(Math.random()*100<hit){
  const damage=rnd(weapon.min,weapon.max);
  tile.hp=Math.max(0,(tile.hp||24)-damage);
  spawnDamage(x,y,damage,'#ffd23a');spawnFlash(x,y,'#ffc857');sfx('hit');
  if(tile.hp===0){
   tile.t=0;C.mapVersion++;C.tileCache={};clog(`Deckung zerstört bei ${x+1}/${y+1}.`);
  }else clog(`Deckung getroffen (${tile.hp} Strukturpunkte verbleiben).`);
 }else{clog('Schuss auf Deckung verfehlt.');sfx('miss');}
 if(unit.ap>0){C.selected=unit;C.moveRange=moveRange(unit);C.atkRange=attackTargets(unit);C.coverRange=coverTargets(unit);}
 else{C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];nextUnit();}
 return true;
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
  C.selected=unit;focusCombatUnit(unit);C.moveRange=moveRange(unit);C.atkRange=tutorialAllowsAttack(unit)?attackTargets(unit):[];C.coverRange=tutorialAllowsAttack(unit)?coverTargets(unit):[];
}
function interactWithContact(contact){
 if(!C.mission.peaceful||C.contactComplete||C.dialogueActive)return;
 let unit=C.selected&&C.selected.side==='player'&&C.selected.ap>0?C.selected:null;
 if(!unit){
  unit=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead&&!u.downed&&u.ap>0)
   .sort((a,b)=>C.distance(a.x,a.y,contact.x,contact.y)-C.distance(b.x,b.y,contact.x,contact.y))[0];
 }
 if(!unit){clog('⚠ Niemand kann den Kontakt aufnehmen.');return;}
 if(C.distance(unit.x,unit.y,contact.x,contact.y)<=1){playCombatScene('contact');return;}
 const reachable=moveRange(unit).sort((a,b)=>C.distance(a.x,a.y,contact.x,contact.y)-C.distance(b.x,b.y,contact.x,contact.y));
 const next=reachable.find(p=>C.distance(p.x,p.y,contact.x,contact.y)<=1)||reachable[0];
 if(!next){clog(`${unit.name} findet keinen sicheren Weg zu ${contact.name}.`);return;}
 playerMove(unit,next.x,next.y);
 if(C.distance(unit.x,unit.y,contact.x,contact.y)<=1)playCombatScene('contact');
}
function tutorialAllowsAttack(unit){return !C.tutorial||unit.charId!==0||C.tutorial.step>=2;}
function playerMove(unit,x,y){
  const d=C.distance(unit.x,unit.y,x,y);
  if(d>unit.move||!isWalkable(x,y)||unitAt(x,y))return;
  if(C.tutorial&&C.tutorial.step<=1&&unit.charId===0)C.tutorial.step=2;
  unit.facing=facingToward(unit,{x,y});
  unit._animFrom={x:unit.x,y:unit.y};unit._animT0=performance.now();
  unit.x=x;unit.y=y;unit.ap--;C.firstHint=false;
  if(unit.ap>0){C.selected=unit;C.moveRange=moveRange(unit);C.atkRange=attackTargets(unit);C.coverRange=coverTargets(unit);}
  else{C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];nextUnit();}
}
function playerAttack(unit,target){
  if(unit.ap<1)return;
  if(C.tutorial&&C.tutorial.step===2&&unit.charId===0)C.tutorial.step=3;
  unit.ap--;C.firstHint=false;
  doAttack(unit,target);
  if(unit.ap>0){C.selected=unit;C.moveRange=moveRange(unit);C.atkRange=attackTargets(unit);C.coverRange=coverTargets(unit);}
  else{C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];}
  checkEnd();
  if(!C.result&&unit.ap<=0)nextUnit();
}
function playerWait(unit){
  if(C.tutorial&&C.tutorial.step===3)C.tutorial.step=4;
  unit.ap=0;C.firstHint=false;C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];
  nextUnit();
}
function nextUnit(){
  if(C.result)return;
  const units=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead&&!u.downed&&u.ap>0);
  if(units.length===0){endPlayerPhase();return;}
  C.selected=units[0];focusCombatUnit(C.selected);C.moveRange=moveRange(C.selected);C.atkRange=tutorialAllowsAttack(C.selected)?attackTargets(C.selected):[];C.coverRange=tutorialAllowsAttack(C.selected)?coverTargets(C.selected):[];
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
    const d=C.distance(u.x,u.y,target.x,target.y);
    const w=WEAPONS[u.weapon];
    const inRange=d<=w.range&&los(u.x,u.y,target.x,target.y);
    if(inRange){u.facing=facingToward(u,target);doAttack(u,target);ap--;}
    else if(d<=1&&u.melee){u.facing=facingToward(u,target);doMelee(u,target);ap--;}
    else{
      const step=bestStep(u,target);
      if(step){u.facing=facingToward(u,step);u._animFrom={x:u.x,y:u.y};u._animT0=performance.now();u.x=step.x;u.y=step.y;ap--;}
      else break;
    }
  }
}
function nearestPlayer(u){
  let best=null,bd=999;
  for(const p of Object.values(C.units)){
    if(p.side!=='player'||p.dead||p.downed)continue;
    const d=C.distance(u.x,u.y,p.x,p.y);
    if(d<bd){bd=d;best=p;}
  }
  return best;
}
function bestStep(u,target){
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let best=null,bd=C.distance(u.x,u.y,target.x,target.y);
  for(const[dx,dy]of dirs){
    const nx=u.x+dx,ny=u.y+dy;
    if(!canWalkStep(u.x,u.y,nx,ny)||unitAt(nx,ny))continue;
    const nd=C.distance(nx,ny,target.x,target.y);
    if(nd<bd){
      const t=C.map[idx(nx,ny)].t;
      const cover=t===2?0.35:(t===1||t===6?0.18:0);
      const score=nd-cover;
      if(!best||score<best.score)best={x:nx,y:ny,score};
    }
  }
  return best||pathStep(u,target);
}
function pathStep(unit,target){
 const queue=[{x:unit.x,y:unit.y,first:null}],visited=new Set([idx(unit.x,unit.y)]);
 const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 for(let head=0;head<queue.length;head++){
  const current=queue[head];
  for(const[dx,dy]of dirs){
   const x=current.x+dx,y=current.y+dy,key=idx(x,y);
   if(visited.has(key)||!canWalkStep(current.x,current.y,x,y)||unitAt(x,y))continue;
   const first=current.first||{x,y};
   if(C.distance(x,y,target.x,target.y)<=1)return first;
   visited.add(key);queue.push({x,y,first});
  }
 }
 return null;
}
function endRound(){
  if(C.result)return;
  if(typeof tickOffworldStructures==='function')tickOffworldStructures();
  checkEnd();
  if(C.result)return;
  C.round++;
  Object.values(C.units).forEach(u=>{
    if(!u.dead&&!u.downed){
      u.ap=2;
      if(u.shieldTurns>0)u.shieldTurns--;
      if(u.smokeTurns>0)u.smokeTurns--;
    }
  });
  checkEnd();
  if(!C.result){C.phase='player';nextUnit();}
}
function checkEnd(){
  if(C.result)return;
  const enemies=Object.values(C.units).filter(u=>u.side==='enemy'&&!u.dead);
  const players=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead);
  if(players.length===0||players.every(p=>p.downed)){C.result='defeat';sfx('defeat');clog('💀 Team ausgelöscht.');return;}
  if(C.mission&&C.mission.peaceful){
    if(C.contactComplete){C.result='victory';sfx('victory');clog('🤝 Friedlicher Erstkontakt hergestellt.');}
    return;
  }
  if(enemies.length===0){C.result='victory';sfx('victory');clog('✔ Alle Gegner besiegt!');return;}
  if(C.objective.type==='survive'&&C.round>C.objective.rounds){C.result='victory';sfx('victory');clog('✔ Halte-Mission erfolgreich!');return;}
}
// One-Way-Gate: Extraktion = das Gate NEU WÄHLEN, um zurück zu kommen.
// Funktioniert nur, wenn das ganze (überlebende) Team in Gate-Nähe steht.
function gateReady(){
  const players=Object.values(C.units).filter(u=>u.side==='player'&&!u.dead);
  return {at:players.filter(p=>C.distance(p.x,p.y,C.gatePos.x,C.gatePos.y)<=2).length,total:players.length};
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
  const logNote=(typeof gameNote==='function'?gameNote:(typeof note==='function'?note:(t)=>{}));
  // Backfill für alte Saves (v4 ohne jaffaSeen/jaffaKills)
  if(S.jaffaSeen===undefined)S.jaffaSeen=false;
  if(S.jaffaKills===undefined)S.jaffaKills=0;
  if(!S.inventory&&typeof defaultInventory==='function')S.inventory=defaultInventory();
  const m=C.mission,result=C.result;
  const teamUnits=Object.values(C.units).filter(u=>u.side==='player');
  teamUnits.forEach(u=>{
    const m=S.roster[u.charId];if(!m)return;
    if(u.dead||u.downed){
      if(m.sg1){logNote(`⚠ ${m.name} down. Duplikat-Klausel greift.`);m.hp=Math.max(10,m.hp-30);m.injuries+=2;}
      else if(u.dead){m.dead=true;S.memorial.push(m.name);logNote(`💀 ${m.name} ist gefallen. Gedenktafel angebracht.`);
        S.roster.forEach(x=>{if(x.recruited&&!x.dead)x.morale=Math.max(0,x.morale-10);});}
      else{m.hp=Math.max(15,Math.round(m.maxHp*0.35));m.injuries=(m.injuries||0)+1;logNote(`🩹 ${m.name} schwer verwundet (MedBay empfohlen).`);}
    } else {m.hp=u.hp;m.fatigue=Math.min(100,m.fatigue+20);m.morale=Math.max(0,m.morale-5);}
  });
  failQuests();
  // Extraktion schließt normale Missionen ab; der Pilotauftrag braucht den Sieg, damit Teal’c mitkommt.
  if(result==='victory'||result==='extracted'){
    if(m.tutorial&&result!=='victory'){
      logNote('⚠ Teal’c bleibt auf Chulak. SG-1 muss den Einsatz erfolgreich abschließen.');
    } else {
      const full=result==='victory';
      let lootPct=full?1:(0.5+(has('G1')?0.1:0));
      if(m.peaceful&&S.commander==='weir')lootPct*=1.15;
      S.done.push(m.id);
      advanceQuests(m.id);
      for(const k in m.reward)S.res[k]=(S.res[k]||0)+Math.round(m.reward[k]*lootPct);
      logNote(full?`✔ ${m.name}: ${m.text}`:`🌀 ${m.name}: Extraktion (${Math.round(lootPct*100)}% Beute).`);
      teamUnits.forEach(u=>{const m=S.roster[u.charId];if(m&&!m.dead)m.xp+=Math.round((20+S.chapter*5)*(full?1:0.5));});
      // Beute-Drops fürs Inventar (INVENTAR-SPEC.md §9)
      const defeated=Object.values(C.units).filter(u=>u.side==='enemy'&&u.dead).length;
      if(defeated>0&&S.inventory){
        const dropRoll=Math.random();
        if(dropRoll<0.45){
          S.inventory.special.medkit=(S.inventory.special.medkit||0)+1;
          logNote('🎁 Beute-Fund: +1 Medkit (Inventar)');
        }else if(dropRoll<0.75){
          const aKey=defeated>=4?'medium':'light';
          S.inventory.armor[aKey]=(S.inventory.armor[aKey]||0)+1;
          logNote(`🎁 Beute-Fund: +1 ${ARMORS[aKey].name} (Inventar)`);
        }else{
          const wKey=S.chapter>=1?'zat':'rifle';
          S.inventory.weapons[wKey]=(S.inventory.weapons[wKey]||0)+1;
          logNote(`🎁 Beute-Fund: +1 ${WEAPONS[wKey].name} (Inventar)`);
        }
      }
      if(m.recruit!==undefined&&!S.roster[m.recruit].recruited){
        S.roster[m.recruit].recruited=true;
        logNote(m.recruit===3&&m.id==='1-1'?'🤝 Teal’c widersetzt sich Apophis und schließt sich SG-1 an.':`＋ Neuer Rekrut: ${S.roster[m.recruit].name}`);
      }
    }
  }
  else if(result==='defeat'){S.integrity=Math.max(0,S.integrity-10);logNote(`💀 Niederlage bei ${m.name}.`);}
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
function drawUnitLabel(c,name,x,y,color){
  const label=name.split(' ')[0].slice(0,5);
  c.font='bold 7px monospace';c.textAlign='center';
  const width=Math.min(TILE-4,c.measureText(label).width+4);
  c.fillStyle='rgba(5,10,16,0.9)';c.fillRect(x-width/2,y-8,width,10);
  c.fillStyle=color;c.fillText(label,x,y,width-3);
}
function drawCivilian(c,x,y){
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y,8,3,0,0,7);c.fill();
 c.fillStyle='#6e8d62';c.fillRect(x-5,y-22,10,13);c.fillStyle='#9bb48a';c.fillRect(x-5,y-22,10,2);
 c.fillStyle='#59463a';c.fillRect(x-4,y-9,3,9);c.fillRect(x+1,y-9,3,9);
 c.fillStyle='#d8b18d';c.beginPath();c.arc(x,y-26,5,0,7);c.fill();
 c.fillStyle='#463b35';c.fillRect(x-5,y-30,10,3);
}

// ---------- Rendering ----------
function renderCombat(cv){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height;
  const gfxMode=typeof getGfxMode==='function'?getGfxMode():'pixel';
  if(gfxMode==='ascii'&&typeof renderCombatIsoAscii==='function'){
    renderCombatIsoAscii(cv);
  }else if(gfxMode==='pixel'&&typeof renderCombatIsoPixel==='function'){
    renderCombatIsoPixel(cv);
  }else{
  c.clearRect(0,0,W,H);
  updateFx();
  c.save();
  if(C.shake>0.3)c.translate((Math.random()-0.5)*C.shake,(Math.random()-0.5)*C.shake);
  c.translate(-C.cameraX*TILE,-C.cameraY*TILE);
  const startX=C.cameraX,startY=C.cameraY,endX=Math.min(GW,startX+Math.ceil(W/TILE)),endY=Math.min(GH,startY+Math.ceil(H/TILE));
  const backdrop=c.createLinearGradient(0,0,0,H);
  if(C.theme==='hatak'){backdrop.addColorStop(0,'#141b26');backdrop.addColorStop(1,'#060b12');}
  else if(C.theme==='asgard'){backdrop.addColorStop(0,'#8ba2a6');backdrop.addColorStop(1,'#37444d');}
  else if(C.theme==='jungle'){backdrop.addColorStop(0,'#29482d');backdrop.addColorStop(1,'#0d1d17');}
  else if(C.theme==='city'){backdrop.addColorStop(0,'#616168');backdrop.addColorStop(1,'#24252d');}
  else{backdrop.addColorStop(0,'#a98d60');backdrop.addColorStop(1,'#493d31');}
  c.fillStyle=backdrop;c.fillRect(startX*TILE,startY*TILE,(endX-startX)*TILE,(endY-startY)*TILE);
  // Cache only visible world tiles; world-space details remain stable while panning.
  for(let y=startY;y<endY;y++)for(let x=startX;x<endX;x++){
    const t=C.map[idx(x,y)].t,px=x*TILE,py=y*TILE;
    const key=C.mapVersion+'_'+C.theme+'_'+t+'_'+x+'_'+y;
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
  C.coverRange.forEach(tile=>{c.strokeStyle='rgba(255,205,86,.9)';c.lineWidth=2;c.strokeRect(tile.x*TILE+5,tile.y*TILE+5,TILE-10,TILE-10);
    c.fillStyle='#ffd166';c.fillRect(tile.x*TILE+TILE/2-2,tile.y*TILE+TILE/2-2,4,4);});
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
        c.fillStyle='#1a1a1a';c.fillRect(px+4,py+3,TILE-8,3);
        c.fillStyle=u.hp>u.maxHp*0.3?'#4ade80':'#ef4444';
        c.fillRect(px+4,py+3,(TILE-8)*u.hp/u.maxHp,3);
        drawUnitLabel(c,u.name,cx,py+TILE-2,'#d6e0ec');
        if(u.downed){c.fillStyle='rgba(239,68,68,0.4)';c.fillRect(px,py,TILE,TILE);
          c.fillStyle='#fff';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText('✚',cx,py+TILE/2+5);}
      }
      if(C.selected===u){
        c.strokeStyle='#4fc3f7';c.lineWidth=3;c.strokeRect(px+1,py+1,TILE-2,TILE-2);
        c.strokeStyle='rgba(79,195,247,0.4)';c.lineWidth=1;c.strokeRect(px-1,py-1,TILE+2,TILE+2);
      }
    } else if(u.side==='neutral'){
      drawCivilian(c,cx,cy);
      c.strokeStyle='#ffe493';c.lineWidth=2;c.strokeRect(px+2,py+2,TILE-4,TILE-4);
      drawUnitLabel(c,u.name,cx,py+TILE-2,'#ffe493');
      c.fillStyle='#ffe493';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('…',cx,py-3);
    } else {
      const alpha=u.downed?0.4:1;
      drawEnemyBody(c,cx,cy,0.75,u.type,alpha);
      c.fillStyle='#1a1a1a';c.fillRect(px+4,py+3,TILE-8,3);
      c.fillStyle='#ef4444';c.fillRect(px+4,py+3,(TILE-8)*u.hp/u.maxHp,3);
      drawUnitLabel(c,u.name,cx,py+TILE-2,'#f87171');
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
    if(inB(hx,hy)&&visibleCombatUnit({x:hx,y:hy})){
      const hu=unitAt(hx,hy);
      if(hu){
        const sx=(hx-C.cameraX)*TILE,sy=(hy-C.cameraY)*TILE;
        const bx=Math.min(sx+TILE+4,W-150),by=Math.max(40,sy-10);
        c.fillStyle='rgba(6,10,16,0.92)';c.fillRect(bx,by,140,52);
        c.strokeStyle='#4fc3f7';c.lineWidth=1;c.strokeRect(bx,by,140,52);
        c.fillStyle=hu.side==='player'?'#4ade80':hu.side==='neutral'?'#ffe493':'#f87171';c.font='bold 11px monospace';c.textAlign='left';
        c.fillText(hu.name,bx+6,by+15);
        c.fillStyle='#d6e0ec';c.font='10px monospace';
        c.fillText(`HP ${hu.hp}/${hu.maxHp} · Bew ${hu.move}`,bx+6,by+29);
        const w=WEAPONS[hu.weapon];
        if(w)c.fillText(`${w.name} ${w.min}–${w.max} (R.${w.range})`,bx+6,by+43);
      }else{
        const tile=C.map[idx(hx,hy)],coverName=tile.t===2?'SCHWERE DECKUNG':tile.t===1?'LEICHTE DECKUNG':tile.t===6?'TRÜMMER':null;
        if(coverName){
          const sx=(hx-C.cameraX)*TILE,sy=(hy-C.cameraY)*TILE,bx=Math.min(sx+TILE+4,W-170),by=Math.max(40,sy-10);
          c.fillStyle='rgba(6,10,16,0.92)';c.fillRect(bx,by,160,36);
          c.strokeStyle='#ffd166';c.lineWidth=1;c.strokeRect(bx,by,160,36);
          c.fillStyle='#ffd166';c.font='bold 10px monospace';c.textAlign='left';c.fillText(coverName,bx+6,by+14);
          c.fillStyle='#d6e0ec';c.font='9px monospace';c.fillText(`${tile.hp||0} STRUKTUR · SCHIESSBAR`,bx+6,by+28);
        }
      }
    }
    c.fillStyle='rgba(4,10,17,.82)';c.fillRect(8,H-27,440,20);
    c.strokeStyle='rgba(122,157,179,.45)';c.strokeRect(8,H-27,440,20);
    c.fillStyle='#b9d0de';c.font='10px monospace';c.textAlign='left';
    c.fillText(`MAP ${C.cameraX+1}-${Math.min(GW,C.cameraX+VIEW_W)}/${GW} × ${C.cameraY+1}-${Math.min(GH,C.cameraY+VIEW_H)}/${GH} · WASD / ARROWS`,15,H-13);
  }
  } // end 2D topdown fallback
  // HUD (oben)
  c.fillStyle='rgba(6,10,16,0.9)';c.fillRect(0,0,W,32);
  c.strokeStyle='#243248';c.lineWidth=1;c.strokeRect(0,0,W,32);
  c.fillStyle='#e8b040';c.font='bold 13px monospace';c.textAlign='left';
  const phase=C.phase==='player'?'▶ SPIELER':'⚔ GEGNER';
  const goal=C.objective.type==='survive'?`Halte ${C.objective.rounds} Runden`:
   C.objective.type==='contact'?`Kontakt ${C.contactComplete?'hergestellt':'herstellen'}`:'Alle Gegner besiegen';
  c.fillText(`Runde ${C.round}  ·  ${phase}  ·  🎯 ${goal}`,10,21);
  const g=gateReady();
  c.fillStyle=(g.at===g.total&&g.total>0)?'#4ade80':'#8a9ab0';c.font='bold 12px monospace';c.textAlign='right';
  c.fillText(C.mission.peaceful?`🤝 Kontakt: ${C.contactComplete?'hergestellt':'offen'}`:`🌀 Gate: ${g.at}/${g.total} bereit`,W-12,21);
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
    const peacefulContact=C.mission&&C.mission.peaceful&&C.result==='victory';
    const rt=peacefulContact?'🤝 ERSTKONTAKT HERGESTELLT':tealcJoins?'TEAL’C WECHSELT DIE SEITEN':
      ({victory:'✔ SIEG',defeat:'💀 NIEDERLAGE',extracted:'🌀 EXTRAKTION'}[C.result]||C.result);
    c.fillText(rt,W/2,tealcJoins?H/2-40:H/2);
    if(tealcJoins&&S.roster[3])drawSoldier(c,W/2,H/2+105,1.25,S.roster[3],0,1);
    c.fillStyle='#d6e0ec';c.font='14px monospace';
    c.fillText(peacefulContact?'Ein neues Volk hat sich für den Austausch geöffnet.':tealcJoins?'Ein neuer Verbündeter für SG-1.':'Klicke auf "Weiter" unten.',W/2,tealcJoins?H/2+145:H/2+30);
  }
  drawCombatMinimap();
}
