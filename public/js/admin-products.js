const AdminProduct = {
    editingId: null,

    formatPrice(price) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(Number(price));
    },

    message(text, type = "success") {
        const box = document.getElementById("page-message");

        box.className = `alert alert-${type}`;
        box.textContent = text;
        box.style.display = "block";

        setTimeout(() => {
            box.style.display = "none";
        }, 2500);
    },

    async request(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`,
                ...(options.headers || {})
            }
        });

        const data = await response.json();

        if (response.status === 401) {
            Auth.clearSession();
            window.location.href = "/login-page";
            return null;
        }

        if (!response.ok) {
            throw new Error(data.message || "Terjadi kesalahan");
        }

        return data;
    },

    openAdd() {
        this.editingId = null;

        document.getElementById("product-form").reset();
        document.getElementById("modal-title").textContent = "Tambah Produk";
        document.getElementById("description").value = "";

        bootstrap.Modal.getOrCreateInstance(document.getElementById("product-modal")).show();
    },

    openEdit(product) {
        this.editingId = product.id;

        const form = document.getElementById("product-form");

        form.elements.name.value = product.name;
        form.elements.description.value = product.description;
        form.elements.price.value = product.price;
        form.elements.category.value = product.category;
        form.elements.image.value = product.image || "";

        document.getElementById("modal-title").textContent = "Edit Produk";

        bootstrap.Modal.getOrCreateInstance(document.getElementById("product-modal")).show();
    },

    async load() {
        const table = document.getElementById("product-table");
        const empty = document.getElementById("empty-table");

        try {
            const response = await fetch("/api/products");
            const products = await response.json();

            table.innerHTML = "";
            empty.style.display = products.length ? "none" : "block";

            products.forEach((product) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>
                        <div class="admin-product">
                            <img src="${product.image || "https://via.placeholder.com/70x70?text=No"}" alt="${product.name}" class="product-thumb">
                            <strong>${product.name}</strong>
                        </div>
                    </td>
                    <td>${product.category}</td>
                    <td>${this.formatPrice(product.price)}</td>
                    <td class="description-cell">${product.description}</td>
                    <td></td>
                `;

                const actions = document.createElement("div");
                actions.className = "action-group";

                const edit = document.createElement("custom-button");
                edit.setAttribute("text", "Edit");
                edit.setAttribute("variant", "light");
                edit.setAttribute("size", "sm");
                edit.addEventListener("custom-click", () => {
                    this.openEdit(product);
                });

                const remove = document.createElement("custom-button");
                remove.setAttribute("text", "Hapus");
                remove.setAttribute("variant", "danger");
                remove.setAttribute("size", "sm");
                remove.addEventListener("custom-click", async () => {
                    if (!confirm(`Hapus produk ${product.name}?`)) {
                        return;
                    }

                    try {
                        await this.request(`/api/products/${product.id}`, {
                            method: "DELETE"
                        });

                        this.message("Produk berhasil dihapus.");
                        this.load();
                    } catch (error) {
                        this.message(error.message, "danger");
                    }
                });

                actions.append(edit, remove);
                row.lastElementChild.appendChild(actions);
                table.appendChild(row);
            });
        } catch (error) {
            this.message("Gagal mengambil data produk.", "danger");
        }
    },

    async save(event) {
        event.preventDefault();

        const form = event.target;
        const data = Object.fromEntries(new FormData(form));

        data.price = Number(data.price);

        const url = this.editingId
            ? `/api/products/${this.editingId}`
            : "/api/products";

        const method = this.editingId ? "PUT" : "POST";

        try {
            await this.request(url, {
                method,
                body: JSON.stringify(data)
            });

            bootstrap.Modal.getInstance(document.getElementById("product-modal")).hide();

            this.message(
                this.editingId
                    ? "Produk berhasil diubah."
                    : "Produk berhasil ditambahkan."
            );

            this.load();
        } catch (error) {
            this.message(error.message, "danger");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    AdminProduct.load();

    document.getElementById("btn-add").addEventListener("custom-click", () => {
        AdminProduct.openAdd();
    });

    document.getElementById("product-form").addEventListener("submit", (event) => {
        AdminProduct.save(event);
    });
});