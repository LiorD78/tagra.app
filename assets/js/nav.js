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
  var PODPOROVANE = { en: 1, de: 1, pl: 1, el: 1, hu: 1, sk: 1 };
  var lg = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
  if (PODPOROVANE[lg]) window.smartsupp('language', lg);

  var s = document.getElementsByTagName('script')[0];
  var c = document.createElement('script');
  c.type = 'text/javascript';
  c.charset = 'utf-8';
  c.async = true;
  c.src = 'https://www.smartsuppchat.com/loader.js?';
  s.parentNode.insertBefore(c, s);
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
      audience: audience || '', language: lang || '', src: src || '', ai_source: ai,
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
      var dl = e.target.closest ? e.target.closest('#downloadBtn') : null;
      if (dl) {
        track('trial_download', { product: /Trucker/i.test(dl.href) ? 'trucker' : 'tagra' });
        clar('event', 'trial_download');
      }
    });

    // 3. thanks stránka hlavního formuláře (inline skript stránky už proběhl)
    var dlBtn = document.getElementById('downloadBtn');
    if (dlBtn) {
      var enf = document.getElementById('thanksEnforcement');
      var aud = new URLSearchParams(location.search).get('audience');
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
})();
