const pool = require('../config/db');

async function findAll({ type, city, search } = {}) {
  const conditions = [];
  const values = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (city) {
    values.push(city);
    conditions.push(`city = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT * FROM institutions ${where} ORDER BY id`,
    values
  );
  return result.rows;
}

module.exports = { findAll };
