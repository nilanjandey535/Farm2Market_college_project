// backend/routes/payment.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const pool = require("../db");
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { order_id, amount } = req.body;

    if (!order_id || !amount) {
      return res.status(400).json({ error: "Order ID and amount are required" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_order_${order_id}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    await pool.query(
      "UPDATE order_request SET razorpay_order_id = $1 WHERE order_id = $2",
      [rzpOrder.id, order_id]
    );

    res.json({
      id: rzpOrder.id,
      currency: rzpOrder.currency,
      amount: rzpOrder.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/verify", async (req, res) => {
  let client;
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      console.error("[PAYMENT-RECORD] Missing required fields in body:", req.body);
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    console.log(`[PAYMENT-RECORD] Recording payment details for Order #${order_id}`);

    client = await pool.connect();
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.transaction_payment (
        transaction_id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES public.order_request(order_id) ON DELETE CASCADE,
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        razorpay_signature VARCHAR(255),
        amount NUMERIC(10,2),
        status VARCHAR(20) DEFAULT 'pending', -- confirmed, pending, failed
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const updateOrderRes = await client.query(
      `UPDATE order_request
       SET status = 'pending',
           payment_mode = 'online',
           razorpay_order_id = $1,
           razorpay_payment_id = $2,
           razorpay_signature = $3,
           updated_at = NOW()
       WHERE order_id = $4
       RETURNING order_total, customer_id`,
      [razorpay_order_id, razorpay_payment_id, razorpay_signature, parseInt(order_id)]
    );

    if (updateOrderRes.rowCount === 0) {
      throw new Error(`Order #${order_id} not found`);
    }

    const { order_total, customer_id } = updateOrderRes.rows[0];

    const checkRes = await client.query(
      "SELECT transaction_id FROM transaction_payment WHERE razorpay_payment_id = $1",
      [razorpay_payment_id]
    );

    if (checkRes.rowCount === 0) {
      await client.query(
        `INSERT INTO transaction_payment (order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', NOW())`,
        [parseInt(order_id), razorpay_order_id, razorpay_payment_id, razorpay_signature, order_total]
      );
    }

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Payment details recorded. Waiting for manual Admin verification."
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("[PAYMENT-RECORD] Error:", error);
    res.status(500).json({ error: "Failed to record payment details" });
  } finally {
    if (client) client.release();
  }
});

router.post("/cod-complete", async (req, res) => {
  try {
    const { order_id } = req.body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE order_request
         SET status = 'completed',
             payment_mode = 'cash',
             updated_at = NOW()
         WHERE order_id = $1`,
        [order_id]
      );

      const orderInfo = await client.query(
        "SELECT order_total, customer_id FROM order_request WHERE order_id = $1",
        [order_id]
      );

      const { order_total, customer_id } = orderInfo.rows[0];

      await client.query(
        `INSERT INTO payment (time, date, sender_account, receiver_account, payment_mode, amount)
         VALUES (NOW(), CURRENT_DATE, $1, 'FARM2MARKET_CASH', 'cash', $2)`,
        [customer_id, order_total]
      );

      const jobInfo = await client.query(
        "UPDATE delivery_jobs SET status = 'completed', completed_at = NOW() WHERE order_id = $1 RETURNING agent_id, delivery_charge",
        [order_id]
      );

      if (jobInfo.rowCount > 0) {
        const { agent_id, delivery_charge } = jobInfo.rows[0];

        await client.query(
          "INSERT INTO transport_payment (agent_id, amount, status, date_time) VALUES ($1, $2, 'pending', NOW())",
          [agent_id, delivery_charge]
        );
      }

      await client.query("COMMIT");
      res.json({ message: "COD order completed successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error completing COD order:", error);
    res.status(500).json({ error: "Failed to complete COD order" });
  }
});

router.get("/requests", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tp.*, or_table.customer_id, or_table.receiver, or_table.product_type, or_table.quantity, or_table.address,
             COALESCE(ca.customer_name, fa.farm_name) as customer_name
      FROM transaction_payment tp
      JOIN order_request or_table ON tp.order_id = or_table.order_id
      LEFT JOIN customer_account ca ON or_table.customer_id = ca.customer_id
      LEFT JOIN farmer_account fa ON or_table.customer_id = fa.farmer_id
      ORDER BY tp.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching payment requests:", error);
    res.status(500).json({ error: "Failed to fetch payment requests" });
  }
});

router.patch("/requests/:transaction_id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { transaction_id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'pending', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await client.query("BEGIN");

    const transData = await client.query(
      "SELECT * FROM transaction_payment WHERE transaction_id = $1",
      [transaction_id]
    );

    if (transData.rowCount === 0) throw new Error("Transaction not found");
    const trans = transData.rows[0];

    if (status === 'confirmed') {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const sign = String(trans.razorpay_order_id) + "|" + String(trans.razorpay_payment_id);
      const expectedSign = crypto
        .createHmac("sha256", secret)
        .update(sign)
        .digest("hex");

      if (trans.razorpay_signature !== expectedSign) {
        throw new Error("SECURITY ALERT: Razorpay signature verification failed. This payment might be fraudulent.");
      }
      console.log(`[ADMIN-VERIFY] Signature verified for Order #${trans.order_id}`);
    }

    await client.query(
      "UPDATE transaction_payment SET status = $1, updated_at = NOW() WHERE transaction_id = $2",
      [status, transaction_id]
    );

    let orderStatus = status === 'confirmed' ? 'pending_agent' :
                     status === 'failed' ? 'payment_failed' : 'payment_pending_verification';

    await client.query(
      "UPDATE order_request SET status = $1, updated_at = NOW() WHERE order_id = $2",
      [orderStatus, trans.order_id]
    );

    if (status === 'confirmed') {
      const orderInfo = await client.query("SELECT customer_id FROM order_request WHERE order_id = $1", [trans.order_id]);
      await client.query(
        `INSERT INTO payment (time, date, sender_account, receiver_account, payment_mode, amount)
         VALUES (NOW(), CURRENT_DATE, $1, 'FARM2MARKET_MAIN', 'online', $2)`,
        [String(orderInfo.rows[0].customer_id), trans.amount]
      );
    }

    await client.query("COMMIT");
    res.json({ message: `Payment request verified and updated to ${status}` });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating payment request:", error);
    res.status(500).json({ error: error.message || "Failed to update payment request" });
  } finally {
    client.release();
  }
});

module.exports = router;
