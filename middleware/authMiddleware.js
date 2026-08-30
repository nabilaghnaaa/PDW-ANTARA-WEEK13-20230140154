const crypto = require("crypto");

const tokens = new Map();

function createToken(user) {
    const token = crypto.randomBytes(32).toString("hex");

    tokens.set(token, {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: Date.now()
    });

    return token;
}

function removeToken(token) {
    tokens.delete(token);
}

function requireAdmin(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const session = tokens.get(token);

    if (!session || session.role !== "admin") {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    req.user = session;
    next();
}

module.exports = {
    createToken,
    removeToken,
    requireAdmin
};