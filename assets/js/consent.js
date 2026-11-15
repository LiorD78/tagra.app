/* TAGRA – cookie lišta a souhlas v2 (15. 11. 2026, balíček 38).
   Nahrazuje inline banner tmx-consent-v1. Bez závislostí; načítá se synchronně v <head> hned za Consent Mode defaultem
   (uložená volba se uplatní před prvním page_view), lištu vykreslí až po DOMContentLoaded (position:fixed → bez CLS).
   Úložiště: localStorage 'tmx-consent-v2' = {"v":2,"an":0|1,"mk":0|1,"ts":ms}.
   Migrace: 'tmx-consent-v1' granted → an=1, mk=0 (nic se nepřepisuje; v2 vznikne až při nové volbě);
            denied → an=0, mk=0. Migrovaným uživatelům se lišta zobrazí znovu, jakmile je ADS_ENABLED=true (nový účel).
   API: window.tmxConsent() → {an,mk,decided}; událost 'tmx:consent' (detail {an,mk}) při každé nové volbě;
        window.tmxConsentOpen() otevře panel Nastavení. Prvek s [data-tmx-cc-open] otevírá panel též.
   Texty: brain/fronta/2026-11-15-38-consent-i18n.json (truckmall-ops) – generováno, needitovat ručně. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.tmxConsent) return;
  var K2 = 'tmx-consent-v2', K1 = 'tmx-consent-v1', CL = 'wt18054m0r';
  var TXT = {"en":{"t":"We use cookies to understand how the site is used (analytics) and, only with your consent, to measure and show relevant ads (marketing). You can change your choice at any time.","all":"Accept all","nec":"Only necessary","set":"Settings","save":"Save choice","p":"Privacy & cookies","ne":"Necessary","ne_d":"Required for the site to work, e.g. remembering your cookie choice. Always on.","an":"Analytics","an_d":"Website usage statistics (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketing","mk_d":"Ad measurement and relevant ads (Google Ads, Meta, Microsoft Advertising)."},
  "cs":{"t":"Pomocí cookies zjišťujeme, jak se web používá (analytika), a pouze s Vaším souhlasem měříme účinnost reklam a zobrazujeme relevantní reklamy (marketing). Svou volbu můžete kdykoli změnit.","all":"Přijmout vše","nec":"Pouze nezbytné","set":"Nastavení","save":"Uložit volbu","p":"Soukromí a cookies","ne":"Nezbytné","ne_d":"Nutné pro fungování webu, např. k zapamatování Vaší volby cookies. Vždy aktivní.","an":"Analytické","an_d":"Statistiky používání webu (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketingové","mk_d":"Měření účinnosti reklam a zobrazování relevantních reklam (Google Ads, Meta, Microsoft Advertising)."},
  "sk":{"t":"Pomocou cookies zisťujeme, ako sa web používa (analytika), a iba s Vaším súhlasom meriame účinnosť reklám a zobrazujeme relevantné reklamy (marketing). Svoju voľbu môžete kedykoľvek zmeniť.","all":"Prijať všetko","nec":"Iba nevyhnutné","set":"Nastavenia","save":"Uložiť voľbu","p":"Súkromie a cookies","ne":"Nevyhnutné","ne_d":"Potrebné na fungovanie webu, napr. na zapamätanie Vašej voľby cookies. Vždy aktívne.","an":"Analytické","an_d":"Štatistiky používania webu (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketingové","mk_d":"Meranie účinnosti reklám a zobrazovanie relevantných reklám (Google Ads, Meta, Microsoft Advertising)."},
  "de":{"t":"Wir verwenden Cookies, um die Nutzung der Website zu analysieren (Analyse) und nur mit Ihrer Einwilligung die Wirksamkeit von Werbung zu messen und relevante Werbung anzuzeigen (Marketing). Sie können Ihre Auswahl jederzeit ändern.","all":"Alle akzeptieren","nec":"Nur notwendige","set":"Einstellungen","save":"Auswahl speichern","p":"Datenschutz & Cookies","ne":"Notwendig","ne_d":"Für den Betrieb der Website erforderlich, z. B. zum Speichern Ihrer Cookie-Auswahl. Immer aktiv.","an":"Analyse","an_d":"Statistiken zur Websitenutzung (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketing","mk_d":"Messung der Werbewirksamkeit und Anzeige relevanter Werbung (Google Ads, Meta, Microsoft Advertising)."},
  "pl":{"t":"Używamy plików cookie, aby analizować korzystanie z witryny (analityka), a wyłącznie za Państwa zgodą — mierzyć skuteczność reklam i wyświetlać dopasowane reklamy (marketing). Swój wybór mogą Państwo zmienić w dowolnym momencie.","all":"Zaakceptuj wszystkie","nec":"Tylko niezbędne","set":"Ustawienia","save":"Zapisz wybór","p":"Prywatność i pliki cookie","ne":"Niezbędne","ne_d":"Wymagane do działania witryny, np. do zapamiętania Państwa wyboru dotyczącego plików cookie. Zawsze aktywne.","an":"Analityczne","an_d":"Statystyki korzystania z witryny (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketingowe","mk_d":"Pomiar skuteczności reklam i wyświetlanie dopasowanych reklam (Google Ads, Meta, Microsoft Advertising)."},
  "hu":{"t":"Sütiket használunk a webhely használatának elemzésére (analitika), és kizárólag az Ön hozzájárulásával a hirdetések hatékonyságának mérésére és releváns hirdetések megjelenítésére (marketing). Választását bármikor módosíthatja.","all":"Összes elfogadása","nec":"Csak a szükségesek","set":"Beállítások","save":"Választás mentése","p":"Adatvédelem és sütik","ne":"Szükséges","ne_d":"A webhely működéséhez szükségesek, pl. a sütibeállítások megjegyzéséhez. Mindig aktívak.","an":"Analitikai","an_d":"Weboldal-használati statisztikák (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketing","mk_d":"A hirdetések hatékonyságának mérése és releváns hirdetések megjelenítése (Google Ads, Meta, Microsoft Advertising)."},
  "el":{"t":"Χρησιμοποιούμε cookies για να αναλύουμε τη χρήση του ιστοτόπου (ανάλυση) και, μόνο με τη συγκατάθεσή σας, για να μετράμε την αποτελεσματικότητα των διαφημίσεων και να προβάλλουμε σχετικές διαφημίσεις (μάρκετινγκ). Μπορείτε να αλλάξετε την επιλογή σας ανά πάσα στιγμή.","all":"Αποδοχή όλων","nec":"Μόνο τα απαραίτητα","set":"Ρυθμίσεις","save":"Αποθήκευση επιλογής","p":"Απόρρητο και cookies","ne":"Απαραίτητα","ne_d":"Απαραίτητα για τη λειτουργία του ιστοτόπου, π.χ. για την απομνημόνευση της επιλογής σας για τα cookies. Πάντα ενεργά.","an":"Ανάλυσης","an_d":"Στατιστικά χρήσης του ιστοτόπου (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Μάρκετινγκ","mk_d":"Μέτρηση της αποτελεσματικότητας των διαφημίσεων και προβολή σχετικών διαφημίσεων (Google Ads, Meta, Microsoft Advertising)."},
  "it":{"t":"Utilizziamo i cookie per analizzare l'utilizzo del sito (analisi) e, solo con il Suo consenso, per misurare l'efficacia degli annunci e mostrare pubblicità pertinenti (marketing). Può modificare la Sua scelta in qualsiasi momento.","all":"Accetta tutti","nec":"Solo necessari","set":"Impostazioni","save":"Salva la scelta","p":"Privacy e cookie","ne":"Necessari","ne_d":"Necessari per il funzionamento del sito, ad es. per ricordare la Sua scelta sui cookie. Sempre attivi.","an":"Analitici","an_d":"Statistiche di utilizzo del sito web (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketing","mk_d":"Misurazione dell'efficacia degli annunci e visualizzazione di pubblicità pertinenti (Google Ads, Meta, Microsoft Advertising)."},
  "fr":{"t":"Nous utilisons des cookies pour analyser l'utilisation du site (analyse) et, uniquement avec votre consentement, pour mesurer l'efficacité des publicités et afficher des annonces pertinentes (marketing). Vous pouvez modifier votre choix à tout moment.","all":"Tout accepter","nec":"Uniquement les nécessaires","set":"Paramètres","save":"Enregistrer le choix","p":"Confidentialité et cookies","ne":"Nécessaires","ne_d":"Indispensables au fonctionnement du site, par exemple pour mémoriser votre choix concernant les cookies. Toujours actifs.","an":"Analytiques","an_d":"Statistiques d’utilisation du site web (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketing","mk_d":"Mesure de l'efficacité des publicités et affichage d'annonces pertinentes (Google Ads, Meta, Microsoft Advertising)."},
  "nl":{"t":"Wij gebruiken cookies om het gebruik van de website te analyseren (analyse) en, alleen met uw toestemming, om de effectiviteit van advertenties te meten en relevante advertenties te tonen (marketing). U kunt uw keuze op elk moment wijzigen.","all":"Alles accepteren","nec":"Alleen noodzakelijke","set":"Instellingen","save":"Keuze opslaan","p":"Privacy en cookies","ne":"Noodzakelijk","ne_d":"Nodig voor de werking van de website, bijvoorbeeld om uw cookiekeuze te onthouden. Altijd actief.","an":"Analytisch","an_d":"Statistieken over websitegebruik (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketing","mk_d":"De effectiviteit van advertenties meten en relevante advertenties tonen (Google Ads, Meta, Microsoft Advertising)."},
  "ro":{"t":"Folosim cookie-uri pentru a analiza utilizarea site-ului (analiză) și, numai cu consimțământul dumneavoastră, pentru a măsura eficiența reclamelor și a afișa reclame relevante (marketing). Vă puteți modifica opțiunea în orice moment.","all":"Acceptați toate","nec":"Doar cele necesare","set":"Setări","save":"Salvați opțiunea","p":"Confidențialitate și cookie-uri","ne":"Necesare","ne_d":"Necesare pentru funcționarea site-ului, de exemplu pentru memorarea opțiunii dumneavoastră privind cookie-urile. Întotdeauna active.","an":"Analiză","an_d":"Statistici de utilizare a site-ului web (Google Analytics, Microsoft Clarity, Smartsupp).","mk":"Marketing","mk_d":"Măsurarea eficienței reclamelor și afișarea de reclame relevante (Google Ads, Meta, Microsoft Advertising)."}};
  var PRIV = { en: '/privacy/', cs: '/privacy/cz/', sk: '/privacy/sk/', de: '/de/datenschutz/', pl: '/pl/polityka-prywatnosci/',
    el: '/el/aporrito/', hu: '/hu/adatvedelmi-tajekoztato/', fr: '/fr/confidentialite/', it: '/it/privacy/', nl: '/nl/privacy/', ro: '/ro/confidentialitate/' };
  var COOKIES = ['_ga', '_gid', '_gat', '_gcl_au', '_gcl_aw', '_fbp', '_fbc', '_uetsid', '_uetvid', '_clck', '_clsk', 'CLID', 'MUID', 'ANONCHK', 'SM'];

  function lc() {
    var l = (D.documentElement.getAttribute('lang') || 'en').toLowerCase().split('-')[0];
    var m = { cz: 'cs', cs: 'cs', sk: 'sk', de: 'de', pl: 'pl', gr: 'el', el: 'el', hu: 'hu', fr: 'fr', it: 'it', nl: 'nl', ro: 'ro', en: 'en' };
    return m[l] || 'en';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---- stav ---- */
  var state = null;        // {an,mk,mig}  null = bez volby
  (function load() {
    var raw = lsGet(K2);
    if (raw) {
      try { var o = JSON.parse(raw); if (o && o.v === 2) { state = { an: o.an ? 1 : 0, mk: o.mk ? 1 : 0, mig: false }; return; } } catch (e) {}
    }
    var v1 = lsGet(K1);
    if (v1 === 'granted') state = { an: 1, mk: 0, mig: true };
    else if (v1 === 'denied') state = { an: 0, mk: 0, mig: true };
  })();

  function get() { return { an: state ? state.an : 0, mk: state ? state.mk : 0, decided: !!state }; }
  W.tmxConsent = get;

  /* ---- Consent Mode v2 + Clarity ---- */
  function gt() { if (typeof W.gtag === 'function') W.gtag.apply(null, arguments); }
  function loadClarity() {
    if (!CL || W.__tmxCl) return; W.__tmxCl = 1;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(W, D, 'clarity', 'script', CL);
  }
  function applyState(s) {
    gt('consent', 'update', {
      analytics_storage: s.an ? 'granted' : 'denied',
      ad_storage: s.mk ? 'granted' : 'denied',
      ad_user_data: s.mk ? 'granted' : 'denied',
      ad_personalization: s.mk ? 'granted' : 'denied'
    });
    gt('set', 'ads_data_redaction', !s.mk);
    if (s.an) {
      loadClarity();
      try { W.clarity('consentv2', { ad_Storage: s.mk ? 'granted' : 'denied', analytics_Storage: 'granted' }); } catch (e) {}
    }
  }
  if (state) applyState(state);

  function wipeCookies() {
    var host = location.hostname, parts = host.split('.'), doms = ['', host, '.' + host];
    if (parts.length > 2) doms.push('.' + parts.slice(-2).join('.'));
    D.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (COOKIES.indexOf(n) === -1 && !/^_ga_/.test(n)) return;
      doms.forEach(function (d) { D.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : ''); });
    });
  }

  function save(an, mk) {
    var prev = state;
    var revoke = !!(prev && ((prev.an && !an) || (prev.mk && !mk)));
    state = { an: an ? 1 : 0, mk: mk ? 1 : 0, mig: false };
    lsSet(K2, JSON.stringify({ v: 2, an: state.an, mk: state.mk, ts: Date.now() }));
    applyState(state);
    try { W.dispatchEvent(new CustomEvent('tmx:consent', { detail: { an: state.an, mk: state.mk } })); } catch (e) {}
    if (revoke) { wipeCookies(); setTimeout(function () { location.reload(); }, 50); }
  }

  /* ---- UI ---- */
  var CSS = '.tmx-cc{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:linear-gradient(120deg,var(--blue-dark,#0b2c4a),var(--blue-mid,#134a8e) 62%,var(--blue-light,#1f5fa6));color:#fff;' +
    'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;padding:16px 20px;box-shadow:0 -4px 24px rgba(0,0,0,.18);max-height:90vh;overflow-y:auto;outline:0}' +
    '.tmx-cc__in{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:14px;justify-content:center}' +
    '.tmx-cc__txt{flex:1 1 360px;max-width:760px}.tmx-cc__txt a{color:#9ed0f5;text-decoration:underline}' +
    '.tmx-cc__btns{display:flex;flex-wrap:wrap;gap:10px;flex:0 0 auto}' +
    '.tmx-cc__b{appearance:none;border:2px solid #fff;cursor:pointer;font:inherit;font-weight:600;padding:9px 18px;border-radius:8px;line-height:1.3;color:#0b2c4a;background:#fff}' +
    '.tmx-cc__b:hover{filter:brightness(.93)}.tmx-cc__b:focus-visible,.tmx-cc a:focus-visible,.tmx-cc input:focus-visible{outline:3px solid #ffd54f;outline-offset:2px}' +
    '.tmx-cc__b--set{background:transparent;color:#fff}' +
    '.tmx-cc__row{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid rgba(255,255,255,.22);width:100%}' +
    '.tmx-cc__row input{margin-top:4px;width:18px;height:18px;flex:0 0 auto}.tmx-cc__row label{display:block;cursor:pointer}' +
    '.tmx-cc__row strong{display:block}.tmx-cc__row span{opacity:.9}' +
    '.tmx-cc__panel{width:100%}' +
    '@media(max-width:640px){.tmx-cc{padding:14px}.tmx-cc__btns{width:100%;flex-direction:column}.tmx-cc__b{width:100%}}';
  var box = null, opener = null;

  function close() {
    if (!box) return;
    box.parentNode && box.parentNode.removeChild(box); box = null;
    if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (e) {} }
    opener = null;
  }
  function render(panel) {
    var l = lc(), tx = TXT[l] || TXT.en, g = get();
    if (!D.getElementById('tmx-cc-css')) {
      var st = D.createElement('style'); st.id = 'tmx-cc-css'; st.textContent = CSS; D.head.appendChild(st);
    }
    if (box) box.parentNode.removeChild(box);
    box = D.createElement('div'); box.className = 'tmx-cc'; box.id = 'tmx-cc';
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', tx.p.replace(/&amp;/g, '&')); box.tabIndex = -1;
    var priv = '<a href="' + (PRIV[l] || PRIV.en) + '">' + esc(tx.p) + '</a>';
    var h = '<div class="tmx-cc__in"><div class="tmx-cc__txt">' + esc(tx.t) + ' ' + priv + '</div>';
    if (!panel) {
      h += '<div class="tmx-cc__btns"><button type="button" class="tmx-cc__b tmx-cc__b--all" data-a="all">' + esc(tx.all) + '</button>' +
        '<button type="button" class="tmx-cc__b tmx-cc__b--nec" data-a="nec">' + esc(tx.nec) + '</button>' +
        '<button type="button" class="tmx-cc__b tmx-cc__b--set" data-a="set">' + esc(tx.set) + '</button></div>';
    } else {
      h += '<div class="tmx-cc__panel">' +
        '<div class="tmx-cc__row"><input type="checkbox" id="tmx-cc-ne" checked disabled><label for="tmx-cc-ne"><strong>' + esc(tx.ne) + '</strong><span>' + esc(tx.ne_d) + '</span></label></div>' +
        '<div class="tmx-cc__row"><input type="checkbox" id="tmx-cc-an"' + (g.an ? ' checked' : '') + '><label for="tmx-cc-an"><strong>' + esc(tx.an) + '</strong><span>' + esc(tx.an_d) + '</span></label></div>' +
        '<div class="tmx-cc__row"><input type="checkbox" id="tmx-cc-mk"' + (g.mk ? ' checked' : '') + '><label for="tmx-cc-mk"><strong>' + esc(tx.mk) + '</strong><span>' + esc(tx.mk_d) + '</span></label></div></div>' +
        '<div class="tmx-cc__btns"><button type="button" class="tmx-cc__b tmx-cc__b--save" data-a="save">' + esc(tx.save) + '</button>' +
        '<button type="button" class="tmx-cc__b tmx-cc__b--all" data-a="all">' + esc(tx.all) + '</button>' +
        '<button type="button" class="tmx-cc__b tmx-cc__b--nec" data-a="nec">' + esc(tx.nec) + '</button></div>';
    }
    box.innerHTML = h + '</div>';
    D.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-a]') : null; if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'set') { render(true); focusFirst(); return; }
      if (a === 'all') save(1, 1);
      else if (a === 'nec') save(0, 0);
      else if (a === 'save') save(D.getElementById('tmx-cc-an').checked, D.getElementById('tmx-cc-mk').checked);
      close();
    });
    box.addEventListener('keydown', function (e) {
      // Esc nezavírá lištu bez volby (souhlas musí být aktivní); u znovuotevřeného panelu s uloženou volbou ano
      if (e.key === 'Escape' && state) { e.preventDefault(); close(); }
    });
    return box;
  }
  function focusFirst() {
    if (!box) return;
    var f = box.querySelector('input:not([disabled]),button');
    try { (f || box).focus({ preventScroll: true }); } catch (e) {}
  }
  function open(panel) {
    if (!D.body) return;
    if (!box) opener = D.activeElement && D.activeElement !== D.body ? D.activeElement : null;
    render(!!panel); focusFirst();
  }
  W.tmxConsentOpen = function () { open(true); };

  function addFooterLink() {
    if (D.getElementById('tmx-cc-footlink')) return;
    var tx = TXT[lc()] || TXT.en;
    var a = D.createElement('a'); a.id = 'tmx-cc-footlink'; a.href = '#cookie-settings'; a.setAttribute('data-tmx-cc-open', ''); a.textContent = tx.set;
    var span = D.querySelector('.footer-bottom span:last-child') || D.querySelector('footer');
    if (!span) return;
    if (span.tagName === 'SPAN') span.appendChild(D.createTextNode(' · '));
    span.appendChild(a);
  }
  D.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-tmx-cc-open]') : null;
    if (!t) return;
    e.preventDefault(); open(true);
  });

  function init() {
    addFooterLink();
    var adsOn = W.TMX_ADS_ENABLED === true;       // nastavuje ads.js (defer, běží před DOMContentLoaded)
    if (!state || (state.mig && adsOn)) open(false);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
