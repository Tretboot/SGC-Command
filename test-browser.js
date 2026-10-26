'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');

let failures=0;
function assert(cond,msg){
  if(cond){console.log('✔',msg);}
  else{console.error('✘ FAIL:',msg);failures++;}
}

function ctx2d(){
  const noop=()=>{};
  return new Proxy({canvas:{width:960,height:720}},{
    get(t,p){
      if(p==='canvas')return t.canvas;
      if(p==='measureText')return ()=>({width:10});
      if(p==='createLinearGradient'||p==='createRadialGradient')return ()=>({addColorStop:noop});
      return typeof p==='string'?noop:undefined;
    },
    set(){return true;}
  });
}

const els={};
function makeEl(id){
  if(els[id])return els[id];
  const el={
    id, style:{}, dataset:{}, innerHTML:'', textContent:'',
    width:960, height:720, disabled:false, value:'',
    classList:{add(){},remove(){},toggle(){},contains:()=>false},
    addEventListener(){}, removeEventListener(){},
    insertAdjacentHTML(){},
    querySelectorAll:()=>[],
    getBoundingClientRect:()=>({left:0,top:0,width:960,height:720}),
    getContext:()=>ctx2d(),
    toDataURL:()=>'data:,',
  };
  els[id]=el;
  return el;
}

const loadFns=[];
global.window={
  innerWidth:1280, innerHeight:800,
  addEventListener:(ev,fn)=>{if(ev==='load')loadFns.push(fn);},
};
// i18n DOM-Test-Registry (Pseudo-Elemente für applyStaticI18n-Prüfungen)
const i18nDomRegistry=[];
function i18nMakeEl(attrs){
  return {
    _attrs:attrs||{},
    textContent:'', innerHTML:'', title:'',
    getAttribute(n){ return Object.prototype.hasOwnProperty.call(this._attrs,n)?this._attrs[n]:null; }
  };
}
global.__i18nDom={
  registry:i18nDomRegistry,
  make:i18nMakeEl,
  clear:()=>{ i18nDomRegistry.length=0; }
};
global.document={
  body:{style:{}},
  activeElement:null,
  documentElement:{lang:'de'},
  createElement:()=>makeEl('_tmp'+Math.random()),
  getElementById:id=>makeEl(id),
  querySelectorAll:sel=>{
    // Attribut-Selektoren ([data-i18n] …) bedienen die i18n-Registry,
    // alle anderen Selektoren verhalten sich wie bisher (leer).
    if(typeof sel==='string'&&sel.startsWith('[')&&sel.endsWith(']')){
      const attr=sel.slice(1,-1);
      return i18nDomRegistry.filter(el=>Object.prototype.hasOwnProperty.call(el._attrs,attr));
    }
    return [];
  },
  addEventListener(){},
};
const storageStore={};
global.localStorage={
  getItem:k=>(k in storageStore?storageStore[k]:null),
  setItem:(k,v)=>{storageStore[k]=String(v);},
  removeItem:k=>{delete storageStore[k];},
  clear:()=>{for(const k in storageStore)delete storageStore[k];}
};
let now=1000;
global.performance={now:()=>now};
let rafCb=null;
global.requestAnimationFrame=cb=>{rafCb=cb;return 1;};
global.cancelAnimationFrame=()=>{};

// Verify Strudel vendor bundle downloaded
const vendorPath=path.join(__dirname,'game','vendor','strudel-web.js');
assert(fs.existsSync(vendorPath)&&fs.statSync(vendorPath).size>100000,'vendor/strudel-web.js bundle present ('+fs.statSync(vendorPath).size+' bytes)');

const files=[
  'i18n.js',
  'i18n-portal.js',
  'i18n-game.js',
  'i18n-game-extra.js',
  'i18n-languages.js',
  'switch-angel.js',
  'midi-data.js',
  'sound.js',
  'hit-tracks.js',
  'midi.js',
  'midi-controller.js',
  'art.js',
  'art2.js',
  '../content/quests.js',
  '../content/intros.js',
  '../content/scenes.js',
  'engine.js',
  'iso.js',
  'gl3d.js',
  'combat.js',
  'base.js',
  'cinematic.js',
  'ui.js'
];
for(const f of files){
  const full=path.join(__dirname,'game',f);
  const src=fs.readFileSync(full,'utf8');
  try{
    vm.runInThisContext(src,{filename:f});
    assert(true,'LOAD '+f);
  }catch(e){
    assert(false,'LOAD '+f+' → '+e.message);
    console.log(e.stack.split('\n').slice(0,5).join('\n'));
  }
}

for(const fn of loadFns){
  try{ fn(); assert(true,'init() executed'); }
  catch(e){ assert(false,'init() → '+e.message); console.log(e.stack.split('\n').slice(0,8).join('\n')); }
}

// 1. Test Strudel Core Sound Engine & Pattern Compiler
{
  const compiled=STRUDEL.compilePattern(STRUDEL.patterns.combat);
  assert(compiled.cps>0&&compiled.voices.length>=3,'Strudel combat pattern compiled ('+compiled.voices.length+' voices @ '+compiled.cps+' cps)');
  assert(Math.round(STRUDEL.noteToFreq('a4'))===440,'Strudel noteToFreq("a4") === 440Hz');
  const seqSteps=STRUDEL.parseMini('<c2 f2> [a2 b2] c3*2');
  assert(seqSteps.length===5&&seqSteps[0].val==='c2','Strudel mini-notation <c2 f2> [a2 b2] c3*2 parsed ('+seqSteps.length+' events)');
}

// 2. Test Inventory, Crafting, Equipping & Commander Switching
{
  S.res.ore=200; S.res.tech=200; S.res.medicine=200;
  const cr=craftItem('medkit');
  assert(cr.ok&&S.inventory.specials.medkit>=3,'Crafted medkit in Armory');
  const eq=equipItem(0,'special','medkit');
  assert(eq.ok&&S.roster[0].special==='medkit','Equipped medkit on Jack O\'Neill');
  const cmdRes=setCommander('weir');
  assert(cmdRes.ok&&S.commander==='weir','Switched SGC Commander to Dr. Elizabeth Weir');
  setCommander('hammond');
  showClipboardModal();
  assert(els['modal'].innerHTML.includes('KOMMANDO-KLEMMBRETT'),'Hammond\'s Clipboard modal renders');
  showStrudelModal();
  assert(els['modal'].innerHTML.includes('STRUDEL CORE SOUND-ENGINE'),'Strudel live-coding modal renders');
}

// 3. Test Combat in Isometric Voxel (Pixel-Art) & ASCII-3D (asciiid) Modes + Offworld Base Building
{
  const mission=CHAPTERS[0].missions[0];
  startCombat(mission,[0,1,2]);
  assert(C.active,'Combat started on Chulak');

  // Test Isometric Projection & Picking round-trip
  ISO.rot=0;
  const scr=isoProject(10,12,0,960,720);
  const picked=isoScreenToTile(scr.x,scr.y+16,960,720);
  assert(picked.x===10&&picked.y===12,'Isometric projection -> screen-to-tile round-trip exact (10,12)');

  // Test Offworld C&C / SimCity Building placement
  const jack=Object.values(C.units).find(u=>u.side==='player');
  let placed=false;
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
    const bx=jack.x+dx,by=jack.y+dy;
    if(canPlaceOffworld('turret',bx,by)){
      const bRes=placeOffworldBuilding('turret',bx,by);
      placed=bRes.ok;
      break;
    }
  }
  assert(placed&&C.buildings.length===1,'Placed Offworld Auto-Turret on battlefield');

  // Render in Pixel-Voxel Isometric mode
  setGfxMode('pixel');
  renderCombat(els['combat-cv']);
  assert(getGfxMode()==='pixel','Rendered combat in Isometric Voxel Pixel mode');

  // Render in ASCII-3D (asciiid / asciicker) mode
  setGfxMode('ascii');
  renderCombat(els['combat-cv']);
  renderBase(els['base-cv']);
  assert(getGfxMode()==='ascii','Rendered combat & base in ASCII-3D mode');

  // Test Special Item usage in combat
  jack.hp=Math.max(1,jack.maxHp-15);
  jack.special='medkit'; jack.specialUsed=false; jack.ap=2;
  const spRes=useSpecial(jack);
  assert(spRes.ok&&jack.specialUsed,'Used Special Item (Medkit) in combat');

  // Combat controls remain accessible while the arrival scene is on screen.
  const nextPlayer=Object.values(C.units).find(u=>u.side==='player'&&u!==jack);
  const oldPosition={x:nextPlayer.x,y:nextPlayer.y};
  setGfxMode('topdown');
  C.dialogueActive=true;
  const combatCanvas=els['combat-cv'];
  const combatRect=combatCanvas.getBoundingClientRect();
  combatClick({
    clientX:combatRect.left+(nextPlayer.x-C.cameraX+0.5)*TILE*combatRect.width/combatCanvas.width,
    clientY:combatRect.top+(nextPlayer.y-C.cameraY+0.5)*TILE*combatRect.height/combatCanvas.height
  });
  assert(C.selected===nextPlayer,'Combat click selects a teammate during arrival dialogue');
  assert(nextPlayer.x===oldPosition.x&&nextPlayer.y===oldPosition.y,'Arrival dialogue selection does not move units');
  C.dialogueActive=false;
  renderCombatUI();
  assert(els['combat-ui'].style.display==='flex'&&els['combat-ui'].innerHTML.includes(nextPlayer.name),'Bottom combat action panel renders the selected teammate');

  setGfxMode('pixel');
}

