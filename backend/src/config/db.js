require('dotenv').config();
const postgres = require('postgres');

// We use the object configuration to avoid any URL-encoding issues with special characters in the password (like @)
const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  username: 'postgres.skbclayhocwokctcqdvl',
  password: process.env.DB_PASSWORD,
  ssl: 'require', // Supabase requires SSL for remote connections
});

module.exports = sql;
