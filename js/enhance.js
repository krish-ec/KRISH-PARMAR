/* enhance.js — layered on top of portfolio.js. Everything is progressive: if something is missing it skips quietly. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const onView = (els, fn, th = .35) => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), { threshold: th });
    els.forEach(el => io.observe(el));
  };

  /* 1. Hero headline: masked word-by-word rise (the one big load moment) */
  const h1 = $('.hero h1');
  if (h1 && !reduced) {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t.trim()) { frag.append(t); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = t; s.style.setProperty('--i', i++);
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h1); h1.classList.add('split');
  }

  /* 2. Interactive dot field behind the hero */
  const hero = $('.hero');
  if (hero && !reduced) {
    const c = document.createElement('canvas'); c.id = 'field'; c.setAttribute('aria-hidden', 'true');
    hero.prepend(c);
    const g = c.getContext('2d'); let W, H, dots = [], run = true, m = { x: -999, y: -999 };
    const gap = innerWidth < 700 ? 34 : 28;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = c.width = hero.offsetWidth * dpr; H = c.height = hero.offsetHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      W /= dpr; H /= dpr; dots = [];
      for (let x = gap / 2; x < W; x += gap) for (let y = gap / 2; y < H; y += gap) dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
    };
    size(); addEventListener('resize', size);
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { m.x = m.y = -999; });
    new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run) tick(); }).observe(hero);
    const tick = () => {
      if (!run) return;
      const col = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f9bff';
      g.clearRect(0, 0, W, H);
      for (const d of dots) {
        const dx = d.x - m.x, dy = d.y - m.y, dist = Math.hypot(dx, dy), R = 140;
        if (dist < R) { const f = (1 - dist / R) * 5; d.vx += dx / dist * f; d.vy += dy / dist * f; }
        d.vx += (d.ox - d.x) * .06; d.vy += (d.oy - d.y) * .06; d.vx *= .82; d.vy *= .82; d.x += d.vx; d.y += d.vy;
        const near = Math.max(0, 1 - dist / 200);
        g.globalAlpha = .16 + near * .75; g.fillStyle = near > .05 ? col : getComputedStyle(document.body).color;
        g.beginPath(); g.arc(d.x, d.y, 1 + near * 1.6, 0, 6.283); g.fill();
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* 3. Live local time in the "At a glance" panel */
  const dl = $('.glance dl');
  if (dl) {
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = '<dt>Local time</dt><dd class="live-clock"></dd>'; dl.append(row);
    const out = $('.live-clock', row);
    const f = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    const t = () => out.textContent = f.format(new Date()) + ' IST'; t(); setInterval(t, 1000);
  }

  /* 4. Stat counters */
  $$('.stat-value').forEach(el => {
    const end = parseInt(el.textContent, 10); if (isNaN(end) || reduced) return; const pad = el.textContent.length;
    el.textContent = '0'.repeat(pad);
    onView([el], () => {
      const t0 = performance.now(), dur = 1200;
      const step = now => { const p = Math.min((now - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = String(v).padStart(pad, '0'); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  });

  /* 5. CGPA: a border that traces itself to 7.56 / 10 */
  const cg = $('.cgpa-panel');
  if (cg) {
    const w = cg.offsetWidth, h = cg.offsetHeight, len = 2 * (w + h);
    cg.insertAdjacentHTML('beforeend', `<svg class="cgpa-ring" aria-hidden="true" viewBox="0 0 ${w} ${h}" style="--len:${len}"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18"/></svg>`);
    const ring = $('.cgpa-ring', cg), num = $('strong', cg);
    onView([cg], () => {
      ring.classList.add('go');
      if (!reduced) { const t0 = performance.now(); const s = n => { const p = Math.min((n - t0) / 1800, 1); num.textContent = (7.56 * (1 - Math.pow(1 - p, 3))).toFixed(2); if (p < 1) requestAnimationFrame(s); }; s(t0); }
    }, .5);
  }

  /* 6. Project filters */
  const grid = $('.proj-grid');
  if (grid) {
    const cards = $$('.card[data-category]', grid);
    const labels = { all: 'All', fullstack: 'Full-stack', frontend: 'Front-end', systems: 'Systems' };
    const bar = document.createElement('div'); bar.className = 'filters'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Filter projects');
    bar.innerHTML = Object.entries(labels).map(([k, v], i) => {
      const n = k === 'all' ? cards.length : cards.filter(c => c.dataset.category === k).length;
      return n ? `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${v}<span class="count">${n}</span></button>` : '';
    }).join('');
    grid.before(bar);
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', bar).forEach(x => x.setAttribute('aria-pressed', x === b));
      cards.forEach(c => {
        const show = b.dataset.f === 'all' || c.dataset.category === b.dataset.f;
        if (show) { c.hidden = false; requestAnimationFrame(() => c.classList.remove('out')); }
        else { c.classList.add('out'); setTimeout(() => { if (c.classList.contains('out')) c.hidden = true; }, 420); }
      });
    });
  }

  /* 7. Card spotlight + gentle 3D tilt on illustrations */
  if (fine && !reduced) {
    $$('.card.spot').forEach(card => {
      const viz = $('.viz svg', card);
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--sx', e.clientX - r.left + 'px'); card.style.setProperty('--sy', e.clientY - r.top + 'px');
        if (viz) { const v = viz.getBoundingClientRect(); const px = (e.clientX - v.left) / v.width - .5, py = (e.clientY - v.top) / v.height - .5;
          viz.style.setProperty('--ry', px * 12 + 'deg'); viz.style.setProperty('--rx', -py * 12 + 'deg'); }
      });
      card.addEventListener('pointerleave', () => { viz && (viz.style.setProperty('--rx', '0deg'), viz.style.setProperty('--ry', '0deg')); });
    });
    /* magnetic primary buttons */
    $$('.btn-primary').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  /* 8. Achievements: progress line + broken-image fallback */
  const sc = $('.achievement-scroller');
  if (sc) {
    const prog = document.createElement('div'); prog.className = 'ach-progress'; prog.innerHTML = '<i></i>'; sc.after(prog);
    const upd = () => { const max = sc.scrollWidth - sc.clientWidth; prog.style.setProperty('--p', (max > 0 ? Math.max(8, sc.scrollLeft / max * 100) : 100) + '%'); };
    sc.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    $$('.achievement-image img', sc).forEach(img => img.addEventListener('error', () => { img.style.display = 'none'; img.parentElement.style.background = 'linear-gradient(135deg,var(--surface-2,#1a2236),var(--surface,#121a30))'; }));
  }

  /* 9. Timeline line draws with scroll; subtle nebula parallax */
  const tl = $('.achievement-timeline'), neb = $('.nebula');
  let tick2 = false;
  const onScroll = () => {
    if (tick2) return; tick2 = true;
    requestAnimationFrame(() => {
      if (tl) { const r = tl.getBoundingClientRect(); tl.style.setProperty('--tp', Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / r.height))); }
      if (neb && !reduced) neb.style.setProperty('--nebula-parallax', `${Math.max(-32, -scrollY * .01)}px`);
      tick2 = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  console.log('%cHey, curious one. 👋 Ctrl/⌘+K opens the command palette.', 'font:600 13px system-ui;color:#2f9bff');
})();
