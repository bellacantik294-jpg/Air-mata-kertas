
/* Sample data for cerpen collection. Stored as JS variable so static hosting works easily.
   On admin page we will replace/append to localStorage 'cerpenCollection'. */
const SAMPLE_CERPEN = [
  {
    id: "c1",
    title: "Langit Senja",
    category: "Romantis",
    date: "2025-11-24",
    summary: "Sepotong senja yang membuat kita rindu.",
    cover: "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23fce7f3"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="%230b1220">Langit Senja</text></svg>'),
    content: "<p>Di tepian kota, kami duduk memandangi langit ...</p><p>Dia berkata: 'Jangan pergi dulu.'</p>"
  },
  {
    id: "c2",
    title: "Mawar Berduri",
    category: "Drama",
    date: "2025-10-01",
    summary: "Cinta yang tak pernah mudah.",
    cover: "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%230f1720"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="%23fbcfe8">Mawar Berduri</text></svg>'),
    content: "<p>Mawar itu indah namun menyakitkan.</p>"
  },
  {
    id: "c3",
    title: "Malam Penuh Rahasia",
    category: "Horor",
    date: "2025-09-12",
    summary: "Ketika lampu padam, suara mulai bercerita.",
    cover: "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="%23fee2e2">Malam Rahasia</text></svg>'),
    content: "<p>Suara itu datang dari sudut yang gelap.</p>"
  }
];

// Utility: load from localStorage or use sample
function loadCerpenCollection(){
  const raw = localStorage.getItem('cerpenCollection');
  if(raw){
    try{
      return JSON.parse(raw);
    }catch(e){
      console.error('Invalid localStorage data, resetting.');
      localStorage.removeItem('cerpenCollection');
    }
  }
  // initialize localStorage with sample
  localStorage.setItem('cerpenCollection', JSON.stringify(SAMPLE_CERPEN));
  return SAMPLE_CERPEN;
}
