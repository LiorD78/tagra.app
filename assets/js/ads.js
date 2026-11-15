/* TAGRA – reklamní tagy PŘIPRAVENÉ, VYPNUTÉ (15. 11. 2026, balíček 38).
   Dokud je ADS_ENABLED=false, tento soubor NEDĚLÁ NIC: žádný požadavek na googleads / doubleclick / facebook / bing,
   žádné čtení click ID, žádné zasahování do gtag. Zapnutí = změna konfigurace níže (balíček 40, po založení účtů).
   Při ADS_ENABLED=true se cokoli načte až po marketingovém souhlasu (tmxConsent().mk === 1, událost 'tmx:consent'). */
(function () {
  'use strict';
  /* ===== JEDINÉ KONFIGURAČNÍ MÍSTO ===== */
  var ADS_ENABLED = false;
  var GOOGLE_ADS_ID = '';                                   // např. 'AW-123456789'
  var GADS_LABELS = { trial_download: '', generate_lead: '' }; // konverzní štítky Google Ads
  var META_PIXEL_ID = '1445469577001824';                   // dataset TAGRA Shop (sdílený se shopem)
  var UET_TAG_ID = '';                                      // Microsoft Advertising UET tag ID
  /* ===================================== */

  var W = window, D = document;
  W.TMX_ADS_ENABLED = ADS_ENABLED === true;   // čte consent.js (znovuzobrazení lišty migrovaným uživatelům)
  if (ADS_ENABLED !== true) return;

  var IDS = ['gclid', 'fbclid', 'msclkid', 'gbraid', 'wbraid'];
  var SK = 'tmx-clickids';
  var started = false;

  function mk() { try { return !!(W.tmxConsent && W.tmxConsent().mk); } catch (e) { return false; } }
  function uuid() {
    try { if (W.crypto && W.crypto.randomUUID) return W.crypto.randomUUID(); } catch (e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  function script(src) { var s = D.createElement('script'); s.async = true; s.src = src; D.head.appendChild(s); }

  /* ---- click ID (jen s marketingovým souhlasem) ---- */
  function readIds() { try { return JSON.parse(sessionStorage.getItem(SK) || '{}') || {}; } catch (e) { return {}; } }
  function captureIds() {
    var q = new URLSearchParams(location.search), o = readIds(), ch = false;
    IDS.forEach(function (k) { var v = q.get(k); if (v) { o[k] = v.slice(0, 200); ch = true; } });
    if (ch) { try { sessionStorage.setItem(SK, JSON.stringify(o)); } catch (e) {} }
  }
  function fillForms() {
    var o = readIds();
    D.querySelectorAll('#trialForm').forEach(function (f) {
      IDS.forEach(function (k) {
        var i = f.querySelector('input[name="' + k + '"]');
        if (i) i.value = mk() && o[k] ? o[k] : '';
      });
    });
  }

  /* ---- platformy ---- */
  function startGoogle() {
    if (!GOOGLE_ADS_ID || typeof W.gtag !== 'function') return;
    W.gtag('config', GOOGLE_ADS_ID, { allow_enhanced_conversions: true });
  }
  function startMeta() {
    if (!META_PIXEL_ID || W.fbq) return;
    var n = W.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!W._fbq) W._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    script('https://connect.facebook.net/en_US/fbevents.js');
    W.fbq('init', META_PIXEL_ID);
    W.fbq('track', 'PageView');
  }
  function startUet() {
    if (!UET_TAG_ID || W.__tmxUet) return;
    W.__tmxUet = 1;
    W.uetq = W.uetq || [];
    W.uetq.push('consent', 'default', { ad_storage: 'denied' });
    W.uetq.push('consent', 'update', { ad_storage: 'granted' });
    var s = D.createElement('script'); s.async = true; s.src = 'https://bat.bing.com/bat.js';
    s.onload = function () {
      var o = { ti: UET_TAG_ID, enableAutoSpaTracking: true }; o.q = W.uetq;
      W.uetq = new W.UET(o); W.uetq.push('pageLoad');
    };
    D.head.appendChild(s);
  }
  function start() {
    if (started || !mk()) return;
    started = true;
    captureIds(); fillForms();
    startGoogle(); startMeta(); startUet();
  }

  /* ---- mapování událostí (stejné akce jako analytics.js / nav.js: gtag('event', …)) ---- */
  function onEvent(name, p) {
    if (!started || !mk()) return;
    var id = uuid();
    if (name === 'trial_download') {
      if (GOOGLE_ADS_ID && GADS_LABELS.trial_download && typeof W.gtag === 'function')
        W.gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + GADS_LABELS.trial_download, event_id: id });
      if (W.fbq && META_PIXEL_ID) W.fbq('track', 'StartTrial', {}, { eventID: id });
      if (W.uetq && UET_TAG_ID) W.uetq.push('event', 'trial_download', {});
    } else if (name === 'generate_lead') {
      if (GOOGLE_ADS_ID && GADS_LABELS.generate_lead && typeof W.gtag === 'function')
        W.gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + GADS_LABELS.generate_lead, event_id: id });
      if (W.fbq && META_PIXEL_ID) W.fbq('track', 'Lead', {}, { eventID: id });
    } else if (name === 'shop_click') {
      if (W.fbq && META_PIXEL_ID) W.fbq('trackCustom', 'ShopClick', { product_slug: (p && p.product_slug) || '' }, { eventID: id });
    }
  }

  // události, které proběhly dřív než ads.js (defer pořadí) – přehrát z dataLayer
  function replay() {
    var dl = W.dataLayer || [];
    for (var i = 0; i < dl.length; i++) {
      var a = dl[i];
      if (a && a[0] === 'event' && /^(trial_download|generate_lead|shop_click)$/.test(a[1])) onEvent(a[1], a[2]);
    }
  }
  if (typeof W.gtag === 'function') {
    var orig = W.gtag;
    W.gtag = function () {
      var a = arguments, r = orig.apply(this, a);
      if (a[0] === 'event') { try { onEvent(a[1], a[2]); } catch (e) {} }
      return r;
    };
  }
  W.addEventListener('tmx:consent', function () { if (mk()) { start(); } fillForms(); });
  D.addEventListener('submit', function (e) { if (e.target && e.target.id === 'trialForm') fillForms(); }, true);
  function init() { start(); if (started) replay(); fillForms(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
