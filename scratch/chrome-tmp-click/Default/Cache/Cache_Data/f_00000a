'use strict';
// ===================== SGC COMMAND v3 – Isometric Voxel & ASCII Engine (iso.js) =====================
// Fundamental überarbeitete Spielfeld- & Basis-Darstellung:
// 1. PIXEL-VOXEL-MODUS (S.gfxMode === 'pixel'):
//    2:1 Pixel-Art Isometric Projection (inspiriert von Obelisk.js [MIT], Syndicate, X-COM,
//    Jagged Alliance, Command & Conquer & SimCity 2000).
//    - 3D-Voxel-Geländesäulen mit Höhenstufen (baseZ + blockH), Top-Diamond, linkem und
//      rechtem Schatten-Face, Wasser-Wellen, Straßennetzen, mehrstöckigen City-Blöcken,
//      Abydos-Tempeln, C&C-artigen Offworld-Basen (Reaktor, Geschützturm, Bunker) und
//      3D-Stargate auf Stufenpodest.
// 2. ASCII-3D-MODUS (S.gfxMode === 'ascii'):
//    Isometrische CP437/ASCII-Pipeline nach Vorbild von Tretboot/asciiid & msokalski/asciicker (MIT).
//    - Sub-Cell Höhenstufen- & Silhouetten-Erkennung (Klippenkanten '─', '_', '│', '/', '\'),
//      schattierte Voxel-Blöcke ('█', '▓', '▒', '░', '▀', '▄', '▌', '▐'), Terrain-Dithering
//      (' ..::%', '≈~∽', '╬═║'), 3D-ASCII-Stargate und Multi-Cell-Agenten-Sprites ('@', '╬').
// 3. KLASSISCH 2D (S.gfxMode === 'topdown'):
//    Optionaler Fallback auf die alte Top-Down-Ansicht.
// Alle Modi teilen sich dieselbe Spiellogik und sind im Menü (ESC), Header oder per Taste [V]
// jederzeit live im Spiel umschaltbar und zu 100% spielbar!

const ISO={
  tileW:64,
  tileH:32,
  zStep:14,
  rot:0,     // 0..3 (90°-Schritte, Q/E zum Drehen)
  zoom:1.0,  // 0.7..1.5
  lastHitMap:[],
};

// Offworld-Gebäude (Command & Conquer / SimCity-Style Feldbau & Outpost-Skalierung)
const OFFWORLD_BUILDINGS={
  barricade:{type:1,name:'Sandsack-Stellung',icon:'🧱',cost:{ore:10},hp:45,desc:'Leichte Deckung (+20% Schutz), begehbar'},
  turret:{type:12,name:'Auto-Geschützturm',icon:'🗼',cost:{ore:25,tech:5},hp:70,desc:'Feuert automatisch auf Feinde in R.5 (8–12 Dmg)'},
  reactor:{type:11,name:'Naquadah-Generator',icon:'⚡',cost:{ore:30,tech:10},hp:80,desc:'+10% Schild/Heilung für Einheiten im Umkreis 3'},
  bunker:{type:13,name:'Kommando-Bunker',icon:'🏢',cost:{ore:40,tech:10},hp:110,desc:'Schwere Deckung + Radar-Sichtfeld'},
};

function getGfxMode(){
  return (typeof S!=='undefined'&&S&&S.gfxMode)?S.gfxMode:'pixel';
}

function setGfxMode(mode){
  if(!['pixel','ascii','topdown'].includes(mode))mode='pixel';
  if(typeof S!=='undefined'&&S){
    S.gfxMode=mode;
    if(typeof save==='function')save();
  }
  // Automatischer 8-Bit Chiptune Sound im ASCII-Modus
  if(typeof STRUDEL!=='undefined'&&typeof STRUDEL.setChiptune==='function'){
    if(mode==='ascii'){
      STRUDEL.setChiptune(true,false);
    }else if(!STRUDEL._manualChiptune){
      STRUDEL.setChiptune(false,false);
    }
  }
  const lbl=mode==='ascii'?'ASCII-3D (asciiid)':mode==='topdown'?'2D Top-Down':'Pixel-Voxel (Isometrisch)';
  if(typeof note==='function'&&typeof S!=='undefined'&&S)note(`🖥 Grafik-Modus: ${lbl}`);
  return {ok:true,msg:`Grafik: ${lbl}`};
}

function cycleGfxMode(){
  const cur=getGfxMode();
  const next=cur==='pixel'?'ascii':cur==='ascii'?'pixel':'pixel';
  return setGfxMode(next);
}

function rotateIsoCamera(dir){
  ISO.rot=(ISO.rot+(dir||1)+4)%4;
  if(typeof sfx==='function')sfx('click');
}

function zoomIsoCamera(delta){
  ISO.zoom=Math.max(0.65,Math.min(1.55,Math.round((ISO.zoom+delta)*100)/100));
}

// Deterministischer Hash für Voxel-Details & Höhen
function _isoHash(x,y,salt){
  let n=Math.imul(x+13+(salt||0)*31,374761393)^Math.imul(y+29+(salt||0)*17,668265263);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967296;
}

// Berechnet Voxel-Grundhöhe (baseZ) und Struktur-Höhe (blockH) einer Zelle (x,y)
function getVoxelInfo(x,y){
  if(!C.active||!C.map||!inB(x,y))return {t:0,baseZ:1,blockH:0,topZ:1};
  const cell=C.map[idx(x,y)];
  const t=cell?cell.t:0;
  if(cell&&cell.baseZ!==undefined&&cell.blockH!==undefined){
    return {t,baseZ:cell.baseZ,blockH:cell.blockH,topZ:cell.baseZ+cell.blockH,hp:cell.hp||0};
  }
  const h=_isoHash(x,y,C.mapVersion||1);
  let baseZ=1.0;
  if(t===4||t===7){
    baseZ=0.25; // Wasser tiefer gelegt
  }else if(t===9){
    baseZ=1.15; // Brücke über Wasser
  }else if(t===5){
    baseZ=1.2;  // Gate-Podest
  }else if(C.theme==='desert'||C.theme==='jungle'){
    const distGate=C.gatePos?Math.max(Math.abs(x-C.gatePos.x),Math.abs(y-C.gatePos.y)):10;
    if(distGate>6&&t!==10&&t!==8){
      const wave=Math.sin(x*0.24)*Math.cos(y*0.22);
      if(wave>0.45)baseZ=1.55;
      else if(wave>0.15)baseZ=1.25;
    }
  }
  let blockH=0;
  if(t===1||t===6)blockH=0.85;       // Leichte Deckung / Trümmer / Sandsäcke
  else if(t===2)blockH=1.65;          // Hohe Deckung / Felsen / Mauer
  else if(t===3){                     // Gebäude / Tempelwand / City-Hochhaus
    blockH=C.theme==='city'?(2.8+Math.floor(h*3)*0.9):(2.3+Math.floor(h*2)*0.6);
  }
  else if(t===8)blockH=2.2;           // Siedlungs-Haus / Kolonie-Gebäude
  else if(t===11)blockH=2.1;          // Naquadah-Generator
  else if(t===12)blockH=1.75;         // Geschützturm
  else if(t===13)blockH=2.6;          // Kommando-Bunker
  else if(t===14)blockH=2.3;          // Raffinerie
  if(cell){cell.baseZ=baseZ;cell.blockH=blockH;}
  return {t,baseZ,blockH,topZ:baseZ+blockH,hp:cell?cell.hp||0:0};
}

// Weltkoordinaten (wx, wy, wz) -> Bildschirmkoordinaten (sx, sy)
function isoProject(wx,wy,wz,W,H){
  const cx=C.cameraX+VIEW_W*0.5;
  const cy=C.cameraY+VIEW_H*0.5;
  const rx0=wx-cx,ry0=wy-cy;
  let dx=rx0,dy=ry0;
  const r=((ISO.rot%4)+4)%4;
  if(r===1){dx=-ry0;dy=rx0;}
  else if(r===2){dx=-rx0;dy=-ry0;}
  else if(r===3){dx=ry0;dy=-rx0;}
  const tw=ISO.tileW*ISO.zoom;
  const th=ISO.tileH*ISO.zoom;
  const tz=ISO.zStep*ISO.zoom;
  const sx=W*0.5+(dx-dy)*(tw*0.5);
  const sy=H*0.50+(dx+dy)*(th*0.5)-(wz||0)*tz;
  return {x:sx,y:sy,depth:dx+dy};
}

// Punkt-in-Raute Test für präzises Picking auf erhöhten Voxel-Oberflächen
function _pointInDiamond(px,py,cx,cy,hw,hh){
  return (Math.abs(px-cx)/Math.max(1,hw)+Math.abs(py-cy)/Math.max(1,hh))<=1.05;
}

