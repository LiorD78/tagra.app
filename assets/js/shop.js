/* TAGRA Shop v2.0 – layout helpers (2. 11. 2026) */
(function(){
  var CDN='https://cdn.truckmall.cz/data/user-content/';
  function hero(){
    if(!document.body.classList.contains('type-index')||document.querySelector('.tgs-hero'))return;
    var c=document.getElementById('content');if(!c)return;
    var h=document.createElement('section');h.className='tgs-hero';h.setAttribute('aria-label','TAGRA Shop');
    h.innerHTML='<div><p class="tgs-eyebrow">Official TAGRA Shop · Truck Data Technology</p>'+
      '<h2>Tachograph analysis before the inspection finds it</h2>'+
      '<p>Downloading isn\'t enough – the law requires <strong>evaluation and archiving</strong>. Buy <strong>TAGRA licences</strong> and the <strong>DOWNLOAD BOX II S</strong> key direct from the manufacturer: EU drivers\' hours (561/2006) and WTD analysis, all tachographs including Smart G2V2, ready for vans from July 2026.</p>'+
      '<div class="tgs-cta"><a class="tgs-btn tgs-btn--green" href="/tagra-software/">Choose your TAGRA →</a><a class="tgs-btn tgs-btn--blue" href="/software-device-bundles/">Bundles – save €49</a></div>'+
      '<div class="tgs-stats"><div><b>from €49</b>licence, first year included</div><div><b>1 – ∞</b>vehicles</div><div><b>Police &amp; Customs</b>use the same logic</div></div></div>'+
      '<div class="tgs-hero__img"><img src="'+CDN+'Download_Box_II_S_kafe.webp" alt="DOWNLOAD BOX II S next to a laptop running the TAGRA program" width="1200" height="900" fetchpriority="high"></div>';
    var cats=document.createElement('div');cats.className='tgs-cats';
    var T=[['/tagra-software/','TAGRA_MAX','TDT_TAGRA_MAX_wh.jpg','TAGRA software','Licences for 1 to unlimited vehicles and TAGRA TRUCKER for drivers.'],
           ['/download-devices/','DBR','Download%20Box%20IIS_produkt2.webp','Download devices','DOWNLOAD BOX II S and DOWNLOAD STATION for smart tachographs G2V2.'],
           ['/software-device-bundles/','SET','TDT_SET_TAGRA_1_wh.jpg','Software + device bundles','TAGRA together with DOWNLOAD BOX II S – €49 cheaper.'],
           ['/accessories/','ACC','DBIIS_komplet.webp','Accessories','Smart card reader and spare parts for your download devices.']];
    cats.innerHTML=T.map(function(t){return '<a class="tgs-cat" href="'+t[0]+'"><div class="tgs-cat__img"><img src="'+CDN+t[2]+'" alt="'+t[3]+'" loading="lazy" width="400" height="300"></div><div class="tgs-cat__body"><p class="tgs-cat__title">'+t[3]+'</p><p class="tgs-cat__text">'+t[4]+'</p><span class="tgs-cat__go">Show products →</span></div></a>';}).join('');
    var first=c.querySelector('.benefitBanner')||c.firstElementChild;
    c.insertBefore(h,first);c.insertBefore(cats,first);
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

  function why(){
    if(!document.body.classList.contains('type-index')||document.querySelector('.tgs-why'))return;
    var w=document.querySelector('.welcome-wrapper.homepage-box')||document.querySelector('.welcome-wrapper');if(!w)return;
    var U=[['EU drivers\' hours + WTD','Automatic evaluation of Regulation (EC) 561/2006 and the Working Time Directive, every infringement flagged by time, type and duration.'],
           ['All tachographs','From first-generation digital to Smart Tachograph G2V2. Reads .DDD, .C1B, .V1B and ESM files.'],
           ['Audit-grade outputs','Inspector-ready reports for audits, internal reviews and roadside checks.'],
           ['1 to unlimited vehicles','TRUCKER, 1, 2, 4, 6 and MAX – start with one truck, grow to an enterprise fleet.'],
           ['Desktop. Offline. Yours.','Windows software on your PC – no cloud lock-in, no monthly subscription.'],
           ['Vans 2026 ready','Covers the tachograph obligation for light commercial vehicles (2.5–3.5 t) from 1 July 2026.']];
    var s=document.createElement('section');s.className='tgs-why';
    s.innerHTML='<div class="container"><p class="tgs-eyebrow">Why TAGRA</p><h2>Download, analysis and archiving in one program</h2><div class="tgs-why__grid">'+
      U.map(function(u,i){return '<div class="tgs-why__card"><span class="tgs-why__n">0'+(i+1)+'</span><p class="tgs-why__t">'+u[0]+'</p><p class="tgs-why__d">'+u[1]+'</p></div>';}).join('')+
      '</div><p class="tgs-why__more">Used by Police, Customs and Labour Inspectorates in the Czech Republic, Slovakia and Hungary. <a href="https://tagra.app/" target="_blank" rel="noopener">More on tagra.app →</a></p></div>';
    w.parentNode.insertBefore(s,w);
  }
  function reg(){var w=document.createTreeWalker(document.body,4),n;while(n=w.nextNode()){if(n.nodeValue.indexOf('Registrace bude')>-1)n.nodeValue='(Your registration will be approved shortly)';}}
  function run(){hero();why();trust();reg();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
