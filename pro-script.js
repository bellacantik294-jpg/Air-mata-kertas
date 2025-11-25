/***********************************************
 PRO SCRIPT - FINAL FIX (UNTUK AIR-MATA-KERTAS)
 - Normalisasi data (judul/title)
 - Pastikan id dibuat bila belum ada
 - Render index / daftar / read / admin
 - Export / Import / comments / search / random
***********************************************/

(function(){
  // helper kecil
  function uid(){ return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function safeParse(s){ try { return JSON.parse(s); } catch(e){ return null; } }
  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  // --- storage helpers (normalize different formats) ---
  function normalizeItem(raw){
    if(!raw) return null;
    // allow both {judul, kategori, ringkasan, isi} and {title, category, summary, content}
    const item = {};
    item.id = raw.id || raw._id || raw.slug || uid();
    item.title = raw.title || raw.judul || raw.name || '';
    item.category = raw.category || raw.kategori || 'Umum';
    item.summary = raw.summary || raw.ringkasan || '';
    item.content = raw.content || raw.isi || '';
    item.date = raw.date || raw.tanggal || (raw.created || new Date().toISOString());
    item.cover = raw.cover || raw.image || '';
    return item;
  }

  function loadCerpenCollection(){
    const raw = safeParse(localStorage.getItem('cerpenCollection'));
    const arr = Array.isArray(raw) ? raw : [];
    // normalize items and ensure id exists
    const normalized = arr.map(i => {
      const n = normalizeItem(i) || {};
      if(!n.id) n.id = uid();
      return n;
    });
    return normalized;
  }

  function saveCerpenCollection(arr){
    // arr: array of normalized items (title, category, summary, content, id, date)
    localStorage.setItem('cerpenCollection', JSON.stringify(arr));
  }

  // If there is built-in sample array SAMPLE_CERPEN (from data/cerpen-data.js), merge them if local storage empty
  function ensureInitWithSample(){
    const existing = safeParse(localStorage.getItem('cerpenCollection')) || [];
    if(existing.length === 0 && Array.isArray(window.SAMPLE_CERPEN)){
      const merged = window.SAMPLE_CERPEN.map(normalizeItem).map(i => { if(!i.id) i.id = uid(); return i; });
      saveCerpenCollection(merged);
    }
  }

  // --- rendering helpers ---
  function makeCardElement(item){
    const art = document.createElement('article');
    art.className = 'card';
    art.setAttribute('data-id', item.id);
    art.innerHTML = `
      <div class="cover"><img src="${escapeHtml(item.cover||'')}" alt="${escapeHtml(item.title)}" class="cover-img" /></div>
      <h2>${escapeHtml(item.title)}</h2>
      <p class="meta">${escapeHtml(item.category)} • ${escapeHtml(item.date)}</p>
      <p class="muted">${escapeHtml(item.summary || '').slice(0,300)}</p>
      <a class="read-more" href="read.html?id=${encodeURIComponent(item.id)}">Baca</a>
    `;
    return art;
  }

  function renderIndex(){
    const container = document.getElementById('cards');
    if(!container) return;
    const data = loadCerpenCollection().slice().reverse();
    if(!data.length){ container.innerHTML = '<p class="muted">Belum ada cerpen.</p>'; return; }
    container.innerHTML = '';
    data.slice(0,12).forEach(it => container.appendChild(makeCardElement(it)));
  }

  function renderDaftar(){
    const list = document.getElementById('list') || document.getElementById('daftarList');
    if(!list) return;
    const data = loadCerpenCollection().slice().sort((a,b) => new Date(b.date) - new Date(a.date));
    if(!data.length){ list.innerHTML = '<p class="muted">Belum ada cerpen.</p>'; return; }
    list.innerHTML = '';
    if(list.tagName.toLowerCase() === 'ul' || list.tagName.toLowerCase() === 'ol'){
      data.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${escapeHtml(c.title)}</strong> — <em>${escapeHtml(c.category)}</em> • <a href="read.html?id=${encodeURIComponent(c.id)}">Baca</a>`;
        list.appendChild(li);
      });
    } else {
      data.forEach(c => list.appendChild(makeCardElement(c)));
    }
  }

  function renderRead(){
    const container = document.getElementById('cerpen');
    if(!container) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const titleParam = params.get('judul') || params.get('title') || '';
    const data = loadCerpenCollection();
    let item = null;
    if(id) item = data.find(x => x.id === id);
    if(!item && titleParam) item = data.find(x => x.title === decodeURIComponent(titleParam));
    if(!item){
      container.innerHTML = '<p class="muted">Cerpen tidak ditemukan.</p>';
      return;
    }
    const titleEl = document.getElementById('cerpen-title');
    const catEl = document.getElementById('cerpen-category');
    const dateEl = document.getElementById('cerpen-date');
    const contentEl = document.getElementById('cerpen-content');
    if(titleEl) titleEl.textContent = item.title;
    if(catEl) catEl.textContent = item.category;
    if(dateEl) dateEl.textContent = item.date;
    if(contentEl) contentEl.innerHTML = item.content;
    // comments (per id)
    const commentList = document.getElementById('comment-list');
    const form = document.getElementById('commentForm');
    const key = 'comments_' + item.id;
    function loadComments(){
      const arr = safeParse(localStorage.getItem(key)) || [];
      if(commentList) commentList.innerHTML = arr.map(c=>`<div class="comment"><strong>${escapeHtml(c.name||'Anon')}</strong><p>${escapeHtml(c.text)}</p></div>`).join('');
    }
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const name = (document.getElementById('commentName')||{value:''}).value.trim();
        const text = (document.getElementById('commentText')||{value:''}).value.trim();
        if(!text) return alert('Komentar kosong');
        const arr = safeParse(localStorage.getItem(key)) || [];
        arr.unshift({name, text, date: new Date().toISOString()});
        localStorage.setItem(key, JSON.stringify(arr));
        (document.getElementById('commentText')||{}).value = '';
        loadComments();
      });
      loadComments();
    }
  }

  // admin list render & deletion (uses normalized storage)
  function renderAdminList(){
    const wrap = document.getElementById('adminList');
    if(!wrap) return;
    const data = loadCerpenCollection();
    if(!data.length){ wrap.innerHTML = '<p>Belum ada cerpen.</p>'; return; }
    wrap.innerHTML = data.map((c,i)=>`<div class="admin-item"><strong>${escapeHtml(c.title)}</strong> — <em>${escapeHtml(c.category)}</em><br/><button data-index="${i}" class="adm-del">Hapus</button></div>`).join('');
    // attach delete handlers
    Array.from(document.querySelectorAll('.adm-del')).forEach(b=>{
      b.onclick = function(){
        const idx = parseInt(this.getAttribute('data-index'),10);
        const arr = loadCerpenCollection();
        arr.splice(idx,1);
        saveCerpenCollection(arr);
        renderAdminList();
        alert('Cerpen dihapus.');
      };
    });
  }

  // Admin form submit (matches admin.html ids)
  function wireAdminForm(){
    const form = document.getElementById('adminForm');
    if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const title = (document.getElementById('adminTitle')||{value:''}).value.trim();
      const category = (document.getElementById('adminCategory')||{value:''}).value.trim()||'Umum';
      const summary = (document.getElementById('adminSummary')||{value:''}).value.trim();
      const content = (document.getElementById('adminContent')||{value:''}).value.trim();
      if(!title || !content){ alert('Judul dan isi wajib diisi'); return; }
      // create normalized item with id
      const arr = loadCerpenCollection();
      const item = {
        id: uid(),
        title: title,
        category: category,
        summary: summary,
        content: content,
        date: new Date().toLocaleString(),
        cover: '' // optional
      };
      arr.unshift(item);
      saveCerpenCollection(arr);
      // reset form and rerender admin list
      form.reset();
      renderAdminList();
      alert('Cerpen berhasil disimpan ke LocalStorage.');
      // note: don't reload page to preserve state
    });
  }

  // export/import
  window.exportCerpen = function(){
    const raw = localStorage.getItem('cerpenCollection') || '[]';
    const blob = new Blob([raw], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download='cerpen-backup.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  window.importCerpen = function(file){
    if(!file) return;
    const fr = new FileReader();
    fr.onload = function(e){
      try{
        const arr = JSON.parse(e.target.result);
        if(!Array.isArray(arr)) throw new Error('Format tidak valid');
        // normalize and ensure id
        const norm = arr.map(x=>{ const n=normalizeItem(x); if(!n.id) n.id = uid(); return n; });
        saveCerpenCollection(norm);
        alert('Import berhasil. Refresh halaman daftar jika perlu.');
        renderAdminList();
      }catch(err){ alert('Import gagal: '+err.message); }
    };
    fr.readAsText(file);
  };

  // wire search / random / controls
  function wireControls(){
    const search = document.getElementById('searchInput');
    if(search){
      search.addEventListener('input', function(){
        const q = this.value.trim().toLowerCase();
        const data = loadCerpenCollection().filter(c => (c.title + ' ' + (c.summary||'') + ' ' + c.content).toLowerCase().includes(q));
        const container = document.getElementById('cards');
        if(container){
          container.innerHTML = '';
          data.slice(0,12).forEach(it => container.appendChild(makeCardElement(it)));
        }
      });
    }
    const rnd = document.getElementById('randomBtn');
    if(rnd){
      rnd.addEventListener('click', function(){
        const data = loadCerpenCollection();
        if(!data.length) return alert('Belum ada cerpen');
        const id = data[Math.floor(Math.random()*data.length)].id;
        location.href = 'read.html?id='+encodeURIComponent(id);
      });
    }
    const searchList = document.getElementById('searchInputList');
    if(searchList) searchList.addEventListener('input', function(){ renderDaftarFiltered(this.value); });
  }

  function renderDaftarFiltered(q){
    const container = document.getElementById('list') || document.getElementById('daftarList');
    if(!container) return;
    q = (q||'').toLowerCase();
    const data = loadCerpenCollection().filter(c => (c.title + ' ' + (c.summary||'') + ' ' + c.content).toLowerCase().includes(q));
    container.innerHTML = '';
    if(container.tagName.toLowerCase() === 'ul' || container.tagName.toLowerCase() === 'ol'){
      data.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${escapeHtml(c.title)}</strong> — <em>${escapeHtml(c.category)}</em> • <a href="read.html?id=${encodeURIComponent(c.id)}">Baca</a>`;
        container.appendChild(li);
      });
    } else {
      data.forEach(it => container.appendChild(makeCardElement(it)));
    }
  }

  // init on DOM
  document.addEventListener('DOMContentLoaded', function(){
    try {
      ensureInitWithSample();
      renderIndex();
      renderDaftar();
      renderRead();
      renderAdminList();
      wireAdminForm();
      wireControls();
      // set year if present
      const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
    } catch(e){
      console.error('PRO-SCRIPT init error:', e);
    }
  });

  // expose some helpers for debugging
  window.loadCerpenCollection = loadCerpenCollection;
  window.saveCerpenCollection = saveCerpenCollection;

})(); // end wrapper
