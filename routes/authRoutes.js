const express = require("express");
const router = express.Router();
const path = require("path");
const authController = require("../controllers/authController");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard.html"));
});

router.get("/login-page", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

router.post("/login", authController.loginUser);

module.exports = router;
