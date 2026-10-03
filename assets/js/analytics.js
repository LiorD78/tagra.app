/* TAGRA rozšířená analytika (2. 10. 2026) — defer po nav.js. Jen gtag / clarity, pokud existují
   (Consent Mode v2 a banner tmx-consent-v1 se neobcházejí). Žádné osobní údaje, žádný fingerprinting.
   pageType() a TRIAL_PATHS jsou z nav.js (window.tagraPageType). */
(function () {
  'use strict';
  var doc = document, loc = location, W = window;
  var nav = W.tagraPageType || function () { return 'other'; };
  function isTrial(p) { return nav.isTrialPath ? nav.isTrialPath(p) : false; }
  var lang = (doc.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
  var type = nav();
  var done = {};
  function once(k) { if (done[k]) return false; done[k] = 1; return true; }

  var AI = [['chatgpt', /chatgpt|openai/], ['perplexity', /perplexity/], ['gemini', /gemini|bard\.google/],
    ['copilot', /copilot/], ['claude', /claude/]];
  function detectAi() {
    var utm = (new URLSearchParams(loc.search).get('utm_source') || '').toLowerCase();
    var ref = '';
    try { ref = new URL(doc.referrer).hostname.toLowerCase(); } catch (e) {}
    for (var i = 0; i < AI.length; i++) if (AI[i][1].test(utm) || AI[i][1].test(ref)) return AI[i][0];
    return 'none';
  }
  var aiSource = 'none';
  try {
    aiSource = sessionStorage.getItem('tagra_ai_source');
    if (!aiSource) { aiSource = detectAi(); sessionStorage.setItem('tagra_ai_source', aiSource); }
  } catch (e) { aiSource = aiSource || detectAi(); }

  var errorCode = '';
  if (type === 'article') {
    var seg = loc.pathname.replace(/\/+$/, '').split('/').pop();
    var em = /-(\d{2})(?:-|$)/.exec(seg);
    if (em) errorCode = em[1];
  }

  function clar() {
    try { W.clarity.apply(null, arguments); } catch (e) {}
  }
  function track(name, p, beacon) {
    var o = { page_type: type, language: lang, ai_source: aiSource };
    if (errorCode) o.error_code = errorCode;
    for (var k in p) o[k] = p[k];
    if (beacon) o.transport_type = 'beacon';
    try { W.gtag('event', name, o); } catch (e) {}
    clar('event', name);
  }
  function cut(s, n) { return (s || '').replace(/\s+/g, ' ').trim().slice(0, n); }
  function onReady(f) { doc.readyState === 'loading' ? doc.addEventListener('DOMContentLoaded', f) : f(); }

  clar('set', 'ai_source', aiSource);
  if (errorCode) clar('set', 'error_code', errorCode);

  var maxPct = 0, active = 0, STEPS = [25, 50, 75, 90], busy = false;
  function onScroll() {
    if (busy) return; busy = true;
    requestAnimationFrame(function () {
      busy = false;
      var h = doc.documentElement.scrollHeight;
      var pct = h > 0 ? Math.round((W.scrollY + W.innerHeight) / h * 100) : 0;
      if (pct > maxPct) maxPct = pct;
      STEPS.forEach(function (s) { if (maxPct >= s && once('sd' + s)) track('scroll_depth', { percent: s }); });
      readCheck();
    });
  }
  function readCheck() {
    if (type === 'article' && active >= 30 && maxPct >= 50 && once('read'))
      track('article_read', { page_path: loc.pathname });
  }
  W.addEventListener('scroll', onScroll, { passive: true });
  if (type === 'article') {
    setInterval(function () {
      if (doc.visibilityState === 'visible') { active++; readCheck(); }
    }, 1000);
  }

  onReady(function () {
    onScroll();

    doc.addEventListener('toggle', function (e) {
      var d = e.target;
      if (!d || d.tagName !== 'DETAILS' || !d.open || d.classList.contains('nav-lang') || d.classList.contains('vendor')) return;
      var s = d.querySelector('summary');
      if (s) track('faq_open', { question: cut(s.textContent, 80) });
    }, true);

    if ('IntersectionObserver' in W) {
      var ctaIo = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting || !once('cta')) return;
          ctaIo.disconnect();
          track('cta_view', { cta_target: new URL(en.target.href, loc.href).pathname });
        });
      }, { threshold: 0.5 });
      doc.querySelectorAll('a[href]').forEach(function (a) {
        if (a.closest('nav, .site-nav, .site-footer, footer')) return;
        try { var u = new URL(a.href, loc.href); if (u.origin === loc.origin && isTrial(u.pathname)) ctaIo.observe(a); } catch (e) {}
      });
      var priceIo = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && once('price')) { priceIo.disconnect(); track('pricing_view', {}); }
        });
      }, { threshold: 0.3 });
      doc.querySelectorAll('#pricing, .price-table-wrap, .pricing-teaser').forEach(function (el) { priceIo.observe(el); });
    }

    if (doc.querySelector('.nf-wrap')) {
      var rd = '';
      try { rd = new URL(doc.referrer).hostname; } catch (e) {}
      track('page_not_found', { page_path: loc.pathname, referrer_domain: rd || '(direct)' });
    }
  });

  doc.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^mailto:/i.test(href)) track('contact_click', { channel: 'email' });
    else if (/^tel:/i.test(href)) track('contact_click', { channel: 'phone' });
    var to = a.getAttribute('hreflang');
    if (to && a.closest('.nav-lang-menu, .site-footer')) track('lang_switch', { from: lang, to: to.slice(0, 5) }, true);
    try {
      var u = new URL(a.href, loc.href);
      if (/^https?:$/.test(u.protocol) && u.hostname !== 'tagra.app' && !/\.tagra\.app$/.test(u.hostname))
        track('outbound_click', { link_domain: u.hostname }, true);
    } catch (x) {}
  }, true);

  W.addEventListener('blur', function () {
    setTimeout(function () {
      var f = doc.activeElement;
      if (f && f.tagName === 'IFRAME' && /^widget/i.test(f.id) && once('chat')) track('contact_click', { channel: 'chat' });
    }, 0);
  });

  onReady(function () {
    var form = doc.getElementById('trialForm');
    if (!form) return;
    var last = '', sent = false;
    function field(el) { return el && el.name ? el.name.slice(0, 30) : ''; }
    form.addEventListener('focusin', function (e) {
      var f = field(e.target);
      if (!f || f === 'bot-field') return;
      last = f;
      if (once('ff_' + f)) track('form_field_focus', { field: f });
    });
    form.addEventListener('invalid', function (e) {
      var f = field(e.target);
      if (f && once('fe_' + f)) track('form_error', { field: f });
    }, true);
    form.addEventListener('submit', function () { if (form.checkValidity()) sent = true; });
    W.addEventListener('pagehide', function () {
      if (last && !sent && once('abandon')) track('form_abandon', { last_field: last }, true);
    });
  });

  var errs = 0;
  function jsErr(msg, src) {
    if (errs >= 5) return; errs++;
    track('js_error', { message: cut(String(msg), 80), source_file: cut(String(src || '').split('?')[0].split('/').pop(), 60) });
  }
  W.addEventListener('error', function (e) { if (!e.target || e.target === W) jsErr(e.message, e.filename); });
  W.addEventListener('unhandledrejection', function (e) {
    var r = e.reason; jsErr(r && r.message ? r.message : r, '(promise)');
  });

  function loadVitals() {
    if (!once('wv')) return;
    var s = doc.createElement('script');
    // self-host: CSP (script-src) nepovoluje cdn.jsdelivr.net a jsDelivr posílá .cjs jako application/node
    s.src = '/assets/js/vendor/web-vitals-4.2.4.iife.js'; s.defer = true;
    s.onload = function () {
      var v = W.webVitals; if (!v) return;
      function rep(m) {
        track('web_vitals', { metric_name: m.name, value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value), rating: m.rating }, true);
      }
      ['onLCP', 'onINP', 'onCLS', 'onFCP', 'onTTFB'].forEach(function (f) { if (v[f]) v[f](rep); });
    };
    doc.head.appendChild(s);
  }
  var granted = false;
  try { granted = localStorage.getItem('tmx-consent-v1') === 'granted'; } catch (e) {}
  if (granted) onReady(loadVitals);
  else doc.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.tmx-cc__b--yes')) loadVitals();
  });
})();
