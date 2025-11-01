// /scripts/menu-fix.js
// Stabilní dropdown "Projekty" + klávesnice + klik mimo

(function () {
  // 1) Vložím CSS pravidlo, které drží menu otevřené na :hover a :focus-within
  const css = `
  nav .nav-projects:hover .nav-projects-menu,
  nav .nav-projects:focus-within .nav-projects-menu { display: block !important; }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-menu-fix', 'true');
  style.textContent = css;
  document.head.appendChild(style);

  // 2) Najdu dropdown a "odstřihnu" staré mouseenter/leave listenery (pokud jsou)
  const np = document.querySelector('nav .nav-projects');
  if (!np) return;

  // Klon nahradí původní element => zruší anonymní posluchače z addEventListener
  const clone = np.cloneNode(true);
  np.parentNode.replaceChild(clone, np);

  const menu = clone.querySelector('.nav-projects-menu');
  if (!menu) return;
  menu.classList.add('hidden'); // výchozí stav

  // 3) Otevření na focus (klávesnice)
  const btn = clone.querySelector('button, a, [tabindex]');
  if (btn) {
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('focus', () => {
      menu.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
    });
  }

  // 4) Klik mimo => zavřít
  document.addEventListener('click', (e) => {
    if (!clone.contains(e.target)) {
      menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  // 5) Escape => zavřít
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      btn && btn.focus();
    }
  });

  // 6) Hover v CSS to otevírá, ale když myš odejde i fokus zmizí, skryj znovu
  clone.addEventListener('mouseleave', () => {
    // chvilka kvůli přechodu na podmenu
    setTimeout(() => {
      if (!clone.matches(':hover') && !clone.matches(':focus-within')) {
        menu.classList.add('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }, 80);
  });
})();
