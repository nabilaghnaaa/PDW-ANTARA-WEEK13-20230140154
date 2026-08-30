const productModel = require("../models/productModel");

const IN_SCOPE_TERMS = [
    "produk",
    "barang",
    "harga",
    "kategori",
    "deskripsi",
    "tersedia",
    "stok",
    "belanja",
    "keranjang",
    "toko",
    "login",
    "admin",
    "jual",
    "beli",
    "produk apa",
    "produk apa saja",
    "ada apa",
    "harganya",
    "berapa",
    "murah",
    "mahal"
];

const GREETINGS = [
    "halo",
    "hai",
    "hi",
    "pagi",
    "siang",
    "sore",
    "malam",
    "hello"
];

function isGreeting(text) {
    const normalized = text.toLowerCase().trim();

    return GREETINGS.some((greeting) => normalized === greeting || normalized.startsWith(`${greeting} `));
}

function isInScope(text, products) {
    const normalized = text.toLowerCase();

    if (isGreeting(text)) {
        return true;
    }

    if (IN_SCOPE_TERMS.some((term) => normalized.includes(term))) {
        return true;
    }

    return products.some((product) => {
        const productName = String(product.name || "").toLowerCase();
        const category = String(product.category || "").toLowerCase();

        return (productName && normalized.includes(productName)) || (category && normalized.includes(category));
    });
}

function buildProductsContext(products) {
    if (!products.length) {
        return "Saat ini belum ada produk yang tersedia di TokoRe.";
    }

    return products.map((product) => [
        `ID: ${product.id}`,
        `Nama: ${product.name}`,
        `Deskripsi: ${product.description}`,
        `Harga: Rp${Number(product.price).toLocaleString("id-ID")}`,
        `Kategori: ${product.category}`,
        `Gambar: ${product.image || "Tidak ada"}`
    ].join("\n")).join("\n\n");
}

function buildHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
        .slice(-6)
        .map((item) => ({
            type: item.role === "assistant" ? "model_output" : "user_input",
            content: [
                {
                    type: "text",
                    text: item.content.slice(0, 1000)
                }
            ]
        }));
}

function extractAnswer(data) {
    if (Array.isArray(data.steps)) {
        const texts = [];

        data.steps.forEach((step) => {
            if (step.type !== "model_output" || !Array.isArray(step.content)) {
                return;
            }

            step.content.forEach((content) => {
                if (content.type === "text" && typeof content.text === "string") {
                    texts.push(content.text);
                }
            });
        });

        if (texts.length) {
            return texts.join("").trim();
        }
    }

    return typeof data.output_text === "string" ? data.output_text.trim() : "";
}

async function chat(req, res) {
    const message = String(req.body.message || "").trim();

    if (!message) {
        return res.status(400).json({
            message: "Pesan wajib diisi"
        });
    }

    if (message.length > 1000) {
        return res.status(400).json({
            message: "Pesan terlalu panjang"
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            message: "GEMINI_API_KEY belum diatur di file .env"
        });
    }

    try {
        const products = await productModel.getAllProducts();

        if (!products.length && /produk|barang|ada apa|apa aja|tersedia/i.test(message)) {
            return res.json({
                answer: "Saat ini belum ada produk yang tersedia di TokoRe."
            });
        }

        if (!isInScope(message, products)) {
            return res.json({
                answer: "Aku hanya bisa membantu seputar produk dan fitur TokoRe. Coba tanyakan tentang produk, harga, kategori, atau fitur toko."
            });
        }

        const productContext = buildProductsContext(products);
        const history = buildHistory(req.body.history);

        const systemInstruction = [
            "Kamu adalah asisten AI untuk TokoRe.",
            "Jawab hanya pertanyaan yang berkaitan dengan TokoRe.",
            "Bantu pelanggan mengenai produk, harga, kategori, deskripsi produk, ketersediaan produk, keranjang belanja, login, dan fitur toko.",
            "Gunakan informasi produk yang diberikan sebagai sumber informasi untuk menjawab pertanyaan pelanggan.",
            "Jangan pernah menyebut database, API, server, sistem internal, tabel, backend, data internal, atau proses teknis lainnya kepada pelanggan.",
            "Jangan mengarang nama produk, harga, kategori, stok, diskon, atau informasi lain yang tidak tersedia.",
            "Jika produk atau informasi yang ditanyakan belum tersedia, katakan dengan bahasa yang natural seperti 'Saat ini produk tersebut belum tersedia di TokoRe.'",
            "Jika pelanggan menanyakan produk yang tersedia, sebutkan produk secara langsung dan jangan menjelaskan dari mana informasi tersebut berasal.",
            "Jika pelanggan menanyakan fitur toko, jelaskan seperti customer service biasa.",
            "Jika pertanyaan berada di luar konteks TokoRe, arahkan pelanggan kembali ke topik produk atau fitur TokoRe.",
            "Jangan pernah mengatakan bahwa kamu memiliki akses ke database atau sedang membaca database.",
            "Jawab dalam bahasa Indonesia dengan gaya natural, ramah, dan singkat.",
            "Hindari bahasa yang terlalu formal dan jangan terdengar seperti robot.",
            "Jawab pertanyaan secara lengkap tetapi ringkas.",
            "Jangan berhenti di tengah kalimat.",
            "Untuk pertanyaan sederhana, cukup 1 sampai 3 kalimat.",
            `Informasi produk TokoRe:\n${productContext}`
        ].join("\n\n");

        const input = [
            ...history,
            {
                type: "user_input",
                content: [
                    {
                        type: "text",
                        text: message
                    }
                ]
            }
        ];

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
                input,
                system_instruction: systemInstruction,
                generation_config: {
                    temperature: 0.3,
                    max_output_tokens: 500
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);

            return res.status(502).json({
                message: data?.error?.message || "Layanan Gemini sedang tidak bisa digunakan"
            });
        }

        const answer = extractAnswer(data);

        if (!answer) {
            console.error("Gemini Response:", JSON.stringify(data, null, 2));

            return res.json({
                answer: "Maaf, aku belum mendapatkan jawaban untuk pertanyaan tersebut."
            });
        }

        res.json({
            answer
        });
    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            message: "Gagal menghubungkan ke layanan Gemini"
        });
    }
}

module.exports = {
    chat
};