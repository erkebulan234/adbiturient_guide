import pool from '../config/db.js';

async function findProgramsByLevel(educationLevel, city = null) {
  const result = await pool.query(
    `SELECT
      p.id AS program_id,
      p.tuition_fee,
      p.duration_years,
      p.study_language,
      p.study_form,
      p.required_documents,
      p.min_score,
      p.has_grant,

      s.id AS specialty_id,
      s.title,
      s.code,
      s.education_level,
      s.profession,
      s.description,
      s.required_subjects,
      s.required_skills,
      s.average_salary,
      s.demand_level,
      s.tags,

      i.id AS institution_id,
      i.name AS institution_name,
      i.type AS institution_type,
      i.city AS institution_city,
      i.website AS institution_website
    FROM programs p
    JOIN specialties s ON s.id = p.specialty_id
    JOIN institutions i ON i.id = p.institution_id
    WHERE s.education_level = $1
      AND ($2::text IS NULL OR LOWER(i.city) = LOWER($2))`,
    [educationLevel, city]
  );
  return result.rows;
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT
      r.id,
      r.score,
      r.score        AS match_percent,
      r.reason,
      r.created_at,
      r.specialty_id,
      r.program_id,

      s.title,
      s.profession,
      s.description,
      s.required_subjects,
      s.required_skills,
      s.average_salary,
      s.demand_level,

      p.tuition_fee,
      p.duration_years,
      p.study_language,
      p.study_form,
      p.required_documents,
      p.min_score,
      p.has_grant,

      i.name AS institution_name,
      i.type AS institution_type,
      i.city AS institution_city,
      i.website AS institution_website
    FROM recommendations r
    JOIN specialties s ON s.id = r.specialty_id
    LEFT JOIN programs p ON p.id = r.program_id
    LEFT JOIN institutions i ON i.id = p.institution_id
    WHERE r.user_id = $1
    ORDER BY r.score DESC, r.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function replaceForUser(client, userId, recommendations) {
  await client.query('DELETE FROM recommendations WHERE user_id = $1', [userId]);

  if (recommendations.length === 0) return;

  const placeholders = recommendations
    .map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`)
    .join(', ');

  const values = [userId];
  for (const item of recommendations) {
    values.push(item.specialty_id, item.program_id, item.score, item.reason);
  }

  await client.query(
    `INSERT INTO recommendations (user_id, specialty_id, program_id, score, reason)
     VALUES ${placeholders}`,
    values
  );
}

export { findProgramsByLevel, findByUserId, replaceForUser };