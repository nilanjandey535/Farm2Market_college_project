const pool = require("./db");
async function cleanup() {

  await pool.query("DROP TABLE IF EXISTS cold_storage_reports");
  console.log("Dropped cold_storage_reports table");

  const del = await pool.query("DELETE FROM cold_storage WHERE supervised_by IS NULL");
  console.log(`Deleted ${del.rowCount} duplicate cold_storage rows`);

  const cs = await pool.query("SELECT storage_id, storage_name, supervised_by FROM cold_storage");
  console.log("Remaining cold_storage rows:", cs.rows);

  process.exit(0);
}
cleanup().catch(e => { console.error(e); process.exit(1); });
