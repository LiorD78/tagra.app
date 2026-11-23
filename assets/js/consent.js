/* TAGRA cookie consent v2 (23. 11. 2026, issue #404 / bal. 85)
 * Banner „Přijmout vše / Pouze nezbytné / Nastavení“ + panel nastavení (Nezbytné / Analytika / Marketing).
 * Consent Mode v2 defaulty (denied) a gtag G-92253QFBNX zůstávají inline v každém HTML;
 * malý inline skript tamtéž při uloženém souhlasu synchronně zavolá gtag('consent','update').
 * Úložiště: localStorage 'tmx-consent-v2' = {"a":0|1,"m":0|1,"t":<timestamp>}.
 * Migrace: 'tmx-consent-v1'='granted' → analytika zůstává zapnutá, lišta se ukáže znovu (nový účel marketing).
 * Meta pixel (jediné místo, kde se načítá fbevents.js) se načte jen při m=1.
 * window.tmxFbq(type,name,params) – tiše nic nedělá bez marketingového souhlasu.
 * window.tmxConsentOpen() – otevře panel nastavení (tlačítko na stránkách soukromí). */
(function () {
  'use strict';
  var doc = document, W = window;
  var KEY = 'tmx-consent-v2', KEY1 = 'tmx-consent-v1', CL = 'wt18054m0r', PIXEL = '1445469577001824';
  var T = {
  en:{"t":"We use cookies for analytics (Google Analytics, Microsoft Clarity, Jarabot) and, with your consent, for advertising (Meta, Google Ads) to measure and improve our ads. They load only with your consent.","a":"Accept all","r":"Only necessary","s":"Settings","p":"Privacy & cookies","st":"Cookie settings","nn":"Necessary","nd":"Required for the website to work. Always on.","an":"Analytics","ad":"Helps us understand how the website is used (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Measures the results of our ads and shows relevant ads (Meta Pixel, Google Ads).","sv":"Save choices","on":"Always on"},
  cs:{"t":"Používáme cookies pro analytiku (Google Analytics, Microsoft Clarity, Jarabot) a s vaším souhlasem také pro reklamu (Meta, Google Ads), abychom mohli měřit a zlepšovat účinnost našich reklam. Tyto cookies se načítají pouze s vaším souhlasem.","a":"Přijmout vše","r":"Pouze nezbytné","s":"Nastavení","p":"Soukromí a cookies","st":"Nastavení cookies","nn":"Nezbytné","nd":"Nutné pro fungování webu. Vždy aktivní.","an":"Analytika","ad":"Pomáhá nám pochopit, jak je web používán (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Měří výsledky našich reklam a zobrazuje relevantní reklamy (Meta Pixel, Google Ads).","sv":"Uložit volby","on":"Vždy aktivní"},
  sk:{"t":"Používame cookies na analytiku (Google Analytics, Microsoft Clarity, Jarabot) a s vaším súhlasom aj na reklamu (Meta, Google Ads), aby sme mohli merať a zlepšovať účinnosť našich reklám. Tieto cookies sa načítajú iba s vaším súhlasom.","a":"Prijať všetko","r":"Iba nevyhnutné","s":"Nastavenia","p":"Súkromie a cookies","st":"Nastavenia cookies","nn":"Nevyhnutné","nd":"Potrebné na fungovanie webu. Vždy aktívne.","an":"Analytika","ad":"Pomáha nám pochopiť, ako sa web používa (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Meria výsledky našich reklám a zobrazuje relevantné reklamy (Meta Pixel, Google Ads).","sv":"Uložiť voľby","on":"Vždy aktívne"},
  de:{"t":"Wir verwenden Cookies zur Analyse (Google Analytics, Microsoft Clarity, Jarabot) und mit Ihrer Einwilligung für Werbung (Meta, Google Ads), um unsere Anzeigen zu messen und zu verbessern. Diese Cookies werden nur mit Ihrer Einwilligung geladen.","a":"Alle akzeptieren","r":"Nur notwendige","s":"Einstellungen","p":"Datenschutz & Cookies","st":"Cookie-Einstellungen","nn":"Notwendig","nd":"Für den Betrieb der Website erforderlich. Immer aktiv.","an":"Analyse","ad":"Hilft uns zu verstehen, wie die Website genutzt wird (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Misst die Ergebnisse unserer Anzeigen und zeigt relevante Werbung (Meta Pixel, Google Ads).","sv":"Auswahl speichern","on":"Immer aktiv"},
  pl:{"t":"Używamy plików cookie do analityki (Google Analytics, Microsoft Clarity, Jarabot) oraz, za Państwa zgodą, do reklamy (Meta, Google Ads), aby mierzyć i poprawiać skuteczność naszych reklam. Te pliki cookie są ładowane wyłącznie za Państwa zgodą.","a":"Akceptuj wszystkie","r":"Tylko niezbędne","s":"Ustawienia","p":"Prywatność i pliki cookie","st":"Ustawienia plików cookie","nn":"Niezbędne","nd":"Wymagane do działania witryny. Zawsze aktywne.","an":"Analityka","ad":"Pomaga nam zrozumieć, jak używana jest witryna (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Mierzy wyniki naszych reklam i wyświetla trafne reklamy (Meta Pixel, Google Ads).","sv":"Zapisz wybór","on":"Zawsze aktywne"},
  el:{"t":"Χρησιμοποιούμε cookies για ανάλυση (Google Analytics, Microsoft Clarity, Jarabot) και, με τη συγκατάθεσή σας, για διαφήμιση (Meta, Google Ads), ώστε να μετράμε και να βελτιώνουμε την απόδοση των διαφημίσεών μας. Αυτά τα cookies φορτώνονται μόνο με τη συγκατάθεσή σας.","a":"Αποδοχή όλων","r":"Μόνο απαραίτητα","s":"Ρυθμίσεις","p":"Απόρρητο και cookies","st":"Ρυθμίσεις cookies","nn":"Απαραίτητα","nd":"Απαραίτητα για τη λειτουργία του ιστοτόπου. Πάντα ενεργά.","an":"Ανάλυση","ad":"Μας βοηθά να κατανοήσουμε πώς χρησιμοποιείται ο ιστότοπος (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Μάρκετινγκ","md":"Μετρά τα αποτελέσματα των διαφημίσεών μας και προβάλλει σχετικές διαφημίσεις (Meta Pixel, Google Ads).","sv":"Αποθήκευση επιλογών","on":"Πάντα ενεργά"},
  hu:{"t":"Sütiket használunk elemzéshez (Google Analytics, Microsoft Clarity, Jarabot), valamint az Ön hozzájárulásával hirdetéshez (Meta, Google Ads), hogy mérjük és javítsuk hirdetéseink eredményességét. Ezek a sütik csak az Ön hozzájárulásával töltődnek be.","a":"Összes elfogadása","r":"Csak a szükségesek","s":"Beállítások","p":"Adatvédelem és sütik","st":"Sütibeállítások","nn":"Szükséges","nd":"A weboldal működéséhez szükséges. Mindig aktív.","an":"Elemzés","ad":"Segít megérteni, hogyan használják a weboldalt (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Méri hirdetéseink eredményeit, és releváns hirdetéseket jelenít meg (Meta Pixel, Google Ads).","sv":"Beállítások mentése","on":"Mindig aktív"},
  fr:{"t":"Nous utilisons des cookies à des fins d’analyse (Google Analytics, Microsoft Clarity, Jarabot) et, avec votre consentement, de publicité (Meta, Google Ads) pour mesurer et améliorer les performances de nos publicités. Ces cookies ne sont chargés qu’avec votre consentement.","a":"Tout accepter","r":"Nécessaires uniquement","s":"Paramètres","p":"Confidentialité et cookies","st":"Paramètres des cookies","nn":"Nécessaires","nd":"Indispensables au fonctionnement du site. Toujours actifs.","an":"Analyse","ad":"Nous aide à comprendre comment le site est utilisé (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Mesure les résultats de nos publicités et affiche des publicités pertinentes (Meta Pixel, Google Ads).","sv":"Enregistrer les choix","on":"Toujours actifs"},
  it:{"t":"Utilizziamo cookie per l’analisi (Google Analytics, Microsoft Clarity, Jarabot) e, con il Suo consenso, per la pubblicità (Meta, Google Ads), per misurare e migliorare l’efficacia dei nostri annunci. Questi cookie vengono caricati solo con il Suo consenso.","a":"Accetta tutto","r":"Solo necessari","s":"Impostazioni","p":"Privacy e cookie","st":"Impostazioni dei cookie","nn":"Necessari","nd":"Indispensabili per il funzionamento del sito. Sempre attivi.","an":"Analisi","ad":"Ci aiuta a capire come viene utilizzato il sito (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Misura i risultati dei nostri annunci e mostra pubblicità pertinenti (Meta Pixel, Google Ads).","sv":"Salva le scelte","on":"Sempre attivi"},
  nl:{"t":"Wij gebruiken cookies voor analyse (Google Analytics, Microsoft Clarity, Jarabot) en, met uw toestemming, voor reclame (Meta, Google Ads) om de prestaties van onze advertenties te meten en te verbeteren. Deze cookies worden alleen met uw toestemming geladen.","a":"Alles accepteren","r":"Alleen noodzakelijke","s":"Instellingen","p":"Privacy en cookies","st":"Cookie-instellingen","nn":"Noodzakelijk","nd":"Vereist voor de werking van de website. Altijd actief.","an":"Analyse","ad":"Helpt ons te begrijpen hoe de website wordt gebruikt (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Meet de resultaten van onze advertenties en toont relevante advertenties (Meta Pixel, Google Ads).","sv":"Keuzes opslaan","on":"Altijd actief"},
  ro:{"t":"Folosim cookie-uri pentru analiză (Google Analytics, Microsoft Clarity, Jarabot) și, cu consimțământul dumneavoastră, pentru publicitate (Meta, Google Ads), pentru a măsura și îmbunătăți eficiența reclamelor noastre. Aceste cookie-uri se încarcă numai cu consimțământul dumneavoastră.","a":"Acceptă tot","r":"Doar cele necesare","s":"Setări","p":"Confidențialitate și cookie-uri","st":"Setări cookie-uri","nn":"Necesare","nd":"Necesare pentru funcționarea site-ului. Mereu active.","an":"Analiză","ad":"Ne ajută să înțelegem cum este utilizat site-ul (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Măsoară rezultatele reclamelor noastre și afișează reclame relevante (Meta Pixel, Google Ads).","sv":"Salvează opțiunile","on":"Mereu active"},
  es:{"t":"Utilizamos cookies de análisis (Google Analytics, Microsoft Clarity, Jarabot) y, con su consentimiento, de publicidad (Meta, Google Ads) para medir y mejorar la eficacia de nuestros anuncios. Estas cookies solo se cargan con su consentimiento.","a":"Aceptar todas","r":"Solo necesarias","s":"Configuración","p":"Privacidad y cookies","st":"Configuración de cookies","nn":"Necesarias","nd":"Necesarias para que el sitio web funcione. Siempre activas.","an":"Análisis","ad":"Nos ayuda a entender cómo se utiliza el sitio web (Google Analytics, Microsoft Clarity, Jarabot).","mn":"Marketing","md":"Mide los resultados de nuestros anuncios y muestra publicidad relevante (Meta Pixel, Google Ads).","sv":"Guardar preferencias","on":"Siempre activas"}
};
  var PV = { de: '/de/datenschutz/', pl: '/pl/polityka-prywatnosci/', el: '/el/aporrito/', hu: '/hu/adatvedelmi-tajekoztato/',
    it: '/it/privacy/', fr: '/fr/confidentialite/', ro: '/ro/confidentialitate/', nl: '/nl/privacy/', es: '/es/privacidad/' };

  function lc() {
    var l = (doc.documentElement.getAttribute('lang') || 'en').toLowerCase().split('-')[0];
    var m = { cz: 'cs', cs: 'cs', sk: 'sk', de: 'de', pl: 'pl', gr: 'el', el: 'el', hu: 'hu', fr: 'fr', it: 'it', nl: 'nl', ro: 'ro', es: 'es', en: 'en' };
    return m[l] || 'en';
  }
  function pv() { return PV[location.pathname.split('/')[1]] || '/privacy/'; }
  function gt() { if (typeof W.gtag === 'function') { try { W.gtag.apply(null, arguments); } catch (e) { /* měření nesmí rozbít stránku */ } } }

  /* ── uložený stav ── */
  function read() {
    var s = null, v1 = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    if (s && typeof s === 'object') return { a: s.a ? 1 : 0, m: s.m ? 1 : 0, saved: true };
    try { v1 = localStorage.getItem(KEY1); } catch (e) { /* bez úložiště */ }
    return { a: v1 === 'granted' ? 1 : 0, m: 0, saved: false };
  }
  function write(a, m) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ a: a, m: m, t: Date.now() }));
      localStorage.removeItem(KEY1);
    } catch (e) { /* bez úložiště */ }
  }

  /* ── služby ── */
  function loadClarity() {
    if (!CL || W.__tmxCl) return; W.__tmxCl = 1;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(W, doc, 'clarity', 'script', CL);
  }
  function loadMeta() {
    if (W.__tmxM) return; W.__tmxM = 1;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(W, doc, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    W.fbq('init', PIXEL);
    W.fbq('track', 'PageView');
  }
  function applyA() { gt('consent', 'update', { analytics_storage: 'granted' }); loadClarity(); }
  function applyM() {
    gt('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    loadMeta();
  }
  W.tmxFbq = function (type, name, params) {
    if (!W.__tmxM || typeof W.fbq !== 'function') return;
    try { params ? W.fbq(type, name, params) : W.fbq(type, name); } catch (e) { /* měření nesmí rozbít stránku */ }
  };

  /* ── CSS (vzhled banneru zachován, přidáno 3. tlačítko a panel) ── */
  function injectCss() {
    if (doc.getElementById('tmx-cc-css')) return;
    var s = doc.createElement('style'); s.id = 'tmx-cc-css';
    s.textContent =
      '.tmx-cc{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:linear-gradient(120deg,var(--blue-dark,#0b2c4a),var(--blue-mid,#134a8e) 62%,var(--blue-light,#1f5fa6));color:#fff;' +
      'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;padding:16px 20px;box-shadow:0 -4px 24px rgba(0,0,0,.18);display:flex;flex-wrap:wrap;align-items:center;gap:14px;justify-content:center}' +
      '.tmx-cc__txt{flex:1 1 360px;max-width:760px}.tmx-cc__txt a{color:#9ed0f5;text-decoration:underline}' +
      '.tmx-cc__btns{display:flex;flex-wrap:wrap;gap:10px;flex:0 0 auto}' +
      '.tmx-cc__b{appearance:none;border:0;cursor:pointer;font:inherit;font-weight:600;padding:10px 22px;border-radius:99px;transition:filter .15s;color:#fff}' +
      '.tmx-cc__b:hover{filter:brightness(1.08)}.tmx-cc__b:focus-visible,.tmx-cs__sw:focus-visible,.tmx-cs__x:focus-visible{outline:3px solid #9ed0f5;outline-offset:2px}' +
      '.tmx-cc__b--no{background:rgba(255,255,255,.16)}.tmx-cc__b--set{background:transparent;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.65)}' +
      '.tmx-cc__b--yes{background:var(--green-cta,#5C820F)}' +
      '@media(max-width:640px){.tmx-cc{padding:14px}.tmx-cc__btns{width:100%}.tmx-cc__b{flex:1 1 100%}}' +
      '.tmx-cs{position:fixed;inset:0;z-index:2147483001;background:rgba(11,44,74,.55);display:flex;align-items:center;justify-content:center;padding:16px;' +
      'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}' +
      '.tmx-cs__p{position:relative;background:#fff;color:#16283b;border-radius:16px;max-width:560px;width:100%;max-height:92vh;overflow:auto;padding:24px 24px 20px;box-shadow:0 12px 48px rgba(0,0,0,.35)}' +
      '.tmx-cs__p:focus{outline:none}.tmx-cs__h{font-size:20px;line-height:1.3;font-weight:800;margin:0 36px 14px 0}' +
      '.tmx-cs__x{position:absolute;top:12px;right:12px;appearance:none;border:0;background:#eef2f6;color:#16283b;width:32px;height:32px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer}' +
      '.tmx-cs__r{display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-top:1px solid #dfe6ee}' +
      '.tmx-cs__r label{flex:1 1 auto;cursor:pointer}.tmx-cs__n{display:block;font-weight:700;font-size:15px}.tmx-cs__d{display:block;color:#42566b;margin-top:2px}' +
      '.tmx-cs__s{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;color:#42566b;min-width:64px;text-align:center}' +
      '.tmx-cs__sw{appearance:none;-webkit-appearance:none;position:relative;width:46px;height:26px;border-radius:99px;background:#6b7b8c;border:0;margin:0;cursor:pointer;transition:background .15s}' +
      '.tmx-cs__sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .15s}' +
      '.tmx-cs__sw:checked{background:var(--green-cta,#5C820F)}.tmx-cs__sw:checked::after{transform:translateX(20px)}' +
      '.tmx-cs__sw:disabled{cursor:not-allowed;opacity:.75}' +
      '.tmx-cs__f{display:flex;justify-content:flex-end;gap:10px;margin-top:8px;padding-top:16px;border-top:1px solid #dfe6ee}' +
      '.tmx-cs__f .tmx-cc__b{background:var(--green-cta,#5C820F)}' +
      '@media(max-width:640px){.tmx-cs__p{padding:20px 16px 16px}.tmx-cs__f .tmx-cc__b{flex:1}}';
    doc.head.appendChild(s);
  }

  /* ── DOM helpery ── */
  function el(tag, cls, txt) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function button(cls, txt) { var b = el('button', 'tmx-cc__b ' + cls, txt); b.type = 'button'; return b; }

  var banner = null, panel = null, lastFocus = null;

  /* ── uložení volby ── */
  function save(a, m) {
    var prev = read();
    write(a, m);
    var revoke = (prev.a && !a) || (prev.m && !m);
    if (banner) { banner.remove(); banner = null; }
    if (panel) { panel.remove(); panel = null; }
    if (revoke) { location.reload(); return; }
    if (a) applyA();
    if (m) applyM();
    try { doc.dispatchEvent(new CustomEvent('tmx-consent', { detail: { a: a, m: m } })); } catch (e) { /* starší prohlížeč */ }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* prvek zmizel */ } }
  }

  /* ── panel nastavení ── */
  function openPanel() {
    if (panel) return;
    injectCss();
    var tx = T[lc()] || T.en, st = read();
    lastFocus = doc.activeElement;
    var ov = el('div', 'tmx-cs');
    var p = el('div', 'tmx-cs__p');
    p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true'); p.setAttribute('aria-labelledby', 'tmx-cs-h'); p.tabIndex = -1;
    var h = el('h2', 'tmx-cs__h', tx.st); h.id = 'tmx-cs-h';
    var x = el('button', 'tmx-cs__x', '\u00d7'); x.type = 'button'; x.setAttribute('aria-label', tx.st);
    p.appendChild(x); p.appendChild(h);
    function row(id, name, desc, checked, locked) {
      var r = el('div', 'tmx-cs__r');
      var lab = el('label'); lab.setAttribute('for', id);
      lab.appendChild(el('span', 'tmx-cs__n', name)); lab.appendChild(el('span', 'tmx-cs__d', desc));
      var s = el('div', 'tmx-cs__s');
      var cb = el('input', 'tmx-cs__sw'); cb.type = 'checkbox'; cb.id = id; cb.checked = !!checked;
      if (locked) { cb.disabled = true; cb.checked = true; s.appendChild(cb); s.appendChild(el('span', null, tx.on)); }
      else s.appendChild(cb);
      r.appendChild(lab); r.appendChild(s);
      p.appendChild(r);
      return cb;
    }
    row('tmx-cs-n', tx.nn, tx.nd, true, true);
    var ca = row('tmx-cs-a', tx.an, tx.ad, st.a, false);
    var cm = row('tmx-cs-m', tx.mn, tx.md, st.m, false);
    var f = el('div', 'tmx-cs__f');
    var sv = button('', tx.sv); f.appendChild(sv); p.appendChild(f);
    ov.appendChild(p); doc.body.appendChild(ov); panel = ov;
    function close() {
      ov.remove(); panel = null; doc.removeEventListener('keydown', onKey, true);
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* prvek zmizel */ } }
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f2 = p.querySelectorAll('button,input:not([disabled]),a[href]');
      if (!f2.length) return;
      var first = f2[0], last = f2[f2.length - 1];
      if (e.shiftKey && (doc.activeElement === first || doc.activeElement === p)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    doc.addEventListener('keydown', onKey, true);
    x.addEventListener('click', close);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    sv.addEventListener('click', function () {
      doc.removeEventListener('keydown', onKey, true);
      save(ca.checked ? 1 : 0, cm.checked ? 1 : 0);
    });
    p.focus();
  }
  W.tmxConsentOpen = openPanel;

  /* ── banner ── */
  function showBanner() {
    if (banner) return;
    injectCss();
    var tx = T[lc()] || T.en;
    var b = el('div', 'tmx-cc'); b.setAttribute('role', 'dialog'); b.setAttribute('aria-live', 'polite'); b.setAttribute('aria-label', tx.st);
    var t = el('div', 'tmx-cc__txt', tx.t + ' ');
    var a = el('a', null, tx.p); a.href = pv(); t.appendChild(a);
    var bt = el('div', 'tmx-cc__btns');
    var set = button('tmx-cc__b--set', tx.s), no = button('tmx-cc__b--no', tx.r), yes = button('tmx-cc__b--yes', tx.a);
    bt.appendChild(set); bt.appendChild(no); bt.appendChild(yes);
    b.appendChild(t); b.appendChild(bt); doc.body.appendChild(b); banner = b;
    yes.addEventListener('click', function () { save(1, 1); });
    no.addEventListener('click', function () { save(0, 0); });
    set.addEventListener('click', openPanel);
  }

  /* ── start ── */
  var st = read();
  if (st.a) applyA();
  if (st.m) applyM();
  if (!st.saved) {
    if (doc.body) showBanner(); else doc.addEventListener('DOMContentLoaded', showBanner);
  }
})();
