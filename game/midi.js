'use strict';
// ===================== SGC COMMAND – MIDI ⇄ Strudel Bridge (midi.js) =====================
// Lizenz: AGPL-3.0-or-later (wie das Gesamtprojekt).
// 1. parseMidi(bytes)          – Standard-MIDI-File (Format 0/1) Parser ohne Abhängigkeiten.
// 2. analyzeMidi(midi)         – Tempo, Takt, Tonart (Krumhansl), Melodie-/Bass-/Akkordspur.
// 3. midiTrackToStrudel(...)   – Quantisiert eine Spur in Strudel-Mini-Notation ("<c4 [e4 g4] ~ ...>*16").
// 4. midiToStrudelCode(...)    – Spielt eine komplette MIDI-Datei direkt über Strudel ab.
// 5. remixThemeSwitchAngel(...)– Übersetzt das Theme in einen Switch-Angel-Style Strudel-Track
//                                ($KICK / $BASS / $LEAD / $HAT, acidenv, rlpf, duck, dly, trancegate).
// 6. SONGGEN.generate(seedCtx) – Seed-basierter Song-Generator: Team, Planet, Gegner, Waffen, Tag
//                                → deterministischer, einzigartiger Switch-Angel-Style Track.
// Läuft im Browser (file://, kein fetch nötig – MIDI ist in midi-data.js eingebettet) und in Node.

const MIDI_NOTE_NAMES=['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
function midiNoteName(n){return MIDI_NOTE_NAMES[n%12]+(Math.floor(n/12)-1);}

function _b64ToBytes(b64){
  if(typeof atob==='function'){
    const bin=atob(b64),out=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64,'base64'));
}

// ---------- 1. Parser ----------
function parseMidi(bytes){
  if(typeof bytes==='string')bytes=_b64ToBytes(bytes);
  let p=0;
  const u8=()=>bytes[p++];
  const u16=()=>(bytes[p++]<<8)|bytes[p++];
  const u32=()=>((bytes[p++]<<24)>>>0)+(bytes[p++]<<16)+(bytes[p++]<<8)+bytes[p++];
  const str=n=>{let s='';for(let i=0;i<n;i++)s+=String.fromCharCode(bytes[p++]);return s;};
  const vlq=()=>{let v=0,b;do{b=bytes[p++];v=(v<<7)|(b&0x7f);}while(b&0x80);return v;};
  if(str(4)!=='MThd')throw new Error('Keine MIDI-Datei (MThd fehlt)');
  const hlen=u32(),format=u16(),ntracks=u16(),division=u16();
  p+=hlen-6;
  const midi={format,division,tracks:[],tempos:[],timeSig:[4,4],keySig:null};
  for(let t=0;t<ntracks&&p<bytes.length;t++){
    if(str(4)!=='MTrk'){break;}
    const len=u32(),end=p+len;
    const track={name:'',channel:null,program:null,notes:[]};
    const open={};
    let tick=0,status=0;
    while(p<end){
      tick+=vlq();
      let b=bytes[p];
      if(b&0x80){status=b;p++;}
      const type=status&0xf0,ch=status&0x0f;
      if(status===0xff){
        const mt=u8(),ml=vlq(),ms=p;
        if(mt===0x03){track.name=str(ml);}
        else if(mt===0x51){midi.tempos.push({tick,usPerBeat:(bytes[p]<<16)|(bytes[p+1]<<8)|bytes[p+2]});}
        else if(mt===0x58){midi.timeSig=[bytes[p],Math.pow(2,bytes[p+1])];}
        else if(mt===0x59){const sf=(bytes[p]<<24)>>24;midi.keySig={sf,minor:!!bytes[p+1]};}
        p=ms+ml;
      }else if(status===0xf0||status===0xf7){p+=vlq();}
      else if(type===0x90||type===0x80){
        const note=u8(),vel=u8();
        if(track.channel===null)track.channel=ch;
        const key=ch+':'+note;
        if(type===0x90&&vel>0){(open[key]=open[key]||[]).push({tick,vel});}
        else if(open[key]&&open[key].length){
          const on=open[key].shift();
          track.notes.push({note,ch,start:on.tick,dur:Math.max(1,tick-on.tick),vel:on.vel});
        }
      }
      else if(type===0xc0){track.program=u8();}
      else if(type===0xd0){p+=1;}
      else{p+=2;} // 0xA0,0xB0,0xE0
    }
    p=end;
    track.notes.sort((a,b)=>a.start-b.start||b.note-a.note);
    midi.tracks.push(track);
  }
  return midi;
}