// Bildschirmkoordinaten (mx, my) -> Welt-Tile {x, y}
function isoScreenToTile(mx,my,W,H){
  if(getGfxMode()==='topdown'){
    return {x:Math.floor(mx/TILE)+C.cameraX,y:Math.floor(my/TILE)+C.cameraY};
  }
  const tw=ISO.tileW*ISO.zoom,th=ISO.tileH*ISO.zoom,tz=ISO.zStep*ISO.zoom;
  // 1. Prüfe zuerst Einheiten-Hitboxen und erhöhte Voxel-Top-Faces (Front-to-Back)
  if(ISO.lastHitMap&&ISO.lastHitMap.length){
    for(let i=ISO.lastHitMap.length-1;i>=0;i--){
      const h=ISO.lastHitMap[i];
      if(h.unitBox){
        if(mx>=h.ux0&&mx<=h.ux1&&my>=h.uy0&&my<=h.uy1)return {x:h.x,y:h.y};
      }
      if(_pointInDiamond(mx,my,h.sx,h.sy,tw*0.5,th*0.5))return {x:h.x,y:h.y};
    }
  }
  // 2. Exakte analytische Rückprojektion auf die Grundebene (wz = 1.0)
  const u=(mx-W*0.5)/(tw*0.5);
  const v=(my-H*0.50+1.0*tz)/(th*0.5);
  const dx=(u+v)*0.5;
  const dy=(v-u)*0.5;
  const r=((ISO.rot%4)+4)%4;
  let rx0=dx,ry0=dy;
  if(r===1){rx0=dy;ry0=-dx;}
  else if(r===2){rx0=-dx;ry0=-dy;}
  else if(r===3){rx0=-dy;ry0=dx;}
  const cx=C.cameraX+VIEW_W*0.5;
  const cy=C.cameraY+VIEW_H*0.5;
  return {x:Math.floor(cx+rx0),y:Math.floor(cy+ry0)};
}

// Farb-Palette pro Theme für Voxel-Blöcke
const _ISO_PAL={
  desert:{ground:'#c8a060',groundAlt:'#be9554',cliffL:'#9a7640',cliffR:'#785a2e',cover1:'#b58b4c',cover2:'#8e7955',wall:'#c4a46c',wallRoof:'#dfc48e',water:'#2670b8',waterHi:'#5cb0ee',road:'#a88f62'},
  jungle:{ground:'#2f5731',groundAlt:'#294d2b',cliffL:'#4e3c28',cliffR:'#382a1b',cover1:'#3b6e38',cover2:'#234726',wall:'#5c6b4c',wallRoof:'#788864',water:'#22647e',waterHi:'#52a2b8',road:'#7c6d4d'},
  city:  {ground:'#43464e',groundAlt:'#3c3f47',cliffL:'#32353c',cliffR:'#23262c',cover1:'#7c828d',cover2:'#8e5042',wall:'#525a6b',wallRoof:'#6c768a',water:'#204260',waterHi:'#4a80a8',road:'#2b2d33'},
  sgc:   {ground:'#2f3847',groundAlt:'#29313f',cliffL:'#202733',cliffR:'#161b24',cover1:'#586878',cover2:'#485668',wall:'#3e4a59',wallRoof:'#5a6a7c',water:'#247ca8',waterHi:'#70d0ff',road:'#232a36'},
  hatak: {ground:'#242e3a',groundAlt:'#1e2732',cliffL:'#161e28',cliffR:'#0f151d',cover1:'#3d4d5c',cover2:'#4a5866',wall:'#46525e',wallRoof:'#687684',water:'#1c3448',waterHi:'#58c7dc',road:'#2c3846'},
  asgard:{ground:'#5c6a75',groundAlt:'#53606b',cliffL:'#3f4b54',cliffR:'#2e3840',cover1:'#788892',cover2:'#9caab2',wall:'#8c9aa2',wallRoof:'#b8c6cc',water:'#325866',waterHi:'#7ce8f0',road:'#4b5862'},
};

// Zeichnet eine isometrische 3D-Voxel-Säule (Top-Diamond + Left-Face + Right-Face)
function drawIsoPrism(c,sx,syBase,tw,th,hPx,topCol,leftCol,rightCol,strokeCol){
  const hw=tw*0.5,hh=th*0.5;
  const topY=syBase-hPx;
  // Linke Seitenfläche
  if(hPx>0){
    c.fillStyle=leftCol;
    c.beginPath();
    c.moveTo(sx-hw,topY);
    c.lineTo(sx,topY+hh);
    c.lineTo(sx,syBase+hh);
    c.lineTo(sx-hw,syBase);
    c.closePath();
    c.fill();
    // Rechte Seitenfläche
    c.fillStyle=rightCol;
    c.beginPath();
    c.moveTo(sx+hw,topY);
    c.lineTo(sx,topY+hh);
    c.lineTo(sx,syBase+hh);
    c.lineTo(sx+hw,syBase);
    c.closePath();
    c.fill();
  }
  // Obere Raute (Top-Face)
  c.fillStyle=topCol;
  c.beginPath();
  c.moveTo(sx,topY-hh);
  c.lineTo(sx+hw,topY);
  c.lineTo(sx,topY+hh);
  c.lineTo(sx-hw,topY);
  c.closePath();
  c.fill();
  if(strokeCol){
    c.strokeStyle=strokeCol;
    c.lineWidth=1;
    c.stroke();
  }
}

