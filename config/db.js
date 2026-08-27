const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

/**
 * Initializes the SQLite database connection and creates the users table.
 * @param {string} dbPath - The file path for the SQLite database instance.
 * @returns {Object} The active database connection instance.
 */
function initializeDB(dbPath) {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)",
    );

    const stmt = db.prepare(
      "INSERT INTO users (username, password) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)",
    );
    stmt.run(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
      process.env.ADMIN_USERNAME,
    );
    stmt.finalize();
  });

  return db;
}

module.exports = initializeDB(process.env.DB_PATH);
