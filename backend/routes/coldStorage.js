// backend/routes/coldStorage.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/dashboard", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    const unitsResult = await pool.query(
      "SELECT storage_id, storage_name, capacity_kg, current_kg, current_load_kg, temperature_c, humidity_percent, status FROM cold_storage WHERE supervised_by = $1",
      [specialistId]
    );
    const units = unitsResult.rows;
    const storageIds = units.map(u => u.storage_id);

    let totalCrops = 0;
    let activeCrops = 0;
    let cropEntries = [];

    if (storageIds.length > 0) {

      const cropResult = await pool.query(
        `SELECT cscr.*, fa.farm_name as farmer_name, cs.storage_name
         FROM cold_storage_crop_registry cscr
         LEFT JOIN farmer_account fa ON cscr.farmer_id = fa.farmer_id
         LEFT JOIN cold_storage cs ON cscr.storage_id = cs.storage_id
         WHERE cscr.storage_id = ANY($1)
         ORDER BY cscr.entry_time DESC`,
        [storageIds]
      );
      cropEntries = cropResult.rows;
      totalCrops = cropEntries.length;
      activeCrops = cropEntries.filter(c => c.status === 'stored').length;
    }

    const totalCapacity = units.reduce((sum, u) => sum + (parseInt(u.capacity_kg) || 0), 0);
    const totalCurrentLoad = units.reduce((sum, u) => sum + (parseInt(u.current_load_kg) || parseInt(u.current_kg) || 0), 0);
    const utilizationPercent = totalCapacity > 0 ? Math.round((totalCurrentLoad / totalCapacity) * 100) : 0;
    const avgTemp = units.length > 0 ? (units.reduce((sum, u) => sum + (parseFloat(u.temperature_c) || 0), 0) / units.length).toFixed(1) : 0;
    const avgHumidity = units.length > 0 ? (units.reduce((sum, u) => sum + (parseFloat(u.humidity_percent) || 0), 0) / units.length).toFixed(1) : 0;

    const latestReport = await pool.query(
      `SELECT * FROM cold_storage_report WHERE specialist_id = $1 ORDER BY report_date DESC, created_at DESC LIMIT 1`,
      [specialistId]
    );

    const todayReports = await pool.query(
      `SELECT COUNT(*) FROM cold_storage_report WHERE specialist_id = $1 AND report_date = CURRENT_DATE`,
      [specialistId]
    );

    let qualityScore = 100;
    for (const u of units) {
      const temp = parseFloat(u.temperature_c) || 0;
      const humid = parseFloat(u.humidity_percent) || 0;
      if (temp < 0 || temp > 8) qualityScore -= 5;
      if (humid < 75 || humid > 95) qualityScore -= 5;
    }
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    res.json({
      totalStorageUnits: units.length,
      activeStorageUnits: units.filter(u => u.status === 'active').length,
      totalCapacity,
      totalCurrentLoad,
      utilizationPercent,
      avgTemperature: avgTemp,
      avgHumidity,
      totalCrops,
      activeCrops,
      qualityScore,
      recentCrops: cropEntries.slice(0, 8),
      todayReportsCount: parseInt(todayReports.rows[0].count),
      latestReport: latestReport.rows[0] || null
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/units", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    const result = await pool.query(
      `SELECT cs.*, r.region_name
       FROM cold_storage cs
       LEFT JOIN region r ON cs.region_id = r.region_id
       WHERE cs.supervised_by = $1
       ORDER BY cs.storage_id`,
      [specialistId]
    );

    for (const unit of result.rows) {
      const cropCount = await pool.query(
        "SELECT COUNT(*) as total, COUNT(CASE WHEN status='stored' THEN 1 END) as active FROM cold_storage_crop_registry WHERE storage_id = $1",
        [unit.storage_id]
      );
      unit.total_crops = parseInt(cropCount.rows[0].total);
      unit.active_crops = parseInt(cropCount.rows[0].active);
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Units error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/units/:id", async (req, res) => {
  try {
    const storageId = req.params.id;
    const { temperature_c, humidity_percent, status } = req.body;

    const result = await pool.query(
      `UPDATE cold_storage
       SET temperature_c = COALESCE($1, temperature_c),
           humidity_percent = COALESCE($2, humidity_percent),
           status = COALESCE($3, status),
           last_updated = NOW()
       WHERE storage_id = $4
       RETURNING *`,
      [temperature_c, humidity_percent, status, storageId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Storage unit not found" });
    res.json({ message: "Storage unit updated", unit: result.rows[0] });
  } catch (error) {
    console.error("Update unit error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/crops", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    const result = await pool.query(
      `SELECT cscr.*, fa.farm_name as farmer_name, fa.phone_no as farmer_phone,
              cs.storage_name, cs.temperature_c as storage_temp, cs.humidity_percent as storage_humidity,
              cs.storage_id, cs.storage_name
       FROM cold_storage_crop_registry cscr
       JOIN cold_storage cs ON cscr.storage_id = cs.storage_id
       LEFT JOIN farmer_account fa ON cscr.farmer_id = fa.farmer_id
       WHERE cs.supervised_by = $1 OR cscr.specialist_id = $1
       ORDER BY
        CASE WHEN cscr.status = 'pending_storage' THEN 0 ELSE 1 END,
        cscr.entry_time DESC`,
      [specialistId]
    );

    let crops = result.rows;
    let needsRefresh = false;

    for (let i = 0; i < crops.length; i++) {
      if (crops[i].badge_id === null) {
        console.log(`[AUTO-FIX] Attempting to fix NULL badge_id for record: Farmer ${crops[i].farmer_id}, Crop ${crops[i].crop_type}`);

        const productRes = await pool.query(
          `SELECT product_id FROM product
           WHERE farmer_id = $1 AND product_name = $2 AND status = 'confirmed'
           ORDER BY ABS(EXTRACT(EPOCH FROM (updated_at - $3))) ASC
           LIMIT 1`,
          [crops[i].farmer_id, crops[i].crop_type, crops[i].entry_time]
        );

        if (productRes.rowCount > 0) {
          const productId = productRes.rows[0].product_id;
          await pool.query(
            "UPDATE cold_storage_crop_registry SET badge_id = $1 WHERE farmer_id = $2 AND crop_type = $3 AND entry_time = $4",
            [productId, crops[i].farmer_id, crops[i].crop_type, crops[i].entry_time]
          );
          crops[i].badge_id = productId;
          console.log(`[AUTO-FIX] Successfully updated badge_id to ${productId}`);
          needsRefresh = true;
        }
      }
    }

    res.json(crops);
  } catch (error) {
    console.error("Crops error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/crops/:badge_id/confirm", async (req, res) => {
  const client = await pool.connect();
  try {
    let badgeId = req.params.badge_id;

    if (badgeId === '_' || badgeId === 'null' || badgeId === 'undefined' || badgeId === '') {
      badgeId = null;
    }

    const { new_badge_id, farmer_id, entry_time, crop_type, temperature, humidity, shelf_life } = req.body;

    await client.query("BEGIN");

    const updateRes = await client.query(
      `UPDATE cold_storage_crop_registry
       SET status = 'stored',
           badge_id = COALESCE($1, badge_id),
           require_temperature = $2,
           require_humidity = $3,
           shelf_life_days = $4,
           last_updated = NOW()
       WHERE (badge_id = $5::integer AND $5 IS NOT NULL)
          OR (badge_id IS NULL AND $5 IS NULL AND farmer_id = $6 AND crop_type = $7 AND ABS(EXTRACT(EPOCH FROM (entry_time - $8::timestamp))) < 1)
       RETURNING *`,
      [new_badge_id, temperature, humidity, shelf_life, badgeId, farmer_id, crop_type, entry_time]
    );

    if (updateRes.rows.length === 0) {

      throw new Error("Crop entry not found. Please refresh and try again.");
    }

    const crop = updateRes.rows[0];

    await client.query(
      "UPDATE cold_storage SET current_load_kg = current_load_kg + 100, last_updated = NOW() WHERE storage_id = $1",
      [crop.storage_id]
    );

    await client.query("COMMIT");
    res.json({ message: "Crop successfully registered into cold storage", entry: crop });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Confirm storage error:", error);
    if (error.code === '23503') {
      return res.status(400).json({ error: "Invalid Badge ID: This ID does not exist in product listings." });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.put("/crops/:badge_id", async (req, res) => {
  try {
    const badgeId = req.params.badge_id;
    const { status, transport_time } = req.body;

    const result = await pool.query(
      `UPDATE cold_storage_crop_registry
       SET status = COALESCE($1, status),
           transport_time = COALESCE($2, transport_time),
           last_updated = NOW()
       WHERE badge_id = $3
       RETURNING *`,
      [status, transport_time, badgeId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Crop entry not found" });
    res.json({ message: "Crop entry updated", entry: result.rows[0] });
  } catch (error) {
    console.error("Update crop error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/crops", async (req, res) => {
  try {
    const { badge_id, farmer_id, crop_type, require_temperature, require_humidity, shelf_life_days, storage_id } = req.body;

    if (!badge_id || !farmer_id || !crop_type || !storage_id) {
      return res.status(400).json({ error: "badge_id, farmer_id, crop_type, and storage_id are required" });
    }

    const badgeCheck = await pool.query("SELECT badge_id FROM product_listing WHERE badge_id = $1", [badge_id]);
    if (badgeCheck.rows.length === 0) {
      return res.status(400).json({ error: `Badge ID ${badge_id} does not exist in product listings.` });
    }

    const farmerCheck = await pool.query("SELECT farmer_id FROM farmer_account WHERE farmer_id = $1", [farmer_id]);
    if (farmerCheck.rows.length === 0) {
      return res.status(400).json({ error: `Farmer ID ${farmer_id} does not exist.` });
    }

    const result = await pool.query(
      `INSERT INTO cold_storage_crop_registry (badge_id, farmer_id, crop_type, entry_time, require_temperature, require_humidity, shelf_life_days, status, last_updated, storage_id)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6, 'stored', NOW(), $7)
       RETURNING *`,
      [badge_id, farmer_id, crop_type, require_temperature, require_humidity, shelf_life_days, storage_id]
    );

    await pool.query(
      "UPDATE cold_storage SET current_load_kg = current_load_kg + 100, last_updated = NOW() WHERE storage_id = $1",
      [storage_id]
    );

    res.status(201).json({ message: "Crop entry added", entry: result.rows[0] });
  } catch (error) {
    console.error("Add crop error:", error);
    if (error.code === '23503') {
      return res.status(400).json({ error: "Foreign key violation: The provided Badge ID or Farmer ID is invalid." });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get("/available-badges", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pl.badge_id, pl.crop_type, pl.farmer_id, fa.farm_name
       FROM product_listing pl
       JOIN farmer_account fa ON pl.farmer_id = fa.farmer_id
       WHERE pl.status = 'active'
       AND pl.badge_id NOT IN (SELECT badge_id FROM cold_storage_crop_registry WHERE status = 'stored')
       ORDER BY pl.badge_id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Available badges error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/quality", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    const unitsResult = await pool.query(
      "SELECT storage_id, storage_name, temperature_c, humidity_percent, status, capacity_kg, current_load_kg FROM cold_storage WHERE supervised_by = $1",
      [specialistId]
    );

    const qualityData = unitsResult.rows.map(unit => {
      const temp = parseFloat(unit.temperature_c) || 0;
      const humid = parseFloat(unit.humidity_percent) || 0;
      const load = parseInt(unit.current_load_kg) || parseInt(unit.capacity_kg) || 0;
      const capacity = parseInt(unit.capacity_kg) || 1;
      const loadPercent = Math.round((load / capacity) * 100);

      let tempStatus = 'optimal';
      if (temp < 0 || temp > 8) tempStatus = 'critical';
      else if (temp < 1 || temp > 6) tempStatus = 'warning';

      let humidStatus = 'optimal';
      if (humid < 70 || humid > 95) humidStatus = 'critical';
      else if (humid < 75 || humid > 92) humidStatus = 'warning';

      let loadStatus = 'optimal';
      if (loadPercent > 95) loadStatus = 'critical';
      else if (loadPercent > 80) loadStatus = 'warning';

      return {
        ...unit,
        temperature_c: temp,
        humidity_percent: humid,
        load_percent: loadPercent,
        temp_status: tempStatus,
        humid_status: humidStatus,
        load_status: loadStatus
      };
    });

    const storageIds = unitsResult.rows.map(u => u.storage_id);
    let atRiskCrops = [];
    if (storageIds.length > 0) {
      const atRiskResult = await pool.query(
        `SELECT cscr.*, cs.storage_name,
                EXTRACT(DAY FROM (NOW() - cscr.entry_time)) as days_stored,
                CASE WHEN cscr.shelf_life_days > 0 THEN
                  ROUND(((EXTRACT(DAY FROM (NOW() - cscr.entry_time))::numeric / cscr.shelf_life_days) * 100), 1)
                ELSE 0 END as shelf_life_used_percent
         FROM cold_storage_crop_registry cscr
         JOIN cold_storage cs ON cscr.storage_id = cs.storage_id
         WHERE cscr.storage_id = ANY($1) AND cscr.status = 'stored'
         ORDER BY shelf_life_used_percent DESC`,
        [storageIds]
      );
      atRiskCrops = atRiskResult.rows;
    }

    res.json({ units: qualityData, atRiskCrops });
  } catch (error) {
    console.error("Quality error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    const reportType = req.query.type;
    const fromDate = req.query.from_date;
    const toDate = req.query.to_date;

    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    let query = `
      SELECT csr.*, cs.storage_name
      FROM cold_storage_report csr
      JOIN cold_storage cs ON csr.storage_id = cs.storage_id
      WHERE csr.specialist_id = $1
    `;
    const params = [specialistId];
    let paramIndex = 2;

    if (reportType) {
      query += ` AND csr.report_type = $${paramIndex}`;
      params.push(reportType);
      paramIndex++;
    }
    if (fromDate) {
      query += ` AND csr.report_date >= $${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }
    if (toDate) {
      query += ` AND csr.report_date <= $${paramIndex}`;
      params.push(toDate);
      paramIndex++;
    }

    query += " ORDER BY csr.report_date DESC, csr.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const {
      storage_id, specialist_id, report_type, report_date,
      total_crops, total_weight_kg, avg_temperature, avg_humidity,
      spoiled_count, energy_kwh
    } = req.body;

    if (!storage_id || !specialist_id || !report_type || !report_date) {
      return res.status(400).json({ error: "storage_id, specialist_id, report_type, and report_date are required" });
    }

    const result = await pool.query(
      `INSERT INTO cold_storage_report
       (storage_id, specialist_id, report_type, report_date, total_crops, total_weight_kg, avg_temperature, avg_humidity, spoiled_count, energy_kwh, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'submitted')
       RETURNING *`,
      [storage_id, specialist_id, report_type, report_date, total_crops || 0, total_weight_kg || 0,
       avg_temperature, avg_humidity, spoiled_count || 0,
       energy_kwh || 0]
    );

    res.status(201).json({ message: "Report submitted successfully", report: result.rows[0] });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    const result = await pool.query(
      "SELECT specialist_id, fullname, email, phone, qualification, experience_year, assigned_region, last_login, storage_location_id, status FROM agri_specialist WHERE specialist_id = $1",
      [specialistId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Specialist not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    const { fullname, email, phone, qualification, password } = req.body;

    let query = `UPDATE agri_specialist SET `;
    const params = [];
    const sets = [];
    let paramIndex = 1;

    if (fullname) { sets.push(`fullname = $${paramIndex}`); params.push(fullname); paramIndex++; }
    if (email) { sets.push(`email = $${paramIndex}`); params.push(email); paramIndex++; }
    if (phone) { sets.push(`phone = $${paramIndex}`); params.push(phone); paramIndex++; }
    if (qualification) { sets.push(`qualification = $${paramIndex}`); params.push(qualification); paramIndex++; }

    if (password) {
      const bcrypt = require("bcryptjs");
      const hash = await bcrypt.hash(password, 10);
      sets.push(`password_hash = $${paramIndex}`);
      params.push(hash);
      paramIndex++;
    }

    if (sets.length === 0) return res.status(400).json({ error: "No fields to update" });

    query += sets.join(", ") + ` WHERE specialist_id = $${paramIndex} RETURNING specialist_id, fullname, email, phone, qualification, experience_year, assigned_region, status`;
    params.push(specialistId);

    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: "Specialist not found" });

    res.json({ message: "Profile updated successfully", profile: result.rows[0] });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/areas", async (req, res) => {
  try {
    const specialistId = req.query.specialist_id;
    if (!specialistId) return res.status(400).json({ error: "specialist_id required" });

    const result = await pool.query(
      `SELECT cs.*, r.region_name,
              (SELECT COUNT(*) FROM cold_storage_crop_registry WHERE storage_id = cs.storage_id AND status = 'stored') as active_crops,
              (SELECT COUNT(*) FROM cold_storage_crop_registry WHERE storage_id = cs.storage_id) as total_crops
       FROM cold_storage cs
       LEFT JOIN region r ON cs.region_id = r.region_id
       WHERE cs.supervised_by = $1
       ORDER BY cs.storage_id`,
      [specialistId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Areas error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
