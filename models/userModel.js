const db = require("../config/db");

/**
 * Retrieves a user record from the database based on the provided username.
 * @param {string} username - The username to query in the database.
 * @returns {Promise<Object>} A promise that resolves to the user object or rejects with an error.
 */
function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

module.exports = {
  getUserByUsername,
};
