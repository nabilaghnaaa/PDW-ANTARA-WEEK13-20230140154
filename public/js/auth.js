const Auth = {
    getToken() {
        return localStorage.getItem("token") || "";
    },

    getRole() {
        return (localStorage.getItem("role") || "").toLowerCase();
    },

    isAdmin() {
        return Boolean(this.getToken()) && this.getRole() === "admin";
    },

    setSession(result) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", result.user.username);
        localStorage.setItem("role", result.user.role || "admin");
    },

    clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
    },

    async login(username, password) {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login gagal.");
        }

        this.setSession(result);

        return result;
    },

    async logout() {
        try {
            await fetch("/logout", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.getToken()}`
                }
            });
        } finally {
            this.clearSession();
            window.location.href = "/";
        }
    },

    updateNavigation() {
        const adminButton = document.getElementById("btn-admin");
        const loginButton = document.getElementById("btn-login-nav");
        const logoutButton = document.getElementById("btn-logout");
        const cartButton = document.getElementById("btn-cart");

        const admin = this.isAdmin();

        if (adminButton) {
            adminButton.style.display = admin ? "inline-flex" : "none";
        }

        if (loginButton) {
            loginButton.style.display = admin ? "none" : "inline-flex";
        }

        if (logoutButton) {
            logoutButton.style.display = admin ? "inline-flex" : "none";
        }

        if (cartButton) {
            cartButton.style.display = admin ? "none" : "inline-flex";
        }
    },

    protectAdminPage() {
        if (document.body.dataset.page !== "admin") {
            return;
        }

        if (!this.isAdmin()) {
            window.location.href = "/login-page";
        }
    },

    initLogin() {
        const form = document.getElementById("login-form");

        if (!form) {
            return;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = form.elements.username.value.trim();
            const password = form.elements.password.value;
            const errorBox = document.getElementById("login-error");

            errorBox.style.display = "none";

            try {
                await this.login(username, password);
                window.location.href = "/";
            } catch (error) {
                errorBox.textContent = error.message || "Login gagal.";
                errorBox.style.display = "block";
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    Auth.protectAdminPage();
    Auth.updateNavigation();
    Auth.initLogin();

    const logoutButton = document.getElementById("btn-logout");

    if (logoutButton) {
        logoutButton.addEventListener("custom-click", () => {
            Auth.logout();
        });
    }
});