// ---------- 2. Analyse ----------
const _KS_MAJOR=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
const _KS_MINOR=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
function _detectKey(notes){
  const hist=new Array(12).fill(0);
  notes.forEach(n=>hist[n.note%12]+=n.dur);
  let best={score:-1e9,root:0,minor:true};
  const corr=(prof,root)=>{let s=0;for(let i=0;i<12;i++)s+=hist[(i+root)%12]*prof[i];return s;};
  for(let r=0;r<12;r++){
    const mj=corr(_KS_MAJOR,r),mn=corr(_KS_MINOR,r);
    if(mj>best.score)best={score:mj,root:r,minor:false};
    if(mn>best.score)best={score:mn,root:r,minor:true};
  }
  return {root:best.root,minor:best.minor,name:MIDI_NOTE_NAMES[best.root]+(best.minor?':minor':':major')};
}

function analyzeMidi(midi){
  const all=midi.tracks.flatMap(t=>t.notes.filter(n=>n.ch!==9));
  const usPerBeat=(midi.tempos[0]&&midi.tempos[0].usPerBeat)||500000;
  const bpm=Math.round(60000000/usPerBeat);
  const tracks=midi.tracks.map((t,i)=>{
    const ns=t.notes.filter(n=>n.ch!==9);
    if(!ns.length)return {index:i,name:t.name,count:0};
    const avg=ns.reduce((s,n)=>s+n.note,0)/ns.length;
    // Polyphonie-Grad: Anteil an Noten, die gleichzeitig mit einer anderen starten
    let poly=0;for(let k=1;k<ns.length;k++)if(ns[k].start===ns[k-1].start)poly++;
    return {index:i,name:t.name,count:ns.length,avgPitch:avg,poly:poly/ns.length,
      min:Math.min(...ns.map(n=>n.note)),max:Math.max(...ns.map(n=>n.note)),program:t.program};
  }).filter(t=>t.count>0);
  const melodic=tracks.filter(t=>t.count>=8);
  const melodyT=[...melodic].sort((a,b)=>(b.avgPitch-b.poly*20)-(a.avgPitch-a.poly*20))[0];
  const bassT=[...melodic].sort((a,b)=>a.avgPitch-b.avgPitch)[0];
  const chordT=[...melodic].sort((a,b)=>b.poly-a.poly)[0];
  const drums=midi.tracks.some(t=>t.notes.some(n=>n.ch===9));
  const lastTick=Math.max(0,...all.map(n=>n.start+n.dur));
  const bars=Math.ceil(lastTick/(midi.division*4));
  return {bpm,division:midi.division,timeSig:midi.timeSig,key:_detectKey(all),
    tracks,melody:melodyT&&melodyT.index,bass:bassT&&bassT.index,chords:chordT&&chordT.index,
    hasDrums:drums,bars,noteCount:all.length};
}

