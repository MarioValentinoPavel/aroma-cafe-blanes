/* Aroma Café — punto de cruz: el nombre se borda solo, el bastidor borda la carta y las fotos cuelgan en bastidores */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const DPR = Math.min(2, devicePixelRatio || 1);

/* ---------- colores de hilo ---------- */
const TH = { K: '#2b2118', W: '#fffaf0', G: '#1e4a3a', g: '#5e9a6a', Y: '#d9a441', O: '#c7772e', C: '#6b3f22', R: '#b0302b', P: '#e79aa5', S: '#c9bfb0' };
const LINEN = '#f3ead8';

/* ---------- motor de puntadas ---------- */
function shade(hex, k) { // aclara (k>0) u oscurece (k<0) un color
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function fabric(ctx, w, h, s, ox = 0, oy = 0) {
  ctx.fillStyle = LINEN; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(120,95,60,.18)';
  const r = Math.max(.6, s * .07);
  for (let y = oy % s; y < h; y += s) for (let x = ox % s; x < w; x += s) ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function stitch(ctx, x, y, s, col) {
  const a = s * .16, b = s * .84, lw = s * .3;
  ctx.lineCap = 'round';
  const leg = (x1, y1, x2, y2, top) => {
    ctx.save();
    ctx.shadowColor = 'rgba(43,33,24,.35)'; ctx.shadowBlur = s * .18; ctx.shadowOffsetY = s * .06;
    ctx.strokeStyle = top ? col : shade(col, -.18); ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x + x1, y + y1); ctx.lineTo(x + x2, y + y2); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = shade(col, .35); ctx.globalAlpha = .55; ctx.lineWidth = lw * .28;
    ctx.beginPath(); ctx.moveTo(x + x1 + lw * .12, y + y1 - lw * .12); ctx.lineTo(x + x2 + lw * .12, y + y2 - lw * .12); ctx.stroke();
    ctx.globalAlpha = 1;
  };
  leg(a, b, b, a, false); // "/" de base
  leg(a, a, b, b, true);  // "\" encima
}
function cellsFrom(rows) {
  const out = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.' && c !== ' ') out.push({ x, y, c }); }));
  return out;
}

/* ---------- animador: borda una lista de puntadas con aguja ---------- */
function embroider({ ctx, cells, s, ox, oy, needle, dur = 2, onDone }) {
  let i = 0; const n = cells.length; const t0 = gsap.ticker.time;
  if (needle) needle.style.opacity = 1;
  const tick = () => {
    const p = Math.min(1, (gsap.ticker.time - t0) / dur);
    const to = Math.floor(p * n);
    for (; i < to; i++) { const c = cells[i]; stitch(ctx, ox + c.x * s, oy + c.y * s, s, TH[c.c] || c.c); }
    if (needle && i > 0) {
      const c = cells[Math.min(i, n - 1)];
      const cw = ctx.canvas.clientWidth / (ctx.canvas.width / DPR);
      const cv = ctx.canvas;
      needle.style.transform = `translate(${cv.offsetLeft + (ox + c.x * s + s * .8) * cw}px,${cv.offsetTop + (oy + c.y * s + s * .2) * cw}px) rotate(-38deg)`;
    }
    if (p >= 1) { gsap.ticker.remove(tick); if (needle) gsap.to(needle, { opacity: 0, duration: .4 }); onDone && onDone(); }
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}

/* ---------- hero: "Aroma" bordado ---------- */
const word = $('#word'), wctx = word.getContext('2d');
function wordCells(rows) {
  const oc = document.createElement('canvas'); const o = oc.getContext('2d');
  const fs = rows * 1.05; o.font = `900 ${fs}px Piazzolla, Georgia, serif`;
  const w = Math.ceil(o.measureText('Aroma').width) + 2;
  oc.width = w; oc.height = rows + 2;
  o.font = `900 ${fs}px Piazzolla, Georgia, serif`; o.textBaseline = 'alphabetic'; o.fillStyle = '#000';
  o.fillText('Aroma', 1, rows * .86);
  const d = o.getImageData(0, 0, oc.width, oc.height).data, cells = [];
  for (let x = 0; x < oc.width; x++) for (let y = 0; y < oc.height; y++) if (d[(y * oc.width + x) * 4 + 3] > 110) cells.push({ x, y, c: 'G' });
  // una cenefa de puntadas mostaza y rojas debajo
  const base = oc.height + 1;
  for (let x = 0; x < oc.width; x += 2) cells.push({ x, y: base, c: x % 6 === 0 ? 'R' : 'Y' });
  return { cells, cols: oc.width, rows: base + 1 };
}
let stopWord;
function drawWord(animate) {
  const rows = innerWidth < 600 ? 15 : 20;
  const { cells, cols, rows: R } = wordCells(rows);
  const cssW = word.parentElement.clientWidth;
  const s = cssW / (cols + 2);
  word.width = Math.round(cssW * DPR); word.height = Math.round((R + 2) * s * DPR);
  word.style.height = (R + 2) * s + 'px';
  wctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  wctx.clearRect(0, 0, cssW, (R + 2) * s);
  stopWord && stopWord();
  // se borda de izquierda a derecha, con algo de vaivén de la aguja
  cells.sort((a, b) => (a.x + (a.y % 3) * .6) - (b.x + (b.y % 3) * .6));
  if (animate) stopWord = embroider({ ctx: wctx, cells, s, ox: s, oy: s, needle: $('#needle'), dur: 2.6 });
  else cells.forEach(c => stitch(wctx, s + c.x * s, s + c.y * s, s, TH[c.c]));
}
document.fonts.load('900 40px Piazzolla').then(() => drawWord(true), () => drawWord(true));
let rw; addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(() => drawWord(false), 200); });

