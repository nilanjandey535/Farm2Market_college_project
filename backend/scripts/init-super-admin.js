// Script to initialize a default super admin account
const bcrypt = require('bcrypt');
const pool = require('../db');

async function initSuperAdmin() {
  try {

    const result = await pool.query(
      "SELECT COUNT(*) FROM admin WHERE admin_type = 'super_admin'"
    );

    const count = parseInt(result.rows[0].count);

    if (count === 0) {

      const adminName = 'Default Super Admin';
      const email = 'superadmin@farm2market.com';
      const phone = '9999999999';
      const password = '1234';

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertResult = await pool.query(
        `INSERT INTO admin
        (admin_name, email, phone_no, password_hash, admin_type, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING admin_id`,
        [adminName, email, phone, hashedPassword, 'super_admin', 'active']
      );

      console.log('✅ Default Super Admin created successfully!');
      console.log('Email:', email);
      console.log('Password PIN:', password);
      console.log('Admin ID:', insertResult.rows[0].admin_id);
    } else {
      console.log('ℹ️  Super Admin account already exists. No action needed.');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error initializing Super Admin:', error);
    await pool.end();
  }
}

initSuperAdmin();
