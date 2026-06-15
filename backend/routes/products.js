// backend/routes/products.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

router.get("/confirmed", async (req, res) => {
  console.log("[PRODUCTS-ROUTE] Fetching all confirmed products...");
  try {
    const query = `
      SELECT p.*,
             COALESCE(fa.farm_name, ca.customer_name) as owner_name,
             CASE WHEN p.farmer_id IS NOT NULL THEN 'farmer' ELSE 'customer' END as owner_type
      FROM product p
      LEFT JOIN farmer_account fa ON p.farmer_id = fa.farmer_id
      LEFT JOIN customer_account ca ON p.customer_id = ca.customer_id
      WHERE p.status = 'confirmed'
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query);
    console.log(`[PRODUCTS-ROUTE] Found ${result.rowCount} confirmed products`);

    const productsWithImages = await Promise.all(result.rows.map(async (product) => {
      try {
        const imagesRes = await pool.query("SELECT image_url FROM product_image WHERE product_id = $1", [product.product_id]);
        return {
          ...product,
          images: imagesRes.rows.map(img => img.image_url)
        };
      } catch (err) {
        console.error(`[PRODUCTS-ROUTE] Error fetching images for product ${product.product_id}:`, err);
        return { ...product, images: [] };
      }
    }));

    res.json(productsWithImages);
  } catch (err) {
    console.error("[PRODUCTS-ROUTE] Error fetching confirmed products:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      user_id,
      user_role,
      product_name,
      category,
      price_per_kg,
      stock_quantity_kg,
      product_description,
      images
    } = req.body;

    await client.query("BEGIN");

    let farmer_id = null;
    let customer_id = null;

    if (user_role === 'farmer') {
      farmer_id = user_id;
    } else if (user_role === 'customer') {
      customer_id = user_id;
    } else {
      throw new Error("Invalid user role");
    }

    const productRes = await client.query(
      `INSERT INTO product (
        farmer_id, customer_id, product_name, category,
        price_per_kg, stock_quantity_kg, product_description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING product_id`,
      [farmer_id, customer_id, product_name, category, price_per_kg, stock_quantity_kg, product_description]
    );

    const productId = productRes.rows[0].product_id;

    if (images && Array.isArray(images)) {
      for (const imageUrl of images) {
        await client.query(
          `INSERT INTO product_image (product_id, image_url) VALUES ($1, $2)`,
          [productId, imageUrl]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Product added successfully and is pending approval",
      product_id: productId
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating product:", err);
    res.status(500).json({ error: err.message || "Server error" });
  } finally {
    client.release();
  }
});

router.get("/my-products", async (req, res) => {
  try {
    const { user_id, user_role } = req.query;
    let query = "";
    let params = [user_id];

    if (user_role === 'farmer') {
      query = "SELECT * FROM product WHERE farmer_id = $1 ORDER BY created_at DESC";
    } else if (user_role === 'customer') {
      query = "SELECT * FROM product WHERE customer_id = $1 ORDER BY created_at DESC";
    } else {
      return res.status(400).json({ error: "Invalid user role" });
    }

    const result = await pool.query(query, params);

    const productsWithImages = await Promise.all(result.rows.map(async (product) => {
      const imagesRes = await pool.query("SELECT image_url FROM product_image WHERE product_id = $1", [product.product_id]);
      return {
        ...product,
        images: imagesRes.rows.map(img => img.image_url)
      };
    }));

    res.json(productsWithImages);
  } catch (err) {
    console.error("Error fetching my products:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT p.*,
             COALESCE(fa.farm_name, ca.customer_name) as owner_name,
             COALESCE(fa.address, ca.address) as owner_location,
             CASE WHEN p.farmer_id IS NOT NULL THEN 'Farmer' ELSE 'Customer' END as owner_type
      FROM product p
      LEFT JOIN farmer_account fa ON p.farmer_id = fa.farmer_id
      LEFT JOIN customer_account ca ON p.customer_id = ca.customer_id
      WHERE p.product_id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = result.rows[0];
    const imagesRes = await pool.query("SELECT image_url FROM product_image WHERE product_id = $1", [id]);
    product.images = imagesRes.rows.map(img => img.image_url);

    res.json(product);
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
