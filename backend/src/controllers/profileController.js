const pool = require('../config/db');

const VALID_EDUCATION_LEVELS = ['grade_9', 'grade_11'];

function sanitizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => typeof item === 'string')
    .map(item => item.trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, 20); // максимум 20 элементов
}

async function getProfile(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения анкеты', error: error.message });
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
      careerGoals
    } = req.body;

    if (!educationLevel || !VALID_EDUCATION_LEVELS.includes(educationLevel)) {
      return res.status(400).json({
        message: 'Некорректный уровень образования'
      });
    }

    if (city && typeof city !== 'string') {
      return res.status(400).json({ message: 'Некорректный город' });
    }

    if (careerGoals && typeof careerGoals !== 'string') {
      return res.status(400).json({ message: 'Некорректная карьерная цель' });
    }

    const cleanCity = city ? city.trim().slice(0, 120) : null;
    const cleanGoals = careerGoals ? careerGoals.trim().slice(0, 500) : null;
    const cleanInterests = sanitizeArray(interests);
    const cleanSubjects = sanitizeArray(subjects);
    const cleanSkills = sanitizeArray(skills);

    const result = await pool.query(
      `
      INSERT INTO profiles (
        user_id,
        education_level,
        city,
        interests,
        subjects,
        skills,
        career_goals
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id)
      DO UPDATE SET
        education_level = EXCLUDED.education_level,
        city = EXCLUDED.city,
        interests = EXCLUDED.interests,
        subjects = EXCLUDED.subjects,
        skills = EXCLUDED.skills,
        career_goals = EXCLUDED.career_goals
      RETURNING *
      `,
      [
        req.user.id,
        educationLevel,
        cleanCity,
        cleanInterests,
        cleanSubjects,
        cleanSkills,
        cleanGoals
      ]
    );

    res.json({
      message: 'Анкета сохранена',
      profile: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сохранения анкеты', error: error.message });
  }
}

module.exports = {
  getProfile,
  saveProfile
};