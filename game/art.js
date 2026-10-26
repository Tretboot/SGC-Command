'use strict';
// ===================== Grafik: alles prozedural, keine externen Assets =====================
const LOOKS={
 "Jack O'Neill":{skin:'#e3b48e',hair:'#a8a8a8',style:'short'},
 'Samantha Carter':{skin:'#f0c8a4',hair:'#e8c860',style:'bob'},
 'Daniel Jackson':{skin:'#e8bc98',hair:'#6a4a2a',style:'short',glasses:true},
 "Teal'c":{skin:'#6b4529',hair:null,style:'bald',mark:true},
 'Teyla Emmagan':{skin:'#d9a07a',hair:'#5a3220',style:'ponytail'},
 'Cameron Mitchell':{skin:'#e6b490',hair:'#3a2a1a',style:'short'},
 'Vala Mal Doran':{skin:'#e2ad88',hair:'#241812',style:'long'},
 'Ronon Dex':{skin:'#7a5232',hair:'#1a1210',style:'dreads'},
 'John Sheppard':{skin:'#e3b48e',hair:'#2a2018',style:'messy'},
 'Dr. Janet Fraiser':{skin:'#ecd0b0',hair:'#6b3a24',style:'short'},
 'Dr. Carolyn Lam':{skin:'#e8be96',hair:'#1a1816',style:'bob'},
 'Dr. Beale':{skin:'#e0aa84',hair:'#3a3a3a',style:'fringe',glasses:true},
 'Eli Wallace':{skin:'#e6b894',hair:'#2a1c14',style:'curly',glasses:true},
 "Ba'al":{skin:'#d9a882',hair:'#1c1814',style:'slick',goatee:true},
 'General Hammond':{skin:'#e8bc9a',hair:'#d8d8d8',style:'fringe',stars:true},
 'Major West':{skin:'#d8a47c',hair:'#4a3020',style:'short'},
 'Apophis (Ra)':{skin:'#c8a060',hair:null,style:'bald',crown:true,glow:true},
};
const UNI={leader:['#5d6b3c','#8a9a5a'],fighter:['#3d4a2b','#6a7a4a'],scientist:['#4a6a90','#86a6c8'],medic:['#cfd6da','#c0392b'],engineer:['#8a6a38','#c8a050']};
const lookOf=m=>LOOKS[m.name]||{skin:'#e0b090',hair:'#444',style:'short'};
const _pc={};
function px(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
function drawFace(c,m,lk){
 const u=UNI[m.cls]||UNI.leader;
 px(c,0,0,32,32,'#14202e');px(c,0,0,32,10,'#1b2b3d');
 px(c,4,24,24,8,u[0]);px(c,12,24,8,3,lk.skin);px(c,4,24,24,1,u[1]);
 if(m.cls==='medic')px(c,5,28,4,1,'#c0392b'),px(c,6,27,2,3,'#c0392b');
 if(lk.stars){px(c,5,25,3,1,'#f2c230');px(c,24,25,3,1,'#f2c230');px(c,5,27,3,1,'#f2c230');px(c,24,27,3,1,'#f2c230');}
 px(c,13,20,6,5,shade(lk.skin,-25));
 px(c,10,6,12,1,lk.skin);px(c,9,7,14,14,lk.skin);px(c,10,21,12,1,lk.skin);
 const H=lk.hair;
 switch(lk.style){
  case 'short':px(c,9,5,14,4,H);px(c,8,7,1,5,H);px(c,23,7,1,5,H);break;
  case 'bob':px(c,8,4,16,5,H);px(c,7,7,3,12,H);px(c,22,7,3,12,H);break;
  case 'long':px(c,8,4,16,5,H);px(c,6,7,4,19,H);px(c,22,7,4,19,H);break;
  case 'ponytail':px(c,9,4,14,5,H);px(c,23,7,3,6,H);px(c,25,12,2,10,H);break;
  case 'curly':px(c,7,3,18,6,H);px(c,8,2,4,2,H);px(c,14,1,5,3,H);px(c,20,2,4,2,H);px(c,7,8,2,4,H);px(c,23,8,2,4,H);break;
  case 'dreads':px(c,8,4,16,5,H);for(const x of [6,8,22,24]){px(c,x,7,2,19,H);}px(c,10,3,3,2,H);px(c,19,3,3,2,H);break;
  case 'slick':px(c,9,4,14,4,H);px(c,12,5,6,1,shade(H,40));break;
  case 'fringe':px(c,8,9,2,6,H);px(c,22,9,2,6,H);px(c,10,6,12,1,shade(lk.skin,-10));break;
  case 'messy':px(c,9,4,14,5,H);px(c,10,2,3,2,H);px(c,16,2,4,2,H);px(c,21,3,3,3,H);px(c,8,7,1,4,H);break;
 }
 const eye=lk.glow?'#ffd23a':'#1a1a1a';
 px(c,12,13,3,2,'#f4f4f4');px(c,18,13,3,2,'#f4f4f4');px(c,13,13,2,2,eye);px(c,19,13,2,2,eye);
 px(c,12,11,3,1,H||shade(lk.skin,-50));px(c,18,11,3,1,H||shade(lk.skin,-50));
 px(c,15,15,2,3,shade(lk.skin,-18));px(c,14,18,5,1,shade(lk.skin,-55));
 if(lk.glasses){c.strokeStyle='#1a1a1a';c.lineWidth=1;c.strokeRect(11.5,12.5,4,3);c.strokeRect(17.5,12.5,4,3);px(c,15,13,2,1,'#1a1a1a');}
 if(lk.goatee)px(c,14,19,5,3,H);
 if(lk.mark)px(c,15,8,2,3,typeof lk.mark==='string'?lk.mark:'#e8c040');
 if(lk.band){px(c,8,5,16,2,'#e8c040');px(c,15,4,2,2,'#c03030');}
 if(lk.crown){px(c,8,3,16,4,'#e8c040');px(c,9,1,2,2,'#e8c040');px(c,15,0,2,3,'#e8c040');px(c,21,1,2,2,'#e8c040');px(c,15,4,2,2,'#c03030');}
}
function shade(hex,d){const n=parseInt(hex.slice(1),16);let r=(n>>16)+d,g=((n>>8)&255)+d,b=(n&255)+d;
 r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
function portrait(m){
 if(_pc[m.name])return _pc[m.name];
 const cv=document.createElement('canvas');cv.width=32;cv.height=32;
 drawFace(cv.getContext('2d'),m,lookOf(m));
 return _pc[m.name]=cv.toDataURL();}
// Ganzkörper-Soldat (Gateroom)
function drawSoldier(c,x,y,sc,m,walk,alpha){
 const lk=lookOf(m),u=UNI[m.cls]||UNI.leader,sw=Math.sin(walk)*3*sc;
 c.save();c.globalAlpha=alpha;
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x,y,9*sc,3*sc,0,0,7);c.fill();
 c.fillStyle='#2a2a2a';c.fillRect(x-5*sc,y-12*sc+sw*0.3,4*sc,12*sc-sw*0.3);c.fillRect(x+1*sc,y-12*sc-sw*0.3,4*sc,12*sc+sw*0.3);
 c.fillStyle=u[0];c.fillRect(x-6*sc,y-26*sc,12*sc,15*sc);c.fillStyle=u[1];c.fillRect(x-6*sc,y-26*sc,12*sc,2*sc);
 c.fillStyle=shade(u[0],-20);c.fillRect(x-9*sc,y-25*sc,3*sc,11*sc);c.fillRect(x+6*sc,y-25*sc,3*sc,11*sc);
 c.fillStyle='#161616';c.fillRect(x+2*sc,y-20*sc,12*sc,3*sc);c.fillRect(x+9*sc,y-20*sc,3*sc,6*sc); // P90
 c.fillStyle=lk.skin;c.beginPath();c.arc(x,y-31*sc,5.5*sc,0,7);c.fill();
 if(lk.hair){c.fillStyle=lk.hair;c.beginPath();c.arc(x,y-33*sc,5.6*sc,3.3,6.1);c.fill();
  if(lk.style==='long'||lk.style==='bob'||lk.style==='dreads')c.fillRect(x-6*sc,y-33*sc,2*sc,9*sc),c.fillRect(x+4*sc,y-33*sc,2*sc,9*sc);}
 if(lk.crown){c.fillStyle='#e8c040';c.fillRect(x-5*sc,y-38*sc,10*sc,3*sc);}
 c.restore();}
// ===================== Gateroom =====================
const GR={phase:'idle',t0:0,label:'',sub:'',names:[],chev:0,walkers:[],cb:null,flash:0,isCollapse:false};
function playGate(dials,deploys,cb,isCollapse=false){
 if(!dials.length&&!deploys.length){if(cb)cb();return;}
 const first=dials[0]||(deploys[0]&&deploys[0].planet);
 GR.phase='dial';GR.t0=performance.now();GR.cb=cb;GR.isCollapse=isCollapse;
 GR.label=first?PLANETS[first].name:'Orbit';GR.sub=dials.length>1?`+${dials.length-1} weitere Verbindung(en)`:'';
 GR.walkers=[];deploys.forEach((d,ti)=>d.members.forEach((id,k)=>GR.walkers.push({id,x:300+ti*0+k*34,row:ti})));
 if(!dials.length)GR.phase='open',GR.t0=performance.now();}
function skipGate(){
 const ov=typeof document!=='undefined'&&document.getElementById('gate-overlay');
 if(ov)ov.style.display='none';
 if(GR.phase!=='idle'){
  GR.phase='idle';
  const cb=GR.cb;GR.cb=null;
  if(cb){
   try{cb();}catch(err){console.error('[GATE] skip callback error:',err);}
  }
 }
}
function gateTick(now){
 if(GR.phase==='idle')return;const t=(now-GR.t0)/1000;
 if(GR.phase==='dial'){
  GR.chev=Math.min(7,Math.floor(t/0.32));
  if(t>2.3){GR.phase='open';GR.t0=now;GR.flash=1;}
 }
 else if(GR.phase==='open'){
  if(t>2.8){
   GR.phase=GR.isCollapse?'close':'transit';
   GR.t0=now;
   if(GR.phase==='transit'&&typeof SFX!=='undefined'&&typeof SFX.wormhole==='function'){
    SFX.wormhole();
   }
  }
 }
 else if(GR.phase==='close'||GR.phase==='transit'){
  const dur=(GR.phase==='transit')?4.0:0.65;
  if(t>dur){
   GR.phase='idle';
   const ov=typeof document!=='undefined'&&document.getElementById('gate-overlay');
   if(ov)ov.style.display='none';
   const cb=GR.cb;GR.cb=null;
   if(cb){
    try{cb();}catch(err){console.error('[GATE] callback error:',err);}
   }
  }
 }
}

// ===================== Hyperspace Wormhole Subspace Tunnel =====================
const WORMHOLE_PARTICLES = Array.from({length: 50}, (_, i) => ({
 x: (Math.random() - 0.5) * 800,
 y: (Math.random() - 0.5) * 500,
 z: 1 + Math.random() * 16,
 speed: 4.5 + Math.random() * 4.0,
 char: ['·', '✦', '°', '★', '¤', '*'][i % 6]
}));
const WORMHOLE_ASCII = ['≈', '░', '▒', '·', '✦', '¤', '⌬', '※', '§', '✶', '~', '≈'];

function drawWormholeTunnel(c, W, Ht, now, elapsed, planetLabel){
 const cx = W / 2, cy = Ht / 2;
 // 1. Deep Subspace Cosmic Void Background
 const bg = c.createRadialGradient(cx, cy, 10, cx, cy, 480);
 bg.addColorStop(0, '#0a192f');
 bg.addColorStop(0.45, '#031226');
 bg.addColorStop(1, '#01050d');
 c.fillStyle = bg;
 c.fillRect(0, 0, W, Ht);

 // Undulation curve helper: snake-like winding tunnel
 const undulate = (z) => ({
  x: Math.sin(now * 0.0028 + z * 0.32) * (26 + (16 - Math.min(16, z)) * 4.2),
  y: Math.cos(now * 0.0022 + z * 0.28) * (18 + (16 - Math.min(16, z)) * 3.0)
 });

 // 2. Streaming Subspace Chrono-Particles (rushing past camera)
 c.font = '12px monospace';
 c.textAlign = 'center';
 c.textBaseline = 'middle';
 for(let i = 0; i < WORMHOLE_PARTICLES.length; i++){
  const p = WORMHOLE_PARTICLES[i];
  p.z -= p.speed * 0.06;
  if(p.z <= 0.4){
   p.z = 16;
   p.x = (Math.random() - 0.5) * 800;
   p.y = (Math.random() - 0.5) * 500;
  }
  const u = undulate(p.z);
  const k = 220 / p.z;
  const sx = cx + u.x + p.x * (k * 0.006);
  const sy = cy + u.y + p.y * (k * 0.006);
  if(sx >= 0 && sx < W && sy >= 0 && sy < Ht){
   const alpha = Math.min(1, Math.max(0.1, (16 - p.z) / 14));
   c.fillStyle = `rgba(186, 230, 253, ${alpha * 0.85})`;
   c.fillText(p.char, sx, sy);
  }
 }

 // 3. Ring calculation for 18 perspective slices
 const numRings = 18;
 const ringData = [];
 const speedOffset = (now * 0.0035) % 1.0;

 for(let i = numRings; i >= 1; i--){
  const z = i - speedOffset;
  if(z <= 0.2) continue;
  const u = undulate(z);
  const r = 560 / (z + 0.4);
  const rx = cx + u.x;
  const ry = cy + u.y;
  ringData.push({ z, rx, ry, r, i });
 }

 // 4. Longitudinal Warp Streamlines (6 glowing energy conduits connecting rings)
 for(let rib = 0; rib < 6; rib++){
  const angle = (rib / 6) * Math.PI * 2 + now * 0.0008;
  c.beginPath();
  let first = true;
  for(let j = 0; j < ringData.length; j++){
   const rd = ringData[j];
   const px = rd.rx + Math.cos(angle + rd.z * 0.15) * rd.r;
   const py = rd.ry + Math.sin(angle + rd.z * 0.15) * (rd.r * 0.72);
   if(first){ c.moveTo(px, py); first = false; }
   else { c.lineTo(px, py); }
  }
  c.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  c.lineWidth = 1.5;
  c.stroke();
 }

 // 5. Render Perspective Concentric Rings & ASCII Perimeter Glyphs
 for(let j = 0; j < ringData.length; j++){
  const rd = ringData[j];
  const alpha = Math.min(0.9, Math.max(0.08, (16 - rd.z) / 13));
  const rX = rd.r;
  const rY = rd.r * 0.72;

  // Outer glowing elliptical ring
  c.strokeStyle = `rgba(14, 165, 233, ${alpha * 0.65})`;
  c.lineWidth = Math.max(1, 4.5 / rd.z);
  c.beginPath();
  c.ellipse(rd.rx, rd.ry, rX, rY, 0, 0, Math.PI * 2);
  c.stroke();

  // Core white-hot plasma line
  c.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.45})`;
  c.lineWidth = Math.max(1, 1.8 / rd.z);
  c.stroke();

  // ASCII Characters orbiting around each ring
  if(rd.z > 0.8 && rd.z < 13){
   const numChars = Math.min(24, Math.max(8, Math.floor(rd.r / 16)));
   const spin = now * 0.001 * (rd.i % 2 ? 1 : -1);
   c.font = `${Math.max(9, Math.floor(22 / rd.z))}px monospace`;
   for(let k = 0; k < numChars; k++){
    const a = (k / numChars) * Math.PI * 2 + spin;
    const gx = rd.rx + Math.cos(a) * rX;
    const gy = rd.ry + Math.sin(a) * rY;
    const ch = WORMHOLE_ASCII[(k + rd.i) % WORMHOLE_ASCII.length];
    c.fillStyle = `rgba(125, 211, 252, ${alpha * 0.8})`;
    c.fillText(ch, gx, gy);
   }
  }
 }

 // 6. Distant Exit Event Horizon Singularity (Destination Gate)
 if(ringData.length > 0){
  const deep = ringData[0];
  const exitG = c.createRadialGradient(deep.rx, deep.ry, 2, deep.rx, deep.ry, 70);
  exitG.addColorStop(0, '#ffffff');
  exitG.addColorStop(0.25, '#7dd3fc');
  exitG.addColorStop(0.6, 'rgba(14, 165, 233, 0.4)');
  exitG.addColorStop(1, 'rgba(14, 165, 233, 0)');
  c.fillStyle = exitG;
  c.beginPath();
  c.arc(deep.rx, deep.ry, 70, 0, Math.PI * 2);
  c.fill();
 }

 // 7. Wormhole Transit Tactical HUD
 c.fillStyle = 'rgba(2, 6, 23, 0.78)';
 c.fillRect(0, 0, W, 42);
 c.fillStyle = '#38bdf8';
 c.font = 'bold 15px monospace';
 c.textAlign = 'left';
 c.fillText(`◎ SUBRAUM-WURMLOCH TRANSIT · ZIEL: ${(planetLabel || 'UNBEKANNT').toUpperCase()}`, 18, 26);

 const rem = Math.max(0, 4.0 - elapsed).toFixed(1);
 c.fillStyle = '#94a3b8';
 c.font = '12px monospace';
 c.textAlign = 'right';
 c.fillText(`ETA: ${rem}s · CHRONO-VEKTOR: STABIL`, W - 18, 26);

 // Bottom Status Ribbon
 c.fillStyle = 'rgba(2, 6, 23, 0.78)';
 c.fillRect(0, Ht - 36, W, 36);
 c.fillStyle = '#e2e8f0';
 c.font = '12px monospace';
 c.textAlign = 'left';
 c.fillText(`SG-1 PASSIERT DEN SUBRAUM-KORRIDOR NACH ${(planetLabel || 'UNBEKANNT').toUpperCase()} …`, 18, Ht - 14);

 c.fillStyle = '#38bdf8';
 c.font = 'bold 12px monospace';
 c.textAlign = 'right';
 c.fillText('▶ Klick / Leertaste / ESC: Überspringen', W - 18, Ht - 14);
}

function drawGateroom(cv,now,state){
 const c=cv.getContext('2d'),W=cv.width,Ht=cv.height,cx=W/2,cy=250,Rr=165;gateTick(now);
 if(GR.phase==='transit'){
  drawWormholeTunnel(c,W,Ht,now,(now-GR.t0)/1000,GR.label);
  return;
 }
 // Wand
 let g=c.createLinearGradient(0,0,0,Ht);g.addColorStop(0,'#10151c');g.addColorStop(.7,'#1b222c');g.addColorStop(1,'#0d1117');c.fillStyle=g;c.fillRect(0,0,W,Ht);
 c.strokeStyle='rgba(120,140,160,.12)';c.lineWidth=2;for(let x=0;x<W;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x,430);c.stroke();}
 for(let y=60;y<430;y+=110){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
 // Deckenlampen
 for(const x of [120,340,620,840]){const f=0.8+0.2*Math.sin(now/700+x);c.fillStyle=`rgba(255,240,200,${.7*f})`;c.fillRect(x-30,8,60,8);
  const lg=c.createRadialGradient(x,16,2,x,16,160);lg.addColorStop(0,`rgba(255,235,190,${.18*f})`);lg.addColorStop(1,'rgba(255,235,190,0)');c.fillStyle=lg;c.fillRect(x-160,0,320,200);}
 // Kontrollraum-Fenster
 c.fillStyle='#07090d';c.fillRect(690,52,230,96);c.strokeStyle='#4a5868';c.lineWidth=4;c.strokeRect(690,52,230,96);
 c.fillStyle='rgba(80,160,220,.18)';c.fillRect(694,56,222,88);
 for(let i=0;i<3;i++){const bx=720+i*68;c.fillStyle='#1a2330';c.fillRect(bx,116,48,26);c.fillStyle='#0a0e14';c.beginPath();c.arc(bx+24,100,9,0,7);c.fill();c.fillRect(bx+14,108,20,10);
  c.fillStyle=(Math.sin(now/400+i*2)>0)?'#5fe08a':'#2a6a40';c.fillRect(bx+4,120,6,3);c.fillStyle='#7ac8ff';c.fillRect(bx+14,121,20,2);}
 c.fillStyle='#8aa0b4';c.font='12px monospace';c.fillText('KONTROLLRAUM',698,46);
 // Boden + Rampe
 c.fillStyle='#232b36';c.fillRect(0,430,W,Ht-430);c.strokeStyle='rgba(255,255,255,.06)';
 for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(cx+i*40,430);c.lineTo(cx+i*140,Ht);c.stroke();}
 c.fillStyle='#2e3846';c.beginPath();c.moveTo(cx-90,Rr+cy-10);c.lineTo(cx+90,Rr+cy-10);c.lineTo(cx+190,Ht);c.lineTo(cx-190,Ht);c.closePath();c.fill();
 c.strokeStyle='rgba(255,255,255,.12)';for(let i=1;i<6;i++){const yy=Rr+cy-10+i*(Ht-(Rr+cy-10))/6;c.beginPath();c.moveTo(cx-90-i*17,yy);c.lineTo(cx+90+i*17,yy);c.stroke();}
 // Gate
 const open=GR.phase==='open'||GR.phase==='close'||GR.phase==='transit';
 if(open){
  const k=GR.phase==='close'?Math.max(0,1-(now-GR.t0)/650):GR.phase==='transit'?Math.min(2.5,1+(now-GR.t0)/300):1;
  const gl=c.createRadialGradient(cx,cy,10,cx,cy,Rr*(GR.phase==='transit'?3.0:1.7));
  gl.addColorStop(0,`rgba(90,190,255,${Math.min(0.85,.35*k)})`);
  gl.addColorStop(1,'rgba(90,190,255,0)');
  c.fillStyle=gl;c.fillRect(0,0,W,Ht);
 }
 c.save();c.translate(cx,cy);
 // Ereignishorizont
 if(open){
  const el=(now-GR.t0)/1000;
  const k=GR.phase==='close'?Math.max(0,1-el/0.65):1;
  const grow=GR.phase==='open'?Math.min(1,el/0.45):GR.phase==='transit'?Math.min(2.8,1+el*2):k;
  const eg=c.createRadialGradient(0,0,0,0,0,Rr-18);
  eg.addColorStop(0,'#bfeaff');eg.addColorStop(.6,'#4aa8f0');eg.addColorStop(1,'#1e5fbf');
  c.fillStyle=eg;c.beginPath();c.arc(0,0,(Rr-18)*grow,0,7);c.fill();
  for(let i=0;i<6;i++){
   c.strokeStyle=`rgba(255,255,255,${.25*k})`;c.lineWidth=2;c.beginPath();
   c.arc(0,0,((now/18+i*26)%(Rr-20))*grow,0,7);c.stroke();
  }
  if(GR.phase==='open'&&el<0.45){
   const kw=1-el/0.45;c.fillStyle=`rgba(210,240,255,${.7*kw})`;c.beginPath();c.arc(0,0,(Rr+60)*(1-kw*.5),0,7);c.fill();
  }
  if(GR.phase==='transit'){
   // Warp vortex flash as team steps through
   const wf=Math.min(1,el/0.5);
   c.fillStyle=`rgba(200,240,255,${.35*wf})`;c.beginPath();c.arc(0,0,(Rr+100)*wf,0,7);c.fill();
  }
 }else{c.fillStyle='#090c11';c.beginPath();c.arc(0,0,Rr-18,0,7);c.fill();}
 // Ring
 const spin=GR.phase==='dial'?(now-GR.t0)/900*(GR.chev%2?1:-1)*0.6:0;
 c.lineWidth=30;c.strokeStyle='#3a4452';c.beginPath();c.arc(0,0,Rr,0,7);c.stroke();
 c.lineWidth=2;c.strokeStyle='#6b7888';c.beginPath();c.arc(0,0,Rr-14,0,7);c.stroke();c.beginPath();c.arc(0,0,Rr+14,0,7);c.stroke();
 c.save();c.rotate(spin);c.fillStyle='#8fa0b4';
 for(let i=0;i<39;i++){const a=i/39*Math.PI*2;c.save();c.rotate(a);c.fillRect(-2,-Rr-6,4,10);c.restore();}c.restore();
 // Chevrons
 const lit=GR.phase==='dial'?GR.chev:open?7:0;
 for(let i=0;i<9;i++){const a=-Math.PI/2+i/9*Math.PI*2+0;c.save();c.rotate(a+Math.PI/2);
  const on=i<lit||(i===8&&open),col=on?'#ff8a1f':'#2a2018';
  c.fillStyle=col;c.beginPath();c.moveTo(-14,-Rr-16);c.lineTo(14,-Rr-16);c.lineTo(9,-Rr+8);c.lineTo(-9,-Rr+8);c.closePath();c.fill();
  if(on){c.shadowColor='#ff8a1f';c.shadowBlur=18;c.fill();c.shadowBlur=0;}
  c.strokeStyle='#0a0a0a';c.lineWidth=2;c.stroke();c.restore();}
 c.restore();
 // DHD
 c.fillStyle='#2b2f38';c.beginPath();c.moveTo(150,470);c.lineTo(250,470);c.lineTo(235,520);c.lineTo(165,520);c.closePath();c.fill();
 c.fillStyle='#3a404c';c.beginPath();c.ellipse(200,455,60,22,0,0,7);c.fill();
 const dg=GR.phase==='dial'?1:.4+.2*Math.sin(now/500);c.fillStyle=`rgba(255,60,40,${dg})`;c.beginPath();c.ellipse(200,448,22,10,0,0,7);c.fill();
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;c.fillStyle=(GR.phase==='dial'&&i<GR.chev*2)?'#ffb040':'#5a4a38';c.fillRect(200+Math.cos(a)*44-3,455+Math.sin(a)*15-2,6,4);}
 // Soldaten
 const sc=1.9;
 if(GR.phase==='idle'){
  let k=0;state.teams.forEach((t,ti)=>{t.members.forEach((id,j)=>{const m=state.roster[id];
   const x=cx-150+ (k%6)*60-(Math.floor(k/6))*20,y=Ht-40-Math.floor(k/6)*28;
   drawSoldier(c,Math.min(W-60,x+300*((ti+0)%1)),y,sc,m,0,t.mission>=0?1:.55);k++;});});
 }else if(GR.phase==='open'||GR.phase==='transit'){
  const el=(now-GR.t0)/1000;
  GR.walkers.forEach((w,i)=>{
   const m=state.roster[w.id];const st=0.4+i*0.22;
   const p=GR.phase==='transit'?1:Math.max(0,Math.min(1,(el-st)/1.4));
   const sx=cx-150+(i%6)*60,sy=Ht-40-Math.floor(i/6)*28,tx=cx,ty=cy+40;
   const x=sx+(tx-sx)*p,y=sy+(ty-sy)*p,s=sc*(1-0.55*p);
   const alpha=Math.max(0,1-Math.max(0,(p-0.75)*4));
   if(alpha>0.01)drawSoldier(c,x,y,s,m,el*9,alpha);
  });
 }
 // Statusleiste
 c.fillStyle='rgba(6,10,16,.88)';c.fillRect(0,0,W,40);c.fillStyle='#e8b040';c.font='bold 16px monospace';
 let txt='Gate inaktiv · Bereitschaft';
 if(GR.phase==='dial')txt=`WÄHLE ${GR.label.toUpperCase()} … Chevron ${GR.chev}/7 verriegelt`;
 if(GR.phase==='open')txt=`WURMLOCH STABIL · ${GR.label} ${GR.sub} · TEAM RÜCKT VOR`;
 if(GR.phase==='transit')txt=`TRANSIT · SG-1 PASSIERT DEN EREIGNISHORIZONT NACH ${GR.label.toUpperCase()} …`;
 if(GR.phase==='close')txt='Wurmloch kollabiert …';
 c.fillText(txt,16,26);
 if(GR.phase!=='idle'){
  c.fillStyle='#67e8f9';c.font='bold 12px monospace';
  c.fillText('▶ Klick / Leertaste / ESC: Überspringen',W-290,26);
 }
}
// ===================== Sternenkarte (Datenbasis, Rendering in ui.js / gl3d.js) =====================
const STARS=Array.from({length:140},(_,i)=>({x:(i*127.1%960),y:(i*311.7%540),r:0.5+(i*7%10)/9,p:i}));
const MAP={nodes:[],sel:null};
const GCOL={stable:'#4ade80',degrading:'#facc15',unstable:'#fb923c',destroyed:'#ef4444',dormant:'#6b7280'};
