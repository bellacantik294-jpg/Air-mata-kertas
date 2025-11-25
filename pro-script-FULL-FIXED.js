
// Pro Script FULL FIXED
function loadCerpen() {
  const data = JSON.parse(localStorage.getItem('cerpenCollection') || '[]');
  return data;
}
function saveCerpen(data) {
  localStorage.setItem('cerpenCollection', JSON.stringify(data));
}
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.querySelector('form');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = document.getElementById('judul').value.trim();
      const cat = document.getElementById('kategori').value.trim();
      const ringk = document.getElementById('ringkasan').value.trim();
      const isi = document.getElementById('isi').value.trim();
      const data = loadCerpen();
      data.push({judul:title, kategori:cat, ringkasan:ringk, isi:isi});
      saveCerpen(data);
      alert("Cerpen tersimpan!");
      location.reload();
    });
  }
});
