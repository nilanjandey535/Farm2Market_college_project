// backend/routes/orders_adapted.js

const express = require("express");
const pool = require("../db");
const router = express.Router();

function calculateDeliveryCharge(distanceKm, orderValue, urgencyLevel = 'normal') {
  const baseRatePerKm = 5;
  const minCharge = 50;
  let charge = distanceKm * baseRatePerKm;

  if (orderValue > 2000) {
    charge += 20;
  }

  const urgencyMultipliers = {
    'normal': 1.0,
    'urgent': 1.5,
    'express': 2.0
  };

  charge *= urgencyMultipliers[urgencyLevel] || 1.0;
  charge = Math.max(charge, minCharge);
  return Math.ceil(charge / 5) * 5;
}

function calculateDistance(region1Id, region2Id) {
  const distance = Math.abs(region1Id - region2Id) * 10;
  return Math.max(distance, 5);
}

async function findBestDeliveryAgent(customerRegionId, excludedAgentIds = []) {
  try {
    let agentRes = await pool.query(
      `
      SELECT
        da.agent_id,
        da.name,
        da.phone,
        da.vehicle_type,
        da.rating,
        da.assigned_region,
        COUNT(dj.job_id) FILTER (WHERE dj.status IN ('pending_acceptance', 'accepted', 'in_transit')) as active_jobs
      FROM delivery_agents da
      LEFT JOIN delivery_jobs dj ON dj.agent_id = da.agent_id
        AND dj.status IN ('pending_acceptance', 'accepted', 'in_transit')
      WHERE da.assigned_region = $1
        AND da.status = 'active'
        AND da.agent_id != ALL($2::int[])
      GROUP BY da.agent_id, da.name, da.phone, da.vehicle_type, da.rating, da.assigned_region
      HAVING COUNT(dj.job_id) FILTER (WHERE dj.status IN ('pending_acceptance', 'accepted', 'in_transit')) < 3
      ORDER BY da.rating DESC, active_jobs ASC
      LIMIT 1
      `,
      [customerRegionId, excludedAgentIds.length > 0 ? excludedAgentIds : [0]]
    );

    if (agentRes.rowCount === 0) {
      agentRes = await pool.query(
        `
        SELECT
          da.agent_id,
          da.name,
          da.phone,
          da.vehicle_type,
          da.rating,
          da.assigned_region,
          COUNT(dj.job_id) FILTER (WHERE dj.status IN ('pending_acceptance', 'accepted', 'in_transit')) as active_jobs
        FROM delivery_agents da
        LEFT JOIN delivery_jobs dj ON dj.agent_id = da.agent_id
          AND dj.status IN ('pending_acceptance', 'accepted', 'in_transit')
        WHERE da.status = 'active'
          AND da.agent_id != ALL($1::int[])
        GROUP BY da.agent_id, da.name, da.phone, da.vehicle_type, da.rating, da.assigned_region
        HAVING COUNT(dj.job_id) FILTER (WHERE dj.status IN ('pending_acceptance', 'accepted', 'in_transit')) < 3
        ORDER BY da.rating DESC, active_jobs ASC
        LIMIT 1
        `,
        [excludedAgentIds.length > 0 ? excludedAgentIds : [0]]
      );
    }

    return agentRes.rowCount > 0 ? agentRes.rows[0] : null;
  } catch (err) {
    console.error("Error finding delivery agent:", err);
    return null;
  }
}