// bienvenida en cinco idiomas
const HELLO = ['Bienvenidos', 'Benvinguts', 'Bienvenue', 'Welcome', 'Bine ați venit'];
let hi = 0;
setInterval(() => {
  hi = (hi + 1) % HELLO.length;
  gsap.to('#hello', { y: -14, opacity: 0, duration: .35, onComplete: () => { $('#hello').textContent = HELLO[hi]; gsap.fromTo('#hello', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .45 }); } });
}, 2200);

/* ---------- bandas "ie" (cenefa de blusa rumana) ---------- */
const IE = [
  'Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.',
  '........................',
  '.....R...........R......',
  '....RKR.........RKR.....',
  '...RK.KR...G...RK.KR....',
  '..RK.G.KR.GGG.RK.G.KR...',
  '.RK.GGG.KRRGRRK.GGG.KR..',
  '..RK.G.KR.GGG.RK.G.KR...',
  '...RK.KR...G...RK.KR....',
  '....RKR.........RKR.....',
  '.....R...........R......',
  '........................',
  'Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.'
];
function ieTile(s) {
  const c = document.createElement('canvas'), w = IE[0].length * s, h = IE.length * s;
  c.width = w; c.height = h; const x = c.getContext('2d');
  fabric(x, w, h, s);
  cellsFrom(IE).forEach(p => stitch(x, p.x * s, p.y * s, s, TH[p.c]));
  return c.toDataURL('image/png');
}
const ieURL = ieTile(12);
$$('.ie').forEach(e => { e.style.backgroundImage = `url(${ieURL})`; });
$$('.ie:not(.ie--thin)').forEach(e => gsap.fromTo(e, { backgroundPositionX: '0px' }, { backgroundPositionX: '-288px', ease: 'none', scrollTrigger: { trigger: e, start: 'top bottom', end: 'bottom top', scrub: true } }));

