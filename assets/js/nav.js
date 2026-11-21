/* TAGRA shared nav behavior — loaded site-wide alongside nav.css.
   Currently handles: click-outside-to-close on the <details class="nav-lang"> dropdown. */
(function() {
  'use strict';
  document.addEventListener('click', function(e) {
    document.querySelectorAll('details.nav-lang[open]').forEach(function(el) {
      if (!el.contains(e.target)) {
        el.removeAttribute('open');
      }
    });
  });
  // Also close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      document.querySelectorAll('details.nav-lang[open]').forEach(function(el) {
        el.removeAttribute('open');
        // Return focus to the summary so keyboard users don't lose context
        var sum = el.querySelector('summary');
        if (sum) sum.focus();
      });
    }
  });

  /* Přepínač jazyka vede na ekvivalent stránky, ne na homepage.
     Odkazy v <nav> jsou na všech stránkách jeden statický blok mířící na /,
     /de/, /pl/, /el/, /hu/. Skutečné překlady si každá stránka deklaruje sama
     v <head> jako <link rel="alternate" hreflang="...">. Bereme je odtud —
     přepínač tak drží krok s obsahem i na stránkách přidaných později a není
     co udržovat na 100+ místech. Bez JS zůstává původní chování (homepage
     daného jazyka), takže nejde o regresi.

     13. 9. 2026: selektor rozšířen o .site-footer. Patička byla zapomenutý
     blok ze sedmijazyčné éry — na 124 stránkách vedla "angličtina" jinam
     než na angličtinu, na 8 na /en/ (404) a chyběly v ní FR/NL/RO. Po
     doplnění hreflang do patičky ji obsluhuje tentýž kód jako hlavičku. */
  function syncLangLinks() {
    var alts = {};
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function(l) {
      var lg = l.getAttribute('hreflang');
      if (lg && lg !== 'x-default') alts[lg] = l.href;
    });
    document.querySelectorAll('.nav-lang-menu a[hreflang], .site-footer a[hreflang]').forEach(function(a) {
      /* Čeština a slovenština míří na tdt.cz / tdt.sk (target=_blank) — ty
         nechat být, alternate pro ně neexistuje. */
      if (a.hasAttribute('target')) return;
      var target = alts[a.getAttribute('hreflang')];
      if (target) a.setAttribute('href', target);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncLangLinks);
  } else {
    syncLangLinks();
  }
})();

/* Jarabot chat (TDT robot) – náhrada Smartsuppu, 21. 11. 2026.
   Nacita se site-wide odtud (schranka "tagra.app", id 951, TDT robot).
   Misto vychozi zelene bubliny macajici robot #tgs-chat (stejny jako shop-tracking.js v1.2).
   Loader se nacita az po prvni interakci (scroll, dotyk, mys, klavesa) nebo po 8 s necinnosti
   kvuli INP/TBT na mobilu. Souhlas: chat je sluzba, kterou navstevnik sam vyvola, proto se
   nacita bez gatingu (stejne jako drive Smartsupp); v cookie liste je uveden mezi zpracovateli. */
