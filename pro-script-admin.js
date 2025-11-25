document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cerpen");
    const listContainer = document.getElementById("list-cerpen");
    const coverInput = document.getElementById("cover");

    function loadCerpen() {
        return JSON.parse(localStorage.getItem("cerpenCollection") || "[]");
    }

    function saveCerpen(data) {
        localStorage.setItem("cerpenCollection", JSON.stringify(data));
    }

    function renderAdminList() {
        const data = loadCerpen();
        listContainer.innerHTML = "";

        if (data.length === 0) {
            listContainer.innerHTML = "<p>Belum ada cerpen disimpan.</p>";
            return;
        }

        data.forEach((c) => {
            const item = document.createElement("div");
            item.className = "admin-item";
            item.innerHTML = `
                <h3>📌 ${c.judul}</h3>
                <p><b>Kategori:</b> ${c.kategori}</p>
                <p><b>Tanggal:</b> ${c.tanggal}</p>
                <img src="${c.cover}" style="width:120px;border-radius:6px;">
                <hr>
            `;
            listContainer.appendChild(item);
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const judul = document.getElementById("judul").value.trim();
        const kategori = document.getElementById("kategori").value.trim();
        const ringkasan = document.getElementById("ringkasan").value.trim();
        const isi = document.getElementById("isi").value.trim();

        let coverBase64 = "";
        if (coverInput.files.length > 0) {
            const file = coverInput.files[0];
            coverBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        if (!judul || !kategori || !isi) {
            alert("Harap isi semua bagian!");
            return;
        }

        const data = loadCerpen();

        data.push({
            id: Date.now(),
            judul,
            kategori,
            ringkasan,
            isi,
            cover: coverBase64,
            tanggal: new Date().toLocaleString()
        });

        saveCerpen(data);
        alert("Cerpen berhasil disimpan!");

        form.reset();
        renderAdminList();
    });

    renderAdminList();
});
