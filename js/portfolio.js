/* ==========================================================
   EDIT YOUR LINKS HERE
   - Empty project links are shown as disabled, never as dead links.
   - Empty repo links fall back to your GitHub profile.
   ========================================================== */
const CONFIG = {
  email:    'krishparmar.dev@gmail.com',
  github:   'https://github.com/krish-parmar',
  linkedin: 'https://linkedin.com/in/krish-parmar',
  resume:   'Krish_Parmar_Resume.pdf',   // place this PDF next to this file
  repos: { pravaha:'', studynest:'', clesta:'', kiddovax:'' },
  demos: { pravaha:'', studynest:'', clesta:'', kiddovax:'' }
};

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

/* links */
$$('[data-link]').forEach(a => {
  const [type, key] = a.dataset.link.split(':');
  const url = type === 'email' ? 'mailto:' + CONFIG.email
            : type === 'repo'  ? (CONFIG.repos[key] || CONFIG.github)
            : type === 'demo'  ? CONFIG.demos[key]
            : CONFIG[type];
  if (url) {
    a.href = url;
    if (/^https?:/.test(url) || a.hasAttribute('data-view')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    if (type === 'resume' && !a.hasAttribute('download')) a.removeAttribute('download');
  } else { a.removeAttribute('href'); a.classList.add('is-disabled'); a.setAttribute('aria-disabled','true'); a.title = 'Coming soon'; }
});
$('#email-text').textContent = CONFIG.email;
$('#year').textContent = new Date().getFullYear();

/* theme */
$('#theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#06050f' : '#f4f1ff';
});

/* mobile menu */
const drawer = $('#drawer'), menuBtn = $('#menu-btn');
const setMenu = o => { drawer.classList.toggle('open', o); menuBtn.setAttribute('aria-expanded', o); };
menuBtn.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
$$('#drawer a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

/* scroll: progress, header border, back-to-top */
const bar = $('#progress'), header = $('#header'), topBtn = $('#top');
let tick = false;
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header.classList.toggle('scrolled', scrollY > 8);
  topBtn.classList.toggle('show', scrollY > 600);
  tick = false;
};
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

/* active nav */
const navLinks = $$('#links a');
const navIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => navIO.observe(s));

/* reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
$$('.rv').forEach(el => io.observe(el));

/* subtle spotlight on project cards */
if (matchMedia('(hover: hover)').matches) {
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
}

/* contact: opens a pre-filled email (no fake "sent" state) */
const toast = $('#toast');
const say = m => { toast.textContent = m; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 7000); };
$('#contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const subject = v('subject') || `Portfolio inquiry from ${v('name')}`;
  const body = `${v('message')}\n\n— ${v('name')}\n${v('email')}`;
  location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  say('Opening your email app. No mail app? Use “Copy email” and write to me directly.');
});
$('#copy-email').addEventListener('click', async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText(CONFIG.email); b.textContent = 'Copied ✓'; } catch { b.textContent = CONFIG.email; }
  setTimeout(() => b.textContent = 'Copy email', 2200);
});