(function () {
  'use strict';
  if (window.__tgsChat) return;
  var JB_URL = 'https://chat.jarabot.com';
  var JB_TOKEN = 'JECBcyMMFo4GDLZ4LqfDZ879';
  var lg = ((document.documentElement.getAttribute('lang') || 'en').slice(0, 2) || 'en').toLowerCase();
  /* hideMessageBubble: vychozi bublinu skryt, misto ni robot; locale podle <html lang> */
  window.jarabotSettings = window.chatwootSettings = { hideMessageBubble: true, position: 'right', locale: lg };

  /* Texty robota (crew Gemini, 21. 11. 2026); cs z tdt.cz, sk zatim en */
  var TX = {
    cs: { t: 'Potřebujete poradit?', s: 'Asistent odpoví hned', a: 'Otevřít chat s asistentem TAGRA' },
    en: { t: 'Need help?', s: 'Our assistant replies instantly', a: 'Open chat with the TAGRA assistant' },
    de: { t: 'Brauchen Sie Hilfe?', s: 'Unser Assistent antwortet sofort', a: 'Chat mit dem TAGRA-Assistenten öffnen' },
    pl: { t: 'Potrzebują Państwo pomocy?', s: 'Nasz asystent odpowiada natychmiast', a: 'Otwórz czat z asystentem TAGRA' },
    hu: { t: 'Segítségre van szüksége?', s: 'Asszisztensünk azonnal válaszol', a: 'Csevegés megnyitása a TAGRA asszisztenssel' },
    es: { t: '¿Necesitas ayuda?', s: 'Nuestro asistente responde al instante', a: 'Abrir chat con el asistente de TAGRA' },
    it: { t: 'Ha bisogno di aiuto?', s: 'Il nostro assistente risponde subito', a: "Apri la chat con l'assistente TAGRA" },
    fr: { t: "Besoin d'aide ?", s: 'Notre assistant répond instantanément', a: "Ouvrir le chat avec l'assistant TAGRA" },
    nl: { t: 'Hulp nodig?', s: 'Onze assistent antwoordt direct', a: 'Open chat met de TAGRA-assistent' },
    ro: { t: 'Aveți nevoie de ajutor?', s: 'Asistentul nostru răspunde instantaneu', a: 'Deschideți chatul cu asistentul TAGRA' },
    el: { t: 'Χρειάζεστε βοήθεια;', s: 'Ο βοηθός μας απαντά αμέσως', a: 'Άνοιγμα συνομιλίας με τον βοηθό TAGRA' }
  };
  var tx = TX[lg] || TX.en;
  var d = document;
  var IMG = 'https://www.tdt.cz/assets/img/chat/';
  var ROBOT_CSS = '#tgs-chat{position:fixed;right:22px;bottom:22px;z-index:2147482000;display:flex;align-items:flex-end;gap:12px;cursor:pointer;border:0;background:none;padding:0;margin:0;font:inherit;transition:bottom .35s ease}'
    + '#tgs-chat .lbl{background:#fff;color:#123a6b;font-weight:600;font-size:15px;line-height:1.25;padding:10px 14px;border-radius:16px 16px 4px 16px;box-shadow:0 6px 24px rgba(16,42,80,.18);margin-bottom:10px;text-align:left;opacity:0;transform:translateX(8px);pointer-events:none;transition:opacity .3s ease,transform .3s ease;white-space:nowrap}'
    + '#tgs-chat .lbl small{display:block;font-weight:400;color:#4b5b70;font-size:13px}'
    + '#tgs-chat.peek .lbl,#tgs-chat:hover .lbl,#tgs-chat:focus-visible .lbl{opacity:1;transform:none}'
    + '#tgs-chat .av{position:relative;width:96px;height:82px;flex:0 0 96px;transition:transform .2s ease;filter:drop-shadow(0 6px 14px rgba(16,42,80,.30))}'
    + '#tgs-chat .av img{display:block;width:96px;height:auto;max-width:none;pointer-events:none;border:0;margin:0}'
    + '#tgs-chat .av img+img{position:absolute;left:0;top:0}'
    + '#tgs-chat .av .h{transform-origin:64.06% 65.85%;animation:tgsWave 6s ease-in-out .4s infinite}'
    + '#tgs-chat .av .g,#tgs-chat .av .e{transform-origin:41.7% 51.8%;animation:tgsHead 6s ease-in-out .4s infinite}'
    + '#tgs-chat .av .e{opacity:0;animation:tgsHead 6s ease-in-out .4s infinite,tgsBlink 6s linear .4s infinite}'
    + '@keyframes tgsHead{0%,100%{transform:rotate(0)}10%{transform:rotate(-4deg)}24%{transform:rotate(3deg)}38%{transform:rotate(0)}62%{transform:rotate(-2deg)}82%{transform:rotate(2.5deg)}}'
    + '@keyframes tgsWave{0%,36%,100%{transform:rotate(0)}5%{transform:rotate(-18deg)}11%{transform:rotate(12deg)}17%{transform:rotate(-16deg)}23%{transform:rotate(10deg)}29%{transform:rotate(-7deg)}33%{transform:rotate(3deg)}}'
    + '@keyframes tgsBlink{0%,46%,49%,84%,87%,100%{opacity:0}46.6%,48.4%,84.6%,86.4%{opacity:1}}'
    + '@media (hover:hover){#tgs-chat:hover .av{transform:translateY(-3px)}}'
    + '#tgs-chat:focus-visible{outline:3px solid #7cc242;outline-offset:4px;border-radius:40px}'
    + '.woot--bubble-holder{display:none!important}'
    + '@media (max-width:600px){#tgs-chat{right:14px;bottom:14px}#tgs-chat .lbl{display:none}#tgs-chat .av{transform:scale(.86);transform-origin:bottom right}}'
    + '@media (prefers-reduced-motion:reduce){#tgs-chat,#tgs-chat .av,#tgs-chat .lbl{transition:none}#tgs-chat .av .h,#tgs-chat .av .g{animation:none}#tgs-chat .av .e{animation:tgsBlink 6s linear infinite}}';
  function robot() {
    if (d.getElementById('tgs-chat') || !d.body) return;
    if (!d.getElementById('tgs-chat-css')) {
      var st = d.createElement('style'); st.id = 'tgs-chat-css'; st.textContent = ROBOT_CSS;
      (d.head || d.documentElement).appendChild(st);
    }
    var b = d.createElement('button'); b.type = 'button'; b.id = 'tgs-chat'; b.setAttribute('aria-label', tx.a);
    b.innerHTML = '<span class="lbl">' + tx.t + '<small>' + tx.s + '</small></span><span class="av" aria-hidden="true">'
      + '<img src="' + IMG + 'robot-chat-telo5.webp" alt="" width="96" height="82">'
      + '<img class="g" src="' + IMG + 'robot-chat-hlava2.webp" alt="" width="96" height="82">'
      + '<img class="e" src="' + IMG + 'robot-chat-mrk2.webp" alt="" width="96" height="82">'
      + '<img class="h" src="' + IMG + 'robot-chat-paze.webp" alt="" width="96" height="82"></span>';
    /* bublina s textem jednou za navstevu po 6,5 s, jen na desktopu, na 8 s */
    try {
      if (window.matchMedia && window.matchMedia('(min-width:1024px) and (hover:hover)').matches && !sessionStorage.getItem('tgsChatPeek')) {
        setTimeout(function () {
          b.classList.add('peek'); try { sessionStorage.setItem('tgsChatPeek', '1'); } catch (e) {}
          setTimeout(function () { b.classList.remove('peek'); }, 8000);
        }, 6500);
      }
    } catch (e) {}
    b.addEventListener('click', function () {
      b.classList.remove('peek'); try { sessionStorage.setItem('tgsChatPeek', '1'); } catch (e) {}
      if (window.$chatwoot && window.$chatwoot.toggle) window.$chatwoot.toggle();
      (window.dataLayer = window.dataLayer || []).push({ event: 'chat_open' });
    });
    d.body.appendChild(b);
  }

  var loaded = false;
  var EVENTS = ['scroll', 'pointerdown', 'mousemove', 'touchstart', 'keydown'];
  function load() {
    if (loaded) return;
    loaded = true;
    window.__tgsChat = 1;
    EVENTS.forEach(function (ev) { window.removeEventListener(ev, load, { passive: true }); });
    var s = d.getElementsByTagName('script')[0];
    var c = d.createElement('script');
    c.async = true;
    c.src = JB_URL + '/packs/js/sdk.js';
    c.onload = function () {
      try { window.jarabotSDK.run({ websiteToken: JB_TOKEN, baseUrl: JB_URL }); } catch (e) {}
      robot();
    };
    s.parentNode.insertBefore(c, s);
  }
  EVENTS.forEach(function (ev) { window.addEventListener(ev, load, { passive: true, once: true }); });
  setTimeout(load, 8000);
})();

