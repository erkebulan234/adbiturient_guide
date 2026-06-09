const pool = require('../config/db');
const { calculateScore, buildReason } = require('../services/recommender');

async function fetchPrograms(educationLevel, city = null) {
  return pool.query(
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
      AND ($2::text IS NULL OR LOWER(i.city) = LOWER($2))
    `,
    [educationLevel, city]
  );
}

function scorePrograms(programs, profile, testTags) {
  return programs
    .map(item => {
      const score = calculateScore(profile, item, testTags);
      const reason = buildReason(profile, item, score, testTags);
      return { ...item, score, matchPercent: score, reason };
    })
    .sort((a, b) => b.score - a.score);
}

function deduplicatePrograms(scored) {
  const seen = new Map();

  for (const item of scored) {
    const key = `${item.institution_id}_${item.specialty_id}`;

    if (!seen.has(key)) {
      seen.set(key, item);
      continue;
    }

    const existing = seen.get(key);
    const newIsBetter =
      (!existing.has_grant && item.has_grant) ||
      (existing.has_grant === item.has_grant &&
        (item.tuition_fee || Infinity) < (existing.tuition_fee || Infinity));

    if (newIsBetter) {
      seen.set(key, item);
    }
  }

  return Array.from(seen.values());
}

function pickTop(deduplicated, n = 5) {
  const withScore = deduplicated.filter(item => item.score > 0);
  return withScore.length > 0
    ? withScore.slice(0, n)
    : deduplicated.slice(0, n);
}

async function saveRecommendations(client, userId, recommendations) {
  await client.query('DELETE FROM recommendations WHERE user_id = $1', [userId]);

  if (recommendations.length === 0) return;

  const valuePlaceholders = recommendations
    .map((_, index) => `($1, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4}, $${index * 4 + 5})`)
    .join(', ');

  const values = [userId];

  for (const item of recommendations) {
    values.push(item.specialty_id, item.program_id, item.score, item.reason);
  }

  await client.query(
    `
    INSERT INTO recommendations (user_id, specialty_id, program_id, score, reason)
    VALUES ${valuePlaceholders}
    `,
    values
  );
}

async function generateRecommendations(req, res) {
  let client;

  try {
    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(400).json({ message: 'Сначала заполните анкету абитуриента' });
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

    let programsResult = await fetchPrograms(profile.education_level, profile.city || null);

    if (programsResult.rows.length === 0 && profile.city) {
      programsResult = await fetchPrograms(profile.education_level, null);
    }

    const scored = scorePrograms(programsResult.rows, profile, testTags);
    const deduplicated = deduplicatePrograms(scored);
    const recommendations = pickTop(deduplicated, 5);

    client = await pool.connect();
    await client.query('BEGIN');
    await saveRecommendations(client, req.user.id, recommendations);
    await client.query('COMMIT');

    return res.json({ message: 'Рекомендации сформированы', recommendations });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('generateRecommendations rollback error:', rollbackError);
      }
    }

    console.error('generateRecommendations error:', error);
    return res.status(500).json({ message: 'Ошибка генерации рекомендаций' });
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function getRecommendations(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.score,
        r.score AS match_percent,
        r.reason,
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

    return res.json(result.rows);
  } catch (error) {
    console.error('getRecommendations error:', error);
    return res.status(500).json({ message: 'Ошибка получения рекомендаций' });
  }
}

module.exports = {
  generateRecommendations,
  getRecommendations,
  _saveRecommendations: saveRecommendations,
  _deduplicatePrograms: deduplicatePrograms,
  _pickTop: pickTop
};
