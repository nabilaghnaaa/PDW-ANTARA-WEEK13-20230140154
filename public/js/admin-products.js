const AdminProduct = {
    editingId: null,
    modal: null,

    formatPrice(price) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(Number(price));
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

    showModal(title) {
        document.getElementById("modal-title").textContent = title;

        this.modal.show();
    },

    openAdd() {
        this.editingId = null;

        const form = document.getElementById("product-form");

        form.reset();
        this.showModal("Tambah Produk");
    },

    openEdit(product) {
        this.editingId = product.id;

        const form = document.getElementById("product-form");

        form.elements.name.value = product.name;
        form.elements.description.value = product.description;
        form.elements.price.value = product.price;
        form.elements.category.value = product.category;
        form.elements.image.value = product.image || "";

        this.showModal("Edit Produk");
    },

    async load() {
        const table = document.getElementById("product-table");
        const empty = document.getElementById("empty-table");

        try {
            const response = await fetch("/api/products");

            if (!response.ok) {
                throw new Error("Gagal mengambil produk");
            }

            const products = await response.json();

            table.innerHTML = "";
            empty.style.display = products.length ? "none" : "block";

            products.forEach((product) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>
                        <div class="admin-product">
                            <img
                                src="${product.image || "https://via.placeholder.com/60x60?text=No"}"
                                alt="${product.name}"
                                class="product-thumb"
                            >
                            <strong>${product.name}</strong>
                        </div>
                    </td>

                    <td>${product.category}</td>
                    <td>${this.formatPrice(product.price)}</td>
                    <td class="description-cell">${product.description}</td>
                    <td>
                        <div class="action-group"></div>
                    </td>
                `;

                const actions = row.querySelector(".action-group");

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
                        await this.request(
                            `/api/products/${product.id}`,
                            {
                                method: "DELETE"
                            }
                        );

                        NotificationSystem.success(
                            "Produk berhasil dihapus."
                        );

                        this.load();
                    } catch (error) {
                        NotificationSystem.error(error.message);
                    }
                });

                actions.append(edit, remove);
                table.appendChild(row);
            });
        } catch (error) {
            NotificationSystem.error(
                "Gagal mengambil data produk."
            );
        }
    },

    async save(event) {
        event.preventDefault();

        const form = event.target;
        const data = Object.fromEntries(
            new FormData(form)
        );

        data.price = Number(data.price);

        const url = this.editingId
            ? `/api/products/${this.editingId}`
            : "/api/products";

        const method = this.editingId
            ? "PUT"
            : "POST";

        try {
            await this.request(url, {
                method,
                body: JSON.stringify(data)
            });

            this.modal.hide();

            NotificationSystem.success(
                this.editingId
                    ? "Produk berhasil diubah."
                    : "Produk berhasil ditambahkan."
            );

            this.load();
        } catch (error) {
            NotificationSystem.error(error.message);
        }
    },

    init() {
        this.modal = new bootstrap.Modal(
            document.getElementById("product-modal")
        );

        document
            .getElementById("btn-add")
            .addEventListener("custom-click", () => {
                this.openAdd();
            });

        document
            .getElementById("product-form")
            .addEventListener("submit", (event) => {
                this.save(event);
            });

        this.load();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (!Auth.isAdmin()) {
        return;
    }

    AdminProduct.init();
});