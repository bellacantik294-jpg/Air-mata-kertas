// ===========================================
// PRO SCRIPT FINAL FIX — COCOK DENGAN ADMIN.HTML
// ===========================================

// Load cerpen dari LocalStorage
function loadCerpen() {
    return JSON.parse(localStorage.getItem("cerpenCollection") || "[]");
}

// Simpan cerpen ke LocalStorage
function saveCerpen(data) {
    localStorage.setItem("cerpenCollection", JSON.stringify(data));
}

// Tampilkan daftar cerpen
function renderAdminList() {
    const list = document.getElementById("adminList");
    const data = loadCerpen();

    if (!list) return;

    if (data.length === 0) {
        list.innerHTML = "<p>Belum ada cerpen.</p>";
        return;
    }

    list.innerHTML = data
        .map(
            (c, i) => `
        <div class="admin-item">
            <strong>${c.judul}</strong> — <em>${c.kategori}</em><br/>
            <button onclick="deleteCerpen(${i})">Hapus</button>
        </div>
    `
        )
        .join("");
}

// Hapus cerpen
function deleteCerpen(index) {
    const data = loadCerpen();
    data.splice(index, 1);
    saveCerpen(data);
    renderAdminList();
    alert("Cerpen dihapus!");
}

// Ketika halaman selesai
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adminForm");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("adminTitle").value.trim();
        const cat = document.getElementById("adminCategory").value.trim();
        const sum = document.getElementById("adminSummary").value.trim();
        const content = document.getElementById("adminContent").value.trim();

        if (!title || !cat || !content) {
            alert("Judul, kategori, dan isi cerpen wajib diisi!");
            return;
        }

        const data = loadCerpen();
        data.push({
            judul: title,
            kategori: cat,
            ringkasan: sum,
            isi: content,
            tanggal: new Date().toLocaleString(),
        });

        saveCerpen(data);
        alert("Cerpen berhasil disimpan!");

        form.reset();
        renderAdminList();
    });

    renderAdminList();
});
