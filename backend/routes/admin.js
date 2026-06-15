// routes/admin.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalAdmins = await pool.query("SELECT COUNT(*) FROM admin");
    const totalRevenue = await pool.query("SELECT SUM(amount) FROM payment");
    const totalOrders = await pool.query("SELECT COUNT(*) FROM order_request");
    const avgOrder = await pool.query("SELECT AVG(order_total) FROM order_request");
    const pendingOrders = await pool.query("SELECT COUNT(*) FROM order_request WHERE status = 'pending'");

    res.json({
      totalAdmins: parseInt(totalAdmins.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0),
      totalOrders: parseInt(totalOrders.rows[0].count),
      avgOrderValue: parseFloat(avgOrder.rows[0].avg || 0),
      pendingOrders: parseInt(pendingOrders.rows[0].count)
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/farmers/pending-approvals", async (req, res) => {
  console.log("HIT: /api/admin/farmers/pending-approvals");
  try {
    const result = await pool.query("SELECT * FROM farmer_account WHERE status = 'pending' ORDER BY farmer_id DESC");
    console.log("Pending farmers result count:", result.rowCount);
    res.json(result.rows);
  } catch (err) {
    console.error("Pending farmers error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/list", async (req, res) => {
  try {
    const result = await pool.query("SELECT admin_id, admin_name, email, role_type, department, status FROM admin ORDER BY admin_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Admin list error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/activity-logs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, a.admin_name
      FROM admin_activity_log l
      JOIN admin a ON l.admin_id = a.admin_id
      ORDER BY l.time DESC LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Activity logs error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/cold-storage-reports", async (req, res) => {
  try {
    const { type, from_date, to_date } = req.query;

    let query = `
      SELECT
        csr.report_id,
        csr.specialist_id,
        csr.storage_id,
        csr.report_date,
        csr.report_type,
        csr.total_crops,
        csr.total_weight_kg,
        csr.avg_temperature,
        csr.avg_humidity,
        csr.spoiled_count,
        csr.energy_kwh,
        csr.remarks,
        csr.status,
        csr.created_at,
        cs.storage_name,
        cs.capacity_kg,
        cs.current_load_kg,
        cs.temperature_c AS storage_temperature_c,
        cs.humidity_percent AS storage_humidity_percent,
        cs.status AS storage_status,
        ag.fullname AS specialist_name,
        ag.email AS specialist_email,
        ag.phone AS specialist_phone,
        ag.assigned_region AS specialist_region,
        r.region_name
      FROM cold_storage_report csr
      LEFT JOIN cold_storage cs ON csr.storage_id = cs.storage_id
      LEFT JOIN agri_specialist ag ON csr.specialist_id = ag.specialist_id
      LEFT JOIN region r ON cs.region_id = r.region_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND csr.report_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    if (from_date) {
      query += ` AND csr.report_date >= $${paramIndex}`;
      params.push(from_date);
      paramIndex++;
    }
    if (to_date) {
      query += ` AND csr.report_date <= $${paramIndex}`;
      params.push(to_date);
      paramIndex++;
    }

    query += ` ORDER BY csr.report_date DESC, csr.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Cold storage reports error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/payment-requests", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.*, da.name as agent_name
      FROM transport_payment tp
      LEFT JOIN delivery_agents da ON tp.agent_id = da.agent_id
      ORDER BY tp.date_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Payment requests error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/customer-payments", async (req, res) => {
  console.log("HIT: /api/admin/customer-payments");
  try {
    const result = await pool.query(
      'SELECT * FROM payment ORDER BY "time" DESC LIMIT 50'
    );

    console.log("Rows retrieved:", result.rowCount);
    console.log(result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error("Customer payments error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/approve-payment/:id", async (req, res) => {
  try {
    await pool.query("UPDATE transport_payment SET status = 'approved' WHERE payment_id = $1", [req.params.id]);
    res.json({ message: "Payment approved" });
  } catch (err) {
    console.error("Approve payment error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/delivery-monitoring", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dm.*, ca.fullname as customer_name, da.name as agent_name
      FROM delivery_monitoring dm
      LEFT JOIN customer_account ca ON dm.consumer_id = ca.customer_id
      LEFT JOIN delivery_agents da ON dm.agent_id = da.agent_id
      ORDER BY dm.timestamp DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Delivery monitoring error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/farmers/:id/approval", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query("UPDATE farmer_account SET status = $1 WHERE farmer_id = $2", [status, id]);
    res.json({ message: `Farmer ${status}` });
  } catch (err) {
    console.error("Farmer approval error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/assignment-data", async (req, res) => {
  try {
    const storageRes = await pool.query("SELECT storage_id, storage_name, capacity_kg, current_load_kg, region_id FROM cold_storage WHERE status = 'active'");
    const specialistRes = await pool.query("SELECT specialist_id, fullname, assigned_region FROM agri_specialist WHERE status = 'active'");
    res.json({
      storages: storageRes.rows,
      specialists: specialistRes.rows
    });
  } catch (err) {
    console.error("Assignment data error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/products/pending-approvals", async (req, res) => {
  console.log("[ADMIN-ROUTE] Fetching pending products...");
  try {
    const query = `
      SELECT
        p.*,
        CASE
          WHEN p.farmer_id IS NOT NULL THEN fa.farm_name
          WHEN p.customer_id IS NOT NULL THEN ca.customer_name
        END as owner_name,
        CASE
          WHEN p.farmer_id IS NOT NULL THEN 'Farmer'
          WHEN p.customer_id IS NOT NULL THEN 'Customer'
        END as owner_type
      FROM product p
      LEFT JOIN farmer_account fa ON p.farmer_id = fa.farmer_id
      LEFT JOIN customer_account ca ON p.customer_id = ca.customer_id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `;
    console.log("[ADMIN-ROUTE] Executing main query...");
    const result = await pool.query(query);
    console.log(`[ADMIN-ROUTE] Found ${result.rowCount} pending products`);

    console.log("[ADMIN-ROUTE] Fetching images for products...");
    const productsWithImages = await Promise.all(result.rows.map(async (product) => {
      try {
        const imagesRes = await pool.query("SELECT image_url FROM product_image WHERE product_id = $1", [product.product_id]);
        return {
          ...product,
          images: imagesRes.rows.map(img => img.image_url)
        };
      } catch (imgErr) {
        console.error(`[ADMIN-ROUTE] Error fetching images for product ${product.product_id}:`, imgErr.message);
        return { ...product, images: [] };
      }
    }));

    console.log("[ADMIN-ROUTE] Successfully prepared product list");
    res.json(productsWithImages);
  } catch (err) {
    console.error("[ADMIN-ROUTE] Fatal error in pending-approvals:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

router.post("/products/:id/approval", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await pool.query("UPDATE product SET status = $1, updated_at = NOW() WHERE product_id = $2", [status, id]);
    res.json({ message: `Product ${status} successfully` });
  } catch (err) {
    console.error("Product approval error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/assignment-data", async (req, res) => {
  try {
    const storageRes = await pool.query("SELECT storage_id, storage_name, capacity_kg, current_load_kg, region_id FROM cold_storage WHERE status = 'active'");
    const specialistRes = await pool.query("SELECT specialist_id, fullname, assigned_region FROM agri_specialist WHERE status = 'active'");
    res.json({
      storages: storageRes.rows,
      specialists: specialistRes.rows
    });
  } catch (err) {
    console.error("Assignment data error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/products/:id/approve-and-assign", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, storage_id, specialist_id } = req.body;

    if (status !== 'confirmed') {
      return res.status(400).json({ error: "Use rejection route for rejecting products" });
    }

    await client.query("BEGIN");

    try {
      await client.query(`
        ALTER TABLE cold_storage_crop_registry
        ADD COLUMN IF NOT EXISTS specialist_id INTEGER REFERENCES agri_specialist(specialist_id)
      `);
    } catch (colErr) {
      console.log("Column might already exist or error adding it:", colErr.message);
    }

    await client.query("UPDATE product SET status = 'confirmed', updated_at = NOW() WHERE product_id = $1", [id]);

    const prodRes = await client.query("SELECT farmer_id, product_name, stock_quantity_kg, category FROM product WHERE product_id = $1", [id]);
    const product = prodRes.rows[0];

    await client.query(
      `INSERT INTO cold_storage_crop_registry (
        badge_id, farmer_id, crop_type, entry_time, status, storage_id, specialist_id, last_updated
      ) VALUES ($1, $2, $3, NOW(), 'pending_storage', $4, $5, NOW())`,
      [id, product.farmer_id, product.product_name, storage_id, specialist_id]
    );

    await client.query("COMMIT");
    res.json({ message: "Product approved and assigned to cold storage and specialist successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Approval assignment error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT admin_id, admin_name, email, role_type, department, status FROM admin WHERE admin_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch admin error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_name, password } = req.body;

    if (password) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE admin SET admin_name = $1, password_hash = $2 WHERE admin_id = $3",
        [admin_name, hashedPassword, id]
      );
    } else {
      await pool.query(
        "UPDATE admin SET admin_name = $1 WHERE admin_id = $2",
        [admin_name, id]
      );
    }

    res.json({ message: "Admin updated successfully" });
  } catch (err) {
    console.error("Update admin error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
