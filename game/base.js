'use strict';
// ===================== SGC COMMAND v2 – Base (Cheyenne Mountain) =====================
// Cutaway des Cheyenne Mountain:
//   OBEN    = Oberfläche (Himmel, Parkplatz, Eingangsbau)
//   MITTE   = Raum-Grid (8 Spalten × 10 Etagen), Fahrstuhl-Schacht rechts
//   UNTEN   = Gateraum (Grid-Zeile 0 wird unten gerendert)
// Das Grid ist vertikal gespiegelt: Grid-Zeile 0 (Gate) steht am unteren Rand.
const B={buildMode:false,buildType:null,selRoom:null};
const BW=640,BH=840;
const SURF=78;
const GRID_X=24,GRID_Y=SURF+6,GRID_W=544,GRID_H=BH-SURF-26;
const COLS=8,ROWS=10;
const CW=GRID_W/COLS,CH=GRID_H/ROWS;
const ELEV_X=GRID_X+GRID_W+8,ELEV_W=40;
// Grid-Zelle (x,y) → Bildschirm-Position (y gespiegelt: Zeile 0 unten)
function cellPx(x,y){return {x:GRID_X+x*CW,y:GRID_Y+(ROWS-1-y)*CH};}
function isOrigin(x,y,roomId){
  if(roomId===null)return false;
  const up=y>0?S.base.grid[(y-1)*COLS+x]:null;
  const left=x>0?S.base.grid[y*COLS+(x-1)]:null;
  return up!==roomId&&left!==roomId;
}

