/**
 * Рекомендательный модуль
 * Алгоритм: rule-based фильтр → cosine similarity → бонусы за достижения
 */

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

function buildVector(tags, vocabulary) {
  return vocabulary.map(word => (tags.includes(word) ? 1 : 0));
}

function achievementBonus(achievements, sphere) {
  let bonus = 0;
  for (const a of achievements) {
    if (a.subject && sphere.toLowerCase().includes(a.subject.toLowerCase())) {
      if (a.type === 'olympiad') bonus += 0.10;
      if (a.type === 'certificate') bonus += 0.05;
      if (a.type === 'grade') bonus += 0.03;
    }
  }
  return Math.min(bonus, 0.20);
}

/**
 * @param {Object} userData - данные абитуриента
 * @param {Array}  professions - список профессий из БД
 * @param {Array}  programs - список программ из БД (с joined specialty и institution)
 * @returns {Array} отсортированные рекомендации
 */
function recommend(userData, professions, programs) {
  const {
    educationLevel,   // 'grade_9' | 'grade_11'
    entScore,
    interests = [],
    favoriteSubjects = [],
    achievements = [],
    city,
    institutionTypePref,
    personalityType,
  } = userData;

  const institutionType = educationLevel === 'grade_9' ? 'college' : 'university';
  const vocabulary = [...new Set([...interests, ...favoriteSubjects])];
  const userVec = buildVector(vocabulary, vocabulary);

  // Шаг 1 — rule-based фильтр программ
  const filteredPrograms = programs.filter(p => {
    if (institutionTypePref && p.institution.type !== institutionTypePref) return false;
    if (p.institution.type !== institutionType) return false;
    if (city && p.institution.city !== city) return false;
    if (entScore && p.minEntScore && p.minEntScore > entScore) return false;
    return true;
  });

  // Шаг 2 — score по профессиям
  const results = professions.map(prof => {
    const profTags = [prof.sphere, ...(prof.requiredSkills || [])];
    const profVec = buildVector(profTags, vocabulary);
    const similarity = cosineSimilarity(userVec, profVec);
    const bonus = achievementBonus(achievements, prof.sphere);
    const matchScore = Math.min(similarity + bonus, 1.0);

    const relatedPrograms = filteredPrograms.filter(
      p => p.specialty.professionId === prof.id
    );

    return { profession: prof, matchScore, programs: relatedPrograms };
  });

  // Сортировка по match_score, убираем профессии без программ
  return results
    .filter(r => r.programs.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

module.exports = { recommend };
