const pool = require('../config/db');

async function getSpecialties(req, res) {
  try {
    const { educationLevel, search } = req.query;

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
      `
      SELECT *
      FROM specialties
      ${where}
      ORDER BY id
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения специальностей', error: error.message });
  }
}

async function getSpecialtyById(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM specialties WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Специальность не найдена' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения специальности', error: error.message });
  }
}

module.exports = {
  getSpecialties,
  getSpecialtyById
};