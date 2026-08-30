const userModel = require("../models/userModel");
const { createToken, removeToken } = require("../middleware/authMiddleware");

async function loginUser(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username dan password wajib diisi"
        });
    }

    try {
        const user = await userModel.getUserByUsername(username.trim());

        if (!user || user.password !== password) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const token = createToken(user);

        res.status(200).json({
            message: "Success",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role || "admin"
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

function logoutUser(req, res) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (token) {
        removeToken(token);
    }

    res.status(200).json({
        message: "Logout berhasil"
    });
}

module.exports = {
    loginUser,
    logoutUser
};