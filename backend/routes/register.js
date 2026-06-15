// register.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

function generateAccountNumber(prefix) {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${random}`;
}

function validatePin(pin) {
  const pinRegex = /^\d{4}$/;
  return pinRegex.test(pin);
}

router.post("/customer", async (req, res) => {
  try {
    const { customer_name, address, phone_no, password } = req.body;

    if (!customer_name || !phone_no || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!validatePin(password)) {
      return res
        .status(400)
        .json({ error: "Password must be a 4-digit numeric PIN" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const account_no = generateAccountNumber("CUS");

    const query = `
      INSERT INTO customer_account
      (customer_name, address, phone_no, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING customer_id, customer_name;
    `;

    const values = [customer_name, address, phone_no, hashedPassword];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Customer registered successfully",
      name: result.rows[0].customer_name,

    });
  } catch (err) {
    console.error("Error registering customer:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Phone number already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/farmer", async (req, res) => {
  try {
    const { farm_name, address, phone_no, password } = req.body;

    if (!farm_name || !phone_no || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!validatePin(password)) {
      return res
        .status(400)
        .json({ error: "Password must be a 4-digit numeric PIN" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const account_no = generateAccountNumber("FAR");

    const query = `
      INSERT INTO farmer_account
      (farm_name, address, phone_no, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING farmer_id, farm_name;
    `;

    const values = [farm_name, address, phone_no, hashedPassword];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Farmer registered successfully",
      name: result.rows[0].farm_name,
      account_no: result.rows[0].account_no,
    });
  } catch (err) {
    console.error("Error registering farmer:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Phone number already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/check-super-admin", async (req, res) => {
  try {
    const query = `SELECT COUNT(*) FROM admin WHERE role_type = 'super_admin'`;
    const result = await pool.query(query);
    const count = parseInt(result.rows[0].count);

    res.json({
      exists: count > 0,
      count: count
    });
  } catch (err) {
    console.error("Error checking super admin:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin", async (req, res) => {
  console.log("[register] /admin route hit", { bodyKeys: Object.keys(req.body || {}) });
  try {
    const {
      admin_name,
      email,
      phone_no,
      phone,
      password,
      role_type,
      admin_type,
      department,
      created_by,
    } = req.body;

    const phoneValue = phone_no || phone;
    const roleValue = admin_type || role_type || "admin";
    const deptValue = department || null;
    const createdByValue = created_by || null;

    if (!admin_name || !email || !phoneValue || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!validatePin(password)) {
      return res
        .status(400)
        .json({ error: "Password must be a 4-digit numeric PIN" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO admin
      (admin_name, email, phone, password_hash, role_type, department, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING admin_id, admin_name, email, role_type;
    `;

    const values = [
      admin_name,
      email,
      phoneValue,
      hashedPassword,
      roleValue,
      deptValue,
      "active",
      createdByValue,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Admin registered successfully",
      id: result.rows[0].admin_id,
      name: result.rows[0].admin_name,
      email: result.rows[0].email,
      role: result.rows[0].role_type,
    });
  } catch (err) {
    console.error("Error registering admin:", err);
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
