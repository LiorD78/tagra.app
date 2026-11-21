
  /* Most článek → nákup (79-1, 21. 11. 2026): bridge_click a cta_view s pozicí boxu.
     Cookieless režim se nemění; shop_click výše se počítá dál. */
  doc.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-bridge]') : null;
    if (!a) return;
    var box = a.closest('[data-src]');
    track('bridge_click', {
      position: a.getAttribute('data-bridge'),
      cta: a.getAttribute('data-cta') || '',
      lang: doc.documentElement.lang,
      src: box ? box.getAttribute('data-src') : ''
    }, true);
  }, true);
  onReady(function () {
    if (!('IntersectionObserver' in W)) return;
    var timers = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) {
          if (timers.has(el)) return;
          timers.set(el, setTimeout(function () {
            io.unobserve(el);
            track('cta_view', { position: el.getAttribute('data-br-box'), src: el.getAttribute('data-src') || '' });
          }, 1000));
        } else if (timers.has(el)) {
          clearTimeout(timers.get(el));
          timers.delete(el);
        }
      });
    }, { threshold: 0.5 });
    doc.querySelectorAll('[data-br-box]').forEach(function (b) { io.observe(b); });
  });