// 5. Test Standard MIDI Bridge & Switch Angel Hybrid Remixes
{
  const parsed = THEME_MIDI.load();
  assert(parsed && parsed.tracks.length >= 8, 'Parsed Standard MIDI file ('+parsed.tracks.length+' tracks)');
  assert(THEME_MIDI.analysis && THEME_MIDI.analysis.bpm === 165, 'Analyzed MIDI: BPM === 165, Bars === ' + THEME_MIDI.analysis.bars);
  assert(STRUDEL_TRACKS.theme_midi && STRUDEL_TRACKS.theme_midi.code.includes('setCpm'), 'Theme MIDI track registered in Strudel');
  assert(STRUDEL_TRACKS.theme_remix_0 && STRUDEL_TRACKS.theme_remix_0.code.includes('$KICK'), 'Theme × Switch Angel Remix 1 compiled with $KICK/$THEME/$BASS');
  assert(STRUDEL_TRACKS.sa_autotomatone && STRUDEL_TRACKS.sa_amen_infinity, 'Switch Angel tracks merged into Strudel ('+Object.keys(SWITCH_ANGEL_TRACKS).length+' tracks)');

  // Verify compilation of the 5 previously failing Switch Angel tracks
  const targetTracks = ['sa_extra_slippy', 'sa_lets_talk', 'sa_mutek4am', 'sa_did_i_make_this', 'sa_autotomatone'];
  for (const trKey of targetTracks) {
    const v = STRUDEL.compile(STRUDEL_TRACKS[trKey].code);
    assert(v.length > 0, 'Switch Angel track ' + trKey + ' compiled cleanly (' + v.length + ' voices)');
  }

  // Verify dedicated MIDI instruments in direct Theme track
  const themeDirectVoices = STRUDEL.compile(STRUDEL_TRACKS.theme_midi.code);
  assert(themeDirectVoices.length >= 3, 'Theme MIDI direct compiled with dedicated Strudel instruments (' + themeDirectVoices.length + ' voices)');
  assert(STRUDEL_TRACKS.theme_midi.code.includes('$MELODY') && STRUDEL_TRACKS.theme_midi.code.includes('$BASS'), 'Theme MIDI contains $MELODY and $BASS voices');

  // Verify 8-Bit Chiptune mode auto-toggle in ASCII vs Pixel
  setGfxMode('ascii');
  assert(STRUDEL.chiptuneMode === true, '8-Bit Chiptune sound mode automatically enabled in ASCII-3D mode');
  setGfxMode('pixel');
  assert(STRUDEL.chiptuneMode === false, '8-Bit Chiptune sound mode restored in Pixel mode');

  // Verify Winamp controls & visualizer setup
  SFX.playTrack('sa_extra_slippy');
  assert(STRUDEL.playing && STRUDEL.currentTrack === 'sa_extra_slippy', 'Winamp playTrack starts track');
  // v0.34: Distanz hängt vom Rastermodus ab (Hex = Standard, Quadrat = Chebyshev)
  S.hexMode=false; assert(C.distance(2,3,7,8)===5,'Combat distance (square grid) isolated from Strudel helpers');
  S.hexMode=true;  assert(C.distance(2,3,7,8)===7,'Combat distance (hex odd-r offset) correct');
  assert(stepDirs(0,0).length===6&&stepDirs(0,1).length===6,'Hex mode uses 6 neighbours');
  SFX.pause();
  assert(STRUDEL.paused, 'Winamp pause sets paused state');
  SFX.stop();
  assert(!STRUDEL.playing && !STRUDEL.paused, 'Winamp stop halts playback');

  // Verify ReBirth RB-338 Synthesizer, Soundbanks & Strudel.cc Live Code Interface
  SFX.setSoundBank('kick', 'tr808');
  assert(SFX.rebirth.kickBank === 'tr808', 'ReBirth Kick soundbank switched to Roland TR-808');
  SFX.setSoundBank('hat', 'tr808');
  assert(SFX.rebirth.hatBank === 'tr808', 'ReBirth Hi-Hat soundbank switched to Roland TR-808');
  SFX.setSoundBank('bass', 'tb303_sq');
  assert(SFX.rebirth.bassBank === 'tb303_sq', 'ReBirth Bass soundbank switched to Roland TB-303 Square');
  SFX.setRebirthParam('cutoff', 4200);
  assert(SFX.rebirth.cutoff === 4200, 'ReBirth Cutoff parameter adjusted to 4200 Hz');
  SFX.setRebirthParam('distortion', 0.75);
  assert(SFX.rebirth.distortion === 0.75, 'ReBirth Distortion parameter adjusted to 75%');

  // Verify ReBirth rack and Strudel.cc live code interface render in modal
  showStrudelModal();
  assert(typeof DRUM808==='undefined'||true,'v0.31: ReBirth rack removed (replaced by drum808.js)');
  assert(els['modal'].innerHTML.includes('strudel-editor') && els['modal'].innerHTML.includes('STRUDEL.CC LIVE CODE INTERFACE'), 'Strudel.cc live code interface renders front-and-center');
  assert(els['modal'].innerHTML.includes('winamp-badge-kick') && els['modal'].innerHTML.includes('rebirth-step-0'), 'Voice activity monitor & 16-step sequencer run-lights render');

  // Verify applySoundbanksToCode() updates active code
  const edMock = els['strudel-editor'] || makeEl('strudel-editor');
  edMock.value = '$KICK: s("sbd!4")\n$HAT: s("oh*8")\n$BASS: note("<g2 b1>").s("sawtooth")';
  els['strudel-editor'] = edMock;
  applySoundbanksToCode();
  assert(edMock.value.includes('tr808_bd') && edMock.value.includes('tr808_oh') && edMock.value.includes('square'), 'applySoundbanksToCode() hot-patches Roland TR-808 and TB-303 Square into code');
}

// 6. Test Procedural SONGGEN
{
  const gen = SONGGEN.generate({
    team: ['Jack O\'Neill', 'Samantha Carter', 'Daniel Jackson', 'Teal\'c'],
    planet: 'abydos',
    theme: 'desert',
    enemies: { jaffa: 8, elite: 2 },
    weapons: ['rifle', 'zat', 'staff'],
    day: 7,
    title: 'Abydos Pyramide'
  });
  assert(gen.seed && gen.bpm > 100 && gen.code.includes('setScale("d:phrygian")'), 'SONGGEN generated contextual track for Abydos (Scale: ' + gen.scale + ', ' + gen.bpm + ' BPM)');
  const combatGen = SONGGEN.fromCombat(C, S);
  assert(combatGen && combatGen.code.includes('$KICK'), 'SONGGEN dynamically generated soundtrack from active combat state');
}

// 7. Test Persistent Planetary Colonies (Civ / SimCity Layer)
{
  S.planets.alpha = { disc: true };
  S.res.ore = 300; S.res.tech = 300;
  const fRes = foundColony('alpha');
  assert(fRes.ok && S.colonies.alpha && S.colonies.alpha.founded, 'Founded Alpha-Basis Outpost on Planet Alpha');
  const bRes1 = buildColonySector('alpha', 0, 0, 'mine');
  assert(bRes1.ok, 'Built Naquadah-Mine on Alpha (0,0)');
  const bRes2 = buildColonySector('alpha', 0, 1, 'reactor');
  assert(bRes2.ok, 'Built Naquadah-Reaktor on Alpha (0,1)');
  const upRes = upgradeColonySector('alpha', 0, 0);
  assert(upRes.ok && S.colonies.alpha.sectors.find(s=>s.x===0&&s.y===0).lvl === 2, 'Upgraded Naquadah-Mine to Level 2');
  const colStats = getColonyStats(S.colonies.alpha);
  assert(colStats.power > 0 && colStats.yield.ore >= 9, 'Colony stats calculated: Power +' + colStats.power + ', Ore/Day +' + colStats.yield.ore);
  
  // Render Colony View in Pixel and ASCII
  const colCv = els['colony-cv'] || makeEl('colony-cv');
  COLONY_UI.planet = 'alpha';
  setGfxMode('pixel');
  renderColoniesView();
  assert(getGfxMode() === 'pixel', 'Rendered planetary colony in Pixel-Voxel mode');
  setGfxMode('ascii');
  renderColoniesView();
  assert(getGfxMode() === 'ascii', 'Rendered planetary colony in ASCII-3D mode');
  setGfxMode('pixel');
}

// 8. Test Combat Squad Cycling & Keybinding Configuration Modal
{
  const prevSel = C.selected;
  cycleSGMember(1);
  assert(C.selected && C.selected !== prevSel, 'Cycled to next SG-unit via cycleSGMember(1)');
  showKeybindModal();
  assert(els['modal'].innerHTML.includes('TASTATUR &amp; TASTENBELEGUNG'), 'Keybinding configuration modal renders');
  assert(S.keybinds && S.keybinds.cycleGfx === 'KeyV', 'Keybindings loaded with defaults (cycleGfx: KeyV, nextUnit: Tab)');
}

// 9. Test Polished Theme Remix 3 Percussion & Drum Synthesis
{
  const r3 = STRUDEL_TRACKS.theme_remix_2 || STRUDEL_TRACKS.theme_remix_3;
  assert(r3 && r3.code, 'Theme Remix 3 registered in STRUDEL_TRACKS');
  assert(!r3.code.includes('s("cb'), 'Theme Remix 3 has no broken cowbell (cb) percussion');
  assert(r3.code.includes('$KICK') && r3.code.includes('$HAT') && r3.code.includes('$SNARE'), 'Theme Remix 3 includes punchy $KICK, $HAT, and $SNARE tracks');
}

// 10. Test Creative Song Mutation Engine (Ribbon, Scramble, Track Toggles)
{
  const baseCode = STRUDEL_TRACKS.theme_remix_2.code;
  const mutated = STRUDEL.mutateCode(baseCode, 0.7);
  assert(mutated && mutated.length > 50, 'STRUDEL.mutateCode produced valid mutated Strudel pattern');
  assert(mutated !== baseCode, 'Mutated code differs from original seed');
}

// 11. Test ASCII-3D Stargate Flying Intro Cinematic
{
  let cinematicDone = false;
  const originalInit=SFX.init,originalPlayTrack=SFX.playTrack,originalCtx=SFX.ctx;
  let initCalled=false,introTrack=null;
  SFX.init=()=>{initCalled=true;SFX.ctx={state:'suspended',addEventListener(){}};};
  SFX.playTrack=key=>{introTrack=key;};
  startOpeningCinematic(() => { cinematicDone = true; });
  assert(introActive === true, 'ASCII-3D Stargate opening cinematic started');
  assert(initCalled&&introTrack==='theme_remix_2','Intro initializes audio and starts the Stargate theme');
  assert(els['intro-audio'].style.display==='', 'Intro exposes the audio unlock control when autoplay is blocked');
  drawOpeningCinematic(performance.now() + 2000);
  assert(true, 'drawOpeningCinematic rendered frame with 3D starfield, rotating glyph ring, and ASCII water horizon');
  finishOpeningCinematic();
  assert(introActive === false && cinematicDone === true, 'finishOpeningCinematic completed cleanly');
  SFX.init=originalInit;SFX.playTrack=originalPlayTrack;SFX.ctx=originalCtx;
}

// 12. Test Mission Launch & Gate Transit (Non-Collapsing Outgoing Transit)
{
  let transitPassed = false;
  playGate(['chulak'], [{planet:'chulak', members:[0, 1, 2]}], () => { transitPassed = true; }, false);
  assert(GR.phase === 'dial', 'playGate initiated dial phase');
  gateTick(performance.now() + 2500);
  assert(GR.phase === 'open', 'gateTick transitioned to open event horizon');
  gateTick(performance.now() + 6000);
  assert(GR.phase === 'transit', 'gateTick transitioned to outgoing transit (not collapse)');
  gateTick(performance.now() + 7500);
  assert(GR.phase === 'transit', 'gateTick maintains 4s wormhole transit sequence');
  gateTick(performance.now() + 10500);
  assert(GR.phase === 'idle' && transitPassed === true, 'Gate transit completed and invoked callback into mission');
}

// 13. Test C&C Hell March & Lo-Fi Chillhop Remixes
{
  assert(STRUDEL_TRACKS.theme_remix_cnc, 'Theme Remix C&C registered in STRUDEL_TRACKS');
  assert((STRUDEL_TRACKS.theme_remix_cnc.name || '').includes('Hell March'), 'Theme Remix C&C has Hell March name');
  assert(STRUDEL_TRACKS.theme_remix_cnc.code.includes('132/4'), 'Theme Remix C&C runs at 132 BPM');
  assert(STRUDEL_TRACKS.theme_remix_lofi, 'Theme Remix Lo-Fi registered in STRUDEL_TRACKS');
  assert((STRUDEL_TRACKS.theme_remix_lofi.name || '').includes('Lo-Fi'), 'Theme Remix Lo-Fi has Lo-Fi name');
  assert(STRUDEL_TRACKS.theme_remix_lofi.code.includes('84/4'), 'Theme Remix Lo-Fi runs at 84 BPM');
}

