/* ═══════════════════════════════════════════════════════════
   Sherzod O'rolov — Portfolio interactions
   Vanilla JS, no dependencies.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Sticky nav state ─────────────────────────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Scroll reveal ────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach((el) => {
    const d = el.dataset.d;
    if (d) el.style.setProperty('--d', d);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ── Animated counters ────────────────────────────────── */
  const counters = document.querySelectorAll('.count');

  const format = (n) => n.toLocaleString('en-US');

  const runCount = (el) => {
    const to = parseFloat(el.dataset.to) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();

    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const v = Math.round(to * ease(p));
      el.textContent = format(v) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = format(to) + suffix;
    };
    requestAnimationFrame(tick);
  };

  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach((el) => {
      el.textContent = format(parseFloat(el.dataset.to) || 0) + (el.dataset.suffix || '');
    });
  } else {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ── Chart bar animation on view ──────────────────────── */
  const bars = document.querySelectorAll('.viz__bar');
  if (bars.length) {
    const setDelay = () => {
      bars.forEach((b, i) => {
        b.style.animationDelay = (i * 70) + 'ms';
      });
    };
    setDelay();

    if (!reduceMotion && 'IntersectionObserver' in window) {
      const bio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bars.forEach((b) => {
              b.style.animation = 'none';
              void b.offsetWidth;      // force reflow
              b.style.animation = '';
              b.style.animationDelay = (Array.from(bars).indexOf(b) * 70) + 'ms';
            });
            bio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      bio.observe(document.querySelector('.viz--chart') || document.body);
    }
  }

  /* ── Footer year ──────────────────────────────────────── */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Active nav link highlight ────────────────────────── */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav__links a'));

  if ('IntersectionObserver' in window && sections.length) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          const active = a.getAttribute('href') === '#' + id;
          a.style.color = active ? '#e8eaf0' : '';
          a.style.background = active ? 'rgba(255,255,255,.06)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => sio.observe(s));
  }

  /* ── Project cards: subtle pointer-follow highlight ───── */
  document.querySelectorAll('.proj, .wcard, .skill, .lab__card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (reduceMotion) return;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();