function renderBase(cv){
  const c=cv.getContext('2d');
  if(cv.width!==BW)cv.width=BW;if(cv.height!==BH)cv.height=BH;
  const now=performance.now();
  // Fels
  let g=c.createLinearGradient(0,0,0,BH);
  g.addColorStop(0,'#2a2622');g.addColorStop(.5,'#1c1a18');g.addColorStop(1,'#141210');
  c.fillStyle=g;c.fillRect(0,0,BW,BH);
  c.fillStyle='rgba(0,0,0,0.15)';
  for(let i=0;i<40;i++){const x=(i*97)%BW,y=(i*211+90)%BH;c.beginPath();c.ellipse(x,y,8+(i%5)*3,5+(i%3)*2,0,0,7);c.fill();}
  // ===== Oberfläche =====
  let sky=c.createLinearGradient(0,0,0,26);sky.addColorStop(0,'#0a1420');sky.addColorStop(1,'#1a2a3a');
  c.fillStyle=sky;c.fillRect(0,0,BW,26);
  c.fillStyle='rgba(255,255,255,0.5)';for(let i=0;i<20;i++)c.fillRect((i*53)%BW,(i*17)%24,1,1);
  c.fillStyle='#2a2a2e';c.fillRect(0,26,BW,SURF-26);
  c.strokeStyle='rgba(255,255,255,0.2)';c.lineWidth=1;
  for(let i=0;i<6;i++){const x=20+i*44;c.strokeRect(x,34,40,26);}
  const carCols=['#8a3030','#30608a','#8a8030','#408040'];
  for(let i=0;i<4;i++){const x=22+i*44;c.fillStyle=carCols[i];c.fillRect(x+2,38,36,18);
    c.fillStyle='rgba(180,220,255,0.5)';c.fillRect(x+6,40,10,8);c.fillRect(x+22,40,10,8);
    c.fillStyle='#111';c.fillRect(x+5,54,6,4);c.fillRect(x+29,54,6,4);}
  c.fillStyle='#8a9ab0';c.font='9px monospace';c.textAlign='left';c.fillText('PARKPLATZ',20,31);
  // Eingangsbau
  c.fillStyle='#3a4048';c.fillRect(300,20,240,34);
  c.fillStyle='#2a3038';c.fillRect(300,20,240,6);
  c.fillStyle='#4fc3f7';c.font='bold 11px monospace';c.textAlign='center';c.fillText('◎ SGC – CHEYENNE MOUNTAIN',420,42);
  c.fillStyle='#666';c.fillRect(548,8,2,28);c.fillStyle='#c03030';c.fillRect(550,8,14,9);
  // ===== Fahrstuhl-Schacht (rechts, von Oberfläche nach unten) =====
  c.fillStyle='#0a0c10';c.fillRect(ELEV_X,SURF,ELEV_W,BH-SURF-16);
  c.strokeStyle='#2a3040';c.lineWidth=2;c.strokeRect(ELEV_X,SURF,ELEV_W,BH-SURF-16);
  const epos=SURF+20+Math.abs(Math.sin(now/1500))*(BH-SURF-90);
  c.fillStyle='#3a4048';c.fillRect(ELEV_X+4,epos,ELEV_W-8,28);
  c.fillStyle='#4fc3f7';c.fillRect(ELEV_X+4,epos,ELEV_W-8,3);
  c.fillStyle='#8a9ab0';c.font='8px monospace';c.save();c.translate(ELEV_X+ELEV_W/2,epos+14);c.rotate(-Math.PI/2);c.textAlign='center';c.fillText('FAHRSTUHL',0,0);c.restore();
  // ===== Grid (gespiegelt: Zeile 0 = unten = Gate-Ebene) =====
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const roomId=S.base.grid[y*COLS+x];
    const {x:px,y:py}=cellPx(x,y);
    if(roomId){
      const r=S.base.rooms[roomId],R=ROOMS[r.type];
      const colors={gate:'#12304a',generator:'#3a3a1a',lab:'#1a3a3a',workshop:'#3a2a1a',barracks:'#2a2a3a',medbay:'#3a1a1a',training:'#2a3a1a',armory:'#3a1a2a',water:'#1a2a3a',storage:'#2a2a2a',canteen:'#3a3a2a'};
      c.fillStyle=colors[r.type]||'#2a2a2a';c.fillRect(px+1,py+1,CW-2,CH-2);
      c.strokeStyle=B.selRoom===roomId?'#4fc3f7':'#4a5a6a';c.lineWidth=B.selRoom===roomId?3:1;c.strokeRect(px+1,py+1,CW-2,CH-2);
      if(isOrigin(x,y,roomId)){
        if(r.type==='gate'){
          const gx=px+CW/2,gy=py+CH/2;
          c.fillStyle='#0a2a4a';c.beginPath();c.arc(gx,gy,15,0,7);c.fill();
          c.strokeStyle='#4fc3f7';c.lineWidth=3;c.beginPath();c.arc(gx,gy,15,0,7);c.stroke();
          c.strokeStyle='rgba(79,195,247,0.4)';c.lineWidth=1;c.beginPath();c.arc(gx,gy,10,0,7);c.stroke();
          for(let i=0;i<9;i++){const a=-Math.PI/2+i/9*6.28;c.fillStyle='#ff8a1f';c.save();c.translate(gx,gy);c.rotate(a);c.fillRect(-2,-19,4,5);c.restore();}
          c.fillStyle='#d6e0ec';c.font='8px monospace';c.textAlign='center';c.fillText('GATE ROOM',px+CW/2,py+CH-6);
        } else if(typeof drawRoomIcon==='function'){
          drawRoomIcon(c,r.type,px+CW/2-16,py+CH/2-16,1);
          c.font='8px monospace';c.fillStyle='#8a9ab0';c.textAlign='center';c.fillText(R.name,px+CW/2,py+CH-6);
        } else {
          c.fillStyle='#d6e0ec';c.font='20px sans-serif';c.textAlign='center';c.fillText(R.icon,px+CW/2,py+CH/2+2);
          c.font='8px monospace';c.fillStyle='#8a9ab0';c.fillText(R.name,px+CW/2,py+CH-6);
        }
      }
      c.font='9px monospace';c.textAlign='right';c.fillStyle=powerOk()?(R.power>0?'#4ade80':'#8a9ab0'):'#ef4444';
      c.fillText((R.power>0?'+':'')+R.power+'P',px+CW-4,py+12);
      r.staff.forEach((sid,si)=>{c.fillStyle='#4fc3f7';c.beginPath();c.arc(px+10+si*11,py+12,4,0,7);c.fill();});
    } else {
      c.fillStyle='#1a1e24';c.fillRect(px+1,py+1,CW-2,CH-2);
      c.strokeStyle='#242a32';c.lineWidth=1;c.strokeRect(px+1,py+1,CW-2,CH-2);
      if(B.buildMode){
        const can=canBuildAt(B.buildType,x,y);
        c.fillStyle=can?'rgba(74,222,128,0.25)':'rgba(239,68,68,0.2)';c.fillRect(px+1,py+1,CW-2,CH-2);
      }
    }
  }
  // Etagen-Labels (rechts neben Grid, E1 unten = Gate-Ebene)
  c.fillStyle='#6b7a90';c.font='9px monospace';c.textAlign='right';
  for(let y=0;y<ROWS;y++){const {y:py}=cellPx(0,y);c.fillText('E'+(y+1),GRID_X-4,py+CH/2+3);}
  c.fillStyle='#4fc3f7';c.font='bold 10px monospace';c.textAlign='center';
  c.fillText('▼ GATERAUM ▼',GRID_X+GRID_W/2,BH-6);
}

function canBuildAt(type,x,y){
  const R=ROOMS[type];if(!R)return false;
  if(x<0||y<0||x+R.w>COLS||y+R.h>ROWS)return false;
  for(let dy=0;dy<R.h;dy++)for(let dx=0;dx<R.w;dx++){
    if(S.base.grid[(y+dy)*COLS+(x+dx)]!==null)return false;
  }
  for(const k in R.cost)if(S.res[k]<R.cost[k])return false;
  return true;
}

function baseClick(clientX,clientY){
  const cv=document.getElementById('base-cv');if(!cv)return;
  const r=cv.getBoundingClientRect(),sx=cv.width/r.width,sy=cv.height/r.height;
  const mx=(clientX-r.left)*sx,my=(clientY-r.top)*sy;
  const gx=Math.floor((mx-GRID_X)/CW);
  const gy=Math.floor((my-GRID_Y)/CH);
  if(gx<0||gy<0||gx>=COLS||gy>=ROWS)return;
  const y=ROWS-1-gy; // Spiegelung rückgängig
  const x=gx;
  if(B.buildMode){
    const res=buildRoom(B.buildType,x,y);
    if(res.ok&&typeof SFX!=='undefined')SFX.build();
    B.buildMode=false;B.buildType=null;
    act(res);
    return;
  }
  const roomId=S.base.grid[y*COLS+x];
  B.selRoom=roomId||null;
  renderAll();
}
