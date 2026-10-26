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
 rock.addColorStop(0,'#1e2730');rock.addColorStop(.12,'#172029');rock.addColorStop(.55,'#0f1821');rock.addColorStop(1,'#070c12');
 c.fillStyle=rock;c.fillRect(0,0,BW,BH);
 // Geological granite strata & subterranean rock fractures around the bunker shaft
 for(let i=0;i<90;i++){
  const x=(i*97)%BW,y=SURF+((i*211)%(BH-SURF));
  c.fillStyle=i%3===0?'rgba(148,163,184,.05)':i%2?'rgba(100,116,139,.04)':'rgba(0,0,0,.16)';
  c.fillRect(x,y,9+(i%13),2+(i%4));
 }
 // Reinforced concrete shaft retaining walls flanking the 28 levels
 c.fillStyle='#141e27';c.fillRect(GRID_X-6,GRID_Y,5,GRID_H);c.fillRect(GRID_X+GRID_W+1,GRID_Y,5,GRID_H);
 c.strokeStyle='#334155';c.lineWidth=1;
 c.beginPath();c.moveTo(GRID_X-1,GRID_Y);c.lineTo(GRID_X-1,GRID_Y+GRID_H);
 c.moveTo(GRID_X+GRID_W+1,GRID_Y);c.lineTo(GRID_X+GRID_W+1,GRID_Y+GRID_H);c.stroke();
}

function _drawMountainPine(c,x,y,sc){
 c.fillStyle='#14281b';
 for(let tier=0;tier<3;tier++){
  const ty=y-tier*5*sc,tw=(7-tier*1.6)*sc,th=7*sc;
  c.beginPath();c.moveTo(x,ty-th);c.lineTo(x-tw,ty);c.lineTo(x+tw,ty);c.closePath();c.fill();
 }
 c.fillStyle='#1f3f2a';
 for(let tier=0;tier<3;tier++){
  const ty=y-tier*5*sc,tw=(6-tier*1.5)*sc,th=6.5*sc;
  c.beginPath();c.moveTo(x,ty-th);c.lineTo(x-tw*0.3,ty);c.lineTo(x+tw,ty);c.closePath();c.fill();
 }
}

function _drawRazorWireFence(c,x0,y0,x1,y1,coils){
 // Concrete jersey barrier base
 c.strokeStyle='#64748b';c.lineWidth=3;
 c.beginPath();c.moveTo(x0,y0+4);c.lineTo(x1,y1+4);c.stroke();
 // Chain-link mesh
 c.strokeStyle='rgba(148,163,184,0.45)';c.lineWidth=1;
 c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
 for(let i=0;i<=coils;i++){
  const t=i/coils,px=x0+(x1-x0)*t,py=y0+(y1-y0)*t;
  if(i%2===0){c.strokeStyle='#94a3b8';c.beginPath();c.moveTo(px,py-4);c.lineTo(px,py+4);c.stroke();}
  // Concertina razor wire spiral coil
  c.strokeStyle='rgba(203,213,225,0.65)';c.lineWidth=0.9;
  c.beginPath();c.arc(px,py-4,3.2,0,Math.PI*2);c.stroke();
 }
}

