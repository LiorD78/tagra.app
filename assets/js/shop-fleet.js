/* TAGRA Shop – fleet calculator v1.8 (8. 11. 2026: no Czech-VAT gross price – "+ VAT of your country · 0 % for EU companies with a valid VAT ID"; shipping €8.18 excl. VAT; events also via gtag send_to GA4 (plain dataLayer objects never reached GA4); entry hub preselects the branch via the tgs:fc event) | v1.7 (8. 11. 2026: tier chips 1 / 2 / 4 / 6 / MAX next to the stepper are clickable – set the vehicle count to that tier; were dead clicks in Clarity) | v1.6 (7. 11. 2026: 2-driver option uses its own icon with exactly two figures, hosted on tagra.app) | v1.5 (7. 11. 2026) – employed driver branch asks 1 driver / 2 drivers sharing one PC:
   2 -> TAGRA TRUCKER 2 (TAGRA_PRICES.trucker2, priceId 93). GA4 events carry fc_drivers (1 / 2 in the driver branch).
   v1.4 (7. 11. 2026) – prices, price IDs and URLs now come only from
   https://tagra.app/assets/js/tagra-prices.js (window.TAGRA_PRICES), the one source shared with the tagra.app version selector.
   v1.3 (6. 11. 2026):
   Progressive enhancement of the "Choose TAGRA by fleet size" section built by shop.js.
   Inputs: who (company / employed driver), vehicles, download device; for the employed driver only 1 / 2 drivers
   (company licences are still based on vehicles, driver cards are not counted).
   Cart: always ONE item – licence, licence + DOWNLOAD BOX II S bundle, TRUCKER or TRUCKER 2 – via shoptet.cartShared.addToCart.
   Rules (vehicles -> tier) are shared with the TRUCKMALL configurator: 1 / 2 / 3-4 / 5-6 / 7+ = TAGRA 1 / 2 / 4 / 6 / MAX. */
