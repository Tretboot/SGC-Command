'use strict';

// ============================================================================
// SGC COMMAND · RETRO ASCII-3D STARGATE FLYING INTRO CINEMATIC
// Features: 3D Perspective Depth Zoom, Rotating Glyph Ring, Locking Chevrons,
// Concentric ASCII Water Vortex Horizon & Switch Angel Stargate Remix 3 Audio
// ============================================================================

const INTRO_DURATION = 8200; // 8.2s epic flight into the Stargate
let introFrame = 0, introStart = 0, introFinish = null, introActive = false, introTimeout = 0;

// 3D Starfield particles streaming past the camera
const INTRO_3D_STARS = Array.from({length: 160}, (_, i) => ({
  x: (Math.random() - 0.5) * 1600,
  y: (Math.random() - 0.5) * 1000,
  z: 100 + Math.random() * 900,
  speed: 2.2 + Math.random() * 3.5,
  char: ['.', '·', '*', '+', '✦', '°', '★'][i % 7]
}));

// Stargate ancient glyph symbols for the rotating outer ring
const GATE_GLYPHS = ['᚛','⌾','∆','Ω','⚙','✦','⊕','⎈','⌘','◈','§','✶','※','¤','ᛟ','⌬','⏣','⏢','⍟','ᛝ','⍜','⌖','⍡','⎊','⍢','⎉','⍣','⍤','⍥','⍦','⍧','⍨','⍩','⎇','⌥','⎈','⎋','⏚','⌽'];

// ASCII water ripple density characters for the event horizon
const WATER_CHARS = [' ', ' ', '·', '~', '≈', '░', '▒', '▓', '█'];

function startOpeningCinematic(onFinish){
  const overlay = document.getElementById('intro-overlay');
  const canvas = document.getElementById('intro-cv');
  if(!overlay || !canvas){ if(onFinish) onFinish(); return; }

  // Guaranteed Intro Audio: Cheyenne Mountain Boot Screen
  const bootScreen = document.getElementById('boot-screen');
  const hasBootScreen = bootScreen && bootScreen.dataset && bootScreen.dataset.boot === 'true';
  const needsGesture = (typeof SFX !== 'undefined') &&
    !SFX.unlocked && (!SFX.ctx || SFX.ctx.state === 'suspended');

  if(hasBootScreen && needsGesture){
    bootScreen.style.display = 'flex';
    const doBoot = (e) => {
      if(e){ e.preventDefault(); e.stopPropagation(); }
      bootScreen.style.display = 'none';
      if(typeof window !== 'undefined' && typeof window.removeEventListener === 'function'){
        window.removeEventListener('keydown', doBootKey);
      }
      bootScreen.onclick = null;
      if(typeof SFX !== 'undefined'){
        SFX.unlocked = true;
        SFX.init();
        if(SFX.ctx){
          if(typeof SFX.ctx.resume === 'function'){
            try{ SFX.ctx.resume(); }catch(err){}
          }
          SFX.ctx.state = 'running';
        }
      }
      startOpeningCinematic(onFinish);
    };
    const doBootKey = (e) => {
      if(bootScreen.style.display === 'none') return;
      doBoot(e);
    };
    bootScreen.onclick = doBoot;
    const bootBtn = document.getElementById('boot-btn');
    if(bootBtn) bootBtn.onclick = doBoot;
    window.addEventListener('keydown', doBootKey, { once: true });
    return;
  }
  if(bootScreen) bootScreen.style.display = 'none';

  introFinish = onFinish;
  introActive = true;
  introStart = performance.now();
  overlay.style.display = 'flex';

  // Start Theme Remix 3 (Switch Angel Stargate Remix)
  if(typeof SFX !== 'undefined' && typeof SFX.playTrack === 'function'){
    SFX.init();
    // theme_remix_2 is Remix 3 (0-indexed: 0=Remix 1, 1=Remix 2, 2=Remix 3)
    const track = (typeof STRUDEL_TRACKS !== 'undefined' && (STRUDEL_TRACKS.theme_remix_2 ? 'theme_remix_2' : (STRUDEL_TRACKS.theme_remix_3 ? 'theme_remix_3' : 'theme_fanfare')));
    if(track) SFX.playTrack(track);
    const audioButton = document.getElementById('intro-audio');
    if(audioButton){
      const refreshAudioButton = () => {
        const supported = !!(SFX.ctx || (window.AudioContext || window.webkitAudioContext));
        const needsGesture = supported && (!SFX.ctx || SFX.ctx.state === 'suspended');
        audioButton.style.display = needsGesture && !SFX.muted && SFX.musicEnabled ? '' : 'none';
      };
      audioButton.onclick = (e) => {
        e.stopPropagation();
        SFX.init();
        const resume = SFX.resume();
        if(resume && typeof resume.catch === 'function'){
          resume.then(refreshAudioButton).catch(err => {
            console.error('[INTRO] Audio could not be enabled:', err);
            audioButton.textContent = 'Audio nicht verfügbar';
          });
        }else{
          refreshAudioButton();
        }
      };
      if(SFX.ctx && typeof SFX.ctx.addEventListener === 'function'){
        SFX.ctx.addEventListener('statechange', refreshAudioButton);
      }
      refreshAudioButton();
    }
  }

  const skipBtn = document.getElementById('intro-skip');
  if(skipBtn) skipBtn.onclick = (e) => { e.stopPropagation(); finishOpeningCinematic(); };
  overlay.onclick = () => finishOpeningCinematic();
  canvas.onclick = () => finishOpeningCinematic();

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  cancelAnimationFrame(introFrame);
  clearTimeout(introTimeout);

  if(reduced){
    introStart = performance.now() - INTRO_DURATION * 0.75;
    drawOpeningCinematic(performance.now());
    cancelAnimationFrame(introFrame);
    introTimeout = setTimeout(finishOpeningCinematic, 1500);
    return;
  }
  introFrame = requestAnimationFrame(drawOpeningCinematic);
}

