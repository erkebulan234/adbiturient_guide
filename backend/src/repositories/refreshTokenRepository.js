const pool = require('../config/db');
const crypto = require('crypto');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function store(userId, token, expiresAt) {
  const tokenHash = hashToken(token);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

async function find(token) {
  const tokenHash = hashToken(token);
  const result = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function revoke(token) {
  const tokenHash = hashToken(token);
  await pool.query(
    'DELETE FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash]
  );
}

async function revokeAllForUser(userId) {
  await pool.query(
    'DELETE FROM refresh_tokens WHERE user_id = $1',
    [userId]
  );
}

module.exports = { hashToken, store, find, revoke, revokeAllForUser };
