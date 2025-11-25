// PRO SCRIPT FIX V2 — TANPA FORM — 100% COCOK UNTUK HALAMAN ADMIN KAMU

function loadCerpen() {
    return JSON.parse(localStorage.getItem("cerpenCollection") || "[]");
}

function saveCerpen(data) {
    localStorage.setItem("cerpenCollection", JSON.stringify(data));
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("button");  // tombol Simpan ke Penyimpanan Lokal

    if (!btn) return;

    btn.addEventListener("click", () => {

        const title = document.querySelectorAll("input")[0].value.trim();
        const kategori = document.querySelectorAll("input")[1].value.trim();
        const ringkasan = document.querySelectorAll("input")[2].value.trim();
        const isi = document.querySelector("textarea").value.trim();

        if (!title || !kategori || !isi) {
            alert("Mohon isi semua field.");
            return;
        }

        const data = loadCerpen();
        data.push({
            judul: title,
            kategori: kategori,
            ringkasan: ringkasan,
            isi: isi
        });

        saveCerpen(data);
        alert("Cerpen berhasil disimpan!");

        location.reload();
    });
});
