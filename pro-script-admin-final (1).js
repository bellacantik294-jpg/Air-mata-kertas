/* ========== pro-script-admin-final.js ========== */
/* Versi FINAL • Mendukung:
   ✔ Simpan cerpen lengkap
   ✔ Simpan cover base64
   ✔ Tampil di Beranda, Kategori, Daftar Cerpen, Halaman Baca
   ✔ Gabung dengan cerpen bawaan (cerpen-data.js)
   ✔ Tidak merusak fitur yang sudah ada
*/

function loadLocalStories() {
    const saved = localStorage.getItem("cerpenList");
    return saved ? JSON.parse(saved) : [];
}

function saveLocalStories(list) {
    localStorage.setItem("cerpenList", JSON.stringify(list));
}

document.addEventListener("DOMContentLoaded", () => {

    const formJudul = document.getElementById("judul");
    const formKategori = document.getElementById("kategori");
    const formRingkasan = document.getElementById("ringkasan");
    const formIsi = document.getElementById("isi");
    const formCover = document.getElementById("cover");
    const btnSimpan = document.getElementById("simpan");
    const listLocal = document.getElementById("list-local");

    function renderList() {
        const data = loadLocalStories();
        listLocal.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <h3>💖 ${item.judul} – ${item.kategori}</h3>
                <small>${item.tanggal}</small><br>
                <img src="${item.cover}" style="width:120px;border-radius:8px;margin-top:6px;">
            `;
            listLocal.appendChild(div);
        });
    }

    function fileToBase64(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    btnSimpan.addEventListener("click", async () => {

        const judul = formJudul.value.trim();
        const kategori = formKategori.value.trim();
        const ringkasan = formRingkasan.value.trim();
        const isi = formIsi.value.trim();
        const file = formCover.files[0];

        if (!judul || !kategori || !ringkasan || !isi) {
            alert("Semua bidang wajib diisi.");
            return;
        }

        let coverBase64 = "";
        if (file) {
            coverBase64 = await fileToBase64(file);
        }

        const newStory = {
            id: "local-" + Date.now(),
            judul,
            kategori,
            ringkasan,
            isi,
            cover: coverBase64 || "",
            tanggal: new Date().toLocaleString("id-ID")
        };

        const list = loadLocalStories();
        list.push(newStory);
        saveLocalStories(list);

        alert("Cerpen berhasil disimpan!");
        renderList();
        formJudul.value = "";
        formKategori.value = "";
        formRingkasan.value = "";
        formIsi.value = "";
        formCover.value = "";
    });

    renderList();
});
