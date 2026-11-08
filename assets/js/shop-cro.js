/* TAGRA Shop – conversion layer v1.1 (8. 11. 2026; v1.1 = DE texts, see below), loaded by shop3.js on every page. v1.2: phone required on checkout step 2 only for parcel orders (Shoptet field is optional since 8. 11.). Styles: shop.css v6.3 (head, so nothing jumps).
   1) sticky buy bar on product pages (name, price excl. VAT, Add to cart = the native Shoptet button, so GA4 add_to_cart stays single)
   2) "Get a quote" next to Add to cart on TAGRA MAX and TAGRA MAX + DOWNLOAD BOX II S
   3) after add to cart: panel "Go to cart / Continue shopping" (Shoptet only showed a thin bar over the header)
   4) cart: delivery note for licences / hardware (replaces the leftover "Extras and discounts / You have free delivery!")
   5) 404 and /search/: the four categories instead of a dead end (Shoptet search returns no products)
   6) cookie bar height -> --tgs-cb (checkout gets room to scroll past the bar on phones)
   GA4 events go through gtag with send_to 'GA4' (Shoptet config uses groups:'GA4'; plain dataLayer objects never reach GA4):
   sticky_atc_click, atc_panel_click, quote_click, phone_click.
   v1.1 (8. 11. 2026): texts by <html lang> – EN default (output unchanged), DE dictionary (crew GPT + Gemini); DE price parsing "1.234,56 €". */
