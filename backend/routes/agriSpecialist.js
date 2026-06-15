// backend/routes/agriSpecialist.js

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      password,
      qualification,
      experience_year,
      assigned_region,
      storage_location_id
    } = req.body;

    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ error: "Full name, email, phone, and password are required" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingEmail = await pool.query(
      `SELECT specialist_id FROM agri_specialist WHERE email = $1`,
      [email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const existingPhone = await pool.query(
      `SELECT specialist_id FROM agri_specialist WHERE phone = $1`,
      [phone]
    );
    if (existingPhone.rows.length > 0) {
      return res.status(409).json({ error: "An account with this phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO agri_specialist
        (fullname, email, password_hash, phone, qualification, experience_year, assigned_region, storage_location_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING specialist_id, fullname, email, phone, assigned_region
    `;

    const result = await pool.query(insertQuery, [
      fullname,
      email,
      hashedPassword,
      phone,
      qualification || null,
      experience_year ? parseInt(experience_year) : null,
      assigned_region || null,
      storage_location_id ? parseInt(storage_location_id) : null
    ]);

    const specialist = result.rows[0];

    console.log(`\n✅ New Agri Specialist registered: ${specialist.fullname} (${specialist.email})\n`);

    res.status(201).json({
      message: "Agri Specialist registered successfully",
      specialist_id: specialist.specialist_id,
      fullname: specialist.fullname,
      email: specialist.email,
      phone: specialist.phone,
      assigned_region: specialist.assigned_region
    });
  } catch (error) {
    console.error("Error registering agri specialist:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

router.get("/list", async (req, res) => {
  try {
    const result = await pool.query("SELECT specialist_id, fullname, email, phone, qualification, assigned_region, status FROM agri_specialist ORDER BY specialist_id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
