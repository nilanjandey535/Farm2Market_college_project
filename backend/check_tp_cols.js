const pool = require("./db");
async function checkTPColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'transaction_payment'
    `);
    console.log("transaction_payment columns:", res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkTPColumns();