/* ================= ENHANCEMENTS ================= */
(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* headline word-by-word reveal */
  const split = el => {
    let i = 0; const out = [];
    const wrap = node => { const w = document.createElement('span'), s = document.createElement('span'); w.className = 'word'; s.style.setProperty('--i', i++); s.append(node); w.append(s); return w; };
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => { if (t) out.push(/^\s+$/.test(t) ? document.createTextNode(' ') : wrap(document.createTextNode(t))); });
      else out.push(wrap(n));
    });
    el.textContent = ''; out.forEach(x => el.append(x));
  };
  $$('h1, h2').forEach(split);
  const h1 = $('h1'); h1.classList.add('ready');
  const go = () => setTimeout(() => h1.classList.add('go'), 60);
  Promise.race([document.fonts ? document.fonts.ready : 0, new Promise(r => setTimeout(r, 1500))]).then(go);

  /* typed "currently into" line */
  const rot = $('#rot'), words = ['distributed systems', 'WebGL storytelling', 'multi-role platforms', 'accessible interfaces'];
  if (rot) {
    if (reduce) rot.textContent = words[0];
    else { let w = 0, c = 0, del = false;
      (function type() {
        const word = words[w]; rot.textContent = word.slice(0, c); let d = del ? 35 : 75;
        if (!del && c === word.length) { del = true; d = 1700; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; d = 350; }
        else c += del ? -1 : 1;
        setTimeout(type, d);
      })(); }
  }

  /* marquee: duplicate for a seamless loop */
  const track = $('.track');
  if (track) { const copy = track.cloneNode(true); [...copy.children].forEach(s => s.setAttribute('aria-hidden', 'true')); track.append(...copy.children); }

  /* hero: interactive node network */
  const hero = $('#home');
  if (hero) {
    const cv = document.createElement('canvas'); cv.className = 'net'; cv.setAttribute('aria-hidden', 'true'); hero.prepend(cv);
    const cx = cv.getContext('2d'); let W, H, pts = [], m = { x: -999, y: -999 }, live = false, raf = 0;
    const col = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    let c = col();
    $('#theme').addEventListener('click', () => setTimeout(() => { c = col(); if (!live) draw(); }, 50));
    const size = () => {
      const r = hero.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: Math.round(Math.min(72, W * H / 15000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.3 + .8 }));
    };
    const draw = () => {
      cx.clearRect(0, 0, W, H); cx.strokeStyle = c; cx.fillStyle = c;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) { cx.globalAlpha = (1 - d / 130) * .3; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); }
        }
        const md = Math.hypot(p.x - m.x, p.y - m.y);
        if (md < 170) { cx.globalAlpha = (1 - md / 170) * .65; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(m.x, m.y); cx.stroke(); }
        cx.globalAlpha = .75; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      }
      cx.globalAlpha = 1;
    };
    const step = () => {
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy);
        if (d > 70 && d < 200) { p.x += dx / d * .3; p.y += dy / d * .3; }
      }
      draw(); raf = requestAnimationFrame(step);
    };
    const start = () => { if (!live && !reduce) { live = true; raf = requestAnimationFrame(step); } };
    const stop = () => { live = false; cancelAnimationFrame(raf); };
    size(); draw();
    addEventListener('resize', () => { size(); if (!live) draw(); });
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { m.x = m.y = -999; });
    new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(hero);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }

  /* nebula stars */
  const neb = $('.nebula');
  if (neb) {
    const layers = [...neb.querySelectorAll('b')];
    const stars = () => {
      const r = neb.getBoundingClientRect(), n = Math.round(Math.min(110, r.width * r.height / 9000));
      layers.forEach(b => b.style.boxShadow = Array.from({ length: n }, () => `${Math.random() * r.width | 0}px ${Math.random() * r.height | 0}px 0 ${Math.random() < .15 ? 1 : 0}px rgba(255,255,255,${(.35 + Math.random() * .65).toFixed(2)})`).join(','));
    };
    stars(); addEventListener('resize', stars);
  }

  /* count-up numbers */
  $$('.fact b').forEach(b => {
    const n = parseInt(b.textContent); if (isNaN(n) || reduce) return;
    b.textContent = 0;
    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; o.disconnect(); const t0 = performance.now();
      (function s(t) { const p = Math.min((t - t0) / 1100, 1); b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(s); })(t0);
    }); o.observe(b);
  });

  /* skills stagger index */
  $$('.group').forEach(g => [...g.querySelectorAll('li')].forEach((li, i) => li.style.setProperty('--k', i)));

  /* timeline: scroll-drawn line */
  const tl = $('.timeline');
  if (tl) {
    const items = $$('.tl-item');
    const upd = () => {
      const r = tl.getBoundingClientRect(), p = Math.min(Math.max((innerHeight * .65 - r.top) / r.height, 0), 1);
      tl.style.setProperty('--tl', p);
      items.forEach(it => it.classList.toggle('on', p * r.height >= it.offsetTop));
    };
    if (reduce) { tl.style.setProperty('--tl', 1); items.forEach(it => it.classList.add('on')); }
    else { addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd(); }
  }

  /* pointer effects: desktop with motion only */
  if (fine && !reduce) {
    const g = $('.cglow'); let tx = 0, ty = 0, gx = 0, gy = 0, on = false;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (!on) { on = true; gx = tx; gy = ty; g.style.opacity = 1; } }, { passive: true });
    (function l() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; g.style.transform = `translate3d(${gx}px,${gy}px,0)`; requestAnimationFrame(l); })();

    $$('.card').forEach(el => {
      const k = el.classList.contains('feature') ? 2 : 5;
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * k) + 'deg'); el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * k) + 'deg'); });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });

    $$('.cta .btn, .socials .icon-btn, .band .btn, .form-actions .btn').forEach(el => {
      el.classList.add('mag');
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * .22}px ${(e.clientY - r.top - r.height / 2) * .3}px`; });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }
})();