// ---------- 3. Quantisierung einer Spur → Strudel-Mini-Notation ----------
// mode 'mono' = höchste Note pro Step (Melodie), 'bass' = tiefste Note, 'poly' = Akkord [a,b,c]
function midiTrackToSteps(midi,trackIndex,{stepsPerBar=16,startBar=0,bars=8,mode='mono'}={}){
  const tr=midi.tracks[trackIndex];if(!tr)return [];
  const stepTicks=midi.division*4/stepsPerBar;
  const total=stepsPerBar*bars,offset=startBar*stepsPerBar*stepTicks;
  const steps=new Array(total).fill(null);
  tr.notes.forEach(n=>{
    if(n.ch===9)return;
    const s=Math.round((n.start-offset)/stepTicks);
    if(s<0||s>=total)return;
    const len=Math.max(1,Math.round(n.dur/stepTicks));
    const cur=steps[s];
    if(!cur)steps[s]={notes:[n.note],len};
    else if(mode==='poly'){if(!cur.notes.includes(n.note))cur.notes.push(n.note);}
    else if(mode==='mono'&&n.note>cur.notes[0])steps[s]={notes:[n.note],len};
    else if(mode==='bass'&&n.note<cur.notes[0])steps[s]={notes:[n.note],len};
  });
  return steps;
}
function stepsToMini(steps,{useHold=true}={}){
  const out=[];
  for(let i=0;i<steps.length;i++){
    const st=steps[i];
    if(!st){out.push('~');continue;}
    const name=st.notes.length>1?st.notes.sort((a,b)=>a-b).map(midiNoteName).join(','):midiNoteName(st.notes[0]);
    let hold=1;
    if(useHold){while(hold<st.len&&i+hold<steps.length&&!steps[i+hold])hold++;}
    out.push((st.notes.length>1?'['+name+']':name)+(hold>1?'@'+hold:''));
    i+=hold-1;
  }
  return out.join(' ');
}
// Melodie → Skalenstufen relativ zur Tonart (für n(...).scale(...) im Switch-Angel-Stil)
function stepsToDegrees(steps,key){
  const ivs=key.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];
  return steps.map(st=>{
    if(!st)return '~';
    const n=st.notes[0],rel=n-(48+key.root);
    const oct=Math.floor(rel/12),pc=((rel%12)+12)%12;
    let best=0,bd=99;ivs.forEach((v,i)=>{const d=Math.abs(v-pc);if(d<bd){bd=d;best=i;}});
    return String(best+oct*7);
  }).join(' ');
}

// Switch-Angel-Stil: kompakte Gewichtungs-Notation "7@8 ~@4 11@16 ..." (vgl. "<B@4 B@4 c#4@4 d4@2>*16")
function stepsToWeighted(steps,mapFn){
  const out=[];let i=0;
  while(i<steps.length){
    const st=steps[i];
    if(!st){let r=1;while(i+r<steps.length&&!steps[i+r])r++;out.push(r>1?'~@'+r:'~');i+=r;continue;}
    let hold=1;while(hold<st.len&&i+hold<steps.length&&!steps[i+hold])hold++;
    const tok=mapFn(st);
    out.push(hold>1?tok+'@'+hold:tok);i+=hold;
  }
  return out.join(' ');
}
function _noteToDegree(n,key){
  const ivs=key.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];
  const rel=n-(48+key.root),oct=Math.floor(rel/12),pc=((rel%12)+12)%12;
  let best=0,bd=99;ivs.forEach((v,i)=>{const d=Math.abs(v-pc);if(d<bd){bd=d;best=i;}});
  return best+oct*7;
}
// Findet melodisch dichte Abschnitte (Fanfare, Thema A/B, Finale) automatisch
function findThemeSections(midi,analysis,{bars=8}={}){
  const a=analysis||analyzeMidi(midi);
  const barTicks=midi.division*4;
  const mono=a.tracks.filter(t=>t.poly<0.15&&t.avgPitch>=55&&t.avgPitch<=84).map(t=>t.index);
  const count=(ti,b0,b1)=>midi.tracks[ti].notes.filter(n=>n.start>=b0*barTicks&&n.start<b1*barTicks).length;
  const cands=[];
  for(let b=0;b+4<=a.bars;b+=2){
    const len=Math.min(bars,a.bars-b);
    let best=null;
    mono.forEach(ti=>{const c=count(ti,b,b+len);if(!best||c>best.c)best={ti,c};});
    if(best&&best.c>=4)cands.push({startBar:b,bars:len,track:best.ti,density:best.c/len});
  }
  cands.sort((x,y)=>y.density-x.density);
  const chosen=[];
  // Fanfare (Takt 1) immer zuerst, falls Melodie vorhanden
  const intro=cands.find(c=>c.startBar===0);
  if(intro)chosen.push({...intro,bars:4,label:'Fanfare'});
  for(const c of cands){
    if(chosen.length>=4)break;
    if(chosen.some(s=>c.startBar<s.startBar+s.bars&&s.startBar<c.startBar+c.bars))continue;
    chosen.push({...c,label:''});
  }
  chosen.sort((x,y)=>x.startBar-y.startBar);
  const names=['Fanfare','Thema A','Thema B','Finale'];
  chosen.forEach((c,i)=>{if(!c.label)c.label=names[Math.min(names.length-1,i+(chosen[0].label==='Fanfare'?0:1))];});
  return chosen;
}

