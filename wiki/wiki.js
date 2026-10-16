/* ============================================================
   SGC COMMAND – Wiki navigation
   Builds the sidebar, sets active state, injects footer.
   Pure DOM, no framework.
   ============================================================ */
(function(){
  const NAV = [
    { group:"Übersicht", links:[
      { href:"index.html",        ico:"◈", label:"Start / Konzept" },
      { href:"game-loop.html",    ico:"⟳", label:"Game-Loop" },
    ]},
    { group:"Systeme", links:[
      { href:"basis.html",        ico:"▦", label:"Basis-Grid (Shelter)" },
      { href:"kampf.html",        ico:"⊞", label:"Kampf-Grid (Top-Down)" },
      { href:"gate.html",         ico:"◎", label:"Gate-Mechanik (38 Min)" },
      { href:"feinde.html",       ico:"☣", label:"Feind-Typen" },
      { href:"tech-tree.html",    ico:"⚗", label:"Forschung & Tech-Tree" },
      { href:"kapitel.html",      ico:"❖", label:"Kapitel & Missionen" },
      { href:"quests.html",       ico:"❓", label:"Quests & Lore" },
      { href:"art-toolchain.html",ico:"🎨", label:"Art-Toolchain" },
    ]},
    { group:"Charaktere", links:[
      { href:"helden.html",       ico:"★", label:"SG-1 (Helden)" },
      { href:"rekruten.html",     ico:"✚", label:"Rekruten" },
      { href:"char-onell.html",   ico:"›", label:"Jack O'Neill" },
      { href:"char-carter.html",  ico:"›", label:"Samantha Carter" },
      { href:"char-jackson.html", ico:"›", label:"Daniel Jackson" },
      { href:"char-tealc.html",   ico:"›", label:"Teal'c" },
      { href:"char-hammond.html", ico:"›", label:"Gen. Hammond" },
    ]},
  ];

  function build(){
    const sb = document.getElementById('sidebar');
    if(!sb) return;
    const current = (location.pathname.split('/').pop() || 'index.html');
    let html = `<div id="logo">⟨ SGC COMMAND ⟩<small>Projekt-Wiki · v2</small></div>`;
    NAV.forEach(g=>{
      html += `<div class="nav-group"><div class="nav-group-title">${g.group}</div>`;
      g.links.forEach(l=>{
        const active = l.href === current ? ' active' : '';
        html += `<a class="nav-link${active}" href="${l.href}"><span class="ico">${l.ico}</span>${l.label}</a>`;
      });
      html += `</div>`;
    });
    sb.innerHTML = html;

    // Footer cross-links
    const f = document.getElementById('page-footer');
    if(f){
      f.innerHTML = `<span>SGC COMMAND · Projekt-Wiki · <a href="index.html">Zur Startseite</a></span>
        <span>„Der Kaffee ist noch schlecht." — Hammond</span>`;
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();
})();
