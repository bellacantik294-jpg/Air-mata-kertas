
/* PRO SCRIPT FULL FIX - merges LocalStorage + built-in data, renders index, daftar, read, admin, comments */
(function(){
  function uid(){ return 'id_' + Math.random().toString(36).slice(2,9); }
  function safeParse(raw){ try{ return JSON.parse(raw); } catch(e){ return null; } }

  function loadCollection(){
    const ls = safeParse(localStorage.getItem('cerpenCollection')) || [];
    const built = (window.SAMPLE_CERPEN && Array.isArray(window.SAMPLE_CERPEN))? window.SAMPLE_CERPEN : [];
    built.forEach(b=>{ if(!b.id) b.id = uid(); });
    // build map from ls first
    const map = {};
    ls.forEach(i=>{ if(!i.id) i.id = uid(); map[i.id]=i; });
    built.forEach(b=>{ if(!map[b.id] && !Object.values(map).some(x=>x.judul===b.judul)){ map[b.id]=b; } });
    const merged = Object.values(map);
    if(ls.length===0 && built.length>0){ localStorage.setItem('cerpenCollection', JSON.stringify(merged)); }
    return merged;
  }

  function saveCollection(arr){ localStorage.setItem('cerpenCollection', JSON.stringify(arr)); }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  function makeCardHTML(c){
    return '<article class="card" data-id="'+escapeHtml(c.id)+'">'+
      '<div class="cover"><img src="'+(c.cover||'')+'" alt="Cover '+escapeHtml(c.judul||'')+'" class="cover-img" loading="lazy"></div>'+
      '<h2>'+escapeHtml(c.judul||'')+'</h2>'+
      '<p class="meta">'+escapeHtml(c.kategori||'')+' • '+escapeHtml(c.tanggal||'')+'</p>'+
      '<p class="muted">'+escapeHtml((c.ringkasan||'')).slice(0,200)+'</p>'+
      '<a class="read-more" href="read.html?id='+encodeURIComponent(c.id)+'">Baca</a></article>';
  }

  function renderIndex(){
    const container = document.getElementById('cards');
    if(!container) return;
    const data = loadCollection().slice().reverse();
    if(data.length===0){ container.innerHTML = '<p class="muted">Belum ada cerpen.</p>'; return; }
    container.innerHTML = data.slice(0,12).map(makeCardHTML).join('\n');
  }

  function renderDaftar(){
    const list = document.getElementById('list') || document.getElementById('daftarList');
    if(!list) return;
    const data = loadCollection().slice().sort((a,b)=> new Date(b.tanggal||0)-new Date(a.tanggal||0));
    if(data.length===0){ list.innerHTML = '<p class="muted">Belum ada cerpen.</p>'; return; }
    if(list.classList && list.classList.contains('cards-grid')) list.innerHTML = data.map(makeCardHTML).join('\n');
    else list.innerHTML = data.map(c => '<li><strong>'+escapeHtml(c.judul)+'</strong> — <em>'+escapeHtml(c.kategori)+'</em> • <a href="read.html?id='+encodeURIComponent(c.id)+'">Baca</a></li>').join('');
  }

  function renderRead(){
    const art = document.getElementById('cerpen');
    if(!art) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const data = loadCollection();
    const item = data.find(x => x.id === id) || data.find(x => x.judul === params.get('judul'));
    if(!item){ art.innerHTML = '<p class="muted">Cerpen tidak ditemukan.</p>'; return; }
    document.getElementById('cerpen-title').textContent = item.judul || '';
    if(document.getElementById('cerpen-category')) document.getElementById('cerpen-category').textContent = item.kategori || '';
    if(document.getElementById('cerpen-date')) document.getElementById('cerpen-date').textContent = item.tanggal || '';
    if(document.getElementById('cerpen-content')) document.getElementById('cerpen-content').innerHTML = item.isi || '';

    const key = 'comments_' + item.id;
    const commentList = document.getElementById('comment-list');
    const form = document.getElementById('commentForm');
    function loadComments(){ const arr = safeParse(localStorage.getItem(key)) || []; if(commentList) commentList.innerHTML = arr.map(c=>'<div class="comment"><strong>'+escapeHtml(c.name||'Anon')+'</strong><p>'+escapeHtml(c.text)+'</p></div>').join(''); }
    if(form){
      form.addEventListener('submit', function(e){ e.preventDefault(); const name = document.getElementById('commentName').value.trim(); const text = document.getElementById('commentText').value.trim(); if(!text) return alert('Komentar kosong'); const arr = safeParse(localStorage.getItem(key)) || []; arr.unshift({name,text,date:new Date().toISOString()}); localStorage.setItem(key, JSON.stringify(arr)); document.getElementById('commentText').value=''; document.getElementById('commentName').value=''; loadComments(); });
      loadComments();
    }
  }

  // Admin rendering reuse existing stored data
  function renderAdminList(){
    const adminList = document.getElementById('adminList');
    if(!adminList) return;
    const data = loadCollection();
    if(data.length===0){ adminList.innerHTML = '<p>Belum ada cerpen.</p>'; return; }
    adminList.innerHTML = data.map((c,i)=>'<div class="admin-item"><strong>'+escapeHtml(c.judul)+'</strong> — <em>'+escapeHtml(c.kategori)+'</em><br/><button onclick="deleteCerpenByIndex('+i+')">Hapus</button></div>').join('');
    window.deleteCerpenByIndex = function(i){ const d = loadCollection(); d.splice(i,1); saveCollection(d); renderAdminList(); alert('Cerpen dihapus'); };
  }

  // helpers
  function saveCollection(arr){ localStorage.setItem('cerpenCollection', JSON.stringify(arr)); }
  function ensureInit(){ const existing = safeParse(localStorage.getItem('cerpenCollection')) || []; if(existing.length===0 && window.SAMPLE_CERPEN && Array.isArray(window.SAMPLE_CERPEN)){ const copy = JSON.parse(JSON.stringify(window.SAMPLE_CERPEN)); copy.forEach(c=>{ if(!c.id) c.id = uid(); }); saveCollection(copy); } }
  function uid(){ return 'id_' + Math.random().toString(36).slice(2,9); }

  function wireControls(){
    const search = document.getElementById('searchInput');
    if(search){ search.addEventListener('input', function(){ const q=this.value.trim().toLowerCase(); const data = loadCollection().filter(c => (c.judul + ' ' + (c.ringkasan||'') + ' ' + (c.isi||'')).toLowerCase().includes(q)); const container = document.getElementById('cards'); if(container) container.innerHTML = data.map(makeCardHTML).join('\n') || '<p class="muted">Tidak ditemukan.</p>'; }); }
    const rand = document.getElementById('randomBtn');
    if(rand){ rand.addEventListener('click', function(){ const data = loadCollection(); if(!data.length) return alert('Belum ada cerpen'); const id = data[Math.floor(Math.random()*data.length)].id; location.href = 'read.html?id=' + encodeURIComponent(id); }); }
    const searchList = document.getElementById('searchInputList');
    if(searchList){ searchList.addEventListener('input', function(){ renderDaftarFiltered(this.value); }); }
  }
  function renderDaftarFiltered(q){ const container = document.getElementById('list') || document.getElementById('daftarList'); if(!container) return; q=(q||'').toLowerCase(); const data = loadCollection().filter(c => (c.judul + ' ' + (c.ringkasan||'') + ' ' + (c.isi||'')).toLowerCase().includes(q)); if(container.classList && container.classList.contains('cards-grid')) container.innerHTML = data.map(makeCardHTML).join('\n') || '<p class="muted">Tidak ditemukan.</p>'; else container.innerHTML = data.map(c => '<li><strong>'+escapeHtml(c.judul)+'</strong> — <em>'+escapeHtml(c.kategori)+'</em> • <a href="read.html?id='+encodeURIComponent(c.id)+'">Baca</a></li>').join(''); }

  document.addEventListener('DOMContentLoaded', function(){ ensureInit(); renderIndex(); renderDaftar(); renderRead(); renderAdminList(); wireControls(); const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear(); });

  // expose
  window.loadCollection = loadCollection;
  window.saveCollection = saveCollection;

})();
