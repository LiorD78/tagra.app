/* TAGRA Shop (shop.tagra.app) – externí měřicí a chatové skripty.
   Vkládá se v Shoptetu: Vzhled a obsah → Editor → HTML kód → Patička:
   <script src="https://tagra.app/assets/js/shop-tracking.js?v=1" defer></script>  (v1.1 8. 11. 2026: chat až po volbě cookies)
   v1.2 (21. 11. 2026): místo výchozí zelené bubliny Jarabotu mávající robot (stejný jako truckmall.cz / tdt.cz,
   obrázky z tdt.cz) s textem v jazyce stránky; klik otevře Jarabot ($chatwoot.toggle).
   (HTML kódy v Shoptetu mají limit 8 192 znaků, proto externí soubor.)
   GA4 se NEvkládá sem – běží přes nativní propojení Shoptetu (G-92253QFBNX, cross-domain tagra.app).
   1) Microsoft Clarity – projekt „TAGRA Shop“ z89q96s7bd, jen po souhlasu s analytickými cookies.
      Po načtení se posílá consentv2: bez něj Clarity v EHP nepoužívá cookies
      a každé zobrazení stránky počítá jako nového uživatele.
   2) Jarabot – schránka „TAGRA Shop“ (#938), jazyk podle <html lang>.
   0) Meta Pixel 1445469577001824 vkládá Shoptet sám (nativní propojení), ale jako
      <script type="text/plain" data-cookiecategory="analytics"> – tedy po souhlasu
      jen s ANALYTICKÝMI cookies, a naopak NE po souhlasu jen s marketingovými.
      Pixel je reklamní měření → kategorie musí být „personalisation“ (marketing).
      Tento soubor se načítá s defer, tj. před DOMContentLoaded, kdy Shoptet
      (initCookieConsent.run) aktivuje skripty podle data-cookiecategory –
      proto stačí kategorii přepsat tady. Jakmile to Shoptet opraví sám, je to no-op. */
(function (w, d) {
  'use strict';

  /* ---------- 0) Meta Pixel → marketingový souhlas ---------- */
  try {
    var gated = d.querySelectorAll('script[data-cookiecategory="analytics"]');
    for (var gi = 0; gi < gated.length; gi++) {
      var gt = gated[gi].text || '';
      if (gt.indexOf('fbevents.js') !== -1 || gt.indexOf('fbq(') !== -1) {
        gated[gi].setAttribute('data-cookiecategory', 'personalisation');
      }
    }
  } catch (e) {}

  /* ---------- 1) Clarity (consent-gated) ---------- */
  var CLARITY_ID = 'z89q96s7bd';
  function loadClarity() {
    if (w.__tgsClarity) return;
    w.__tgsClarity = 1;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(w, d, 'clarity', 'script', CLARITY_ID);
    /* Volá se jen po souhlasu s analytikou; reklamní úložiště zůstává zakázané. */
    w.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  }
  function analyticsAllowed() {
    try {
      var m = d.cookie.match(/(?:^|;\s*)CookiesConsent=([^;]*)/);
      return !!m && decodeURIComponent(m[1]).indexOf('analytics') !== -1;
    } catch (e) { return false; }
  }
  function bindConsent() {
    try {
      if (w.shoptet && w.shoptet.consent && typeof w.shoptet.consent.onAccept === 'function') {
        w.shoptet.consent.onAccept(function (agreements) {
          if (agreements && agreements.indexOf('analytics') !== -1) loadClarity();
        });
      }
    } catch (e) {}
  }
  if (analyticsAllowed()) loadClarity();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', bindConsent);
  else bindConsent();

  /* ---------- 2) Jarabot chat ---------- */
  var JB_URL = 'https://chat.jarabot.com';
  var JB_TOKEN = 'jyUtceUtsv6pWeAch7c33bkJ';
  var lang = ((d.documentElement.getAttribute('lang') || 'en').slice(0, 2) || 'en').toLowerCase();
  /* v1.2: výchozí bublinu skrýt, místo ní robot */
  w.jarabotSettings = w.chatwootSettings = { hideMessageBubble: true, position: 'right', locale: lang };

  /* Texty robota (crew Gemini, 21. 11. 2026) */
  var TX = {
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
  var tx = TX[lang] || TX.en;
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
    /* bublina s textem jednou za návštěvu po 6,5 s, jen na desktopu, na 8 s */
    try {
      if (w.matchMedia && w.matchMedia('(min-width:1024px) and (hover:hover)').matches && !sessionStorage.getItem('tgsChatPeek')) {
        setTimeout(function () {
          b.classList.add('peek'); try { sessionStorage.setItem('tgsChatPeek', '1'); } catch (e) {}
          setTimeout(function () { b.classList.remove('peek'); }, 8000);
        }, 6500);
      }
    } catch (e) {}
    b.addEventListener('click', function () {
      b.classList.remove('peek'); try { sessionStorage.setItem('tgsChatPeek', '1'); } catch (e) {}
      if (w.$chatwoot && w.$chatwoot.toggle) w.$chatwoot.toggle();
      (w.dataLayer = w.dataLayer || []).push({ event: 'chat_open' });
    });
    d.body.appendChild(b);
  }
  function loadChat() {
    if (w.__tgsChat) return;
    w.__tgsChat = 1;
    var g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.src = JB_URL + '/packs/js/sdk.js';
    g.defer = true; g.async = true;
    g.onload = function () {
      try { w.jarabotSDK.run({ websiteToken: JB_TOKEN, baseUrl: JB_URL }); } catch (e) {}
      robot();
    };
    s.parentNode.insertBefore(g, s);
  }
  /* Chat až po načtení stránky – nebrzdí LCP.
     8. 11. 2026: a až po rozhodnutí o cookies (cookie CookiesConsent existuje) – bublina na mobilu
     překrývala tlačítko Accept v cookie liště (audit #5/#14). Když lišta na stránce není, chat se načte hned. */
  function consentDecided() { return /(?:^|;\s*)CookiesConsent=/.test(d.cookie); }
  function cookieBarShown() {
    var c = d.querySelector('.js-siteCookies, .siteCookies');
    if (!c) return false;
    var cs = w.getComputedStyle(c);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && c.getBoundingClientRect().height > 0;
  }
  function chatWhenDecided() {
    if (consentDecided() || !cookieBarShown()) { loadChat(); return; }
    var n = 0, iv = setInterval(function () {
      if (consentDecided() || !cookieBarShown()) { clearInterval(iv); loadChat(); }
      else if (++n > 300) clearInterval(iv); /* 10 min */
    }, 2000);
    d.addEventListener('click', function () {
      setTimeout(function () { if (consentDecided() || !cookieBarShown()) loadChat(); }, 600);
    }, true);
  }
  if (d.readyState === 'complete') chatWhenDecided();
  else w.addEventListener('load', chatWhenDecided);
})(window, document);
