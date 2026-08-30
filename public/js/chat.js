const Chat = {
    history: [],

    show(role, message) {
        const container = document.getElementById("chat-messages");

        if (!container) {
            return;
        }

        const bubble = document.createElement("custom-chat-bubble");

        bubble.setAttribute("role", role);
        bubble.setAttribute("message", message);

        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    },

    async send(message) {
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                history: [...this.history]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Layanan AI tidak tersedia"
            );
        }

        return data.answer ||
            data.message ||
            "Maaf, aku belum bisa menjawab pertanyaan tersebut.";
    },

    init() {
        const panel = document.getElementById("chat-panel");
        const toggle = document.getElementById("chat-toggle");
        const close = document.getElementById("chat-close");
        const form = document.getElementById("chat-form");

        if (!panel || !toggle || !close || !form) {
            return;
        }

        toggle.addEventListener("click", () => {
            panel.classList.toggle("show");
        });

        close.addEventListener("click", () => {
            panel.classList.remove("show");
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const input = document.getElementById("chat-input");
            const messages = document.getElementById("chat-messages");
            const message = input.value.trim();

            if (!message) {
                return;
            }

            this.show("user", message);
            input.value = "";

            const typing = document.createElement("custom-chat-bubble");

            typing.setAttribute("role", "assistant");
            typing.setAttribute("message", "Sedang mengetik...");

            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            try {
                const answer = await this.send(message);

                typing.remove();
                this.show("assistant", answer);

                this.history.push(
                    {
                        role: "user",
                        content: message
                    },
                    {
                        role: "assistant",
                        content: answer
                    }
                );

                while (this.history.length > 4) {
                    this.history.shift();
                }
            } catch (error) {
                typing.setAttribute(
                    "message",
                    "Maaf, bantuan sedang tidak tersedia."
                );
            }

            messages.scrollTop = messages.scrollHeight;
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Chat.init();
});