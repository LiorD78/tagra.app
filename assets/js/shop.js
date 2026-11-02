/* TAGRA Shop v6.0 – tagra.app look, crew + competitor review (2. 11. 2026) */
(function(){
  var TM='https://cdn.truckmall.cz/data/user-content/';
  var TA='https://tagra.app/assets/';
  var U0='data:image/webp;base64,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';
  var SALES='sales@tagra.app',SUPPORT='support@tagra.app',PHONE='+420 739 005 345';
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function isHP(){return document.body.classList.contains('type-index');}

  function carousel(){
    if(!isHP()||document.querySelector('.tgs-car'))return;
    var S=[
      {v:[TM+'DBIIS-kancelar.webm',TM+'DBIIS-office2.mp4'],p:TM+'Download_Box_II_S_kafe.webp',e:'DOWNLOAD BOX II S',t:'Download in seconds. Evaluate over coffee.',c:'Shop download devices',h:'/download-devices/'},
      {v:[TM+'Comp_2.webm',TM+'Comp_2.mp4'],p:TM+'bannery%20HP/01b-vyhodnoceni-dat.webp',e:'TAGRA program',t:'Find infringements before the inspection does.',c:'Choose your TAGRA',h:'/tagra-software/'},
      {v:[TM+'terminy-hero.webm',TM+'terminy-hero.mp4'],p:TM+'DBII_kabina.webp',e:'Vans 2.5–3.5 t',t:'International transport with vans: tachograph from July 2026.',c:'Bundles – save €49',h:'/software-device-bundles/'},
      {v:[TA+'video/hero-720.mp4'],p:TA+'img/hero-poster.jpg',e:'Free 30-day trial',t:'Try TAGRA free. No card, no commitment.',c:'Start free trial',h:'https://tagra.app/try/'}
    ];
    var sec=document.createElement('section');sec.className='tgs-car';sec.setAttribute('aria-label','TAGRA Shop highlights');
    sec.innerHTML='<div class="tgs-car__track">'+S.map(function(s,i){
      var ext=/^https?:/.test(s.h);
      return '<a class="tgs-car__item" href="'+s.h+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+
        '<img class="tgs-car__poster" src="'+s.p+'" alt="" width="600" height="800" '+(i===0?'fetchpriority="high"':'loading="lazy"')+'>'+
        (RM?'':'<video muted loop playsinline webkit-playsinline preload="'+(i===0?'auto':'metadata')+'" aria-hidden="true">'+s.v.map(function(u){return '<source src="'+u+'" type="video/'+(/\.webm$/.test(u)?'webm':'mp4')+'">';}).join('')+'</video>')+
        '<span class="tgs-car__txt"><span class="tgs-car__eye">'+s.e+'</span><span class="tgs-car__t">'+s.t+'</span></span>'+
        '<span class="tgs-car__cta">'+s.c+'</span></a>';
    }).join('')+'</div>'+
    '<button type="button" class="tgs-car__nav tgs-car__nav--prev" aria-label="Previous">&#8249;</button><button type="button" class="tgs-car__nav tgs-car__nav--next" aria-label="Next">&#8250;</button>'+
    '<div class="tgs-car__dots">'+S.map(function(s,i){return '<button type="button" aria-label="Slide '+(i+1)+'"'+(i===0?' class="on"':'')+'></button>';}).join('')+'</div>';
    var slot=document.querySelector('.banners-row .wide-carousel');
    if(slot){slot.appendChild(sec);slot.closest('.banners-row').classList.add('tgs-has-car');}
    else{var c=document.getElementById('content');if(!c)return;c.insertBefore(sec,c.firstElementChild);}
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
    var U=[['usp-truck-eshop-3d','Official TAGRA shop','Direct from the manufacturer.','https://tagra.app/'],
           ['usp-21-let-3d','21 years of experience','We know. We advise. We solve.','https://tagra.app/'],
           ['usp-jednicka-palec-3d','No. 1 in Czech Republic','Used by Police and Customs.','https://tagra.app/'],
           ['','0 % VAT for EU companies','Reverse charge with a valid VAT ID.','/how-to-buy/']];
    var d=document.createElement('div');d.className='tgs-usp';d.setAttribute('aria-label','Why buy at TAGRA Shop');
    d.innerHTML=U.map(function(u){
      var ext=u[3].indexOf('http')===0,base=u[0]?TM+u[0]+'-zaklad.webp':U0,gl=TM+(u[0]||'usp-21-let-3d')+'-odlesk.webp';
      return '<a class="usp-item" href="'+u[3]+'"'+(ext?' target="_blank" rel="noopener"':'')+'><span class="usp-img"><span class="usp-ico"><img src="'+base+'" width="60" height="60" alt="'+u[1]+'" loading="lazy" decoding="async" onload="this.parentNode.classList.add(\'ok\')"><img class="usp-odlesk" src="'+gl+'" width="60" height="60" alt="" aria-hidden="true" loading="lazy"></span></span><span class="usp-text"><strong>'+u[1]+'</strong>'+u[2]+'</span></a>';
    }).join('');
    var c=document.getElementById('content'),car=document.querySelector('.tgs-car'),bb=document.querySelector('.benefitBanner.position--benefitHomepage');
    if(bb){bb.parentNode.insertBefore(d,bb);}else if(c){c.insertBefore(d,c.firstElementChild);}else if(car){car.parentNode.insertBefore(d,car.nextSibling);}
  }

  function badges(){
    [].forEach.call(document.querySelectorAll('.products-block .p'),function(p){
      if(p.querySelector('.tgs-badge'))return;
      var n=((p.querySelector('.name')||{}).textContent||'').replace(/\s+/g,' ').trim().toUpperCase(),b='',s=/\+\s*DOWNLOAD BOX/.test(n);
      if(/TRUCKER/.test(n))b='For drivers';else if(/TAGRA MAX/.test(n))b='Unlimited vehicles';else if(/TAGRA 6/.test(n))b='5–6 vehicles';else if(/TAGRA 4/.test(n))b='3–4 vehicles';else if(/TAGRA 2/.test(n))b='2 vehicles';else if(/TAGRA 1/.test(n))b='1 vehicle';
      var img=p.querySelector('.image');if(!img)return;
      var h='';if(b)h+='<span class="tgs-badge">'+b+'</span>';if(s)h+='<span class="tgs-badge tgs-badge--save">Save €49</span>';
      if(h){var w=document.createElement('span');w.className='tgs-badges';w.innerHTML=h;img.appendChild(w);}
    });
  }

  var IC=TM+'cfg-ico-';
  function head(label,h2,intro){return '<div class="tgs-head"><span class="tgs-label">'+label+'</span><h2 class="tgs-h2">'+h2+'</h2>'+(intro?'<p class="tgs-intro">'+intro+'</p>':'')+'</div>';}
  function anchor(){return document.querySelector('.homepage-group-title.homepage-products-heading-1');}
  function wel(){return document.querySelector('.welcome-wrapper.homepage-box')||document.querySelector('.welcome-wrapper');}

  function trustbar(){
    var u=document.querySelector('.tgs-usp');if(!u||document.querySelector('.tgs-trustbar'))return;
    var d=document.createElement('p');d.className='tgs-trustbar';
    d.innerHTML='<strong>Built for the realities of European road transport.</strong> The same evaluation logic used by Police forces, Customs Administrations and Labour Inspectorates.';
    u.parentNode.insertBefore(d,u.nextSibling);
  }

  function steps(){
    if(!isHP()||document.querySelector('.tgs-steps'))return;
    var t=anchor();if(!t)return;
    var S=[['klic','01','Download','90 / 28 days','Download vehicle-unit data at least every 90 days and driver-card data at least every 28 days.','DOWNLOAD BOX II S reads the tachograph and the driver card.','Explore download hardware','/download-devices/'],
           ['sami','02','Evaluate','EU 561/2006','Evaluate driving and rest times under Regulation (EC) No 561/2006 and working time under Directive 2002/15/EC.','Find infringements and prepare reports before an inspection does.','Choose your TAGRA licence','#tgs-pricing'],
           ['cmr-archiv-v3','03','Archive','12 months','Keep downloaded tachograph and driver-card data for at least 12 months, ready to show on request.','TAGRA archives .DDD, .C1B, .V1B and ESM files on your own PC.','Choose your TAGRA licence','#tgs-pricing']];
    var s=document.createElement('section');s.className='tgs-sec tgs-steps';
    s.innerHTML=head('What the law requires','Download. Evaluate. Archive.','Downloading isn\'t enough – the law requires evaluation and archiving. Here is what your workflow needs to cover, and what covers it.')+
      '<div class="tgs-steps__grid">'+S.map(function(x){return '<div class="tgs-step"><div class="tgs-step__top"><img class="tgs-ico" src="'+IC+x[0]+'.webp" alt="" width="64" height="64" loading="lazy"><span class="tgs-step__n">'+x[1]+'</span></div><p class="tgs-step__t">'+x[2]+'</p><p class="tgs-step__big">'+x[3]+'</p><p class="tgs-step__d">'+x[4]+'</p><p class="tgs-step__x">'+x[5]+'</p><a class="tgs-step__a" href="'+x[7]+'">'+x[6]+'</a></div>';}).join('')+'</div>'+
      '<p class="tgs-note">Supports all digital tachographs, including Smart G2V2.</p>';
    t.parentNode.insertBefore(s,t);
  }

  function vans(){
    if(!isHP()||document.querySelector('.tgs-vans'))return;
    var t=anchor();if(!t)return;
    var s=document.createElement('div');s.className='tgs-vans';
    s.innerHTML='<img class="tgs-ico" src="'+IC+'firma.webp" alt="" width="56" height="56" loading="lazy"><div class="tgs-vans__txt"><span class="tgs-label">International van transport</span><p class="tgs-vans__h">Tachographs for 2.5–3.5 t vans from 1 July 2026</p><p class="tgs-vans__p">Vans of 2.5–3.5 tonnes used in international transport must have a tachograph – and their data must be downloaded, evaluated and archived like any truck.</p></div><a class="tgs-vans__a" href="#tgs-help">Ask which licence you need</a>';
    t.parentNode.insertBefore(s,t);
  }

  function pricing(){
    if(!isHP()||document.querySelector('.tgs-pricing'))return;
    var t=anchor();if(!t)return;
    var L=[['/tagra-1/','TAGRA 1','1 vehicle','For a one-vehicle fleet','€149','€79',149,79,1],
           ['/tagra-2/','TAGRA 2','2 vehicles','For a two-vehicle fleet','€299','€79',299,79,2],
           ['/tagra-4/','TAGRA 4','3–4 vehicles','For fleets of 3–4 vehicles','€399','€99',399,99,4],
           ['/tagra-6/','TAGRA 6','5–6 vehicles','For fleets of 5–6 vehicles','€549','€99',549,99,6],
           ['/tagra-max/','TAGRA MAX','Unlimited','No vehicle limit','€749','€149',749,149,1e9]];
    function eur(n){return '€'+n.toLocaleString('en-US');}
    var s=document.createElement('section');s.className='tgs-sec tgs-pricing';s.id='tgs-pricing';
    s.innerHTML=head('Transparent licence pricing','Choose TAGRA by fleet size','Choose by the number of vehicles in your fleet. Every licence includes the first year; an annual licence fee applies from year two. Prices excl. VAT.')+
      '<form class="tgs-finder" onsubmit="return false"><label for="tgs-veh">How many vehicles do you manage?</label><input id="tgs-veh" type="number" min="1" max="9999" inputmode="numeric" placeholder="Number of vehicles"><button type="submit" class="tgs-pill">Find my licence</button><span class="tgs-finder__out" aria-live="polite"></span></form>'+
      '<div class="tgs-tiers">'+L.map(function(x){return '<a class="tgs-tier" href="'+x[0]+'" data-max="'+x[8]+'"><span class="tgs-tier__match">Matches your fleet size</span><span class="tgs-tier__cap">'+x[2]+'</span><span class="tgs-tier__name">'+x[1]+'</span><span class="tgs-tier__desc">'+x[3]+'</span><span class="tgs-tier__price">'+x[4]+'<small>excl. VAT</small></span><span class="tgs-tier__inc">First year included</span><span class="tgs-tier__fee">'+x[5]+' / year from year 2</span><span class="tgs-pill">Choose '+x[1]+'</span></a>';}).join('')+'</div>'+
      '<div class="tgs-trucker"><img class="tgs-ico" src="'+IC+'ridic.webp" alt="" width="64" height="64" loading="lazy"><div class="tgs-trucker__txt"><span class="tgs-label">For employed drivers</span><p class="tgs-trucker__h">TAGRA TRUCKER</p><p class="tgs-trucker__p">For an employed driver analysing their own driver card. USB card reader included.</p></div><div class="tgs-trucker__price"><b>€49</b><small>excl. VAT · first year included</small><small>€19 / year from year 2</small></div><a class="tgs-pill" href="/tagra-trucker/">Choose TAGRA TRUCKER</a></div>'+
      '<details class="tgs-3y"><summary>Compare licence costs over 3 years</summary><div class="tgs-3y__wrap"><table><thead><tr><th>Licence</th><th>Purchase</th><th>Year 2</th><th>Year 3</th><th>3-year total</th></tr></thead><tbody>'+
      [['TAGRA TRUCKER',49,19]].concat(L.map(function(x){return [x[1],x[6],x[7]];})).map(function(r){return '<tr><td>'+r[0]+'</td><td>'+eur(r[1])+'</td><td>'+eur(r[2])+'</td><td>'+eur(r[2])+'</td><td><b>'+eur(r[1]+2*r[2])+'</b></td></tr>';}).join('')+
      '</tbody></table><p>Current prices, excl. VAT and hardware. The purchase includes the first year; years 2 and 3 are annual licence fees.</p></div></details>'+
      '<div class="tgs-trial"><div><p class="tgs-trial__h">Prefer to try TAGRA first?</p><p class="tgs-trial__p">Try TAGRA free for 30 days with the full functionality of TAGRA MAX. No credit card required.</p></div><div class="tgs-trial__cta"><a class="tgs-pill" href="https://tagra.app/try/?audience=fleet&src=shop" target="_blank" rel="noopener">Try 30 days free</a><span>No credit card. Windows installer.</span></div></div>';
    t.parentNode.insertBefore(s,t);
    var inp=s.querySelector('#tgs-veh'),out=s.querySelector('.tgs-finder__out'),tiers=[].slice.call(s.querySelectorAll('.tgs-tier'));
    function find(){var n=parseInt(inp.value,10);tiers.forEach(function(x){x.classList.remove('is-match');});if(!(n>0)){out.textContent='';return;}
      var m=null;for(var i=0;i<tiers.length;i++){if(n<=+tiers[i].getAttribute('data-max')){m=tiers[i];break;}}
      if(m){m.classList.add('is-match');out.textContent=m.querySelector('.tgs-tier__name').textContent+' fits '+n+(n===1?' vehicle':' vehicles')+'.';}}
    s.querySelector('.tgs-finder').addEventListener('submit',find);inp.addEventListener('input',find);
  }

  function groups(){
    if(!isHP()||document.querySelector('.tgs-grp'))return;
    var t=anchor(),blk=document.getElementById('products-1');if(!t||!blk)return;
    var items=[].slice.call(blk.querySelectorAll(':scope > .product'));
    function nm(it){return ((it.querySelector('.name')||{}).textContent||'').replace(/\s+/g,' ').trim().toUpperCase();}
    function pr(it){var e=it.querySelector('[data-micro-price]');return e?parseFloat(e.getAttribute('data-micro-price'))||0:0;}
    var dev=[];
    items.forEach(function(it){var n=nm(it);if(/TAGRA/.test(n)&&!/DOWNLOAD/.test(n)){it.parentNode.removeChild(it);}else{dev.push(it);}});
    dev.sort(function(a,b){return pr(a)-pr(b);}).forEach(function(it){blk.appendChild(it);});
    blk.classList.add('tgs-grp');
    var h=document.createElement('div');h.className='tgs-sec tgs-hw';h.innerHTML=head('Software + hardware','Complete your tachograph setup','DOWNLOAD BOX II S downloads data from the tachograph and the driver card – no annual fees, 24-month warranty. Buy it together with TAGRA and save €49.');
    t.parentNode.insertBefore(h,t);t.classList.add('tgs-hide');
    var more=document.createElement('p');more.className='tgs-note';more.innerHTML='Also available: <a href="/download-devices/">DOWNLOAD STATION and Wi-Fi versions</a> · <a href="/accessories/">smart card reader</a>';
    blk.parentNode.insertBefore(more,blk.nextSibling);
  }

  function enforce(){
    if(!isHP()||document.querySelector('.tgs-enf'))return;
    var w=wel();if(!w)return;
    var N=['FCC Group','CS Cargo a.s.','ČEDOK a.s.','AGRO SERVIS CZ','ČSAD Jihotrans','ČSAD Karviná','Pivovar Holba','PORR a.s.','Klaus Timber a.s.','Mátra Transport a.s.','KAFKA Transport a.s.','DKC s.r.o.','TQM Holding','Synergies Logistiques','ČSAD Autobusy České Budějovice','ČSAD POLKOST','Cargospol','Energie stavební a báňská a.s.','SAP Mimoň'];
    var s=document.createElement('section');s.className='tgs-enf';
    s.innerHTML='<div class="container">'+head('Verified in practice','Used in enforcement. Built for fleets.','The same evaluation logic used by Police, Customs and Labour Inspectorates across the Czech Republic, Slovakia and Hungary.')+
      '<div class="tgs-ref"><div class="tgs-ref__c tgs-ref__c--cz"><span>Czech Republic</span><b>Police &amp; Customs</b><p>Roadside checks and checks at operators\' premises nationwide.</p></div><div class="tgs-ref__c tgs-ref__c--sk"><span>Slovakia</span><b>Labour Inspectorate</b><p>Driver hours and working time enforcement.</p></div><div class="tgs-ref__c tgs-ref__c--hu"><span>Hungary</span><b>Enforcement &amp; ministries</b><p>Cross-border transport compliance.</p></div><div class="tgs-ref__c"><span>Across Central Europe</span><b>20+ years · 6,000+ fleets</b><p>Haulage, bus &amp; coach, rental, municipal fleets, workshops.</p></div></div></div>'+
      '<div class="tgs-mq"><p>Among the fleets and operators already running TAGRA</p><div class="tgs-mq__t">'+N.concat(N).map(function(n){return '<span>'+n+'</span>';}).join('')+'</div></div>';
    w.parentNode.insertBefore(s,w);
  }

  function help(){
    if(!isHP()||document.querySelector('.tgs-help'))return;
    var w=wel();if(!w)return;
    var s=document.createElement('section');s.className='tgs-help';s.id='tgs-help';
    s.innerHTML='<div class="container"><div class="tgs-help__box"><div class="tgs-help__txt"><h2>Not sure which TAGRA to choose?</h2><p>Tell us how many vehicles you manage and what download hardware you already have. We will recommend the right licence.</p><p class="tgs-help__sup">Already using TAGRA? Technical support: <a href="mailto:'+SUPPORT+'">'+SUPPORT+'</a></p></div>'+
      '<div class="tgs-help__card"><img src="'+TA+'img/team/ivan-szabo.webp" alt="Ivan Szabó" width="72" height="72" loading="lazy"><div><b>Ivan Szabó</b><span>Tachograph data specialist</span><a href="tel:'+PHONE.replace(/\s/g,'')+'">'+PHONE+'</a><a href="mailto:'+SALES+'">'+SALES+'</a></div></div></div></div>';
    w.parentNode.insertBefore(s,w);
  }

  function faq(){
    if(!isHP()||document.querySelector('.tgs-faq'))return;
    var w=wel();if(!w)return;
    var Q=[['Is TAGRA cloud-based or installed locally?','TAGRA is Windows desktop software that runs on your own computer. Driver and vehicle data stay on your PC.'],
           ['What will I pay after the first year?','The purchase price includes the first year. From year two, the annual licence fee is €19 (TRUCKER), €79 (TAGRA 1–2), €99 (TAGRA 4–6) or €149 (TAGRA MAX), excl. VAT.'],
           ['Is download hardware included in the licence?','No. TAGRA is a software licence. DOWNLOAD BOX II S is sold separately, or together with TAGRA in a bundle that costs €49 less than buying both separately.'],
           ['Can my company buy with 0% VAT?','Yes. Businesses with a valid EU VAT ID buy with 0% VAT under the reverse-charge mechanism. Enter your VAT ID at checkout.'],
           ['Can I try TAGRA before buying?','Yes. The free 30-day trial has the full functionality of TAGRA MAX and needs no credit card.'],
           ['Which tachographs does TAGRA support?','All digital tachographs, including Smart Tachograph G2V2. TAGRA reads .DDD, .C1B, .V1B and ESM files.']];
    var s=document.createElement('section');s.className='tgs-sec tgs-faq';
    s.innerHTML='<div class="container">'+head('Questions','Questions before you buy','')+'<div class="tgs-faq__b">'+Q.map(function(q){return '<details><summary>'+q[0]+'</summary><div class="tgs-faq__a">'+q[1]+'</div></details>';}).join('')+'</div></div>';
    w.parentNode.insertBefore(s,w);
    var ld={'@context':'https://schema.org','@type':'FAQPage','mainEntity':Q.map(function(q){return {'@type':'Question','name':q[0],'acceptedAnswer':{'@type':'Answer','text':q[1]}};})};
    var sc=document.createElement('script');sc.type='application/ld+json';sc.text=JSON.stringify(ld);document.head.appendChild(sc);
  }

  function seo(){
    var w=document.querySelector('.type-index .welcome');if(!w||w.querySelector('.tgs-more'))return;
    var body=w.querySelector('.h1+div')||w.children[1];if(!body)return;
    body.classList.add('tgs-clamp');
    var b=document.createElement('button');b.type='button';b.className='tgs-more';b.textContent='Read more';
    b.onclick=function(){body.classList.toggle('open');b.textContent=body.classList.contains('open')?'Show less':'Read more';};
    body.parentNode.insertBefore(b,body.nextSibling);
  }

  function mails(){
    [].forEach.call(document.querySelectorAll('a[href^="mailto:"]'),function(a){
      if(!/tdt\.(cz|sk)/i.test(a.getAttribute('href')))return;
      var addr=a.closest('.checkout-box-wrapper,.sidebar-in-cart,.cart-content')?SUPPORT:SALES;
      a.setAttribute('href','mailto:'+addr);a.textContent=addr;
    });
    [].forEach.call(document.querySelectorAll('.tgs-mail'),function(m){
      var a=document.createElement('a');a.href='mailto:'+SALES;a.textContent=SALES;a.className='tgs-mail-a';m.parentNode.replaceChild(a,m);
    });
    var w=document.createTreeWalker(document.body,4),n,re=/(obchod|info|libor\.dospel)​?@tdt\.(cz|sk)/g;
    while(n=w.nextNode()){if(re.test(n.nodeValue)){re.lastIndex=0;n.nodeValue=n.nodeValue.replace(re,SALES);}}
  }

  function trust(){
    if(!document.body.classList.contains('type-detail')||document.querySelector('.tgs-buytrust'))return;
    var w=document.querySelector('.p-detail .p-info-wrapper');if(!w)return;
    var soft=/tagra/i.test((document.querySelector('.p-detail-inner-header h1')||{}).textContent||'');
    var ul=document.createElement('ul');ul.className='tgs-buytrust';
    ul.innerHTML='<li><span><b>0 % VAT</b> for EU companies with a valid VAT ID (reverse charge)</span></li>'+
      (soft?'<li><span><b>Licence delivered by e-mail</b> – first year of the licence included</span></li>':'<li><span><b>Shipped across the EU</b> – 24-month warranty</span></li>')+
      '<li><span><b>Direct from the manufacturer</b> – Truck Data Technology, on the market since 2005</span></li>'+
      '<li><span>Questions? <a href="mailto:'+SALES+'">'+SALES+'</a> · support in English</span></li>';
    var ref=w.querySelector('.p-short-description');
    if(ref&&ref.parentNode===w){w.insertBefore(ul,ref.nextSibling);}else{w.appendChild(ul);}
  }

  function reg(){var w=document.createTreeWalker(document.body,4),n;while(n=w.nextNode()){if(n.nodeValue.indexOf('Registrace bude')>-1)n.nodeValue='(Your registration will be approved shortly)';}}
  function run(){
    [carousel,usp,trustbar,steps,vans,pricing,badges,groups,enforce,help,faq,seo,mails,trust,reg].forEach(function(fn){try{fn();}catch(e){if(window.console)console.warn('tgs',e);}});
    document.body.classList.add('tgs-v6');
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