// Zeichnet Pixel-Art-Details auf Voxel-Blöcke (Gebäudefenster, Bäume, Stargate, Türme, Reaktoren)
function drawIsoVoxelDetails(c,x,y,v,sx,syGround,tw,th,tz,pal,now){
  const t=v.t,hw=tw*0.5,hh=th*0.5;
  const hPx=v.blockH*tz;
  const topY=syGround-hPx;
  const h=_isoHash(x,y,7);

  if(t===0){
    // Dezente Boden-Pixelstruktur
    if(h>0.65){
      c.fillStyle=shade(pal.ground,h>0.82?14:-12);
      c.fillRect(sx-3,syGround-2,4,2);
    }
    return;
  }
  if(t===4||t===7){
    // Animierte Wasser-Glanzpixel
    const wave=Math.sin(now/380+x*0.7+y*0.5);
    c.fillStyle=pal.waterHi;
    c.globalAlpha=0.45+0.25*wave;
    c.fillRect(sx-8+wave*3,syGround-2,7,2);
    c.fillRect(sx+2-wave*2,syGround+2,6,2);
    c.globalAlpha=1;
    return;
  }
  if(t===9){
    // Brücken-Geländer
    c.strokeStyle='#c9ad78';c.lineWidth=2;
    c.beginPath();c.moveTo(sx-hw*0.7,syGround-4);c.lineTo(sx,syGround-hh*0.7-4);c.stroke();
    c.beginPath();c.moveTo(sx,syGround+hh*0.7-4);c.lineTo(sx+hw*0.7,syGround-4);c.stroke();
    return;
  }
  if(t===10){
    // Straßen-Markierung (SimCity / Syndicate Asphalt-Look)
    c.fillStyle=C.theme==='city'?'#d8b848':'#c8b080';
    c.fillRect(sx-2,syGround-1,4,2);
    return;
  }
  if(t===5){
    // 3D Isometrisches Stargate auf Stufenpodest!
    drawIsoPrism(c,sx,syGround,tw*0.92,th*0.92,tz*0.45,'#3a4656','#283240','#1b222c','rgba(120,180,220,0.4)');
    const gateY=syGround-tz*0.45;
    const pulse=0.5+0.5*Math.sin(now/260);
    const rx=tw*0.34,ry=tw*0.42;
    c.save();
    c.translate(sx,gateY-ry*0.75);
    // Äußerer Naquadah-Ring
    c.strokeStyle='#5a6878';c.lineWidth=5*ISO.zoom;
    c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.stroke();
    // Ereignishorizont (schimmerndes Wurmloch)
    const eg=c.createRadialGradient(0,0,2,0,0,ry);
    eg.addColorStop(0,'#e0f8ff');
    eg.addColorStop(0.55,'#38a8f0');
    eg.addColorStop(1,'#144888');
    c.fillStyle=eg;
    c.globalAlpha=0.85+0.12*pulse;
    c.beginPath();c.ellipse(0,0,rx*0.84,ry*0.84,0,0,Math.PI*2);c.fill();
    c.globalAlpha=1;
    // 9 leuchtende Chevrons
    for(let i=0;i<9;i++){
      const a=-Math.PI/2+i*Math.PI*2/9;
      const cx=Math.cos(a)*rx,cy=Math.sin(a)*ry;
      c.fillStyle='#ff8a1f';
      c.fillRect(cx-2,cy-2,4,4);
    }
    c.restore();
    c.fillStyle='#8ad8ff';c.font=`bold ${Math.max(8,Math.round(10*ISO.zoom))}px monospace`;c.textAlign='center';
    c.fillText('◎ GATE',sx,gateY-ry*1.65);
    return;
  }

  // Ab hier: Voxel-Aufbauten (Deckung, Gebäude, Siedlung, Offworld-Basis)
  if(t===1||t===6){
    if(C.theme==='jungle'&&t===1){
      // Voxel-Baumstamm + geschichtete Pixel-Baumkrone
      drawIsoPrism(c,sx,syGround,tw*0.28,th*0.28,tz*0.7,'#6b4828','#54381e','#3d2814');
      drawIsoPrism(c,sx,syGround-tz*0.5,tw*0.68,th*0.68,tz*0.65,'#3a7838','#2a5c2a','#1d421e');
      drawIsoPrism(c,sx,syGround-tz*1.05,tw*0.46,th*0.46,tz*0.45,'#4e9448','#387035','#285226');
    }else{
      // Taktische Kiste / Sandsack-Barrikade
      const topC=t===6?'#b88c52':pal.cover1;
      drawIsoPrism(c,sx,syGround,tw*0.68,th*0.68,hPx,topC,shade(topC,-20),shade(topC,-40),'rgba(255,255,255,0.12)');
      // Warnstreifen / Kisten-Fuge
      c.fillStyle='#e8c040';
      c.fillRect(sx-6,topY-1,12,2);
    }
    return;
  }

  if(t===2){
    if(C.theme==='jungle'){
      // Dichtes Hoch-Dickicht / Monolith
      drawIsoPrism(c,sx,syGround,tw*0.78,th*0.78,hPx*0.75,'#28582c','#1d4220','#142e16');
      drawIsoPrism(c,sx,syGround-hPx*0.65,tw*0.56,th*0.56,hPx*0.5,'#38743a','#28562a','#1c3e1e');
    }else{
      const topC=pal.cover2;
      drawIsoPrism(c,sx,syGround,tw*0.84,th*0.84,hPx,topC,shade(topC,-22),shade(topC,-42),'rgba(255,255,255,0.14)');
    }
    return;
  }

  if(t===3||t===8){
    // Mehrstöckiges Gebäude / Tempel / Siedlungshaus (Syndicate / SimCity-Look)
    const isHouse=t===8;
    const baseC=isHouse?'#b59362':pal.wall;
    const roofC=isHouse?'#6c4832':pal.wallRoof;
    const wScale=isHouse?0.88:0.96;
    drawIsoPrism(c,sx,syGround,tw*wScale,th*wScale,hPx,roofC,shade(baseC,-14),shade(baseC,-34),'rgba(255,255,255,0.1)');
    // Dach-Aufbau (Klimaanlage / Antenne in City/SGC, Zinnen in Desert)
    if(C.theme==='city'||C.theme==='sgc'){
      drawIsoPrism(c,sx,topY,tw*0.36,th*0.36,tz*0.35,shade(roofC,12),shade(roofC,-15),shade(roofC,-30));
      // Leuchtende Pixel-Fenster auf den beiden Seitenflächen
      const floors=Math.max(1,Math.floor(v.blockH));
      for(let f=0;f<floors;f++){
        const wy=syGround-8-f*(tz*0.85);
        if(wy<topY+6)break;
        const lit=((x+y+f)%3)!==0;
        c.fillStyle=lit?'#ffe082':'#283848';
        c.fillRect(sx-hw*0.55,wy,4,4);
        c.fillRect(sx-hw*0.25,wy+3,4,4);
        c.fillStyle=lit?'#d4b458':'#1c2834';
        c.fillRect(sx+hw*0.2,wy+3,4,4);
        c.fillRect(sx+hw*0.48,wy,4,4);
      }
    }else if(isHouse){
      // Abgestuftes Siedlungsdach + warme Tür
      drawIsoPrism(c,sx,topY,tw*0.58,th*0.58,tz*0.4,shade(roofC,15),roofC,shade(roofC,-20));
      c.fillStyle='#ffe082';c.fillRect(sx-hw*0.35,syGround-12,5,5);
      c.fillStyle='#3e2c1e';c.fillRect(sx+hw*0.18,syGround-10,5,9);
    }
    return;
  }

  // Offworld Command & Conquer / SimCity Strukturen (t=11..14)
  if(t===11){
    // Naquadah-Generator (mit pulsierendem blauen Energiekern)
    drawIsoPrism(c,sx,syGround,tw*0.82,th*0.82,hPx*0.65,'#4a5a6a','#344250','#222c38','#4fc3f7');
    const pulse=0.6+0.4*Math.sin(now/220);
    const coreC=pulse>0.8?'#9be7ff':'#4fc3f7';
    drawIsoPrism(c,sx,syGround-hPx*0.6,tw*0.45,th*0.45,hPx*0.55,coreC,'#2998d0','#186898');
    return;
  }
  if(t===12){
    // Auto-Geschützturm (Basis + drehbarer Doppel-Lauf)
    drawIsoPrism(c,sx,syGround,tw*0.66,th*0.66,hPx*0.65,'#5a6670','#3e4852','#283038');
    drawIsoPrism(c,sx,syGround-hPx*0.6,tw*0.42,th*0.42,hPx*0.42,'#7c8a96','#586470','#3a444e','#e8b040');
    const dir=Math.sin(now/600+x)*8;
    c.strokeStyle='#e8b040';c.lineWidth=3;
    c.beginPath();c.moveTo(sx,topY-2);c.lineTo(sx+12+dir*0.4,topY+4-dir*0.3);c.stroke();
    return;
  }
  if(t===13){
    // Kommando-Bunker + Radar-Schüssel
    drawIsoPrism(c,sx,syGround,tw*0.9,th*0.9,hPx,'#4e5d6c','#384452','#26303a','#7be1e8');
    c.fillStyle='#7be1e8';c.fillRect(sx-10,topY+8,8,3);c.fillRect(sx+2,topY+8,8,3);
    c.strokeStyle='#cbd8e4';c.lineWidth=2;
    c.beginPath();c.arc(sx,topY-6,7,Math.PI*0.8,Math.PI*1.9);c.stroke();
    return;
  }
}

// Zeichnet ein Rauten-Overlay (Move, Attack, Cover, Selection) auf die Oberfläche eines Voxels
function drawIsoDiamondOverlay(c,sx,syTop,tw,th,fillCol,strokeCol,lineWidth){
  const hw=tw*0.46,hh=th*0.46;
  c.beginPath();
  c.moveTo(sx,syTop-hh);
  c.lineTo(sx+hw,syTop);
  c.lineTo(sx,syTop+hh);
  c.lineTo(sx-hw,syTop);
  c.closePath();
  if(fillCol){c.fillStyle=fillCol;c.fill();}
  if(strokeCol){c.strokeStyle=strokeCol;c.lineWidth=lineWidth||1.5;c.stroke();}
}

