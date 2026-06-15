// backend/routes/deliveryAgents.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

function generateAgentId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `DA-${random}`;
}

function validatePassword(password) {
  return password.length >= 4;
}

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      phone,
      vehicle_type,
      vehicle_number,
      password,
      assigned_region
    } = req.body;

    if (!name || !phone || !vehicle_type || !password) {
      return res.status(400).json({ error: "Missing required fields: name, phone, vehicle_type, and password are required" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const agentId = generateAgentId();

    const query = `
      INSERT INTO delivery_agents
      (name, phone, vehicle_type, vehicle_number, password_hash, assigned_region, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING agent_id, name, phone, vehicle_type;
    `;

    const values = [
      name,
      phone,
      vehicle_type,
      vehicle_number || null,
      hashedPassword,
      assigned_region || null,
      "active"
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Delivery agent registered successfully",
      id: result.rows[0].agent_id,
      name: result.rows[0].name,
      phone: result.rows[0].phone,
      vehicle_type: result.rows[0].vehicle_type
    });
  } catch (err) {
    console.error("Error registering delivery agent:", err);
    if (err.code === "23505") {

      return res.status(409).json({ error: "Phone number already exists" });
    }
    res.status(500).json({ error: "Server error during delivery agent registration" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT agent_id, name, phone, vehicle_type, vehicle_number, status, rating, created_at
      FROM delivery_agents
      ORDER BY created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error listing delivery agents:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT agent_id, name, phone, vehicle_type, vehicle_number, status, rating, created_at
      FROM delivery_agents
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      message: "Delivery agents retrieved successfully",
      agents: result.rows
    });
  } catch (err) {
    console.error("Error fetching delivery agents:", err);
    res.status(500).json({ error: "Server error while fetching delivery agents" });
  }
});

router.get("/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    const result = await pool.query(
      `SELECT agent_id, name, phone, vehicle_type, vehicle_number, status, rating, created_at, assigned_region
       FROM delivery_agents
       WHERE agent_id = $1`,
      [agentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Delivery agent not found" });
    }

    res.status(200).json({
      message: "Delivery agent retrieved successfully",
      agent: result.rows[0]
    });
  } catch (err) {
    console.error("Error fetching delivery agent:", err);
    res.status(500).json({ error: "Server error while fetching delivery agent" });
  }
});

router.get("/:agentId/dashboard-stats", async (req, res) => {
  try {
    const { agentId } = req.params;

    const pendingRes = await pool.query(
      "SELECT COUNT(*) FROM delivery_jobs WHERE agent_id = $1 AND status IN ('pending_acceptance', 'accepted', 'in_transit')",
      [agentId]
    );

    const completedTodayRes = await pool.query(
      "SELECT COUNT(*) FROM delivery_jobs WHERE agent_id = $1 AND status = 'completed' AND completed_at::date = CURRENT_DATE",
      [agentId]
    );

    const earningsTodayRes = await pool.query(
      "SELECT SUM(delivery_charge) FROM delivery_jobs WHERE agent_id = $1 AND status = 'completed' AND completed_at::date = CURRENT_DATE",
      [agentId]
    );

    const ratingRes = await pool.query(
      "SELECT rating FROM delivery_agents WHERE agent_id = $1",
      [agentId]
    );

    res.json({
      pendingDeliveries: parseInt(pendingRes.rows[0].count),
      completedToday: parseInt(completedTodayRes.rows[0].count),
      todayEarnings: parseFloat(earningsTodayRes.rows[0].sum || 0),
      rating: parseFloat(ratingRes.rows[0].rating || 0)
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:agentId/deliveries/history", async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT dj.*, or_table.customer_id, or_table.order_total, ca.fullname as customer_name
      FROM delivery_jobs dj
      JOIN order_request or_table ON or_table.order_id = dj.order_id
      JOIN customer_account ca ON ca.customer_id = or_table.customer_id
      WHERE dj.agent_id = $1
    `;
    const params = [agentId];

    if (status === 'completed') {
      query += " AND dj.status = 'completed'";
    } else if (status === 'pending') {
      query += " AND dj.status IN ('accepted', 'in_transit')";
    }

    query += " ORDER BY dj.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching delivery history:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:agentId/deliveries/:jobId/status", async (req, res) => {
  const client = await pool.connect();
  try {
    const { agentId, jobId } = req.params;
    const { status } = req.body;

    await client.query("BEGIN");

    const jobRes = await client.query(
      "SELECT order_id FROM delivery_jobs WHERE job_id = $1 AND agent_id = $2",
      [jobId, agentId]
    );

    if (jobRes.rowCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const orderId = jobRes.rows[0].order_id;

    let djUpdateQuery = "UPDATE delivery_jobs SET status = $1, updated_at = NOW()";
    if (status === 'in_transit') djUpdateQuery += ", started_at = NOW()";
    if (status === 'completed' || status === 'reached_destination') {
      if (status === 'completed') djUpdateQuery += ", completed_at = NOW()";
    }
    djUpdateQuery += " WHERE job_id = $2";

    await client.query(djUpdateQuery, [status, jobId]);

    let orderStatus = status;
    if (status === 'reached_destination') {
      orderStatus = 'arrived_waiting_payment';
    } else if (status === 'completed') {
      orderStatus = 'completed';
    } else if (status === 'in_transit') {
      orderStatus = 'in_transit';
    }

    await client.query(
      "UPDATE order_request SET status = $1, updated_at = NOW() WHERE order_id = $2",
      [orderStatus, orderId]
    );

    await client.query("COMMIT");
    res.json({ message: `Status updated to ${status}`, order_status: orderStatus });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating delivery status:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.put("/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const {
      name,
      phone,
      vehicle_type,
      vehicle_number,
      status,
      assigned_region
    } = req.body;

    const updates = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
      updates.push(`name = $${index++}`);
      values.push(name);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${index++}`);
      values.push(phone);
    }

    if (vehicle_type !== undefined) {
      updates.push(`vehicle_type = $${index++}`);
      values.push(vehicle_type);
    }

    if (vehicle_number !== undefined) {
      updates.push(`vehicle_number = $${index++}`);
      values.push(vehicle_number);
    }

    if (status !== undefined) {
      updates.push(`status = $${index++}`);
      values.push(status);
    }

    if (assigned_region !== undefined) {
      updates.push(`assigned_region = $${index++}`);
      values.push(assigned_region);
    }

    updates.push(`last_updated = NOW()`);

    if (updates.length === 1) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(agentId);
    const query = `
      UPDATE delivery_agents
      SET ${updates.join(", ")}
      WHERE agent_id = $${index}
      RETURNING agent_id, name, phone, vehicle_type, vehicle_number, status;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Delivery agent not found" });
    }

    res.status(200).json({
      message: "Delivery agent updated successfully",
      agent: result.rows[0]
    });
  } catch (err) {
    console.error("Error updating delivery agent:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Phone number already exists" });
    }
    res.status(500).json({ error: "Server error while updating delivery agent" });
  }
});

router.delete("/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    const result = await pool.query(
      "DELETE FROM delivery_agents WHERE agent_id = $1 RETURNING agent_id",
      [agentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Delivery agent not found" });
    }

    res.status(200).json({
      message: "Delivery agent deleted successfully",
      id: result.rows[0].agent_id
    });
  } catch (err) {
    console.error("Error deleting delivery agent:", err);
    res.status(500).json({ error: "Server error while deleting delivery agent" });
  }
});

module.exports = router;
