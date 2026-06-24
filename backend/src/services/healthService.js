import pool from '../config/db.js';

async function getHealth() {
  await pool.query('SELECT 1');

  return {
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString()
  };
}

export default {
  getHealth
};