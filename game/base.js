'use strict';
// ===================== SGC Command – 28-level mountain cutaway =====================
// Level numbers follow the rdanderson.com fan reconstruction: Level 1 is nearest
// the outside world; Level 28 contains the Gateroom and control room.
const B={buildMode:false,buildType:null,selRoom:null,elevatorEpoch:null};
const BW=720,ROWS=BASE_LEVELS,COLS=BASE_COLS,CH=36;
const GRID_X=92,GRID_Y=96,GRID_W=520,GRID_H=ROWS*CH,BH=GRID_Y+GRID_H+30;
const CW=GRID_W/COLS,ELEV_X=620,ELEV_W=42,SURF=84;
const BASE_LEVEL_INFO={
 1:['SHIPPING / RECEIVING','red'],2:['VEHICLE MAINT.','red'],3:['MESS / COMMISSARY','red'],
 4:['SUPPLY STORAGE','red'],5:['LOADING DOCK','red'],6:['SECURITY ACCESS','red'],
 7:['FACILITY OFFICES','yellow'],8:['FACILITY OFFICES','yellow'],
 9:['FACILITY MAINT.','yellow'],10:['EARTH COMMS','amber'],
 11:['PERSONNEL RECORDS','amber'],12:['FACILITY OFFICES','amber'],
 13:['FACILITY OFFICES','pale green'],14:['FACILITY OFFICES','pale green'],
 15:['FACILITY OFFICES','pale green'],16:['SECURITY / BRIG','white'],
 17:['DIPLOMACY / STORAGE','pale blue'],18:['JACKSON / JONAS LABS','pale blue'],
 19:['CARTER RESEARCH LABS','turquoise'],20:['MRI / OBSERVATION','blue'],
 21:['MEDICAL / INFIRMARY','medium blue'],22:['MEDICAL / QUARTERS','light blue'],
 23:['STORAGE','green'],24:['MALP STORAGE','green'],
 25:['QUARTERS / GYM','green'],26:['OFF-WORLD COMMS','white'],
 27:['SGC / BRIEFING','white'],28:['CONTROL / GATER.','white']
};
const TUNNEL_COLORS={red:'#9b4545',yellow:'#c8ad54',amber:'#c28b43','pale green':'#8da96f',white:'#d6e0e9','pale blue':'#94b9d1',turquoise:'#49c4c2',blue:'#517ba4','medium blue':'#608ab2','light blue':'#83adc9',green:'#6c9974'};
function isOrigin(x,y,roomId){
 if(roomId===null)return false;
 const up=y>0?S.base.grid[(y-1)*COLS+x]:null,left=x>0?S.base.grid[y*COLS+x-1]:null;
 return up!==roomId&&left!==roomId;
}
function floorY(level){return GRID_Y+(level-1)*CH+CH/2;}

