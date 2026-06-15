const pool = require("./db");
async function check() {

  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('order_request', 'agri_specialist', 'customer_account', 'cold_storage')");
  console.log("Tables:", tables.rows.map(r => r.table_name));

  for (const t of tables.rows) {
    const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position", [t.table_name]);
    console.log(`\n${t.table_name} columns:`);
    cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

    const count = await pool.query(`SELECT COUNT(*) FROM ${t.table_name}`);
    console.log(`  Row count: ${count.rows[0].count}`);
  }
  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
