/* =====================================================================
   畫面產生器 v3（一般不用改）
   ---------------------------------------------------------------------
   資料（data/*.js）→ 畫面。這個檔案分成兩層：
     A. 產生畫面：選單、各種內容區塊、故事頁、頁尾
     B. 互動效果：捲動進場、數字跑動、時間軸水流、卡牌立體、按鈕漣漪…
   要改文字請改 data/ 裡的檔案，不用動這裡。
   ===================================================================== */
(function () {
  'use strict';

  var SITE = window.SITE || { nav: [], footer: '' };
  var PAGE = window.PAGE || window.STORY || { blocks: [] };
  var REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var FINE   = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);   // 有滑鼠的裝置

  /* ---------- 小工具 ---------- */
  // 放進屬性（網址、圖片說明）的文字要跳脫；內文允許 <b>、<br> 等標籤
  function attr(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function list(arr, fn) { return (arr || []).map(fn).join(''); }
  function plain(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, ''); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function btn(b, cls) {
    if (!b) return '';
    return '<a class="btn ' + (cls || '') + '" href="' + attr(b.href) + '"><span>' + b.label + '</span></a>';
  }
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var secNo = 0;
  function head(title, eyebrow) {
    if (!title) return '';
    secNo++;
    return '<header class="sec-head" data-reveal>' +
      '<span class="sec-no">' + (eyebrow || String(secNo).padStart(2, '0')) + '</span>' +
      '<h2>' + title + '</h2></header>';
  }

  /* =================================================================
     A. 產生畫面
     ================================================================= */

  /* ---------- 上方選單 ---------- */
  function renderNav() {
    var el = document.getElementById('site-nav');
    if (!el) return;
    el.className = 'nav';
    el.innerHTML =
      '<a class="logo" href="index.html"><img src="' + attr(SITE.logo) + '" alt=""><span>' + SITE.name + '</span></a>' +
      '<nav class="nav-links" id="navLinks" aria-label="主選單">' + list(SITE.nav, function (n, i) {
        var cur = n.href.toLowerCase() === here ? ' aria-current="page"' : '';
        return '<a href="' + attr(n.href) + '"' + cur + ' style="--i:' + i + '">' + n.label + '</a>';
      }) + '</nav>' +
      '<button class="nav-toggle" type="button" aria-label="打開選單" aria-expanded="false" aria-controls="menuSheet"><i></i><i></i></button>';

    // 手機用的全螢幕選單（放在選單外面，才能蓋滿整個畫面）
    var sheet = document.createElement('nav');
    sheet.className = 'menu-sheet'; sheet.id = 'menuSheet'; sheet.setAttribute('aria-label', '主選單');
    sheet.innerHTML = el.querySelector('.nav-links').innerHTML;
    el.parentNode.insertBefore(sheet, el.nextSibling);

    // 手機：漢堡選單
    var toggle = el.querySelector('.nav-toggle');
    function setOpen(open) {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '關閉選單' : '打開選單');
    }
    toggle.addEventListener('click', function () { setOpen(!document.body.classList.contains('menu-open')); });
    sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- 頁尾 ---------- */
  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML =
      '<div class="foot-inner">' +
        '<a class="logo" href="index.html"><img src="' + attr(SITE.logo) + '" alt=""><span>' + SITE.name + '</span></a>' +
        '<nav class="foot-links" aria-label="頁尾選單">' + list(SITE.nav, function (n) { return '<a href="' + attr(n.href) + '">' + n.label + '</a>'; }) + '</nav>' +
        '<p class="foot-text">' + (PAGE.footer || SITE.footer || '') + '</p>' +
      '</div>';
  }

  /* ---------- 各種內容區塊 ---------- */
  var BLOCKS = {
    hero: function (b) {
      // 標題拆成一個字一個字，進場時依序浮上來（標題裡有標籤時就不拆）
      var t = /</.test(b.title) ? b.title : list(Array.from(b.title), function (ch, i) {
        return '<span class="ch" style="--i:' + i + '">' + ch + '</span>';
      });
      return '<section class="hero" data-dark>' +
        '<div class="hero-bg" aria-hidden="true"' + (b.bg ? ' style="--hero-bg:url(\'' + attr(b.bg) + '\')"' : '') + '></div>' +
        '<div class="hero-inner">' +
          (b.eyebrow ? '<p class="hero-eyebrow">' + b.eyebrow + '</p>' : '') +
          '<h1 aria-label="' + attr(plain(b.title)) + '">' + t + '</h1>' +
          (b.lead ? '<p class="hero-lead">' + b.lead + '</p>' : '') +
          '<div class="hero-buttons">' + list(b.buttons, function (x, i) { return btn(x, i === 0 ? 'btn-primary' : 'btn-glass'); }) + '</div>' +
        '</div>' +
        // 底部的水波：兩層 SVG 波浪左右流動
        '<svg class="hero-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">' +
          '<path class="w1" d="M0,64 C240,112 480,16 720,64 C960,112 1200,16 1440,64 L1440,120 L0,120 Z"/>' +
          '<path class="w2" d="M0,80 C240,40 480,120 720,80 C960,40 1200,120 1440,80 L1440,120 L0,120 Z"/>' +
        '</svg>' +
        (b.next ? '<a class="scroll-cue" href="' + attr(b.next) + '" aria-label="往下看"><i></i></a>' : '') +
        '</section>';
    },

    facts: function (b) {
      return '<section class="facts"' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '>' +
        list(b.items, function (f, i) {
          return '<div class="fact glass" data-reveal style="--d:' + i + '"><b data-count>' + f.num + '</b><span>' + f.label + '</span></div>';
        }) + '</section>';
    },

    // 3D 模型：元素的 id 給 tres-scene.js 使用，不要改
    model3d: function (b) {
      return '<section class="tres-section" id="model3d" hidden>' +
        head(b.title) +
        '<div class="tres-stage" id="tresStage" aria-label="桃園大圳立體模型，可以左右拖曳旋轉">' +
          '<div class="tres-loading" id="tresLoading"><span class="spinner" aria-hidden="true"></span>3D 模型載入中…</div>' +
          '<div id="tresApp"></div>' +
          '<div class="tres-ui tres-year" id="tresYear">1916 以前</div>' +
          '<div class="tres-ui tres-controls">' +
            '<button type="button" id="tresPlay" aria-label="暫停">⏸</button>' +
            '<button type="button" id="tresReplay" aria-label="從頭播放">↺</button>' +
            '<button type="button" id="tresIn" aria-label="放大">＋</button>' +
            '<button type="button" id="tresOut" aria-label="縮小">－</button>' +
          '</div>' +
          '<div class="tres-progress"><i id="tresBar"></i></div>' +
        '</div>' +
        '<p class="tres-caption" id="tresCaption" aria-live="polite">' + (b.firstCaption || '') + '</p>' +
        '<ul class="tres-legend">' + list(b.legend, function (l) {
          return '<li><i style="background:' + attr(l.color) + '"></i>' + l.label + '</li>';
        }) + '</ul>' +
        (b.note ? '<p class="tres-note">' + b.note + '</p>' : '') +
        '</section>';
    },

    text: function (b) {
      return '<article class="tile glass" data-reveal>' +
        (b.title ? '<h3>' + b.title + '</h3>' : '') +
        list(b.paragraphs, function (p) { return '<p>' + p + '</p>'; }) +
        (b.list ? '<ul class="drops">' + list(b.list, function (li) { return '<li>' + li + '</li>'; }) + '</ul>' : '') +
        '</article>';
    },

    timeline: function (b) {
      return '<section class="section">' + head(b.title) +
        '<ol class="timeline">' + list(b.items, function (t) {
          return '<li data-reveal><b>' + t.when + '</b><p>' + t.text + '</p></li>';
        }) + '</ol>' +
        (b.note ? '<p class="note" data-reveal>' + b.note + '</p>' : '') +
        '</section>';
    },

    map: function (b) {
      return '<section class="section section-wide">' + head(b.title) +
        '<div class="map-frame" data-reveal><iframe src="' + attr(b.src) + '" title="桃園大圳互動灌溉地圖" loading="lazy"></iframe></div>' +
        '<div class="map-foot" data-reveal>' +
          (b.text ? '<p>' + b.text + '</p>' : '') +
          '<a class="link-arrow" href="map.html">' + (b.moreLabel || '在新頁面打開互動地圖') + '</a>' +
        '</div>' +
        '</section>';
    },

    cta: function (b) {
      return '<section class="section">' +
        '<div class="cta" data-reveal data-dark>' +
          '<div class="cta-ripples" aria-hidden="true"><i></i><i></i><i></i></div>' +
          '<h2>' + b.title + '</h2>' + (b.text ? '<p>' + b.text + '</p>' : '') + btn(b.button, 'btn-primary btn-light') +
        '</div></section>';
    },

    intro: function (b) {
      return '<section class="intro">' +
        '<div class="intro-text">' +
          '<h1 data-reveal>' + b.title + '</h1>' + (b.lead ? '<p class="intro-lead" data-reveal>' + b.lead + '</p>' : '') +
        '</div>' +
        (b.image ? '<figure class="intro-figure" data-reveal data-tilt><img src="' + attr(b.image) + '" alt="' + attr(b.alt) + '">' +
          (b.caption ? '<figcaption>' + b.caption + '</figcaption>' : '') + '</figure>' : '') +
        '</section>';
    },

    cards: function (b) {
      return '<section class="section section-wide">' + head(b.title) +
        (b.note ? '<p class="note center" data-reveal>' + b.note + '</p>' : '') +
        '<div class="cards">' + list(b.cards, function (c, i) {
          return '<div class="card" data-reveal style="--d:' + i + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + attr(plain(c.title)) + '：翻面看卡牌背後的歷史">' +
            '<div class="card-inner">' +
              '<div class="front"><small>' + c.kind + '</small><h3>' + c.title + '</h3><p>' + (c.sub || '') + '</p>' +
                '<span class="flip-hint" aria-hidden="true">點一下翻面</span></div>' +
              '<div class="back" aria-hidden="true"><p>' + c.back + '</p>' +
                (c.more ? '<a class="more" href="' + attr(c.more.href) + '" tabindex="-1">' + c.more.label + '</a>' : '') + '</div>' +
            '</div><i class="glare" aria-hidden="true"></i></div>';
        }) + '</div>' +
        (b.button ? '<p class="center" data-reveal>' + btn(b.button, 'btn-primary') + '</p>' : '') +
        '</section>';
    }
  };

  function renderBlocks() {
    var app = document.getElementById('app');
    if (!app || !PAGE.blocks) return;
    var html = '', B = PAGE.blocks;
    for (var i = 0; i < B.length; i++) {
      var b = B[i];
      if (b.type === 'text') {
        // 連續的 text 區塊收成一組，電腦上並排
        var group = [];
        while (i < B.length && B[i].type === 'text') group.push(B[i++]);
        i--;
        html += '<section class="section section-wide"><div class="bento' + (group.length === 1 ? ' one' : '') + '">' +
          list(group, BLOCKS.text) + '</div></section>';
        continue;
      }
      if (!BLOCKS[b.type]) { console.warn('不認得的區塊類型：' + b.type); continue; }
      html += BLOCKS[b.type](b);
    }
    app.innerHTML = html;
    if (B[0] && B[0].type === 'hero') document.body.classList.add('has-hero');
  }

  /* ---------- 大圳故事頁（一格一格往下滑） ---------- */
  function renderStory() {
    var app = document.getElementById('app');
    if (!app || !PAGE.panels) return;
    var P = PAGE.panels;
    document.documentElement.classList.add('snap');
    document.body.classList.add('has-hero');
    app.innerHTML = list(P, function (p, i) {
      var tint = p.light ? '244,239,228' : '8,22,33';
      var s = p.shade == null ? 0.5 : p.shade;
      var style = '--shade:linear-gradient(180deg,rgba(' + tint + ',' + Math.min(1, s + 0.12) + '),rgba(' + tint + ',' + s + ') 45%,rgba(' + tint + ',' + Math.min(1, s + 0.18) + '));' +
        (p.bg ? '--img:url(\'' + attr(p.bg) + '\');' : '') +
        (p.bgMobile ? '--img-m:url(\'' + attr(p.bgMobile) + '\');' : '') +
        (p.bgPos ? '--bg-pos:' + attr(p.bgPos) + ';' : '') +
        (p.color ? '--bg-color:' + attr(p.color) + ';' : '');
      var next = P[i + 1];
      return '<section class="panel' + (p.light ? ' light' : '') + '" id="' + attr(p.id) + '" style="' + style + '"' + (p.light ? '' : ' data-dark') + '>' +
        '<div class="panel-bg" aria-hidden="true"></div>' +
        '<div class="panel-inner">' +
          '<span class="panel-no">' + String(i + 1).padStart(2, '0') + ' / ' + String(P.length).padStart(2, '0') + '</span>' +
          (p.big ? '<div class="big" data-count>' + p.big + '</div>' : '') +
          '<h2>' + p.title + '</h2>' +
          (p.text ? '<p>' + p.text + '</p>' : '') +
          (p.buttons ? '<div class="panel-buttons">' + list(p.buttons, function (x) {
            return '<a class="btn btn-primary" href="' + attr(x.href) + '"' + (x.color ? ' style="--btn-bg:' + attr(x.color) + '"' : '') + '><span>' + x.label + '</span></a>';
          }) + '</div>' : '') +
        '</div>' +
        (p.credit ? '<small class="credit">' + p.credit + '</small>' : '') +
        (next ? '<a class="scroll-cue" href="#' + attr(next.id) + '" aria-label="下一段"><i></i></a>' : '') +
        '</section>';
    });

    // 右側的小圓點：看得出讀到第幾格，也可以點了直接跳過去
    var dots = document.createElement('nav');
    dots.className = 'story-dots';
    dots.setAttribute('aria-label', '故事段落');
    dots.innerHTML = list(P, function (p, i) {
      return '<a href="#' + attr(p.id) + '" aria-label="第 ' + (i + 1) + ' 段：' + attr(plain(p.title)) + '"><span>' + plain(p.title) + '</span></a>';
    });
    document.body.appendChild(dots);
    var dotLinks = $$('a', dots);
    var panels = $$('.panel', app);

    // 進到某一格：圓點亮起、背景慢慢推近、文字依序浮現、數字跑動
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('active', e.isIntersecting);
        if (!e.isIntersecting) return;
        var idx = panels.indexOf(e.target);
        dotLinks.forEach(function (d, j) { d.classList.toggle('on', j === idx); });
        document.body.classList.toggle('on-light', e.target.classList.contains('light'));
        var big = e.target.querySelector('[data-count]');
        if (big) countUp(big);
      });
    }, { threshold: 0.55 });
    panels.forEach(function (s) { watch.observe(s); });

    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) requestAnimationFrame(function () { t.scrollIntoView({ behavior: 'auto' }); });
    }
  }

  /* =================================================================
     B. 互動效果
     ================================================================= */

  /* ---------- 捲動：選單變化、閱讀進度條、回到頂端 ---------- */
  function setupScroll() {
    var nav = document.getElementById('site-nav');
    var bar = document.createElement('div');
    bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var top = null;
    if (!PAGE.panels) {
      top = document.createElement('button');
      top.className = 'to-top glass'; top.type = 'button'; top.setAttribute('aria-label', '回到頂端');
      top.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="ring-bg" cx="20" cy="20" r="17"/><circle class="ring" cx="20" cy="20" r="17"/><path d="M14 22l6-6 6 6"/></svg>';
      top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' }); });
      document.body.appendChild(top);
    }

    var darkZones = $$('[data-dark]');
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      var p = max > 0 ? Math.min(1, y / max) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      if (nav) {
        nav.classList.toggle('scrolled', y > 24);
        // 選單底下是深色區塊（大標題、故事頁）時，選單文字變白
        var probe = 40, dark = false;
        for (var i = 0; i < darkZones.length; i++) {
          var r = darkZones[i].getBoundingClientRect();
          if (r.top <= probe && r.bottom >= probe) { dark = true; break; }
        }
        nav.classList.toggle('on-dark', dark);
      }
      if (top) {
        top.classList.toggle('show', y > innerHeight * 0.8);
        top.style.setProperty('--p', p);
      }
      timelineFill();
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- 時間軸：捲動時，水沿著線往下流 ---------- */
  var timelines = [];
  function timelineFill() {
    timelines.forEach(function (ol) {
      var r = ol.getBoundingClientRect(), mid = innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      ol.style.setProperty('--fill', p);
      $$('li', ol).forEach(function (li) {
        li.classList.toggle('lit', li.getBoundingClientRect().top + 14 < mid);
      });
    });
  }

  /* ---------- 進場動畫 ---------- */
  function setupReveal() {
    var items = $$('[data-reveal]');
    timelines = $$('.timeline');
    if (REDUCE || !('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
    document.documentElement.classList.add('motion');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        io.unobserve(el);
        $$('[data-count]', el).concat(el.matches('[data-count]') ? [el] : []).forEach(countUp);
        // 進場跑完後拿掉延遲，之後滑過的效果才會立刻反應
        setTimeout(function () { el.classList.add('done'); }, 1200);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 數字跑動：1916、231、15.62 公里… ---------- */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var m = /^(\d+(?:\.\d+)?)([^\d.].*)?$/.exec(el.textContent.trim());   // 開頭是數字才跑（1924.5.26 這種不跑）
    if (!m || REDUCE) return;
    var end = parseFloat(m[1]), rest = m[2] || '', dec = (m[1].split('.')[1] || '').length;
    var start = end >= 1000 ? end - 120 : 0, t0 = null, dur = 1400;
    function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);   // 先快後慢
      el.textContent = (start + (end - start) * e).toFixed(dec) + rest;
      if (k < 1) requestAnimationFrame(frame); else el.textContent = m[1] + rest;
    }
    el.textContent = start.toFixed(dec) + rest;
    requestAnimationFrame(frame);
  }

  /* ---------- 卡牌：翻面＋滑鼠立體傾斜＋反光 ---------- */
  function setupCards() {
    $$('.card').forEach(function (card) {
      var back = card.querySelector('.back'), front = card.querySelector('.front'), link = card.querySelector('.more');
      function flip() {
        var on = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (back)  back.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (front) front.setAttribute('aria-hidden', on ? 'true' : 'false');
        if (link)  link.tabIndex = on ? 0 : -1;          // 翻到背面時，連結才能用 Tab 選到
      }
      card.addEventListener('click', function (e) { if (!e.target.closest('a')) flip(); });
      card.addEventListener('keydown', function (e) {
        if (e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });
  }
  function setupTilt() {
    if (!FINE || REDUCE) return;
    $$('.card, [data-tilt]').forEach(function (el) {
      var max = el.classList.contains('card') ? 10 : 5;   // 最多傾斜幾度
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', ((0.5 - y) * max).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((x - 0.5) * max).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        el.classList.add('tilting');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('tilting');
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- 按鈕：按下去的水波漣漪 ---------- */
  function setupRipple() {
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.btn');
      if (!b || REDUCE) return;
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
      var dot = document.createElement('i');
      dot.className = 'ripple';
      dot.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
      b.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 700);
    });
  }

  /* ---------- 開始 ---------- */
  renderNav();
  if (PAGE.panels) renderStory(); else renderBlocks();
  renderFooter();
  setupReveal();
  setupScroll();
  setupCards();
  setupTilt();
  setupRipple();
  document.documentElement.classList.add('ready');
})();
