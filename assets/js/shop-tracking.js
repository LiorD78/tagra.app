/* TAGRA Shop (shop.tagra.app) – externí měřicí a chatové skripty.
   Vkládá se v Shoptetu: Vzhled a obsah → Editor → HTML kód → Patička:
   <script src="https://tagra.app/assets/js/shop-tracking.js?v=1" defer></script>
   (HTML kódy v Shoptetu mají limit 8 192 znaků, proto externí soubor.)
   GA4 se NEvkládá sem – běží přes nativní propojení Shoptetu (G-C2BNS7RZVV, cross-domain tagra.app).
   1) Microsoft Clarity – projekt „TAGRA Shop“ z89q96s7bd, jen po souhlasu s analytickými cookies.
   2) Jarabot – schránka „TAGRA Shop“ (#938), jazyk podle <html lang>. */
(function (w, d) {
  'use strict';

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
  w.jarabotSettings = w.chatwootSettings = { position: 'right', locale: lang };
  function loadChat() {
    if (w.__tgsChat) return;
    w.__tgsChat = 1;
    var g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.src = JB_URL + '/packs/js/sdk.js';
    g.defer = true; g.async = true;
    g.onload = function () {
      try { w.jarabotSDK.run({ websiteToken: JB_TOKEN, baseUrl: JB_URL }); } catch (e) {}
    };
    s.parentNode.insertBefore(g, s);
  }
  /* Chat až po načtení stránky – nebrzdí LCP. */
  if (d.readyState === 'complete') loadChat();
  else w.addEventListener('load', loadChat);
})(window, document);
