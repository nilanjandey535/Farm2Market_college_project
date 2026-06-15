// Setup script for cold storage reports table

const pool = require("./db");

async function setup() {
  try {
    console.log("Creating cold_storage_reports table...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cold_storage_reports (
        report_id SERIAL PRIMARY KEY,
        storage_id INTEGER NOT NULL REFERENCES cold_storage(storage_id),
        specialist_id INTEGER NOT NULL REFERENCES agri_specialist(specialist_id),
        report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'monthly')),
        report_date DATE NOT NULL,
        total_crops INTEGER DEFAULT 0,
        total_weight_kg NUMERIC(12,2) DEFAULT 0,
        avg_temperature_c NUMERIC(5,2),
        avg_humidity_percent NUMERIC(5,2),
        crops_spoiled INTEGER DEFAULT 0,
        crops_added INTEGER DEFAULT 0,
        crops_removed INTEGER DEFAULT 0,
        energy_consumption_kwh NUMERIC(10,2) DEFAULT 0,
        maintenance_issues TEXT,
        recommendations TEXT,
        status VARCHAR(20) DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ cold_storage_reports table created");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_csr_storage_id ON cold_storage_reports(storage_id);
      CREATE INDEX IF NOT EXISTS idx_csr_specialist_id ON cold_storage_reports(specialist_id);
      CREATE INDEX IF NOT EXISTS idx_csr_report_date ON cold_storage_reports(report_date);
      CREATE INDEX IF NOT EXISTS idx_csr_report_type ON cold_storage_reports(report_type);
    `);
    console.log("✅ Indexes created");

    const csResult = await pool.query("SELECT COUNT(*) FROM cold_storage");
    if (parseInt(csResult.rows[0].count) === 0) {
      console.log("Seeding sample cold storage units...");

      const specResult = await pool.query("SELECT specialist_id FROM agri_specialist LIMIT 1");
      let specialistId;
      if (specResult.rows.length === 0) {
        console.log("No agri specialist found. Creating a sample one...");
        const bcrypt = require("bcryptjs");
        const hash = await bcrypt.hash("test1234", 10);
        const insResult = await pool.query(`
          INSERT INTO agri_specialist (fullname, email, password_hash, phone, qualification, experience_year, assigned_region, status)
          VALUES ('Dr. Anjali Sharma', 'anjali@farm2market.com', $1, '9876543210', 'PhD Agricultural Science', 12, 'North Region', 'active')
          RETURNING specialist_id
        `, [hash]);
        specialistId = insResult.rows[0].specialist_id;
      } else {
        specialistId = specResult.rows[0].specialist_id;
      }

      const regResult = await pool.query("SELECT region_id FROM region LIMIT 3");
      let regionIds = regResult.rows.map(r => r.region_id);

      await pool.query(`
        INSERT INTO cold_storage (storage_name, capacity_kg, current_kg, current_load_kg, temperature_c, humidity_percent, status, last_updated, supervised_by, region_id)
        VALUES
          ('Cold Storage Unit A', 5000, 3200, 3200, 4.2, 85.5, 'active', NOW(), $1, $2),
          ('Cold Storage Unit B', 3000, 1800, 1800, 2.8, 90.0, 'active', NOW(), $1, $3),
          ('Cold Storage Unit C', 8000, 6500, 6500, 5.1, 82.3, 'active', NOW(), $1, $4)
      `, [specialistId, regionIds[0] || null, regionIds[1] || regionIds[0] || null, regionIds[2] || regionIds[0] || null]);
      console.log("✅ Sample cold storage units created");

      const csUnits = await pool.query("SELECT storage_id FROM cold_storage WHERE supervised_by = $1", [specialistId]);
      if (csUnits.rows.length > 0) {

        const farmerResult = await pool.query("SELECT farmer_id FROM farmer_account LIMIT 2");
        let farmerIds = farmerResult.rows.map(f => f.farmer_id);

        const badgeResult = await pool.query("SELECT badge_id FROM product_listing LIMIT 3");
        let badgeIds = badgeResult.rows.map(b => b.badge_id);

        if (farmerIds.length > 0 && badgeIds.length > 0) {
          await pool.query(`
            INSERT INTO cold_storage_crop_registry (badge_id, farmer_id, crop_type, entry_time, require_temperature, require_humidity, shelf_life_days, status, last_updated, storage_id)
            VALUES
              ($1, $2, 'Tomato', NOW() - INTERVAL '2 days', 4.0, 90.0, 14, 'stored', NOW(), $3),
              ($4, $5, 'Potato', NOW() - INTERVAL '5 days', 3.5, 85.0, 90, 'stored', NOW(), $3),
              ($6, $2, 'Onion', NOW() - INTERVAL '1 day', 2.0, 80.0, 60, 'stored', NOW(), $7)
          `, [
            badgeIds[0], farmerIds[0], csUnits.rows[0].storage_id,
            badgeIds[1] || badgeIds[0], farmerIds[1] || farmerIds[0], csUnits.rows[0].storage_id,
            badgeIds[2] || badgeIds[0], csUnits.rows[1] ? csUnits.rows[1].storage_id : csUnits.rows[0].storage_id
          ]);
          console.log("✅ Sample crop registry entries created");
        } else {
          console.log("⚠️ No farmers or product listings found, skipping crop registry seed");
        }
      }
    } else {
      console.log("Cold storage units already exist, skipping seed");
    }

    const reportCheck = await pool.query("SELECT COUNT(*) FROM cold_storage_reports");
    if (parseInt(reportCheck.rows[0].count) === 0) {
      const specResult = await pool.query("SELECT specialist_id FROM agri_specialist LIMIT 1");
      const csResult = await pool.query("SELECT storage_id FROM cold_storage LIMIT 3");

      if (specResult.rows.length > 0 && csResult.rows.length > 0) {
        const specialistId = specResult.rows[0].specialist_id;

        for (const unit of csResult.rows) {
          for (let i = 0; i < 7; i++) {
            await pool.query(`
              INSERT INTO cold_storage_reports (storage_id, specialist_id, report_type, report_date, total_crops, total_weight_kg, avg_temperature_c, avg_humidity_percent, crops_spoiled, crops_added, crops_removed, energy_consumption_kwh, maintenance_issues, recommendations, status)
              VALUES ($1, $2, 'daily', CURRENT_DATE - $3::integer,
                FLOOR(RANDOM() * 20 + 5)::int,
                FLOOR(RANDOM() * 3000 + 500)::numeric,
                (RANDOM() * 4 + 2)::numeric(5,2),
                (RANDOM() * 15 + 78)::numeric(5,2),
                FLOOR(RANDOM() * 3)::int,
                FLOOR(RANDOM() * 5)::int,
                FLOOR(RANDOM() * 4)::int,
                (RANDOM() * 100 + 50)::numeric(10,2),
                $4,
                $5,
                'submitted'
              )
            `, [
              unit.storage_id, specialistId, i,
              i === 0 ? 'Compressor noise detected' : (i === 3 ? 'Humidity sensor calibration needed' : 'No issues'),
              i === 0 ? 'Schedule compressor maintenance' : (i === 3 ? 'Recalibrate humidity sensors' : 'Continue regular monitoring')
            ]);
          }
        }
        console.log("✅ Sample daily reports created");

        for (const unit of csResult.rows) {
          await pool.query(`
            INSERT INTO cold_storage_reports (storage_id, specialist_id, report_type, report_date, total_crops, total_weight_kg, avg_temperature_c, avg_humidity_percent, crops_spoiled, crops_added, crops_removed, energy_consumption_kwh, maintenance_issues, recommendations, status)
            VALUES ($1, $2, 'monthly', DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month',
              FLOOR(RANDOM() * 50 + 20)::int,
              FLOOR(RANDOM() * 10000 + 2000)::numeric,
              (RANDOM() * 3 + 3)::numeric(5,2),
              (RANDOM() * 10 + 82)::numeric(5,2),
              FLOOR(RANDOM() * 8)::int,
              FLOOR(RANDOM() * 15 + 5)::int,
              FLOOR(RANDOM() * 12 + 3)::int,
              (RANDOM() * 500 + 200)::numeric(10,2),
              'Minor issues resolved during the month',
              'Consider upgrading temperature monitoring system',
              'submitted'
            )
          `, [unit.storage_id, specialistId]);
        }
        console.log("✅ Sample monthly reports created");
      }
    } else {
      console.log("Reports already exist, skipping seed");
    }

    console.log("\n🎉 Cold storage setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

setup();