/* ---------- motivos de la carta (16×16 en punto de cruz) ---------- */
const MOTIFS = [
  { k: 'cafe', n: 'Café', img: 'assets/maps/g07.jpg', kick: 'Mañanas', t: 'Café como tiene que ser',
    d: 'Café Segafredo bien hecho: espresso, cortado o cappuccino con su dibujo de leche. Y para los golosos, chocolate.',
    p: ['......S..S......', '.....S..S.......', '......S..S......', '.....S..S.......', '................', '...KKKKKKKKK....', '...KCCCCCCCK....', '...KWWWWWWWKKK..', '...KWGGGGGWK.K..', '...KWWWWWWWK.K..', '...KWWWWWWWKKK..', '....KWWWWWK.....', '.....KKKKK......', '.KKKKKKKKKKKKK..', '..KWWWWWWWWWK...', '...KKKKKKKKK....'] },
  { k: 'tostada', n: 'Desayunos', img: 'assets/ig/p03.jpg', kick: 'Para empezar el día', t: 'Tostadas, bocatas y pan con tomate',
    d: 'Tostadas, pan con tomate y jamón, croissants y bocadillos. Y sándwiches bien cargados: una reseña dice que el de lomo, bacon y queso «era super grande».',
    p: ['................', '....KKKKKKKK....', '...KOOOOOOOOK...', '..KOYYYYYYYYOK..', '..KOYRRYYRRYOK..', '..KOYRRRRRRYOK..', '..KOYYRRRRYYOK..', '..KOYRRYYRRYOK..', '..KOYYYYYYYYOK..', '..KOYYYgYYYYOK..', '..KOYYggYYYYOK..', '..KOYYYgYYYYOK..', '..KOOOOOOOOOOK..', '...KKKKKKKKKK...', '................', '................'] },
  { k: 'plato', n: 'Platos', img: 'assets/maps/g11.jpg', kick: 'Comidas y cenas', t: 'Platos para sentarse sin prisa',
    d: 'Carne, pasta y platos combinados, como el escalope con patatas y ensalada. Buena calidad-precio, según nos dicen las reseñas.',
    p: ['................', '.K.K.........K..', '.K.K........KK..', '.KKK...KKKK.KK..', '..K...KWWWWKKK..', '..K..KWYYOOWKK..', '..K.KWYYYOOOWK..', '..K.KWggRRROWK..', '..K.KWggRRRWWK..', '..K..KWWWWWWK...', '..K...KKKKKK.K..', '..K..........K..', '..K..........K..', '................', '................', '................'] },
  { k: 'pulpo', n: 'Tapas', img: 'assets/ig/p12.jpg', kick: 'Para compartir', t: 'Pop a la gallega y calamares',
    d: 'Pulpo a la gallega, calamares, mejillones… tapas para compartir en la terraza. «El pulpo y calamar recomendado», dice una reseña.',
    p: ['.....KKKKKK.....', '....KRRRRRRK....', '...KRRRRRRRRK...', '...KRWKRRWKRK...', '...KRKKRRKKRK...', '...KRRRRRRRRK...', '...KRRPPPPRRK...', '....KRRRRRRK....', '..KRKRKRRKRKRK..', '.KRKRKRKKRKRKRK.', '.KRK.KRK.KRK.KRK', '..KK..KK..KK..KK', '................', '................', '................', '................'] },
  { k: 'tarta', n: 'Dulces', img: 'assets/maps/g04.jpg', kick: 'Pastelería', t: 'Dulces caseros',
    d: 'Carrot cake, mousse de chocolate, brownie con nata y copas de helado. «La pastelería estaba muy buena», escribió una clienta.',
    p: ['......KK........', '.....KRRK.......', '....KRRRRK......', '.....KgK........', '...KKKKKKKKKKK..', '..KWWWWWWWWWWK..', '..KPPPPPPPPPPK..', '..KYYYYYYYYYYK..', '..KWWWWWWWWWWK..', '..KYYYYYYYYYYK..', '..KPPPPPPPPPPK..', '..KCCCCCCCCCCK..', '..KKKKKKKKKKKK..', '................', '................', '................'] },
  { k: 'coctel', n: 'Copas', img: 'assets/ig/p10.jpg', kick: 'Al caer la tarde', t: 'Mojito de fresa y cervezas',
    d: 'Mojito de fresa, cerveza Chouffe, Estrella Galicia 1906, vinos y cócteles para alargar la tarde en la terraza.',
    p: ['..........K.....', '.........K......', '..KKKKKKKKKKK...', '..KWWWWWKWWWK.g.', '..KWRRRWKRRWKgg.', '..KWRRRRKRRRK.g.', '...KRRgRKRRK....', '...KRRRRKRRK....', '...KRRRRRRRK....', '....KRRRRRK.....', '....KRRRRRK.....', '.....KKKKK......', '.......K........', '.......K........', '....KKKKKKK.....', '................'] }
];

// iconos pequeños ya bordados
const mEl = $('#motifs');
MOTIFS.forEach((m, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'motif'; b.setAttribute('role', 'tab'); b.dataset.i = i;
  const c = document.createElement('canvas'); const px = 64 * DPR; c.width = px; c.height = px;
  const x = c.getContext('2d'); const s = px / 17;
  fabric(x, px, px, s, s * .5, s * .5);
  cellsFrom(m.p).forEach(p => stitch(x, s * .5 + p.x * s, s * .5 + p.y * s, s, TH[p.c]));
  b.append(c); const sp = document.createElement('span'); sp.textContent = m.n; b.append(sp);
  b.addEventListener('click', () => pick(i));
  mEl.append(b);
});

