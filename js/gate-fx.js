/* Name-gate FX: first impression. No libraries.
   Mascot peeks over the card, eyes follow the cursor, hands wave on submit;
   big scrolling greetings, floating stickers with parallax, sparkle trail,
   letter-by-letter title, confetti when the name is saved.
   It only decorates: your own gate logic (show/hide/save name) is untouched. */
(() => {
  const gate = document.getElementById('nameGate');
  if (!gate) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INK = '#0b0c3a', PALE = '#f3f1ff', BLUE = '#2a2cff', LAV = '#b9a8ff', PEACH = '#ffb59e', PINK = '#ff5d8f';
  const COLORS = [BLUE, LAV, PEACH, PINK];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const card = gate.querySelector('.name-card');
  const form = gate.querySelector('form') || card;
  const input = gate.querySelector('input');
  const title = gate.querySelector('#nameTitle');
  if (!card) return;
  if (getComputedStyle(gate).position === 'static') gate.style.position = 'relative';

  const st = (f, s, w = 5) => `style="fill:${f};stroke:${s || 'none'};stroke-width:${s ? w : 0};stroke-linejoin:round;stroke-linecap:round"`;
  const pts = (n, ro, ri, a0) => Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? ri : ro, a = (a0 + i * 180 / n) * Math.PI / 180;
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

  /* ---------- build layers once ---------- */
  const bg = document.createElement('div'); bg.className = 'gfx-bg'; bg.setAttribute('aria-hidden', 'true');
  const word = ['Hello', 'Namaste', 'Kem cho', 'Hola', 'Bonjour', 'Ciao'];
  const rowHTML = (off) => {
    const w = word.slice(off).concat(word.slice(0, off)).map(x => `<span>${x} ✦</span>`).join('');
    return `<div class="gfx-row">${w}${w}</div>`;
  };
  bg.innerHTML = `<div class="gfx-rows">${rowHTML(0)}${rowHTML(2)}${rowHTML(4)}</div>`;

  const SHAPES = [
    `<polygon points="${pts(5, 44, 20, -90)}" ${st(BLUE, INK)}/>`,
    `<polygon points="${pts(4, 46, 13, -90)}" ${st(PEACH, INK)}/>`,
    `<path d="M50 88C8 58 8 26 30 20c12-3 20 3 20 13 0-10 8-16 20-13 22 6 22 38-20 68z" ${st(PINK, INK)}/>`,
    `<polygon points="58,6 20,56 46,56 38,94 80,40 54,40" ${st(LAV, INK)}/>`,
    `<circle cx="50" cy="50" r="40" ${st(PEACH, INK)}/><ellipse cx="38" cy="46" rx="4" ry="7" style="fill:${INK}"/><ellipse cx="62" cy="46" rx="4" ry="7" style="fill:${INK}"/><path d="M38 62q12 12 24 0" style="fill:none;stroke:${INK};stroke-width:5;stroke-linecap:round"/>`,
    `<circle cx="50" cy="50" r="34" style="fill:none;stroke:${BLUE};stroke-width:12"/><circle cx="50" cy="50" r="40" style="fill:none;stroke:${INK};stroke-width:4"/>`
  ];
  const floaters = [];
  const FN = innerWidth < 700 ? 8 : 14;
  for (let i = 0; i < FN; i++) {
    const f = document.createElement('div'); f.className = 'gfx-f';
    const s = rand(38, 84), d = rand(.3, 1);
    f.style.cssText = `left:${rand(2, 92)}%;top:${rand(4, 88)}%;width:${s}px;height:${s}px;--n:${i};--dur:${rand(4, 7).toFixed(1)}s;--del:-${rand(0, 5).toFixed(1)}s`;
    f.innerHTML = `<i><svg viewBox="0 0 100 100">${SHAPES[i % SHAPES.length]}</svg></i>`;
    bg.appendChild(f); floaters.push({ el: f, d, x: 0, y: 0 });
  }
  gate.insertBefore(bg, gate.firstChild);

  const eyeG = (cx) => `<g class="gfx-eye" style="animation-delay:-${rand(0, 3).toFixed(1)}s"><ellipse cx="${cx}" cy="64" rx="12" ry="15" style="fill:#fff;stroke:${INK};stroke-width:3.5"/><circle class="gfx-pupil" cx="${cx}" cy="66" r="6" style="fill:${INK}"/></g>`;
  const mascot = document.createElement('div'); mascot.className = 'gfx-mascot'; mascot.setAttribute('aria-hidden', 'true');
  mascot.innerHTML = `<svg viewBox="0 0 170 130"><g class="gfx-bob" id="gfxBody">
    <circle cx="93" cy="86" r="50" style="fill:${INK}"/>
    <circle cx="85" cy="78" r="50" style="fill:${PEACH};stroke:${INK};stroke-width:5"/>
    ${eyeG(65)}${eyeG(105)}
    <circle cx="48" cy="86" r="7" style="fill:${PINK};opacity:.55"/><circle cx="122" cy="86" r="7" style="fill:${PINK};opacity:.55"/>
    <path id="gfxMouth" d="M71 94q14 11 28 0" style="fill:none;stroke:${INK};stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round"/>
  </g></svg>`;
  const hands = document.createElement('div'); hands.className = 'gfx-hands'; hands.setAttribute('aria-hidden', 'true');
  hands.innerHTML = `<svg viewBox="0 0 170 32"><ellipse class="gfx-hand" id="gfxHandL" cx="48" cy="20" rx="17" ry="12" ${st(PEACH, INK, 4)}/><ellipse class="gfx-hand" id="gfxHandR" cx="122" cy="20" rx="17" ry="12" ${st(PEACH, INK, 4)}/></svg>`;
  gate.append(mascot, hands);
  const pupils = [...mascot.querySelectorAll('.gfx-pupil')], mouth = mascot.querySelector('#gfxMouth');
  const handL = hands.querySelector('#gfxHandL');

  // split the title into letters (only if it is plain text)
  if (title && !title.children.length && !title.dataset.gfx) {
    title.dataset.gfx = '1';
    if (!title.getAttribute('aria-label')) title.setAttribute('aria-label', title.textContent.trim());
    const txt = title.textContent; title.textContent = '';
    [...txt].forEach((ch, i) => {
      if (ch === ' ') { title.appendChild(document.createTextNode(' ')); return; }
      const s = document.createElement('span'); s.className = 'gl'; s.textContent = ch; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true'); title.appendChild(s);
    });
  }
  [...card.children].forEach((c, k) => c.style.setProperty('--k', k));
  if (form !== card) [...form.children].forEach((c, k) => c.style.setProperty('--k', k));

  /* ---------- helpers ---------- */
  const MOUTH = {
    smile: ['M71 94q14 11 28 0', 'none'],
    open: ['M70 92q15 20 30 0z', INK],
    wow: ['M79 95a6 8 0 1 0 12 0a6 8 0 1 0-12 0z', INK]
  };
  let mouthTimer = 0;
  function setMouth(k, ms) {
    mouth.setAttribute('d', MOUTH[k][0]); mouth.style.fill = MOUTH[k][1];
    clearTimeout(mouthTimer);
    if (ms) mouthTimer = setTimeout(() => setMouth(document.activeElement === input ? 'wow' : 'smile'), ms);
  }
  const STAR = c => `<svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z" style="fill:${c};stroke:${INK};stroke-width:1.4;stroke-linejoin:round"/></svg>`;
  function spark(x, y, size = 16, far = 36) {
    if (RM) return;
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;z-index:100000;pointer-events:none`;
    el.innerHTML = STAR(COLORS[(Math.random() * 4) | 0]); document.body.appendChild(el);
    const a = rand(0, 6.28), d = rand(far * .4, far);
    el.animate([
      { transform: 'translate(0,0) scale(0) rotate(0)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(1) rotate(${rand(-90, 90)}deg)`, opacity: 1, offset: .5 },
      { transform: `translate(${Math.cos(a) * d * 1.3}px,${Math.sin(a) * d * 1.3 + 14}px) scale(0) rotate(160deg)`, opacity: 0 }
    ], { duration: 700, easing: 'cubic-bezier(.34,1.56,.64,1)' }).onfinish = () => el.remove();
  }
  function confetti() {
    if (RM) return;
    const r = card.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 56; i++) {
      const el = document.createElement('div'), s = rand(9, 20), kind = i % 3;
      el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${s}px;height:${kind === 1 ? s * .5 : s}px;z-index:100001;pointer-events:none;background:${kind === 2 ? 'transparent' : COLORS[i % 4]};border:3px solid ${INK};border-radius:${kind === 0 ? '50%' : '4px'}`;
      if (kind === 2) { el.style.border = 'none'; el.innerHTML = STAR(COLORS[i % 4]); el.style.width = el.style.height = (s + 6) + 'px'; }
      document.body.appendChild(el);
      const vx = rand(-420, 420), up = rand(180, 520), fall = innerHeight + 140, dur = rand(1300, 2200), rot = rand(-720, 720);
      el.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${vx * .55}px,${-up}px) rotate(${rot * .4}deg)`, opacity: 1, offset: .35, easing: 'cubic-bezier(.4,0,1,1)' },
        { transform: `translate(${vx}px,${fall - cy}px) rotate(${rot}deg)`, opacity: 1 }
      ], { duration: dur, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => el.remove();
    }
  }

  /* ---------- pointer + loop ---------- */
  let px = innerWidth / 2, py = innerHeight / 2, havePtr = false, lastTrail = 0, open = false, raf = 0;
  const look = { x: 0, y: 0 };
  gate.addEventListener('pointermove', e => {
    px = e.clientX; py = e.clientY; havePtr = true;
    const t = performance.now();
    if (!RM && t - lastTrail > 45) { lastTrail = t; spark(px, py, rand(9, 15), 22); }
  }, { passive: true });
  gate.addEventListener('pointerdown', e => {
    if (RM) return;
    for (let i = 0; i < 8; i++) spark(e.clientX, e.clientY, rand(12, 20), 60);
  });

  function frame() {
    if (!open) { raf = 0; return; }
    const gr = gate.getBoundingClientRect(), cr = card.getBoundingClientRect();
    // mascot sits behind the card's top edge, hands on it
    const mx = cr.left - gr.left + cr.width / 2 - 85, my = cr.top - gr.top + 22 - 130;
    mascot.style.transform = `translate(${mx}px,${my}px)`;
    hands.style.transform = `translate(${mx}px,${cr.top - gr.top - 12}px)`;
    // eyes track the pointer, or the input while it is focused
    let tx = px, ty = py;
    if (document.activeElement === input) { const ir = input.getBoundingClientRect(); tx = ir.left + ir.width * .5; ty = ir.top + ir.height * .5; }
    else if (!havePtr) { tx = cr.left + cr.width / 2; ty = cr.top + cr.height; }
    const mc = { x: gr.left + mx + 85, y: gr.top + my + 66 };
    const dx = tx - mc.x, dy = ty - mc.y, dist = Math.hypot(dx, dy) || 1, k = Math.min(1, dist / 240) * 5.5;
    look.x += (dx / dist * k - look.x) * .18; look.y += (dy / dist * k - look.y) * .18;
    pupils.forEach(p => { p.style.transform = `translate(${look.x.toFixed(2)}px,${look.y.toFixed(2)}px)`; });
    // floater parallax
    const nx = (px / innerWidth - .5), ny = (py / innerHeight - .5);
    floaters.forEach(f => {
      f.x += (-nx * f.d * 70 - f.x) * .07; f.y += (-ny * f.d * 70 - f.y) * .07;
      f.el.style.translate = `${f.x.toFixed(1)}px ${f.y.toFixed(1)}px`;
    });
    raf = requestAnimationFrame(frame);
  }

  /* ---------- reactions ---------- */
  if (input) {
    input.addEventListener('focus', () => setMouth('wow'));
    input.addEventListener('blur', () => setMouth('smile'));
    input.addEventListener('input', () => {
      setMouth('open', 650);
      mascot.animate([{ scale: '1' }, { scale: '1.06 .94' }, { scale: '1' }], { duration: 260, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      const ir = input.getBoundingClientRect();
      spark(ir.left + rand(12, Math.min(ir.width - 12, 40 + input.value.length * 12)), ir.top + ir.height / 2, rand(11, 18), 34);
    });
  }
  form.addEventListener('submit', () => {
    setMouth('open', 1400); handL.classList.remove('wave'); void handL.getBoundingClientRect(); handL.classList.add('wave');
    confetti();
    if (!RM) mascot.animate([{ translate: '0 0' }, { translate: '0 -30px' }, { translate: '0 0' }], { duration: 620, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  });

  /* ---------- open / close detection (does not touch your logic) ---------- */
  const isOpen = () => {
    const cs = getComputedStyle(gate);
    return gate.getAttribute('aria-hidden') !== 'true' && cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > .05;
  };
  function check() {
    const o = isOpen();
    if (o && !open) {
      open = true; havePtr = false; setMouth('smile');
      gate.classList.remove('gfx-in'); void gate.offsetWidth; gate.classList.add('gfx-in');
      if (!raf) raf = requestAnimationFrame(frame);
    } else if (!o && open) { open = false; gate.classList.remove('gfx-in'); }
  }
  new MutationObserver(check).observe(gate, { attributes: true, attributeFilter: ['class', 'style', 'aria-hidden'] });
  new MutationObserver(check).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
  setInterval(check, 300);
  check();
})();
