const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/Course");

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

/* ===== AI ROUTE (OpenAI) ===== */
const fetch = require("node-fetch");

app.post("/api/ai", async (req, res) => {
    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: req.body.message
            })
        });

        const data = await response.json();

        const reply =
            data.output?.[0]?.content?.[0]?.text ||
            "No response";

        res.json({ reply });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ===== DATABASE FUNCTION ===== */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.log("❌ DB Error:", err.message);
        process.exit(1);
    }
};

/* ===== TEST ROUTE ===== */
app.get("/", (req, res) => {
    res.send("Server working ✅");
});

/* ===== START SERVER ONLY AFTER DB ===== */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("🚀 Server running on port " + PORT);
    });
});