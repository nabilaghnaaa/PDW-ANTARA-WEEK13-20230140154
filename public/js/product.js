const Product = {
    formatPrice(price) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(Number(price));
    },

    async getAll() {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Gagal mengambil produk");
        }

        return response.json();
    },

    createCard(product) {
        const card = document.createElement("custom-card");

        card.setAttribute("image", product.image || "https://via.placeholder.com/500x400?text=No+Image");
        card.setAttribute("category", product.category || "");
        card.setAttribute("title", product.name || "");
        card.setAttribute("description", product.description || "");
        card.setAttribute("price", this.formatPrice(product.price || 0));

        if (!Auth.isAdmin()) {
            card.setAttribute("button-text", "Tambah");

            card.addEventListener("card-action", () => {
                Cart.add(product);
                alert(`${product.name} berhasil ditambahkan ke keranjang.`);
            });
        }

        return card;
    },

    async render() {
        const container = document.getElementById("product-list");
        const loading = document.getElementById("loading-state");
        const empty = document.getElementById("empty-state");

        if (!container) {
            return;
        }

        try {
            const products = await this.getAll();

            container.innerHTML = "";
            loading.style.display = "none";
            empty.style.display = products.length ? "none" : "block";

            products.forEach((product) => {
                container.appendChild(this.createCard(product));
            });
        } catch (error) {
            loading.style.display = "none";
            empty.style.display = "block";
            empty.textContent = "Gagal mengambil data produk.";
        }
    }
};