// ===================== HAUPT-RENDERER 1: ISOMETRIC PIXEL-VOXEL =====================
function renderCombatIsoPixel(cv){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height;
  c.clearRect(0,0,W,H);
  updateFx();
  const now=performance.now();
  const pal=_ISO_PAL[C.theme]||_ISO_PAL.desert;

  // Atmosphärischer Hintergrund
  const bg=c.createLinearGradient(0,0,0,H);
  if(C.theme==='hatak'){bg.addColorStop(0,'#080d14');bg.addColorStop(1,'#141e2c');}
  else if(C.theme==='asgard'){bg.addColorStop(0,'#1f2933');bg.addColorStop(1,'#384854');}
  else if(C.theme==='jungle'){bg.addColorStop(0,'#0b1911');bg.addColorStop(1,'#1a3322');}
  else if(C.theme==='city'){bg.addColorStop(0,'#12151e');bg.addColorStop(1,'#252a36');}
  else{bg.addColorStop(0,'#1c1610');bg.addColorStop(1,'#3a2e22');}
  c.fillStyle=bg;c.fillRect(0,0,W,H);

  c.save();
  if(C.shake>0.3)c.translate((Math.random()-0.5)*C.shake,(Math.random()-0.5)*C.shake);

  ISO.beatPulse = Math.max(0, (ISO.beatPulse || 0) * 0.92);
  const audioDanceOn = typeof S !== 'undefined' && S && S.audioDance !== false;
  const pulse = audioDanceOn ? (ISO.beatPulse || 0) : 0;
  if(pulse > 0.01){
    const bounceY = Math.sin(now * 0.016) * pulse * 2.4;
    c.translate(0, bounceY);
    if(pulse > 0.1){
      const sc = 1.0 + pulse * 0.004;
      c.scale(sc, sc);
    }
  }

  const tw=ISO.tileW*ISO.zoom,th=ISO.tileH*ISO.zoom,tz=ISO.zStep*ISO.zoom;
  const pad=6;
  const startX=Math.max(0,C.cameraX-pad),endX=Math.min(GW,C.cameraX+VIEW_W+pad);
  const startY=Math.max(0,C.cameraY-pad),endY=Math.min(GH,C.cameraY+VIEW_H+pad);

  // Lookup für Overlays & Einheiten pro Tile
  const moveSet=new Set(C.moveRange.map(p=>idx(p.x,p.y)));
  const coverSet=new Set(C.coverRange.map(p=>idx(p.x,p.y)));
  const atkMap=new Map();
  C.atkRange.forEach(u=>atkMap.set(idx(u.x,u.y),u));
  const unitMap=new Map();
  Object.values(C.units).forEach(u=>{if(!u.dead)unitMap.set(idx(u.x,u.y),u);});

  // Alle sichtbaren Zellen sammeln und nach isometrischer Tiefe (Painter's Algorithm) sortieren
  const renderList=[];
  for(let y=startY;y<endY;y++){
    for(let x=startX;x<endX;x++){
      const v=getVoxelInfo(x,y);
      const pGround=isoProject(x+0.5,y+0.5,v.baseZ,W,H);
      if(pGround.x<-tw*1.5||pGround.x>W+tw*1.5||pGround.y<-th*4||pGround.y>H+th*3)continue;
      renderList.push({x,y,v,pGround,depth:pGround.depth});
    }
  }
  renderList.sort((a,b)=>a.depth-b.depth);

  ISO.lastHitMap=[];

  // Back-to-Front Voxel- & Einheiten-Pass
  for(let i=0;i<renderList.length;i++){
    const item=renderList[i];
    const {x,y,v,pGround}=item;
    const sx=pGround.x,syGround=pGround.y;
    const groundPx=v.baseZ*tz;
    const syZero=syGround+groundPx;
    const cellKey=idx(x,y);

    // 1. Voxel-Grundsäule (Erde/Fels/Wasser/Straße)
    const isChecker=((x+y)&1)===0;
    let topCol=isChecker?pal.ground:pal.groundAlt;
    if(v.t===4||v.t===7)topCol=pal.water;
    else if(v.t===10)topCol=pal.road;
    else if(v.t===9)topCol='#8c6e46';
    drawIsoPrism(c,sx,syZero,tw,th,groundPx,topCol,pal.cliffL,pal.cliffR,'rgba(255,255,255,0.05)');

    // 2. Voxel-Strukturen (Deckung, Gebäude, Gate, Offworld-Anlagen)
    drawIsoVoxelDetails(c,x,y,v,sx,syGround,tw,th,tz,pal,now);

    const sySurface=syGround-(v.t===1||v.t===2||v.t===6?0:0);
    // Für Picking speichern (Oberfläche des begehbaren/anklickbaren Voxels)
    const pickY=v.blockH>0&&!isWalkable(x,y)?syGround-v.blockH*tz:syGround;
    const hitEntry={x,y,sx,sy:pickY,unitBox:false};

    // 3. Taktische Overlays (Bewegung, Zerstörbare Deckung, Angriffsziel, Hover, Offworld-Bau)
    if(moveSet.has(cellKey)){
      drawIsoDiamondOverlay(c,sx,syGround,tw,th,'rgba(79,195,247,0.24)','rgba(79,195,247,0.75)',1.5);
      c.fillStyle='#4fc3f7';c.fillRect(sx-2,syGround-2,4,4);
    }
    if(coverSet.has(cellKey)){
      const topCoverY=syGround-v.blockH*tz;
      drawIsoDiamondOverlay(c,sx,topCoverY,tw*0.75,th*0.75,'rgba(255,209,102,0.22)','rgba(255,209,102,0.9)',1.8);
    }
    if(atkMap.has(cellKey)){
      drawIsoDiamondOverlay(c,sx,syGround,tw,th,'rgba(239,68,68,0.32)','#ef4444',2);
    }
    if(C.hover&&C.hover.x===x&&C.hover.y===y){
      const hCol=C.buildType?(canPlaceOffworld(C.buildType,x,y)?'#4ade80':'#ef4444'):'rgba(255,255,255,0.75)';
      drawIsoDiamondOverlay(c,sx,syGround,tw,th,C.buildType?'rgba(74,222,128,0.18)':null,hCol,2);
    }

    // 4. Einheit / Agent auf diesem Voxel (Syndicate / X-COM / Jagged Alliance Stil)
    const u=unitMap.get(cellKey);
    if(u){
      // Sanfte Schritt-/Walk-Interpolation, falls die Einheit sich gerade bewegt hat
      let ux=x,uy=y,walkPhase=0;
      if(u._animFrom&&now-u._animT0<260){
        const p=Math.min(1,(now-u._animT0)/260);
        ux=u._animFrom.x+(x-u._animFrom.x)*p;
        uy=u._animFrom.y+(y-u._animFrom.y)*p;
        walkPhase=now/45;
      }
      const pUnit=isoProject(ux+0.5,uy+0.5,v.baseZ,W,H);
      const usx=pUnit.x,usy=pUnit.y-2;
      const sc=0.82*ISO.zoom;

      if(C.selected===u){
        drawIsoDiamondOverlay(c,usx,usy+2,tw*0.88,th*0.88,'rgba(79,195,247,0.22)','#4fc3f7',2.5);
      }

      if(u.side==='player'){
        const m=S.roster[u.charId];
        if(m){
          const alpha=u.downed?0.45:1;
          const bob=walkPhase?walkPhase:Math.sin(now/350+u.id)*0.35;
          drawSoldier(c,usx,usy,sc,m,bob,alpha);
          // Schild-Effekt falls aktiv
          if(u.shieldTurns>0){
            c.strokeStyle='rgba(79,195,247,0.75)';c.lineWidth=2;
            c.beginPath();c.ellipse(usx,usy-16*sc,14*sc,20*sc,0,0,Math.PI*2);c.stroke();
          }
          // HP-Balken + Label über dem Kopf
          const bw=32*ISO.zoom,bh=4;
          c.fillStyle='rgba(5,10,16,0.85)';c.fillRect(usx-bw/2-1,usy-38*sc-1,bw+2,bh+2);
          c.fillStyle=u.hp>u.maxHp*0.3?'#4ade80':'#ef4444';
          c.fillRect(usx-bw/2,usy-38*sc,bw*(u.hp/u.maxHp),bh);
          drawUnitLabel(c,u.name,usx,usy+10,'#7be1e8');
        }
      }else if(u.side==='neutral'){
        drawCivilian(c,usx,usy);
        drawIsoDiamondOverlay(c,usx,usy+2,tw*0.75,th*0.75,null,'#ffe493',2);
        drawUnitLabel(c,u.name,usx,usy+10,'#ffe493');
        c.fillStyle='#ffe493';c.font='bold 12px monospace';c.textAlign='center';
        c.fillText('💬',usx,usy-34*sc);
      }else{
        const alpha=u.downed?0.45:1;
        drawEnemyBody(c,usx,usy,sc,u.type,alpha);
        const bw=30*ISO.zoom,bh=4;
        c.fillStyle='rgba(5,10,16,0.85)';c.fillRect(usx-bw/2-1,usy-36*sc-1,bw+2,bh+2);
        c.fillStyle='#ef4444';c.fillRect(usx-bw/2,usy-36*sc,bw*(u.hp/u.maxHp),bh);
        drawUnitLabel(c,u.name,usx,usy+10,'#f87171');
        if(atkMap.has(cellKey)){
          c.fillStyle='#ef4444';c.font=`bold ${Math.round(16*ISO.zoom)}px monospace`;c.textAlign='center';
          c.fillText('✛',usx,usy-42*sc);
        }
      }
      hitEntry.unitBox=true;
      hitEntry.ux0=usx-16*ISO.zoom;hitEntry.ux1=usx+16*ISO.zoom;
      hitEntry.uy0=usy-38*ISO.zoom;hitEntry.uy1=usy+8*ISO.zoom;
    }
    ISO.lastHitMap.push(hitEntry);
  }

  // 5. Partikel & Schuss-FX im isometrischen Raum
  const nowFx=performance.now();
  C.fx.forEach(f=>{
    const age=(nowFx-f.t0)/700;
    if(f.type==='trace'){
      const v0=getVoxelInfo(f.x0,f.y0),v1=getVoxelInfo(f.x1,f.y1);
      const p0=isoProject(f.x0+0.5,f.y0+0.5,v0.baseZ+0.9,W,H);
      const p1=isoProject(f.x1+0.5,f.y1+0.5,v1.baseZ+0.9,W,H);
      c.globalAlpha=(1-age)*0.85;c.strokeStyle=f.color||'#ffd23a';c.lineWidth=2.5;
      c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke();c.globalAlpha=1;
      return;
    }
    const vf=getVoxelInfo(f.x,f.y);
    const pf=isoProject(f.x+0.5,f.y+0.5,vf.baseZ+1.1,W,H);
    if(f.type==='dmg'){
      c.globalAlpha=1-age;c.fillStyle=f.color||'#ffd23a';c.font='bold 15px monospace';c.textAlign='center';
      c.fillText((typeof f.val==='number'&&f.val>0?'-':'')+f.val,pf.x,pf.y-age*28);c.globalAlpha=1;
    }else if(f.type==='flash'){
      c.globalAlpha=(1-age)*0.7;c.fillStyle=f.color||'#ff5555';
      c.beginPath();c.arc(pf.x,pf.y,10+age*20,0,7);c.fill();c.globalAlpha=1;
    }else if(f.type==='muzzle'){
      c.globalAlpha=(1-age)*0.9;c.fillStyle='#ffd23a';
      c.beginPath();c.arc(pf.x,pf.y,6+age*8,0,7);c.fill();c.globalAlpha=1;
    }else if(f.type==='death'){
      c.globalAlpha=(1-age)*0.8;c.fillStyle='#ff7848';
      for(let k=0;k<6;k++){
        const a=k/6*6.28;
        c.beginPath();c.arc(pf.x+Math.cos(a)*age*22,pf.y+Math.sin(a)*age*14,4*(1-age),0,7);c.fill();
      }
      c.globalAlpha=1;
    }
  });
  c.restore();

  // 6. Isometrisches Kompass-/Steuerungs-Badge & Hover-Info
  drawIsoHudOverlay(c,W,H,'PIXEL-VOXEL ISO');
}

