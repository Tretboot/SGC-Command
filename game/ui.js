'use strict';
// ===================== SGC COMMAND v2 – UI =====================
// Jagged-Alliance-Style: Bottom-Panel mit Unit-Info, Aktionen, Gate-Timer, Log.
// Inkl. Isometrischer Voxel-Steuerung, ASCII-3D Umschaltung, Offworld-Bau,
// Strudel Core Sound-Engine, Arsenal/Crafting & Hammonds Klemmbrett.

const $=id=>document.getElementById(id);
const UI={tab:'base',menuOpen:false};
const RES_ICON={ore:'⛏',tech:'⚙',medicine:'✚',food:'🍞'};
const RES_DE={ore:'Erz',tech:'Tech',medicine:'Medizin',food:'Nahrung'};
const TYPE_DE={hostile:'feindlich',neutral:'neutral',allied:'verbündet',empty:'unbewohnt',base:'Basis',space:'Orbit'};
const ENEMY_DE={jaffa:'Jaffa',veteran:'Veteran',elite:'Elite',goauld:"Goa'uld",repl:'Replikant',drone:'Drone',queen:'Königin'};
let GATE_STATE=null;
let combatPanDrag=null;
// sfx() kommt aus combat.js (global) – hier NICHT erneut deklarieren!
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

function toast(msg){if(!msg)return;const t=$('toast');if(!t)return;t.textContent=msg;t.className='show';clearTimeout(toast.h);toast.h=setTimeout(()=>t.className='',2600);}
function act(r){if(r&&r.msg)toast(r.msg);save();renderAll();}
function bar(v,col){return `<span class="bar"><i style="width:${Math.max(0,Math.min(100,v))}%;background:${col}"></i></span>`;}
function pic(m,cls){return `<img class="${cls||'pt'}" src="${portrait(m)}" title="${m.name}">`;}
function setTab(t){UI.tab=t;sfx('click');
 document.querySelectorAll('.pane').forEach(p=>p.style.display=p.id==='pane-'+t?'block':'none');
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
 if(typeof SFX!=='undefined'&&!C.active){
  SFX.music(t==='map'?'map':t==='colonies'?'planet':'base');
 }
 renderAll();}

function cycleGfxMode(){
 const cur=typeof getGfxMode==='function'?getGfxMode():'pixel';
 const next=cur==='pixel'?'ascii':'pixel';
 act(setGfxMode(next));
}

// ===================== Pause-Menü (Escape) =====================
function showMenu(){if(UI.menuOpen)return;UI.menuOpen=true;$('menu').style.display='flex';
 const sel=$('menu-diff');if(sel)sel.value=S.difficulty||'easy';
 const gfxSel=$('menu-gfx');if(gfxSel)gfxSel.value=S.gfxMode||'pixel';
 const cmdSel=$('menu-cmd');if(cmdSel)cmdSel.value=S.commander||'hammond';
 sfx('click');}
function hideMenu(){UI.menuOpen=false;$('menu').style.display='none';}
function toggleMenu(){if(UI.menuOpen)hideMenu();else showMenu();}
function replayOpeningCinematic(){
 hideMenu();
 startOpeningCinematic(()=>{
  S.introSeen=true;save();
  if(!S.pilotBriefingSeen&&!S.done.includes('1-1')&&S.day===1)showPilotOpening();
 });
}

// ===================== Hammonds Klemmbrett & Büro (ROADMAP §1.5.2) =====================
function showClipboardModal(){
 hideMenu();
 const m=$('modal');if(!m)return;
 const cmd=(typeof COMMANDERS!=='undefined'&&COMMANDERS[S.commander])||COMMANDERS.hammond;
 const rec=S.roster.filter(p=>p.recruited&&!p.dead);
 let h=`<div class="mbox clipboard-box">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e8b040;padding-bottom:8px">
   <div>
    <h3 style="margin:0;color:#e8b040">📋 KOMMANDO-KLEMMBRETT · LEVEL 27 BÜRO</h3>
    <small>Kommandant: <b style="color:${cmd.color}">${cmd.name}</b> (${cmd.title}) · Bonus: ${cmd.bonus}</small>
   </div>
   <select onchange="act(setCommander(this.value));showClipboardModal()" style="background:#0f1622;border-color:#e8b040">
    ${Object.values(COMMANDERS).map(c=>`<option value="${c.id}" ${S.commander===c.id?'selected':''}>🎖 ${c.name}</option>`).join('')}
   </select>
  </div>
  <div class="mbody">
   <div style="background:#101824;border-left:3px solid ${cmd.color};padding:8px 12px;margin:6px 0;font-style:italic;color:#cbd8e4">${cmd.quote}</div>
   <h4>🎖 Aktive SG-Teams</h4>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;margin-bottom:8px">
    ${Object.entries(SG_TEAMS).map(([tid,tinfo])=>{
     const members=rec.filter(p=>(p.team||(p.sg1?'sg1':'sg2'))===tid);
     return `<div class="item" style="border-color:${tinfo.color}"><b style="color:${tinfo.color}">${tinfo.name}</b> <small>${tinfo.role}</small><br><small>${members.map(p=>p.name.split(' ')[0]).join(', ')||'Keine Zuweisung'}</small></div>`;
    }).join('')}
   </div>
   <h4>👥 Vollständige Personalübersicht (${rec.length} aktiv)</h4>
   <table class="clipboard-table">
    <thead><tr><th>Name</th><th>Klasse</th><th>SG-Team</th><th>Station (Raum)</th><th>Status</th><th>Ausrüstung</th></tr></thead>
    <tbody>
     ${rec.map(p=>{
      const rm=p.room>=0&&S.base.rooms[p.room]?ROOMS[S.base.rooms[p.room].type].name:'Bereitschaft';
      const w=WEAPONS[p.weapon]?WEAPONS[p.weapon].name:p.weapon;
      const ar=ARMORS[p.armor||'light']?ARMORS[p.armor||'light'].name:'Leicht';
      const sp=p.special&&SPECIALS[p.special]?SPECIALS[p.special].icon+' '+SPECIALS[p.special].name:'–';
      const curTeam=p.team||(p.sg1?'sg1':'sg2');
      return `<tr>
       <td><b>${p.name}</b> <small>Lv.${p.lvl}</small></td>
       <td>${CLASS_DE[p.cls]}</td>
       <td><select onchange="act(assignTeam(${p.id},this.value));showClipboardModal()">${Object.entries(SG_TEAMS).map(([tid,ti])=>`<option value="${tid}" ${curTeam===tid?'selected':''}>${ti.name}</option>`).join('')}</select></td>
       <td><select onchange="act(assignRoom(${p.id},parseInt(this.value)));showClipboardModal()"><option value="-1" ${p.room<0?'selected':''}>Bereitschaft</option>${Object.values(S.base.rooms).map(r=>`<option value="${r.id}" ${p.room===r.id?'selected':''}>${ROOMS[r.type].name}</option>`).join('')}</select></td>
       <td>❤ ${p.hp}/${p.maxHp} · 💤 ${p.fatigue}%</td>
       <td><small>🔫 ${w} · 🛡 ${ar} · ${sp}</small></td>
      </tr>`;
     }).join('')}
    </tbody>
   </table>
  </div>
  <div style="display:flex;justify-content:space-between;gap:8px">
   ${S.roster[12]&&S.roster[12].recruited?`<button ${S.sandUsed?'disabled':''} onclick="act(sandwich());showClipboardModal()">🥪 Hammonds Sandwich (+20 Moral)</button>`:'<span></span>'}
   <button onclick="$('modal').style.display='none'">Klemmbrett schließen</button>
  </div>
 </div>`;
 m.style.display='flex';
 m.innerHTML=h;
}

// ===================== SGC AMP v2.80 — Winamp Retro Audio Player =====================
const WINAMP = {
  visMode: 'wave', // 'wave' | 'spectrum'
  tab: 'sa',       // 'sa' | 'theme' | 'core' | 'seed' | 'settings'
  searchQuery: '',
  shuffle: false,
  loop: true,
  editorOpen: true, // Permanent sichtbares Live-Code Interface (wie strudel.cc)
  rackOpen: true,   // ReBirth 338 Rack mit Soundbanks & Drehreglern
  userEditing: false,
  raf: null,
  lastStep: -1,

  toggleVisMode(){
    this.visMode=(this.visMode==='wave')?'spectrum':'wave';
    const tag=document.getElementById('winamp-vis-label');
    if(tag)tag.textContent=this.visMode==='wave'?'OSCILLOSCOPE':'SPECTRUM 28-BAND';
    this.drawVis();
  },

  startVis(){
    if(this.raf)return;
    const loop=()=>{
      this.drawVis();
      this.updateElapsed();
      this.updateStepSequencer();
      this.raf=requestAnimationFrame(loop);
    };
    this.raf=requestAnimationFrame(loop);
  },

  stopVis(){
    if(this.raf){
      cancelAnimationFrame(this.raf);
      this.raf=null;
    }
  },

  updateStepSequencer(){
    if(typeof STRUDEL==='undefined'||!STRUDEL.playing||STRUDEL.paused)return;
    const ctx=typeof SFX!=='undefined'?SFX.ctx:null;
    const cycleDur=1/Math.max(0.15,STRUDEL.cps||0.45);
    const stepDur=cycleDur/16;
    const curTime=ctx?ctx.currentTime:(Date.now()/1000);
    const step=Math.floor((curTime/stepDur)%16);
    if(step!==this.lastStep){
      const prev=document.getElementById(`rebirth-step-${this.lastStep}`);
      if(prev)prev.classList.remove('active-step');
      const cur=document.getElementById(`rebirth-step-${step}`);
      if(cur)cur.classList.add('active-step');
      this.lastStep=step;
    }
  },

  handleVoiceTrigger(voice, val){
    // Highlight voice badge (Strudel.cc style monitor)
    const badge=document.getElementById(`winamp-badge-${voice}`);
    if(badge){
      badge.classList.add('active-hit');
      setTimeout(()=>{if(badge)badge.classList.remove('active-hit');}, 110);
    }
    // Highlight editor border & backdrop pulse (Strudel.cc live feel)
    const edWrap=document.getElementById('strudel-editor-wrapper');
    if(edWrap){
      edWrap.classList.add('editor-pulse');
      setTimeout(()=>{if(edWrap)edWrap.classList.remove('editor-pulse');}, 80);
    }
  },

  drawVis(){
    const cv=document.getElementById('winamp-vis');
    if(!cv)return;
    const ctx=cv.getContext('2d');
    const w=cv.width,h=cv.height;

    ctx.fillStyle='#050a06';
    ctx.fillRect(0,0,w,h);

    // Subtle LCD grid lines
    ctx.strokeStyle='#0d2212';
    ctx.lineWidth=1;
    ctx.beginPath();
    for(let x=0;x<w;x+=16){ctx.moveTo(x,0);ctx.lineTo(x,h);}
    for(let y=0;y<h;y+=10){ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();

    const isPlaying=(typeof STRUDEL!=='undefined'&&STRUDEL.playing&&!STRUDEL.paused);
    const analyser=(typeof SFX!=='undefined'&&SFX.analyser);

    if(!isPlaying||!analyser){
      ctx.strokeStyle='#1b5e20';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(0,h/2);
      ctx.lineTo(w,h/2);
      ctx.stroke();
      return;
    }

    if(this.visMode==='spectrum'){
      const bins=24;
      const freq=new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freq);
      const barW=Math.floor(w/bins);
      for(let i=0;i<bins;i++){
        const v=freq[Math.floor(i*freq.length/bins)]/255;
        const bH=Math.max(2,Math.floor(v*(h-4)));
        const grad=ctx.createLinearGradient(0,h,0,0);
        grad.addColorStop(0,'#22c55e');
        grad.addColorStop(0.65,'#eab308');
        grad.addColorStop(1,'#ef4444');
        ctx.fillStyle=grad;
        ctx.fillRect(i*barW+1,h-bH,barW-2,bH);
      }
    }else{
      const timeData=new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(timeData);
      ctx.strokeStyle='#4ade80';
      ctx.lineWidth=2;
      ctx.shadowColor='#22c55e';
      ctx.shadowBlur=4;
      ctx.beginPath();
      const slice=w/timeData.length;
      let x=0;
      for(let i=0;i<timeData.length;i++){
        const v=timeData[i]/128.0;
        const y=(v*h)/2;
        if(i===0)ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
        x+=slice;
      }
      ctx.stroke();
      ctx.shadowBlur=0;
    }
  },

  updateElapsed(){
    const el=document.getElementById('winamp-time');
    if(!el||typeof SFX==='undefined'||!SFX.ctx)return;
    if(typeof STRUDEL==='undefined'||!STRUDEL.playing||STRUDEL.paused)return;
    const t=Math.floor(SFX.ctx.currentTime);
    const m=String(Math.floor(t/60)).padStart(2,'0');
    const s=String(t%60).padStart(2,'0');
    el.textContent=`${m}:${s}`;
  }
};

