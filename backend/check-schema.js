require('dotenv').config();
const sql = require('./src/config/db');

async function check() {
  try {
    const columns = await sql`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'security_logs'`;
    console.log(columns);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
