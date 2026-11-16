// /scripts/consent.js
// Souhlas s měřením návštěvnosti. Google Analytics se načte až po výslovném souhlasu.
// Volba se ukládá do localStorage pod klíčem "nx-consent" (hodnoty "granted" / "denied").

(function () {
  var GA_ID = 'G-2L5NXT75WG';
  var KEY = 'nx-consent';
  var en = (document.documentElement.lang || 'cs').toLowerCase().indexOf('en') === 0;

  var T = en
    ? {
        text: 'We would like to measure site traffic with Google Analytics. It uses cookies and runs only if you allow it.',
        more: 'Privacy Policy',
        href: '/en/privacy/',
        yes: 'Allow',
        no: 'Decline',
        label: 'Cookie settings'
      }
    : {
        text: 'Rádi bychom měřili návštěvnost webu pomocí Google Analytics. Používá cookies a spustí se jen s vaším souhlasem.',
        more: 'Zásady ochrany osobních údajů',
        href: '/zasady-ochrany-osobnich-udaju/',
        yes: 'Povolit',
        no: 'Odmítnout',
        label: 'Nastavení cookies'
      };

  function read() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { window.localStorage.setItem(KEY, v); } catch (e) {}
  }

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // Po odvolání souhlasu smaže cookies Google Analytics na této doméně.
  function clearGACookies() {
    var parts = document.cookie ? document.cookie.split(';') : [];
    var host = location.hostname;
    var domains = ['', host, '.' + host];
    var bits = host.split('.');
    if (bits.length > 2) domains.push('.' + bits.slice(-2).join('.'));
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].split('=')[0].replace(/^\s+/, '');
      if (name.indexOf('_ga') !== 0 && name !== '_gid' && name !== '_gat') continue;
      for (var d = 0; d < domains.length; d++) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' +
          (domains[d] ? '; domain=' + domains[d] : '');
      }
    }
  }

  var bar = null;
  function hide() {
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
  }

  function button(text, primary) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.style.cssText = 'font:inherit;font-weight:600;padding:10px 18px;border-radius:8px;cursor:pointer;' +
      'min-width:110px;border:1px solid #94a3b8;' +
      (primary ? 'background:#ffffff;color:#0f172a;' : 'background:transparent;color:#ffffff;');
    return b;
  }

  function show() {
    if (bar) return;
    bar = document.createElement('div');
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', T.label);
    bar.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:1000;max-width:760px;margin:0 auto;' +
      'background:#0b1120;color:#e2e8f0;border:1px solid #334155;border-radius:12px;padding:16px 18px;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.35);font:14px/1.5 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;' +
      'display:flex;flex-wrap:wrap;gap:12px 16px;align-items:center;justify-content:space-between';

    var p = document.createElement('p');
    p.style.cssText = 'margin:0;flex:1 1 320px';
    p.appendChild(document.createTextNode(T.text + ' '));
    var a = document.createElement('a');
    a.href = T.href;
    a.textContent = T.more;
    a.style.cssText = 'color:#93c5fd;text-decoration:underline';
    p.appendChild(a);

    var box = document.createElement('div');
    box.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
    var no = button(T.no, false);
    var yes = button(T.yes, true);
    no.addEventListener('click', function () {
      var had = read() === 'granted';
      write('denied');
      hide();
      if (had) { clearGACookies(); location.reload(); }
    });
    yes.addEventListener('click', function () {
      write('granted');
      hide();
      loadGA();
    });
    box.appendChild(no);
    box.appendChild(yes);

    bar.appendChild(p);
    bar.appendChild(box);
    document.body.appendChild(bar);
  }

  function init() {
    var state = read();
    if (state === 'granted') loadGA();
    else if (state !== 'denied') show();

    // Odkazy "Nastavení cookies" (data-cookie-settings) znovu otevřou volbu.
    document.addEventListener('click', function (e) {
      var el = e.target;
      while (el && el !== document) {
        if (el.getAttribute && el.getAttribute('data-cookie-settings') !== null) {
          e.preventDefault();
          show();
          return;
        }
        el = el.parentNode;
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
