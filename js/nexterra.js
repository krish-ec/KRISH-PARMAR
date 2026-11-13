/* NexTerra case study. GSAP + ScrollTrigger + Lenis, 2D only. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PAL = ['#1b7f70', '#b8d9c5', '#f2d477', '#e17b67', '#18332a'];

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); }
    }));
  }

  /* ---------- heat colour ---------- */
  const STOPS = [[0, [27, 127, 112]], [.3, [184, 217, 197]], [.55, [242, 212, 119]], [.8, [238, 155, 69]], [1, [216, 82, 62]]];
  function heatColor(h) {
    h = clamp(h, 0, 1);
    for (let i = 1; i < STOPS.length; i++) {
      if (h <= STOPS[i][0]) {
        const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], t = (h - a) / (b - a);
        return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`;
      }
    }
    return 'rgb(216,82,62)';
  }
  // deterministic schematic heat field (illustrative only)
  const SPOTS = [[.2, .3, .9], [.66, .26, .8], [.5, .72, 1], [.86, .76, .7]];
  function field(c, r, cols, rows) {
    const x = c / (cols - 1), y = r / (rows - 1);
    let s = 0;
    SPOTS.forEach(([sx, sy, w]) => { s += w * Math.exp(-(((x - sx) ** 2) + ((y - sy) ** 2)) / 0.05); });
    const n = Math.sin(c * 1.7 + r * 2.3) * 0.5 + Math.cos(c * 0.9 - r * 1.3) * 0.5;
    return clamp(0.45 + s * 0.5 + n * 0.07, 0.3, 1);
  }

  /* ---------- sparkle burst ---------- */
  const STAR = c => `<svg viewBox="0 0 20 20"><path d="M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z" fill="${c}" stroke="#18332a" stroke-width="1.2"/></svg>`;
  function burst(x, y, n = 9) {
    if (RM) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      s.className = 'spark'; s.innerHTML = STAR(PAL[i % 4]);
      s.style.left = x + 'px'; s.style.top = y + 'px';
      document.body.appendChild(s);
      const a = (i / n) * Math.PI * 2 + rand(-.3, .3), d = rand(40, 90);
      gsap.fromTo(s, { scale: 0, rotate: 0 }, {
        x: Math.cos(a) * d, y: Math.sin(a) * d, scale: rand(.8, 1.5), rotate: rand(-180, 180),
        duration: .7, ease: 'back.out(2)'
      });
      gsap.to(s, { opacity: 0, duration: .35, delay: .45, onComplete: () => s.remove() });
    }
  }
  $$('[data-burst]').forEach(el => el.addEventListener('click', e => burst(e.clientX, e.clientY)));

  /* ---------- magnetic buttons ---------- */
  if (!RM) {
    $$('[data-mag]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3, duration: .3, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.35)' }));
    });
    // elastic hover pops
    $$('.pop').forEach(el => {
      el.addEventListener('pointerenter', () => gsap.to(el, { scale: 1.05, rotate: rand(-2, 2), duration: .7, ease: 'elastic.out(1,.4)' }));
      el.addEventListener('pointerleave', () => gsap.to(el, { scale: 1, rotate: 0, duration: .6, ease: 'elastic.out(1,.5)' }));
    });
  }

  /* ---------- blinking mascot eyes ---------- */
  if (!RM) {
    $$('.eye').forEach(e => {
      gsap.timeline({ repeat: -1, repeatDelay: rand(2, 4.5), delay: rand(0, 2) })
        .to(e, { scaleY: .08, transformOrigin: '50% 50%', duration: .07, ease: 'power1.in' })
        .to(e, { scaleY: 1, duration: .12, ease: 'power1.out' });
    });
    gsap.to('.twk', { rotate: 25, scale: 1.25, transformOrigin: '50% 50%', duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: .3 });
  }

  /* ---------- scroll reveals ---------- */
  if (!RM) {
    $$('.rv').forEach(el => gsap.from(el, {
      y: 50, opacity: 0, duration: .9, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    }));
  }

  /* ---------- 1. HERO ---------- */
  (function hero() {
    const ln = $('#ntTitle .ln');
    const spans = $$('#ntTitle .ink, #ntTitle .blu');
    spans.forEach(sp => {
      const txt = sp.textContent; sp.textContent = '';
      [...txt].forEach(ch => { const l = document.createElement('span'); l.className = 'l'; l.textContent = ch; l.setAttribute('aria-hidden', 'true'); sp.appendChild(l); });
    });
    // count-ups
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
      if (RM) { el.textContent = end.toFixed(dec); return; }
      const o = { v: 0 };
      el.textContent = (0).toFixed(dec);
      gsap.to(o, {
        v: end, duration: 1.8, ease: 'power3.out', delay: .9,
        onUpdate: () => { el.textContent = o.v.toFixed(dec); }
      });
    });
    if (RM) return;
    gsap.from('#ntTitle .l', { yPercent: 115, rotate: 10, duration: 1.1, ease: 'back.out(1.8)', stagger: .06, delay: .15 });
    gsap.from('.hero-sub,.meta,.kick,.disc,.stat', { y: 30, opacity: 0, duration: .8, ease: 'back.out(1.4)', stagger: .08, delay: .7 });
    gsap.from('#heroFace', { scale: 0, transformOrigin: '50% 50%', duration: 1.1, ease: 'elastic.out(1,.5)', delay: .4 });
    gsap.to('#heroRays', { rotate: 360, transformOrigin: '50% 50%', duration: 40, repeat: -1, ease: 'none' });
    gsap.to('.sun-wrap', { y: -12, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('#heroMouth', { attr: { d: 'M132 168q18 26 36 0' }, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    $('#heroSun').addEventListener('click', () => gsap.fromTo('#heroFace', { scale: .85 }, { scale: 1, transformOrigin: '50% 50%', duration: 1, ease: 'elastic.out(1,.35)' }));
  })();

  /* ---------- 2. PLAYABLE HEAT-MAP TEASER ---------- */
  (function playground() {
    const COLS = 16, ROWS = 10, BASE_T = 39.2, GOAL = 50, K = 14; // K: demo scaling, not a model
    const map = $('#pgMap'), grid = $('#pgGrid'), layer = $('#pgLayer'), tray = $('#pgTray');
    const tempEl = $('#pgTemp'), deltaEl = $('#pgDelta'), ptsEl = $('#pgPts'), lvlEl = $('#pgLvl');
    const fill = $('#pgFill'), mascot = $('#pgMascot'), msg = $('#pgMsg'), bar = $('#pgBar');
    const cells = [], base = [], h = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = document.createElement('i'), v = field(c, r, COLS, ROWS);
      base.push(v); h.push(v); cells.push(i); i.style.background = heatColor(v); grid.appendChild(i);
    }
    const baseSum = base.reduce((a, b) => a + b, 0);

    const ICON = {
      tree: `<svg viewBox="0 0 60 60"><rect x="26" y="34" width="9" height="20" rx="3" fill="#f2d477" stroke="#18332a" stroke-width="3.5"/><circle cx="30" cy="24" r="18" fill="#b8d9c5" stroke="#18332a" stroke-width="3.5"/><circle cx="24" cy="21" r="2.4" fill="#18332a"/><circle cx="36" cy="21" r="2.4" fill="#18332a"/><path d="M25 29q5 4 10 0" fill="none" stroke="#18332a" stroke-width="2.6" stroke-linecap="round"/></svg>`,
      roof: `<svg viewBox="0 0 60 60"><rect x="12" y="28" width="36" height="26" rx="4" fill="#f3f1e5" stroke="#18332a" stroke-width="3.5"/><path d="M6 31L30 9l24 22z" fill="#1b7f70" stroke="#18332a" stroke-width="3.5" stroke-linejoin="round"/><circle cx="25" cy="41" r="2.4" fill="#18332a"/><circle cx="35" cy="41" r="2.4" fill="#18332a"/><path d="M26 47q4 3 8 0" fill="none" stroke="#18332a" stroke-width="2.6" stroke-linecap="round"/></svg>`,
      water: `<svg viewBox="0 0 60 60"><path d="M30 6C22 20 12 28 12 38a18 18 0 0 0 36 0C48 28 38 20 30 6z" fill="#1b7f70" stroke="#18332a" stroke-width="3.5" stroke-linejoin="round"/><circle cx="24" cy="38" r="2.4" fill="#fff"/><circle cx="36" cy="38" r="2.4" fill="#fff"/><path d="M25 45q5 4 10 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`
    };
    // radius in cells, strength per drop
    const FX = { tree: { r: 2.6, s: .34 }, roof: { r: 2.2, s: .46 }, water: { r: 3.2, s: .55 } };
    $$('.stk', tray).forEach(b => { $('.ico', b).innerHTML = ICON[b.dataset.type]; });

    let pts = 0, celebrated = false, placed = 0;
    const T = { v: BASE_T };

    function temp() {
      const cur = h.reduce((a, b) => a + b, 0);
      return BASE_T - (1 - cur / baseSum) * K;
    }
    function updateHud() {
      const target = temp();
      if (RM) { T.v = target; tempEl.textContent = target.toFixed(1); }
      else gsap.to(T, { v: target, duration: .9, ease: 'power2.out', onUpdate: () => { tempEl.textContent = T.v.toFixed(1); } });
      const d = BASE_T - target;
      deltaEl.textContent = d < .05 ? 'Baseline 39.2°C' : `Down ${d.toFixed(1)}°C from 39.2°C`;
      ptsEl.textContent = pts;
      const pct = clamp(pts / GOAL, 0, 1) * 100;
      if (RM) { fill.style.width = pct + '%'; mascot.style.left = pct + '%'; }
      else {
        gsap.to(fill, { width: pct + '%', duration: .7, ease: 'back.out(1.4)' });
        gsap.to(mascot, { left: pct + '%', duration: .8, ease: 'elastic.out(1,.55)' });
      }
    }

    function cool(type, col, row) {
      const { r, s } = FX[type];
      cells.forEach((el, i) => {
        const c = i % COLS, rr = (i / COLS) | 0, d = Math.hypot(c - col, rr - row);
        if (d > r) return;
        h[i] = Math.max(0.03, h[i] - s * Math.pow(1 - d / r, 1.1));
        const col2 = heatColor(h[i]);
        if (RM) el.style.background = col2;
        else gsap.to(el, { background: col2, duration: .6, delay: d * .07, ease: 'power1.out' });
      });
    }

    function drop(type, px, py) {
      const rect = map.getBoundingClientRect();
      const cw = rect.width / COLS, ch = rect.height / ROWS;
      const col = clamp(Math.floor(px / cw), 0, COLS - 1), row = clamp(Math.floor(py / ch), 0, ROWS - 1);
      const cx = (col + .5) * cw, cy = (row + .5) * ch;
      // placed sticker
      const it = document.createElement('div'); it.className = 'pg-item'; it.innerHTML = ICON[type];
      it.style.left = cx + 'px'; it.style.top = cy + 'px'; layer.appendChild(it);
      // ripple
      const rp = document.createElement('div'); rp.className = 'ripple';
      rp.style.left = cx + 'px'; rp.style.top = cy + 'px'; layer.appendChild(rp);
      const dia = FX[type].r * 2 * cw;
      cool(type, col, row);
      pts += 10; placed++;
      if (!RM) {
        gsap.from(it, { scale: 0, rotate: -40, duration: .8, ease: 'elastic.out(1,.45)' });
        gsap.fromTo(rp, { scale: .1, opacity: 1 }, { scale: dia / 100, opacity: 0, duration: 1, ease: 'power2.out', onComplete: () => rp.remove() });
        const f = document.createElement('div'); f.className = 'float'; f.textContent = '+10 pts';
        f.style.left = cx + 'px'; f.style.top = (cy - 10) + 'px'; layer.appendChild(f);
        gsap.fromTo(f, { y: 0, opacity: 0, scale: .5 }, { y: -60, opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' });
        gsap.to(f, { opacity: 0, y: -90, duration: .5, delay: .7, onComplete: () => f.remove() });
        const m = map.getBoundingClientRect();
        burst(m.left + cx, m.top + cy, 6);
      } else rp.remove();
      updateHud();
      if (pts >= GOAL && !celebrated) celebrate();
      else if (!celebrated) msg.textContent = `${Math.max(0, (GOAL - pts) / 10)} more to level up.`;
    }

    function celebrate() {
      celebrated = true; lvlEl.textContent = '2'; msg.textContent = 'Level up! Cool work.';
      $('#pgSmile').setAttribute('d', 'M20 34q10 14 20 0');
      if (RM) return;
      const r = mascot.getBoundingClientRect();
      gsap.timeline()
        .to(mascot, { y: -26, rotate: 360, scale: 1.4, duration: .6, ease: 'back.out(2)' })
        .to(mascot, { y: 0, rotate: 360, scale: 1, duration: .8, ease: 'elastic.out(1,.4)' })
        .set(mascot, { rotate: 0 });
      burst(r.left + r.width / 2, r.top + r.height / 2, 14);
      gsap.fromTo(lvlEl, { scale: 2 }, { scale: 1, duration: .9, ease: 'elastic.out(1,.4)' });
    }

    function hottest() {
      let m = 0, idx = 0; h.forEach((v, i) => { if (v > m) { m = v; idx = i; } });
      return idx;
    }
    function autoDrop(type) {
      const rect = map.getBoundingClientRect(), i = hottest();
      drop(type, ((i % COLS) + .5) * rect.width / COLS, (((i / COLS) | 0) + .5) * rect.height / ROWS);
    }

    // drag from tray (pointer events; works on touch); tiny movement = tap
    $$('.stk', tray).forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const type = btn.dataset.type, sx = e.clientX, sy = e.clientY;
        const g = document.createElement('div'); g.className = 'ghost-stk'; g.innerHTML = ICON[type];
        document.body.appendChild(g);
        gsap.set(g, { x: e.clientX, y: e.clientY, scale: .4, opacity: 0 });
        gsap.to(g, { scale: 1.15, opacity: 1, duration: RM ? 0 : .35, ease: 'back.out(2)' });
        const move = ev => { gsap.set(g, { x: ev.clientX, y: ev.clientY }); };
        const up = ev => {
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
          const moved = Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8;
          const rect = map.getBoundingClientRect();
          const inside = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
          g.remove();
          if (!moved) autoDrop(type);
          else if (inside && ev.type === 'pointerup') drop(type, ev.clientX - rect.left, ev.clientY - rect.top);
        };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      });
      // keyboard: Enter / Space drops on the hottest cell
      btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); autoDrop(btn.dataset.type); } });
    });

    $('#pgReset').addEventListener('click', () => {
      layer.innerHTML = ''; pts = 0; placed = 0; celebrated = false; lvlEl.textContent = '1';
      msg.textContent = 'Drop 5 stickers to level up.'; $('#pgSmile').setAttribute('d', 'M23 36q7 6 14 0');
      cells.forEach((el, i) => { h[i] = base[i]; const c = heatColor(base[i]); RM ? (el.style.background = c) : gsap.to(el, { background: c, duration: .5 }); });
      updateHud();
    });
    updateHud();
  })();

  /* ---------- 3. SCROLL-SCRUBBED CURRENT -> AFTER ---------- */
  (function blend() {
    const COLS = 24, ROWS = 10;
    const A = $('#bmA'), B = $('#bmB');
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const v = field(c, r, COLS, ROWS);
      const a = document.createElement('i'); a.style.background = heatColor(v); A.appendChild(a);
      // illustrative "after" look: same shape, much cooler
      const b = document.createElement('i'); b.style.background = heatColor(v * 0.28 + Math.sin(c + r) * 0.02); B.appendChild(b);
    }
    const lblA = $('#lblA'), lblB = $('#lblB'), thumb = $('#bsThumb'), sfill = $('#bsFill'), range = $('#blendRange');
    const s1 = $('#bmS1'), s2 = $('#bmS2'), s3 = $('#bmS3');
    const I = gsap.utils.interpolate;
    function set(p) {
      B.style.opacity = p;
      thumb.style.left = (p * 100) + '%'; sfill.style.width = (p * 100) + '%';
      lblA.classList.toggle('on', p < .5); lblB.classList.toggle('on', p >= .5);
      s1.setAttribute('stop-color', I('#d8523e', '#1b7f70', p));
      s2.setAttribute('stop-color', I('#ee9b45', '#70a28e', p));
      s3.setAttribute('stop-color', I('#f2d477', '#b8d9c5', p));
      range.value = Math.round(p * 100);
    }
    set(0);
    range.addEventListener('input', () => set(range.value / 100));
    if (RM) return;
    ScrollTrigger.create({
      trigger: '#blendSec', start: 'top top', end: '+=150%', pin: true, scrub: .6,
      onUpdate: self => set(self.progress)
    });
  })();

  /* ---------- 4. FEATURE STICKER LOOPS ---------- */
  (function features() {
    function loop(card, build) {
      const el = $(card); if (!el) return;
      const tl = build(el); tl.pause();
      if (RM) { tl.progress(.8); return; }
      ScrollTrigger.create({ trigger: el, start: 'top 90%', end: 'bottom 10%', onToggle: s => s.isActive ? tl.play() : tl.pause() });
    }
    // tour spotlight
    loop('#sTour', () => {
      const hole = '#tHole', T = [[20, 20, 100, 100], [120, 20, 180, 44], [120, 66, 180, 56], [20, 124, 280, 72]];
      const tl = gsap.timeline({ repeat: -1, repeatDelay: .5 });
      T.forEach(([x, y, w, hh]) => tl.to(hole, { attr: { x, y, width: w, height: hh }, duration: .7, ease: 'back.out(1.5)' }).to({}, { duration: .9 }));
      return tl;
    });
    // assistant typing dots
    loop('#sChat', root => {
      const dots = $$('.c-dots circle', root), lines = $$('.c-lines rect', root);
      gsap.set(lines, { scaleX: 0, transformOrigin: '0% 50%' });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: .6 });
      tl.set(lines, { scaleX: 0 }).set('.c-dots', { opacity: 1 }, 0)
        .from('.c-user', { x: 40, opacity: 0, duration: .5, ease: 'back.out(1.7)' }, 0)
        .to(dots, { y: -8, duration: .3, yoyo: true, repeat: 5, stagger: .12, ease: 'sine.inOut' }, .5)
        .to('.c-dots', { opacity: 0, duration: .2 }, 2.1)
        .to(lines, { scaleX: 1, duration: .5, ease: 'back.out(1.4)', stagger: .15 }, 2.15)
        .to({}, { duration: 1.2 });
      return tl;
    });
    // co-benefit meters
    loop('#sBen', root => {
      const tiles = $$('.tile', root), rings = $$('.ring', root);
      const tl = gsap.timeline({ repeat: -1, repeatDelay: .8 });
      tl.set(rings, { attr: { 'stroke-dashoffset': 113.1 } })
        .from(tiles, { scale: .85, transformOrigin: '50% 50%', duration: .5, ease: 'back.out(2)', stagger: .12 })
        .to(rings, { attr: { 'stroke-dashoffset': i => 113.1 * (0.15 + .12 * (i % 3)) }, duration: 1.1, ease: 'power3.out', stagger: .15 }, .3)
        .to(tiles, { y: -4, duration: .25, yoyo: true, repeat: 1, stagger: .08 }, 1.8)
        .to({}, { duration: 1.2 });
      return tl;
    });
    // action plan ticks itself
    loop('#sPlan', root => {
      const ticks = $$('.tick', root), strikes = $$('.strike', root);
      const tl = gsap.timeline({ repeat: -1, repeatDelay: .6 });
      tl.set(ticks, { attr: { 'stroke-dashoffset': 30 } }).set(strikes, { scaleX: 0 });
      ticks.forEach((t, i) => {
        tl.to(t, { attr: { 'stroke-dashoffset': 0 }, duration: .35, ease: 'back.out(2)' }, 'k' + i)
          .to(strikes[i], { scaleX: 1, duration: .35, ease: 'power2.out' }, '<')
          .to(t.previousElementSibling, { scale: 1.2, transformOrigin: '50% 50%', duration: .15, yoyo: true, repeat: 1 }, '<')
          .to({}, { duration: .5 });
      });
      tl.to({}, { duration: 1.2 });
      return tl;
    });
  })();

  /* ---------- 5. PINNED FREEZE WITH ICE-SHARD WIPE ---------- */
  (function freeze() {
    if (RM) return;
    const ice = $('#fzIce'), N = 12;
    // fixed jag offsets so the shards look hand-cut, not random each frame
    const jag = Array.from({ length: N + 1 }, (_, i) => (i % 2 ? 1 : -1) * (4 + ((i * 7) % 5)));
    function wipe(p) {
      const edge = -12 + p * 124; // at p=1 every point is past 100%
      const pts = ['0% 0%'];
      for (let i = 0; i <= N; i++) pts.push(`${(edge + jag[i]).toFixed(1)}% ${(i / N * 100).toFixed(1)}%`);
      pts.push('0% 100%');
      ice.style.clipPath = `polygon(${pts.join(',')})`;
    }
    wipe(0);
    let last = 0;
    ScrollTrigger.create({
      trigger: '#freeze', start: 'top top', end: '+=110%', pin: true, scrub: .5,
      onUpdate: self => {
        wipe(self.progress);
        // crystal sparkle as the shards sweep through
        if (Math.abs(self.progress - last) > .18 && self.progress < .95) {
          last = self.progress;
          burst(innerWidth * clamp(self.progress, .05, .95), rand(innerHeight * .2, innerHeight * .8), 5);
        }
      }
    });
  })();

  ScrollTrigger.create({
    trigger: '.nextp',
    start: 'bottom 98%',
    once: true,
    onEnter: () => window.location.assign('index.html#work')
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
