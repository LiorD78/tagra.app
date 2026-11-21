/* TAGRA Shop layer 3 v1.14 (21. 11. 2026: loads shop-schema.js v1 – Organization JSON-LD on every page, brand/mpn/return policy microdata + category root on product pages) | v1.13 (21. 11. 2026: contact page laid out as cards – sales/support + company details side by side, company table with left-aligned one-line labels, return address as a note, smaller cards for CZ/SK, Hungary, authorities; wider content on that page; empty Shoptet "Discussion" hidden under all info pages) | v1.12 (21. 11. 2026: language switcher – Shoptet's fixed language name "Język polski" shown as "Polski", like the other one-word names Deutsch/English/Magyar/Español) | v1.11 (13. 11. 2026: loads shop-video.js v1 on product pages – DOWNLOAD BOX II S video instead of the still) | v1.10 (10. 11. 2026: loads shop-ai.js v1 – AI assistant in TAGRA III block on the homepage and TAGRA 1/2/4/6/MAX product pages) | v1.9 (9. 11. 2026: loads shop-dev.js v1 on every page – nav: green field only on the current item; Download devices: featured DOWNLOAD BOX II S, comparison, reviews, DKV LIVE callout) | v1.8 (8. 11. 2026: loads shop-cro.js v1 on every page – sticky buy bar, quote, add-to-cart panel, cart note, 404/search; fleet calculator v1.8, switcher v1.2) | v1.7 (7. 11. 2026: version switcher also on TAGRA TRUCKER / TRUCKER 2, fleet calculator v1.5) | v1.6 (7. 11. 2026: animovany robot v paticce) | v1.5 – program screenshots in a MacBook frame (like TRUCKMALL mac-stage) (3. 11. 2026); v1.3 loads the fleet calculator on the homepage; v1.4 loads the version switcher on TAGRA product pages; v1.5 Safari plays the coffee video in the first carousel card (6. 11. 2026) */
(function(){
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://tagra.app/assets/css/shop3.css?v=2';document.head.appendChild(l);
  var MB='https://wuswoaicjtuodzmrjwgf.supabase.co/storage/v1/object/public/site/tagra-shop/mac/tagra3-mac-';
  var RX=/tagra3-(driver-evaluation|company-report|work-report|infringements|evaluation|overview|driver)\b/;
  function name(u){u=u||'';if(/tagra-mac4-vyhodnoceni/.test(u))return 'evaluation';var m=u.match(RX);return m?m[1]:null;}
  function src(n,w){return MB+n+'-'+w+'.webp';}
  function imgs(){
    [].forEach.call(document.querySelectorAll('#description img, .tgs-p img'),function(i){
      if(i.classList.contains('tgs-mac'))return;
      var n=name(i.getAttribute('src'));if(!n)return;
      i.src=src(n,1600);i.srcset=src(n,800)+' 800w, '+src(n,1600)+' 1600w';i.sizes='(max-width: 767px) 100vw, 900px';
      i.width=1600;i.height=1407;i.classList.add('tgs-mac');
      var p=i.parentElement;if(p&&p.classList.contains('tgs-sec--hero')){var w=document.createElement('div');w.className='tgs-mac-stage';p.insertBefore(w,i);w.appendChild(i);}
    });
  }
  function gallery(){
    [].forEach.call(document.querySelectorAll('.p-image a, .p-thumbnails a, a.p-thumbnail, a.cbox-gal, a.p-main-image'),function(a){
      var n=name(a.getAttribute('href'));if(!n)return;
      a.setAttribute('href',src(n,1600));if(a.dataset&&a.dataset.href)a.dataset.href=src(n,1600);
      var i=a.querySelector('img');if(i){i.src=src(n,a.classList.contains('p-thumbnail')?800:1600);i.removeAttribute('srcset');i.classList.add('tgs-mac-th');}
    });
  }
  function zoom(){
    var st=document.querySelector('.tgs-mac-stage img');if(!st||!('requestAnimationFrame' in window))return;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var tick=false;
    function upd(){var r=st.getBoundingClientRect(),h=innerHeight,c=r.top+r.height/2,d=Math.abs(h/2-c),p=1-d/(h*0.65);if(p<0)p=0;var e=Math.sin(p*Math.PI/2),mx=innerWidth<768?1.04:1.08;st.style.transform='scale('+(1+e*(mx-1)).toFixed(3)+')';tick=false;}
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});
    addEventListener('resize',upd,{passive:true});setTimeout(upd,150);
  }
  function topsellers(){
    var t=document.getElementById('productsTop');if(!t||!/download-devices/.test(location.pathname))return;
    function nm(c){return ((c.querySelector('.name')||{}).textContent||'').replace(/\s+/g,' ').trim().toUpperCase();}
    function rank(c){var n=nm(c);if(n==='DOWNLOAD BOX II S')return 0;if(/DOWNLOAD BOX II S/.test(n))return 1;if(/STATION/.test(n))return 9;return 5;}
    var it=[].slice.call(t.children).filter(function(c){return c.classList.contains('product');});
    it.sort(function(a,b){return rank(a)-rank(b);});
    it.forEach(function(c){t.appendChild(c);var on=rank(c)<9;c.classList.toggle('active',on);c.classList.toggle('inactive',!on);c.setAttribute('aria-hidden',on?'false':'true');});
  }
  function fleet(){
    if(!document.body||!document.body.classList.contains('type-index')||window.tgsFleetCalc||document.getElementById('tgs-fleet-js'))return;
    var s=document.createElement('script');s.id='tgs-fleet-js';s.src='https://tagra.app/assets/js/shop-fleet.js?v=11';s.async=true;document.head.appendChild(s);
  }
  function variant(){
    if(!document.body||!document.body.classList.contains('type-detail')||window.tgsVariant||document.getElementById('tgs-variant-js'))return;
    var m=document.querySelector('.p-detail meta[itemprop="url"]'),u=m?m.getAttribute('content')||'':'';
    if(!/\/tagra-((1|2|4|6|max)(-download-box-ii-s)?|trucker(-2)?)\/$/.test(u))return;
    var s=document.createElement('script');s.id='tgs-variant-js';s.src='https://tagra.app/assets/js/shop-variant.js?v=5';document.head.appendChild(s);
  }
  function vfix(){
    /* first homepage card: WebM with Vorbis audio does not play in Safari -> drop that source so Safari takes the MP4 */
    var n=0;(function go(){
      var s=document.querySelector('.tgs-car__item video source[src*="DBIIS-kancelar.webm"]');
      if(!s){if(++n<25)setTimeout(go,200);return;}
      var v=s.parentNode;if(!v.canPlayType||v.canPlayType('video/webm; codecs="vp8, vorbis"'))return;
      s.parentNode.removeChild(s);v.load();
      var r=v.getBoundingClientRect(),h=window.innerHeight||0;
      if(r.bottom>h*0.25&&r.top<h*0.75){var x=v.play();if(x&&x.catch)x.catch(function(){});}
    })();
  }
  function vid(){
    if(!document.body||!document.body.classList.contains('type-detail')||window.tgsVid||document.getElementById('tgs-vid-js'))return;
    var s=document.createElement('script');s.id='tgs-vid-js';s.src='https://tagra.app/assets/js/shop-video.js?v=1';s.async=true;document.head.appendChild(s);
  }
  function cro(){if(window.tgsCro||document.getElementById('tgs-cro-js'))return;var s=document.createElement('script');s.id='tgs-cro-js';s.src='https://tagra.app/assets/js/shop-cro.js?v=2';s.async=true;document.head.appendChild(s);}
  function robot(){if(document.getElementById('tm-robot-js'))return;var s=document.createElement('script');s.id='tm-robot-js';s.src='https://tagra.app/assets/js/tm-robot.js?v=1';s.async=true;document.head.appendChild(s);}
  function dev(){
    if(window.tgsDev||document.getElementById('tgs-dev-js'))return;
    var s=document.createElement('script');s.id='tgs-dev-js';s.src='https://tagra.app/assets/js/shop-dev.js?v=2';s.async=true;document.head.appendChild(s);
  }
  function ai(){
    if(window.tgsAi||document.getElementById('tgs-ai-js'))return;
    var s=document.createElement('script');s.id='tgs-ai-js';s.src='https://tagra.app/assets/js/shop-ai.js?v=2';s.async=true;document.head.appendChild(s);
  }
  function schema(){
    if(window.tgsSchema||document.getElementById('tgs-schema-js'))return;
    var s=document.createElement('script');s.id='tgs-schema-js';s.src='https://tagra.app/assets/js/shop-schema.js?v=1';s.async=true;document.head.appendChild(s);
  }
  /* v1.12: Shoptet has a fixed, non-editable language name "Język polski"; show one word like the other languages */
  var LANG_NAMES={'Język polski':'Polski'};
  function langs(){
    [].forEach.call(document.querySelectorAll('.languagesMenu__list__name, .languagesMenu a, .languagesMenu span, [class*="language"] a, [class*="language"] span, [class*="language"] option'),function(e){
      if(e.children.length)return;
      var t=(e.textContent||'').trim();
      if(LANG_NAMES.hasOwnProperty(t))e.textContent=LANG_NAMES[t];
      if(e.getAttribute&&LANG_NAMES.hasOwnProperty(e.getAttribute('title')||''))e.setAttribute('title',LANG_NAMES[e.getAttribute('title')]);
    });
  }
  /* v1.13: info pages – hide Shoptet's empty "Discussion" block; contact page laid out as cards (works in every language, uses the page's own h2/ul/table/p) */
  var CT_CSS='.content-inner.tgs-info>h2,.content-inner.tgs-info>.discussionContainer{display:none!important}'
    +'.content-inner.tgs-ct-wide{max-width:1178px}'
    +'.tgs-ct>p:first-child{font-size:18px;line-height:1.55;color:#33475b;max-width:820px}'
    +'.tgs-ct-grid{display:grid;gap:20px;margin:26px 0}.tgs-ct-grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}.tgs-ct-grid--3{grid-template-columns:repeat(3,minmax(0,1fr));align-items:start}'
    +'.tgs-ct-card{background:#fff;border:1px solid #e3ecf3;border-radius:20px;padding:24px 26px;box-shadow:0 10px 28px rgba(16,42,80,.07)}'
    +'.tgs-ct-card h2{font-size:22px!important;line-height:1.2!important;margin:0 0 16px!important}'
    +'.tgs-ct-card ul{margin:0;padding-left:20px}.tgs-ct-card li{margin:4px 0}.tgs-ct-card p{margin:12px 0 0;font-size:15px;line-height:1.55;color:#4b5b70}'
    +'.tgs-ct-card table{width:100%;border-collapse:collapse;margin:0}'
    +'.tgs-ct-card th{text-align:left;font-weight:600;color:#4b5b70;font-size:14px;white-space:nowrap;padding:9px 18px 9px 0;vertical-align:top;width:1%}'
    +'.tgs-ct-card td{padding:9px 0;color:#123a6b;font-size:15px}.tgs-ct-card tr+tr th,.tgs-ct-card tr+tr td{border-top:1px solid #edf2f7}'
    +'.tgs-ct-card .tgs-ct-note{margin-top:16px;padding:12px 14px;background:#f5f9fc;border-radius:12px;font-size:14px;color:#33475b}'
    +'.tgs-ct-card--sm h2{font-size:18px!important}.tgs-ct-card .tgs-ct-more{font-size:14px}'
    +'@media (max-width:900px){.tgs-ct-grid--3{grid-template-columns:1fr}}'
    +'@media (max-width:767px){.tgs-ct-grid--2{grid-template-columns:1fr}.tgs-ct-card{padding:20px}.tgs-ct-card th,.tgs-ct-card td{display:block;width:auto;white-space:normal;padding:0}.tgs-ct-card th{padding-top:10px}.tgs-ct-card td{padding-bottom:10px}.tgs-ct-card tr+tr td{border-top:0}.tgs-ct-card tr+tr th{border-top:1px solid #edf2f7}}';
  function info(){
    var art=document.querySelector('article.pageArticleDetail');if(!art)return;
    var ci=art.closest('.content-inner');
    if(!document.getElementById('tgs-ct-css')){var st=document.createElement('style');st.id='tgs-ct-css';st.textContent=CT_CSS;document.head.appendChild(st);}
    if(ci)ci.classList.add('tgs-info');
    if(!/\/(contact|contacto|kontakt|kapcsolat)\/?$/.test(location.pathname))return;
    var h2s=art.querySelectorAll('h2');if(h2s.length<2)return;
    var box=h2s[0].parentElement;if(box.classList.contains('tgs-ct'))return;
    box.classList.add('tgs-ct');if(ci)ci.classList.add('tgs-ct-wide');
    var cards=[],cur=null;
    [].slice.call(box.children).forEach(function(el){
      if(el.tagName==='H2'){cur=document.createElement('section');cur.className='tgs-ct-card';cards.push(cur);el.parentNode.insertBefore(cur,el);cur.appendChild(el);}
      else if(cur){cur.appendChild(el);}
    });
    cards.forEach(function(c){var t=c.querySelector('table');if(!t)return;var n=t.nextElementSibling;while(n){if(n.tagName==='P')n.classList.add('tgs-ct-note');n=n.nextElementSibling;}});
    var last=cards[cards.length-1];
    if(last){var ps=last.querySelectorAll('p');if(ps.length)ps[ps.length-1].classList.add('tgs-ct-more');}
    if(cards.length>=2){var g1=document.createElement('div');g1.className='tgs-ct-grid tgs-ct-grid--2';cards[0].parentNode.insertBefore(g1,cards[0]);g1.appendChild(cards[0]);g1.appendChild(cards[1]);}
    if(cards.length>2){var g2=document.createElement('div');g2.className='tgs-ct-grid tgs-ct-grid--3';cards[2].parentNode.insertBefore(g2,cards[2]);for(var i=2;i<cards.length;i++){cards[i].classList.add('tgs-ct-card--sm');g2.appendChild(cards[i]);}}
  }
  function run(){langs();info();dev();imgs();gallery();zoom();topsellers();fleet();variant();cro();robot();ai();vid();schema();if(document.body&&document.body.classList.contains('type-index'))vfix();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
