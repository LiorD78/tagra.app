/* TAGRA Shop – conversion layer v1.0 (8. 11. 2026), loaded by shop3.js on every page. Styles: shop.css v6.3 (head, so nothing jumps).
   1) sticky buy bar on product pages (name, price excl. VAT, Add to cart = the native Shoptet button, so GA4 add_to_cart stays single)
   2) "Get a quote" next to Add to cart on TAGRA MAX and TAGRA MAX + DOWNLOAD BOX II S
   3) after add to cart: panel "Go to cart / Continue shopping" (Shoptet only showed a thin bar over the header)
   4) cart: delivery note for licences / hardware (replaces the leftover "Extras and discounts / You have free delivery!")
   5) 404 and /search/: the four categories instead of a dead end (Shoptet search returns no products)
   6) cookie bar height -> --tgs-cb (checkout gets room to scroll past the bar on phones)
   GA4 events go through gtag with send_to 'GA4' (Shoptet config uses groups:'GA4'; plain dataLayer objects never reach GA4):
   sticky_atc_click, atc_panel_click, quote_click, phone_click. */
(function(){
  'use strict';
  if(window.tgsCro)return;
  window.tgsCro=true;
  var SALES='sales@tagra.app',PHONE='+420 739 005 345';
  var d=document,html=d.documentElement,body=d.body;
  var CATS=[['/tagra-software/','TAGRA software','Licences by fleet size'],['/download-devices/','Download devices','DOWNLOAD BOX II S and stations'],
            ['/software-device-bundles/','Software + device bundles','Program and device · save €49'],['/accessories/','Accessories','Smart card reader']];
  var LIC=/\/tagra-(1|2|4|6|max)\/$/;

  function ga(ev,p){
    if(typeof window.tgsGa==='function'){window.tgsGa(ev,p);return;}
    p=p||{};try{window.dataLayer=window.dataLayer||[];var o={event:ev},k;for(k in p)o[k]=p[k];window.dataLayer.push(o);}catch(e){}
    try{if(typeof window.gtag==='function'){var q={send_to:'GA4',transport_type:'beacon'},k2;for(k2 in p)q[k2]=p[k2];window.gtag('event',ev,q);}}catch(e){}
  }
  function quoteHref(prod){
    if(typeof window.tgsQuoteHref==='function')return window.tgsQuoteHref(prod);
    return 'mailto:'+SALES+'?subject='+encodeURIComponent('Quote request – '+prod);
  }
  function el(tag,cls,txt){var e=d.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  function txt(e){return ((e&&e.textContent)||'').replace(/\s+/g,' ').trim();}
  function isMob(){return !(window.matchMedia&&matchMedia('(min-width:768px)').matches);}
  function path(u){try{return new URL(u,location.href).pathname;}catch(e){return '';}}
  function cats(){return '<nav class="tgs-cats" aria-label="Shop categories">'+CATS.map(function(c){return '<a href="'+c[0]+'"><b>'+c[1]+'</b><small>'+c[2]+'</small></a>';}).join('')+'</nav>';}

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
    function num(){var v=parseFloat(price().replace(/[^0-9.]/g,''));return isNaN(v)?undefined:v;}

    /* 2) quote */
    if(max&&!row.querySelector('.tgs-quote')){
      var q=el('a','tgs-quote','Get a quote');q.href=quoteHref(name);
      q.addEventListener('click',function(){ga('quote_click',{tgs_from:'product',item_name:name});});
      btn.parentNode.insertBefore(q,btn.nextSibling);
    }

    /* 1) sticky bar */
    var sb=el('div','tgs-sb');sb.setAttribute('role','region');sb.setAttribute('aria-label','Buy '+name);
    sb.innerHTML='<div class="tgs-sb__in"><div class="tgs-sb__info"><span class="tgs-sb__name"></span><span class="tgs-sb__price"><b></b>excl. VAT</span><span class="tgs-sb__note"></span></div>'+
      '<button type="button" class="tgs-sb__chat" aria-label="Chat with us"></button><button type="button" class="tgs-pill tgs-sb__atc">Add to cart</button></div>';
    sb.querySelector('.tgs-sb__name').textContent=name;
    sb.querySelector('.tgs-sb__note').textContent=lic?'Licence by e-mail':'Dispatched within 3 business days';
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
    d.addEventListener('ShoptetCartUpdated',function(){if(Date.now()-(window.tgsFcAddTs||0)<10000)return;added=true;atc.textContent='Go to cart';});
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
      var l=b.getAttribute('aria-label')||'';last=l.replace(/^Add to cart\s*/i,'')||txt(d.querySelector('.p-detail-inner-header h1'));
    },true);
    var t=el('div','tgs-toast');t.setAttribute('role','status');t.setAttribute('aria-live','polite');
    t.innerHTML='<p class="tgs-toast__t"><span><b>Added to your cart</b><span class="tgs-toast__n"></span></span></p><div class="tgs-toast__a"><a class="tgs-pill" href="/cart/">Go to cart</a><button type="button" class="tgs-toast__c">Continue shopping</button></div><button type="button" class="tgs-toast__x" aria-label="Close">×</button>';
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
    if(lic&&!oth)h='<p><b>Licence by e-mail – no shipping costs.</b> Sent within 2 business days, usually the same day with card payment.</p>';
    else{h='<p><b>Shipping €8.18 excl. VAT</b> (about €10 incl. VAT) · dispatched within 3 business days · delivery in 2–5 days.</p>';
      if(lic)h+='<p>Licences are sent by e-mail within 2 business days, usually the same day with card payment.</p>';}
    h+='<p>Price excl. VAT. VAT of your delivery country is added at checkout; EU companies with a valid VAT ID pay 0 % (reverse charge).</p>';
    n.innerHTML='<div>'+h+'</div>';
    var ref=d.querySelector('.cart-content .delivery-time')||d.querySelector('.cart-table');
    if(ref)ref.parentNode.insertBefore(n,ref.nextSibling);
  }

  /* ---------- 5) 404 + search ---------- */
  function notFound(){
    if(!body.classList.contains('in-404'))return;
    var c=d.querySelector('.empty-content-404');if(!c||c.classList.contains('tgs-404'))return;
    c.innerHTML='<h1 data-testid="pageHeader">Page not found</h1><p>The page may have moved or no longer exists. Choose a category below or try TAGRA free.</p>'+cats()+
      '<a class="tgs-pill" href="https://tagra.app/try/?src=shop404" target="_blank" rel="noopener">Try TAGRA free for 30 days</a>';
    c.classList.add('tgs-404');
  }
  function search(){
    if(!body.classList.contains('type-search')||d.querySelector('.tgs-srch'))return;
    var c=d.getElementById('content');if(!c)return;
    var s=el('div','tgs-srch');s.innerHTML='<h2>Browse by category</h2><p>Select a category below to find the right product.</p>'+cats();
    c.insertBefore(s,c.firstChild);
  }

  /* phone / mail clicks anywhere in the shop layer */
  function links(){
    d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="tel:"]');if(a&&!a.hasAttribute('data-tgs-ev'))ga('phone_click',{tgs_from:body.className.match(/type-[a-z]+/)?body.className.match(/type-[a-z]+/)[0]:''});},true);
  }

  function run(){[cookieBar,product,toast,cart,notFound,search,links].forEach(function(f){try{f();}catch(e){if(window.console)console.warn('tgs-cro',e);}});}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',run);else run();
})();
