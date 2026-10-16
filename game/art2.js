'use strict';
// ===================== SGC COMMAND v2 – Art Extension (art2.js) =====================
// Prozedurale Grafiken: Rekruten, Feind-Gesichter, Waffen, Raum-Icons, Terrain, Akten.
// Laedt NACH art.js (nutzt shade(), LOOKS). Verwendet ausschliesslich c.fillStyle + c.fillRect
// -> kein Anti-Aliasing, kein drawImage, laeuft in Node mit Mock-Context.
// Interne Helfer tragen das Praefix _a2.

// ---------- interne Helfer ----------
// o = {x,y,s}: Ursprung + Skalierung. Alle Koordinaten sind Sprite-Pixel.
function _a2p(c,o,x,y,w,h,col){c.fillStyle=col;c.fillRect(o.x+x*o.s,o.y+y*o.s,w*o.s,h*o.s);}
// Pixel-Kreis (zeilenweise Spans, hartkantig)
function _a2disc(c,o,cx,cy,r,col){
 for(var dy=-r;dy<=r;dy++){var w=Math.floor(Math.sqrt(r*r-dy*dy+0.25));_a2p(c,o,cx-w,cy+dy,w*2+1,1,col);}}
// Pixel-Ring mit transparentem Loch
function _a2ring(c,o,cx,cy,r0,r1,col){
 for(var dy=-r1;dy<=r1;dy++){
  var wo=Math.floor(Math.sqrt(r1*r1-dy*dy+0.25));
  if(Math.abs(dy)<r0){var wi=Math.floor(Math.sqrt(r0*r0-dy*dy));
   if(wo>wi){_a2p(c,o,cx-wo,cy+dy,wo-wi,1,col);_a2p(c,o,cx+wi+1,cy+dy,wo-wi,1,col);}}
  else _a2p(c,o,cx-wo,cy+dy,wo*2+1,1,col);}}
function _a2ell(c,o,cx,cy,rx,ry,col){
 for(var dy=-ry;dy<=ry;dy++){var w=Math.floor(rx*Math.sqrt(Math.max(0,1-(dy*dy)/(ry*ry+0.01))));_a2p(c,o,cx-w,cy+dy,w*2+1,1,col);}}
// Seeded RNG: Zahl oder String -> uint32 -> mulberry32
function _a2hash(s,salt){
 var h=2166136261>>>0,str=String(s)+'|'+(salt||'');
 for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
 h^=h>>>13;h=Math.imul(h,1274126177)>>>0;h^=h>>>16;return h>>>0;}
