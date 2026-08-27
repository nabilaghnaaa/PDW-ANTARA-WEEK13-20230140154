const express = require("express");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/", authRoutes);

/**
 * Starts the Express server.
 * @param {number} port - The port number to listen on.
 * @returns {void}
 */
function startServer(port) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer(port);
