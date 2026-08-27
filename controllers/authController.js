const userModel = require("../models/userModel");

/**
 * Processes the login request and validates credentials against the database.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>}
 */
async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    const user = await userModel.getUserByUsername(username);

    if (user && user.password === password) {
      res.status(200).json({ message: "Success" });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  loginUser,
};
