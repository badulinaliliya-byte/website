/* ВИНОТЕРРА — общий скрипт */
(function(){
  "use strict";
  var W = window.WINE || {};

  /* ---------- утилиты ---------- */
  function el(tag, cls, html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
  function esc(s){return (s==null?"":String(s)).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
  function chips(arr, cls){
    if(!arr||!arr.length) return "";
    return '<div class="chips">'+arr.map(function(g){return '<span class="chip '+(cls||"")+'">'+esc(g)+'</span>';}).join("")+'</div>';
  }

  /* ---------- мобильное меню ---------- */
  function initNav(){
    var b=document.querySelector(".burger"), links=document.querySelector(".nav-links");
    if(b&&links){
      b.addEventListener("click",function(){b.classList.toggle("open");links.classList.toggle("open");});
      links.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){b.classList.remove("open");links.classList.remove("open");});});
    }
  }

  /* ---------- ассистент: fab + модалка ---------- */
  function initAssistant(){
    if(document.querySelector(".fab")) return;
    var bot = (document.body.getAttribute("data-img")||"assets/img/")+"assistant_bot.jpg";
    var fab=el("button","fab");
    fab.innerHTML='<span class="dot"></span><img src="'+bot+'" alt="Сомелье-бот"><span class="fab-txt"><b>Сомелье-бот</b><small>Спросить о вине</small></span>';
    document.body.appendChild(fab);

    var modal=el("div","modal");
    modal.innerHTML=''+
      '<div class="modal-bg"></div>'+
      '<div class="modal-card">'+
        '<button class="modal-close" aria-label="Закрыть">✕</button>'+
        '<img src="'+bot+'" alt="Сомелье-бот">'+
        '<span class="badge-soon">Скоро</span>'+
        '<h3>Умный сомелье уже в пути</h3>'+
        '<p>Здесь поселится ИИ-помощник: спросите его о любом вине, регионе, сорте или сочетании с едой — и он подберёт идеальную бутылку для вашего путешествия по вкусу.</p>'+
        '<p style="margin-top:14px;font-weight:600;color:var(--terracotta)">🍷 Появится в следующей версии</p>'+
      '</div>';
    document.body.appendChild(modal);

    function open(){modal.classList.add("open");}
    function close(){modal.classList.remove("open");}
    fab.addEventListener("click",open);
    modal.querySelector(".modal-bg").addEventListener("click",close);
    modal.querySelector(".modal-close").addEventListener("click",close);
    document.addEventListener("keydown",function(e){if(e.key==="Escape")close();});
    document.querySelectorAll("[data-open-assistant]").forEach(function(n){n.addEventListener("click",function(e){e.preventDefault();open();});});
  }

  /* ---------- scroll reveal (с защитой от невидимого контента) ---------- */
  function revealAll(){document.querySelectorAll(".reveal").forEach(function(n){n.classList.add("in");});}
  function initReveal(){
    if(!("IntersectionObserver" in window)){revealAll();return;}
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}});
    },{threshold:.08,rootMargin:"0px 0px -5% 0px"});
    document.querySelectorAll(".reveal:not(.in)").forEach(function(n){io.observe(n);});
    // подстраховка: если что-то осталось скрытым (ошибка IO/вкладка в фоне) — показать через 2.2с
    setTimeout(revealAll,2200);
  }

  /* ---------- аккордеоны ---------- */
  function initAcc(){
    document.querySelectorAll(".acc-head").forEach(function(h){
      h.addEventListener("click",function(){h.parentElement.classList.toggle("open");});
    });
  }

  /* ---------- карточка страны/региона ---------- */
  function placeCard(item, imgBase, imgKey, flagBase){
    var img = imgBase ? (imgBase+(imgKey||item.id)+".jpg") : null;
    var flagFallback = item.emoji ? ' onerror="this.outerHTML=\''+item.emoji+' \'"' : ' onerror="this.style.display=\'none\'"';
    var flag = flagBase ? '<img class="flag" src="'+flagBase+(imgKey||item.id)+'.svg" alt="" loading="lazy"'+flagFallback+'>' : (item.emoji?item.emoji+' ':'');
    var facts = (item.facts||[]).map(function(f){return '<li>'+esc(f)+'</li>';}).join("");
    var c=el("article","card reveal");
    c.setAttribute("data-name",(item.name||"").toLowerCase());
    c.setAttribute("data-search",((item.name||"")+" "+(item.grapes||[]).join(" ")+" "+(item.signature||"")+" "+(item.buy||"")).toLowerCase());
    if(item.continent) c.setAttribute("data-cont",item.continent);
    c.innerHTML =
      (img?'<img class="card-img" loading="lazy" src="'+img+'" alt="'+esc(item.name)+'" onerror="this.style.display=\'none\'">':'')+
      '<div class="card-body">'+
        '<h3>'+flag+esc(item.name)+'</h3>'+
        (item.tagline?'<div class="tagline">'+esc(item.tagline)+'</div>':'')+
        (facts?'<ul style="margin:6px 0 0;padding-left:18px;color:var(--ink-soft);font-size:.94rem;display:flex;flex-direction:column;gap:5px">'+facts+'</ul>':'')+
        (item.signature?'<p style="margin-top:8px"><b style="color:var(--red)">✦ Чем знаменит:</b> '+esc(item.signature)+'</p>':'')+
        (item.buy?'<p><b style="color:var(--terracotta)">🛒 Купить и попробовать:</b> '+esc(item.buy)+'</p>':'')+
        (item.tourism?'<p><b style="color:var(--amber-deep)">📍 Туристу:</b> '+esc(item.tourism)+'</p>':'')+
        chips(item.grapes)+
      '</div>';
    return c;
  }

  /* ---------- рендер сетки с фильтром/поиском ---------- */
  function renderGrid(opts){
    var host=document.getElementById(opts.host); if(!host) return;
    opts.items.forEach(function(it){host.appendChild(placeCard(it,opts.imgBase,opts.imgKey,opts.flagBase));});
    var search=opts.searchId?document.getElementById(opts.searchId):null;
    var empty=opts.emptyId?document.getElementById(opts.emptyId):null;
    var filterCont="all";
    function apply(){
      var q=search?search.value.trim().toLowerCase():"";
      var shown=0;
      host.querySelectorAll(".card").forEach(function(c){
        var okC = filterCont==="all" || c.getAttribute("data-cont")===filterCont;
        var okQ = !q || c.getAttribute("data-search").indexOf(q)>-1;
        var vis = okC&&okQ; c.style.display=vis?"":"none"; if(vis)shown++;
      });
      if(empty) empty.style.display=shown?"none":"block";
    }
    if(search) search.addEventListener("input",apply);
    if(opts.filterBarId){
      var bar=document.getElementById(opts.filterBarId);
      if(bar) bar.querySelectorAll(".filter-btn").forEach(function(btn){
        btn.addEventListener("click",function(){
          bar.querySelectorAll(".filter-btn").forEach(function(b){b.classList.remove("active");});
          btn.classList.add("active"); filterCont=btn.getAttribute("data-cont")||"all"; apply();
        });
      });
    }
    initReveal();
  }

  /* экспорт для страниц */
  window.VT = {el:el, esc:esc, chips:chips, placeCard:placeCard, renderGrid:renderGrid, initReveal:initReveal, data:W};

  document.addEventListener("DOMContentLoaded",function(){
    initNav(); initAssistant(); initAcc(); initReveal();
  });
})();
