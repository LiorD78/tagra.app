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

/* Smartsupp live chat + Mira AI
   Ucet TDT (agent Tom). Nacita se site-wide odtud, aby nebylo nutne
   sahat na 100+ HTML souboru. Widget si jazyk navstevnika detekuje sam.
   Souhlas: chat je sluzba, kterou navstevnik sam vyvola, proto se nacita
   bez gatingu; v cookie liste je uvedeny mezi zpracovateli. */
(function () {
  'use strict';
  if (window.smartsupp) return;
  window._smartsupp = window._smartsupp || {};
  window._smartsupp.key = 'e33efc5751087329b81e3e5a14c01afecafaebf9';
  window.smartsupp = function () { window.smartsupp._.push(arguments); };
  window.smartsupp._ = [];

  /* Jazyk widgetu podle jazyka stranky.
     Ucet TDT ma lang:"cs" a vlastni preklad button.greeting = "Podpora".
     Bez tohoto prikazu se "Podpora" ukazovala i na anglicke, nemecke,
     polske, recke a madarske verzi. Prikaz 'language' prepne widget na
     vestavene preklady daneho jazyka (EN/DE/PL/HU "Chat", EL "Συνομιλία").
     Cestinu zamerne NEposilame - tam ma zustat firemni "Podpora" (a na
     tagra.app ceska verze stejne neni, CZ vede na tdt.cz).
     Overeno v prohlizeci pro vsech pet jazyku 16. 8. 2026. */
  /* 8. 10. 2026: doplneny FR/IT/NL/RO (dosud tam widget ukazoval ceske "Podpora"). Overit v prohlizeci. */
  var PODPOROVANE = { en: 1, de: 1, pl: 1, el: 1, hu: 1, sk: 1, fr: 1, it: 1, nl: 1, ro: 1 };
  var lg = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
  if (PODPOROVANE[lg]) window.smartsupp('language', lg);

  /* 8. 10. 2026: loader se nacita az po prvni interakci (scroll, dotyk, mys, klavesa)
     nebo po 8 s necinnosti. Smartsupp je nejtezsi skript tretich stran a zhorsoval
     INP/TBT na mobilu. Fronta window.smartsupp._ prikazy z mezicasu zachova. */
  var loaded = false;
  var EVENTS = ['scroll', 'pointerdown', 'mousemove', 'touchstart', 'keydown'];
  function load() {
    if (loaded) return;
    loaded = true;
    EVENTS.forEach(function (ev) { window.removeEventListener(ev, load, { passive: true }); });
    var s = document.getElementsByTagName('script')[0];
    var c = document.createElement('script');
    c.type = 'text/javascript';
    c.charset = 'utf-8';
    c.async = true;
    c.src = 'https://www.smartsuppchat.com/loader.js?';
    s.parentNode.insertBefore(c, s);
  }
  EVENTS.forEach(function (ev) { window.addEventListener(ev, load, { passive: true, once: true }); });
  setTimeout(load, 8000);
})();

/* Odsazeni chatove bubliny nad sticky CTA listu.
   Smartsupp si bublinu kotvi na fixed wrapper s bottom:24px. Na strankach,
   kde je dole lista #stickyCta (10 stranek), se pres ni bublina prekryva
   a splyva s ni. Zvedneme ji o vysku listy, jakmile lista najede, a vratime
   dolu, kdyz ji navstevnik zavre. Vysku merime az za behu, protoze na mobilu
   je lista nizsi nez na desktopu. Na strankach bez listy nedela nic. */
(function () {
  'use strict';
  var GAP = 12;    // mezera mezi listou a bublinou
  var BASE = 24;   // vychozi odsazeni Smartsuppu

  function bar()  { return document.getElementById('stickyCta'); }
  function wrap() {
    var f = document.getElementById('widgetButtonFrame');
    return f && f.parentElement;
  }

  var last = null;
  function apply() {
    var w = wrap();
    if (!w) return;
    var b = bar();
    var extra = (b && b.classList.contains('is-visible'))
      ? Math.round(b.getBoundingClientRect().height) + GAP
      : 0;
    var val = (BASE + extra) + 'px';
    if (val === last && w.style.bottom === val) return;  // zabrani smycce s observerem
    last = val;
    w.style.setProperty('bottom', val, 'important');
  }

  function init() {
    var b = bar();
    if (!b) return;                       // stranka bez listy - nic neresime
    new MutationObserver(apply).observe(b, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(apply).observe(document.body, { childList: true });
    window.addEventListener('resize', apply);
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
    '/ro/incercare-gratuita', '/fr/essai-gratuit', '/nl/gratis-proefversie'];
  var ARTICLE_RE = /^\/(articles|de\/ratgeber|pl\/poradnik|hu\/cikkek|ro\/articole|nl\/artikelen|it\/articoli|el\/arthra|fr\/articles)(\/|$)/;
  var COMMERCIAL_RE = /^\/((de\/|pl\/|el\/|hu\/|it\/|fr\/|ro\/|nl\/)?$|(driver|fleet|enforcement|how-it-works|for-whom|faq|contact)(\/|$)|de\/(fahrer|fuhrpark|kontrollbehoerden|so-funktioniert-es|fuer-wen|faq|kontakt)(\/|$)|pl\/(dla-kierowcow|dla-przewoznikow|organy-kontrolne|jak-to-dziala|dla-kogo|faq|kontakt)(\/|$)|el\/(odigoi|stolos|eleghos|pos-leitourgei|gia-poion|faq|epikoinonia)(\/|$)|hu\/(soforoknek|fuvarozoknak|hatosagoknak|hogyan-mukodik|kinek-szol|gyakori-kerdesek|kapcsolat)(\/|$)|it\/(per-autisti|per-aziende|organi-di-controllo|come-funziona|a-chi-si-rivolge|faq|contatti)(\/|$)|fr\/(conducteurs|entreprises|autorites-de-controle|fonctionnement|pour-qui|faq|contact)(\/|$)|ro\/(pentru-conducatori|pentru-firme|autoritati-de-control|cum-functioneaza|pentru-cine|intrebari-frecvente|contact)(\/|$)|nl\/(voor-chauffeurs|voor-transportbedrijven|handhaving|hoe-het-werkt|voor-wie|veelgestelde-vragen|contact)(\/|$))/;

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
      }
    });

    // 3. thanks stránka hlavního formuláře (inline skript stránky už proběhl)
    var dlBtn = document.getElementById('downloadBtn');
    if (dlBtn && !window.tagraThanksRedirect) {  /* tagraThanksRedirect: /try/thanks/ právě přesměrovává na lokální poděkování */
      var enf = document.getElementById('thanksEnforcement');
      var qs = new URLSearchParams(location.search);
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
              fr: 'À votre écoute', it: 'Felici di aiutarti', el: 'Στη διάθεσή σας', ro: 'Vă stăm la dispoziție', hu: 'Szívesen segítünk' };
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
        + '<p class="thanks-meta" style="margin-top:12px">Nem biztos benne, melyik verzióra van szüksége? Írjon nekünk a <a href="mailto:sales@tagra.app">sales@tagra.app</a> címre.</p>';
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
