/* TAGRA Shop – lokalizace textů patičky .tgs-footer podle html[lang]. 21. 11. 2026: ES/IT texty; DE/HU jen věta o podpoře (79-8). Odkazy na /<lang>/ řeší shop.js – tady se jen opraví případné zdvojení /xx/xx/. IT: věty souhlasu u registrace, komentáře a dotazu (Shoptet je v IT nemá). v5: první položka drobečkové navigace PL/IT (Shoptet má „Home“ / „Casa“). Načítá se z HTML kódů (patička). */

(function(){
  var D={
    it:{off:"Negozio ufficiale TAGRA di Truck Data Technology, s.r.o., sviluppatore del programma di analisi dei tachigrafi TAGRA, sul mercato dal 2005. Licenze consegnate elettronicamente e dispositivi di scarico spediti in tutta l’UE.",sup:" · assistenza via e-mail in italiano","Shop":"Negozio","TAGRA software":"Programma TAGRA","Download devices":"Dispositivi di scarico","Software + device bundles":"Pacchetti programma + dispositivo","Accessories":"Accessori","Customer care":"Assistenza clienti","How to buy":"Come acquistare","Terms and conditions":"Termini e condizioni","Privacy policy":"Informativa sulla privacy","Withdrawal form":"Modulo di recesso","Contact":"Contatti","How it works":"Come funziona","Manuals":"Manuali","Payments":"Pagamenti","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Carta, Apple Pay, Google Pay o bonifico bancario · 3-D Secure"},
    es:{off:"Tienda oficial TAGRA de Truck Data Technology, s.r.o., desarrollador del software de análisis de tacógrafos TAGRA, en el mercado desde 2005. Licencias entregadas electrónicamente y dispositivos de descarga enviados a toda la UE.",sup:" · asistencia por correo electrónico en español","Shop":"Tienda","TAGRA software":"Software TAGRA","Download devices":"Dispositivos de descarga","Software + device bundles":"Paquetes de software + dispositivo","Accessories":"Accesorios","Customer care":"Atención al cliente","How to buy":"Cómo comprar","Terms and conditions":"Términos y condiciones","Privacy policy":"Política de privacidad","Withdrawal form":"Formulario de desistimiento","Contact":"Contacto","How it works":"Cómo funciona","Manuals":"Manuales","Payments":"Pagos","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Tarjeta, Apple Pay, Google Pay o transferencia bancaria · 3-D Secure"},
    de:{sup:" · E-Mail-Support auf Deutsch"},
    hu:{sup:" · E-mailes ügyfélszolgálat magyarul"}
  };
  var CONSENT={
    it:{"By registering you agree to the":"Registrandosi, accetta i ","and the":" e l’","By posting a comment you agree to the":"Pubblicando un commento, accetta l’","By sending a message you agree to the":"Inviando un messaggio, accetta l’"}
  };
  var BC={pl:{"Home":"Strona główna"},it:{"Casa":"Home"}};
  var SUP=/support in English|Support auf Englisch|angol nyelvű ügyféltámogatás/;
  function lang(){ return (document.documentElement.getAttribute('lang')||'').slice(0,2).toLowerCase(); }
  function txt(){
    var lg=lang();
    var T=D[lg]; var f=document.querySelector('.tgs-footer'); if(!T||!f) return;
    var w=document.createTreeWalker(f,NodeFilter.SHOW_TEXT,null,false),n,s,k;
    while((n=w.nextNode())){
      s=n.nodeValue; k=s.trim(); if(!k) continue;
      if(T.off&&k.indexOf('Official TAGRA Shop')===0){ n.nodeValue=s.replace(k,T.off); continue; }
      if(SUP.test(k)){ n.nodeValue=T.sup; continue; }
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
  function run(){ txt(); crumbs(); consent(); dedupe(); setTimeout(function(){ dedupe(); consent(); crumbs(); },1500); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
