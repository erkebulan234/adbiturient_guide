function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).toLowerCase().trim());
}

function countMatches(userWords, itemWords) {
  let count = 0;

  for (const word of userWords) {
    if (itemWords.includes(word)) {
      count += 1;
    }
  }

  return count;
}

function calculateScore(profile, specialty, testTags = []) {
  const interests = normalizeArray(profile.interests);
  const subjects = normalizeArray(profile.subjects);
  const skills = normalizeArray(profile.skills);
  const normalizedTestTags = normalizeArray(testTags);

  const tags = normalizeArray(specialty.tags);
  const requiredSubjects = normalizeArray(specialty.required_subjects);
  const requiredSkills = normalizeArray(specialty.required_skills);

  let score = 0;

  score += countMatches(interests, tags) * 3;
  score += countMatches(subjects, requiredSubjects) * 4;
  score += countMatches(skills, requiredSkills) * 3;

  score += countMatches(normalizedTestTags, tags) * 4;
  score += countMatches(normalizedTestTags, requiredSubjects) * 3;
  score += countMatches(normalizedTestTags, requiredSkills) * 3;

  return score;
}

function buildReason(profile, specialty, score, testTags = []) {
  if (score === 0) {
    return 'Подходит как дополнительный вариант для рассмотрения.';
  }

  const reasons = [];

  const interests = normalizeArray(profile.interests);
  const subjects = normalizeArray(profile.subjects);
  const skills = normalizeArray(profile.skills);
  const normalizedTestTags = normalizeArray(testTags);

  const tags = normalizeArray(specialty.tags);
  const requiredSubjects = normalizeArray(specialty.required_subjects);
  const requiredSkills = normalizeArray(specialty.required_skills);

  if (countMatches(interests, tags) > 0) {
    reasons.push('совпадение по интересам');
  }

  if (countMatches(subjects, requiredSubjects) > 0) {
    reasons.push('совпадение по любимым предметам');
  }

  if (countMatches(skills, requiredSkills) > 0) {
    reasons.push('совпадение по навыкам');
  }

  if (
    countMatches(normalizedTestTags, tags) > 0 ||
    countMatches(normalizedTestTags, requiredSubjects) > 0 ||
    countMatches(normalizedTestTags, requiredSkills) > 0
  ) {
    reasons.push('совпадение по результатам профориентационного теста');
  }

  return `Рекомендовано: ${reasons.join(', ')}.`;
}

module.exports = {
  calculateScore,
  buildReason
};