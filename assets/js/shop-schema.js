/* TAGRA Shop – schema v2 (21. 11. 2026, 79-6; v2: shippingRate vždy 0.00, čtečka /smart-card-reader/ jako HW): doplňuje microdata Shoptetu na detailu produktu (brand, mpn, hasMerchantReturnPolicy jen u HW,
   kategorie bez českého kořene „Úvodní stránka“) a vkládá Organization JSON-LD na všechny stránky shopu. Nic jiného nemění,
   druhou entitu Product nevytváří, shippingRate value nastavuje na 0.00 (doprava po EU zdarma). */
(function(){
  'use strict';
  if(window.tgsSchema)return;
  window.tgsSchema=true;
  var D=document,LG=(D.documentElement.getAttribute('lang')||'en').slice(0,2).toLowerCase();
  var HOME={en:'Home',de:'Startseite',pl:'Strona główna',hu:'Főoldal',es:'Inicio',it:'Home'};
  var LOGO='https://cdn.myshoptet.com/usr/shop.tagra.app/user/logos/tagra-logo.svg';
  function el(tag,attrs){var e=D.createElement(tag);for(var k in attrs)e.setAttribute(k,attrs[k]);return e;}
  function meta(p,c){return el('meta',{itemprop:p,content:c});}
  function link(p,h){return el('link',{itemprop:p,href:h});}

  function organization(){
    if(D.getElementById('tgs-org-ld'))return;
    var langs=LG==='en'?['en']:['en',LG];
    var o={'@context':'https://schema.org','@type':'Organization','@id':'https://tagra.app/#organization',
      name:'Truck Data Technology, s.r.o.',alternateName:'TDT',url:'https://tagra.app/',logo:LOGO,email:'sales@tagra.app',telephone:'+420 739 005 345',
      vatID:'CZ27381269',taxID:'27381269',identifier:'27381269',sameAs:['https://www.tdt.cz'],
      address:{'@type':'PostalAddress',streetAddress:'U trati 886/52',addressLocality:'Prague',postalCode:'100 00',addressCountry:'CZ'},
      contactPoint:[
        {'@type':'ContactPoint',contactType:'sales',email:'sales@tagra.app',telephone:'+420 739 005 345',availableLanguage:langs},
        {'@type':'ContactPoint',contactType:'technical support',email:'support@tagra.app',availableLanguage:langs}
      ]};
    var s=el('script',{type:'application/ld+json',id:'tgs-org-ld'});
    s.textContent=JSON.stringify(o);
    D.head.appendChild(s);
  }

  function product(){
    var b=D.body;if(!b||!b.classList.contains('type-detail'))return;
    var root=D.querySelector('.p-detail[itemtype="https://schema.org/Product"]');
    if(!root||root.getAttribute('data-tgs-schema'))return;
    root.setAttribute('data-tgs-schema','1');
    /* kategorie: český kořen podle <html lang> */
    var cat=root.querySelector(':scope > meta[itemprop="category"]');
    if(cat){
      var c=cat.getAttribute('content')||'';
      var m=c.match(/^\s*Úvodní stránka\s*(>\s*)?/);
      if(m){cat.setAttribute('content',(HOME[LG]||HOME.en)+(c.length>m[0].length?' > '+c.slice(m[0].length):''));}
    }
    var skuEl=root.querySelector(':scope > meta[itemprop="sku"]');
    var sku=skuEl&&skuEl.getAttribute('content');
    var urlEl=root.querySelector(':scope > meta[itemprop="url"]');
    var pu=(urlEl&&urlEl.getAttribute('content'))||'';
    var hw=b.classList.contains('in-download-devices')||b.classList.contains('id-708')||/\/smart-card-reader\/?$/.test(pu);
    if(!root.querySelector(':scope > [itemprop="brand"]')){
      var br=el('span',{itemprop:'brand',itemscope:'',itemtype:'https://schema.org/Brand'});
      br.appendChild(meta('name',hw?'Truck Data Technology':'TAGRA'));
      root.appendChild(br);
    }
    if(sku&&!root.querySelector(':scope > [itemprop="mpn"]'))root.appendChild(meta('mpn',sku));
    /* doprava po EU je zdarma (Shoptet u atypické dopravy chybně uvádí 10.07) */
    [].forEach.call(root.querySelectorAll('[itemprop="shippingDetails"] [itemprop="shippingRate"] [itemprop="value"]'),function(e){e.setAttribute('content','0.00');});
    /* return policy jen u HW; u licencí (digitální obsah) se nepřidává */
    var offer=root.querySelector('[itemprop="offers"]');
    if(hw&&offer&&!offer.querySelector('[itemprop="hasMerchantReturnPolicy"]')){
      var cs=[],seen={};
      [].forEach.call(offer.querySelectorAll('[itemprop="shippingDestination"] [itemprop="addressCountry"]'),function(e){
        var v=e.getAttribute('content')||e.textContent.trim();if(v&&!seen[v]){seen[v]=1;cs.push(v);}
      });
      if(cs.length){
        var p=el('span',{itemprop:'hasMerchantReturnPolicy',itemscope:'',itemtype:'https://schema.org/MerchantReturnPolicy'});
        cs.forEach(function(v){p.appendChild(meta('applicableCountry',v));});
        p.appendChild(link('returnPolicyCategory','https://schema.org/MerchantReturnFiniteReturnWindow'));
        p.appendChild(meta('merchantReturnDays','14'));
        p.appendChild(link('returnMethod','https://schema.org/ReturnByMail'));
        p.appendChild(link('returnFees','https://schema.org/ReturnShippingFees'));
        offer.appendChild(p);
      }
    }
  }
  function run(){try{organization();}catch(e){}try{product();}catch(e){}}
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',run);else run();
})();
