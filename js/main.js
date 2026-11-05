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

  /* ---------- hero mini slider ---------- */
  const mini = $('[data-mini-compare]');
  const miniCases = [CASES[0], CASES[3], CASES[5]];
  let mi = 0;
  initCompare(mini);
  const showMini = i => {
    mi = (i + miniCases.length) % miniCases.length;
    const c = miniCases[mi];
    $('.compare__before', mini).src = src(c, 'before');
    $('.compare__after', mini).src = src(c, 'after');
    $('[data-mini-i]').textContent = mi + 1;
    hint(mini);
  };
  $('[data-mini-prev]').addEventListener('click', () => showMini(mi - 1));
  $('[data-mini-next]').addEventListener('click', () => showMini(mi + 1));
  setTimeout(() => hint(mini), 2100);

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
  const prevB = $('[data-ba-prev]'), nextB = $('[data-ba-next]'), countB = $('[data-ba-i]');
  const showBA = i => {
    const pv = perView();
    const max = CASES.length - pv;
    bi = Math.max(0, Math.min(i, max));
    const slide = track.children[0];
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 28;
    track.style.transform = `translateX(${-bi * (slide.getBoundingClientRect().width + gap)}px)`;
    countB.textContent = pv === 1 ? `${bi + 1}` : `${bi + 1} and ${bi + 2}`;
    prevB.disabled = bi === 0;
    nextB.disabled = bi === max;
  };
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

  /* ---------- reviews carousel (static, arrow navigation) ---------- */
  const rvTrack = $('[data-rv-track]');
  const rvCards = $$('.rcard', rvTrack);
  const rvPrev = $('[data-rv-prev]'), rvNext = $('[data-rv-next]');
  let ri = 0;
  const rvPer = () => (matchMedia('(max-width: 680px)').matches ? 1 : matchMedia('(max-width: 1080px)').matches ? 2 : 3);
  const showRV = i => {
    const max = Math.max(0, rvCards.length - rvPer());
    ri = Math.max(0, Math.min(i, max));
    const w = rvCards[0].getBoundingClientRect().width + 24;
    rvTrack.style.transform = `translateX(${-ri * w}px)`;
    rvPrev.disabled = ri === 0;
    rvNext.disabled = ri === max;
    rvCards.forEach((c, k) => c.toggleAttribute('inert', k < ri || k >= ri + rvPer()));
  };
  rvPrev.addEventListener('click', () => showRV(ri - 1));
  rvNext.addEventListener('click', () => showRV(ri + 1));
  let rsx = null;
  rvTrack.addEventListener('touchstart', e => { rsx = e.touches[0].clientX; }, { passive: true });
  rvTrack.addEventListener('touchend', e => {
    if (rsx === null) return;
    const dx = e.changedTouches[0].clientX - rsx; rsx = null;
    if (Math.abs(dx) > 50) showRV(ri + (dx < 0 ? 1 : -1));
  });
  const measure = () => rvCards.forEach(c => {
    if (c.classList.contains('is-open')) return;
    const t = $('.rcard__text', c);
    c.classList.toggle('has-more', t.scrollHeight > t.clientHeight + 2);
  });
  measure();
  document.fonts && document.fonts.ready.then(measure);
  addEventListener('resize', () => { measure(); showRV(ri); });
  rvTrack.addEventListener('click', e => {
    const btn = e.target.closest('.rcard__more');
    if (!btn) return;
    const card = btn.closest('.rcard');
    const open = !card.classList.contains('is-open');
    card.classList.toggle('is-open', open);
    btn.textContent = open ? 'Read less' : 'Read more';
    btn.setAttribute('aria-expanded', open);
  });
  showRV(0);

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

  /* ---------- form (design only: validates and shows confirmation) ---------- */
  const form = $('[data-form]');
  const err = (field, text) => {
    const wrap = field.closest('.field');
    let m = $('.field__err', wrap);
    wrap.classList.toggle('is-error', !!text);
    if (text) {
      if (!m) { m = document.createElement('span'); m.className = 'field__err'; wrap.appendChild(m); }
      m.textContent = text;
      field.setAttribute('aria-invalid', 'true');
    } else { m && m.remove(); field.removeAttribute('aria-invalid'); }
  };
  const check = f => {
    const v = f.value.trim();
    if (f.required && !v) return f.tagName === 'SELECT' ? 'Choose how you heard about us.' : 'Fill in this field.';
    if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter an email address like name@example.com.';
    if (f.type === 'tel' && v && v.replace(/\D/g, '').length < 10) return 'Enter a phone number with at least 10 digits.';
    return '';
  };
  $$('input, select, textarea', form).forEach(f => f.addEventListener('blur', () => { if (f.value) err(f, check(f)); }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    let first = null;
    $$('input, select, textarea', form).forEach(f => {
      const m = check(f); err(f, m);
      if (m && !first) first = f;
    });
    if (first) { first.focus(); return; }
    $('.form__done', form).hidden = false;
    form.reset();
  });

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
