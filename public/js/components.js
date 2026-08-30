class CustomButton extends HTMLElement {
    static get observedAttributes() {
        return ["text", "variant", "size", "type", "disabled"];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.render();
        }
    }

    render() {
        const text = this.getAttribute("text") || "Button";
        const variant = this.getAttribute("variant") || "primary";
        const size = this.getAttribute("size") || "";
        const type = this.getAttribute("type") || "button";
        const disabled = this.hasAttribute("disabled");

        this.innerHTML = `
            <button
                type="${type}"
                class="custom-btn custom-btn-${variant} ${size ? `custom-btn-${size}` : ""}"
                ${disabled ? "disabled" : ""}
            >
                ${text}
            </button>
        `;

        const button = this.querySelector("button");

        button.addEventListener("click", (event) => {
            this.dispatchEvent(new CustomEvent("custom-click", {
                detail: event,
                bubbles: true
            }));
        });
    }
}

customElements.define("custom-button", CustomButton);

class CustomInput extends HTMLElement {
    connectedCallback() {
        const type = this.getAttribute("type") || "text";
        const label = this.getAttribute("label") || "";
        const name = this.getAttribute("name") || "";
        const id = this.getAttribute("id") || name;
        const placeholder = this.getAttribute("placeholder") || "";
        const value = this.getAttribute("value") || "";
        const required = this.hasAttribute("required");

        this.innerHTML = `
            <div class="custom-field">
                ${label ? `<label for="${id}" class="custom-label">${label}</label>` : ""}
                <input
                    type="${type}"
                    id="${id}"
                    name="${name}"
                    class="custom-input"
                    placeholder="${placeholder}"
                    value="${value}"
                    ${required ? "required" : ""}
                >
            </div>
        `;
    }
}

customElements.define("custom-input", CustomInput);

class ProductCard extends HTMLElement {
    connectedCallback() {
        const image = this.getAttribute("image") || "";
        const title = this.getAttribute("title") || "";
        const price = this.getAttribute("price") || "";
        const description = this.getAttribute("description") || "";
        const category = this.getAttribute("category") || "";
        const hasButton = this.hasAttribute("button");
        const buttonText = this.getAttribute("button-text") || "Tambah";

        this.innerHTML = `
            <article class="product-card">
                <div class="product-card-image-wrap">
                    <img
                        src="${image}"
                        alt="${title}"
                        class="product-card-image"
                    >
                    ${category ? `<span class="product-card-category">${category}</span>` : ""}
                </div>

                <div class="product-card-body">
                    <h3 class="product-card-title">${title}</h3>
                    <p class="product-card-description">${description}</p>

                    <div class="product-card-bottom">
                        <span class="product-card-price">${price}</span>

                        ${hasButton ? `
                            <button
                                type="button"
                                class="product-card-button"
                            >
                                ${buttonText}
                            </button>
                        ` : ""}
                    </div>
                </div>
            </article>
        `;

        const button = this.querySelector(".product-card-button");

        if (button) {
            button.addEventListener("click", (event) => {
                this.dispatchEvent(new CustomEvent("product-action", {
                    detail: event,
                    bubbles: true
                }));
            });
        }
    }
}

customElements.define("product-card", ProductCard);

class CustomChatBubble extends HTMLElement {
    connectedCallback() {
        const role = this.getAttribute("role") || "assistant";
        const message = this.getAttribute("message") || "";

        this.innerHTML = `
            <div class="chat-bubble-wrap chat-bubble-wrap-${role}">
                ${role === "assistant" ? `<span class="chat-avatar">T</span>` : ""}
                <div class="chat-bubble chat-bubble-${role}"></div>
            </div>
        `;

        this.querySelector(".chat-bubble").textContent = message;
    }
}

customElements.define("custom-chat-bubble", CustomChatBubble);

class AppNotification extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="notification-box"></div>
        `;
    }

    show(message, type = "info", duration = 2800) {
        const box = this.querySelector(".notification-box");

        box.className = `notification-box notification-${type}`;
        box.textContent = message;

        requestAnimationFrame(() => {
            box.classList.add("notification-show");
        });

        clearTimeout(this.hideTimer);

        this.hideTimer = setTimeout(() => {
            box.classList.remove("notification-show");
        }, duration);
    }
}

customElements.define("app-notification", AppNotification);