/* Odsazeni robota #tgs-chat nad cookie listu (.tmx-cc), sticky CTA listu (#stickyCta)
   a mobilni listu clanku (#brBar). Zvedneme ho o vysku listy, jakmile je videt,
   a vratime dolu, kdyz zmizi. Vysku merime za behu. MutationObserver jen childList+subtree
   (zadne attributes) + scroll/resize, aby nevznikla smycka. */
(function () {
  'use strict';
  var GAP = 12;
  var last = null;
  function bars() {
    var out = [], c = document.querySelector('.tmx-cc');
    if (c) out.push(c);
    var ids = ['stickyCta', 'brBar'];
    for (var i = 0; i < ids.length; i++) {
      var e = document.getElementById(ids[i]);
      if (e && e.classList.contains('is-visible')) out.push(e);
    }
    return out;
  }
  function apply() {
    var r = document.getElementById('tgs-chat');
    if (!r) return;
    var extra = 0, list = bars();
    for (var i = 0; i < list.length; i++) {
      var rect = list[i].getBoundingClientRect();
      if (rect.height > 0 && rect.top < window.innerHeight) extra = Math.max(extra, Math.round(window.innerHeight - rect.top) + GAP);
    }
    var base = window.innerWidth <= 600 ? 14 : 22;
    var val = (base + extra) + 'px';
    if (val === last && r.style.bottom === val) return;
    last = val;
    r.style.setProperty('bottom', val, 'important');
  }
  function init() {
    new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', apply);
    window.addEventListener('scroll', apply, { passive: true });
    setInterval(apply, 1000);
    apply();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ─── First-touch attribution pro trial formulář (19. 9. 2026) ───
 * Uloží do sessionStorage první stránku návštěvy (cesta + ?src= + externí
 * referrer). try.js ji připojí do skrytého pole source_url, takže u každé
 * registrace zkušební verze uvidíme vstupní stránku z Google, i když návštěvník
 * šel přes další stránky. Jen sessionStorage (zmizí se zavřením karty), žádné
 * cookies, žádná osobní data. */
(function () {
  try {
    var KEY = 'tagra_landing';
    if (!sessionStorage.getItem(KEY)) {
      var ref = document.referrer || '';
      var internal = ref && ref.indexOf(location.origin) === 0;
      sessionStorage.setItem(KEY, JSON.stringify({
        p: location.pathname,
        s: new URLSearchParams(location.search).get('src') || '',
        r: internal ? '' : ref.replace(/^https?:\/\//, '').split('/')[0],
        t: new Date().toISOString().slice(0, 16)
      }));
    }
  } catch (e) { /* sessionStorage nedostupné — atribuce se přeskočí */ }
})();

/* ─── Mobilní „pošlete mi odkaz na PC" (blok .cc-top, 19. 9. 2026) ───
 * Odešle jméno + e-mail do Netlify formuláře tagra-trial (AJAX, zůstává se na
 * stránce). Uvítací e-mail s odkazem ke stažení posílá trial-email.js jako
 * u plného formuláře. Bez JS formulář odejde klasicky (POST s form-name). */
(function () {
  'use strict';
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.classList || !f.classList.contains('cc-mail')) return;
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var msg = f.querySelector('.cc-msg');
    var btn = f.querySelector('button[type="submit"]');
    var src = f.querySelector('.cc-src');
    var landing = '';
    try {
      var l = JSON.parse(sessionStorage.getItem('tagra_landing') || 'null');
      if (l && l.p) landing = ' | landing: ' + l.p + (l.s ? ' src=' + l.s : '') +
        ' via ' + (l.r || '(direct/internal)') + ' @' + l.t;
    } catch (x) { /* bez atribuce */ }
    // src atribuce: ?src= z URL, jinak vstupní stránka ze sessionStorage
    var srcVal = new URLSearchParams(location.search).get('src') || '';
    if (!srcVal) {
      try { srcVal = (JSON.parse(sessionStorage.getItem('tagra_landing') || 'null') || {}).p || ''; } catch (x) { /* bez src */ }
    }
    var srcField = f.querySelector('input[name="src"]');
    if (srcField) srcField.value = srcVal;
    if (src) src.value = location.href.split('#')[0] + ' | quick-mail-form' + landing +
      (srcVal ? ' | src: ' + srcVal : '');
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = f.getAttribute('data-sending') || label; }
    var body = new URLSearchParams(new FormData(f)).toString();
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      f.classList.add('is-done');
      if (msg) msg.textContent = f.getAttribute('data-ok') || '';
      try {
        var aud = f.querySelector('input[name="audience"]');
        var lng = f.querySelector('input[name="language"]');
        if (window.tagraTrackLead) window.tagraTrackLead('quick-mail', aud ? aud.value : '', lng ? lng.value : '', srcVal);
      } catch (x) { /* měření nesmí hlásit chybu odeslání */ }
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (msg) {
        msg.textContent = (f.getAttribute('data-err') || '') + ' ';
        var a = document.createElement('a');
        a.href = f.getAttribute('data-try') || '/try/';
        a.textContent = f.getAttribute('data-errlink') || '';
        msg.appendChild(a);
        msg.appendChild(document.createTextNode('.'));
      }
    });
  });
})();

/* ─── Měření konverzí trialu: ?src= atribuce, GA4 eventy, Clarity (2. 10. 2026) ───
 * Jen JS, žádný zásah do textu ani vzhledu. GA4 i Clarity jsou za consent
 * bannerem (Consent Mode v2, default denied) — gtag() jen řadí do dataLayeru
 * a Google si sám hlídá souhlas; Clarity se volá jen když už existuje.
 * Bez gtag / clarity se vše tiše přeskočí.
 *  1. Odkazům na trial stránky se doplní ?src=<cesta aktuální stránky>, aby
 *     atribuce přežila otevření v nové kartě (sessionStorage se tam ztratí).
 *  2. trial_cta_click (klik na trial odkaz), trial_download (klik na
 *     #downloadBtn), generate_lead (thanks stránka; u rychlého formuláře
 *     po úspěšném odeslání).
 *  3. Clarity: page_type, lang, na thanks event trial_lead + audience,
 *     na download event trial_download.
 * Slugy trial stránek jsou z i18n/slugmap.json (klíč "try"). */