// el gran bastidor
const hoop = $('#hoop'), hctx = hoop.getContext('2d');
let stopHoop, cur = -1;
function sizeHoop() {
  const w = hoop.clientWidth; hoop.width = Math.round(w * DPR); hoop.height = Math.round(w * DPR);
  hctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return w;
}
function pick(i, instant) {
  if (i === cur && !instant) return; cur = i;
  $$('.motif').forEach((b, j) => b.setAttribute('aria-selected', j === i));
  const m = MOTIFS[i], w = sizeHoop(), s = w * .82 / 16, o = w * .09;
  fabric(hctx, w, w, s, o, o);
  stopHoop && stopHoop();
  // como una bordadora de verdad: un color cada vez, fila a fila
  const order = 'SKWCYOGgPR';
  const cells = cellsFrom(m.p).sort((a, b) => (order.indexOf(a.c) - order.indexOf(b.c)) || (a.y - b.y) || (a.y % 2 ? b.x - a.x : a.x - b.x));
  if (instant) cells.forEach(c => stitch(hctx, o + c.x * s, o + c.y * s, s, TH[c.c]));
  else stopHoop = embroider({ ctx: hctx, cells, s, ox: o, oy: o, needle: $('#needle2'), dur: 1.9 });
  const d = $('.dish');
  gsap.fromTo(d, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .7, ease: 'expo.out' });
  $('#dImg').src = m.img; $('#dImg').alt = m.t;
  $('#dKick').textContent = m.kick; $('#dTitle').textContent = m.t; $('#dText').textContent = m.d;
  gsap.fromTo('.bighoop', { rotation: -3 }, { rotation: 0, duration: 1.2, ease: 'elastic.out(1,.4)' });
}
pick(0, true);
ScrollTrigger.create({ trigger: '#bastidor', start: 'top 60%', once: true, onEnter: () => { cur = -1; pick(0); } });
addEventListener('resize', () => { if (cur >= 0) pick(cur, true); });

/* ---------- pared de bastidores que se balancean ---------- */
const WALL = [
  ['assets/maps/g01.jpg', 'La fachada', 220, 30], ['assets/maps/g10.jpg', 'Desayuno salado', 170, 70], ['assets/maps/g08.jpg', 'El salón', 200, 20], ['assets/maps/g06.jpg', 'Tarta casera', 160, 90], ['assets/ig/p05.jpg', 'La terraza', 220, 40],
  ['assets/maps/g04.jpg', 'Brownie y copa', 180, 60], ['assets/ig/p12.jpg', 'Pop a la gallega', 200, 30], ['assets/ig/p03.jpg', 'Pan con tomate', 170, 80], ['assets/maps/g03.jpg', 'La barra', 210, 50]
];
const peg = ([src, cap, w, h]) => `<figure class="peg" style="--w:${w}px;--h:${h}px"><div class="hoop"><img src="${src}" alt="${cap}" loading="lazy"><span class="hoop__clasp"></span></div><figcaption>${cap}</figcaption></figure>`;
$('#wall').innerHTML = WALL.slice(0, 5).map(peg).join('');
$('#wall2').innerHTML = WALL.slice(5).map(peg).join('');
const swingers = [...$$('.peg'), ...$$('[data-swing]')].map((el, i) => ({ el, a: 0, v: 0, k: .9 + (i % 4) * .15 }));
let kick = 0;
ScrollTrigger.create({ onUpdate: s => { kick += s.getVelocity() / 900; } });
gsap.ticker.add((t, dt) => {
  const f = Math.min(dt, 50) / 16;
  kick *= .9;
  swingers.forEach(s => {
    s.v += (-s.a * .045 * s.k + kick * .06 * s.k) * f;
    s.v *= Math.pow(.94, f);
    s.a += s.v * f;
    s.a = Math.max(-14, Math.min(14, s.a));
    s.el.style.transform = `rotate(${s.a.toFixed(2)}deg)`;
  });
});
$$('.peg').forEach((p, i) => p.addEventListener('pointerenter', () => { swingers[i].v += 1.6; }));

/* ---------- entrada y apariciones ---------- */
gsap.timeline({ delay: .2 })
  .from('.hero .kicker', { y: 20, opacity: 0, duration: .6 })
  .from('.hero__hoop .hoop', { scale: .5, rotation: -40, opacity: 0, duration: 1.4, ease: 'elastic.out(1,.6)' }, '<')
  .from(['.hero__lead', '.hero__txt .hero__row', '.hello', '.hero__open'], { y: 24, opacity: 0, duration: .8, stagger: .1 }, '<.6');
$$('.intro__hoops .hoop, .peg').forEach(n => gsap.from(n, { opacity: 0, duration: 1.2, scrollTrigger: { trigger: n, start: 'top 92%', once: true } }));
$$('.head, .intro__txt > *, .sampler, .visit__txt > *, .langs').forEach(n => gsap.from(n, {
  y: 60, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: n, start: 'top 90%', once: true }
}));
