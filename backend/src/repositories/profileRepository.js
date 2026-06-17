const pool = require('../config/db');

async function findByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function upsert(userId, data) {
  const result = await pool.query(
    `INSERT INTO profiles (
      user_id, education_level, city,
      interests, subjects, skills, career_goals,
      ent_score, dislike_subjects, dislike_fields
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (user_id) DO UPDATE SET
      education_level  = EXCLUDED.education_level,
      city             = EXCLUDED.city,
      interests        = EXCLUDED.interests,
      subjects         = EXCLUDED.subjects,
      skills           = EXCLUDED.skills,
      career_goals     = EXCLUDED.career_goals,
      ent_score        = EXCLUDED.ent_score,
      dislike_subjects = EXCLUDED.dislike_subjects,
      dislike_fields   = EXCLUDED.dislike_fields
    RETURNING *`,
    [
      userId,
      data.educationLevel,
      data.city,
      data.interests,
      data.subjects,
      data.skills,
      data.careerGoals,
      data.entScore,
      data.dislikeSubjects,
      data.dislikeFields
    ]
  );
  return result.rows[0];
}

module.exports = { findByUserId, upsert };
