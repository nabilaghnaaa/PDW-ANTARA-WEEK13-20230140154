const NotificationSystem = {
    show(message, type = "info", duration = 2800) {
        let notification = document.querySelector("app-notification");

        if (!notification) {
            notification = document.createElement("app-notification");
            document.body.appendChild(notification);
        }

        notification.show(message, type, duration);
    },

    success(message) {
        this.show(message, "success");
    },

    error(message) {
        this.show(message, "error");
    },

    warning(message) {
        this.show(message, "warning");
    },

    info(message) {
        this.show(message, "info");
    }
};