function getWinampTracksForTab(tab, search=''){
  let list=[];
  const q=search.trim().toLowerCase();
  if(tab==='sa'){
    list=Object.keys(STRUDEL_TRACKS).filter(k=>k.startsWith('sa_'));
  }else if(tab==='theme'){
    list=['theme_midi','theme_fanfare','theme_remix_0','theme_remix_1','theme_remix_2','theme_remix_3'];
  }else if(tab==='core'){
    list=['base','map','planet','gate','combat','peaceful','boss'];
  }else if(tab==='seed'){
    list=Object.keys(STRUDEL_TRACKS).filter(k=>k.startsWith('custom_')||k==='generated_seed');
    if(!list.length)list=['generated_seed'];
  }
  if(q){
    list=list.filter(k=>{
      const tr=STRUDEL_TRACKS[k];
      if(!tr)return false;
      return (tr.name&&tr.name.toLowerCase().includes(q))||
             (tr.title&&tr.title.toLowerCase().includes(q))||
             (tr.style&&tr.style.toLowerCase().includes(q))||
             k.toLowerCase().includes(q);
    });
  }
  return list;
}

function renderWinampPlaylistHTML(curTrack){
  if(WINAMP.tab==='settings'){
    const danceOn=typeof S!=='undefined'&&S&&S.audioDance!==false;
    const rumbleOn=typeof S!=='undefined'&&S&&S.controllerVibration!==false;
    return `<div style="padding:14px;background:#090d14;margin:8px;border:1px solid #1e293b;border-radius:4px;display:flex;flex-direction:column;gap:10px">
      <div style="font-size:12px;color:#cbd5e1;font-weight:bold;margin-bottom:4px">⚙ HAPTIK, VIBRATION &amp; AUDIO-REAKTIVES VERHALTEN</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="winamp-btn ${danceOn?'active':''}" onclick="toggleAudioDance()" title="Lässt das Spielfeld im Takt der Kick/Bass-Beats vibrieren und tanzen">🎵 Spielfeld-Tanzen: ${danceOn?'AN (Audio-Reaktiv)':'AUS'}</button>
        <button class="winamp-btn ${rumbleOn?'active':''}" onclick="toggleControllerRumble()" title="Gamepad/Controller Dual-Rumble Vibration bei Schüssen & Bass">🎮 Controller-Vibration: ${rumbleOn?'AN':'AUS'}</button>
        <button class="winamp-btn" onclick="showKeybindModal()">⌨ Tastenbelegung konfigurieren...</button>
      </div>
      <div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-top:6px">
        • <b>Spielfeld-Tanzen:</b> Liest die Bass-Energie von Strudel aus und lässt Kamera &amp; Voxel im Takt pulsieren.<br>
        • <b>8-Bit Chiptune:</b> Aktiviert sich automatisch im ASCII-3D-Modus für originalgetreues Retro-Feeling.
      </div>
    </div>`;
  }

  const trackKeys=getWinampTracksForTab(WINAMP.tab,WINAMP.searchQuery);
  if(!trackKeys.length){
    return `<div style="padding:20px;text-align:center;color:#64748b;font-size:12px">Keine Tracks gefunden für "${WINAMP.searchQuery}".</div>`;
  }

  return `<div class="winamp-playlist">
    ${trackKeys.map((k,idx)=>{
      const tr=STRUDEL_TRACKS[k]||{name:k,artist:'SGC',bpm:140,style:'Synth'};
      const isCur=(curTrack===k);
      const num=String(idx+1).padStart(2,'0');
      return `<div class="winamp-item ${isCur?'current':''}" data-track="${k}" onclick="SFX.playTrack('${k}');">
        <div>
          <span style="color:#64748b;margin-right:6px">[${num}]</span>
          <b>${isCur?'▶ ':''}${tr.title||tr.name||k}</b>
          <span style="color:#94a3b8;font-size:11px;margin-left:6px">· ${tr.artist||'SGC'}</span>
        </div>
        <div style="font-size:11px;color:#64748b">
          <span style="color:#38bdf8;margin-right:6px">${tr.style||''}</span>
          <span>${tr.bpm||140} BPM</span>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderWinampPlaylistItems(){
  const container=document.getElementById('winamp-playlist-container');
  if(container){
    const curTrack=(typeof STRUDEL!=='undefined'&&STRUDEL.currentTrack)||'base';
    container.innerHTML=renderWinampPlaylistHTML(curTrack);
  }
}

function updateWinampDisplay(){
  const cv=document.getElementById('winamp-vis');
  if(!cv)return;
  const curTrack=(typeof STRUDEL!=='undefined'&&STRUDEL.currentTrack)||'base';
  const tr=(typeof STRUDEL_TRACKS!=='undefined'&&STRUDEL_TRACKS[curTrack])||{name:curTrack,artist:'SGC',bpm:140,style:'Strudel'};
  const isPlaying=typeof STRUDEL!=='undefined'&&STRUDEL.playing&&!STRUDEL.paused;
  const isPaused=typeof STRUDEL!=='undefined'&&STRUDEL.paused;
  const is8Bit=typeof STRUDEL!=='undefined'&&STRUDEL.chiptuneMode;

  const marq=document.getElementById('winamp-marquee');
  if(marq){
    marq.textContent=`▶ [${tr.artist||'SGC'}] ${tr.title||tr.name||curTrack} · ${tr.style||'Strudel'} (${tr.bpm||140} BPM)`;
  }
  const badge=document.getElementById('winamp-status-badge');
  if(badge){
    badge.className=`winamp-badge ${isPlaying?'playing':isPaused?'paused':'stopped'}`;
    badge.textContent=isPlaying?'▶ PLAYING':isPaused?'⏸ PAUSED':'⏹ STOPPED';
  }
  const btn8=document.getElementById('winamp-8bit-btn');
  if(btn8){
    btn8.className=`winamp-btn ${is8Bit?'active':''}`;
    btn8.textContent=is8Bit?'👾 8-Bit: AN':'👾 8-Bit: AUS';
  }
  const badge8=document.getElementById('winamp-badge-8bit');
  if(badge8){
    badge8.style.display=is8Bit?'inline-block':'none';
  }

  document.querySelectorAll('.winamp-item').forEach(el=>{
    const k=el.dataset.track;
    if(k===curTrack){
      el.classList.add('current');
    }else{
      el.classList.remove('current');
    }
  });

  const ed=document.getElementById('strudel-editor');
  if(ed&&!WINAMP.userEditing){
    ed.value=STRUDEL.currentCode||(STRUDEL.patterns&&STRUDEL.patterns[curTrack])||'';
  }
}

function renderBankButtons(type, currentBank, options){
  return options.map(opt=>{
    const isAct = (currentBank === opt.id);
    return `<button class="rebirth-bank-btn ${isAct?'active':''}" onclick="SFX.setSoundBank('${type}','${opt.id}')" title="${opt.label}">${opt.label}</button>`;
  }).join(' ');
}

function renderSliderControl(param, label, val, min, max, unit){
  const step = (max - min > 50) ? 1 : (max - min > 5 ? 0.1 : 0.01);
  return `<div class="rebirth-knob-cell">
    <div class="rebirth-knob-lbl">${label}</div>
    <input type="range" class="rebirth-slider" min="${min}" max="${max}" step="${step}" value="${val}"
      oninput="SFX.setRebirthParam('${param}', this.value)"
      title="${label}: ${val}${unit}">
    <div id="rebirth-readout-${param}" class="rebirth-knob-val">${val} ${unit}</div>
  </div>`;
}

function updateRebirthParamReadout(param, val){
  const el = document.getElementById(`rebirth-readout-${param}`);
  if(!el) return;
  const units = {
    cutoff:'Hz', resonance:'Q', envMod:'%', decay:'s', distortion:'%', tune:'st',
    bdTune:'Hz', bdDecay:'s', hatDecay:'s', tempoBpm:'BPM'
  };
  const u = units[param] || '';
  if(param==='envMod'||param==='distortion'){
    el.textContent = `${Math.round(val*100)} ${u}`;
  }else if(param==='decay'||param==='bdDecay'||param==='hatDecay'||param==='resonance'){
    el.textContent = `${Number(val).toFixed(2)} ${u}`;
  }else{
    el.textContent = `${Math.round(val)} ${u}`;
  }
}

function updateRebirthUI(){
  const rb = typeof SFX!=='undefined' && SFX.rebirth;
  if(!rb) return;
  document.querySelectorAll('.rebirth-bank-btn').forEach(btn=>{
    const onclick = btn.getAttribute('onclick')||'';
    if(onclick.includes("'kick'")){
      const m = onclick.match(/'kick',\s*'([^']+)'/);
      if(m) btn.classList.toggle('active', m[1] === rb.kickBank);
    }else if(onclick.includes("'hat'")){
      const m = onclick.match(/'hat',\s*'([^']+)'/);
      if(m) btn.classList.toggle('active', m[1] === rb.hatBank);
    }else if(onclick.includes("'bass'")){
      const m = onclick.match(/'bass',\s*'([^']+)'/);
      if(m) btn.classList.toggle('active', m[1] === rb.bassBank);
    }
  });
}

