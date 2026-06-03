require('dotenv').config();
const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  username: 'postgres.skbclayhocwokctcqdvl',
  password: process.env.DB_PASSWORD,
  ssl: 'require',
});

module.exports = sql;
