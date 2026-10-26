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
  const now=performance.now();
  // Silo background & blast bunker architecture
  c.fillStyle='#0b131d';c.fillRect(x+8,top+9,w-16,h-20);
  // Reinforced concrete pillars
  c.fillStyle='#1e293b';c.fillRect(x+10,top+10,12,h-22);c.fillRect(x+w-22,top+10,12,h-22);
  c.strokeStyle='#334155';c.lineWidth=1;c.strokeRect(x+10,top+10,12,h-22);c.strokeRect(x+w-22,top+10,12,h-22);
  // Stargate center (slightly left of center for ramp perspective)
  const gx=x+w/2-10,gy=top+h/2-4;
  // Steel embarkation ramp leading to the gate
  c.fillStyle='#334155';c.beginPath();c.moveTo(gx-24,gy+16);c.lineTo(gx+24,gy+16);c.lineTo(gx+34,top+h-14);c.lineTo(gx-34,top+h-14);c.closePath();c.fill();
  c.strokeStyle='#64748b';c.lineWidth=1.5;c.beginPath();c.moveTo(gx-24,gy+16);c.lineTo(gx-34,top+h-14);c.moveTo(gx+24,gy+16);c.lineTo(gx+34,top+h-14);c.stroke();
  // Yellow safety hazard strips on ramp base
  c.fillStyle='#eab308';c.fillRect(gx-32,top+h-14,64,2);
  // Outer Naquadah ring
  c.fillStyle='#1e293b';c.beginPath();c.arc(gx,gy,26,0,Math.PI*2);c.fill();
  c.strokeStyle='#475569';c.lineWidth=4;c.beginPath();c.arc(gx,gy,24,0,Math.PI*2);c.stroke();
  c.strokeStyle='#0f172a';c.lineWidth=1.5;c.beginPath();c.arc(gx,gy,21,0,Math.PI*2);c.stroke();
  // 9 Chevron locks glowing orange
  for(let i=0;i<9;i++){
   const ang=i*(Math.PI*2/9)-Math.PI/2;
   const cx=gx+Math.cos(ang)*24,cy=gy+Math.sin(ang)*24;
   c.fillStyle='#ea580c';c.fillRect(cx-2,cy-2,4,4);
   c.fillStyle='#fde047';c.fillRect(cx-1,cy-1,2,2);
  }
  // Event Horizon / Kawoosh ripple (blue water shimmer)
  const ripple=Math.sin(now/280)*1.5;
  const ehGrad=c.createRadialGradient(gx,gy,2,gx,gy,19);
  ehGrad.addColorStop(0,'#e0f2fe');ehGrad.addColorStop(0.35,'#38bdf8');ehGrad.addColorStop(0.85,'#0284c7');ehGrad.addColorStop(1,'#0f172a');
  c.fillStyle=ehGrad;c.beginPath();c.arc(gx,gy,19+ripple*0.4,0,Math.PI*2);c.fill();
  c.strokeStyle='rgba(255,255,255,0.45)';c.lineWidth=1;c.beginPath();c.arc(gx,gy,11+ripple,0,Math.PI*2);c.stroke();
  // Armed SF guards standing at base of ramp
  c.fillStyle='#1e3a8a';c.fillRect(gx-42,top+h-24,6,12);c.fillRect(gx+36,top+h-24,6,12);
  c.fillStyle='#fde047';c.beginPath();c.arc(gx-39,top+h-26,2.5,0,Math.PI*2);c.arc(gx+39,top+h-26,2.5,0,Math.PI*2);c.fill();
  c.fillStyle='#0f172a';c.fillRect(gx-39,top+h-20,9,3);c.fillRect(gx+30,top+h-20,9,3);
  // Header plaque & prompt
  c.fillStyle='#7dd3fc';c.font='bold 7px monospace';c.textAlign='center';
  c.fillText('◎ LEVEL 28/27 · SGC TORRAUM (STARGATE)',x+w/2,top+14);
  c.fillStyle='#94a3b8';c.font='6px monospace';
  c.fillText('WURMLOCH AKTIV · [KLICK = STERNENKARTE]',x+w/2,top+h-6);
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
 if(typeof getGfxMode==='function'&&getGfxMode()==='ascii'&&typeof renderBaseAscii==='function'){
  renderBaseAscii(cv);return;
 }
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
 // Level 28 Kontrollraum (cols 4..5) · Dialing Computer & Walter Harriman
 {
  const ky=GRID_Y+27*CH,kx=GRID_X+4*CW,kw=2*CW;
  c.fillStyle='rgba(15,23,42,0.92)';c.fillRect(kx+3,ky+4,kw-6,CH-9);
  c.strokeStyle='#38bdf8';c.lineWidth=1.2;c.strokeRect(kx+3,ky+4,kw-6,CH-9);
  // Observation blast-window looking into Gateroom
  c.fillStyle='rgba(56,189,248,0.2)';c.fillRect(kx+5,ky+6,18,CH-13);
  c.strokeStyle='#0284c7';c.lineWidth=1;c.strokeRect(kx+5,ky+6,18,CH-13);
  // Dialing computer & monitors
  c.fillStyle='#1e293b';c.fillRect(kx+28,ky+15,48,12); // Desk
  c.fillStyle='#22c55e';c.fillRect(kx+32,ky+8,8,6);   // CRT 1
  c.fillStyle='#f59e0b';c.fillRect(kx+44,ky+8,8,6);   // CRT 2
  c.fillStyle='#38bdf8';c.fillRect(kx+56,ky+8,12,6);  // CRT 3 (Chevron status)
  // Chief Walter Harriman seated at console
  c.fillStyle='#1d4ed8';c.fillRect(kx+82,ky+12,7,12); // AF Uniform
  c.fillStyle='#fde047';c.beginPath();c.arc(kx+85.5,ky+9,3.5,0,Math.PI*2);c.fill(); // Head
  c.fillStyle='#38bdf8';c.font='bold 6px monospace';c.textAlign='center';
  c.fillText('💻 KONTROLLRAUM (WALTER)',kx+kw/2,ky+CH-7);
 }
 // Level 27 Besprechungsraum (cols 4..5) · Conference Table overlooking Gate
 {
  const by=GRID_Y+26*CH,bx=GRID_X+4*CW,bw=2*CW;
  c.fillStyle='rgba(30,41,59,0.9)';c.fillRect(bx+3,by+4,bw-6,CH-9);
  c.strokeStyle='#94a3b8';c.lineWidth=1.2;c.strokeRect(bx+3,by+4,bw-6,CH-9);
  // Window overlooking Gateroom silo
  c.fillStyle='rgba(56,189,248,0.18)';c.fillRect(bx+5,by+6,16,CH-13);
  c.strokeStyle='#0284c7';c.strokeRect(bx+5,by+6,16,CH-13);
  // Conference table
  c.fillStyle='#5c3a1e';c.fillRect(bx+26,by+14,64,8); // Table
  // Chairs
  c.fillStyle='#475569';
  c.fillRect(bx+30,by+8,8,4);c.fillRect(bx+44,by+8,8,4);c.fillRect(bx+58,by+8,8,4);c.fillRect(bx+72,by+8,8,4);
  c.fillRect(bx+30,by+24,8,4);c.fillRect(bx+44,by+24,8,4);c.fillRect(bx+58,by+24,8,4);c.fillRect(bx+72,by+24,8,4);
  // Tactical screen
  c.fillStyle='#0f172a';c.fillRect(bx+96,by+8,22,14);
  c.fillStyle='#38bdf8';c.font='5px monospace';c.textAlign='center';c.fillText('MAP',bx+107,by+17);
  c.fillStyle='#e2e8f0';c.font='bold 6px monospace';
  c.fillText('🗺 BESPRECHUNG (SG-1)',bx+bw/2,by+CH-7);
 }
 // Level 28 Equipment & MALP Staging (cols 6..7)
 {
  const sy=GRID_Y+27*CH,sx=GRID_X+6*CW,sw=2*CW;
  c.fillStyle='rgba(24,32,42,0.88)';c.fillRect(sx+3,sy+4,sw-6,CH-9);
  c.strokeStyle='#64748b';c.lineWidth=1;c.strokeRect(sx+3,sy+4,sw-6,CH-9);
  // MALP probe body & treads
  c.fillStyle='#334155';c.fillRect(sx+24,sy+16,28,10);
  c.fillStyle='#1e293b';c.fillRect(sx+22,sy+23,32,4); // Treads
  c.fillStyle='#38bdf8';c.fillRect(sx+42,sy+12,4,4); // Sensor/Cam
  // Crates
  c.fillStyle='#78350f';c.fillRect(sx+65,sy+14,14,12);c.fillRect(sx+82,sy+16,16,10);
  c.fillStyle='#cbd5e1';c.font='bold 6px monospace';c.textAlign='center';
  c.fillText('🚜 MALP & AUSRÜSTUNG',sx+sw/2,sy+CH-7);
 }
 // Level 27 Commander's Office (Hammond / Weir / Landry) + Clipboard Hotspot
 {
  const cmd=(typeof COMMANDERS!=='undefined'&&COMMANDERS[S.commander])||COMMANDERS.hammond;
  const ly=GRID_Y+26*CH,ox=GRID_X+6*CW,ow=2*CW;
  c.fillStyle='rgba(58,42,24,0.88)';c.fillRect(ox+3,ly+4,ow-6,CH-9);
  c.strokeStyle='#e8b040';c.lineWidth=1.5;c.strokeRect(ox+3,ly+4,ow-6,CH-9);
  c.fillStyle='#5c3a1e';c.fillRect(ox+22,ly+21,36,7); // Desk
  c.fillStyle='#ef4444';c.fillRect(ox+48,ly+18,7,4); // Red Phone
  c.fillStyle='#e8b040';c.fillRect(ox+26,ly+18,8,4); // Clipboard
  c.fillStyle=cmd?cmd.color:'#e8b040';c.beginPath();c.arc(ox+40,ly+15,4.5,0,Math.PI*2);c.fill();
  c.fillStyle='#f3d27a';c.font='bold 6.5px monospace';c.textAlign='center';
  c.fillText('📋 BÜRO: '+(cmd?cmd.name.toUpperCase().slice(0,14):'HAMMOND'),ox+ow/2,ly+11);
 }
 drawBaseElevator(c,now);drawBasePeople(c,now);
 c.fillStyle='#76d9e9';c.font='bold 9px monospace';c.textAlign='center';
 c.fillText('GATE LEVEL 28',GRID_X+GRID_W/2,BH-9);
}

