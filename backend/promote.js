const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function promote() {
  try {
    const res = await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", ['sanchezmendozae382@gmail.com']);
    console.log('Filas actualizadas: ' + res.rowCount);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

promote();
