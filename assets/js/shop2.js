/* TAGRA Shop layer 2 v1.0 – formoline-style header with expert photo + phone (2. 11. 2026) */
(function(){
  var PHONE='+420 739 005 345';
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://tagra.app/assets/css/shop2.css?v=1';document.head.appendChild(l);
  function header(){
    var top=document.querySelector('#header .header-top');
    if(!top||top.querySelector('.tgs-hdr')||!(window.matchMedia&&matchMedia('(min-width:768px)').matches))return;
    document.documentElement.classList.add('tgs-hd');
    var nb=top.querySelector('.navigation-buttons');
    var c=document.createElement('div');c.className='tgs-hdr';
    c.innerHTML='<span class="tgs-hdr__ph" aria-hidden="true"></span><strong>Happy to help</strong><a class="tgs-hdr__tel" href="tel:'+PHONE.replace(/\s/g,'')+'">'+PHONE+'</a>';
    top.insertBefore(c,nb||null);
    if(nb&&!nb.querySelector('.tgs-hdr__login')){var a=document.createElement('a');a.className='tgs-hdr__login';a.href='/login/';a.setAttribute('aria-label','Login');nb.insertBefore(a,nb.firstChild);}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',header);}else{header();}
})();
