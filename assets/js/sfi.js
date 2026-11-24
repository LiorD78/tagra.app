/* TAGRA Shop – lokalizace textů patičky .tgs-footer podle html[lang]. 23. 11. 2026: věta o dopravě zdarma pro IT/FR/ES/DE/HU/PL (EN zdroj v HTML kódech změněn, klíče v shop-dev.js už nesedí – překlad dělá tento soubor) (kromě CZ/SK); řádek s údaji o firmě (adresa, IČO, DIČ, telefon) pod e-mailem – kvůli Google Merchant Center (v HTML kódech Shoptetu už není místo, limit 8192 znaků). 21. 11. 2026: ES/IT texty; 22. 11. 2026: FR texty patičky (82); 24. 11. 2026: NL texty patičky (89); DE/HU jen věta o podpoře (79-8). Odkazy na /<lang>/ řeší shop.js – tady se jen opraví případné zdvojení /xx/xx/. IT: věty souhlasu u registrace, komentáře a dotazu (Shoptet je v IT nemá). v5: první položka drobečkové navigace PL/IT (Shoptet má „Home“ / „Casa“). v6: název jazyka v přepínači jednoslovně („Polski“ – Shoptet má systémový „Język polski“, v adminu needitovatelný). Načítá se z HTML kódů (patička). */

