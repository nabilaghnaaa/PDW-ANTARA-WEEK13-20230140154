const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

function initializeDB(dbPath) {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, role TEXT DEFAULT 'admin')");
        db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin'", () => {});
        db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL, price REAL NOT NULL, category TEXT NOT NULL, image TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
        db.run("UPDATE users SET role = 'admin' WHERE username = ?", [process.env.ADMIN_USERNAME]);

        const stmt = db.prepare("INSERT INTO users (username, password, role) SELECT ?, ?, 'admin' WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)");
        stmt.run(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, process.env.ADMIN_USERNAME);
        stmt.finalize();
    });

    return db;
}

module.exports = initializeDB(process.env.DB_PATH);