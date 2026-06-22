const pool = require('../config/db');

async function findAll({ educationLevel, institutionType, city, search, page = 1, limit = 12 } = {}) {
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
    conditions.push(`i.city ILIKE $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    const idx = values.length;
    conditions.push(`(s.title ILIKE $${idx} OR i.name ILIKE $${idx} OR s.profession ILIKE $${idx})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Общее количество для пагинации
  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM programs p
     JOIN specialties s ON s.id = p.specialty_id
     JOIN institutions i ON i.id = p.institution_id
     ${where}`,
    values
  );
  const total = Number(countResult.rows[0].total);

  // Сами данные с LIMIT/OFFSET
  const offset = (page - 1) * limit;
  const dataValues = [...values, limit, offset];

  const result = await pool.query(
    `SELECT
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
    LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
    dataValues
  );

  return { rows: result.rows, total };
}

module.exports = { findAll };