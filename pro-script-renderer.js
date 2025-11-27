
// pro-script-renderer.js
// Fallback renderer: baca window.SAMPLE_CERPEN dan render daftar/beranda/kategori
(function () {
  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return Array.from(document.querySelectorAll(sel)); }

  function findContainer() {
    var candidates = [
      '#cerpen-list',
      '.list-cerpen',
      '#daftar-cerpen',
      '.cards',
      '.card-list',
      '#content'
    ];
    for (var i = 0; i < candidates.length; i++) {
      var el = q(candidates[i]);
      if (el) return el;
    }
    return document.body;
  }

  function renderCard(c) {
    var wrapper = document.createElement('article');
    wrapper.className = 'cerpen-card';

    var title = document.createElement('h3');
    title.textContent = c.title || 'Untitled';

    var meta = document.createElement('p');
    meta.className = 'cerpen-meta';
    meta.textContent = (c.category ? c.category + ' • ' : '') + (c.date || '');

    var summary = document.createElement('p');
    summary.className = 'cerpen-summary';
    summary.textContent = c.summary ? c.summary : (c.content ? (c.content.substring(0, 200) + '...') : '');

    var read = document.createElement('a');
    read.className = 'cerpen-read';
    read.href = 'baca.html?id=' + encodeURIComponent(c.id);
    read.textContent = 'Baca selengkapnya →';

    wrapper.appendChild(title);
    wrapper.appendChild(meta);
    wrapper.appendChild(summary);
    wrapper.appendChild(read);
    return wrapper;
  }

  function renderListTo(container, list) {
    if (!container) return;
    try { container.innerHTML = ''; } catch (e) {}

    if (!list || !list.length) {
      var p = document.createElement('p');
      p.textContent = 'Belum ada cerpen (atau data belum dimuat).';
      container.appendChild(p);
      return;
    }
    list.forEach(function (c) {
      container.appendChild(renderCard(c));
    });
  }

  function renderCategories(list) {
    var map = {};
    (list || []).forEach(function (c) {
      var cat = (c.category || 'Umum').trim();
      if (!map[cat]) map[cat] = 0;
      map[cat]++;
    });

    var catContainer = q('#category-list') || q('.category-list') || q('.categories');
    if (!catContainer) return;
    try { catContainer.innerHTML = ''; } catch (e) {}

    Object.keys(map).sort().forEach(function (cat) {
      var a = document.createElement('a');
      a.href = 'kategori.html?cat=' + encodeURIComponent(cat);
      a.textContent = cat + ' (' + map[cat] + ')';
      catContainer.appendChild(a);
    });
  }

  function mainRender() {
    var list = (window.SAMPLE_CERPEN && Array.isArray(window.SAMPLE_CERPEN)) ? window.SAMPLE_CERPEN : [];
    list = list.slice(0).sort(function (a, b) {
      return (a.id || 0) - (b.id || 0);
    });

    var container = findContainer();
    renderListTo(container, list);
    renderCategories(list);

    if (location.pathname && /baca/i.test(location.pathname)) {
      var params = new URLSearchParams(location.search);
      var id = params.get('id');
      if (id) {
        var found = list.find(function (x) { return String(x.id) === String(id); });
        if (found) {
          var readContainer = q('#cerpen-read') || q('.cerpen-read-full') || q('#content') || document.body;
          try { readContainer.innerHTML = ''; } catch (e) {}
          var h = document.createElement('h1'); h.textContent = found.title;
          var meta = document.createElement('p'); meta.textContent = (found.category || '') + ' • ' + (found.date || '');
          var content = document.createElement('div'); content.className = 'cerpen-full';

          var parts = String(found.content || '').split(/\n\n+/);
          parts.forEach(function (p) {
            var pEl = document.createElement('p');
            pEl.textContent = p.trim();
            content.appendChild(pEl);
          });

          readContainer.appendChild(h);
          readContainer.appendChild(meta);
          readContainer.appendChild(content);
        }
      }
    }

    console.info('pro-script-renderer: rendered', list.length, 'cerpen');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mainRender);
  } else {
    mainRender();
  }
})();
