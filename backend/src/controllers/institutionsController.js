const pool = require('../config/db');

async function getInstitutions(req, res) {
  try {
    const { type, city, search } = req.query;

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
      `
      SELECT *
      FROM institutions
      ${where}
      ORDER BY id
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения учебных заведений', error: error.message });
  }
}

module.exports = {
  getInstitutions
};