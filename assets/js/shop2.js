/* TAGRA Shop layer 2 v3.0 – formoline header, star reviews (TRUCKMALL loop), 3D USP, compact detail (2. 11. 2026) */
(function(){
  var PHONE='+420 739 005 345';
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://tagra.app/assets/css/shop2.css?v=2';document.head.appendChild(l);
  var l2=document.createElement('link');l2.rel='stylesheet';l2.href='https://tagra.app/assets/css/shop2b.css?v=1';document.head.appendChild(l2);
  function header(){
    var top=document.querySelector('#header .header-top');
    if(!top||top.querySelector('.tgs-hdr')||!(window.matchMedia&&matchMedia('(min-width:768px)').matches))return;
    document.documentElement.classList.add('tgs-hd');
    var nb=top.querySelector('.navigation-buttons');
    var c=document.createElement('div');c.className='tgs-hdr';
    c.innerHTML='<span class="tgs-hdr__ph" aria-hidden="true"></span><strong>Happy to help</strong><a class="tgs-hdr__tel" href="tel:'+PHONE.replace(/\s/g,'')+'">'+PHONE+'</a>';
    top.insertBefore(c,nb||null);
    if(nb&&!nb.querySelector('.tgs-hdr__login')){var a=document.createElement('a');a.className='tgs-hdr__login';a.href='/login/';a.setAttribute('aria-label','Login');nb.insertBefore(a,nb.firstChild);}
  }
  function titles(){
    var T=['Download in seconds','Find it before the inspection does','Vans: tachograph from July 2026','Try TAGRA free for 30 days'];
    [].forEach.call(document.querySelectorAll('.tgs-car__t'),function(e,i){if(T[i])e.textContent=T[i];});
  }
  var RF=[['TAGRA handles a huge volume of data and significantly simplified our violation checks and archiving.','David C.'],
          ['We’ve been using TAGRA for a few months – easy download and evaluation, clear outputs. Finally peace of mind.','Patrik S.'],
          ['The software is intuitive and easy to use. When I needed help, they were there.','Milan K.'],
          ['Simple and clear. Downloading, evaluation and archiving of data takes just a few minutes.','Josef Z.'],
          ['TAGRA keeps us on top of violations and archiving. Really easy to work with.','']];
  var RD=[['Great satisfaction and no problems during inspections.',''],
          ['Everything works as it should, the software is clear and sufficient for my needs. Support was helpful and responsive. Can only recommend.',''],
          ['It takes a bit of getting used to at first, but then you realise the software is easy, clear and useful for journey planning too. Every driver should have it.',''],
          ['The reader works as it should.','']];
  function revSection(list,title){
    var s=document.createElement('section');s.className='tgs-rev';
    var cards=list.map(function(r){return '<article class="tgs-rev__c"><div class="tgs-rev__s" aria-hidden="true">★★★★★</div><p class="tgs-rev__t">“'+r[0]+'”</p><p class="tgs-rev__m">'+(r[1]?r[1]+' · ':'')+'Verified customer</p></article>';}).join('');
    s.innerHTML='<div class="tgs-head"><span class="tgs-label">What customers say</span><h2 class="tgs-h2">'+title+'</h2><p class="tgs-intro">Five-star feedback from verified customers across Central Europe.</p></div>'+
      '<div class="tgs-rev__wrap"><div class="tgs-rev__rail" tabindex="0" role="region" aria-label="Customer reviews, 5 out of 5 stars">'+cards+'</div></div>';
    loop(s.querySelector('.tgs-rev__rail'));
    return s;
  }
  function loop(rail){
    if(!rail||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
    var one=rail.innerHTML;rail.innerHTML=one+one+one;
    [].forEach.call(rail.children,function(c,i){if(i>=rail.children.length/3)c.setAttribute('aria-hidden','true');});
    var hold=false,vis=true,acc=0,t,down=false,sx=0,sl=0,last=0;
    function step(ts){
      var dt=last?Math.min(ts-last,50):16;last=ts;
      if(!hold&&vis&&!down){acc+=dt*0.06;var n=Math.floor(acc);if(n){rail.scrollLeft+=n;acc-=n;}
        var third=rail.scrollWidth/3;if(rail.scrollLeft>=third)rail.scrollLeft-=third;}
      requestAnimationFrame(step);
    }
    function stop(){hold=true;clearTimeout(t);}
    function go(){clearTimeout(t);t=setTimeout(function(){hold=false;},2000);}
    rail.addEventListener('mouseenter',stop);rail.addEventListener('mouseleave',function(){down=false;go();});
    rail.addEventListener('mousedown',function(e){down=true;stop();sx=e.pageX;sl=rail.scrollLeft;});
    rail.addEventListener('mouseup',function(){down=false;});
    rail.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();rail.scrollLeft=sl-(e.pageX-sx)*1.5;});
    rail.addEventListener('touchstart',stop,{passive:true});rail.addEventListener('touchend',go,{passive:true});
    rail.addEventListener('focusin',stop);rail.addEventListener('focusout',go);
    if('IntersectionObserver' in window){new IntersectionObserver(function(en){vis=en[en.length-1].isIntersecting;}).observe(rail);}
    requestAnimationFrame(step);
  }
  function reviews(){
    if(document.querySelector('.tgs-rev'))return;
    var b=document.body;
    if(b.classList.contains('type-index')){
      var h=document.querySelector('.tgs-help')||document.querySelector('.welcome-wrapper');if(!h)return;
      h.parentNode.insertBefore(revSection(RF,'Professional tachograph analysis for European fleets'),h);
    }else if(b.classList.contains('type-detail')){
      var name=((document.querySelector('.p-detail-inner-header h1')||{}).textContent||'').toUpperCase();
      var list=/TRUCKER|READER/.test(name)?RD:RF;
      var tabs=document.querySelector('.p-detail-tabs-wrapper,.shp-tabs-wrapper');
      var sec=revSection(list,/TRUCKER/.test(name)?'What drivers say about TAGRA':'What fleets say about TAGRA');
      if(tabs)tabs.parentNode.insertBefore(sec,tabs);else{var c=document.getElementById('content');if(c)c.appendChild(sec);}
      var h1=document.querySelector('.p-detail-inner-header h1');
      if(h1&&!document.querySelector('.tgs-stars')){var a=document.createElement('a');a.className='tgs-stars';a.href='#tgs-rev';a.innerHTML='<span aria-hidden="true">★★★★★</span> Verified customer reviews';h1.parentNode.insertBefore(a,h1.nextSibling);sec.id='tgs-rev';}
    }else if(b.classList.contains('type-category')){
      var c2=document.getElementById('content');if(c2)c2.appendChild(revSection(RF,'What fleets say about TAGRA'));
    }
  }
  var TM='https://cdn.truckmall.cz/data/user-content/',U0='data:image/webp;base64,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';
  function benefits(){
    var bbs=document.querySelectorAll('.benefitBanner');
    var U=[['usp-truck-eshop-3d','Official TAGRA shop','Direct from the manufacturer.','https://tagra.app/'],
           ['usp-21-let-3d','21 years of experience','We know. We advise. We solve.','https://tagra.app/'],
           ['usp-jednicka-palec-3d','No. 1 in Czech Republic','Used by Police and Customs.','https://tagra.app/'],
           ['','0 % VAT for EU companies','Reverse charge with a valid VAT ID.','/how-to-buy/']];
    [].forEach.call(bbs,function(bb){
      if(bb.classList.contains('tgs-off'))return;
      bb.classList.add('tgs-off');
      if(bb.classList.contains('position--benefitHomepage'))return;
      var d=document.createElement('div');d.className='tgs-usp tgs-usp--page';d.setAttribute('aria-label','Why buy at TAGRA Shop');
      d.innerHTML=U.map(function(u){
        var ext=u[3].indexOf('http')===0,base=u[0]?TM+u[0]+'-zaklad.webp':U0,gl=TM+(u[0]||'usp-21-let-3d')+'-odlesk.webp';
        return '<a class="usp-item" href="'+u[3]+'"'+(ext?' target="_blank" rel="noopener"':'')+'><span class="usp-img"><span class="usp-ico"><img src="'+base+'" width="60" height="60" alt="'+u[1]+'" loading="lazy" decoding="async" onload="this.parentNode.classList.add(\'ok\')"><img class="usp-odlesk" src="'+gl+'" width="60" height="60" alt="" aria-hidden="true" loading="lazy"></span></span><span class="usp-text"><strong>'+u[1]+'</strong>'+u[2]+'</span></a>';
      }).join('');
      bb.parentNode.insertBefore(d,bb);
    });
  }
  function compact(){
    if(!document.body.classList.contains('type-detail'))return;
    var d=document.querySelector('#description .description-inner');if(!d||d.querySelector('.tgs-more'))return;
    var box=d.querySelector('.tgs-p')||d,secs=box.querySelectorAll(':scope > section'),cut;
    if(secs.length>3){cut=secs[1].offsetTop-box.offsetTop+260;}else{cut=900;}
    if(box.scrollHeight<cut+500)return;
    box.classList.add('tgs-clamp');box.style.maxHeight=cut+'px';
    var w=document.createElement('div');w.className='tgs-more';
    w.innerHTML='<button type="button" class="tgs-more__btn" aria-expanded="false">Show all details</button>';
    box.parentNode.insertBefore(w,box.nextSibling);
    function open(){box.style.maxHeight='none';box.classList.remove('tgs-clamp');w.parentNode&&w.parentNode.removeChild(w);}
    w.querySelector('button').addEventListener('click',open);
    [].forEach.call(document.querySelectorAll('a[href="#description"]'),function(a){a.addEventListener('click',open);});
    if(location.hash&&location.hash.length>1){var tg=document.getElementById(location.hash.slice(1));if(tg&&box.contains(tg))open();}
  }
  function run(){header();reviews();benefits();compact();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