function formatTrackBars(midi,trackIdx,startBar,bars,mode){
  if(trackIdx===null||trackIdx===undefined||!midi.tracks[trackIdx])return null;
  const barStrings=[];let hasAny=false;
  for(let b=0;b<bars;b++){
    const st=midiTrackToSteps(midi,trackIdx,{startBar:startBar+b,bars:1,stepsPerBar:16,mode});
    if(!st.some(Boolean)){
      barStrings.push('[~]');
    }else{
      hasAny=true;
      barStrings.push(`[${stepsToMini(st)}]`);
    }
  }
  return hasAny?`<${barStrings.join(' ')}>`:null;
}

function formatDrumBars(midi,startBar,bars){
  const drumTrack=midi.tracks.find(t=>t.notes.some(n=>n.ch===9));
  if(!drumTrack)return null;
  const stepTicks=(midi.division*4)/16;
  const barStrings=[];let hasAny=false;
  for(let b=0;b<bars;b++){
    const offset=(startBar+b)*16*stepTicks;
    const steps=new Array(16).fill(null);
    drumTrack.notes.forEach(n=>{
      if(n.ch!==9)return;
      const s=Math.round((n.start-offset)/stepTicks);
      if(s<0||s>=16)return;
      let sound='sbd';
      if(n.note===35||n.note===36)sound='sbd';
      else if(n.note===38||n.note===40)sound='sd';
      else if(n.note===42||n.note===44)sound='hh';
      else if(n.note===46)sound='oh';
      else if(n.note===49||n.note===57)sound='cr';
      else if([41,43,45,47,48,50].includes(n.note))sound='lt';
      if(!steps[s])steps[s]=[sound];
      else if(!steps[s].includes(sound))steps[s].push(sound);
    });
    if(!steps.some(Boolean)){
      barStrings.push('[~]');
    }else{
      hasAny=true;
      const barTokens=steps.map(toks=>toks?(toks.length>1?`[${toks.join(',')}]`:toks[0]):'~');
      barStrings.push(`[${barTokens.join(' ')}]`);
    }
  }
  return hasAny?`<${barStrings.join(' ')}>`:null;
}

