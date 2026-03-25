const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

/* ===== GET ALL COURSES ===== */
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;