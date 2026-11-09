/* TAGRA Shop – shop-dev.js v1.1 (9. 11. 2026: footer links keep the /de/ or /hu/ prefix) | v1.0 (9. 11. 2026)
   Libor 9. 11.: DOWNLOAD BOX II S is THE product (featured full-width card, Bestseller); wall stations stay as a smaller depot option;
   DKV LIVE® callout on Download devices + TAGRA software categories; current menu item = full green field.
   1) Navigation: no permanently green "TAGRA software" item – the green field moves to the page you are on (all pages).
   2) Category "Download devices" (id-708, every language): without catalogue chrome (bestsellers widget, sorting, filter),
      role labels on the cards, Bestseller badge + rating on DOWNLOAD BOX II S, comparison table,
      DOWNLOAD BOX II S reviews from TRUCKMALL.cz (source + translation disclosed, NO rating schema – Google policy).
   UX: crew GPT + Gemini + Grok, 9. 11. 2026. Translations DE/HU: crew GPT + Gemini. */
(function(){
  if(window.tgsDev)return;window.tgsDev=1;
  var d=document,L=(d.documentElement.getAttribute('lang')||'en').slice(0,2).toLowerCase();
  var T={
    en:{r1:'It is a reliable device with simple operation. A plus is that it meets the requirements of even the latest tachographs.',r2:'Delivery was prompt, the key downloads data quickly, and the long cable is a big advantage.',r3:'A small, compact key with intuitive controls. We are satisfied.',r4:'I am satisfied, the product is of good quality and I will gladly recommend you to people I know.',choose:'Which device is right for you?',role1:'Portable download key',role2:'Lockable wall station',role3:'Wall station with Wi-Fi',best:'Bestseller',rt:'96 % · 21 reviews',rt_aria:'96 % average customer rating from 21 reviews',cmp_lbl:'Compare',cmp_h:'Download devices side by side',row_where:'Where you use it',v_cab:'In the cab – anywhere',v_depot:'At the depot',row_card:'Driver cards',v_card1:'Built-in card reader',v_card2:'Drivers download their own cards',row_pc:'Transfer to your PC',v_usb:'USB',v_usb2:'USB (removable DOWNLOAD BOX II S)',v_wifi:'Automatically over Wi-Fi to your company network',row_g2:'Smart tachographs incl. G2v2',row_fee:'Annual fee',v_none:'None',row_war:'Warranty',v_war:'24 months',row_price:'Price excl. VAT',details:'Details',rev_lbl:'Customer reviews',rev_h:'What customers say about DOWNLOAD BOX II S',rev_intro:'96 % average rating from 21 reviews on TRUCKMALL.cz, our Czech shop (Truck Data Technology). Selected reviews collected via Zboží.cz, translated from Czech.',rev_src:'See the original reviews',yes:'Yes',depot:'For the depot: wall stations',dkv_lbl:'DKV LIVE® integration',dkv_h:'Using DKV LIVE®? Data flows straight into TAGRA.',dkv_p:'TAGRA imports tachograph and driver card data from DKV LIVE® automatically, on the schedule you choose – no download device, no manual file transfers.',dkv_a:'How the DKV LIVE® integration works',dkv_u:'https://tagra.app/integrations/dkv-live/'},
    de:{r1:'Es handelt sich um ein zuverlässiges Gerät mit einfacher Bedienung. Ein Pluspunkt ist, dass es auch die Anforderungen modernster Fahrtenschreiber erfüllt.',r2:'Die Lieferung erfolgte umgehend, der Downloadschlüssel lädt die Daten schnell herunter und das lange Kabel ist ein großer Vorteil.',r3:'Ein kleiner, kompakter Downloadschlüssel mit intuitiver Bedienung. Wir sind zufrieden.',r4:'Ich bin zufrieden, das Produkt ist von guter Qualität und ich empfehle Sie gerne meinen Bekannten weiter.',choose:'Welches Gerät ist das richtige für Sie?',role1:'Mobiler Downloadschlüssel',role2:'Abschließbare Wandstation',role3:'Wandstation mit WLAN',best:'Bestseller',rt:'96 % · 21 Bewertungen',rt_aria:'96 % durchschnittliche Kundenbewertung aus 21 Bewertungen',cmp_lbl:'Vergleich',cmp_h:'Downloadgeräte im direkten Vergleich',row_where:'Einsatzort',v_cab:'Im Fahrerhaus – überall',v_depot:'Auf dem Betriebshof',row_card:'Fahrerkarten',v_card1:'Integrierter Kartenleser',v_card2:'Fahrer lesen ihre Karten selbst aus',row_pc:'Übertragung auf Ihren PC',v_usb:'USB',v_usb2:'USB (herausnehmbare DOWNLOAD BOX II S)',v_wifi:'Automatisch per WLAN in Ihr Firmennetzwerk',row_g2:'Intelligente Fahrtenschreiber inkl. G2v2',row_fee:'Jahresgebühr',v_none:'Keine',row_war:'Garantie',v_war:'24 Monate',row_price:'Preis zzgl. MwSt.',details:'Details',rev_lbl:'Kundenbewertungen',rev_h:'Das sagen Kunden über die DOWNLOAD BOX II S',rev_intro:'96 % durchschnittliche Bewertung aus 21 Bewertungen auf TRUCKMALL.cz, unserem tschechischen Shop (Truck Data Technology). Ausgewählte, über Zboží.cz gesammelte Bewertungen, aus dem Tschechischen übersetzt.',rev_src:'Originalbewertungen ansehen',yes:'Ja',depot:'Für den Betriebshof: Wandstationen',dkv_lbl:'DKV LIVE®-Integration',dkv_h:'Nutzen Sie DKV LIVE®? Ihre Daten fließen direkt in TAGRA.',dkv_p:'TAGRA importiert Fahrtenschreiber- und Fahrerkartendaten automatisch aus DKV LIVE® – nach dem von Ihnen gewählten Zeitplan, ohne Downloadgerät und ohne manuelle Dateiübertragung.',dkv_a:'So funktioniert die DKV LIVE®-Integration',dkv_u:'https://tagra.app/de/schnittstellen/dkv-live/'},
    hu:{r1:'Megbízható, egyszerűen kezelhető készülék. Előnye, hogy még a legmodernebb tachográfok követelményeinek is megfelel.',r2:'A kiszállítás gyors volt, a letöltőkulcs gyorsan tölti le az adatokat, és a hosszú kábel nagy előny.',r3:'Kicsi, kompakt letöltőkulcs intuitív kezeléssel. Elégedettek vagyunk.',r4:'Elégedett vagyok, a termék jó minőségű, és szívesen ajánlom Önöket az ismerőseimnek.',choose:'Melyik készülék a megfelelő Önnek?',role1:'Hordozható letöltőkulcs',role2:'Zárható fali állomás',role3:'Fali állomás Wi-Fi-vel',best:'Legnépszerűbb',rt:'96 % · 21 értékelés',rt_aria:'96 %-os átlagos vásárlói értékelés 21 értékelés alapján',cmp_lbl:'Összehasonlítás',cmp_h:'Letöltőkészülékek összehasonlítása',row_where:'Használat helye',v_cab:'A vezetőfülkében – bárhol',v_depot:'A telephelyen',row_card:'Járművezetői kártyák',v_card1:'Beépített kártyaolvasó',v_card2:'A járművezetők maguk töltik le a kártyájuk adatait',row_pc:'Adatátvitel a számítógépre',v_usb:'USB',v_usb2:'USB (kivehető DOWNLOAD BOX II S)',v_wifi:'Automatikusan, Wi-Fi-n keresztül a vállalati hálózatra',row_g2:'Intelligens tachográfok, beleértve a G2v2-t',row_fee:'Éves díj',v_none:'Nincs',row_war:'Garancia',v_war:'24 hónap',row_price:'Nettó ár',details:'Részletek',rev_lbl:'Vásárlói értékelések',rev_h:'Vásárlóink véleménye a DOWNLOAD BOX II S készülékről',rev_intro:'96 %-os átlagos értékelés 21 értékelés alapján a TRUCKMALL.cz cseh webáruházunkban (Truck Data Technology). Válogatott, a Zboží.cz oldalon gyűjtött értékelések, cseh nyelvből fordítva.',rev_src:'Eredeti értékelések megtekintése',yes:'Igen',depot:'A telephelyre: fali állomások',dkv_lbl:'DKV LIVE®-integráció',dkv_h:'Ön DKV LIVE®-ot használ? Adatai közvetlenül a TAGRA rendszerbe kerülnek.',dkv_p:'A TAGRA automatikusan importálja a tachográf- és járművezetői kártyaadatokat a DKV LIVE® rendszerből, az Ön által választott ütemezés szerint – letöltőeszköz és kézi fájlátvitel nélkül.',dkv_a:'Így működik a DKV LIVE®-integráció',dkv_u:'https://tagra.app/hu/integraciok/dkv-live/'}
  };
  var t=T[L]||T.en;
  var SRC='https://www.truckmall.cz/download-box-ii-s-p230206/';
  var REV=[['r1','Jaromír S.','2025-02-27'],['r2','Alena V.','2025-03-10'],['r3','Miloš W.','2024-08-07'],['r4','Vlastimil P.','2024-02-12']];
  var NAV='html body #navigation .menu-level-1>li',NAVH='html.tgs-hd body #navigation .menu-level-1>li';
  var css=
  /* nav – desktop: transparent items, the page you are on = full green field (Libor 9. 11.) */
  '@media (min-width:768px){'+
   NAV+'.menu-item-705>a:not(.active),'+NAV+':first-child>a:not(.active),'+NAVH+'.menu-item-705>a:not(.active),'+NAVH+':first-child>a:not(.active){background:transparent!important}'+
   NAV+'.menu-item-705>a:not(.active):hover,'+NAV+':first-child>a:not(.active):hover,'+NAVH+'.menu-item-705>a:not(.active):hover,'+NAVH+':first-child>a:not(.active):hover{background:rgba(255,255,255,.08)!important}'+
   NAV+'>a.active,'+NAVH+'>a.active{background:linear-gradient(135deg,var(--green-brand,#8cc63f) 0%,var(--green-cta,#5c820f) 100%)!important;box-shadow:none!important;color:#fff!important}'+
   NAV+'>a.active:hover,'+NAVH+'>a.active:hover{background:linear-gradient(135deg,#79a517 0%,#4f700d 100%)!important}'+
   NAV+'>a:focus-visible,'+NAVH+'>a:focus-visible{outline:2px solid #fff;outline-offset:-4px}'+
  '}'+
  /* nav – mobile (white menu): no green fill unless active */
  '@media (max-width:767px){'+
   NAV+'.menu-item-705>a:not(.active),'+NAV+':first-child>a:not(.active),'+NAVH+'.menu-item-705>a:not(.active),'+NAVH+':first-child>a:not(.active){background:transparent!important;color:inherit!important}'+
   NAV+'>a.active,'+NAVH+'>a.active{box-shadow:inset 4px 0 0 #8cc63f!important}'+
  '}'+
  /* category Download devices */
  'body.tgs-devcat .products-top-wrapper,body.tgs-devcat #category-header,body.tgs-devcat #filters-wrapper,body.tgs-devcat .filters-wrapper,body.tgs-devcat .listingControls{display:none!important}'+
  '.tgs-dev-k{display:block;margin:6px 0 14px}'+
  '.tgs-dev-role{margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5c820f}'+
  'body.tgs-devcat #products .product .p{position:relative}'+
  'body.tgs-devcat #products .product.tgs-dev-best .p{box-shadow:0 0 0 2px #8cc63f,0 14px 34px rgba(11,42,74,.10)!important;border-radius:18px}'+
  '.tgs-dev-badge{position:absolute;top:14px;left:14px;z-index:3;padding:6px 12px;border-radius:999px;background:#5c820f;color:#fff;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 6px 14px rgba(92,130,15,.28)}'+
  '.tgs-dev-rt{display:inline-flex;align-items:center;gap:8px;margin:4px 0 2px;font-size:14px;font-weight:600;color:#0b2c4a!important;text-decoration:none!important}'+
  '.tgs-dev-rt:hover{text-decoration:underline!important}'+
  '.tgs-dev-st{font-size:16px;letter-spacing:1px;background:linear-gradient(90deg,#f5a623 96%,#cfd8e3 96%);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1}'+
  '@media (min-width:992px){'+
   'body.tgs-devcat #products{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:0!important}'+
   'body.tgs-devcat #products>.product{width:auto!important;max-width:none!important;flex:none!important;margin:0!important}'+
   'body.tgs-devcat #products>.product.tgs-dev-best{grid-column:1/-1}'+
   'body.tgs-devcat #products>.tgs-dev-best .p{display:grid!important;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);align-items:center;height:auto!important}'+
   'body.tgs-devcat #products>.tgs-dev-best .p>a.image{grid-row:1/span 2;height:100%!important;min-height:360px;display:flex!important;align-items:center;justify-content:center}'+
   'body.tgs-devcat #products>.tgs-dev-best .p>a.image img{max-height:320px!important;width:auto!important}'+
   'body.tgs-devcat #products>.tgs-dev-best .p-in{padding:36px 44px!important}'+
   'body.tgs-devcat #products>.tgs-dev-best a.name{font-size:30px!important;line-height:1.15}'+
   'body.tgs-devcat #products>.tgs-dev-best .tgs-dev-role{font-size:13px}'+
   'body.tgs-devcat #products>.tgs-dev-best .p-desc{font-size:16px!important;line-height:1.55}'+
   'body.tgs-devcat #products>.tgs-dev-best .tgs-dev-badge{top:20px;left:20px;font-size:13px;padding:7px 14px}'+
  '}'+
  /* station photos have wide empty margins – zoom them so the station (which holds a DOWNLOAD BOX II S) reads bigger than the key (Libor 9. 11.) */
  'body.tgs-devcat #products>.product.tgs-dev-st2 .p>a.image{height:320px!important;overflow:hidden;display:flex!important;align-items:center;justify-content:center}'+
  'body.tgs-devcat #products>.product.tgs-dev-st2 .p>a.image img{height:320px!important;max-height:none!important;width:auto!important;max-width:none!important;transform:scale(1.55);transform-origin:50% 55%;mix-blend-mode:multiply}'+
  '@media (max-width:767px){body.tgs-devcat #products>.product.tgs-dev-st2 .p>a.image{height:220px!important}body.tgs-devcat #products>.product.tgs-dev-st2 .p>a.image img{height:220px!important;transform:scale(1.35)}}'+
  '.tgs-dev-depot{grid-column:1/-1;display:block;margin:22px 0 2px;font-size:15px;font-weight:700;color:#0b2c4a}'+
  '.tgs-dev-dkv{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:22px;align-items:center;margin:40px 0 8px;padding:26px 30px;border:1px solid #dbe6ee;border-radius:20px;background:linear-gradient(180deg,#f5f9fc 0%,#eaf3f8 35%,#dcecf6 70%,#eef5f9 100%)}'+
  '.tgs-dev-dkv__i{width:96px;height:96px;display:block;mix-blend-mode:multiply}'+
  '.tgs-dev-dkv h2{margin:4px 0 6px!important;font-size:22px!important;line-height:1.25;text-transform:none!important;color:#0b2c4a}'+
  '.tgs-dev-dkv p{margin:0;font-size:15px;line-height:1.55;color:#33414d}'+
  '.tgs-dev-dkv__a{white-space:nowrap}'+
  '@media (max-width:767px){.tgs-dev-dkv__i{width:72px;height:72px}.tgs-dev-dkv{grid-template-columns:1fr;padding:22px 20px;gap:12px}.tgs-dev-dkv__a{white-space:normal}}'+
  '.tgs-dev-cmp{margin:48px 0 8px}'+
  '.tgs-dev-cmp h2{margin:4px 0 18px}'+
  '.tgs-dev-tw{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #dbe6ee;border-radius:18px;background:#fff}'+
  '.tgs-dev-t{width:100%;min-width:640px;border-collapse:collapse;font-size:15px;line-height:1.45}'+
  '.tgs-dev-t th,.tgs-dev-t td{padding:14px 18px;text-align:left;vertical-align:top;border-top:1px solid #e6edf3}'+
  '.tgs-dev-t thead th{border-top:0;background:linear-gradient(180deg,#f5f9fc 0%,#eaf3f8 100%);vertical-align:bottom}'+
  '.tgs-dev-t thead th a{display:block;color:#0b2c4a!important;font-weight:800;text-decoration:none!important}'+
  '.tgs-dev-t thead th span{display:block;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#5c820f;margin-bottom:2px}'+
  '.tgs-dev-t tbody th{width:24%;font-weight:700;color:#0b2c4a;background:#fafcfd;position:sticky;left:0}'+
  '.tgs-dev-t .tgs-dev-c0{background:rgba(140,198,63,.07)}'+
  '.tgs-dev-t thead .tgs-dev-c0{background:linear-gradient(180deg,#f3f9e8 0%,#e7f3d3 100%)}'+
  '.tgs-dev-t .tgs-dev-y{color:#5c820f;font-weight:700}'+
  '.tgs-dev-t .tgs-dev-pr{font-size:18px;font-weight:800;color:#0b2c4a}'+
  '.tgs-dev-t .tgs-dev-go{display:inline-block;margin-top:6px;font-size:14px;font-weight:700;color:#134a8e!important}'+
  '.tgs-dev-rev{margin:48px 0 8px}'+
  '.tgs-dev-rev .tgs-dev-rsrc{display:inline-block;margin-top:6px;font-weight:700;color:#134a8e!important}'+
  '.tgs-dev-rg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:22px}'+
  '.tgs-dev-rc{margin:0;padding:22px;border:1px solid #dbe6ee;border-radius:18px;background:linear-gradient(180deg,#f5f9fc 0%,#eef5f9 100%)}'+
  '.tgs-dev-rc .tgs-dev-st{font-size:15px;background:none;color:#f5a623}'+
  '.tgs-dev-rc p{margin:10px 0 12px;font-size:15px;line-height:1.55;color:#1d1d1f}'+
  '.tgs-dev-rc footer{font-size:13px;color:#5f6b76}'+
  '@media (max-width:991px){.tgs-dev-rg{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
  '@media (max-width:767px){.tgs-dev-rg{grid-template-columns:1fr}.tgs-dev-t th,.tgs-dev-t td{padding:12px 14px;font-size:14px}.tgs-dev-badge{top:10px;left:10px;font-size:11px;padding:5px 10px}}';
  var st=d.createElement('style');st.id='tgs-dev-css';st.textContent=css;(d.head||d.documentElement).appendChild(st);

  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function nm(c){return ((c.querySelector('a.name')||{}).textContent||'').replace(/\s+/g,' ').trim().toUpperCase();}
  function kind(c){var n=nm(c);if(n==='DOWNLOAD BOX II S')return 0;if(/WI-?FI/.test(n)&&/STATION/.test(n))return 2;if(/STATION/.test(n))return 1;return -1;}
  function stars(){return '<span class="tgs-dev-st" aria-hidden="true">★★★★★</span>';}
  function ga(n,p){try{if(window.gtag)gtag('event',n,p||{});else (window.dataLayer=window.dataLayer||[]).push(Object.assign({event:n},p||{}));}catch(e){}}

  function cat(){
    var b=d.body;if(!b||!b.classList.contains('id-708')||!b.classList.contains('type-category'))return false;
    var list=d.getElementById('products');if(!list)return false;
    if(d.querySelector('.tgs-dev-cmp'))return true;
    b.classList.add('tgs-devcat');
    var cards=[].slice.call(list.querySelectorAll('.product')),by=[];
    cards.forEach(function(c){var k=kind(c);if(k>=0&&!by[k])by[k]=c;});
    cards.sort(function(a,c){var x=kind(a),y=kind(c);return (x<0?9:x)-(y<0?9:y);}).forEach(function(c){list.appendChild(c);});
    var roles=[t.role1,t.role2,t.role3];
    by.forEach(function(c,k){
      if(!c)return;var nmEl=c.querySelector('a.name');
      if(nmEl&&!c.querySelector('.tgs-dev-role')){var r=d.createElement('p');r.className='tgs-dev-role';r.textContent=roles[k];nmEl.parentNode.insertBefore(r,nmEl);}
      if(k>0)c.classList.add('tgs-dev-st2');
      if(k===0){
        c.classList.add('tgs-dev-best');
        var p=c.querySelector('.p');if(p&&!p.querySelector('.tgs-dev-badge')){var bd=d.createElement('span');bd.className='tgs-dev-badge';bd.textContent=t.best;p.insertBefore(bd,p.firstChild);}
        if(nmEl&&!c.querySelector('.tgs-dev-rt')){var a=d.createElement('a');a.className='tgs-dev-rt';a.href='#tgs-dev-rev';a.setAttribute('aria-label',t.rt_aria);a.innerHTML=stars()+'<span>'+esc(t.rt)+'</span>';a.addEventListener('click',function(){ga('dev_rating_click',{list:'download_devices'});});nmEl.parentNode.insertBefore(a,nmEl.nextSibling);}
      }
    });
    var fs=by[1]||by[2];if(fs&&by[0]&&!list.querySelector('.tgs-dev-depot')){var dp=d.createElement('p');dp.className='tgs-dev-depot';dp.textContent=t.depot;list.insertBefore(dp,fs);}
    var k=d.createElement('span');k.className='tgs-label tgs-dev-k';k.textContent=t.choose;list.parentNode.insertBefore(k,list);

    /* comparison table */
    var cols=[0,1,2].filter(function(i){return by[i];});
    if(cols.length>1){
      function href(i){var a=by[i].querySelector('a.name');return a?a.getAttribute('href'):'#';}
      function name(i){return ((by[i].querySelector('a.name')||{}).textContent||'').replace(/\s+/g,' ').trim();}
      function price(i){var s=by[i].querySelector('.price-final strong');return s?s.textContent.trim():'';}
      var V={where:[t.v_cab,t.v_depot,t.v_depot],card:[t.v_card1,t.v_card2,t.v_card2],pc:[t.v_usb,t.v_usb2,t.v_wifi]};
      function row(lbl,fn,cls){return '<tr><th scope="row">'+esc(lbl)+'</th>'+cols.map(function(i){return '<td class="'+(i===0?'tgs-dev-c0 ':'')+(cls||'')+'">'+fn(i)+'</td>';}).join('')+'</tr>';}
      var h='<span class="tgs-label">'+esc(t.cmp_lbl)+'</span><h2 class="tgs-h2">'+esc(t.cmp_h)+'</h2><div class="tgs-dev-tw" tabindex="0" role="region" aria-label="'+esc(t.cmp_h)+'"><table class="tgs-dev-t"><thead><tr><td></td>'+
        cols.map(function(i){return '<th scope="col" class="'+(i===0?'tgs-dev-c0':'')+'"><span>'+esc(i===0?t.best:roles[i])+'</span><a href="'+esc(href(i))+'">'+esc(name(i))+'</a></th>';}).join('')+'</tr></thead><tbody>'+
        row(t.row_where,function(i){return esc(V.where[i]);})+
        row(t.row_card,function(i){return esc(V.card[i]);})+
        row(t.row_pc,function(i){return esc(V.pc[i]);})+
        row(t.row_g2,function(){return '✓ '+esc(t.yes);},'tgs-dev-y')+
        row(t.row_fee,function(){return esc(t.v_none);},'tgs-dev-y')+
        row(t.row_war,function(){return esc(t.v_war);})+
        row(t.row_price,function(i){return '<span class="tgs-dev-pr">'+esc(price(i))+'</span><br><a class="tgs-dev-go" href="'+esc(href(i))+'" data-dev="'+i+'">'+esc(t.details)+' →</a>';})+
        '</tbody></table></div>';
      var s=d.createElement('section');s.className='tgs-dev-cmp';s.innerHTML=h;
      s.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a)ga('dev_compare_click',{item:(a.textContent||'').trim().slice(0,40)});});
      list.parentNode.insertBefore(s,list.nextSibling);
      var anchor=s;
    }

    var dk=dkvBox();(anchor||list).parentNode.insertBefore(dk,(anchor||list).nextSibling);anchor=dk;

    /* reviews: DOWNLOAD BOX II S (replaces the TAGRA software review loop on this page) */
    var rv=d.createElement('section');rv.className='tgs-rev tgs-dev-rev';rv.id='tgs-dev-rev';
    rv.innerHTML='<div class="tgs-head"><span class="tgs-label">'+esc(t.rev_lbl)+'</span><h2 class="tgs-h2">'+esc(t.rev_h)+'</h2><p class="tgs-intro"><a class="tgs-dev-rt" href="'+SRC+'" target="_blank" rel="noopener" aria-label="'+esc(t.rt_aria)+'">'+stars()+'<span>'+esc(t.rt)+'</span></a><br>'+esc(t.rev_intro)+'<br><a class="tgs-dev-rsrc" href="'+SRC+'" target="_blank" rel="noopener">'+esc(t.rev_src)+' ↗</a></p></div>'+
      '<div class="tgs-dev-rg">'+REV.map(function(r){var dt=r[2];try{dt=new Date(r[2]+'T12:00:00').toLocaleDateString(d.documentElement.getAttribute('lang')||'en',{day:'numeric',month:'short',year:'numeric'});}catch(e){}return '<blockquote class="tgs-dev-rc"><span class="tgs-dev-st" aria-label="5/5">★★★★★</span><p>'+esc(t[r[0]])+'</p><footer>'+esc(r[1])+' · '+esc(dt)+' · TRUCKMALL.cz</footer></blockquote>';}).join('')+'</div>';
    [].forEach.call(d.querySelectorAll('.tgs-rev:not(.tgs-dev-rev)'),function(x){x.parentNode.removeChild(x);});
    (anchor||list).parentNode.insertBefore(rv,(anchor||list).nextSibling);
    return true;
  }
  /* DKV LIVE® callout – no device needed when the fleet already uses DKV LIVE (Libor 9. 11.) */
  function dkvBox(){
    var s=d.createElement('section');s.className='tgs-dev-dkv';
    s.innerHTML='<img class="tgs-dev-dkv__i" src="https://wuswoaicjtuodzmrjwgf.supabase.co/storage/v1/object/public/site/tagra-shop/icons/dkv-live-256.webp" srcset="https://wuswoaicjtuodzmrjwgf.supabase.co/storage/v1/object/public/site/tagra-shop/icons/dkv-live-256.webp 1x, https://wuswoaicjtuodzmrjwgf.supabase.co/storage/v1/object/public/site/tagra-shop/icons/dkv-live-512.webp 2x" width="96" height="96" alt="" loading="lazy" decoding="async">'+
      '<div><span class="tgs-label">'+esc(t.dkv_lbl)+'</span><h2>'+esc(t.dkv_h)+'</h2><p>'+esc(t.dkv_p)+'</p></div>'+
      '<a class="tgs-pill tgs-pill--ghost tgs-dev-dkv__a" href="'+esc(t.dkv_u)+'">'+esc(t.dkv_a)+' →</a>';
    s.querySelector('a').addEventListener('click',function(){ga('dkv_click',{page:location.pathname});});
    return s;
  }
  function softCat(){
    var b=d.body;if(!b||!b.classList.contains('id-705')||!b.classList.contains('type-category')||d.querySelector('.tgs-dev-dkv'))return;
    var list=d.getElementById('products');if(!list)return;list.parentNode.insertBefore(dkvBox(),list.nextSibling);
  }
  function killSoftwareReviews(){if(!d.querySelector('.tgs-dev-rev'))return;[].forEach.call(d.querySelectorAll('.tgs-rev:not(.tgs-dev-rev)'),function(x){x.parentNode.removeChild(x);});}
  /* footer (Shoptet HTML code, same for all languages): internal links get the /de/ or /hu/ prefix so DE/HU customers stay in their language */
  function footLinks(){
    var P=L==='de'?'/de':L==='hu'?'/hu':'';if(!P)return;
    [].forEach.call(d.querySelectorAll('.tgs-footer a[href^="/"]'),function(a){var h=a.getAttribute('href');if(/^\/\//.test(h)||/^\/(de|hu|admin|user)(\/|$)/.test(h))return;a.setAttribute('href',P+h);});
  }
  function run(){cat();softCat();footLinks();killSoftwareReviews();}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',run);else run();
  setTimeout(killSoftwareReviews,1200);setTimeout(killSoftwareReviews,3000);
})();
