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
     daného jazyka), takže nejde o regresi. */
  function syncLangLinks() {
    var alts = {};
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function(l) {
      var lg = l.getAttribute('hreflang');
      if (lg && lg !== 'x-default') alts[lg] = l.href;
    });
    document.querySelectorAll('.nav-lang-menu a[hreflang]').forEach(function(a) {
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