router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      customer_id,
      items,
      delivery_address,
      payment_method,
      urgency_level = 'normal'
    } = req.body;

    if (!customer_id || !items || !delivery_address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await client.query("BEGIN");

    let userRes = await client.query(
      "SELECT region_id FROM customer_account WHERE customer_id = $1",
      [customer_id]
    );

    let userType = 'customer';
    if (userRes.rowCount === 0) {
      userRes = await client.query(
        "SELECT region_id FROM farmer_account WHERE farmer_id = $1",
        [customer_id]
      );
      userType = 'farmer';
    }

    if (userRes.rowCount === 0) {
      throw new Error("User account not found");
    }
    const customerRegionId = userRes.rows[0].region_id || 1;

    let orderTotal = 0;
    for (const item of items) {
      orderTotal += item.price * item.quantity;
    }

    const firstItem = items[0];
    console.log(`[ORDERS] Processing order for badge_id: ${firstItem.badge_id}`);

    let storageRes = await client.query(
      `
      SELECT cs.storage_id, cs.region_id as storage_region_id
      FROM cold_storage_crop_registry csr
      JOIN cold_storage cs ON cs.storage_id = csr.storage_id
      WHERE csr.badge_id = $1
      LIMIT 1
      `,
      [firstItem.badge_id]
    );

    let storageRegionId = null;
    let pickupStorageId = null;

    if (storageRes.rowCount > 0) {
      storageRegionId = storageRes.rows[0].storage_region_id;
      pickupStorageId = storageRes.rows[0].storage_id;
      console.log(`[ORDERS] Found cold storage pickup: Storage #${pickupStorageId}, Region #${storageRegionId}`);
    } else {
      console.log(`[ORDERS] Badge ID ${firstItem.badge_id} not in cold storage. Attempting farmer fallback...`);

      const productRes = await client.query(
        `
        SELECT f.region_id as farmer_region_id, p.farmer_id
        FROM product p
        JOIN farmer_account f ON p.farmer_id = f.farmer_id
        WHERE p.product_id = $1 OR p.product_id::text = $2
        LIMIT 1
        `,
        [parseInt(firstItem.badge_id) || 0, firstItem.badge_id]
      );

      if (productRes.rowCount > 0) {
        storageRegionId = productRes.rows[0].farmer_region_id;
        pickupStorageId = null;
        console.log(`[ORDERS] Found direct farm pickup: Farmer #${productRes.rows[0].farmer_id}, Region #${storageRegionId}`);
      } else {

        console.warn(`[ORDERS] WARNING: No storage or farmer location found for badge_id: ${firstItem.badge_id}. Using default region 1.`);
        storageRegionId = 1;
        pickupStorageId = null;
      }
    }

    const distanceKm = customerRegionId && storageRegionId
      ? calculateDistance(storageRegionId, customerRegionId)
      : 15;

    const deliveryCharge = calculateDeliveryCharge(distanceKm, orderTotal, urgency_level);

    const initialStatus = payment_method === 'online' ? 'payment_pending' : 'pending_agent';

    const orderRes = await client.query(
      `
      INSERT INTO order_request (
        customer_id, receiver, product_type, quantity, address,
        payment_mode, status, time, date,
        order_total, delivery_charge, delivery_address_json, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), CURRENT_DATE, $8, $9, $10, NOW())
      RETURNING order_id
      `,
      [
        customer_id,
        customer_id,
        items[0].crop_type || items[0].product_type || 'Mixed Products',
        items.reduce((sum, item) => sum + item.quantity, 0),
        typeof delivery_address === 'string' ? delivery_address : JSON.stringify(delivery_address),
        payment_method || 'cod',
        initialStatus,
        orderTotal,
        deliveryCharge,
        JSON.stringify(delivery_address)
      ]
    );

    const orderId = orderRes.rows[0].order_id;

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (order_id, badge_id, product_type, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          orderId,
          item.badge_id || null,
          item.crop_type || item.product_type || 'Product',
          item.quantity,
          item.price
        ]
      );
    }

    if (payment_method === 'online') {
      await client.query("COMMIT");
      return res.status(201).json({
        message: "Order created. Please proceed to payment.",
        order_id: orderId,
        status: 'payment_pending'
      });
    }

    const agent = await findBestDeliveryAgent(customerRegionId, []);

    if (!agent) {
      await client.query(
        "UPDATE order_request SET status = 'pending_agent' WHERE order_id = $1",
        [orderId]
      );
      await client.query("COMMIT");
      return res.status(201).json({
        message: "Order created. Waiting for delivery agent availability.",
        order_id: orderId,
        status: 'pending_agent'
      });
    }

    const jobRes = await client.query(
      `
      INSERT INTO delivery_jobs (
        order_id, agent_id, pickup_storage_id, delivery_address,
        delivery_charge, distance_km, urgency_level, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_acceptance', NOW())
      RETURNING job_id
      `,
      [
        orderId,
        agent.agent_id,
        pickupStorageId,
        JSON.stringify(delivery_address),
        deliveryCharge,
        distanceKm,
        urgency_level
      ]
    );

    const jobId = jobRes.rows[0].job_id;

    await client.query(
      "UPDATE order_request SET status = 'agent_assigned' WHERE order_id = $1",
      [orderId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created and delivery agent assigned",
      order_id: orderId,
      job_id: jobId,
      agent_id: agent.agent_id,
      agent_name: agent.name,
      delivery_charge: deliveryCharge,
      distance_km: distanceKm
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", err);
    res.status(500).json({ error: err.message || "Server error" });
  } finally {
    client.release();
  }
});

