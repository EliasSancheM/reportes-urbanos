const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  console.log('Iniciando migración de base de datos en Railway...');
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'models.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Tablas creadas correctamente y PostGIS habilitado en Railway.');
  } catch (err) {
    console.error('❌ Error ejecutando migrations:', err.message);
  } finally {
    pool.end();
  }
}

runMigrations();