function midiToStrudelCode(midi,{title='Stargate Main Theme',bars=8,startBar=8}={}){
  const a=analyzeMidi(midi);
  const lines=[
    `//@title ${title} (MIDI direkt mit Strudel-Instrumenten)`,
    `// Quelle: midi/Stargate - Main Theme (${a.bpm} BPM, Tonart ${a.key.name}) · Takte ${startBar+1}-${startBar+bars}`,
    `setCpm(${a.bpm}/4)`,
    `const volume = slider(0.92)`,
    `all(x => x.mul(postgain(volume)))`,
    ''
  ];

  // 1. Heroic French Horn / Trumpet Melody (Track 2)
  const melTrack=a.melody!==null&&a.melody!==undefined?a.melody:2;
  const mel=formatTrackBars(midi,melTrack,startBar,bars,'mono');
  if(mel){
    lines.push(`$MELODY: note("${mel}")`);
    lines.push(`  .s("sawtooth").attack(0.04).decay(0.35).sustain(0.55).release(0.12).lpf(3000).room(0.5).gain(0.85).o(2)`);
    lines.push('');
  }

  // 2. Electric Bassline / Low Brass (Track 6)
  const bassTrack=a.bass!==null&&a.bass!==undefined?a.bass:6;
  const bass=formatTrackBars(midi,bassTrack,startBar,bars,'bass');
  if(bass){
    lines.push(`$BASS: note("${bass}").sub(12)`);
    lines.push(`  .s("sawtooth").decay(0.22).sustain(0.4).lpf(650).acidenv(0.35).gain(0.8).o(3)`);
    lines.push('');
  }

  // 3. Power Brass Harmony (Track 0)
  const harmTrack=(melTrack!==0&&bassTrack!==0)?0:1;
  const harm=formatTrackBars(midi,harmTrack,startBar,bars,'poly');
  if(harm){
    lines.push(`$HARMONY: note("${harm}")`);
    lines.push(`  .s("sawtooth").attack(0.05).decay(0.3).sustain(0.5).lpf(2400).room(0.5).gain(0.7).o(4)`);
    lines.push('');
  }

  // 4. Timpani & Orchestral Percussion (Track 9)
  const drums=formatDrumBars(midi,startBar,bars);
  if(drums){
    lines.push(`$DRUMS: s("${drums}")`);
    lines.push(`  .room(0.4).gain(0.8).o(5)`);
    lines.push('');
  }

  return lines.join('\n');
}

