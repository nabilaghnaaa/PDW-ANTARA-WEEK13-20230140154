const express = require("express");
require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/", authRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});