// ===================== HAUPT-RENDERER 2: ISOMETRIC 3D ASCII (asciiid / asciicker Mode) =====================
// Nutzt dieselbe isometrische Projektion & Hitmap wie der Pixel-Voxel-Modus, zeichnet aber
// die gesamte 3D-Szene als CP437/ASCII-Glyphen-Gitter mit Höhenkonturen ('─', '_', '│', '/', '\'),
// schattierten Voxel-Blöcken ('█', '▓', '▒', '░', '▀', '▄') und Multi-Cell-ASCII-Sprites!
function renderCombatIsoAscii(cv){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height;
  updateFx();
  const now=performance.now();

  // Terminal-Hintergrund mit feinen CRT-Scanlines
  c.fillStyle='#05080d';c.fillRect(0,0,W,H);
  c.fillStyle='rgba(18,32,46,0.22)';
  for(let y=0;y<H;y+=4)c.fillRect(0,y,W,1);

  c.save();
  ISO.beatPulse = Math.max(0, (ISO.beatPulse || 0) * 0.92);
  const audioDanceOn = typeof S !== 'undefined' && S && S.audioDance !== false;
  const pulse = audioDanceOn ? (ISO.beatPulse || 0) : 0;
  if(pulse > 0.01){
    const bounceY = Math.sin(now * 0.016) * pulse * 2.0;
    c.translate(0, bounceY);
  }

  const tw=ISO.tileW*ISO.zoom,th=ISO.tileH*ISO.zoom,tz=ISO.zStep*ISO.zoom;
  const pad=6;
  const startX=Math.max(0,C.cameraX-pad),endX=Math.min(GW,C.cameraX+VIEW_W+pad);
  const startY=Math.max(0,C.cameraY-pad),endY=Math.min(GH,C.cameraY+VIEW_H+pad);

  const moveSet=new Set(C.moveRange.map(p=>idx(p.x,p.y)));
  const coverSet=new Set(C.coverRange.map(p=>idx(p.x,p.y)));
  const atkMap=new Map();
  C.atkRange.forEach(u=>atkMap.set(idx(u.x,u.y),u));
  const unitMap=new Map();
  Object.values(C.units).forEach(u=>{if(!u.dead)unitMap.set(idx(u.x,u.y),u);});

  const renderList=[];
  for(let y=startY;y<endY;y++){
    for(let x=startX;x<endX;x++){
      const v=getVoxelInfo(x,y);
      const pGround=isoProject(x+0.5,y+0.5,v.baseZ,W,H);
      if(pGround.x<-tw*1.5||pGround.x>W+tw*1.5||pGround.y<-th*4||pGround.y>H+th*3)continue;
      renderList.push({x,y,v,pGround,depth:pGround.depth});
    }
  }
  renderList.sort((a,b)=>a.depth-b.depth);
  ISO.lastHitMap=[];

  const fontPx=Math.max(10,Math.round(12*ISO.zoom));
  c.font=`bold ${fontPx}px "Consolas","Courier New",monospace`;
  c.textAlign='center';

  // Theme-Farben für ASCII-Glyphen (wie xterm-216 Palette in asciicker)
  const themeGlyph={
    desert:{fg:'#d8b46c',bg:'#1b140b',wall:'#e8c888',shadeL:'#b08a48',shadeR:'#7a5c2e',g:'.·:;'},
    jungle:{fg:'#52b858',bg:'#09180d',wall:'#88a870',shadeL:'#38883c',shadeR:'#225826',g:',.\'"`'},
    city:  {fg:'#8fa0b4',bg:'#0d1118',wall:'#b8c8dc',shadeL:'#68788c',shadeR:'#424e5e',g:'·+┼╬'},
    sgc:   {fg:'#6498b8',bg:'#091018',wall:'#98bfd8',shadeL:'#48708c',shadeR:'#2c485c',g:'·÷┼╬'},
    hatak: {fg:'#d4913e',bg:'#080c12',wall:'#e8b058',shadeL:'#8a6028',shadeR:'#583c18',g:'·×╬¤'},
    asgard:{fg:'#7ce8f0',bg:'#0a141c',wall:'#b8f4f8',shadeL:'#4898a8',shadeR:'#2c6470',g:'·°¤┼'},
  }[C.theme]||{fg:'#52b858',bg:'#09180d',wall:'#88a870',shadeL:'#38883c',shadeR:'#225826',g:'.·:;'};

  for(let i=0;i<renderList.length;i++){
    const {x,y,v,pGround}=renderList[i];
    const sx=pGround.x,syGround=pGround.y;
    const cellKey=idx(x,y);
    const h=_isoHash(x,y,3);

    // 1. ASCII-Bodenkachel + Höhenstufen-Silhouetten (asciiid render.cpp Logik: z_lo - z_hi > 0 -> '─'/'_')
    let bgCol=themeGlyph.bg,fgCol=themeGlyph.fg;
    let gl=themeGlyph.g[Math.floor(h*themeGlyph.g.length)];
    if(v.t===4||v.t===7){
      bgCol='#071b2c';fgCol='#4fc3f7';
      gl=['≈','~','∽'][Math.floor((now/240+x+y)%3)];
    }else if(v.t===9){
      bgCol='#241a0e';fgCol='#e8c078';gl='═';
    }else if(v.t===10){
      bgCol='#16181e';fgCol='#b0b8c4';gl=(x%2===0)?'═':'╬';
    }else if(v.baseZ>1.1){
      // Erhöhtes Plateau -> Konturlinie '─' und Schattierungs-Glyphen '▒'/'░' an der Klippe
      c.fillStyle=themeGlyph.shadeL;
      c.fillText('▒░',sx,syGround+fontPx*0.85);
      gl='─';
    }

    // Hintergrund-Zelle des isometrischen ASCII-Tiles
    c.fillStyle=bgCol;
    c.fillRect(sx-tw*0.32,syGround-th*0.28,tw*0.64,th*0.56);
    c.fillStyle=fgCol;
    c.fillText(`${gl} ${gl} ${gl}`,sx,syGround+4);

    // 2. 3D-ASCII-Voxel-Blöcke (Mauern, Deckung, Gebäude, Stargate, Offworld-Turrets)
    const hPx=v.blockH*tz;
    const topY=syGround-hPx;
    if(v.t===5){
      // 3D ASCII Stargate!
      const wave=['≋','≈','*','◎'][Math.floor((now/180)%4)];
      c.fillStyle='#ff8a1f';c.fillText('╭─▲─╮',sx,syGround-fontPx*2.2);
      c.fillStyle='#4fc3f7';c.fillText(`◄${wave}${wave}${wave}►`,sx,syGround-fontPx*1.2);
      c.fillStyle='#8fa0b4';c.fillText('╘═GATE═╛',sx,syGround-2);
    }else if(v.t===1||v.t===6){
      c.fillStyle=v.t===6?'#e8b040':themeGlyph.shadeL;
      c.fillText(C.theme==='jungle'&&v.t===1?'♣♠♣':'[▄▀▄]',sx,syGround-fontPx*0.4);
    }else if(v.t===2){
      c.fillStyle=themeGlyph.shadeL;c.fillText('▓██▓',sx,syGround-fontPx*0.3);
      c.fillStyle=themeGlyph.wall;c.fillText('▀▀▀▀',sx,syGround-fontPx*1.1);
    }else if(v.t===3||v.t===8){
      const layers=Math.max(2,Math.min(4,Math.round(v.blockH)));
      for(let l=0;l<layers;l++){
        const ly=syGround-l*fontPx*0.85;
        c.fillStyle='#0a0f16';c.fillRect(sx-tw*0.3,ly-fontPx,tw*0.6,fontPx+2);
        c.fillStyle=l===layers-1?themeGlyph.wall:(l%2?themeGlyph.shadeL:themeGlyph.shadeR);
        c.fillText(v.t===8?(l===layers-1?'/▲▲\\':'│▪▫│'):(l===layers-1?'┌──┐':'██▓░'),sx,ly);
      }
    }else if(v.t===11){
      c.fillStyle='#4fc3f7';c.fillText('[⚡CORE⚡]',sx,syGround-fontPx*0.7);
    }else if(v.t===12){
      c.fillStyle='#e8b040';c.fillText('╔╦═╤',sx,syGround-fontPx*0.8);
      c.fillStyle='#8fa0b4';c.fillText('╚╩╝',sx,syGround-2);
    }else if(v.t===13){
      c.fillStyle='#7be1e8';c.fillText('╔═📡═╗',sx,syGround-fontPx*1.1);
      c.fillStyle='#9ab0bd';c.fillText('║██▓║',sx,syGround-2);
    }

    // 3. Taktische ASCII-Overlays
    if(moveSet.has(cellKey)){
      c.fillStyle='rgba(79,195,247,0.22)';
      c.fillRect(sx-tw*0.28,syGround-th*0.24,tw*0.56,th*0.48);
      c.fillStyle='#4fc3f7';c.fillText('· · ·',sx,syGround+4);
    }
    if(coverSet.has(cellKey)){
      c.fillStyle='#ffd166';c.fillText('[✛]',sx,topY);
    }
    if(atkMap.has(cellKey)){
      c.fillStyle='rgba(239,68,68,0.28)';
      c.fillRect(sx-tw*0.32,syGround-th*0.3,tw*0.64,th*0.6);
    }
    if(C.hover&&C.hover.x===x&&C.hover.y===y){
      c.strokeStyle=C.buildType?(canPlaceOffworld(C.buildType,x,y)?'#4ade80':'#ef4444'):'#ffffff';
      c.lineWidth=1.5;c.strokeRect(sx-tw*0.32,syGround-th*0.28,tw*0.64,th*0.56);
    }

    // 4. Multi-Cell ASCII-Sprites für Einheiten (wie asciicker .xp Sprites)
    const u=unitMap.get(cellKey);
    const pickY=v.blockH>0&&!isWalkable(x,y)?topY:syGround;
    const hitEntry={x,y,sx,sy:pickY,unitBox:false};

    if(u){
      const usx=sx,usy=syGround-4;
      const isSel=C.selected===u;
      const col=u.side==='player'?(isSel?'#4fc3f7':'#4ade80'):u.side==='neutral'?'#ffe493':'#f87171';
      c.fillStyle='rgba(4,8,14,0.92)';
      c.fillRect(usx-22*ISO.zoom,usy-fontPx*2.6,44*ISO.zoom,fontPx*2.9);
      if(isSel){
        c.strokeStyle='#4fc3f7';c.lineWidth=2;
        c.strokeRect(usx-23*ISO.zoom,usy-fontPx*2.6,46*ISO.zoom,fontPx*2.9);
      }
      // Detaillierte Kopf- und Torso-Zeile nach Klasse & Gegner-Typ (CP437)
      let headGlyph=isSel?'[@]':' @ ';
      let bodyGlyph='/|═';
      if(u.side==='player'){
        if(u.cls==='heavy'){headGlyph='[☗]';bodyGlyph='/|=#=';}
        else if(u.cls==='sniper'){headGlyph='(◎)';bodyGlyph='/|-═-';}
        else if(u.cls==='engineer'){headGlyph='[⚙]';bodyGlyph='/|* ';}
        else if(u.cls==='leader'){headGlyph='[^]';bodyGlyph='/|═>';}
        else if(u.cls==='medic'){headGlyph='[✚]';bodyGlyph='/|~ ';}
      }else if(u.side==='neutral'){
        headGlyph='☺💬';bodyGlyph='/|\\';
      }else{
        const en=String(u.name||u.type||'').toLowerCase();
        if(en.includes('goa')||en.includes('lord')){headGlyph='[👑]';bodyGlyph='/|⚡';}
        else if(en.includes('repl')){headGlyph='><';bodyGlyph='[#]><';}
        else if(en.includes('drone')){headGlyph=' • ';bodyGlyph='-|-';}
        else if(en.includes('queen')){headGlyph='[[♛]]';bodyGlyph='//|\\\\';}
        else{headGlyph=atkMap.has(cellKey)?'{✛}':'[▲]';bodyGlyph='/|§';}
      }
      c.fillStyle=col;
      c.fillText(headGlyph,usx,usy-fontPx*1.45);
      c.fillStyle=u.side==='player'?'#e2e8f0':col;
      c.fillText(bodyGlyph,usx,usy-fontPx*0.45);
      // Name + HP-Balken in CP437
      const hpBars=Math.max(1,Math.round((u.hp/u.maxHp)*4));
      c.fillStyle=col;
      c.fillText(u.name.split(' ')[0].slice(0,5)+' '+('█'.repeat(hpBars))+('░'.repeat(4-hpBars)),usx,usy+fontPx*0.45);

      hitEntry.unitBox=true;
      hitEntry.ux0=usx-24*ISO.zoom;hitEntry.ux1=usx+24*ISO.zoom;
      hitEntry.uy0=usy-fontPx*2.8;hitEntry.uy1=usy+fontPx*0.6;
    }
    ISO.lastHitMap.push(hitEntry);
  }

  // ASCII-FX (Schadenszahlen, Tracer als '***'-Linie, Explosionen als '#*@')
  const nowFx=performance.now();
  C.fx.forEach(f=>{
    const age=(nowFx-f.t0)/700;
    if(f.type==='trace'){
      const v0=getVoxelInfo(f.x0,f.y0),v1=getVoxelInfo(f.x1,f.y1);
      const p0=isoProject(f.x0+0.5,f.y0+0.5,v0.baseZ+0.9,W,H);
      const p1=isoProject(f.x1+0.5,f.y1+0.5,v1.baseZ+0.9,W,H);
      c.fillStyle='#ffd23a';
      for(let s=1;s<=5;s++){
        const t=s/6;
        c.fillText('*',p0.x+(p1.x-p0.x)*t,p0.y+(p1.y-p0.y)*t);
      }
      return;
    }
    const vf=getVoxelInfo(f.x,f.y);
    const pf=isoProject(f.x+0.5,f.y+0.5,vf.baseZ+1.2,W,H);
    if(f.type==='dmg'){
      c.fillStyle=f.color||'#ffd23a';
      c.fillText(`[-${f.val}]`,pf.x,pf.y-age*26);
    }else if(f.type==='flash'||f.type==='death'){
      c.fillStyle='#ff5555';
      c.fillText(f.type==='death'?'# * @ * #':'*#*',pf.x,pf.y);
    }
  });

  drawIsoHudOverlay(c,W,H,'ASCII-3D (asciiid)');
  if (audioDanceOn && pulse > 0.04) {
    const barsCount = Math.min(14, Math.round(pulse * 14));
    c.font = '11px monospace';
    c.fillStyle = '#4ade80';
    c.fillText(`[♫ BEAT ${'█'.repeat(barsCount)}${'░'.repeat(14 - barsCount)}]`, 16, 20);
  }
  c.restore();
}

