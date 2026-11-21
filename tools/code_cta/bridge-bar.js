
/* ─── Mobilní lišta „TRUCKER + čtečka zdarma“ (79-1, 21. 11. 2026) ───
 * Jen ≤ 720 px. Ukáže se po odscrollování horního boxu (.br-top), skrytá je, dokud
 * je vidět cookie lišta (.tmx-cc) nebo otevřené chat okno Smartsuppu. Zavření
 * se pamatuje v sessionStorage. Žádné atributy v MutationObserveru. */
(function () {
  'use strict';
  var bar = document.getElementById('brBar');
  if (!bar) return;
  var KEY = 'br-bar-closed', closed = false;
  try { closed = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* bez paměti */ }
  var top = document.querySelector('.br-top');
  var mq = window.matchMedia ? window.matchMedia('(max-width:720px)') : null;
  function chatOpen() {
    var c = document.getElementById('chat-application');
    return !!(c && c.offsetHeight > 120);
  }
  function update() {
    var show = !closed && mq && mq.matches && top && top.getBoundingClientRect().bottom < 0 &&
      !document.querySelector('.tmx-cc') && !chatOpen();
    bar.classList.toggle('is-visible', !!show);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  new MutationObserver(update).observe(document.body, { childList: true });
  var x = bar.querySelector('.br-bar-x');
  if (x) x.addEventListener('click', function () {
    closed = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* bez paměti */ }
    update();
  });
  update();
})();