(function(){
  'use strict';
  if(window.tgsCro)return;
  window.tgsCro=true;
  var SALES='sales@tagra.app',PHONE='+420 739 005 345';
  var d=document,html=d.documentElement,body=d.body;
  /* i18n: EN strings stay inline (EN = default, byte-identical output); other shop languages override by key */
  var LG=(html.getAttribute('lang')||'en').slice(0,2).toLowerCase(),DE=LG==='de';
  var I18N={de:{cat1:'TAGRA Programm',cat1s:'Lizenzen nach Fuhrparkgröße',cat2:'Download-Geräte',cat2s:'DOWNLOAD BOX II S und Stationen',cat3:'Programm + Gerät als Bundle',cat3s:'Programm und Gerät · 49 € sparen',cat4:'Zubehör',cat4s:'Chipkartenleser',cats_aria:'Shop-Kategorien',quote:'Angebot anfordern',buy_aria:'{name} kaufen',excl:'zzgl. MwSt.',chat_aria:'Chatten Sie mit uns',atc:'In den Warenkorb',note_lic:'Lizenz per E-Mail',note_hw:'Versand innerhalb von 3 Werktagen',go_cart:'Zum Warenkorb',toast_t:'Zum Warenkorb hinzugefügt',toast_c:'Weiter einkaufen',close:'Schließen',cart_lic:'<b>Lizenz per E-Mail – keine Versandkosten.</b> Versand innerhalb von 2 Werktagen, bei Kartenzahlung meist noch am selben Tag.',cart_ship:'<b>Versand 8,18 € zzgl. MwSt.</b> (ca. 10 € inkl. MwSt.) · Versand innerhalb von 3 Werktagen · Lieferung in 2–5 Tagen.',cart_lic2:'Lizenzen werden innerhalb von 2 Werktagen per E-Mail versendet, bei Kartenzahlung meist noch am selben Tag.',cart_vat:'Preis zzgl. MwSt. Die MwSt. Ihres Lieferlandes wird im Bestellvorgang berechnet; EU-Unternehmen mit gültiger USt-IdNr. zahlen 0 % (Reverse-Charge).',nf_h:'Seite nicht gefunden',nf_p:'Die Seite wurde möglicherweise verschoben oder existiert nicht mehr. Wählen Sie unten eine Kategorie oder testen Sie TAGRA kostenlos.',try30:'TAGRA 30 Tage kostenlos testen',sr_h:'Kategorien durchsuchen',q_subj:'Angebotsanfrage – {prod}',ph_msg:'Bitte geben Sie eine Telefonnummer an – der Paketdienst benötigt sie für die Zustellung.',sr_p:'Wählen Sie unten eine Kategorie, um das passende Produkt zu finden.'}};
  var I=I18N[LG]||{};
  function t(k,en){return I.hasOwnProperty(k)?I[k]:en;}
  var tr=t; /* alias for toast(), where the local var t is the panel element */
  var CATS=[['/tagra-software/',t('cat1','TAGRA software'),t('cat1s','Licences by fleet size')],['/download-devices/',t('cat2','Download devices'),t('cat2s','DOWNLOAD BOX II S and stations')],
            ['/software-device-bundles/',t('cat3','Software + device bundles'),t('cat3s','Program and device · save €49')],['/accessories/',t('cat4','Accessories'),t('cat4s','Smart card reader')]];
  var LIC=/\/tagra-(1|2|4|6|max)\/$/;

  function ga(ev,p){
    if(typeof window.tgsGa==='function'){window.tgsGa(ev,p);return;}
    p=p||{};try{window.dataLayer=window.dataLayer||[];var o={event:ev},k;for(k in p)o[k]=p[k];window.dataLayer.push(o);}catch(e){}
    try{if(typeof window.gtag==='function'){var q={send_to:'GA4',transport_type:'beacon'},k2;for(k2 in p)q[k2]=p[k2];window.gtag('event',ev,q);}}catch(e){}
  }
  function quoteHref(prod){
    if(typeof window.tgsQuoteHref==='function')return window.tgsQuoteHref(prod);
    return 'mailto:'+SALES+'?subject='+encodeURIComponent(DE?t('q_subj','').split('{prod}').join(prod):'Quote request – '+prod);
  }
  function el(tag,cls,txt){var e=d.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  function txt(e){return ((e&&e.textContent)||'').replace(/\s+/g,' ').trim();}
  function isMob(){return !(window.matchMedia&&matchMedia('(min-width:768px)').matches);}
  function path(u){try{return new URL(u,location.href).pathname;}catch(e){return '';}}
  function cats(){return '<nav class="tgs-cats" aria-label="'+t('cats_aria','Shop categories')+'">'+CATS.map(function(c){return '<a href="'+c[0]+'"><b>'+c[1]+'</b><small>'+c[2]+'</small></a>';}).join('')+'</nav>';}

  /* ---------- 6) cookie bar height ---------- */
  function cookieBar(){
    var t0=Date.now(),last=-1,iv;
    function check(){
      var c=d.querySelector('.js-siteCookies,.siteCookies'),h=0;
      if(c){var cs=getComputedStyle(c),r=c.getBoundingClientRect();if(cs.display!=='none'&&cs.visibility!=='hidden'&&r.height>0&&r.top<innerHeight)h=Math.round(r.height);}
      if(h!==last){last=h;html.style.setProperty('--tgs-cb',h+'px');html.classList.toggle('tgs-cb-on',h>0);}
      if(!h&&Date.now()-t0>8000&&iv){clearInterval(iv);iv=null;}
    }
    check();iv=setInterval(check,600);
    d.addEventListener('click',function(){setTimeout(check,350);setTimeout(check,1200);},true);
    window.addEventListener('resize',check,{passive:true});
  }

  /* ---------- product page ---------- */
  function product(){
    if(!body.classList.contains('type-detail'))return;
    var detail=d.querySelector('.p-detail'),row=detail&&detail.querySelector('.add-to-cart'),btn=row&&row.querySelector('.add-to-cart-button');
    if(!row||!btn)return;
    var m=detail.querySelector('meta[itemprop="url"]'),url=path(m?m.getAttribute('content'):location.pathname);
    var name=txt(d.querySelector('.p-detail-inner-header h1'))||'TAGRA';
    var lic=LIC.test(url),max=/\/tagra-max(-download-box-ii-s)?\/$/.test(url);
    function price(){var p=detail.querySelector('.p-final-price-wrapper .price-final-holder')||detail.querySelector('.p-final-price-wrapper .price-final');return txt(p);}
    function num(){var v=parseFloat(DE?price().replace(/[^0-9,]/g,'').replace(',','.'):price().replace(/[^0-9.]/g,''));return isNaN(v)?undefined:v;}

    /* 2) quote */
    if(max&&!row.querySelector('.tgs-quote')){
      var q=el('a','tgs-quote',t('quote','Get a quote'));q.href=quoteHref(name);
      q.addEventListener('click',function(){ga('quote_click',{tgs_from:'product',item_name:name});});
      btn.parentNode.insertBefore(q,btn.nextSibling);
    }

    /* 1) sticky bar */
    var sb=el('div','tgs-sb');sb.setAttribute('role','region');sb.setAttribute('aria-label',DE?t('buy_aria','').replace('{name}',name):'Buy '+name);
    sb.innerHTML='<div class="tgs-sb__in"><div class="tgs-sb__info"><span class="tgs-sb__name"></span><span class="tgs-sb__price"><b></b>'+t('excl','excl. VAT')+'</span><span class="tgs-sb__note"></span></div>'+
      '<button type="button" class="tgs-sb__chat" aria-label="'+t('chat_aria','Chat with us')+'"></button><button type="button" class="tgs-pill tgs-sb__atc">'+t('atc','Add to cart')+'</button></div>';
    sb.querySelector('.tgs-sb__name').textContent=name;
    sb.querySelector('.tgs-sb__note').textContent=lic?t('note_lic','Licence by e-mail'):t('note_hw','Dispatched within 3 business days');
    var pb=sb.querySelector('.tgs-sb__price b'),atc=sb.querySelector('.tgs-sb__atc'),added=false;
    function upd(){pb.textContent=price();}
    upd();body.appendChild(sb);
    function setH(){html.style.setProperty('--tgs-sb-h',sb.offsetHeight+'px');}
    atc.addEventListener('click',function(){
      if(added){ga('sticky_atc_click',{item_name:name,tgs_action:'go_to_cart'});location.href='/cart/';return;}
      ga('sticky_atc_click',{item_name:name,value:num(),currency:'EUR',tgs_device:isMob()?'mobile':'desktop'});
      window.tgsStickyAddTs=Date.now();
      btn.click(); /* native Shoptet add to cart of the product on this page (its own GA4/Meta add_to_cart) */
    });
    d.addEventListener('ShoptetCartUpdated',function(){if(Date.now()-(window.tgsFcAddTs||0)<10000)return;added=true;atc.textContent=t('go_cart','Go to cart');});
    var chat=sb.querySelector('.tgs-sb__chat');
    function bubble(){return d.querySelector('.woot-widget-bubble:not(.woot--close)');}
    chat.addEventListener('click',function(){var b=bubble();if(b){b.click();ga('chat_open',{tgs_from:'sticky_bar'});}});
    var n=0,civ=setInterval(function(){if(bubble()){sb.classList.add('has-chat');clearInterval(civ);}else if(++n>90)clearInterval(civ);},2000);
    var vis=true,below=true;
    function apply(){var on=!vis&&(isMob()||!below);sb.classList.toggle('is-on',on);html.classList.toggle('tgs-sb-on',on);if(on)setH();}
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){var e=es[es.length-1];vis=e.isIntersecting;below=e.boundingClientRect.top>0;upd();apply();},{threshold:0}).observe(row);
    }
    window.addEventListener('resize',function(){apply();},{passive:true});
  }

  /* ---------- 3) after add to cart ---------- */
  function toast(){
    if(body.classList.contains('ordering-process')||body.classList.contains('in-cart'))return;
    var last='',tm;
    d.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('.add-to-cart-button,.btn-cart');if(!b)return;
      var l=b.getAttribute('aria-label')||'';last=l.replace(DE?/^(Add to cart|In den Warenkorb( legen)?)\s*/i:/^Add to cart\s*/i,'')||txt(d.querySelector('.p-detail-inner-header h1'));
    },true);
    var t=el('div','tgs-toast');t.setAttribute('role','status');t.setAttribute('aria-live','polite');
    t.innerHTML='<p class="tgs-toast__t"><span><b>'+tr('toast_t','Added to your cart')+'</b><span class="tgs-toast__n"></span></span></p><div class="tgs-toast__a"><a class="tgs-pill" href="/cart/">'+tr('go_cart','Go to cart')+'</a><button type="button" class="tgs-toast__c">'+tr('toast_c','Continue shopping')+'</button></div><button type="button" class="tgs-toast__x" aria-label="'+tr('close','Close')+'">×</button>';
    body.appendChild(t);
    function hide(){t.classList.remove('is-on');html.classList.remove('tgs-toast-on');}
    t.querySelector('.tgs-pill').addEventListener('click',function(){ga('atc_panel_click',{tgs_action:'go_to_cart'});});
    t.querySelector('.tgs-toast__c').addEventListener('click',function(){ga('atc_panel_click',{tgs_action:'continue'});hide();});
    t.querySelector('.tgs-toast__x').addEventListener('click',hide);
    d.addEventListener('ShoptetCartUpdated',function(){
      if(Date.now()-(window.tgsFcAddTs||0)<10000)return; /* the fleet calculator shows its own "Added to cart" line */
      t.querySelector('.tgs-toast__n').textContent=last;
      html.classList.add('tgs-toast-on');t.classList.add('is-on');
      clearTimeout(tm);tm=setTimeout(hide,12000);
    });
  }

  /* ---------- 4) cart note ---------- */
  function cart(){
    if(!body.classList.contains('in-cart')||d.querySelector('.tgs-cartnote'))return;
    var rows=[].slice.call(d.querySelectorAll('.cart-table tr[data-micro="cartItem"] td.p-name a.main-link'));if(!rows.length)return;
    var lic=0,oth=0;rows.forEach(function(a){if(LIC.test(path(a.getAttribute('href'))))lic++;else oth++;});
    var n=el('div','tgs-cartnote'),h='';
    if(lic&&!oth)h='<p>'+t('cart_lic','<b>Licence by e-mail – no shipping costs.</b> Sent within 2 business days, usually the same day with card payment.')+'</p>';
    else{h='<p>'+t('cart_ship','<b>Shipping €8.18 excl. VAT</b> (about €10 incl. VAT) · dispatched within 3 business days · delivery in 2–5 days.')+'</p>';
      if(lic)h+='<p>'+t('cart_lic2','Licences are sent by e-mail within 2 business days, usually the same day with card payment.')+'</p>';}
    h+='<p>'+t('cart_vat','Price excl. VAT. VAT of your delivery country is added at checkout; EU companies with a valid VAT ID pay 0 % (reverse charge).')+'</p>';
    n.innerHTML='<div>'+h+'</div>';
    var ref=d.querySelector('.cart-content .delivery-time')||d.querySelector('.cart-table');
    if(ref)ref.parentNode.insertBefore(n,ref.nextSibling);
  }

  /* ---------- 5) 404 + search ---------- */
  function notFound(){
    if(!body.classList.contains('in-404'))return;
    var c=d.querySelector('.empty-content-404');if(!c||c.classList.contains('tgs-404'))return;
    c.innerHTML='<h1 data-testid="pageHeader">'+t('nf_h','Page not found')+'</h1><p>'+t('nf_p','The page may have moved or no longer exists. Choose a category below or try TAGRA free.')+'</p>'+cats()+
      '<a class="tgs-pill" href="https://tagra.app/try/?src=shop404" target="_blank" rel="noopener">'+t('try30','Try TAGRA free for 30 days')+'</a>';
    c.classList.add('tgs-404');
  }
  function search(){
    if(!body.classList.contains('type-search')||d.querySelector('.tgs-srch'))return;
    var c=d.getElementById('content');if(!c)return;
    var s=el('div','tgs-srch');s.innerHTML='<h2>'+t('sr_h','Browse by category')+'</h2><p>'+t('sr_p','Select a category below to find the right product.')+'</p>'+cats();
    c.insertBefore(s,c.firstChild);
  }

  /* phone / mail clicks anywhere in the shop layer */
  function links(){
    d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="tel:"]');if(a&&!a.hasAttribute('data-tgs-ev'))ga('phone_click',{tgs_from:body.className.match(/type-[a-z]+/)?body.className.match(/type-[a-z]+/)[0]:''});},true);
  }

  /* checkout step 2: phone is optional in Shoptet (licences go by e-mail); a parcel needs it for the courier */
  function phoneCourier(){
    var ph=d.getElementById('phone');if(!ph||!ph.form||!/orderingProcess/i.test(ph.form.getAttribute('action')||''))return;
    var box=d.querySelector('[class*=summary]');if(!box)return;
    var s=txt(box);if(!/\d/.test(s)||/Electronic delivery|Elektronische Lieferung|Elektronischer Versand/i.test(s))return;
    ph.setAttribute('required','required');ph.setAttribute('aria-required','true');
    var lab=d.querySelector('label[for="phone"]');if(lab&&lab.textContent.indexOf('*')<0)lab.insertAdjacentHTML('beforeend',' <span class="required-asterisk">*</span>');
    ph.form.addEventListener('submit',function(e){
      if((ph.value||'').replace(/\D/g,'').length>=6)return;
      e.preventDefault();e.stopImmediatePropagation();
      var n=d.getElementById('tgs-ph-msg');
      if(!n){n=el('div','tgs-ph-msg');n.id='tgs-ph-msg';n.setAttribute('role','alert');n.style.cssText='color:#c62828;font-size:14px;margin-top:6px';ph.parentNode.appendChild(n);}
      n.textContent=t('ph_msg','Please enter a phone number – the courier needs it to deliver your parcel.');ph.focus();
    },true);
  }

  function run(){[cookieBar,product,toast,cart,notFound,search,links,phoneCourier].forEach(function(f){try{f();}catch(e){if(window.console)console.warn('tgs-cro',e);}});}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',run);else run();
})();
