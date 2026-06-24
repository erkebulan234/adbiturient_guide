import pool from '../config/db.js';

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT
      f.id AS favorite_id,
      f.created_at AS saved_at,
      p.id AS program_id,
      p.tuition_fee,
      p.duration_years,
      p.study_language,
      p.study_form,
      p.min_score,
      p.has_grant,
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
    FROM favorites f
    JOIN programs p ON p.id = f.program_id
    JOIN specialties s ON s.id = p.specialty_id
    JOIN institutions i ON i.id = p.institution_id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function findIds(userId) {
  const result = await pool.query(
    'SELECT program_id FROM favorites WHERE user_id = $1',
    [userId]
  );
  return result.rows.map(r => r.program_id);
}

async function add(userId, programId) {
  const result = await pool.query(
    `INSERT INTO favorites (user_id, program_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, program_id) DO NOTHING
     RETURNING *`,
    [userId, programId]
  );
  return result.rows[0] || null;
}

async function remove(userId, programId) {
  const result = await pool.query(
    'DELETE FROM favorites WHERE user_id = $1 AND program_id = $2 RETURNING *',
    [userId, programId]
  );
  return result.rows[0] || null;
}

export { findByUserId, findIds, add, remove };
