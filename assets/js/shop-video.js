/* TAGRA Shop – product description videos v1 (13. 11. 2026), loaded by shop3.js v1.11 on product pages.
   DOWNLOAD BOX II S "coffee" still -> muted looping video (MP4 first – the WebM has Vorbis audio, Safari skips it).
   Poster = the original image (LCP/layout unchanged), plays only while in view, reduced-motion keeps the still. */
(function(){
  'use strict';
  if(window.tgsVid)return;window.tgsVid=true;
  var d=document;
  var VID=[[/download-box-ii-s-kafe/i,['https://cdn.truckmall.cz/data/user-content/DBIIS-office2.mp4','video/mp4'],['https://cdn.truckmall.cz/data/user-content/DBIIS-kancelar.webm','video/webm']]];
  function videos(){
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    [].forEach.call(d.querySelectorAll('#description img, .tgs-p img, .p-detail img.tgs-img, .basic-description img'),function(i){
      if(i.getAttribute('data-tgs-vid'))return;
      var s=i.getAttribute('src')||'',m=null;
      VID.forEach(function(r){if(!m&&r[0].test(s))m=r;});
      if(!m)return;
      i.setAttribute('data-tgs-vid','1');
      var v=d.createElement('video');
      v.className=i.className;v.setAttribute('style',i.getAttribute('style')||'');
      v.muted=true;v.loop=true;v.playsInline=true;
      v.setAttribute('muted','');v.setAttribute('loop','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
      v.setAttribute('preload','none');v.setAttribute('poster',i.currentSrc||s);
      var w=i.getAttribute('width'),h=i.getAttribute('height');if(w)v.setAttribute('width',w);if(h)v.setAttribute('height',h);
      var lab=i.getAttribute('alt');if(lab){v.setAttribute('aria-label',lab);v.setAttribute('title',lab);}
      v.style.display='block';v.style.width=v.style.width||'100%';v.style.objectFit=v.style.objectFit||'cover';
      if(!h){var r=i.getBoundingClientRect();if(r.width&&r.height)v.style.aspectRatio=(r.width/r.height).toFixed(4);}
      [m[1],m[2]].forEach(function(x){var so=d.createElement('source');so.src=x[0];so.type=x[1];v.appendChild(so);});
      i.parentNode.replaceChild(v,i);
      function play(){var p=v.play();if(p&&p.catch)p.catch(function(){});}
      if('IntersectionObserver' in window){
        new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(v.preload==='none'){v.preload='auto';v.load();}play();}else if(!v.paused)v.pause();});},{threshold:0.25}).observe(v);
      }else{v.preload='auto';play();}
    });
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',videos);else videos();
})();
