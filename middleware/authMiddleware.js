const crypto = require("crypto");

const sessions = new Map();

function createToken(user) {
    const token = crypto.randomBytes(32).toString("hex");

    sessions.set(token, {
        id: user.id,
        username: user.username,
        role: user.role || "admin"
    });

    return token;
}

function removeToken(token) {
    sessions.delete(token);
}

function getSession(token) {
    return sessions.get(token);
}

function requireAdmin(req, res, next) {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : "";

    const session = getSession(token);

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
    getSession,
    requireAdmin
};