// Gemeinsames HUD-Overlay oben links im Kampf (Modus-Anzeige, Kameradrehung Q/E, Hover-Tooltip)
function drawIsoHudOverlay(c,W,H,modeLabel){
  c.save();
  c.fillStyle='rgba(6,11,18,0.88)';
  c.fillRect(12,38,348,28);
  c.strokeStyle='#2a6fa8';c.lineWidth=1;c.strokeRect(12,38,348,28);
  c.fillStyle='#4fc3f7';c.font='bold 11px monospace';c.textAlign='left';
  const compass=['N-O','S-O','S-W','N-W'][((ISO.rot%4)+4)%4];
  c.fillText(`🖥 ${modeLabel} · 🧭 ${compass} (Q/E Drehen · V Modus)`,20,56);

  if(C.buildType&&OFFWORLD_BUILDINGS[C.buildType]){
    const BLD=OFFWORLD_BUILDINGS[C.buildType];
    c.fillStyle='rgba(20,40,28,0.92)';c.fillRect(12,70,348,26);
    c.strokeStyle='#4ade80';c.strokeRect(12,70,348,26);
    c.fillStyle='#4ade80';
    c.fillText(`🏗 Offworld-Bau: ${BLD.icon} ${BLD.name} (Klick = Platzieren)`,20,87);
  }

  // Hover-Info-Box
  if(C.hover&&inB(C.hover.x,C.hover.y)){
    const hx=C.hover.x,hy=C.hover.y;
    const hu=unitAt(hx,hy);
    const v=getVoxelInfo(hx,hy);
    c.fillStyle='rgba(6,10,16,0.92)';
    c.fillRect(12,H-70,260,56);
    c.strokeStyle='#4fc3f7';c.lineWidth=1;c.strokeRect(12,H-70,260,56);
    c.font='bold 11px monospace';
    if(hu){
      c.fillStyle=hu.side==='player'?'#4ade80':hu.side==='neutral'?'#ffe493':'#f87171';
      c.fillText(`${hu.name} (${hu.x+1}/${hu.y+1} · Z:${v.baseZ.toFixed(1)})`,20,H-52);
      c.fillStyle='#d6e0ec';c.font='10px monospace';
      const w=WEAPONS[hu.weapon];
      c.fillText(`HP ${hu.hp}/${hu.maxHp} · AP ${hu.ap||0} · ${w?w.name:'Zivilist'}`,20,H-36);
      const cov=coverRating(hu);
      c.fillStyle='#8a9ab0';
      c.fillText(cov?`🛡 Deckung Stufe ${cov}`:'Offenes Feld',20,H-22);
    }else{
      const tNames={0:'Offenes Gelände',1:'Leichte Deckung',2:'Schwere Deckung',3:'Gebäude / Struktur',4:'Wasser',5:'Stargate',6:'Trümmer (zerstörbar)',7:'Flusslauf',8:'Siedlungsgebäude',9:'Brücke',10:'Befestigte Straße',11:'Naquadah-Generator',12:'Auto-Geschützturm',13:'Kommando-Bunker'};
      c.fillStyle='#8ad8ff';
      c.fillText(`Feld ${hx+1}/${hy+1} · ${tNames[v.t]||'Gelände'}`,20,H-50);
      c.fillStyle='#8a9ab0';c.font='10px monospace';
      c.fillText(`Voxel-Höhe Z=${v.topZ.toFixed(1)}${v.hp?` · Struktur ${v.hp} HP`:''}`,20,H-32);
    }
  }
  c.restore();
}

// ===================== OFFWORLD BASENBAU (C&C / SimCity Feld-Konstruktion) =====================
function canPlaceOffworld(buildKey,x,y){
  const spec=OFFWORLD_BUILDINGS[buildKey];
  if(!spec||!C.active||C.result||!inB(x,y))return false;
  if(unitAt(x,y))return false;
  const cell=C.map[idx(x,y)];
  if(!cell||(cell.t!==0&&cell.t!==10))return false;
  // Muss in Reichweite (Radius 5) eines eigenen Agenten oder des Gates liegen
  const nearGate=C.gatePos&&C.distance(x,y,C.gatePos.x,C.gatePos.y)<=6;
  const nearUnit=Object.values(C.units).some(u=>u.side==='player'&&!u.dead&&!u.downed&&C.distance(x,y,u.x,u.y)<=4);
  if(!nearGate&&!nearUnit)return false;
  for(const k in spec.cost)if((S.res[k]||0)<spec.cost[k])return false;
  return true;
}

