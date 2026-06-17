const pool = require('../config/db');

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByGoogleId(googleId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );
  return result.rows[0] || null;
}

async function create({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}

async function createWithGoogle({ name, email, googleId }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, google_id, password_hash)
     VALUES ($1, $2, $3, NULL)
     RETURNING id, name, email, role`,
    [name, email, googleId]
  );
  return result.rows[0];
}

async function linkGoogleId(userId, googleId) {
  await pool.query(
    'UPDATE users SET google_id = $1 WHERE id = $2',
    [googleId, userId]
  );
}

module.exports = {
  findByEmail,
  findById,
  findByGoogleId,
  create,
  createWithGoogle,
  linkGoogleId
};