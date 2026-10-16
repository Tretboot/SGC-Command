'use strict';
const fs=require('fs'),vm=require('vm');

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
    width:0, height:0, disabled:false, value:'',
    classList:{add(){},remove(){},toggle(){},contains:()=>false},
    addEventListener(){}, removeEventListener(){},
    querySelectorAll:()=>[],
    getBoundingClientRect:()=>({left:0,top:0,width:960,height:720}),
    getContext:()=>ctx2d(),
    toDataURL:()=>'data:,',
  };
  els[id]=el;
  return el;
}

const loadFns=[];
global.window={addEventListener:(ev,fn)=>{if(ev==='load')loadFns.push(fn);}};
global.document={
  createElement:()=>makeEl('_tmp'+Math.random()),
  getElementById:id=>makeEl(id),
  querySelectorAll:()=>[],
  addEventListener(){},
};
global.localStorage={getItem:()=>null,setItem(){}};
let now=0;
global.performance={now:()=>now};
let rafCb=null;
global.requestAnimationFrame=cb=>{rafCb=cb;};

const files=['sound.js','art.js','art2.js','engine.js','combat.js','base.js','ui.js'];
for(const f of files){
  const src=fs.readFileSync('/mnt/data/sgc-command-v2/game/'+f,'utf8');
  try{
    vm.runInThisContext(src,{filename:f});
    console.log('✔ LOAD',f);
  }catch(e){
    console.log('✘ LOAD',f,'→',e.message);
    console.log(e.stack.split('\n').slice(0,5).join('\n'));
  }
}

for(const fn of loadFns){
  try{ fn(); console.log('✔ init() OK'); }
  catch(e){ console.log('✘ init() →',e.message); console.log(e.stack.split('\n').slice(0,8).join('\n')); }
}

for(let i=0;i<5;i++){
  now+=16;
  const cb=rafCb; rafCb=null;
  if(cb){
    try{ cb(now); }
    catch(e){ console.log('✘ frame',i,'→',e.message); console.log(e.stack.split('\n').slice(0,8).join('\n')); break; }
  }
}
console.log('✔ frame-loop OK');

const bs=els['base-side'];
console.log('base-side innerHTML length:', bs?bs.innerHTML.length:0);
console.log('res header:', els['res']?els['res'].innerHTML:'(leer)');
console.log('round header:', els['round']?els['round'].innerHTML:'(leer)');
console.log('combat-ui display:', els['combat-ui']?els['combat-ui'].style.display:'(fehlen)');
