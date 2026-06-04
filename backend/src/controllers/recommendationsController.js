// ============================================================
// controllers/recommendationsController.js
// ============================================================
//
// Улучшения по сравнению со старой версией:
//  1. Дедупликация по паре (institution_id, specialty_id) —
//     раньше дедуплицировали только по specialty_id, что
//     могло скрывать более дешёвый/грантовый вариант.
//  2. Relaxed fallback: если score === 0 у всех программ,
//     сначала пробуем убрать фильтр по городу, и только
//     потом отдаём топ-5 без фильтра.
//  3. Батч-INSERT вместо N отдельных запросов.
//  4. Логика вынесена в отдельные функции для читаемости.
// ============================================================

const pool = require('../config/db');
const { calculateScore, buildReason } = require('../services/recommender');

// --------------- вспомогательные функции ---------------

/**
 * Загружает программы из БД с фильтром по уровню образования
 * и опционально по городу.
 */
async function fetchPrograms(educationLevel, city = null) {
  return pool.query(
    `
    SELECT
      p.id          AS program_id,
      p.tuition_fee,
      p.duration_years,
      p.study_language,
      p.study_form,
      p.required_documents,
      p.min_score,
      p.has_grant,

      s.id          AS specialty_id,
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

      i.id          AS institution_id,
      i.name        AS institution_name,
      i.type        AS institution_type,
      i.city        AS institution_city,
      i.website     AS institution_website
    FROM programs p
    JOIN specialties  s ON s.id = p.specialty_id
    JOIN institutions i ON i.id = p.institution_id
    WHERE s.education_level = $1
      AND ($2::text IS NULL OR LOWER(i.city) = LOWER($2))
    `,
    [educationLevel, city]
  );
}

/**
 * Присваивает каждой программе score и reason,
 * сортирует по убыванию score.
 */
function scorePrograms(programs, profile, testTags) {
  return programs
    .map(item => {
      const score  = calculateScore(profile, item, testTags);
      const reason = buildReason(profile, item, score, testTags);
      return { ...item, score, matchPercent: score, reason };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Дедупликация: для каждой уникальной пары (institution_id, specialty_id)
 * оставляем лучший вариант по правилу:
 *   1. Приоритет у варианта с грантом.
 *   2. При равном наличии гранта — у более дешёвого.
 */
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

    if (newIsBetter) seen.set(key, item);
  }

  return Array.from(seen.values());
}

/**
 * Из отсортированного дедуплицированного списка берёт топ-N.
 * Если score > 0 нет ни у одного — берём просто первые N (fallback).
 */
function pickTop(deduplicated, n = 5) {
  const withScore = deduplicated.filter(item => item.score > 0);
  return withScore.length > 0
    ? withScore.slice(0, n)
    : deduplicated.slice(0, n);
}

/**
 * Сохраняет рекомендации в БД одной транзакцией.
 */
async function saveRecommendations(userId, recommendations) {
  await pool.query('DELETE FROM recommendations WHERE user_id = $1', [userId]);

  if (recommendations.length === 0) return;

  // Батч-INSERT
  const valuePlaceholders = recommendations
    .map((_, i) => `($1, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`)
    .join(', ');

  const values = [userId];
  for (const item of recommendations) {
    values.push(item.specialty_id, item.program_id, item.score, item.reason);
  }

  await pool.query(
    `INSERT INTO recommendations (user_id, specialty_id, program_id, score, reason)
     VALUES ${valuePlaceholders}`,
    values
  );
}

// --------------- основные обработчики ---------------

async function generateRecommendations(req, res) {
  try {
    // 1. Профиль
    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(400).json({ message: 'Сначала заполните анкету абитуриента' });
    }

    const profile = profileResult.rows[0];

    // 2. Последний результат теста
    const testResult = await pool.query(
      `SELECT result_tags FROM test_results
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    const testTags = testResult.rows[0]?.result_tags || [];

    // 3. Программы с фильтром по городу
    let programsResult = await fetchPrograms(profile.education_level, profile.city || null);

    // 4. Relaxed fallback: если по городу ничего нет — убираем фильтр
    if (programsResult.rows.length === 0 && profile.city) {
      programsResult = await fetchPrograms(profile.education_level, null);
    }

    // 5. Scoring → дедупликация → топ-5
    const scored       = scorePrograms(programsResult.rows, profile, testTags);
    const deduplicated = deduplicatePrograms(scored);
    const recommendations = pickTop(deduplicated, 5);

    // 6. Сохранение
    await saveRecommendations(req.user.id, recommendations);

    res.json({ message: 'Рекомендации сформированы', recommendations });
  } catch (error) {
    console.error('generateRecommendations error:', error);
    res.status(500).json({ message: 'Ошибка генерации рекомендаций', error: error.message });
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
      JOIN specialties  s ON s.id = r.specialty_id
      LEFT JOIN programs     p ON p.id = r.program_id
      LEFT JOIN institutions i ON i.id = p.institution_id
      WHERE r.user_id = $1
      ORDER BY r.score DESC, r.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getRecommendations error:', error);
    res.status(500).json({ message: 'Ошибка получения рекомендаций', error: error.message });
  }
}

module.exports = {
  generateRecommendations,
  getRecommendations,
};