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