// ---------- 5. Theme × Switch Angel Remix ----------
function remixThemeSwitchAngel(midi,opts={}){
  const a=analyzeMidi(midi);
  const bars=opts.bars||8,startBar=opts.startBar!==undefined?opts.startBar:(opts.section||0)*bars;
  const scale=a.key.name.replace(':major',':major').replace(/^(\w#?)/,'$1');
  const melBars=[];
  const bassBars=[];
  const chordBars=[];
  for(let b=0;b<bars;b++){
    const ms=midiTrackToSteps(midi,a.melody,{startBar:startBar+b,bars:1,stepsPerBar:16,mode:'mono'});
    const bs=midiTrackToSteps(midi,a.bass,{startBar:startBar+b,bars:1,stepsPerBar:8,mode:'bass'});
    const cs=midiTrackToSteps(midi,a.chords,{startBar:startBar+b,bars:1,stepsPerBar:4,mode:'poly'});
    melBars.push(ms.some(Boolean)?`[${stepsToDegrees(ms,a.key)}]`:'[~]');
    bassBars.push(bs.some(Boolean)?`[${stepsToMini(bs,{useHold:false})}]`:'[~]');
    chordBars.push(cs.some(Boolean)?`[${stepsToMini(cs)}]`:'[~]');
  }
  const energy=opts.energy!==undefined?opts.energy:0.55;
  const bpm=opts.bpm||Math.max(124,Math.min(150,a.bpm<100?a.bpm*2:a.bpm));
  return `//@title Stargate Theme × Switch Angel Remix @by SGC Strudel Bridge
// Quelle: midi/Stargate - Main Theme (${a.bpm} BPM, Tonart ${a.key.name}, ${a.bars} Takte) – Takte ${startBar+1}-${startBar+bars}
setCpm(${bpm}/4)
setScale("${scale}")
const energy = slider(${energy.toFixed(3)})
const volume = slider(0.9)
all(x => x.mul(postgain(volume)))

$KICK: s("sbd!4").duck("3:4:5").duckdepth(.8).duckattack(.16).o(2)

$HAT: s("<- oh:2>*8").almostNever(ply("2 | 4")).gain(.6).dly(.5)

$THEME: n("<${melBars.join(' ')}>").sc()
  .s("supersaw").detune(.5).acidenv(energy).room(.6).roomsize(4).dly(.3).o(3)

$BASS: note("<${bassBars.join(' ')}>").sub(12)
  .s("sawtooth").seg(16).acidenv(energy.mul(.8)).lpq(6).diode("1").o(4)

$CHORDS: note("<${chordBars.join(' ')}>")
  .s("supersaw").trancegate(1.2,7,2).rlpf(.55).room(1).gain(.5).o(5)

_$RISER: s("pulse!16").fmtime(16,64).dec(tri.range(0.05,0.12).fast(4)).gain(.5)
`;
}

// ---------- 6. Seed-basierter Song-Generator ----------
// Gelernt aus den 20 Switch-Angel-Tracks:
//  • Struktur: benannte $LABEL:-Blöcke, 1 Kick (sbd!4 / bd:N!4) mit .duck() Sidechain, Offbeat-Hat "<- oh:2>*8",
//    Acid-Bass n("<...>*16").sc().s("sawtooth|supersaw").acidenv(slider(x)), Lead mit .dly()/.room()/.pan(rand).
//  • Tempo 130–170 BPM über setCpm(bpm/4); Skala via setScale()/.sc(); Variation via .rib(seed,len) & perlin.
//  • Stummgeschaltete Ideen mit _$NAME: (z.B. _$RISER), Generatives via irand/rand/almostNever(ply(...)).
const SONGGEN={
  _hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;},
  _rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};},
  PLANET_SCALES:{abydos:'d:phrygian',chulak:'e:minor',sgc:'a2:minor',tollana:'g:major:pentatonic',
    nox:'f:major:pentatonic',hatak:'c:minor',asgard:'b:minor',default:'e:minor'},
  THEME_STYLE:{desert:{kick:'bd:4',bpm:132,bass:'sawtooth'},jungle:{kick:'bd:1',bpm:165,bass:'sine',brk:true},
    city:{kick:'sbd',bpm:140,bass:'supersaw'},hatak:{kick:'sbd',bpm:146,bass:'sawtooth'},
    asgard:{kick:'bd:5',bpm:128,bass:'supersaw'},sgc:{kick:'sbd',bpm:136,bass:'sawtooth'}},
  ENEMY_MOOD:{jaffa:0.45,veteran:0.55,elite:0.65,goauld:0.85,repl:0.7,drone:0.6,queen:0.95},
  WEAPON_VOICE:{rifle:'s("hh:1!8").dec(.05).gain(.5)',shotgun:'s("sd:2").beat("4,12",16).diode("2:.4")',
    pistol:'s("rim:1!8").degradeBy(.5).gain(.4)',zat:'zap(.6,.08,"c4").struct("<- 1>*4").gain(.4)',
    staff:'s("cp:1").beat("6,14",16).room(.5)',staffLong:'s("cp:2").beat("3,11",16).dly(.4)',
    chakram:'s("cb!2").delay(.5).gain(.4)',hammer:'s("lt").beat("0,10",16).gain(.7)'},

  // ctx: {team:[charIds|names], planet, theme, enemies:{type:count}, weapons:[...], day, missionId, peaceful}
  generate(ctx={}){
    const team=(ctx.team||[]).map(x=>typeof x==='number'&&typeof S!=='undefined'&&S&&S.roster[x]?S.roster[x].name:String(x));
    const weapons=ctx.weapons||[];
    const enemies=ctx.enemies||{};
    const seedStr=[team.join('|'),ctx.planet||'',ctx.theme||'',JSON.stringify(enemies),weapons.join(','),ctx.day||1,ctx.missionId||''].join('#');
    const seed=this._hash(seedStr),r=this._rng(seed);
    const pick=a=>a[Math.floor(r()*a.length)];
    const style=this.THEME_STYLE[ctx.theme]||this.THEME_STYLE.sgc;
    const scale=this.PLANET_SCALES[ctx.planet]||this.PLANET_SCALES[ctx.theme]||pick(['e:minor','a2:minor','d:phrygian','g:minor','b:minor']);
    const moodVals=Object.entries(enemies).map(([k,c])=>(this.ENEMY_MOOD[k]||0.5)+Math.min(0.2,c*0.015));
    const mood=ctx.peaceful?0.15:Math.min(0.98,moodVals.length?Math.max(...moodVals):0.4);
    const bpm=Math.round((ctx.peaceful?110:style.bpm)+(mood-0.5)*16+(r()-0.5)*6);
    // Melodie aus Teamnamen ableiten: jeder Buchstabe → Skalenstufe (wie stxt() in Switch Angels prebake)
    const letters=(team.join('')||'SGC').toLowerCase().replace(/[^a-z]/g,'');
    const len=pick([5,6,7,8]);
    const mel=[];for(let i=0;i<len;i++){const c=letters.charCodeAt((i*3+seed)%letters.length)||97;mel.push((c-97)%9);}
    const bassDeg=[0,pick([0,3,5,-2]),pick([2,4,0]),pick([0,5,7])];
    const ribSeed=1+Math.floor(r()*48);
    const lines=[];
    lines.push(`//@title ${ctx.title||'Mission Seed '+seed.toString(16).toUpperCase()} @by SGC SongGen (Switch Angel Style)`);
    lines.push(`// Seed ${seed} · Tag ${ctx.day||1} · ${ctx.planet||'?'} · Team: ${team.join(', ')||'-'} · Gegner: ${Object.keys(enemies).join(', ')||'keine'}`);
    lines.push(`setCpm(${bpm}/4)`);
    lines.push(`setScale("${scale}")`);
    lines.push(`const energy = slider(${mood.toFixed(3)})`);
    lines.push('');
    if(!ctx.peaceful){
      lines.push(`$KICK: s("${style.kick}!4").duck("3:4:5").duckdepth(.${pick([6,7,8])}).duckattack(.16).almostNever(ply("2"))`);
      lines.push(`$HAT: s("<- oh:2>*8").almostNever(ply("2 | 4")).gain(.6).dly(.${pick([3,4,5,7])})`);
      if(style.brk)lines.push(`$BREAK: s("brk/2").fit().scrub(irand(16).div(16).seg(8)).gain(.7)`);
    }
    lines.push(`$BASS: n("<${bassDeg.join(' ')}>/2".sub(${pick([7,14])})).sc().seg(16)`);
    lines.push(`  .s("${style.bass}").acidenv(energy).rib(${ribSeed},2).diode("1").o(3)`);
    lines.push(`$LEAD: n("<${mel.join(' ')}>*${ctx.peaceful?8:16}").sc()`);
    lines.push(`  .s("${ctx.peaceful?'piano':pick(['pulse','sawtooth','supersaw'])}").pan(rand).dly(.${pick([5,6,7])}).room(.${pick([4,6,8])}).o(4)`);
    // Waffen werden zu Percussion-Stimmen
    [...new Set(weapons)].slice(0,3).forEach(w=>{
      if(this.WEAPON_VOICE[w])lines.push(`$${w.toUpperCase().replace(/[^A-Z]/g,'')}: ${this.WEAPON_VOICE[w]}`);
    });
    lines.push((mood>0.7?'':'_')+`$RISER: s("pulse!16").fmtime(16,64).dec(tri.range(0.05,0.12).fast(4)).gain(.5)`);
    return {seed,bpm,scale,mood,code:lines.join('\n')};
  },

  // Song aus aktueller Mission (C) ableiten
  fromCombat(C_,S_){
    if(!C_||!C_.mission)return null;
    const units=Object.values(C_.units||{});
    const team=units.filter(u=>u.side==='player').map(u=>u.name);
    const weapons=units.filter(u=>u.side==='player').map(u=>u.weapon).concat(units.filter(u=>u.side==='player'&&u.melee).map(u=>u.melee));
    return this.generate({team,weapons,planet:C_.mission.planet,theme:C_.theme,enemies:C_.mission.enemies||{},
      day:S_&&S_.day,missionId:C_.mission.id,peaceful:!!C_.mission.peaceful,title:C_.mission.name});
  }
};

