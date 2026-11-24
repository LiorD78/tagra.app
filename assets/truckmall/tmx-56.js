/* TRUCKMALL – animovaná sekce „Silniční kontrola: dnešek + 56 předchozích dní“ (CZ + SK)
 * Vzor: tagra.app (.tg56), zde scope .tmx-56. Načítá se z Horní informační lišty BSADMIN
 * (<script src="https://tagra.app/assets/truckmall/tmx-56.js?v=..." defer>), sekci vkládá jen
 * na stránky z PAGES (kategorie program TAGRA c5720 = dopravci, pod výpis produktů; TAGRA TRUCKER p212497/p212498 EDU/p259032-4 balíčky/p393179 TRUCKER 2 = řidiči, za sekcí „používají i ti, co vás kontrolují“).
 * Fakt: čl. 36 nařízení (EU) 165/2014 ve znění 2020/1054, od 31. 12. 2024 dnešek + 56 předchozích dní.
 * Texty CZ/SK: crew (GPT + Gemini) 24. 11. 2026. Bez JS / prefers-reduced-motion = hotový stav. */
(function () {
  'use strict';
  if (window.__tmx56) return;
  window.__tmx56 = 1;

  var SK = /truckmall\.sk$/i.test(location.hostname);
  var T = SK ? {
    k1: 'Cestná kontrola: dnešok +', k2a: 'predchádzajúcich', k2b: 'dní', k3: '56 predchádzajúcich dní', k4: 'dnes',
    fleet: 'TAGRA ukáže porušenia vašich vodičov skôr, než ich odhalí cestná kontrola –',
    driver: 'TAGRA ukáže porušenia skôr, než ich odhalí cestná kontrola –',
    k7: 'skontrolujte si údaje ako prví.',
    k8: 'Od 31. decembra 2024 musí mať vodič pri cestnej kontrole k dispozícii záznamy za aktuálny deň a 56 predchádzajúcich dní (nariadenie (EÚ) č. 165/2014, čl. 36).',
    k9: 'Pri cestnej kontrole sa predkladajú záznamy za dnešný deň a 56 predchádzajúcich dní'
  } : {
    k1: 'Silniční kontrola: dnešek +', k2a: 'předchozích', k2b: 'dní', k3: '56 předchozích dní', k4: 'dnes',
    fleet: 'TAGRA ukáže porušení vašich řidičů dřív, než je najde silniční kontrola –',
    driver: 'TAGRA ukáže porušení dřív, než je najde silniční kontrola –',
    k7: 'zkontrolujte si data jako první.',
    k8: 'Od 31. prosince 2024 musí mít řidič při silniční kontrole k dispozici záznamy za aktuální den a 56 předchozích dní (nařízení (EU) č. 165/2014, čl. 36).',
    k9: 'Při silniční kontrole se předkládají záznamy za dnešní den a 56 předchozích dní'
  };

  // where: 'before' = vložit před nalezenou sekci, 'after' = za ni
  var PAGES = [
    // kategorie: pod výpis produktů (popis kategorie je sbalený pod „Zobrazit podrobnosti“, tam by ji nikdo neviděl)
    { re: /-c5720\/?$/i, audience: 'fleet', find: function () { return document.getElementById('CompoundPagingBottom') || document.getElementById('ProductsHost'); }, where: 'after' },
    // TAGRA TRUCKER (všechny karty TRUCKER): hned za sekci „TAGRA je nástroj, který používají i ti, co vás kontrolují“ (Libor 24. 11. 2026)
    { re: /-p(212497|212498|259032|259033|259034|393179)\/?$/i, audience: 'driver', find: function () {
        var h = document.querySelectorAll('h2');
        for (var j = 0; j < h.length; j++) {
          if (/POU[ŽZ][ÍI]VAJ[ÍIÚU]\s+(I|AJ)\s+T[IÍ],?\s+[CČ]O\s+V[ÁA]S\s+KONTROLUJ/i.test(h[j].textContent)) {
            var sec = h[j].closest ? h[j].closest('section') : null;
            if (sec) return sec;
          }
        }
        var s = document.querySelectorAll('section[aria-label]');
        for (var i = 0; i < s.length; i++) { if (/^Funkc(e|ie) programu TAGRA/.test(s[i].getAttribute('aria-label'))) return s[i]; }
        return null;
      }, where: 'after' }
  ];

  var CSS = '' +
    '.tmx-56-band{padding:40px 16px 56px;background:transparent}' +
    '.tmx-56{max-width:980px;margin:0 auto;padding:56px 56px 52px;box-sizing:border-box;border-radius:28px;background:linear-gradient(180deg,#f5f9fc 0%,#eaf3f8 35%,#dcecf6 70%,#eef5f9 100%);color:#0b2c4a;overflow:hidden;font-family:inherit;text-align:left}' +
    '.tmx-56 *{box-sizing:border-box}' +
    '.tmx-56 .tmx-56-gt{background:linear-gradient(90deg,#0b2c4a 0%,#134a8e 50%,#1f5fa6 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;padding-right:.07em}' +
    '.tmx-56 .tmx-56-h{margin:0 0 8px;padding:0;font-size:clamp(26px,3.6vw,40px)!important;font-weight:900!important;letter-spacing:-.02em;line-height:1.15!important;text-transform:none!important;text-align:left!important;display:block;border:0;background:none}' +
    '.tmx-56 .tmx-56-hero{display:flex;align-items:center;gap:28px;margin:8px 0 28px}' +
    '.tmx-56 .tmx-56-num{font-size:clamp(110px,16vw,190px);font-weight:900;letter-spacing:-.06em;line-height:.9;font-variant-numeric:tabular-nums;min-width:2.1ch}' +
    '.tmx-56 .tmx-56-pill{background:linear-gradient(135deg,#6E9B12 0%,#5C820F 100%);color:#fff;font-weight:900;font-size:clamp(30px,4.4vw,52px);line-height:1.02;padding:18px 26px;border-radius:20px}' +
    '.tmx-56.tmx-56-js .tmx-56-pill{opacity:0;transform:translateX(-24px);transition:opacity .5s ease,transform .5s cubic-bezier(.2,.9,.3,1.2)}' +
    '.tmx-56.tmx-56-js.go .tmx-56-pill{opacity:1;transform:none;transition-delay:.15s}' +
    '.tmx-56 .tmx-56-days{display:grid;grid-template-columns:repeat(57,1fr);gap:3px;height:74px;align-items:end}' +
    '.tmx-56 .tmx-56-d{display:block;height:100%;border-radius:3px;background:linear-gradient(180deg,#9fbfdc,#6f9cc7);transform:scaleY(0);transform-origin:bottom;opacity:0}' +
    '.tmx-56 .tmx-56-d.on{animation:tmx56pop .42s cubic-bezier(.2,.9,.3,1.35) forwards}' +
    '.tmx-56 .tmx-56-d.today{background:linear-gradient(180deg,#7fb01a,#5C820F)}' +
    '.tmx-56 .tmx-56-d.today.on{animation:tmx56popT .6s cubic-bezier(.2,.9,.3,1.5) forwards}' +
    '@keyframes tmx56pop{0%{transform:scaleY(0);opacity:0}60%{transform:scaleY(1.18);opacity:1}100%{transform:scaleY(1);opacity:1}}' +
    '@keyframes tmx56popT{0%{transform:scaleY(0);opacity:0}55%{transform:scaleY(1.32);opacity:1}100%{transform:scaleY(1.12);opacity:1}}' +
    '.tmx-56 .tmx-56-axis{display:flex;justify-content:space-between;gap:12px;margin-top:12px;font-weight:800;font-size:clamp(15px,1.8vw,20px)}' +
    '.tmx-56 .tmx-56-t{color:#6E9B12}' +
    '.tmx-56.tmx-56-js .tmx-56-t{opacity:0;transition:opacity .4s}' +
    '.tmx-56.tmx-56-js .tmx-56-t.on{opacity:1}' +
    '.tmx-56 .tmx-56-claim{margin:40px 0 0;padding:0;text-transform:none!important;font-size:clamp(22px,2.8vw,32px)!important;font-weight:900!important;line-height:1.2!important;max-width:820px}' +
    '.tmx-56.tmx-56-js .tmx-56-claim{opacity:0;transform:translateY(16px);transition:opacity .6s,transform .6s}' +
    '.tmx-56.tmx-56-js .tmx-56-claim.on{opacity:1;transform:none}' +
    '.tmx-56 .tmx-56-stamp{display:inline-block;margin-top:22px;background:linear-gradient(135deg,#6E9B12 0%,#5C820F 100%);color:#fff;font-weight:900;font-size:clamp(22px,2.8vw,32px);line-height:1.1;padding:14px 24px;border-radius:14px;transform:rotate(-4deg)}' +
    '.tmx-56.tmx-56-js .tmx-56-stamp{transform:rotate(-4deg) scale(2.2);opacity:0}' +
    '.tmx-56.tmx-56-js .tmx-56-stamp.on{animation:tmx56stamp .55s cubic-bezier(.2,.9,.3,1.25) forwards}' +
    '@keyframes tmx56stamp{0%{transform:rotate(-12deg) scale(2.2);opacity:0}70%{transform:rotate(-3deg) scale(.94);opacity:1}100%{transform:rotate(-4deg) scale(1);opacity:1}}' +
    '.tmx-56 .tmx-56-src{margin:26px 0 0;padding:0;font-size:13px!important;line-height:1.5!important;color:#5b6b7c}' +
    '@media (max-width:640px){.tmx-56-band{padding:28px 12px 40px}.tmx-56{padding:32px 22px 30px;border-radius:20px}.tmx-56 .tmx-56-days{gap:2px;height:52px}.tmx-56 .tmx-56-hero{gap:10px 14px;flex-wrap:wrap}.tmx-56 .tmx-56-num{font-size:104px;min-width:1.95ch}.tmx-56 .tmx-56-pill{font-size:24px;padding:12px 16px;border-radius:14px}.tmx-56 .tmx-56-stamp{font-size:20px;padding:12px 18px}.tmx-56 .tmx-56-claim{margin-top:30px}}' +
    '@media (prefers-reduced-motion:reduce){.tmx-56 .tmx-56-d,.tmx-56.tmx-56-js .tmx-56-pill,.tmx-56.tmx-56-js .tmx-56-claim,.tmx-56.tmx-56-js .tmx-56-stamp,.tmx-56.tmx-56-js .tmx-56-t{animation:none!important;transition:none!important;opacity:1!important;transform:none!important}.tmx-56.tmx-56-js .tmx-56-stamp{transform:rotate(-4deg)!important}}';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function gt(tag, cls, text) {
    var e = el(tag, cls);
    e.appendChild(el('span', 'tmx-56-gt', text));
    return e;
  }

  function build(audience) {
    var band = el('section', 'tmx-56-band');
    band.setAttribute('aria-label', T.k9);
    var root = el('div', 'tmx-56');
    root.appendChild(gt('h2', 'tmx-56-h', T.k1));
    var hero = el('div', 'tmx-56-hero');
    var num = el('div', 'tmx-56-num tmx-56-gt');
    num.setAttribute('aria-hidden', 'true');
    var n = el('span', null, '56');
    num.appendChild(n);
    var pill = el('div', 'tmx-56-pill');
    pill.appendChild(document.createTextNode(T.k2a));
    pill.appendChild(document.createElement('br'));
    pill.appendChild(document.createTextNode(T.k2b));
    hero.appendChild(num); hero.appendChild(pill);
    root.appendChild(hero);
    var days = el('div', 'tmx-56-days'); days.setAttribute('aria-hidden', 'true');
    root.appendChild(days);
    var axis = el('div', 'tmx-56-axis'); axis.setAttribute('aria-hidden', 'true');
    axis.appendChild(el('span', 'tmx-56-gt', T.k3));
    var today = el('span', 'tmx-56-t', T.k4);
    axis.appendChild(today);
    root.appendChild(axis);
    var claim = gt('p', 'tmx-56-claim', T[audience]);
    root.appendChild(claim);
    var stamp = el('div', 'tmx-56-stamp', T.k7);
    root.appendChild(stamp);
    root.appendChild(el('p', 'tmx-56-src', T.k8));
    band.appendChild(root);
    return { band: band, root: root, days: days, num: n, today: today, claim: claim, stamp: stamp };
  }

  function animate(x) {
    var N = 56, STEP = 26, bars = [];
    for (var i = 0; i <= N; i++) {
      var b = el('span', 'tmx-56-d' + (i === N ? ' today' : ''));
      x.days.appendChild(b); bars.push(b);
    }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function fin() {
      bars.forEach(function (b) { b.classList.add('on'); });
      x.num.textContent = N;
      x.root.classList.add('go'); x.today.classList.add('on'); x.claim.classList.add('on'); x.stamp.classList.add('on');
    }
    function play() {
      x.root.classList.add('go');
      bars.forEach(function (b, i) {
        setTimeout(function () {
          b.classList.add('on');
          if (i < N) x.num.textContent = i + 1;
          if (i === N) x.today.classList.add('on');
        }, 300 + i * STEP + (i === N ? 260 : 0));
      });
      var end = 300 + N * STEP + 260;
      setTimeout(function () { x.claim.classList.add('on'); }, end + 350);
      setTimeout(function () { x.stamp.classList.add('on'); }, end + 1000);
    }
    x.root.classList.add('tmx-56-js');
    if (reduce) { fin(); return; }
    // Spustit, až je sekce opravdu vidět: v rozbalovacích popisech BSSHOPu bývá schovaná
    // (IntersectionObserver tam spolehlivě nefunguje), proto kontrola polohy + elementFromPoint.
    x.num.textContent = '0';
    var started = false, timer = null;
    function seen() {
      var r = x.root.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
      if (!r.height || r.top > vh * 0.75 || r.bottom < vh * 0.25) return false;
      var y = Math.min(Math.max(r.top + r.height * 0.4, 0), vh - 1);
      var hit = document.elementFromPoint(r.left + r.width / 2, y);
      return !!hit && x.root.contains(hit);
    }
    function check() {
      if (started || !seen()) return;
      started = true;
      window.removeEventListener('scroll', onEv, true); window.removeEventListener('resize', onEv);
      clearInterval(timer); play();
    }
    function onEv() { if (window.requestAnimationFrame) requestAnimationFrame(check); else check(); }
    window.addEventListener('scroll', onEv, { passive: true, capture: true });
    window.addEventListener('resize', onEv);
    timer = setInterval(check, 600);
    check();
  }

  function run() {
    if (document.querySelector('.tmx-56-band')) return;
    var path = location.pathname, page = null;
    for (var i = 0; i < PAGES.length; i++) { if (PAGES[i].re.test(path)) { page = PAGES[i]; break; } }
    if (!page) return;
    var anchor = page.find();
    if (!anchor || !anchor.parentNode) return;
    if (!document.getElementById('tmx-56-css')) {
      var st = el('style'); st.id = 'tmx-56-css'; st.textContent = CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    var x = build(page.audience);
    anchor.parentNode.insertBefore(x.band, page.where === 'before' ? anchor : anchor.nextSibling);
    animate(x);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