(function () {
  'use strict';
  // i18n/slugmap.json (klíč "try") neobsahuje ro/fr/nl — doplněno ručně podle živých stránek
  var TRIAL_PATHS = ['/try', '/de/testen', '/pl/wyprobuj', '/el/dokimi',
    '/hu/ingyenes-probaverzio', '/it/prova-gratuita',
    '/ro/incercare-gratuita', '/fr/essai-gratuit', '/nl/gratis-proefversie', '/es/prueba-gratis'];
  var ARTICLE_RE = /^\/(articles|de\/ratgeber|pl\/poradnik|hu\/cikkek|ro\/articole|nl\/artikelen|it\/articoli|el\/arthra|fr\/articles|es\/articulos)(\/|$)/;
  var COMMERCIAL_RE = /^\/((de\/|pl\/|el\/|hu\/|it\/|fr\/|ro\/|nl\/|es\/)?$|(driver|fleet|enforcement|how-it-works|for-whom|faq|contact)(\/|$)|de\/(fahrer|fuhrpark|kontrollbehoerden|so-funktioniert-es|fuer-wen|faq|kontakt)(\/|$)|pl\/(dla-kierowcow|dla-przewoznikow|organy-kontrolne|jak-to-dziala|dla-kogo|faq|kontakt)(\/|$)|el\/(odigoi|stolos|eleghos|pos-leitourgei|gia-poion|faq|epikoinonia)(\/|$)|hu\/(soforoknek|fuvarozoknak|hatosagoknak|hogyan-mukodik|kinek-szol|gyakori-kerdesek|kapcsolat)(\/|$)|it\/(per-autisti|per-aziende|organi-di-controllo|come-funziona|a-chi-si-rivolge|faq|contatti)(\/|$)|es\/(empresas|conductores)(\/|$)|fr\/(conducteurs|entreprises|autorites-de-controle|fonctionnement|pour-qui|faq|contact)(\/|$)|ro\/(pentru-conducatori|pentru-firme|autoritati-de-control|cum-functioneaza|pentru-cine|intrebari-frecvente|contact)(\/|$)|nl\/(voor-chauffeurs|voor-transportbedrijven|handhaving|hoe-het-werkt|voor-wie|veelgestelde-vragen|contact)(\/|$))/;

  function normPath(p) {
    p = p.replace(/\/index\.html$/, '/');
    return p.length > 1 ? p.replace(/\/+$/, '') : p;
  }
  function isTrialPath(p) { return TRIAL_PATHS.indexOf(normPath(p)) !== -1; }
  function pageType() {
    var p = location.pathname;
    if (isTrialPath(p)) return 'trial';
    if (ARTICLE_RE.test(p)) return 'article';
    if (COMMERCIAL_RE.test(p)) return 'commercial';
    return 'other';
  }
  // Sdílí analytics.js — pageType() jako funkce, k ní isTrialPath a TRIAL_PATHS
  pageType.isTrialPath = isTrialPath;
  pageType.TRIAL_PATHS = TRIAL_PATHS;
  window.tagraPageType = pageType;
  function trialLink(el) {
    var a = el && el.closest ? el.closest('a[href]') : null;
    if (!a) return null;
    try {
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || !isTrialPath(u.pathname)) return null;
      return { a: a, u: u };
    } catch (e) { return null; }
  }
  function track(name, params) {
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', name, params); } catch (e) { /* měření nesmí rozbít stránku */ }
    }
  }
  function clar() {
    if (typeof window.clarity === 'function') {
      try { window.clarity.apply(null, arguments); } catch (e) { /* viz výše */ }
    }
  }
  function landing() {
    try { return JSON.parse(sessionStorage.getItem('tagra_landing') || 'null') || {}; } catch (e) { return {}; }
  }
  // Sdílené s kódem rychlého e-mailového formuláře níže — jednotné odeslání leadu.
  window.tagraTrackLead = function (variant, audience, lang, src) {
    var KEY = 'tagra_lead_tracked_' + variant;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, '1');
    } catch (e) { /* bez guardu */ }
    var l = landing();
    var ai = 'none';
    try { ai = sessionStorage.getItem('tagra_ai_source') || 'none'; } catch (e) { /* bez ai_source */ }
    track('generate_lead', {
      audience: audience || '', page_language: lang || '', src: src || '', ai_source: ai,
      landing_page: l.p || '', landing_referrer: l.r || '', form_variant: variant
    });
    clar('event', 'trial_lead');
    if (audience) clar('set', 'audience', audience);
  };

  function init() {
    var type = pageType();
    var lang = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
    clar('set', 'page_type', type);
    clar('set', 'lang', lang);

    // 1. ?src= na odkazech na trial (existující query se zachová)
    document.querySelectorAll('a[href]').forEach(function (a) {
      var t = trialLink(a);
      if (!t || t.u.searchParams.has('src')) return;
      var search = (t.u.search ? t.u.search + '&' : '?') + 'src=' + encodeURIComponent(location.pathname);
      a.setAttribute('href', t.u.pathname + search + t.u.hash);
    });

    // 2. trial_cta_click + trial_download
    document.addEventListener('click', function (e) {
      var t = trialLink(e.target);
      if (t) track('trial_cta_click', { page_path: location.pathname, cta_target: t.u.pathname, page_type: type });
      var dl = e.target.closest ? e.target.closest('#downloadBtn, [data-track="trial_download"]') : null;
      if (dl) {
        track('trial_download', { product: /Trucker/i.test(dl.href) ? 'trucker' : (/TAGRA_eu\.zip/i.test(dl.href) ? 'tagra_current' : 'tagra') });
        clar('event', 'trial_download');
        if (window.tagraDownloadNote) window.tagraDownloadNote(dl);
      }
    });

    // 3. thanks stránka hlavního formuláře (inline skript stránky už proběhl)
    var dlBtn = document.getElementById('downloadBtn');
    var qs = new URLSearchParams(location.search);
    /* again=1: návrat přes box „Už máte zkušební verzi“ (trialMemory) — není to nový lead (9. 11. 2026) */
    if (dlBtn && !window.tagraThanksRedirect && qs.get('again') !== '1') {  /* tagraThanksRedirect: /try/thanks/ právě přesměrovává na lokální poděkování */
      var enf = document.getElementById('thanksEnforcement');
      var aud = qs.get('audience') || qs.get('a');
      if (!aud) aud = (enf && !enf.hidden) ? 'enforcement' : (/Trucker/i.test(dlBtn.href) ? 'driver' : 'fleet');
      var src = '';
      try { src = sessionStorage.getItem('tagra_src') || ''; } catch (e) { /* bez src */ }
      window.tagraTrackLead('main', aud, lang, src);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* 2. 11. 2026: kontakt s fotkou specialisty v hlavičce (jako formoline112.cz / shop.tagra.app).
     Desktop > 1280 px: hlavička ve dvou řádcích – nahoře logo, fotka + telefon, jazyk, CTA;
     pod tím tmavě modrý pruh s menu. Do 1280 px jen kulatá fotka (tel:) vedle hamburgeru.
     8. 11. 2026 (F03): CSS je staticky v nav.css, aby výška hlavičky (120 px) platila od prvního
     vykreslení (dřív obsah po načtení poskočil o 56 px = CLS). Odsud se vkládá jen jako záloha,
     když prohlížeč má v cache starou nav.css bez značky --nav-contact-css. */
  (function navContact() {
    var inner = document.querySelector('.site-nav .nav-inner');
    if (!inner || inner.querySelector('.nav-contact')) return;
    var L = { en: 'Happy to help', de: 'Wir helfen Ihnen gerne', pl: 'Chętnie pomożemy', nl: 'We helpen u graag',
              fr: 'À votre écoute', it: 'Felici di aiutarti', el: 'Στη διάθεσή σας', ro: 'Vă stăm la dispoziție', hu: 'Szívesen segítünk', es: 'Encantados de ayudarte' };
    var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    var label = L[lang] || L.en;
    var tel = '+420739005345', telTxt = '+420 739 005 345';
    var css = ''
      + '.nav-contact{display:flex;align-items:center;gap:10px;text-decoration:none!important;flex-shrink:0;margin-left:auto}'
      + '.nav-contact__ph{width:52px;height:52px;flex:0 0 52px;border-radius:50%;background:#fff url(/assets/img/team/ivan-szabo.webp) center bottom/cover no-repeat;box-shadow:0 4px 12px rgba(11,44,74,.18);border:2px solid #fff}'
      + '.nav-contact__t{display:flex;flex-direction:column;line-height:1.2}'
      + '.nav-contact__t small{font-size:12px;font-weight:600;color:#5b6773}'
      + '.nav-contact__t b{font-size:17px;font-weight:800;color:#134a8e;white-space:nowrap}'
      + '.nav-contact:hover .nav-contact__t b{color:#0b2c4a}'
      + '@media (min-width:1281px){'
      + ':root{--nav-h:120px}'
      + '.site-nav .nav-inner{flex-wrap:wrap;align-content:flex-start;row-gap:0}'
      + '.site-nav .nav-inner>.nav-logo{align-self:center;margin:18px 0}'
      + '.site-nav .nav-inner>.nav-contact,.site-nav .nav-inner>details.nav-lang{height:68px;align-items:center}'
      + '.site-nav .nav-inner>.nav-links{order:10;flex:0 0 100%;height:52px;margin:0;justify-content:flex-start;position:relative;isolation:isolate}'
      + '.site-nav .nav-inner>.nav-links::before{content:"";position:absolute;z-index:-1;top:0;bottom:0;left:50%!important;right:auto!important;width:100vw;margin-left:-50vw;background:linear-gradient(90deg,#0b2c4a 0%,#134a8e 50%,#1f5fa6 100%);pointer-events:none}'
      + '.site-nav .nav-links>li>a:not(.nav-cta){color:#fff!important;text-transform:uppercase;font-weight:700!important;letter-spacing:.05em;font-size:14px!important}'
      + '.site-nav .nav-links>li>a:not(.nav-cta):hover{background:rgba(255,255,255,.1)!important;color:#fff!important}'
      + '.site-nav .nav-links>li.nav-cta-li{margin-left:auto}'
      + '}'
      + '@media (max-width:1280px){.nav-contact{margin-left:auto}.nav-contact__t{display:none}.nav-contact__ph{width:42px;height:42px;flex-basis:42px}}';
    var hasCss = false;
    try { hasCss = !!getComputedStyle(document.documentElement).getPropertyValue('--nav-contact-css').trim(); } catch (e) { /* bez getComputedStyle */ }
    if (!hasCss) { var st = document.createElement('style'); st.id = 'nav-contact-css'; st.textContent = css; document.head.appendChild(st); }
    var a = document.createElement('a'); a.className = 'nav-contact'; a.href = 'tel:' + tel; a.setAttribute('aria-label', label + ' ' + telTxt);
    a.innerHTML = '<span class="nav-contact__ph" aria-hidden="true"></span><span class="nav-contact__t"><small>' + label + '</small><b>' + telTxt + '</b></span>';
    var lg = inner.querySelector('details.nav-lang');
    inner.insertBefore(a, lg || null);
  })();

  /* 4. 11. 2026: Shop viditelně v mobilní liště (do 1280 px je položka menu schovaná v hamburgeru).
     Kopie vzniká jen tam, kde je Shop v menu – HU a stránky zkušební verze ho nemají. Vzhled: nav.css. */
  (function navShopMobile() {
    var inner = document.querySelector('.site-nav .nav-inner');
    var src = document.querySelector('.site-nav .nav-shop-li a');
    if (!inner || !src || inner.querySelector('.nav-shop-mobile')) return;
    var a = document.createElement('a');
    a.className = 'nav-shop-mobile';
    a.href = src.href;
    a.setAttribute('data-cta', 'nav-mobile');
    if (src.getAttribute('aria-label')) a.setAttribute('aria-label', src.getAttribute('aria-label'));
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle><path d="M2.5 3.5h3l2.6 12.2h10.6l2-8.7H6.3"></path></svg>';
    a.appendChild(document.createTextNode(src.textContent.trim()));
    inner.insertBefore(a, inner.querySelector('.nav-cta-mobile') || inner.querySelector('.nav-mobile-toggle'));
  })();

  /* 2. 11. 2026: Maďarsko – stávající zákazníci používají současnou TAGRU, proto jim na děkovací
     stránce trialu dáváme vybrat: TAGRA III (tagra.app) nebo současná TAGRA (instalačka na tdt.cz). */
  (function huVersions() {
    if (!/^\/hu\/koszonjuk\/?$/.test(location.pathname)) return;
    function go() {
      var btn = document.getElementById('downloadBtn');
      if (!btn || !/TAGRA_III/.test(btn.href) || document.getElementById('thanksAlt')) return;
      var lab = document.getElementById('downloadLabel');
      if (lab) lab.textContent = 'TAGRA III letöltése – új verzió (Windows, 47 MB)';
      var box = document.createElement('div');
      box.id = 'thanksAlt';
      box.style.cssText = 'max-width:560px;margin:28px auto 0;padding:22px 24px;border:1px solid rgba(19,74,142,.15);border-radius:16px;background:#f5f9fc;text-align:center';
      box.innerHTML = '<p style="margin:0 0 14px;font-size:16px;line-height:1.55"><strong>Az Ön cégénél már használják a TAGRA szoftvert?</strong><br>Meglévő ügyfeleink továbbra is dolgozhatnak a TAGRA már megszokott, jelenlegi verziójával. Új ügyfeleinknek a TAGRA III verziót ajánljuk.</p>'
        + '<a class="thanks-download" data-track="trial_download" download href="https://www.tdt.cz/download/TAGRA_eu.zip" style="background:#fff;color:#134a8e;border:1.5px solid rgba(19,74,142,.35);box-shadow:none"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"></path></svg><span>A jelenlegi TAGRA letöltése (Windows, 156 MB)</span></a>'
        + '<p class="thanks-meta" style="margin-top:12px">Nem biztos benne, melyik verzióra van szüksége? Írjon nekünk a <a href="mailto:rukon@rukon.hu">rukon@rukon.hu</a> címre.</p>';
      var meta = document.getElementById('thanksMeta');
      (meta || btn).insertAdjacentElement('afterend', box);
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', go); } else { go(); }
  })();

})();

/* 6. 11. 2026: hlídač hero videa. Když se přehrávání na viditelné stránce zastaví,
   zkusí ho spustit znovu; pokud to nepomůže, video jednou až dvakrát znovu načte.
   Limit brání opakovanému stahování tam, kde prohlížeč přehrávání blokuje (úsporný režim). */
(function heroVideoWatchdog() {
  'use strict';
  var v = document.getElementById('heroVideo');
  var hero = document.querySelector('.hero');
  if (!v || !hero) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var last = -1, stuck = 0, reloads = 0;
  function play() { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  setInterval(function () {
    var r = hero.getBoundingClientRect();
    if (document.hidden || r.bottom <= 0 || r.top >= window.innerHeight) { stuck = 0; last = -1; return; }
    if (v.querySelector('source[data-src]')) { stuck = 0; return; } /* F15: zdroje se připojí až po load */
    var t = v.currentTime;
    if (!v.paused && t !== last) { last = t; stuck = 0; return; }
    last = t;
    stuck++;
    if (stuck < 3) { play(); return; }
    stuck = 0;
    if (reloads < 2) { reloads++; try { v.load(); } catch (e) {} play(); }
  }, 2000);
})();

/* 7. 11. 2026: animovany robot TRUCKMALL v paticce (sdileny skript tm-robot.js, vrstvy z cdn.truckmall.cz) */
(function () {
  if (!document.querySelector('.site-footer')) return;
  var s = document.createElement('script'); s.src = '/assets/js/tm-robot.js?v=1'; s.defer = true; document.head.appendChild(s);
})();

/* 9. 11. 2026: trial — paměť registrace + poznámka po kliknutí na Stáhnout.
   Příčina: lidé posílali formulář zkušební verze 2× (návrat z jiné stránky, mobil → PC,
   po kliknutí na Stáhnout 150 MB „nic nedělo“).
   A) try.js po platném odeslání uloží do localStorage tagra_trial_v1 {t, u = děkovací URL, a}
      (žádný e-mail ani jméno). Na stránce zkušební verze se pak 30 dní místo formuláře
      ukáže box „Zkušební verzi už máte — Stáhnout znovu“ (→ děkovací stránka s again=1,
      která neposílá generate_lead) a odkaz na formulář pro jiný e-mail.
   B) Po kliknutí na tlačítko stažení (#downloadBtn / [data-track="trial_download"]) se pod
      ním ukáže poznámka, kde soubor najde; mimo Windows upozornění, že TAGRA běží na Windows.
   Texty: crew GPT + Gemini, vykání ve všech jazycích. */
(function trialMemory() {
  'use strict';
  var KEY = 'tagra_trial_v1';
  var MAX_AGE = 30 * 24 * 60 * 60 * 1000;
  var T = {
    en: { a_title: 'You already have the TAGRA trial', a_body: 'You requested it on {date}. The download link is also in your email.', a_btn: 'Download again', a_other: 'Request the trial for a different email', b_ok: 'Download started — the file will appear in your Downloads folder. It is large, so it may take a few minutes. Nothing happening? Click the button again.', b_nowin: 'TAGRA runs on Windows computers. Open the link from our email on your Windows PC.' },
    de: { a_title: 'Sie haben bereits die TAGRA-Testversion', a_body: 'Sie haben sie am {date} angefordert. Den Download-Link finden Sie auch in Ihrer E-Mail.', a_btn: 'Erneut herunterladen', a_other: 'Testversion für eine andere E-Mail-Adresse anfordern', b_ok: 'Download gestartet — die Datei wird in Ihrem Ordner „Downloads“ gespeichert. Da sie groß ist, kann dies einige Minuten dauern. Passiert nichts? Klicken Sie erneut auf die Schaltfläche.', b_nowin: 'TAGRA läuft auf Windows-Computern. Öffnen Sie den Link aus unserer E-Mail auf Ihrem Windows-PC.' },
    pl: { a_title: 'Mają już Państwo wersję próbną TAGRA', a_body: 'Zamówili ją Państwo {date}. Link do pobrania znajdą Państwo również w wiadomości e-mail.', a_btn: 'Pobierz ponownie', a_other: 'Zamów wersję próbną na inny adres e-mail', b_ok: 'Pobieranie rozpoczęte — plik pojawi się w folderze „Pobrane”. Jest duży, więc może to potrwać kilka minut. Nic się nie dzieje? Prosimy ponownie kliknąć przycisk.', b_nowin: 'TAGRA działa na komputerach z systemem Windows. Prosimy otworzyć link z naszej wiadomości e-mail na komputerze z systemem Windows.' },
    nl: { a_title: 'U heeft de TAGRA-proefversie al', a_body: 'U heeft deze op {date} aangevraagd. De downloadlink staat ook in uw e-mail.', a_btn: 'Opnieuw downloaden', a_other: 'Proefversie aanvragen voor een ander e-mailadres', b_ok: 'Download gestart — het bestand verschijnt in uw map Downloads. Het is groot, dus dit kan enkele minuten duren. Gebeurt er niets? Klik dan nogmaals op de knop.', b_nowin: 'TAGRA werkt op Windows-computers. Open de link uit onze e-mail op uw Windows-pc.' },
    fr: { a_title: 'Vous avez déjà la version d’essai de TAGRA', a_body: 'Vous l’avez demandée le {date}. Le lien de téléchargement figure aussi dans votre e-mail.', a_btn: 'Télécharger à nouveau', a_other: 'Demander l’essai avec une autre adresse e-mail', b_ok: 'Téléchargement lancé — le fichier apparaîtra dans votre dossier Téléchargements. Il est volumineux, cela peut donc prendre quelques minutes. Rien ne se passe ? Cliquez à nouveau sur le bouton.', b_nowin: 'TAGRA fonctionne sur les ordinateurs Windows. Ouvrez le lien de notre e-mail sur votre PC Windows.' },
    it: { a_title: 'Ha già la versione di prova di TAGRA', a_body: 'L’ha richiesta il {date}. Il link per il download è anche nella Sua email.', a_btn: 'Scarica di nuovo', a_other: 'Richieda la prova con un altro indirizzo email', b_ok: 'Download avviato — il file apparirà nella cartella Download. È di grandi dimensioni, quindi potrebbero volerci alcuni minuti. Non succede nulla? Faccia di nuovo clic sul pulsante.', b_nowin: 'TAGRA funziona sui computer Windows. Apra il link della nostra email sul Suo PC Windows.' },
    el: { a_title: 'Έχετε ήδη τη δοκιμαστική έκδοση του TAGRA', a_body: 'Τη ζητήσατε στις {date}. Ο σύνδεσμος λήψης βρίσκεται και στο email σας.', a_btn: 'Λήψη ξανά', a_other: 'Αίτημα δοκιμής με άλλο email', b_ok: 'Η λήψη ξεκίνησε — το αρχείο θα εμφανιστεί στον φάκελο «Λήψεις». Είναι μεγάλο, οπότε μπορεί να χρειαστούν λίγα λεπτά. Δεν συμβαίνει τίποτα; Πατήστε ξανά το κουμπί.', b_nowin: 'Το TAGRA λειτουργεί σε υπολογιστές Windows. Ανοίξτε τον σύνδεσμο από το email μας στον υπολογιστή σας με Windows.' },
    hu: { a_title: 'Önnek már megvan a TAGRA próbaverziója', a_body: 'Az igénylés dátuma: {date}. A letöltési linket az e-mailben is megtalálja.', a_btn: 'Letöltés újra', a_other: 'Próbaverzió igénylése másik e-mail-címmel', b_ok: 'A letöltés elindult — a fájl a Letöltések mappába kerül. A fájl nagy, ezért ez néhány percig is eltarthat. Nem történik semmi? Kattintson újra a gombra.', b_nowin: 'A TAGRA Windows rendszerű számítógépeken fut. Nyissa meg az e-mailünkben található linket a Windows rendszerű számítógépén.' },
    ro: { a_title: 'Aveți deja versiunea de probă TAGRA', a_body: 'Ați solicitat-o pe {date}. Linkul de descărcare se află și în e-mailul dumneavoastră.', a_btn: 'Descărcați din nou', a_other: 'Solicitați versiunea de probă cu altă adresă de e-mail', b_ok: 'Descărcarea a început — fișierul va apărea în folderul Descărcări. Este mare, așa că poate dura câteva minute. Nu se întâmplă nimic? Apăsați din nou butonul.', b_nowin: 'TAGRA funcționează pe calculatoare cu Windows. Deschideți linkul din e-mailul nostru pe calculatorul dumneavoastră cu Windows.' },
    cs: { a_title: 'Zkušební verzi TAGRA už máte', a_body: 'Požádali jste o ni {date}. Odkaz ke stažení najdete také ve svém e-mailu.', a_btn: 'Stáhnout znovu', a_other: 'Požádat o zkušební verzi na jiný e-mail', b_ok: 'Stahování zahájeno — soubor se objeví ve složce Stažené soubory. Je velký, takže to může trvat několik minut. Nic se neděje? Klikněte na tlačítko znovu.', b_nowin: 'TAGRA funguje na počítačích s Windows. Otevřete odkaz z našeho e-mailu na svém počítači s Windows.' },
    sk: { a_title: 'Skúšobnú verziu TAGRA už máte', a_body: 'Požiadali ste o ňu {date}. Odkaz na stiahnutie nájdete aj vo svojom e-maile.', a_btn: 'Stiahnuť znova', a_other: 'Požiadať o skúšobnú verziu na iný e-mail', b_ok: 'Sťahovanie sa začalo — súbor sa objaví v priečinku Stiahnuté súbory. Je veľký, takže to môže trvať niekoľko minút. Nič sa nedeje? Kliknite na tlačidlo znova.', b_nowin: 'TAGRA funguje na počítačoch s Windows. Otvorte odkaz z nášho e-mailu na svojom počítači s Windows.' },
    es: { a_title: 'Ya tienes la versión de prueba de TAGRA', a_body: 'La solicitaste el {date}. También tienes el enlace de descarga en tu correo electrónico.', a_btn: 'Volver a descargar', a_other: 'Solicitar la versión de prueba con otro correo electrónico', b_ok: 'La descarga ha comenzado. El archivo aparecerá en tu carpeta Descargas. Es grande, así que puede tardar unos minutos. ¿No pasa nada? Vuelve a hacer clic en el botón.', b_nowin: 'TAGRA funciona en ordenadores con Windows. Abre el enlace de nuestro correo en tu ordenador con Windows.' }
  };
  var ALIAS = { cz: 'cs', gr: 'el' };

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();
    l = ALIAS[l] || l;
    return T[l] ? l : 'en';
  }
  function txt(k) { return T[lang()][k]; }

  /* B) poznámka pod tlačítkem stažení — volá ji click handler v init() výše */
  window.tagraDownloadNote = function (btn) {
    try {
      if (!btn || btn.getAttribute('data-dl-noted')) return;
      btn.setAttribute('data-dl-noted', '1');
      var win = /Windows/i.test(navigator.userAgent || '');
      var p = document.createElement('p');
      p.className = 'thanks-meta thanks-dl-note';
      p.setAttribute('role', 'status');
      p.style.cssText = 'max-width:560px;margin:14px auto 0;padding:12px 16px;border-radius:12px;font-size:15px;line-height:1.5;text-align:center;' +
        (win ? 'background:#eef7e3;color:#2f4a0a;border:1px solid rgba(110,155,18,.35)'
             : 'background:#fff7e6;color:#5c3d00;border:1px solid rgba(214,150,0,.4)');
      p.textContent = win ? txt('b_ok') : txt('b_nowin');
      btn.insertAdjacentElement('afterend', p);
    } catch (e) { /* poznámka nesmí rozbít stažení */ }
  };

  /* A) box „Už máte zkušební verzi“ místo formuláře */
  function showRemembered() {
    var form = document.getElementById('trialForm');
    if (!form || form.getAttribute('name') !== 'tagra-trial' || document.getElementById('trialRemembered')) return;
    var rec = null;
    try { rec = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return; }
    if (!rec || typeof rec.u !== 'string' || rec.u.charAt(0) !== '/' || rec.u.charAt(1) === '/') return;
    if (!rec.t || Date.now() - rec.t > MAX_AGE) {
      try { localStorage.removeItem(KEY); } catch (e) { /* nic */ }
      return;
    }
    var l = lang();
    var date = '';
    try { date = new Date(rec.t).toLocaleDateString(l, { day: 'numeric', month: 'numeric', year: 'numeric' }); }
    catch (e) { date = new Date(rec.t).toISOString().slice(0, 10); }
    var href = rec.u + (rec.u.indexOf('?') === -1 ? '?' : '&') + 'again=1';

    var box = document.createElement('div');
    box.id = 'trialRemembered';
    box.style.cssText = 'margin:0 0 24px;padding:24px;border:1px solid rgba(19,74,142,.15);border-radius:16px;background:#f5f9fc;text-align:center';
    var h = document.createElement('h2');
    h.style.cssText = 'margin:0 0 8px;font-size:22px;line-height:1.3';
    h.textContent = txt('a_title');
    var p = document.createElement('p');
    p.style.cssText = 'margin:0 0 18px;font-size:16px;line-height:1.55';
    p.textContent = txt('a_body').replace('{date}', date);
    var a = document.createElement('a');
    a.className = 'btn btn-primary';
    a.href = href;
    a.setAttribute('data-cta', 'trial-again');
    a.textContent = txt('a_btn');
    var o = document.createElement('p');
    o.style.cssText = 'margin:16px 0 0;font-size:14px';
    var ob = document.createElement('a');
    ob.href = '#trialForm';
    ob.textContent = txt('a_other');
    ob.addEventListener('click', function (e) {
      e.preventDefault();
      box.parentNode && box.parentNode.removeChild(box);
      form.style.display = '';
      var em = form.querySelector('input[type="email"]');
      try { (em || form).focus(); } catch (x) { /* nic */ }
    });
    o.appendChild(ob);
    box.appendChild(h); box.appendChild(p); box.appendChild(a); box.appendChild(o);
    form.parentNode.insertBefore(box, form);
    form.style.display = 'none';
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', 'trial_remembered', { page_language: l }); } catch (e) { /* měření nesmí rozbít stránku */ }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showRemembered);
  } else {
    showRemembered();
  }
})();

/* ─── Mobilní lišta „TRUCKER + čtečka zdarma“ (79-1, 21. 11. 2026) ───
 * Jen ≤ 720 px. Ukáže se po odscrollování horního boxu (.br-top), skrytá je, dokud
 * je vidět cookie lišta (.tmx-cc) nebo otevřené chat okno Jarabotu. Zavření
 * se pamatuje v sessionStorage. Žádné atributy v MutationObserveru. */
(function () {
  'use strict';
  var bar = document.getElementById('brBar');
  if (!bar) return;
  var KEY = 'br-bar-closed', closed = false;
  try { closed = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* bez paměti */ }
  var top = document.querySelector('.br-top');
  var mq = window.matchMedia ? window.matchMedia('(max-width:720px)') : null;
  function chatOpen() {
    var c = document.querySelector('.woot-widget-holder');
    return !!(c && c.offsetHeight > 120);
  }
  function update() {
    var show = !closed && mq && mq.matches && top && top.getBoundingClientRect().bottom < 0 &&
      !document.querySelector('.tmx-cc') && !chatOpen();
    bar.classList.toggle('is-visible', !!show);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  new MutationObserver(update).observe(document.body, { childList: true });
  var x = bar.querySelector('.br-bar-x');
  if (x) x.addEventListener('click', function () {
    closed = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* bez paměti */ }
    update();
  });
  update();
})();
