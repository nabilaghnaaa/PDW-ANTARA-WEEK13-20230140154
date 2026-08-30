const userModel = require("../models/userModel");
const {
    createToken,
    removeToken
} = require("../middleware/authMiddleware");

async function loginUser(req, res) {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!username || !password) {
        return res.status(400).json({
            message: "Username dan password wajib diisi"
        });
    }

    try {
        const user = await userModel.getUserByUsername(username);

        if (!user || user.password !== password || user.role !== "admin") {
            return res.status(401).json({
                message: "Username atau password admin salah"
            });
        }

        const token = createToken(user);

        res.json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }
}

function logoutUser(req, res) {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : "";

    if (token) {
        removeToken(token);
    }

    res.json({
        message: "Logout berhasil"
    });
}

module.exports = {
    loginUser,
    logoutUser
};