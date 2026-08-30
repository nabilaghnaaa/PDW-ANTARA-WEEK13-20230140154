const Chat = {
    history: [],

    show(role, message) {
        const container = document.getElementById("chat-messages");
        const bubble = document.createElement("custom-chat-bubble");

        if (!container) {
            return;
        }

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
            throw new Error(data.message || "AI tidak tersedia");
        }

        return data.answer || data.message || "Maaf, aku belum bisa menjawab pertanyaan tersebut.";
    },

    init() {
        const panel = document.getElementById("chat-panel");
        const toggle = document.getElementById("chat-toggle");
        const close = document.getElementById("chat-close");
        const form = document.getElementById("chat-form");

        if (toggle) {
            toggle.addEventListener("click", () => {
                panel.classList.toggle("show");
            });
        }

        if (close) {
            close.addEventListener("click", () => {
                panel.classList.remove("show");
            });
        }

        if (!form) {
            return;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const input = document.getElementById("chat-input");
            const message = input.value.trim();

            if (!message) {
                return;
            }

            this.show("user", message);
            input.value = "";

            const typing = document.createElement("custom-chat-bubble");

            typing.setAttribute("role", "assistant");
            typing.setAttribute("message", "Sedang mengetik...");

            document.getElementById("chat-messages").appendChild(typing);

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
                typing.setAttribute("message", "Maaf, bantuan sedang tidak tersedia.");
            }

            document.getElementById("chat-messages").scrollTop = document.getElementById("chat-messages").scrollHeight;
        });
    }
};