// ---------- Theme-Integration ----------
const THEME_MIDI={
  parsed:null,analysis:null,
  load(){
    if(this.parsed)return this.parsed;
    let b64=null;
    if(typeof STARGATE_THEME_MIDI_B64!=='undefined')b64=STARGATE_THEME_MIDI_B64;
    else if(typeof window!=='undefined'&&window.STARGATE_THEME_MIDI_B64)b64=window.STARGATE_THEME_MIDI_B64;
    else if(typeof global!=='undefined'&&global.STARGATE_THEME_MIDI_B64)b64=global.STARGATE_THEME_MIDI_B64;
    if(!b64)return null;
    try{this.parsed=parseMidi(b64);this.analysis=analyzeMidi(this.parsed);}catch(e){console.warn('[MIDI]',e);}
    return this.parsed;
  },
  directCode(section=0){
    const m=this.load();
    if(!m)return null;
    const startBars=[8,0,16,24];
    const titles=['Stargate Main Theme','Stargate Opening Fanfare','Stargate Climax','Stargate Finale'];
    const sb=startBars[section%startBars.length]!==undefined?startBars[section%startBars.length]:8;
    const tit=titles[section%titles.length]||'Stargate Theme';
    return midiToStrudelCode(m,{title:tit,bars:8,startBar:sb});
  },
  remixCode(section=0,energy=0.55){const m=this.load();return m?remixThemeSwitchAngel(m,{section,energy}):null;}
};

