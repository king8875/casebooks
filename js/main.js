(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var hasDarkHero = !!document.querySelector('.hero');

  function onScroll() {
    var y = window.scrollY > 24;
    header.classList.toggle('scrolled', y);
    header.classList.toggle('on-dark', hasDarkHero && !y);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var gnb = document.querySelector('.gnb');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = gnb.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  /* search layer (데모: 메뉴/콘텐츠 이동용) */
  var layer = document.querySelector('.search-layer');
  var openBtn = document.querySelector('[data-search-open]');
  if (layer && openBtn) {
    var input = layer.querySelector('input');
    openBtn.addEventListener('click', function () { layer.classList.add('open'); document.body.classList.add('search-opened'); input.focus(); });
    layer.querySelector('.search-close').addEventListener('click', function () { layer.classList.remove('open'); document.body.classList.remove('search-opened'); });
    layer.addEventListener('click', function (e) { if (e.target === layer) { layer.classList.remove('open'); document.body.classList.remove('search-opened'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { layer.classList.remove('open'); document.body.classList.remove('search-opened'); } });
    layer.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (q) location.href = 'blog.html?q=' + encodeURIComponent(q);
    });
  }

  /* scroll reveal */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  var ctaPanel = document.querySelector('.panel-cta');
  if (ctaPanel && 'IntersectionObserver' in window) {
    var ctaIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        ctaPanel.classList.toggle('in-view', en.isIntersecting);
      });
    }, { threshold: 0.18 });
    ctaIo.observe(ctaPanel);
  } else if (ctaPanel) {
    ctaPanel.classList.add('in-view');
  }

  /* category filter (blog / portfolio) */
  var filter = document.querySelector('.filter');
  if (filter) {
    var targets = document.querySelectorAll('[data-cat]');
    var emptyMsg = document.querySelector('.empty');
    function apply(cat, q) {
      var shown = 0;
      targets.forEach(function (t) {
        var okCat = cat === '전체' || t.dataset.cat === cat;
        var okQ = !q || t.textContent.indexOf(q) > -1;
        var ok = okCat && okQ;
        t.classList.toggle('hidden', !ok);
        if (ok) shown++;
      });
      if (emptyMsg) emptyMsg.classList.toggle('hidden', shown > 0);
    }
    var params = new URLSearchParams(location.search);
    var q = params.get('q') || '';
    filter.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      filter.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      apply(b.dataset.filter, '');
    });
    if (q) apply('전체', q);
  }

  /* faq accordion */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });

  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('open');
      var icon = btn.querySelector('.faq-icon');
      btn.setAttribute('aria-expanded', open);
      if (icon) icon.textContent = open ? '−' : '+';
    });
  });

  /* contact form (프론트 검증만 — 전송은 locozstudio CMS 연동 예정) */
  var form = document.getElementById('contactForm');
  if (form) {
    var phone = form.querySelector('[name=phone]');
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/[^0-9]/g, '').slice(0, 11), o = d;
      if (d.length > 7) o = d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(-4);
      else if (d.length > 3) o = d.slice(0, 3) + '-' + d.slice(3);
      phone.value = o;
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var invalid = f.type === 'checkbox' ? !f.checked : !f.value.trim();
        if (f.type === 'email' && f.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) invalid = true;
        f.classList.toggle('invalid', invalid);
        if (invalid && !bad) bad = f;
      });
      if (bad) { bad.focus(); return; }
      form.querySelector('.form-msg').classList.add('show');
      form.reset();
      window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
    });
  }


  /* scroll story (sticky stage: 스크롤에 따라 단계 전환) */
  var story = document.querySelector('.story');
  if (story) {
    var items = story.querySelectorAll('.story-item');
    var cards = story.querySelectorAll('.story-card');
    var navLis = story.querySelectorAll('.story-nav li');
    var navBtns = story.querySelectorAll('.story-nav button');
    var now = story.querySelector('.story-now');
    var bar = story.querySelector('.story-progress i');
    var bgLayers = story.querySelectorAll('.story-bg-layer');
    var bgIndex = 0;
    var storyImages = [
      'linear-gradient(90deg, rgba(8, 10, 9, .68), rgba(8, 10, 9, .28) 52%, rgba(8, 10, 9, .42)), url("https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1900&q=82")',
      'linear-gradient(90deg, rgba(8, 10, 9, .72), rgba(8, 10, 9, .30) 52%, rgba(8, 10, 9, .46)), url("https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1900&q=82")',
      'linear-gradient(90deg, rgba(8, 10, 9, .72), rgba(8, 10, 9, .28) 52%, rgba(8, 10, 9, .44)), url("https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1900&q=82")',
      'linear-gradient(90deg, rgba(8, 10, 9, .72), rgba(8, 10, 9, .28) 52%, rgba(8, 10, 9, .44)), url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1900&q=82")',
      'linear-gradient(90deg, rgba(8, 10, 9, .68), rgba(8, 10, 9, .28) 52%, rgba(8, 10, 9, .42)), url("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1900&q=82")',
      'linear-gradient(90deg, rgba(8, 10, 9, .72), rgba(8, 10, 9, .28) 52%, rgba(8, 10, 9, .44)), url("https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1900&q=82")',
      'linear-gradient(90deg, rgba(8, 10, 9, .72), rgba(8, 10, 9, .28) 52%, rgba(8, 10, 9, .44)), url("https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1900&q=82")'
    ];
    var total = items.length, cur = -1, ticking = false;

    function setStep(i) {
      if (i === cur) return;
      cur = i;
      story.dataset.current = String(i);
      if (bgLayers.length > 1) {
        var currentLayer = bgLayers[bgIndex];
        var nextIndex = bgIndex ? 0 : 1;
        var nextLayer = bgLayers[nextIndex];
        nextLayer.style.backgroundImage = storyImages[i];
        nextLayer.classList.remove('is-leaving');
        currentLayer.classList.add('is-leaving');
        requestAnimationFrame(function () {
          nextLayer.classList.add('is-active');
          currentLayer.classList.remove('is-active');
        });
        window.setTimeout(function () {
          currentLayer.classList.remove('is-leaving');
        }, 720);
        bgIndex = nextIndex;
      }
      items.forEach(function (el, k) { el.classList.toggle('active', k === i); el.setAttribute('aria-hidden', k !== i); });
      cards.forEach(function (el, k) { el.classList.toggle('active', k === i); });
      navLis.forEach(function (el, k) { el.classList.toggle('active', k === i); el.classList.toggle('done', k < i); });
      navBtns.forEach(function (el, k) { if (k === i) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current'); });
      now.textContent = ('0' + (i + 1)).slice(-2);
    }
    if (bgLayers.length) bgLayers[0].style.backgroundImage = storyImages[0];
    function update() {
      ticking = false;
      var r = story.getBoundingClientRect();
      var span = story.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / span));
      setStep(Math.min(total - 1, Math.floor(p * total)));
      bar.style.width = (p * 100) + '%';
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = +btn.dataset.step;
        var span = story.offsetHeight - window.innerHeight;
        var top = story.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + span * (i + 0.5) / total, behavior: 'smooth' });
      });
    });
    update();
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var topBtn = document.querySelector('.quick-top');
  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
