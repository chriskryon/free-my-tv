/*
 * The home screen for web-app TVs (LG webOS, Samsung Tizen), with the Android app's design and behavior (HomeView):
 *  - top: the "For You" title and the tabs (Explore, Movies, Shows); icon-only glass buttons at the right (Live TV,
 *    HDMI Inputs, Settings) and the crypto quotes at the end of the tab row;
 *  - three picks for this hour in the selected tab; the background is the first one's photo, blurred and almost white;
 *  - the glass shelf with the apps; ↓ opens the drawer (inputs, shortcuts, weather, prices); ↑ or Back closes it;
 *  - a night look from sunset to sunrise; a screensaver after a few idle minutes.
 * The remote's arrows, OK and Back move the focus; a pointer (LG's Magic Remote) focuses what it points at.
 */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  /** Screen modes: V holds the current one's numbers; body gets a class m-<id> for modes.css. */
  var MODES = {
    'default': {},
    hero: {hero: true, dark: true, rects: [[80, 300], [400, 300], [720, 300]], moreLeft: 1040},
    focus: {glide: true, dark: true},
    bar: {tile: 150, gap: 28, names: true, barTop: 734, barH: 290, rail: true, sidebar: true, sideLeft: 64, sideTop: 758, sidePitch: 62, light: true,
          barLeft: 360, barWidth: 1500, rects: [[96, 640], [766, 400], [1196, 400]], moreLeft: 1626, moreWidth: 198},
    calm: {calm: true},
    editorial: {hero: true, dark: true, editorial: true, tile: 116, gap: 32, barTop: 858, barH: 176, barLeft: 160, barWidth: 1600,
                rects: [[80, 1000], [1160, 300], [1480, 300]], moreLeft: 1160, moreWidth: 300},
    hoku: {dark: true, rail: true, sidebar: true, sideLeft: 56, sideTop: 300, sidePitch: 84, cols: 5, ratio: 0.5625, tile: 280, gap: 18, rowGap: 18,
           barTop: 604, barH: 340, barLeft: 420, barWidth: 1440,
           rects: [[420, 600], [1040, 260], [1320, 260]], moreLeft: 1600, moreWidth: 240},
    orbital: {hero: true, dark: true, tile: 112, gap: 32, barTop: 850, barH: 180, barLeft: 96, barWidth: 1728,
              rects: [[96, 330], [460, 330], [824, 330]], moreLeft: 1188, moreWidth: 220},
    mission: {dark: true, tile: 120, gap: 24, barTop: 760, barH: 176, barLeft: 96, barWidth: 1728,
              rects: [[96, 520], [656, 520], [1216, 520]], moreLeft: 1760, moreWidth: 64},
    hacker: {dark: true, tile: 112, gap: 26, names: true, barTop: 740, barH: 220, barLeft: 96, barWidth: 1728,
             rects: [[96, 540], [646, 540], [1196, 540]], moreLeft: 1746, moreWidth: 78},
    noir: {dark: true, tile: 112, gap: 28, barTop: 790, barH: 190, barLeft: 96, barWidth: 1728,
           rects: [[96, 520], [646, 520], [1196, 520]], moreLeft: 1746, moreWidth: 78},
    vhs: {dark: true, names: true, tile: 112, gap: 28, barTop: 760, barH: 210, barLeft: 96, barWidth: 1728,
          rects: [[96, 520], [646, 520], [1196, 520]], moreLeft: 1746, moreWidth: 78},
    contrast: {dark: true, names: true, tile: 150, gap: 30, barTop: 720, barH: 270, barLeft: 96, barWidth: 1728,
               rects: [[96, 520], [646, 520], [1196, 520]], moreLeft: 1746, moreWidth: 78},
    zen: {light: true, names: true, tile: 96, gap: 40, barTop: 800, barH: 190, barLeft: 200, barWidth: 1520,
          rects: [[200, 440], [690, 440], [1180, 440]], moreLeft: 1670, moreWidth: 50},
    lounge: {dark: true, names: true, tile: 110, gap: 30, barTop: 800, barH: 190, barLeft: 96, barWidth: 1728,
             rects: [[120, 480], [720, 480], [1320, 380]], moreLeft: 1760, moreWidth: 80},
    pixel: {light: true, names: true, tile: 104, gap: 24, barTop: 790, barH: 220, barLeft: 96, barWidth: 1728,
            rects: [[96, 520], [646, 520], [1196, 520]], moreLeft: 1746, moreWidth: 78},
    aurora: {dark: true, tile: 120, gap: 32, barTop: 800, barH: 180, barLeft: 96, barWidth: 1728,
             rects: [[96, 420], [556, 420], [1016, 420]], moreLeft: 1476, moreWidth: 348}
  };
  var MODE_IDS = ['default', 'hero', 'focus', 'bar', 'calm', 'editorial', 'hoku', 'orbital', 'aurora', 'mission', 'hacker', 'noir', 'vhs', 'contrast', 'zen', 'lounge', 'pixel'];
  var V = {};

  function modeNames() {
    return {'default': tr('Standard'), hero: tr('Immersive hero'), focus: tr('Spring focus'), bar: tr('Bar with names'),
      calm: tr('Calm mode'), editorial: tr('Editorial cinema'), hoku: 'Hoku',
      orbital: 'Orbital', aurora: 'Aurora', mission: tr('Mission'), hacker: 'Hacker',
      noir: tr('Noir cinema'), vhs: tr('VHS channel'), contrast: tr('High contrast'), zen: 'Zen', lounge: tr('Living room'), pixel: 'Pixel'};
  }

  /** The saved mode, or ?mode=hero in the address (to preview one). */
  function applyMode() {
    var q = /[?&]mode=(\w+)/.exec(location.search), id = q ? q[1] : Prefs.mode();
    if (!MODES[id]) id = 'default';
    V = MODES[id];
    heroId = null;
    for (var i = 0; i < MODE_IDS.length; i++) setClass(body, 'm-' + MODE_IDS[i], MODE_IDS[i] === id);
  }

  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function sym(name, parent, size) {
    var s = el('span', 'sym', parent);
    s.style.webkitMaskImage = 'url(symbols/' + name + '.png)';
    s.style.maskImage = 'url(symbols/' + name + '.png)';
    if (size) { s.style.width = size + 'px'; s.style.height = size + 'px'; }
    return s;
  }

  function coin(i, parent) {
    var c = window.COINS && window.COINS[i];
    if (!c) return;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    for (var k = 0; k < c.length; k++) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', c[k]);
      p.setAttribute('fill-rule', 'evenodd');
      svg.appendChild(p);
    }
    parent.appendChild(svg);
  }

  function hasClass(e, c) { return (' ' + e.className + ' ').indexOf(' ' + c + ' ') >= 0; }
  function setClass(e, c, on) {
    if (!e) return;
    if (on && !hasClass(e, c)) e.className = (e.className + ' ' + c).replace(/^\s+/, '');
    else if (!on && hasClass(e, c)) e.className = (' ' + e.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, '');
  }

  var stage = $('stage'), body = document.body;

  /** The 1920 × 1080 stage fills the window (on the TV it already is 1920 × 1080). */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.webkitTransform = stage.style.transform = s === 1 ? '' : 'scale(' + s + ')';
  }

  // MARK: - Apps on the shelf

  /** Shelf apps in this order when installed, like the Android app: key, LG app id, name on the TV, brand gradient. */
  var SHELF = [
    ['netflix', /^netflix$/, /netflix/i, ['#0A0A0A', '#000000']],
    ['youtube', /youtube/, /^youtube$/i, ['#1C1C1E', '#09090A']],
    ['prime', /^amazon$/, /prime video|amazon/i, ['#2AA8FF', '#0A68D4']],
    ['disney', /disney/, /disney/i, ['#173584', '#08143F']],
    ['max', /hbo|wbd/, /^(hbo )?max$|hbo max/i, ['#5C30E8', '#221684']],
    ['appletv', /appletv|apple\.tv/, /apple tv/i, ['#1C1C1E', '#000000']],
    ['hulu', /^hulu/, /hulu/i, ['#1CE783', '#0B8F4E']],
    ['paramount', /paramount|cbs/, /paramount/i, ['#0064FF', '#002A86']],
    ['peacock', /peacock/, /peacock/i, ['#1C1C1E', '#000000']],
    ['nfl', /nfl/, /^nfl/i, ['#013369', '#00163D']],
    ['globoplay', /globoplay/, /globoplay/i, ['#FF8A1F', '#FF2D5A']],
    ['jellyfin', /jellyfin/i, /jellyfin/i, ['#AA5CC3', '#00A4DC']],
    ['spotify', /spotify/, /spotify/i, ['#1DB954', '#0F7A36']]
  ];
  var MAX_SHELF = 8;

  function shelfKey(app) {
    for (var i = 0; i < SHELF.length; i++) if (SHELF[i][1].test(app.id) || SHELF[i][2].test(app.title)) return SHELF[i];
    return null;
  }

  function darken(hex, f) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#161618';
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 'rgb(' + Math.round(r * f) + ',' + Math.round(g * f) + ',' + Math.round(b * f) + ')';
  }

  /** A name that fits the tile on one line (the font shrinks for long names). */
  function wordFit(title, width, max) {
    return Math.max(18, Math.min(max, Math.floor(width * 0.8 / (Math.max(4, title.length) * 0.56))));
  }

  /** An app's face: its own icon on its brand color (or its name, when the icon can't be read). */
  function face(app, box, wordSize) {
    var k = shelfKey(app);
    var top = k ? k[3][0] : app.color ? darken(app.color, 0.92) : '#2A2A2E';
    var bottom = k ? k[3][1] : app.color ? darken(app.color, 0.62) : '#161618';
    box.style.background = '-webkit-linear-gradient(top, ' + top + ', ' + bottom + ')';
    box.style.background = 'linear-gradient(' + top + ', ' + bottom + ')';
    var word = el('div', 'word', box, app.title);
    if (wordSize) word.style.fontSize = wordSize + 'px';
    if (app.icon) {
      var img = el('img', '', box);
      word.style.visibility = 'hidden';
      img.onerror = function () { img.parentNode.removeChild(img); word.style.visibility = ''; };
      img.src = app.icon;
    }
  }

  var apps = [], shelf = [], others = [], inputs = [];

  function pickShelf() {
    var chosen = Prefs.shelf(), out = [];
    if (chosen) {
      for (var i = 0; i < chosen.length && out.length < MAX_SHELF; i++) {
        for (var j = 0; j < apps.length; j++) if (apps[j].id === chosen[i]) out.push(apps[j]);
      }
    } else {
      for (var s = 0; s < SHELF.length && out.length < MAX_SHELF; s++) {
        for (var a = 0; a < apps.length; a++) {
          if ((SHELF[s][1].test(apps[a].id) || SHELF[s][2].test(apps[a].title)) && out.indexOf(apps[a]) < 0) { out.push(apps[a]); break; }
        }
      }
      if (!out.length) out = apps.slice(0, MAX_SHELF);
    }
    shelf = out;
    // All Apps: every app, the shelf's first (the name `others` is from when it listed only the rest)
    others = shelf.concat(apps.filter(function (x) { return shelf.indexOf(x) < 0; }));
  }

  // MARK: - Focus

  var Z = {TOP: 'top', CARDS: 'cards', SIDE: 'side', SHELF: 'shelf', DRAWER: 'drawer', APPS: 'apps', MORE: 'more', SETTINGS: 'settings', EDIT: 'edit', LANG: 'lang', MODEPICK: 'modepick'};
  var st = {zone: Z.SHELF, top: 0, tab: 0, card: 0, side: 0, shelf: 0, drawer: 0, grid: 0, more: 0, row: 0, edit: 0, lang: 0, mp: 0, mchip: 0, moreTop: false};
  var cards = [];

  function sheetOpen() { return st.zone === Z.APPS || st.zone === Z.MORE || st.zone === Z.SETTINGS || st.zone === Z.EDIT || st.zone === Z.LANG || st.zone === Z.MODEPICK; }

  function updateFocus() {
    var i, list;
    list = $('tabs').children;
    for (i = 0; i < list.length; i++) {
      setClass(list[i], 'on', i === st.tab);
      setClass(list[i], 'focus', st.zone === Z.TOP && st.top === i);
    }
    list = $('side').querySelectorAll('.sidebtn');
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.SIDE && st.side === i);
    list = $('cards').children;
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.CARDS && st.card === i);
    list = $('tiles').children;
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.SHELF && st.shelf === i);
    setClass($('hint'), 'on', st.zone === Z.SHELF);   // the way to the drawer: inputs, weather, shortcuts
    list = document.querySelectorAll('#drawer .key');
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.DRAWER && st.drawer === i);
    list = document.querySelectorAll('#apps .cell');
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.APPS && st.grid === i);
    syncMore();
    list = document.querySelectorAll('#more .mchip');
    for (i = 0; i < list.length; i++) {
      setClass(list[i], 'selected', st.mchip === i);
      setClass(list[i], 'focus', st.zone === Z.MORE && st.moreTop && st.mchip === i);
    }
    list = document.querySelectorAll('#more .mcell');
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.MORE && !st.moreTop && st.more === +list[i].getAttribute('data-i'));
    var rows = Math.max(1, Math.ceil(others.length / 5)), r = Math.floor(st.grid / 5), first = Math.max(0, Math.min(rows - 3, r - 1));
    $('apps').lastChild.style.webkitTransform = $('apps').lastChild.style.transform = 'translateY(' + (-first * 239) + 'px)';
    focusSettings();
    focusRows($('shelfedit'), st.edit, st.zone === Z.EDIT);
    focusRows($('langpick'), st.lang, st.zone === Z.LANG);
    focusRows($('modepick'), st.mp, st.zone === Z.MODEPICK);
    if (langHint) langHint.textContent = (st.lang + 1) + ' / ' + languageChoices().length + '  ·  ' + tr('OK picks, Back cancels.');
    setClass(body, 'drawer-open', st.zone === Z.DRAWER);
    renderHero();
    moveGlide();
  }

  function focusRows(sheet, index, on) {
    var rows = sheet.querySelectorAll('.row');
    for (var i = 0; i < rows.length; i++) setClass(rows[i], 'focus', on && i === index);
    var holder = sheet.querySelector('.rows'), list = sheet.querySelector('.list');
    if (!holder || !list || !rows[index]) return;
    var max = Math.max(0, holder.offsetHeight - list.offsetHeight);
    var y = Math.max(0, Math.min(max, rows[index].offsetTop + rows[index].offsetHeight / 2 - list.offsetHeight / 2));
    holder.style.webkitTransform = holder.style.transform = 'translateY(' + (-y) + 'px)';
  }

  function focusSettings() {
    var sheet = $('settings'), categorized = Prefs.menuStyle() === 'categories';
    if (!categorized) { focusRows(sheet, st.row, st.zone === Z.SETTINGS); return; }
    var cats = sheet.querySelectorAll('.category-row'), options = sheet.querySelectorAll('.option-row');
    for (var i = 0; i < cats.length; i++) {
      setClass(cats[i], 'selected', i === settingsCategory);
      setClass(cats[i], 'focus', st.zone === Z.SETTINGS && settingsPane === 0 && i === settingsCategory);
    }
    for (i = 0; i < options.length; i++) setClass(options[i], 'focus', st.zone === Z.SETTINGS && settingsPane === 1 && i === st.row);
    var holder = sheet.querySelector('.option-rows'), list = sheet.querySelector('.option-list');
    if (!holder || !list || !options[st.row] || settingsPane !== 1) return;
    var max = Math.max(0, holder.offsetHeight - list.offsetHeight);
    var y = Math.max(0, Math.min(max, options[st.row].offsetTop + options[st.row].offsetHeight / 2 - list.offsetHeight / 2));
    holder.style.webkitTransform = holder.style.transform = 'translateY(' + (-y) + 'px)';
  }

  function nearest(nodes, x) {
    var best = 0, bestD = 1e9;
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect(), d = Math.abs((r.left + r.right) / 2 - x);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function centerX(node) {
    if (!node) return 960;
    var r = node.getBoundingClientRect();
    return (r.left + r.right) / 2;
  }

  // MARK: - Top: title, tabs, buttons, quotes

  var TAB_KIND = [null, 'movie', 'tv'];

  function renderTop() {
    $('title').textContent = tr('For You');
    var tabs = $('tabs');
    tabs.innerHTML = '';
    var names = [tr('Explore'), tr('Movies'), tr('Shows')];
    for (var i = 0; i < 3; i++) {
      var t = el('button', 'tab', tabs, names[i]);
      hover(t, Z.TOP, i);
    }
  }

  function renderQuotes() {
    var q = $('quotes'), coins = Data.activeCoins();
    q.innerHTML = '';
    for (var i = 0; i < coins.length; i++) {
      var item = el('span', 'q', q);
      coin(coins[i], item);
      el('span', '', item, Data.compact(Data.prices[coins[i]]));
    }
  }

  // MARK: - Picks and background

  /** TMDB's sizes for the picks: the hero and the two small cards, by the photo quality in settings (HD by default). */
  function photoSize(hero) {
    var q = Prefs.photos();
    return q === 'sd' ? 'w300' : q === 'fhd' ? (hero ? 'w1280' : 'w780') : (hero ? 'w780' : 'w300');
  }

  function renderCards() {
    var list = Prefs.picks() && !V.calm ? Data.picks(TAB_KIND[st.tab]) : [];
    var holder = $('cards');
    setClass(body, 'no-picks', !list.length);
    var same = list.length === cards.length;
    for (var i = 0; same && i < list.length; i++) same = list[i].id === cards[i].id && list[i].backdrop === cards[i].backdrop && list[i].meta === cards[i].meta;
    if (same && holder.children.length === list.length + (list.length ? 1 : 0)) return;
    cards = list;
    holder.innerHTML = '';
    var rects = V.rects || [[80, 780], [900, 360], [1280, 360]];
    for (var c = 0; c < list.length; c++) {
      var p = list[c], card = el('div', 'card', holder);
      card.style.left = rects[c][0] + 'px';
      card.style.width = rects[c][1] + 'px';
      var img = el('div', 'img', card);
      img.style.backgroundImage = 'url(' + Data.image(p.backdrop, photoSize(c === 0)) + ')';
      el('div', 'name', card, p.title);
      if (c === 0 && p.meta) el('div', 'meta', card, p.meta);
      hover(card, Z.CARDS, c);
    }
    if (list.length) {
      var more = el('div', 'card more', holder);
      more.style.left = (V.moreLeft || 1660) + 'px';
      more.style.width = (V.moreWidth || 180) + 'px';
      sym('chevron_right', el('div', 'img', more));
      el('div', 'name', more, tr('See more'));
      hover(more, Z.CARDS, list.length);
    }
    st.card = Math.min(st.card, Math.max(0, list.length - 1));
    if (!list.length && st.zone === Z.CARDS) st.zone = Z.SHELF;
    backdrop(list.length ? Data.image(list[0].backdrop, 'w300') : '');
    updateFocus();
    renderHero();
  }

  /** Hero mode: the focused pick fills the screen, with its title, genre, synopsis, a Watch pill and a dot per pick. */
  var heroId = null, heroFront = 0;   // heroId is also reset by applyMode (hoisted var)

  function renderHero() {
    var h = $('hero');
    if (!V.hero) { if (h) h.style.display = 'none'; return; }
    if (!h) {
      h = el('div', '', null);
      h.id = 'hero';
      el('div', 'ph', h);
      el('div', 'ph', h);
      el('div', 'scrim', h);
      var copy = el('div', 'hcopy', h);
      el('div', 'htitle', copy);
      el('div', 'hmeta', copy);
      el('div', 'hover', copy);
      var row = el('div', 'hrow', copy);
      el('div', 'hbtn', row);
      el('div', 'hdots', row);
      $('home').parentNode.insertBefore(h, $('home'));
    }
    h.style.display = '';
    var i = st.zone === Z.CARDS && st.card < cards.length ? st.card : 0, p = cards[i];
    setClass(h, 'on', !!p);
    setClass(h, 'cardfocus', st.zone === Z.CARDS);
    if (!p) return;
    var dots = h.querySelector('.hdots');
    if (dots.children.length !== cards.length) {
      dots.innerHTML = '';
      for (var d = 0; d < cards.length; d++) el('span', '', dots);
    }
    for (var k = 0; k < dots.children.length; k++) setClass(dots.children[k], 'on', k === i);
    if (p.id === heroId) return;
    heroId = p.id;
    var layers = h.querySelectorAll('.ph');
    if (V.editorial) {
      layers[0].style.backgroundImage = layers[1].style.backgroundImage = '';
      setClass(layers[0], 'on', false);
      setClass(layers[1], 'on', false);
    } else {
      heroFront = 1 - heroFront;
      layers[heroFront].style.backgroundImage = 'url(' + Data.image(p.backdrop, Prefs.photos() === 'fhd' ? 'w1280' : 'w780') + ')';
      setClass(layers[heroFront], 'on', true);
      setClass(layers[1 - heroFront], 'on', false);
    }
    h.querySelector('.htitle').textContent = p.title;
    h.querySelector('.hmeta').textContent = p.meta || '';
    h.querySelector('.hover').textContent = p.overview || '';
    var app = p.app && Data.appFor(p.app), btn = h.querySelector('.hbtn');
    btn.textContent = app ? trf('Watch on {app}', {app: app.title}) : '';
    setClass(btn, 'none', !app);
  }

  /** Spring-focus mode: one ring glides from the focused item to the next. */
  var glideBox = null;

  function glideNoTransition(g, off) {
    g.style.webkitTransition = g.style.transition = off ? 'none' : '';
  }

  function moveGlide() {
    var g = $('glide');
    if (!V.glide) { if (g) g.style.display = 'none'; return; }
    if (!g) { g = el('div', '', $('home')); g.id = 'glide'; }
    g.style.display = '';
    var f = document.querySelector('#tabs .focus, #cards .focus, #tiles .focus, #side .focus');
    if (!f || st.zone === Z.DRAWER || sheetOpen()) { setClass(g, 'on', false); glideBox = null; return; }
    var x = 0, y = 0, e = f, home = $('home'), pad = 10;
    while (e && e !== home) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    var rounded = f.querySelector('.img') || f, br = getComputedStyle(rounded).borderRadius, r = /%/.test(br) ? parseFloat(br) / 100 * Math.min(rounded.offsetWidth, rounded.offsetHeight) : parseFloat(br) || 20;
    var box = {x: x - pad, y: y - pad, w: f.offsetWidth + 2 * pad - 4, h: f.offsetHeight + 2 * pad - 4}, from = glideBox;
    g.style.width = box.w + 'px';
    g.style.height = box.h + 'px';
    g.style.borderRadius = (r + pad) + 'px';
    // Only transform animates: the ring takes its new size at once and starts from the old size and place (scaled), then glides.
    glideNoTransition(g, true);
    g.style.webkitTransform = g.style.transform = from ? 'translate(' + from.x + 'px,' + from.y + 'px) scale(' + from.w / box.w + ',' + from.h / box.h + ')' : 'translate(' + box.x + 'px,' + box.y + 'px)';
    void g.offsetWidth;
    glideNoTransition(g, false);
    g.style.webkitTransform = g.style.transform = 'translate(' + box.x + 'px,' + box.y + 'px)';
    glideBox = box;
    setClass(g, 'on', true);
  }

  /** A short press on the focused item when OK is pressed (spring-focus mode). */
  function pulse() {
    var f = document.querySelector('.tile.focus, .card.focus, .tab.focus, .sidebtn.focus');
    if (!f) return;
    setClass(f, 'press', true);
    setTimeout(function () { setClass(f, 'press', false); }, 170);
  }

  var bgUrl = null, bgFront = 'bgA';

  /** The first pick's photo as the background: drawn tiny and stretched, it's already as soft as a heavy blur. */
  function backdrop(url) {
    if (url === bgUrl) return;
    bgUrl = url;
    var next = bgFront === 'bgA' ? 'bgB' : 'bgA';
    if (!url) {
      setClass($('bgA'), 'on', false);
      setClass($('bgB'), 'on', false);
      return;
    }
    var img = new Image();
    img.onload = function () {
      if (bgUrl !== url) return;
      var canvas = $(next), ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setClass(canvas, 'on', true);
      setClass($(bgFront), 'on', false);
      bgFront = next;
    };
    img.src = url;
  }

  function renderClock() {
    var d = new Date(), c = $('clock');
    var sec = d.getSeconds();
    c.firstChild.textContent = formatDate('format|h:mm', d.getTime()) + ':' + (sec < 10 ? '0' : '') + sec;
    c.lastChild.textContent = formatDate('format|EEEE, MMMM d', d.getTime());
    renderCalmWeather();
  }

  var calmKey = '';

  /** Calm mode: the weather as one quiet line under the date. */
  function renderCalmWeather() {
    var e = $('calmwx'), w = Data.weather;
    if (!e) { e = el('div', '', $('home')); e.id = 'calmwx'; }
    if (!V.calm || !w) { e.innerHTML = ''; calmKey = ''; return; }
    var key = w.code + ':' + w.temp + ':' + w.isDay;
    if (key === calmKey) return;
    calmKey = key;
    e.innerHTML = '';
    sym(Data.symbol(w.code, w.isDay), e);
    e.appendChild(document.createTextNode(Data.degrees(w.temp) + '   ' + Data.condition(w.code, w.isDay)));
  }

  // MARK: - Shelf

  /** The bar: a side panel (Live TV, inputs, All Apps, Settings) on the left, the apps after it. */
  function renderShelf() {
    var n = shelf.length, gap = V.gap || 40, pad = 28, panelW = 156, lead = 36, barTop = V.barTop || 800, barH = V.barH || 200;
    if (V.rail) { panelW = 0; lead = 0; }
    var avail = (V.barWidth || 1760) - 2 * pad - panelW - lead;
    // Rounded squares, as the app icons of One UI: never larger than 140.
    var tw = Math.min(V.tile || 140, (avail - Math.max(0, (V.cols || n) - 1) * gap) / Math.max(1, V.cols || n)), th = V.ratio ? Math.round(tw * V.ratio) : tw;
    var cols = V.cols || n, rows = Math.max(1, Math.ceil(n / cols)), rowGap = V.rowGap || 0;
    var left = (V.barLeft || 80) + pad + panelW + lead + (V.rail && !V.cols ? Math.max(0, (avail - (n * tw + Math.max(0, n - 1) * gap)) / 2) : 0), mid = barTop + barH / 2;
    var platter = $('platter');
    platter.style.left = (V.barLeft || 80) + 'px';
    platter.style.width = (V.barWidth || 1760) + 'px';
    platter.style.top = barTop + 'px';
    platter.style.height = barH + 'px';
    $('quotes').style.right = '80px';
    var side = $('side');
    side.innerHTML = '';
    if (V.sidebar) el('div', 'sidepanel', side);
    var defs = [['live_tv', tr('light|Live TV')], ['hdmi', tr('HDMI Inputs')], ['apps', tr('All Apps')], ['settings', tr('light|Settings')]];
    for (var b = 0; b < 4; b++) {
      var r = el('button', 'sidebtn r' + (V.rail ? 'a' : Math.floor(b / 2)), side);
      r.style.left = (V.sidebar ? (V.sideLeft || 44) : (V.barLeft || 80) + pad + (b % 2) * 84) + 'px';
      r.style.top = (V.sidebar ? (V.sideTop !== undefined ? V.sideTop : V.barTop + 15) + b * (V.sidePitch || 66) : mid - 78 + Math.floor(b / 2) * 84) + 'px';
      sym(defs[b][0], r);
      el('div', 'tip', r, defs[b][1]);
      hover(r, Z.SIDE, b);
    }
    var tiles = $('tiles');
    tiles.innerHTML = '';
    for (var i = 0; i < n; i++) {
      var t = el('div', 'tile', tiles);
      var col = i % cols, row = Math.floor(i / cols);
      t.style.left = (left + col * (tw + gap)) + 'px';
      t.style.top = (mid - (rows * th + (rows - 1) * rowGap) / 2 + row * (th + rowGap)) + 'px';
      t.style.width = tw + 'px';
      t.style.height = th + 'px';
      face(shelf[i], t, wordFit(shelf[i].title, tw, 30));
      if (V.names) el('div', 'nm', t, shelf[i].title);
      hover(t, Z.SHELF, i);
    }
    st.shelf = Math.min(st.shelf, Math.max(0, n - 1));
  }

  // MARK: - Drawer

  var drawerItems = [], drawerInputs = 0;

  function renderDrawer() {
    var d = $('drawer');
    d.innerHTML = '';
    drawerItems = [];
    for (var i = 0; i < inputs.length; i++) {
      var x = inputs[i];
      drawerItems.push({label: x.label || tr('Live TV'), symbol: x.symbol, off: !x.connected, run: launcher(x.id, x.label)});
    }
    drawerInputs = drawerItems.length;
    var n = drawerItems.length, gap = 18, groupGap = 56, groups = 1;
    var tw = Math.min(230, (1760 - Math.max(0, n - groups) * gap - (groups - 1) * groupGap) / Math.max(1, n));
    var xPos = 80;
    for (var k = 0; k < n; k++) {
      if (k === drawerInputs && k > 0) {
        xPos += groupGap - gap;
        el('div', 'row-title', d, tr('Shortcuts')).style.left = (xPos + 4) + 'px';
      }
      if (k === 0 && drawerInputs) el('div', 'row-title', d, tr('Inputs')).style.left = '84px';
      var item = drawerItems[k], key = el('div', 'key glass' + (item.off ? ' off' : ''), d);
      key.style.left = xPos + 'px';
      key.style.width = tw + 'px';
      sym(item.symbol, key);
      el('div', 'label', key, item.label);
      hover(key, Z.DRAWER, k);
      xPos += tw + gap;
    }
    renderPanels();
    updateFocus();
  }

  function renderPanels() {
    var d = $('drawer');
    var old = d.querySelectorAll('.panel');
    for (var o = 0; o < old.length; o++) d.removeChild(old[o]);
    var wx = Prefs.weather(), pf = Prefs.perf();
    var split = 80 + 1760 * 0.585;
    if (wx) {
      var w = el('div', 'panel glass', d);
      w.id = 'weather';
      w.style.left = '80px';
      w.style.width = ((pf ? split - 16 : 1840) - 80) + 'px';
      renderWeather(w);
    }
    if (pf) {
      var q = el('div', 'panel glass', d);
      q.id = 'perf';
      var left = wx ? split + 16 : 80;
      q.style.left = left + 'px';
      q.style.width = (1840 - left) + 'px';
      renderPerf(q);
    }
  }

  function renderWeather(card) {
    el('div', 'head', card, Data.city || tr('Weather'));
    var w = Data.weather;
    if (!w) {
      el('div', 'cond', card, tr('No weather data right now.')).style.top = '96px';
      return;
    }
    var now = el('div', 'now', card);
    sym(Data.symbol(w.code, w.isDay), now);
    el('span', 'temp', now, Data.degrees(w.temp));
    el('div', 'cond', card, Data.condition(w.code, w.isDay));
    el('div', 'range', card, trf('H:{max}', {max: Data.degrees(w.max)}) + '   ' + trf('L:{min}', {min: Data.degrees(w.min)}));
    el('div', 'split', card);
    var hours = el('div', 'hours', card), width = parseFloat(card.style.width) - 30 - 422, hw = width / 6;
    for (var i = 0; i < w.hours.length && i < 6; i++) {
      var h = el('div', 'hour', hours), x = w.hours[i];
      h.style.left = (hw * i) + 'px';
      h.style.width = hw + 'px';
      el('div', 't', h, Data.hour(x.at));
      sym(Data.symbol(x.code, x.day), h);
      el('div', 'd', h, Data.degrees(x.temp));
    }
    var sun = el('div', 'sun', card);
    if (w.sunrise) { var a = el('span', '', sun); sym('sunrise', a); a.appendChild(document.createTextNode(trf('Sunrise {time}', {time: Data.time(w.sunrise)}))); }
    if (w.sunset) { var b = el('span', '', sun); sym('sunset', b); b.appendChild(document.createTextNode(trf('Sunset {time}', {time: Data.time(w.sunset)}))); }
  }

  // MARK: - Performance: frames per second, memory and the screen's size, in the drawer and as a small chart by the clock

  var perf = {fps: 0, frames: 0, last: 0, fpsHist: [], ref: null, mini: null, window: [], good: 0, relapses: 0, slow: false};

  function num(v, digits) {
    try { return v.toLocaleString(I18N.locale(), {minimumFractionDigits: digits, maximumFractionDigits: digits}); } catch (e) { return v.toFixed(digits); }
  }

  function heap() {
    var m = window.performance && performance.memory;
    return m ? {used: m.usedJSHeapSize / 1048576, limit: m.jsHeapSizeLimit / 1048576} : null;
  }

  function perfModel() {
    try { if (window.webapis && webapis.productinfo && webapis.productinfo.getRealModel) return webapis.productinfo.getRealModel(); } catch (e) {}
    var ua = navigator.userAgent, t = /Tizen[ \/]([\d.]+)/.exec(ua);
    if (t) return 'Tizen ' + t[1];
    if (/Web0S|webOS/i.test(ua)) return 'webOS';
    var c = /Chrome\/(\d+)/.exec(ua);
    return c ? 'Chrome ' + c[1] : '';
  }

  function perfHardware() {
    var cores = navigator.hardwareConcurrency, ram = navigator.deviceMemory;
    return (cores ? trf('{n} cores', {n: cores}) : '—') + (ram ? ' · ~' + ram + ' GB' : '');
  }

  function fpsColor(v) {
    var night = hasClass(body, 'night');
    return v >= 55 ? (night ? '#30D158' : '#1E9E48') : v >= 30 ? '#E0A000' : '#E5484D';
  }

  function drawSpark(cv, data, max, color) {
    var c = cv.getContext && cv.getContext('2d');
    if (!c) return;
    var w = cv.width, h = cv.height, n = 30;
    c.clearRect(0, 0, w, h);
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.lineJoin = 'round';
    c.beginPath();
    for (var i = 0; i < data.length; i++) {
      var x = 1 + (n - data.length + i) * (w - 2) / (n - 1), y = h - 2 - Math.min(data[i], max) / max * (h - 4);
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.stroke();
  }

  function renderPerf(card) {
    el('div', 'head', card, tr('Performance'));
    el('div', 'side', card, perfModel());
    var big = el('div', 'big', card), n = el('span', '', big);
    el('small', '', big, 'FPS');
    el('div', 'sub', card, tr('Frames per second'));
    var fill = el('div', 'fill', el('div', 'track', card)), cv = el('canvas', '', card);
    cv.width = 270;
    cv.height = 44;
    el('div', 'split', card);
    var labels = [tr('App memory'), tr('Free memory'), tr('Elements on screen'), tr('Hardware')], vals = [];
    for (var i = 0; i < 4; i++) {
      var r = el('div', 'row', card, labels[i]);
      r.style.top = (84 + i * 48) + 'px';
      vals.push(el('span', 'v', r));
    }
    vals[3].textContent = perfHardware();
    perf.ref = {n: n, fill: fill, cv: cv, vals: vals};
    updatePerf();
  }

  function updatePerf() {
    var fps = perf.fps, color = fpsColor(fps), h = heap();
    var mini = $('perfmini');
    if (mini) {
      mini.firstChild.textContent = fps + ' FPS';
      drawSpark(mini.lastChild, perf.fpsHist, 60, color);
    }
    var r = perf.ref;
    if (!r || !r.n.parentNode) { perf.ref = null; return; }
    r.n.textContent = fps;
    r.fill.style.width = Math.min(100, fps / 60 * 100) + '%';
    r.fill.style.background = color;
    drawSpark(r.cv, perf.fpsHist, 60, color);
    r.vals[0].textContent = h ? num(h.used, 1) + ' MB' : '—';
    r.vals[1].textContent = h ? num(h.limit - h.used, 0) + ' MB' : '—';
    r.vals[2].textContent = document.getElementsByTagName('*').length;
  }

  /**
   * Adaptive motion, with hysteresis so it never flickers. Off after 10 of the last 12 seconds under 30 FPS; back on only
   * after a steady run at 55 FPS or more, 60 s the first time and twice as long after each relapse (up to 8 minutes), since
   * the animations are part of what slows a weak TV. Nothing counts while hidden, with the screensaver up, or in the first
   * 20 s (loading). Returns true when `p.slow` changed.
   */
  function watchSpeed(p, fps, t, idle) {
    if (idle || t < 20000 || !fps) return false;
    p.window.push(fps < 30);
    if (p.window.length > 12) p.window.shift();
    if (!p.slow) {
      var low = 0;
      for (var i = 0; i < p.window.length; i++) if (p.window[i]) low++;
      if (low < 10) return false;
      p.slow = true;
      p.good = 0;
      p.relapses++;
      return true;
    }
    p.good = fps >= 55 ? p.good + 1 : 0;
    if (p.good < Math.min(480, 60 * Math.pow(2, p.relapses - 1))) return false;
    p.slow = false;
    p.window = [];
    return true;
  }

  function perfLoop(t) {
    perf.frames++;
    if (!perf.last) perf.last = t;
    if (t - perf.last >= 1000) {
      perf.fps = Math.round(perf.frames * 1000 / (t - perf.last));
      perf.frames = 0;
      perf.last = t;
      perf.fpsHist.push(perf.fps);
      if (perf.fpsHist.length > 30) perf.fpsHist.shift();
      if (watchSpeed(perf, perf.fps, t, document.hidden || saverOn)) applyLook();
      updatePerf();
    }
    requestAnimationFrame(perfLoop);
  }

  function applyLook() {
    setClass(body, 'reduce-motion', Prefs.reduce() || perf.slow);
    setClass(body, 'text-l', Prefs.large());
  }

  function renderMini() {
    setClass(body, 'no-perf', !Prefs.perf());
    if ($('perfmini')) return;
    var m = el('div', '', $('top'));
    m.id = 'perfmini';
    el('span', 'fps', m);
    var cv = el('canvas', '', m);
    cv.width = 140;
    cv.height = 34;
  }

  function renderPrices(card, coins) {
    el('div', 'head', card, tr('Crypto'));
    var stale = Data.staleness(Data.pricesAt, 5 * 60000);
    el('div', 'side', card, stale ? trf('quotes|{ago}', {ago: stale}) : tr('24h change'));
    for (var j = 0; j < coins.length; j++) {
      var i = coins[j], row = el('div', 'coin', card);
      row.style.top = (86 + 52 * j) + 'px';
      coin(i, row);
      el('span', 'n', row, Data.coinName(i));
      el('span', 'p', row, Data.money(Data.prices[i]));
      var ch = Data.changes[i];
      if (!isNaN(ch)) el('span', 'c ' + (ch >= 0 ? 'up' : 'down'), row, Data.change(ch));
    }
  }

  function openDrawer() {
    if (!drawerItems.length && !$('drawer').querySelector('.panel')) return;
    var tiles = $('tiles').children;
    st.zone = Z.DRAWER;
    st.drawer = !drawerItems.length || !tiles[st.shelf] ? 0 : Math.min(drawerItems.length - 1, nearest(document.querySelectorAll('#drawer .key'), centerX(tiles[st.shelf])));
    updateFocus();
  }

  function closeDrawer() {
    var keys = document.querySelectorAll('#drawer .key');
    st.zone = Z.SHELF;
    if (shelf.length) st.shelf = nearest($('tiles').children, centerX(keys[st.drawer]));
    updateFocus();
  }

  // MARK: - All Apps

  function renderApps() {
    var sheet = $('apps');
    sheet.firstChild.textContent = tr('All Apps');
    var grid = sheet.lastChild;
    grid.innerHTML = '';
    for (var i = 0; i < others.length; i++) {
      var r = Math.floor(i / 5), c = i % 5, cell = el('div', 'cell', grid);
      cell.style.left = (130 + c * 340) + 'px';
      cell.style.top = (196 + r * 239) + 'px';
      face(others[i], el('div', 'face', cell), wordFit(others[i].title, 300, 34));
      el('div', 'label', cell, others[i].title);
      hover(cell, Z.APPS, i);
    }
  }

  function openApps() {
    renderApps();
    st.zone = Z.APPS;
    st.grid = 0;
    setClass($('apps'), 'open', true);
    updateFocus();
  }

  // MARK: - See more: a grid of more picks, loaded when it opens

  var moreList = [], moreAll = [], moreChips = [], moreChipLabel = '', moreKeys = [], moreRows = null, moreCells = {};
  var MORE_ROW = 270;

  function moreKey(p) { return p.kind + ':' + p.id; }

  /** A photo as a background; if it can't be loaded the node gets a plain tile (class noimg) instead of an empty box. */
  function setPhoto(node, url) {
    setClass(node, 'noimg', false);
    node.style.backgroundImage = 'url(' + url + ')';
    var probe = new Image();
    probe.onerror = function () { node.style.backgroundImage = ''; setClass(node, 'noimg', true); };
    probe.src = url;
  }

  /** The chips above the grid: All, Movies, Shows, then each streaming app that has picks (the most picks first). */
  function buildMoreChips() {
    var count = {}, order = [], i, p;
    for (i = 0; i < moreAll.length; i++) {
      p = moreAll[i];
      if (p.service) {
        if (!count[p.service]) { count[p.service] = 0; order.push(p.service); }
        count[p.service]++;
      }
    }
    order.sort(function (a, b) { return count[b] - count[a]; });
    moreChips = [
      {label: tr('All'), test: function () { return true; }},
      {label: tr('Movies'), test: function (x) { return x.kind === 'movie'; }},
      {label: tr('Shows'), test: function (x) { return x.kind === 'tv'; }}
    ];
    order.forEach(function (name) { moreChips.push({label: name, test: function (x) { return x.service === name; }}); });
    st.mchip = 0;
    for (i = 0; i < moreChips.length; i++) if (moreChips[i].label === moreChipLabel) st.mchip = i;
  }

  function renderMoreChips() {
    var sheet = $('more'), box = sheet.querySelector('.mchips');
    if (!box) { box = el('div', 'mchips', null); sheet.insertBefore(box, sheet.querySelector('.grid')); }
    box.innerHTML = '';
    for (var i = 0; i < moreChips.length; i++) {
      (function (index) {
        var chip = el('div', 'mchip', box, moreChips[index].label);
        chip.onmouseover = function () { st.zone = Z.MORE; st.moreTop = true; st.mchip = index; updateFocus(); };
        chip.onclick = function () { selectMoreChip(index); };
      })(i);
    }
  }

  function selectMoreChip(i) {
    st.mchip = i;
    moreChipLabel = moreChips[i].label;
    st.more = 0;
    refreshMore();
    updateFocus();
  }

  /** The grid draws only the rows near the one on screen (the others are dropped, photos and all), so it stays light with 48 picks. */
  function syncMore() {
    var grid = $('more').querySelector('.grid');
    if (!moreRows || !grid) return;
    var total = Math.max(1, Math.ceil(moreList.length / 4)), row = st.moreTop ? 0 : Math.floor(st.more / 4);
    var first = Math.max(0, Math.min(total - 3, row - 1)), lo = Math.max(0, first - 1) * 4, hi = Math.min(moreList.length, (first + 5) * 4), k, i;
    for (k in moreCells) {
      if (+k < lo || +k >= hi) { moreRows.removeChild(moreCells[k]); delete moreCells[k]; }
    }
    for (i = lo; i < hi; i++) if (!moreCells[i]) addMoreCell(i);
    moreRows.style.webkitTransform = moreRows.style.transform = 'translateY(' + (-first * MORE_ROW) + 'px)';
  }

  function addMoreCell(i) {
    var cell = el('div', 'mcell', moreRows), img = el('div', 'img', cell), size = Prefs.photos() === 'fhd' ? 'w780' : 'w300';
    cell.setAttribute('data-i', i);
    cell.style.left = (140 + (i % 4) * 420) + 'px';
    cell.style.top = (10 + Math.floor(i / 4) * MORE_ROW) + 'px';
    setPhoto(img, Data.image(moreList[i].backdrop, size));
    el('div', 'name', cell, moreList[i].title);
    hover(cell, Z.MORE, i);
    moreCells[i] = cell;
  }

  /** Re-reads the picks and the chip, then draws only what changed (new picks arriving append to the grid). */
  function refreshMore() {
    var sheet = $('more'), grid = sheet.querySelector('.grid');
    sheet.firstChild.textContent = tr('See more');
    moreAll = Data.more(null);
    buildMoreChips();
    var chip = moreChips[st.mchip] || moreChips[0];
    moreList = moreAll.filter(chip.test);
    var keys = moreList.map(moreKey), same = keys.length >= moreKeys.length;
    for (var i = 0; same && i < moreKeys.length; i++) same = keys[i] === moreKeys[i];
    if (!moreRows || !same) {
      grid.innerHTML = '';
      moreRows = el('div', 'mrows', grid);
      moreCells = {};
    }
    moreKeys = keys;
    st.more = Math.min(st.more, Math.max(0, moreList.length - 1));
    renderMoreChips();
  }

  /** More picks are looked up only when the focus gets near the end of the grid. */
  function wantMore() {
    if (moreAll.length >= 48 || moreList.length - st.more > 8) return;
    Data.loadMore(null, moreAll.length + 12, function () {
      if (st.zone !== Z.MORE) return;
      refreshMore();
      updateFocus();
    });
  }

  function openMore() {
    st.zone = Z.MORE;
    st.more = 0;
    st.moreTop = false;
    moreChipLabel = [tr('All'), tr('Movies'), tr('Shows')][st.tab] || tr('All');
    moreKeys = [];
    moreRows = null;
    refreshMore();
    setClass($('more'), 'open', true);
    Data.loadMore(null, 16, function () {
      if (st.zone !== Z.MORE) return;
      refreshMore();
      updateFocus();
    });
    updateFocus();
  }

  function closeSheets() {
    setClass($('apps'), 'open', false);
    setClass($('more'), 'open', false);
    setClass($('settings'), 'open', false);
    setClass($('shelfedit'), 'open', false);
    setClass($('langpick'), 'open', false);
    setClass($('modepick'), 'open', false);
    st.moreTop = false;
    langHint = null;
    st.zone = Z.SHELF;
    updateFocus();
  }

  // MARK: - Home Settings

  var settingsCategory = 0, settingsPane = 0;
  function settingSectionNames() { return [tr('Screen'), tr('Widgets'), tr('Region'), tr('System')]; }

  function menuStyleName() { return Prefs.menuStyle() === 'categories' ? tr('Categories') : tr('Standard'); }

  function changeMenuStyle() {
    var categorized = Prefs.menuStyle() !== 'categories';
    Prefs.set('menuStyle', categorized ? 'categories' : 'standard');
    settingsCategory = 0;
    settingsPane = 0;
    st.row = categorized ? 0 : settingRows().length - 1;
  }

  function modeDescs() {
    return {'default': tr('Picks and the apps bar'), hero: tr('Full-screen photo with the synopsis'), focus: tr('A focus ring that glides'),
      bar: tr('Side menu and names under the apps'), calm: tr('A big clock and little else'),
      editorial: tr('A large photo with its story beside it'),
      hoku: tr('Warm colors and a relaxed app dock'),
      orbital: tr('A cinematic mission-control view'),
      aurora: tr('Northern lights over a quiet night'),
      mission: tr('A spacecraft touchscreen: thin lines, one blue accent'),
      hacker: tr('A terminal on a black screen: green text and scanlines'),
      noir: tr('Gold on black, film strips and marquee lights'), vhs: tr('A video recorder menu: blue screen, channel numbers'),
      contrast: tr('Large white text on black, easy to read from far away'), zen: tr('Quiet paper, ink and one red dot'),
      lounge: tr('Warm lamp light, wood and framed pictures'), pixel: tr('An 8-bit world: sky, grass and chunky borders')};
  }

  /** The screen mode (it opens its own menu), the theme, reduced motion and larger text. */
  function screenRows(theme, auto) {
    var out = [{section: tr('Screen'), label: tr('Screen mode'), value: modeNames()[Prefs.mode()], opens: true, modes: true,
      step: function (d) { if (d >= 0) openModes(); }}];
    out.push({label: tr('Theme'), value: theme === 'light' ? tr('Light') : theme === 'dark' ? tr('Dark') : auto,
      step: function (d) { cycle('theme', ['auto', 'light', 'dark'], theme, d); checkNight(); }});
    out.push({label: tr('Reduce motion'), toggle: Prefs.reduce(), step: function () { Prefs.set('reduce', !Prefs.reduce()); applyLook(); }});
    out.push({label: tr('Larger text'), toggle: Prefs.large(), step: function () { Prefs.set('large', !Prefs.large()); applyLook(); }});
    return out;
  }

  function settingRows() {
    var unit = Prefs.temperature(), theme = Prefs.theme();
    var auto = tr('Automatic'), picked = pickedLanguage();
    var rows = [
      {section: tr('Widgets'), label: tr('Weather widget'), toggle: Prefs.weather(),
        step: function () { Prefs.set('weather', !Prefs.weather()); renderPanels(); }},
      {label: tr('Performance widget'), toggle: Prefs.perf(),
        step: function () { Prefs.set('perf', !Prefs.perf()); renderMini(); renderPanels(); }},
      {label: tr('Picks widget'), toggle: Prefs.picks(),
        step: function () { Prefs.set('picks', !Prefs.picks()); cards = []; renderCards(); }},
      {label: tr('Picks photos'), value: {sd: 'SD', hd: 'HD', fhd: 'Full HD'}[Prefs.photos()], dim: !Prefs.picks(),
        step: function (d) { if (Prefs.picks()) { cycle('photos', ['sd', 'hd', 'fhd'], Prefs.photos(), d); cards = []; renderCards(); } }},
      {label: tr('Quotes widget'), toggle: Prefs.quotes(),
        step: function () { Prefs.set('quotes', !Prefs.quotes()); Data.settingsChanged(); }}
    ];
    rows = screenRows(theme, auto).concat(rows);
    var names = ['Bitcoin', 'Ethereum', 'Solana', tr('Dollar')];
    var count = !Prefs.quotes() ? 0 : Data.currency === 'BRL' ? 4 : 3;   // no coin rows while the widget is off
    for (var i = 0; i < count; i++) {
      (function (i) {
        rows.push({label: names[i], toggle: Prefs.quotes() && Prefs.coin(i), dim: !Prefs.quotes(),
          step: function () { if (Prefs.quotes()) { Prefs.setCoin(i, !Prefs.coin(i)); Data.settingsChanged(); } }});
      })(i);
    }
    rows.push({section: tr('Region'), label: tr('Language'), value: picked === 'auto' ? auto : I18N.languageName(picked), opens: true, language: true,
      step: function (d) { if (d >= 0) openLanguages(); }});
    rows.push({label: tr('Temperature'), value: unit === 'C' ? '°C' : unit === 'F' ? '°F' : tr('unit|Automatic'),
      step: function (d) { cycle('temperature', ['auto', 'C', 'F'], unit, d); renderPanels(); }});
    rows.push({section: tr('System'), label: tr('Shelf'), value: '›', step: function (d) { if (d >= 0) openShelfEdit(); }});
    rows.push({label: tr('TV Settings'), value: '›', step: function (d) { if (d >= 0) tvSettings(); }});
    rows.push({label: tr('Menu style'), value: menuStyleName(), step: changeMenuStyle});
    return rows;
  }

  function categoryRows() {
    var full = settingRows(), groups = [], section = -1, i;
    for (i = 0; i < full.length; i++) {
      if (full[i].section) { section++; groups[section] = []; }
      groups[section].push(full[i]);
    }
    return groups;
  }

  function cycle(name, values, current, d) {
    var i = values.indexOf(current);
    Prefs.set(name, values[(i + (d || 1) + values.length) % values.length]);
  }

  var rowsNow = [];

  function settingRow(parent, r, i, categorized) {
    var row = el('div', 'row' + (r.dim ? ' dim' : '') + (r.toggle !== undefined ? ' has-toggle' : ' has-value') + (categorized ? ' option-row' : ''), parent);
    el('span', 'row-label', row, r.label);
    if (r.toggle !== undefined) setClass(el('div', 'toggle', row), 'on', r.toggle);
    else {
      var v = el('span', 'value', row);
      if (r.value === '›') v.textContent = '›';
      else if (r.opens || categorized) { v.appendChild(document.createTextNode(r.value)); el('span', 'chev', v, '›'); }
      else { el('span', 'chev', v, '‹'); v.appendChild(document.createTextNode(r.value)); el('span', 'chev', v, '›'); }
    }
    if (categorized) {
      row.onmouseover = function () { st.zone = Z.SETTINGS; settingsPane = 1; st.row = i; updateFocus(); };
      row.onclick = function () { row.onmouseover(); activate(); };
    } else hover(row, Z.SETTINGS, i);
  }

  function renderSettings() {
    var box = $('settings').firstChild;
    box.innerHTML = '';
    var title = el('div', 'title', box);
    var categorized = Prefs.menuStyle() === 'categories';
    setClass($('settings'), 'categorized', categorized);
    sym('home', title);
    title.appendChild(document.createTextNode(tr('Home Settings')));
    if (categorized) {
      var groups = categoryRows(), labels = settingSectionNames();
      settingsCategory = Math.max(0, Math.min(labels.length - 1, settingsCategory));
      rowsNow = groups[settingsCategory];
      st.row = Math.max(0, Math.min(rowsNow.length - 1, st.row));
      var layout = el('div', 'category-layout', box), nav = el('div', 'category-nav', layout);
      var icons = ['tv_settings', 'sparkles', 'sunny', 'settings'];
      for (var c = 0; c < labels.length; c++) {
        (function (index) {
          var cat = el('div', 'category-row', nav);
          sym(icons[index], el('span', 'category-icon', cat));
          el('span', 'category-label', cat, labels[index]);
          sym('chevron_right', cat).className += ' category-chevron';
          cat.onmouseover = function () {
            st.zone = Z.SETTINGS;
            if (settingsCategory !== index || settingsPane !== 0) {
              settingsCategory = index; settingsPane = 0; st.row = 0; renderSettings();
            } else updateFocus();
          };
          cat.onclick = function () { settingsCategory = index; settingsPane = 1; st.row = 0; renderSettings(); };
        })(c);
      }
      var panel = el('div', 'category-panel', layout);
      panel.style.height = Math.min(830, 108 + rowsNow.length * 76) + 'px';
      el('div', 'category-heading', panel, labels[settingsCategory]);
      var optionList = el('div', 'list option-list', panel), optionHolder = el('div', 'rows option-rows', optionList);
      optionList.style.height = Math.min(736, 8 + rowsNow.length * 76) + 'px';
      var items = el('div', 'setting-items', optionHolder);
      for (var o = 0; o < rowsNow.length; o++) settingRow(items, rowsNow[o], o, true);
      updateFocus();
      return;
    }
    var list = el('div', 'list', box), holder = el('div', 'rows', list);
    rowsNow = settingRows();
    st.row = Math.max(0, Math.min(rowsNow.length - 1, st.row));
    var group = null, items = null;
    for (var i = 0; i < rowsNow.length; i++) {
      var r = rowsNow[i];
      if (r.section) {
        group = el('div', 'setting-group', holder);
        el('div', 'sect', group, r.section);
        items = el('div', 'setting-items', group);
      }
      settingRow(items, r, i, false);
    }
    el('div', 'hint', box, tr('OK or the arrows change the value.'));
    updateFocus();
  }

  function openSettings(category) {
    settingsCategory = category === undefined ? 0 : category;
    settingsPane = category === undefined ? 0 : 1;
    st.zone = Z.SETTINGS;
    st.row = 0;
    renderSettings();
    setClass($('settings'), 'open', true);
    updateFocus();
  }

  // MARK: - Screen mode: its own menu, with a drawing for each mode; moving through it previews the mode, Back puts the old one back

  var modeBefore = 'default';

  function renderModes() {
    var box = $('modepick').firstChild, names = modeNames(), descs = modeDescs(), selected = MODE_IDS[st.mp];
    box.innerHTML = '';
    var title = el('div', 'title', box);
    sym('tv_settings', title);
    title.appendChild(document.createTextNode(tr('Screen mode')));
    var preview = el('div', 'mode-preview', box);
    var large = el('div', 'thumb t-' + selected, preview);
    for (var p = 0; p < 6; p++) el('span', 'p' + p, large);
    var caption = el('div', 'mode-caption', preview);
    el('div', 'mode-name', caption, names[selected]);
    el('div', 'mode-desc', caption, descs[selected]);
    var list = el('div', 'list', box), holder = el('div', 'rows', list);
    for (var i = 0; i < MODE_IDS.length; i++) {
      var id = MODE_IDS[i], row = el('div', 'row choice', holder);
      var th = el('div', 'thumb t-' + id, row);
      for (var m = 0; m < 6; m++) el('span', 'p' + m, th);
      el('span', 'mode-option-name', row, names[id]);
      if (id === modeBefore) sym('check', row).className += ' tick';
      hover(row, Z.MODEPICK, i);
    }
    el('div', 'hint', box, tr('OK picks, Back cancels.'));
    updateFocus();
  }

  function openModes() {
    setClass($('settings'), 'open', false);
    modeBefore = Prefs.mode();
    st.zone = Z.MODEPICK;
    st.mp = Math.max(0, MODE_IDS.indexOf(modeBefore));
    renderModes();
    setClass($('modepick'), 'open', true);
    updateFocus();
  }

  /** The mode under the focus is shown on the home behind the menu as you move. */
  function previewMode() {
    var id = MODE_IDS[st.mp];
    if (id === Prefs.mode()) return;
    Prefs.set('mode', id);
    renderAll();
    renderModes();
  }

  /** OK keeps the mode, Back puts the old one back. Either way, back to Home Settings on the Screen mode row. */
  function closeModes(pick) {
    setClass($('modepick'), 'open', false);
    if (!pick && Prefs.mode() !== modeBefore) { Prefs.set('mode', modeBefore); renderAll(); }
    openSettings(settingsCategory);
    for (var i = 0; i < rowsNow.length; i++) if (rowsNow[i].modes) st.row = i;
    updateFocus();
  }

  // MARK: - Language: a list of every catalogue in its own name, as on Android (moving through it doesn't switch the app)

  var langHint = null;

  function languageChoices() {
    return ['auto'].concat(I18N.languages());
  }

  /** The language in use: "auto", or the catalogue the setting resolved to ("pt-BR" in config.properties is "pt"). */
  function pickedLanguage() {
    return Prefs.language() === 'auto' ? 'auto' : I18N.lang;
  }

  function renderLanguages() {
    var box = $('langpick').firstChild, choices = languageChoices(), current = choices.indexOf(pickedLanguage());
    box.innerHTML = '';
    el('div', 'title', box, tr('Language'));
    var list = el('div', 'list', box), holder = el('div', 'rows', list);
    list.style.height = Math.min(choices.length, 7) * 78 + 'px';
    for (var i = 0; i < choices.length; i++) {
      var row = el('div', 'row', holder, choices[i] === 'auto' ? tr('Automatic') : I18N.languageName(choices[i]));
      if (i === current) sym('check', el('span', 'value', row));
      hover(row, Z.LANG, i);
    }
    langHint = el('div', 'hint', box);
    updateFocus();
  }

  function openLanguages() {
    setClass($('settings'), 'open', false);
    st.zone = Z.LANG;
    st.lang = Math.max(0, languageChoices().indexOf(pickedLanguage()));
    renderLanguages();
    setClass($('langpick'), 'open', true);
    updateFocus();
  }

  /** OK: the language under the focus; Back: none. Either way, back to Home Settings, on the Language row. */
  function closeLanguages(pick) {
    setClass($('langpick'), 'open', false);
    langHint = null;
    var code = languageChoices()[st.lang];
    if (pick && code !== pickedLanguage()) {
      Prefs.set('language', code);
      I18N.set(Prefs.language());
      renderAll();
      Data.refresh();   // the picks' titles and genres come in the new language
    }
    openSettings(settingsCategory);
    for (var i = 0; i < rowsNow.length; i++) if (rowsNow[i].language) st.row = i;
    updateFocus();
  }

  // MARK: - Shelf editor: which apps, in what order

  function editList() {
    var ids = shelf.map(function (a) { return a.id; });
    return {ids: ids, rows: apps.slice().sort(function (a, b) {
      var ia = ids.indexOf(a.id), ib = ids.indexOf(b.id);
      if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
    })};
  }

  function renderShelfEdit() {
    var box = $('shelfedit').firstChild, e = editList();
    box.innerHTML = '';
    var title = el('div', 'title', box);
    sym('apps', title);
    title.appendChild(document.createTextNode(tr('Shelf')));
    var list = el('div', 'list', box), holder = el('div', 'rows', list);
    list.style.height = Math.min(e.rows.length, 7) * 78 + 'px';
    for (var i = 0; i < e.rows.length; i++) {
      var a = e.rows[i], at = e.ids.indexOf(a.id), row = el('div', 'row', holder, a.title);
      el('span', 'value', row, at >= 0 ? '#' + (at + 1) : tr('shelf|Off'));
      hover(row, Z.EDIT, i);
    }
    el('div', 'hint', box, trf('OK adds or removes (up to {n}). ← → change the order.', {n: MAX_SHELF}));
    updateFocus();
  }

  function openShelfEdit() {
    setClass($('settings'), 'open', false);
    st.zone = Z.EDIT;
    st.edit = 0;
    renderShelfEdit();
    setClass($('shelfedit'), 'open', true);
    updateFocus();
  }

  function editShelf(dx) {
    var e = editList(), app = e.rows[st.edit];
    if (!app) return;
    var ids = e.ids.slice(), at = ids.indexOf(app.id);
    if (dx === 0) {
      if (at >= 0) ids.splice(at, 1);
      else if (ids.length < MAX_SHELF) ids.push(app.id);
      else { toast(trf('The shelf holds up to {n} apps.', {n: MAX_SHELF})); return; }
    } else {
      if (at < 0) return;
      var to = Math.max(0, Math.min(ids.length - 1, at + dx));
      ids.splice(at, 1);
      ids.splice(to, 0, app.id);
    }
    Prefs.set('shelf', ids);
    pickShelf();
    renderShelf();
    var again = editList();
    for (var i = 0; i < again.rows.length; i++) if (again.rows[i].id === app.id) st.edit = i;
    renderShelfEdit();
  }

  // MARK: - Opening things

  function launcher(id, name) {
    return function () {
      TV.launch(id, null, function (ok) {
        if (!ok) toast(trf("Couldn't open {app}.", {app: name || id}));
      });
    };
  }

  function tvSettings() {
    TV.settings(function (ok) {
      if (!ok) toast(tr("Couldn't open TV Settings"));
    });
  }

  function liveTV() {
    for (var i = 0; i < inputs.length; i++) if (inputs[i].key === 'live') return inputs[i];
    return null;
  }

  function activate() {
    if (V.glide) pulse();
    switch (st.zone) {
      case Z.TOP:
        return;
      case Z.SIDE:
        if (st.side === 0) { var live = liveTV(); if (live) launcher(live.id, tr('Live TV'))(); }
        else if (st.side === 1) { openDrawer(); st.drawer = 0; updateFocus(); }
        else if (st.side === 2) openApps();
        else openSettings();
        return;
      case Z.CARDS:
        if (st.card >= cards.length) { openMore(); return; }
        var p = cards[st.card], app = p && Data.appFor(p.app);
        if (app) launcher(app.id, app.title)();
        return;
      case Z.SHELF:
        if (shelf[st.shelf]) launcher(shelf[st.shelf].id, shelf[st.shelf].title)();
        return;
      case Z.DRAWER:
        if (drawerItems[st.drawer]) drawerItems[st.drawer].run();
        return;
      case Z.APPS:
        if (others[st.grid]) launcher(others[st.grid].id, others[st.grid].title)();
        return;
      case Z.MORE:
        if (st.moreTop) { selectMoreChip(st.mchip); return; }
        var mp = moreList[st.more], mapp = mp && Data.appFor(mp.app);
        if (mapp) launcher(mapp.id, mapp.title)();
        return;
      case Z.SETTINGS:
        if (Prefs.menuStyle() === 'categories' && settingsPane === 0) {
          settingsPane = 1;
          st.row = 0;
          updateFocus();
          return;
        }
        if (rowsNow[st.row]) { rowsNow[st.row].step(1); if (st.zone === Z.SETTINGS) renderSettings(); }
        return;
      case Z.EDIT:
        editShelf(0);
        return;
      case Z.MODEPICK:
        closeModes(true);
        return;
      case Z.LANG:
        closeLanguages(true);
        return;
    }
  }

  function selectTab(i) {
    if (i === st.tab) return;
    st.tab = i;
    renderCards();
  }

  function move(dx, dy) {
    var tiles = $('tiles').children, cardNodes = $('cards').children;
    switch (st.zone) {
      case Z.SHELF:
        var cols = V.cols || shelf.length || 1, srow = Math.floor(st.shelf / cols), rowEnd = Math.min(shelf.length - 1, srow * cols + cols - 1);
        if (dx < 0 && st.shelf % cols === 0) { st.zone = Z.SIDE; st.side = V.rail ? 3 : 1; break; }
        if (dx) st.shelf = Math.max(srow * cols, Math.min(rowEnd, st.shelf + dx));
        else if (dy > 0) {
          if (st.shelf + cols < shelf.length) st.shelf += cols;
          else if (srow < Math.floor((shelf.length - 1) / cols)) st.shelf = shelf.length - 1;
          else { openDrawer(); return; }
        } else if (dy < 0) {
          if (srow > 0) st.shelf -= cols;
          else if (cards.length) { st.zone = Z.CARDS; st.card = nearest(cardNodes, centerX(tiles[st.shelf])); }
          else { st.zone = Z.TOP; st.top = st.tab; }
        }
        break;
      case Z.SIDE:
        if (V.rail) {
          if (dy > 0 && st.side === 3) { openDrawer(); return; }
          if (dy) st.side = Math.max(0, Math.min(3, st.side + dy));
          else if (dx > 0) {
            if (cards.length) { st.zone = Z.CARDS; st.card = 0; }
            else if (shelf.length) { st.zone = Z.SHELF; st.shelf = 0; }
            else { st.zone = Z.TOP; st.top = st.tab; }
          }
          break;
        }
        if (dx > 0 && st.side % 2 === 1) { if (shelf.length) { st.zone = Z.SHELF; st.shelf = 0; } }
        else if (dx) st.side = Math.max(st.side - st.side % 2, Math.min(st.side - st.side % 2 + 1, st.side + dx));
        else if (dy > 0) { if (st.side < 2) st.side += 2; else { openDrawer(); return; } }
        else if (dy < 0) {
          if (st.side >= 2) st.side -= 2;
          else if (cards.length) { st.zone = Z.CARDS; st.card = 0; }
          else { st.zone = Z.TOP; st.top = st.tab; }
        }
        break;
      case Z.CARDS:
        if (dx < 0 && st.card === 0 && V.rail) { st.zone = Z.SIDE; st.side = 0; break; }
        if (dx) st.card = Math.max(0, Math.min(cards.length, st.card + dx));
        else if (dy < 0) { st.zone = Z.TOP; st.top = st.tab; }
        else if (shelf.length) { st.zone = Z.SHELF; st.shelf = nearest(Array.prototype.slice.call(tiles, 0, V.cols || tiles.length), centerX(cardNodes[st.card])); }
        break;
      case Z.TOP:
        if (dx) {
          if (dx < 0 && st.top === 0 && V.rail) { st.zone = Z.SIDE; st.side = 0; break; }
          st.top = Math.max(0, Math.min(2, st.top + dx));
          selectTab(st.top);   // as on Apple TV: focusing a tab selects it
        } else if (dy > 0) {
          if (cards.length) { st.zone = Z.CARDS; st.card = 0; }
          else st.zone = Z.SHELF;
        }
        break;
      case Z.DRAWER:
        if (dx) st.drawer = Math.max(0, Math.min(drawerItems.length - 1, st.drawer + dx));
        else if (dy < 0) { closeDrawer(); return; }
        break;
      case Z.APPS:
        var g = st.grid + dx + dy * 5;
        if (g >= 0 && g < others.length && (dx === 0 || Math.floor(g / 5) === Math.floor(st.grid / 5))) st.grid = g;
        break;
      case Z.MORE:
        if (st.moreTop) {
          if (dx) { st.mchip = Math.max(0, Math.min(moreChips.length - 1, st.mchip + dx)); selectMoreChip(st.mchip); return; }
          if (dy > 0 && moreList.length) { st.moreTop = false; st.more = 0; }
          break;
        }
        var mg = st.more + dx + dy * 4, mrow = Math.floor(st.more / 4), mlast = Math.floor((moreList.length - 1) / 4);
        if (dy < 0 && mrow === 0) st.moreTop = true;
        else if (dy > 0 && mg >= moreList.length && mrow < mlast) st.more = moreList.length - 1;
        else if (mg >= 0 && mg < moreList.length && (dx === 0 || Math.floor(mg / 4) === mrow)) st.more = mg;
        wantMore();
        break;
      case Z.SETTINGS:
        if (Prefs.menuStyle() === 'categories') {
          if (settingsPane === 0) {
            if (dy) {
              settingsCategory = Math.max(0, Math.min(settingSectionNames().length - 1, settingsCategory + dy));
              st.row = 0;
              renderSettings();
              return;
            }
            if (dx > 0) { settingsPane = 1; st.row = 0; }
          } else if (dy) st.row = Math.max(0, Math.min(rowsNow.length - 1, st.row + dy));
          else if (dx < 0) { settingsPane = 0; st.row = 0; }
          else if (dx > 0 && rowsNow[st.row]) {
            rowsNow[st.row].step(1);
            if (st.zone === Z.SETTINGS) renderSettings();
          }
        } else {
          if (dy) st.row = Math.max(0, Math.min(rowsNow.length - 1, st.row + dy));
          else if (dx && rowsNow[st.row]) {
            var r = rowsNow[st.row];
            if (r.value !== '›') { r.step(dx); if (st.zone === Z.SETTINGS) renderSettings(); }
          }
        }
        break;
      case Z.EDIT:
        if (dy) st.edit = Math.max(0, Math.min(apps.length - 1, st.edit + dy));
        else if (dx) editShelf(dx);
        break;
      case Z.MODEPICK:
        if (dy) { st.mp = Math.max(0, Math.min(MODE_IDS.length - 1, st.mp + dy)); previewMode(); return; }
        break;
      case Z.LANG:
        if (dy) st.lang = Math.max(0, Math.min(languageChoices().length - 1, st.lang + dy));
        break;
    }
    updateFocus();
  }

  function back() {
    if (st.zone === Z.EDIT) {
      setClass($('shelfedit'), 'open', false);
      openSettings(settingsCategory);
      for (var i = 0; i < rowsNow.length; i++) if (rowsNow[i].label === tr('Shelf')) st.row = i;
      updateFocus();
      return;
    }
    if (st.zone === Z.LANG) { closeLanguages(false); return; }
    if (st.zone === Z.MODEPICK) { closeModes(false); return; }
    if (sheetOpen()) { closeSheets(); return; }
    if (st.zone === Z.DRAWER) { closeDrawer(); return; }
    if (st.zone !== Z.SHELF && shelf.length) { st.zone = Z.SHELF; updateFocus(); return; }
    TV.back();
  }

  /** The pointer focuses what it's over (the Magic Remote, or a mouse when previewing). */
  function hover(node, zone, index) {
    node.onmouseover = function () {
      if (saverOn || (sheetOpen() !== (zone === Z.APPS || zone === Z.MORE || zone === Z.SETTINGS || zone === Z.EDIT || zone === Z.LANG || zone === Z.MODEPICK))) return;
      if (zone === Z.DRAWER && st.zone !== Z.DRAWER) return;
      if (zone !== Z.DRAWER && st.zone === Z.DRAWER && zone !== Z.SHELF && zone !== Z.SIDE) return;
      if (zone === Z.SHELF && st.zone === Z.DRAWER) closeDrawer();
      st.zone = zone;
      if (zone === Z.TOP) { st.top = index; if (index < 3) selectTab(index); }
      else if (zone === Z.CARDS) st.card = index;
      else if (zone === Z.SIDE) st.side = index;
      else if (zone === Z.SHELF) st.shelf = index;
      else if (zone === Z.DRAWER) st.drawer = index;
      else if (zone === Z.APPS) st.grid = index;
      else if (zone === Z.MORE) { st.more = index; st.moreTop = false; }
      else if (zone === Z.SETTINGS) st.row = index;
      else if (zone === Z.EDIT) st.edit = index;
      else if (zone === Z.LANG) st.lang = index;
      else if (zone === Z.MODEPICK) { st.mp = index; previewMode(); updateFocus(); return; }
      updateFocus();
    };
    node.onclick = function () { node.onmouseover(); activate(); };
  }

  // MARK: - Toast

  var toastTimer = 0;
  function toast(text) {
    var t = $('toast');
    t.textContent = text;
    setClass(t, 'on', true);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { setClass(t, 'on', false); }, 6000);
  }

  // MARK: - Night, clock, screensaver

  function checkNight() {
    var now = Date.now(), night = V.dark || (!V.light && Data.isNight(now));
    // Afternoon: in the 3 hours before sunset the sky fades to night; from halfway the text and surfaces switch too.
    var ramp = 0;
    if (!night && !V.light && Prefs.theme() === 'auto') {
      var d = new Date(now), mins = d.getHours() * 60 + d.getMinutes(), w = Data.weather;
      var set = w && w.sunset ? new Date(w.sunset).getHours() * 60 + new Date(w.sunset).getMinutes() : 1080;
      var rise = w && w.sunrise ? new Date(w.sunrise).getHours() * 60 + new Date(w.sunrise).getMinutes() : 360;
      var eve = Math.max(0, Math.min(1, (mins - (set - 180)) / 180)), morn = Math.max(0, Math.min(1, 1 - (mins - rise) / 180));
      ramp = Math.max(eve, morn);
    }
    setClass(body, 'night', night || ramp >= 0.5);
    var sky = $('sky');
    sky.querySelector('.night').style.opacity = night ? '' : String(ramp);
    sky.querySelector('.veil').style.opacity = night ? '' : String(1 - ramp);
    // The light in the sky follows the hour: pale blue in the morning, deeper later, indigo at night.
    var hr = new Date(now).getHours();
    setClass(body, 'ph-morning', !night && hr < 11);
    setClass(body, 'ph-golden', !night && hr >= 15);
  }

  var saverOn = false, idleAt = Date.now(), saverIndex = 0, saverTimer = 0, SAVER_AFTER = 5 * 60000;

  function showSaver() {
    var photos = Data.showcase().filter(function (p) { return p.backdrop && Data.appFor(p.app); });
    saverOn = true;
    var s = $('saver');
    s.innerHTML = '';
    var a = el('div', 'photo', s), b = el('div', 'photo', s);
    el('div', 'shade', s);
    var clock = el('div', 'clock', s);
    el('div', 'time', clock);
    el('div', 'date', clock);
    el('div', 'wx', clock);
    el('div', 'title', clock);
    var front = a;
    function next() {
      if (!saverOn) return;
      var p = photos.length ? photos[saverIndex++ % photos.length] : null;
      var back = front === a ? b : a;
      if (p) {
        back.style.backgroundImage = 'url(' + Data.image(p.backdrop, 'original') + ')';
        back.style.webkitTransform = back.style.transform = 'scale(1.0)';
        clock.lastChild.textContent = p.title;
        setTimeout(function () {
          setClass(back, 'on', true);
          setClass(front, 'on', false);
          back.style.webkitTransform = back.style.transform = 'scale(1.08) translateX(-1.5%)';
          front = back;
        }, 60);
      }
      tickSaverClock(clock);
      saverTimer = setTimeout(next, 12000);
    }
    setClass(s, 'on', true);
    next();
  }

  function tickSaverClock(clock) {
    var d = new Date();
    clock.firstChild.textContent = formatDate('format|h:mm', d.getTime());
    clock.children[1].textContent = formatDate('format|EEEE, MMMM d', d.getTime());
    var wx = clock.children[2], w = Data.weather;
    wx.innerHTML = '';
    if (w) {
      sym(Data.symbol(w.code, w.isDay), wx);
      wx.appendChild(document.createTextNode(Data.degrees(w.temp) + '   ' + Data.condition(w.code, w.isDay)));
    }
  }

  function hideSaver() {
    saverOn = false;
    clearTimeout(saverTimer);
    setClass($('saver'), 'on', false);
  }

  function poke() {
    idleAt = Date.now();
    if (saverOn) { hideSaver(); return true; }
    return false;
  }

  // MARK: - Keys

  document.addEventListener('keydown', function (e) {
    var k = e.keyCode;
    if (poke()) { e.preventDefault(); return; }   // the first press only wakes the screen
    if (k === TV.keys.left) move(-1, 0);
    else if (k === TV.keys.right) move(1, 0);
    else if (k === TV.keys.up) move(0, -1);
    else if (k === TV.keys.down) move(0, 1);
    else if (k === TV.keys.ok) activate();
    else if (k === TV.keys.back || k === 27 || k === 8) back();
    else return;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function () { poke(); });

  // MARK: - Start

  function renderAll() {
    applyMode();
    applyLook();
    renderMini();
    var hint = $('hint');
    if (!hint.firstChild) { sym('chevron_down', hint); el('span', '', hint, tr('Weather and inputs')); }
    renderTop();
    renderQuotes();
    cards = [];
    renderCards();
    renderShelf();
    renderDrawer();
    renderClock();
    checkNight();
    if (st.zone === Z.SETTINGS) renderSettings();
    updateFocus();
  }

  /** hide_apps in config.properties: left out of the shelf, All Apps and the picks, by id or name (part of it). */
  var HIDE = (CONFIG.hideApps || []).map(function (s) { return s.toLowerCase(); });
  function hidden(app) {
    var id = (app.id || '').toLowerCase(), title = (app.title || '').toLowerCase();
    for (var i = 0; i < HIDE.length; i++) if (id.indexOf(HIDE[i]) >= 0 || title.indexOf(HIDE[i]) >= 0) return true;
    return false;
  }

  function loadApps(done) {
    TV.apps(function (list) {
      apps = list.filter(function (a) { return !hidden(a); });
      Data.setApps(apps);
      pickShelf();
      TV.inputs(function (list2) {
        inputs = list2;
        if (done) done();
      });
    });
  }

  /** Back to the home screen (the app was opened again): the shelf, everything closed, the first tab. */
  function reset() {
    hideSaver();
    closeSheets();
    st.zone = Z.SHELF;
    st.shelf = 0;
    if (st.tab !== 0) { st.tab = 0; renderCards(); }
    updateFocus();
  }

  Data.onChange(function () {
    renderQuotes();
    renderCards();
    renderPanels();
    checkNight();
  });

  function reopened() {
    // LG: with handlesRelaunch the app has to come to the front itself, or opening it again while it runs shows nothing.
    if (window.PalmSystem && window.PalmSystem.activate) window.PalmSystem.activate();
    reset();
    loadApps(function () { renderShelf(); renderDrawer(); Data.refresh(); });
  }

  window.addEventListener('resize', fit);
  document.addEventListener('webOSRelaunch', reopened);   // LG: opened again while running
  window.addEventListener('appcontrol', reopened);        // Samsung: the same
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { hideSaver(); return; }
    idleAt = Date.now();
    loadApps(function () { renderShelf(); renderDrawer(); updateFocus(); Data.refresh(); });
  });

  I18N.set(Prefs.language());
  fit();
  renderTop();
  requestAnimationFrame(perfLoop);
  loadApps(function () {
    renderAll();
    Data.refresh();
  });
  setInterval(renderClock, 1000);
  setInterval(function () {
    checkNight();
    Data.refresh();
    if (!saverOn && !sheetOpen() && Date.now() - idleAt > SAVER_AFTER) showSaver();
    if (saverOn) tickSaverClock($('saver').querySelector('.clock'));
  }, 30000);

  // For the browser preview and tests.
  window.FreeMyTV = {state: st, move: move, activate: activate, back: back, showSaver: showSaver, hideSaver: hideSaver, toast: toast};
})();
