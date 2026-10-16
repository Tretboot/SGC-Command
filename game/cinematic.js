'use strict';

const INTRO_DURATION=7000;
let introFrame=0,introStart=0,introFinish=null,introActive=false,introTimeout=0;
const INTRO_STARS=Array.from({length:180},(_,i)=>({
 x:(i*7919%1280),y:(i*3571%720),r:(i%3)+0.5,a:0.25+(i%7)*0.1
}));

function startOpeningCinematic(onFinish){
 const overlay=document.getElementById('intro-overlay');
 const canvas=document.getElementById('intro-cv');
 if(!overlay||!canvas){onFinish();return;}
 introFinish=onFinish;introActive=true;introStart=performance.now();
 overlay.style.display='flex';
 document.getElementById('intro-skip').onclick=finishOpeningCinematic;
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 cancelAnimationFrame(introFrame);
 clearTimeout(introTimeout);
 if(reduced){
  introStart=performance.now()-INTRO_DURATION*0.68;
  drawOpeningCinematic(performance.now());
  cancelAnimationFrame(introFrame);
  introTimeout=setTimeout(finishOpeningCinematic,1800);
  return;
 }
 introFrame=requestAnimationFrame(drawOpeningCinematic);
}

function finishOpeningCinematic(){
 if(!introActive)return;
 introActive=false;cancelAnimationFrame(introFrame);
 clearTimeout(introTimeout);introTimeout=0;
 document.getElementById('intro-overlay').style.display='none';
 const done=introFinish;introFinish=null;
 if(done)done();
}

function drawOpeningCinematic(now){
 if(!introActive)return;
 const canvas=document.getElementById('intro-cv'),c=canvas.getContext('2d');
 const p=Math.min(1,(now-introStart)/INTRO_DURATION),zoom=0.18+2.45*Math.pow(Math.min(1,p/0.76),2.1);
 c.clearRect(0,0,1280,720);
 const sky=c.createLinearGradient(0,0,0,720);
 sky.addColorStop(0,'#030711');sky.addColorStop(0.64,'#101a2a');sky.addColorStop(1,'#263446');
 c.fillStyle=sky;c.fillRect(0,0,1280,720);
 INTRO_STARS.forEach((s,i)=>{
  const drift=p*(i%5+1)*12;
  c.globalAlpha=s.a*(0.65+0.35*Math.sin(now/500+i));
  c.fillStyle='#d8efff';c.fillRect((s.x-drift+1280)%1280,s.y,s.r,s.r);
 });
 c.globalAlpha=1;
 c.fillStyle='#172536';c.beginPath();c.ellipse(640,790,930,250,0,Math.PI,Math.PI*2);c.fill();
 c.strokeStyle='rgba(125,170,204,.2)';c.lineWidth=2;
 for(let i=0;i<7;i++){c.beginPath();c.ellipse(640,775,260+i*95,46+i*18,0,Math.PI,Math.PI*2);c.stroke();}

 c.save();
 c.translate(640,385);
 c.scale(zoom,zoom*0.76);
 c.rotate(-0.035);
 const halo=c.createRadialGradient(0,0,75,0,0,295);
 halo.addColorStop(0,'rgba(36,157,224,.3)');halo.addColorStop(0.5,'rgba(26,100,168,.14)');halo.addColorStop(1,'rgba(12,41,76,0)');
 c.fillStyle=halo;c.beginPath();c.arc(0,0,295,0,Math.PI*2);c.fill();
 c.lineWidth=34;c.strokeStyle='#111a28';c.beginPath();c.ellipse(0,0,190,245,0,0,Math.PI*2);c.stroke();
 c.lineWidth=19;c.strokeStyle='#708397';c.beginPath();c.ellipse(0,0,173,228,0,0,Math.PI*2);c.stroke();
 c.lineWidth=5;c.strokeStyle='#c0d0dc';c.beginPath();c.ellipse(0,0,157,212,0,0,Math.PI*2);c.stroke();
 const event=c.createRadialGradient(-35,-64,8,0,0,190);
 event.addColorStop(0,'#b7f2ff');event.addColorStop(0.22,'#60d5f7');event.addColorStop(0.55,'#137bb9');event.addColorStop(1,'#061329');
 c.fillStyle=event;c.beginPath();c.ellipse(0,0,151,205,0,0,Math.PI*2);c.fill();
 c.save();c.beginPath();c.ellipse(0,0,151,205,0,0,Math.PI*2);c.clip();
 for(let i=0;i<9;i++){
  c.globalAlpha=0.1+0.08*Math.sin(now/260+i);
  c.strokeStyle=i%2?'#d6f9ff':'#64c9f4';c.lineWidth=6+i%3*3;
  c.beginPath();c.ellipse(-30+i*8,Math.sin(now/550+i)*25,55+i*14,120+i*8,Math.sin(now/800+i)*0.12,0,Math.PI*2);c.stroke();
 }
 c.restore();c.globalAlpha=1;
 for(let i=0;i<9;i++){
  const a=-Math.PI/2+i*Math.PI*2/9;
  const x=Math.cos(a)*207,y=Math.sin(a)*263;
  c.save();c.translate(x,y);c.rotate(a);
  c.fillStyle=i===1?'#75dfff':'#56697e';c.shadowColor=i===1?'#4fc3f7':'transparent';c.shadowBlur=i===1?22:0;
  c.fillRect(-15,-10,30,20);c.restore();
 }
 c.restore();

 const fade=Math.max(0,Math.min(1,(p-0.52)/0.24));
 if(fade){
  c.globalAlpha=fade;
  c.textAlign='center';c.shadowColor='rgba(50,175,240,.6)';c.shadowBlur=26;
  c.fillStyle='#e9f6ff';c.font='600 17px "Trebuchet MS",sans-serif';c.fillText('EINE GALAXIE VOLLER MÖGLICHKEITEN',640,100);
  c.shadowBlur=0;c.fillStyle='#68d5ff';c.font='bold 42px "Trebuchet MS",sans-serif';c.letterSpacing='8px';c.fillText('SGC COMMAND',640,155);
  c.fillStyle='#b5c8d9';c.font='15px monospace';c.letterSpacing='3px';c.fillText('EIN TOR. EIN TEAM. UNBEKANNTE WELTEN.',640,190);
  c.globalAlpha=1;
 }
 if(p>=1)finishOpeningCinematic();
 else introFrame=requestAnimationFrame(drawOpeningCinematic);
}

document.addEventListener('keydown',e=>{
 if(introActive&&(e.key==='Escape'||e.key==='Enter')){
  e.preventDefault();e.stopImmediatePropagation();finishOpeningCinematic();
 }
});