const ELEVATOR_PERIOD=18000;
function baseElevatorScene(now){
 if(B.elevatorEpoch===null)B.elevatorEpoch=now;
 const elapsed=Math.max(0,now-B.elevatorEpoch),trip=Math.floor(elapsed/ELEVATOR_PERIOD),t=elapsed%ELEVATOR_PERIOD;
 const from=4+(trip*7)%20,to=(from+7-1)%ROWS+1;
 const crew=S.roster.filter(m=>m.recruited&&!m.dead);
 const passenger=crew.length?crew[trip%crew.length]:null;
 const scene={phase:'parked',y:floorY(from),passenger,x:ELEV_X+ELEV_W/2,door:0,floor:from};
 if(t>=7200&&t<8400){
  scene.phase='approach';scene.x=ELEV_X-26+(ELEV_W/2+2)*(t-7200)/1200;scene.door=1;
 }else if(t>=8400&&t<9000){
  scene.phase='boarding';scene.door=1;
 }else if(t>=9000&&t<12200){
  scene.phase='travel';
  const p=(t-9000)/3200,ease=p*p*(3-2*p);
  scene.y=floorY(from)+(floorY(to)-floorY(from))*ease;scene.floor=p<0.5?from:to;
 }else if(t>=12200&&t<13400){
  scene.phase='exiting';scene.y=floorY(to);scene.floor=to;scene.door=1;
  scene.x=ELEV_X+ELEV_W/2-Math.max(0,(t-12200)/1200*34);
 }else if(t>=13400){
  scene.y=floorY(to);scene.floor=to;
 }
 scene.x=Math.max(12,Math.min(BW-12,scene.x));
 return scene;
}
function drawBaseElevator(c,now){
 const scene=baseElevatorScene(now),top=GRID_Y,bottom=GRID_Y+GRID_H;
 c.fillStyle='#070b11';c.fillRect(ELEV_X,top,ELEV_W,bottom-top);
 c.fillStyle='#172330';c.fillRect(ELEV_X+3,top,ELEV_W-6,bottom-top);
 c.strokeStyle='#526879';c.lineWidth=2;c.strokeRect(ELEV_X,top,ELEV_W,bottom-top);
 for(let level=1;level<=ROWS;level++){
  const y=floorY(level);
  c.strokeStyle='rgba(148,174,194,.15)';c.beginPath();c.moveTo(ELEV_X,y+CH/2);c.lineTo(ELEV_X+ELEV_W,y+CH/2);c.stroke();
  c.fillStyle=scene.floor===level?'#75e2e6':'#6a7b88';c.fillRect(ELEV_X+1,y-2,3,4);
 }
 const cabinY=scene.y-15;
 c.fillStyle='#0a1018';c.fillRect(ELEV_X+5,cabinY,ELEV_W-10,30);
 c.fillStyle='#526879';c.fillRect(ELEV_X+5,cabinY,ELEV_W-10,3);
 c.fillStyle='#293c4a';c.fillRect(ELEV_X+8,cabinY+4,ELEV_W-16,22);
 c.strokeStyle='#a0b7c7';c.lineWidth=1;c.strokeRect(ELEV_X+5,cabinY,ELEV_W-10,30);
 const doorsOpen=['approach','boarding','exiting'].includes(scene.phase);
 c.fillStyle='#72899a';
 if(doorsOpen){c.fillRect(ELEV_X+8,cabinY+4,8,22);c.fillRect(ELEV_X+26,cabinY+4,8,22);}
 else{c.fillRect(ELEV_X+9,cabinY+4,10,22);c.fillRect(ELEV_X+23,cabinY+4,10,22);}
 c.fillStyle='#75e2e6';c.fillRect(ELEV_X+ELEV_W-2,cabinY+6,2,5);
 if(scene.passenger&&['boarding','travel','exiting'].includes(scene.phase)){
  const px=scene.phase==='exiting'?scene.x:ELEV_X+ELEV_W/2;
  const py=scene.phase==='exiting'?scene.y+14:cabinY+28;
  drawSoldier(c,px,py,0.4,scene.passenger,scene.phase==='travel'?0:now/90,1);
 }
 if(scene.passenger&&scene.phase==='approach')
  drawSoldier(c,scene.x,floorY(scene.floor)+CH/2-2,0.4,scene.passenger,now/90,1);
 c.fillStyle='#09121a';c.fillRect(ELEV_X-3,top,ELEV_W+6,15);
 c.fillStyle='#a7bbc9';c.font='7px monospace';c.textAlign='center';c.fillText('LIFT',ELEV_X+ELEV_W/2,top+10);
}