function _a2rng(seed,salt){var a=_a2hash(seed,salt);
 return function(){a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function _a2pick(r,arr){return arr[Math.floor(r()*arr.length)];}
// Positions-Rauschen fuer Tiles: gleicher Weltpixel = gleicher Wert -> nahtlos kachelbar
function _a2n(a,b,c){var h=(Math.imul(a,374761393)+Math.imul(b,668265263)+Math.imul(c,1442695041))|0;
 h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}

// ===================== 3.1 Rekruten-Generator =====================
var _A2SKIN=['#f0c8a4','#e8bc98','#e3b48e','#d9a07a','#b8845a','#6b4529'];
var _A2HAIR=['#1a1210','#3a2a1a','#6a4a2a','#a8a8a8','#d8d8d8','#e8c860'];
var _A2STYLES=['short','short','short','bob','long','ponytail','curly','dreads','slick','fringe','messy','bald'];
var _A2FIRST=['Marcus','Dana','Tom','Elena','Jamal','Priya','Lukas','Aiko','Carlos','Fatima','Ben','Nora','Viktor','Grace','Omar','Hannah','Diego','Mei','Isaac','Rosa','Kofi','Lena','Ryan','Zoe','Andre','Tess','Miguel','Ingrid'];
var _A2LAST=['Webb','Ruiz','Okafor','Lindqvist','Tanaka','Novak','Brooks','Haddad','Moreau','Kowalski','Reyes','Fischer','Adeyemi','Sullivan','Petrov','Nakamura','Dubois','Hayes','Romano','Kim','Bauer','Santos','Cole','Larsen','Mbeki','Walsh','Costa','Ivanova'];
var _A2RANKS=['Pvt.','Pvt.','Pvt.','Pvt.','Cpl.','Cpl.','Cpl.','Sgt.','Sgt.','Lt.'];

function genRecruitLook(seed){
 var r=_a2rng(seed,'look'),age=20+Math.floor(r()*36);
 var skin=_a2pick(r,_A2SKIN),style=_a2pick(r,_A2STYLES);
 var hair=_a2pick(r,[_A2HAIR[0],_A2HAIR[0],_A2HAIR[1],_A2HAIR[1],_A2HAIR[2],_A2HAIR[2],_A2HAIR[5]]);
 var g=r(); // Alter -> Grau/Weiss
 if(age>=52){if(g<0.5)hair=_A2HAIR[4];else if(g<0.9)hair=_A2HAIR[3];}
 else if(age>=45){if(g<0.6)hair=_A2HAIR[3];}
 else if(age>=38){if(g<0.25)hair=_A2HAIR[3];}
 var look={skin:skin,hair:hair,style:style,age:age};
 if(r()<0.40){if(r()<0.5)look.beard=true;else look.goatee=true;}
 if(r()<0.15)look.glasses=true;
 if(r()<0.10)look.scar=true;
 return look;}
function genRecruitName(seed){
 var r=_a2rng(seed,'name');
 return _a2pick(r,_A2RANKS)+' '+_a2pick(r,_A2FIRST)+' '+_a2pick(r,_A2LAST);}

// ===================== 3.2 Feind-Gesichter (32x32) =====================
function _a2head(c,o,skin){_a2p(c,o,10,6,12,1,skin);_a2p(c,o,9,7,14,14,skin);_a2p(c,o,10,21,12,1,skin);}
function _a2eyes(c,o,y,white,pupil){
 _a2p(c,o,12,y,3,2,white);_a2p(c,o,18,y,3,2,white);_a2p(c,o,13,y,2,2,pupil);_a2p(c,o,19,y,2,2,pupil);}
function _a2bg(c,o){_a2p(c,o,0,0,32,32,'#14202e');_a2p(c,o,0,0,32,10,'#1b2b3d');}
function drawEnemyFace(c,type,x,y,sc){
 var o={x:x,y:y,s:sc||1},sk,d;
 _a2bg(c,o);
 switch(type){
 case 'jaffa': case 'veteran': case 'elite':{
  var vet=type==='veteran',eli=type==='elite';
  sk=eli?'#b88a58':'#c8a060';d=shade(sk,-28);
  var robe=eli?'#5a2a7a':'#4a3a20',trim=eli?'#9a5ac8':vet?'#e87820':'#8a6a38';
  _a2p(c,o,4,24,24,8,robe);_a2p(c,o,4,24,24,1,trim);_a2p(c,o,11,22,10,3,trim);_a2p(c,o,13,20,6,5,d);
  _a2head(c,o,sk);
  // goldene Stirn-Markierung (Jaffa: Apophis-Symbol; Veteran: orange)
  _a2p(c,o,15,7,2,4,vet?'#e87820':'#e8c040');_a2p(c,o,14,9,4,1,vet?'#e87820':'#e8c040');
  if(eli){_a2p(c,o,11,12,5,1,'#8a3ac0');_a2p(c,o,17,12,5,1,'#8a3ac0');_a2p(c,o,11,15,5,1,'#8a3ac0');_a2p(c,o,17,15,5,1,'#8a3ac0');
   _a2eyes(c,o,13,'#e8e8e8','#b070ff');
   _a2p(c,o,12,11,3,1,'#2a1a30');_a2p(c,o,14,12,1,1,'#2a1a30');_a2p(c,o,18,11,3,1,'#2a1a30');_a2p(c,o,18,12,1,1,'#2a1a30');}
  else{_a2eyes(c,o,13,'#e8e8e8','#1a1a1a');_a2p(c,o,12,11,3,1,vet?'#8a8a8a':'#2a1a10');_a2p(c,o,18,11,3,1,vet?'#8a8a8a':'#2a1a10');}
  if(vet){_a2p(c,o,10,8,4,1,d);_a2p(c,o,18,8,4,1,d);_a2p(c,o,10,10,3,1,d);_a2p(c,o,19,10,3,1,d);_a2p(c,o,11,17,2,1,d);_a2p(c,o,19,17,2,1,d);}
  _a2p(c,o,15,15,2,3,shade(sk,-18));_a2p(c,o,14,19,5,1,shade(sk,-60));
  if(eli)_a2p(c,o,15,20,3,1,shade(sk,-45));
  break;}
 case 'goauld':{
  sk='#8a9a6a';d=shade(sk,-30);
  _a2p(c,o,4,24,24,8,'#3a3050');_a2p(c,o,4,24,24,1,'#e8c040');_a2p(c,o,10,22,12,3,'#e8c040');_a2p(c,o,13,20,6,5,d);
  _a2head(c,o,sk);
  _a2p(c,o,9,7,14,2,shade(sk,-14));_a2p(c,o,12,5,8,1,shade(sk,-14)); // glatte, leicht gewoelbte Stirn
  // schraege goldene Augen mit Schlitzpupille
  _a2p(c,o,10,12,3,1,'#ffd23a');_a2p(c,o,12,13,3,1,'#ffd23a');_a2p(c,o,14,14,1,1,'#ffd23a');
  _a2p(c,o,19,12,3,1,'#ffd23a');_a2p(c,o,17,13,3,1,'#ffd23a');_a2p(c,o,17,14,1,1,'#ffd23a');
  _a2p(c,o,12,13,1,1,'#1a1a1a');_a2p(c,o,19,13,1,1,'#1a1a1a');
  _a2p(c,o,15,16,1,2,d);_a2p(c,o,17,16,1,2,d); // zwei Nasenschlitze
  _a2p(c,o,13,19,7,1,shade(sk,-65));_a2p(c,o,12,18,1,1,shade(sk,-65));_a2p(c,o,20,18,1,1,shade(sk,-65));
  break;}
 case 'repl': case 'drone': case 'queen':{
  var q=type==='queen',dr=type==='drone',m=q?'#505050':'#909090',dk=shade(m,-45),lt=shade(m,30);
  _a2p(c,o,3,24,26,8,dk);_a2p(c,o,3,24,26,2,m);_a2p(c,o,8,27,2,2,lt);_a2p(c,o,22,27,2,2,lt);
  if(dr){_a2p(c,o,11,10,10,12,m);_a2p(c,o,11,10,10,1,lt);_a2p(c,o,10,12,1,8,dk);_a2p(c,o,21,12,1,8,dk);
   _a2p(c,o,15,6,2,4,dk);_a2p(c,o,14,5,4,1,'#ef4444');
   _a2p(c,o,12,13,3,3,'#1a1a1a');_a2p(c,o,17,13,3,3,'#1a1a1a');_a2p(c,o,13,14,2,2,'#ef4444');_a2p(c,o,18,14,2,2,'#ef4444');
   _a2p(c,o,13,19,6,1,dk);_a2p(c,o,16,10,1,12,dk);break;}
  _a2p(c,o,9,6,14,16,m);_a2p(c,o,9,6,14,1,lt);_a2p(c,o,9,6,1,16,lt);_a2p(c,o,22,6,1,16,dk);
  _a2p(c,o,16,6,1,16,dk);_a2p(c,o,9,12,14,1,dk);_a2p(c,o,9,18,14,1,dk); // Naehte
  if(q){ // Kronen-Struktur
   _a2p(c,o,9,3,14,3,lt);_a2p(c,o,9,1,2,2,lt);_a2p(c,o,15,0,2,3,lt);_a2p(c,o,21,1,2,2,lt);_a2p(c,o,12,2,1,1,'#ef4444');_a2p(c,o,19,2,1,1,'#ef4444');
   _a2p(c,o,10,14,3,3,'#1a1a1a');_a2p(c,o,15,10,3,3,'#1a1a1a');_a2p(c,o,19,14,3,3,'#1a1a1a');
   _a2p(c,o,11,15,2,2,'#ff3030');_a2p(c,o,16,11,2,2,'#ff3030');_a2p(c,o,20,15,2,2,'#ff3030');
  }else{
   _a2disc(c,o,16,14,5,'#1a1a1a');_a2disc(c,o,16,14,3,'#ef4444');_a2p(c,o,15,12,2,1,'#ffffff');}
  _a2p(c,o,12,19,8,2,'#1a1a1a');_a2p(c,o,13,19,1,2,m);_a2p(c,o,15,19,1,2,m);_a2p(c,o,17,19,1,2,m);_a2p(c,o,19,19,1,2,m);
  break;}
 default: // unbekannt: Fragezeichen
  _a2p(c,o,12,8,8,3,'#5a6a80');_a2p(c,o,18,11,3,4,'#5a6a80');_a2p(c,o,15,15,3,3,'#5a6a80');_a2p(c,o,15,20,3,3,'#5a6a80');}
}

// ===================== 3.3 Waffen-Sprites (32x16, Seitenansicht nach rechts) =====================
function drawWeapon(c,type,x,y,sc){
 var o={x:x,y:y,s:sc||1};
 switch(type){
 case 'rifle': // P90
  _a2p(c,o,3,5,21,6,'#3a3f46');_a2p(c,o,3,5,21,1,'#5a6068');_a2p(c,o,1,6,3,4,'#2a2e34');
  _a2p(c,o,24,6,6,2,'#22262c');_a2p(c,o,29,5,2,4,'#14161a');_a2p(c,o,8,11,5,4,'#2a2e34');_a2p(c,o,9,11,3,1,'#4a8a5a');
  _a2p(c,o,15,11,3,4,'#22262c');_a2p(c,o,12,3,6,2,'#14161a');_a2p(c,o,19,3,2,2,'#4fc3f7');break;
 case 'shotgun':
  _a2p(c,o,10,5,20,3,'#4a4f56');_a2p(c,o,10,5,20,1,'#6a7078');_a2p(c,o,12,8,14,2,'#3a3f46');_a2p(c,o,28,4,2,2,'#c8c8c8');
  _a2p(c,o,0,6,10,5,'#8a6a38');_a2p(c,o,0,6,10,1,'#aa8a52');_a2p(c,o,1,11,6,2,'#6a4a22');_a2p(c,o,10,9,4,5,'#22262c');_a2p(c,o,16,8,7,3,'#8a6a38');break;
 case 'pistol':
  _a2p(c,o,9,4,15,4,'#2e3238');_a2p(c,o,9,4,15,1,'#5a6068');_a2p(c,o,24,5,5,2,'#1a1c20');
  _a2p(c,o,9,8,5,2,'#22262c');_a2p(c,o,10,10,4,5,'#3a3f46');_a2p(c,o,16,8,3,3,'#22262c');_a2p(c,o,22,3,1,1,'#e8c040');break;
 case 'zat':
  _a2p(c,o,3,7,18,3,'#3a4048');_a2p(c,o,3,7,18,1,'#5a626c');_a2p(c,o,0,6,4,5,'#22262c');
  _a2p(c,o,13,5,5,7,'#1a2a3a');_a2p(c,o,14,6,3,5,'#4fc3f7');_a2p(c,o,15,7,1,3,'#d6f4ff');
  _a2p(c,o,21,3,3,11,'#3a4048');_a2p(c,o,24,3,6,2,'#4fc3f7');_a2p(c,o,24,12,6,2,'#4fc3f7');_a2p(c,o,29,2,2,4,'#a8e4ff');_a2p(c,o,29,11,2,4,'#a8e4ff');
  _a2p(c,o,25,6,4,1,'rgba(79,195,247,0.5)');_a2p(c,o,25,9,4,1,'rgba(79,195,247,0.5)');break;
 case 'staff': case 'staffLong':{
  var lg=type==='staffLong',end=lg?21:18,tip=lg?'#b070ff':'#e8c040',tipL=lg?'#e0c8ff':'#fff0a0';
  _a2p(c,o,0,7,end+2,2,'#4a3a20');_a2p(c,o,0,7,end+2,1,'#6a5430');
  for(var i=3;i<end;i+=6)_a2p(c,o,i,6,1,4,'#2a2010');
  _a2p(c,o,end,5,2,6,'#8a6a38');
  _a2p(c,o,end+2,6,2,4,tip);_a2p(c,o,end+4,4,3,8,tip);_a2p(c,o,end+7,5,2,6,tip);_a2p(c,o,end+9,7,2,2,tip);
  _a2p(c,o,end+5,6,2,4,tipL);_a2p(c,o,end+4,3,3,1,'rgba(255,255,255,0.3)');_a2p(c,o,end+4,12,3,1,'rgba(255,255,255,0.3)');break;}
 case 'chakram':
  _a2ring(c,o,16,8,6,7,'#e8c040');_a2ring(c,o,16,8,5,5,'#b88a20');
  _a2p(c,o,16,1,1,1,'#fff0a0');_a2p(c,o,10,6,1,1,'#fff0a0');_a2p(c,o,22,6,1,1,'#fff0a0');_a2p(c,o,16,14,1,1,'#fff0a0');
  _a2p(c,o,12,3,1,1,'#8a6a10');_a2p(c,o,20,3,1,1,'#8a6a10');_a2p(c,o,12,12,1,1,'#8a6a10');_a2p(c,o,20,12,1,1,'#8a6a10');
  _a2p(c,o,9,8,1,1,'#8a6a10');_a2p(c,o,23,8,1,1,'#8a6a10');break;
 case 'hammer':
  _a2p(c,o,1,7,16,3,'#6a4a22');_a2p(c,o,1,7,16,1,'#8a6a38');_a2p(c,o,0,6,2,5,'#2a2010');
  _a2p(c,o,15,2,15,11,'#6a6a6a');_a2p(c,o,15,2,15,2,'#9a9aa0');_a2p(c,o,15,11,15,2,'#44444a');_a2p(c,o,28,2,2,11,'#50505a');
  _a2p(c,o,17,6,10,2,'#4a4a50');_a2p(c,o,16,4,2,2,'#c8c8d0');break;
 default:
  _a2p(c,o,8,5,16,6,'#5a6a80');}
}
// Bonus: 16x16-Icon fuer Armory-Listen (Waffe halbiert, vertikal zentriert)
function drawWeaponIcon(c,type,x,y){drawWeapon(c,type,x,y+4,0.5);}

// ===================== 3.4 Raum-Icons (32x32) =====================
function drawRoomIcon(c,type,x,y,sc){
 var o={x:x,y:y,s:sc||1},P=function(a,b,w,h,col){_a2p(c,o,a,b,w,h,col);};
 P(0,0,32,32,'#0f1622');P(0,0,32,1,'#243248');P(0,31,32,1,'#243248');P(0,0,1,32,'#243248');P(31,0,1,32,'#243248');
 switch(type){
 case 'gate':{
  _a2ring(c,o,16,16,10,14,'#4fc3f7');_a2ring(c,o,16,16,10,10,'#2a7aa8');_a2disc(c,o,16,16,9,'#0a1a2a');_a2disc(c,o,16,16,6,'#1e5fbf');_a2disc(c,o,16,16,3,'#8ad8ff');
  for(var i=0;i<9;i++){var a=-Math.PI/2+i/9*Math.PI*2,cx=Math.round(16+Math.cos(a)*12.5),cy=Math.round(16+Math.sin(a)*12.5);P(cx-1,cy-1,3,3,'#ff8a1f');}
  break;}
 case 'generator':
  P(6,7,20,20,'#5a626c');P(6,7,20,3,'#8a92a0');P(6,24,20,3,'#3a4048');P(8,12,16,12,'#3a4048');
  P(17,9,3,1,'#e8c040');P(15,10,4,3,'#e8c040');P(13,13,6,3,'#e8c040');P(16,16,5,3,'#e8c040');P(14,19,4,3,'#e8c040');P(13,22,3,2,'#e8c040');
  P(8,28,4,2,'#2a2e34');P(20,28,4,2,'#2a2e34');P(4,12,2,8,'#e8c040');P(26,12,2,8,'#e8c040');break;
 case 'lab':
  P(7,5,6,2,'#8ab8c8');P(8,7,4,15,'#c8e4ee');P(8,14,4,8,'#4ade80');P(9,22,2,1,'#4ade80');P(9,15,1,1,'#d8ffe8');P(10,18,1,1,'#d8ffe8');
  P(5,24,10,2,'#8ab8c8');
  P(17,24,12,3,'#5a626c');P(24,10,3,14,'#7a8290');P(19,8,5,3,'#3a4048');P(18,11,3,8,'#3a4048');P(19,18,4,2,'#8a92a0');P(17,10,2,1,'#c8c8d0');break;
 case 'workshop':
  P(5,6,12,6,'#7a8290');P(5,6,12,1,'#b0b8c4');P(10,12,3,16,'#8a6a38');P(10,12,1,16,'#aa8a52');
  _a2ring(c,o,21,20,4,8,'#c8a050');_a2disc(c,o,21,20,2,'#0f1622');
  for(var k=0;k<8;k++){var ak=k/8*Math.PI*2,gx=Math.round(21+Math.cos(ak)*9),gy=Math.round(20+Math.sin(ak)*9);P(gx-1,gy-1,3,3,'#c8a050');}break;
 case 'barracks':
  P(3,17,20,6,'#4a5a3a');P(3,17,20,2,'#6a7a4a');P(3,15,6,3,'#e8e8e8');P(3,23,2,5,'#5a626c');P(21,23,2,5,'#5a626c');P(3,22,20,1,'#2a3a22');
  P(25,4,5,24,'#5a626c');P(26,5,3,10,'#3a4048');P(26,17,3,10,'#3a4048');P(27,9,1,2,'#c8c8d0');P(27,21,1,2,'#c8c8d0');P(3,8,16,2,'#3a4048');P(5,10,1,5,'#3a4048');P(16,10,1,5,'#3a4048');break;
 case 'medbay':
  P(3,3,26,26,'#c0392b');P(3,3,26,2,'#e05a4a');P(3,27,26,2,'#8a2a20');P(13,7,6,18,'#ffffff');P(7,13,18,6,'#ffffff');P(13,7,6,1,'#d8d8d8');break;
 case 'training':
  _a2disc(c,o,16,16,13,'#e8e8e8');_a2disc(c,o,16,16,10,'#c0392b');_a2disc(c,o,16,16,7,'#e8e8e8');_a2disc(c,o,16,16,4,'#c0392b');_a2disc(c,o,16,16,1,'#e8b040');
  P(17,15,10,1,'#8a6a38');P(26,14,3,3,'#ef4444');P(29,15,1,1,'#ef4444');P(5,6,2,2,'#4a4f56');P(24,24,2,2,'#4a4f56');break;
 case 'armory':
  drawWeapon(c,'rifle',o.x+1*o.s,o.y+3*o.s,o.s*0.9);
  P(4,17,24,11,'#6a4a22');P(4,17,24,2,'#8a6a38');P(4,26,24,2,'#4a3216');P(4,21,24,1,'#4a3216');P(14,20,4,3,'#e8b040');break;
 case 'water':
  P(11,3,2,2,'#4fc3f7');P(10,5,4,2,'#4fc3f7');P(9,7,6,3,'#4fc3f7');P(8,10,8,5,'#4fc3f7');P(9,15,6,3,'#4fc3f7');P(10,18,4,1,'#4fc3f7');P(10,8,1,5,'#a8e4ff');
  P(4,23,24,4,'#5a626c');P(4,23,24,1,'#8a92a0');P(4,26,24,1,'#3a4048');P(12,19,4,4,'#5a626c');P(8,22,2,6,'#7a8290');P(22,22,2,6,'#7a8290');break;
 case 'storage':
  P(3,17,12,12,'#8a6238');P(3,17,12,2,'#aa8250');P(3,17,2,12,'#6a4a22');P(15,17,12,12,'#9a7242');P(15,17,12,2,'#bc9462');P(7,22,4,1,'#4a3216');P(19,22,4,1,'#4a3216');
  P(9,5,12,12,'#8a6238');P(9,5,12,2,'#aa8250');P(9,5,2,12,'#6a4a22');P(13,10,4,1,'#4a3216');P(3,27,24,2,'#3a2810');break;
 case 'canteen':
  _a2disc(c,o,13,17,10,'#d8dce0');_a2disc(c,o,13,17,7,'#f2f4f6');_a2disc(c,o,13,17,3,'#e8d8a0');
  P(26,6,1,8,'#c8c8d0');P(28,6,1,8,'#c8c8d0');P(30,6,1,8,'#c8c8d0');P(26,13,5,2,'#c8c8d0');P(27,15,3,13,'#c8c8d0');break;
 default:
  P(12,8,8,3,'#5a6a80');P(18,11,3,5,'#5a6a80');P(14,16,5,3,'#5a6a80');P(14,22,4,3,'#5a6a80');}
}

// ===================== 3.5 Terrain-Tiles (48x48, nahtlos kachelbar) =====================
// Rauschen haengt an Weltkoordinaten (x,y = Pixelposition des Tiles, Vielfache von 2),
// Muster-Perioden (8/12/16/24) teilen 48 -> Raender passen immer zusammen.
var _A2TH={
 desert:{i:0,base:'#c8a060',a:'#b08a48',b:'#d8b878'},
 jungle:{i:1,base:'#2a4a2a',a:'#1f3a1f',b:'#3a6a34'},
 city:  {i:2,base:'#3a3a3a',a:'#2e2e2e',b:'#4a4a4a'},
 sgc:   {i:3,base:'#2a3040',a:'#222838',b:'#364050'}};
function _a2ground(c,o,th,x,y){
 _a2p(c,o,0,0,48,48,th.base);
 var wx=Math.floor(x/2),wy=Math.floor(y/2);
 for(var cy=0;cy<24;cy++)for(var cx=0;cx<24;cx++){
  var n=_a2n(th.i+1,wx+cx,wy+cy);
  if(n<0.16)_a2p(c,o,cx*2,cy*2,2,2,th.a);else if(n>0.9)_a2p(c,o,cx*2,cy*2,2,2,th.b);
  else if(th.i===1&&n>0.8)_a2p(c,o,cx*2,cy*2,cx<23?4:2,2,'#35603a');}
 if(th.i===2){ // Risse innerhalb von 12er-Zellen
  var gx=Math.floor(x/12),gy=Math.floor(y/12);
  for(var qy=0;qy<4;qy++)for(var qx=0;qx<4;qx++)if(_a2n(77,gx+qx,gy+qy)<0.22){
   var px0=qx*12+2,py0=qy*12+3+Math.floor(_a2n(78,gx+qx,gy+qy)*4);
   _a2p(c,o,px0,py0,4,1,'#1c1c1c');_a2p(c,o,px0+4,py0+1,3,1,'#1c1c1c');_a2p(c,o,px0+6,py0+2,2,1,'#1c1c1c');}}
 if(th.i===3){ // Metallplatten: Fugen auf der 24er-Teilung + Nieten
  _a2p(c,o,0,0,48,1,'#1a2030');_a2p(c,o,0,0,1,48,'#1a2030');_a2p(c,o,0,24,48,1,'#1a2030');_a2p(c,o,24,0,1,48,'#1a2030');
  var rv=[[3,3],[20,3],[3,20],[20,20],[27,3],[44,3],[27,20],[44,20],[3,27],[20,27],[3,44],[20,44],[27,27],[44,27],[27,44],[44,44]];
  for(var r=0;r<rv.length;r++)_a2p(c,o,rv[r][0],rv[r][1],2,2,'#4a5668');}
}
function _a2water(c,o,th,x,y,base,hi,lo){
 _a2p(c,o,0,0,48,48,base);
 var wx=Math.floor(x/4),wy=Math.floor(y/2);
 for(var cy=0;cy<24;cy++)for(var cx=0;cx<12;cx++){var n=_a2n(th.i+31,wx+cx,wy+cy);
  if(n<0.12)_a2p(c,o,cx*4,cy*2,4,1,lo);else if(n>0.86)_a2p(c,o,cx*4,cy*2,4,1,hi);}}
function _a2gate(c,o){
 _a2p(c,o,0,0,48,48,'#1c2230');_a2p(c,o,0,0,48,1,'#10141c');_a2p(c,o,0,0,1,48,'#10141c');_a2p(c,o,0,24,48,1,'#10141c');_a2p(c,o,24,0,1,48,'#10141c');
 _a2ring(c,o,24,24,16,22,'#3a4452');_a2ring(c,o,24,24,16,17,'#6b7888');_a2ring(c,o,24,24,21,22,'#6b7888');
 _a2disc(c,o,24,24,15,'#2a7ad0');_a2ring(c,o,24,24,10,12,'#5ac0ff');_a2disc(c,o,24,24,7,'#8ad8ff');_a2disc(c,o,24,24,3,'#e0f6ff');
 for(var i=0;i<9;i++){var a=-Math.PI/2+i/9*Math.PI*2,cx=Math.round(24+Math.cos(a)*19),cy=Math.round(24+Math.sin(a)*19);_a2p(c,o,cx-1,cy-1,3,3,'#ff8a1f');}}
function drawTile(c,theme,type,x,y){
 var th=_A2TH[theme]||_A2TH.desert,o={x:x,y:y,s:1},P=function(a,b,w,h,col){_a2p(c,o,a,b,w,h,col);};
 if(type===5){_a2gate(c,o);return;}
 if(type===4&&theme!=='city'){
  if(theme==='desert')_a2water(c,o,th,x,y,'#2a7ac0','#5aa8e0','#1e5fa0');
  else if(theme==='jungle')_a2water(c,o,th,x,y,'#2a6a8a','#4a9ab8','#1e5470');
  else{ // sgc: Kuehlwasser-Becken, Rand nur oben/unten damit seitlich kachelbar
   _a2water(c,o,th,x,y,'#2a8ab8','#8ad8ff','#1e6a90');P(0,0,48,3,'#3a4452');P(0,3,48,1,'#6b7888');P(0,45,48,3,'#3a4452');P(0,44,48,1,'#1a5a7a');
   P(10,16,2,2,'#d6f4ff');P(30,28,2,2,'#d6f4ff');P(38,12,1,1,'#d6f4ff');}
  return;}
 if(type!==3)_a2ground(c,o,th,x,y); // Gebaeude fuellen das ganze Tile, alles andere steht auf Boden
 var t=theme;
 if(t==='desert'){
  if(type===0)return;
  if(type===1){for(var r=0;r<3;r++)for(var k=0;k<3;k++){var bx=8+k*10+(r%2)*5,by=14+r*8;
    if(bx+10>42)continue;P(bx,by,10,7,'#b89458');P(bx,by,10,1,'#d8b878');P(bx,by+6,10,1,'#7a5a28');P(bx+9,by,1,7,'#8a6a38');}
   P(8,38,34,2,'rgba(0,0,0,0.25)');}
  else if(type===2){P(0,8,48,32,'#8a7a5a');
   for(var r2=0;r2<4;r2++){var off=(r2%2)*8,yy=8+r2*8;P(0,yy,48,1,'#5a4a30');
    for(var vx=off;vx<48;vx+=16)P(vx,yy,1,8,'#5a4a30');
    for(var gx=0;gx<48;gx+=8)if(_a2n(5,gx+x,yy+y)<0.3)P(gx+2,yy+3,3,2,'#a8987a');}
   P(0,8,48,2,'#b0a07a');P(0,38,48,2,'#4a3a22');}
  else if(type===3){P(0,0,48,48,'#9a7a48');
   P(2,14,10,34,'#c8aa70');P(2,14,10,2,'#e0c890');P(10,14,2,34,'#9a7a48');P(18,26,12,22,'#c8aa70');P(18,26,12,2,'#e0c890');P(36,8,10,40,'#c8aa70');P(36,8,10,2,'#e0c890');P(44,8,2,40,'#9a7a48');
   P(14,34,4,14,'#7a5a30');P(32,38,4,10,'#7a5a30');P(0,44,48,4,'#7a5a30');
   P(5,22,2,3,'#7a5a30');P(39,18,2,3,'#7a5a30');P(22,34,2,2,'#7a5a30');P(8,42,3,2,'#b08a48');P(26,43,4,2,'#b08a48');}
 }else if(t==='jungle'){
  if(type===0)return;
  if(type===1){_a2disc(c,o,24,28,12,'#4a2e16');_a2disc(c,o,24,26,11,'#5a3a1e');_a2disc(c,o,24,24,9,'#a8804a');_a2ring(c,o,24,24,6,7,'#7a5a30');_a2ring(c,o,24,24,3,4,'#7a5a30');_a2p(c,o,24,24,1,1,'#5a3a1e');P(18,38,12,2,'rgba(0,0,0,0.25)');}
  else if(type===2){_a2disc(c,o,12,28,11,'#14301a');_a2disc(c,o,26,22,14,'#14301a');_a2disc(c,o,36,28,11,'#14301a');_a2disc(c,o,24,34,12,'#14301a');
   _a2disc(c,o,12,26,9,'#1f4a26');_a2disc(c,o,26,20,12,'#1f4a26');_a2disc(c,o,36,26,9,'#1f4a26');_a2disc(c,o,24,32,10,'#1f4a26');
   for(var q=0;q<26;q++){var lx=Math.floor(_a2n(9,q,x)*42)+2,ly=Math.floor(_a2n(10,q,y)*30)+10;P(lx,ly,3,2,q%3?'#3a7a3a':'#5a9a44');}
   P(8,36,32,1,'rgba(0,0,0,0.3)');}
  else if(type===3){P(0,0,48,48,'#5a6a4a');
   for(var r3=0;r3<6;r3++){var o3=(r3%2)*8;P(0,r3*8,48,1,'#3a4a2c');for(var v3=o3;v3<48;v3+=16)P(v3,r3*8,1,8,'#3a4a2c');}
   P(0,0,48,4,'#7a8a66');P(14,18,20,30,'#1a2018');P(16,16,16,3,'#7a8a66');P(18,14,12,3,'#7a8a66');P(20,28,8,2,'#0a0e0a');
   P(10,18,3,30,'#4a5a3a');P(35,18,3,30,'#4a5a3a');
   for(var m=0;m<14;m++){var mx=Math.floor(_a2n(12,m,x)*46),my=Math.floor(_a2n(13,m,y)*40);P(mx,my,4,3,m%2?'#2a5a2a':'#3a7a34');}
   P(16,19,1,12,'#2a5a2a');P(30,19,1,9,'#2a5a2a');P(0,44,48,4,'#3a4a2c');}
 }else if(t==='city'){
  if(type===0)return;
  if(type===1){P(8,14,32,24,'#8a8a8a');P(8,14,32,3,'#b0b0b0');P(8,35,32,3,'#5a5a5a');P(8,14,2,24,'#9a9a9a');P(38,14,2,24,'#6a6a6a');
   P(20,17,1,18,'#6a6a6a');P(8,26,32,1,'#6a6a6a');for(var h=0;h<5;h++)P(12+h*6,30,3,3,'#e8c040');P(8,38,34,2,'rgba(0,0,0,0.3)');}
  else if(type===2){P(0,8,48,32,'#5a5a5a');
   for(var r4=0;r4<8;r4++){var yy4=8+r4*4,o4=(r4%2)*4;for(var bx4=0;bx4<=48;bx4+=8){var cb=_a2n(21,bx4+x,yy4+y)<0.5?'#8a4a3a':'#9a5444',pos=bx4-o4,bw=7;if(pos<0){bw+=pos;pos=0;}if(pos+bw>48)bw=48-pos;if(bw>0)P(pos,yy4+1,bw,3,cb);}}
   P(0,8,48,2,'#b0705a');P(0,38,48,2,'#3a3a3a');}
  else if(type===3){P(0,0,48,48,'#4a5060');P(0,0,48,3,'#6a7080');P(0,44,48,4,'#2a3040');
   for(var wy2=0;wy2<3;wy2++)for(var wx2=0;wx2<3;wx2++){var lit=_a2n(33,wx2+Math.floor(x/48)*3,wy2+Math.floor(y/48)*3)<0.4;
    P(4+wx2*15,6+wy2*13,10,9,'#1a2030');P(5+wx2*15,7+wy2*13,8,7,lit?'#e8c870':'#2a3a50');if(lit)P(5+wx2*15,7+wy2*13,8,2,'#f8e8a0');else P(5+wx2*15,7+wy2*13,3,2,'#4a6a8a');P(4+wx2*15,15+wy2*13,10,1,'#6a7080');}}
  else if(type===4){_a2ell(c,o,24,26,19,10,'#1e3048');_a2ell(c,o,24,25,17,8,'#2a4a6a');_a2ell(c,o,24,24,14,5,'#3a6a8a');P(14,22,8,1,'#a8d8f0');P(30,26,5,1,'#a8d8f0');}
 }else{ // sgc
  if(type===0)return;
  if(type===1){P(8,13,32,25,'#5a6a7a');P(8,13,32,3,'#8a9aaa');P(8,35,32,3,'#3a4654');P(8,13,3,25,'#4a5868');P(37,13,3,25,'#3a4654');
   for(var s=0;s<6;s++)P(12+s*5,23,3,3,s%2?'#1a1a1a':'#e8c040');P(8,28,32,1,'#3a4654');P(8,38,34,2,'rgba(0,0,0,0.3)');}
  else if(type===2){P(0,6,48,36,'#4a5668');P(0,6,48,2,'#7a8aa0');P(0,40,48,2,'#2a3444');
   P(0,8,1,32,'#2a3444');P(24,8,1,32,'#2a3444');P(0,22,48,1,'#2a3444');
   for(var bb=0;bb<4;bb++){P(4+bb*12,12,2,2,'#8a9aaa');P(4+bb*12,28,2,2,'#8a9aaa');}
   for(var hz=0;hz<12;hz++)P(hz*4,34,2,5,hz%2?'#1a1a1a':'#e8c040');}
  else if(type===3){P(0,0,48,48,'#38424f');P(0,0,48,3,'#5a6a7a');P(0,44,48,4,'#242c38');
   P(12,6,24,42,'#242c38');P(14,8,20,40,'#5a6a7a');P(14,8,20,3,'#8a9aaa');P(23,8,1,40,'#3a4654');
   P(17,16,5,3,'#4fc3f7');P(26,16,5,3,'#4fc3f7');P(17,30,5,2,'#3a4654');P(26,30,5,2,'#3a4654');P(21,24,1,5,'#c8c8d0');P(26,24,1,5,'#c8c8d0');
   P(21,2,6,3,'#242c38');P(22,3,2,1,'#4ade80');P(25,3,1,1,'#ef4444');P(2,20,6,10,'#2a3444');P(40,20,6,10,'#2a3444');}
  else if(type===4){}}
}

// ===================== 4.1 Neue LOOKS-Eintraege (handgemacht) =====================
// Erweiterte Felder (siehe drawFace-Patch in art.js): mark kann Farbstring sein, band:true = goldene Kopfbinde.
Object.assign(LOOKS,{
 // Goa'uld-Lords
 "Anubis":{skin:'#5a3a24',hair:'#1a1210',style:'slick',glow:true,band:true},
 "Amonet":{skin:'#c8946a',hair:'#1a1210',style:'long',glow:true,band:true,mark:'#4fc3f7'},
 "Khepra":{skin:'#d0a070',hair:'#3a2a1a',style:'short',glow:true,mark:'#4ade80'},
 "Heru-ur":{skin:'#b8845a',hair:'#a8a8a8',style:'short',glow:true,mark:'#9aa4b0'},
 // Zivilisten
 "Brack":{skin:'#d9a07a',hair:'#a8a8a8',style:'short',beard:true},
 "Skaara":{skin:'#b8845a',hair:'#1a1210',style:'short'},
 "Col. Sumner":{skin:'#e3b48e',hair:'#a8a8a8',style:'short',scar:true},
 "Tollan":{skin:'#f0c8a4',hair:'#e8e8e8',style:'long',beard:true},
 "Möbius-Prinzipal":{skin:'#e8bc98',hair:'#6a4a2a',style:'short',glasses:true},
 // Asgard
 "Thor":{skin:'#7a8a9a',hair:'#c0c8d0',style:'bald',glow:true}
});

// ===================== 4.2 DOSSIERS =====================
function _a2rel(name,rel,trait,quest){return {name:name,rel:rel,trait:trait,quest:quest};}
const DOSSIERS={
 "Jack O'Neill":{file:'SGC-001',relatives:[_a2rel("Sarah O'Neill",'Tochter','Aerztin in Colorado','Sarah wird entfuehrt (Kap. 3)')],trait:"Chekhov's Pencil",bio:'Colonel, Air Force. Hat den Berg gebaut. Trinkt zu viel Kaffee.'},
 "Samantha Carter":{file:'SGC-002',relatives:[_a2rel('Dr. Richard Carter','Vater','Physiker, verstorben','Seine Forschung wird in Kap. 2 gefunden')],trait:'Gate-Genius',bio:'Colonel, Astrophysikerin. Repariert Gates, waehrend sie schiesst.'},
 "Daniel Jackson":{file:'SGC-003',relatives:[_a2rel('Dr. Melburn Jackson','Grossvater','Archaeologe, verschollen','Hinweis auf Abydos-Ausgrabung (Kap. 1)')],trait:'Archaeologe',bio:'Linguist. Spricht 23 Sprachen, versteht keine Formulare.'},
 "Teal'c":{file:'SGC-004',relatives:[_a2rel('Drey\'auc','Ehefrau','Jaffa auf Chulak','Befreiungsmission Chulak (Kap. 4)'),_a2rel('Rya\'c','Sohn','Junger Jaffa-Krieger','Will dem Vater folgen (Kap. 4)')],trait:'Chakram',bio:'Erster Primus von Apophis. Laechelt selten, hebt eine Augenbraue.'},
 "Teyla Emmagan":{file:'SGC-005',relatives:[_a2rel('Charin','Mutter','Heilerin der Athosianer','Epidemie auf Athos (Kap. 3)')],trait:'Ascended-Instinkt',bio:'Anfuehrerin der Athosianer. Heilt mit Kraeutern und Kampfstock.'},
 "Cameron Mitchell":{file:'SGC-006',relatives:[_a2rel('Maj. Dan Mitchell','Bruder','Pilot, Air Force','Wird in Kap. 3 abgeschossen')],trait:'Stoiker',bio:'Lt. Colonel. Meldet sich freiwillig, bevor jemand fragt.'},
 "Vala Mal Doran":{file:'SGC-007',relatives:[_a2rel('Tomin','Ex-Mann','Haendler, unzuverlaessig','Schuldeneintreiber tauchen auf (Kap. 2)')],trait:'Wegwerf-Expertin',bio:'Diebin, Schmugglerin, Gelegenheits-Heldin. Ihr Lebenslauf ist fiktiv.'},
 "Ronon Dex":{file:'SGC-008',relatives:[_a2rel('Unbekannt','Volk','Satedaner, ausgeloescht','Ueberlebende auf Sateda gefunden (Kap. 5)')],trait:'Hammer',bio:'Letzter Satedaner. Bevorzugt Waffen, die man nicht nachladen muss.'},
 "John Sheppard":{file:'SGC-009',relatives:[_a2rel('David Sheppard','Bruder','Anwalt in Boston','Verlangt Akteneinsicht (Kap. 2)')],trait:'Improvisation',bio:'Major. Fliegt alles, was Fluegel oder Triebwerke hat.'},
 "Dr. Beale":{file:'SGC-010',relatives:[_a2rel('Dr. Anne Beale','Schwester','Chirurgin, Denver','Braucht dringend Medizin (Kap. 3)')],trait:'MedBay-Boost',bio:'Chefarzt der Krankenstation. Hat jeden Verbandskasten doppelt.'},
 "Eli Wallace":{file:'SGC-011',relatives:[_a2rel('Mrs. Wallace','Mutter','Lehrerin in Ohio','Will wissen, wo ihr Sohn arbeitet (Kap. 2)')],trait:'Wissenschaftler',bio:'Genie, Gamer, Selbstversorger mit Snacks. Kampfbeitrag: Moralische Unterstuetzung.'},
 "Ba'al":{file:'SGC-012',relatives:[_a2rel('Klone','Selbst','Mehrere','Ein Klon taucht in Kap. 4 auf')],trait:"Goa'uld-Wissen",bio:"Ehemaliger System Lord. Kooperiert, solange der Kaffee warm bleibt."},
 "General Hammond":{file:'SGC-013',relatives:[_a2rel('Kayla Hammond','Enkelin','Studentin in Texas','Besucht den Berg (Kap. 3)')],trait:'Sandwich',bio:'Kommandant des SGC. Sein Schreibtisch hat mehr Stempel als Schubladen.'},
 "Major West":{file:'SGC-014',relatives:[_a2rel('Col. West sen.','Vater','Pensionierter Offizier','Mahnt zur Diplomatie (Kap. 2)')],trait:'Diplomat',bio:'Verhandelt, bevor geschossen wird. Meistens erfolgreich.'},
 "Apophis (Ra)":{file:'SGC-015',relatives:[_a2rel('Amaunet','Ehefrau','Goa\'uld, verschollen','Taucht in Kap. 5 wieder auf')],trait:'Goetter-Charisma',bio:'Selbsternannter Gott. Akte beschlagnahmt, Ego nicht.'}
};
var _A2REL=['Mutter','Vater','Bruder','Schwester','Partner','Partnerin','Cousin','Onkel'];
var _A2REL_FN=['Anna','Paul','Sofia','Jonas','Maya','Leo','Clara','Felix','Nina','Jakob','Eva','Max'];
var _A2PLACE=['Denver','Seattle','Austin','Omaha','Boston','Phoenix','Tulsa','Portland','Atlanta','Duluth','Reno','Dayton'];
var _A2JOB=['Lehrer/in','Krankenpfleger/in','Mechaniker/in','Farmer/in','Polizist/in','Buchhalter/in','Pilot/in','Barkeeper/in'];
var _A2HOOK=['Wird in Kap. %K entfuehrt','Hat einen Bruder in der Armee','Will nach Hause','Braucht dringend Medizin (Kap. %K)','Schuldet jemandem Geld (Kap. %K)','Verschwindet bei einer Gate-Fehlsteuerung (Kap. %K)','Sucht verschollene Familie auf einem Planeten','Wird von einem Goa\'uld bedroht (Kap. %K)'];
var _A2TRAIT=['Zaeher Hund','Nerven aus Stahl','Immer hungrig','Glueckspilz','Schlechter Schlaefer','Treffsicher','Hilfsbereit','Dickkopf','Sarkastisch','Frueher Vogel'];
var _A2BIO=['Meldete sich freiwillig fuers Gate-Programm.','Kam direkt aus der Grundausbildung.','Hat drei Formulare falsch ausgefuellt und trotzdem bestanden.','Ueberlebte den Dschungel-Lehrgang als Einziger trocken.','Kennt jede Kaffeemaschine im Berg beim Vornamen.','Versetzung aus Fort Bragg. Grund: vertraulich.'];
function genDossier(seed){
 var r=_a2rng(seed,'dossier'),n=1+Math.floor(r()*2),rels=[],i,last=genRecruitName(seed).split(' ').pop();
 for(i=0;i<n;i++){
  var rel=_a2pick(r,_A2REL),first=_a2pick(r,_A2REL_FN),k=1+Math.floor(r()*5);
  rels.push(_a2rel(first+' '+last,rel,_a2pick(r,_A2JOB)+' in '+_a2pick(r,_A2PLACE),_a2pick(r,_A2HOOK).replace('%K',k)));}
 return {file:'SGC-'+(100+_a2hash(seed,'file')%900),relatives:rels,trait:_a2pick(r,_A2TRAIT),bio:_a2pick(r,_A2BIO)};}

// ===================== Bonus-Gadgets (wenig Aufwand, viel Nutzen) =====================
// 1) registerRecruit(seed): erzeugt Name+Look+Akte und traegt sie in LOOKS/DOSSIERS ein.
//    Danach funktionieren portrait(m)/drawSoldier(m) mit {name:...} sofort. Ergebnis ist deterministisch.
function registerRecruit(seed,cls){
 var name=genRecruitName(seed),look=genRecruitLook(seed),dos=genDossier(seed);
 LOOKS[name]=look;DOSSIERS[name]=dos;
 return {seed:seed,name:name,cls:cls||'fighter',look:look,dossier:dos,age:look.age};}
// 2) Rang-Abzeichen 12x8 (Pvt./Cpl./Sgt./Lt.) fuer Roster-Karten und Akten
function drawRankBadge(c,rank,x,y,sc){
 var o={x:x,y:y,s:sc||1},g='#e8b040',n={'Pvt.':1,'Cpl.':2,'Sgt.':3,'Lt.':0}[rank];
 _a2p(c,o,0,0,12,8,'#1b2b3d');_a2p(c,o,0,0,12,1,'#243248');
 if(n===0){_a2p(c,o,4,2,4,4,g);_a2p(c,o,5,3,2,2,'#1b2b3d');return;}
 for(var i=0;i<n;i++){var yy=1+i*2;_a2p(c,o,3,yy+2,6,1,g);_a2p(c,o,4,yy+1,4,1,g);_a2p(c,o,5,yy,2,1,g);}}
// 3) Jede Waffe -> Anzeigename + Statuswerte-Platzhalter (fuer Armory-Tooltips)
var _A2WNAME={rifle:'P90',shotgun:'Schrotflinte',pistol:'Pistole',zat:"Zat'nik'tel",staff:'Stabwaffe',staffLong:'Langer Stab',chakram:'Chakram',hammer:'Hammer'};
function weaponName(type){return _A2WNAME[type]||type;}
// 4) Selbsttest (laeuft mit beliebigem Mock-Context, gibt Liste fehlgeschlagener Checks zurueck)
function art2SelfTest(c){
 var bad=[],ok=function(n,v){if(!v)bad.push(n);};
 var a=JSON.stringify(genRecruitLook(7)),b=JSON.stringify(genRecruitLook(7)),d=JSON.stringify(genRecruitLook(8));
 ok('look deterministisch',a===b);ok('look seed 7!=8',a!==d);
 ok('name deterministisch',genRecruitName(7)===genRecruitName(7));
 ok('dossier deterministisch',genDossier(42).relatives[0].name===genDossier(42).relatives[0].name);
 ok('LOOKS>=25',Object.keys(LOOKS).length>=25);ok('DOSSIERS O\'Neill',DOSSIERS["Jack O'Neill"].relatives.length>=1);
 ['jaffa','veteran','elite','goauld','repl','drone','queen'].forEach(function(t){drawEnemyFace(c,t,0,0,1);});
 ['rifle','shotgun','pistol','zat','staff','staffLong','chakram','hammer'].forEach(function(t){drawWeapon(c,t,0,0,1);drawWeaponIcon(c,t,0,0);});
 ['gate','generator','lab','workshop','barracks','medbay','training','armory','water','storage','canteen'].forEach(function(t){drawRoomIcon(c,t,0,0,1);});
 ['desert','jungle','city','sgc'].forEach(function(th){for(var t=0;t<6;t++)drawTile(c,th,t,0,0);});
 return bad;}
