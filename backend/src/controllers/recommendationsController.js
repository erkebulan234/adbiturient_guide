const pool = require('../config/db');
const { calculateScore, buildReason } = require('../services/recommender');

async function generateRecommendations(req, res) {
  try {
    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(400).json({
        message: 'Сначала заполните анкету абитуриента'
      });
    }

    const profile = profileResult.rows[0];

    const testResult = await pool.query(
      `
      SELECT result_tags
      FROM test_results
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [req.user.id]
    );

    const testTags = testResult.rows[0]?.result_tags || [];

    const programsResult = await pool.query(
      `
      SELECT
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
        AND (
          $2::text IS NULL
          OR LOWER(i.city) = LOWER($2)
        )
      `,
      [profile.education_level, profile.city || null]
    );

    const scoredRecommendations = programsResult.rows
      .map(item => {
        const score = calculateScore(profile, item, testTags);
        const reason = buildReason(profile, item, score, testTags);

        return {
          ...item,
          score,
          matchPercent: Math.min(Math.round((score / 50) * 100), 100),
          reason
        };
      })
      .sort((a, b) => b.score - a.score);

    let recommendations = scoredRecommendations.filter(item => item.score > 0);

    if (recommendations.length === 0) {
      recommendations = scoredRecommendations.slice(0, 5);
    } else {
      recommendations = recommendations.slice(0, 5);
    }

    await pool.query(
      'DELETE FROM recommendations WHERE user_id = $1',
      [req.user.id]
    );

    for (const item of recommendations) {
      await pool.query(
        `
        INSERT INTO recommendations (
          user_id,
          specialty_id,
          program_id,
          score,
          reason
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          req.user.id,
          item.specialty_id,
          item.program_id,
          item.score,
          item.reason
        ]
      );
    }

    res.json({
      message: 'Рекомендации сформированы',
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка генерации рекомендаций',
      error: error.message
    });
  }
}

async function getRecommendations(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.score,
        r.reason,
        LEAST(ROUND((r.score::numeric / 50) * 100), 100) AS match_percent,
        r.created_at,

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
      ORDER BY r.score DESC, r.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка получения рекомендаций',
      error: error.message
    });
  }
}

module.exports = {
  generateRecommendations,
  getRecommendations
};