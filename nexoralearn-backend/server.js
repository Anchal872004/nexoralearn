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