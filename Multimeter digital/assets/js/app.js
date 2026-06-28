/* ==========================================================================
   app.js — shared bootstrap for every page
   ========================================================================== */

(function () {
  function audioPath(file) {
    const inSimulator = location.pathname.includes('/simulator/');
    return (inSimulator ? '../assets/audio/' : 'assets/audio/') + file;
  }

  // Preload short sound effects; gracefully no-op if audio can't play (autoplay policies, etc.)
  const sounds = {
    beep: new Audio(audioPath('continuity-beep.wav')),
    click: new Audio(audioPath('key-click.wav')),
    power: new Audio(audioPath('power-on.wav'))
  };
  function play(name) {
    const a = sounds[name];
    if (!a) return;
    try { a.currentTime = 0; a.volume = name === 'click' ? 0.5 : 0.8; a.play().catch(() => {}); } catch (e) {}
  }

  // Highlight current page in the top nav
  function markActiveNav() {
    const links = document.querySelectorAll('.topnav a');
    const here = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const target = a.getAttribute('href').split('/').pop();
      if (target === here) a.classList.add('active');
    });
  }

  function footerYear() {
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  // Tiny global toast/banner helper some pages can reuse for one-off messages
  window.Toast = {
    show(msg, type = 'ok') {
      const wrap = document.getElementById('globalToast') || createToastHost();
      wrap.textContent = msg;
      wrap.className = 'banner ' + (type === 'bad' ? 'bad' : 'ok') + ' toast-fixed';
      wrap.style.opacity = '1';
      clearTimeout(wrap._t);
      wrap._t = setTimeout(() => { wrap.style.opacity = '0'; }, 3200);
    }
  };
  function createToastHost() {
    const d = document.createElement('div');
    d.id = 'globalToast';
    d.style.position = 'fixed';
    d.style.bottom = '18px';
    d.style.right = '18px';
    d.style.maxWidth = '320px';
    d.style.zIndex = '999';
    d.style.transition = 'opacity .3s ease';
    d.style.opacity = '0';
    document.body.appendChild(d);
    return d;
  }

  window.Lab = { play };

  document.addEventListener('DOMContentLoaded', () => {
    markActiveNav();
    footerYear();
  });
})();