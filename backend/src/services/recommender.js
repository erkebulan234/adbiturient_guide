function normalizeArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map(item => String(item).toLowerCase().trim())
    .filter(Boolean);
}

function buildVocabulary(userWords, specialtyWords) {
  return Array.from(new Set([...userWords, ...specialtyWords]));
}

function buildVector(words, vocabulary) {
  return vocabulary.map(word => (words.includes(word) ? 1 : 0));
}

function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function calculateScore(profile, specialty, testTags = []) {
  const userWords = [
    ...normalizeArray(profile.interests),
    ...normalizeArray(profile.subjects),
    ...normalizeArray(profile.skills),
    ...normalizeArray(testTags)
  ];

  const specialtyWords = [
    ...normalizeArray(specialty.tags),
    ...normalizeArray(specialty.required_subjects),
    ...normalizeArray(specialty.required_skills)
  ];

  const vocabulary = buildVocabulary(userWords, specialtyWords);

  const userVector = buildVector(userWords, vocabulary);
  const specialtyVector = buildVector(specialtyWords, vocabulary);

  const similarity = cosineSimilarity(userVector, specialtyVector);

  return Math.round(similarity * 100);
}

function buildReason(profile, specialty, score, testTags = []) {
  const reasons = [];

  const interests = normalizeArray(profile.interests);
  const subjects = normalizeArray(profile.subjects);
  const skills = normalizeArray(profile.skills);
  const normalizedTestTags = normalizeArray(testTags);

  const tags = normalizeArray(specialty.tags);
  const requiredSubjects = normalizeArray(specialty.required_subjects);
  const requiredSkills = normalizeArray(specialty.required_skills);

  if (interests.some(item => tags.includes(item))) {
    reasons.push('интересы совпадают с направлением');
  }

  if (subjects.some(item => requiredSubjects.includes(item))) {
    reasons.push('любимые предметы подходят для специальности');
  }

  if (skills.some(item => requiredSkills.includes(item))) {
    reasons.push('навыки совпадают с требованиями');
  }

  if (
    normalizedTestTags.some(item => tags.includes(item)) ||
    normalizedTestTags.some(item => requiredSubjects.includes(item)) ||
    normalizedTestTags.some(item => requiredSkills.includes(item))
  ) {
    reasons.push('результаты теста подтверждают выбор');
  }

  if (reasons.length === 0) {
    return 'Рекомендация рассчитана на основе общей похожести профиля и специальности.';
  }

  return `AI-модуль рекомендует это направление, потому что: ${reasons.join(', ')}.`;
}

module.exports = {
  calculateScore,
  buildReason
};