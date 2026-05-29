const pool = require('../config/db');

async function getPrograms(req, res) {
  try {
    const { educationLevel, institutionType, city } = req.query;

    const conditions = [];
    const values = [];

    if (educationLevel) {
      values.push(educationLevel);
      conditions.push(`s.education_level = $${values.length}`);
    }

    if (institutionType) {
      values.push(institutionType);
      conditions.push(`i.type = $${values.length}`);
    }

    if (city) {
      values.push(city);
      conditions.push(`i.city = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `
      SELECT
        p.*,
        s.title AS specialty_title,
        s.profession,
        s.required_subjects,
        s.required_skills,
        s.average_salary,
        s.demand_level,
        i.name AS institution_name,
        i.type AS institution_type,
        i.city AS institution_city,
        i.website AS institution_website
      FROM programs p
      JOIN specialties s ON s.id = p.specialty_id
      JOIN institutions i ON i.id = p.institution_id
      ${where}
      ORDER BY p.id
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения программ', error: error.message });
  }
}

module.exports = {
  getPrograms
};