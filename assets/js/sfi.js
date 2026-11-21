/* TAGRA Shop – lokalizace patičky .tgs-footer (ES/IT) podle html[lang]. 21. 11. 2026. Načítá se z HTML kódů (patička). */

(function(){
  var D={
    it:{off:"Negozio ufficiale TAGRA di Truck Data Technology, s.r.o., sviluppatore del programma di analisi dei tachigrafi TAGRA, sul mercato dal 2005. Licenze consegnate elettronicamente e dispositivi di scarico spediti in tutta l’UE.",sup:" · assistenza via e-mail in italiano","Shop":"Negozio","TAGRA software":"Programma TAGRA","Download devices":"Dispositivi di scarico","Software + device bundles":"Pacchetti programma + dispositivo","Accessories":"Accessori","Customer care":"Assistenza clienti","How to buy":"Come acquistare","Terms and conditions":"Termini e condizioni","Privacy policy":"Informativa sulla privacy","Withdrawal form":"Modulo di recesso","Contact":"Contatti","How it works":"Come funziona","Manuals":"Manuali","Payments":"Pagamenti","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Carta, Apple Pay, Google Pay o bonifico bancario · 3-D Secure"},
    es:{off:"Tienda oficial TAGRA de Truck Data Technology, s.r.o., desarrollador del software de análisis de tacógrafos TAGRA, en el mercado desde 2005. Licencias entregadas electrónicamente y dispositivos de descarga enviados a toda la UE.",sup:" · asistencia por correo electrónico en español","Shop":"Tienda","TAGRA software":"Software TAGRA","Download devices":"Dispositivos de descarga","Software + device bundles":"Paquetes de software + dispositivo","Accessories":"Accesorios","Customer care":"Atención al cliente","How to buy":"Cómo comprar","Terms and conditions":"Términos y condiciones","Privacy policy":"Política de privacidad","Withdrawal form":"Formulario de desistimiento","Contact":"Contacto","How it works":"Cómo funciona","Manuals":"Manuales","Payments":"Pagos","Card, Apple Pay, Google Pay or bank transfer · 3-D Secure":"Tarjeta, Apple Pay, Google Pay o transferencia bancaria · 3-D Secure"}
  };
  function run(){
    var lg=(document.documentElement.getAttribute('lang')||'').slice(0,2).toLowerCase();
    var T=D[lg]; var f=document.querySelector('.tgs-footer'); if(!T||!f) return;
    var w=document.createTreeWalker(f,NodeFilter.SHOW_TEXT,null,false),n,s,k;
    while((n=w.nextNode())){
      s=n.nodeValue; k=s.trim(); if(!k) continue;
      if(k.indexOf('Official TAGRA Shop')===0){ n.nodeValue=s.replace(k,T.off); continue; }
      if(k.indexOf('support in English')>-1){ n.nodeValue=T.sup; continue; }
      if(T.hasOwnProperty(k)) n.nodeValue=s.replace(k,T[k]);
    }
    var a=f.querySelectorAll('a[href]'),i,h;
    for(i=0;i<a.length;i++){
      h=a[i].getAttribute('href');
      if(/^\/(?!it\/|es\/)[a-z0-9-]+\/$/.test(h)) a[i].setAttribute('href','/'+lg+h);
      else if(h==='https://tagra.app/') a[i].setAttribute('href','https://tagra.app/'+lg+'/');
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