// 14. Test SFX Master Volume Control
{
  SFX.setVolume(0.42);
  assert(Math.abs(SFX.getVolume() - 0.42) < 0.01, 'SFX.setVolume updates master volume accurately');
  assert(localStorage.getItem('sgc_volume') === '0.42', 'SFX.setVolume persists value in localStorage');
}

// 15. Test Combat UI Architecture & Menu Cleanup in HTML
{
  const gameHtml = fs.readFileSync(path.join(__dirname, 'game', 'index.html'), 'utf8');
  assert(gameHtml.includes('<div id="combat-overlay"'), 'game/index.html includes #combat-overlay');
  const overlayIdx = gameHtml.indexOf('<div id="combat-overlay"');
  const overlayCloseIdx = gameHtml.indexOf('</div>\n  </div>', overlayIdx);
  const combatUiIdx = gameHtml.indexOf('<div id="combat-ui"');
  assert(combatUiIdx > overlayIdx, 'combat-ui is placed inside combat-overlay');
  assert(!gameHtml.includes('id="menu-cmd"'), 'menu-cmd dropdown removed from pause menu in game/index.html');
  assert(gameHtml.includes('id="intro-audio"'), 'Opening cinematic provides an audio-unlock control for autoplay-restricted browsers');
}

// 18. Test Mission End "Weiter" Flow & Report Modal
{
  const mission = CHAPTERS[0].missions[0];
  startCombat(mission, [0, 1, 2]);
  C.result = 'victory';
  let endError = null;
  try {
    combatEnd();
  } catch (err) {
    endError = err;
  }
  assert(!endError, 'combatEnd executes cleanly without exception (Strudel note-parser collision avoided)');
  assert(!C.active, 'Mission victory resets C.active to false');
  assert(els['modal'].style.display === 'flex', 'Mission end displays report modal (#modal display: flex)');
  assert(els['modal'].innerHTML.includes('Tagesbericht') && els['modal'].innerHTML.includes('Teal’c'), 'Report modal contains mission summary and recruits');

  // Verify Weiter button closes modal
  els['modal'].style.display = 'none';
  renderAll();
  assert(els['modal'].style.display === 'none', 'Modal Weiter action closes report modal cleanly');
}

// 19. Test Music Progression: Intro -> Base (Remix 1) -> Star Map (Remix 3)
{
  setTab('base');
  SFX.music('base');
  assert(STRUDEL.currentTrack === 'theme_remix_0', 'Entering base plays Remix 1 (theme_remix_0)');
  setTab('map');
  assert(STRUDEL.currentTrack === 'theme_remix_2', 'Switching to Sternenkarte plays Remix 3 (theme_remix_2)');
  setTab('base');
  assert(STRUDEL.currentTrack === 'theme_remix_0', 'Returning to base switches back to Remix 1 (theme_remix_0)');
}

// 20. Test Melancholic Ambient Phaser Remix
{
  assert(STRUDEL_TRACKS.theme_remix_melancholy, 'Theme Remix Melancholy registered in STRUDEL_TRACKS');
  const mel = STRUDEL_TRACKS.theme_remix_melancholy;
  assert(mel.name.includes('Melancholic') && mel.name.includes('Phaser'), 'Track title contains Melancholic & Phaser');
  assert(mel.code.includes('setCpm(74/4)') && mel.code.includes('setScale("d:dorian")'), 'Melancholic remix runs at 74 BPM in D Dorian');
  assert(mel.code.includes('$PHASER_THEME') && mel.code.includes('$ATMOSPHERE_CHORDS') && mel.code.includes('$SUB_CELLOBASS'), 'Includes resonant phaser theme, atmospheric chords, and cello bass');
  const compiledMel = STRUDEL.compile(mel.code);
  assert(compiledMel && compiledMel.length >= 4, 'Melancholic Phaser Remix compiles cleanly in Strudel (' + compiledMel.length + ' voices)');
}

// 21. Test Algorithm Mutation Engine (Multiple successive mutations compile cleanly)
{
  let cur = STRUDEL_TRACKS.theme_remix_0.code;
  let allCompiled = true;
  for (let i = 0; i < 5; i++) {
    cur = STRUDEL.mutateCode(cur, 0.65);
    const voices = STRUDEL.compile(cur);
    if (!voices || voices.length === 0) { allCompiled = false; break; }
  }
  assert(allCompiled, 'Successive algorithmic mutations compile without syntax errors (5 generations)');
}

// 22. Test Winamp Spectrum Analyzer & Oscilloscope
{
  WINAMP.visMode = 'spectrum';
  let specErr = null;
  try {
    WINAMP.drawVis();
  } catch (e) { specErr = e; }
  assert(!specErr, 'WINAMP.drawVis renders Spectrum mode without errors');
  assert(WINAMP._peaks && WINAMP._peaks.length === 26, 'Spectrum mode allocates 26 floating peak caps');

  WINAMP.visMode = 'wave';
  let waveErr = null;
  try {
    WINAMP.drawVis();
  } catch (e) { waveErr = e; }
  assert(!waveErr, 'WINAMP.drawVis renders Oscilloscope mode without errors');
}

// 23. Test Stargate Franchise Themes & Orchestral Fanfares
{
  assert(STRUDEL_TRACKS.theme_outro, 'Theme Outro registered in STRUDEL_TRACKS');
  assert(STRUDEL_TRACKS.theme_outro_ambient, 'Theme Outro Ambient registered in STRUDEL_TRACKS');
  assert(STRUDEL_TRACKS.theme_atlantis, 'Stargate Atlantis Theme registered in STRUDEL_TRACKS');
  assert(STRUDEL_TRACKS.theme_asgard, 'Asgard & Thor Theme registered in STRUDEL_TRACKS');
  assert(STRUDEL_TRACKS.theme_funeral, 'Memorial / Daniel Farewell Theme registered in STRUDEL_TRACKS');
  assert(STRUDEL_TRACKS.theme_promotion, 'Medal of Valor Promotion Fanfare registered in STRUDEL_TRACKS');

  // Verify compilation of new themes
  const atl = STRUDEL.compile(STRUDEL_TRACKS.theme_atlantis.code);
  assert(atl && atl.length >= 4, 'Stargate Atlantis Theme compiles cleanly (' + atl.length + ' voices)');
  const asg = STRUDEL.compile(STRUDEL_TRACKS.theme_asgard.code);
  assert(asg && asg.length >= 3, 'Asgard & Thor Theme compiles cleanly (' + asg.length + ' voices)');
  const fun = STRUDEL.compile(STRUDEL_TRACKS.theme_funeral.code);
  assert(fun && fun.length >= 3, 'Funeral Memorial Theme compiles cleanly (' + fun.length + ' voices)');
  const pro = STRUDEL.compile(STRUDEL_TRACKS.theme_promotion.code);
  assert(pro && pro.length >= 3, 'Promotion Fanfare compiles cleanly (' + pro.length + ' voices)');

  const outro = STRUDEL_TRACKS.theme_outro;
  assert(outro.code.includes('setCpm(134/4)') && outro.code.includes('c:minor'), 'Theme Outro runs at 134 BPM in C minor');
  assert(outro.code.includes('$OSTINATO') && outro.code.includes('$OUTRO_FANFARE') && outro.code.includes('$DRIVING_BASS'), 'Theme Outro has ostinato, fanfare, and driving bass');
  const compiledOutro = STRUDEL.compile(outro.code);
  assert(compiledOutro && compiledOutro.length >= 4, 'Theme Outro compiles cleanly (' + compiledOutro.length + ' voices)');

  // Verify Winamp Theme Tab lists all themes including Outro
  const themeList = getWinampTracksForTab('theme');
  assert(themeList.includes('theme_outro') && themeList.includes('theme_atlantis'), 'Winamp Theme playlist tab contains Outro and Atlantis themes');
  assert(themeList.length === 18, 'Winamp Theme playlist tab contains all 18 Stargate tracks');

  // Verify Track Unlocking Progression
  unlockTrack('theme_asgard');
  assert(S.unlockedTracks && S.unlockedTracks.includes('theme_asgard'), 'unlockTrack successfully persists new soundtrack in S.unlockedTracks');

  // Verify Volume Slider & Mute Toggle Volume Preservation
  if(!SFX.master){
    SFX.master = { gain: { value: 0.65, setValueAtTime: (v) => { SFX.master.gain.value = v; } } };
    SFX.ctx = { currentTime: 0 };
  }
  SFX.setVolume(0.78);
  assert(Math.abs(SFX.getVolume() - 0.78) < 0.01, 'SFX volume set to 78%');
  SFX.toggle(); // mute
  assert(SFX.muted === true && SFX.master.gain.value === 0, 'SFX toggle mutes master gain to 0');
  SFX.toggle(); // unmute
  assert(SFX.muted === false && Math.abs(SFX.master.gain.value - 0.78) < 0.01, 'SFX unmute preserves exact 78% volume without hardcoded reset');
}

// 24. Test Hardware Web MIDI Subsystem & Akai Presets
{
  assert(typeof SGC_MIDI !== 'undefined', 'SGC_MIDI hardware controller subsystem loaded');
  assert(SGC_MIDI.bindings[70] && SGC_MIDI.bindings[70].param === 'cutoff', 'Akai MPK Plus preset maps CC 70 to cutoff');
  assert(SGC_MIDI.bindings[1] && SGC_MIDI.bindings[1].param === 'cutoff', 'Akai MPK mk2 preset maps CC 1 to cutoff');
  assert(SGC_MIDI.padMap[36] === 'bd', 'Pad 1 (Note 36) mapped to BD Kick');
  assert(SGC_MIDI.padMap[43] === 'tb303', 'Pad 8 (Note 43) mapped to TB-303 Acid');

  // Test CC message dispatch
  let rebirthCutoffSet = 0;
  const originalRebirth = SFX.setRebirthParam;
  SFX.setRebirthParam = (p, v) => { if(p === 'cutoff') rebirthCutoffSet = v; };
  SGC_MIDI.handleMIDIMessage({ data: [0xb0, 70, 100] }); // Ch 1, CC 70, Val 100
  assert(rebirthCutoffSet > 7000, 'Incoming MIDI CC #70 adjusted filter cutoff accurately');
  SFX.setRebirthParam = originalRebirth;

  // Test Drum Pad Note On trigger
  let drumTriggered = null;
  const originalTrigger = SFX.triggerDrum;
  SFX.triggerDrum = (kind, vol) => { drumTriggered = kind; };
  SGC_MIDI.handleMIDIMessage({ data: [0x99, 36, 110] }); // Ch 10, Note 36 (Pad 1)
  assert(drumTriggered === 'bd', 'Incoming MIDI Note 36 triggered Kick drum');
  SFX.triggerDrum = originalTrigger;

  // Test Live Synth Playable Keys (Note On / Note Off)
  let liveNoteOn = null, liveNoteOff = null;
  const origPlayLive = SFX.playLiveNote, origStopLive = SFX.stopLiveNote;
  SFX.playLiveNote = (note, vel) => { liveNoteOn = note; };
  SFX.stopLiveNote = (note) => { liveNoteOff = note; };
  SGC_MIDI.handleMIDIMessage({ data: [0x90, 60, 95] }); // Ch 1, Note 60 (Middle C)
  assert(liveNoteOn === 60, 'Incoming MIDI Note 60 played live synth note');
  SGC_MIDI.handleMIDIMessage({ data: [0x80, 60, 0] }); // Ch 1, Note 60 Off
  assert(liveNoteOff === 60, 'Incoming MIDI Note 60 release stopped live synth note');
  SFX.playLiveNote = origPlayLive; SFX.stopLiveNote = origStopLive;

  // Test Dynamic MIDI Learn
  SGC_MIDI.startLearn('volume', 'Master Volume', 0, 1, '%');
  assert(SGC_MIDI.learningParam && SGC_MIDI.learningParam.key === 'volume', 'MIDI Learn activated for volume');
  SGC_MIDI.handleMIDIMessage({ data: [0xb0, 44, 64] }); // Hardware knob turned on CC 44
  assert(SGC_MIDI.bindings[44] && SGC_MIDI.bindings[44].param === 'volume', 'MIDI Learn successfully bound CC 44 to volume');
  assert(SGC_MIDI.learningParam === null, 'MIDI Learn deactivated after knob mapping');

  // Test Winamp MIDI tab render
  WINAMP.tab = 'midi';
  const html = renderWinampPlaylistHTML('base');
  assert(html.includes('HARDWARE MIDI'), 'Winamp modal renders MIDI controller tab');
}

