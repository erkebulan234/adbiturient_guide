import pool from '../config/db.js';

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT * FROM profiles WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

async function upsert(userId, data) {
  const {
    educationLevel,
    city,
    interests,
    subjects,
    skills,
    careerGoals,
    entScore,
    dislikeSubjects,
    dislikeFields
  } = data;

  const result = await pool.query(
    `INSERT INTO profiles
       (user_id, education_level, city, interests, subjects, skills,
        career_goals, ent_score, dislike_subjects, dislike_fields)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
      educationLevel,
      city,
      interests,
      subjects,
      skills,
      careerGoals,
      entScore,
      dislikeSubjects,
      dislikeFields
    ]
  );
  return result.rows[0];
}

export { findByUserId, upsert };