function loadCerpenCollection() {
    const raw = localStorage.getItem("cerpenCollection");
    return raw ? JSON.parse(raw) : [];
}

function saveCerpenCollection(data) {
    localStorage.setItem("cerpenCollection", JSON.stringify(data));
}

// Tambah cerpen
function addCerpen(judul, kategori, ringkasan, isi) {
    const koleksi = loadCerpenCollection();
    koleksi.push({
        id: Date.now(),
        judul,
        kategori,
        ringkasan,
        isi,
        tanggal: new Date().toISOString()
    });
    saveCerpenCollection(koleksi);
}

// Hapus cerpen
function deleteCerpen(id) {
    let data = loadCerpenCollection();
    data = data.filter(c => c.id !== id);
    saveCerpenCollection(data);
}

// Export JSON
function exportCerpen() {
    const data = loadCerpenCollection();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cerpen-export.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Import JSON
function importCerpen(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        saveCerpenCollection(data);
        alert("Import berhasil!");
        location.reload();
    };
    reader.readAsText(file);
}

// Render daftar cerpen
function renderCerpenList() {
    const list = document.getElementById("cerpenList");
    const data = loadCerpenCollection();
    list.innerHTML = "";

    if (data.length === 0) {
        list.innerHTML = "<p>Tidak ada cerpen di localStorage.</p>";
        return;
    }

    data.forEach(c => {
        const div = document.createElement("div");
        div.className = "cerpen-item";
        div.innerHTML = `
            <strong>${c.judul}</strong><br>
            <em>${c.kategori}</em><br>
            <button onclick="deleteCerpen(${c.id}); location.reload()">Hapus</button>
        `;
        list.appendChild(div);
    });
}

// Saat halaman Admin dibuka
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("tambahForm");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const judul = document.getElementById("judul").value.trim();
            const kategori = document.getElementById("kategori").value.trim();
            const ringkasan = document.getElementById("ringkasan").value.trim();
            const isi = document.getElementById("isi").value.trim();

            if (!judul || !kategori || !isi) {
                alert("Judul, Kategori, dan Isi wajib diisi.");
                return;
            }

            addCerpen(judul, kategori, ringkasan, isi);
            alert("Cerpen berhasil disimpan!");
            form.reset();
            renderCerpenList();
        });
    }

    renderCerpenList();
});