(function(){
  var D={
    it:{off:"Negozio ufficiale TAGRA di Truck Data Technology, s.r.o., sviluppatore del programma di analisi dei dati del tachigrafo TAGRA, sul mercato dal 2005. Licenze consegnate elettronicamente, dispositivi di scarico spediti gratuitamente in tutta l’UE (eccetto CZ e SK).",sup:" · assistenza via e-mail in italiano","Shop":"Negozio","TAGRA software":"Programma TAGRA","Download devices":"Dispositivi di scarico","Software + device bundles":"Pacchetti programma + dispositivo","Accessories":"Accessori","Customer care":"Assistenza clienti","How to buy":"Come acquistare","Terms and conditions":"Termini e condizioni","Privacy policy":"Informativa sulla privacy","Withdrawal form":"Modulo di recesso","Contact":"Contatti","How it works":"Come funziona","Manuals":"Manuali","Payments":"Pagamenti","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Carta, Apple Pay, Google Pay o bonifico bancario · 3-D Secure"},
    fr:{off:"Boutique officielle TAGRA de Truck Data Technology, s.r.o., développeur du programme d’analyse des données du tachygraphe TAGRA, présent sur le marché depuis 2005. Licences livrées par voie électronique, appareils de téléchargement expédiés gratuitement dans toute l’UE (sauf CZ et SK).",sup:" · assistance en français par e-mail et par chat","Shop":"Boutique","TAGRA software":"Programme TAGRA","Download devices":"Appareils de téléchargement","Software + device bundles":"Packs programme + appareil","Accessories":"Accessoires","Customer care":"Service client","How to buy":"Comment acheter","Terms and conditions":"Conditions générales de vente","Privacy policy":"Politique de confidentialité","Withdrawal form":"Formulaire de rétractation","Contact":"Contact","How it works":"Comment ça marche","Manuals":"Manuels","Payments":"Paiements","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Carte bancaire, Apple Pay, Google Pay ou virement bancaire · 3-D Secure"},
    nl:{"off":"De officiële TAGRA-webshop van Truck Data Technology, s.r.o., ontwikkelaar van het TAGRA-programma voor de analyse van tachograafgegevens, sinds 2005 op de markt. Licenties worden elektronisch geleverd. Downloadapparaten worden gratis verzonden binnen de hele EU (behalve CZ en SK).","sup":" · ondersteuning in het Nederlands per e-mail en chat","Shop":"Webshop","TAGRA software":"TAGRA-programma","Download devices":"Downloadapparaten","Software + device bundles":"Bundels met programma en apparaat","Accessories":"Accessoires","Customer care":"Klantenservice","How to buy":"Zo bestelt u","Terms and conditions":"Algemene voorwaarden","Privacy policy":"Privacybeleid","Withdrawal form":"Herroepingsformulier","Contact":"Contact","How it works":"Zo werkt het","Manuals":"Handleidingen","Payments":"Betalingen","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Creditcard, Apple Pay, Google Pay of bankoverschrijving · 3-D Secure"},
    es:{off:"Tienda oficial TAGRA de Truck Data Technology, s.r.o., desarrollador del programa de análisis de datos del tacógrafo TAGRA, en el mercado desde 2005. Licencias entregadas electrónicamente y dispositivos de descarga enviados gratuitamente a toda la UE (excepto CZ y SK).",sup:" · asistencia por correo electrónico en español","Shop":"Tienda","TAGRA software":"Software TAGRA","Download devices":"Dispositivos de descarga","Software + device bundles":"Paquetes de software + dispositivo","Accessories":"Accesorios","Customer care":"Atención al cliente","How to buy":"Cómo comprar","Terms and conditions":"Términos y condiciones","Privacy policy":"Política de privacidad","Withdrawal form":"Formulario de desistimiento","Contact":"Contacto","How it works":"Cómo funciona","Manuals":"Manuales","Payments":"Pagos","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Tarjeta, Apple Pay, Google Pay o transferencia bancaria · 3-D Secure"},
    de:{off:"Offizieller TAGRA Shop der Truck Data Technology, s.r.o. – dem Entwickler des TAGRA Programms zur Tachographenauswertung, seit 2005 auf dem Markt. Lizenzen werden elektronisch geliefert, Downloadgeräte EU-weit kostenlos versandt (außer nach CZ und SK).",sup:" · E-Mail-Support auf Deutsch"},
    hu:{off:"A Truck Data Technology, s.r.o. – a 2005 óta piacon lévő TAGRA tachográfkiértékelő program fejlesztőjének – hivatalos TAGRA webáruháza. A licenceket elektronikusan kézbesítjük, a letöltőeszközöket az egész EU területére ingyenesen kiszállítjuk (CZ és SK kivételével).",sup:" · E-mailes ügyfélszolgálat magyarul"},
    pl:{off:"Oficjalny TAGRA Shop firmy Truck Data Technology, s.r.o. – producenta programu TAGRA do analizy danych z tachografów, obecnego na rynku od 2005 roku. Licencje dostarczamy elektronicznie, a urządzenia do pobierania danych wysyłamy bezpłatnie na terenie całej UE (z wyjątkiem CZ i SK)."}
  };
  var CONSENT={
    it:{"By registering you agree to the":"Registrandosi, accetta i ","and the":" e l’","By posting a comment you agree to the":"Pubblicando un commento, accetta l’","By sending a message you agree to the":"Inviando un messaggio, accetta l’"}
  };
  var BC={pl:{"Home":"Strona główna"},it:{"Casa":"Home"}};
  var LN={"Język polski":"Polski"};
  var SUP=/support in English|Support auf Englisch|angol nyelvű ügyféltámogatás/;
  function lang(){ return (document.documentElement.getAttribute('lang')||'').slice(0,2).toLowerCase(); }
  function txt(){
    var lg=lang();
    var T=D[lg]; var f=document.querySelector('.tgs-footer'); if(!T||!f) return;
    var w=document.createTreeWalker(f,NodeFilter.SHOW_TEXT,null,false),n,s,k;
    while((n=w.nextNode())){
      s=n.nodeValue; k=s.trim(); if(!k) continue;
      if(T.off&&k.indexOf('Official TAGRA Shop')===0){ n.nodeValue=s.replace(k,T.off); continue; }
      if(SUP.test(k)){ if(T.sup) n.nodeValue=T.sup; continue; }
      if(T.hasOwnProperty(k)) n.nodeValue=s.replace(k,T[k]);
    }
  }
  function crumbs(){
    var B=BC[lang()]; if(!B) return;
    var bs=document.querySelectorAll('.breadcrumbs, #navigationBreadcrumbs'),i,w,n,k;
    for(i=0;i<bs.length;i++){
      w=document.createTreeWalker(bs[i],NodeFilter.SHOW_TEXT,null,false);
      while((n=w.nextNode())){ k=n.nodeValue.trim(); if(B.hasOwnProperty(k)) n.nodeValue=n.nodeValue.replace(k,B[k]); }
    }
  }
  function langNames(){
    if(!document.body) return;
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false),n,k;
    while((n=w.nextNode())){ k=n.nodeValue.trim(); if(LN.hasOwnProperty(k)) n.nodeValue=n.nodeValue.replace(k,LN[k]); }
  }
  function consent(){
    var C=CONSENT[lang()]; if(!C) return;
    var ps=document.querySelectorAll('form p, .consents p, p'),i,j,p,c,k;
    for(i=0;i<ps.length;i++){
      p=ps[i]; if(p.textContent.indexOf('you agree to the')<0) continue;
      for(j=0;j<p.childNodes.length;j++){
        c=p.childNodes[j]; if(c.nodeType!==3) continue;
        k=c.nodeValue.trim(); if(C.hasOwnProperty(k)) c.nodeValue=C[k];
      }
    }
  }
  function dedupe(){
    var f=document.querySelector('.tgs-footer'); if(!f) return;
    var a=f.querySelectorAll('a[href]'),i,h,m;
    for(i=0;i<a.length;i++){
      h=a[i].getAttribute('href'); m=h.match(/^\/([a-z]{2})\/\1\//);
      if(m) a[i].setAttribute('href',h.replace('/'+m[1]+'/'+m[1]+'/','/'+m[1]+'/'));
    }
  }
  function company(){
    var f=document.querySelector('.tgs-footer'); if(!f||f.querySelector('.tgs-f-company')) return;
    var m=f.querySelector('.tgs-f-mail'); var p=m&&m.closest('p'); if(!p) return;
    var c=document.createElement('p'); c.className='tgs-f-company';
    c.innerHTML='Truck Data Technology, s.r.o. · U trati 886/52, 100 00 Praha 10, CZ · ID 27381269 · VAT CZ27381269 · <a href="tel:+420739005345">+420 739 005 345</a>';
    p.parentNode.insertBefore(c,p.nextSibling);
  }
  function run(){ company(); txt(); crumbs(); langNames(); consent(); dedupe(); setTimeout(function(){ company(); txt(); dedupe(); consent(); crumbs(); langNames(); },1500); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
