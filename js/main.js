(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var hasDarkHero = !!document.querySelector('.hero, .about-hero, .sub-hero');

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

  /* representative case slider */
  var caseSlider = document.querySelector('[data-case-slider]');
  var SwiperCtor = window.Swiper || (typeof Swiper !== 'undefined' ? Swiper : null);
  if (caseSlider && SwiperCtor) {
    new SwiperCtor(caseSlider, {
      slidesPerView: 1.15,
      spaceBetween: 18,
      speed: 550,
      watchOverflow: true,
      navigation: {
        prevEl: '[data-case-prev]',
        nextEl: '[data-case-next]',
        disabledClass: 'is-disabled'
      },
      breakpoints: {
        821: {
          slidesPerView: 2.5,
          spaceBetween: 28
        },
        1101: {
          slidesPerView: 3.5,
          spaceBetween: 28
        }
      }
    });
  }

  /* case cards: image slider (Swiper). Uses at most the first 3 images (e.g. taken from the detail page);
     dots and swipe both move it, and the dots are dropped when there is only one image. */
  var CASE_IMG_MAX = 3;
  document.querySelectorAll('[data-case-imgs]').forEach(function (box) {
    var card = box.closest('.case-slide-card');
    var wrapper = box.querySelector('.swiper-wrapper');
    var dots = card && card.querySelector('.case-dots');
    if (!wrapper) return;
    var slides = Array.prototype.slice.call(wrapper.children);
    slides.slice(CASE_IMG_MAX).forEach(function (el) { el.remove(); });
    slides = slides.slice(0, CASE_IMG_MAX);
    if (slides.length < 2 || !SwiperCtor) { if (dots) dots.remove(); return; }
    new SwiperCtor(box, {
      speed: 450,
      watchOverflow: true,
      nested: !!box.closest('[data-case-slider]'),   /* inside the home slider: edges hand the drag to the outer one */
      pagination: {
        el: dots,
        clickable: true,
        bulletClass: 'case-dot',
        bulletActiveClass: 'is-active',
        clickableClass: 'case-dots-clickable',
        modifierClass: 'case-dots-',
        horizontalClass: 'case-dots-horizontal',
        renderBullet: function (i, cls) {
          return '<button type="button" class="' + cls + '" aria-label="' + (i + 1) + '번째 이미지 보기"></button>';
        }
      }
    });
  });

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

  /* measured card hover */
  var hoverCards = document.querySelectorAll('.panel-cases .card, .panel-blog .card, .section .grid-3 > .card, .section .grid-4 > .card');
  function setCardHeights(card) {
    var body = card.querySelector('.card-body');
    if (!body) return;

    var wasOpen = card.classList.contains('card-smooth-open');
    card.classList.remove('card-smooth-open');
    var closed = Math.ceil(body.getBoundingClientRect().height);
    card.style.setProperty('--card-closed-height', closed + 'px');

    var details = body.querySelectorAll('.tag, p, .card-meta');
    var previous = [];
    details.forEach(function (el) {
      previous.push({
        el: el,
        style: el.getAttribute('style')
      });
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'translateY(0)', 'important');
      if (el.classList.contains('tag')) el.style.setProperty('margin-bottom', '8px', 'important');
      else el.style.setProperty('margin-top', '12px', 'important');
    });
    card.classList.add('card-smooth-measuring');
    body.style.height = 'auto';
    var open = Math.max(closed, Math.ceil(body.scrollHeight));
    body.style.height = '';
    card.classList.remove('card-smooth-measuring');
    previous.forEach(function (item) {
      if (item.style === null) item.el.removeAttribute('style');
      else item.el.setAttribute('style', item.style);
    });
    card.style.setProperty('--card-open-height', open + 'px');
    if (wasOpen) card.classList.add('card-smooth-open');
  }

  hoverCards.forEach(function (card) {
    var body = card.querySelector('.card-body');
    if (!body) return;
    card.classList.add('card-smooth-ready');
    setCardHeights(card);
    card.addEventListener('mouseenter', function () {
      card.classList.add('card-smooth-open');
    });
    card.addEventListener('mouseleave', function () {
      card.classList.remove('card-smooth-open');
    });
    card.addEventListener('focusin', function () {
      card.classList.add('card-smooth-open');
    });
    card.addEventListener('focusout', function () {
      card.classList.remove('card-smooth-open');
    });
  });

  window.addEventListener('resize', function () {
    hoverCards.forEach(setCardHeights);
  });

  /* about page interactive cards and counters */
  var aboutStats = document.querySelectorAll('.about-stat strong[data-count]');
  if (aboutStats.length) {
    var countUp = function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      var target = parseInt(el.dataset.count, 10) || 0;
      var start = performance.now();
      var duration = 900;
      function tick(now) {
        var p = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var statIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUp(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      }, { threshold: .45 });
      aboutStats.forEach(function (el) { statIo.observe(el); });
    } else {
      aboutStats.forEach(countUp);
    }
  }

  var aboutCoverStage = document.querySelector('.about-cover-stage');
  if (aboutCoverStage) {
    var aboutCovers = Array.prototype.slice.call(aboutCoverStage.querySelectorAll('.about-cover'));
    var coverRoles = ['is-main', 'is-side', 'is-back'];
    var coverIndex = 0;
    if (aboutCovers.length > 1) {
      window.setInterval(function () {
        coverIndex = (coverIndex + 1) % aboutCovers.length;
        aboutCovers.forEach(function (cover, i) {
          coverRoles.forEach(function (role) { cover.classList.remove(role); });
          cover.classList.add(coverRoles[(i - coverIndex + aboutCovers.length) % aboutCovers.length]);
        });
      }, 3000);
    }
  }

  var aboutFlow = document.querySelector('[data-about-flow]');
  if (aboutFlow) {
    var flowCards = aboutFlow.querySelectorAll('.flow-card');
    function updateAboutFlow() {
      var rect = aboutFlow.getBoundingClientRect();
      var max = Math.max(1, rect.height - window.innerHeight);
      var progress = Math.min(1, Math.max(0, -rect.top / max));
      var active = Math.min(flowCards.length - 1, Math.floor(progress * flowCards.length));
      flowCards.forEach(function (card, i) {
        card.classList.toggle('active', i === active);
        card.style.setProperty('--offset', i - active);
      });
    }
    updateAboutFlow();
    window.addEventListener('scroll', updateAboutFlow, { passive: true });
    window.addEventListener('resize', updateAboutFlow);
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
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
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


  /* faq page: accordion, live search, category scroll spy */
  var fqItems = document.querySelectorAll('.fq-item');
  if (fqItems.length) {
    document.querySelectorAll('.fq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.parentElement;
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
    });

    var fqSearch = document.querySelector('[data-faq-search]');
    var fqEmpty = document.querySelector('.fq-empty');
    if (fqSearch) {
      fqSearch.addEventListener('input', function () {
        var q = fqSearch.value.trim().toLowerCase();
        var total = 0;
        document.querySelectorAll('[data-fq-group]').forEach(function (group) {
          var any = 0;
          group.querySelectorAll('.fq-item').forEach(function (item) {
            var hit = !q || item.textContent.toLowerCase().indexOf(q) > -1;
            item.classList.toggle('hidden', !hit);
            if (hit) { any++; if (q) { item.classList.add('open'); } }
          });
          group.classList.toggle('hidden', any === 0);
          total += any;
        });
        if (!q) { fqItems.forEach(function (item, i) { item.classList.toggle('open', i === 0); }); }
        if (fqEmpty) fqEmpty.classList.toggle('hidden', total > 0);
      });
    }

    var navLinks = document.querySelectorAll('.fq-nav a');
    var groups = document.querySelectorAll('[data-fq-group]');
    if (navLinks.length && 'IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      groups.forEach(function (g) { spy.observe(g); });
    }
  }


  /* prepare page: clients explorer (tabs + institution search) */
  document.querySelectorAll('[data-cl-explorer]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('.cl-tab'));
    var panels = Array.prototype.slice.call(box.querySelectorAll('.cl-panel'));
    var stage = box.querySelector('.cl-stage');
    var input = box.querySelector('[data-cl-search]');
    var clear = box.querySelector('.cl-search-clear');
    var results = box.querySelector('.cl-results');
    var list = results.querySelector('.cl-names');
    var hit = results.querySelector('[data-cl-hit]');

    var items = [];
    panels.forEach(function (p, i) {
      var cat = tabs[i].querySelector('.cl-name').textContent;
      p.querySelectorAll('.cl-names li').forEach(function (li) { items.push({ name: li.textContent, cat: cat }); });
    });

    function esc(s) { return s.replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }

    function search() {
      var q = input.value.trim();
      clear.hidden = !input.value;
      if (!q) { stage.classList.remove('is-searching'); return; }
      var key = q.replace(/\s+/g, '').toLowerCase();
      var found = items.filter(function (it) { return it.name.replace(/\s+/g, '').toLowerCase().indexOf(key) > -1; });
      var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*') + ')', 'ig');
      list.innerHTML = found.map(function (it) {
        return '<li><span>' + esc(it.name).replace(re, '<mark>$1</mark>') + '</span><em>' + esc(it.cat) + '</em></li>';
      }).join('');
      hit.textContent = found.length;
      results.classList.toggle('is-empty', found.length === 0);
      stage.classList.add('is-searching');
    }

    function reset() { input.value = ''; search(); }

    function select(i, focus) {
      if (input.value) reset();
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, k) { p.classList.toggle('active', k === i); });
      if (focus) tabs[i].focus();
    }

    input.addEventListener('input', search);
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') reset(); });
    clear.addEventListener('click', function () { reset(); input.focus(); });

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var topBtn = document.querySelector('.quick-top');
  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