function toggleRebirthRack(){
  WINAMP.rackOpen = !WINAMP.rackOpen;
  const r = document.getElementById('rebirth-rack');
  if(r) r.style.display = WINAMP.rackOpen ? 'block' : 'none';
}

function handleEditorKeyDown(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){
    e.preventDefault();
    executeStrudelEditor();
  }
}

function executeStrudelEditor(){
  const ed=document.getElementById('strudel-editor');
  if(!ed)return;
  const code=ed.value;
  STRUDEL.evaluate(code,true);
  if(typeof toast==='function') toast('⚡ Strudel Pattern live ausgeführt! [Ctrl+Enter]');
}

function resetCurrentSong(){
  const curTrack=STRUDEL.currentTrack||'sa_lets_talk';
  const tr=STRUDEL_TRACKS[curTrack];
  if(tr&&tr.code){
    const ed=document.getElementById('strudel-editor');
    if(ed)ed.value=tr.code;
    STRUDEL.evaluate(tr.code,true);
    if(typeof toast==='function') toast(`↺ Track „${tr.title||tr.name}“ zurückgesetzt`);
  }
}

function applySoundbanksToCode(){
  const ed = document.getElementById('strudel-editor');
  if(!ed) return;
  let code = ed.value;
  const rb = (typeof SFX!=='undefined'&&SFX.rebirth)||{kickBank:'tr909',hatBank:'tr909',bassBank:'tb303_saw'};

  // 1. Kick bank in code
  if(rb.kickBank==='tr808'){
    code = code.replace(/\b(sbd|bd|tr909_bd|tr707_bd)\b/g, 'tr808_bd');
  }else if(rb.kickBank==='tr909'){
    code = code.replace(/\b(tr808_bd|bd|tr707_bd)\b/g, 'sbd');
  }else if(rb.kickBank==='tr707'){
    code = code.replace(/\b(sbd|bd|tr808_bd)\b/g, 'tr707_bd');
  }else if(rb.kickBank==='chiptune'){
    code = code.replace(/\b(sbd|bd|tr808_bd)\b/g, 'square');
  }

  // 2. Hat bank in code
  if(rb.hatBank==='tr808'){
    code = code.replace(/\b(oh|hh|tr909_oh|tr707_oh)\b/g, 'tr808_oh');
  }else if(rb.hatBank==='tr909'){
    code = code.replace(/\b(tr808_oh|tr707_oh)\b/g, 'oh');
  }else if(rb.hatBank==='tr707'){
    code = code.replace(/\b(oh|hh|tr808_oh)\b/g, 'tr707_oh');
  }else if(rb.hatBank==='chiptune'){
    code = code.replace(/\b(oh|hh|tr808_oh)\b/g, 'znoise');
  }

  // 3. Bass bank in code
  if(rb.bassBank==='tb303_sq'){
    code = code.replace(/\b(sawtooth|supersaw|triangle)\b/g, 'square');
  }else if(rb.bassBank==='tb303_saw'||rb.bassBank==='sh101'){
    code = code.replace(/\b(square|triangle)\b/g, 'sawtooth');
  }else if(rb.bassBank==='sub'){
    code = code.replace(/\b(sawtooth|supersaw|square)\b/g, 'sine');
  }

  ed.value = code;
  STRUDEL.evaluate(code, true);
  if(typeof toast==='function') toast('🎹 Gewählte Soundbanks in Code eingefügt!');
}

function closeWinampModal(){
  WINAMP.stopVis();
  $('modal').style.display='none';
}

