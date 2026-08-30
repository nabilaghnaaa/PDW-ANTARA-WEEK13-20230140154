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

    add(product) {
        const cart = this.get();
        const existing = cart.find(
            (item) => Number(item.id) === Number(product.id)
        );

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
    },

    remove(id) {
        const cart = this.get().filter(
            (item) => Number(item.id) !== Number(id)
        );

        this.save(cart);
        this.updateCount();
        this.render();
    },

    updateQuantity(id, quantity) {
        const cart = this.get();
        const item = cart.find(
            (product) => Number(product.id) === Number(id)
        );

        if (!item) {
            return;
        }

        item.quantity = Math.max(1, Number(quantity));

        this.save(cart);
        this.updateCount();
        this.render();
    },

    updateCount() {
        const button = document.getElementById("btn-cart");

        if (!button) {
            return;
        }

        button.setAttribute(
            "text",
            `Keranjang (${this.count()})`
        );
    },

    render() {
        const container = document.getElementById("cart-items");
        const empty = document.getElementById("cart-empty");
        const total = document.getElementById("cart-total");

        if (!container || !empty || !total) {
            return;
        }

        const cart = this.get();

        container.innerHTML = "";

        if (!cart.length) {
            empty.style.display = "block";
            total.textContent = "Rp0";
            return;
        }

        empty.style.display = "none";

        cart.forEach((item) => {
            const row = document.createElement("div");

            row.className = "cart-item";
            row.innerHTML = `
                <img src="${item.image || "https://via.placeholder.com/80x80?text=No"}" alt="${item.name}" class="cart-item-image">

                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">${this.formatPrice(item.price)}</p>
                </div>

                <div class="cart-item-actions">
                    <button type="button" class="cart-quantity cart-minus">−</button>
                    <span class="cart-quantity-value">${item.quantity}</span>
                    <button type="button" class="cart-quantity cart-plus">+</button>
                    <button type="button" class="cart-remove">Hapus</button>
                </div>
            `;

            row.querySelector(".cart-minus").addEventListener("click", () => {
                this.updateQuantity(item.id, item.quantity - 1);
            });

            row.querySelector(".cart-plus").addEventListener("click", () => {
                this.updateQuantity(item.id, item.quantity + 1);
            });

            row.querySelector(".cart-remove").addEventListener("click", () => {
                this.remove(item.id);
                NotificationSystem.info(`${item.name} dihapus dari keranjang.`);
            });

            container.appendChild(row);
        });

        total.textContent = this.formatPrice(this.total());
    },

    init() {
        this.updateCount();
        this.render();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Cart.init();

    const cartButton = document.getElementById("btn-cart");

    if (cartButton) {
        cartButton.addEventListener("custom-click", () => {
            window.location.href = "/cart";
        });
    }

    const checkoutButton = document.getElementById("cart-checkout");

    if (checkoutButton) {
        checkoutButton.addEventListener("custom-click", () => {
            if (!Cart.get().length) {
                NotificationSystem.warning("Keranjang masih kosong.");
                return;
            }

            NotificationSystem.success("Produk siap diproses.");
        });
    }
});