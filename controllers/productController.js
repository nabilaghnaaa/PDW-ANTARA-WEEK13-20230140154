const productModel = require("../models/productModel");

function normalizeProduct(body) {
    return {
        name: String(body.name || "").trim(),
        description: String(body.description || "").trim(),
        price: Number(body.price),
        category: String(body.category || "").trim(),
        image: String(body.image || "").trim()
    };
}

function validateProduct(product) {
    if (
        !product.name ||
        !product.description ||
        !product.category ||
        !Number.isFinite(product.price) ||
        product.price < 0
    ) {
        return "Nama, deskripsi, harga, dan kategori wajib diisi dengan benar";
    }

    if (product.image && !/^https?:\/\//i.test(product.image)) {
        return "Gambar produk harus berupa URL http atau https";
    }

    return null;
}

async function listProducts(req, res) {
    try {
        const products = await productModel.getAllProducts();

        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data produk"
        });
    }
}

async function createProduct(req, res) {
    const product = normalizeProduct(req.body);
    const validationError = validateProduct(product);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {
        const result = await productModel.createProduct(product);

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            message: "Gagal menambahkan produk"
        });
    }
}

async function updateProduct(req, res) {
    const id = Number(req.params.id);
    const product = normalizeProduct(req.body);
    const validationError = validateProduct(product);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "ID produk tidak valid"
        });
    }

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {
        const existing = await productModel.getProductById(id);

        if (!existing) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        await productModel.updateProduct(id, product);

        res.json({
            message: "Produk berhasil diubah"
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengubah produk"
        });
    }
}

async function deleteProduct(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "ID produk tidak valid"
        });
    }

    try {
        const result = await productModel.deleteProduct(id);

        if (!result.changes) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        res.json({
            message: "Produk berhasil dihapus"
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal menghapus produk"
        });
    }
}

module.exports = {
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct
};