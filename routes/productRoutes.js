const express = require("express");
const productController = require("../controllers/productController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", productController.listProducts);
router.post("/", requireAdmin, productController.createProduct);
router.put("/:id", requireAdmin, productController.updateProduct);
router.delete("/:id", requireAdmin, productController.deleteProduct);

module.exports = router;