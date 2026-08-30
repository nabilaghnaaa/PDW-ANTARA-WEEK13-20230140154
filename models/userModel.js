const db = require("../config/db");

function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            (error, row) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(row);
            }
        );
    });
}

module.exports = {
    getUserByUsername
};