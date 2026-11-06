/* TAGRA Shop layer 3 v1.5 – program screenshots in a MacBook frame (like TRUCKMALL mac-stage) (3. 11. 2026); v1.3 loads the fleet calculator on the homepage; v1.4 loads the version switcher on TAGRA product pages; v1.5 Safari plays the coffee video in the first carousel card (6. 11. 2026) */
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
    var s=document.createElement('script');s.id='tgs-fleet-js';s.src='https://tagra.app/assets/js/shop-fleet.js?v=4';s.async=true;document.head.appendChild(s);
  }
  function variant(){
    if(!document.body||!document.body.classList.contains('type-detail')||window.tgsVariant||document.getElementById('tgs-variant-js'))return;
    var m=document.querySelector('.p-detail meta[itemprop="url"]'),u=m?m.getAttribute('content')||'':'';
    if(!/\/tagra-(1|2|4|6|max)(-download-box-ii-s)?\/$/.test(u))return;
    var s=document.createElement('script');s.id='tgs-variant-js';s.src='https://tagra.app/assets/js/shop-variant.js?v=1';document.head.appendChild(s);
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
  function run(){imgs();gallery();zoom();topsellers();fleet();variant();if(document.body&&document.body.classList.contains('type-index'))vfix();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
