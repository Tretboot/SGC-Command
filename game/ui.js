
function toggleCombatAudio(){
  if(typeof SFX!=='undefined'){
    if(typeof SFX.toggle==='function') SFX.toggle();
    else if(typeof SFX.toggleMute==='function') SFX.toggleMute();
    else SFX.muted = !SFX.muted;
    if(typeof renderCombatUI==='function')renderCombatUI(true);
    const cbBtn = document.getElementById('combat-mute-btn');
    if(cbBtn) cbBtn.textContent = SFX.muted ? '🔇' : '🔊';
  }
}
window.toggleCombatAudio = toggleCombatAudio;
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
// i18n (v0.30 R3): Sprach-sensible Datenauswahl — DE = Originalfeld, EN = *En-Feld
const isEn=()=>typeof I18N!=='undefined'&&I18N.lang==='en';
const L_=(o,f)=>(!o)?'':(isEn()&&o[f+'En'])?o[f+'En']:o[f];
const RES_EN={ore:'Ore',tech:'Tech',medicine:'Medicine',food:'Food'};
const TYPE_EN={hostile:'hostile',neutral:'neutral',allied:'allied',empty:'uninhabited',base:'Base',space:'Orbit'};
const ENEMY_EN={jaffa:'Jaffa',veteran:'Veteran',elite:'Elite',goauld:"Goa'uld",repl:'Replicator',drone:'Drone',queen:'Queen'};
const clsName=c=>(isEn()?(CLASS_EN[c]||CLASS_DE[c]):CLASS_DE[c])||c;
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
  if(t==='map'){
   SFX.music('map'); // Sternenkarte: Remix 3
  }else if(t==='base'||t==='roster'||t==='log'||t==='medbay'){
   SFX.music('base'); // Basis: Remix 1
  }else if(t==='colonies'){
   SFX.music('planet');
  }
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
    <h3 style="margin:0;color:#e8b040">${I18N.T('game.dyn.clip.title')}</h3>
    <small>${I18N.T('game.dyn.clip.commander')} <b style="color:${cmd.color}">${cmd.name}</b> (${L_(cmd,'title')}) · ${I18N.T('game.dyn.clip.bonus')} ${L_(cmd,'bonus')}</small>
   </div>
   <select onchange="act(setCommander(this.value));if(typeof SFX!=='undefined'&&SFX.playTrack)SFX.playTrack('theme_promotion');toast(I18N.T('game.dyn.toast.promoted'));showClipboardModal()" style="background:#0f1622;border-color:#e8b040">
    ${Object.values(COMMANDERS).map(c=>`<option value="${c.id}" ${S.commander===c.id?'selected':''}>🎖 ${c.name}</option>`).join('')}
   </select>
  </div>
  <div class="mbody">
   <div style="background:#101824;border-left:3px solid ${cmd.color};padding:8px 12px;margin:6px 0;font-style:italic;color:#cbd8e4">${cmd.quote}</div>
   ${(S.memorial&&S.memorial.length)?`
    <div style="background:#1c0b13;border:1px solid #e11d48;border-radius:4px;padding:8px 12px;margin:6px 0;display:flex;justify-content:space-between;align-items:center">
      <div>
        <b style="color:#fda4af">${I18N.T('game.dyn.clip.memorial')}</b>
        <span style="color:#fecdd3;margin-left:6px">${S.memorial.join(', ')}</span>
      </div>
      <button class="winamp-btn" style="background:#4c0519;border-color:#f43f5e;color:#fff;padding:4px 8px;font-size:11px" onclick="if(typeof SFX!=='undefined'&&SFX.playTrack)SFX.playTrack('theme_funeral');toast(I18N.T('game.dyn.toast.funeral'))">${I18N.T('game.dyn.btn.funeral_music')}</button>
    </div>
   `:''}
   <h4>${I18N.T('game.dyn.clip.teams')}</h4>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;margin-bottom:8px">
    ${Object.entries(SG_TEAMS).map(([tid,tinfo])=>{
     const members=rec.filter(p=>(p.team||(p.sg1?'sg1':'sg2'))===tid);
     return `<div class="item" style="border-color:${tinfo.color}"><b style="color:${tinfo.color}">${tinfo.name}</b> <small>${L_(tinfo,'role')}</small><br><small>${members.map(p=>p.name.split(' ')[0]).join(', ')||I18N.T('game.dyn.clip.none')}</small></div>`;
    }).join('')}
   </div>
   <h4>${I18N.T('game.dyn.clip.overview',[rec.length])}</h4>
   <table class="clipboard-table">
    <thead><tr><th>${I18N.T('game.dyn.clip.th.name')}</th><th>${I18N.T('game.dyn.clip.th.class')}</th><th>${I18N.T('game.dyn.clip.th.team')}</th><th>${I18N.T('game.dyn.clip.th.station')}</th><th>${I18N.T('game.dyn.clip.th.status')}</th><th>${I18N.T('game.dyn.clip.th.equip')}</th></tr></thead>
    <tbody>
     ${rec.map(p=>{
      const rm=p.room>=0&&S.base.rooms[p.room]?L_(ROOMS[S.base.rooms[p.room].type],'name'):I18N.T('game.dyn.standby');
      const w=WEAPONS[p.weapon]?L_(WEAPONS[p.weapon],'name'):p.weapon;
      const ar=ARMORS[p.armor||'light']?L_(ARMORS[p.armor||'light'],'name'):I18N.T('game.dyn.cui.light');
      const sp=p.special&&SPECIALS[p.special]?SPECIALS[p.special].icon+' '+L_(SPECIALS[p.special],'name'):'–';
      const curTeam=p.team||(p.sg1?'sg1':'sg2');
      return `<tr>
       <td><b>${p.name}</b> <small>Lv.${p.lvl}</small></td>
       <td>${clsName(p.cls)}</td>
       <td><select onchange="act(assignTeam(${p.id},this.value));showClipboardModal()">${Object.entries(SG_TEAMS).map(([tid,ti])=>`<option value="${tid}" ${curTeam===tid?'selected':''}>${ti.name}</option>`).join('')}</select></td>
       <td><select onchange="act(assignRoom(${p.id},parseInt(this.value)));showClipboardModal()"><option value="-1" ${p.room<0?'selected':''}>${I18N.T('game.dyn.standby')}</option>${Object.values(S.base.rooms).map(r=>`<option value="${r.id}" ${p.room===r.id?'selected':''}>${L_(ROOMS[r.type],'name')}</option>`).join('')}</select></td>
       <td>❤ ${p.hp}/${p.maxHp} · 💤 ${p.fatigue}%</td>
       <td><small>🔫 ${w} · 🛡 ${ar} · ${sp}</small></td>
      </tr>`;
     }).join('')}
    </tbody>
   </table>
  </div>
  <div style="display:flex;justify-content:space-between;gap:8px">
   ${S.roster[12]&&S.roster[12].recruited?`<button ${S.sandUsed?'disabled':''} onclick="act(sandwich());showClipboardModal()">${I18N.T('game.dyn.btn.sandwich_clip')}</button>`:'<span></span>'}
   <button onclick="$('modal').style.display='none'">${I18N.T('game.dyn.btn.close_clip')}</button>
  </div>
 </div>`;
 m.style.display='flex';
 m.innerHTML=h;
}

// ===================== SGC Forschungslabor (Ebene 19) =====================
function showResearchModal(){
 hideMenu();
 const m=$('modal');if(!m)return;
 const qTech=S.research&&S.research.queue?getTech(S.research.queue):null;
 const rp=Math.floor((S.research&&S.research.rp)||0);

 const branches=[
  {id:'g',name:I18N.T('game.dyn.branch.g')||'Gate-Netz',icon:'🌀'},
  {id:'w',name:I18N.T('game.dyn.branch.w')||'Waffentechnik',icon:'⚡'},
  {id:'s',name:I18N.T('game.dyn.branch.s')||'Schilde',icon:'🛡'},
  {id:'a',name:I18N.T('game.dyn.branch.a')||'Antiker-Wissen',icon:'🏛'}
 ];

 let h=`<div class="mbox research-box">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #38bdf8;padding-bottom:8px">
   <div>
    <h3 style="margin:0;color:#38bdf8">🔬 SGC FORSCHUNGSLABOR &amp; ASTROPHYSIK (EBENE 19)</h3>
    <small style="color:#94a3b8">Leitung: Maj. Samantha Carter &amp; Dr. Daniel Jackson · Verfügbare Forschungspunkte: <b style="color:#38bdf8">${rp} RP</b></small>
   </div>
   <button class="winamp-btn" style="padding:4px 10px;background:#0c4a6e;border-color:#38bdf8;color:#fff" onclick="$('modal').style.display='none'">✕ ${I18N.T('game.dyn.btn.close')||'Schließen'}</button>
  </div>
  <div class="mbody" style="overflow-y:auto;padding-right:4px">
   <div style="background:#0f172a;border-left:3px solid #38bdf8;padding:8px 12px;margin:6px 0;font-style:italic;color:#cbd5e1">
    „Die Naquadah-Isotopenanalyse und Kristallmuster aus den letzten SG-Einsätzen liefern uns unschätzbare Daten. Mit jedem erfolgreichen Tor-Einsatz gewinnen wir neue Forschungspunkte (RP)!“
   </div>

   <div style="background:#082f49;border:1px solid #0284c7;border-radius:6px;padding:10px;margin:8px 0">
    <div style="display:flex;justify-content:space-between;align-items:center">
     <b style="color:#e0f2fe">${I18N.T('game.dyn.research')}:</b>
     ${qTech?`<button class="winamp-btn" style="background:#7f1d1d;border-color:#ef4444;color:#fecaca;padding:2px 8px;font-size:11px" onclick="act(setResearch(''));showResearchModal()">✕ Abbrechen</button>`:''}
    </div>
    ${qTech?`
     <div style="margin-top:6px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px">
       <b style="color:#38bdf8">${qTech.id} · ${qTech.name}</b>
       <span>${rp} / ${qTech.cost} RP (${Math.min(100,Math.floor(rp/qTech.cost*100))}%)</span>
      </div>
      <div style="background:#0b1320;height:12px;border-radius:6px;overflow:hidden;border:1px solid #0369a1">
       <div style="background:linear-gradient(90deg,#0284c7,#38bdf8);height:100%;width:${Math.min(100,Math.floor(rp/qTech.cost*100))}%;transition:width .3s"></div>
      </div>
      <div style="font-size:12px;color:#cbd5e1;margin-top:4px">${qTech.desc}</div>
     </div>
    `:`<div style="color:#94a3b8;font-size:13px;margin-top:4px">${I18N.T('game.dyn.research.none')} Wähle unten ein Projekt aus dem Forschungsbaum!</div>`}
   </div>

   <div class="research-grid">
    ${branches.map(b=>{
      const bTechs=TECH.map(t=>getTech(t)).filter(t=>t&&t.branch===b.id);
      return `
       <div style="background:#071526;border:1px solid #1e293b;border-radius:6px;padding:8px">
        <h4 style="margin:0 0 8px;color:#38bdf8;border-bottom:1px solid #1e293b;padding-bottom:4px;font-size:13px">${b.icon} ${b.name}</h4>
        <div style="display:flex;flex-direction:column;gap:6px">
         ${bTechs.map(t=>{
           const done=S.research&&S.research.done&&S.research.done.includes(t.id);
           const isQueue=S.research&&S.research.queue===t.id;
           const av=techAvailable(t);
           let statusBadge='';
           if(done)statusBadge='<span style="color:#4ade80;font-weight:bold;font-size:11px">✔ Erforscht</span>';
           else if(isQueue)statusBadge='<span style="color:#38bdf8;font-weight:bold;font-size:11px">⚙ Läuft...</span>';
           else if(av)statusBadge=`<span style="color:#facc15;font-size:11px">${t.cost} RP</span>`;
           else statusBadge=`<span style="color:#64748b;font-size:11px">🔒 Benötigt: ${t.prereq}</span>`;

           return `
            <div class="tech-card ${done?'done':''} ${isQueue?'active':''} ${(!av&&!done)?'locked':''}">
             <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <b style="font-size:12px;color:${done?'#4ade80':isQueue?'#38bdf8':'#e2e8f0'}">${t.id} ${t.name}</b>
              ${statusBadge}
             </div>
             <p style="font-size:11px;color:#94a3b8;margin:4px 0 6px">${t.desc}</p>
             ${done?'':`
              <button class="winamp-btn" style="width:100%;padding:3px;font-size:11px;${isQueue?'background:#0369a1;color:#fff':av?'background:#0f2b46;color:#38bdf8;border-color:#0284c7':'background:#1e293b;color:#475569'}" ${(!av&&!isQueue)?'disabled':''} onclick="act(setResearch('${isQueue?'':t.id}'));showResearchModal()">
               ${isQueue?'Abbrechen':av?`Erforschen (${t.cost} RP)`:'Gesperrt'}
              </button>
             `}
            </div>
           `;
         }).join('')}
        </div>
       </div>
      `;
    }).join('')}
   </div>
  </div>
 </div>`;

 m.style.display='flex';
 m.innerHTML=h;
}


// ===================== SGC Speicherstand-Verwaltung & Export/Import =====================
function showSaveModal(){
 hideMenu();
 const m=$('modal');if(!m)return;
 const slots=['slot1','slot2','slot3'];
 const active=(typeof SGC_SAVES!=='undefined'&&SGC_SAVES.activeSlot)||'slot1';

 let h=`<div class="mbox" style="width:min(880px,96vw);max-height:90vh;border-color:#e8b040;background:radial-gradient(ellipse at top,#1e293b,#0b101b 75%)">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e8b040;padding-bottom:8px">
   <div>
    <h3 style="margin:0;color:#e8b040">💾 SGC SPEICHERSTAND-VERWALTUNG (DATEN-CARTRIDGE)</h3>
    <small style="color:#94a3b8">Cheyenne Mountain Sub-Ebene 28 Archiv · Aktiver Slot: <b style="color:#e8b040">${active.toUpperCase()}</b></small>
   </div>
   <button class="winamp-btn" style="padding:4px 10px;background:#78350f;border-color:#e8b040;color:#fff" onclick="$('modal').style.display='none'">✕ ${I18N.T('game.dyn.btn.close')||'Schließen'}</button>
  </div>

  <div class="mbody" style="overflow-y:auto;padding-right:4px">
   <h4 style="margin:8px 0 6px;color:#fde047">📁 Speicher-Slots (Browser-Speicher)</h4>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;margin-bottom:14px">
    ${slots.map(sId=>{
      const info=SGC_SAVES.getSlotInfo(sId);
      const isCur=sId===active;
      return `
       <div style="background:#0f172a;border:1px solid ${isCur?'#e8b040':'#334155'};border-radius:6px;padding:10px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
         <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <b style="color:${isCur?'#e8b040':'#cbd5e1'};font-size:13px">💾 Slot ${sId.replace('slot','')} ${isCur?'<span class="tag" style="background:#78350f;color:#fef08a">Aktiv</span>':''}</b>
         </div>
         ${info?`
          <div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-bottom:8px">
           <div>Tag <b>${info.day}</b> · Kapitel <b>${info.chapter}</b> · <b>${info.commander.toUpperCase()}</b></div>
           <div>⛏ ${info.ore} · ⚙ ${info.tech} · 🔬 ${info.rp} RP · 👥 ${info.units} Soldaten</div>
          </div>
         `:`<div style="font-size:12px;color:#64748b;margin:12px 0;font-style:italic">Leer / Nicht belegt</div>`}
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
         <button class="winamp-btn" style="flex:1;background:#1e3a5f;border-color:#38bdf8;color:#e0f2fe;padding:4px" onclick="SGC_SAVES.saveToSlot('${sId}');toast('In Slot ${sId} gespeichert!');showSaveModal()">💾 Speichern</button>
         ${info?`
          <button class="winamp-btn" style="flex:1;background:#064e3b;border-color:#10b981;color:#a7f3d0;padding:4px" onclick="if(confirm('Slot ${sId} laden? Ungespeicherter Fortschritt geht verloren.')){SGC_SAVES.loadFromSlot('${sId}');renderAll();toast('Slot ${sId} geladen!');showSaveModal();}">📂 Laden</button>
          <button class="winamp-btn" style="background:#450a0a;border-color:#ef4444;color:#fca5a5;padding:4px" title="Löschen" onclick="if(confirm('Slot ${sId} wirklich löschen?')){SGC_SAVES.deleteSlot('${sId}');toast('Slot ${sId} gelöscht.');showSaveModal();}">✕</button>
         `:''}
        </div>
       </div>
      `;
    }).join('')}
   </div>

   <h4 style="margin:12px 0 6px;color:#38bdf8">📋 Cookie-Clicker Import &amp; Export (Text-String)</h4>
   <div style="background:#09101d;border:1px solid #1e293b;border-radius:6px;padding:10px;margin-bottom:14px">
    <div style="font-size:12px;color:#94a3b8;margin-bottom:6px">Kopiere deinen Speicherstand als handlichen Textcode oder füge einen Code ein:</div>
    <textarea id="sgc-save-text" style="width:100%;height:65px;background:#020617;border:1px solid #334155;color:#4ade80;font-family:monospace;font-size:11px;padding:6px;box-sizing:border-box;resize:vertical">${SGC_SAVES.exportString()}</textarea>
    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
     <button class="winamp-btn" style="background:#0e4a7b;color:#fff;padding:4px 8px;font-size:11px" onclick="const t=$('sgc-save-text');t.select();navigator.clipboard.writeText(t.value);toast('Speicher-Code in Zwischenablage kopiert!')">📋 In Zwischenablage kopieren</button>
     <button class="winamp-btn" style="background:#065f46;color:#fff;padding:4px 8px;font-size:11px" onclick="const res=SGC_SAVES.importString($('sgc-save-text').value);if(res.ok){renderAll();toast('Speicherstand erfolgreich importiert!');showSaveModal();}else{alert(res.err);}">📥 Aus Textfeld importieren</button>
     <button class="winamp-btn" style="background:#374151;color:#e5e7eb;padding:4px 8px;font-size:11px" onclick="const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='sgc-save-day'+S.day+'.json';a.click();">💾 Als .json herunterladen</button>
     <input type="file" id="sgc-save-file" accept=".json" style="display:none" onchange="const f=this.files[0];if(f){const r=new FileReader();r.onload=e=>{const res=SGC_SAVES.importString(e.target.result);if(res.ok){renderAll();toast('Datei importiert!');showSaveModal();}else{alert(res.err);}};r.readAsText(f);}">
     <button class="winamp-btn" style="background:#374151;color:#e5e7eb;padding:4px 8px;font-size:11px" onclick="$('sgc-save-file').click()">📂 .json-Datei hochladen</button>
    </div>
   </div>

   <h4 style="margin:12px 0 6px;color:#a855f7">🧪 Entwickler- &amp; Test-Presets (Sofort-Testing ohne Grind)</h4>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px">
    ${Object.entries(SGC_SAVES.presets).map(([k,p])=>`
     <div style="background:#0e1222;border:1px solid #2e1065;border-radius:6px;padding:8px;display:flex;flex-direction:column;justify-content:space-between">
      <div>
       <b style="color:#d8b4fe;font-size:12px">${p.name}</b>
       <p style="font-size:11px;color:#94a3b8;margin:4px 0 8px">${p.desc}</p>
      </div>
      <button class="winamp-btn" style="background:#581c87;border-color:#9333ea;color:#f3e8ff;padding:4px;font-size:11px" onclick="if(confirm('Test-Preset „${p.name}“ laden? Aktueller Fortschritt wird überschrieben.')){SGC_SAVES.loadPreset('${k}');renderAll();toast('Preset „${p.name}“ aktiv!');$('modal').style.display='none';}">⚡ Preset laden</button>
     </div>
    `).join('')}
   </div>
  </div>
 </div>`;

 m.style.display='flex';
 m.innerHTML=h;
}

// ===================== SGC AMP v2.80 — Winamp Retro Audio Player =====================
const WINAMP = {
  visMode: 'wave', // 'wave' | 'spectrum'
  tab: 'theme',    // 'theme' | 'core' | 'sa' | 'seed' | 'midi' | 'settings'
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

  beatPulse: 0.2,

  handleVoiceTrigger(voice, val){
    this.beatPulse = (voice === 'kick' || voice === 'sbd') ? 1.0 : Math.max(this.beatPulse || 0.2, 0.75);
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

    // Smooth beat decay
    this.beatPulse = Math.max(0.18, (this.beatPulse || 0.18) * 0.92);

    ctx.fillStyle='#040805';
    ctx.fillRect(0,0,w,h);

    // Subtle Winamp LCD grid lines
    ctx.strokeStyle='rgba(22,101,52,0.25)';
    ctx.lineWidth=1;
    ctx.beginPath();
    for(let x=0;x<w;x+=16){ctx.moveTo(x,0);ctx.lineTo(x,h);}
    for(let y=0;y<h;y+=12){ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();

    const isPlaying=(typeof STRUDEL!=='undefined'&&STRUDEL.playing&&!STRUDEL.paused);
    const analyser=(typeof SFX!=='undefined'&&SFX.analyser);

    if(!isPlaying){
      // Idle retro standby line
      ctx.strokeStyle='#14532d';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(0,h/2);
      ctx.lineTo(w,h/2);
      ctx.stroke();
      return;
    }

    if(this.visMode==='spectrum'){
      const bins=26;
      if(!this._freqBuf||(analyser&&this._freqBuf.length!==analyser.frequencyBinCount)){
        this._freqBuf=new Uint8Array(analyser?analyser.frequencyBinCount:64);
      }
      if(!this._peaks||this._peaks.length!==bins){
        this._peaks=new Float32Array(bins);
      }
      const freq=this._freqBuf;
      let hasSignal=false;
      if(analyser){
        analyser.getByteFrequencyData(freq);
        for(let i=0;i<Math.min(64,freq.length);i++){
          if(freq[i]>3){hasSignal=true;break;}
        }
      }
      const barW=Math.floor(w/bins);
      const totalBins=analyser?analyser.frequencyBinCount:64;
      const maxUsable=Math.min(totalBins,Math.floor(totalBins*0.72));

      for(let i=0;i<bins;i++){
        let v=0;
        if(hasSignal){
          const startRatio=Math.pow(i/bins,1.7);
          const endRatio=Math.pow((i+1)/bins,1.7);
          const b0=Math.floor(startRatio*maxUsable);
          const b1=Math.max(b0+1,Math.min(maxUsable,Math.ceil(endRatio*maxUsable)));
          let sum=0,count=0;
          for(let b=b0;b<b1;b++){
            sum+=freq[b]||0;
            count++;
          }
          v=(count>0?(sum/count):(freq[b0]||0))/255;
          v=Math.min(1.0,v*(1.0+(i/bins)*0.8));
        }else{
          const nowMs=performance.now()*0.005;
          const harmonic=Math.sin(nowMs*2.5+i*0.45)*0.5+0.5;
          const falloff=Math.max(0.12,1.0-(i/bins)*0.6);
          const pulse=Math.max(0.35,this.beatPulse||0.4);
          v=Math.min(1.0,harmonic*falloff*pulse);
        }

        const bH=Math.max(2,Math.floor(v*(h-4)));
        const grad=ctx.createLinearGradient(0,h,0,0);
        grad.addColorStop(0,'#16a34a');
        grad.addColorStop(0.55,'#eab308');
        grad.addColorStop(0.88,'#ef4444');
        ctx.fillStyle=grad;
        ctx.fillRect(i*barW+1,h-bH,barW-2,bH);

        // Authentic Winamp floating peak cap with gravity decay
        let curPeak=this._peaks[i]||0;
        if(bH>=curPeak){
          curPeak=bH;
        }else{
          curPeak=Math.max(0,curPeak-0.65);
        }
        this._peaks[i]=curPeak;

        if(curPeak>2){
          ctx.fillStyle=curPeak>(h*0.72)?'#fca5a5':'#86efac';
          ctx.fillRect(i*barW+1,Math.max(0,h-Math.round(curPeak)-2),barW-2,1);
        }
      }
    }else{
      // Oscilloscope Mode (authentic cathode phosphor trace)
      if(!this._timeBuf||(analyser&&this._timeBuf.length!==analyser.fftSize)){
        this._timeBuf=new Uint8Array(analyser?analyser.fftSize:256);
      }
      const timeData=this._timeBuf;
      let hasSignal=false;
      if(analyser){
        analyser.getByteTimeDomainData(timeData);
        for(let i=0;i<timeData.length;i+=4){
          if(Math.abs(timeData[i]-128)>3){hasSignal=true;break;}
        }
      }
      if(!hasSignal){
        const nowMs=performance.now();
        const pulse=Math.max(0.35,this.beatPulse||0.4);
        const cutoffMod=(typeof SFX!=='undefined'&&SFX.rebirth)?(SFX.rebirth.cutoff||2400)/2400:1;
        for(let i=0;i<timeData.length;i++){
          const t=i/timeData.length;
          const f1=Math.sin(t*8*Math.PI+nowMs*0.012)*28*pulse;
          const f2=Math.sin(t*18*Math.PI*cutoffMod-nowMs*0.022)*16*pulse;
          const noise=(Math.random()-0.5)*4*pulse;
          timeData[i]=Math.max(0,Math.min(255,Math.round(128+f1+f2+noise)));
        }
      }

      // Phosphor halo (glow pass)
      ctx.strokeStyle='rgba(74,222,128,0.35)';
      ctx.lineWidth=4;
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

      // Sharp electron beam center trace
      ctx.strokeStyle='#4ade80';
      ctx.lineWidth=1.8;
      ctx.shadowColor='#22c55e';
      ctx.shadowBlur=5;
      ctx.beginPath();
      x=0;
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
    // v0.31: nur Starter + über Planeten freigeschaltete Songs zeigen
    if(typeof MUSIC_PROGRESS!=='undefined')list=MUSIC_PROGRESS.filter(list);
  }else if(tab==='theme'){
    list=[
      'theme_fanfare',
      'theme_atlantis',
      'theme_asgard',
      'theme_funeral',
      'theme_promotion',
      'theme_outro',
      'theme_outro_ambient',
      'theme_remix_melancholy',
      'theme_remix_cnc',
      'theme_remix_lofi',
      'theme_midi',
      'theme_remix_0',
      'theme_remix_1',
      'theme_remix_2',
      'theme_remix_3'
    ];
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
  if(WINAMP.tab==='midi'){
    const midiObj=(typeof SGC_MIDI!=='undefined')?SGC_MIDI:null;
    const isConn=midiObj&&midiObj.connected;
    const devName=(midiObj&&midiObj.inputs.length>0)?midiObj.inputs.map(i=>i.name).join(', '):I18N.T('game.dyn.str.midi_nodev');
    const isLearning=midiObj&&!!midiObj.learningParam;
    const kv=(midiObj&&midiObj.knobValues)||{cutoff:2400,resonance:6.0,volume:0.65,distortion:0.20,delay:0.28,tension:0.25,tempoBpm:140,decay:0.28};
    const lastEv=(midiObj&&midiObj.lastEvent)?
      (midiObj.lastEvent.type==='cc'?`CC #${midiObj.lastEvent.cc} = ${midiObj.lastEvent.val}`:
       midiObj.lastEvent.type==='noteon'?`Note ON #${midiObj.lastEvent.note} (Vel ${midiObj.lastEvent.vel})`:
       `Note OFF #${midiObj.lastEvent.note}`):I18N.T('game.dyn.str.midi_ready');

    const pads=[
      {note:36,label:'Pad 1: 909 Kick',sound:'bd'},
      {note:37,label:'Pad 2: Rimshot',sound:'rim'},
      {note:38,label:'Pad 3: Snare',sound:'sd'},
      {note:39,label:'Pad 4: Clap',sound:'cp'},
      {note:40,label:'Pad 5: Closed Hat',sound:'hh'},
      {note:41,label:'Pad 6: Open Hat',sound:'oh'},
      {note:42,label:'Pad 7: Crash',sound:'cr'},
      {note:43,label:'Pad 8: TB-303 Acid',sound:'tb303'}
    ];

    const knobs=[
      {key:'cutoff',label:'Filter Cutoff',val:Math.round(kv.cutoff)+' Hz',min:80,max:9200,unit:'Hz'},
      {key:'resonance',label:I18N.T('game.dyn.str.knob_resonance'),val:Number(kv.resonance).toFixed(1),min:0.5,max:18,unit:''},
      {key:'volume',label:'Master Volume',val:Math.round(kv.volume*100)+' %',min:0.0,max:1.0,unit:'%'},
      {key:'distortion',label:'Distortion / Drive',val:Math.round(kv.distortion*100)+' %',min:0.0,max:1.0,unit:'%'},
      {key:'delay',label:'Delay / Echo',val:Number(kv.delay).toFixed(2),min:0.0,max:0.85,unit:''},
      {key:'tension',label:I18N.T('game.dyn.str.knob_tension'),val:Number(kv.tension).toFixed(2),min:0.0,max:1.0,unit:''},
      {key:'tempoBpm',label:'Tempo / BPM',val:Math.round(kv.tempoBpm)+' BPM',min:65,max:175,unit:'BPM'},
      {key:'decay',label:I18N.T('game.dyn.str.knob_decay'),val:Number(kv.decay).toFixed(2)+' s',min:0.05,max:1.2,unit:'s'}
    ];

    return `<div style="padding:12px;background:#090d14;margin:8px;border:1px solid #1e293b;border-radius:4px;display:flex;flex-direction:column;gap:12px">
      <!-- Status & Preset Bar -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid #1e293b;padding-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${isConn?'#22c55e':'#eab308'};box-shadow:0 0 8px ${isConn?'#22c55e':'#eab308'}"></span>
          <span style="font-weight:bold;color:#f8fafc;font-size:12px">HARDWARE MIDI:</span>
          <span style="color:#94a3b8;font-size:12px">${devName}</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="winamp-btn" onclick="if(window.SGC_MIDI)SGC_MIDI.resetDefaultAkaiPreset('plus');showStrudelModal()" title="${I18N.T('game.dyn.str.midi_akai_plus')}">🎛 Akai MPK Plus</button>
          <button class="winamp-btn" onclick="if(window.SGC_MIDI)SGC_MIDI.resetDefaultAkaiPreset('mk2');showStrudelModal()" title="${I18N.T('game.dyn.str.midi_akai_mk2')}">🎛 Akai MPK mk2</button>
          <button class="winamp-btn" onclick="if(window.SGC_MIDI)SGC_MIDI.init().then(()=>showStrudelModal())" title="${I18N.T('game.dyn.str.midi_scan')}">🔄 Scan</button>
        </div>
      </div>

      <!-- MIDI Learn Status Banner -->
      ${isLearning?`
        <div style="padding:8px 12px;background:rgba(234,179,8,0.18);border:1px solid #eab308;color:#fef08a;border-radius:4px;display:flex;justify-content:space-between;align-items:center;font-size:12px">
          <span>${I18N.T('game.dyn.str.midi_learn',[midiObj.learningParam.label])}</span>
          <button class="winamp-btn" onclick="if(window.SGC_MIDI)SGC_MIDI.cancelLearn();showStrudelModal()">${I18N.T('game.dyn.btn.cancel')}</button>
        </div>
      `:''}

      <!-- 8 Rotary Knobs Section -->
      <div>
        <div style="font-size:11px;color:#93c5fd;font-weight:bold;margin-bottom:6px;letter-spacing:1px">${I18N.T('game.dyn.str.knobs_head')}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px">
          ${knobs.map((k,idx)=>{
            return `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:4px;padding:6px 8px;display:flex;flex-direction:column;gap:4px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:11px;font-weight:bold;color:#e2e8f0">${k.label}</span>
                <span style="font-size:11px;color:#38bdf8;font-family:monospace">${k.val}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px">
                <span style="font-size:10px;color:#64748b">KNOB #${idx+1}</span>
                <button class="winamp-btn" style="font-size:10px;padding:2px 6px" onclick="if(window.SGC_MIDI)SGC_MIDI.startLearn('${k.key}','${k.label}',${k.min},${k.max},'${k.unit}');showStrudelModal()">🎯 Learn</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 8 Drum Pads Section -->
      <div>
        <div style="font-size:11px;color:#f472b6;font-weight:bold;margin-bottom:6px;letter-spacing:1px">${I18N.T('game.dyn.str.pads_head')}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
          ${pads.map(p=>{
            return `<button class="winamp-btn" style="padding:10px 4px;text-align:center;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:4px" onclick="if(typeof SFX!=='undefined'&&SFX.triggerDrum)SFX.triggerDrum('${p.sound}',0.85);if(typeof toast==='function')toast('🥁 ${p.label}');">
              <span style="font-weight:bold;color:#fbcfe8">${p.label}</span>
              <span style="font-size:10px;color:#64748b">MIDI Note ${p.note}</span>
            </button>`;
          }).join('')}
        </div>
      </div>

      <!-- Live Keys & Monitor Footer -->
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1e293b;padding-top:8px;font-size:11px;color:#94a3b8">
        <span>${I18N.T('game.dyn.str.keys25')}</span>
        <span style="font-family:monospace;color:#67e8f9">Signal: ${lastEv}</span>
      </div>

      <!-- Interactive MIDI Testing Guide -->
      <div style="background:#0c1322;border:1px solid #1d4ed8;border-radius:4px;padding:8px 12px;font-size:11px;color:#cbd5e1">
        <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="const g=document.getElementById('midi-test-guide');if(g)g.style.display=(g.style.display==='none'?'block':'none')">
          <span style="font-weight:bold;color:#60a5fa">${I18N.T('game.dyn.str.test_head')}</span>
          <span style="color:#93c5fd;font-size:10px">${I18N.T('game.dyn.str.test_toggle')}</span>
        </div>
        <div id="midi-test-guide" style="display:block;margin-top:8px;line-height:1.6;color:#94a3b8;border-top:1px solid #1e293b;padding-top:6px">
          <div>${I18N.T('game.dyn.str.test1')}</div>
          <div style="margin-top:4px">${I18N.T('game.dyn.str.test2')}
            <br>${I18N.T('game.dyn.str.test2a')}
            <br>${I18N.T('game.dyn.str.test2b')}
            <br>${I18N.T('game.dyn.str.test2c')}
            <br>${I18N.T('game.dyn.str.test2d')}
            <br>${I18N.T('game.dyn.str.test2e')}
            <br>${I18N.T('game.dyn.str.test2f')}
          </div>
        </div>
      </div>
    </div>`;
  }

  if(WINAMP.tab==='settings'){
    const danceOn=typeof S!=='undefined'&&S&&S.audioDance!==false;
    const rumbleOn=typeof S!=='undefined'&&S&&S.controllerVibration!==false;
    return `<div style="padding:14px;background:#090d14;margin:8px;border:1px solid #1e293b;border-radius:4px;display:flex;flex-direction:column;gap:10px">
      <div style="font-size:12px;color:#cbd5e1;font-weight:bold;margin-bottom:4px">${I18N.T('game.dyn.str.settings_head')}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="winamp-btn ${danceOn?'active':''}" onclick="toggleAudioDance()" title="${I18N.T('game.dyn.str.dance_title')}">${I18N.T('game.dyn.str.dance_label')}${danceOn?I18N.T('game.dyn.str.dance_on'):I18N.T('game.dyn.str.off')}</button>
        <button class="winamp-btn ${rumbleOn?'active':''}" onclick="toggleControllerRumble()" title="${I18N.T('game.dyn.str.rumble_title')}">${I18N.T('game.dyn.str.rumble_label')}${rumbleOn?I18N.T('game.dyn.str.on'):I18N.T('game.dyn.str.off')}</button>
        <button class="winamp-btn" onclick="showKeybindModal()">${I18N.T('game.dyn.str.keybinds_btn')}</button>
      </div>
      <div style="font-size:11px;color:#94a3b8;line-height:1.5;margin-top:6px">
        ${I18N.T('game.dyn.str.info_dance')}<br>
        ${I18N.T('game.dyn.str.info_8bit')}
      </div>
    </div>`;
  }

  const trackKeys=getWinampTracksForTab(WINAMP.tab,WINAMP.searchQuery);
  if(!trackKeys.length){
    return `<div style="padding:20px;text-align:center;color:#64748b;font-size:12px">${I18N.T('game.dyn.str.no_tracks',[WINAMP.searchQuery])}</div>`;
  }

  return `<div class="winamp-playlist">
    ${trackKeys.map((k,idx)=>{
      const tr=STRUDEL_TRACKS[k]||{name:k,artist:'SGC',bpm:140,style:'Synth'};
      const isCur=(curTrack===k);
      const num=String(idx+1).padStart(2,'0');
      const isUnlocked=(!S||!S.unlockedTracks||S.unlockedTracks.includes(k));
      return `<div class="winamp-item ${isCur?'current':''}" data-track="${k}" onclick="SFX.playTrack('${k}');if(typeof unlockTrack==='function')unlockTrack('${k}');">
        <div>
          <span style="color:#64748b;margin-right:6px">[${num}]</span>
          <b>${isCur?'▶ ':''}${tr.title||tr.name||k}</b>
          ${isUnlocked?`<span style="color:#facc15;font-size:10px;margin-left:4px" title="${I18N.T('game.dyn.str.unlocked')}">⭐</span>`:''}
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
  if(typeof toast==='function') toast(I18N.T('game.dyn.str.toast_run'));
}

function resetCurrentSong(){
  const curTrack=STRUDEL.currentTrack||'sa_lets_talk';
  const tr=STRUDEL_TRACKS[curTrack];
  if(tr&&tr.code){
    const ed=document.getElementById('strudel-editor');
    if(ed)ed.value=tr.code;
    STRUDEL.evaluate(tr.code,true);
    if(typeof toast==='function') toast(I18N.T('game.dyn.str.toast_reset',[tr.title||tr.name]));
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
  if(typeof toast==='function') toast(I18N.T('game.dyn.str.toast_banks'));
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

  let savedWinampSize = null;
  try { savedWinampSize = JSON.parse(localStorage.getItem('sgc_winamp_size')); } catch(e){}
  const winampSizeStyle = savedWinampSize && savedWinampSize.w ? `style="width:${savedWinampSize.w};${savedWinampSize.h ? 'height:'+savedWinampSize.h : ''}"` : '';

  m.style.display='flex';
  m.innerHTML=`<div class="winamp-chassis" ${winampSizeStyle}>
    <!-- Window Titlebar -->
    <div class="winamp-titlebar">
      <span>📻 SGC-AMP v2.80 · STRUDEL CORE SOUND-ENGINE &amp; REBIRTH-338</span>
      <div style="display:flex;gap:4px">
        <button class="winamp-title-btn" onclick="toggleRebirthRack()" title="${I18N.T('game.dyn.str.rack_title')}">🎛 RACK</button>
        <button class="winamp-title-btn" onclick="closeWinampModal()">✕</button>
      </div>
    </div>

    <!-- Main Deck: LCD & Oscilloscope -->
    <div class="winamp-display">
      <div class="winamp-lcd" onclick="triggerWinampEasterEgg()" style="cursor:pointer" title="${I18N.T('game.dyn.str.lcd_title')}">
        <div id="winamp-marquee" class="winamp-marquee">▶ [${tr.artist||'SGC'}] ${tr.title||tr.name||curTrack} · ${tr.style||'Strudel'} (${tr.bpm||140} BPM)</div>
        <div class="winamp-stats-row">
          <span id="winamp-time" class="winamp-time">00:00</span>
          <span id="winamp-status-badge" class="winamp-badge ${playing?'playing':paused?'paused':'stopped'}">${playing?'▶ PLAYING':paused?'⏸ PAUSED':'⏹ STOPPED'}</span>
          <span style="font-size:11px;color:#94a3b8">${tr.bpm||140} BPM · ${typeof STRUDEL!=='undefined'?STRUDEL.cps:0.5} CPS</span>
          <span id="winamp-badge-8bit" class="winamp-badge" style="background:#0e7490;color:#67e8f9;border:1px solid #06b6d4;display:${is8Bit?'inline-block':'none'}">👾 8-BIT</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <canvas id="winamp-vis" class="winamp-vis-canvas" width="160" height="48" title="${I18N.T('game.dyn.str.vis_title')}" onclick="WINAMP.toggleVisMode()"></canvas>
        <div id="winamp-vis-label" style="font-size:9px;color:#166534;letter-spacing:1px">${WINAMP.visMode==='wave'?'OSCILLOSCOPE':'SPECTRUM 28-BAND'}</div>
      </div>
    </div>

    <!-- Transport Controls -->
    <div class="winamp-controls">
      <button class="winamp-btn" onclick="SFX.prevTrack()" title="${I18N.T('game.dyn.str.prev')}">|◀◀</button>
      <button class="winamp-btn active" onclick="SFX.playTrack(STRUDEL.currentTrack||'sa_lets_talk')" title="${I18N.T('game.dyn.str.play')}">▶ PLAY</button>
      <button class="winamp-btn" onclick="SFX.pause()" title="${I18N.T('game.dyn.str.pause')}">⏸ PAUSE</button>
      <button class="winamp-btn" style="border-color:#ef4444;color:#f87171" onclick="SFX.stop()" title="${I18N.T('game.dyn.str.stop')}">⏹ STOP</button>
      <button class="winamp-btn" onclick="SFX.nextTrack()" title="${I18N.T('game.dyn.str.next')}">▶▶|</button>

      <div class="winamp-vol" style="margin-left:8px">
        <span>VOL:</span>
        <input type="range" id="winamp-vol-slider" min="0" max="100" value="${Math.round((SFX?SFX.getVolume():0.65)*100)}" oninput="if(SFX&&SFX.setVolume)SFX.setVolume(this.value/100)" title="${I18N.T('game.dyn.str.vol_title')}">
      </div>

      <div style="flex:1"></div>

      <button id="winamp-8bit-btn" class="winamp-btn ${is8Bit?'active':''}" onclick="STRUDEL.setChiptune(!STRUDEL.chiptuneMode,true)" title="${I18N.T('game.dyn.str.chip_title')}">👾 8-Bit: ${is8Bit?'AN':'AUS'}</button>
      <button class="winamp-btn ${STRUDEL.dynamicEnabled?'active':''}" onclick="STRUDEL.dynamicEnabled=!STRUDEL.dynamicEnabled;toast(I18N.T('game.dyn.str.toast_dyn')+(STRUDEL.dynamicEnabled?I18N.T('game.dyn.str.on'):I18N.T('game.dyn.str.off')));showStrudelModal()" title="${I18N.T('game.dyn.str.dyn_title')}">⚡ DYN: ${STRUDEL.dynamicEnabled?'AN':'AUS'}</button>
      <button class="winamp-btn" onclick="WM.openSliders()" title="Song-Slider + MIDI Learn">🎚 SLIDER</button><button class="winamp-btn" onclick="WM.openDJ()" title="Klangstil / DJ-Filter">🎧 DJ</button><button class="winamp-btn" onclick="FX_PAD.open()" title="Master-FX XY-Pad (Echo, Hall, Drive)">🎛 FX</button><button class="winamp-btn" onclick="MIDI_OUT.open()" title="MIDI Out an externe Synths">🔌 OUT</button><button class="winamp-btn" onclick="PIANOROLL.open()" title="Pianoroll-Fenster">🎹 ROLL</button><button class="winamp-btn" onclick="generateNewSongFromContext()" title="${I18N.T('game.dyn.str.songgen_title')}">🎲 SONGGEN</button>
    </div>
    <!-- v0.31: ReBirth-Rack entfernt; Drums laufen über game/drum808.js -->

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
          <button class="winamp-btn active" onclick="executeStrudelEditor()" title="${I18N.T('game.dyn.str.run_title')}">⚡ RUN (Ctrl+Enter)</button>
          <button class="winamp-btn" onclick="SFX.stop()" title="Wiedergabe stoppen">⏹ STOP</button>
          <button class="winamp-btn" onclick="mutateCurrentSong()" title="Mutiert das Pattern algorithmisch">🧬 MUTIEREN</button>
          <button class="winamp-btn" onclick="saveCustomSong()" title="Speichert die bearbeitete Version dauerhaft">💾 SPEICHERN</button>
          <button class="winamp-btn" onclick="resetCurrentSong()" title="${I18N.T('game.dyn.str.reset_title')}">↺ RESET</button>
          <button class="winamp-btn" onclick="applySoundbanksToCode()" title="${I18N.T('game.dyn.str.banks_title')}">${I18N.T('game.dyn.str.banks_btn')}</button>
        </div>
      </div>

      <!-- Code Editor with Live Flashing / Pulse -->
      <div id="strudel-editor-wrapper" class="strudel-editor-wrapper">
        <textarea id="strudel-editor" class="strudel-code" spellcheck="false" onfocus="WINAMP.userEditing=true" onblur="WINAMP.userEditing=false" onkeydown="handleEditorKeyDown(event)">${curCode}</textarea>
      </div>
    </div>

    <!-- Playlist Tabs -->
    <div class="winamp-tabs">
      <button class="winamp-tab ${WINAMP.tab==='theme'?'on':''}" onclick="WINAMP.tab='theme';showStrudelModal()">🎺 Stargate Themes (18)</button>
      <button class="winamp-tab ${WINAMP.tab==='core'?'on':''}" onclick="WINAMP.tab='core';showStrudelModal()">${I18N.T('game.dyn.str.tab_core')}</button>
      <button class="winamp-tab ${WINAMP.tab==='sa'?'on':''}" onclick="WINAMP.tab='sa';showStrudelModal()" title="${I18N.T('game.dyn.str.tab_sa_title')}">📦 Codevault Tracks (20)</button>
      <button class="winamp-tab ${WINAMP.tab==='seed'?'on':''}" onclick="WINAMP.tab='seed';showStrudelModal()">${I18N.T('game.dyn.str.tab_seed')}</button>
      <button class="winamp-tab ${WINAMP.tab==='midi'?'on':''}" onclick="WINAMP.tab='midi';showStrudelModal()">🎛 MIDI Controller</button>
      <button class="winamp-tab ${WINAMP.tab==='settings'?'on':''}" onclick="WINAMP.tab='settings';showStrudelModal()">${I18N.T('game.dyn.str.tab_settings')}</button>
      <div style="flex:1"></div>
      <input type="text" id="winamp-search" placeholder="${I18N.T('game.dyn.str.search_ph')}" value="${WINAMP.searchQuery}" oninput="WINAMP.searchQuery=this.value;renderWinampPlaylistItems()" style="background:#0b111a;color:#fff;border:1px solid #374151;font-size:11px;padding:2px 6px;border-radius:3px;max-width:140px">
    </div>

    <!-- Playlist View -->
    <div id="winamp-playlist-container">
      ${renderWinampPlaylistHTML(curTrack)}
    </div>

    <!-- Bottom status bar -->
    <div style="padding:6px 10px;background:#111827;border-top:1px solid #374151;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8">
      <span>Strudel v1.3.0 · Switch Angel Prebake · ReBirth-338 Rack · AGPL-3.0-or-later</span>
      <button class="winamp-btn" onclick="closeWinampModal()">${I18N.T('game.dyn.str.close_esc')}</button>
    </div>
  </div>`;

  WINAMP.startVis();
}

window.updateMidiStatusUI = function(){
  if(typeof WINAMP!=='undefined'&&WINAMP.tab==='midi'&&$('modal')&&$('modal').style.display==='flex'){
    const container=$('winamp-playlist-container');
    if(container){
      const curTrack=(typeof STRUDEL!=='undefined'&&STRUDEL.currentTrack)||'base';
      container.innerHTML=renderWinampPlaylistHTML(curTrack);
    }
  }
};

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
    toast(I18N.T('game.dyn.str.toast_new_song',[res.seed.toString(16).toUpperCase(),res.scale,res.bpm]));
    WINAMP.tab = 'seed';
    showStrudelModal();
  }
}

function mutateCurrentSong(){
  if(typeof STRUDEL==='undefined'||typeof STRUDEL.mutateCode!=='function')return;
  const ed=$('strudel-editor');
  const fallback = STRUDEL.currentCode || (STRUDEL_TRACKS[STRUDEL.currentTrack] ? STRUDEL_TRACKS[STRUDEL.currentTrack].code : '');
  const curCode=(ed&&ed.value.trim())?ed.value:fallback;
  if(!curCode){
    toast(I18N.T('game.dyn.str.toast_no_mutate'));
    return;
  }
  const mutated=STRUDEL.mutateCode(curCode, 0.65);
  STRUDEL.customCode=mutated;
  STRUDEL.currentCode=mutated;
  if(ed)ed.value=mutated;
  STRUDEL.evaluate(mutated, true);
  toast(I18N.T('game.dyn.str.toast_mutated'));
  if(typeof updateWinampDisplay==='function')updateWinampDisplay();
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
    toast(I18N.T('game.dyn.str.dance_label')+(S.audioDance ? I18N.T('game.dyn.str.dance_on') : I18N.T('game.dyn.str.off')));
    showStrudelModal();
  }
}

function toggleControllerRumble(){
  if(typeof S!=='undefined'&&S){
    S.controllerVibration = (S.controllerVibration === false) ? true : false;
    save();
    toast(I18N.T('game.dyn.str.rumble_label')+(S.controllerVibration ? I18N.T('game.dyn.str.on') : I18N.T('game.dyn.str.off')));
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
  moveUp:I18N.T('game.dyn.kb.act.moveUp'),
  moveDown:I18N.T('game.dyn.kb.act.moveDown'),
  moveLeft:I18N.T('game.dyn.kb.act.moveLeft'),
  moveRight:I18N.T('game.dyn.kb.act.moveRight'),
  rotateLeft:I18N.T('game.dyn.kb.act.rotateLeft'),
  rotateRight:I18N.T('game.dyn.kb.act.rotateRight'),
  cycleGfx:I18N.T('game.dyn.kb.act.cycleGfx'),
  nextUnit:I18N.T('game.dyn.kb.act.nextUnit'),
  endTurn:I18N.T('game.dyn.kb.act.endTurn'),
  pause:I18N.T('game.dyn.kb.act.pause'),
  zoomIn:I18N.T('game.dyn.kb.act.zoomIn'),
  zoomOut:I18N.T('game.dyn.kb.act.zoomOut'),
  overwatch:I18N.T('game.dyn.kb.act.overwatch')
 };
 m.style.display='flex';
 m.innerHTML=`<div class="mbox" style="max-width:540px">
  <h3>${I18N.T('game.dyn.kb.title')}</h3>
  <div class="mbody">
   <p style="color:#94a3b8;margin-bottom:8px">${I18N.T('game.dyn.kb.hint')}</p>
   <table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:13px">
    <thead><tr style="border-bottom:1px solid #334155;color:#e8b040;text-align:left"><th style="padding:6px">${I18N.T('game.dyn.kb.th.action')}</th><th style="padding:6px">${I18N.T('game.dyn.kb.th.key')}</th><th style="padding:6px;text-align:right">${I18N.T('game.dyn.kb.th.action')}</th></tr></thead>
    <tbody>
      ${Object.entries(labels).map(([actKey,label])=>{
        const curKey=binds[actKey]||'-';
        const isRemap=remappingAction===actKey;
        return `<tr style="border-bottom:1px solid #1e293b">
          <td style="padding:6px">${label}</td>
          <td style="padding:6px"><code style="background:#0f172a;padding:3px 8px;border-radius:4px;color:${isRemap?'#38bdf8':'#4ade80'};border:1px solid ${isRemap?'#38bdf8':'#334155'}">${isRemap?I18N.T('game.dyn.kb.press'):curKey}</code></td>
          <td style="padding:6px;text-align:right"><button class="small" onclick="startRemapKey('${actKey}')">${isRemap?I18N.T('game.dyn.btn.cancel'):I18N.T('game.dyn.kb.change')}</button></td>
        </tr>`;
      }).join('')}
    </tbody>
   </table>
   <div style="display:flex;gap:8px;margin-top:10px">
    <button class="small" onclick="resetKeybinds()">${I18N.T('game.dyn.kb.reset')}</button>
    <div style="flex:1"></div>
    <button onclick="$('modal').style.display='none';remappingAction=null">${I18N.T('game.dyn.kb.done')}</button>
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
 toast(I18N.T('game.dyn.toast.keybinds_reset'));
 showKeybindModal();
}

// ===================== Hilfe-Modal =====================
function showHelp(){
 hideMenu();
 const m=$('modal');
 m.style.display='flex';
 m.innerHTML=`<div class="mbox help">
  <h3>${I18N.T('game.dyn.help.title')}</h3>
  <div class="mbody">
   <h4>${I18N.T('game.dyn.help.h1')}</h4>
   <div>${I18N.T('game.dyn.help.t1')}</div>
   <h4>${I18N.T('game.dyn.help.h2')}</h4>
   <div>${I18N.T('game.dyn.help.t2')}</div>
   <h4>${I18N.T('game.dyn.help.h3')}</h4>
   <div>${I18N.T('game.dyn.help.s1')}</div>
   <div>${I18N.T('game.dyn.help.s2')}</div>
   <div>${I18N.T('game.dyn.help.s3')}</div>
   <div>${I18N.T('game.dyn.help.s4')}</div>
   <h4>${I18N.T('game.dyn.help.h4')}</h4>
   <div>${I18N.T('game.dyn.help.t4')}</div>
  </div>
  <button onclick="$('modal').style.display='none'">${I18N.T('game.dyn.help.understood')}</button>
 </div>`;
}

// ===================== Header =====================
function renderHeader(){
 const ch=CHAPTERS[S.chapter];
 $('res').innerHTML=Object.keys(S.res).map(k=>`<span class="res" title="${(isEn()?RES_EN:RES_DE)[k]}">${RES_ICON[k]} ${Math.floor(S.res[k])}</span>`).join('')+
  `<span class="res" title="${I18N.T('game.dyn.res.research')}">🔬 ${Math.floor(S.research.rp)}</span>`;
 const cmd=(typeof COMMANDERS!=='undefined'&&COMMANDERS[S.commander])||COMMANDERS.hammond;
 $('chap').innerHTML=`<b>${ch.title}</b><small>${ch.sub} · 🎖 ${cmd.name}</small>`;
 const pw=powerGen(),pu=powerUse();
 const D=diff();
 $('round').innerHTML=`${I18N.T('game.dyn.day')} <b>${S.day}</b> · <span class="integ" title="${I18N.T('game.dyn.power.tooltip')}">⚡ ${pw>=pu?pw-pu:0}/${pw} ${bar(pw>=pu?100:pu/pw*100,pw>=pu?'#4ade80':'#ef4444')}</span> · <span class="diff" style="color:${D.color}" title="${I18N.T('game.dyn.diff.tooltip')}">⚔ ${D.name}</span>`;
 const gb=$('gfx-btn');
 if(gb){
  const gm=typeof getGfxMode==='function'?getGfxMode():'pixel';
  gb.textContent=gm==='ascii'?'⌨ ASCII':gm==='topdown'?'🗺 2D':'🖥 PIXEL';
 }
 $('go').disabled=!!S.over||C.active||GR.phase!=='idle';
 $('go').title=S.over?I18N.T('game.dyn.go.over'):C.active?I18N.T('game.dyn.go.combat'):GR.phase!=='idle'?I18N.T('game.dyn.go.gate'):I18N.T('game.dyn.go.day');
}

// ===================== Basis (Shelter-Grid + Raum-Innenansicht + Crafting) =====================
function renderBaseSide(){
 const pw=powerGen(),pu=powerUse(),ok=pw>=pu;
 const headlines=[
  I18N.T('game.dyn.headline.0'),
  I18N.T('game.dyn.headline.1'),
  I18N.T('game.dyn.headline.2'),
  I18N.T('game.dyn.headline.3'),
  I18N.T('game.dyn.headline.4')
 ];
 const headline=headlines[(Math.max(1,S.day)-1)%headlines.length];
 const activeStaff=S.roster.filter(m=>m.recruited&&!m.dead).length;
 let h=`<section class="base-news" aria-label="Mountain Network Nachrichten">
  <div class="base-news-head"><span>⦿ MOUNTAIN NETWORK</span><b><i></i> ${I18N.T('game.dyn.mountain.news')}</b></div>
  <div class="base-news-tag">${I18N.T('game.dyn.mountain.issue')} ${String(S.day).padStart(2,'0')} · CHEYENNE MOUNTAIN</div>
  <div class="base-news-title">${headline}</div>
  <div class="base-news-footer"><span>${I18N.T('game.dyn.mountain.staff')} <b>${activeStaff}</b></span><span>${I18N.T('game.dyn.mountain.gfx')} <b>${(S.gfxMode||'pixel').toUpperCase()}</b></span></div>
 </section>`;
 // Wenn ein Raum ausgewählt ist: Begehbare Innenansicht anzeigen (ROADMAP §1.5.3)
 if(B.selRoom&&S.base.rooms[B.selRoom]){
  const selR=S.base.rooms[B.selRoom];
  h+=`<div class="item" style="border-color:#4fc3f7;padding:6px">
   <canvas id="room-interior-cv" width="290" height="128" style="width:100%;height:auto;border:1px solid #33465f"></canvas>
  </div>`;
 }
 h+=`<div style="display:flex;gap:6px;margin-bottom:6px">
  <button style="flex:1;border-color:#e8b040;color:#e8b040" onclick="showClipboardModal()">${I18N.T('game.dyn.btn.hammond')}</button>
  ${S.roster[12]&&S.roster[12].recruited?`<button ${S.sandUsed?'disabled':''} onclick="act(sandwich())" title="${I18N.T('game.dyn.sandwich.title')}">${I18N.T('game.dyn.btn.sandwich')}</button>`:''}
 </div>`;
 h+=`<h3>${I18N.T('game.dyn.power')}</h3><div class="gbox">${I18N.T('game.dyn.power.prod')} <b style="color:${ok?'#4ade80':'#ef4444'}">${pw}</b> · ${I18N.T('game.dyn.power.cons')} <b>${pu}</b> ${ok?'✔':I18N.T('game.dyn.power.offline')}</div>`;
 h+=`<h3>${I18N.T('game.dyn.build')}</h3>`;
 if(B.buildMode){
  h+=`<div class="warnbox item">${I18N.T('game.dyn.build.mode',[ROOMS[B.buildType].name])} <button onclick="B.buildMode=false;renderAll()">${I18N.T('game.dyn.btn.cancel')}</button></div>`;
 } else {
  h+=`<div class="bgrid">`+Object.keys(ROOMS).filter(t=>t!=='gate').map(t=>{
   const R=ROOMS[t],cost=Object.entries(R.cost).map(e=>RES_ICON[e[0]]+e[1]).join(' ')||'–';
   return `<button class="item" style="text-align:left" onclick="B.buildMode=true;B.buildType='${t}';renderAll()"><b>${R.icon} ${R.name}</b><br><small>${R.desc} · ${cost} · ${R.power>0?'+':''}${R.power}P</small></button>`;
  }).join('')+`</div>`;
 }
 // Waffenkammer & Werkbank (INVENTAR-SPEC.md)
 if(typeof RECIPES!=='undefined'&&S.inventory){
  h+=`<h3>${I18N.T('game.dyn.arsenal')}</h3><div class="bgrid">`+Object.entries(RECIPES).map(([k,rec])=>{
   const cost=Object.entries(rec.cost).map(e=>RES_ICON[e[0]]+e[1]).join(' ');
   const count=(S.inventory[rec.cat]&&S.inventory[rec.cat][rec.item])||0;
   const locked=rec.req&&!S.research.done.includes(rec.req);
   return `<button class="item" style="text-align:left" ${locked?'disabled':''} onclick="act(craftItem('${k}'))">
    <b>${rec.name}</b> <span class="tag" style="float:right;background:#1a2535;color:#4ade80">${I18N.T('game.dyn.stock',[count])}</span><br>
    <small>${cost}${locked?` · 🔒 ${rec.req}`:''}</small>
   </button>`;
  }).join('')+`</div>`;
 }
 h+=`<h3>${I18N.T('game.dyn.rooms')} <small>${I18N.T('game.dyn.rooms.hint')}</small></h3>`;
 const rooms=Object.values(S.base.rooms);
 h+=rooms.map(r=>{
  const R=ROOMS[r.type],out=roomOutput(r);
  const staff=r.staff.map(id=>S.roster[id]).filter(m=>m&&m.recruited&&!m.dead);
  return `<div class="item ${B.selRoom===r.id?'warnbox':''}" style="cursor:pointer" onclick="B.selRoom=${r.id};renderAll()">
   <b>${R.icon} ${R.name}</b> ${r.type!=='gate'?`<button class="small" style="float:right" onclick="event.stopPropagation();act(demolishRoom(${r.id}))">✕</button>`:''}
   <br><small>${I18N.T('game.dyn.room.staff',[staff.length,R.staff])} ${out?`· Output ${out}`:''}
   ${staff.length?'<br>'+staff.map(m=>`<span class="tag" style="background:#1a2535;color:#4fc3f7">${m.name.split(' ')[0]}</span>`).join(' '):''}</small>
   ${r.type==='medbay'?`<button class="small" style="background:#134e4a;border-color:#2dd4bf;color:#ccfbf1;margin-top:6px;width:100%" onclick="event.stopPropagation();setTab('medbay')">${I18N.T('game.dyn.btn.medbay_open')}</button>`:''}
    ${r.type==='lab'?`<button class="small" style="background:#0e7490;border-color:#38bdf8;color:#cffafe;margin-top:6px;width:100%" onclick="event.stopPropagation();showResearchModal()">${I18N.T('game.dyn.btn.lab_open')}</button>`:''}</div>`;
 }).join('');
 const qTech = S.research && S.research.queue ? getTech(S.research.queue) : null;
  const doneCount = (S.research && S.research.done && S.research.done.length) || 0;
  h+=`<div class="item" style="border-color:#0891b2;margin-top:12px;background:linear-gradient(145deg,#0c1a29,#09121c);padding:10px">
   <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <h3 style="margin:0;font-size:13px;color:#38bdf8">🔬 ${I18N.T('game.dyn.research')}</h3>
    <span class="tag" style="background:#0e7490;color:#cffafe">${doneCount}/${TECH.length} Erforscht</span>
   </div>
   <div style="font-size:12px;margin-bottom:6px">
    ${qTech?`<b>${qTech.name}</b><br><small style="color:#94a3b8">${qTech.desc}</small><div style="margin-top:4px">${bar(S.research.rp/qTech.cost*100,'#38bdf8')} <span style="font-size:11px;color:#cbd5e1">${Math.floor(S.research.rp)}/${qTech.cost} RP</span></div>`:`<span style="color:#94a3b8">${I18N.T('game.dyn.research.none')}</span>`}
   </div>
   <button class="small" style="width:100%;background:#0e7490;border-color:#38bdf8;color:#cffafe;font-weight:bold;padding:5px" onclick="showResearchModal()">${I18N.T('game.dyn.btn.lab_open')} (Forschungsbaum)</button>
  </div>`;
  if(S.memorial.length){
  h+=`<h3>${I18N.T('game.dyn.memorial')}</h3><div class="gbox" style="border-color:#ef4444">${S.memorial.map(n=>`<div>🕯 ${n}</div>`).join('')}<button class="btn small" style="margin-top:6px;width:100%;background:#3b1e2a;border-color:#f43f5e;color:#fecdd3" onclick="if(typeof SFX!=='undefined'&&SFX.playTrack)SFX.playTrack('theme_funeral');toast(I18N.T('game.dyn.toast.funeral'))">${I18N.T('game.dyn.btn.funeral_play')}</button></div>`;
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
  c.fillStyle=disc?'#d6e4f0':'#6b7a90';c.font='12px sans-serif';c.textAlign='center';c.fillText(disc?P.name:I18N.T('game.dyn.map.unknown'),P.x,P.y+r+18);
 }
 c.textAlign='left';
 c.fillStyle='rgba(6,10,16,.7)';c.fillRect(8,Ht-40,232,32);c.font='11px sans-serif';
 [['#ef4444',I18N.T('game.dyn.legend.hostile')],['#facc15',I18N.T('game.dyn.legend.neutral')],['#4ade80',I18N.T('game.dyn.legend.empty')],['#a78bfa',I18N.T('game.dyn.legend.space')]].forEach(([col,l],i)=>{c.fillStyle=col;c.fillRect(14+(i%2)*116,Ht-32,8,8);c.fillStyle='#b8c6d6';c.fillText(l,26+(i%2)*116,Ht-24);});
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
function getAutoResolveForecast(mission, teamIds){
 if(!mission)return null;
 if(mission.tutorial||mission.peaceful||mission.type==='boss'||(mission.enemies&&mission.enemies.goauld)){
  return {eligible:false,reason:I18N.T('game.dyn.autoresolve.boss_locked')};
 }
 const squad=(teamIds||[]).map(id=>S.roster[id]).filter(m=>m&&!m.dead);
 if(!squad.length)return {eligible:false,reason:I18N.T('game.dyn.autoresolve.no_team')};
 let squadPower=0;
 squad.forEach(m=>{
  const w=WEAPONS[m.weapon]||WEAPONS.rifle;
  const avgDmg=((w.min||10)+(w.max||15))/2;
  const hpRatio=Math.max(0.2,m.hp/(m.maxHp||1));
  const lvlBonus=1+((m.lvl||1)-1)*0.1;
  squadPower+=(avgDmg*2.5+m.hp*0.5)*lvlBonus*hpRatio;
 });
 let enemyPower=0;
 if(mission.enemies){
  Object.entries(mission.enemies).forEach(([type,count])=>{
   const edef=ENEMIES[type]||{hp:20,weapon:'staff'};
   const ew=WEAPONS[edef.weapon]||WEAPONS.staff;
   const eAvg=((ew.min||10)+(ew.max||15))/2;
   enemyPower+=count*(eAvg*2.2+(edef.hp||20)*0.5);
  });
 }
 if(enemyPower<10)enemyPower=10;
 const ratio=squadPower/enemyPower;
 let winChance=Math.round((ratio/(ratio+1))*100);
 winChance=Math.max(10,Math.min(95,winChance));
 let injuryRisk='niedrig';
 if(winChance<55)injuryRisk='hoch';
 else if(winChance<75)injuryRisk='mittel';
 return {
  eligible:true,
  winChance,
  injuryRisk,
  squadPower:Math.round(squadPower),
  enemyPower:Math.round(enemyPower)
 };
}

function autoResolveMission(mission, teamIds){
 const forecast=getAutoResolveForecast(mission, teamIds);
 if(!forecast||!forecast.eligible){
  toast(forecast?forecast.reason:I18N.T('game.dyn.autoresolve.no_team'));
  return;
 }
 const roll=Math.random()*100;
 const victory=roll<forecast.winChance;
 const squad=(teamIds||[]).map(id=>S.roster[id]).filter(m=>m&&!m.dead);
 if(victory){
  if(typeof sfx==='function')sfx('victory');
  const lootEarned={};
  if(mission.reward){
   Object.entries(mission.reward).forEach(([k,v])=>{
    const amt=Math.max(1,Math.round(v*0.75));
    S.res[k]=(S.res[k]||0)+amt;
    lootEarned[k]=amt;
   });
  }
  if(S.research){
   const rpGain=Math.round(15*0.75);
   S.research.rp=(S.research.rp||0)+rpGain;
  }
  squad.forEach(m=>{
   m.xp=(m.xp||0)+Math.max(1,Math.round(15*0.75));
   const wound=rnd(4,16);
   m.hp=Math.max(1,m.hp-wound);
  });
  if(squad.length>0&&Math.random()<0.45){
   const victim=squad[Math.floor(Math.random()*squad.length)];
   victim.injuries=(victim.injuries||0)+1;
  }
  if(!S.done.includes(mission.id))S.done.push(mission.id);
  const lootStr=Object.entries(lootEarned).map(([k,v])=>`${RES_ICON[k]||''}+${v}`).join(' ');
  toast(`${I18N.T('game.dyn.autoresolve.win')} (${lootStr||'Keine Beute'})`);
  if(typeof note==='function')note(`[SCHNELLKAMPF] ${mission.name}: Sieg (${forecast.winChance}% Chance). Belohnungen verbucht (-25% Malus).`);
 }else{
  if(typeof sfx==='function')sfx('defeat');
  squad.forEach(m=>{
   m.hp=Math.max(1,Math.round(m.hp*0.4));
   if(Math.random()<0.6)m.injuries=(m.injuries||0)+1;
  });
  toast(I18N.T('game.dyn.autoresolve.defeat'));
  if(typeof note==='function')note(`[SCHNELLKAMPF] ${mission.name}: Niederlage. Team evakuiert mit schweren Wunden.`);
 }
 if(typeof save==='function')save();
 renderAll();
}

function renderMapSide(){
 if(!MAP.sel){
  $('map-side').innerHTML=`<h3>${I18N.T('game.dyn.map.title')}</h3><p class="dim">${I18N.T('game.dyn.map.hint')}</p>
  <h3>${I18N.T('game.dyn.map.open')}</h3>`+openMissions().map(m=>
   `<div class="item" onclick="MAP.sel='${m.planet}';renderAll()" style="cursor:pointer"><b>${m.name}</b> <small>${PLANETS[m.planet].name}</small></div>`).join('');
  return;
 }
 const P=PLANETS[MAP.sel],disc=S.planets[MAP.sel].disc;
 let h=`<h3>${disc?P.name:I18N.T('game.dyn.map.unk_signal')}</h3>`;
 if(!disc){h+=`<p class="dim">${I18N.T('game.dyn.map.unk_text')}</p><button onclick="discover('${MAP.sel}');act({ok:true})">${I18N.T('game.dyn.map.probe')}</button>`;$('map-side').innerHTML=h;return;}
 h+=`<p>${(isEn()?TYPE_EN:TYPE_DE)[P.type]}</p>`;
 const ms=openMissions().filter(m=>m.planet===MAP.sel);
 if(ms.length){
  ms.forEach(m=>{
   h+=`<div class="item"><b>${m.name}</b><br><small>${m.goal}<br>${m.peaceful?I18N.T('game.dyn.map.contact_type'):`${I18N.T('game.dyn.map.enemy_count')}: ${Object.entries(m.enemies).map(e=>e[1]+'× '+ENEMY_DE[e[0]]).join(', ')||I18N.T('game.dyn.map.none')}`}<br>${m.peaceful?I18N.T('game.dyn.map.contact_do'):m.tutorial?I18N.T('game.dyn.map.tutorial'):I18N.T('game.dyn.map.extract')}<br>${I18N.T('game.dyn.map.loot')}: ${Object.entries(m.reward).map(e=>RES_ICON[e[0]]+e[1]).join(' ')||'–'}</small></div>`;
  });
  const avail=S.roster.filter(m=>m.recruited&&!m.dead);
  h+=`<h3>${I18N.T('game.dyn.map.team')} <small>${I18N.T('game.dyn.map.team_max')}</small></h3>`;
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
  const defIds=avail.filter(m=>(ms[0].tutorial||(m.team||(m.sg1?'sg1':'sg2'))==='sg1')).map(m=>m.id);
  const forecast=getAutoResolveForecast(ms[0],defIds);
  h+=`<div style="display:flex;gap:6px;margin-top:8px">`;
  h+=`<button id="launch" style="flex:1;background:#1f6f3a;border-color:#34c76a">${I18N.T('game.dyn.btn.launch')}</button>`;
  h+=`<button id="launch-auto" style="flex:1;background:#065f46;border-color:#10b981;color:#a7f3d0;font-size:11px" title="Startet die Mission auf der Taktikkarte mit aktivem Autobattler zum Zuschauen">🤖 Auto-Mission</button>`;
  if(forecast&&forecast.eligible){
   h+=`<button id="auto-resolve" style="flex:1;background:#1e3a5f;border-color:#38bdf8;color:#e0f2fe;font-size:11px" title="${I18N.T('game.dyn.autoresolve.hint')}">⚡ ${I18N.T('game.dyn.btn.autoresolve')} (${forecast.winChance}%)</button>`;
  }
  h+=`</div>`;
  if(forecast&&forecast.eligible){
   h+=`<div style="font-size:10.5px;color:#94a3b8;margin-top:4px;text-align:center">${I18N.T('game.dyn.autoresolve.forecast',[forecast.winChance,forecast.injuryRisk])}</div>`;
  }
 } else {h+=`<p class="dim">${I18N.T('game.dyn.map.no_missions')}</p>`;}
 $('map-side').innerHTML=h;
 const btn=$('launch');
 if(btn)btn.onclick=()=>{
  const ids=[...document.querySelectorAll('.tpick:checked')].map(c=>parseInt(c.value)).slice(0,6);
  if(!ids.length){toast(I18N.T('game.dyn.map.toast.select'));return;}
  launchMission(ms[0],ids);
 };
 const btnRes=$('auto-resolve');
 if(btnRes)btnRes.onclick=()=>{
  const ids=[...document.querySelectorAll('.tpick:checked')].map(c=>parseInt(c.value)).slice(0,6);
  if(!ids.length){toast(I18N.T('game.dyn.map.toast.select'));return;}
  autoResolveMission(ms[0],ids);
 };
}

// ===================== Mission-Flow =====================
function launchMission(mission,teamIds,startWithAuto){
 const briefing=MISSION_BRIEFINGS&&MISSION_BRIEFINGS[mission.id];
 if(briefing){
  showStorySequence(briefing.lines,I18N.T('game.dyn.story.briefing_kicker',[mission.name]),I18N.T('game.dyn.story.btn_dial'),()=>activateMission(mission,teamIds,startWithAuto),'briefing',briefing.objective);
  return;
 }
 activateMission(mission,teamIds);
}
function activateMission(mission,teamIds,startWithAuto){
 GATE_STATE={teams:[{members:teamIds,mission:0}],roster:S.roster};
 $('gate-overlay').style.display='flex';
 sfx('gate');
 if(typeof SFX!=='undefined')SFX.music('gate');
 playGate([mission.planet],[{planet:mission.planet,members:teamIds}],()=>{
  try{
   $('gate-overlay').style.display='none';
   startCombat(mission,teamIds);
    if(startWithAuto){ C.autoBattle=true; setTimeout(runAutoBattleTurn, 500); }
   document.body.style.overflow='hidden';
   $('combat-overlay').style.display='flex';
   $('combat-end').style.display='none';
   if(typeof SFX!=='undefined'){
    if(mission.peaceful) SFX.music('peaceful');
    else if(mission.type==='boss'||(mission.enemies&&mission.enemies.goauld)) SFX.music('boss');
    else if(typeof SONGGEN!=='undefined'&&SONGGEN.fromCombat){
     const gen=SONGGEN.fromCombat(C,S);
     if(gen&&typeof STRUDEL!=='undefined'){
       if(typeof STRUDEL_TRACKS!=='undefined'){
         STRUDEL_TRACKS.generated_mission={name:gen.title||`Mission ${mission.name}`,artist:'SGC Strudel Bridge',role:'combat',code:gen.code};
       }
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
  }catch(err){
   console.error('[MISSION] Failed entering combat:', err);
   $('gate-overlay').style.display='none';
   $('combat-overlay').style.display='none';
   document.body.style.overflow='';
   C.active=false;
   GR.phase='idle';
   if(typeof toast==='function')toast(I18N.T('game.dyn.story.toast_mission_err',[err.message||err]));
   renderAll();
  }
 }, false);
}
function showStorySequence(lines,title,buttonText,onComplete,kind,objective){
 const host=$('story-dialogue');
 let index=0;
 const isCombat=kind==='field';
 host.className=isCombat?'field-dialogue':'';
 if(isCombat)C.dialogueActive=true;
 const render=()=>{
  const line=lines[index],member=S.roster[line.portraitId],image=member?portrait(member):'';
  const last=index===lines.length-1;
  host.innerHTML=`<div class="story-box ${kind||''}">
   <div class="story-kicker">${isCombat?I18N.T('game.dyn.story.kicker_field'):I18N.T('game.dyn.story.kicker_briefing')}</div>
   <h2>${title}</h2>
   ${objective?`<div class="story-objective"><span>${I18N.T('game.dyn.story.objective_lbl')}</span>${objective}</div>`:''}
   <div class="story-speaker">
    ${image?`<img src="${image}" alt="">`:''}
    <div><b>${line.speaker}</b><small>${line.role}</small></div>
   </div>
   <p class="story-line">${line.text}</p>
   <div class="story-controls"><span>${String(index+1).padStart(2,'0')} / ${String(lines.length).padStart(2,'0')} · ${I18N.T('game.dyn.story.enter_click')}</span>
    <button id="story-next" style="cursor:pointer">${last?buttonText:I18N.T('game.combat.continue')} <span>›</span></button>
   </div>
  </div>`;
  host.style.display='flex';
  host.onclick=(e)=>{
   if(e.target&&e.target.tagName==='BUTTON')return;
   const nextBtn=$('story-next');
   if(nextBtn)nextBtn.click();
  };
  $('story-next').onclick=(e)=>{
   e.stopPropagation();
   if(index<lines.length-1){index++;render();return;}
   host.style.display='none';host.innerHTML='';host.onclick=null;host.className='';
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
 showStorySequence(lines,`${PLANETS[C.mission.planet].name} · ${C.mission.name}`,I18N.T('game.combat.continue'),()=>{
  if(trigger==='contact'){C.contactComplete=true;checkEnd();renderCombatUI();resizeCombatViewport();}
 },'field');
}
function showPilotOpening(){
 const lines=[
  {speaker:'General Hammond',role:I18N.T('game.dyn.story.pilot.role1'),portraitId:12,text:I18N.T('game.dyn.story.pilot.line1')},
  {speaker:'Jack O’Neill',role:I18N.T('game.dyn.story.pilot.role2'),portraitId:0,text:I18N.T('game.dyn.story.pilot.line2')}
 ];
 showStorySequence(lines,I18N.T('game.dyn.story.pilot.title'),I18N.T('game.dyn.story.pilot.btn'),()=>{
  S.pilotBriefingSeen=true;save();MAP.sel='chulak';setTab('map');
 },'briefing',I18N.T('game.dyn.story.pilot.objective'));
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
 if(!C.active)return;
 if(C.result){combatEnd();return;}
 const cv=$('combat-cv'),r=cv.getBoundingClientRect(),sx=cv.width/r.width,sy=cv.height/r.height;
 const mx=(e.clientX-r.left)*sx,my=(e.clientY-r.top)*sy;
 const hit=getCombatTileFromMouse(cv,mx,my);
 const tx=hit.x,ty=hit.y;
 if(!inB(tx,ty))return;
 if(C.dialogueActive){
  const unit=unitAt(tx,ty);
  if(unit&&unit.side==='player'&&!unit.downed&&unit.ap>0)playerSelect(unit);
  return;
 }
 // Offworld Base Building (Command & Conquer / SimCity Feld-Bau)
 if(C.buildType&&typeof placeOffworldBuilding==='function'){
  const res=placeOffworldBuilding(C.buildType,tx,ty);
  C.buildType=null;
  act(res);
  return;
 }
 const u=unitAt(tx,ty);
 if(u&&u.side==='neutral'){interactWithContact(u);return;}
 if(u&&u.side==='player'&&!u.downed){playerSelect(u);sfx('click');renderCombatUI(true);return;}
 if(C.selected){
  if(C.moveRange.some(p=>p.x===tx&&p.y===ty)){playerMove(C.selected,tx,ty);return;}
  if(u&&u.side==='enemy'&&C.atkRange.includes(u)){playerAttack(C.selected,u);return;}
  if(u&&u.side==='enemy'&&C.distance(C.selected.x,C.selected.y,tx,ty)<=1&&C.selected.melee&&C.selected.ap>0&&tutorialAllowsAttack(C.selected)){const sel=C.selected;if(C.tutorial&&C.tutorial.step===2&&sel.charId===0)C.tutorial.step=3;sel.facing=facingToward(sel,u);sel.ap--;C.firstHint=false;doMelee(sel,u);C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];checkEnd();if(!C.result&&sel.ap<=0)nextUnit();return;}
  if(C.coverRange.some(p=>p.x===tx&&p.y===ty)){playerAttackTerrain(C.selected,tx,ty);return;}
  if(!u){C.selected=null;C.moveRange=[];C.atkRange=[];C.coverRange=[];renderCombatUI(true);}
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
 try{
  applyCombatResult();
 }catch(err){
  console.error('[combatEnd] Error in applyCombatResult:', err);
 }
 C.active=false;
 $('combat-overlay').style.display='none';
 document.body.style.overflow='';
 $('combat-end').style.display='none';
 if(C.result==='victory'){
  if(typeof SFX!=='undefined'&&SFX.playTrack)SFX.playTrack('theme_outro');
 }else{
  if(typeof SFX!=='undefined')SFX.music(UI.tab==='map'?'map':'base');
 }
 showReport();
}

// ===================== Jagged-Alliance-Style Combat UI + C&C Offworld Build =====================
let _lastCombatUIKey = '';
function renderCombatUI(force=false){
 const panel=$('combat-ui');if(!panel)return;
 if(!C.active||C.result){
  if(panel.style.display!=='none')panel.style.display='none';
  _lastCombatUIKey='';
  return;
 }
 const sel=C.selected;
 const key=`${sel?sel.charId:'none'}_${sel?sel.ap:0}_${sel?sel.hp:0}_${sel?sel.specialUsed:0}_${sel?sel.overwatch:false}_${C.autoBattle}_${C.round}_${C.phase}_${C.log.length}_${C.buildType}_${typeof getGfxMode==='function'?getGfxMode():'pixel'}`;
 if(!force && key===_lastCombatUIKey && panel.style.display==='flex') return;
 _lastCombatUIKey=key;
 panel.style.display='flex';
 let h='';
 if(sel){
  const m=S.roster[sel.charId];
  const w=WEAPONS[sel.weapon];
  const ar=ARMORS[sel.armor||'light'];
  const sp=sel.special&&SPECIALS[sel.special];
  h+=`<div class="cui-left">
   <div class="cui-portrait">${m?pic(m,'pt big'):''}</div>
   <div class="cui-info">
    <div class="cui-name">${sel.name} ${sel.shieldTurns>0?`<span class="tag" style="background:#0284c7;color:#fff">${I18N.T('game.dyn.cui.shield')}</span>`:''} ${sel.overwatch?`<span class="tag" style="background:#dc2626;color:#fff">${I18N.T('game.dyn.cui.overwatch_badge')}</span>`:''}</div>
    <div class="cui-class">${CLASS_DE[sel.cls]} · Lv ${m?m.lvl:'?'} · 🛡 ${ar?ar.name:I18N.T('game.dyn.cui.light')}</div>
    <div class="cui-bars">
     <div>HP ${bar(sel.hp/sel.maxHp*100,sel.hp>sel.maxHp*0.3?'#4ade80':'#ef4444')} ${sel.hp}/${sel.maxHp}</div>
     <div>AP <span class="cui-ap">${'●'.repeat(sel.ap)}${'○'.repeat(2-sel.ap)}</span></div>
    </div>
    <div class="cui-weapon">${w?`<img class="cui-wspr" src="${weaponSprite(sel.weapon)}" alt="">`:''}${w?w.name:'–'} ${w?w.min+'–'+w.max:''} (R.${w?w.range:''})</div>
    ${sel.melee?`<div class="cui-melee">⚔ ${WEAPONS[sel.melee]?WEAPONS[sel.melee].name:'Melee'}</div>`:''}
   </div>
  </div>`;
 } else {
  h+=`<div class="cui-left"><div class="cui-info"><div class="cui-name" style="color:#6b7a90">${I18N.T('game.dyn.cui.none_sel')}</div><div class="cui-class">${I18N.T('game.dyn.cui.none_hint')}</div></div></div>`;
 }
 h+=`<div class="cui-actions">`;
 if(C.phase==='player'&&!C.result){
  h+=`<button class="cui-btn end-turn-btn" style="border-color:#f59e0b;color:#fde68a;font-weight:bold;background:rgba(245,158,11,0.22)" onclick="endPlayerPhase()" title="${I18N.T('game.dyn.cui.end_turn.title')}">${I18N.T('game.dyn.cui.end_turn')}</button>`;
 }
 const autoOn=!!C.autoBattle;
 h+=`<button class="cui-btn" style="border-color:${autoOn?'#22c55e':'#64748b'};color:${autoOn?'#86efac':'#cbd5e1'};background:${autoOn?'rgba(34,197,94,0.22)':'transparent'};font-weight:bold" onclick="toggleAutoBattle()" title="${I18N.T('game.dyn.cui.autobattle.title')}">${autoOn?'🤖 [Auto: AN]':I18N.T('game.dyn.cui.autobattle')}</button>`;
 h+=`<button class="cui-btn" style="border-color:#4fc3f7;color:#4fc3f7;font-weight:bold" onclick="cycleSGMember(1)" title="${I18N.T('game.dyn.cui.next.title')}">${I18N.T('game.dyn.cui.next')}</button>`;
 if(sel&&sel.ap>0&&!C.result){
  h+=`<button class="cui-btn" onclick="if(C.selected)playerWait(C.selected)" title="${I18N.T('game.dyn.cui.wait.title')}">${I18N.T('game.dyn.cui.wait')}</button>`;
  h+=`<button class="cui-btn" style="border-color:#f59e0b;color:#fde68a;font-weight:bold;background:rgba(245,158,11,0.18)" onclick="if(C.selected&&typeof playerOverwatch==='function')playerOverwatch(C.selected)" title="${I18N.T('game.dyn.cui.overwatch.title')}">${I18N.T('game.dyn.cui.overwatch')}</button>`;
  h+=`<button class="cui-btn" onclick="if(C.selected)playerSelect(C.selected)">${I18N.T('game.dyn.cui.reselect')}</button>`;
  if(sel.special&&!sel.specialUsed&&SPECIALS[sel.special]){
   const sp=SPECIALS[sel.special];
   h+=`<button class="cui-btn" style="border-color:#38bdf8;color:#38bdf8" onclick="if(C.selected){act(useSpecial(C.selected));renderCombatUI();}" title="${sp.desc}">${sp.icon} ${sp.name}</button>`;
  }
 } else if(sel&&sel.ap<=0&&!C.result){
  h+=`<span style="color:#94a3b8;font-size:11px;align-self:center;padding:0 4px">${I18N.T('game.dyn.cui.no_ap')}</span>`;
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
 h+=`<button class="cui-btn" style="padding:6px 10px" onclick="if(typeof rotateIsoCamera==='function')rotateIsoCamera(-1)" title="${I18N.T('game.dyn.cui.rotate_l')}">↶ Q</button>`;
 h+=`<button class="cui-btn" style="padding:6px 10px" onclick="if(typeof rotateIsoCamera==='function')rotateIsoCamera(1)" title="${I18N.T('game.dyn.cui.rotate_r')}">↷ E</button>`;
 h+=`<button class="cui-btn" style="padding:6px 10px;border-color:#4ade80;color:#4ade80" onclick="cycleGfxMode()" title="${I18N.T('game.dyn.cui.gfx')}">${gm==='ascii'?'⌨ ASCII':'🖥 PIXEL'}</button>`;
 h+=`<button class="cui-btn" style="padding:6px 10px" onclick="showHelp()">❓</button>`;
  const isMuted = (typeof SFX!=='undefined' && SFX.muted);
  h+=`<button class="cui-btn" style="padding:6px 10px;border-color:${isMuted?'#ef4444':'#22c55e'};color:${isMuted?'#fca5a5':'#86efac'}" onclick="toggleCombatAudio()" title="${isMuted?'Ton einschalten':'Ton stumm'}">${isMuted?'🔇':'🔊'}</button>`;
  h+=`<button class="cui-btn" style="padding:6px 10px;border-color:#f59e0b;color:#fde68a" onclick="showStrudelModal()" title="SGC-AMP / Musik-Workstation öffnen">📻 SGC-AMP</button>`;
 h+=`</div>`;
 const g=gateReady();
 const gReady=g.at===g.total&&g.total>0;
 h+=`<div class="cui-right">
  <div class="cui-gate">${C.mission&&C.mission.peaceful?`${I18N.T('game.dyn.cui.first_contact')} ${C.contactComplete?I18N.T('game.dyn.cui.contact_done'):I18N.T('game.dyn.cui.contact_todo')}`:C.mission&&C.mission.tutorial?I18N.T('game.dyn.cui.tutorial_goal'):`${I18N.T('game.dyn.cui.gate')} <b style="color:${gReady?'#4ade80':'#8a9ab0'}">${g.at}/${g.total}</b> ${gReady?I18N.T('game.dyn.cui.ready'):I18N.T('game.dyn.cui.at_gate')}${g.downed?` <span style="color:#ef4444">(🩹 ${g.downed})</span>`:''}`}</div>
  ${gReady&&!(C.mission&&(C.mission.tutorial||C.mission.peaceful))?`<button class="cui-btn cui-btn-go" onclick="extract()">${I18N.T('game.dyn.cui.extract_btn')}</button>`:''}
  ${!C.result&&!(C.mission&&C.mission.tutorial)?`<button class="cui-btn" style="background:#4a151b;border-color:#ef4444;color:#fca5a5;padding:4px 8px;font-size:11px" onclick="if(confirm(I18N.T('game.dyn.cui.retreat.confirm')))emergencyRetreat()">${I18N.T('game.dyn.cui.retreat')}</button>`:''}
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
  topHtml+=`<div style="grid-column:1/-1;background:#0f1622;border:1px solid #243248;border-radius:6px;padding:8px;margin-bottom:4px"><h3 style="margin:0 0 6px">${I18N.T('game.dyn.roster.quests')}</h3>`+
   qs.map(q=>{
    const col=q.status==='done'?'#4ade80':q.status==='failed'?'#f87171':'#4fc3f7';
    const ico=q.status==='done'?'✔':q.status==='failed'?'💀':'📌';
    return `<div class="item" style="border-color:${col}"><b style="color:${col}">${ico} ${q.title}</b> <small>${q.char} · ${I18N.T('game.dyn.roster.chapter')} ${q.chapter}</small><br><small>${q.status==='active'?q.intro:q.status==='done'?q.epilogue:q.fail}</small></div>`;
   }).join('')+`</div>`;
 }
 // Inventar-Übersicht & Schnell-Werkbank
 if(S.inventory){
  const invW=Object.entries(S.inventory.weapons||{}).filter(([,v])=>v>0).map(([k,v])=>`🔫 ${WEAPONS[k]?WEAPONS[k].name:k}: <b>${v}</b>`).join(' · ')||I18N.T('game.dyn.roster.inv_unlim_w');
  const invA=Object.entries(S.inventory.armor||{}).filter(([,v])=>v>0).map(([k,v])=>`🛡 ${ARMORS[k]?ARMORS[k].name:k}: <b>${v}</b>`).join(' · ')||I18N.T('game.dyn.roster.inv_unlim_a');
  const invS=Object.entries(S.inventory.specials||{}).filter(([,v])=>v>0).map(([k,v])=>`${SPECIALS[k]?SPECIALS[k].icon:''} ${SPECIALS[k]?SPECIALS[k].name:k}: <b>${v}</b>`).join(' · ')||I18N.T('game.dyn.roster.inv_none_s');
  topHtml+=`<div style="grid-column:1/-1;background:#0f1622;border:1px solid #33465f;border-radius:6px;padding:10px;margin-bottom:4px">
   <div style="display:flex;justify-content:space-between;align-items:center">
    <h3 style="margin:0">${I18N.T('game.dyn.roster.arsenal')}</h3>
    <button class="small" onclick="showClipboardModal()">${I18N.T('game.dyn.btn.clipboard_open')}</button>
   </div>
   <div style="font-size:12px;margin-top:6px;color:#cbd8e4">
    <div><b>${I18N.T('game.dyn.roster.inv.weapons')}</b> ${invW}</div>
    <div><b>${I18N.T('game.dyn.roster.inv.armor')}</b> ${invA}</div>
    <div><b>${I18N.T('game.dyn.roster.inv.special')}</b> ${invS}</div>
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
    <select title="${I18N.T('game.dyn.roster.st.station')}" onchange="act(assignRoom(${m.id},parseInt(this.value)))"><option value="-1" ${m.room<0?'selected':''}>🏢 ${I18N.T('game.dyn.standby')}</option>
     ${Object.values(S.base.rooms).map(r=>`<option value="${r.id}" ${m.room===r.id?'selected':''}>🏢 ${ROOMS[r.type].name}</option>`).join('')}</select>
    <select title="${I18N.T('game.dyn.roster.st.team')}" onchange="act(assignTeam(${m.id},this.value))">
     ${Object.entries(SG_TEAMS).map(([tid,ti])=>`<option value="${tid}" ${curTeam===tid?'selected':''}>🎖 ${ti.name}</option>`).join('')}
    </select>
    <select title="${I18N.T('game.dyn.roster.st.weapon')}" onchange="act(equipItem(${m.id},'weapon',this.value))">
     ${rangedKeys.filter(k=>WEAPONS[k]).map(k=>{
      const cnt=(S.inventory&&S.inventory.weapons&&S.inventory.weapons[k])||0;
      const unlim=['pistol','mp5','m16','sniper','shotgun'].includes(k);
      return `<option value="${k}" ${m.weapon===k?'selected':''}>🔫 ${WEAPONS[k].name}${unlim?'':` (${cnt})`}</option>`;
     }).join('')}
    </select>
    <select title="${I18N.T('game.dyn.roster.st.armor')}" onchange="act(equipItem(${m.id},'armor',this.value))">
     ${Object.entries(ARMORS).map(([ak,av])=>{
      const cnt=(S.inventory&&S.inventory.armor&&S.inventory.armor[ak])||0;
      return `<option value="${ak}" ${(m.armor||'light')===ak?'selected':''}>🛡 ${av.name}${ak==='light'?'':` (${cnt})`}</option>`;
     }).join('')}
    </select>
    <select title="${I18N.T('game.dyn.roster.st.special')}" onchange="act(equipItem(${m.id},'special',this.value))">
     <option value="" ${!m.special?'selected':''}>${I18N.T('game.dyn.roster.st.no_item')}</option>
     ${Object.entries(SPECIALS).map(([sk,sv])=>{
      const cnt=(S.inventory&&S.inventory.specials&&S.inventory.specials[sk])||0;
      return `<option value="${sk}" ${m.special===sk?'selected':''}>${sv.icon} ${sv.name} (${cnt})</option>`;
     }).join('')}
    </select>
    ${dos?`<button class="small" onclick="showDossier(${m.id})" title="${I18N.T('game.dyn.btn.dossier.title')}">${I18N.T('game.dyn.btn.dossier')}</button>`:`<span></span>`}
    ${m.hp<m.maxHp||(m.injuries||0)>0?`<button class="small" style="background:#4a151b;border-color:#ef4444;color:#fca5a5;grid-column:span 2" onclick="setTab('medbay')">${I18N.T('game.dyn.btn.medbay_treat',[m.hp,m.maxHp])}</button>`:''}
   </div>
  </div></div>`;
 }).join('');
 $('roster-body').innerHTML=topHtml+cardsHtml;
}

// ===================== Krankenstation (Ebene 21 / Dr. Janet Fraiser) =====================
function renderMedbayView(){
  const body = $('medbay-body');
  if(!body) return;

  const medbayRoom = Object.values(S.base.rooms).find(r => r.type === 'medbay');
  const hasMedbay = !!medbayRoom;
  const staff = (medbayRoom ? medbayRoom.staff.map(id => S.roster[id]).filter(m => m && m.recruited && !m.dead) : []);
  const medBoost = 1 + (staff.length * 0.5);

  const fraiserPortrait = portrait({name: 'Dr. Janet Fraiser', cls: 'medic'});
  const rec = S.roster.filter(m => m.recruited && !m.dead);
  const wounded = rec.filter(m => m.hp < m.maxHp || (m.injuries || 0) > 0 || (m.fatigue || 0) > 0);
  const critical = rec.filter(m => m.hp < 25 || (m.injuries || 0) >= 2);

  let fraiserQuote = '';
  if(critical.length > 0){
    fraiserQuote = `„NOTFALL AUF EBENE 21! ${critical.map(m=>m.name.split(' ')[0]).join(', ')} schwebt in Lebensgefahr. Wir müssen sofort operieren oder das Antike Heilgerät einsetzen!“`;
  } else if(wounded.length > 0){
    fraiserQuote = `„Willkommen auf Ebene 21, Commander. Wir haben ${wounded.length} verwundete Soldaten auf Station. Die Betten sind vorbereitet – eine Erstversorgung mit Medizin oder Bettruhe wird sie schnell wieder auf die Beine bringen.“`;
  } else {
    fraiserQuote = `„Gute Nachrichten, Commander: Alle SG-Teams sind vollkommen gesund und diensttauglich! Unsere Bestände an Verbandsmaterial und Tretonin sind aufgestockt.“`;
  }

  let h = `
  <div style="background:#0f1622;border:1px solid #243248;border-radius:6px;padding:12px;margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;border-bottom:1px solid #1f2c3f;padding-bottom:10px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${fraiserPortrait}" style="width:48px;height:48px;image-rendering:pixelated;border:2px solid #ef4444;border-radius:4px;background:#14202e">
        <div>
          <div style="font-size:16px;font-weight:bold;color:#f8fafc;letter-spacing:1px">🏥 KRANKENSTATION · EBENE 21</div>
          <div style="font-size:12px;color:#94a3b8">CHEFÄRZTIN DR. JANET FRAISER · CHEYENNE MOUNTAIN KOMPLEX</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;font-family:monospace;font-size:13px;background:#090d14;padding:8px 14px;border-radius:4px;border:1px solid #1e293b">
        <span>✚ Medizin: <b style="color:#4ade80">${S.res.medicine||0}</b></span>
        <span>⚙ Tech: <b style="color:#38bdf8">${S.res.tech||0}</b></span>
        <span>⛏ Erz: <b style="color:#fbbf24">${S.res.ore||0}</b></span>
      </div>
    </div>

    <!-- EKG & Status Monitor -->
    <div style="display:flex;align-items:center;justify-content:space-between;background:#071018;border:1px solid #164e63;padding:8px 14px;border-radius:4px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e"></span>
        <span style="font-family:monospace;font-size:12px;color:#38bdf8">BIO-TELEMETRIE: ♥ 72 BPM · NORMALER SINUSRHYTHMUS · SCHWINGUNG STABIL</span>
      </div>
      <div style="font-size:12px;color:#94a3b8">
        Stations-Heilung: <b style="color:#4ade80">+${Math.round(35*medBoost)} HP/Tag</b> ${staff.length?`(Ärzte: ${staff.map(s=>s.name.split(' ')[0]).join(', ')})`:'(Kein Arzt zugewiesen)'}
      </div>
    </div>

    <!-- Dr. Fraiser Briefing -->
    <div style="background:#131c2a;border-left:4px solid #ef4444;padding:10px 14px;border-radius:0 4px 4px 0;margin-bottom:14px;color:#cbd5e1;font-size:13px;line-height:1.5">
      ${fraiserQuote}
    </div>

    <!-- Schnellauswahl-Aktionen -->
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px">
      <button class="btn" style="background:#166534;border-color:#4ade80;color:#fff" ${wounded.length===0||(S.res.medicine||0)<15?'disabled':''} onclick="act(healAllEmergency())">
        💊 Alle Verwundeten erstversorgen (-15 ✚ pro Soldat)
      </button>
      <button class="btn" style="background:#1e293b;border-color:#38bdf8;color:#e0f2fe" onclick="showMedbayIncidentModal()">
        ☣ Stargate-Medizinvorfall simulieren (Broca / Symbiont / Heilwürfel)
      </button>
      <button class="btn" style="background:#0f172a;border-color:#64748b;color:#cbd5e1" onclick="setTab('base')">
        🏢 Zur Basisansicht (Ebene 21 ausbauen)
      </button>
    </div>
  </div>`;

  // Patienten-Bereich
  h += `<h3 style="margin-bottom:10px">🩺 Patientenakte &amp; Stationäre Belegung (${wounded.length} Verwundete)</h3>`;

  if(wounded.length === 0){
    h += `
    <div style="background:#0f1622;border:1px dashed #22c55e;border-radius:6px;padding:24px;text-align:center;color:#86efac;margin-bottom:16px">
      <div style="font-size:24px;margin-bottom:8px">✔ Keine Patienten auf Station</div>
      <div style="font-size:13px;color:#94a3b8">Alle Teammitglieder von SG-1 und den Unterstützungseinheiten sind voll einsatzfähig und haben 100% HP.</div>
    </div>`;
  } else {
    h += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:10px;margin-bottom:16px">`;
    wounded.forEach(m => {
      const inBed = m.room >= 0 && S.base.rooms[m.room] && S.base.rooms[m.room].type === 'medbay';
      const isCritical = m.hp < 25 || (m.injuries || 0) >= 2;
      const borderCol = isCritical ? '#ef4444' : inBed ? '#38bdf8' : '#f59e0b';

      h += `
      <div style="background:#0f1622;border:2px solid ${borderCol};border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          ${pic(m, 'pt big')}
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <b>${m.name}</b>
              <span class="tag" style="background:${inBed?'#0369a1':'#374151'};color:#fff">${inBed?'🛏 Im Krankenbett':'Ambulant'}</span>
            </div>
            <small style="color:#94a3b8">${CLASS_DE[m.cls]||m.cls} · Lv ${m.lvl}</small>
          </div>
        </div>

        <div style="background:#090d14;padding:6px 10px;border-radius:4px;font-size:12px;font-family:monospace">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span>Gesundheit (HP):</span>
            <b style="color:${m.hp<30?'#ef4444':'#4ade80'}">${m.hp} / ${m.maxHp}</b>
          </div>
          ${bar(m.hp/m.maxHp*100, m.hp<30?'#ef4444':'#4ade80')}
          <div style="display:flex;justify-content:space-between;margin-top:4px">
            <span>Verletzungen: <b style="color:${m.injuries>0?'#ef4444':'#4ade80'}">${m.injuries||0}</b></span>
            <span>Erschöpfung: <b>${m.fatigue||0}%</b></span>
            <span>Moral: <b>${m.morale||0}%</b></span>
          </div>
        </div>

        <!-- Behandlungs-Buttons -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:2px">
          ${inBed ? `
            <button class="small" style="background:#334155;color:#e2e8f0;grid-column:span 2" onclick="act(assignRoom(${m.id},-1))">
              🚶 Aus dem Krankenbett entlassen
            </button>
          ` : `
            <button class="small" style="background:#0369a1;color:#fff;grid-column:span 2" onclick="act(healPatient(${m.id},'rest'))">
              🛏 Stationär aufnehmen (+${Math.round(35*medBoost)} HP/Tag)
            </button>
          `}
          
          <button class="small" style="background:#1e293b;border-color:#22c55e;color:#bbf7d0" ${(S.res.medicine||0)<15?'disabled':''} onclick="act(healPatient(${m.id},'medicine'))" title="15 ✚ Medizin: +35 HP, 1 Verletzung heilen">
            💊 Erstversorgung (15 ✚)
          </button>

          <button class="small" style="background:#1e293b;border-color:#38bdf8;color:#bae6fd" ${(S.res.tech||0)<20||(S.res.ore||0)<15?'disabled':''} onclick="act(healPatient(${m.id},'tech_goauld'))" title="20 ⚙ Tech, 15 ⛏ Erz: 100% HP & alle Verletzungen entfernen">
            ✨ Heilgerät (20⚙, 15⛏)
          </button>

          <button class="small" style="background:#1e293b;border-color:#a855f7;color:#e9d5ff" ${(S.res.medicine||0)<10||(S.res.tech||0)<10?'disabled':''} onclick="act(healPatient(${m.id},'tretonin'))" title="10 ✚, 10 ⚙: +50 HP, +5 MaxHP, +15 Moral">
            🧪 Tretonin (10✚, 10⚙)
          </button>

          <button class="small" style="background:${isCritical?'#7f1d1d':'#374151'};border-color:#ef4444;color:#fecaca" ${(S.res.medicine||0)<25||(S.res.tech||0)<10?'disabled':''} onclick="act(healPatient(${m.id},'surgery'))" title="25 ✚, 10 ⚙: Not-Operation durch Dr. Fraiser (HP auf 85%, alle Wunden heilen)">
            💉 Not-OP Fraiser (25✚)
          </button>
        </div>
      </div>`;
    });
    h += `</div>`;
  }

  // Gesunder Kader
  const healthy = rec.filter(m => m.hp >= m.maxHp && (m.injuries||0) === 0);
  h += `<h3 style="margin-top:16px;margin-bottom:8px">🎖 Diensttaugliches Personal (${healthy.length} Soldaten einsatzbereit)</h3>`;
  h += `<div style="display:flex;flex-wrap:wrap;gap:8px">`;
  healthy.forEach(m => {
    h += `
    <div style="background:#090d14;border:1px solid #1e293b;border-radius:4px;padding:6px 10px;display:flex;align-items:center;gap:8px">
      ${pic(m, 'pt')}
      <div>
        <div style="font-size:12px;font-weight:bold;color:#f1f5f9">${m.name}</div>
        <div style="font-size:11px;color:#22c55e">✔ Voll einsatzbereit (${m.hp}/${m.maxHp} HP)</div>
      </div>
    </div>`;
  });
  h += `</div>`;

  body.innerHTML = h;
}

function showMedbayIncidentModal(forcedIdx=null){
  const inc = (forcedIdx!==null&&MEDBAY_INCIDENTS[forcedIdx]) ? MEDBAY_INCIDENTS[forcedIdx] : MEDBAY_INCIDENTS[Math.floor(Math.random()*MEDBAY_INCIDENTS.length)];
  const m = $('modal');
  if(!m) return;
  _activeIncident = inc;
  m.style.display = 'flex';
  m.innerHTML = `
  <div class="modal-box" style="max-width:620px;border:2px solid ${inc.color};background:rgba(10,14,24,0.98);box-shadow:0 0 35px ${inc.color}66;padding:24px;border-radius:8px;font-family:monospace">
    <div style="color:${inc.color};font-weight:bold;font-size:11px;letter-spacing:2px;margin-bottom:4px">${inc.kicker}</div>
    <h2 style="color:#fff;margin:0 0 14px 0;font-size:18px;border-bottom:1px solid #243248;padding-bottom:10px">${inc.title}</h2>
    
    <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:16px;background:#070d17;padding:12px;border-radius:6px;border-left:4px solid ${inc.color}">
      <img src="${portrait({name:inc.speaker,cls:'medic'})}" style="width:48px;height:48px;image-rendering:pixelated;border:1px solid ${inc.color};border-radius:4px">
      <div style="flex:1">
        <div style="font-weight:bold;color:#f8fafc;margin-bottom:4px">${inc.speaker} <small style="color:#94a3b8;font-weight:normal">(${inc.role})</small></div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.5;font-style:italic">${inc.text}</div>
      </div>
    </div>

    <div style="color:#94a3b8;font-size:12px;margin-bottom:16px;line-height:1.4">${inc.subtext}</div>

    <div style="display:flex;flex-direction:column;gap:8px">
      ${inc.choices.map((c, i) => `
        <button class="winamp-btn" style="text-align:left;padding:12px 16px;background:#131c2a;border-color:${inc.color};color:#f8fafc;font-size:13px;border-radius:4px;cursor:pointer" onclick="resolveMedbayIncident(${i})">
          <div style="font-weight:bold;color:#f8fafc;margin-bottom:4px">▶ ${c.label}</div>
          <div style="font-size:11px;color:#94a3b8">${c.desc}</div>
        </button>
      `).join('')}
    </div>
  </div>`;
}

function resolveMedbayIncident(choiceIdx){
  if(!_activeIncident || !_activeIncident.choices[choiceIdx]) return;
  const choice = _activeIncident.choices[choiceIdx];
  try {
    choice.effect();
  } catch(e) {
    console.error('[Medbay Incident Error]', e);
  }
  _activeIncident = null;
  save();
  $('modal').style.display = 'none';
  renderAll();
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
function showReport(isDayEnd=false){
 const m=$('modal');
 if(!m)return;
 if(isDayEnd&&typeof SFX!=='undefined'&&SFX.playTrack){
  SFX.playTrack('theme_outro');
 }
 const ch=CHAPTERS[S.chapter]||CHAPTERS[0];
 const cmd=(typeof COMMANDERS!=='undefined'&&COMMANDERS[S.commander])||COMMANDERS.hammond;
 const discCount=Object.values(S.planets||{}).filter(p=>p.disc).length;
 const totalPlanets=Object.keys(PLANETS).length;
 const activeRecruits=S.roster.filter(x=>x.recruited&&!x.dead).length;
 const coloniesCount=Object.keys(S.colonies||{}).length;
 
 const SGC_STORIES=[
  `General Hammond lässt im SGC frische Sandwiches aus Texas anliefern. Jack O'Neill und Teal'c debattieren im Aufenthaltsraum über die Kunstfertigkeit irdischer Westernfilme.`,
  `Major Carter kalibriert die Puffer des Dial-Computers nach einer Naquadah-Resonanz neu. Daniel Jackson hat in der Bibliothek eine Schriftrolle über Aufgestiegene der Antiker entdeckt.`,
  `Teal'c probiert in der Offiziersmesse erstmals verschiedene Wackelpudding-Sorten aus. Sein Urteil: „Dies ist in der Tat... von überraschender Konsistenz, O'Neill.“`,
  `Sgt. Siler übersteht auf Ebene 19 eine Starkstrom-Entladung bei Reparaturarbeiten an den Primärleitungen („Keine Sorge, Sir, mir geht's gut!“).`,
  `Dr. Janet Fraiser schließt die medizinische Routine-Tauglichkeitsprüfung von SG-1 ab. Jack beschwert sich lautstark über überdimensionierte Nadeln.`,
  `Walter Harriman meldet ein butterweiches Einrasten von Chevron 7 ohne jegliche Spannungsspitzen im Stromnetz von Colorado Springs.`,
  `Ein seltsamer Geruch auf Ebene 22 entpuppt sich als 3.000 Jahre alte ägyptische Grabbeigabe, die Daniel Jackson versehentlich in der Mikrowelle aufwärmen wollte.`,
  `Die Tok'ra übermitteln eine verschlüsselte Subraum-Botschaft: Jacob Carter sendet Grüße und warnt vor ungewöhnlichen Schiffsbewegungen im Kernsektor.`,
  `Bra'tac sendet über das Sternentor einen traditionellen Jaffa-Gruß: „Möge euer Rücken stark sein und eure Stabwaffe niemals klemmen, O'Neill.“`,
  `Jonas Quinn und Daniel vergleichen Notizen über die Naquadria-Ader auf Langara und spekulieren über vergessene Sternentore der Antiker.`,
  `Dr. Elizabeth Weir führt diplomatische Verhandlungen mit Vertretern der Freien Jaffa über Handelsrechte für Naquadah-Konzentrat.`
 ];
 const storySeed=(S.day*17+S.chapter*31)%SGC_STORIES.length;
 const dailyStory=SGC_STORIES[storySeed];
 const logHtml=S.rlog.map(l=>`<div class="${/✔|🏆|★|＋|🔬|🎁|🤝/.test(l)?'ok':/⚡|💥|💀|⚠|🛑/.test(l)?'bad':/⏱|🪐|📎/.test(l)?'warn':''}">${l}</div>`).join('')||'<div class="dim">Ein ruhiger Tag im Cheyenne Mountain Komplex.</div>';

 m.style.display='flex';
 m.innerHTML=`<div class="mbox" style="max-width:760px;width:95vw;max-height:88vh;overflow-y:auto">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #38bdf8;padding-bottom:10px;margin-bottom:14px">
   <div>
    <h3 style="margin:0;font-size:20px;color:#f8fafc">SGC Tagesbericht · Tag ${S.day}</h3>
    <small style="color:#38bdf8;font-weight:bold">${ch.title} · Leitung: ${cmd.name}</small>
   </div>
   <div style="text-align:right">
    <span class="tag" style="background:#1e293b;border:1px solid #38bdf8;color:#e0f2fe;font-size:12px">TOR: BEREITSCHAFT</span>
   </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:14px;background:#0c1322;padding:12px;border-radius:6px;border:1px solid #1e293b">
   <div style="text-align:center"><small style="color:#94a3b8">ERFOLGE</small><div style="font-size:17px;font-weight:bold;color:#4ade80">${S.done.length} Einsätze</div></div>
   <div style="text-align:center"><small style="color:#94a3b8">FEINDE BESIEGT</small><div style="font-size:17px;font-weight:bold;color:#f87171">${S.jaffaKills||0} Jaffa</div></div>
   <div style="text-align:center"><small style="color:#94a3b8">ERFORSCHT</small><div style="font-size:17px;font-weight:bold;color:#38bdf8">${discCount} / ${totalPlanets} Welten</div></div>
   <div style="text-align:center"><small style="color:#94a3b8">PERSONAL</small><div style="font-size:17px;font-weight:bold;color:#fbbf24">${activeRecruits} Soldaten</div></div>
   <div style="text-align:center"><small style="color:#94a3b8">AUSSENPOSTEN</small><div style="font-size:17px;font-weight:bold;color:#a78bfa">${coloniesCount} Kolonien</div></div>
  </div>

  <div style="margin-bottom:12px">
   <h4 style="color:#e2e8f0;font-size:13px;letter-spacing:1px;margin-bottom:6px">📋 TAGES-PROTOKOLL & ERTRÄGE</h4>
   <div class="mbody" style="max-height:160px;overflow-y:auto;background:#060a12;padding:10px;border-radius:4px;border:1px solid #1e293b">${logHtml}</div>
  </div>

  <div style="margin-bottom:16px;background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.7));padding:12px 14px;border-left:4px solid #f59e0b;border-radius:4px">
   <div style="color:#f59e0b;font-weight:bold;font-size:12px;margin-bottom:4px;letter-spacing:1px">☕ SGC LOGBUCH-NOTIZ & BEGEBENHEIT</div>
   <div style="color:#cbd5e1;font-size:13px;font-style:italic;line-height:1.5">„${dailyStory}“</div>
  </div>

  <div style="display:flex;justify-content:flex-end;gap:10px">
   <button onclick="startNextDay()" style="background:#1f6f3a;border-color:#34c76a;color:#fff;padding:10px 24px;font-weight:bold;cursor:pointer">Tag abschließen & Nächster Tag ›</button>
  </div>
 </div>`;
 renderAll();
}

// Startet den nächsten Tag (Tag-Loop für unendlichen Spielbetrieb)
function startNextDay(){
 $('modal').style.display='none';
 if(typeof SFX!=='undefined')SFX.music(UI.tab==='map'?'map':'base');
 
 // Zufälliges Stargate-Event für den neuen Tag (15% Chance)
 const eventRoll = Math.random();
 if(eventRoll < 0.15){
  const events = [
   I18N.T('game.event.wormhole'),
   '📡 Tok\'ra Alert: Geheime Nachricht durch das Sternentor übermittelt!',
   I18N.T('game.event.alarm'),
   I18N.T('game.event.pulse'),
   I18N.T('game.event.contact')
  ];
  toast(events[Math.floor(Math.random() * events.length)]);
 }
 
 renderAll();
}

// ===================== Render-Orchestrator =====================
function renderAll(){
 renderHeader();
 if(UI.tab==='base'){renderBaseSide();}
 else if(UI.tab==='map'){renderMapSide();}
 else if(UI.tab==='colonies'){renderColoniesView();}
 else if(UI.tab==='medbay'){renderMedbayView();}
 else if(UI.tab==='roster'){renderRoster();}
 else if(UI.tab==='log'){renderLog();}
 renderCombatUI();
 resizeCombatViewport();
 const ov=$('over');
 if(S.over){ov.style.display='flex';ov.innerHTML=`<div><h2>${S.over==='win'?'🏆 Kampagne gewonnen':'💀 SGC verloren'}</h2><p>${S.over==='win'?'SG-1 verliert nie. Der Papierkram wird dennoch Jahre dauern.':'Die Integrität des SGC ist erschöpft.'}</p><button onclick="resetGame(true)">Neues Spiel</button></div>`;}
 else ov.style.display='none';
}

// ===================== SGC Vorfall- & Krisen-System (Stargate Tropes & Eastereggs) =====================
const SGC_INCIDENTS = [
  {
    id: 'gate_alarm',
    title: '🚨 UNAUTORISIERTE TORAKTIVIERUNG (INCOMING WORMHOLE)',
    kicker: 'NOTFALL-ALARMSTUFE ROT · TORRAUM EBENE 28',
    color: '#ef4444',
    speaker: "Walter Harriman",
    role: "Chevrons & Tor-Steuerung",
    text: "„Chevron 6 eingelegt... Chevron 7 verriegelt! Sir, wir haben eine unautorisierte Aktivierung von außen! Kein IDC-Signal im Standard-Speicher!“",
    subtext: "Das Tor öffnet sich mit einem gewaltigen Kawoosh. General Hammond eilt auf den Leitstand und greift zum Mikrofon.",
    choices: [
      {
        label: "🛡 Iris sofort verriegeln & Schockwelle abfangen",
        effectText: "THUD! Ein Goa'uld-Spähflugkörper zerschellt an der Titan-Iris. Die Basis bleibt unbeschadet!",
        action: () => {
          S.integrity = Math.min(100, (S.integrity || 100) + 10);
          S.rlog.push("🛡 Vorfall: Titan-Iris fing feindliche Goa'uld-Sonde ab (+10 Integrität).");
          note("🛡 Titan-Iris hält stand! O'Neill: „Wer immer das war... der hat jetzt Kopfschmerzen.“");
        }
      },
      {
        label: "📻 GDO-Signal dekodieren: Es ist SG-3 unter Feuer! Iris öffnen & Feuerschutz",
        effectText: "Major Castleman und SG-3 hechten durch den Horizont, verfolgt von Stabwaffenfeuer. Das Lazarett flickt sie zusammen!",
        action: () => {
          S.res.ore = (S.res.ore || 0) + 90;
          S.res.tech = (S.res.tech || 0) + 35;
          S.res.medicine = Math.max(0, (S.res.medicine || 0) - 15);
          S.rlog.push("⚡ Vorfall: SG-3 gerettet! Beute geborgen (+90 Erz, +35 Tech, -15 Med).");
          note("🤝 SG-3 in Sicherheit! Sie bringen geborgene Artefakte aus dem Sektor mit.");
        }
      }
    ]
  },
  {
    id: 'woolsey_audit',
    title: '📋 NID-HAUSHALTSREVISION (RICHARD WOOLSEY)',
    kicker: 'VERWALTUNGSKONTROLLE · LEVEL 27 BÜRO',
    color: '#f59e0b',
    speaker: "Richard Woolsey",
    role: "NID / Pentagon-Rechnungsprüfer",
    text: "„General Hammond, das Pentagon verlangt eine detaillierte Ausgabenrechtfertigung. 450 Kilo waffenfähiges Naquadah für 'Kaffee-Röstung' auf Ebene 22? Und warum trägt dieser Jaffa hier eigentlich keine Dienstmütze?“",
    subtext: "Woolsey rückt seine Brille zurecht und zückt einen roten Kugelschreiber über dem SGC-Budgetbericht.",
    choices: [
      {
        label: "🍮 O'Neills Taktik: Mit blauem Wackelpudding bestechen & verwirren",
        effectText: "Woolsey starrt fasziniert auf den blauen Wackelpudding, verliert völlig den Faden und zieht verwirrt ab. Das Team feiert!",
        action: () => {
          S.res.food = Math.max(0, (S.res.food || 0) - 15);
          S.roster.forEach(m => { if (m.recruited && !m.dead) m.morale = Math.min(100, m.morale + 15); });
          S.rlog.push("🍮 Vorfall: Woolsey mit blauem Wackelpudding abgewimmelt (+15 Team-Moral, -15 Nahrung).");
          note("🍮 Woolsey verwirrt: „Dieser... Pudding verstößt gegen Paragraph 4, Colonel O'Neill!“");
        }
      },
      {
        label: "📜 Dr. Jacksons 4-stündigen Vortrag über sumerische Steuersysteme ertragen",
        effectText: "Woolsey schläft erschöpft ein. Daniel entziffert während des Vortrags alte Steuer-Tafeln der Antiker!",
        action: () => {
          S.res.tech = (S.res.tech || 0) + 50;
          S.rlog.push("📜 Vorfall: Daniel Jacksons Steuervortrag schlägt Woolsey in die Flucht (+50 Tech).");
          note("📜 Daniel: „Wussten Sie, dass die Babylonier bereits Naquadah-Zölle erhoben, Herr Woolsey?“");
        }
      },
      {
        label: "⚛️ Carter rechnet ihm thermonukleare Gleichungen vor",
        effectText: "Woolsey kapituliert vor Carters Formeln: „Ich vermerke das im Bericht als... experimentelle Astrophysik.“",
        action: () => {
          S.res.tech = (S.res.tech || 0) + 65;
          S.rlog.push("⚛️ Vorfall: Carters Quanten-Kalkulation bewilligt Forschungsbudget (+65 Tech).");
          note("⚛️ Carter: „Wenn Sie das Subraum-Potential nicht umschichten, bricht die Raumzeit zusammen.“");
        }
      }
    ]
  },
  {
    id: 'replicator_bug',
    title: '🕷️ REPLIKATOR-ALARM IM SUBSPACE-ROUTER',
    kicker: 'SICHERHEITSALARM EBENE 19 · NANITEN-INVASION',
    color: '#a855f7',
    speaker: "Major Samantha Carter",
    role: "Astrophysikerin",
    text: "„Sir! Ein metallischer Replikator-Käfer frisst an den Superdough-WebAudio-Leitungen und versucht den Code der Strudel-Soundengine zu verzehren!“ – O'Neill: „Carter, warum krabbelt Ihr Toaster?“ – Teal'c: „Projektilwaffen sind in der Tat effektiver als Energiewaffen.“",
    subtext: "Kleine metallische Klick-Geräusche hallen durch die Lüftungsschächte von Cheyenne Mountain.",
    choices: [
      {
        label: "💥 O'Neills SPAS-12 Schrotflinte einsetzen (BAM!)",
        effectText: "BAM! Die Schrotgarbe pulverisiert den Käfer in nützliche Naniten-Bausteine!",
        action: () => {
          S.res.tech = (S.res.tech || 0) + 60;
          if (S.inventory && S.inventory.special) S.inventory.special.emp = (S.inventory.special.emp || 0) + 1;
          S.rlog.push("💥 Vorfall: Replikator per Schrotflinte zerlegt (+60 Tech, +1 EMP).");
          note("💥 O'Neill: „Problem gelöst. Und holt Siler mit dem Besen!“");
        }
      },
      {
        label: "🔬 Carters Anti-Replikatoren-Disruptorwelle erforschen",
        effectText: "Carter isoliert das Subraum-Feld der Naniten und speichert das Frequenzmuster für die SGC-Forschung!",
        action: () => {
          S.res.tech = (S.res.tech || 0) + 85;
          S.res.ore = Math.max(0, (S.res.ore || 0) - 30);
          S.rlog.push("🔬 Vorfall: Anti-Replikatoren-Frequenz isoliert (+85 Tech, -30 Erz).");
          note("🔬 Carter: „Die Asgard werden von dieser Subraum-Analyse begeistert sein.“");
        }
      }
    ]
  },
  {
    id: 'content_rot_meta',
    title: '🤖 DAS „CONTENT-ROT“ & CONTEXT-PHANTOM',
    kicker: 'METAPHYSIK-LOGBUCH · UNIVERSITÄT OSNABRÜCK ANOMALIE',
    color: '#06b6d4',
    speaker: "Walter Harriman",
    role: "Tor-Leitstand",
    text: "„Sir, der Zentralrechner halluziniert! Er behauptet, wir seien Spielfiguren in einer Browser-Simulation der Universität Osnabrück und die Entwickler hätten die Token-Grenze fast erreicht.“ – Daniel: „Vielleicht eine Metapher für den Aufstieg?“ – O'Neill: „Walter, Stecker ziehen!“",
    subtext: "Auf den Terminals von Ebene 28 flackern plötzlich Zeilen von JavaScript, Strudel-Noten und ein 1,44 MB Disketten-Icon auf.",
    choices: [
      {
        label: "🔌 Stecker ziehen, Cache leeren & Hammond-Kaffee kochen",
        effectText: "Der Speicher leert sich, die Systeme laufen butterweich und das ganze Team amüsiert sich köstlich!",
        action: () => {
          S.res.ore = (S.res.ore || 0) + 60;
          S.res.tech = (S.res.tech || 0) + 30;
          S.roster.forEach(m => { if (m.recruited && !m.dead) m.morale = Math.min(100, m.morale + 20); });
          S.rlog.push("🔌 Vorfall: Contentrot durch Neustart behoben (+60 Erz, +30 Tech, +20 Moral).");
          note("🔌 O'Neill: „Funktioniert jedes Mal. Warum studiert Daniel dafür eigentlich Linguistik?“");
        }
      },
      {
        label: "🕹️ Ein Easteregg im Winamp-Marquee verewigen",
        effectText: "Das Team programmiert heimlich ein Easteregg in den SGC-AMP v2.80 Player!",
        action: () => {
          S.res.tech = (S.res.tech || 0) + 75;
          if (typeof unlockTrack === 'function') unlockTrack('theme_outro_ambient');
          S.rlog.push("🕹️ Vorfall: Easteregg im Winamp hinterlegt (+75 Tech, Outro Ambient freigeschaltet).");
          note("🕹️ SGC-AMP: Geheimer Soundtrack und Easteregg im Audio-Deck aktiv!");
        }
      }
    ]
  },
  {
    id: 'harlan_altair',
    title: '🥪 ALTAIR-KONTAKT: HARLAN IST DA!',
    kicker: 'EXTRATERRESTRISCHER BESUCH · TORRAUM',
    color: '#10b981',
    speaker: "Harlan",
    role: "Synthetischer Bewohner von Altair",
    text: "„Comtrya! Besser! Viel, viel besser! Ich habe synthetische Androiden-Duplikate von Ihnen allen angefertigt! Sie müssen nie wieder schlafen oder essen!“",
    subtext: "Harlan strahlt übers ganze Gesicht und verteilt kleine, blinkende Energiezellen.",
    choices: [
      {
        label: "🚪 „Harlan, bitte gehen Sie sofort nach Hause!“ (Iris schließen)",
        effectText: "Hammond drückt den Schließknopf. Harlan verabschiedet sich winkend durch das Tor.",
        action: () => {
          S.integrity = Math.min(100, (S.integrity || 100) + 15);
          S.rlog.push("🚪 Vorfall: Harlan freundlich nach Altair zurückbegleitet (+15 SGC-Integrität).");
          note("🚪 Hammond: „Ich liebe diesen Job... manchmal.“");
        }
      },
      {
        label: "⛏️ Die synthetischen Duplikate in den Naquadah-Minen arbeiten lassen",
        effectText: "Die unermüdlichen Androiden schuften 24 Stunden durch und fördern riesige Erzmengen!",
        action: () => {
          S.res.ore = (S.res.ore || 0) + 140;
          S.rlog.push("⛏️ Vorfall: Harlans Androiden steigern die Minenproduktion (+140 Erz).");
          note("⛏️ Harlan: „Comtrya! Sie arbeiten viel besser als die echten Menschen!“");
        }
      }
    ]
  }
];

let _activeIncident = null;

function showIncidentModal(inc){
  _activeIncident = inc;
  const m = $('modal');
  if(!m) return;
  sfx('special');
  m.style.display = 'flex';
  m.innerHTML = `<div class="mbox" style="max-width:680px;width:95vw;border:2px solid ${inc.color};box-shadow:0 0 35px ${inc.color}44">
    <div style="background:${inc.color}22;border-bottom:2px solid ${inc.color};padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="color:${inc.color};font-size:11px;font-weight:bold;letter-spacing:1.5px">${inc.kicker}</div>
        <h3 style="margin:2px 0 0;font-size:18px;color:#fff">${inc.title}</h3>
      </div>
      <span class="tag" style="background:#090e17;border:1px solid ${inc.color};color:${inc.color};font-weight:bold">STATUS: ALARM</span>
    </div>
    <div class="mbody" style="padding:16px">
      <div style="display:flex;gap:14px;align-items:flex-start;background:#090e17;padding:12px;border-radius:6px;border:1px solid #1e293b;margin-bottom:12px">
        <div style="font-size:32px">🚨</div>
        <div>
          <div style="font-weight:bold;color:#38bdf8;font-size:13px">${inc.speaker} <small style="color:#94a3b8">(${inc.role})</small></div>
          <div style="color:#e2e8f0;font-size:14px;font-style:italic;margin-top:4px;line-height:1.5">${inc.text}</div>
        </div>
      </div>
      <p style="color:#cbd5e1;font-size:13px;margin-bottom:16px;line-height:1.5">${inc.subtext}</p>
      <div style="font-size:12px;font-weight:bold;color:#ffd166;margin-bottom:8px;letter-spacing:1px">BEFEHL DES KOMMANDANTEN:</div>
      <div style="display:flex;flex-direction:column;gap:8px" id="incident-choices">
        ${inc.choices.map((c, i) => `
          <button class="winamp-btn" style="text-align:left;padding:10px 14px;background:#131c2a;border-color:${inc.color};color:#f8fafc;font-size:13px;border-radius:4px;cursor:pointer" onclick="resolveIncident(${i})">
            <b>${c.label}</b>
          </button>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function resolveIncident(choiceIdx){
  if(!_activeIncident || !_activeIncident.choices[choiceIdx]) return;
  const choice = _activeIncident.choices[choiceIdx];
  try {
    choice.action();
  } catch(e) {
    console.error('[Incident Action]', e);
  }
  toast(choice.effectText);
  _activeIncident = null;
  save();
  showReport(true);
}

function checkDailyIncident(forcedIdx = null){
  let incident = null;
  if(forcedIdx !== null && SGC_INCIDENTS[forcedIdx]){
    incident = SGC_INCIDENTS[forcedIdx];
  } else {
    // 55% Chance auf einen episodischen SGC-Vorfall
    const roll = Math.random();
    if(roll < 0.55){
      const idx = Math.floor(Math.random() * SGC_INCIDENTS.length);
      incident = SGC_INCIDENTS[idx];
    }
  }

  if(incident){
    showIncidentModal(incident);
  } else {
    showReport(true);
  }
}

function triggerWinampEasterEgg(){
  const easterEggs = [
    "🕷️ Reese' Spielzeug: Ein Replikator knabbert an der TB-303 Acid Bassline!",
    "🚨 Walter Harriman: „Chevron 7 will simply not lock, Sir... wir hören Strudel-Musik!“",
    "☕ Jack O'Neill: „In my culture, I would be considered quite a catch.“",
    "🌌 Teal'c: „Things will in fact calm up.“",
    "🎓 Uni Osnabrück: „42 Agenten simulierten diesen Beat ohne einen einzigen Compiler.“",
    "🤖 SGC-AI: „Keine Sorge, wir halluzinieren den Bass nur mit 99.8% Konfidenz!“"
  ];
  const msg = easterEggs[Math.floor(Math.random() * easterEggs.length)];
  toast(msg);
  sfx('special');
}

function doDay(forcedIdx=null){
 if(S.over)return;
 if(C.active){
  const ov=$('combat-overlay');
  if(!ov||ov.style.display==='none'||ov.style.display===''){
   C.active=false;
  } else {
   toast('⚠ Ein Kampfeinsatz läuft noch!');
   return;
  }
 }
 if(GR.phase!=='idle')return;
 endDay();
 checkDailyIncident(forcedIdx);
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
 try{
  if(C.active){
   renderCombat($('combat-cv'));
   renderCombatUI();
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
  else if(UI.tab==='colonies'&&$('colony-cv')&&typeof renderColonyCanvas==='function'){
   renderColonyCanvas($('colony-cv'),COLONY_UI.planet);
  }
 }catch(err){
  console.error('[FRAME] Render loop error:', err);
 }
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
 if($('gate-overlay'))$('gate-overlay').onclick=()=>skipGate();
 if($('gate-skip'))$('gate-skip').onclick=e=>{e.stopPropagation();skipGate();};
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
 $('combat-cv').onwheel=e=>{e.preventDefault();if(typeof zoomIsoCamera==='function')zoomIsoCamera(e.deltaY<0?0.08:-0.08);};
 $('combat-minimap').onclick=panCombatToMinimap;
 $('combat-minimap').onpointerdown=panCombatToMinimap;
 $('combat-minimap').onpointermove=e=>{if(e.buttons)panCombatToMinimap(e);};
 $('combat-end').onclick=combatEnd;
 if($('help'))$('help').onclick=showHelp;
 if($('sound'))$('sound').onclick=toggleSound;
 if($('gfx-btn'))$('gfx-btn').onclick=cycleGfxMode;
 if($('clipboard-btn'))$('clipboard-btn').onclick=showClipboardModal;
 if($('research-btn'))$('research-btn').onclick=showResearchModal;
 if($('save-btn'))$('save-btn').onclick=showSaveModal;
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
  if(typeof GR!=='undefined'&&GR.phase!=='idle'&&(e.key==='Escape'||e.key===' '||e.key==='Enter')){
   e.preventDefault();skipGate();return;
  }
  if(!inInput&&(matchesKey('cycleGfx',e)||e.key==='v'||e.key==='V')&&!UI.menuOpen){
   e.preventDefault();cycleGfxMode();return;
  }
  if(C.active&&!C.result&&!C.dialogueActive&&!UI.menuOpen&&!inInput){
   if(matchesKey('rotateLeft',e)||e.key==='q'||e.key==='Q'){e.preventDefault();if(typeof rotateIsoCamera==='function')rotateIsoCamera(-1);return;}
   if(matchesKey('rotateRight',e)||e.key==='e'||e.key==='E'){e.preventDefault();if(typeof rotateIsoCamera==='function')rotateIsoCamera(1);return;}
   if(matchesKey('nextUnit',e)||e.key==='Tab'||e.key==='n'||e.key==='N'){e.preventDefault();if(typeof cycleSGMember==='function')cycleSGMember(1);return;}
   if(matchesKey('zoomIn',e)||e.key==='+'){e.preventDefault();if(typeof zoomIsoCamera==='function')zoomIsoCamera(0.1);return;}
   if(matchesKey('zoomOut',e)||e.key==='-'){e.preventDefault();if(typeof zoomIsoCamera==='function')zoomIsoCamera(-0.1);return;}
   if(matchesKey('overwatch',e)||e.key==='o'||e.key==='O'){
    if(C.selected&&C.selected.ap>0&&!C.result&&typeof playerOverwatch==='function'){
     e.preventDefault();playerOverwatch(C.selected);return;
    }
   }

   const pans={ArrowLeft:[-2,0],a:[-2,0],A:[-2,0],ArrowRight:[2,0],d:[2,0],D:[2,0],
    ArrowUp:[0,-2],w:[0,-2],W:[0,-2],ArrowDown:[0,2],s:[0,2],S:[0,2]};
   const pan=pans[e.key];
   if(pan){e.preventDefault();combatPan(pan[0],pan[1]);return;}
  }
  if((matchesKey('endTurn',e)||e.key==='Enter'||e.key===' ')&&$('story-dialogue').style.display==='flex'){
   e.preventDefault();$('story-next')?.click();return;
  }
  if(C.active&&C.result&&(e.key==='Enter'||e.key===' '||matchesKey('endTurn',e))){
   e.preventDefault();combatEnd();return;
  }
  if(C.active&&!C.result&&C.phase==='player'&&(matchesKey('endTurn',e)||e.key==='Enter')){
   e.preventDefault();endPlayerPhase();return;
  }
  if($('modal').style.display==='flex'&&(e.key==='Enter'||e.key===' '||e.key==='Escape')){
   e.preventDefault();$('modal').style.display='none';renderAll();return;
  }
  if(matchesKey('pause',e)||e.key==='Escape'){
   if($('intro-overlay').style.display==='flex'||$('story-dialogue').style.display==='flex')return;
   if(inInput)return;
   toggleMenu();
  }
 });
 setTab('base');
 startOpeningCinematic(()=>{
  S.introSeen=true;save();
  if(!S.pilotBriefingSeen&&!S.done.includes('1-1')&&S.day===1){
   showPilotOpening();
  }
 });
 requestAnimationFrame(frame);
}

// i18n (v0.30): Sprache wechseln → aktuelle Ansicht neu rendern (R2: Core-UI)
if (typeof I18N !== 'undefined') {
  I18N.onChange(function () {
    try { if (typeof renderAll === 'function') renderAll(); } catch (e) { /* Spiel noch nicht initialisiert */ }
  });
}

window.addEventListener('load',init);
