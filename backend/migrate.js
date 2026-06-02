require('dotenv').config();
const sql = require('./src/config/db');

async function runMigration() {
  try {
    console.log('Running database migration...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;`;
    console.log('Migration successful: Added brute force tracking columns.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