function drawFacilityBackdrop(c){
 const rock=c.createLinearGradient(0,0,0,BH);
 rock.addColorStop(0,'#202b34');rock.addColorStop(.5,'#111b24');rock.addColorStop(1,'#080e15');
 c.fillStyle=rock;c.fillRect(0,0,BW,BH);
 for(let i=0;i<72;i++){
  const x=(i*97)%BW,y=(i*211+100)%BH;
  c.fillStyle=i%2?'rgba(126,151,167,.055)':'rgba(0,0,0,.12)';
  c.fillRect(x,y,7+i%9,2+i%4);
 }
}
function drawSurface(c){
 const sky=c.createLinearGradient(0,0,0,24);sky.addColorStop(0,'#0a1420');sky.addColorStop(1,'#273a48');
 c.fillStyle=sky;c.fillRect(0,0,BW,24);
 c.fillStyle='#323940';c.fillRect(0,24,BW,SURF-24);
 c.fillStyle='#899aa6';c.font='8px monospace';c.textAlign='left';c.fillText('CHEYENNE MOUNTAIN · NORAD ACCESS',12,38);
 c.fillStyle='#202a32';c.fillRect(95,42,240,30);
 c.fillStyle='#344958';c.fillRect(99,46,232,22);
 c.strokeStyle='#7e919e';c.lineWidth=1;c.strokeRect(95,42,240,30);
 c.fillStyle='#a7c5d6';c.font='bold 10px monospace';c.textAlign='center';c.fillText('SECURE MOUNTAIN ENTRANCE',215,60);
 c.fillStyle='#121a21';c.fillRect(350,42,142,30);c.strokeStyle='#596b77';c.strokeRect(350,42,142,30);
 c.fillStyle='#9aaebc';c.font='8px monospace';c.fillText('SURFACE SUPPORT',421,60);
 c.fillStyle='#8a3030';c.fillRect(509,44,44,25);c.fillStyle='#111';c.fillRect(514,48,10,11);c.fillRect(538,48,10,11);
 c.fillStyle='#9da9b1';c.font='7px monospace';c.fillText('NORAD',531,78);
}
function drawLevelArchitecture(c,y,level){
 const info=BASE_LEVEL_INFO[level],tunnel=TUNNEL_COLORS[info[1]]||'#8092a0';
 c.fillStyle='#101820';c.fillRect(5,y,BW-12,CH-1);
 c.fillStyle='#24333e';c.fillRect(GRID_X,y+1,GRID_W,CH-2);
 c.fillStyle='#384954';c.fillRect(GRID_X,y+1,GRID_W,2);
 c.fillStyle='#202e37';c.fillRect(GRID_X,y+4,GRID_W,17);
 c.fillStyle='#121c24';c.fillRect(GRID_X,y+21,GRID_W,CH-23);
 c.fillStyle='#0a1117';c.fillRect(GRID_X,y+24,GRID_W,10);
 c.fillStyle='#3e515e';c.fillRect(GRID_X,y+23,GRID_W,1);
 c.fillStyle='rgba(0,0,0,.25)';c.fillRect(GRID_X,y+33,GRID_W,2);
 for(let x=0;x<COLS;x++){
  const bx=GRID_X+x*CW;
  c.fillStyle=x%2?'#283944':'#2c3c47';c.fillRect(bx+2,y+5,CW-4,15);
  c.fillStyle='#17232b';c.fillRect(bx+5,y+8,CW-10,10);
  c.fillStyle='#42545e';c.fillRect(bx+3,y+5,CW-6,1);
  c.fillStyle='#090f14';c.fillRect(bx+CW/2-5,y+19,10,7);
  c.fillStyle='#52646e';c.fillRect(bx+CW/2-6,y+18,12,2);
  c.fillStyle=tunnel;c.fillRect(bx+4,y+28,3,2);
  c.fillStyle='rgba(195,220,230,.11)';c.fillRect(bx+11,y+27,CW-18,1);
  if(x>0){c.fillStyle='#667984';c.fillRect(bx,y+3,2,17);}
 }
 c.fillStyle='rgba(165,190,202,.08)';c.fillRect(GRID_X,y+29,GRID_W,1);
 c.fillStyle=tunnel;c.fillRect(GRID_X+5,y+2,8,2);
 c.fillStyle='#9aadb9';c.font='bold 8px monospace';c.textAlign='left';
 c.fillText(`L${String(level).padStart(2,'0')}`,8,y+14);
 c.fillStyle='#8497a4';c.font='6px monospace';c.fillText(info[0].toUpperCase(),8,y+25);
}
function drawBuiltRoom(c,room){
 const top=GRID_Y+(ROWS-(room.y+room.h))*CH,x=GRID_X+room.x*CW,w=room.w*CW,h=room.h*CH;
 const colors={gate:'#174253',generator:'#46401e',lab:'#1d4950',workshop:'#493b28',barracks:'#303d50',medbay:'#4a2b34',training:'#334a31',armory:'#463245',water:'#214555',storage:'#3b4145',canteen:'#4b452e'};
 c.fillStyle=colors[room.type]||'#35434d';c.fillRect(x+4,top+5,w-8,h-11);
 c.fillStyle='rgba(6,11,16,.7)';c.fillRect(x+8,top+9,w-16,Math.max(8,h-22));
 c.strokeStyle=B.selRoom===room.id?'#7be1e8':'#8295a0';c.lineWidth=B.selRoom===room.id?2:1;c.strokeRect(x+4,top+5,w-8,h-11);
 c.fillStyle='#9ab0bd';c.fillRect(x+w/2-7,top+h-8,14,3);
 if(room.type==='gate'){
  const gx=x+w/2,gy=top+h/2-2;
  c.fillStyle='#091723';c.beginPath();c.ellipse(gx,gy,11,7,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#71d7ec';c.lineWidth=2;c.beginPath();c.ellipse(gx,gy,11,7,0,0,Math.PI*2);c.stroke();
  c.fillStyle='#b8d5df';c.font='7px monospace';c.textAlign='center';c.fillText('GATERAUM',gx,top+h-10);
 }else{
  if(typeof drawRoomIcon==='function')drawRoomIcon(c,room.type,x+w/2-8,top+7,0.5);
  c.fillStyle='#c2d2dc';c.font='6px monospace';c.textAlign='center';
  c.fillText((ROOMS[room.type]&&ROOMS[room.type].name||room.type).toUpperCase().slice(0,14),x+w/2,top+h-9);
 }
 room.staff.forEach((id,index)=>{
  const m=S.roster[id];
  if(m&&m.recruited&&!m.dead)drawSoldier(c,x+10+index*13,top+h-3,0.3,m,0,1);
 });
}
function baseNpcFloor(member,index){
 if(member.id===0)return 27;
 if(member.id===1)return 19;
 if(member.id===2)return 18;
 if(member.id===3)return 25;
 return [16,21,24,11][index%4];
}
function drawBasePeople(c,now){
 const crew=S.roster.filter(m=>m.recruited&&!m.dead);
 crew.forEach((m,index)=>{
  const cycle=((now/12500+index*0.23)%1),reverse=index%2===1;
  const progress=reverse?1-cycle:cycle;
  const x=GRID_X+50+progress*(GRID_W-100);
  const level=baseNpcFloor(m,index),rowY=GRID_Y+(level-1)*CH;
  const feet=rowY+CH-2;
  drawSoldier(c,Math.max(10,Math.min(BW-10,x)),feet,0.47,m,now/110+index,1);
 });
}
function renderBase(cv){
 const c=cv.getContext('2d');
 if(cv.width!==BW)cv.width=BW;if(cv.height!==BH)cv.height=BH;
 const now=performance.now();
 drawFacilityBackdrop(c);drawSurface(c);
 for(let y=0;y<ROWS;y++){
  const level=y+1,screenY=GRID_Y+y*CH;
  drawLevelArchitecture(c,screenY,level);
  for(let x=0;x<COLS;x++){
   const id=S.base.grid[y*COLS+x];
   if(!id)continue;
   const room=S.base.rooms[id];
   if(isOrigin(x,y,id))drawBuiltRoom(c,room);
  }
 }
 drawBaseElevator(c,now);drawBasePeople(c,now);
 c.fillStyle='#76d9e9';c.font='bold 9px monospace';c.textAlign='center';
 c.fillText('GATE LEVEL 28',GRID_X+GRID_W/2,BH-9);
}

function canBuildAt(type,x,y){
 const R=ROOMS[type];if(!R)return false;
 if(x<0||y<0||x+R.w>COLS||y+R.h>ROWS)return false;
 for(let dy=0;dy<R.h;dy++)for(let dx=0;dx<R.w;dx++)
  if(S.base.grid[(y+dy)*COLS+x+dx]!==null)return false;
 for(const k in R.cost)if(S.res[k]<R.cost[k])return false;
 return true;
}
function baseClick(clientX,clientY){
 const cv=document.getElementById('base-cv');if(!cv)return;
 const r=cv.getBoundingClientRect(),sx=cv.width/r.width,sy=cv.height/r.height;
 const mx=(clientX-r.left)*sx,my=(clientY-r.top)*sy;
 const gx=Math.floor((mx-GRID_X)/CW),gy=Math.floor((my-GRID_Y)/CH);
 if(gx<0||gy<0||gx>=COLS||gy>=ROWS)return;
 const x=gx,y=ROWS-1-gy;
 if(B.buildMode){
  const res=buildRoom(B.buildType,x,y);
  if(res.ok&&typeof SFX!=='undefined')SFX.build();
  B.buildMode=false;B.buildType=null;act(res);return;
 }
 B.selRoom=S.base.grid[y*COLS+x]||null;renderAll();
}
