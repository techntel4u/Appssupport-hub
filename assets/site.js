// Apprenticeship Central — small helpers shared by every page.
(function () {
  // Safe localStorage (can throw in private windows or locked-down browsers)
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  };
  var PREFIX = 'ac-hub-';

  // Toast
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(say.t);
    say.t = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  // Copy buttons: <button data-copy="text" data-copy-label="the e-track address">
  function copyText(text, label) {
    var done = function () { say('Copied ' + (label || text)); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { say(text); });
    } else { say(text); }
  }
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy'), btn.getAttribute('data-copy-label'));
    });
  });

  // Copy a link to a guide section: <button data-share="#g04">
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = window.location.href.split('#')[0] + btn.getAttribute('data-share');
      copyText(url, 'link to this guide');
    });
  });

  // "I've read this" ticks: <input type="checkbox" data-done="key"> inside a .card
  function paint(key, on) {
    document.querySelectorAll('[data-done="' + key + '"]').forEach(function (cb) {
      cb.checked = on;
      var card = cb.closest('.card');
      if (card) card.classList.toggle('is-done', on);
    });
    document.querySelectorAll('[data-tile="' + key + '"]').forEach(function (t) { t.classList.toggle('built', on); });
  }
  document.querySelectorAll('[data-done]').forEach(function (cb) {
    var key = cb.getAttribute('data-done');
    if (store.get(PREFIX + key) === '1') paint(key, true);
    cb.addEventListener('change', function () {
      store.set(PREFIX + key, cb.checked ? '1' : '0');
      paint(key, cb.checked);
      if (cb.checked) say('Marked as read');
    });
  });

  // Checklists that remember their ticks: <ul class="checklist" data-list="name">
  document.querySelectorAll('.checklist[data-list]').forEach(function (list) {
    var name = list.getAttribute('data-list');
    var boxes = list.querySelectorAll('input[type="checkbox"]');
    boxes.forEach(function (cb, i) {
      var k = PREFIX + name + '-' + i;
      if (store.get(k) === '1') cb.checked = true;
      cb.addEventListener('change', function () { store.set(k, cb.checked ? '1' : '0'); });
    });
    var reset = document.querySelector('[data-reset="' + name + '"]');
    if (reset) reset.addEventListener('click', function () {
      boxes.forEach(function (cb, i) { cb.checked = false; store.set(PREFIX + name + '-' + i, '0'); });
      say('Checklist cleared');
    });
  });

  // Guide search: filters tiles on the board by their text and the guide's text
  var search = document.getElementById('guide-search');
  if (search) {
    var tiles = document.querySelectorAll('.board .tile');
    var empty = document.querySelector('.no-results');
    var index = [];
    tiles.forEach(function (t) {
      var target = document.querySelector(t.getAttribute('href'));
      index.push((t.textContent + ' ' + (target ? target.textContent : '')).toLowerCase());
    });
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      tiles.forEach(function (t, i) {
        var hit = !q || q.split(/\s+/).every(function (w) { return index[i].indexOf(w) > -1; });
        t.hidden = !hit;
        if (hit) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    });
  }

  // Screenshot lightbox: <a class="zoom" href="big.png"><img></a>
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Enlarged screenshot');
  var boxImg = document.createElement('img');
  box.appendChild(boxImg);
  document.body.appendChild(box);
  function closeBox() { box.classList.remove('open'); }
  box.addEventListener('click', closeBox);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBox(); });
  document.querySelectorAll('a.zoom').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var img = a.querySelector('img');
      boxImg.src = a.getAttribute('href');
      boxImg.alt = img ? img.alt : '';
      box.classList.add('open');
    });
  });

  // Back-to-top button
  var top = document.querySelector('.to-top');
  if (top) {
    var onScroll = function () { top.classList.toggle('show', window.scrollY > 700); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
