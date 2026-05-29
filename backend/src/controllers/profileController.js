const pool = require('../config/db');

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
        city,
        interests || [],
        subjects || [],
        skills || [],
        careerGoals || null
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