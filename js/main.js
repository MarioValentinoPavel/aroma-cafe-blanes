// Aroma Café Blanes · interacción
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const T = (...a) => (window.I18N ? window.I18N.t(...a) : a[0]);
  const lang = () => (window.I18N ? window.I18N.get() : 'es');
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- textos de la cabecera del documento ---------- */
  const META = {
    es: ['Aroma Café · Cafetería, bar y restaurante en el centro de Blanes', 'Aroma Café, en el Passeig de Dintre, 4, en el centro de Blanes. Café Segafredo, desayunos, bocadillos, tapas, postres y cócteles, con terraza en la calle peatonal. Teléfono 972 74 66 43.'],
    ca: ['Aroma Café · Cafeteria, bar i restaurant al centre de Blanes', 'Aroma Café, al Passeig de Dintre, 4, al centre de Blanes. Cafè Segafredo, esmorzars, entrepans, tapes, postres i còctels, amb terrassa al carrer de vianants. Telèfon 972 74 66 43.'],
    en: ['Aroma Café · Café, bar and restaurant in the centre of Blanes', 'Aroma Café, Passeig de Dintre 4, in the centre of Blanes. Segafredo coffee, breakfast, sandwiches, tapas, desserts and cocktails, with a terrace on the pedestrian street. Phone +34 972 74 66 43.'],
    fr: ['Aroma Café · Café, bar et restaurant au centre de Blanes', 'Aroma Café, Passeig de Dintre 4, au centre de Blanes. Café Segafredo, petits-déjeuners, sandwichs, tapas, desserts et cocktails, avec terrasse dans la rue piétonne. Tél. +34 972 74 66 43.'],
    ro: ['Aroma Café · Cafenea, bar și restaurant în centrul orașului Blanes', 'Aroma Café, Passeig de Dintre 4, în centrul orașului Blanes. Cafea Segafredo, mic dejun, sandvișuri, tapas, deserturi și cocktailuri, cu terasă pe strada pietonală. Telefon +34 972 74 66 43.']
  };
  const LNAME = { es: 'Español', ca: 'Català', en: 'English', fr: 'Français', ro: 'Română' };

  /* ---------- portada: letras y entrada ---------- */
  const hero = $('.hero');
  const brand = $('.hero-brand');
  if (brand) {
    const txt = brand.textContent.trim();
    let i = 0;
    const words = txt.split(' ').map((w) => `<span class="wd">${[...w].map((ch) => `<span class="c" style="--i:${i++}">${ch}</span>`).join('')}</span>`);
    brand.innerHTML = `<span class="sr">${txt}</span><span aria-hidden="true">${words.join(' ')}</span>`;
  }
  const heroIn = () => { hero.classList.add('is-in'); document.body.classList.add('hero-done'); };
  if (html.classList.contains('anim')) {
    const img = $('.hero-media img');
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const pic = img && !img.complete ? new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }) : Promise.resolve();
    Promise.race([Promise.all([fonts, pic]), new Promise((r) => setTimeout(r, 1800))])
      .then(() => requestAnimationFrame(() => requestAnimationFrame(heroIn)));
  } else heroIn();

  /* ---------- desplazamiento suave ---------- */
  let lenis = null;
  if (!RM.matches && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToY = (y) => {
    y = Math.max(0, Math.round(y));
    if (lenis) lenis.scrollTo(y, { duration: 1.3 });
    else window.scrollTo({ top: y, behavior: RM.matches ? 'auto' : 'smooth' });
  };

  /* ---------- cabecera ---------- */
  const top = $('[data-top]');
  let lastY = window.scrollY;
  function onScroll(y) {
    const h = hero ? hero.offsetHeight : 0;
    top.classList.toggle('is-solid', y > h - 90);
    if (y < h * 0.6) top.classList.remove('is-away');
    else if (y > lastY + 3) top.classList.add('is-away');
    else if (y < lastY - 3) top.classList.remove('is-away');
    lastY = y;
  }
  if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  onScroll(window.scrollY);
  top.addEventListener('focusin', () => top.classList.remove('is-away'));

  /* ---------- menú (móvil y tableta) ---------- */
  const menu = $('#menu');
  const mbtn = $('.menu-btn');
  function openMenu() {
    menu.hidden = false; menu.classList.add('is-open');
    mbtn.setAttribute('aria-expanded', 'true');
    top.classList.add('is-menu'); top.classList.remove('is-away');
    html.style.overflow = 'hidden'; if (lenis) lenis.stop();
    updBar();
    const first = $('a', menu); if (first) first.focus();
  }
  function closeMenu(focusBtn) {
    if (menu.hidden) return;
    menu.hidden = true; menu.classList.remove('is-open');
    mbtn.setAttribute('aria-expanded', 'false');
    top.classList.remove('is-menu');
    html.style.overflow = ''; if (lenis) lenis.start();
    updBar();
    if (focusBtn) mbtn.focus();
  }
  mbtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu(true)));
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!menu.hidden) closeMenu(true); closeLang(true); }
    if (e.key === 'Tab' && !menu.hidden) {
      const f = [mbtn, ...$$('a, button', menu)].filter((el) => el.offsetParent !== null);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- selector de idioma ---------- */
  const lbtn = $('.lang-btn');
  const llist = $('#lang-list');
  function closeLang(focusBtn) {
    if (!llist || llist.hidden) return;
    llist.hidden = true; lbtn.setAttribute('aria-expanded', 'false');
    if (focusBtn) lbtn.focus();
  }
  if (lbtn) {
    lbtn.addEventListener('click', () => {
      const open = llist.hidden;
      llist.hidden = !open; lbtn.setAttribute('aria-expanded', String(open));
      if (open) { const b = $('[aria-pressed="true"]', llist) || $('button', llist); b.focus(); }
    });
    llist.addEventListener('click', (e) => { if (e.target.closest('[data-lang]')) closeLang(true); });
    llist.addEventListener('keydown', (e) => {
      const bs = $$('button', llist); const i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); bs[(i + 1) % bs.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); bs[(i - 1 + bs.length) % bs.length].focus(); }
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('[data-lang-menu]')) closeLang(); });
  }

  /* ---------- enlaces internos ---------- */
  let chapterY = null;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    let y = a.closest('.ch-index') && chapterY ? chapterY(id) : null;
    if (y == null) y = t.getBoundingClientRect().top + window.scrollY;
    scrollToY(y);
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  });

  /* ---------- abierto / cerrado (hora de Blanes) ---------- */
  const H = (window.AROMA && window.AROMA.hours) || {};
  const DAYS = {
    es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    ca: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    ro: ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă']
  };
  const hm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const hmFr = (m) => `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`;
  const tm = (m) => (lang() === 'fr' ? hmFr(m) : hm(m));
  function nowHere() {
    try {
      const p = new Intl.DateTimeFormat('en-GB', { timeZone: (window.AROMA && window.AROMA.tz) || 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const v = (k) => p.find((x) => x.type === k).value;
      return { d: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[v('weekday')], m: (+v('hour') % 24) * 60 + +v('minute') };
    } catch (_) { const n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function status() {
    const { d, m } = nowHere();
    const today = H[d] || [];
    const cur = today.find(([a, b]) => m >= a && m < b);
    if (cur) { const t = tm(cur[1]); return { open: true, txt: T(`Abierto · hasta las ${t}`, `Obert · fins a les ${t}`, `Open · until ${t}`, `Ouvert · jusqu’à ${t}`, `Deschis · până la ${t}`) }; }
    const later = today.find(([a]) => a > m);
    if (later) { const t = tm(later[0]); return { open: false, txt: T(`Cerrado · abre hoy a las ${t}`, `Tancat · obre avui a les ${t}`, `Closed · opens today at ${t}`, `Fermé · ouvre aujourd’hui à ${t}`, `Închis · deschide azi la ${t}`) }; }
    for (let k = 1; k <= 7; k++) {
      const dd = (d + k) % 7; const s = (H[dd] || [])[0];
      if (!s) continue;
      const t = tm(s[0]);
      if (k === 1) return { open: false, txt: T(`Cerrado · abre mañana a las ${t}`, `Tancat · obre demà a les ${t}`, `Closed · opens tomorrow at ${t}`, `Fermé · ouvre demain à ${t}`, `Închis · deschide mâine la ${t}`) };
      const day = DAYS[lang()][dd]; const dl = day.toLowerCase();
      return { open: false, txt: T(`Cerrado · abre el ${dl} a las ${t}`, `Tancat · obre ${dl} a les ${t}`, `Closed · opens ${day} at ${t}`, `Fermé · ouvre ${dl} à ${t}`, `Închis · deschide ${dl} la ${t}`) };
    }
    return { open: false, txt: '' };
  }
  function renderNow() {
    const s = status();
    $$('[data-now]').forEach((el) => { el.dataset.state = s.open ? 'open' : 'closed'; $('[data-now-txt]', el).textContent = s.txt; });
  }
  function renderHours() {
    const L = lang(); const { d } = nowHere();
    $$('[data-hours] tr').forEach((tr) => {
      const dd = +tr.dataset.day; const sl = H[dd] || [];
      const th = $('th', tr);
      th.textContent = DAYS[L][dd];
      $('td', tr).textContent = sl.length ? sl.map(([a, b]) => `${tm(a)} – ${tm(b)}`).join(', ') : T('Cerrado', 'Tancat', 'Closed', 'Fermé', 'Închis');
      tr.classList.toggle('is-today', dd === d);
      if (dd === d) th.dataset.today = T('Hoy', 'Avui', 'Today', 'Aujourd’hui', 'Azi'); else delete th.dataset.today;
    });
  }
  renderNow(); renderHours();
  setInterval(() => { renderNow(); renderHours(); }, 60000);

  /* ---------- al cambiar de idioma ---------- */
  document.addEventListener('langchange', (e) => {
    const L = e.detail.lang;
    const m = META[L] || META.es;
    document.title = m[0];
    const md = $('meta[name="description"]'); if (md) md.setAttribute('content', m[1]);
    $$('[data-lang-cur]').forEach((el) => { el.textContent = L.toUpperCase(); });
    if (lbtn) lbtn.setAttribute('aria-label', `${T('Idioma', 'Idioma', 'Language', 'Langue', 'Limba')}${L === 'fr' ? ' :' : ':'} ${LNAME[L]}`);
    $$('#lang-list [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === L)));
    renderNow(); renderHours();
    if (hasGsap) requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  /* ---------- apartado activo en la navegación ---------- */
  const navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => { if (a.dataset.nav === en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['carta', 'local', 'opiniones', 'visita'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    const hio = new IntersectionObserver(([en]) => { if (en.isIntersecting) navLinks.forEach((a) => a.removeAttribute('aria-current')); }, { rootMargin: '-45% 0px -50% 0px' });
    if (hero) hio.observe(hero);
  }

  /* ---------- barra de acciones en el móvil ---------- */
  const bar = $('[data-bar]');
  let pastHero = false; let busy = false;
  const seen = new Set();
  function updBar() { if (bar) bar.classList.toggle('is-on', pastHero && !busy && menu.hidden); }
  if (bar && 'IntersectionObserver' in window) {
    const cta = $('.hero-cta');
    new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting && en.boundingClientRect.top < 0; updBar(); }).observe(cta);
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      busy = seen.size > 0; updBar();
    });
    [$('.visita .btns'), $('.foot')].forEach((el) => el && io2.observe(el));
  }

  /* ---------- año ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- frase de la pared: se ilumina palabra a palabra ---------- */
  const motto = $('[data-words]');
  if (motto) {
    const words = motto.textContent.trim().split(/\s+/);
    motto.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    if (hasGsap && !RM.matches) {
      const ws = $$('.w', motto);
      const paint = (p) => {
        const k = p * (ws.length + 1.5) - 0.5;
        ws.forEach((w, i) => { const v = Math.min(1, Math.max(0, k - i)); w.style.opacity = (0.16 + 0.84 * v).toFixed(3); });
      };
      paint(0);
      ScrollTrigger.create({
        trigger: motto, start: 'top 82%', end: 'bottom 42%',
        onUpdate: (self) => paint(self.progress), onRefresh: (self) => paint(self.progress)
      });
    }
  }

  /* ---------- la carta: capítulos fijos ---------- */
  const chWrap = $('[data-chapters]');
  if (chWrap && hasGsap) {
    const chs = $$('[data-ch]', chWrap);
    const links = $$('.ch-index a', chWrap);
    const prog = $('.ch-bar', chWrap);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)', () => {
      html.classList.add('pin');
      const HOLD = 0.6;
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to({}, { duration: HOLD });
      const starts = [];
      for (let i = 1; i < chs.length; i++) {
        const p = chs[i - 1]; const c = chs[i];
        const s = tl.duration(); starts.push(s);
        const pa = $('.ch-ph-a', p), pb = $('.ch-ph-b', p), ca = $('.ch-ph-a', c), cb = $('.ch-ph-b', c);
        tl.to($('.ch-txt', p), { opacity: 0, y: -26, filter: 'blur(6px)', duration: 0.42, ease: 'power2.in' }, s)
          .fromTo(ca, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, s)
          .fromTo(cb, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, s)
          .fromTo($('img', ca), { yPercent: 14, scale: 1.12 }, { yPercent: 0, scale: 1, duration: 1, ease: 'power3.out' }, s)
          .fromTo($('img', cb), { yPercent: -14, scale: 1.12 }, { yPercent: 0, scale: 1, duration: 1, ease: 'power3.out' }, s)
          .to($('img', pa), { yPercent: -9, duration: 1, ease: 'power2.inOut' }, s)
          .to($('img', pb), { yPercent: 9, duration: 1, ease: 'power2.inOut' }, s)
          .fromTo($('.ch-txt', c), { opacity: 0, y: 34, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out' }, s + 0.42)
          .to({}, { duration: HOLD });
      }
      const total = tl.duration();
      let active = -1;
      const setActive = (k) => {
        if (k === active) return; active = k;
        links.forEach((a, i) => { a.classList.toggle('is-on', i === k); if (i === k) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
        chs.forEach((c, i) => { c.style.pointerEvents = i === k ? '' : 'none'; });
      };
      setActive(0);
      const st = ScrollTrigger.create({
        trigger: chWrap, start: 'top top', end: () => '+=' + Math.round(window.innerHeight * 3.3),
        pin: true, scrub: 0.6, animation: tl, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = total * self.progress;
          let k = 0; starts.forEach((s, i) => { if (t >= s + 0.5) k = i + 1; });
          setActive(k);
          if (prog) prog.style.setProperty('--p', self.progress.toFixed(4));
        }
      });
      chapterY = (id) => {
        const i = chs.findIndex((c) => c.id === id);
        if (i < 0) return null;
        const t = i === 0 ? 0 : starts[i - 1] + 1.1;
        return st.start + (st.end - st.start) * (t / total);
      };
      return () => { html.classList.remove('pin'); chapterY = null; active = -1; chs.forEach((c) => { c.style.pointerEvents = ''; }); };
    });
  }

  /* ---------- títulos de capítulo: una línea, ajustada al ancho (idiomas largos) ---------- */
  function fitTitles() {
    const wide = window.innerWidth >= 1024;
    $$('.ch-h').forEach((h) => {
      h.style.fontSize = '';
      if (!wide) return;
      const max = h.parentElement.clientWidth;
      const cs = getComputedStyle(h);
      const fs = parseFloat(cs.fontSize);
      const probe = document.createElement('span');
      probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:${cs.fontStyle} ${cs.fontWeight} ${fs}px/1 ${cs.fontFamily};letter-spacing:${cs.letterSpacing}`;
      probe.textContent = h.textContent;
      document.body.appendChild(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      if (w > max) h.style.fontSize = Math.max(40, Math.floor(fs * (max / w) * 0.97)) + 'px';
    });
  }
  let rz = 0;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(fitTitles, 150); });
  document.addEventListener('langchange', () => fitTitles());
  if (document.fonts) document.fonts.ready.then(fitTitles); else fitTitles();

  /* ---------- fotos de la carta: se piden antes de llegar, para que las cortinillas nunca enseñen un hueco ---------- */
  const carta = $('#carta');
  if (carta && 'IntersectionObserver' in window) {
    const pre = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      $$('img[loading="lazy"]', carta).forEach((im) => { im.loading = 'eager'; });
      pre.disconnect();
    }, { rootMargin: '150% 0px' });
    pre.observe(carta);
  }

  /* ---------- recalcular cuando cargan fuentes e imágenes ---------- */
  if (hasGsap) {
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