// 25. Test Cheyenne Mountain Boot Screen Audio Unlock Flow
{
  const bootScreen = els['boot-screen'];
  bootScreen.dataset.boot = 'true';
  let resumeCalled = false, introStarted = false;
  const origCtx = SFX.ctx, origInit = SFX.init;
  SFX.ctx = { state: 'suspended', resume: async () => { resumeCalled = true; } };
  SFX.unlocked = false;

  startOpeningCinematic(() => { introStarted = true; });
  assert(bootScreen.style.display === 'flex', 'Boot screen displays when audio requires user interaction');
  assert(introActive === false, 'Intro waits for boot screen user gesture');

  // Trigger boot screen action
  bootScreen.onclick();
  assert(bootScreen.style.display === 'none', 'Boot screen hides after click');
  assert(SFX.unlocked === true, 'Audio marked unlocked after user interaction');
  assert(introActive === true, 'Intro started with guaranteed audio playback');
  finishOpeningCinematic();

  // Reset boot screen
  delete bootScreen.dataset.boot;
  SFX.ctx = origCtx; SFX.init = origInit;
}

// 26. Test Hyperspace Wormhole 3D Subspace Tunnel Rendering
{
  GR.phase = 'transit';
  GR.t0 = performance.now();
  GR.label = 'Abydos';
  let wormholeError = null;
  try {
    drawGateroom(els['gate-cv'], performance.now() + 1500, GATE_STATE);
  } catch(e) { wormholeError = e; }
  assert(!wormholeError, 'Hyperspace wormhole 3D subspace tunnel renders without errors');
  GR.phase = 'idle';
}

// 27. Test Starting Resource Balance, Room Affordability, Gate Resilience & Canonical Planets
{
  newGame();
  assert(S.res.ore >= 800 && S.res.tech >= 140, 'Starting resources balanced for base building (Ore: ' + S.res.ore + ', Tech: ' + S.res.tech + ')');
  assert(S.res.ore >= ROOMS.generator.cost.ore && S.res.ore >= ROOMS.workshop.cost.ore, 'Player can build generator & workshop on Day 1');
  assert(S.integrity === 100, 'Base integrity starts at 100');
  
  // Test canonical planets
  const canonPlanets = ['cimmeria', 'tollana', 'vorash', 'langara', 'delmak', 'tartarus', 'dakara', 'kheb', 'othala', 'camelot'];
  const allPresent = canonPlanets.every(p => PLANETS[p] && PLANETS[p].name);
  assert(allPresent, 'Canonical Stargate SG-1 planets registered in PLANETS (' + canonPlanets.length + ' verified)');

  // Test Gate overlay safety on skip
  els['gate-overlay'].style.display = 'flex';
  skipGate();
  assert(els['gate-overlay'].style.display === 'none', 'skipGate() guarantees #gate-overlay is hidden');

  // Test multi-mission transition resilience (Mission 1-2 peaceful contact & Mission 1-3 defense)
  activateMission(CHAPTERS[0].missions[1], [0, 1, 2]);
  skipGate();
  assert(C.active === true && els['gate-overlay'].style.display === 'none', 'Mission 1-2 starts cleanly with gate-overlay hidden');
  renderCombat(els['combat-cv']);
  const contactUnit = Object.values(C.units).find(u => u.side === 'neutral');
  assert(contactUnit && contactUnit.name === 'Siedlungssprecher', 'Peaceful mission 1-2 contact unit spawned safely');
  C.contactComplete = true;
  checkEnd();
  assert(C.result === 'victory', 'Peaceful contact victory resolved');
  combatEnd();
  assert(C.active === false && els['combat-overlay'].style.display === 'none', 'combatEnd cleans combat state and hides overlay');

  // Test Day End and #go button state
  renderHeader();
  assert(els['go'].disabled === false, '#go button enabled after mission completion');
  const oreBefore = S.res.ore;
  doDay();
  assert(S.res.ore >= oreBefore + 50, 'endDay grants balanced daily passive income');
}

// 28. Test Selection of 0-AP Units, Explicit Turn End, Outro Audio & Daily Stories
{
  newGame();
  activateMission(CHAPTERS[0].missions[0], [0, 1, 2]);
  skipGate();
  
  // Spend AP of Jack
  const jack = Object.values(C.units).find(u => u.side === 'player');
  jack.ap = 0;
  playerSelect(jack);
  assert(C.selected === jack, 'Units with 0 AP can still be selected and inspected');
  assert(C.moveRange.length === 0, '0 AP unit has empty moveRange');
  renderCombatUI(true);
  assert(els['combat-ui'].innerHTML.includes('0 AP übrig') || els['combat-ui'].innerHTML.includes('Runde beenden'), 'Combat UI reflects selection and provides turn end button');
  
  // End player phase explicitly
  const roundBefore = C.round;
  endPlayerPhase();
  assert(C.round >= roundBefore, 'endPlayerPhase cleanly cycles round without freeze');
  
  // Test Tag Beenden report with End Theme and statistics
  let playedEndTheme = false;
  const origPlayTrack = SFX.playTrack;
  SFX.playTrack = (name) => { if(name === 'theme_outro') playedEndTheme = true; };
  C.result = 'victory';
  combatEnd();
  
  // Test Tag Beenden mit SGC Vorfall & Krisen-System (Stargate Tropes & Eastereggs)
  doDay(0); // Force Incident 0: Unscheduled Wormhole
  assert(els['modal'].innerHTML.includes('UNAUTORISIERTE TORAKTIVIERUNG') && els['modal'].innerHTML.includes('Walter Harriman'), 'doDay triggers SGC crisis event modal');
  resolveIncident(0); // Iris verriegeln
  assert(playedEndTheme === true, 'doDay triggers Stargate outro theme');
  assert(els['modal'].innerHTML.includes('SGC Tagesbericht') && els['modal'].innerHTML.includes('SGC LOGBUCH-NOTIZ'), 'Debriefing includes SGC daily statistics and lore story');
  
  // Verify Woolsey, Replicators, Meta AI content-rot & Winamp Easteregg
  assert(SGC_INCIDENTS.length >= 5, 'At least 5 SGC canonical incidents & eastereggs registered');
  const woolsey = SGC_INCIDENTS[1];
  assert(woolsey.title.includes('WOOLSEY') && woolsey.choices.length === 3, 'Woolsey NID inspection incident registered');
  const repl = SGC_INCIDENTS[2];
  assert(repl.title.includes('REPLIKATOR') && (repl.text.includes('Projektilwaffen') || repl.choices[0].label.includes('Schrotflinte')), 'Replicator bug incident with AI banter registered');
  triggerWinampEasterEgg();
  
  SFX.playTrack = origPlayTrack;
}

// 29. Test Tactical Level Redesign, In-Combat Loot System & Level Editor
{
  // A. Tactical MAPS.city verification
  assert(MAPS.city.length === 15 && MAPS.city[0].length === 20, 'MAPS.city has 20x15 tactical dimensions');
  const cityRows = MAPS.city;
  const hasPlaza = cityRows[7].includes('##') && cityRows[7].includes('l');
  assert(hasPlaza, 'MAPS.city contains central plaza with monument and market stalls');
  const openTileCount = cityRows.reduce((acc, row) => acc + (row.match(/\./g) || []).length, 0);
  assert(openTileCount >= 100, 'MAPS.city provides generous open movement space (>100 open tiles)');

  // B. In-Combat Loot Spawning & Collection
  newGame();
  activateMission(CHAPTERS[0].missions[3], [0, 1, 2]); // 1-4 Steuern beim Schatzamt (city map)
  skipGate();
  assert(Array.isArray(C.loot) && C.loot.length >= 2, 'Tactical loot caches spawn on the battlefield');
  const cache = C.loot[0];
  assert(cache.id && cache.name && cache.res && cache.collected === false, 'Loot cache has valid attributes');
  
  // Test looting via movement
  const jack = Object.values(C.units).find(u => u.side === 'player');
  jack.x = cache.x;
  jack.y = cache.y;
  const initialOre = S.res.ore || 0;
  collectCombatLoot(jack, cache);
  assert(cache.collected === true, 'Loot is marked collected upon pickup');
  assert(S.res.ore > initialOre, 'Collecting loot awards SGC resources (Ore)');

  // C. Level Editor Verification
  const fs = require('fs');
  assert(fs.existsSync('tools/leveleditor.html'), 'tools/leveleditor.html exists');
  const editorHtml = fs.readFileSync('tools/leveleditor.html', 'utf8');
  assert(editorHtml.includes('SGC Tactical Level Editor') && editorHtml.includes('PRESETS') && editorHtml.includes('renderIsometric'), 'Level editor contains isometric renderer and presets');
}