function showStrudelModal(){
  hideMenu();
  const m=$('modal');if(!m)return;
  const curTrack=(typeof STRUDEL!=='undefined'&&STRUDEL.currentTrack)||'base';
  const curCode=(typeof STRUDEL!=='undefined'&&(STRUDEL.currentCode||(STRUDEL.patterns&&STRUDEL.patterns[curTrack])))||'';
  const playing=typeof STRUDEL!=='undefined'&&STRUDEL.playing&&!STRUDEL.paused;
  const paused=typeof STRUDEL!=='undefined'&&STRUDEL.paused;
  const is8Bit=typeof STRUDEL!=='undefined'&&STRUDEL.chiptuneMode;
  const tr=(typeof STRUDEL_TRACKS!=='undefined'&&STRUDEL_TRACKS[curTrack])||{name:curTrack,artist:'SGC',bpm:140,style:'Live Strudel'};
  const rb=(typeof SFX!=='undefined'&&SFX.rebirth)||{
    bassBank:'tb303_saw', kickBank:'tr909', hatBank:'tr909',
    cutoff:2400, resonance:6.0, envMod:0.60, decay:0.28, distortion:0.20, tune:0,
    bdTune:115, bdDecay:0.24, hatDecay:0.08, tempoBpm:140
  };

  m.style.display='flex';
  m.innerHTML=`<div class="winamp-chassis">
    <!-- Window Titlebar -->
    <div class="winamp-titlebar">
      <span>📻 SGC-AMP v2.80 · STRUDEL CORE SOUND-ENGINE &amp; REBIRTH-338</span>
      <div style="display:flex;gap:4px">
        <button class="winamp-title-btn" onclick="toggleRebirthRack()" title="ReBirth 338 Rack umschalten">🎛 RACK</button>
        <button class="winamp-title-btn" onclick="closeWinampModal()">✕</button>
      </div>
    </div>

    <!-- Main Deck: LCD & Oscilloscope -->
    <div class="winamp-display">
      <div class="winamp-lcd">
        <div id="winamp-marquee" class="winamp-marquee">▶ [${tr.artist||'SGC'}] ${tr.title||tr.name||curTrack} · ${tr.style||'Strudel'} (${tr.bpm||140} BPM)</div>
        <div class="winamp-stats-row">
          <span id="winamp-time" class="winamp-time">00:00</span>
          <span id="winamp-status-badge" class="winamp-badge ${playing?'playing':paused?'paused':'stopped'}">${playing?'▶ PLAYING':paused?'⏸ PAUSED':'⏹ STOPPED'}</span>
          <span style="font-size:11px;color:#94a3b8">${tr.bpm||140} BPM · ${typeof STRUDEL!=='undefined'?STRUDEL.cps:0.5} CPS</span>
          <span id="winamp-badge-8bit" class="winamp-badge" style="background:#0e7490;color:#67e8f9;border:1px solid #06b6d4;display:${is8Bit?'inline-block':'none'}">👾 8-BIT</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <canvas id="winamp-vis" class="winamp-vis-canvas" width="160" height="48" title="Klicken für Umschaltung: Oszilloskop / Frequenzspektrum" onclick="WINAMP.toggleVisMode()"></canvas>
        <div id="winamp-vis-label" style="font-size:9px;color:#166534;letter-spacing:1px">${WINAMP.visMode==='wave'?'OSCILLOSCOPE':'SPECTRUM 28-BAND'}</div>
      </div>
    </div>

    <!-- Transport Controls -->
    <div class="winamp-controls">
      <button class="winamp-btn" onclick="SFX.prevTrack()" title="Vorheriger Track">|◀◀</button>
      <button class="winamp-btn active" onclick="SFX.playTrack(STRUDEL.currentTrack||'sa_lets_talk')" title="Abspielen">▶ PLAY</button>
      <button class="winamp-btn" onclick="SFX.pause()" title="Pause">⏸ PAUSE</button>
      <button class="winamp-btn" style="border-color:#ef4444;color:#f87171" onclick="SFX.stop()" title="Stop">⏹ STOP</button>
      <button class="winamp-btn" onclick="SFX.nextTrack()" title="Nächster Track">▶▶|</button>

      <div class="winamp-vol" style="margin-left:8px">
        <span>VOL:</span>
        <input type="range" min="0" max="100" value="${SFX&&SFX.master?Math.round(SFX.master.gain.value*100):55}" oninput="if(SFX&&SFX.master)SFX.master.gain.value=this.value/100">
      </div>

      <div style="flex:1"></div>

      <button id="winamp-8bit-btn" class="winamp-btn ${is8Bit?'active':''}" onclick="STRUDEL.setChiptune(!STRUDEL.chiptuneMode,true)" title="Schaltet auf klassischen 8-Bit Chiptune Sound um (Square-Waves &amp; NES Arpeggio)">👾 8-Bit: ${is8Bit?'AN':'AUS'}</button>
      <button class="winamp-btn ${STRUDEL.dynamicEnabled?'active':''}" onclick="STRUDEL.dynamicEnabled=!STRUDEL.dynamicEnabled;toast('Spannungs-Adaption: '+(STRUDEL.dynamicEnabled?'AN':'AUS'));showStrudelModal()" title="Soundtrack passt sich dynamisch an das Gefecht an">⚡ DYN: ${STRUDEL.dynamicEnabled?'AN':'AUS'}</button>
      <button class="winamp-btn" onclick="generateNewSongFromContext()" title="Generiert einen neuen Track aus aktuellem Team, Planet, Waffen &amp; Tag">🎲 SONGGEN</button>
    </div>

    <!-- REBIRTH RB-338 SYNTH & DRUM RACK (SOUNDBANKS & SLIDERS) -->
    <div id="rebirth-rack" class="rebirth-chassis" style="display:${WINAMP.rackOpen?'block':'none'}">
      <!-- SECTION 1: TB-303 BASS SYNTHESIZER -->
      <div class="rebirth-section rebirth-303">
        <div class="rebirth-header">
          <span class="rebirth-title">🎸 BASS / TB-303 ACID RACK</span>
          <div class="rebirth-banks">
            <span style="font-size:10px;color:#cbd5e1;margin-right:4px">SOUNDBANK:</span>
            ${renderBankButtons('bass', rb.bassBank, [
              {id:'tb303_saw', label:'303 Saw'},
              {id:'tb303_sq', label:'303 Sq'},
              {id:'sh101', label:'SH-101'},
              {id:'sub', label:'Sub'},
              {id:'slap', label:'Slap'},
              {id:'chiptune', label:'8-Bit'},
              {id:'reese', label:'Reese'}
            ])}
          </div>
        </div>
        <div class="rebirth-knobs-grid">
          ${renderSliderControl('cutoff', 'CUTOFF', rb.cutoff, 100, 8000, 'Hz')}
          ${renderSliderControl('resonance', 'RESONANCE', rb.resonance, 0.5, 20, 'Q')}
          ${renderSliderControl('envMod', 'ENV MOD', Math.round(rb.envMod*100), 0, 100, '%')}
          ${renderSliderControl('decay', 'DECAY', rb.decay, 0.05, 1.2, 's')}
          ${renderSliderControl('distortion', 'DISTORTION', Math.round(rb.distortion*100), 0, 100, '%')}
          ${renderSliderControl('tune', 'TUNE', rb.tune, -12, 12, 'st')}
        </div>
      </div>

      <!-- SECTION 2: ROLAND TR DRUM MACHINE -->
      <div class="rebirth-section rebirth-drums">
        <div class="rebirth-header">
          <span class="rebirth-title">🥁 ROLAND DRUM MACHINE (TR-909 / TR-808 / TR-707)</span>
        </div>
        <div class="rebirth-drum-banks-row" style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <b style="font-size:10px;color:#facc15">KICK BANK:</b>
            ${renderBankButtons('kick', rb.kickBank, [
              {id:'tr909', label:'TR-909'},
              {id:'tr808', label:'TR-808'},
              {id:'tr707', label:'TR-707'},
              {id:'linn', label:'LinnDrum'},
              {id:'chiptune', label:'8-Bit'},
              {id:'acoustic', label:'Acoustic'},
              {id:'acid', label:'Acid'}
            ])}
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <b style="font-size:10px;color:#38bdf8">HI-HAT BANK:</b>
            ${renderBankButtons('hat', rb.hatBank, [
              {id:'tr909', label:'TR-909'},
              {id:'tr808', label:'TR-808'},
              {id:'tr707', label:'TR-707'},
              {id:'linn', label:'LinnDrum'},
              {id:'chiptune', label:'8-Bit'},
              {id:'noise', label:'Noise Sweep'}
            ])}
          </div>
        </div>
        <div class="rebirth-knobs-grid" style="margin-top:8px">
          ${renderSliderControl('bdTune', 'BD TUNE', rb.bdTune, 40, 140, 'Hz')}
          ${renderSliderControl('bdDecay', 'BD DECAY', rb.bdDecay, 0.08, 0.70, 's')}
          ${renderSliderControl('hatDecay', 'HAT DECAY', rb.hatDecay, 0.02, 0.35, 's')}
          ${renderSliderControl('tempoBpm', 'TEMPO', rb.tempoBpm, 80, 180, 'BPM')}
        </div>
      </div>
    </div>

    <!-- STRUDEL.CC LIVE CODE INTERFACE (FRONT AND CENTER!) -->
    <div class="winamp-code-panel">
      <!-- Active Voice Monitor & 16-Step Sequencer Lights -->
      <div class="strudel-monitor-bar">
        <div class="strudel-voice-badges">
          <span id="winamp-badge-kick" class="voice-badge">🥁 $KICK</span>
          <span id="winamp-badge-hat" class="voice-badge">🎩 $HAT</span>
          <span id="winamp-badge-snare" class="voice-badge">💥 $SNARE</span>
          <span id="winamp-badge-bass" class="voice-badge">🎸 $BASS</span>
          <span id="winamp-badge-melody" class="voice-badge">🎺 $MELODY</span>
        </div>

        <!-- 16-Step ReBirth Sequencer Running Light -->
        <div class="rebirth-step-lights">
          ${Array.from({length:16}, (_, i) => `
            <div id="rebirth-step-${i}" class="rebirth-led ${i%4===0?'beat-head':''}">${i+1}</div>
          `).join('')}
        </div>
      </div>

      <!-- Code Toolbar -->
      <div class="strudel-code-toolbar">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-weight:bold;color:#38bdf8;font-size:12px">📝 STRUDEL.CC LIVE CODE INTERFACE</span>
          <small style="color:#94a3b8">Superdough WebAudio Engine</small>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="winamp-btn active" onclick="executeStrudelEditor()" title="Führt den aktuellen Code sofort aus (Tastenkürzel: Strg+Enter)">⚡ RUN (Ctrl+Enter)</button>
          <button class="winamp-btn" onclick="SFX.stop()" title="Wiedergabe stoppen">⏹ STOP</button>
          <button class="winamp-btn" onclick="mutateCurrentSong()" title="Mutiert das Pattern algorithmisch">🧬 MUTIEREN</button>
          <button class="winamp-btn" onclick="saveCustomSong()" title="Speichert die bearbeitete Version dauerhaft">💾 SPEICHERN</button>
          <button class="winamp-btn" onclick="resetCurrentSong()" title="Setzt das Stück auf das Original-Skript zurück">↺ RESET</button>
          <button class="winamp-btn" onclick="applySoundbanksToCode()" title="Fügt die gewählten Soundbanks (Kick, Hat, Bass) in den Code ein">✍ SOUNDBANKS ANWENDEN</button>
        </div>
      </div>

      <!-- Code Editor with Live Flashing / Pulse -->
      <div id="strudel-editor-wrapper" class="strudel-editor-wrapper">
        <textarea id="strudel-editor" class="strudel-code" spellcheck="false" onfocus="WINAMP.userEditing=true" onblur="WINAMP.userEditing=false" onkeydown="handleEditorKeyDown(event)">${curCode}</textarea>
      </div>
    </div>

    <!-- Playlist Tabs -->
    <div class="winamp-tabs">
      <button class="winamp-tab ${WINAMP.tab==='sa'?'on':''}" onclick="WINAMP.tab='sa';showStrudelModal()">⚡ Switch Angel (20)</button>
      <button class="winamp-tab ${WINAMP.tab==='theme'?'on':''}" onclick="WINAMP.tab='theme';showStrudelModal()">🎺 Theme &amp; MIDI (6)</button>
      <button class="winamp-tab ${WINAMP.tab==='core'?'on':''}" onclick="WINAMP.tab='core';showStrudelModal()">🏛 SGC Core (7)</button>
      <button class="winamp-tab ${WINAMP.tab==='seed'?'on':''}" onclick="WINAMP.tab='seed';showStrudelModal()">💾 Eigene &amp; Seed</button>
      <button class="winamp-tab ${WINAMP.tab==='settings'?'on':''}" onclick="WINAMP.tab='settings';showStrudelModal()">⚙ Haptik &amp; Tanz</button>
      <div style="flex:1"></div>
      <input type="text" id="winamp-search" placeholder="🔍 Suchen..." value="${WINAMP.searchQuery}" oninput="WINAMP.searchQuery=this.value;renderWinampPlaylistItems()" style="background:#0b111a;color:#fff;border:1px solid #374151;font-size:11px;padding:2px 6px;border-radius:3px;max-width:140px">
    </div>

    <!-- Playlist View -->
    <div id="winamp-playlist-container">
      ${renderWinampPlaylistHTML(curTrack)}
    </div>

    <!-- Bottom status bar -->
    <div style="padding:6px 10px;background:#111827;border-top:1px solid #374151;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8">
      <span>Strudel v1.3.0 · Switch Angel Prebake · ReBirth-338 Rack · AGPL-3.0-or-later</span>
      <button class="winamp-btn" onclick="closeWinampModal()">Schließen [ESC]</button>
    </div>
  </div>`;

  WINAMP.startVis();
}

function generateNewSongFromContext(){
  if(typeof SONGGEN==='undefined'||!SONGGEN.generate)return;
  const ctx = (typeof C!=='undefined'&&C.active) ? SONGGEN.fromCombat(C,S) : null;
  const res = ctx || SONGGEN.generate({
    team: S ? S.roster.filter(m=>m.recruited&&!m.dead).map(m=>m.name).slice(0,4) : ['Jack O\'Neill','Samantha Carter'],
    planet: (typeof COLONY_UI!=='undefined'&&COLONY_UI.planet) || 'abydos',
    theme: 'desert',
    enemies: { jaffa: 6, elite: 2 },
    weapons: ['rifle','zat','staff'],
    day: S ? S.day : 1,
    title: 'SGC Seed Live Generation'
  });
  if(res && res.code){
    if(typeof STRUDEL!=='undefined'){
      STRUDEL.patterns.generated_seed = res.code;
      STRUDEL.currentTrack = 'generated_seed';
      STRUDEL.lastCode = res.code;
      if(typeof SFX!=='undefined') SFX.playTrack('generated_seed');
    }
    toast(`🎲 Neuer Song aus Seed ${res.seed.toString(16).toUpperCase()} generiert (${res.scale}, ${res.bpm} BPM)!`);
    WINAMP.tab = 'seed';
    showStrudelModal();
  }
}

function mutateCurrentSong(){
  if(typeof STRUDEL==='undefined'||typeof STRUDEL.mutateCode!=='function')return;
  const curCode = STRUDEL.currentCode || '';
  const mutated = STRUDEL.mutateCode(curCode, 0.6);
  STRUDEL.evaluate(mutated, true);
  toast('🧬 Soundtrack generativ mutiert!');
  showStrudelModal();
}

function saveCustomSong(){
  const ed = $('strudel-editor');
  const code = ed ? ed.value : (STRUDEL.currentCode || '');
  if(typeof STRUDEL!=='undefined'&&typeof STRUDEL.saveCustomTrack==='function'){
    const res = STRUDEL.saveCustomTrack(`Remix ${STRUDEL.currentTrack}`, code);
    if(res && res.ok){
      toast(res.msg);
      WINAMP.tab = 'seed';
      showStrudelModal();
    }
  }
}

function toggleAudioDance(){
  if(typeof S!=='undefined'&&S){
    S.audioDance = (S.audioDance === false) ? true : false;
    save();
    toast(`🎵 Spielfeld-Tanzen: ${S.audioDance ? 'AN (Audio-Reaktiv)' : 'AUS'}`);
    showStrudelModal();
  }
}

