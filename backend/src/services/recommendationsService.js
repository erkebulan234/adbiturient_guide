import pool from '../config/db.js';
import { calculateScore, buildReason } from './recommender.js';
import * as recommendationsRepository from '../repositories/recommendationsRepository.js';
import * as profileRepository from '../repositories/profileRepository.js';
import * as testRepository from '../repositories/testRepository.js';

function scorePrograms(programs, profile, testTags) {
  return programs
    .map(item => {
      const score = calculateScore(profile, item, testTags);
      const reason = buildReason(profile, item, score, testTags);
      return { ...item, score, matchPercent: score, reason };
    })
    .sort((a, b) => b.score - a.score);
}

function _deduplicatePrograms(scored) {
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

function _pickTop(deduplicated, n = 5) {
  const withScore = deduplicated.filter(item => item.score > 0);
  return withScore.length > 0 ? withScore.slice(0, n) : deduplicated.slice(0, n);
}

async function _saveRecommendations(client, userId, recommendations) {
  await client.query('DELETE FROM recommendations WHERE user_id = $1', [userId]);

  if (recommendations.length === 0) return;

  const valuePlaceholders = [];
  const params = [userId];

  recommendations.forEach((r, i) => {
    const base = i * 4 + 2;
    valuePlaceholders.push(`($1, $${base}, $${base + 1}, $${base + 2}, $${base + 3})`);
    params.push(r.specialty_id, r.program_id, r.score, r.reason);
  });

  await client.query(
    `INSERT INTO recommendations (user_id, specialty_id, program_id, score, reason) VALUES ${valuePlaceholders.join(', ')}`,
    params
  );
}

async function generate(userId) {
  const profile = await profileRepository.findByUserId(userId);

  if (!profile) {
    const error = new Error('Сначала заполните анкету абитуриента');
    error.status = 400;
    throw error;
  }

  const testTags = await testRepository.getLastTestTags(userId);

  let programs = await recommendationsRepository.findProgramsByLevel(
    profile.education_level,
    profile.city || null
  );

  if (programs.length === 0 && profile.city) {
    programs = await recommendationsRepository.findProgramsByLevel(
      profile.education_level,
      null
    );
  }

  const scored = scorePrograms(programs, profile, testTags);
  const deduplicated = _deduplicatePrograms(scored);
  const recommendations = _pickTop(deduplicated, 5);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await _saveRecommendations(client, userId, recommendations);
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

export { generate, getForUser, _saveRecommendations, _deduplicatePrograms, _pickTop };