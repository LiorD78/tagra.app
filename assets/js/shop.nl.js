/* 21. 11. 2026: 79-7 LCP – hero obrázek z tagra.app + preload + srcset 400/560 |  89 (24. 11. 2026): shop.nl.js = shop.fr.js struktura + NL literály z nl_js_part3.json (crew GPT + Gemini); načítá shop.js při <html lang="nl"> */
/* 21. 11. 2026: odrážka doprava zdarma (79-12d) | v7.1 (21. 11. 2026): hero obrázek Hodnocení místo Přehledu | v7.0-pl1 (2026-11-15): <html lang="pl"> -> shop.pl.js (PL slovník), jinak beze změny | TAGRA Shop v7.0 (9. 11. 2026: <html lang="hu"> -> shop.hu.js, like DE -> shop.de.js | one-page buying flow on the homepage – hero + fleet calculator first; carousel, hub, steps, tier cards and product grid off) | v6.1 (8. 11. 2026: entry hub, pricing facts, "Most popular" TAGRA 4, already-using-TAGRA section, licence-first carousel, GA4 events via gtag) | v6.0 – tagra.app look, crew + competitor review (2. 11. 2026) */
(function(){
  var TM='https://cdn.truckmall.cz/data/user-content/';
  var TA='https://tagra.app/assets/';
  var U0='data:image/webp;base64,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';
  var SALES='sales@tagra.app',SUPPORT='support@tagra.app',PHONE='+420 739 005 345';
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function isHP(){return document.body.classList.contains('type-index');}
  var POP='',POPL='Meest populair',POPRE=/\+\s*DOWNLOAD BOX II S\s*$/i;  /* Most popular = TAGRA + DOWNLOAD BOX II S (sada), ne tarif ani samotný HW (Libor 8. 11. 2026); platí pro všechny velikosti TAGRA */
  /* GA4: Shoptet's gtag config uses groups:'GA4' – plain dataLayer objects never reach GA4, so send via gtag (consent mode applies) */
  function ga(ev,p){p=p||{};try{window.dataLayer=window.dataLayer||[];var o={event:ev},k;for(k in p)o[k]=p[k];window.dataLayer.push(o);}catch(e){}
    try{if(typeof window.gtag==='function'){var q={send_to:'GA4',transport_type:'beacon'},k2;for(k2 in p)q[k2]=p[k2];window.gtag('event',ev,q);}}catch(e){}}
  window.tgsGa=window.tgsGa||ga;
  function quoteHref(prod){return 'mailto:'+SALES+'?subject='+encodeURIComponent('Offerte aanvragen – '+prod)+'&body='+encodeURIComponent('Goedendag,\nKunt u mij een offerte sturen voor '+prod+'.\n\nBedrijf:\nLand:\nAantal voertuigen:\nGewenst aantal DOWNLOAD BOX II S-apparaten:\nBtw-nummer:\n\nBedankt');}
  window.tgsQuoteHref=window.tgsQuoteHref||quoteHref;

  function carousel(){
    if(!isHP()||document.querySelector('.tgs-car'))return;
    var S=[
      {v:[TM+'Comp_2.webm',TM+'Comp_2.mp4'],p:TM+'bannery%20HP/01b-vyhodnoceni-dat.webp',e:'TAGRA-programma',t:'Ontdek overtredingen voordat controleurs dat doen.',c:'Kies op basis van de omvang van uw wagenpark',h:'#tgs-pricing'},
      {v:[TA+'video/hero-720.mp4'],p:TA+'img/hero-poster.jpg',e:'30 dagen gratis proberen',t:'Probeer TAGRA gratis. Zonder creditcard en vrijblijvend.',c:'Gratis proefversie starten',h:'https://tagra.app/nl/gratis-proefversie/'},
      {v:[TM+'terminy-hero.webm',TM+'terminy-hero.mp4'],p:TM+'DBII_kabina.webp',e:'Bestelwagens boven 2,5 ton',t:'Internationaal vervoer met bestelwagens: tachograaf verplicht sinds juli 2026.',c:'Bundels – bespaar 49 €',h:'/nl/software-device-bundles/'},
      {v:[TM+'DBIIS-kancelar.webm',TM+'DBIIS-office2.mp4'],p:TM+'Download_Box_II_S_kafe.webp',e:'DOWNLOAD BOX II S',t:'Download gegevens in enkele seconden. Analyseer ze onder het genot van een kop koffie.',c:'Downloadapparaten kopen',h:'/nl/download-devices/'}
    ];
    var sec=document.createElement('section');sec.className='tgs-car';sec.setAttribute('aria-label','Uitgelicht in TAGRA Shop');
    sec.innerHTML='<div class="tgs-car__track">'+S.map(function(s,i){
      var ext=/^https?:/.test(s.h);
      return '<a class="tgs-car__item" href="'+s.h+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+
        '<img class="tgs-car__poster" src="'+s.p+'" alt="" width="600" height="800" '+(i===0?'fetchpriority="high"':'loading="lazy"')+'>'+
        (RM?'':'<video muted loop playsinline webkit-playsinline preload="'+(i===0?'auto':'metadata')+'" aria-hidden="true">'+s.v.map(function(u){return '<source src="'+u+'" type="video/'+(/\.webm$/.test(u)?'webm':'mp4')+'">';}).join('')+'</video>')+
        '<span class="tgs-car__txt"><span class="tgs-car__eye">'+s.e+'</span><span class="tgs-car__t">'+s.t+'</span></span>'+
        '<span class="tgs-car__cta">'+s.c+'</span></a>';
    }).join('')+'</div>'+
    '<button type="button" class="tgs-car__nav tgs-car__nav--prev" aria-label="Vorige">&#8249;</button><button type="button" class="tgs-car__nav tgs-car__nav--next" aria-label="Volgende">&#8250;</button>'+
    '<div class="tgs-car__dots">'+S.map(function(s,i){return '<button type="button" aria-label="Dia '+(i+1)+'"'+(i===0?' class="on"':'')+'></button>';}).join('')+'</div>';
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

  /* v7 (9. 11. 2026): one-page buying flow – hero + fleet calculator first (no carousel, hub, steps, tier cards, product grid) */
  var HOME2=true;
  function hero(){
    if(!isHP()||document.querySelector('.tgs-hero2'))return;
    var MB='https://tagra.app/assets/img/shop/tagra3-mac-evaluation-';
    var F=['Vanaf 149 € excl. btw','Licentie per e-mail, doorgaans dezelfde dag','0% btw voor bedrijven in de EU','Sinds 2005 op de markt'];
    var s=document.createElement('section');s.className='tgs-hero2';
    s.innerHTML='<div class="tgs-hero2__txt"><span class="tgs-label">TAGRA · programma voor de analyse van tachograafgegevens</span><p class="tgs-hero2__h">Ontdek overtredingen voordat controleurs dat doen.</p><p class="tgs-hero2__p">Windows-programma voor vervoersbedrijven en bestuurders. Uw gegevens blijven op uw pc. Het eerste licentiejaar is inbegrepen.</p>'+
      '<div class="tgs-hero2__cta"><a class="tgs-pill" href="#tgs-pricing" data-hero="choose">Kies uw TAGRA</a><a class="tgs-pill tgs-pill--ghost" href="https://tagra.app/nl/gratis-proefversie/?audience=fleet&src=shop_hero" target="_blank" rel="noopener" data-hero="trial">30 dagen gratis proberen</a></div>'+
      '<small class="tgs-hero2__small">Geen creditcard nodig · Windows 10/11</small><ul class="tgs-hero2__f">'+F.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul></div>'+
      '<div class="tgs-hero2__img"><img src="'+MB+'1600.webp" srcset="'+MB+'400.webp 400w, '+MB+'560.webp 560w, '+MB+'800.webp 800w, '+MB+'1600.webp 1600w" sizes="(max-width: 767px) 92vw, 620px" width="1600" height="1407" alt="TAGRA-programma – analyse van een bestuurder met activiteitengeschiedenis en overtredingen" fetchpriority="high" decoding="async"></div>';
    var slot=document.querySelector('.banners-row .wide-carousel');
    if(slot){slot.appendChild(s);slot.closest('.banners-row').classList.add('tgs-has-car');}
    else{var c=document.getElementById('content');if(!c)return;c.insertBefore(s,c.firstElementChild);}
    s.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-hero]');if(!a)return;ga('hero_click',{hero_cta:a.getAttribute('data-hero')});if(a.getAttribute('data-hero')==='choose'){var p=document.getElementById('tgs-pricing');if(p){e.preventDefault();p.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});}}});
  }
  function hwnote(){
    var p=document.getElementById('tgs-pricing');if(!p||p.querySelector('.tgs-hwnote'))return;
    var d=document.createElement('p');d.className='tgs-hwnote';
    d.innerHTML='<b>Hebt u alleen een downloadapparaat nodig?</b> <a href="/nl/download-box-ii-s/">DOWNLOAD BOX II S – 299 € excl. btw</a> · <a href="/nl/download-devices/">Downloadstations en smartcardlezer</a>';
    var ex=p.querySelector('.tgs-exist');if(ex)p.insertBefore(d,ex);else p.appendChild(d);
  }

  function usp(){
    if(!isHP()||document.querySelector('.tgs-usp'))return;
    var U=[['usp-truck-eshop-3d','Officiële TAGRA-webshop','Rechtstreeks van de fabrikant.','https://tagra.app/nl/'],
           ['usp-21-let-3d','21 jaar ervaring','Wij kennen het vak. Wij adviseren. Wij lossen het op.','https://tagra.app/nl/'],
           ['usp-jednicka-palec-3d','Nr. 1 in Tsjechië','Gebruikt door politie en douane.','https://tagra.app/nl/'],
           ['','0% btw voor bedrijven in de EU','Verleggingsregeling met een geldig btw-nummer.','/nl/how-to-buy/']];
    var d=document.createElement('div');d.className='tgs-usp';d.setAttribute('aria-label','Waarom kopen bij TAGRA Shop');
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
      if(/TRUCKER/.test(n))b='Voor bestuurders';else if(/TAGRA MAX/.test(n))b='Onbeperkt aantal voertuigen';else if(/TAGRA 6/.test(n))b='5–6 voertuigen';else if(/TAGRA 4/.test(n))b='3–4 voertuigen';else if(/TAGRA 2/.test(n))b='2 voertuigen';else if(/TAGRA 1/.test(n))b='1 voertuig';
      var img=p.querySelector('.image');if(!img)return;
      var h='';if(s)h+='<span class="tgs-badge tgs-badge--pop">'+POPL+'</span>';if(b)h+='<span class="tgs-badge">'+b+'</span>';if(s)h+='<span class="tgs-badge tgs-badge--save">Bespaar 49 €</span>';
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
    d.innerHTML='<strong>Ontwikkeld voor de praktijk van het Europese wegvervoer.</strong> Dezelfde analysemethode als die van politie, douane en Arbeidsinspectie.';
    u.parentNode.insertBefore(d,u.nextSibling);
  }

  function steps(){
    if(!isHP()||document.querySelector('.tgs-steps'))return;
    var t=anchor();if(!t)return;
    var S=[['klic','01','Downloaden','90 / 28 dagen','Download de gegevens van de voertuigunit (VU) minstens elke 90 dagen en die van de bestuurderskaart minstens elke 28 dagen.','DOWNLOAD BOX II S leest de tachograaf en de bestuurderskaart uit.','Bekijk downloadapparaten','/nl/download-devices/'],
           ['sami','02','Analyse','EU 561/2006','Analyseer rij- en rusttijden conform Verordening (EG) nr. 561/2006 en arbeidstijd conform Richtlijn 2002/15/EG.','Ontdek overtredingen en bereid rapporten voor voordat er een controle plaatsvindt.','Kies uw TAGRA-licentie','#tgs-pricing'],
           ['cmr-archiv-v3','03','Archiveren','12 maanden','Bewaar de gedownloade tachograaf- en bestuurderskaartgegevens minstens 12 maanden, zodat u ze op verzoek kunt tonen.','TAGRA archiveert .DDD-, .C1B-, .V1B- en ESM-bestanden op uw pc.','Kies uw TAGRA-licentie','#tgs-pricing']];
    var s=document.createElement('section');s.className='tgs-sec tgs-steps';
    s.innerHTML=head('Wat de wet voorschrijft','Downloaden. Analyseren. Archiveren.','Alleen downloaden is niet voldoende: de wet vereist ook analyse en archivering. Dit zijn de stappen die u moet uitvoeren en de hulpmiddelen die u nodig hebt.')+
      '<div class="tgs-steps__grid">'+S.map(function(x){return '<div class="tgs-step"><div class="tgs-step__top"><img class="tgs-ico" src="'+IC+x[0]+'.webp" alt="" width="64" height="64" loading="lazy"><span class="tgs-step__n">'+x[1]+'</span></div><p class="tgs-step__t">'+x[2]+'</p><p class="tgs-step__big">'+x[3]+'</p><p class="tgs-step__d">'+x[4]+'</p><p class="tgs-step__x">'+x[5]+'</p><a class="tgs-step__a" href="'+x[7]+'">'+x[6]+'</a></div>';}).join('')+'</div>'+
      '<p class="tgs-note">Compatibel met alle digitale tachografen, inclusief slimme tachografen Smart G2V2.</p>';
    t.parentNode.insertBefore(s,t);
  }

  function vans(){
    if(!isHP()||document.querySelector('.tgs-vans'))return;
    var t=anchor();if(!t)return;
    var s=document.createElement('div');s.className='tgs-vans';
    s.innerHTML='<img class="tgs-ico" src="'+IC+'firma.webp" alt="" width="56" height="56" loading="lazy"><div class="tgs-vans__txt"><span class="tgs-label">Internationaal vervoer met bestelwagens</span><p class="tgs-vans__h">Tachografen voor bestelwagens boven 2,5 ton sinds 1 juli 2026</p><p class="tgs-vans__p">Bestelwagens boven 2,5 ton die worden gebruikt voor internationaal vervoer moeten sinds 1 juli 2026 zijn uitgerust met een tachograaf. De gegevens moeten worden gedownload, geanalyseerd en gearchiveerd, net als bij elke vrachtwagen.</p></div><a class="tgs-vans__a" href="#tgs-help">Vraag welke licentie u nodig hebt</a>';
    t.parentNode.insertBefore(s,t);
  }

  function pricing(){
    if(!isHP()||document.querySelector('.tgs-pricing'))return;
    var t=anchor();if(!t)return;
    var L=[['/nl/tagra-1/','TAGRA 1','1 voertuig','Voor een wagenpark met één voertuig','149 €','79 €',149,79,1],
           ['/nl/tagra-2/','TAGRA 2','2 voertuigen','Voor een wagenpark met twee voertuigen','299 €','79 €',299,79,2],
           ['/nl/tagra-4/','TAGRA 4','3–4 voertuigen','Voor wagenparken met 3–4 voertuigen','399 €','99 €',399,99,4],
           ['/nl/tagra-6/','TAGRA 6','5–6 voertuigen','Voor wagenparken met 5–6 voertuigen','549 €','99 €',549,99,6],
           ['/nl/tagra-max/','TAGRA MAX','Onbeperkt','Geen limiet aan het aantal voertuigen','749 €','149 €',749,149,1e9]];
    function eur(n){return '€'+n.toLocaleString('nl-NL');}
    var s=document.createElement('section');s.className='tgs-sec tgs-pricing';s.id='tgs-pricing';
    s.innerHTML=head('Uw TAGRA in 3 stappen','Kies TAGRA op basis van uw wagenpark','Kies op basis van het aantal voertuigen in uw wagenpark. Elke licentie omvat het eerste jaar; vanaf het tweede jaar betaalt u jaarlijkse licentiekosten. Prijzen excl. btw.')+
      '<ul class="tgs-facts" aria-label="Licentievoorwaarden"><li><span><b>Eerste jaar inbegrepen</b>Jaarlijkse licentiekosten vanaf het 2e jaar</span></li><li><span><b>Vrijblijvend</b>U kunt op elk moment stoppen door simpelweg niet te verlengen</span></li><li><span><b>Licentie per e-mail</b>Doorgaans dezelfde dag bij betaling met kaart</span></li><li><span><b>30 dagen gratis proberen</b>Volledige TAGRA MAX, geen creditcard nodig</span></li></ul>'+
      '<form class="tgs-finder" onsubmit="return false"><label for="tgs-veh">Hoeveel voertuigen beheert u?</label><input id="tgs-veh" type="number" min="1" max="9999" inputmode="numeric" placeholder="Aantal voertuigen"><button type="submit" class="tgs-pill">Licentie zoeken</button><span class="tgs-finder__out" aria-live="polite"></span></form>'+
      '<div class="tgs-tiers">'+L.map(function(x){var pop=x[1]===POP;return '<a class="tgs-tier'+(pop?' is-pop':'')+'" href="'+x[0]+'" data-max="'+x[8]+'">'+(pop?'<span class="tgs-tier__pop">'+POPL+'</span>':'')+'<span class="tgs-tier__match">Geschikt voor uw wagenpark</span><span class="tgs-tier__cap">'+x[2]+'</span><span class="tgs-tier__name">'+x[1]+'</span><span class="tgs-tier__desc">'+x[3]+'</span><span class="tgs-tier__price">'+x[4]+'<small>excl. btw</small></span><span class="tgs-tier__inc">Eerste jaar inbegrepen</span><span class="tgs-tier__fee">'+x[5]+' / jaar vanaf het 2e jaar</span><span class="tgs-pill">Kies '+x[1]+'</span></a>';}).join('')+'</div>'+
      '<div class="tgs-trucker"><img class="tgs-ico" src="'+IC+'ridic.webp" alt="" width="64" height="64" loading="lazy"><div class="tgs-trucker__txt"><span class="tgs-label">Voor bestuurders in loondienst</span><p class="tgs-trucker__h">TAGRA TRUCKER</p><p class="tgs-trucker__p">Voor bestuurders in loondienst die hun eigen bestuurderskaart analyseren. Inclusief USB-kaartlezer.</p></div><div class="tgs-trucker__price"><b>49 €</b><small>excl. btw · eerste jaar inbegrepen</small><small>19 € / jaar vanaf het 2e jaar</small></div><a class="tgs-pill" href="/nl/tagra-trucker/">Kies TAGRA TRUCKER</a></div>'+
      '<details class="tgs-3y"><summary>Licentiekosten over 3 jaar vergelijken</summary><div class="tgs-3y__wrap"><table><thead><tr><th>Licentie</th><th>Aankoop</th><th>2e jaar</th><th>3e jaar</th><th>Totaal over 3 jaar</th></tr></thead><tbody>'+
      [['TAGRA TRUCKER',49,19]].concat(L.map(function(x){return [x[1],x[6],x[7]];})).map(function(r){return '<tr><td>'+r[0]+'</td><td>'+eur(r[1])+'</td><td>'+eur(r[2])+'</td><td>'+eur(r[2])+'</td><td><b>'+eur(r[1]+2*r[2])+'</b></td></tr>';}).join('')+
      '</tbody></table><p>Actuele prijzen, excl. btw en hardware. De aankoop omvat het eerste jaar; in het 2e en 3e jaar betaalt u jaarlijkse licentiekosten.</p></div></details>'+
      existing()+'<div class="tgs-trial"><div><p class="tgs-trial__h">Wilt u TAGRA eerst proberen?</p><p class="tgs-trial__p">Probeer TAGRA 30 dagen gratis met alle functies van TAGRA MAX. Geen creditcard nodig.</p></div><div class="tgs-trial__cta"><a class="tgs-pill" href="https://tagra.app/nl/gratis-proefversie/?audience=fleet&src=shop" target="_blank" rel="noopener">30 dagen gratis proberen</a><span>Geen creditcard nodig. Installatieprogramma voor Windows.</span></div></div>';
    t.parentNode.insertBefore(s,t);
    s.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-tgs-ev]');if(a)ga(a.getAttribute('data-tgs-ev'),{tgs_from:'existing',tgs_target:a.getAttribute('data-tgs-t')||''});});
    var inp=s.querySelector('#tgs-veh'),out=s.querySelector('.tgs-finder__out'),tiers=[].slice.call(s.querySelectorAll('.tgs-tier'));
    function find(){var n=parseInt(inp.value,10);tiers.forEach(function(x){x.classList.remove('is-match');});if(!(n>0)){out.textContent='';return;}
      var m=null;for(var i=0;i<tiers.length;i++){if(n<=+tiers[i].getAttribute('data-max')){m=tiers[i];break;}}
      if(m){m.classList.add('is-match');out.textContent=m.querySelector('.tgs-tier__name').textContent+' geschikt voor '+n+(n===1?' voertuig':' voertuigen')+'.';}}
    s.querySelector('.tgs-finder').addEventListener('submit',find);inp.addEventListener('input',find);
  }

  function existing(){
    var F=[['TAGRA TRUCKER','19 €'],['TAGRA TRUCKER 2','29 €'],['TAGRA 1 en 2','79 €'],['TAGRA 4 en 6','99 €'],['TAGRA MAX','149 €']];
    return '<div class="tgs-exist" id="tgs-existing"><p class="tgs-exist__h">Gebruikt u TAGRA al?</p><div class="tgs-exist__g">'+
      '<div class="tgs-exist__c"><b>Verleng in TAGRA</b><p>Betaal de jaarlijkse licentiekosten rechtstreeks in het programma: u hoeft hier niets te bestellen.</p><ul aria-label="Jaarlijkse licentiekosten, excl. btw">'+F.map(function(f){return '<li><span>'+f[0]+'</span><span>'+f[1]+' / jaar</span></li>';}).join('')+'</ul></div>'+
      '<div class="tgs-exist__c"><b>Meer voertuigen?</b><p>Neem contact op met onze verkoopafdeling om uw huidige licentie uit te breiden.</p><p><a href="'+quoteHref('uitbreiding van mijn TAGRA-licentie')+'" data-tgs-ev="quote_click" data-tgs-t="upgrade">'+SALES+'</a><br><a href="tel:'+PHONE.replace(/\s/g,'')+'" data-tgs-ev="phone_click" data-tgs-t="upgrade">'+PHONE+'</a></p></div>'+
      '<div class="tgs-exist__c"><b>Een ander downloadapparaat nodig?</b><p>Met DOWNLOAD BOX II S downloadt u tachograaf- en bestuurderskaartgegevens. 299 € excl. btw, geen jaarlijkse kosten.</p><p><a href="/nl/download-box-ii-s/" data-tgs-ev="existing_click" data-tgs-t="dbiis">Bekijk DOWNLOAD BOX II S</a></p></div>'+
      '</div><p class="tgs-exist__sup">Technische ondersteuning: <a href="mailto:'+SUPPORT+'">'+SUPPORT+'</a></p></div>';
  }

  function hub(){
    if(!isHP()||document.querySelector('.tgs-hub'))return;
    var ref=document.querySelector('.tgs-trustbar')||document.querySelector('.tgs-usp');if(!ref)return;
    var s=document.createElement('section');s.className='tgs-hub';s.setAttribute('aria-labelledby','tgs-hub-h');
    s.innerHTML='<p class="tgs-hub__h" id="tgs-hub-h">Waar wilt u beginnen?</p><div class="tgs-hub__g">'+
      '<a class="tgs-hub__t" href="#tgs-pricing" data-path="driver" data-fc="driver"><img src="'+IC+'ridic.webp" alt="" width="52" height="52" loading="lazy"><span><b>Ik ben bestuurder</b><small>Controle van uw bestuurderskaart · TRUCKER vanaf 49 €</small></span></a>'+
      '<a class="tgs-hub__t" href="#tgs-pricing" data-path="small" data-fc="company"><img src="'+IC+'firma.webp" alt="" width="52" height="52" loading="lazy"><span><b>1–6 voertuigen</b><small>Vind de juiste licentie in 3 klikken</small></span></a>'+
      '<div class="tgs-hub__t"><img src="'+IC+'sami.webp" alt="" width="52" height="52" loading="lazy"><span><a class="tgs-hub__main" href="/nl/tagra-max/" data-path="large"><b>7 voertuigen en meer</b><small>TAGRA MAX, onbeperkt aantal voertuigen</small></a><small><a class="tgs-hub__q" href="'+quoteHref('TAGRA MAX')+'" data-path="large_quote">Offerte aanvragen</a> · '+PHONE+'</small></span></div>'+
      '<a class="tgs-hub__t" href="#tgs-existing" data-path="existing"><img src="'+IC+'mam.webp" alt="" width="52" height="52" loading="lazy"><span><b>Gebruikt u TAGRA al?</b><small>Verlengen, upgraden, extra hardware</small></span></a>'+
      '</div>';
    ref.parentNode.insertBefore(s,ref.nextSibling);
    s.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[data-path]');if(!a)return;
      var path=a.getAttribute('data-path');
      ga('entry_hub_click',{hub_path:path});
      if(path==='large_quote')ga('quote_click',{tgs_from:'hub',item_name:'TAGRA MAX'});
      var fc=a.getAttribute('data-fc');
      if(fc){try{document.dispatchEvent(new CustomEvent('tgs:fc',{detail:{who:fc}}));}catch(err){}}
    });
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
    var h=document.createElement('div');h.className='tgs-sec tgs-hw';h.innerHTML=head('Programma + hardware','Breid uw tachograafuitrusting uit','Met DOWNLOAD BOX II S downloadt u tachograaf- en bestuurderskaartgegevens: geen jaarlijkse kosten, 24 maanden garantie. Koop het samen met TAGRA en bespaar 49 €.');
    t.parentNode.insertBefore(h,t);t.classList.add('tgs-hide');
    var more=document.createElement('p');more.className='tgs-note';more.innerHTML='Ook verkrijgbaar: <a href="/nl/download-devices/">DOWNLOAD STATION en DOWNLOAD STATION Wi-Fi</a> · <a href="/nl/accessories/">smartcardlezer</a>';
    blk.parentNode.insertBefore(more,blk.nextSibling);
  }

  function enforce(){
    if(!isHP()||document.querySelector('.tgs-enf'))return;
    var w=wel();if(!w)return;
    var N=['FCC Group','CS Cargo a.s.','ČEDOK a.s.','AGRO SERVIS CZ','ČSAD Jihotrans','ČSAD Karviná','Pivovar Holba','PORR a.s.','Klaus Timber a.s.','Mátra Transport a.s.','KAFKA Transport a.s.','DKC s.r.o.','TQM Holding','Synergies Logistiques','ČSAD Autobusy České Budějovice','ČSAD POLKOST','Cargospol','Energie stavební a báňská a.s.','SAP Mimoň'];
    var s=document.createElement('section');s.className='tgs-enf';
    s.innerHTML='<div class="container">'+head('Bewezen in de praktijk','Gebruikt bij controles. Ontwikkeld voor wagenparken.','Dezelfde beoordelingsmethode als die van politie, douane en Arbeidsinspectie in Tsjechië, Slowakije en Hongarije.')+
      '<div class="tgs-ref"><div class="tgs-ref__c tgs-ref__c--cz"><span>Tsjechië</span><b>Politie &amp; douane</b><p>Wegcontroles en controles bij bedrijven in het hele land.</p></div><div class="tgs-ref__c tgs-ref__c--sk"><span>Slowakije</span><b>Arbeidsinspectie</b><p>Controles van rij- en rusttijden en arbeidstijd.</p></div><div class="tgs-ref__c tgs-ref__c--hu"><span>Hongarije</span><b>Controle-instanties en ministeries</b><p>Naleving van regelgeving voor grensoverschrijdend vervoer.</p></div><div class="tgs-ref__c"><span>In heel Centraal-Europa</span><b>Meer dan 20 jaar · meer dan 6.000 wagenparken</b><p>Wegvervoer, bussen en touringcars, verhuur, gemeentelijke wagenparken, werkplaatsen.</p></div></div></div>'+
      '<div class="tgs-mq"><p>Een greep uit de wagenparken en bedrijven die TAGRA al gebruiken</p><div class="tgs-mq__t">'+N.concat(N).map(function(n){return '<span>'+n+'</span>';}).join('')+'</div></div>';
    w.parentNode.insertBefore(s,w);
  }

  function help(){
    if(!isHP()||document.querySelector('.tgs-help'))return;
    var w=wel();if(!w)return;
    var s=document.createElement('section');s.className='tgs-help';s.id='tgs-help';
    s.innerHTML='<div class="container"><div class="tgs-help__box"><div class="tgs-help__txt"><h2>Weet u niet welke TAGRA u moet kiezen?</h2><p>Vertel ons hoeveel voertuigen u beheert en welke downloadapparaten u al hebt. Wij adviseren u over de juiste licentie.</p><p class="tgs-help__sup">Gebruikt u TAGRA al? Technische ondersteuning: <a href="mailto:'+SUPPORT+'">'+SUPPORT+'</a></p></div>'+
      '<div class="tgs-help__card"><img src="'+TA+'img/team/ivan-szabo.webp" alt="Ivan Szabó" width="72" height="72" loading="lazy"><div><b>Ivan Szabó</b><span>Specialist in tachograafgegevens</span><a href="tel:'+PHONE.replace(/\s/g,'')+'">'+PHONE+'</a><a href="mailto:'+SALES+'">'+SALES+'</a></div></div></div></div>';
    w.parentNode.insertBefore(s,w);
  }

  function faq(){
    if(!isHP()||document.querySelector('.tgs-faq'))return;
    var w=wel();if(!w)return;
    var Q=[['Werkt TAGRA in de cloud of wordt het lokaal geïnstalleerd?','TAGRA is een desktopprogramma voor Windows dat op uw computer draait. De gegevens van bestuurders en voertuigen blijven op uw pc.'],
           ['Hoeveel betaal ik na het eerste jaar?','De aankoopprijs omvat het eerste jaar. Vanaf het tweede jaar bedragen de jaarlijkse licentiekosten 19 € (TRUCKER), 79 € (TAGRA 1–2), 99 € (TAGRA 4–6) of 149 € (TAGRA MAX), excl. btw.'],
           ['Zijn de downloadapparaten inbegrepen bij de licentie?','Nee. TAGRA is een programmalicentie. DOWNLOAD BOX II S wordt apart verkocht of samen met TAGRA in een bundel die 49 € goedkoper is dan wanneer u beide producten afzonderlijk koopt.'],
           ['Kan mijn bedrijf kopen met 0% btw?','Ja. Bedrijven met een geldig btw-nummer kopen met 0% btw volgens de verleggingsregeling. Vul uw btw-nummer in tijdens het afrekenen.'],
           ['Kan ik TAGRA proberen voordat ik het koop?','Ja. De gratis proefversie van 30 dagen biedt alle functies van TAGRA MAX en vereist geen creditcard.'],
           ['Welke tachografen ondersteunt TAGRA?','Alle digitale tachografen, inclusief de slimme tachograaf G2V2. TAGRA leest .DDD-, .C1B-, .V1B- en ESM-bestanden.']];
    var s=document.createElement('section');s.className='tgs-sec tgs-faq';
    s.innerHTML='<div class="container">'+head('Vragen','Vragen vóór aankoop','')+'<div class="tgs-faq__b">'+Q.map(function(q){return '<details><summary>'+q[0]+'</summary><div class="tgs-faq__a">'+q[1]+'</div></details>';}).join('')+'</div></div>';
    w.parentNode.insertBefore(s,w);
    var ld={'@context':'https://schema.org','@type':'FAQPage','mainEntity':Q.map(function(q){return {'@type':'Question','name':q[0],'acceptedAnswer':{'@type':'Answer','text':q[1]}};})};
    var sc=document.createElement('script');sc.type='application/ld+json';sc.text=JSON.stringify(ld);document.head.appendChild(sc);
  }

  function seo(){
    var w=document.querySelector('.type-index .welcome');if(!w||w.querySelector('.tgs-more'))return;
    var body=w.querySelector('.h1+div')||w.children[1];if(!body)return;
    body.classList.add('tgs-clamp');
    var b=document.createElement('button');b.type='button';b.className='tgs-more';b.textContent='Meer lezen';
    b.onclick=function(){body.classList.toggle('open');b.textContent=body.classList.contains('open')?'Minder weergeven':'Meer lezen';};
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
    ul.innerHTML='<li><span><b>0% btw</b> voor bedrijven in de EU met een geldig btw-nummer (verleggingsregeling)</span></li>'+
      (soft?'<li><span><b>Licentie per e-mail verzonden</b> – eerste licentiejaar inbegrepen</span></li>':'<li><span><b>Gratis verzending in de hele EU</b> – 24 maanden garantie</span></li>')+
      '<li><span><b>Rechtstreeks van de fabrikant</b> – Truck Data Technology, sinds 2005 op de markt</span></li>'+
      '<li><span>Vragen? <a href="mailto:'+SALES+'">'+SALES+'</a> · ondersteuning in het Nederlands per e-mail en chat</span></li>';
    var ref=w.querySelector('.p-short-description');
    if(ref&&ref.parentNode===w){w.insertBefore(ul,ref.nextSibling);}else{w.appendChild(ul);}
  }

  function reg(){var w=document.createTreeWalker(document.body,4),n;while(n=w.nextNode()){if(n.nodeValue.indexOf('Registrace bude')>-1)n.nodeValue='(Uw registratie wordt binnenkort goedgekeurd)';}}
  function run(){
    (HOME2?[hero,pricing,hwnote,badges,groups,enforce,help,faq,seo,mails,trust,reg]:[carousel,usp,trustbar,hub,steps,vans,pricing,badges,groups,enforce,help,faq,seo,mails,trust,reg]).forEach(function(fn){try{fn();}catch(e){if(window.console)console.warn('tgs',e);}});
    document.body.classList.add('tgs-v6');if(HOME2&&isHP())document.body.classList.add('tgs-home2');
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
