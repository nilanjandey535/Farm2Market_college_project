const pool = require("./db");
async function checkOrderRequestColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'order_request'
    `);
    console.log("order_request columns:", res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkOrderRequestColumns();
