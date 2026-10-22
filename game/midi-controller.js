'use strict';

// ============================================================================
// SGC COMMAND · WEB MIDI API HARDWARE CONTROLLER SUBSYSTEM
// Standard Presets: Akai MPK mini mk2 / Akai MPK mini Plus
// Features: 8 Rotary Knobs (CC 70-77 / CC 1-8), 8 Drum Pads (Notes 36-43),
// 25 Live Keys Synthesizer, Dynamic MIDI Learn & Device Selector
// ============================================================================

const SGC_MIDI = {
  access: null,
  inputs: [],
  selectedId: null,
  connected: false,
  learningParam: null,
  lastActivity: 0,
  lastEvent: null,
  preset: 'akai_mpk_mini', // 'akai_mpk_mini' | 'custom'

  // Default Akai MPK mini Plus / mk2 knob bindings:
  // Knobs 1-8: CC 70-77 (Plus) and CC 1-8 (mk2 fallback)
  bindings: {
    // Akai MPK mini Plus Default Program 1: CC 70..77
    70: { param: 'cutoff', label: 'Filter Cutoff', min: 80, max: 9200, unit: 'Hz' },
    71: { param: 'resonance', label: 'Resonanz / Q', min: 0.5, max: 18, unit: '' },
    72: { param: 'volume', label: 'Master Volume', min: 0.0, max: 1.0, unit: '%' },
    73: { param: 'distortion', label: 'Drive / Distortion', min: 0.0, max: 1.0, unit: '%' },
    74: { param: 'delay', label: 'Delay / Reverb', min: 0.0, max: 0.85, unit: '' },
    75: { param: 'tension', label: 'Spannung / Dynamik', min: 0.0, max: 1.0, unit: '' },
    76: { param: 'tempoBpm', label: 'Tempo / BPM', min: 65, max: 175, unit: 'BPM' },
    77: { param: 'decay', label: 'Hüllkurve / Decay', min: 0.05, max: 1.2, unit: 's' },

    // Akai MPK mini mk2 Default Program 1: CC 1..8
    1: { param: 'cutoff', label: 'Filter Cutoff', min: 80, max: 9200, unit: 'Hz' },
    2: { param: 'resonance', label: 'Resonanz / Q', min: 0.5, max: 18, unit: '' },
    3: { param: 'volume', label: 'Master Volume', min: 0.0, max: 1.0, unit: '%' },
    4: { param: 'distortion', label: 'Drive / Distortion', min: 0.0, max: 1.0, unit: '%' },
    5: { param: 'delay', label: 'Delay / Reverb', min: 0.0, max: 0.85, unit: '' },
    6: { param: 'tension', label: 'Spannung / Dynamik', min: 0.0, max: 1.0, unit: '' },
    7: { param: 'tempoBpm', label: 'Tempo / BPM', min: 65, max: 175, unit: 'BPM' },
    8: { param: 'decay', label: 'Hüllkurve / Decay', min: 0.05, max: 1.2, unit: 's' }
  },

  // Akai MPK Drum Pads Bank A (MIDI Notes 36-43 on Channel 10 or 1)
  padMap: {
    36: 'bd',    // Pad 1: Roland TR-909/808 Kick
    37: 'rim',   // Pad 2: Rimshot
    38: 'sd',    // Pad 3: Snare Drum
    39: 'cp',    // Pad 4: Hand Clap
    40: 'hh',    // Pad 5: Closed Hi-Hat
    41: 'oh',    // Pad 6: Open Hi-Hat
    42: 'cr',    // Pad 7: Crash Cymbal / Ride
    43: 'tb303'  // Pad 8: TB-303 Acid Bass Stab
  },

  // Aktuelle Regler-Werte (für UI-Feedback)
  knobValues: {
    cutoff: 2400,
    resonance: 6.0,
    volume: 0.65,
    distortion: 0.20,
    delay: 0.28,
    tension: 0.25,
    tempoBpm: 140,
    decay: 0.28
  },

  async init(){
    this.loadBindings();
    if(typeof navigator==='undefined'||!navigator.requestMIDIAccess){
      this.connected=false;
      return false;
    }
    try{
      const access=await navigator.requestMIDIAccess({sysex:false});
      this.access=access;
      this.updateInputList();
      access.onstatechange=()=>this.updateInputList();
      this.connected=this.inputs.length>0;
      return this.connected;
    }catch(err){
      console.warn('[SGC_MIDI] Web MIDI Zugriff nicht verfügbar oder abgewiesen:', err);
      this.connected=false;
      return false;
    }
  },

  updateInputList(){
    if(!this.access) return;
    this.inputs=[];
    const iter=this.access.inputs.values();
    for(const port of iter){
      this.inputs.push({
        id: port.id,
        name: port.name || 'MIDI-Eingang',
        manufacturer: port.manufacturer || 'Generic',
        port
      });
      port.onmidimessage=(e)=>this.handleMIDIMessage(e);
    }
    this.connected=this.inputs.length>0;
    if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
  },

  handleMIDIMessage(e){
    if(!e||!e.data||e.data.length<2) return;
    const b0=e.data[0], b1=e.data[1], b2=e.data[2]!==undefined?e.data[2]:0;
    const cmd=b0 & 0xf0;
    const ch=(b0 & 0x0f) + 1;
    this.lastActivity=performance.now();

    // 1. CONTROL CHANGE (Drehregler / Fader)
    if(cmd===0xb0){
      const cc=b1, rawVal=b2;
      this.lastEvent={type:'cc', cc, val:rawVal, ch};

      // MIDI LEARN AKTIV: Aktuellen Drehregler an das gewählte Ziel binden!
      if(this.learningParam){
        const p=this.learningParam;
        this.bindings[cc]={
          param: p.key,
          label: p.label || p.key,
          min: p.min !== undefined ? p.min : 0,
          max: p.max !== undefined ? p.max : 1,
          unit: p.unit || ''
        };
        const boundLabel=p.label||p.key;
        this.learningParam=null;
        this.saveBindings();
        if(typeof toast==='function') toast(`🎛 MIDI Learn: CC #${cc} → ${boundLabel} gebunden!`);
        if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
        return;
      }

      // Normales CC-Dispatching
      const bind=this.bindings[cc];
      if(bind){
        const norm=rawVal/127;
        const mappedVal=bind.min + norm * (bind.max - bind.min);
        this.applyParameter(bind.param, mappedVal, norm);
      }
      if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
      return;
    }

    // 2. NOTE ON (Drum-Pads & Live Keyboard Tasten)
    if(cmd===0x90 && b2>0){
      const note=b1, vel=b2/127;
      this.lastEvent={type:'noteon', note, vel:b2, ch};

      // Ist es ein Drum Pad (z.B. Akai MPK Pads 36-43)?
      if(this.padMap[note]){
        const padSound=this.padMap[note];
        if(typeof SFX!=='undefined'&&SFX.triggerDrum){
          SFX.triggerDrum(padSound, Math.max(0.2, vel * 0.95));
        }
        if(typeof toast==='function'&&ch===10){
          toast(`🥁 Pad ${note-35}: ${padSound.toUpperCase()}`);
        }
      }else{
        // Live Keyboard Taste: Synth-Sound über das Audio-System anspielen!
        if(typeof SFX!=='undefined'&&SFX.playLiveNote){
          SFX.playLiveNote(note, vel);
        }
      }
      if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
      return;
    }

    // 3. NOTE OFF (Taste losgelassen)
    if(cmd===0x80 || (cmd===0x90 && b2===0)){
      const note=b1;
      this.lastEvent={type:'noteoff', note, ch};
      if(!this.padMap[note]){
        if(typeof SFX!=='undefined'&&SFX.stopLiveNote){
          SFX.stopLiveNote(note);
        }
      }
      if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
    }
  },

  applyParameter(param, val, norm){
    this.knobValues[param]=val;
    if(typeof SFX==='undefined') return;

    if(param==='cutoff'){
      SFX.setRebirthParam('cutoff', val);
    }else if(param==='resonance'){
      SFX.setRebirthParam('resonance', val);
    }else if(param==='volume'){
      SFX.setVolume(val);
    }else if(param==='distortion'){
      SFX.setRebirthParam('distortion', val);
    }else if(param==='tempoBpm'){
      SFX.setRebirthParam('tempoBpm', val);
    }else if(param==='decay'){
      SFX.setRebirthParam('decay', val);
    }else if(param==='delay'){
      if(SFX.delayNode&&SFX.ctx){
        SFX.delayNode.delayTime.setValueAtTime(Math.max(0.05, Math.min(0.85, val)), SFX.ctx.currentTime);
      }
    }else if(param==='tension'){
      if(typeof STRUDEL!=='undefined') STRUDEL.tension=Math.round(val*100)/100;
    }
  },

  startLearn(paramKey, label, min, max, unit){
    this.learningParam={ key: paramKey, label, min, max, unit };
    if(typeof toast==='function'){
      toast(`🎛 MIDI Learn: Bitte jetzt am gewünschten Hardware-Drehregler drehen...`);
    }
    if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
  },

  cancelLearn(){
    this.learningParam=null;
    if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
  },

  resetDefaultAkaiPreset(variant='plus'){
    if(variant==='mk2'){
      // Akai MPK mini mk2 (CC 1..8)
      [1,2,3,4,5,6,7,8].forEach((cc,idx)=>{
        const p=['cutoff','resonance','volume','distortion','delay','tension','tempoBpm','decay'][idx];
        const l=['Filter Cutoff','Resonanz / Q','Master Volume','Drive / Distortion','Delay / Reverb','Spannung / Dynamik','Tempo / BPM','Hüllkurve / Decay'][idx];
        this.bindings[cc]={ param:p, label:l, min:[80,0.5,0,0,0,0,65,0.05][idx], max:[9200,18,1,1,0.85,1,175,1.2][idx] };
      });
    }else{
      // Akai MPK mini Plus (CC 70..77)
      [70,71,72,73,74,75,76,77].forEach((cc,idx)=>{
        const p=['cutoff','resonance','volume','distortion','delay','tension','tempoBpm','decay'][idx];
        const l=['Filter Cutoff','Resonanz / Q','Master Volume','Drive / Distortion','Delay / Reverb','Spannung / Dynamik','Tempo / BPM','Hüllkurve / Decay'][idx];
        this.bindings[cc]={ param:p, label:l, min:[80,0.5,0,0,0,0,65,0.05][idx], max:[9200,18,1,1,0.85,1,175,1.2][idx] };
      });
    }
    this.saveBindings();
    if(typeof toast==='function') toast(`🎛 Akai MPK Preset geladen (${variant==='mk2'?'MK2':'Plus'})`);
    if(typeof updateMidiStatusUI==='function') updateMidiStatusUI();
  },

  saveBindings(){
    try{
      if(typeof localStorage!=='undefined'){
        localStorage.setItem('sgc_midi_bindings', JSON.stringify(this.bindings));
      }
    }catch(e){}
  },

  loadBindings(){
    try{
      if(typeof localStorage!=='undefined'){
        const s=localStorage.getItem('sgc_midi_bindings');
        if(s){
          const parsed=JSON.parse(s);
          if(parsed&&typeof parsed==='object') this.bindings=Object.assign({}, this.bindings, parsed);
        }
      }
    }catch(e){}
  }
};

if(typeof window!=='undefined'){
  window.SGC_MIDI=SGC_MIDI;
  window.addEventListener('load',()=>{
    setTimeout(()=>SGC_MIDI.init(), 600);
  });
}
if(typeof module!=='undefined'&&module.exports){
  module.exports={SGC_MIDI};
}

