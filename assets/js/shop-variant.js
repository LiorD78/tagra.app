/* TAGRA Shop – version switcher v1.0 (6. 11. 2026)
   Product detail of TAGRA 1/2/4/6/MAX and the five "TAGRA X + DOWNLOAD BOX II S" bundles.
   Two rows: number of vehicles (1 / 2 / 3–4 / 5–6 / 7+) and "Program only / Program + DOWNLOAD BOX II S".
   Every option is a real link to the other product URL (separate products, own URLs). On switch the page keeps
   the switcher at the same place on screen: position saved to sessionStorage, restored on the next page,
   neighbour pages prerendered (Speculation Rules), cross-fade via @view-transition in shop.css.
   Styles and the reserved space live in shop.css (loaded in the head), so nothing moves when this renders. */
(function(){
  'use strict';
  if(window.tgsVariant)return;
  window.tgsVariant=true;
  var KEY='tgs-var-nav';
  var V=[
    {k:'1',big:'1',name:'TAGRA 1',cap:'1 vehicle',p:'/tagra-1/',s:'/tagra-1-download-box-ii-s/'},
    {k:'2',big:'2',name:'TAGRA 2',cap:'2 vehicles',p:'/tagra-2/',s:'/tagra-2-download-box-ii-s/'},
    {k:'4',big:'3–4',name:'TAGRA 4',cap:'3–4 vehicles',p:'/tagra-4/',s:'/tagra-4-download-box-ii-s/'},
    {k:'6',big:'5–6',name:'TAGRA 6',cap:'5–6 vehicles',p:'/tagra-6/',s:'/tagra-6-download-box-ii-s/'},
    {k:'max',big:'7+',name:'TAGRA MAX',cap:'unlimited vehicles',p:'/tagra-max/',s:'/tagra-max-download-box-ii-s/'}
  ];
  var html=document.documentElement;
  function norm(p){p=String(p||'').split(/[?#]/)[0];return p.charAt(p.length-1)==='/'?p:p+'/';}
  var here=norm(location.pathname),cur=null,withKey=false;
  V.forEach(function(x){if(x.p===here){cur=x;withKey=false;}else if(x.s===here){cur=x;withKey=true;}});
  if(!cur){html.classList.remove('tgs-var-hide');return;}

  function readRec(){var r=null;try{r=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(e){r=null;}
    return (r&&norm(r.to)===here&&Date.now()-r.t<20000)?r:null;}
  function track(ev,o){try{window.dataLayer=window.dataLayer||[];o=o||{};o.event=ev;window.dataLayer.push(o);}catch(e){}}

  /* ---------- markup ---------- */
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  function opt(isOn,href,big,small,label){
    var o=el(isOn?'span':'a','tgs-var__o'+(isOn?' is-on':''));
    if(isOn)o.setAttribute('aria-current','page');else o.href=href;
    if(label)o.setAttribute('aria-label',label);
    o.appendChild(el('b',null,big));if(small)o.appendChild(el('small',null,small));
    return o;
  }
  function build(){
    var w=el('div','tgs-var');w.setAttribute('role','group');w.setAttribute('aria-label','Choose your TAGRA version');
    w.appendChild(el('p','tgs-var__q','How many vehicles have a tachograph?'));
    var r1=el('div','tgs-var__veh');
    V.forEach(function(x){
      r1.appendChild(opt(x===cur,withKey?x.s:x.p,x.big,x.name,x.name+' for '+x.cap+(withKey?' with DOWNLOAD BOX II S':'')));
    });
    w.appendChild(r1);
    w.appendChild(el('p','tgs-var__q','Download device'));
    var r2=el('div','tgs-var__key');
    r2.appendChild(opt(!withKey,cur.p,'Program only',null,cur.name+' without a download device'));
    r2.appendChild(opt(withKey,cur.s,'Program + DOWNLOAD BOX II S','bundle · save €49',cur.name+' with DOWNLOAD BOX II S in a bundle'));
    w.appendChild(r2);
    return w;
  }

  /* ---------- restore position after a switch ---------- */
  var slot,rec=null,started=false,done=false,ro=null;
  function restore(){
    if(!rec||!slot)return;
    html.classList.add('tgs-var-restoring');
    try{history.scrollRestoration='manual';}catch(e){}
    var y=slot.getBoundingClientRect().top+window.pageYOffset-rec.top;
    window.scrollTo({top:Math.max(0,y),left:0,behavior:'instant'});
  }
  function stop(){done=true;if(ro){ro.disconnect();ro=null;}}
  function show(){requestAnimationFrame(function(){html.classList.remove('tgs-var-hide');});}
  function finish(){
    if(!done)restore();
    setTimeout(function(){try{sessionStorage.removeItem(KEY);}catch(e){}html.classList.remove('tgs-var-restoring');try{history.scrollRestoration='auto';}catch(e){}},900);
  }
  function start(){
    if(started||!slot)return;
    if(!rec)rec=readRec();
    if(!rec){html.classList.remove('tgs-var-hide');return;}
    started=true;restore();show();
    if(window.ResizeObserver){ro=new ResizeObserver(function(){if(!done)restore();});ro.observe(document.body);setTimeout(stop,2500);
      ['touchstart','wheel','keydown','mousedown'].forEach(function(t){window.addEventListener(t,stop,{once:true,passive:true});});}
    if(document.readyState==='complete')requestAnimationFrame(finish);
    track('tgs_variant_arrive',{tgs_to:here});
  }
  window.addEventListener('pagereveal',function(){start();if(started&&!done)restore();});
  document.addEventListener('prerenderingchange',function(){start();if(started&&!done){restore();requestAnimationFrame(finish);}});
  window.addEventListener('load',function(){if(started){if(!done)restore();requestAnimationFrame(finish);}});
  window.addEventListener('pageshow',function(e){if(e.persisted){html.classList.remove('tgs-var-hide','tgs-var-restoring');try{history.scrollRestoration='auto';}catch(err){}}});

  /* ---------- init ---------- */
  function prerender(){
    try{
      if(!(HTMLScriptElement.supports&&HTMLScriptElement.supports('speculationrules')))return;
      var s=document.createElement('script');s.type='speculationrules';
      s.textContent=JSON.stringify({prerender:[{source:'document',where:{selector_matches:'.tgs-var a[href]'},eagerness:'moderate'}]});
      document.head.appendChild(s);
    }catch(e){}
  }
  function init(){
    var info=document.querySelector('.p-detail .p-info-wrapper');if(!info)return false;
    if(document.getElementById('tgsVarSlot'))return true;
    slot=el('div');slot.id='tgsVarSlot';slot.appendChild(build());
    info.insertBefore(slot,info.firstChild);
    html.classList.add('tgs-var-on');
    slot.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;
      a.classList.add('is-going');
      try{sessionStorage.setItem(KEY,JSON.stringify({top:slot.getBoundingClientRect().top,t:Date.now(),to:a.pathname,from:here}));}catch(err){}
      track('tgs_variant_switch',{tgs_from:here,tgs_to:norm(a.pathname)});
    },true);
    prerender();
    if(!document.prerendering)start();
    return true;
  }
  if(!init()){document.addEventListener('DOMContentLoaded',function(){if(!init())html.classList.remove('tgs-var-hide');});}
})();
