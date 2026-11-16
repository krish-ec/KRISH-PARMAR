/* Project cards, editorial direction. Raw WebGL, no libraries.
   Each card gets a living noise-gradient (domain-warped fbm + film grain) that
   leans toward the cursor and shifts palette on hover. NexTerra literally cools.
   Falls back to your existing CSS gradient if WebGL is unavailable. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...new Set(document.querySelectorAll('.work .card, #track .card'))];
  if (!cards.length) return;

  /* palette: base / body / accent / highlight, plus hover shift (a1, a2) */
  const PAL = {
    pravaha:    { c0: '#0b0c3a', c1: '#4b2bff', c2: '#ff5d8f', c3: '#ffb59e', a1: '#7a5cff', a2: '#ffb59e' },
    studynest:  { c0: '#0b0c3a', c1: '#2a2cff', c2: '#b9a8ff', c3: '#ffb59e', a1: '#5b5eff', a2: '#ffb59e' },
    celesta:    { c0: '#07060c', c1: '#ff2a3d', c2: '#6a4cff', c3: '#b9a8ff', a1: '#ff5d6e', a2: '#b9a8ff' },
    cloudforge: { c0: '#0b0c3a', c1: '#3a3fff', c2: '#b9a8ff', c3: '#ffb59e', a1: '#8d86ff', a2: '#ffb59e' },
    nexterra:   { c0: '#18332a', c1: '#d8523e', c2: '#ee9b45', c3: '#f2d477', a1: '#1b7f70', a2: '#b8d9c5' } // hover cools it down
  };
  const MARKS = {
    pravaha: '<path pathLength="1" d="M8 25a16 16 0 0 1 30-7"/><path pathLength="1" d="M40 23a16 16 0 0 1-30 7"/><path pathLength="1" d="M31 11l7 7-9 2"/><path pathLength="1" d="M17 37l-7-7 9-2"/>',
    studynest: '<path pathLength="1" d="M24 8l16 9-16 9-16-9z"/><path pathLength="1" d="M8 25l16 9 16-9"/><path pathLength="1" d="M8 32l16 9 16-9"/>',
    celesta: '<path pathLength="1" d="M24 5v38"/><path pathLength="1" d="M5 24h38"/><path pathLength="1" d="M11 11l26 26"/><path pathLength="1" d="M37 11L11 37"/><circle pathLength="1" cx="24" cy="24" r="5"/>',
    cloudforge: '<path pathLength="1" d="M14 35h18a8 8 0 0 0 1-16 11 11 0 0 0-21-2 9 9 0 0 0 2 18z"/><path pathLength="1" d="M20 28l4-4 4 4"/><path pathLength="1" d="M24 24v9"/>',
    nexterra: '<circle pathLength="1" cx="24" cy="24" r="7"/><circle pathLength="1" cx="24" cy="24" r="14"/><path pathLength="1" d="M24 3v5M24 40v5M3 24h5M40 24h5M9 9l3.5 3.5M35.5 35.5L39 39M39 9l-3.5 3.5M12.5 35.5L9 39"/>'
  };
  const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes, uMouse; uniform float uTime, uHover;
