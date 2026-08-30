const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const db = new sqlite3.Database(
    process.env.DB_PATH || "./database.sqlite"
);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin'
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(
        "UPDATE users SET role = 'admin' WHERE username = ?",
        [process.env.ADMIN_USERNAME]
    );

    db.get(
        "SELECT id FROM users WHERE username = ?",
        [process.env.ADMIN_USERNAME],
        (error, row) => {
            if (error || row) {
                return;
            }

            db.run(
                "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                [
                    process.env.ADMIN_USERNAME,
                    process.env.ADMIN_PASSWORD,
                    "admin"
                ]
            );
        }
    );
});

module.exports = db;