function registerThemeTracks(){
  if(typeof STRUDEL_TRACKS==='undefined')return;
  const m=THEME_MIDI.load();if(!m)return;
  STRUDEL_TRACKS.theme_midi={name:'🎼 Stargate Main Theme (MIDI direkt)',artist:'Original Theme · MIDI-Bridge',role:'gate',code:THEME_MIDI.directCode(0)};
  STRUDEL_TRACKS.theme_fanfare={name:'🎺 Stargate Opening Fanfare (MIDI direkt)',artist:'Original Theme · MIDI-Bridge',role:'base',code:THEME_MIDI.directCode(1)};
  for(let s=0;s<4;s++){
    STRUDEL_TRACKS['theme_remix_'+s]={name:`🌀 Theme × Switch Angel Remix ${s+1}`,artist:'SGC Strudel Bridge',role:s===0?'gate':s%2?'combat':'map',
      code:THEME_MIDI.remixCode(s,0.4+s*0.15)};
  }
  if(typeof STRUDEL!=='undefined'&&STRUDEL.patterns){
    Object.keys(STRUDEL_TRACKS).forEach(k=>{STRUDEL.patterns[k]=STRUDEL_TRACKS[k].code;});
  }
}
registerThemeTracks();

if(typeof window!=='undefined'){
  window.parseMidi=parseMidi;window.analyzeMidi=analyzeMidi;window.SONGGEN=SONGGEN;window.THEME_MIDI=THEME_MIDI;window.registerThemeTracks=registerThemeTracks;
}
if(typeof module!=='undefined'&&module.exports){
  module.exports={parseMidi,analyzeMidi,midiTrackToSteps,stepsToMini,stepsToDegrees,midiToStrudelCode,remixThemeSwitchAngel,SONGGEN,THEME_MIDI,registerThemeTracks};
}
