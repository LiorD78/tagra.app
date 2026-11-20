try{!function(w,d){
/* tmx-chat-cz.js – chat Jarabot (robot Trucky, náhrada Smartsuppu), 20. 11. 2026.
   Kontaktní centrum chat.jarabot.com, účet 118, schránka 775 truckmall.cz → robot TRUCKMALL CZ (Jarabot 6541).
   Stejný mávající robot jako na tdt.cz / tagra.app (obrázky z tdt.cz).
   Smartsupp je v BSADMIN vypnutý; dokud ho BS Shop na webu ještě vkládá, skryje se jeho okno (API chat:hide + CSS pojistka). */
if(w.__tmxChat)return;w.__tmxChat=1;
function hideSmartsupp(){try{if(typeof w.smartsupp==="function"){w.smartsupp("chat:hide")}}catch(e){}}
function start(){
hideSmartsupp();setTimeout(hideSmartsupp,1500);setTimeout(hideSmartsupp,5000);
var IMG="https://www.tdt.cz/assets/img/chat/";
var css="#tdt-chat{position:fixed;right:22px;bottom:22px;z-index:2147482000;display:flex;align-items:flex-end;gap:12px;cursor:pointer;border:0;background:none;padding:0;margin:0;font:inherit;font-family:inherit;transition:bottom .35s ease}"
+"#tdt-chat .lbl{background:#fff;color:#123a6b;font-weight:600;font-size:15px;line-height:1.25;padding:10px 14px;border-radius:16px 16px 4px 16px;box-shadow:0 6px 24px rgba(16,42,80,.18);margin-bottom:10px;text-align:left;opacity:0;transform:translateX(8px);pointer-events:none;transition:opacity .3s ease,transform .3s ease;white-space:nowrap}"
+"#tdt-chat .lbl small{display:block;font-weight:400;color:#4b5b70;font-size:13px}"
+"#tdt-chat.peek .lbl,#tdt-chat:hover .lbl,#tdt-chat:focus-visible .lbl{opacity:1;transform:none}"
+"#tdt-chat .av{position:relative;width:96px;height:82px;flex:0 0 96px;transition:transform .2s ease;filter:drop-shadow(0 6px 14px rgba(16,42,80,.30))}"
+"#tdt-chat .av img{display:block;width:96px;height:auto;max-width:none;pointer-events:none;border:0;margin:0}"
+"#tdt-chat .av img+img{position:absolute;left:0;top:0}"
+"#tdt-chat .av .h{transform-origin:64.06% 65.85%;animation:tdtWave 6s ease-in-out .4s infinite}"
+"#tdt-chat .av .g,#tdt-chat .av .e{transform-origin:41.7% 51.8%;animation:tdtHead 6s ease-in-out .4s infinite}"
+"#tdt-chat .av .e{opacity:0;animation:tdtHead 6s ease-in-out .4s infinite,tdtBlink 6s linear .4s infinite}"
+"@keyframes tdtHead{0%,100%{transform:rotate(0)}10%{transform:rotate(-4deg)}24%{transform:rotate(3deg)}38%{transform:rotate(0)}62%{transform:rotate(-2deg)}82%{transform:rotate(2.5deg)}}"
+"@keyframes tdtWave{0%,36%,100%{transform:rotate(0)}5%{transform:rotate(-18deg)}11%{transform:rotate(12deg)}17%{transform:rotate(-16deg)}23%{transform:rotate(10deg)}29%{transform:rotate(-7deg)}33%{transform:rotate(3deg)}}"
+"@keyframes tdtBlink{0%,46%,49%,84%,87%,100%{opacity:0}46.6%,48.4%,84.6%,86.4%{opacity:1}}"
+"@media (hover:hover){#tdt-chat:hover .av{transform:translateY(-3px)}}"
+"#tdt-chat:focus-visible{outline:3px solid #7cc242;outline-offset:4px;border-radius:40px}"
+".woot--bubble-holder{display:none!important}#chat-application,#chat-application-iframe{display:none!important;visibility:hidden!important}"
+"@media (max-width:600px){#tdt-chat{right:14px;bottom:14px}#tdt-chat .lbl{display:none}#tdt-chat .av{transform:scale(.86);transform-origin:bottom right}}"
+"@media (prefers-reduced-motion:reduce){#tdt-chat,#tdt-chat .av,#tdt-chat .lbl{transition:none}#tdt-chat .av .h,#tdt-chat .av .g{animation:none}#tdt-chat .av .e{animation:tdtBlink 6s linear infinite}}";
var st=d.createElement("style");st.id="tmx-chat-css";st.textContent=css;(d.head||d.documentElement).appendChild(st);
w.chatwootSettings=w.jarabotSettings={hideMessageBubble:true,position:"right",locale:"cs"};
function mk(){
if(d.getElementById("tdt-chat"))return;
var b=d.createElement("button");b.type="button";b.id="tdt-chat";b.setAttribute("aria-label","Otevřít chat s Truckym");
b.innerHTML='<span class="lbl">Potřebujete poradit?<small>Trucky odpoví hned</small></span><span class="av" aria-hidden="true">'
+'<img src="'+IMG+'robot-chat-telo5.webp" alt="" width="96" height="82">'
+'<img class="g" src="'+IMG+'robot-chat-hlava2.webp" alt="" width="96" height="82">'
+'<img class="e" src="'+IMG+'robot-chat-mrk2.webp" alt="" width="96" height="82">'
+'<img class="h" src="'+IMG+'robot-chat-paze.webp" alt="" width="96" height="82"></span>';
/* bublina s textem jednou za návštěvu po 6,5 s, jen na desktopu, na 8 s */
try{if(w.matchMedia&&w.matchMedia("(min-width:1024px) and (hover:hover)").matches&&!sessionStorage.getItem("tmxChatPeek")){
setTimeout(function(){if(b.classList.contains("open"))return;b.classList.add("peek");try{sessionStorage.setItem("tmxChatPeek","1")}catch(e){}
setTimeout(function(){b.classList.remove("peek")},8000)},6500)}}catch(e){}
b.addEventListener("click",function(){b.classList.remove("peek");try{sessionStorage.setItem("tmxChatPeek","1")}catch(e){}
if(w.$chatwoot&&w.$chatwoot.toggle)w.$chatwoot.toggle();(w.dataLayer=w.dataLayer||[]).push({event:"chat_open"})});
d.body.appendChild(b)}
var BASE_URL="https://chat.jarabot.com",g=d.createElement("script"),s=d.getElementsByTagName("script")[0];
g.src=BASE_URL+"/packs/js/sdk.js";g.defer=true;g.async=true;s.parentNode.insertBefore(g,s);
g.onload=function(){w.jarabotSDK.run({websiteToken:"UXiWdusMM9bQvtztaQ6t9qYW",baseUrl:BASE_URL});
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",mk);else mk()}}
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",start);else start()
}(window,document)}catch(e){window.console&&console.warn&&console.warn("tmx-chat-cz",e)}
