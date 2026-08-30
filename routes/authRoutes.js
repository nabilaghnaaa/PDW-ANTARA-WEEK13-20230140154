const express = require("express");
const path = require("path");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/dashboard.html"));
});

router.get("/login-page", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/login.html"));
});

router.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/cart.html"));
});

router.get("/admin/products", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/admin-products.html"));
});

router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);

module.exports = router;