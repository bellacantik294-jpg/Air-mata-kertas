/* ============================================================
   PRO-SCRIPT-ADMIN.JS — FINAL VERSION
   Menyimpan cerpen lengkap + cover + kategori + ringkasan
   ============================================================ */

// Ambil list cerpen dari localStorage
function loadCerpen() {
    return JSON.parse(localStorage.getItem("cerpenCollection") || "[]");
}

// Simpan list cerpen ke localStorage
function saveCerpen(list) {
    localStorage.setItem("cerpenCollection", JSON.stringify(list));
}

// Tampilkan daftar cerpen di halaman admin
function renderAdminList() {
    const box = document.getElementById("localList");
    const data = loadCerpen();

    if (!box) return;
    box.innerHTML = "";

    data.forEach(c => {
        const div = document.createElement("div");
        div.className = "cerpen-item-admin";
        div.innerHTML = `
            <h3>💖 ${c.judul} — ${c.kategori}</h3>
            <p>${c.tanggal}</p>
            <img src="${c.cover}" class="cover-admin">
        `;
        box.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formCerpen");

    const judul = document.getElementById("judul");
    const kategori = document.getElementById("kategori");
    const ringkasan = document.getElementById("ringkasan");
    const isi = document.getElementById("isiCerpen");
    const fileInput = document.getElementById("cover");

    let coverBase64 = ""; // hasil baca cover

    // 📌 BACA COVER OTOMATIS
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];

        if (!file) {
            coverBase64 = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            coverBase64 = e.target.result;
            document.getElementById("previewCover").src = coverBase64;
        };
        reader.readAsDataURL(file);
    });

    // 📌 KETIKA FORM DI-SUBMIT
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!judul.value || !kategori.value || !ringkasan.value || !isi.value) {
            alert("Isi semua form terlebih dahulu!");
            return;
        }

        if (!coverBase64) {
            alert("Upload cover dulu ya!");
            return;
        }

        // Generate ID unik
        const id = "ID_" + Date.now();

        // Ambil data lama
        const list = loadCerpen();

        // Simpan data baru
        list.push({
            id: id,
            judul: judul.value.trim(),
            kategori: kategori.value.trim(),
            ringkasan: ringkasan.value.trim(),
            isi: isi.value.trim().replace(/\n/g, "<br>"),
            cover: coverBase64,
            tanggal: new Date().toLocaleString()
        });

        saveCerpen(list);

        alert("Cerpen berhasil disimpan!");

        form.reset();
        coverBase64 = "";
        document.getElementById("previewCover").src = "";

        renderAdminList();
    });

    renderAdminList();
});
