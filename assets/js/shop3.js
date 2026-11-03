/* TAGRA Shop layer 3 v1.0 – program screenshots in a MacBook frame (like TRUCKMALL mac-stage) (3. 11. 2026) */
(function(){
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://tagra.app/assets/css/shop3.css?v=1';document.head.appendChild(l);
  var MB='https://wuswoaicjtuodzmrjwgf.supabase.co/storage/v1/object/public/site/tagra-shop/mac/tagra3-mac-';
  var RX=/tagra3-(driver-evaluation|company-report|work-report|infringements|evaluation|overview|driver)\b/;
  function name(u){var m=(u||'').match(RX);return m?m[1]:null;}
  function src(n,w){return MB+n+'-'+w+'.webp';}
  function imgs(){
    [].forEach.call(document.querySelectorAll('#description img, .tgs-p img'),function(i){
      if(i.classList.contains('tgs-mac'))return;
      var n=name(i.getAttribute('src'));if(!n)return;
      i.src=src(n,1600);i.srcset=src(n,800)+' 800w, '+src(n,1600)+' 1600w';i.sizes='(max-width: 767px) 100vw, 900px';
      i.width=1600;i.height=1407;i.classList.add('tgs-mac');
      var p=i.parentElement;if(p&&p.classList.contains('tgs-sec--hero')){var w=document.createElement('div');w.className='tgs-mac-stage';p.insertBefore(w,i);w.appendChild(i);}
    });
  }
  function gallery(){
    [].forEach.call(document.querySelectorAll('.p-image a, .p-thumbnails a, a.p-thumbnail, a.cbox-gal, a.p-main-image'),function(a){
      var n=name(a.getAttribute('href'));if(!n)return;
      a.setAttribute('href',src(n,1600));if(a.dataset&&a.dataset.href)a.dataset.href=src(n,1600);
      var i=a.querySelector('img');if(i){i.src=src(n,a.classList.contains('p-thumbnail')?800:1600);i.removeAttribute('srcset');i.classList.add('tgs-mac-th');}
    });
  }
  function zoom(){
    var st=document.querySelector('.tgs-mac-stage img');if(!st||!('requestAnimationFrame' in window))return;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var tick=false;
    function upd(){var r=st.getBoundingClientRect(),h=innerHeight,c=r.top+r.height/2,d=Math.abs(h/2-c),p=1-d/(h*0.65);if(p<0)p=0;var e=Math.sin(p*Math.PI/2),mx=innerWidth<768?1.04:1.08;st.style.transform='scale('+(1+e*(mx-1)).toFixed(3)+')';tick=false;}
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});
    addEventListener('resize',upd,{passive:true});setTimeout(upd,150);
  }
  function run(){imgs();gallery();zoom();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