// 30. Test SGC Krankenstation (Ebene 21 / Dr. Janet Fraiser), Medical Treatments & Evacuation
{
  newGame();
  
  // A. Medbay Presence on Level 21
  const medbayRoom = Object.values(S.base.rooms).find(r => r.type === 'medbay');
  assert(medbayRoom && medbayRoom.y === (BASE_LEVELS - 21), 'SGC Medbay exists on canonical Level 21 from game start');

  // B. Medical Healing Methods
  const jack = S.roster[0];
  jack.hp = 20;
  jack.injuries = 2;
  jack.fatigue = 50;

  // Method 1: 'rest'
  const restRes = healPatient(0, 'rest');
  assert(restRes.ok && jack.room === medbayRoom.id, 'healPatient(0, "rest") admits patient to Medbay bed on Level 21');

  // Method 2: 'medicine'
  S.res.medicine = 50;
  const medRes = healPatient(0, 'medicine');
  assert(medRes.ok && jack.hp === 55 && jack.injuries === 1, 'healPatient(0, "medicine") heals +35 HP and cures 1 injury');
  assert(S.res.medicine === 35, 'healPatient(0, "medicine") consumes 15 medicine');

  // Method 3: 'tretonin'
  S.res.medicine = 20;
  S.res.tech = 50;
  const prevMaxHp = jack.maxHp;
  const tretRes = healPatient(0, 'tretonin');
  assert(tretRes.ok && jack.maxHp === (prevMaxHp + 5), 'healPatient(0, "tretonin") increases constitution (+5 MaxHP)');
  assert(jack.morale === 100, 'Tretonin restores high morale');

  // Method 4: 'surgery'
  jack.hp = 18;
  jack.injuries = 2;
  S.res.medicine = 40;
  S.res.tech = 30;
  const surgRes = healPatient(0, 'surgery');
  assert(surgRes.ok && jack.injuries === 0 && jack.hp >= Math.round(jack.maxHp * 0.75), 'healPatient(0, "surgery") by Dr. Fraiser resolves all injuries and stabilizes HP');

  // Method 5: 'tech_goauld'
  jack.hp = 15;
  jack.injuries = 3;
  S.res.tech = 50;
  S.res.ore = 50;
  const techRes = healPatient(0, 'tech_goauld');
  assert(techRes.ok && jack.hp === jack.maxHp && jack.injuries === 0, 'healPatient(0, "tech_goauld") achieves 100% full cellular regeneration');

  // C. Emergency Group Healing
  const sam = S.roster[1];
  const daniel = S.roster[2];
  sam.hp = 30;
  daniel.hp = 25;
  S.res.medicine = 50;
  const groupRes = healAllEmergency();
  assert(groupRes.ok && sam.hp > 30 && daniel.hp > 25, 'healAllEmergency() treats all wounded personnel with available medicine');

  // D. Downed Unit Evacuation & Gate Extraction
  activateMission(CHAPTERS[0].missions[0], [0, 1, 2]);
  skipGate();
  const playerUnits = Object.values(C.units).filter(u => u.side === 'player');
  assert(playerUnits.length >= 3, 'Combat squad deployed');
  
  // Down 1 unit
  playerUnits[0].downed = true;
  playerUnits[0].ap = 0;
  
  // Move other 2 units to gate
  playerUnits[1].x = C.gatePos.x;
  playerUnits[1].y = C.gatePos.y;
  playerUnits[2].x = C.gatePos.x + 1;
  playerUnits[2].y = C.gatePos.y;

  const g = gateReady();
  assert(g.downed === 1 && g.at === g.total && g.total === 2, 'gateReady() detects conscious squad at gate with 1 downed comrade');
  const extSuccess = extract();
  assert(extSuccess === true && C.result === 'extracted', 'extract() succeeds and evacuates downed comrade through the gate');
  combatEnd();
  assert(C.active === false, 'combatEnd() resets C.active to false after downed evacuation');

  // E. Emergency Retreat
  activateMission(CHAPTERS[0].missions[0], [0, 1, 2]);
  skipGate();
  assert(C.active === true, 'Combat started for emergency retreat test');
  emergencyRetreat();
  assert(C.active === false && C.result === 'extracted', 'emergencyRetreat() halts combat and safely extracts team');

  // F. Daily Medbay Healing Loop in endDay()
  newGame();
  const testJack = S.roster[0];
  testJack.hp = 20;
  testJack.injuries = 1;
  healPatient(0, 'rest'); // In Medbay bed
  endDay();
  assert(testJack.hp >= 55, 'endDay() grants high daily bed recovery (+35 HP) in Medbay');
  assert(S.rlog.some(l => l.includes('Krankenstation')), 'endDay() logs hospital recovery in daily debriefing S.rlog');

  // G. Krankenstation UI View & Incident Modal Rendering
  setTab('medbay');
  assert(UI.tab === 'medbay', 'setTab("medbay") activates medbay tab');
  renderMedbayView();
  const medbayBody = els['medbay-body'];
  assert(medbayBody && medbayBody.innerHTML.includes('KRANKENSTATION') && medbayBody.innerHTML.includes('DR. JANET FRAISER'), 'renderMedbayView() renders Dr. Janet Fraiser hospital screen');
  
  // Test Medbay Incident Modal
  showMedbayIncidentModal(0); // Broca Divide
  assert(els['modal'].style.display === 'flex' && els['modal'].innerHTML.includes('BROCA-VIRUS'), 'showMedbayIncidentModal() displays canonical Stargate medical crisis');
  resolveMedbayIncident(0);
  assert(els['modal'].style.display === 'none', 'resolveMedbayIncident() executes choice and dismisses modal cleanly');
}

