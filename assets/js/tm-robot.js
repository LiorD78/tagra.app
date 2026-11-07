/* TRUCKMALL robot v1 (7. 11. 2026) – animovany maskot v paticce (tdt.cz, tdt.sk, tagra.app, shop.tagra.app). Vrstvy z cdn.truckmall.cz, stejne jako na truckmall.cz. */
(function(){
  if(window.tmRobot)return;window.tmRobot=1;
  var B='https://cdn.truckmall.cz/data/user-content/tm-robot-v3-';
  var CSS='.tm-robo-foot{margin-top:24px;line-height:0}'+
  '.tm-robo{position:relative;display:inline-block;width:140px;max-width:100%;line-height:0;vertical-align:top}'+
  '.tm-robo>img,.tm-robo__armg,.tm-robo__armg>img{position:absolute;left:0;top:0;width:100%;height:100%;max-width:none;margin:0;padding:0;border:0;object-fit:contain;pointer-events:none}'+
  '.tm-robo>img.tm-robo__body{position:relative;height:auto;aspect-ratio:424/603}'+
  '.tm-robo__armg{transform-origin:85% 43.9%;animation:tmRoboArm 4.8s ease-in-out infinite}'+
  '.tm-robo__armg>img.tm-robo__hand{transform-origin:81.5% 62.1%;animation:tmRoboHand 4.8s ease-in-out infinite}'+
  '.tm-robo>img.tm-robo__head,.tm-robo>img.tm-robo__blink{transform-origin:50% 34%;animation:tmRoboHead 4.8s ease-in-out infinite}'+
  '.tm-robo>img.tm-robo__blink{opacity:0;animation:tmRoboHead 4.8s ease-in-out infinite,tmRoboBlink 4.8s linear infinite}'+
  '@keyframes tmRoboHead{0%,100%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-1%) rotate(-3deg)}70%{transform:translateY(-.5%) rotate(2.5deg)}}'+
  '@keyframes tmRoboBlink{0%,61%,65.5%,100%{opacity:0}62%,64.5%{opacity:1}}'+
  '@keyframes tmRoboArm{0%,30%,66%,100%{transform:rotate(0deg)}38%{transform:rotate(5deg)}46%{transform:rotate(-3deg)}54%{transform:rotate(4deg)}60%{transform:rotate(-1deg)}}'+
  '@keyframes tmRoboHand{0%,38%,62%,100%{transform:rotate(0deg)}43%{transform:rotate(-5deg)}48%{transform:rotate(4deg)}53%{transform:rotate(-4deg)}57%{transform:rotate(2deg)}}'+
  '@media (max-width:767px){.tm-robo{width:96px}.tm-robo-foot{margin-top:18px}}'+
  '@media (prefers-reduced-motion:reduce){.tm-robo *{animation:none!important}.tm-robo>img.tm-robo__blink{opacity:0}}';
  function img(c,k,p){var i=document.createElement('img');i.className='tm-robo__'+c;i.src=B+k+'.webp';i.alt='';i.loading='lazy';i.decoding='async';i.width=424;i.height=603;p.appendChild(i);return i;}
  var n=0;
  function go(){
    var col=document.querySelector('.site-footer .footer-inner > div:first-child, #footer .tgs-footer > :first-child');
    if(!col){if(++n<40)setTimeout(go,250);return;}
    if(col.querySelector('.tm-robo'))return;
    var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    var w=document.createElement('div');w.className='tm-robo-foot';
    var r=document.createElement('span');r.className='tm-robo';r.setAttribute('role','img');r.setAttribute('aria-label','TRUCKMALL robot');
    img('body','body3',r);var g=document.createElement('span');g.className='tm-robo__armg';r.appendChild(g);img('arm','arm',g);img('hand','hand2',g);img('head','head',r);img('blink','blink',r);
    w.appendChild(r);col.appendChild(w);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
