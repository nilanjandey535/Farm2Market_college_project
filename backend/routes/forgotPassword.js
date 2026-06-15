// backend/routes/forgotPassword.js

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

function resolveTable(role) {
  if (role === "customer") {
    return { tableName: "customer_account", idField: "customer_id", phoneField: "phone_no", nameField: "customer_name" };
  } else if (role === "farmer") {
    return { tableName: "farmer_account", idField: "farmer_id", phoneField: "phone_no", nameField: "farm_name" };
  } else if (role === "delivery_agent") {
    return { tableName: "delivery_agents", idField: "agent_id", phoneField: "phone", nameField: "name" };
  }
  return null;
}

router.post("/reset", async (req, res) => {
  try {
    const { name, phone_no, new_password, role } = req.body;

    if (!name || !phone_no || !new_password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (role === "admin") {
      return res.status(403).json({ error: "Admin accounts cannot reset password via this page. Please contact the Super Admin." });
    }
    if (role === "agri_specialist") {
      return res.status(403).json({ error: "Agri Specialist accounts cannot reset password via this page. Please contact the Admin." });
    }

    const tableInfo = resolveTable(role);
    if (!tableInfo) {
      return res.status(400).json({ error: "Invalid role. Supported: customer, farmer, delivery_agent" });
    }

    const { tableName, idField, phoneField, nameField } = tableInfo;

    if (role === "delivery_agent") {
      if (new_password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters" });
      }
    } else {

      if (!/^\d{4}$/.test(new_password)) {
        return res.status(400).json({ error: "Password must be a 4-digit numeric PIN" });
      }
    }

    const userResult = await pool.query(
      `SELECT ${idField}, ${nameField}, ${phoneField} FROM ${tableName}
       WHERE ${nameField} = $1 AND ${phoneField} = $2 AND status = 'active'`,
      [name, phone_no]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "No active account found matching this name and phone number." });
    }

    const user = userResult.rows[0];

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      `UPDATE ${tableName} SET password_hash = $1 WHERE ${idField} = $2`,
      [hashedPassword, user[idField]]
    );

    try {
      await pool.query(
        `UPDATE ${tableName} SET failed_attempts = 0, account_locked = FALSE WHERE ${idField} = $1`,
        [user[idField]]
      );
    } catch (e1) {

      try {
        await pool.query(
          `UPDATE ${tableName} SET failed_attempt = 0, account_locked = FALSE WHERE ${idField} = $1`,
          [user[idField]]
        );
      } catch (e2) {

      }
    }

    console.log(`\n✅ Password reset successful for ${user[nameField]} (${phone_no}) as ${role}\n`);

    res.json({ message: "Password reset successful! You can now login with your new password." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;
