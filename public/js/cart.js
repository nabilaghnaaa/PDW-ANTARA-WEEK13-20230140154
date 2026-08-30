const Cart = {
    key: "tokore_cart",

    get() {
        try {
            const cart = JSON.parse(localStorage.getItem(this.key) || "[]");

            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            return [];
        }
    },

    save(cart) {
        localStorage.setItem(this.key, JSON.stringify(cart));
    },

    count() {
        return this.get().reduce((total, item) => {
            return total + Number(item.quantity || 0);
        }, 0);
    },

    total() {
        return this.get().reduce((total, item) => {
            return total + Number(item.price || 0) * Number(item.quantity || 0);
        }, 0);
    },

    formatPrice(price) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(Number(price));
    },

    updateCount() {
        const button = document.getElementById("btn-cart");

        if (!button || Auth.isAdmin()) {
            return;
        }

        button.setAttribute("text", `Keranjang (${this.count()})`);
    },

    add(product) {
        const cart = this.get();
        const existing = cart.find((item) => Number(item.id) === Number(product.id));

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.image || "",
                quantity: 1
            });
        }

        this.save(cart);
        this.updateCount();
        this.render();
    },

    remove(productId) {
        const cart = this.get().filter((item) => Number(item.id) !== Number(productId));

        this.save(cart);
        this.updateCount();
        this.render();
    },

    render() {
        const body = document.getElementById("cart-body");
        const totalElement = document.getElementById("cart-total");

        if (!body || !totalElement) {
            return;
        }

        const cart = this.get();

        if (!cart.length) {
            body.innerHTML = `
                <div class="cart-empty">
                    Keranjang masih kosong.
                </div>
            `;

            totalElement.textContent = "Rp0";
            return;
        }

        body.innerHTML = "";

        cart.forEach((item) => {
            const element = document.createElement("div");

            element.className = "cart-item";
            element.innerHTML = `
                <img src="${item.image || "https://via.placeholder.com/70x70?text=No"}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">${this.formatPrice(item.price)} × ${item.quantity}</p>
                </div>
                <button type="button" class="cart-remove">Hapus</button>
            `;

            element.querySelector(".cart-remove").addEventListener("click", () => {
                this.remove(item.id);
            });

            body.appendChild(element);
        });

        totalElement.textContent = this.formatPrice(this.total());
    },

    open() {
        const modal = document.getElementById("cart-modal");

        if (!modal || Auth.isAdmin()) {
            return;
        }

        this.render();
        modal.classList.add("show");
    },

    close() {
        const modal = document.getElementById("cart-modal");

        if (modal) {
            modal.classList.remove("show");
        }
    },

    init() {
        const button = document.getElementById("btn-cart");
        const closeButton = document.getElementById("cart-close");
        const modal = document.getElementById("cart-modal");
        const checkoutButton = document.getElementById("cart-checkout");

        if (button) {
            button.addEventListener("custom-click", () => {
                this.open();
            });
        }

        if (closeButton) {
            closeButton.addEventListener("click", () => {
                this.close();
            });
        }

        if (modal) {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    this.close();
                }
            });
        }

        if (checkoutButton) {
            checkoutButton.addEventListener("custom-click", () => {
                if (!this.get().length) {
                    alert("Keranjang masih kosong.");
                    return;
                }

                alert("Produk sudah siap diproses.");
            });
        }

        this.updateCount();
    }
};