function placeOffworldBuilding(buildKey,x,y){
  const spec=OFFWORLD_BUILDINGS[buildKey];
  if(!canPlaceOffworld(buildKey,x,y))return {ok:false,msg:'Hier nicht baubar (freies Feld nahe Team/Gate + Ressourcen nötig).'};
  for(const k in spec.cost)S.res[k]-=spec.cost[k];
  C.map[idx(x,y)]={t:spec.type,hp:spec.hp};
  if(!C.buildings)C.buildings=[];
  C.buildings.push({type:buildKey,tileType:spec.type,x,y,hp:spec.hp});
  C.mapVersion++;C.tileCache={};
  if(typeof sfx==='function')sfx('build');
  clog(`🏗 Offworld-Bau errichtet: ${spec.icon} ${spec.name} bei ${x+1}/${y+1}.`);
  C.buildType=null;
  save();
  return {ok:true,msg:`${spec.name} errichtet!`};
}

// Feuert alle gebauten Auto-Geschütztürme (t===12) und triggert Reaktor-Heilung (t===11) am Rundenende
function tickOffworldStructures(){
  if(!C.active||C.result)return;
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
    const cell=C.map[idx(x,y)];
    if(!cell)continue;
    if(cell.t===12){
      // Geschützturm sucht nächsten sichtbaren Feind in Reichweite 5
      const enemies=Object.values(C.units).filter(u=>u.side==='enemy'&&!u.dead&&C.distance(x,y,u.x,u.y)<=5&&los(x,y,u.x,u.y));
      enemies.sort((a,b)=>C.distance(x,y,a.x,a.y)-C.distance(x,y,b.x,b.y));
      if(enemies[0]){
        const target=enemies[0],dmg=rnd(8,12);
        target.hp-=dmg;
        spawnTrace(x,y,target.x,target.y);
        spawnDamage(target.x,target.y,dmg,'#4fc3f7');
        if(typeof sfx==='function')sfx('turret');
        clog(`🗼 Geschützturm (${x+1}/${y+1}) → ${target.name}: ${dmg} Schaden`);
        if(target.hp<=0){target.hp=0;killUnit(target);}
      }
    }else if(cell.t===11){
      // Naquadah-Generator regeneriert +4 HP bei eigenen Einheiten im Radius 3
      Object.values(C.units).forEach(u=>{
        if(u.side==='player'&&!u.dead&&!u.downed&&u.hp<u.maxHp&&C.distance(x,y,u.x,u.y)<=3){
          u.hp=Math.min(u.maxHp,u.hp+4);
        }
      });
    }
  }
}

// ===================== ASCII-MODUS FÜR BASIS & STERNENKARTE =====================
function renderBaseAscii(cv){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height;
  c.fillStyle='#04080e';c.fillRect(0,0,W,H);
  c.font='bold 10px "Consolas","Courier New",monospace';
  c.textAlign='left';
  c.fillStyle='#4fc3f7';
  c.fillText('╔══════════════════════════════════════════════════════════════════════════╗',12,18);
  c.fillText('║ CHEYENNE MOUNTAIN COMPLEX · ASCII TERMINAL VIEW (asciiid / CP437 MODE)  ║',12,32);
  c.fillText('╚══════════════════════════════════════════════════════════════════════════╝',12,46);
  c.fillStyle='#8ad8ff';
  c.fillText('  /\\  /\\    [NORAD SURFACE ACCESS]   ══╦══   [LIFT: ACTIVE]',12,68);
  c.fillText(' /  \\/  \\══════════════════════════════╬════════════════════════════════════',12,82);

  for(let y=0;y<BASE_LEVELS;y++){
    const level=y+1,screenY=GRID_Y+y*CH;
    const info=BASE_LEVEL_INFO[level]||['SECTOR','white'];
    c.fillStyle='#526879';
    c.fillText(`L${String(level).padStart(2,'0')} ${info[0].slice(0,10).padEnd(10,' ')}│`,6,screenY+18);
    for(let x=0;x<BASE_COLS;x++){
      const bx=GRID_X+x*CW;
      const gridY=BASE_LEVELS-1-y;
      const rid=S.base.grid[gridY*BASE_COLS+x];
      if(rid){
        const r=S.base.rooms[rid];
        const tag=(ROOMS[r.type]&&ROOMS[r.type].name||r.type).slice(0,6).toUpperCase().padEnd(6,'═');
        c.fillStyle=B.selRoom===rid?'#ffd166':(r.type==='gate'?'#4fc3f7':'#4ade80');
        c.fillText(`[${tag}]`,bx+2,screenY+18);
      }else{
        c.fillStyle='#243648';
        c.fillText(' ····· ',bx+2,screenY+18);
      }
    }
    c.fillStyle='#75e2e6';
    c.fillText('║▲▼║',ELEV_X+4,screenY+18);
  }
}

// ===================== PERSISTENTER OFFWORLD KOLONIEBAU (Civ / SimCity Layer) =====================
const COLONY_ISO={
  lastHitMap:[],
  hover:null,
};

function renderColonyCanvas(cv,planetId){
  if(!cv)return;
  const c=cv.getContext('2d'),W=cv.width,H=cv.height;
  const now=performance.now();
  const col=(typeof S!=='undefined'&&S&&S.colonies&&S.colonies[planetId]);
  const p=(typeof PLANETS!=='undefined'&&PLANETS[planetId])||{name:planetId,type:'neutral'};
  const mode=(typeof S!=='undefined'&&S&&S.gfxMode)||'pixel';

  ISO.beatPulse=Math.max(0,(ISO.beatPulse||0)*0.92);
  const pulse=(typeof S!=='undefined'&&S&&S.audioDance!==false)?(ISO.beatPulse||0):0;

  if(mode==='ascii'){
    renderColonyAscii(c,W,H,col,p,now,pulse);
  }else{
    renderColonyPixel(c,W,H,col,p,now,pulse);
  }
}

function renderColonyPixel(c,W,H,col,p,now,pulse){
  const bg=c.createLinearGradient(0,0,0,H);
  if(p.type==='hostile'){bg.addColorStop(0,'#1a1008');bg.addColorStop(1,'#362215');}
  else if(p.type==='space'){bg.addColorStop(0,'#060810');bg.addColorStop(1,'#141a2c');}
  else{bg.addColorStop(0,'#0d1720');bg.addColorStop(1,'#1b2d3e');}
  c.fillStyle=bg;c.fillRect(0,0,W,H);

  c.save();
  if(pulse>0.01){
    const bounceY=Math.sin(now*0.016)*pulse*2.2;
    c.translate(0,bounceY);
  }

  const gridW=col?col.gridW:6,gridH=col?col.gridH:5;
  const tw=76,th=38,tz=16;
  const ox=W*0.5,oy=H*0.28;

  COLONY_ISO.lastHitMap=[];

  for(let y=0;y<gridH;y++){
    for(let x=0;x<gridW;x++){
      const sx=ox+(x-y)*(tw*0.5);
      const sy=oy+(x+y)*(th*0.5);
      const s=col&&col.sectors?col.sectors.find(sec=>sec.x===x&&sec.y===y):null;
      const bType=s?s.building:null;
      const isSel=typeof COLONY_UI!=='undefined'&&COLONY_UI&&COLONY_UI.selX===x&&COLONY_UI.selY===y;

      COLONY_ISO.lastHitMap.push({x,y,sx,sy});

      const isAlt=((x+y)&1)===0;
      let topCol=isAlt?'#2a3a4c':'#223040';
      if(p.type==='hostile')topCol=isAlt?'#543a28':'#442d1d';
      drawIsoPrism(c,sx,sy+tz,tw,th,tz,topCol,'rgba(0,0,0,0.3)','rgba(0,0,0,0.45)','rgba(255,255,255,0.08)');

      if(bType==='gate'){
        const gRad=tw*0.36;
        c.strokeStyle='#e8b040';c.lineWidth=4;
        c.beginPath();c.ellipse(sx,sy-18,gRad,gRad*0.9,0,0,Math.PI*2);c.stroke();
        c.fillStyle='rgba(79,195,247,0.45)';
        c.beginPath();c.ellipse(sx,sy-18,gRad*0.78,gRad*0.7,0,0,Math.PI*2);c.fill();
        const vortexPhase=(now*0.003)%1;
        c.fillStyle='rgba(255,255,255,0.7)';
        c.beginPath();c.arc(sx+Math.cos(vortexPhase*6.28)*6,sy-18+Math.sin(vortexPhase*6.28)*4,4,0,Math.PI*2);c.fill();
        c.fillStyle='#ff8a1f';
        for(let a=0;a<7;a++){
          const ang=a*(Math.PI/3.5)-Math.PI/2;
          c.fillRect(sx+Math.cos(ang)*gRad-3,sy-18+Math.sin(ang)*gRad*0.9-3,6,6);
        }
      }else if(bType==='mine'){
        drawIsoPrism(c,sx,sy-6,tw*0.5,th*0.5,24,'#8b6e4e','#6b5035','#533e28');
        c.fillStyle='#38bdf8';c.fillRect(sx-3,sy-34,6,6);
        c.strokeStyle='#cbd5e1';c.lineWidth=1.5;
        c.beginPath();c.moveTo(sx,sy-34);c.lineTo(sx,sy);c.stroke();
      }else if(bType==='lab'){
        c.fillStyle='rgba(125,211,252,0.85)';
        c.beginPath();c.arc(sx,sy-12,tw*0.28,Math.PI,0);c.fill();
        c.strokeStyle='#38bdf8';c.lineWidth=2;c.stroke();
        c.fillStyle='#e0f2fe';c.fillRect(sx-2,sy-24,4,4);
      }else if(bType==='reactor'){
        const coreGlow=pulse*0.4;
        drawIsoPrism(c,sx,sy-4,tw*0.55,th*0.55,18,'#0284c7','#0369a1','#075985');
        c.fillStyle=`rgba(56,189,248,${0.6+coreGlow})`;
        c.beginPath();c.arc(sx,sy-14,8+pulse*3,0,Math.PI*2);c.fill();
      }else if(bType==='dome'){
        c.fillStyle='rgba(56,189,248,0.25)';
        c.beginPath();c.ellipse(sx,sy-10,tw*0.48,th*0.9,0,Math.PI,0);c.fill();
        c.strokeStyle='rgba(125,211,252,0.7)';c.lineWidth=2;c.stroke();
      }else if(bType==='hangar'){
        drawIsoPrism(c,sx,sy-2,tw*0.6,th*0.6,12,'#475569','#334155','#1e293b');
        c.fillStyle='#facc15';c.fillRect(sx-10,sy-8,20,3);
      }else if(bType==='gate_defense'){
        c.fillStyle='#b58b4c';c.fillRect(sx-tw*0.3,sy-8,tw*0.6,6);
        c.fillStyle='#e8b040';c.fillRect(sx-3,sy-16,6,8);
      }else if(bType==='hospital'){
        drawIsoPrism(c,sx,sy-4,tw*0.48,th*0.48,16,'#f1f5f9','#cbd5e1','#94a3b8');
        c.fillStyle='#ef4444';
        c.fillRect(sx-6,sy-16,12,3);c.fillRect(sx-1.5,sy-20.5,3,12);
      }else if(bType==='barracks'){
        drawIsoPrism(c,sx,sy-4,tw*0.5,th*0.5,14,'#3f5a36','#2e4228','#1e2b1b');
      }else{
        c.fillStyle='rgba(255,255,255,0.2)';
        c.font='9px monospace';c.textAlign='center';
        c.fillText(`${x},${y}`,sx,sy);
      }

      if(s&&s.lvl>1){
        c.fillStyle='#ffd166';c.font='bold 10px monospace';c.textAlign='center';
        c.fillText('★'.repeat(s.lvl),sx,sy-28);
      }

      if(isSel){
        drawIsoDiamondOverlay(c,sx,sy,tw*0.9,th*0.9,'rgba(255,209,102,0.22)','#ffd166',2.5);
      }
    }
  }

  c.fillStyle='rgba(4,8,14,0.85)';
  c.fillRect(16,16,340,58);
  c.strokeStyle='#e8b040';c.lineWidth=1.5;c.strokeRect(16,16,340,58);
  c.fillStyle='#ffd166';c.font='bold 14px "Segoe UI",sans-serif';c.textAlign='left';
  c.fillText(`🪐 ${p.name.toUpperCase()} · KOLONIE-VOXEL`,26,38);
  c.font='11px "Segoe UI",sans-serif';c.fillStyle='#94a3b8';
  const cStats=col?getColonyStats(col):null;
  c.fillText(col?`Energie: ${cStats.power-cStats.powerUsed>=0?'⚡ +':'⚡ '}${cStats.power-cStats.powerUsed} · Abwehr: 🛡 ${cStats.defense} · Ertrag: ⛏+${cStats.yield.ore} ⚙+${cStats.yield.tech}`:'Außenposten noch nicht gegründet.',26,58);

  c.restore();
}

