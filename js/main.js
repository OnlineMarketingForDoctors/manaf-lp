(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- data: before & after cases (front view = 1) ---------- */
  const CASES = [
    { p: 1, n: 1, title: 'Bilateral breast reduction', text: 'Heavy, low breasts reduced in volume, with the nipples raised to a natural height and a rounder, lifted shape.' },
    { p: 2, n: 4, title: 'Breast reduction', text: 'Long-standing heaviness relieved. The breasts now sit higher on the chest with a firmer, more youthful contour.' },
    { p: 3, n: 1, title: 'Breast reduction with liposuction', text: 'Smaller, lifted breasts, with liposuction to the sides of the chest for a smoother outline.' },
    { p: 4, n: 1, title: 'Bilateral breast reduction', text: 'A significant reduction in weight, bringing the breasts into proportion with a petite frame.' },
    { p: 5, n: 1, title: 'Breast reduction', text: 'A lighter, more balanced chest with neatly repositioned nipples and a natural slope.' },
    { p: 6, n: 1, title: 'Breast reduction', text: 'Width and projection reduced to suit a slimmer frame, with symmetry restored between the two sides.' },
    { p: 7, n: 1, title: 'Breast reduction', text: 'Reduced and lifted for a natural, proportionate profile that suits everyday clothes.' }
  ];
  const src = (c, side) => `img/ba/p${c.p}-${c.n}-${side}.webp`;

  /* ---------- compare slider ---------- */
  function initCompare(el) {
    const range = $('.compare__range', el);
    const set = v => el.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => { el.classList.remove('is-hint'); set(range.value); });
    // pointer drag anywhere on the image (the range covers it, this smooths touch)
    set(range.value);
  }
  function hint(el) {
    if (reduced) return;
    const range = $('.compare__range', el);
    el.classList.add('is-hint');
    const steps = [28, 72, 50];
    steps.forEach((v, i) => setTimeout(() => {
      if (!el.classList.contains('is-hint')) return;
      range.value = v; el.style.setProperty('--pos', v + '%');
      if (i === steps.length - 1) setTimeout(() => el.classList.remove('is-hint'), 900);
    }, i * 950));
  }

  /* ---------- header ---------- */
  const hdr = $('.hdr');
  const toTop = $('.totop');
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-on', y > innerHeight * 0.9);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // drawer
  const burger = $('.hdr__burger');
  const drawer = $('#drawer');
  const setDrawer = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(drawer.hidden));
  drawer.addEventListener('click', e => { if (e.target.closest('a')) setDrawer(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });

  // active nav link
  const navLinks = $$('.hdr__nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navIO.observe(s));

  /* ---------- hero: before/after + video review ---------- */
  const heroCmp = $('[data-hero-compare]');
  if (heroCmp) { initCompare(heroCmp); setTimeout(() => hint(heroCmp), 2100); }

  const preview = $('[data-hero-video]');
  const lb = $('[data-video-lb]');
  const full = $('[data-video-full]');
  if (preview && reduced) { preview.removeAttribute('autoplay'); preview.pause(); }
  if (preview && lb && full) {
    const open = () => {
      const s = $('source', full);
      if (!s.src) { s.src = s.dataset.src; full.load(); }
      preview.pause();
      lb.showModal();
      document.body.style.overflow = 'hidden';
      full.muted = false;
      full.play().catch(() => {});
    };
    $('[data-video-open]').addEventListener('click', open);
    $('[data-video-close]').addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => {
      full.pause();
      document.body.style.overflow = '';
      if (!reduced) preview.play().catch(() => {});
    });
  }

  /* ---------- case study: before/after + click-to-play video ---------- */
  const caseCmp = $('[data-case-compare]');
  if (caseCmp) initCompare(caseCmp);
  const caseFig = $('[data-case-video]');
  if (caseFig) {
    const v = $('video', caseFig);
    $('[data-case-play]', caseFig).addEventListener('click', () => {
      caseFig.classList.add('is-playing');
      v.controls = true;
      v.play().catch(() => {});
      v.focus();
    });
  }

  /* ---------- google review: read more ---------- */
  const grBtn = $('[data-gr-more]');
  if (grBtn) {
    const sec = grBtn.closest('.gr'), txt = $('[data-gr-text]');
    grBtn.addEventListener('click', () => {
      const open = !sec.classList.contains('is-open');
      if (open) { txt.style.maxHeight = txt.scrollHeight + 'px'; }
      else { txt.style.maxHeight = ''; }
      sec.classList.toggle('is-open', open);
      grBtn.textContent = open ? 'Read less' : 'Read more';
      grBtn.setAttribute('aria-expanded', open);
    });
  }

  /* ---------- before & after carousel ---------- */
  const track = $('[data-ba-track]');
  track.innerHTML = CASES.map((c, i) => `
    <figure class="ba__slide" aria-label="Patient ${i + 1} of ${CASES.length}">
      <div class="compare" data-compare style="--pos:50%">
        <img class="compare__before" src="${src(c, 'before')}" alt="Patient ${i + 1} before ${c.title.toLowerCase()}" width="400" height="620" loading="lazy">
        <img class="compare__after" src="${src(c, 'after')}" alt="Patient ${i + 1} after ${c.title.toLowerCase()}" width="400" height="620" loading="lazy">
        <span class="compare__line" aria-hidden="true"><span class="compare__knob"></span></span>
        <input class="compare__range" type="range" min="0" max="100" value="50" aria-label="Drag to compare patient ${i + 1} before and after">
      </div>
      <figcaption class="ba__cap"><h3>${c.title}</h3><p>${c.text}</p></figcaption>
    </figure>`).join('');
  $$('.compare', track).forEach(initCompare);

  let bi = 0;
  const perView = () => (matchMedia('(max-width: 900px)').matches ? 1 : 2);
  const prevB = $('[data-ba-prev]'), nextB = $('[data-ba-next]');
  const showBA = i => {
    const pv = perView();
    const max = CASES.length - pv;
    bi = Math.max(0, Math.min(i, max));
    const slide = track.children[0];
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 28;
    track.style.transform = `translateX(${-bi * (slide.getBoundingClientRect().width + gap)}px)`;
    prevB.disabled = bi === 0;
    nextB.disabled = bi === max;
    renderDots(pv, max);
  };
  // dot navigation under the slides: one dot per view
  const dotsB = $('[data-ba-dots]');
  const renderDots = (pv, max) => {
    const pages = Math.ceil(CASES.length / pv);
    if (dotsB.children.length !== pages) {
      dotsB.innerHTML = Array.from({ length: pages }, (_, k) => {
        const from = Math.min(k * pv, max) + 1;
        const label = pv === 1 ? `Patient ${from}` : `Patients ${from} and ${from + 1}`;
        return `<button type="button" class="ba__dot" aria-label="Show ${label}"></button>`;
      }).join('');
    }
    const active = bi >= max ? pages - 1 : Math.floor(bi / pv);
    [...dotsB.children].forEach((d, k) => {
      d.classList.toggle('is-active', k === active);
      d.setAttribute('aria-current', k === active ? 'true' : 'false');
    });
  };
  dotsB.addEventListener('click', e => {
    const d = e.target.closest('.ba__dot');
    if (!d) return;
    const k = [...dotsB.children].indexOf(d);
    showBA(k * perView());
  });
  prevB.addEventListener('click', () => showBA(bi - perView()));
  nextB.addEventListener('click', () => showBA(bi + perView()));
  addEventListener('resize', () => showBA(bi));
  showBA(0);
  // swipe on touch (outside the slider handle)
  let sx = null;
  track.addEventListener('touchstart', e => { if (!e.target.closest('.compare')) sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) showBA(bi + (dx < 0 ? perView() : -perView()));
  });

  /* ---------- reviews: continuously moving carousel ---------- */
  const rvTrack = $('[data-rv-track]');
  const rvView = $('[data-rv-viewport]');
  const rvCards = $$('.rcard', rvTrack);
  rvCards.forEach((c, k) => { c.dataset.k = k; });
  const measure = () => $$('.rcard', rvTrack).forEach(c => {
    if (c.classList.contains('is-open')) return;
    const t = $('.rcard__text', c);
    c.classList.toggle('has-more', t.scrollHeight > t.clientHeight + 2);
  });
  rvTrack.addEventListener('click', e => {
    const btn = e.target.closest('.rcard__more');
    if (!btn) return;
    const card = btn.closest('.rcard');
    const open = !card.classList.contains('is-open');
    card.classList.toggle('is-open', open);
    btn.textContent = open ? 'Read less' : 'Read more';
    btn.setAttribute('aria-expanded', open);
  });
  if (!reduced) {
    // duplicate the set so the loop is seamless; copies are hidden from assistive tech
    rvCards.forEach(c => {
      const d = c.cloneNode(true);
      d.setAttribute('aria-hidden', 'true'); d.inert = true;
      rvTrack.appendChild(d);
    });
    const SPEED = 38; // px per second
    let x = 0, last = 0, hover = false, drag = null;
    const paused = () => hover || drag || rvTrack.querySelector('.rcard.is-open') || rvView.contains(document.activeElement);
    const tick = t => {
      const dt = last ? Math.min(t - last, 64) / 1000 : 0; last = t;
      if (!paused()) x -= SPEED * dt;
      const w = rvTrack.scrollWidth / 2;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      rvTrack.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    rvView.addEventListener('mouseenter', () => { hover = true; });
    rvView.addEventListener('mouseleave', () => { hover = false; });
    // swipe to move it by hand on touch screens
    rvView.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') drag = { sx: e.clientX, x0: x }; });
    addEventListener('pointermove', e => { if (drag) x = drag.x0 + (e.clientX - drag.sx); }, { passive: true });
    addEventListener('pointerup', () => { drag = null; });
    addEventListener('pointercancel', () => { drag = null; });
  }
  measure();
  document.fonts && document.fonts.ready.then(measure);
  addEventListener('resize', measure);

  /* ---------- tabs ---------- */
  $$('[data-tabs]').forEach(tabs => {
    const btns = $$('[role="tab"]', tabs);
    const sel = b => {
      btns.forEach(x => {
        const on = x === b;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => sel(b));
      b.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const nb = btns[(i + d + btns.length) % btns.length];
        sel(nb); nb.focus();
      });
    });
  });

  /* ---------- journey timeline: line fills as you scroll ---------- */
  const tl = $('[data-timeline]');
  if (tl) {
    let tlTick = false;
    const tlRun = () => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      tl.style.setProperty('--tp', p.toFixed(3));
      tlTick = false;
    };
    addEventListener('scroll', () => { if (!tlTick) { tlTick = true; requestAnimationFrame(tlRun); } }, { passive: true });
    tlRun();
    // mobile arrows: move one card at a time
    const jStep = () => { const c = tl.children[0]; return c ? c.getBoundingClientRect().width + 16 : 300; };
    const jPrev = $('[data-j-prev]'), jNext = $('[data-j-next]');
    const jUpd = () => {
      jPrev.disabled = tl.scrollLeft < 4;
      jNext.disabled = tl.scrollLeft > tl.scrollWidth - tl.clientWidth - 4;
    };
    jPrev.addEventListener('click', () => tl.scrollBy({ left: -jStep(), behavior: 'smooth' }));
    jNext.addEventListener('click', () => tl.scrollBy({ left: jStep(), behavior: 'smooth' }));
    tl.addEventListener('scroll', jUpd, { passive: true });
    addEventListener('resize', jUpd);
    jUpd();
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  $$('.reveal, .reveal-img').forEach((el, i) => {
    el.style.transitionDelay = el.classList.contains('reveal') ? ((i % 4) * 70) + 'ms' : '0ms';
    io.observe(el);
  });

  /* ---------- parallax ---------- */
  const px = $$('[data-parallax]');
  if (!reduced && px.length) {
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      px.forEach(el => {
        if (getComputedStyle(el).position === 'static' && !el.classList.contains('benefits__bg') && !el.classList.contains('price__bg')) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const k = parseFloat(el.dataset.parallax);
        const off = (r.top + r.height / 2 - vh / 2) * k;
        el.style.translate = `0 ${off.toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- accreditation logos: duplicate for the mobile scrolling line ---------- */
  const logoList = $('.logos ul');
  if (logoList) $$('li', logoList).forEach(li => {
    const c = li.cloneNode(true);
    c.classList.add('is-clone'); c.setAttribute('aria-hidden', 'true');
    $('img', c).alt = '';
    logoList.appendChild(c);
  });

  /* ---------- misc ---------- */
  const yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();
})();
