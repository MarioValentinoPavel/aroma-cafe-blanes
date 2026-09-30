/* Aroma Café — casa de perfumes: vapor que sube, la carta en tres notas dentro de un frasco y fotografía a lo grande */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const DPR = Math.min(2, devicePixelRatio || 1);
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const wide = matchMedia('(min-width:901px)');

/* ---------- vapor: partículas suaves que suben ---------- */
const sprite = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(244,239,230,.55)'); g.addColorStop(.45, 'rgba(244,239,230,.18)'); g.addColorStop(1, 'rgba(244,239,230,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return c;
})();
function steam(canvas, { n = 46, from = .95, spread = .8, alpha = .5 } = {}) {
  const ctx = canvas.getContext('2d'); let W = 0, H = 0, on = true; const P = []; let mx = -999, my = -999;
  const size = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  const spawn = p => { p.x = W * (.5 + (Math.random() - .5) * spread); p.y = H * from + Math.random() * 40; p.vy = -(.35 + Math.random() * .6); p.r = 30 + Math.random() * 50; p.life = 0; p.max = 260 + Math.random() * 260; p.ph = Math.random() * 6.28; return p; };
  size(); addEventListener('resize', size);
  for (let i = 0; i < n; i++) { const p = spawn({}); p.life = Math.random() * p.max; p.y -= p.life * .6; P.push(p); }
  canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  const tick = (t, dt) => {
    if (!on) return; const f = Math.min(dt, 50) / 16.7;
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
    for (const p of P) {
      p.life += f; if (p.life > p.max) spawn(p);
      p.y += p.vy * f; p.x += Math.sin(p.ph + p.life * .012) * .35 * f;
      const dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
      if (d < 22000) { p.x += dx / 60 * f; p.y += dy / 90 * f; }
      const k = p.life / p.max, a = Math.sin(Math.PI * k) * alpha, r = p.r * (1 + k * 1.8);
      ctx.globalAlpha = a; ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  };
  gsap.ticker.add(tick);
  return { set on(v) { on = v; if (!v) ctx.clearRect(0, 0, W, H); }, stop: () => gsap.ticker.remove(tick) };
}

/* ---------- telón de entrada ---------- */
const curtain = $('.curtain');
const heroIn = () => gsap.timeline()
  .from('.hero__media img', { scale: 1.18, duration: 2.4, ease: 'expo.out' }, 0)
  .from('.hero__title .w', { yPercent: 100, opacity: 0, duration: 1.6, ease: 'expo.out' }, .15)
  .from(['.hero .eyebrow', '.hero__sub', '.hero__row', '.hero__foot'], { y: 30, opacity: 0, duration: 1.2, stagger: .1, ease: 'expo.out' }, .45);
if (calm) { curtain.remove(); }
else {
  document.body.classList.add('is-loading');
  const cs = steam($('.curtain__steam'), { n: 40, from: 1, spread: 1, alpha: .35 });
  gsap.timeline({ delay: .15 })
    .from('.curtain__word span', { yPercent: 60, opacity: 0, filter: 'blur(12px)', duration: 1.2, stagger: .08, ease: 'expo.out' })
    .from('.curtain__sub', { opacity: 0, letterSpacing: '.8em', duration: 1.2, ease: 'expo.out' }, '<.3')
    .to('.curtain__word span', { yPercent: -40, opacity: 0, filter: 'blur(10px)', duration: .8, stagger: .05, ease: 'power3.in' }, '+=.5')
    .to('.curtain__sub', { opacity: 0, duration: .5 }, '<')
    .to(curtain, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '-=.3')
    .add(heroIn(), '-=.7')
    .add(() => { cs.stop(); curtain.remove(); document.body.classList.remove('is-loading'); });
}

/* ---------- hero ---------- */
const hs = steam($('.hero__steam'), { n: 50, from: 1.02, spread: 1.1, alpha: .32 });
ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onToggle: s => { hs.on = s.isActive; } });
gsap.to('.hero__media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('.hero__txt', { yPercent: -40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true } });
ScrollTrigger.create({ start: () => innerHeight * .8, end: 'max', onToggle: s => $('.nav').classList.toggle('is-solid', s.isActive) });

/* ---------- manifiesto palabra a palabra ---------- */
const mt = $('#manifest');
mt.innerHTML = mt.textContent.split(' ').map(w => `<span class="wd">${w}</span>`).join(' ');
gsap.to('#manifest .wd', { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.manifest', start: 'top 70%', end: 'bottom 70%', scrub: true } });

/* ---------- la carta en tres notas ---------- */
const imgs = $$('.flacon__img'), tiers = $$('#tiers button'), accords = $$('.accord');
const LIQ = [['rgba(201,169,127,.10)', 'rgba(170,120,70,.38)'], ['rgba(201,150,90,.22)', 'rgba(140,86,40,.6)'], ['rgba(90,55,30,.35)', 'rgba(35,20,12,.82)']];
const LAB = ['Nº 1 · SALIDA', 'Nº 2 · CORAZÓN', 'Nº 3 · FONDO'];
const liq = $('.flacon__liq'), bottle = $('.notes__bottle');
liq.setAttribute('d', 'M-200 470 L-200 0 Q-150 -9 -100 0 T0 0 T100 0 T200 0 T300 0 T400 0 T500 0 L500 470Z');
const wave = { x: 0 }, lvl = { y: 400 };
gsap.to(wave, { x: -100, duration: 3.2, ease: 'none', repeat: -1 });
gsap.ticker.add(() => liq.setAttribute('transform', `translate(${wave.x.toFixed(1)} ${lvl.y.toFixed(1)})`));
let cur = -1;
function note(i) {
  if (i === cur) return; cur = i;
  imgs.forEach((m, j) => m.classList.toggle('is-on', j === i));
  tiers.forEach((b, j) => b.classList.toggle('is-on', j === i));
  accords.forEach((a, j) => { a.classList.toggle('is-on', j === i); if (j === i) gsap.fromTo(a.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'expo.out' }); });
  $('#labN').textContent = LAB[i];
  bottle.style.setProperty('--liq-a', LIQ[i][0]); bottle.style.setProperty('--liq-b', LIQ[i][1]);
  gsap.fromTo('#disp', { attr: { scale: 90 } }, { attr: { scale: 14 }, duration: 1.4, ease: 'expo.out' });
  gsap.to(lvl, { y: 400 - (i + 1) * 78, duration: 1.4, ease: 'expo.out' });
}
note(0);
tiers.forEach(b => b.addEventListener('click', () => {
  const i = +b.dataset.i;
  const st = ScrollTrigger.getById('notes');
  if (st) { scrollTo({ top: st.start + (st.end - st.start) * (i + .5) / 3, behavior: 'smooth' }); } else note(i);
}));
ScrollTrigger.matchMedia({
  '(min-width:901px)': () => {
    ScrollTrigger.create({ id: 'notes', trigger: '.notes', start: 'top top', end: '+=220%', pin: '.notes__pin', onUpdate: s => note(Math.min(2, Math.floor(s.progress * 3))) });
  }
});

// pulverizar: nube de perfume y siguiente nota
const mist = $('.mist'), mctx = mist.getContext('2d'); const M = []; let mW = 0, mH = 0;
const msize = () => { mW = mist.clientWidth; mH = mist.clientHeight; mist.width = mW * DPR; mist.height = mH * DPR; mctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
msize(); addEventListener('resize', msize);
$('#spray').addEventListener('click', () => {
  const b = bottle.getBoundingClientRect(), m = mist.getBoundingClientRect(), sc = b.width / 300;
  const ox = b.left - m.left + 150 * sc, oy = b.top - m.top + 8 * sc;
  for (let k = 0; k < 90; k++) {
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.4 + .35, v = 2 + Math.random() * 6;
    M.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 2 + Math.random() * 10, life: 0, max: 50 + Math.random() * 60 });
  }
  gsap.fromTo('.flacon', { y: 0 }, { y: 6, duration: .12, yoyo: true, repeat: 1, ease: 'power2.out' });
  if (!ScrollTrigger.getById('notes')) note((cur + 1) % 3);
});
gsap.ticker.add((t, dt) => {
  if (!M.length) return; const f = Math.min(dt, 50) / 16.7;
  mctx.clearRect(0, 0, mW, mH);
  for (let k = M.length - 1; k >= 0; k--) {
    const p = M[k]; p.life += f; if (p.life > p.max) { M.splice(k, 1); continue; }
    p.x += p.vx * f; p.y += p.vy * f; p.vx *= .95; p.vy = p.vy * .95 - .02; const kk = p.life / p.max, r = p.r * (1 + kk * 4);
    mctx.globalAlpha = (1 - kk) * .5; mctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
  }
  mctx.globalAlpha = 1; if (!M.length) mctx.clearRect(0, 0, mW, mH);
});

/* ---------- la casa: fotos que se destapan ---------- */
$$('.reveal-img').forEach(f => {
  gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 85%', once: true } })
    .fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
    .to($('img', f), { scale: 1, duration: 2.2, ease: 'expo.out' }, '<.2');
  gsap.fromTo($('img', f), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
});

/* ---------- opiniones ---------- */
const qs = $$('#quotes blockquote'), qd = $('#qdots');
qs.forEach((_, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Opinión ' + (i + 1)); b.addEventListener('click', () => showQ(i)); qd.append(b); });
let qi = -1, qt;
function showQ(i) {
  const prev = qs[qi]; qi = i;
  if (prev) gsap.to(prev, { opacity: 0, y: -20, filter: 'blur(8px)', duration: .7, ease: 'power2.in', onComplete: () => prev.classList.remove('is-on') });
  qs[i].classList.add('is-on');
  gsap.fromTo(qs[i], { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, delay: prev ? .5 : 0, ease: 'expo.out' });
  $$('button', qd).forEach((b, j) => { b.classList.remove('is-on'); void b.offsetWidth; b.classList.toggle('is-on', j === i); });
  clearTimeout(qt); qt = setTimeout(() => showQ((qi + 1) % qs.length), 6000);
}
qs.forEach(q => q.classList.remove('is-on'));
ScrollTrigger.create({ trigger: '.quotes', start: 'top 75%', once: true, onEnter: () => showQ(0) });

/* ---------- bienvenida en cinco idiomas ---------- */
const HELLO = ['Bienvenidos', 'Benvinguts', 'Bienvenue', 'Welcome', 'Bine ați venit'];
$('#hello').innerHTML = Array(4).fill(HELLO).flat().map(w => `<span>${w}</span><i>·</i>`).join('');
gsap.to('#hello', { xPercent: -25, ease: 'none', duration: 40, repeat: -1 });

/* ---------- cursor ---------- */
if (matchMedia('(pointer:fine)').matches) {
  const c = $('.cursor'), xTo = gsap.quickTo(c, 'x', { duration: .45, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: .45, ease: 'power3' });
  addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); });
  $$('[data-cursor]').forEach(el => { el.addEventListener('pointerenter', () => c.classList.add('is-big')); el.addEventListener('pointerleave', () => c.classList.remove('is-big')); });
} else $('.cursor').remove();

/* ---------- apariciones ---------- */
$$('.manifest .eyebrow, .house__txt > *, .plates__head > *, .plates__grid figure, .quotes > .eyebrow, .visit__grid > *, .notes__txt > .eyebrow, .notes__txt > .h2').forEach(n => gsap.from(n, {
  y: 50, opacity: 0, duration: 1.4, ease: 'expo.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: n, start: 'top 90%', once: true }
}));