function renderColonyAscii(c,W,H,col,p,now,pulse){
  c.fillStyle='#04080e';c.fillRect(0,0,W,H);
  c.fillStyle='rgba(18,32,46,0.2)';
  for(let y=0;y<H;y+=4)c.fillRect(0,y,W,1);

  c.font='11px "Consolas","Courier New",monospace';
  c.textAlign='left';
  c.fillStyle='#4fc3f7';
  c.fillText('╔═════════════════════════════════════════════════════════════════════════════════╗',16,20);
  c.fillText(`║ OFFWORLD TELEMETRY & COLONY MATRIX · ${p.name.slice(0,25).padEnd(25,' ')} [ASCII-3D MODE] ║`,16,36);
  c.fillText('╚═════════════════════════════════════════════════════════════════════════════════╝',16,52);

  if(pulse>0.04){
    const bars=Math.min(12,Math.round(pulse*12));
    c.fillStyle='#4ade80';
    c.fillText(`[♫ BEAT ${'█'.repeat(bars)}${'░'.repeat(12-bars)}]`,W-200,36);
  }

  const gridW=col?col.gridW:6,gridH=col?col.gridH:5;
  const cw=130,ch=78;
  const ox=24,oy=72;

  COLONY_ISO.lastHitMap=[];

  for(let y=0;y<gridH;y++){
    for(let x=0;x<gridW;x++){
      const bx=ox+x*(cw+8),by=oy+y*(ch+8);
      const s=col&&col.sectors?col.sectors.find(sec=>sec.x===x&&sec.y===y):null;
      const bType=s?s.building:null;
      const isSel=typeof COLONY_UI!=='undefined'&&COLONY_UI&&COLONY_UI.selX===x&&COLONY_UI.selY===y;

      COLONY_ISO.lastHitMap.push({x,y,sx:bx+cw*0.5,sy:by+ch*0.5,box:true,bx0:bx,bx1:bx+cw,by0:by,by1:by+ch});

      c.fillStyle=isSel?'rgba(255,209,102,0.12)':'rgba(15,23,42,0.85)';
      c.fillRect(bx,by,cw,ch);
      c.strokeStyle=isSel?'#ffd166':bType?'#38bdf8':'#334155';
      c.lineWidth=isSel?2:1;
      c.strokeRect(bx,by,cw,ch);

      if(bType==='gate'){
        const wave=['≋','≈','*','◎'][Math.floor((now/180)%4)];
        c.fillStyle='#ff8a1f';c.fillText('  ╭─▲─╮',bx+8,by+20);
        c.fillStyle='#4fc3f7';c.fillText(`◄${wave}${wave}${wave}►`,bx+20,by+36);
        c.fillStyle='#8fa0b4';c.fillText('╘═GATE═╛',bx+16,by+52);
        c.fillStyle='#4ade80';c.fillText('[STERNENTOR]',bx+8,by+66);
      }else if(bType==='mine'){
        c.fillStyle='#e8b040';c.fillText(`⛏ NAQ-MINE ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#38bdf8';c.fillText(' █▓▒░ [DRILL]',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('+6 Erz/Tag',bx+8,by+62);
      }else if(bType==='lab'){
        c.fillStyle='#7dd3fc';c.fillText(`🔬 FORSCHUNG ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#bae6fd';c.fillText(' (ANTIQUUS)',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('+5 Tech/Tag',bx+8,by+62);
      }else if(bType==='reactor'){
        c.fillStyle='#38bdf8';c.fillText(`⚡ REAKTOR ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#4ade80';c.fillText(' [NAQ-CORE █▓]',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('+12 Energie',bx+8,by+62);
      }else if(bType==='dome'){
        c.fillStyle='#38bdf8';c.fillText(`🛡 KRAFTFELD ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#7dd3fc';c.fillText(' ((SCHILD))',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('Def +30',bx+8,by+62);
      }else if(bType==='hangar'){
        c.fillStyle='#cbd5e1';c.fillText(`🛸 HANGAR ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#facc15';c.fillText(' ═══╤═══ [UAV]',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('Def +15 · +2 Tech',bx+8,by+62);
      }else if(bType==='gate_defense'){
        c.fillStyle='#e8b040';c.fillText(`🧱 ABWEHR ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#fbbf24';c.fillText(' ╔╦═╤ FLAK',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('Def +20',bx+8,by+62);
      }else if(bType==='hospital'){
        c.fillStyle='#f87171';c.fillText(`✚ LAZARETT ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#fca5a5';c.fillText(' [MED-STATION]',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('+2 Med/Tag',bx+8,by+62);
      }else if(bType==='barracks'){
        c.fillStyle='#86efac';c.fillText(`🏕 GARNISON ${'★'.repeat(s.lvl||1)}`,bx+8,by+22);
        c.fillStyle='#4ade80';c.fillText(' /|═ SG-WACHEN',bx+8,by+42);
        c.fillStyle='#94a3b8';c.fillText('Def +15',bx+8,by+62);
      }else{
        c.fillStyle='#475569';
        c.fillText(`· Sektor (${x},${y}) ·`,bx+8,by+26);
        c.fillText('   [LEER]',bx+8,by+46);
      }
    }
  }
}

function colonyPickSector(cv,planetId,mx,my){
  const mode=(typeof S!=='undefined'&&S&&S.gfxMode)||'pixel';
  if(mode==='ascii'){
    const hit=COLONY_ISO.lastHitMap.find(h=>h.box&&mx>=h.bx0&&mx<=h.bx1&&my>=h.by0&&my<=h.by1);
    return hit?{x:hit.x,y:hit.y}:null;
  }
  const tw=76,th=38;
  for(let i=0;i<COLONY_ISO.lastHitMap.length;i++){
    const h=COLONY_ISO.lastHitMap[i];
    if(_pointInDiamond(mx,my,h.sx,h.sy,tw*0.5,th*0.5))return {x:h.x,y:h.y};
  }
  return null;
}

if(typeof window!=='undefined'){
  window.renderColonyCanvas=renderColonyCanvas;
  window.colonyPickSector=colonyPickSector;
  window.COLONY_ISO=COLONY_ISO;
}
