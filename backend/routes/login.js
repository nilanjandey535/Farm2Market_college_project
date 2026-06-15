// routes/login.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

function validatePin(pin) {
  const pinRegex = /^\d{4}$/;
  return pinRegex.test(pin);
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/", async (req, res) => {
  try {
    const { username, phone_no, password, role, ip_address } = req.body;

    if (!username || !phone_no || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (role !== "delivery_agent" && role !== "agri_specialist" && !validatePin(password)) {
      return res.status(400).json({ error: "Password must be a 4-digit numeric PIN" });
    }

    if ((role === "delivery_agent" || role === "agri_specialist") && password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }

    let tableName, idField, nameField, phoneField;
    if (role === "customer") {
      tableName = "customer_account";
      idField = "customer_id";
      nameField = "customer_name";
      phoneField = "phone_no";
    } else if (role === "farmer") {
      tableName = "farmer_account";
      idField = "farmer_id";
      nameField = "farm_name";
      phoneField = "phone_no";
    } else if (role === "admin") {
      tableName = "admin";
      idField = "admin_id";
      nameField = "admin_name";
      phoneField = "phone";
    } else if (role === "delivery_agent") {
      tableName = "delivery_agents";
      idField = "agent_id";
      nameField = "name";
      phoneField = "phone";
    } else if (role === "agri_specialist") {
      tableName = "agri_specialist";
      idField = "specialist_id";
      nameField = "fullname";
      phoneField = "phone";
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    const phoneColumn = (role === "delivery_agent" || role === "admin" || role === "agri_specialist") ? "phone" : "phone_no";
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE ${phoneColumn} = $1 AND ${nameField} = $2 AND status = 'active'`,
      [phone_no, username]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found or account inactive" });
    }

    const user = result.rows[0];

    if (user.account_locked) {
      if (role === "admin") {

        return res.status(403).json({ error: "Admin account locked. Please contact the Super Admin to unlock your account." });
      }
      return res.status(403).json({ error: "Account locked after 3 failed attempts. Please verify OTP to unlock." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    try {
      await pool.query(
        `INSERT INTO login_attempts (user_id, ip_address, success_count, reason)
         VALUES ($1, $2, $3, $4)`,
        [user[idField], ip_address || "unknown", validPassword ? 1 : 0, validPassword ? "success" : "invalid pin"]
      );
    } catch (loginAttemptError) {

      console.warn("Could not log login attempt (table may not exist):", loginAttemptError.message);

    }

    if (!validPassword) {

      const failedAttemptField = role === "customer" ? "failed_attempt" : "failed_attempts";
      const currentAttempts = role === "customer"
        ? (user.failed_attempt || 0)
        : (user.failed_attempts || 0);
      const failedAttempts = currentAttempts + 1;
      const lockAccount = failedAttempts >= 3;

      await pool.query(
        `UPDATE ${tableName}
         SET ${failedAttemptField} = $1, account_locked = $2
         WHERE ${idField} = $3`,
        [failedAttempts, lockAccount, user[idField]]
      );

      if (lockAccount) {
        if (role === "admin") {

          return res.status(403).json({
            error: "Admin account locked after 3 failed attempts. Please contact the Super Admin to unlock your account.",
            id: user[idField]
          });
        } else {

          const otpCode = generateOTP();
          const expiresAt = new Date(Date.now() + 5 * 60000);

          await pool.query(
            `INSERT INTO otp_verification (user_id, otp_code, purpose, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [user[idField], otpCode, "account_unlock", expiresAt]
          );

          console.log(`🔐 OTP for ${phone_no}: ${otpCode}`);

          return res.status(403).json({
            error: "Account locked after 3 failed attempts. OTP sent to registered number.",
            id: user[idField]
          });
        }
      }

      return res.status(401).json({ error: "Incorrect PIN. Try again." });
    }

    const failedAttemptField = role === "customer" ? "failed_attempt" : "failed_attempts";
    const lastLoginField = role === "delivery_agent" ? "last_updated" : "last_login";
    await pool.query(
      `UPDATE ${tableName}
       SET ${failedAttemptField} = 0, account_locked = FALSE, ${lastLoginField} = CURRENT_TIMESTAMP
       WHERE ${idField} = $1`,
      [user[idField]]
    );

    const userPhone = (role === "delivery_agent" || role === "admin" || role === "agri_specialist") ? user.phone : user.phone_no;

    const responseData = {
      message: "Login successful",
      id: user[idField],
      name: user[nameField],
      phone_no: userPhone,
      role
    };

    if (role === "admin") {
      responseData.role_type = user.role_type || "admin";
    }

    if (role === "agri_specialist") {
      responseData.storage_location_id = user.storage_location_id || null;
      responseData.assigned_region = user.assigned_region || null;
      responseData.email = user.email || null;
    }

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { user_id, otp_code, role } = req.body;
    if (!user_id || !otp_code || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (role === "admin") {
      return res.status(400).json({ error: "Admin accounts cannot be unlocked via OTP. Please contact the Super Admin." });
    }

    const tableName =
      role === "customer" ? "customer_account" :
      role === "farmer" ? "farmer_account" :
      role === "delivery_agent" ? "delivery_agents" : "admin";

    const otpResult = await pool.query(
      `SELECT * FROM otp_verification
       WHERE user_id = $1 AND otp_code = $2 AND purpose = 'account_unlock' AND verified = FALSE
       ORDER BY created_time DESC LIMIT 1`,
      [user_id, otp_code]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const otp = otpResult.rows[0];
    if (new Date() > new Date(otp.expires_at)) {
      return res.status(400).json({ error: "OTP expired" });
    }

    await pool.query(`UPDATE otp_verification SET verified = TRUE WHERE otp_id = $1`, [otp.otp_id]);

    let idFieldName;
    let failedAttemptField;
    if (tableName === "customer_account") {
      idFieldName = "customer_id";
      failedAttemptField = "failed_attempt";
    } else if (tableName === "farmer_account") {
      idFieldName = "farmer_id";
      failedAttemptField = "failed_attempts";
    } else if (tableName === "delivery_agents") {
      idFieldName = "agent_id";
      failedAttemptField = "failed_attempts";
    } else {
      idFieldName = "admin_id";
      failedAttemptField = "failed_attempts";
    }

    await pool.query(
      `UPDATE ${tableName}
       SET account_locked = FALSE, ${failedAttemptField} = 0
       WHERE ${idFieldName} = $1`,
      [user_id]
    );

    res.status(200).json({ message: "Account unlocked successfully. You can now log in." });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