// ---------- Room Interior Detail Renderer (ROADMAP §1.5.3) ----------
function drawRoomInteriorCanvas(cv,room){
 if(!cv||!room)return;
 const c=cv.getContext('2d'),W=cv.width,H=cv.height;
 const R=ROOMS[room.type]||{name:room.type};
 const now=performance.now();
 if(typeof getGfxMode==='function'&&getGfxMode()==='ascii'){
  c.fillStyle='#040806';c.fillRect(0,0,W,H);
  c.strokeStyle='#22c55e';c.strokeRect(1,1,W-2,H-2);
  c.font='bold 10px "Courier New",monospace';c.fillStyle='#4ade80';c.textAlign='left';
  c.fillText(`[RAUM-TERMINAL] ${R.name.toUpperCase()} (#${room.id})`,8,15);
  c.fillStyle='#15803d';c.fillText('┌────────────────────────────────────────┐',6,29);
  const asciiArt={
   gate:     ['│   ╭═══════ [ STARGATE ] ═══════╮       │','│   ║   ≋≋≋≋ EVENT HORIZON ≋≋≋   ║       │','│   ╰════════════╤══╤════════════╯       │','│        ════════╧══╧════════ (RAMPE)    │'],
   canteen:  ['│ [KÜCHE: BLAUER WACKELPUDDING & KAFFEE] │','│  ┌──────┐     ┌──────┐     ┌──────┐    │','│  │TISCH1│     │TISCH2│     │TISCH3│    │','│  └──────┘     └──────┘     └──────┘    │'],
   lab:      ['│ [NAQUADAH-ANALYSATOR]  [ANTIKER-ARCHIV]│','│  ╔══════╗  ░░▒▒▓▓██    ┌────────────┐  │','│  ╚══════╝  [SPEKTRUM]  │ HOLO-TISCH │  │','│                        └────────────┘  │'],
   medbay:   ['│ [KRANKENBETT 1] [BETT 2]   [MRT-SCAN]  │','│  ┌──────────┐  ┌──────────┐  ╔════╗    │','│  │ ✚ LIEGE  │  │ ✚ LIEGE  │  ║SCAN║    │','│  └──────────┘  └──────────┘  ╚════╝    │'],
   armory:   ['│ [WAFFENREGAL: P90 / M16 / ZAT / RÜST.] │','│  ╠══╦══╦══╣    ╠══╦══╦══╣  [WERKBANK]  │','│  ║🔫║⚡║🛡║    ║🔫║⚡║🛡║  ┌────────┐  │','│  ╩══╩══╩══╩    ╩══╩══╩══╩  └────────┘  │']
  }[room.type]||['│ [SGC SEKTOR-EINRICHTUNG AKTIV]         │','│  ╔════════════╗      ╔════════════╗    │','│  ║ KONSOLE A  ║      ║ KONSOLE B  ║    │','│  ╚════════════╝      ╚════════════╝    │'];
  asciiArt.forEach((line,i)=>{c.fillStyle='#86efac';c.fillText(line,6,43+i*14);});
  c.fillStyle='#15803d';c.fillText('└────────────────────────────────────────┘',6,101);
  const staffNames=room.staff.map(id=>S.roster[id]?S.roster[id].name:'?').join(', ')||'Keine Zuweisung';
  c.fillStyle='#eab308';c.fillText(`Personal: ${staffNames.slice(0,34)}`,8,118);
  return;
 }
 // Pixel-Art Interior View
 const wallGrad=c.createLinearGradient(0,0,0,H);
 wallGrad.addColorStop(0,'#1b2836');wallGrad.addColorStop(0.65,'#121b24');wallGrad.addColorStop(0.66,'#232f3a');wallGrad.addColorStop(1,'#151d26');
 c.fillStyle=wallGrad;c.fillRect(0,0,W,H);
 c.strokeStyle='rgba(140,175,200,0.12)';c.lineWidth=1;
 for(let fx=0;fx<W;fx+=28){c.beginPath();c.moveTo(fx,H*0.66);c.lineTo(fx-18,H);c.stroke();}
 if(room.type==='canteen'){
  c.fillStyle='#3c4d5c';c.fillRect(14,38,96,26);
  c.fillStyle='#38bdf8';c.fillRect(28,31,12,7); // Blue Jell-O
  c.fillStyle='#ef4444';c.fillRect(54,32,10,6);
  [135,215].forEach(tx=>{
   c.fillStyle='#5c4632';c.fillRect(tx,72,52,9);
   c.fillStyle='#334155';c.fillRect(tx+8,81,5,16);c.fillRect(tx+38,81,5,16);
   c.fillStyle='#38bdf8';c.fillRect(tx+20,66,8,6);
  });
 }else if(room.type==='lab'||room.type==='workshop'){
  c.fillStyle='#16394a';c.fillRect(22,32,76,42);c.strokeStyle='#38bdf8';c.strokeRect(22,32,76,42);
  const pulse=0.5+0.5*Math.sin(now/300);
  c.fillStyle=`rgba(56,189,248,${0.3+0.4*pulse})`;c.beginPath();c.arc(60,53,13,0,Math.PI*2);c.fill();
  c.fillStyle='#4b5563';c.fillRect(130,58,110,20);
  c.fillStyle='#eab308';c.fillRect(155,48,14,10);
 }else if(room.type==='medbay'){
  [24,114,204].forEach(bx=>{
   c.fillStyle='#334155';c.fillRect(bx,64,62,16);
   c.fillStyle='#e2e8f0';c.fillRect(bx+4,58,54,7);
   c.fillStyle='#ef4444';c.fillRect(bx+26,36,8,14);c.fillRect(bx+22,40,16,6);
  });
 }else if(room.type==='armory'){
  for(let rx=20;rx<260;rx+=60){
   c.fillStyle='#293542';c.fillRect(rx,28,44,50);c.strokeStyle='#64748b';c.strokeRect(rx,28,44,50);
   c.fillStyle='#eab308';c.fillRect(rx+6,38,30,4);c.fillRect(rx+6,50,26,4);c.fillRect(rx+6,62,32,4);
  }
 }else if(room.type==='gate'){
  c.fillStyle='#334155';c.beginPath();c.arc(W/2,58,38,0,Math.PI*2);c.fill();
  c.fillStyle='#0ea5e9';c.beginPath();c.arc(W/2,58,28,0,Math.PI*2);c.fill();
  c.fillStyle='#475569';c.fillRect(W/2-36,86,72,12);
 }else{
  c.fillStyle='#2a3b4c';c.fillRect(28,38,88,38);c.fillRect(150,38,100,38);
  c.fillStyle='#38bdf8';c.fillRect(36,46,72,16);c.fillRect(160,46,80,16);
 }
 const people=[];
 room.staff.forEach(id=>{if(S.roster[id])people.push({m:S.roster[id],role:'STAFF'});});
 if(people.length<3){
  S.roster.filter(m=>m.recruited&&!m.dead&&!room.staff.includes(m.id)).slice(0,3-people.length).forEach(m=>people.push({m,role:'BESUCH'}));
 }
 people.forEach((p,idx)=>{
  const px=48+idx*88+Math.sin(now/700+idx*2)*12;
  const py=106+(idx%2)*8;
  drawSoldier(c,px,py,0.68,p.m,now/140+idx,1);
  c.fillStyle='rgba(6,10,16,0.85)';c.fillRect(px-32,py+3,64,12);
  c.fillStyle=p.role==='STAFF'?'#4ade80':'#94a3b8';c.font='bold 8.5px monospace';c.textAlign='center';
  c.fillText(p.m.name.split(' ').pop(),px,py+12);
 });
 c.fillStyle='rgba(6,10,16,0.82)';c.fillRect(0,0,W,18);
 c.fillStyle='#e8b040';c.font='bold 9.5px monospace';c.textAlign='left';
 c.fillText(`🔍 INNENANSICHT: ${R.name.toUpperCase()}`,8,13);
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
 // Level 28 & 27 cols 0..3: Gateroom click -> opens Star Map
 if(gx>=0&&gx<=3&&(gy===26||gy===27)){
  if(typeof setTab==='function')setTab('map');
  if(typeof note==='function')note(I18N.T('game.dyn.base.gate_click')||'Torraum: Sternenkarte für Wurmloch-Anwahl geöffnet.');
  return;
 }
 // Level 28 cols 4..5: Kontrollraum click -> Walter Harriman
 if(gx>=4&&gx<=5&&gy===27){
  if(typeof sfx==='function')sfx('gate');
  if(typeof note==='function')note(I18N.T('game.dyn.base.walter_quote')||'Chief Walter Harriman: „Chevron 7 verriegelt! Wurmloch etabliert, Iris bleibt offen.“');
  return;
 }
 // Level 27 cols 4..5: Besprechungsraum click -> Briefing
 if(gx>=4&&gx<=5&&gy===26){
  if(typeof setTab==='function')setTab('map');
  if(typeof note==='function')note(I18N.T('game.dyn.base.briefing_click')||'Besprechungsraum: Einsatzbesprechung für SG-1 aktiv.');
  return;
 }
 // Level 27 (gy===26) cols 6-7 is Hammond's Office / Clipboard hotspot
 if(gy===26&&gx>=6&&!S.base.grid[y*COLS+x]&&typeof showClipboardModal==='function'){
  showClipboardModal();return;
 }
 B.selRoom=S.base.grid[y*COLS+x]||null;renderAll();
}
