const pool = require('../config/db');

function normalizeText(value, maxLength = 500) {
  if (value === null || value === undefined) return null;
  return String(value).trim().slice(0, maxLength) || null;
}

function normalizeTextArray(value, fieldName) {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value)) {
    const error = new Error(`${fieldName} должен быть массивом`);
    error.statusCode = 400;
    throw error;
  }

  return value
    .map(item => String(item).trim())
    .filter(Boolean)
    .slice(0, 30);
}

function normalizeEntScore(value) {
  if (value === null || value === undefined || value === '') return null;

  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 140) {
    const error = new Error('Балл ЕНТ должен быть числом от 0 до 140');
    error.statusCode = 400;
    throw error;
  }

  return Math.round(score);
}

function normalizeEducationLevel(value) {
  const allowed = ['grade_9', 'grade_11'];
  if (!allowed.includes(value)) {
    const error = new Error('Некорректный уровень образования');
    error.statusCode = 400;
    throw error;
  }

  return value;
}

async function getProfile(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Ошибка получения анкеты' });
  }
}

async function saveProfile(req, res) {
  try {
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
    } = req.body;

    const normalized = {
      educationLevel: normalizeEducationLevel(educationLevel),
      city: normalizeText(city, 120),
      interests: normalizeTextArray(interests, 'interests'),
      subjects: normalizeTextArray(subjects, 'subjects'),
      skills: normalizeTextArray(skills, 'skills'),
      careerGoals: normalizeText(careerGoals, 1000),
      entScore: normalizeEntScore(entScore),
      dislikeSubjects: normalizeTextArray(dislikeSubjects, 'dislikeSubjects'),
      dislikeFields: normalizeTextArray(dislikeFields, 'dislikeFields')
    };

    const result = await pool.query(
      `
      INSERT INTO profiles (
        user_id, education_level, city,
        interests, subjects, skills, career_goals,
        ent_score, dislike_subjects, dislike_fields
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        education_level = EXCLUDED.education_level,
        city = EXCLUDED.city,
        interests = EXCLUDED.interests,
        subjects = EXCLUDED.subjects,
        skills = EXCLUDED.skills,
        career_goals = EXCLUDED.career_goals,
        ent_score = EXCLUDED.ent_score,
        dislike_subjects = EXCLUDED.dislike_subjects,
        dislike_fields = EXCLUDED.dislike_fields
      RETURNING *
      `,
      [
        req.user.id,
        normalized.educationLevel,
        normalized.city,
        normalized.interests,
        normalized.subjects,
        normalized.skills,
        normalized.careerGoals,
        normalized.entScore,
        normalized.dislikeSubjects,
        normalized.dislikeFields
      ]
    );

    res.json({ message: 'Анкета сохранена', profile: result.rows[0] });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('saveProfile error:', error);
    return res.status(500).json({ message: 'Ошибка сохранения анкеты' });
  }
}

module.exports = { getProfile, saveProfile };
