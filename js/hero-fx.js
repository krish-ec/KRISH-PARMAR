/* Hero FX: drop-in layer for the first screen. No libraries.
   1) Flat, cute stickers rain down and pile up with simple 2D physics.
      Cursor shoves them, click-and-drag to grab and throw, scrolling bumps them.
   2) Title letters lean, swell and spring toward the cursor (individual CSS
      properties, so they never clash with your GSAP transforms). */
(() => {
  /* ---- tweak here ---- */
  const HERO_SELECTOR = 'header.nt-hero';
  const TITLE_SELECTOR = '#ntTitle';
  const START_DELAY = 2400;      // ms after window load (let your loader finish)
  const COUNT = innerWidth < 700 ? 11 : 18;
  const GRAVITY = 0.55;
  /* -------------------- */

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector(HERO_SELECTOR);
  if (!hero) return;

  const C = { blue: '#1b7f70', lav: '#b8d9c5', peach: '#f2d477', ink: '#18332a', pale: '#f3f1e5', pink: '#e17b67' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  /* canvas + stacking */
  if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
  const cv = document.createElement('canvas');
  cv.className = 'hero-fx'; cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild);
  const ctx = cv.getContext('2d');
  // lift existing hero content above the stickers without changing its layout
  [...hero.children].forEach(el => {
    if (el === cv || el.tagName === 'CANVAS') return;
    const cs = getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    if (cs.zIndex === 'auto') el.style.zIndex = '2';
  });

  let W = 0, H = 0, dpr = 1;
  function resize() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bodies.forEach(b => { b.x = clamp(b.x, b.cr, W - b.cr); b.y = Math.min(b.y, H - b.cr); });
    if (RM) { settle(); draw(0); }
  }

  /* bodies */
  const TYPES = ['face', 'star', 'spark', 'face', 'heart', 'bolt', 'pill', 'face', 'star', 'spark', 'heart', 'pill', 'face', 'bolt', 'star', 'spark', 'heart', 'face'];
  const COLS = { face: [C.peach, C.lav, C.pale], star: [C.blue], spark: [C.peach, C.pale], heart: [C.pink], bolt: [C.lav], pill: [C.blue, C.peach] };
  const bodies = [];
  function makeBody(i, y) {
    const type = TYPES[i % TYPES.length];
    const s = clamp(W / 1400, .65, 1.2);
    const r = rand(28, 46) * s;
    const cols = COLS[type];
    return {
      type, r, cr: r * (type === 'pill' ? .8 : .88), col: cols[(Math.random() * cols.length) | 0],
      x: rand(r, Math.max(r + 1, W - r)), y, vx: rand(-1.5, 1.5), vy: rand(0, 3),
      rot: rand(-1, 1), vr: rand(-.05, .05), seed: Math.random() * 6
    };
  }

  /* shapes */
  function path(b) {
    const r = b.r; ctx.beginPath();
    switch (b.type) {
      case 'face': ctx.arc(0, 0, r * .9, 0, 6.2832); break;
      case 'star': poly(5, r, r * .46, -Math.PI / 2); break;
      case 'spark': poly(4, r * 1.05, r * .3, -Math.PI / 2); break;
      case 'heart':
        ctx.moveTo(0, r * .8);
        ctx.bezierCurveTo(-r * 1.35, r * .1, -r * .95, -r * .95, 0, -r * .35);
        ctx.bezierCurveTo(r * .95, -r * .95, r * 1.35, r * .1, 0, r * .8); break;
      case 'bolt':
        ctx.moveTo(r * .25, -r); ctx.lineTo(-r * .65, r * .15); ctx.lineTo(-r * .05, r * .15);
        ctx.lineTo(-r * .3, r); ctx.lineTo(r * .7, -r * .22); ctx.lineTo(r * .05, -r * .22); ctx.closePath(); break;
      case 'pill': {
        const w = r * .95, h = r * .5;
        ctx.moveTo(-w + h, -h); ctx.arc(w - h, 0, h, -Math.PI / 2, Math.PI / 2);
        ctx.arc(-w + h, 0, h, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); break;
      }
    }
  }
  function poly(n, ro, ri, a0) {
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? ri : ro, a = a0 + i * Math.PI / n;
      i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function face(b, t) {
    const r = b.r, ph = (t * .001 + b.seed) % 4, bl = ph < .13 ? .1 : 1;
    ctx.fillStyle = C.ink;
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(s * r * .3, -r * .1, r * .08, r * .15 * bl, 0, 0, 6.2832); ctx.fill(); });
    ctx.fillStyle = 'rgba(225,123,103,.55)';
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * r * .5, r * .14, r * .1, 0, 6.2832); ctx.fill(); });
    ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(2.5, r * .08); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, r * .12, r * .2, .2, Math.PI - .2); ctx.stroke();
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const b of bodies) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      // hard offset shadow, kept in screen space
      ctx.save(); ctx.rotate(-b.rot); ctx.translate(b.r * .14, b.r * .16); ctx.rotate(b.rot);
      ctx.fillStyle = C.ink; path(b); ctx.fill(); ctx.restore();
      ctx.fillStyle = b.col; ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(3, b.r * .1); ctx.lineJoin = 'round';
      path(b); ctx.fill(); ctx.stroke();
      if (b.type === 'face') face(b, t);
      ctx.restore();
    }
  }

  /* pointer */
  let px = -999, py = -999, pvx = 0, pvy = 0, pAct = false, held = null, clientX = -999, clientY = -999, grabbedOnce = false;
  function pos(e) { const r = hero.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r]; }
  function pick(x, y) {
    let best = null, bd = 1e9;
    bodies.forEach(b => { const d = Math.hypot(b.x - x, b.y - y); if (d < b.cr * 1.1 && d < bd) { best = b; bd = d; } });
    return best;
  }

  /* physics */
  function step() {
    for (const b of bodies) {
      if (b === held) continue;
      b.vy += GRAVITY * 0.25;
      b.x += b.vx; b.y += b.vy; b.vx *= .998; b.vy *= .998; b.rot += b.vr; b.vr *= .985;
      b.vx = clamp(b.vx, -40, 40); b.vy = clamp(b.vy, -40, 40);
    }
    if (held) {
      const nx = held.x + (px - held.x) * .4, ny = held.y + (py - held.y) * .4;
      held.vx = nx - held.x; held.vy = ny - held.y; held.x = nx; held.y = ny; held.rot += held.vx * .02;
    }
    for (let it = 0; it < 2; it++) {
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j], dx = b.x - a.x, dy = b.y - a.y, min = a.cr + b.cr;
        if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
        const d = Math.hypot(dx, dy);
        if (d >= min || d < .001) continue;
        const nx = dx / d, ny = dy / d, ov = min - d;
        const ma = a === held ? 1e6 : a.cr * a.cr, mb = b === held ? 1e6 : b.cr * b.cr, tot = ma + mb;
        a.x -= nx * ov * mb / tot; a.y -= ny * ov * mb / tot; b.x += nx * ov * ma / tot; b.y += ny * ov * ma / tot;
        const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rel < 0) {
          const imp = -(1.4) * rel / (1 / ma + 1 / mb);
          if (a !== held) { a.vx -= imp * nx / ma; a.vy -= imp * ny / ma; a.vr -= imp * .0000008 * ma; }
          if (b !== held) { b.vx += imp * nx / mb; b.vy += imp * ny / mb; b.vr += imp * .0000008 * mb; }
        }
      }
      for (const b of bodies) {
        if (b.x < b.cr) { b.x = b.cr; b.vx = Math.abs(b.vx) * .5; }
        if (b.x > W - b.cr) { b.x = W - b.cr; b.vx = -Math.abs(b.vx) * .5; }
        if (b.y > H - b.cr) {
          b.y = H - b.cr; if (b.vy > 0) b.vy = -b.vy * .4; if (Math.abs(b.vy) < .7) b.vy = 0;
          b.vx *= .97; b.vr = b.vr * .9 + (b.vx / b.cr) * .1;
        }
      }
    }
    if (pAct && !held) {
      for (const b of bodies) {
        const dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy) || 1, R = b.cr + 36;
        if (d < R) {
          const f = 1 - d / R;
          b.vx += (dx / d) * f * 1.1 + pvx * .06 * f; b.vy += (dy / d) * f * 1.1 + pvy * .06 * f; b.vr += pvx * .002 * f;
        }
      }
    }
    pvx *= .8; pvy *= .8;
  }
  function settle() { for (let i = 0; i < 500; i++) step(); }

  /* kinetic title letters */
  let letters = [];
  function splitTitle() {
    const title = document.querySelector(TITLE_SELECTOR);
    if (!title) return;
    if (!title.getAttribute('aria-label')) title.setAttribute('aria-label', title.textContent.trim().replace(/\s+/g, ' '));
    const lines = title.querySelectorAll('.ln');
    (lines.length ? [...lines] : [title]).forEach(ln => {
      if (!ln.children.length) {
        const txt = ln.textContent; ln.textContent = '';
        [...txt].forEach(ch => { const s = document.createElement('span'); s.className = 'hfx-l'; s.textContent = ch; s.setAttribute('aria-hidden', 'true'); ln.appendChild(s); });
        ln.querySelectorAll('.hfx-l').forEach(el => letters.push(mk(el)));
      } else {
        [...ln.querySelectorAll('*')].filter(el => !el.children.length && el.textContent.trim()).forEach(el => { el.classList.add('hfx-l'); letters.push(mk(el)); });
      }
    });
  }
  const mk = el => ({ el, s: 1, vs: 0, r: 0, vr: 0, y: 0, vy: 0 });
  function letterStep() {
    if (!letters.length) return;
    letters.forEach(L => {
      const r = L.el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(clientX - cx, clientY - cy), R = 220, f = pAct ? clamp(1 - d / R, 0, 1) : 0;
      const ts = 1 + .12 * f, tr = clamp((clientX - cx) / R, -1, 1) * 7 * f, ty = -7 * f;
      L.vs += (ts - L.s) * .18; L.vs *= .72; L.s += L.vs;
      L.vr += (tr - L.r) * .18; L.vr *= .72; L.r += L.vr;
      L.vy += (ty - L.y) * .18; L.vy *= .72; L.y += L.vy;
      L.el.style.scale = L.s.toFixed(3);
      L.el.style.rotate = L.r.toFixed(2) + 'deg';
      L.el.style.translate = '0 ' + L.y.toFixed(2) + 'px';
    });
  }

  /* loop */
  let running = false, visible = true, last = 0, acc = 0, started = false;
  function frame(t) {
    if (!running) return;
    if (!visible || document.hidden) { running = false; return; }
    acc += Math.min(50, t - last); last = t;
    while (acc >= 16.67) { step(); acc -= 16.67; }
    draw(t); letterStep();
    requestAnimationFrame(frame);
  }
  function run() { if (running || RM || !started) return; running = true; last = performance.now(); requestAnimationFrame(frame); }

  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) run(); }).observe(hero);
  document.addEventListener('visibilitychange', run);
  new ResizeObserver(resize).observe(hero);

  /* hint pill */
  const hint = document.createElement('div');
  hint.className = 'hero-fx-hint'; hint.textContent = 'Go on, throw one ✦';
  hint.setAttribute('aria-hidden', 'true'); hero.appendChild(hint);

  function start() {
    started = true; resize();
    if (RM) {
      for (let i = 0; i < COUNT; i++) bodies.push(makeBody(i, H * .3));
      settle(); draw(0); return;
    }
    splitTitle();
    for (let i = 0; i < COUNT; i++) setTimeout(() => { bodies.push(makeBody(i, -60)); }, i * 110);
    setTimeout(() => hint.classList.add('on'), COUNT * 110 + 600);
    run();
  }

  if (!RM) {
    window.addEventListener('pointermove', e => {
      const [x, y] = pos(e); clientX = e.clientX; clientY = e.clientY;
      pvx += x - px; pvy += y - py; px = x; py = y;
      const r = hero.getBoundingClientRect();
      pAct = e.clientY >= r.top && e.clientY <= r.bottom;
      if (!held && pAct) hero.style.cursor = pick(x, y) ? 'grab' : '';
    }, { passive: true });
    window.addEventListener('pointerdown', e => {
      const [x, y] = pos(e);
      if (e.target.closest('a,button,input,form,.name-gate')) return;
      const b = pick(x, y); if (!b) return;
      held = b; px = x; py = y; hero.style.cursor = 'grabbing'; e.preventDefault();
      if (!grabbedOnce) { grabbedOnce = true; hint.classList.remove('on'); }
    });
    const drop = () => { if (held) { held = null; hero.style.cursor = ''; } };
    window.addEventListener('pointerup', drop); window.addEventListener('pointercancel', drop);
    // scrolling gives the pile a little kick
    let lastY = scrollY;
    window.addEventListener('scroll', () => {
      const dy = scrollY - lastY; lastY = scrollY;
      if (!visible) return;
      const k = clamp(-dy * .05, -3, 3);
      bodies.forEach(b => { if (b !== held) { b.vy += k * rand(.5, 1.2); b.vr += rand(-.02, .02) * Math.abs(k); } });
    }, { passive: true });
  }

  if (document.readyState === 'complete') setTimeout(start, START_DELAY);
  else window.addEventListener('load', () => setTimeout(start, START_DELAY));
})();
