'use strict';
// ===================== SGC COMMAND v2 – Sound =====================
// Procedural Web-Audio-SFX. Keine externen Dateien.
// Autoplay-Policy: AudioContext wird beim ersten User-Gesture gestartet.
// In Node (Smoke-Test) sind alle Calls sichere No-Ops.
const SFX={
  ctx:null, master:null, muted:false,
  init(){
    if(this.ctx||typeof window==='undefined')return;
    try{
      this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.ctx.createGain();
      this.master.gain.value=0.5;
      this.master.connect(this.ctx.destination);
    }catch(e){this.ctx=null;}
  },
  resume(){ if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume(); },
  toggle(){ this.muted=!this.muted; if(this.master)this.master.gain.value=this.muted?0:0.5; return this.muted; },
  tone(freq,dur,type,vol,slideTo){
    if(!this.ctx||this.muted)return;type=type||'square';vol=vol||0.3;
    const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slideTo)o.frequency.exponentialRampToValueAtTime(Math.max(1,slideTo),t+dur);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+0.02);
  },
  noise(dur,vol,filterFreq){
    if(!this.ctx||this.muted)return;vol=vol||0.3;filterFreq=filterFreq||1000;
    const t=this.ctx.currentTime,n=Math.floor(this.ctx.sampleRate*dur);
    const buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const src=this.ctx.createBufferSource();src.buffer=buf;
    const f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=filterFreq;
    const g=this.ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    src.connect(f);f.connect(g);g.connect(this.master);src.start(t);
  },
  shoot(){ this.noise(0.12,0.25,3000); this.tone(880,0.1,'square',0.15,220); },
  shotgun(){ this.noise(0.2,0.4,1500); this.tone(220,0.15,'square',0.2,80); },
  melee(){ this.tone(150,0.12,'sine',0.35,60); this.noise(0.08,0.2,800); },
  hit(){ this.tone(300,0.08,'sawtooth',0.25,100); this.noise(0.06,0.15,2000); },
  miss(){ this.noise(0.15,0.1,4000); this.tone(600,0.15,'sine',0.08,900); },
  death(){ this.tone(200,0.4,'sawtooth',0.3,40); this.noise(0.3,0.2,600); },
  gate(){
    if(!this.ctx||this.muted)return;
    const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(80,t);
    o.frequency.exponentialRampToValueAtTime(600,t+0.8);
    o.frequency.exponentialRampToValueAtTime(120,t+1.6);
    g.gain.setValueAtTime(0.001,t);
    g.gain.exponentialRampToValueAtTime(0.3,t+0.4);
    g.gain.exponentialRampToValueAtTime(0.001,t+1.8);
    o.connect(g);g.connect(this.master);o.start(t);o.stop(t+1.9);
    this.noise(1.2,0.1,800);
  },
  click(){ this.tone(1200,0.04,'square',0.1); },
  build(){ this.tone(400,0.1,'square',0.15,600); this.noise(0.1,0.1,1000); },
  victory(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.tone(f,0.25,'square',0.2),i*120)); },
  defeat(){ [400,350,300,200].forEach((f,i)=>setTimeout(()=>this.tone(f,0.3,'sawtooth',0.2),i*150)); },
};
if(typeof window!=='undefined'){
  const unlock=()=>{SFX.init();SFX.resume();};
  window.addEventListener('pointerdown',unlock);
  window.addEventListener('keydown',unlock);
}