function toggleControllerRumble(){
  if(typeof S!=='undefined'&&S){
    S.controllerVibration = (S.controllerVibration === false) ? true : false;
    save();
    toast(`🎮 Controller-Vibration: ${S.controllerVibration ? 'AN' : 'AUS'}`);
    showStrudelModal();
  }
}

// ===================== Tastenbelegung (Controls & Remapping) =====================
let remappingAction = null;

function showKeybindModal(){
 hideMenu();
 const m=$('modal');if(!m)return;
 const binds=(typeof S!=='undefined'&&S&&S.keybinds)||defaultKeybinds();
 const labels={
  moveUp:'Kamera nach oben',
  moveDown:'Kamera nach unten',
  moveLeft:'Kamera nach links',
  moveRight:'Kamera nach rechts',
  rotateLeft:'Kamera links drehen (Q)',
  rotateRight:'Kamera rechts drehen (E)',
  cycleGfx:'Grafikmodus umschalten (V)',
  nextUnit:'Nächstes SG-Mitglied (TAB)',
  endTurn:'Runde beenden / Dialog weiter (Space)',
  pause:'Pause-Menü (ESC)',
  zoomIn:'Kamera Zoom In (+)',
  zoomOut:'Kamera Zoom Out (-)'
 };
 m.style.display='flex';
 m.innerHTML=`<div class="mbox" style="max-width:540px">
  <h3>⌨ TASTATUR &amp; TASTENBELEGUNG</h3>
  <div class="mbody">
   <p style="color:#94a3b8;margin-bottom:8px">Klicke auf "Ändern", um eine Taste frei neu zuzuweisen. Gespeichert im Profil.</p>
   <table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:13px">
    <thead><tr style="border-bottom:1px solid #334155;color:#e8b040;text-align:left"><th style="padding:6px">Aktion</th><th style="padding:6px">Aktuelle Taste</th><th style="padding:6px;text-align:right">Aktion</th></tr></thead>
    <tbody>
      ${Object.entries(labels).map(([actKey,label])=>{
        const curKey=binds[actKey]||'-';
        const isRemap=remappingAction===actKey;
        return `<tr style="border-bottom:1px solid #1e293b">
          <td style="padding:6px">${label}</td>
          <td style="padding:6px"><code style="background:#0f172a;padding:3px 8px;border-radius:4px;color:${isRemap?'#38bdf8':'#4ade80'};border:1px solid ${isRemap?'#38bdf8':'#334155'}">${isRemap?'Taste drücken...':curKey}</code></td>
          <td style="padding:6px;text-align:right"><button class="small" onclick="startRemapKey('${actKey}')">${isRemap?'Abbrechen':'Ändern'}</button></td>
        </tr>`;
      }).join('')}
    </tbody>
   </table>
   <div style="display:flex;gap:8px;margin-top:10px">
    <button class="small" onclick="resetKeybinds()">↺ Standard wiederherstellen</button>
    <div style="flex:1"></div>
    <button onclick="$('modal').style.display='none';remappingAction=null">Fertig</button>
   </div>
  </div>
 </div>`;
}

function startRemapKey(action){
 if(remappingAction===action)remappingAction=null;
 else remappingAction=action;
 showKeybindModal();
}

function resetKeybinds(){
 if(typeof S!=='undefined'&&S)S.keybinds=defaultKeybinds();
 try{localStorage.removeItem('sgc_keybinds');}catch(e){}
 remappingAction=null;
 toast('Tastenbelegung auf Standard zurückgesetzt.');
 showKeybindModal();
}

// ===================== Hilfe-Modal =====================
function showHelp(){
 hideMenu();
 const m=$('modal');
 m.style.display='flex';
 m.innerHTML=`<div class="mbox help">
  <h3>📖 ANLEITUNG · ISOMETRISCH VOXEL &amp; ASCII EDITION</h3>
  <div class="mbody">
   <h4>🖥 GRAFIK-MODI (PIXEL-VOXEL &amp; ASCII-3D)</h4>
   <div>Schalte jederzeit oben über <b>🖥 PIXEL / ⌨ ASCII</b>, mit der Taste <b>V</b> oder im Pause-Menü (ESC) zwischen der <b>Isometrischen Voxel-Pixel-Grafik</b> und dem <b>3D-ASCII-Modus</b> (inspiriert von <code>asciiid</code> / <code>asciicker</code>) um. Mit <b>Q</b> und <b>E</b> drehst du die isometrische Kamera um 90°!</div>
   <h4>🏗 BASIS &amp; OFFWORLD-BASENBAU (C&amp;C / SimCity)</h4>
   <div>Im Cheyenne Mountain baust du Räume, fertigst in der <b>Waffenkammer/Werkbank</b> neue Ausrüstung (P90, Zat, Rüstungen, Medkits, Schilde, EMP) und klickst Räume für die <b>begehbare Innenansicht</b> an. Auf Offworld-Missionen kannst du im Kampf über <b>🏗 Feld-Bau</b> direkt <b>Barrikaden, Auto-Geschütztürme, Naquadah-Feldreaktoren und Bunker</b> errichten!</div>
   <h4>⚔ KAMPF (Syndicate / X-COM / Jagged Alliance)</h4>
   <div><b>1.</b> Klicke auf eine deiner Einheiten → <span style="color:#4fc3f7">BLAU</span> = Bewegungsfelder.</div>
   <div><b>2.</b> Klicke ein <span style="color:#4fc3f7">BLAUES FELD</span> → Bewegung (1 AP).</div>
   <div><b>3.</b> Klicke einen <span style="color:#ef4444">ROTEN GEGNER (✛)</span> → Schießen (1 AP).</div>
   <div><b>4.</b> Nutze <b>💊/🛡/💨/⚡ Spezial-Items</b> oder <b>⏸ Warten</b>.</div>
   <h4>🎵 STRUDEL SOUND-ENGINE</h4>
   <div>Klicke oben auf <b>🎵</b>, um die integrierte Strudel-Live-Coding-Konsole zu öffnen, eigene Synth-Patterns zu schreiben oder zwischen den 6 dynamischen Soundtracks zu wechseln.</div>
  </div>
  <button onclick="$('modal').style.display='none'">Verstanden</button>
 </div>`;
}

// ===================== Header =====================
function renderHeader(){
 const ch=CHAPTERS[S.chapter];
 $('res').innerHTML=Object.keys(S.res).map(k=>`<span class="res" title="${RES_DE[k]}">${RES_ICON[k]} ${Math.floor(S.res[k])}</span>`).join('')+
  `<span class="res" title="Forschungspunkte">🔬 ${Math.floor(S.research.rp)}</span>`;
 const cmd=(typeof COMMANDERS!=='undefined'&&COMMANDERS[S.commander])||COMMANDERS.hammond;
 $('chap').innerHTML=`<b>${ch.title}</b><small>${ch.sub} · 🎖 ${cmd.name}</small>`;
 const pw=powerGen(),pu=powerUse();
 const D=diff();
 $('round').innerHTML=`Tag <b>${S.day}</b> · <span class="integ" title="Power">⚡ ${pw>=pu?pw-pu:0}/${pw} ${bar(pw>=pu?100:pu/pw*100,pw>=pu?'#4ade80':'#ef4444')}</span> · <span class="diff" style="color:${D.color}" title="Schwierigkeit (im Pause-Menü änderbar)">⚔ ${D.name}</span>`;
 const gb=$('gfx-btn');
 if(gb){
  const gm=typeof getGfxMode==='function'?getGfxMode():'pixel';
  gb.textContent=gm==='ascii'?'⌨ ASCII':gm==='topdown'?'🗺 2D':'🖥 PIXEL';
 }
 $('go').disabled=!!S.over||C.active||GR.phase!=='idle';
}

