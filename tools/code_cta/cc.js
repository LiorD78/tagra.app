
/* ─── Mobilní „pošlete mi odkaz na PC" (blok .cc-top, 19. 9. 2026) ───
 * Odešle jméno + e-mail do Netlify formuláře tagra-trial (AJAX, zůstává se na
 * stránce). Uvítací e-mail s odkazem ke stažení posílá trial-email.js jako
 * u plného formuláře. Bez JS formulář odejde klasicky (POST s form-name). */
(function () {
  'use strict';
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.classList || !f.classList.contains('cc-mail')) return;
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var msg = f.querySelector('.cc-msg');
    var btn = f.querySelector('button[type="submit"]');
    var src = f.querySelector('.cc-src');
    var landing = '';
    try {
      var l = JSON.parse(sessionStorage.getItem('tagra_landing') || 'null');
      if (l && l.p) landing = ' | landing: ' + l.p + (l.s ? ' src=' + l.s : '') +
        ' via ' + (l.r || '(direct/internal)') + ' @' + l.t;
    } catch (x) { /* bez atribuce */ }
    if (src) src.value = location.href.split('#')[0] + ' | quick-mail-form' + landing;
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = f.getAttribute('data-sending') || label; }
    var body = new URLSearchParams(new FormData(f)).toString();
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      f.classList.add('is-done');
      if (msg) msg.textContent = f.getAttribute('data-ok') || '';
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (msg) {
        msg.textContent = (f.getAttribute('data-err') || '') + ' ';
        var a = document.createElement('a');
        a.href = f.getAttribute('data-try') || '/try/';
        a.textContent = f.getAttribute('data-errlink') || '';
        msg.appendChild(a);
        msg.appendChild(document.createTextNode('.'));
      }
    });
  });
})();
