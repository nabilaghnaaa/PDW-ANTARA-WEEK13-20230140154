const db = require("../config/db");

function getAllProducts() {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM products ORDER BY id DESC",
            [],
            (error, rows) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(rows);
            }
        );
    });
}

function getProductById(id) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM products WHERE id = ?",
            [id],
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

function createProduct(product) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO products
            (name, description, price, category, image)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(
            sql,
            [
                product.name,
                product.description,
                product.price,
                product.category,
                product.image
            ],
            function(error) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    id: this.lastID,
                    ...product
                });
            }
        );
    });
}

function updateProduct(id, product) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE products
            SET name = ?, description = ?, price = ?, category = ?, image = ?
            WHERE id = ?
        `;

        db.run(
            sql,
            [
                product.name,
                product.description,
                product.price,
                product.category,
                product.image,
                id
            ],
            function(error) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    changes: this.changes
                });
            }
        );
    });
}

function deleteProduct(id) {
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM products WHERE id = ?",
            [id],
            function(error) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    changes: this.changes
                });
            }
        );
    });
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};