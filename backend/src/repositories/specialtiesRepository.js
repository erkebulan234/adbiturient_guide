const pool = require('../config/db');

async function findAll({ educationLevel, search } = {}) {
  const conditions = [];
  const values = [];

  if (educationLevel) {
    values.push(educationLevel);
    conditions.push(`education_level = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT * FROM specialties ${where} ORDER BY id`,
    values
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM specialties WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { findAll, findById };
