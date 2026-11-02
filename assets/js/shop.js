/* TAGRA Shop v3.0 – TRUCKMALL look: video carousel, 3D USP, photo tiles, contact strip (2. 11. 2026) */
(function(){
  var TM='https://cdn.truckmall.cz/data/user-content/';
  var TA='https://tagra.app/assets/';
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function isHP(){return document.body.classList.contains('type-index');}

  function carousel(){
    if(!isHP()||document.querySelector('.tgs-car'))return;
    var S=[
      {v:[TM+'DBIIS-kancelar.webm',TM+'DBIIS-office2.mp4'],p:TM+'Download_Box_II_S_kafe.webp',e:'DOWNLOAD BOX II S',t:'Download in seconds. Evaluate over coffee.',c:'Shop download devices',h:'/download-devices/'},
      {v:[TM+'Comp_2.webm',TM+'Comp_2.mp4'],p:TM+'bannery%20HP/01b-vyhodnoceni-dat.webp',e:'TAGRA program',t:'Find infringements before the inspection does.',c:'Choose your TAGRA',h:'/tagra-software/'},
      {v:[TM+'terminy-hero.webm',TM+'terminy-hero.mp4'],p:TM+'DBII_kabina.webp',e:'Vans 2.5–3.5 t',t:'Tachograph duty for vans from July 2026.',c:'Bundles – save €49',h:'/software-device-bundles/'},
      {v:[TA+'video/hero-720.mp4'],p:TA+'img/hero-poster.jpg',e:'Free 30-day trial',t:'Try TAGRA free. No card, no commitment.',c:'Start free trial',h:'https://tagra.app/try/'}
    ];
    var sec=document.createElement('section');sec.className='tgs-car';sec.setAttribute('aria-label','TAGRA Shop highlights');
    var tr='<div class="tgs-car__track">'+S.map(function(s,i){
      var ext=/^https?:/.test(s.h)&&s.h.indexOf('shop.tagra.app')<0;
      return '<a class="tgs-car__item" href="'+s.h+'"'+(ext?' target="_blank" rel="noopener"':'')+' aria-label="'+s.t+' '+s.c+'">'+
        '<img class="tgs-car__poster" src="'+s.p+'" alt="" width="600" height="800" '+(i===0?'fetchpriority="high"':'loading="lazy"')+'>'+
        (RM?'':'<video muted loop playsinline webkit-playsinline preload="'+(i===0?'auto':'metadata')+'" aria-hidden="true">'+s.v.map(function(u){return '<source src="'+u+'" type="video/'+(/\.webm$/.test(u)?'webm':'mp4')+'">';}).join('')+'</video>')+
        '<span class="tgs-car__txt"><span class="tgs-car__eye">'+s.e+'</span><span class="tgs-car__t">'+s.t+'</span></span>'+
        '<span class="tgs-car__cta">'+s.c+'</span></a>';
    }).join('')+'</div>'+
    '<button type="button" class="tgs-car__nav tgs-car__nav--prev" aria-label="Previous">&#8249;</button><button type="button" class="tgs-car__nav tgs-car__nav--next" aria-label="Next">&#8250;</button>'+
    '<div class="tgs-car__dots">'+S.map(function(s,i){return '<button type="button" aria-label="Slide '+(i+1)+'"'+(i===0?' class="on"':'')+'></button>';}).join('')+'</div>';
    sec.innerHTML=tr;
    var slot=document.querySelector('.banners-row .wide-carousel');
    if(slot){slot.appendChild(sec);slot.closest('.banners-row').classList.add('tgs-has-car');}
    else{var c=document.getElementById('content');if(!c)return;c.insertBefore(sec,c.querySelector('.benefitBanner')||c.firstElementChild);}
    var track=sec.querySelector('.tgs-car__track'),items=[].slice.call(track.children),dots=[].slice.call(sec.querySelectorAll('.tgs-car__dots button'));
    function go(i){i=(i+items.length)%items.length;track.scrollTo({left:items[i].offsetLeft-track.offsetLeft,behavior:RM?'auto':'smooth'});}
    function cur(){var x=track.scrollLeft,b=0,d=1e9;items.forEach(function(it,i){var dd=Math.abs(it.offsetLeft-track.offsetLeft-x);if(dd<d){d=dd;b=i;}});return b;}
    sec.querySelector('.tgs-car__nav--prev').onclick=function(){go(cur()-1);};
    sec.querySelector('.tgs-car__nav--next').onclick=function(){go(cur()+1);};
    dots.forEach(function(d,i){d.onclick=function(){go(i);};});
    var t;track.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){var k=cur();dots.forEach(function(d,i){d.classList.toggle('on',i===k);});},80);},{passive:true});
    items.forEach(function(it){
      var v=it.querySelector('video');if(!v)return;v.muted=true;
      v.addEventListener('playing',function(){it.classList.add('playing');});
      var p=function(){var r=v.play();if(r&&r.catch)r.catch(function(){});};
      if('IntersectionObserver' in window){new IntersectionObserver(function(e){e[0].isIntersecting?p():v.pause();},{threshold:.5}).observe(it);}else p();
    });
  }

  function usp(){
    if(!isHP()||document.querySelector('.tgs-usp'))return;
    var U=[['truck-eshop','Official TAGRA shop','Direct from the manufacturer.','https://tagra.app/'],
           ['21-let','21 years of experience','We know. We advise. We solve.','https://tagra.app/'],
           ['jednicka-palec','No. 1 in Czech Republic','Used by Police and Customs.','https://tagra.app/'],
           ['0','0 % VAT for EU companies','Reverse charge with a valid VAT ID.','/how-to-buy/']];
    var d=document.createElement('div');d.className='tgs-usp';d.setAttribute('aria-label','Why buy at TAGRA Shop');
    d.innerHTML=U.map(function(u){
      var ext=u[3].indexOf('http')===0;
      var ico=u[0]==='0'?'<span class="usp-ico usp-ico--css ok"><span class="usp-sph">0%</span><img class="usp-odlesk" src="'+TM+'usp-21-let-3d-odlesk.webp" width="60" height="60" alt="" aria-hidden="true" loading="lazy"></span>'
        :'<span class="usp-ico"><img src="'+TM+'usp-'+u[0]+'-3d-zaklad.webp" width="60" height="60" alt="'+u[1]+'" loading="lazy" decoding="async" onload="this.parentNode.classList.add(\'ok\')"><img class="usp-odlesk" src="'+TM+'usp-'+u[0]+'-3d-odlesk.webp" width="60" height="60" alt="" aria-hidden="true" loading="lazy"></span>';
      return '<a class="usp-item" href="'+u[3]+'"'+(ext?' target="_blank" rel="noopener"':'')+'><span class="usp-img">'+ico+'</span><span class="usp-text"><strong>'+u[1]+'</strong>'+u[2]+'</span></a>';
    }).join('');
    var car=document.querySelector('.tgs-car'),bb=document.querySelector('.benefitBanner.position--benefitHomepage');
    if(bb){bb.parentNode.insertBefore(d,bb);}else if(car){car.parentNode.insertBefore(d,car.nextSibling);}
  }

  function tiles(){
    if(!isHP()||document.querySelector('.tgs-tiles'))return;
    var T=[['/tagra-software/','bannery%20HP/01b-vyhodnoceni-dat.webp','TAGRA tachograph analysis program'],
           ['/download-devices/','bannery%20HP/02b-stahovani-dat.webp','Tachograph data download devices'],
           ['/software-device-bundles/','download-box-ii-s-kancelarske-pouziti.webp','Software + device bundles']];
    var s=document.createElement('section');s.className='tgs-tiles';
    s.innerHTML='<h2 class="tgs-h">Tachograph data download and analysis</h2><div class="tgs-tiles__grid">'+
      T.map(function(t){return '<a class="tgs-tile" href="'+t[0]+'"><img src="'+TM+t[1]+'" alt="'+t[2]+'" width="500" height="400" loading="lazy"><span>'+t[2]+'</span></a>';}).join('')+'</div>';
    var u=document.querySelector('.tgs-usp'),bb=document.querySelector('.benefitBanner.position--benefitHomepage');
    var ref=bb?bb.nextSibling:(u?u.nextSibling:null);
    (bb||u).parentNode.insertBefore(s,ref);
  }

  function contact(){
    if(!isHP()||document.querySelector('.tgs-contact'))return;
    var w=document.querySelector('.welcome-wrapper.homepage-box')||document.querySelector('.welcome-wrapper');if(!w)return;
    var s=document.createElement('div');s.className='tgs-contact';
    s.innerHTML='<div class="container"><a href="tel:+420739005345"><img src="'+TM+'footer/phone.svg" alt="" width="26" height="26">+420 739 005 345</a><a href="mailto:sales@tagra.app"><img src="'+TM+'footer/email.svg" alt="" width="26" height="26">sales@tagra.app</a></div>';
    w.parentNode.insertBefore(s,w);
  }

  function why(){
    if(!isHP()||document.querySelector('.tgs-why'))return;
    var w=document.querySelector('.welcome-wrapper.homepage-box')||document.querySelector('.welcome-wrapper');if(!w)return;
    var U=[['EU drivers\' hours + WTD','Automatic evaluation of Regulation (EC) 561/2006 and the Working Time Directive, every infringement flagged by time, type and duration.'],
           ['All tachographs','From first-generation digital to Smart Tachograph G2V2. Reads .DDD, .C1B, .V1B and ESM files.'],
           ['Audit-grade outputs','Inspector-ready reports for audits, internal reviews and roadside checks.'],
           ['1 to unlimited vehicles','TRUCKER, 1, 2, 4, 6 and MAX – start with one truck, grow to an enterprise fleet.'],
           ['Desktop. Offline. Yours.','Windows program on your PC – no cloud lock-in, no monthly subscription.'],
           ['Vans 2026 ready','Covers the tachograph obligation for light commercial vehicles (2.5–3.5 t) from 1 July 2026.']];
    var s=document.createElement('section');s.className='tgs-why';
    s.innerHTML='<div class="container"><h2 class="tgs-h">Why TAGRA</h2><div class="tgs-why__grid">'+
      U.map(function(u,i){return '<div class="tgs-why__card"><span class="tgs-why__n">0'+(i+1)+'</span><p class="tgs-why__t">'+u[0]+'</p><p class="tgs-why__d">'+u[1]+'</p></div>';}).join('')+
      '</div><p class="tgs-why__more">Used by Police, Customs and Labour Inspectorates in the Czech Republic, Slovakia and Hungary. <a href="https://tagra.app/" target="_blank" rel="noopener">More on tagra.app →</a></p></div>';
    w.parentNode.insertBefore(s,w);
  }

  function trust(){
    if(!document.body.classList.contains('type-detail')||document.querySelector('.tgs-buytrust'))return;
    var w=document.querySelector('.p-detail .p-info-wrapper');if(!w)return;
    var soft=/tagra/i.test((document.querySelector('.p-detail-inner-header h1')||{}).textContent||'');
    var ul=document.createElement('ul');ul.className='tgs-buytrust';
    ul.innerHTML='<li><span><b>0 % VAT</b> for EU companies with a valid VAT ID (reverse charge)</span></li>'+
      (soft?'<li><span><b>Licence delivered by e-mail</b> – first year of the licence included</span></li>':'<li><span><b>Shipped across the EU</b> – 24-month warranty</span></li>')+
      '<li><span><b>Direct from the manufacturer</b> – Truck Data Technology, on the market since 2005</span></li>'+
      '<li><span>Questions? <a href="mailto:sales@tagra.app">sales@tagra.app</a> · support in English</span></li>';
    var ref=w.querySelector('.p-short-description');
    if(ref&&ref.parentNode===w){w.insertBefore(ul,ref.nextSibling);}else{w.appendChild(ul);}
  }

  function reg(){var w=document.createTreeWalker(document.body,4),n;while(n=w.nextNode()){if(n.nodeValue.indexOf('Registrace bude')>-1)n.nodeValue='(Your registration will be approved shortly)';}}
  function run(){
    var f=[carousel,usp,tiles,contact,why,trust,reg];
    f.forEach(function(fn){try{fn();}catch(e){if(window.console)console.warn('tgs',fn.name,e);}});
    document.body.classList.add('tgs-v3');
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