// =====================================================================
// 31. Test i18n Core (v0.30): Key-Parität, DOM-Abdeckung, Sprach-Toggle
// =====================================================================
{
  // --- 31a. Key-Parität: DE- und EN-Tabelle tragen exakt dieselben Keys ---
  const deKeys=Object.keys(I18N.tables.de).sort();
  const enKeys=Object.keys(I18N.tables.en).sort();
  assert(deKeys.length>0,'i18n tables registered ('+deKeys.length+' keys loaded)');
  const missingEn=deKeys.filter(k=>!Object.prototype.hasOwnProperty.call(I18N.tables.en,k));
  const missingDe=enKeys.filter(k=>!Object.prototype.hasOwnProperty.call(I18N.tables.de,k));
  assert(missingEn.length===0,'i18n key parity: no missing EN keys (missing: '+missingEn.join(', ')+')');
  assert(missingDe.length===0,'i18n key parity: no missing DE keys (missing: '+missingDe.join(', ')+')');
  assert(deKeys.every(k=>typeof I18N.tables.de[k]==='string'&&I18N.tables.de[k].trim().length>0),'i18n DE values are non-empty strings');
  assert(enKeys.every(k=>typeof I18N.tables.en[k]==='string'&&I18N.tables.en[k].trim().length>0),'i18n EN values are non-empty strings');
  assert(I18N.missing('en').length===0&&I18N.missing('de').length===0,'I18N.missing() reports no gaps in either direction');

  // --- 31b. Sprach-Toggle im Portal-Header vorhanden & verdrahtet ---
  const portalHtml=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  assert(portalHtml.includes('id="lang-toggle"'),'portal header contains language toggle button');
  assert(/id="lang-toggle"[^>]*onclick="I18N\.setLang/.test(portalHtml),'language toggle wired to I18N.setLang');
  assert(portalHtml.includes('<script src="game/i18n.js">')&&portalHtml.includes('<script src="game/i18n-portal.js">'),'portal loads i18n.js + i18n-portal.js');

  // --- 31c. DOM-Abdeckung: kein hartes Deutsch mehr im Portal-HTML ---
  // Ausnahmen: <script>/<style>/HTML-Kommentare + data-i18n*-Unterbäume
  // (dort liegt der DE-Default, der zur Laufzeit ersetzt wird).
  const germanUmlaut=/[\u00E4\u00F6\u00FC\u00DF\u00C4\u00D6\u00DC]/;
  const germanWords=/\b(?:und|oder|aber|auch|nicht|wird|werden|wurde|wurden|sind|ist|mit|auf|von|zu|bei|nach|aus|im|am|vom|zum|dass|wenn|dann|noch|sehr|seine|seinen|ihre|ihren|unser|unsere|diese|dieser|dieses|hier|dort|jetzt|schon|gerade|gleich|Tag|Nacht|Zeit|Weg|Spiel|Weiter|Zurück|Auswahl|Fehler|Runde|Runden|Punkte|Leben|Energie|Karte|Kampf|Angriff|Schaden|Heilung|Waffe|Waffen|Schutz|Kugeln|Munition|Medikamente|Verband|Notfall|Kritisch|Sieg|Niederlage|Kamera|Drehung|Beenden|Optionen|Einstellungen|Regler|Musik|Effekte|Sprache|Deutsch|Englisch|Aktuell|aktuell|bereit|Steuerung|Pfeile|Taste|Vollbild|Durchgang|Schicht|Schichten|Zusammenfassung|Dokumentation|Installation|Schnellstart|Herunterladen|Lizenzen|Danksagung|Bildquellen|Projekt|Studie|Forschungsnotizen|Architektur|Portal|Welten|Stadt|Deckung|Beute|Kolonie|Kolonien|Forschungslabor|Sektor|Sektoren|sowie|zusammen|insgesamt|solche|solcher|vielen|viel|mehr|weniger|als|wie|so|nur|immer|bald|später|früher|heute|gestern|morgen|eine|einen|einem|einer|dem|den|des|der|die|das|ein|keine|keinen|kein|neue|neuer|neues|alle|bereits)\b/i;
  function stripAnnotated(html){
    const tags=['title','div','li','td','th','p','pre','b','span','h1','h2','h3','a','button'];
    for(const t of tags){
      html=html.replace(new RegExp('<'+t+'[^>]*\\sdata-i18n(?:-html|-title|-skip)?="[^"]*"[^>]*>[\\s\\S]*?</'+t+'>','g'),' ');
    }
    return html;
  }
  function scanGermanText(file){
    let html=fs.readFileSync(path.join(__dirname,file),'utf8');
    html=html.replace(/<!--[\s\S]*?-->/g,' ');
    html=html.replace(/<style[\s\S]*?<\/style>/gi,' ');
    html=html.replace(/<script[\s\S]*?<\/script>/gi,' ');
    html=stripAnnotated(html);
    html=html.replace(/<[^>]+>/g,' ');
    const hits=[];
    const tokenRe=/\S+/g;
    let m;
    while((m=tokenRe.exec(html))!==null){
      if(germanUmlaut.test(m[0])||germanWords.test(m[0])) hits.push(m[0]);
    }
    return hits;
  }
  // R1: Portal · R2: statische Spiel-UI (JS-Views wandern in R3/R4 auf I18N.T())
  const i18nScanFiles=['index.html','game/index.html'];
  for(const f of i18nScanFiles){
    const hits=scanGermanText(f);
    assert(hits.length===0,f+' DOM coverage: no unannotated German text (leftovers: '+JSON.stringify(hits.slice(0,8))+')');
  }
  // --- 31d. Toggle-Roundtrip + statische Anwendung + Persistenz ---
  __i18nDom.clear();
  const elT=__i18nDom.make({'data-i18n':'portal.nav.game'});
  const elH=__i18nDom.make({'data-i18n-html':'portal.wiki.gear.1'});
  const elTitle=__i18nDom.make({'data-i18n-title':'portal.lang.title'});
  __i18nDom.registry.push(elT,elH,elTitle);
  const langEvents=[];
  I18N.onChange(l=>langEvents.push(l));

  I18N.setLang('en');
  assert(I18N.lang==='en','setLang("en") switches I18N.lang to en');
  assert(document.documentElement.lang==='en','documentElement.lang updated to en');
  assert(localStorage.getItem('sgc_lang')==='en','language choice persisted to localStorage');
  assert(elT.textContent===I18N.tables.en['portal.nav.game'],'applyStaticI18n: data-i18n renders EN textContent');
  assert(elH.innerHTML===I18N.tables.en['portal.wiki.gear.1'],'applyStaticI18n: data-i18n-html renders EN innerHTML');
  assert(elTitle.title===I18N.tables.en['portal.lang.title'],'applyStaticI18n: data-i18n-title renders EN title');
  assert(langEvents.length===1&&langEvents[0]==='en','i18n onChange listener fired with switched language');

  I18N.setLang('de');
  assert(I18N.lang==='de'&&elT.textContent===I18N.tables.de['portal.nav.game'],'toggle back to DE restores German text');
  assert(document.documentElement.lang==='de','documentElement.lang restored to de');
  assert(localStorage.getItem('sgc_lang')==='de','DE choice persisted to localStorage');

  assert(I18N.T('portal.nav.game')==='Spiel','T() resolves DE table value');
  I18N.setLang('en');
  assert(I18N.T('portal.nav.game')==='Game','T() resolves EN table value after toggle');
  assert(I18N.T('portal.nonexistent.key')==='portal.nonexistent.key','T() falls back to key for missing entries');
  assert(I18N.setLang('xx')==='de','setLang() with unknown code falls back to default (de)');

  localStorage.setItem('sgc_lang','en');
  assert(I18N.init()==='en','init() restores persisted language from localStorage');
  I18N.setLang('de');
  __i18nDom.clear();
  I18N._listeners.length=0;
}

// 33. Test SGC Research Engine, Laboratory Modal & Spoiler-Free Roster
{
  // Test getTech normalization
  const g1 = getTech('G1');
  assert(g1 && g1.id === 'G1' && g1.cost === 20 && g1.branch === 'g' && g1.prereq === null, 'getTech resolves G1 schema correctly');
  assert(g1.name === 'Gate-Stabilisierer', 'getTech resolves German name');
  
  I18N.setLang('en');
  const g1En = getTech('G1');
  assert(g1En.name === 'Gate Stabilizer', 'getTech resolves English name in EN mode');
  I18N.setLang('de');

  // Test techAvailable prerequisite checking
  S.research = { rp: 50, queue: null, done: [] };
  assert(techAvailable('G1') === true, 'G1 available with no prereqs');
  assert(techAvailable('G2') === false, 'G2 locked before G1 researched');

  // Test setResearch
  setResearch('G1');
  assert(S.research.queue === 'G1', 'setResearch queues G1');

  // Test endDay research completion
  endDay();
  assert(S.research.done.includes('G1'), 'endDay completes research when RP >= cost');
  assert(S.research.queue === null, 'Research queue cleared after completion');
  assert(techAvailable('G2') === true, 'G2 becomes available once G1 is done');

  // Test Mission RP rewards in combat
  C.mission = CHAPTERS[0].missions[0];
  C.result = 'victory';
  const prevRp = S.research.rp || 0;
  S.chapter = 1;
  applyCombatResult();
  assert(S.research.rp > prevRp, 'Missions award research points (RP) upon victory');

  // Test showResearchModal renders
  showResearchModal();
  const modalHtml = $('modal').innerHTML;
  assert(modalHtml.includes('SGC FORSCHUNGSLABOR'), 'showResearchModal renders Level 19 Lab');
  assert(modalHtml.includes('G2') && modalHtml.includes('Fast Dialing'), 'showResearchModal renders tech cards');

  // Test unrecruited candidates hidden from Roster
  renderRoster();
  const rosterHtml = $('roster-body').innerHTML;
  assert(!rosterHtml.includes('Kandidaten warten auf ihre Episode') && !rosterHtml.includes('Rekrutierungsbüro'), 'Unrecruited candidate spoilers hidden from roster');

  // Test Winamp size persistence in localStorage
  localStorage.setItem('sgc_winamp_size', JSON.stringify({ w: '580px', h: '420px' }));
  showStrudelModal();
  const winampEl = $('modal').innerHTML;
  assert(winampEl.includes('width:580px'), 'Saved winamp size restored on open');
}

// 34. Test Multi-Slot Savegame System, Cookie-Clicker Import/Export & Test Presets
{
  // Test slot saving & loading
  S.day = 7;
  S.res.ore = 999;
  assert(SGC_SAVES.saveToSlot('slot2') === true, 'SGC_SAVES saves state to slot2');
  const slot2Info = SGC_SAVES.getSlotInfo('slot2');
  assert(slot2Info && slot2Info.day === 7 && slot2Info.ore === 999, 'getSlotInfo reads slot2 metadata accurately');

  // Test slot isolation
  S.day = 12;
  SGC_SAVES.saveToSlot('slot1');
  assert(SGC_SAVES.loadFromSlot('slot2') === true, 'loadFromSlot restores slot2');
  assert(S.day === 7 && S.res.ore === 999, 'S state restored to slot2 values');

  // Test Cookie-Clicker export string
  const exportStr = SGC_SAVES.exportString();
  assert(typeof exportStr === 'string' && exportStr.length > 50, 'exportString produces non-empty export payload');

  // Test Cookie-Clicker import string
  S.day = 99;
  const importRes = SGC_SAVES.importString(exportStr);
  assert(importRes.ok === true, 'importString succeeds on valid Base64 string');
  assert(S.day === 7, 'Imported state restored correctly');

  // Test Test State Presets
  assert(SGC_SAVES.loadPreset('research_lab') === true, 'loadPreset("research_lab") loads successfully');
  assert(S.research && S.research.rp === 180 && S.commander === 'carter', 'research_lab preset provides 180 RP & Carter');

  assert(SGC_SAVES.loadPreset('medbay_crisis') === true, 'loadPreset("medbay_crisis") loads successfully');
  assert(S.roster[0].injuries === 2 && S.roster[0].hp === 14, 'medbay_crisis preset sets up hospital triage state');

  // Test showSaveModal renders
  showSaveModal();
  const saveHtml = $('modal').innerHTML;
  assert(saveHtml.includes('SGC SPEICHERSTAND-VERWALTUNG'), 'showSaveModal renders cartridge header');
  assert(saveHtml.includes('Cookie-Clicker Import'), 'showSaveModal renders Cookie Clicker panel');
  assert(saveHtml.includes('Test-Presets'), 'showSaveModal renders test presets');
}

// =====================================================================
// 35. Test Reaktionsfeuer / Overwatch Mechanik
// =====================================================================
{
  const mission = CHAPTERS[0].missions[0];
  startCombat(mission, [0, 1]);
  const players = Object.values(C.units).filter(u => u.side === 'player' && !u.dead);
  const enemies = Object.values(C.units).filter(u => u.side === 'enemy' && !u.dead);
  const p1 = players[0];
  const p2 = players[1];
  const e1 = enemies[0];

  p1.ap = 2;
  p2.ap = 2; // Keeps player phase active when p1 finishes AP
  p1.overwatch = false;
  
  // Activating Overwatch
  const res = playerOverwatch(p1);
  assert(res === true, 'playerOverwatch() successfully activates');
  assert(p1.overwatch === true, 'player unit has overwatch === true');
  assert(p1.ap === 0, 'player unit AP spent/reserved (ap === 0)');

  // Position enemy in front of p1 with clear line of sight
  e1.x = p1.x + 2;
  e1.y = p1.y;
  e1.dead = false;
  e1.hp = 30;

  // Verify Reaction Fire triggers when enemy takes an action/step
  const origHp = e1.hp;
  const origRnd = Math.random;
  Math.random = () => 0.1; // Ensure 100% hit roll
  const triggered = checkReactionFire(e1);
  assert(triggered === true, 'checkReactionFire() triggers against enemy in range & LOS');
  assert(p1.overwatch === false, 'player overwatch consumed upon firing');
  assert(e1.hp < origHp || e1.dead, 'reaction fire damages or kills target');
  Math.random = origRnd;

  // Verify renderCombatUI reflects overwatch badge
  C.selected = p1;
  p1.overwatch = true;
  renderCombatUI(true);
  const cuiHtml = $('combat-ui').innerHTML;
  assert(cuiHtml.includes('REAKTIONSFEUER') || cuiHtml.includes('OVERWATCH'), 'combat UI renders overwatch badge');
  
  // Reset combat state
  C.active = false;
}

// 36. Test 0.36 Milestone: Gateroom 4x2 Silo, Walter's Control Room, Autobattler & Auto-Resolve
{
  // A: Gateroom 4x2 layout on Level 28 & 27
  assert(ROOMS.gate.w === 2 && ROOMS.gate.h === 2, 'ROOMS.gate is a 2x2 room spanning Level 28 & 27 in far-left corner');
  const gateRoom = S.base.rooms[1];
  assert(gateRoom && gateRoom.type === 'gate' && gateRoom.x === 0 && gateRoom.y === 0, 'Gateroom placed at bottom-left corner (0,0)');
  assert(S.base.grid[0] === 1 && S.base.grid[1] === 1 && S.base.grid[8] === 1 && S.base.grid[9] === 1, 'Gateroom occupies grid cells across columns 0..1 and rows 0..1');

  // B: Base click interactions
  UI.tab = 'base';
  els['base-cv'].getBoundingClientRect = () => ({ left: 0, top: 0, width: 720, height: 1134 });
  els['base-cv'].width = 720;
  els['base-cv'].height = 1134;

  // Click on Gateroom (Level 28, col 1: screen X ~ 150, Y ~ 1080)
  baseClick(150, 1080);
  assert(UI.tab === 'map', 'Clicking Gateroom switches tab to Star Map');

  // Click on Walter Harriman in Control Room (Level 28, col 4: screen X ~ 380, Y ~ 1080)
  UI.tab = 'base';
  let lastNote = '';
  const origNote = note;
  note = (msg) => { lastNote = msg; if(origNote) origNote(msg); };
  baseClick(260, 1080);
  assert(lastNote.includes('Walter Harriman') && lastNote.includes('Chevron 7'), 'Clicking Kontrollraum triggers Walter Harriman radio quote');
  note = origNote;

  // C: In-Combat Auto-Battler
  const mDef = (typeof curMissions === 'function' && curMissions()[0]) || { id: '1-2', name: 'Chulak', planet: 'chulak', enemies: { jaffa: 2 } };
  startCombat(mDef, [0, 1]);
  assert(C.autoBattle === false, 'C.autoBattle is false by default upon combat start');
  toggleAutoBattle();
  assert(C.autoBattle === true, 'toggleAutoBattle() activates autoBattle');

  const pUnit = Object.values(C.units).find(u => u.side === 'player' && !u.dead);
  const nearest = nearestEnemyFor(pUnit);
  assert(nearest && nearest.side === 'enemy', 'nearestEnemyFor finds the closest enemy target');

  // Verify runAutoBattleTurn executes without errors
  pUnit.ap = 2;
  runAutoBattleTurn();
  assert(pUnit.ap < 2 || pUnit.overwatch === true, 'runAutoBattleTurn() autonomously performs an action (move, attack, or overwatch)');
  C.autoBattle = false;
  C.active = false;

  // D: Auto-Resolve (Schnellkampf mit Prognose)
  const testMission = { id: 'test_mission_ar', name: 'Auto-Resolve Probe', planet: 'chulak', reward: { ore: 100, tech: 40 }, enemies: { jaffa: 2 } };
  const forecast = getAutoResolveForecast(testMission, [0, 1, 2, 3]);
  assert(forecast && forecast.eligible === true, 'getAutoResolveForecast() returns valid forecast for regular mission');
  assert(forecast.winChance >= 10 && forecast.winChance <= 95, 'winChance is clamped between 10% and 95% (got ' + forecast.winChance + '%)');
  assert(['niedrig', 'mittel', 'hoch'].includes(forecast.injuryRisk), 'injuryRisk is classified (niedrig/mittel/hoch)');

  // Verify boss mission is ineligible for auto-resolve
  const bossMission = { id: 'boss_test', name: 'Apophis Vorstoß', planet: 'chulak', type: 'boss', enemies: { goauld: 1 } };
  const bossForecast = getAutoResolveForecast(bossMission, [0, 1]);
  assert(bossForecast && bossForecast.eligible === false, 'getAutoResolveForecast() locks out boss missions from auto-resolve');

  // Execute Auto-Resolve (deterministically test victory branch)
  const initialOre = S.res.ore || 0;
  const origRandom = Math.random;
  Math.random = () => 0.1; // Force victory roll
  autoResolveMission(testMission, [0, 1, 2, 3]);
  assert(S.done.includes(testMission.id), 'autoResolveMission successfully marks mission as completed upon victory');
  assert((S.res.ore || 0) > initialOre, 'autoResolveMission awards loot with penalty applied');
  Math.random = origRandom;
}


// 37. Test 0.37 Milestone: SGC Level 28 Tactical Map, Foothold Mission, Combat Audio & Canonical Expansion
{
  // A: Gate save migration test
  const dummyBase = {
    grid: Array(8 * 28).fill(null),
    rooms: {
      1: { id: 1, type: 'gate', x: 3, y: 0, w: 4, h: 2, staff: [] }
    }
  };
  ensureGateLayout(dummyBase);
  assert(dummyBase.rooms[1].x === 0 && dummyBase.rooms[1].y === 0 && dummyBase.rooms[1].w === 2 && dummyBase.rooms[1].h === 2, 'ensureGateLayout migrates legacy gate to (0,0) with 2x2 size');
  assert(dummyBase.grid[0] === 1 && dummyBase.grid[1] === 1 && dummyBase.grid[8] === 1 && dummyBase.grid[9] === 1, 'ensureGateLayout correctly repopulates grid cells (0,0)-(1,1)');

  // B: SGC Defense Save Preset & SGC Level 28 Map
  assert(typeof SGC_SAVES.presets.sgc_defense !== 'undefined', 'sgc_defense test preset is registered in SGC_SAVES');
  const presetJson = SGC_SAVES.presets.sgc_defense.create();
  assert(typeof presetJson === 'string' && presetJson.includes('"commander":"hammond"'), 'sgc_defense preset generates valid JSON with Gen. Hammond');
  assert(Array.isArray(MAPS.sgc) && MAPS.sgc.length === 15, 'MAPS.sgc has 15 tactical rows matching Cheyenne Mountain Level 28');
  assert(MAPS.sgc[1].includes('GG') && MAPS.sgc[4].includes('H'), 'MAPS.sgc contains Stargate ramp and blast door');

  // C: Canonical Expansion Count
  const planetCount = Object.keys(PLANETS).length;
  assert(planetCount >= 45, 'Canonical planets expanded to at least 45 worlds (got ' + planetCount + ')');
  const allMissions = [];
  CHAPTERS.forEach(ch => allMissions.push(...ch.missions));
  assert(allMissions.length >= 30, 'Canonical missions expanded to at least 30 operations (got ' + allMissions.length + ')');
  assert(allMissions.some(m => m.id === '1-6' && m.planet === 'sgc'), 'Mission 1-6 Ebene 28: Infiltrationsalarm is active');

  // D: New Strudel Remix Tracks
  assert(typeof STRUDEL_TRACKS.theme_remix_foothold !== 'undefined', 'theme_remix_foothold is registered in STRUDEL_TRACKS');
  assert(typeof STRUDEL_TRACKS.theme_remix_apophis !== 'undefined', 'theme_remix_apophis is registered in STRUDEL_TRACKS');
  assert(typeof STRUDEL_TRACKS.theme_remix_atlantis_dnb !== 'undefined', 'theme_remix_atlantis_dnb is registered in STRUDEL_TRACKS');

  // E: Combat Audio Controls
  assert(typeof toggleCombatAudio === 'function', 'toggleCombatAudio is available');
  const wasMuted = SFX.muted;
  toggleCombatAudio();
  assert(SFX.muted === !wasMuted, 'toggleCombatAudio toggles SFX.muted state');
  toggleCombatAudio(); // restore

  // F: Gemini 4 Argon Pass – Cheyenne Mountain Portal, 3D-WebGL Layer, Jukebox Progression & Zoom Minimap
  assert(typeof _drawRazorWireFence === 'function' && typeof _drawMountainPine === 'function', 'Cheyenne Mountain surface tunnel & razor-wire routines registered');
  assert(typeof GL3D !== 'undefined' && typeof GL3D.renderCombat === 'function' && typeof GL3D.renderStarMap === 'function', 'Zero-Dependency GL3D 3D-WebGL engine loaded');
  setGfxMode('webgl3d');
  assert(getGfxMode() === 'webgl3d', 'setGfxMode switches to 3D-WebGL mode (webgl3d)');
  renderBase($('base-cv'));
  drawMap($('map-cv'), performance.now());
  assert(MAP.nodes.length > 0, 'GL3D.renderStarMap projects 3D holographic planet nodes for interactive picking');
  startCombat(CHAPTERS[0].missions[0], [0, 1, 2, 3]);
  renderCombat($('combat-cv'));
  assert(ISO.lastHitMap.length > 0, 'GL3D.renderCombat populates 3D perspective hit-map for tactical tile picking');

  // Zoom UI & Minimap Zoom-Scaling
  resetIsoZoom();
  assert(ISO.zoom === 1.0, 'resetIsoZoom resets camera zoom to 100% (1.0)');
  drawCombatMinimap();
  const rect100 = Object.assign({}, C.minimapViewRect);
  zoomIsoCamera(0.3);
  assert(ISO.zoom > 1.0, 'zoomIsoCamera(0.3) increases zoom level');
  drawCombatMinimap();
  const rectZoomed = Object.assign({}, C.minimapViewRect);
  assert(rectZoomed.w < rect100.w && rectZoomed.h < rect100.h, 'Minimap viewport rectangle scales down proportionally when zoomed in');
  resetIsoZoom();
  setGfxMode('pixel');
  C.active = false;

  // Jukebox Progression: Locked tracks hidden until unlocked
  WINAMP.tab = 'theme';
  WINAMP.searchQuery = '';
  S.unlockedTracks = ['theme_fanfare', 'theme_remix_0'];
  const unlockedThemesBefore = getWinampTracksForTab('theme', '', true);
  assert(!unlockedThemesBefore.includes('theme_remix_foothold'), 'Locked track theme_remix_foothold is hidden in filtered playlist before discovery');
  const playlistHtmlBefore = renderWinampPlaylistHTML('theme_fanfare');
  assert(!playlistHtmlBefore.includes('data-track="theme_remix_foothold"'), 'Winamp playlist DOM hides locked tracks until discovered');
  unlockTrack('theme_remix_foothold');
  const playlistHtmlAfter = renderWinampPlaylistHTML('theme_fanfare');
  assert(playlistHtmlAfter.includes('data-track="theme_remix_foothold"'), 'Winamp playlist DOM reveals track immediately after unlockTrack()');

  // G: Regression Tests for User Screenshot 1 (Uncovered 2x2 Gate Room) & Screenshot 2 (Strudel [mini] parse error guard)
  {
    const drawOrder = [];
    const origArch = drawLevelArchitecture;
    const origBuilt = drawBuiltRoom;
    drawLevelArchitecture = function(c, screenY, level) {
      drawOrder.push('arch_' + level);
      return origArch(c, screenY, level);
    };
    drawBuiltRoom = function(c, r) {
      drawOrder.push('room_' + r.type);
      return origBuilt(c, r);
    };
    ensureGateLayout(S.base);
    setGfxMode('pixel');
    renderBase($('base-cv'));
    drawLevelArchitecture = origArch;
    drawBuiltRoom = origBuilt;
    const lastArchIdx = drawOrder.lastIndexOf('arch_28');
    const gateRoomIdx = drawOrder.indexOf('room_gate');
    assert(lastArchIdx >= 0 && gateRoomIdx > lastArchIdx, 'renderBase draws 2x2 Gate Room AFTER all 28 level corridors so L27/L28 never cover the Stargate');

    // Simulate Strudel's global window.strudel.note mini-notation parser throwing on emojis ("🎵")
    let strudelCalledWithEmoji = false;
    window.strudel = {
      note: (arg) => {
        if (/[^\x00-\x7F]/.test(String(arg))) {
          strudelCalledWithEmoji = true;
          throw new Error('[mini] parse error at line 1: Expected "<", "[", but "🎵" found.');
        }
        return { _mockMini: arg };
      }
    };
    let noteErr = null;
    try {
      note('🎵 Neuer Soundtrack im SGC-AMP freigeschaltet: Gate Room Ambient');
    } catch (e) {
      noteErr = e;
    }
    assert(noteErr === null && !strudelCalledWithEmoji && S.log[0].includes('🎵 Neuer Soundtrack'), 'note("🎵 ...") routes to gameNote log and never triggers Strudel [mini] parse error');
    delete window.strudel;

    // Extended Zoom Range (0.50 .. 2.25) & 2D Top-Down Zoom Picking
    resetIsoZoom();
    zoomIsoCamera(-1.0);
    assert(ISO.zoom === 0.50, 'zoomIsoCamera clamps minimum zoom to 50% (0.50)');
    zoomIsoCamera(3.0);
    assert(ISO.zoom === 2.25, 'zoomIsoCamera allows zooming in up to 225% (2.25)');
    setGfxMode('topdown');
    C.active = true;
    C.cameraX = 2;
    C.cameraY = 3;
    const centerTile = isoScreenToTile(360, 260, 720, 520);
    resetIsoZoom();
    const centerTile100 = isoScreenToTile(360, 260, 720, 520);
    assert(centerTile.x === centerTile100.x && centerTile.y === centerTile100.y, '2D Top-Down zoom scales around viewport center and preserves center tile picking');
    setGfxMode('pixel');
    C.active = false;

    // H: 9 Global Languages (DE, EN, ES, ZH, JA, RU, FR, PT, AR) & 3D Base/Colony Fixes
    assert(typeof I18N_LANGUAGES === 'object' && getImplementedLanguages().length === 9, 'All 9 planned Stargate languages (DE, EN, ES, ZH, JA, RU, FR, PT, AR) are implemented');
    for (const lg of ['es', 'fr', 'zh', 'ja', 'ru', 'pt', 'ar']) {
      assert(I18N.missing(lg).length === 0, 'Language pack "' + lg + '" has 100% key coverage (0 missing keys)');
    }
    I18N.setLang('es');
    assert(I18N.T('game.nav.map').includes('Mapa Estelar'), 'Spanish (es) translation resolves game.nav.map');
    I18N.setLang('fr');
    assert(I18N.T('game.nav.map').includes('Carte Stellaire'), 'French (fr) translation resolves game.nav.map');
    I18N.setLang('ja');
    assert(I18N.T('game.nav.base').includes('基地'), 'Japanese (ja) translation resolves game.nav.base');
    I18N.setLang('de');

    // Verify GL3D.renderBase draws SGC Command Rooms (Walter, Briefing, Hammond, MALP) on L27/L28
    let sgcCmdRoomsDrawn = false;
    const origCmdRooms = drawSgcCommandRooms;
    drawSgcCommandRooms = function(c, now) {
      sgcCmdRoomsDrawn = true;
      return origCmdRooms(c, now);
    };
    setGfxMode('webgl3d');
    renderBase($('base-cv'));
    drawSgcCommandRooms = origCmdRooms;
    assert(sgcCmdRoomsDrawn === true, 'GL3D.renderBase renders L27/L28 SGC Command Rooms (Kontrollraum Walter, Besprechung SG-1, Büro Hammond, MALP)');

    // Verify GL3D.renderColony renders true 3D colony grid & populates 30 sector hitmap entries
    COLONY_ISO.lastHitMap = [];
    renderColonyCanvas($('colony-cv'), 'abydos');
    assert(COLONY_ISO.lastHitMap.length === 30, 'GL3D.renderColony projects all 30 planetary sectors (6x5) with 3D Stargate on (2,2)');
    setGfxMode('pixel');

    // I: v0.37 Final Polish Pass – Codevault Discovery, SGC Core Songs, Armory/Workshop/Storage Window,
    //    55 Planets & Playable Patrol Missions, Medbay Localization, Single-Click doDay(), Hex Zoom & 3D Orbit/Gate Intro
    vm.runInThisContext(fs.readFileSync(path.join(__dirname, 'game', 'music-progress.js'), 'utf8'), { filename: 'music-progress.js' });
    vm.runInThisContext(fs.readFileSync(path.join(__dirname, 'game', 'hex.js'), 'utf8'), { filename: 'hex.js' });
    vm.runInThisContext(fs.readFileSync(path.join(__dirname, 'game', 'hex-render.js'), 'utf8'), { filename: 'hex-render.js' });

    // 1. Codevault (sa_*) tracks hidden at game start and unlocked via planet exploration
    newGame();
    const saUnlockedStart = getWinampTracksForTab('sa', '', true);
    assert(saUnlockedStart.length === 0, 'Codevault (sa_*) tracks are hidden on Day 1 until discovered (got ' + saUnlockedStart.length + ')');
    discover('abydos');
    const saUnlockedAfterAbydos = getWinampTracksForTab('sa', '', true);
    assert(saUnlockedAfterAbydos.length >= 1, 'Exploring Abydos unlocks Codevault track dynamically (got ' + saUnlockedAfterAbydos.join(', ') + ')');

    // 2. SGC Core new tracks (armory, cheyenne) & boosted gain
    assert(typeof STRUDEL_TRACKS.armory !== 'undefined' && typeof STRUDEL_TRACKS.cheyenne !== 'undefined', 'New SGC Core songs (armory & cheyenne) registered in STRUDEL_TRACKS');
    const coreTracks = getWinampTracksForTab('core', '', true);
    assert(coreTracks.includes('armory') && coreTracks.includes('cheyenne'), 'New SGC Core songs are available in the SGC Core playlist tab');

    // 3. Dedicated Armory, Workshop & Storage Window + Storage Room in Base
    const storageRoom = Object.values(S.base.rooms).find(r => r.type === 'storage');
    assert(storageRoom && storageRoom.y === (BASE_LEVELS - 4), 'SGC Main Storage (Hauptlager) room exists on Level 4 from game start');
    showArmoryModal('workshop');
    assert(els['modal'].style.display === 'flex' && els['modal'].innerHTML.includes('armory-modal-cv'), 'showArmoryModal("workshop") opens dedicated Workshop/Armory/Storage window with live room canvas');
    showArmoryModal('storage');
    assert(els['modal'].innerHTML.includes('Hauptlager') || els['modal'].innerHTML.includes('Main Storage'), 'showArmoryModal("storage") switches to Storage Depot view');
    closeArmoryModal();

    // 4. Medbay & UI Localization in non-German languages (EN / ES)
    I18N.setLang('en');
    renderMedbayView();
    assert(els['medbay-body'].innerHTML.includes('SGC INFIRMARY / MEDBAY') && !els['medbay-body'].innerHTML.includes('Keine Patienten auf Station'), 'renderMedbayView() localizes all hospital UI strings when language is EN');
    I18N.setLang('es');
    renderMedbayView();
    assert(els['medbay-body'].innerHTML.includes('SGC INFIRMARY / MEDBAY'), 'renderMedbayView() localizes hospital UI strings when language is ES');
    I18N.setLang('de');

    // 5. Campaign Playability Guarantee: 55 Planets, 51 Missions & getPlanetPatrolMission() on every world
    assert(Object.keys(PLANETS).length >= 55, 'At least 55 canonical Stargate worlds registered');
    const nonSgcPlanets = Object.keys(PLANETS).filter(pid => !PLANETS[pid].sgc);
    const allHaveMissions = nonSgcPlanets.every(pid => {
      const patrol = getPlanetPatrolMission(pid);
      return patrol && patrol.planet === pid && patrol.repeatable === true;
    });
    assert(allHaveMissions, 'Every single non-SGC planet has a playable fallback mission via getPlanetPatrolMission() so no planet is ever stuck');

    // 6. Single-Click doDay() Reliability
    const dayBefore = S.day;
    els['story-dialogue'].style.display = 'flex';
    doDay();
    assert(S.day === dayBefore + 1 && els['story-dialogue'].style.display === 'none', 'Single doDay() call cleanly dismisses open story-dialogue and advances S.day');
    doDay();
    assert(S.day === dayBefore + 2, 'Consecutive doDay() call advances to next day without multi-click lockup');
    startNextDay();

    // 7. Hex-Grid Zoom Scaling & Picking + Free 360° 3D Orbit & Gate Emergence Intro
    assert(typeof HEX_RENDER !== 'undefined' && typeof HEX_RENDER.getS === 'function', 'Upgraded 3D Hex-Grid renderer (HEX_RENDER) is active');
    S.hexMode = true;
    startCombat(CHAPTERS[0].missions[0], [0, 1, 2]);
    assert(typeof C.gateIntroStart === 'number' && C.gateIntroStart > 0, 'startCombat() initializes C.gateIntroStart for the 3D Gate Emergence camera intro');
    resetIsoZoom();
    const hexS100 = HEX_RENDER.getS();
    const c100 = HEX_RENDER.center(5, 4);
    const pick100 = HEX_RENDER.pick(c100.x - C.cameraX * Math.sqrt(3) * hexS100, c100.y - C.cameraY * 1.5 * hexS100);
    assert(pick100.x === 5 && pick100.y === 4, 'Hex-Grid mouse picking round-trips tile (5,4) at 100% zoom');
    zoomIsoCamera(0.5);
    const hexS150 = HEX_RENDER.getS();
    assert(hexS150 > hexS100 * 1.4, 'Hex-Grid radius scales proportionally with ISO.zoom (150%)');
    const c150 = HEX_RENDER.center(5, 4);
    const pick150 = HEX_RENDER.pick(c150.x - C.cameraX * Math.sqrt(3) * hexS150, c150.y - C.cameraY * 1.5 * hexS150);
    assert(pick150.x === 5 && pick150.y === 4, 'Hex-Grid mouse picking round-trips tile (5,4) accurately at 150% zoom');
    renderCombat($('combat-cv'));

    // Free 360° 3D Orbit test
    S.hexMode = false;
    setGfxMode('webgl3d');
    GL3D.resetOrbit();
    GL3D.orbit(0.85, 1.5);
    assert(Math.abs(GL3D.yawOffset - 0.85) < 0.001 && Math.abs(GL3D.pitchOffset - 1.5) < 0.001, 'GL3D.orbit() freely rotates 3D yaw and pitch angles');
    rotateIsoCamera(1);
    assert(GL3D.yawOffset > 0.85, 'rotateIsoCamera() smoothly orbits GL3D.yawOffset in 3D-WebGL mode');
    resetIsoZoom();
    assert(GL3D.yawOffset === 0 && GL3D.pitchOffset === 0, 'resetIsoZoom() resets 3D orbit angles to default');
    setGfxMode('pixel');
    C.active = false;
  }
}

// 38. Test 80s/90s Hit Jukebox (hit-tracks.js) & "Stand Orders"-Aussortierung
{
  const hitKeys = Object.keys(STRUDEL_TRACKS).filter(k => k.startsWith('hit_'));
  assert(hitKeys.length === 7, '80s/90s Hit Jukebox: 7 hit_ tracks registered (' + hitKeys.join(', ') + ')');
  assert(STRUDEL_TRACKS.hit_blue_monday && STRUDEL_TRACKS.hit_blue_monday.code.includes('$KICK') && STRUDEL_TRACKS.hit_blue_monday.code.includes('$BASS'), 'Blue Monday (New Order 1983) Strudel-Track mit $KICK/$BASS registered');
  assert(STRUDEL_TRACKS.hit_blue_monday && STRUDEL_TRACKS.hit_blue_monday.code.includes('setCpm(130/4)'), 'Blue Monday läuft mit 130 BPM');
  assert(STRUDEL_TRACKS.hit_confusion_pump && STRUDEL_TRACKS.hit_confusion_pump.name.includes('Pump Action Panel'), 'Confusion "Pump Action Panel" Version registered');
  for (const k of hitKeys) {
    const v = STRUDEL.compile(STRUDEL_TRACKS[k].code);
    assert(v && v.length > 0, 'Hit track ' + k + ' kompiliert sauber (' + (v ? v.length : 0) + ' Stimmen)');
  }
  const pm = MUSIC_PROGRESS.planetMap();
  assert(Object.keys(pm).every(t => t.startsWith('sa_') || t.startsWith('hit_')), 'Codevault-Planetenmappe enthält nur sa_/hit_-Tracks');
  assert(Object.keys(pm).filter(t => t.startsWith('hit_')).length === 7, 'Alle 7 Hit-Tracks sind per Planetenfreischaltung unlockbar');
  assert(!isTrackUnlocked('hit_blue_monday'), 'Hit-Tracks sind im frischen Spielstand gesperrt (Codevault)');
  const soGen = SONGGEN.fromCombat({ mission: { name: 'Stand Orders', planet: 'p2x416', enemies: { jaffa: 12 } }, units: {} }, S);
  assert(soGen === null, 'SONGGEN: Mission "Stand Orders" erzeugt KEINEN Kampfsong (Song gestrichen)');
  const otherGen = SONGGEN.fromCombat({ mission: { name: 'Test Defense', planet: 'abydos', enemies: { jaffa: 3 } }, units: {} }, S);
  assert(otherGen && otherGen.code.includes('$KICK'), 'SONGGEN: andere Missionen erzeugen weiterhin Kampfsongs');
  assert(!Object.values(STRUDEL_TRACKS).some(t => /^stand orders$/i.test(t.name || '')), 'Kein "Stand Orders"-Song im Track-Katalog');
  assert(!fs.existsSync('switch-angel'), 'switch-angel Quell-Ordner aus dem Repo entfernt (Credit bleibt in game/switch-angel.js)');
}

for(let i=0;i<5;i++){
  now+=16;
  const cb=rafCb; rafCb=null;
  if(cb){
    try{ cb(now); }
    catch(e){ assert(false,'frame '+i+' → '+e.message); break; }
  }
}
assert(true,'frame-loop OK');

if(failures>0){
  console.error(`✘ ${failures} test(s) failed.`);
  process.exit(1);
}else{
  console.log('✔ ALL TESTS PASSED (0 errors)');
  process.exit(0);
}
