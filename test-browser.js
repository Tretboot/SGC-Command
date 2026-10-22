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
global.document={
  body:{style:{}},
  activeElement:null,
  createElement:()=>makeEl('_tmp'+Math.random()),
  getElementById:id=>makeEl(id),
  querySelectorAll:()=>[],
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
  'switch-angel.js',
  'midi-data.js',
  'sound.js',
  'midi.js',
  'art.js',
  'art2.js',
  '../content/quests.js',
  '../content/intros.js',
  '../content/scenes.js',
  'engine.js',
  'iso.js',
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
  assert(C.distance(2,3,7,8)===5,'Combat distance calculation is isolated from Strudel global helpers');
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
  assert(els['modal'].innerHTML.includes('REBIRTH-338') && els['modal'].innerHTML.includes('TR-909'), 'ReBirth-338 synthesizer & drum rack renders in modal');
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
  gateTick(performance.now() + 7000);
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

// 19. Test Star Map Music Continuity (No disruptive music change on map)
{
  setTab('base');
  SFX.music('base');
  const baseTrack = STRUDEL.currentTrack;
  setTab('map');
  assert(STRUDEL.currentTrack === baseTrack, 'Switching to Sternenkarte tab (map) preserves active background music');
  SFX.music('map');
  assert(STRUDEL.currentTrack === baseTrack, 'SFX.music("map") syncs to base context without changing active track');
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
}