router.get("/delivery-offers/:agent_id", async (req, res) => {
  try {
    const { agent_id } = req.params;

    const offersRes = await pool.query(
      `
      SELECT
        dj.job_id,
        dj.order_id,
        dj.delivery_charge,
        dj.distance_km,
        dj.urgency_level,
        dj.created_at,
        dj.pickup_storage_id,
        dj.delivery_address,
        or_table.order_total,
        or_table.address as order_address,
        cs.storage_name,
        cs.region_id as storage_region_id,
        (
          SELECT json_agg(
            json_build_object(
              'badge_id', oi.badge_id,
              'crop_type', COALESCE(oi.product_type, pl.crop_type),
              'quantity', oi.quantity,
              'price', oi.price
            )
          )
          FROM order_items oi
          LEFT JOIN product_listing pl ON pl.badge_id = oi.badge_id
          WHERE oi.order_id = dj.order_id
        ) as items
      FROM delivery_jobs dj
      JOIN order_request or_table ON or_table.order_id = dj.order_id
      LEFT JOIN cold_storage cs ON cs.storage_id = dj.pickup_storage_id
      WHERE dj.agent_id = $1
        AND dj.status = 'pending_acceptance'
      ORDER BY dj.created_at DESC
      `,
      [agent_id]
    );

    const offers = offersRes.rows.map(offer => ({
      ...offer,
      delivery_address: typeof offer.delivery_address === 'string'
        ? JSON.parse(offer.delivery_address)
        : offer.delivery_address,
      items: offer.items || []
    }));

    res.json(offers);
  } catch (err) {
    console.error("Error fetching delivery offers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/delivery-offers/:job_id/accept", async (req, res) => {
  const client = await pool.connect();
  try {
    const { job_id } = req.params;
    const { agent_id } = req.body;

    await client.query("BEGIN");

    const jobRes = await client.query(
      `
      SELECT dj.*, or_table.customer_id, or_table.order_id
      FROM delivery_jobs dj
      JOIN order_request or_table ON or_table.order_id = dj.order_id
      WHERE dj.job_id = $1 AND dj.agent_id = $2 AND dj.status = 'pending_acceptance'
      `,
      [job_id, agent_id]
    );

    if (jobRes.rowCount === 0) {
      return res.status(404).json({ error: "Delivery offer not found or already processed" });
    }

    const job = jobRes.rows[0];

    await client.query(
      `
      UPDATE delivery_jobs
      SET status = 'accepted', accepted_at = NOW()
      WHERE job_id = $1
      `,
      [job_id]
    );

    await client.query(
      "UPDATE order_request SET status = 'out_for_delivery' WHERE order_id = $1",
      [job.order_id]
    );

    await client.query(
      `
      INSERT INTO delivery_monitoring (
        consumer_id, agent_id, delivery_location, status, timestamp, delivered_region_id
      )
      VALUES ($1, $2, $3, 'in_transit', NOW(), $4)
      ON CONFLICT DO NOTHING
      `,
      [
        job.customer_id,
        agent_id,
        typeof job.delivery_address === 'string' ? job.delivery_address : JSON.stringify(job.delivery_address),
        null
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Delivery offer accepted successfully",
      job_id: job_id,
      order_id: job.order_id
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error accepting delivery offer:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.post("/delivery-offers/:job_id/reject", async (req, res) => {
  const client = await pool.connect();
  try {
    const { job_id } = req.params;
    const { agent_id } = req.body;

    await client.query("BEGIN");

    const jobRes = await client.query(
      `
      SELECT dj.*, or_table.customer_id, or_table.order_id, ca.region_id as customer_region_id
      FROM delivery_jobs dj
      JOIN order_request or_table ON or_table.order_id = dj.order_id
      JOIN customer_account ca ON ca.customer_id = or_table.customer_id
      WHERE dj.job_id = $1 AND dj.agent_id = $2
      `,
      [job_id, agent_id]
    );

    if (jobRes.rowCount === 0) {
      return res.status(404).json({ error: "Delivery offer not found" });
    }

    const job = jobRes.rows[0];

    await client.query(
      `
      UPDATE delivery_jobs
      SET status = 'rejected', rejected_at = NOW()
      WHERE job_id = $1
      `,
      [job_id]
    );

    const excludedAgents = [agent_id];
    const nextAgent = await findBestDeliveryAgent(
      job.customer_region_id,
      excludedAgents
    );

    if (nextAgent) {
      await client.query(
        `
        INSERT INTO delivery_jobs (
          order_id, agent_id, pickup_storage_id, delivery_address,
          delivery_charge, distance_km, urgency_level, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_acceptance', NOW())
        `,
        [
          job.order_id,
          nextAgent.agent_id,
          job.pickup_storage_id,
          job.delivery_address,
          job.delivery_charge,
          job.distance_km,
          job.urgency_level
        ]
      );
    } else {
      await client.query(
        "UPDATE order_request SET status = 'pending_agent' WHERE order_id = $1",
        [job.order_id]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Delivery offer rejected. Next agent will be notified.",
      reassigned: !!nextAgent
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error rejecting delivery offer:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.get("/agent/:agent_id/active", async (req, res) => {
  try {
    const { agent_id } = req.params;

    const deliveriesRes = await pool.query(
      `
      SELECT
        dj.job_id,
        dj.order_id,
        dj.delivery_charge,
        dj.distance_km,
        dj.status,
        dj.accepted_at,
        dj.pickup_storage_id,
        dj.delivery_address,
        or_table.order_total,
        or_table.created_at as order_date,
        cs.storage_name,
        cs.region_id as storage_region_id
      FROM delivery_jobs dj
      JOIN order_request or_table ON or_table.order_id = dj.order_id
      LEFT JOIN cold_storage cs ON cs.storage_id = dj.pickup_storage_id
      WHERE dj.agent_id = $1
        AND dj.status IN ('accepted', 'in_transit')
      ORDER BY dj.accepted_at DESC
      `,
      [agent_id]
    );

    const deliveries = deliveriesRes.rows.map(delivery => ({
      ...delivery,
      delivery_address: typeof delivery.delivery_address === 'string'
        ? JSON.parse(delivery.delivery_address)
        : delivery.delivery_address
    }));

    res.json(deliveries);
  } catch (err) {
    console.error("Error fetching active deliveries:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = `
      SELECT o.*, ca.customer_name
      FROM order_request o
      LEFT JOIN customer_account ca ON o.customer_id = ca.customer_id
    `;
    const params = [];

    if (status && status !== 'all') {
      query += " WHERE o.status = $1";
      params.push(status);
    }

    query += " ORDER BY o.created_at DESC";

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Order list error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query("UPDATE order_request SET status = $1, updated_at = NOW() WHERE order_id = $2", [status, id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/assign-agent", async (req, res) => {
  try {
    const { order_id, agent_id } = req.body;

    const existing = await pool.query("SELECT job_id FROM delivery_jobs WHERE order_id = $1", [order_id]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: "Order already assigned to an agent" });
    }

    const order = await pool.query("SELECT delivery_address_json, delivery_charge FROM order_request WHERE order_id = $1", [order_id]);
    if (order.rowCount === 0) return res.status(404).json({ error: "Order not found" });

    await pool.query(
      `INSERT INTO delivery_jobs (order_id, agent_id, delivery_address, delivery_charge, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending_acceptance', NOW())`,
      [order_id, agent_id, order.rows[0].delivery_address_json, order.rows[0].delivery_charge || 50]
    );

    await pool.query("UPDATE order_request SET status = 'agent_assigned' WHERE order_id = $1", [order_id]);

    res.json({ message: "Agent assigned successfully" });
  } catch (err) {
    console.error("Assign agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await pool.query(
      `SELECT * FROM order_request WHERE customer_id = $1 ORDER BY created_at DESC`,
      [customerId]
    );

    const orders = result.rows;
    for (let order of orders) {
      const itemsRes = await pool.query(
        "SELECT * FROM order_items WHERE order_id = $1",
        [order.order_id]
      );
      order.items = itemsRes.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/agent/:agentId/active", async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await pool.query(
      `SELECT dj.*, or_table.status as order_status, cs.storage_name
       FROM delivery_jobs dj
       JOIN order_request or_table ON or_table.order_id = dj.order_id
       LEFT JOIN cold_storage cs ON cs.storage_id = dj.pickup_storage_id
       WHERE dj.agent_id = $1 AND dj.status IN ('accepted', 'in_transit', 'reached_destination')
       ORDER BY dj.created_at DESC`,
      [agentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching agent active jobs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
