document.addEventListener("DOMContentLoaded", () => {
    Auth.updateNavigation();
    Product.render();
    Cart.init();
    Chat.init();

    const cartButton = document.getElementById("btn-cart");

    if (cartButton) {
        cartButton.addEventListener("custom-click", () => {
            window.location.href = "/cart";
        });
    }
});