uniform vec3 c0, c1, c2, c3, a1, a2;
float hash(vec2 p){return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);}
float noise(vec2 p){vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);}
float fbm(vec2 p){float v = 0., a = .5; for (int i = 0; i < 5; i++){v += a * noise(p); p *= 2.02; a *= .5;} return v;}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - .5) * vec2(asp, 1.);
  vec2 m = (uMouse - .5) * vec2(asp, 1.);
  float d = length(p - m);
  p += (m - p) * exp(-d * 3.2) * .22 * uHover;           // lens toward cursor
  float t = uTime * .09;
  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 3.1));
  vec2 r = vec2(fbm(p * 2. + q * 2. + vec2(1.7, 9.2) + t * 1.3), fbm(p * 2. + q * 2. + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.4 + r * 2.2);
  vec3 b1 = mix(c1, a1, uHover), b2 = mix(c2, a2, uHover * .8);
  vec3 col = mix(c0, b1, smoothstep(.12, .62, f));
  col = mix(col, b2, smoothstep(.42, .95, r.x) * .92);
  col = mix(col, c3, smoothstep(.62, 1., length(q)) * .55);
  col += .14 * exp(-d * 3.6) * uHover * c3;               // light under the cursor
  col += (hash(gl_FragCoord.xy + uTime * 60.) - .5) * .055; // film grain
  col *= 1. - dot(uv - .5, uv - .5) * .6;                  // vignette
  gl_FragColor = vec4(col, 1.);
}`;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

  function initGL(canvas, pal) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uMouse', 'uTime', 'uHover', 'c0', 'c1', 'c2', 'c3', 'a1', 'a2'].forEach(n => U[n] = gl.getUniformLocation(pr, n));
    ['c0', 'c1', 'c2', 'c3', 'a1', 'a2'].forEach(k => gl.uniform3fv(U[k], rgb(pal[k])));
    return { gl, U };
  }

  const states = [];
  const t0 = performance.now();
  function render(s, now) {
    const { gl, U } = s.g;
    gl.viewport(0, 0, s.canvas.width, s.canvas.height);
    gl.uniform2f(U.uRes, s.canvas.width, s.canvas.height);
    gl.uniform2f(U.uMouse, s.mx, s.my);
    gl.uniform1f(U.uTime, RM ? s.seed : (now - t0) / 1000 + s.seed);
    gl.uniform1f(U.uHover, s.hover);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function fit(s) {
    const q = Math.min(devicePixelRatio || 1, 1.5) * (innerWidth < 700 ? .6 : .8);
    const w = Math.max(2, Math.round(s.art.clientWidth * q)), h = Math.max(2, Math.round(s.art.clientHeight * q));
    if (s.canvas.width !== w || s.canvas.height !== h) { s.canvas.width = w; s.canvas.height = h; }
    if (s.g) render(s, performance.now());
  }

  cards.forEach((card, i) => {
    const art = card.querySelector('.art');
    const key = (card.getAttribute('href') || '').replace(/\.html.*$/, '').split('/').pop();
    if (!art || !PAL[key] || card.classList.contains('pm3-on')) return;
    card.classList.add('pm3-on');

    const mk = (tag, cls, html = '') => { const d = document.createElement(tag); d.className = cls; d.innerHTML = html; return d; };
    const top = mk('div', 'pm3-top', `<div class="pm3-mark"><svg viewBox="0 0 48 48" aria-hidden="true">${MARKS[key]}</svg></div><div class="pm3-idx">${String(i + 1).padStart(2, '0')} <i>/ ${String(cards.length).padStart(2, '0')}</i></div>`);
    const go = mk('div', 'pm3-go', `<span>View case</span>${ARROW}`);
    top.setAttribute('aria-hidden', 'true'); go.setAttribute('aria-hidden', 'true');
    art.append(top, go);

    // title: refined roll (text slides up, identical text slides in)
    const h3 = card.querySelector('h3');
    const node = h3 && [...h3.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    if (node) {
      const txt = node.textContent.trim();
      const roll = mk('span', 'pm3-roll', `<span>${txt}</span><span aria-hidden="true">${txt}</span>`);
      node.replaceWith(roll, document.createTextNode(' '));
    }
    if (h3) h3.after(mk('div', 'pm3-line'));

    // shader
    const canvas = mk('canvas', 'pm3-gl'); canvas.setAttribute('aria-hidden', 'true');
    art.insertBefore(canvas, art.firstChild);
    const g = initGL(canvas, PAL[key]);
    if (!g) { canvas.remove(); return; }
    const s = { card, art, canvas, g, hover: 0, target: 0, mx: .5, my: .5, tmx: .5, tmy: .5, seed: i * 7.3 + 2, vis: false };
    states.push(s);
    fit(s);
    new ResizeObserver(() => fit(s)).observe(art);
    new IntersectionObserver(es => { s.vis = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(art);

    if (!RM) {
      card.addEventListener('pointerenter', () => { s.target = 1; });
      card.addEventListener('pointerleave', () => { s.target = 0; s.tmx = .5; s.tmy = .5; art.style.setProperty('--px', 0); art.style.setProperty('--py', 0); });
      card.addEventListener('pointermove', e => {
        const r = art.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        s.tmx = Math.max(0, Math.min(1, nx)); s.tmy = Math.max(0, Math.min(1, 1 - ny));
        art.style.setProperty('--px', (nx - .5).toFixed(3)); art.style.setProperty('--py', (ny - .5).toFixed(3));
      });
    }
  });

  if (RM || !states.length) return;
  let frame = 0;
  (function loop(now) {
    frame++;
    for (const s of states) {
      s.hover += (s.target - s.hover) * .07;
      s.mx += (s.tmx - s.mx) * .1; s.my += (s.tmy - s.my) * .1;
      if (!s.vis || document.hidden) continue;
      // active cards at full rate, idle ones at 30fps
      if (s.target || s.hover > .01 || frame % 2 === 0) render(s, now);
    }
    requestAnimationFrame(loop);
  })(performance.now());
})();