function finishOpeningCinematic(){
  if(!introActive) return;
  introActive = false;
  cancelAnimationFrame(introFrame);
  clearTimeout(introTimeout);
  introTimeout = 0;
  const overlay = document.getElementById('intro-overlay');
  if(overlay) overlay.style.display = 'none';
  if(typeof SFX !== 'undefined') SFX.music('base');
  const done = introFinish;
  introFinish = null;
  if(done) done();
}

function drawOpeningCinematic(now){
  if(!introActive) return;
  const canvas = document.getElementById('intro-cv');
  if(!canvas) return;
  const c = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  // Normalized progress 0.0 -> 1.0
  const elapsed = (now - introStart);
  const p = Math.min(1.0, elapsed / INTRO_DURATION);

  // Clear dark void
  c.fillStyle = '#020610';
  c.fillRect(0, 0, W, H);

  // 1. 3D ASCII STARFIELD WARP (streaming radially past camera)
  c.font = '13px monospace';
  c.textAlign = 'center';
  c.textBaseline = 'middle';

  for(let i = 0; i < INTRO_3D_STARS.length; i++){
    const s = INTRO_3D_STARS[i];
    s.z -= s.speed * (1.0 + p * 3.5);
    if(s.z <= 10){
      s.z = 1000;
      s.x = (Math.random() - 0.5) * 1600;
      s.y = (Math.random() - 0.5) * 1000;
    }
    const k = 420 / s.z;
    const sx = cx + s.x * k;
    const sy = cy + s.y * k;
    if(sx >= 0 && sx < W && sy >= 0 && sy < H){
      const alpha = Math.min(1, Math.max(0.15, (1000 - s.z) / 750));
      c.fillStyle = `rgba(186, 230, 253, ${alpha})`;
      c.fillText(s.char, sx, sy);
    }
  }

  // 2. 3D STARGATE PERSPECTIVE DEPTH ZOOM (flying in from deep space)
  // Distance starts at Z=9.5 and flies directly to camera Z=1.35
  const flyCurve = Math.pow(p, 1.85);
  const gateZ = Math.max(1.35, 9.5 - flyCurve * 8.15);
  const gateScale = 380 / gateZ; // Perspective projection scale
  const R_ring = gateScale * 1.0;
  const R_inner = gateScale * 0.82;

  const spinAngle = (now * 0.00065) % (Math.PI * 2);

  // Event Horizon Kawoosh / Bloom progress
  const horizonActive = (p > 0.16);
  const horizonBloom = horizonActive ? Math.min(1.0, (p - 0.16) / 0.35) : 0;

  // A. Event Horizon ASCII Water Grid
  if(horizonActive && R_inner > 12){
    const stepX = 14;
    const stepY = 16;
    const maxR = R_inner * horizonBloom;
    const startX = Math.max(0, Math.floor((cx - maxR) / stepX) * stepX);
    const endX = Math.min(W, Math.ceil((cx + maxR) / stepX) * stepX);
    const startY = Math.max(0, Math.floor((cy - maxR) / stepY) * stepY);
    const endY = Math.min(H, Math.ceil((cy + maxR) / stepY) * stepY);

    c.font = 'bold 12px monospace';
    for(let y = startY; y <= endY; y += stepY){
      for(let x = startX; x <= endX; x += stepX){
        const dx = x - cx, dy = (y - cy) * 1.22;
        const d = Math.hypot(dx, dy);
        if(d < maxR){
          const normDist = d / maxR;
          // Concentric wave ripple equation
          const wave = Math.sin(normDist * 16 - now * 0.008) * 0.5 + 0.5;
          const charIdx = Math.floor(wave * (WATER_CHARS.length - 1));
          const char = WATER_CHARS[charIdx];

          // Center bright puddle fading to deep cyan edge
          c.fillStyle = normDist < 0.35 ? '#e0f2fe' : (normDist < 0.7 ? '#38bdf8' : '#0284c7');
          c.globalAlpha = Math.min(0.9, (1 - normDist * 0.4) * horizonBloom);
          c.fillText(char, x, y);
        }
      }
    }
    c.globalAlpha = 1.0;
  }

  // B. Outer Rotating ASCII Ring with Stargate Glyphs
  const glyphCount = 38;
  c.font = `bold ${Math.max(10, Math.round(gateScale * 0.072))}px monospace`;
  for(let i = 0; i < glyphCount; i++){
    const ang = spinAngle + (i / glyphCount) * Math.PI * 2;
    const gx = cx + Math.cos(ang) * R_ring;
    const gy = cy + Math.sin(ang) * R_ring * 0.88;
    const glyph = GATE_GLYPHS[i % GATE_GLYPHS.length];

    const brightness = 0.55 + 0.45 * Math.sin(ang + now * 0.003);
    c.fillStyle = `rgba(148, 163, 184, ${brightness})`;
    c.fillText(glyph, gx, gy);
  }

  // Inner track border (ASCII dot outline)
  const trackDots = 64;
  c.font = `bold ${Math.max(8, Math.round(gateScale * 0.045))}px monospace`;
  c.fillStyle = '#64748b';
  for(let i = 0; i < trackDots; i++){
    const a = (i / trackDots) * Math.PI * 2;
    const tx = cx + Math.cos(a) * R_inner;
    const ty = cy + Math.sin(a) * R_inner * 0.88;
    c.fillText('·', tx, ty);
  }

  // C. 9 CHEVRONS (Locking sequentially with amber / neon cyan burst)
  const chevronCount = 9;
  const lockedChevrons = Math.min(9, Math.floor(p * 11)); // locks 1 through 9

  c.font = `bold ${Math.max(11, Math.round(gateScale * 0.085))}px monospace`;
  for(let i = 0; i < chevronCount; i++){
    const a = -Math.PI / 2 + (i / chevronCount) * Math.PI * 2;
    const chR = R_ring * 1.08;
    const chx = cx + Math.cos(a) * chR;
    const chy = cy + Math.sin(a) * chR * 0.88;

    const isLocked = i < lockedChevrons;
    const isTopChevron = (i === 0);

    if(isLocked){
      c.fillStyle = isTopChevron ? '#38bdf8' : '#f59e0b';
      c.shadowColor = isTopChevron ? '#0284c7' : '#d97706';
      c.shadowBlur = 14;
      c.fillText('[ ▲ ]', chx, chy);
      c.shadowBlur = 0;
    } else {
      c.fillStyle = '#334155';
      c.fillText('[ ▽ ]', chx, chy);
    }
  }

  // 3. SGC COMMAND BANNER & TYPOGRAPHY REVEAL
  const textFade = Math.max(0, Math.min(1.0, (p - 0.42) / 0.28));
  if(textFade > 0.01){
    c.globalAlpha = textFade;
    c.textAlign = 'center';

    // Mission Kicker
    c.font = 'bold 13px monospace';
    c.fillStyle = '#38bdf8';
    c.shadowColor = '#0284c7';
    c.shadowBlur = 10;
    c.fillText('◎ STARGATE COMMAND · CHEYENNE MOUNTAIN COMPLEX', cx, 80);

    // Main ASCII Block Title
    c.shadowColor = '#38bdf8';
    c.shadowBlur = 20;
    c.fillStyle = '#f8fafc';
    c.font = 'bold 32px monospace';
    c.letterSpacing = '6px';
    c.fillText('S G C   C O M M A N D', cx, 126);
    c.shadowBlur = 0;
    c.letterSpacing = '0px';

    // Subtitle & Status
    c.font = '13px monospace';
    c.fillStyle = '#94a3b8';
    const chevText = lockedChevrons >= 7 ? 'CHEVRON 7 ENGAGED · WORMHOLE STABLE' : `ENCODING CHEVRON ${lockedChevrons}/7 …`;
    c.fillText(chevText, cx, 160);

    // Audio Credit Banner
    c.font = '12px monospace';
    c.fillStyle = '#e8b040';
    c.fillText('🎵 SOUNDTRACK: STARGATE THEME × SWITCH ANGEL REMIX 3 (STRUDEL ENGINE)', cx, H - 74);

    // Skip Pill Indicator
    c.font = 'bold 12px monospace';
    c.fillStyle = '#67e8f9';
    c.fillText('▶ KLICKEN / LEERTASTE / ESC: ÜBERSPRINGEN', cx, H - 44);

    c.globalAlpha = 1.0;
  }

  // Subtle retro scanlines overlay
  c.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for(let y = 0; y < H; y += 4){
    c.fillRect(0, y, W, 1.5);
  }

  if(p >= 1.0){
    finishOpeningCinematic();
  } else {
    introFrame = requestAnimationFrame(drawOpeningCinematic);
  }
}

document.addEventListener('keydown', e => {
  if(introActive && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')){
    e.preventDefault();
    e.stopImmediatePropagation();
    finishOpeningCinematic();
  }
});