function drawSurface(c){
 const now=performance.now();
 const SH=GRID_Y; // Full 96px panoramic Cheyenne Mountain surface header
 // 1. Colorado high-altitude sky & distant ridge
 const sky=c.createLinearGradient(0,0,0,34);
 sky.addColorStop(0,'#0c192c');sky.addColorStop(0.6,'#1e3a5f');sky.addColorStop(1,'#3b5978');
 c.fillStyle=sky;c.fillRect(0,0,BW,34);

 // 2. Massive Cheyenne Mountain granite cliff face (left, center-top, right talus slope)
 const cliff=c.createLinearGradient(0,4,0,SH);
 cliff.addColorStop(0,'#574c43');cliff.addColorStop(0.45,'#443b34');cliff.addColorStop(1,'#29231f');
 c.fillStyle=cliff;
 c.beginPath();
 c.moveTo(0,18);c.lineTo(75,6);c.lineTo(190,14);c.lineTo(285,3);c.lineTo(395,5);
 c.lineTo(485,16);c.lineTo(610,4);c.lineTo(BW,14);c.lineTo(BW,SH);c.lineTo(0,SH);c.closePath();c.fill();

 // Craggy granite rock strata & crags (matching the rugged canyon walls of the reference photos)
 const crags=[
  [18,16,65,12,'#66594f'],[95,20,82,14,'#38302a'],[210,8,155,16,'#615349'],
  [380,12,95,18,'#4f433b'],[490,22,120,24,'#6b5b4f'],[540,48,160,26,'#52453c'],
  [12,42,140,28,'#332b26'],[70,64,125,22,'#4a3f37']
 ];
 crags.forEach(([rx,ry,rw,rh,col])=>{
  c.fillStyle=col;c.beginPath();
  c.moveTo(rx,ry+rh);c.lineTo(rx+rw*0.18,ry);c.lineTo(rx+rw*0.65,ry+2);c.lineTo(rx+rw,ry+rh*0.8);c.closePath();c.fill();
 });
 // Right-side talus/scree gravel slope (seen in reference photo 1 & 2)
 c.fillStyle='rgba(168,152,136,0.22)';
 c.beginPath();c.moveTo(415,26);c.lineTo(540,SH-6);c.lineTo(435,SH-6);c.closePath();c.fill();

 // Rocky Mountain pine forest along left slope & upper canyon
 [[24,42,1.1],[45,48,1.25],[68,44,1.0],[112,38,1.15],[142,46,1.3],[168,42,1.1],
  [36,72,1.35],[74,76,1.2],[118,68,1.3],[156,64,1.15],[186,56,1.0],
  [418,34,1.05],[446,42,1.2],[476,38,1.0],[520,34,1.15],[648,36,1.2],[682,44,1.1]
 ].forEach(([px,py,sc])=>_drawMountainPine(c,px,py,sc));

 // 3. Left White Support Utility Building (seen on left hillside in aerial photo 1)
 c.fillStyle='#cbd5e1';c.fillRect(8,52,44,16);
 c.fillStyle='#94a3b8';c.fillRect(8,50,46,4);
 c.fillStyle='#334155';c.fillRect(14,57,7,6);c.fillRect(26,57,7,6);

 // 4. Iconic Protruding Corrugated Tunnel Portal (Cheyenne Mountain Complex)
 const tx=310,ty=44; // Tunnel mouth center
 // 4a. Rear higher corrugated blast cylinder emerging from rock
 c.fillStyle='#52606d';
 c.beginPath();c.arc(tx-10,ty-8,26,Math.PI,0,false);c.lineTo(tx+16,ty+2);c.lineTo(tx-36,ty+2);c.closePath();c.fill();
 c.strokeStyle='#334155';c.lineWidth=1;c.stroke();

 // 4b. Front corrugated steel cylinder barrel extending outward to the left-front
 c.fillStyle='#788796';
 c.beginPath();c.arc(tx-4,ty,25,Math.PI,0,false);c.lineTo(tx+21,ty+12);c.lineTo(tx-29,ty+12);c.closePath();c.fill();
 // Corrugated steel ribbing arcs across the barrel
 c.strokeStyle='rgba(30,41,59,0.45)';c.lineWidth=1;
 for(let r=19;r<=25;r+=2){c.beginPath();c.arc(tx-4,ty,r,Math.PI*1.02,Math.PI*1.98,false);c.stroke();}

 // 4c. Twin beige/ochre ventilation intake pipes looping over left side of tunnel barrel (Photo 2)
 c.strokeStyle='#a89068';c.lineWidth=3.2;
 c.beginPath();c.moveTo(tx-30,ty+6);c.quadraticCurveTo(tx-24,ty-26,tx-10,ty-22);c.stroke();
 c.strokeStyle='#8c7450';c.lineWidth=2.6;
 c.beginPath();c.moveTo(tx-26,ty+8);c.quadraticCurveTo(tx-20,ty-22,tx-6,ty-19);c.stroke();

 // 4d. Dark tunnel mouth interior + brown steel arch collar ("CHEYENNE MOUNTAIN COMPLEX")
 c.fillStyle='#05080d';
 c.beginPath();c.arc(tx,ty+3,21,Math.PI,0,false);c.lineTo(tx+21,ty+14);c.lineTo(tx-21,ty+14);c.closePath();c.fill();
 // Interior receding tunnel lights
 for(let d=1;d<=3;d++){
  c.fillStyle=`rgba(251,191,36,${0.7-d*0.18})`;
  c.fillRect(tx-3+d*2,ty-10+d*3,4,1.5);
 }
 // Steel arch frame with inscription rim
 c.strokeStyle='#5c4033';c.lineWidth=3.5;
 c.beginPath();c.arc(tx,ty+3,21,Math.PI*1.02,Math.PI*1.98,false);c.stroke();
 c.strokeStyle='#a8a29e';c.lineWidth=0.8;
 c.beginPath();c.arc(tx,ty+3,22.8,Math.PI*1.05,Math.PI*1.95,false);c.stroke();
 // Arch inscription
 c.fillStyle='#e2e8f0';c.font='bold 4.5px monospace';c.textAlign='center';
 c.fillText('CHEYENNE MOUNTAIN COMPLEX',tx,ty-15);

 // 5. Winding Perspective Asphalt Road leading from bottom foreground into the Tunnel Mouth
 c.fillStyle='#94a3b8'; // Concrete road shoulders / curbs
 c.beginPath();c.moveTo(tx-23,ty+14);c.lineTo(tx+23,ty+14);c.lineTo(392,SH-1);c.lineTo(196,SH-1);c.closePath();c.fill();
 c.fillStyle='#2b3138'; // Asphalt surface
 c.beginPath();c.moveTo(tx-19,ty+14);c.lineTo(tx+19,ty+14);c.lineTo(378,SH-1);c.lineTo(210,SH-1);c.closePath();c.fill();

 // Double yellow centerline running into tunnel
 c.strokeStyle='#eab308';c.lineWidth=1.1;
 c.beginPath();c.moveTo(tx-1,ty+14);c.lineTo(293,SH-1);c.moveTo(tx+1,ty+14);c.lineTo(296,SH-1);c.stroke();
 // White crosswalk & STOP markings in foreground
 c.fillStyle='rgba(241,245,249,0.75)';
 for(let cx=232;cx<=352;cx+=14){c.fillRect(cx,SH-10,7,4);}
 c.fillRect(236,SH-22,42,2);

 // 6. Perimeter Chain-Link Fences + Concertina Razor Wire Coils flanking the road
 _drawRazorWireFence(c,200,SH-4,tx-24,ty+13,11);
 _drawRazorWireFence(c,tx+24,ty+13,404,SH-4,11);
 _drawRazorWireFence(c,tx+25,ty+8,510,ty+24,12);

 // Tall galvanized security light poles along the road
 [[224,SH-8],[254,SH-22],[280,ty+16],[344,ty+16],[368,SH-22],[392,SH-8]].forEach(([lx,ly])=>{
  c.strokeStyle='#cbd5e1';c.lineWidth=1.2;
  c.beginPath();c.moveTo(lx,ly);c.lineTo(lx,ly-18);c.stroke();
  c.fillStyle='#fef08a';c.fillRect(lx-2,ly-19,4,2);
 });

 // 7. Military Olive-Drab Convoy Truck & Patrolling SF Soldiers on Road (Photo 1)
 // Army M35 Cargo Truck heading toward tunnel
 const trx=254,try_=SH-28;
 c.fillStyle='#364228';c.fillRect(trx,try_,18,11); // Canvas bed
 c.fillStyle='#475637';c.fillRect(trx+2,try_-4,14,5); // Canopy top
 c.fillStyle='#111827';c.fillRect(trx+2,try_+9,4,3);c.fillRect(trx+12,try_+9,4,3); // Tires
 // Patrolling SF guards on the road
 if(typeof drawSoldier==='function'){
  const gx=282+Math.sin(now/1800)*14;
  drawSoldier(c,gx,SH-12,0.34,{skin:'#e0b088',color:'#3f4d34',cls:'soldier'},now/130,1);
  drawSoldier(c,318,SH-20,0.32,{skin:'#c69068',color:'#3f4d34',cls:'soldier'},0,1);
 }

 // 8. Foreground Security Checkpoint Canopy with Blue Trim (Bottom-Right, Photo 1)
 const gx0=420,gy0=54,gw=136,gh=36;
 // Support columns & booth shadow
 c.fillStyle='rgba(9,14,22,0.85)';c.fillRect(gx0+8,gy0+10,gw-16,gh-10);
 c.fillStyle='#94a3b8';
 [gx0+12,gx0+48,gx0+88,gx0+122].forEach(px=>c.fillRect(px,gy0+10,3,gh-10));
 // Glass guardhouse windows
 c.fillStyle='rgba(56,189,248,0.22)';c.fillRect(gx0+54,gy0+14,64,16);
 c.strokeStyle='#64748b';c.lineWidth=1;c.strokeRect(gx0+54,gy0+14,64,16);
 // Flat roof gravel deck + iconic blue corrugated fascia trim
 c.fillStyle='#cbd5e1';c.fillRect(gx0,gy0,gw,5);
 c.fillStyle='#2563eb';c.fillRect(gx0-2,gy0+3,gw+4,7);
 c.strokeStyle='#1d4ed8';c.lineWidth=1;
 for(let bx=gx0;bx<gx0+gw;bx+=5){c.beginPath();c.moveTo(bx,gy0+3);c.lineTo(bx,gy0+10);c.stroke();}
 // Radome sphere on secondary roof (right side of Photo 1)
 c.fillStyle='#38bdf8';c.beginPath();c.arc(gx0+gw+18,gy0+14,6,0,Math.PI*2);c.fill();
 c.fillStyle='#1e3a8a';c.fillRect(gx0+gw+4,gy0+20,36,20);

 // 9. Top-Left HUD Plaque & Subterranean Transition Divider
 c.fillStyle='rgba(9,15,24,0.82)';c.fillRect(6,6,206,22);
 c.strokeStyle='#38bdf8';c.lineWidth=1;c.strokeRect(6,6,206,22);
 c.fillStyle='#7dd3fc';c.font='bold 8px monospace';c.textAlign='left';
 c.fillText('⛰ CHEYENNE MOUNTAIN COMPLEX',12,16);
 c.fillStyle='#94a3b8';c.font='6.5px monospace';
 c.fillText('NORAD / SGC PORTAL · COLORADO SPRINGS',12,24);

 // Reinforced blast-slab separator between surface and Level 01
 c.fillStyle='#1e293b';c.fillRect(0,SH-3,BW,3);
 c.fillStyle='#eab308';
 for(let hx=GRID_X;hx<GRID_X+GRID_W;hx+=24){c.fillRect(hx,SH-2,12,1.5);}
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
   // 1. Deep 3D-perspective concrete blast silo background (spanning L27 & L28)
   const siloGrad=c.createLinearGradient(x+4,top+5,x+4,top+h-6);
   siloGrad.addColorStop(0,'#070c14');siloGrad.addColorStop(0.55,'#0e1726');siloGrad.addColorStop(1,'#182436');
   c.fillStyle=siloGrad;c.fillRect(x+4,top+5,w-8,h-11);

   // 2. Perspective recessed blast-wall ribs & ceiling gantry struts
   c.strokeStyle='rgba(71,85,105,0.35)';c.lineWidth=1;
   for(let rx=x+18;rx<x+w-16;rx+=18){
    c.beginPath();c.moveTo(rx,top+6);c.lineTo(rx,top+h-16);c.stroke();
   }
   // L27/L28 mid-level catwalk & blast-shield seam
   c.strokeStyle='rgba(56,189,248,0.22)';c.beginPath();c.moveTo(x+12,top+h/2);c.lineTo(x+w-12,top+h/2);c.stroke();
   // Right-side observation windows connecting to L27 Briefing & L28 Control Room
   c.fillStyle='rgba(56,189,248,0.16)';c.fillRect(x+w-19,top+10,8,18);c.fillRect(x+w-19,top+h/2+4,8,18);
   c.strokeStyle='#0284c7';c.strokeRect(x+w-19,top+10,8,18);c.strokeRect(x+w-19,top+h/2+4,8,18);

   // 3. Heavy reinforced concrete corner pillars with pulsing amber klaxon beacons
   c.fillStyle='#1e293b';c.fillRect(x+5,top+6,8,h-13);c.fillRect(x+w-13,top+6,8,h-13);
   c.strokeStyle='#475569';c.lineWidth=1;c.strokeRect(x+5,top+6,8,h-13);c.strokeRect(x+w-13,top+6,8,h-13);
   const klaxon=0.45+0.55*Math.abs(Math.sin(now/320));
   c.fillStyle=`rgba(245,158,11,${klaxon})`;
   c.fillRect(x+7,top+14,4,4);c.fillRect(x+w-11,top+14,4,4);

   // 4. Stargate center & overhead gantry crane cables
   const gx=x+w*0.44,gy=top+35;
   c.strokeStyle='#64748b';c.lineWidth=1.5;
   c.beginPath();c.moveTo(gx-10,top+6);c.lineTo(gx-8,gy-22);c.moveTo(gx+10,top+6);c.lineTo(gx+8,gy-22);c.stroke();

   // Diagonal spotlight beams illuminating the Stargate from silo floor
   c.fillStyle='rgba(56,189,248,0.07)';
   c.beginPath();c.moveTo(x+16,top+h-8);c.lineTo(gx-18,gy-18);c.lineTo(gx+4,gy-22);c.closePath();c.fill();
   c.beginPath();c.moveTo(x+w-20,top+h-8);c.lineTo(gx+18,gy-18);c.lineTo(gx-4,gy-22);c.closePath();c.fill();

   // 5. Outer Naquadah Stargate Ring (3D beveled torus look)
   c.fillStyle='rgba(0,0,0,0.55)';c.beginPath();c.arc(gx+2,gy+2,24,0,Math.PI*2);c.fill(); // Drop shadow
   c.fillStyle='#1e293b';c.beginPath();c.arc(gx,gy,24,0,Math.PI*2);c.fill();
   c.strokeStyle='#64748b';c.lineWidth=4;c.beginPath();c.arc(gx,gy,22,0,Math.PI*2);c.stroke();
   c.strokeStyle='#94a3b8';c.lineWidth=1;c.beginPath();c.arc(gx,gy,24,0,Math.PI*2);c.stroke();
   // Rotating inner glyph ring with 39 glyph ticks
   const ringRot=now/4500;
   c.strokeStyle='#334155';c.lineWidth=2;c.beginPath();c.arc(gx,gy,19.2,0,Math.PI*2);c.stroke();
   c.strokeStyle='#cbd5e1';c.lineWidth=0.8;
   for(let g=0;g<18;g++){
    const ga=ringRot+g*(Math.PI*2/18);
    c.beginPath();c.moveTo(gx+Math.cos(ga)*18,gy+Math.sin(ga)*18);
    c.lineTo(gx+Math.cos(ga)*20.2,gy+Math.sin(ga)*20.2);c.stroke();
   }

   // 6. Event Horizon / Kawoosh vortex (multi-layered cyan water-ripple shader look)
   const ripple=Math.sin(now/240)*1.4,ripple2=Math.cos(now/170)*1.1;
   const ehGrad=c.createRadialGradient(gx+ripple*0.8,gy+ripple2*0.8,1.5,gx,gy,17.5);
   ehGrad.addColorStop(0,'#ffffff');ehGrad.addColorStop(0.25,'#bae6fd');
   ehGrad.addColorStop(0.6,'#0ea5e9');ehGrad.addColorStop(0.9,'#0369a1');ehGrad.addColorStop(1,'#082f49');
   c.fillStyle=ehGrad;c.beginPath();c.arc(gx,gy,17.5,0,Math.PI*2);c.fill();
   c.strokeStyle='rgba(224,242,254,0.55)';c.lineWidth=0.9;
   c.beginPath();c.arc(gx,gy,11+ripple,0,Math.PI*2);c.stroke();
   c.beginPath();c.arc(gx,gy,6-ripple2*0.8,0,Math.PI*2);c.stroke();

   // 7. 9 V-shaped Chevron locks glowing fiery orange-amber
   for(let i=0;i<9;i++){
    const ang=i*(Math.PI*2/9)-Math.PI/2;
    const cx=gx+Math.cos(ang)*22,cy=gy+Math.sin(ang)*22;
    c.fillStyle='#7c2d12';c.fillRect(cx-2.2,cy-2.2,4.4,4.4);
    c.fillStyle='#ea580c';c.fillRect(cx-1.6,cy-1.6,3.2,3.2);
    c.fillStyle='#fef08a';c.fillRect(cx-0.8,cy-0.8,1.6,1.6);
   }

   // 8. 3D Steel Embarkation Ramp with grating steps, handrails & hazard strips
   c.fillStyle='#334155';
   c.beginPath();c.moveTo(gx-15,gy+14);c.lineTo(gx+15,gy+14);c.lineTo(gx+32,top+h-7);c.lineTo(gx-26,top+h-7);c.closePath();c.fill();
   // Grating step lines on ramp
   c.strokeStyle='#1e293b';c.lineWidth=1;
   for(let sy=gy+17;sy<top+h-8;sy+=3.5){
    const spread=(sy-(gy+14))*0.65;
    c.beginPath();c.moveTo(gx-14-spread*0.6,sy);c.lineTo(gx+14+spread*0.9,sy);c.stroke();
   }
   // Metallic ramp handrails
   c.strokeStyle='#94a3b8';c.lineWidth=1.3;
   c.beginPath();
   c.moveTo(gx-15,gy+10);c.lineTo(gx-26,top+h-11);c.lineTo(gx-26,top+h-7);
   c.moveTo(gx+15,gy+10);c.lineTo(gx+32,top+h-11);c.lineTo(gx+32,top+h-7);
   c.stroke();
   // Yellow/black hazard stripe at ramp base
   c.fillStyle='#eab308';c.fillRect(gx-25,top+h-8,56,2);
   c.fillStyle='#0f172a';
   for(let hx=gx-23;hx<gx+29;hx+=6){c.fillRect(hx,top+h-8,3,2);}

   // 9. Twin Armed SF Guards flanking the embarkation ramp
   [[gx-31,1],[gx+37,-1]].forEach(([sx,dir])=>{
    c.fillStyle='#1e3a8a';c.fillRect(sx,top+h-19,5,10);
    c.fillStyle='#fde047';c.beginPath();c.arc(sx+2.5,top+h-21,2,0,Math.PI*2);c.fill();
    c.fillStyle='#0f172a';c.fillRect(sx+(dir>0?1:-4),top+h-16,7,2.2);
   });

   // 10. Header plaque & interactive prompt
   c.fillStyle='rgba(7,12,20,0.78)';c.fillRect(x+14,top+6,w-28,9);
   c.fillStyle='#7dd3fc';c.font='bold 6.5px monospace';c.textAlign='center';
   c.fillText('◎ TORRAUM · EBENE 28/27',x+w/2,top+13);
   c.fillStyle='#bae6fd';c.font='5.5px monospace';
   c.fillText('WURMLOCH AKTIV · [KLICK = STERNENKARTE]',x+w/2,top+h-2);
  }else{
   const now=performance.now();
   // Detailed cutaway interior props per room type (matching Cheyenne Mountain aesthetic)
   if(room.type==='generator'){
    // Glowing Naquadah reactor core & cooling conduits
    c.fillStyle='#1e293b';c.fillRect(x+10,top+10,w-20,h-22);
    const pulse=0.55+0.45*Math.sin(now/240);
    c.fillStyle=`rgba(56,189,248,${0.35+0.4*pulse})`;c.beginPath();c.arc(x+w/2,top+16,6.5,0,Math.PI*2);c.fill();
    c.strokeStyle='#eab308';c.lineWidth=1;c.strokeRect(x+w/2-9,top+10,18,12);
    c.fillStyle='#64748b';c.fillRect(x+12,top+13,12,6);c.fillRect(x+w-24,top+13,12,6);
   }else if(room.type==='lab'){
    // Carter's Astrophysics Lab: Holo-Monitor, Spectrum Analyzer & Server Racks
    c.fillStyle='#0f172a';c.fillRect(x+10,top+9,18,12);c.fillRect(x+w-28,top+9,18,12);
    c.fillStyle='#38bdf8';c.fillRect(x+12,top+11,14,5);
    c.fillStyle='#22c55e';c.fillRect(x+w-26,top+11,10,4);
    c.fillStyle='rgba(56,189,248,0.45)';c.beginPath();c.arc(x+w/2,top+15,4.5,0,Math.PI*2);c.fill();
   }else if(room.type==='medbay'){
    // Dr. Fraiser's Infirmary: White Triage Beds, Red Cross & Live ECG Wave
    c.fillStyle='#e2e8f0';c.fillRect(x+11,top+15,16,6);c.fillRect(x+w-27,top+15,16,6);
    c.fillStyle='#38bdf8';c.fillRect(x+12,top+14,14,3);c.fillRect(x+w-26,top+14,14,3);
    c.fillStyle='#ef4444';c.fillRect(x+w/2-1.5,top+9,3,9);c.fillRect(x+w/2-4.5,top+12,9,3);
   }else if(room.type==='armory'){
    // SGC 2-Story Armory (Levels 15 & 16): Upper Weapon Vault + Mezzanine + Lower Armor & Ammo Bay
    c.fillStyle='#111a26';c.fillRect(x+8,top+8,w-16,h-24);
    c.strokeStyle='#475569';c.lineWidth=1;c.strokeRect(x+8,top+8,w-16,h-24);
    c.fillStyle='rgba(56,189,248,0.12)';c.fillRect(x+10,top+10,w-20,16);
    for(let wx=x+12;wx<x+w-14;wx+=8){
     c.fillStyle='#eab308';c.fillRect(wx,top+12,5,2);
     c.fillStyle='#38bdf8';c.fillRect(wx,top+16,6,2);
     c.fillStyle='#94a3b8';c.fillRect(wx,top+20,5,2);
    }
    c.fillStyle='#334155';c.fillRect(x+8,top+28,w-16,3);
    [x+14,x+28,x+42].forEach((ax,i)=>{
     c.fillStyle=i===1?'#f59e0b':'#38bdf8';
     c.fillRect(ax,top+34,8,9);
     c.fillStyle='#64748b';c.fillRect(ax+2,top+43,4,5);
    });
    c.fillStyle='#365314';c.fillRect(x+w-26,top+39,14,9);c.strokeStyle='#84cc16';c.strokeRect(x+w-26,top+39,14,9);
   }else if(room.type==='workshop'){
    // Level 16 Engineering & Naquadah Forge: Plasma Anvil, Gantry Crane & Welding Sparks
    c.fillStyle='#1c1917';c.fillRect(x+9,top+8,w-18,14);
    c.fillStyle='#475569';c.fillRect(x+12,top+15,24,6);
    c.fillStyle='#ea580c';c.fillRect(x+18,top+12,10,3);
    const spark=Math.abs(Math.sin(now/90));
    c.fillStyle=`rgba(253,224,71,${0.5+0.5*spark})`;
    c.beginPath();c.arc(x+23,top+11,2.5+spark*2,0,Math.PI*2);c.fill();
    c.strokeStyle='#eab308';c.lineWidth=1.2;
    c.beginPath();c.moveTo(x+w-22,top+8);c.lineTo(x+w-22,top+14);c.lineTo(x+w-16,top+17);c.stroke();
   }else if(room.type==='storage'){
    // Level 4 SGC Logistics & Quartermaster Storage: Stacked Naquadah, Tech & Med Crates
    c.fillStyle='#0f172a';c.fillRect(x+8,top+8,w-16,14);
    c.fillStyle='#475569';c.fillRect(x+9,top+14,w-18,1.5);
    c.fillStyle='#b45309';c.fillRect(x+11,top+9,11,5);c.fillRect(x+11,top+16,11,5);
    c.fillStyle='#0284c7';c.fillRect(x+25,top+9,11,5);c.fillRect(x+25,top+16,11,5);
    c.fillStyle='#15803d';c.fillRect(x+39,top+9,11,5);c.fillStyle='#dc2626';c.fillRect(x+39,top+16,11,5);
    c.fillStyle='#eab308';c.fillRect(x+w-20,top+10,8,11);
   }else if(room.type==='training'){
    c.fillStyle='#0f172a';c.fillRect(x+9,top+9,w-18,h-25);
    c.fillStyle='#334155';c.fillRect(x+9,top+28,w-18,2.5);
    [x+16,x+34,x+52].forEach(tx=>{
     c.strokeStyle='#ef4444';c.lineWidth=1;c.beginPath();c.arc(tx,top+17,4,0,Math.PI*2);c.stroke();
     c.fillStyle='#64748b';c.fillRect(tx-3,top+35,6,11);
    });
   }else if(room.type==='water'){
    c.fillStyle='#082f49';c.fillRect(x+10,top+9,18,12);c.fillRect(x+32,top+9,18,12);
    c.fillStyle='#38bdf8';c.fillRect(x+12,top+13,14,7);c.fillRect(x+34,top+11,14,9);
    c.strokeStyle='#7dd3fc';c.strokeRect(x+10,top+9,18,12);c.strokeRect(x+32,top+9,18,12);
   }else if(room.type==='barracks'){
    // Crew Quarters: Bunks & Lockers
    c.fillStyle='#334155';c.fillRect(x+10,top+11,16,10);c.fillRect(x+w-26,top+11,16,10);
    c.fillStyle='#60a5fa';c.fillRect(x+12,top+13,12,3);c.fillRect(x+w-24,top+13,12,3);
   }else if(room.type==='canteen'){
    // Mess Hall: Counter, Coffee & Blue Jell-O
    c.fillStyle='#5c4033';c.fillRect(x+10,top+15,w-20,5);
    c.fillStyle='#38bdf8';c.fillRect(x+w/2-6,top+11,5,4); // Blue Jell-O
    c.fillStyle='#ef4444';c.fillRect(x+w/2+2,top+11,4,4);
   }else if(typeof drawRoomIcon==='function'){
    drawRoomIcon(c,room.type,x+w/2-8,top+7,0.5);
   }
   c.fillStyle='rgba(7,12,19,0.78)';c.fillRect(x+6,top+h-15,w-12,8);
   c.fillStyle='#e2e8f0';c.font='bold 6px monospace';c.textAlign='center';
   c.fillText((ROOMS[room.type]&&ROOMS[room.type].name||room.type).toUpperCase().slice(0,14),x+w/2,top+h-9);
  }
  room.staff.forEach((id,index)=>{
   const m=S.roster[id];
   if(m&&m.recruited&&!m.dead)drawSoldier(c,x+12+index*14,top+h-3,0.32,m,0,1);
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
 const gm=typeof getGfxMode==='function'?getGfxMode():'pixel';
 if(gm==='ascii'&&typeof renderBaseAscii==='function'){
  renderBaseAscii(cv);return;
 }
 if(gm==='webgl3d'&&typeof GL3D!=='undefined'&&typeof GL3D.renderBase==='function'){
  GL3D.renderBase(cv);return;
 }
 const c=cv.getContext('2d');
 if(cv.width!==BW)cv.width=BW;if(cv.height!==BH)cv.height=BH;
 const now=performance.now();
 drawFacilityBackdrop(c);drawSurface(c);
 // Pass 1: Draw all 28 subterranean level corridors first
 for(let y=0;y<ROWS;y++){
  const level=y+1,screenY=GRID_Y+y*CH;
  drawLevelArchitecture(c,screenY,level);
 }
 // Pass 2: Draw all built rooms (including the 2x2 Gateroom on L27/L28) ON TOP so they are never covered!
 if(S&&S.base&&S.base.rooms){
  Object.values(S.base.rooms).forEach(room=>{
   if(room)drawBuiltRoom(c,room);
  });
 }
 drawSgcCommandRooms(c,now);
 drawBaseElevator(c,now);drawBasePeople(c,now);
}

// Zeichnet die festen kanonischen SGC-Kommandoräume auf Ebene 27 & 28 (Kontrollraum Walter, Besprechung SG-1, Büro Hammond, MALP-Depot)
function drawSgcCommandRooms(c,now){
 // Level 28 Kontrollraum (cols 2..3) · Dialing Computer & Chief Walter Harriman
 {
  const ky=GRID_Y+27*CH,kx=GRID_X+2*CW,kw=2*CW;
  const kg=c.createLinearGradient(kx,ky+4,kx,ky+CH-5);
  kg.addColorStop(0,'#0b1526');kg.addColorStop(1,'#16263d');
  c.fillStyle=kg;c.fillRect(kx+3,ky+4,kw-6,CH-9);
  c.strokeStyle='#38bdf8';c.lineWidth=1.2;c.strokeRect(kx+3,ky+4,kw-6,CH-9);
  // Angled reinforced blast-window overlooking the 2x2 Gateroom
  const wg=c.createLinearGradient(kx+5,ky+6,kx+25,ky+CH-7);
  wg.addColorStop(0,'rgba(56,189,248,0.38)');wg.addColorStop(1,'rgba(2,132,199,0.12)');
  c.fillStyle=wg;c.fillRect(kx+5,ky+6,20,CH-13);
  c.strokeStyle='#0ea5e9';c.lineWidth=1;c.strokeRect(kx+5,ky+6,20,CH-13);
  c.beginPath();c.moveTo(kx+15,ky+6);c.lineTo(kx+15,ky+CH-7);c.stroke();
  // Curved SGC Dialing Console & 3 CRT Monitors (Gate Diagnostics, Iris, Chevron Matrix)
  c.fillStyle='#1e293b';c.fillRect(kx+30,ky+16,58,10);
  c.fillStyle='#475569';c.fillRect(kx+29,ky+15,60,2);
  // Monitor 1: Green waveform
  c.fillStyle='#052e16';c.fillRect(kx+32,ky+7,13,8);c.strokeStyle='#22c55e';c.strokeRect(kx+32,ky+7,13,8);
  c.fillStyle='#4ade80';c.fillRect(kx+34,ky+10,9,1.5);
  // Monitor 2: Amber telemetry
  c.fillStyle='#451a03';c.fillRect(kx+48,ky+7,13,8);c.strokeStyle='#f59e0b';c.strokeRect(kx+48,ky+7,13,8);
  c.fillStyle='#fbbf24';c.fillRect(kx+50,ky+9,8,2);c.fillRect(kx+50,ky+12,6,1.5);
  // Monitor 3: Stargate Chevron schematic with glowing red ring
  c.fillStyle='#082f49';c.fillRect(kx+64,ky+6,18,9);c.strokeStyle='#38bdf8';c.strokeRect(kx+64,ky+6,18,9);
  c.strokeStyle='#ef4444';c.lineWidth=1;c.beginPath();c.arc(kx+73,ky+10.5,3,0,Math.PI*2);c.stroke();
  // Red Big Palm Activation Button on desk
  c.fillStyle='#ef4444';c.beginPath();c.arc(kx+82,ky+15,2,0,Math.PI*2);c.fill();
  // Chief Walter Harriman at the console
  if(typeof drawSoldier==='function'){
   drawSoldier(c,kx+98,ky+27,0.34,{skin:'#f1c27d',color:'#1d4ed8',cls:'scientist'},0,1);
  }
  c.fillStyle='rgba(7,12,20,0.82)';c.fillRect(kx+26,ky+CH-13,kw-32,8);
  c.fillStyle='#38bdf8';c.font='bold 6px monospace';c.textAlign='center';
  c.fillText('💻 KONTROLLRAUM (WALTER)',kx+kw/2+8,ky+CH-7);
 }
 // Level 27 Besprechungsraum (cols 2..3) · SG-1 Briefing Room overlooking Gate Silo
 {
  const by=GRID_Y+26*CH,bx=GRID_X+2*CW,bw=2*CW;
  const bg=c.createLinearGradient(bx,by+4,bx,by+CH-5);
  bg.addColorStop(0,'#16202e');bg.addColorStop(1,'#1e293b');
  c.fillStyle=bg;c.fillRect(bx+3,by+4,bw-6,CH-9);
  c.strokeStyle='#94a3b8';c.lineWidth=1.2;c.strokeRect(bx+3,by+4,bw-6,CH-9);
  // Panoramic observation window looking down into the Gateroom + spiral stairs
  c.fillStyle='rgba(56,189,248,0.22)';c.fillRect(bx+5,by+6,20,CH-13);
  c.strokeStyle='#0284c7';c.strokeRect(bx+5,by+6,20,CH-13);
  // Long mahogany conference table with bevel & documents
  c.fillStyle='#452712';c.fillRect(bx+30,by+13,60,9);
  c.fillStyle='#6b3e1e';c.fillRect(bx+31,by+14,58,7);
  c.fillStyle='#e2e8f0';c.fillRect(bx+40,by+16,6,3);c.fillRect(bx+58,by+15,6,3);c.fillRect(bx+74,by+16,6,3);
  // Swivel chairs around table
  c.fillStyle='#475569';
  [34,48,62,76].forEach(cx=>{c.fillRect(bx+cx,by+9,8,3.5);c.fillRect(bx+cx,by+22.5,8,3.5);});
  // Illuminated wall star-map display on right
  c.fillStyle='#082f49';c.fillRect(bx+95,by+7,28,15);c.strokeStyle='#38bdf8';c.strokeRect(bx+95,by+7,28,15);
  c.fillStyle='#38bdf8';c.beginPath();c.arc(bx+109,by+14,4.5,0,Math.PI*2);c.stroke();
  c.fillStyle='rgba(7,12,20,0.82)';c.fillRect(bx+26,by+CH-13,bw-32,8);
  c.fillStyle='#e2e8f0';c.font='bold 6px monospace';c.textAlign='center';
  c.fillText('🗺 BESPRECHUNG (SG-1)',bx+bw/2+8,by+CH-7);
 }
 // Level 28 Equipment & MALP Staging Bay (cols 4..5)
 {
  const sy=GRID_Y+27*CH,sx=GRID_X+4*CW,sw=2*CW;
  const sg=c.createLinearGradient(sx,sy+4,sx,sy+CH-5);
  sg.addColorStop(0,'#111822');sg.addColorStop(1,'#1e293b');
  c.fillStyle=sg;c.fillRect(sx+3,sy+4,sw-6,CH-9);
  c.strokeStyle='#64748b';c.lineWidth=1;c.strokeRect(sx+3,sy+4,sw-6,CH-9);
  // Detailed 6-wheel MALP Telemetry Rover with camera mast, dish & robotic arm
  c.fillStyle='#0f172a';c.fillRect(sx+16,sy+22,34,4); // 6-wheel bogie
  [19,29,39].forEach(wx=>{c.fillStyle='#475569';c.beginPath();c.arc(sx+wx,sy+24,2.2,0,Math.PI*2);c.fill();});
  c.fillStyle='#64748b';c.fillRect(sx+18,sy+15,28,7); // Chassis
  c.strokeStyle='#94a3b8';c.lineWidth=1.2;
  c.beginPath();c.moveTo(sx+36,sy+15);c.lineTo(sx+36,sy+8);c.lineTo(sx+43,sy+10);c.stroke(); // Mast & Arm
  c.fillStyle='#38bdf8';c.fillRect(sx+34,sy+7,5,3); // Video sensor head
  // Naquadah-lined offworld supply crates & UAV drone wing
  c.fillStyle='#78350f';c.fillRect(sx+64,sy+13,16,12);c.strokeStyle='#b45309';c.strokeRect(sx+64,sy+13,16,12);
  c.fillStyle='#365314';c.fillRect(sx+84,sy+15,18,10);c.strokeStyle='#65a30d';c.strokeRect(sx+84,sy+15,18,10);
  c.fillStyle='rgba(7,12,20,0.82)';c.fillRect(sx+8,sy+CH-13,sw-16,8);
  c.fillStyle='#cbd5e1';c.font='bold 6px monospace';c.textAlign='center';
  c.fillText('🚜 MALP & AUSRÜSTUNG',sx+sw/2,sy+CH-7);
 }
 // Level 27 Commander's Office (Hammond / Weir / Landry) + Clipboard Hotspot (cols 4..5)
 {
  const cmd=(typeof COMMANDERS!=='undefined'&&COMMANDERS[S.commander])||COMMANDERS.hammond;
  const ly=GRID_Y+26*CH,ox=GRID_X+4*CW,ow=2*CW;
  const og=c.createLinearGradient(ox,ly+4,ox,ly+CH-5);
  og.addColorStop(0,'#261c14');og.addColorStop(1,'#3b2a1d');
  c.fillStyle=og;c.fillRect(ox+3,ly+4,ow-6,CH-9);
  c.strokeStyle='#e8b040';c.lineWidth=1.5;c.strokeRect(ox+3,ly+4,ow-6,CH-9);
  // US Air Force Flag & SGC Seal on back wall
  c.fillStyle='#1d4ed8';c.fillRect(ox+12,ly+8,5,16);
  c.strokeStyle='#eab308';c.lineWidth=1;c.beginPath();c.arc(ox+88,ly+15,6,0,Math.PI*2);c.stroke();
  // Commander behind executive desk with Red Phone & interactive Clipboard
  if(typeof drawSoldier==='function'){
   drawSoldier(c,ox+42,ly+25,0.34,{skin:'#f1c27d',color:cmd?cmd.color:'#3b5a6f',cls:'diplomat'},0,1);
  }
  c.fillStyle='#5c3a1e';c.fillRect(ox+22,ly+19,44,8); // Mahogany Desk
  c.fillStyle='#eab308';c.fillRect(ox+26,ly+16,9,4); // Interactive Clipboard
  c.fillStyle='#ef4444';c.fillRect(ox+52,ly+16,8,4); // Iconic Red President Phone
  c.fillStyle='rgba(15,10,6,0.82)';c.fillRect(ox+8,ly+CH-13,ow-16,8);
  c.fillStyle='#f3d27a';c.font='bold 6px monospace';c.textAlign='center';
  c.fillText('📋 BÜRO: '+(cmd?cmd.name.toUpperCase().slice(0,16):'GEN. HAMMOND'),ox+ow/2,ly+CH-7);
 }
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
   armory:   ['│ [WAFFENREGAL: P90 / M16 / ZAT / RÜST.] │','│  ╠══╦══╦══╣    ╠══╦══╦══╣  [WERKBANK]  │','│  ║🔫║⚡║🛡║    ║🔫║⚡║🛡║  ┌────────┐  │','│  ╩══╩══╩══╩    ╩══╩══╩══╩  └────────┘  │'],
   workshop: ['│ [NAQUADAH-SCHMIEDE]   [PLASMA-BRENNER] │','│  ╔══════════╗   ✶✶✶   ┌──────────────┐ │','│  ║ AMBOSS   ║ ══╦══╦═ │ MALP-CHASSIS │ │','│  ╚══════════╝   ╩  ╩  └──────────────┘ │'],
   storage:  ['│ [HOCHREGAL A: ERZ] [REGAL B: ARTEFAKTE]│','│  ┌──┬──┬──┐        ┌──┬──┬──┐  [KRAN]  │','│  │⛏│⛏│⚙│        │✚│🛡│🔫│   ══╦══  │','│  └──┴──┴──┘        └──┴──┴──┘     ╨    │']
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
 }else if(room.type==='lab'){
  c.fillStyle='#16394a';c.fillRect(22,32,76,42);c.strokeStyle='#38bdf8';c.strokeRect(22,32,76,42);
  const pulse=0.5+0.5*Math.sin(now/300);
  c.fillStyle=`rgba(56,189,248,${0.3+0.4*pulse})`;c.beginPath();c.arc(60,53,13,0,Math.PI*2);c.fill();
  c.fillStyle='#4b5563';c.fillRect(130,58,110,20);
  c.fillStyle='#eab308';c.fillRect(155,48,14,10);
 }else if(room.type==='workshop'){
  // Naquadah-Werkstatt: Plasma-Schmiede, Schweißroboter, Funkenflug & Werkbank
  c.fillStyle='#1e293b';c.fillRect(16,30,86,52);c.strokeStyle='#f59e0b';c.strokeRect(16,30,86,52);
  const glow=0.5+0.5*Math.sin(now/120);
  c.fillStyle=`rgba(249,115,22,${0.35+0.45*glow})`;c.fillRect(26,48,66,18);
  c.fillStyle='#fef08a';c.beginPath();c.arc(58,52,5+glow*4,0,Math.PI*2);c.fill();
  c.fillStyle='#334155';c.fillRect(120,54,148,28);c.strokeStyle='#64748b';c.strokeRect(120,54,148,28);
  c.fillStyle='#0284c7';c.fillRect(130,36,52,16);c.strokeStyle='#38bdf8';c.strokeRect(130,36,52,16);
  c.fillStyle='#eab308';c.fillRect(198,44,24,9);c.fillRect(230,42,18,11);
 }else if(room.type==='medbay'){
  [24,114,204].forEach(bx=>{
   c.fillStyle='#334155';c.fillRect(bx,64,62,16);
   c.fillStyle='#e2e8f0';c.fillRect(bx+4,58,54,7);
   c.fillStyle='#ef4444';c.fillRect(bx+26,36,8,14);c.fillRect(bx+22,40,16,6);
  });
 }else if(room.type==='armory'){
  for(let rx=16;rx<190;rx+=58){
   c.fillStyle='#0f172a';c.fillRect(rx,26,48,54);c.strokeStyle='#38bdf8';c.strokeRect(rx,26,48,54);
   c.fillStyle='#eab308';c.fillRect(rx+7,35,34,4);
   c.fillStyle='#38bdf8';c.fillRect(rx+7,47,30,4);
   c.fillStyle='#a855f7';c.fillRect(rx+7,59,34,4);
  }
  [204,242].forEach((ax,i)=>{
   c.fillStyle=i===0?'#38bdf8':'#f59e0b';c.fillRect(ax,36,22,24);
   c.strokeStyle='#e2e8f0';c.strokeRect(ax,36,22,24);
   c.fillStyle='#475569';c.fillRect(ax+7,60,8,20);
  });
 }else if(room.type==='storage'){
  c.strokeStyle='#eab308';c.lineWidth=2;c.beginPath();c.moveTo(10,24);c.lineTo(W-10,24);c.stroke();
  [20,108,196].forEach((sx,idx)=>{
   c.fillStyle='#1e293b';c.fillRect(sx,30,72,54);c.strokeStyle='#475569';c.lineWidth=1;c.strokeRect(sx,30,72,54);
   c.fillStyle='#475569';c.fillRect(sx,56,72,3);
   c.fillStyle=idx===0?'#d97706':idx===1?'#0284c7':'#16a34a';
   c.fillRect(sx+6,36,26,18);c.fillRect(sx+38,36,26,18);
   c.fillRect(sx+6,62,26,18);c.fillRect(sx+38,62,26,18);
  });
 }else if(room.type==='gate'){
  if(typeof getGfxMode==='function'&&getGfxMode()==='webgl3d'&&typeof GL3D!=='undefined'&&typeof GL3D.renderStargateCard==='function'){
   GL3D.renderStargateCard(cv,now);
  }else{
   // Deep blast-silo ribs & control-room observation window on right
   c.fillStyle='rgba(56,189,248,0.16)';c.fillRect(W-48,26,38,32);
   c.strokeStyle='#0284c7';c.strokeRect(W-48,26,38,32);
   c.fillStyle='#334155';c.beginPath();c.arc(W/2,58,38,0,Math.PI*2);c.fill();
   c.strokeStyle='#64748b';c.lineWidth=4;c.beginPath();c.arc(W/2,58,35,0,Math.PI*2);c.stroke();
   for(let i=0;i<9;i++){
    const a=i*(Math.PI*2/9)-Math.PI/2,cx=W/2+Math.cos(a)*35,cy=58+Math.sin(a)*35;
    c.fillStyle='#ea580c';c.fillRect(cx-2.5,cy-2.5,5,5);
    c.fillStyle='#fef08a';c.fillRect(cx-1.2,cy-1.2,2.4,2.4);
   }
   const rip=Math.sin(now/240)*2;
   const eg=c.createRadialGradient(W/2+rip,58,2,W/2,58,29);
   eg.addColorStop(0,'#fff');eg.addColorStop(0.35,'#7dd3fc');eg.addColorStop(0.8,'#0284c7');eg.addColorStop(1,'#082f49');
   c.fillStyle=eg;c.beginPath();c.arc(W/2,58,29,0,Math.PI*2);c.fill();
   c.fillStyle='#475569';c.beginPath();c.moveTo(W/2-26,80);c.lineTo(W/2+26,80);c.lineTo(W/2+44,106);c.lineTo(W/2-44,106);c.closePath();c.fill();
   c.fillStyle='#eab308';c.fillRect(W/2-42,104,84,2.5);
  }
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
 // Level 28 & 27 cols 0..1: Gateroom click -> opens Star Map
 if(gx>=0&&gx<=1&&(gy===26||gy===27)){
  if(typeof setTab==='function')setTab('map');
  if(typeof note==='function')note(I18N.T('game.dyn.base.gate_click')||'Torraum: Sternenkarte für Wurmloch-Anwahl geöffnet.');
  return;
 }
 // Level 28 cols 2..3: Kontrollraum click -> Walter Harriman
 if(gx>=2&&gx<=3&&gy===27){
  if(typeof sfx==='function')sfx('gate');
  if(typeof note==='function')note(I18N.T('game.dyn.base.walter_quote')||'Chief Walter Harriman: „Chevron 7 verriegelt! Wurmloch etabliert, Iris bleibt offen.“');
  return;
 }
 // Level 27 cols 2..3: Besprechungsraum click -> Briefing
 if(gx>=2&&gx<=3&&gy===26){
  if(typeof setTab==='function')setTab('map');
  if(typeof note==='function')note(I18N.T('game.dyn.base.briefing_click')||'Besprechungsraum: Einsatzbesprechung für SG-1 aktiv.');
  return;
 }
 // Level 27 cols 4..5: General's Office / Clipboard hotspot
 if(gy===26&&gx>=4&&gx<=5&&typeof showClipboardModal==='function'){
  showClipboardModal();return;
 }
 // Level 28 cols 4..5: MALP & Ausrüstung -> opens Armory / Workshop / Storage window
 if(gy===27&&gx>=4&&gx<=5){
  if(typeof note==='function')note('MALP & Ausrüstung: Staging-Bereich & Waffenkammer geöffnet.');
  if(typeof showArmoryModal==='function')showArmoryModal('armory');
  return;
 }
 const clickedRoomId=S.base.grid[y*COLS+x]||null;
 B.selRoom=clickedRoomId;
 renderAll();
 if(clickedRoomId&&S.base.rooms[clickedRoomId]){
  const rt=S.base.rooms[clickedRoomId].type;
  if((rt==='armory'||rt==='workshop'||rt==='storage')&&typeof showArmoryModal==='function'){
   showArmoryModal(rt);
  }else if(rt==='lab'&&typeof showResearchModal==='function'){
   showResearchModal();
  }else if(rt==='medbay'&&typeof setTab==='function'){
   setTab('medbay');
  }
 }
}