// ===================== Basis (Shelter-Grid + Raum-Innenansicht + Crafting) =====================
function renderBaseSide(){
 const pw=powerGen(),pu=powerUse(),ok=pw>=pu;
 const headlines=[
  'Kantine meldet: Blauer Wackelpudding stabil. O’Neill zufrieden.',
  'Aufzugverkehr normal. Niemand hat den Knopf zum 28. Stock gefunden.',
  'Forschung testet neue Strudel-Subraum-Harmonien im Labor.',
  'Sicherheitsstufe bleibt gleich. Die Formulare wurden trotzdem verdoppelt.',
  'Wurmloch-Team bittet darum, den blauen Ereignishorizont nicht anzufassen.'
 ];
 const headline=headlines[(Math.max(1,S.day)-1)%headlines.length];
 const activeStaff=S.roster.filter(m=>m.recruited&&!m.dead).length;
 let h=`<section class="base-news" aria-label="Mountain Network Nachrichten">
  <div class="base-news-head"><span>⦿ MOUNTAIN NETWORK</span><b><i></i> NACHRICHTEN</b></div>
  <div class="base-news-tag">AUSGABE ${String(S.day).padStart(2,'0')} · CHEYENNE MOUNTAIN</div>
  <div class="base-news-title">${headline}</div>
  <div class="base-news-footer"><span>PERSONAL <b>${activeStaff}</b></span><span>GRAFIK <b>${(S.gfxMode||'pixel').toUpperCase()}</b></span></div>
 </section>`;
 // Wenn ein Raum ausgewählt ist: Begehbare Innenansicht anzeigen (ROADMAP §1.5.3)
 if(B.selRoom&&S.base.rooms[B.selRoom]){
  const selR=S.base.rooms[B.selRoom];
  h+=`<div class="item" style="border-color:#4fc3f7;padding:6px">
   <canvas id="room-interior-cv" width="290" height="128" style="width:100%;height:auto;border:1px solid #33465f"></canvas>
  </div>`;
 }
 h+=`<div style="display:flex;gap:6px;margin-bottom:6px">
  <button style="flex:1;border-color:#e8b040;color:#e8b040" onclick="showClipboardModal()">📋 Hammonds Büro &amp; Klemmbrett</button>
  ${S.roster[12]&&S.roster[12].recruited?`<button ${S.sandUsed?'disabled':''} onclick="act(sandwich())" title="1× pro Kapitel: +20 Moral, −20 Erschöpfung">🥪 Sandwich</button>`:''}
 </div>`;
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
 // Waffenkammer & Werkbank (INVENTAR-SPEC.md)
 if(typeof RECIPES!=='undefined'&&S.inventory){
  h+=`<h3>🔧 Arsenal &amp; Werkbank</h3><div class="bgrid">`+Object.entries(RECIPES).map(([k,rec])=>{
   const cost=Object.entries(rec.cost).map(e=>RES_ICON[e[0]]+e[1]).join(' ');
   const count=(S.inventory[rec.cat]&&S.inventory[rec.cat][rec.item])||0;
   const locked=rec.req&&!S.research.done.includes(rec.req);
   return `<button class="item" style="text-align:left" ${locked?'disabled':''} onclick="act(craftItem('${k}'))">
    <b>${rec.name}</b> <span class="tag" style="float:right;background:#1a2535;color:#4ade80">Lager: ${count}</span><br>
    <small>${cost}${locked?` · 🔒 ${rec.req}`:''}</small>
   </button>`;
  }).join('')+`</div>`;
 }
 h+=`<h3>Räume <small>(Klick = Innenansicht)</small></h3>`;
 const rooms=Object.values(S.base.rooms);
 h+=rooms.map(r=>{
  const R=ROOMS[r.type],out=roomOutput(r);
  const staff=r.staff.map(id=>S.roster[id]).filter(m=>m&&m.recruited&&!m.dead);
  return `<div class="item ${B.selRoom===r.id?'warnbox':''}" style="cursor:pointer" onclick="B.selRoom=${r.id};renderAll()">
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
 $('base-side').innerHTML=h;
 if(B.selRoom&&S.base.rooms[B.selRoom]&&typeof drawRoomInteriorCanvas==='function'){
  drawRoomInteriorCanvas($('room-interior-cv'),S.base.rooms[B.selRoom]);
 }
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
function selectTeamPreset(teamId){
 document.querySelectorAll('.tpick').forEach(cb=>{
  const m=S.roster[parseInt(cb.value)];
  if(m&&!cb.disabled){
   const mt=m.team||(m.sg1?'sg1':'sg2');
   cb.checked=(mt===teamId);
  }
 });
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
 if(!disc){h+=`<p class="dim">Ein ungewähltes Gate-Signal.</p><button onclick="discover('${MAP.sel}');act({ok:true})">🛰 Sonde senden</button>`;$('map-side').innerHTML=h;return;}
 h+=`<p>${TYPE_DE[P.type]}</p>`;
 const ms=openMissions().filter(m=>m.planet===MAP.sel);
 if(ms.length){
  ms.forEach(m=>{
   h+=`<div class="item"><b>${m.name}</b><br><small>${m.goal}<br>${m.peaceful?'Missionstyp: Friedlicher Erstkontakt · keine Feinde':`Gegner: ${Object.entries(m.enemies).map(e=>e[1]+'× '+ENEMY_DE[e[0]]).join(', ')||'keine'}`}<br>${m.peaceful?'Zivilisten ansprechen und den Dialog abschließen.':m.tutorial?'Tutorial: Bewegung · Deckung · Schießen · Aktionspunkte · Teal’c':'Ende: Sieg (100%) oder Extraktion am Gate (50%)'}<br>Beute: ${Object.entries(m.reward).map(e=>RES_ICON[e[0]]+e[1]).join(' ')||'–'}</small></div>`;
  });
  const avail=S.roster.filter(m=>m.recruited&&!m.dead);
  h+=`<h3>Team-Auswahl <small>(max 6)</small></h3>`;
  if(!ms[0].tutorial&&typeof SG_TEAMS!=='undefined'){
   h+=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">`+
    Object.entries(SG_TEAMS).map(([tid,ti])=>`<button class="small" style="border-color:${ti.color};color:${ti.color}" onclick="selectTeamPreset('${tid}')">${ti.name}</button>`).join('')+
    `</div>`;
  }
  h+=`<div id="team-pick">`+
   avail.map(m=>{
    const mt=m.team||(m.sg1?'sg1':'sg2');
    const ti=SG_TEAMS&&SG_TEAMS[mt];
    return `<label class="gl"><input type="checkbox" class="tpick" value="${m.id}" ${(ms[0].tutorial||mt==='sg1')?'checked':''} ${ms[0].tutorial?'disabled':''}> ${pic(m)} <span>${m.name.split(' ')[0]}</span> <small style="color:${ti?ti.color:'#8a9ab0'}">${ti?ti.name:''} · 🔫${WEAPONS[m.weapon]?WEAPONS[m.weapon].name:m.weapon}</small></label>`;
   }).join('')+`</div>`;
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
 if(typeof SFX!=='undefined')SFX.music('gate');
 playGate([mission.planet],[{planet:mission.planet,members:teamIds}],()=>{
  $('gate-overlay').style.display='none';
  startCombat(mission,teamIds);
  document.body.style.overflow='hidden';
  $('combat-overlay').style.display='flex';
  $('combat-end').style.display='none';
  if(typeof SFX!=='undefined'){
   if(mission.peaceful) SFX.music('peaceful');
   else if(mission.type==='boss'||(mission.enemies&&mission.enemies.goauld)) SFX.music('boss');
   else if(typeof SONGGEN!=='undefined'&&SONGGEN.fromCombat){
    const gen=SONGGEN.fromCombat(C,S);
    if(gen&&typeof STRUDEL!=='undefined'){
      STRUDEL.patterns.generated_mission=gen.code;
      SFX.playTrack('generated_mission');
    }else{
      SFX.music('combat');
    }
   }else{
    SFX.music('combat');
   }
  }
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

function getCombatTileFromMouse(cv,mx,my){
 const gm=typeof getGfxMode==='function'?getGfxMode():'pixel';
 if(gm!=='topdown'&&typeof isoScreenToTile==='function'){
  return isoScreenToTile(mx,my,cv.width,cv.height);
 }
 return {x:Math.floor(mx/TILE)+C.cameraX,y:Math.floor(my/TILE)+C.cameraY};
}

function combatClick(e){
 if(C.justPanned){C.justPanned=false;return;}
 if(!C.active||C.result)return;
 const cv=$('combat-cv'),r=cv.getBoundingClientRect(),sx=cv.width/r.width,sy=cv.height/r.height;
 const mx=(e.clientX-r.left)*sx,my=(e.clientY-r.top)*sy;
 const hit=getCombatTileFromMouse(cv,mx,my);
 const tx=hit.x,ty=hit.y;
 if(!inB(tx,ty))return;
 // Offworld Base Building (Command & Conquer / SimCity Feld-Bau)
 if(C.buildType&&typeof placeOffworldBuilding==='function'){
  const res=placeOffworldBuilding(C.buildType,tx,ty);
  C.buildType=null;
  act(res);
  return;
 }
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
 C.hover=getCombatTileFromMouse(cv,mx,my);
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
 if(typeof SFX!=='undefined')SFX.music(UI.tab==='map'?'map':'base');
 showReport();
}

// ===================== Jagged-Alliance-Style Combat UI + C&C Offworld Build =====================
function renderCombatUI(){
 const panel=$('combat-ui');if(!panel)return;
 if(!C.active||C.result){panel.style.display='none';return;}
 panel.style.display='flex';
 const sel=C.selected;
 let h='';
 if(sel){
  const m=S.roster[sel.charId];
  const w=WEAPONS[sel.weapon];
  const ar=ARMORS[sel.armor||'light'];
  const sp=sel.special&&SPECIALS[sel.special];
  h+=`<div class="cui-left">
   <div class="cui-portrait">${m?pic(m,'pt big'):''}</div>
   <div class="cui-info">
    <div class="cui-name">${sel.name} ${sel.shieldTurns>0?'<span class="tag" style="background:#0284c7;color:#fff">🛡 SCHILD</span>':''}</div>
    <div class="cui-class">${CLASS_DE[sel.cls]} · Lv ${m?m.lvl:'?'} · 🛡 ${ar?ar.name:'Leicht'}</div>
    <div class="cui-bars">
     <div>HP ${bar(sel.hp/sel.maxHp*100,sel.hp>sel.maxHp*0.3?'#4ade80':'#ef4444')} ${sel.hp}/${sel.maxHp}</div>
     <div>AP <span class="cui-ap">${'●'.repeat(sel.ap)}${'○'.repeat(2-sel.ap)}</span></div>
    </div>
    <div class="cui-weapon">${w?`<img class="cui-wspr" src="${weaponSprite(sel.weapon)}" alt="">`:''}${w?w.name:'–'} ${w?w.min+'–'+w.max:''} (R.${w?w.range:''})</div>
    ${sel.melee?`<div class="cui-melee">⚔ ${WEAPONS[sel.melee]?WEAPONS[sel.melee].name:'Melee'}</div>`:''}
   </div>
  </div>`;
 } else {
  h+=`<div class="cui-left"><div class="cui-info"><div class="cui-name" style="color:#6b7a90">Keine Einheit ausgewählt</div><div class="cui-class">Klicke auf einen Agenten (Q/E = Kamera · V = Pixel/ASCII)</div></div></div>`;
 }
 h+=`<div class="cui-actions">`;
 h+=`<button class="cui-btn" style="border-color:#4fc3f7;color:#4fc3f7;font-weight:bold" onclick="cycleSGMember(1)" title="Nächstes Team-Mitglied auswählen [TAB]">⏭ Nächstes SG-Mitglied [TAB]</button>`;
 if(sel&&sel.ap>0&&!C.result){
  h+=`<button class="cui-btn" onclick="if(C.selected)playerWait(C.selected)">⏸ Warten</button>`;
  h+=`<button class="cui-btn" onclick="if(C.selected)playerSelect(C.selected)">🔄 Neu wählen</button>`;
  if(sel.special&&!sel.specialUsed&&SPECIALS[sel.special]){
   const sp=SPECIALS[sel.special];
   h+=`<button class="cui-btn" style="border-color:#38bdf8;color:#38bdf8" onclick="if(C.selected){act(useSpecial(C.selected));renderCombatUI();}" title="${sp.desc}">${sp.icon} ${sp.name}</button>`;
  }
 }
 // Offworld Base Building (C&C / SimCity Feld-Pionierbau)
 if(typeof OFFWORLD_BUILDINGS!=='undefined'&&!C.mission.peaceful){
  Object.entries(OFFWORLD_BUILDINGS).forEach(([bk,bdef])=>{
   const on=C.buildType===bk;
   const costStr=Object.entries(bdef.cost).map(([rk,rv])=>RES_ICON[rk]+rv).join(' ');
   h+=`<button class="cui-btn ${on?'on':''}" style="padding:6px 10px;font-size:12px" onclick="C.buildType=C.buildType==='${bk}'?null:'${bk}';renderCombatUI()" title="${bdef.desc} (${costStr})">${bdef.icon} ${bdef.name}</button>`;
  });
 }
 // Isometric Camera & Pixel/ASCII Controls
 const gm=typeof getGfxMode==='function'?getGfxMode():'pixel';
 h+=`<button class="cui-btn" style="padding:6px 10px" onclick="if(typeof rotateIsoCamera==='function')rotateIsoCamera(-1)" title="Kamera links drehen (Q)">↶ Q</button>`;
 h+=`<button class="cui-btn" style="padding:6px 10px" onclick="if(typeof rotateIsoCamera==='function')rotateIsoCamera(1)" title="Kamera rechts drehen (E)">↷ E</button>`;
 h+=`<button class="cui-btn" style="padding:6px 10px;border-color:#4ade80;color:#4ade80" onclick="cycleGfxMode()" title="Zwischen Pixel-Voxel und 3D-ASCII wechseln (V)">${gm==='ascii'?'⌨ ASCII':'🖥 PIXEL'}</button>`;
 h+=`<button class="cui-btn" style="padding:6px 10px" onclick="showHelp()">❓</button>`;
 h+=`</div>`;
 const g=gateReady();
 const gReady=g.at===g.total&&g.total>0;
 h+=`<div class="cui-right">
  <div class="cui-gate">${C.mission&&C.mission.peaceful?`🤝 Erstkontakt: ${C.contactComplete?'hergestellt':'goldene Person ansprechen'}`:C.mission&&C.mission.tutorial?'🎯 Ziel: Teal’c sicher herausbringen':`🌀 Gate: <b style="color:${gReady?'#4ade80':'#8a9ab0'}">${g.at}/${g.total}</b> ${gReady?'bereit':'am Gate'}`}</div>
  ${gReady&&!(C.mission&&(C.mission.tutorial||C.mission.peaceful))?`<button class="cui-btn cui-btn-go" onclick="extract()">🌀 Extrahieren (50%)</button>`:''}
  <div class="cui-log">${C.log.slice(0,4).map(l=>`<div class="${/✔|💀|🌀/.test(l)?'ok':/⚠|⚡/.test(l)?'bad':''}">${l}</div>`).join('')}</div>
 </div>`;
 panel.innerHTML=h;
}

// ===================== Roster & Arsenal (INVENTAR-SPEC + SG-Teams) =====================
function renderRoster(){
 const rec=S.roster.filter(m=>m.recruited);
 let topHtml='';
 // Quest-Panel
 const qs=(S.quests||[]);
 if(qs.length){
  topHtml+=`<div style="grid-column:1/-1;background:#0f1622;border:1px solid #243248;border-radius:6px;padding:8px;margin-bottom:4px"><h3 style="margin:0 0 6px">📋 Quests</h3>`+
   qs.map(q=>{
    const col=q.status==='done'?'#4ade80':q.status==='failed'?'#f87171':'#4fc3f7';
    const ico=q.status==='done'?'✔':q.status==='failed'?'💀':'📌';
    return `<div class="item" style="border-color:${col}"><b style="color:${col}">${ico} ${q.title}</b> <small>${q.char} · Kap. ${q.chapter}</small><br><small>${q.status==='active'?q.intro:q.status==='done'?q.epilogue:q.fail}</small></div>`;
   }).join('')+`</div>`;
 }
 // Inventar-Übersicht & Schnell-Werkbank
 if(S.inventory){
  const invW=Object.entries(S.inventory.weapons||{}).filter(([,v])=>v>0).map(([k,v])=>`🔫 ${WEAPONS[k]?WEAPONS[k].name:k}: <b>${v}</b>`).join(' · ')||'Standardwaffen unbegrenzt';
  const invA=Object.entries(S.inventory.armor||{}).filter(([,v])=>v>0).map(([k,v])=>`🛡 ${ARMORS[k]?ARMORS[k].name:k}: <b>${v}</b>`).join(' · ')||'Leichte Weste unbegrenzt';
  const invS=Object.entries(S.inventory.specials||{}).filter(([,v])=>v>0).map(([k,v])=>`${SPECIALS[k]?SPECIALS[k].icon:''} ${SPECIALS[k]?SPECIALS[k].name:k}: <b>${v}</b>`).join(' · ')||'Keine Spezial-Items';
  topHtml+=`<div style="grid-column:1/-1;background:#0f1622;border:1px solid #33465f;border-radius:6px;padding:10px;margin-bottom:4px">
   <div style="display:flex;justify-content:space-between;align-items:center">
    <h3 style="margin:0">🎒 SGC-Waffenkammer &amp; Team-Ausrüstung</h3>
    <button class="small" onclick="showClipboardModal()">📋 Hammonds Klemmbrett öffnen</button>
   </div>
   <div style="font-size:12px;margin-top:6px;color:#cbd8e4">
    <div><b>Waffen-Lager:</b> ${invW}</div>
    <div><b>Rüstungs-Lager:</b> ${invA}</div>
    <div><b>Spezial-Items:</b> ${invS}</div>
   </div>
  </div>`;
 }
 const cardsHtml=rec.map(m=>{
  const dos=typeof DOSSIERS!=='undefined'&&DOSSIERS[m.name];
  const curTeam=m.team||(m.sg1?'sg1':'sg2');
  const tInfo=SG_TEAMS&&SG_TEAMS[curTeam];
  const rangedKeys=['pistol','mp5','p90','m16','sniper','mg','shotgun','zat','staff','rifle','hammer'];
  const meleeKeys=['knife','blade','chakram'];
  return `<div class="rc" title="${m.talent}">${pic(m,'pt big')}<div class="ri" style="flex:1">
   <div style="display:flex;justify-content:space-between;align-items:center">
    <b>${m.name}</b>
    <span class="tag" style="background:#14202e;border:1px solid ${tInfo?tInfo.color:'#4fc3f7'};color:${tInfo?tInfo.color:'#4fc3f7'}">${tInfo?tInfo.name:'SG'}</span>
   </div>
   <small>${CLASS_DE[m.cls]} · Lv ${m.lvl}${m.injuries?` · 🩹${m.injuries}`:''}</small>
   <div class="bars">❤${bar(m.hp/m.maxHp*100,'#4ade80')} 💤${bar(m.fatigue,'#facc15')} ☺${bar(m.morale,'#60a5fa')}</div>
   <small class="tal">${m.talent}</small>
   <div class="loadout-grid">
    <select title="Station / Raum" onchange="act(assignRoom(${m.id},parseInt(this.value)))"><option value="-1" ${m.room<0?'selected':''}>🏢 Bereitschaft</option>
     ${Object.values(S.base.rooms).map(r=>`<option value="${r.id}" ${m.room===r.id?'selected':''}>🏢 ${ROOMS[r.type].name}</option>`).join('')}</select>
    <select title="SG-Team" onchange="act(assignTeam(${m.id},this.value))">
     ${Object.entries(SG_TEAMS).map(([tid,ti])=>`<option value="${tid}" ${curTeam===tid?'selected':''}>🎖 ${ti.name}</option>`).join('')}
    </select>
    <select title="Primärwaffe" onchange="act(equipItem(${m.id},'weapon',this.value))">
     ${rangedKeys.filter(k=>WEAPONS[k]).map(k=>{
      const cnt=(S.inventory&&S.inventory.weapons&&S.inventory.weapons[k])||0;
      const unlim=['pistol','mp5','m16','sniper','shotgun'].includes(k);
      return `<option value="${k}" ${m.weapon===k?'selected':''}>🔫 ${WEAPONS[k].name}${unlim?'':` (${cnt})`}</option>`;
     }).join('')}
    </select>
    <select title="Rüstung" onchange="act(equipItem(${m.id},'armor',this.value))">
     ${Object.entries(ARMORS).map(([ak,av])=>{
      const cnt=(S.inventory&&S.inventory.armor&&S.inventory.armor[ak])||0;
      return `<option value="${ak}" ${(m.armor||'light')===ak?'selected':''}>🛡 ${av.name}${ak==='light'?'':` (${cnt})`}</option>`;
     }).join('')}
    </select>
    <select title="Spezial-Item" onchange="act(equipItem(${m.id},'special',this.value))">
     <option value="" ${!m.special?'selected':''}>🎒 Kein Item</option>
     ${Object.entries(SPECIALS).map(([sk,sv])=>{
      const cnt=(S.inventory&&S.inventory.specials&&S.inventory.specials[sk])||0;
      return `<option value="${sk}" ${m.special===sk?'selected':''}>${sv.icon} ${sv.name} (${cnt})</option>`;
     }).join('')}
    </select>
    ${dos?`<button class="small" onclick="showDossier(${m.id})" title="Personalakte öffnen">📋 Akte</button>`:`<span></span>`}
   </div>
  </div></div>`;
 }).join('');
 const waiting=S.roster.filter(m=>!m.recruited);
 let waitHtml='';
 if(waiting.length){
  waitHtml=`<div class="dim" style="grid-column:1/-1;margin-top:8px">📋 Rekrutierungsbüro – ${waiting.length} Kandidaten warten auf ihre Episode</div>`+
   waiting.map(m=>`<div class="rc dim" title="${m.talent}">${pic(m,'pt big')}<div class="ri">
    <b>${m.name}</b> <small>${CLASS_DE[m.cls]} · wird in einer Mission rekrutiert</small>
    <small class="tal">${m.talent}</small></div></div>`).join('');
 }
 $('roster-body').innerHTML=topHtml+cardsHtml+waitHtml;
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

// ===================== Offworld Kolonie-Verwaltung (Civ / SimCity Layer) =====================
const COLONY_UI={
  planet:'alpha',
  selX:2,
  selY:2,
};

function renderColoniesView(){
  const cv=$('colony-cv'),side=$('colony-side');
  if(!cv||!side)return;

  if(typeof renderColonyCanvas==='function'){
    renderColonyCanvas(cv,COLONY_UI.planet);
  }

  const col=(typeof S!=='undefined'&&S.colonies&&S.colonies[COLONY_UI.planet]);
  const p=(typeof PLANETS!=='undefined'&&PLANETS[COLONY_UI.planet])||{name:COLONY_UI.planet,type:'neutral'};
  const discPlanets=Object.keys(PLANETS).filter(k=>!PLANETS[k].sgc&&S&&S.planets[k]&&S.planets[k].disc);

  let h=`<div style="padding:10px;background:#0d1520;border:1px solid #1e2e42;border-radius:6px;margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <h3 style="margin:0;color:#e8b040;font-size:14px">🪐 PLANETARE KOLONIE</h3>
      <select onchange="COLONY_UI.planet=this.value;renderColoniesView()" style="background:#141f2e;color:#fff;border:1px solid #38bdf8;padding:3px 6px;border-radius:4px;font-size:12px">
        ${discPlanets.map(pk=>`<option value="${pk}" ${COLONY_UI.planet===pk?'selected':''}>${PLANETS[pk].name} (${TYPE_DE[PLANETS[pk].type]||PLANETS[pk].type})</option>`).join('')}
      </select>
    </div>`;

  if(!col){
    h+=`<div style="padding:14px;background:#090e16;border:1px dashed #334155;border-radius:4px;text-align:center">
      <div style="font-size:13px;color:#94a3b8;margin-bottom:8px">Auf <b>${p.name}</b> ist noch kein Außenposten errichtet.</div>
      <div style="font-size:12px;color:#cbd5e1;margin-bottom:10px">Gründungskosten: <b>⛏ 40 Erz · ⚙ 20 Tech</b></div>
      <button style="background:#1f6f3a;border-color:#34c76a;padding:8px 14px;font-weight:bold" onclick="act(foundColony('${COLONY_UI.planet}'));renderColoniesView()">🪐 Außenposten gründen</button>
    </div></div>`;
    side.innerHTML=h;
    return;
  }

  const stats=getColonyStats(col);
  const pwNet=stats.power-stats.powerUsed;

  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;font-size:12px">
    <div style="background:#141f2e;padding:6px;border-radius:4px">Energie: <b style="color:${pwNet>=0?'#4ade80':'#ef4444'}">${pwNet>=0?'+':''}${pwNet} PWR</b> <small>(${stats.power}/${stats.powerUsed})</small></div>
    <div style="background:#141f2e;padding:6px;border-radius:4px">Abwehr: <b style="color:#ffd166">🛡 ${stats.defense} DEF</b></div>
    <div style="background:#141f2e;padding:6px;border-radius:4px;grid-column:span 2">Tagesertrag: <b style="color:#4ade80">⛏+${stats.yield.ore} Erz · ⚙+${stats.yield.tech} Tech · ✚+${stats.yield.medicine} Med</b></div>
  </div></div>`;

  const selSec=col.sectors?col.sectors.find(s=>s.x===COLONY_UI.selX&&s.y===COLONY_UI.selY):null;
  const bType=selSec?selSec.building:null;
  const bDef=bType?COLONY_BUILDINGS[bType]:null;

  h+=`<div style="padding:10px;background:#0d1520;border:1px solid #1e2e42;border-radius:6px">
    <div style="font-weight:bold;color:#ffd166;margin-bottom:6px">Sektor (${COLONY_UI.selX}, ${COLONY_UI.selY}) Inspektion</div>`;

  if(bDef){
    h+=`<div style="margin-bottom:8px">
      <div style="font-size:14px;color:#fff">${bDef.icon} <b>${bDef.name}</b> ${selSec.lvl>1?'<span style="color:#ffd166">'+('★'.repeat(selSec.lvl))+'</span>':''}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:2px">${bDef.desc}</div>
      <div style="font-size:11px;color:#cbd5e1;margin-top:4px">Stufe: <b>${selSec.lvl}/3</b> · Integrität: <b>${selSec.hp} HP</b></div>
    </div>
    <div style="display:flex;gap:6px">
      ${selSec.lvl<3?`<button class="small" style="background:#1f6f3a;border-color:#34c76a" onclick="act(upgradeColonySector('${COLONY_UI.planet}',${COLONY_UI.selX},${COLONY_UI.selY}));renderColoniesView()">⬆ Aufwerten (⛏${25*selSec.lvl} ⚙${15*selSec.lvl})</button>`:''}
      ${bType!=='gate'?`<button class="small" style="border-color:#ef4444;color:#f87171" onclick="act(demolishColonySector('${COLONY_UI.planet}',${COLONY_UI.selX},${COLONY_UI.selY}));renderColoniesView()">🔨 Abreißen</button>`:''}
    </div>`;
  }else{
    h+=`<div style="font-size:12px;color:#94a3b8;margin-bottom:6px">Sektor ist frei. Gebäude errichten:</div>
    <div style="display:grid;grid-template-columns:1fr;gap:4px;max-height:220px;overflow-y:auto">
      ${Object.entries(COLONY_BUILDINGS).filter(([k])=>k!=='gate').map(([bk,b])=>{
        const costStr=Object.entries(b.cost).map(([rk,rv])=>RES_ICON[rk]+rv).join(' ');
        const canAfford=Object.entries(b.cost).every(([rk,rv])=>(S.res[rk]||0)>=rv);
        return `<button class="small" style="text-align:left;display:flex;justify-content:space-between;padding:5px 8px;${canAfford?'':'opacity:0.6'}" onclick="act(buildColonySector('${COLONY_UI.planet}',${COLONY_UI.selX},${COLONY_UI.selY},'${bk}'));renderColoniesView()" title="${b.desc}">
          <span>${b.icon} ${b.name}</span>
          <span style="color:#e8b040">${costStr}</span>
        </button>`;
      }).join('')}
    </div>`;
  }
  h+=`</div>`;
  side.innerHTML=h;
}

function colonyCanvasClick(e){
  const cv=$('colony-cv');if(!cv)return;
  const rect=cv.getBoundingClientRect();
  const sx=cv.width/rect.width,sy=cv.height/rect.height;
  const mx=(e.clientX-rect.left)*sx,my=(e.clientY-rect.top)*sy;
  if(typeof colonyPickSector==='function'){
    const hit=colonyPickSector(cv,COLONY_UI.planet,mx,my);
    if(hit){
      COLONY_UI.selX=hit.x;
      COLONY_UI.selY=hit.y;
      sfx('click');
      renderColoniesView();
    }
  }
}

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
 else if(UI.tab==='colonies'){renderColoniesView();}
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
  const mb=$('menu-sound');if(mb)mb.textContent=muted?'🔇 Sound (Stumm)':'🔊 Sound an/aus';
 }
}

// ===================== Frame-Loop =====================
function frame(now){
 if(UI.menuOpen){requestAnimationFrame(frame);return;}
 if(C.active){
  renderCombat($('combat-cv'));
  renderCombatUI();
  resizeCombatViewport();
  $('combat-end').style.display=C.result?'inline-block':'none';
 }
 else if(GR.phase!=='idle'&&GATE_STATE){drawGateroom($('gate-cv'),now,GATE_STATE);}
 else if(UI.tab==='base'){
  renderBase($('base-cv'));
  if(B.selRoom&&S.base.rooms[B.selRoom]&&$('room-interior-cv')&&typeof drawRoomInteriorCanvas==='function'){
   drawRoomInteriorCanvas($('room-interior-cv'),S.base.rooms[B.selRoom]);
  }
 }
 else if(UI.tab==='map'){drawMap($('map-cv'),now);}
 else if(UI.tab==='colonies'){renderColoniesView();}
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
 if($('colony-cv'))$('colony-cv').onclick=colonyCanvasClick;
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
 if($('gfx-btn'))$('gfx-btn').onclick=cycleGfxMode;
 if($('clipboard-btn'))$('clipboard-btn').onclick=showClipboardModal;
 if($('strudel-btn'))$('strudel-btn').onclick=showStrudelModal;

 // Tastatursteuerung (inkl. Q/E für Iso-Rotation, V für Pixel/ASCII Toggle, TAB für nächstes Mitglied, freie Belegung)
 document.addEventListener('keydown',e=>{
  if(remappingAction){
   e.preventDefault();
   if(e.key!=='Escape'){
    if(typeof S!=='undefined'&&S){
     if(!S.keybinds)S.keybinds=defaultKeybinds();
     S.keybinds[remappingAction]=e.code||e.key;
     try{localStorage.setItem('sgc_keybinds',JSON.stringify(S.keybinds));}catch(err){}
     toast(`Taste '${e.code||e.key}' für '${remappingAction}' festgelegt.`);
    }
   }
   remappingAction=null;
   showKeybindModal();
   return;
  }

  function matchesKey(actKey,ev){
   const binds=(typeof S!=='undefined'&&S&&S.keybinds)||defaultKeybinds();
   const b=binds[actKey];
   if(!b)return false;
   return ev.code===b||ev.key===b||ev.key.toUpperCase()===b.toUpperCase();
  }

  const t=document.activeElement;
  const inInput=t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA');
  if(!inInput&&(matchesKey('cycleGfx',e)||e.key==='v'||e.key==='V')&&!UI.menuOpen){
   e.preventDefault();cycleGfxMode();return;
  }
  if(C.active&&!C.result&&!C.dialogueActive&&!UI.menuOpen&&!inInput){
   if(matchesKey('rotateLeft',e)||e.key==='q'||e.key==='Q'){e.preventDefault();if(typeof rotateIsoCamera==='function')rotateIsoCamera(-1);return;}
   if(matchesKey('rotateRight',e)||e.key==='e'||e.key==='E'){e.preventDefault();if(typeof rotateIsoCamera==='function')rotateIsoCamera(1);return;}
   if(matchesKey('nextUnit',e)||e.key==='Tab'||e.key==='n'||e.key==='N'){e.preventDefault();if(typeof cycleSGMember==='function')cycleSGMember(1);return;}
   if(matchesKey('zoomIn',e)||e.key==='+'){e.preventDefault();if(typeof zoomIsoCamera==='function')zoomIsoCamera(0.1);return;}
   if(matchesKey('zoomOut',e)||e.key==='-'){e.preventDefault();if(typeof zoomIsoCamera==='function')zoomIsoCamera(-0.1);return;}

   const pans={ArrowLeft:[-2,0],a:[-2,0],A:[-2,0],ArrowRight:[2,0],d:[2,0],D:[2,0],
    ArrowUp:[0,-2],w:[0,-2],W:[0,-2],ArrowDown:[0,2],s:[0,2],S:[0,2]};
   const pan=pans[e.key];
   if(pan){e.preventDefault();combatPan(pan[0],pan[1]);return;}
  }
  if((matchesKey('endTurn',e)||e.key==='Enter'||e.key===' ')&&$('story-dialogue').style.display==='flex'){
   e.preventDefault();$('story-next')?.click();return;
  }
  if(matchesKey('pause',e)||e.key==='Escape'){
   if($('intro-overlay').style.display==='flex'||$('story-dialogue').style.display==='flex')return;
   if(inInput)return;
   toggleMenu();
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
