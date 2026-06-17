const pool = require('../config/db');
const { calculateScore, buildReason } = require('./recommender');
const recommendationsRepository = require('../repositories/recommendationsRepository');
const profileRepository = require('../repositories/profileRepository');

async function getLastTestTags(userId) {
  const result = await pool.query(
    `SELECT result_tags FROM test_results
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.result_tags || [];
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

    if (newIsBetter) seen.set(key, item);
  }

  return Array.from(seen.values());
}

function pickTop(deduplicated, n = 5) {
  const withScore = deduplicated.filter(item => item.score > 0);
  return withScore.length > 0 ? withScore.slice(0, n) : deduplicated.slice(0, n);
}

async function generate(userId) {
  const profile = await profileRepository.findByUserId(userId);

  if (!profile) {
    const error = new Error('Сначала заполните анкету абитуриента');
    error.status = 400;
    throw error;
  }

  const testTags = await getLastTestTags(userId);

  let programs = await recommendationsRepository.findProgramsByLevel(
    profile.education_level,
    profile.city || null
  );

  // Если по городу ничего нет — ищем по всей стране
  if (programs.length === 0 && profile.city) {
    programs = await recommendationsRepository.findProgramsByLevel(
      profile.education_level,
      null
    );
  }

  const scored = scorePrograms(programs, profile, testTags);
  const deduplicated = deduplicatePrograms(scored);
  const recommendations = pickTop(deduplicated, 5);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await recommendationsRepository.replaceForUser(client, userId, recommendations);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return recommendations;
}

async function getForUser(userId) {
  return recommendationsRepository.findByUserId(userId);
}

module.exports = { generate, getForUser };
