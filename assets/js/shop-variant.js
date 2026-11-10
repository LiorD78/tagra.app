/* TAGRA Shop – version switcher v1.4 (9. 11. 2026)
   v1.4: HU dictionary (crew GPT + Gemini); on <html lang="hu"> / "de" links get the /hu/ or /de/ prefix and the current page is matched without it (DE switcher was hidden on /de/ pages before).
   v1.3: texts by <html lang> – EN default with unchanged output, DE dictionary from the crew (GPT + Gemini).
   v1.2: "Most popular" pill on TAGRA 4; phone labels "+ DOWNLOAD BOX II S" and "MAX" (were cut off at 390 px);
         events also via gtag send_to GA4 (plain dataLayer objects never reached GA4).
   v1.1: driver row on TAGRA TRUCKER / TAGRA TRUCKER 2 ("How many drivers will use the program?" 1 / 2 drivers),
   same look and the same switch behaviour as the vehicle row; the TAGRA rows below are unchanged.
   v1.0 (6. 11. 2026):
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
  /* i18n: EN strings stay inline (EN = default, byte-identical output); other shop languages override by key */
  var LG=(document.documentElement.getAttribute('lang')||'en').slice(0,2).toLowerCase(),DE=LG==='de',HU=LG==='hu',NL=DE||HU,PFX=HU?'/hu':(DE?'/de':'');
  var I18N={de:{cap1:'1 Fahrzeug',cap2:'2 Fahrzeuge',cap4:'3–4 Fahrzeuge',cap6:'5–6 Fahrzeuge',capmax:'unbegrenzt viele Fahrzeuge',v_d1:'1 Fahrer',v_d2:'2 Fahrer',d1:'1 Fahrer',d2:'2 Fahrer an einem PC',pop:'Am beliebtesten',pop_aria:'(am beliebtesten)',v_aria:'Wählen Sie Ihre TAGRA Version',v_for:'{name} für {cap}',v_withbox:' mit DOWNLOAD BOX II S',v_dev:'Download-Gerät',v_only:'Nur Programm',v_only_aria:'{name} ohne Download-Gerät',v_prog_box:'Programm |+ DOWNLOAD BOX II S',v_bundle:'Bundle · 49 € sparen',v_bundle_aria:'{name} mit DOWNLOAD BOX II S im Bundle',v_aria_tr:'Wählen Sie Ihre TAGRA TRUCKER Version',v_q:'Fahrzeuge mit Fahrtenschreiber?',v_qd:'Wie viele Fahrer nutzen das Programm?'},hu:{cap1:'1 jármű',cap2:'2 jármű',cap4:'3–4 jármű',cap6:'5–6 jármű',capmax:'korlátlan számú jármű',v_d1:'1 sofőr',v_d2:'2 sofőr',d1:'1 sofőr',d2:'2 sofőr, közös számítógép',pop:'Legnépszerűbb',pop_aria:'(legnépszerűbb)',v_aria:'Válassza ki a TAGRA verzióját',v_for:'{name} – {cap}',v_withbox:' + DOWNLOAD BOX II S',v_dev:'Letöltőeszköz',v_only:'Csak program',v_only_aria:'{name} letöltőeszköz nélkül',v_prog_box:'Program |+ DOWNLOAD BOX II S',v_bundle:'csomag · 49 € kedvezmény',v_bundle_aria:'{name} + DOWNLOAD BOX II S csomagban',v_aria_tr:'Válassza ki a TAGRA TRUCKER verzióját',v_q:'Hány tachográfos járműve van?',v_qd:'Hány sofőr használja a programot?'}};
  var I=I18N[LG]||{};
  function tx(k,en){return I.hasOwnProperty(k)?I[k]:en;}
  function tf(k,o){var r=I[k]||'',x;for(x in o)r=r.split('{'+x+'}').join(o[x]);return r;}
  var V=[
    {k:'1',big:'1',name:'TAGRA 1',cap:tx('cap1','1 vehicle'),p:'/tagra-1/',s:'/tagra-1-download-box-ii-s/'},
    {k:'2',big:'2',name:'TAGRA 2',cap:tx('cap2','2 vehicles'),p:'/tagra-2/',s:'/tagra-2-download-box-ii-s/'},
    {k:'4',big:'3–4',name:'TAGRA 4',cap:tx('cap4','3–4 vehicles'),p:'/tagra-4/',s:'/tagra-4-download-box-ii-s/'},
    {k:'6',big:'5–6',name:'TAGRA 6',cap:tx('cap6','5–6 vehicles'),p:'/tagra-6/',s:'/tagra-6-download-box-ii-s/'},
    {k:'max',big:'7+',name:'TAGRA MAX',cap:tx('capmax','unlimited vehicles'),p:'/tagra-max/',s:'/tagra-max-download-box-ii-s/'}
  ];
  var D=[
    {k:'tr1',big:tx('v_d1','1 driver'),name:'TAGRA TRUCKER',cap:tx('d1','1 driver'),p:'/tagra-trucker/'},
    {k:'tr2',big:tx('v_d2','2 drivers'),name:'TAGRA TRUCKER 2',cap:tx('d2','2 drivers sharing one PC'),p:'/tagra-trucker-2/'}
  ];
  var html=document.documentElement;
  function norm(p){p=String(p||'').split(/[?#]/)[0];return p.charAt(p.length-1)==='/'?p:p+'/';}
  var here=norm(location.pathname),hk=NL?here.replace(/^\/(hu|de)(?=\/)/,''):here,cur=null,withKey=false,drv=false;
  V.forEach(function(x){if(x.p===hk){cur=x;withKey=false;}else if(x.s===hk){cur=x;withKey=true;}});
  D.forEach(function(x){if(x.p===hk){cur=x;drv=true;}});
  if(!cur){html.classList.remove('tgs-var-hide');return;}

  function readRec(){var r=null;try{r=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(e){r=null;}
    return (r&&norm(r.to)===here&&Date.now()-r.t<20000)?r:null;}
  function track(ev,o){o=o||{};try{window.dataLayer=window.dataLayer||[];var d={event:ev};for(var k in o)d[k]=o[k];window.dataLayer.push(d);}catch(e){}
    try{if(typeof window.gtag==='function'){var q={send_to:'GA4'};for(var k2 in o)q[k2]=o[k2];window.gtag('event',ev,q);}}catch(e){}}

  /* ---------- markup ---------- */
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  /* text with an optional part hidden on phones: "TAGRA |MAX" -> "MAX", "Program |+ DOWNLOAD BOX II S" -> "+ DOWNLOAD BOX II S" */
  function txt(tag,t){var e=el(tag);var i=t.indexOf('|');if(i<0){e.textContent=t;return e;}
    e.appendChild(el('span','tgs-var__long',t.slice(0,i)));e.appendChild(document.createTextNode(t.slice(i+1)));return e;}
  function opt(isOn,href,big,small,label,pop){
    var o=el(isOn?'span':'a','tgs-var__o'+(isOn?' is-on':''));
    if(isOn)o.setAttribute('aria-current','page');else o.href=href;
    if(label)o.setAttribute('aria-label',label+(pop?(NL?' '+I.pop_aria:' (most popular)'):''));
    if(pop){var p=el('span','tgs-var__pop',tx('pop','Most popular'));p.setAttribute('aria-hidden','true');o.appendChild(p);}
    o.appendChild(txt('b',big));if(small)o.appendChild(txt('small',small));
    return o;
  }
  function build(){
    var w=el('div','tgs-var');w.setAttribute('role','group');w.setAttribute('aria-label',tx('v_aria','Choose your TAGRA version'));
    w.appendChild(el('p','tgs-var__q',tx('v_q','How many vehicles have a tachograph?')));
    var r1=el('div','tgs-var__veh');
    V.forEach(function(x){
      r1.appendChild(opt(x===cur,PFX+(withKey?x.s:x.p),x.big,x.k==='max'?'TAGRA |MAX':x.name,(NL?tf('v_for',{name:x.name,cap:x.cap})+(withKey?I.v_withbox:''):x.name+' for '+x.cap+(withKey?' with DOWNLOAD BOX II S':'')),false));
    });
    w.appendChild(r1);
    w.appendChild(el('p','tgs-var__q',tx('v_dev','Download device')));
    var r2=el('div','tgs-var__key');
    r2.appendChild(opt(!withKey,PFX+cur.p,tx('v_only','Program only'),null,NL?tf('v_only_aria',{name:cur.name}):cur.name+' without a download device'));
    r2.appendChild(opt(withKey,PFX+cur.s,tx('v_prog_box','Program |+ DOWNLOAD BOX II S'),tx('v_bundle','bundle · save €49'),NL?tf('v_bundle_aria',{name:cur.name}):cur.name+' with DOWNLOAD BOX II S in a bundle',true));
    w.appendChild(r2);
    return w;
  }
  function buildDrv(){
    var w=el('div','tgs-var is-drv');w.setAttribute('role','group');w.setAttribute('aria-label',tx('v_aria_tr','Choose your TAGRA TRUCKER version'));
    w.appendChild(el('p','tgs-var__q',tx('v_qd','How many drivers will use the program?')));
    var r=el('div','tgs-var__drv');
    D.forEach(function(x){
      r.appendChild(opt(x===cur,PFX+x.p,x.big,x.name,NL?tf('v_for',{name:x.name,cap:x.cap}):x.name+' for '+x.cap));
    });
    w.appendChild(r);
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
    slot=el('div');slot.id='tgsVarSlot';slot.appendChild(drv?buildDrv():build());
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