(function(){
  'use strict';
  if(window.tgsFleetCalc)return;
  window.tgsFleetCalc=true;

  var SHIP='€8.18 excl. VAT';
  var IC='https://cdn.truckmall.cz/data/user-content/cfg-ico-';
  var PRICES_JS='https://tagra.app/assets/js/tagra-prices.js?v=20261107';
  var CAP={t1:'1 vehicle',t2:'2 vehicles',t4:'3–4 vehicles',t6:'5–6 vehicles',max:'unlimited vehicles'};
  var RULES=null,SAVE='';
  function rules(P){
    return {version:P.version,
      tiers:P.tiers.map(function(t){return {id:t.id,name:t.name,max:t.max==null?Infinity:t.max,cap:CAP[t.id],price:t.price,fee:t.fee,priceId:t.priceId,url:t.path,
        bundle:{price:t.bundle.price,priceId:t.bundle.priceId,url:t.bundle.path}};}),
      trucker:{name:P.trucker.name,price:P.trucker.price,fee:P.trucker.fee,priceId:P.trucker.priceId,url:P.trucker.path},
      trucker2:P.trucker2?{name:P.trucker2.name,price:P.trucker2.price,fee:P.trucker2.fee,priceId:P.trucker2.priceId,url:P.trucker2.path}:null,
      box:{name:P.box.name,price:P.box.price},
      shipping:SHIP};
  }

  var S={who:'company',veh:1,dev:null,drv:'1',busy:false,started:false};
  var root,tiersEl,timer;

  function eur(n){var r=Math.round(n*100)/100,s=(r%1===0)?String(r):r.toFixed(2);return '€'+s.replace(/\B(?=(\d{3})+(?!\d))/g,',');}
  function tierFor(n){for(var i=0;i<RULES.tiers.length;i++){if(n<=RULES.tiers[i].max)return RULES.tiers[i];}return RULES.tiers[RULES.tiers.length-1];}
  function nextTier(t){var i=RULES.tiers.indexOf(t);return i>-1&&i<RULES.tiers.length-1?RULES.tiers[i+1]:null;}
  function track(ev,p){try{window.dataLayer=window.dataLayer||[];var o={event:ev};for(var k in p){if(p.hasOwnProperty(k))o[k]=p[k];}window.dataLayer.push(o);}catch(e){}
    try{if(typeof window.gtag==='function'){var q={send_to:'GA4'};for(var k2 in p){if(p.hasOwnProperty(k2))q[k2]=p[k2];}window.gtag('event',ev,q);}}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  function band(n){return n<=1?'1':n<=2?'2':n<=4?'3-4':n<=6?'5-6':n<=20?'7-20':'21+';}

  /* ---------- markup ---------- */
  function choice(group,val,ico,title,sub,on){
    return '<button type="button" class="tgs-fc__opt'+(on?' is-on':'')+'" data-g="'+group+'" data-v="'+val+'" aria-pressed="'+(on?'true':'false')+'">'+
      (ico?'<img class="tgs-fc__ico" src="'+(ico.indexOf('/')>-1?ico:IC+ico+'.webp')+'" alt="" width="52" height="52" loading="lazy">':'')+
      '<span class="tgs-fc__opt-t"><b>'+title+'</b><small>'+sub+'</small></span></button>';
  }
  function build(){
    var scale=RULES.tiers.map(function(t){return '<span data-t="'+t.id+'"><b>'+t.name.replace('TAGRA ','')+'</b><small>'+(t.max===Infinity?'7+':t.max<=2?t.cap:t.cap.replace(/ vehicles?/,''))+'</small></span>';}).join('');
    var h=''+
    '<div class="tgs-fc" role="group" aria-label="TAGRA fleet calculator">'+
     '<div class="tgs-fc__in">'+
      '<div class="tgs-fc__step"><p class="tgs-fc__q"><span class="tgs-fc__n">1</span>Who is TAGRA for?</p>'+
       '<div class="tgs-fc__opts">'+
        choice('who','company','firma','Transport company','Vehicles fitted with tachographs',true)+
        choice('who','driver','ridic','Employed driver','Your own driver card'+(RULES.trucker2?' · 1 or 2 drivers':''),false)+
       '</div></div>'+
      '<div class="tgs-fc__step" data-for="company"><p class="tgs-fc__q"><span class="tgs-fc__n">2</span><label for="tgs-fc-veh">How many vehicles have a tachograph?</label></p>'+
       '<div class="tgs-fc__veh">'+
        '<div class="tgs-fc__stepper"><button type="button" class="tgs-fc__pm" data-d="-1" aria-label="One vehicle less">−</button>'+
        '<input id="tgs-fc-veh" type="number" inputmode="numeric" min="1" max="9999" value="1" aria-describedby="tgs-fc-veh-note">'+
        '<button type="button" class="tgs-fc__pm" data-d="1" aria-label="One vehicle more">+</button></div>'+
        '<div class="tgs-fc__scale" aria-hidden="true">'+scale+'</div>'+
       '</div><p class="tgs-fc__note" id="tgs-fc-veh-note">Licences are based on the number of vehicles. Driver cards are not counted.</p></div>'+
      '<div class="tgs-fc__step" data-for="company"><p class="tgs-fc__q"><span class="tgs-fc__n">3</span>Do you need a download device?</p>'+
       '<div class="tgs-fc__opts">'+
        choice('dev','box','klic','Yes, add DOWNLOAD BOX II S <em class="tgs-fc__pop">Most popular</em>','Downloads tachograph and driver card data · save '+SAVE+' in a bundle',false)+
        choice('dev','own','mam','No, we already have one','Licence only',false)+
       '</div><p class="tgs-fc__note">Not sure which device you need? <a href="#tgs-help">Ask us</a>.</p></div>'+
      (RULES.trucker2?
      '<div class="tgs-fc__step tgs-fc__drv" data-for="driver" hidden><p class="tgs-fc__q"><span class="tgs-fc__n">2</span>How many drivers will use the program?</p>'+
       '<div class="tgs-fc__opts">'+
        choice('drv','1','ridic','1 driver','TAGRA TRUCKER · your own driver card',true)+
        choice('drv','2','https://tagra.app/assets/img/icons/cfg-ico-ridici2.webp','2 drivers sharing one PC','TAGRA TRUCKER 2 · one licence for both cards',false)+
       '</div><p class="tgs-fc__note">For employed drivers who check driving and rest times from their own driver cards. One USB card reader is included and shipped to you.</p></div>'
      :
      '<div class="tgs-fc__step tgs-fc__drv" data-for="driver" hidden><p class="tgs-fc__q"><span class="tgs-fc__n">2</span>TAGRA TRUCKER for your own card</p>'+
       '<p class="tgs-fc__p">For an employed driver who checks driving and rest times from their own driver card. The USB card reader is included and shipped to you.</p></div>')+
     '</div>'+
     '<aside class="tgs-fc__sum" aria-live="polite"></aside>'+
    '</div>';
    return h;
  }

  /* ---------- state -> summary ---------- */
  function model(){
    if(S.who==='driver'){
      var two=S.drv==='2'&&!!RULES.trucker2,tr=two?RULES.trucker2:RULES.trucker;
      return {kind:'driver',drivers:two?2:1,title:tr.name,cap:two?'For two drivers sharing one PC':'For one employed driver',lines:[[tr.name+' licence',eur(tr.price)]],total:tr.price,fee:tr.fee,
        y3:tr.price+2*tr.fee,priceId:tr.priceId,url:tr.url,ship:(two?'One USB card reader for both cards':'USB card reader')+' shipped · shipping '+RULES.shipping,cta:'Add '+tr.name+' to cart'};
    }
    var t=tierFor(S.veh),box=S.dev==='box',lines=[[t.name+' licence',eur(t.price)]];
    if(box){lines.push([RULES.box.name,eur(RULES.box.price)]);lines.push(['Bundle saving','−'+eur(t.price+RULES.box.price-t.bundle.price),'save']);}
    var total=box?t.bundle.price:t.price,nt=nextTier(t),hint='';
    if(nt&&S.veh===t.max)hint=t.name+' covers up to '+t.max+(t.max===1?' vehicle':' vehicles')+'. Adding vehicles? '+nt.name+' covers '+nt.cap+'.';
    return {kind:'company',tier:t,title:t.name,cap:'Covers '+t.cap,fit:'Recommended for '+S.veh+(S.veh===1?' vehicle':' vehicles'),lines:lines,total:total,fee:t.fee,
      y3:total+2*t.fee,priceId:box?t.bundle.priceId:t.priceId,url:box?t.bundle.url:t.url,ship:box?'Device shipping '+RULES.shipping+' across Europe':'',hw:box,hint:hint,
      cta:box?'Add bundle to cart':'Add '+t.name+' to cart',ask:S.dev===null};
  }
  function render(){
    var m=model(),sum=root.querySelector('.tgs-fc__sum');
    var h='<span class="tgs-fc__lbl">Your TAGRA</span>'+
      '<p class="tgs-fc__tier">'+esc(m.title)+'</p><p class="tgs-fc__cap">'+esc(m.cap)+(m.fit?' · <b>'+esc(m.fit)+'</b>':'')+'</p>'+
      '<ul class="tgs-fc__lines">'+m.lines.map(function(l){return '<li'+(l[2]?' class="is-'+l[2]+'"':'')+'><span>'+esc(l[0])+'</span><span>'+esc(l[1])+'</span></li>';}).join('')+'</ul>'+
      (m.ask?'<p class="tgs-fc__ask">Need a download device? Choose in step 3 and save '+SAVE+' with a bundle.</p>':'')+
      '<div class="tgs-fc__tot"><span class="tgs-fc__tot-l">Today'+(m.hw?', plus shipping':'')+'</span><span class="tgs-fc__tot-v">'+eur(m.total)+'<small>excl. VAT</small></span>'+
      '<span class="tgs-fc__vat">+ VAT of your country · 0 % for EU companies with a valid VAT ID (reverse charge)</span></div>'+
      '<ul class="tgs-fc__facts"><li>First year included</li><li>From year 2: '+eur(m.fee)+' / year</li>'+(m.ship?'<li>'+esc(m.ship)+'</li>':'')+'</ul>'+
      (m.hint?'<p class="tgs-fc__hint">'+esc(m.hint)+'</p>':'')+
      '<a class="tgs-pill tgs-fc__cta" href="'+m.url+'" data-price-id="'+m.priceId+'">'+esc(m.cta)+'</a>'+
      '<p class="tgs-fc__msg" role="status"></p>'+
      '<a class="tgs-fc__more" href="'+m.url+'">View product details</a>';
    sum.innerHTML=h;
    sum.querySelector('.tgs-fc__cta').addEventListener('click',add);
    if(tiersEl){[].forEach.call(tiersEl.querySelectorAll('.tgs-tier'),function(x){x.classList.toggle('is-match',m.kind==='company'&&x.getAttribute('href')===m.tier.url);});}
    var sc=root.querySelector('.tgs-fc__scale');
    if(sc&&m.tier){[].forEach.call(sc.children,function(x){x.classList.toggle('is-on',x.getAttribute('data-t')===m.tier.id);});}
    clearTimeout(timer);
    if(S.started){timer=setTimeout(function(){track('fleet_calc_recommendation',{fc_branch:m.kind,fc_tier:m.title,fc_band:m.kind==='company'?band(S.veh):'driver',fc_device:S.dev||'none',fc_drivers:m.drivers||'',fc_value:m.total});},1000);}
  }

  /* ---------- cart ---------- */
  function add(e){
    var a=e.currentTarget,pid=parseInt(a.getAttribute('data-price-id'),10),msg=root.querySelector('.tgs-fc__msg'),m=model();
    track('fleet_calc_cta_click',{fc_branch:m.kind,fc_tier:m.title,fc_drivers:m.drivers||'',fc_value:m.total});
    var api=window.shoptet&&shoptet.cartShared&&typeof shoptet.cartShared.addToCart==='function';
    if(!api||!pid)return; /* fallback: normal link to the product */
    e.preventDefault();
    if(S.busy)return;
    window.tgsFcAddTs=Date.now();
    S.busy=true;a.classList.add('is-busy');a.setAttribute('aria-disabled','true');msg.textContent='Adding to cart…';
    var done=false;
    function ok(){if(done)return;done=true;document.removeEventListener('ShoptetCartUpdated',ok);S.busy=false;a.classList.remove('is-busy');a.removeAttribute('aria-disabled');
      msg.innerHTML='Added to cart. <a href="/cart/">Go to cart</a>';track('fleet_calc_added',{fc_tier:m.title,fc_drivers:m.drivers||'',fc_value:m.total});}
    document.addEventListener('ShoptetCartUpdated',ok);
    try{shoptet.cartShared.addToCart({priceId:pid,amount:1});}
    catch(err){done=true;document.removeEventListener('ShoptetCartUpdated',ok);track('fleet_calc_error',{fc_error:'add_exception'});location.href=a.getAttribute('href');return;}
    setTimeout(function(){if(!done){done=true;document.removeEventListener('ShoptetCartUpdated',ok);S.busy=false;a.classList.remove('is-busy');a.removeAttribute('aria-disabled');
      track('fleet_calc_error',{fc_error:'add_timeout'});msg.innerHTML='Could not add to cart. Please <a href="'+a.getAttribute('href')+'">open the product page</a> to buy it.';}},8000);
  }

  /* ---------- events ---------- */
  function start(){if(!S.started){S.started=true;track('fleet_calc_start',{});try{if(window.clarity)clarity('set','fleet_calc','used');}catch(e){}}}
  function setVeh(n){n=parseInt(n,10);if(!(n>=1))n=1;if(n>9999)n=9999;S.veh=n;var i=root.querySelector('#tgs-fc-veh');if(String(i.value)!==String(n))i.value=n;render();}
  function bind(){
    root.addEventListener('click',function(e){
      var o=e.target.closest('.tgs-fc__opt');
      if(o){start();var g=o.getAttribute('data-g'),v=o.getAttribute('data-v');S[g]=v;
        [].forEach.call(root.querySelectorAll('.tgs-fc__opt[data-g="'+g+'"]'),function(x){var on=x===o;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on?'true':'false');});
        if(g==='who'){[].forEach.call(root.querySelectorAll('[data-for]'),function(s){s.hidden=s.getAttribute('data-for')!==v;});}
        render();return;}
      var pm=e.target.closest('.tgs-fc__pm');
      if(pm){start();setVeh(S.veh+parseInt(pm.getAttribute('data-d'),10));return;}
      var ch=e.target.closest('.tgs-fc__scale span[data-t]');
      if(ch){start();for(var i=0;i<RULES.tiers.length;i++){var t=RULES.tiers[i];if(t.id===ch.getAttribute('data-t')){setVeh(t.max===Infinity?(i>0?RULES.tiers[i-1].max+1:1):t.max);break;}}}
    });
    var inp=root.querySelector('#tgs-fc-veh');
    inp.addEventListener('input',function(){start();var n=parseInt(inp.value,10);if(n>=1){S.veh=Math.min(n,9999);render();}});
    inp.addEventListener('blur',function(){setVeh(inp.value);});
  }

  /* ---------- entry hub (shop.js) -> preselect "Transport company" / "Employed driver" ---------- */
  var PEND=null;
  function pick(who){var o=root&&root.querySelector('.tgs-fc__opt[data-g="who"][data-v="'+who+'"]');if(o&&!o.classList.contains('is-on'))o.click();}
  document.addEventListener('tgs:fc',function(e){var w=e&&e.detail&&e.detail.who;if(w!=='driver'&&w!=='company')return;if(root)pick(w);else PEND=w;});

  /* ---------- init ---------- */
  function init(){
    var sec=document.querySelector('.tgs-pricing');if(!sec)return false;
    if(sec.querySelector('.tgs-fc'))return true;
    var finder=sec.querySelector('.tgs-finder');tiersEl=sec.querySelector('.tgs-tiers');
    var wrap=document.createElement('div');wrap.innerHTML=build();root=wrap.firstChild;
    if(finder){finder.parentNode.insertBefore(root,finder);finder.hidden=true;}
    else if(tiersEl){tiersEl.parentNode.insertBefore(root,tiersEl);}
    else return false;
    sec.classList.add('tgs-fc-on');
    bind();render();
    if(PEND){pick(PEND);PEND=null;}
    track('fleet_calc_view',{fc_rules:RULES.version});
    return true;
  }
  /* prices: window.TAGRA_PRICES from tagra-prices.js (loaded here once; without it the original finder stays) */
  function withPrices(cb){
    function go(){if(RULES||!window.TAGRA_PRICES)return;RULES=rules(window.TAGRA_PRICES);var t=RULES.tiers[0];SAVE=eur(t.price+RULES.box.price-t.bundle.price);cb();}
    if(window.TAGRA_PRICES){go();return;}
    var s=document.getElementById('tgs-prices-js');
    if(!s){s=document.createElement('script');s.id='tgs-prices-js';s.src=PRICES_JS;s.async=true;document.head.appendChild(s);}
    s.addEventListener('load',go);
    s.addEventListener('error',function(){track('fleet_calc_error',{fc_error:'prices_load'});});
  }
  function boot(){
    if(!document.body||!document.body.classList.contains('type-index'))return;
    withPrices(function(){var tries=0;(function go(){if(init())return;if(++tries<40)setTimeout(go,150);})();});
  }
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://tagra.app/assets/css/shop-fleet.css?v=3';document.head.appendChild(l);
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}else{boot();}
})();
