// ============================================================
// services/recommender.js  v1.3
// ============================================================
// Улучшения:
//   1. Нелинейный штраф за ЕНТ (мягкий/средний/жёсткий)
//   2. Career Goal Classifier — regex вместо split по словам
//   3. Отрицательные факторы (dislike_subjects, dislike_fields)
//   4. Все параметры вынесены в CONFIG
// ============================================================

// ─── КОНФИГ ────────────────────────────────────────────────

const CONFIG = {
  weights: {
    interests: 1.5,
    subjects:  2.0,
    skills:    1.2,
    testTags:  1.8,
    career:    1.3,   // повысили — classifier точнее, чем split
  },
  demandBonus: {
    'очень высокая': 8,
    'высокая':       5,
    'средняя':       2,
    'низкая':        0,
  },
  grantBonus: 4,
  entPenalty: {
    smallGap:  5,    // разница 1–5 баллов
    mediumGap: 15,   // разница 6–15 баллов
    largeGap:  30,   // разница 16+
  },
  dislikePenalty: 20,  // штраф за каждое нежелательное совпадение
};

// ─── СИНОНИМЫ ──────────────────────────────────────────────

const SYNONYMS = {
  // IT
  'программирование': 'it', 'кодинг': 'it', 'разработка': 'it',
  'информатика': 'it', 'it': 'it', 'технологии': 'it',
  'робототехника': 'it', 'веб': 'it', 'web': 'it',
  'фронтенд': 'it', 'бэкенд': 'it', 'программист': 'it',
  'компьютер': 'it', 'алгоритм': 'it', 'данные': 'it',
  'кибербезопасность': 'it', 'нейросети': 'it', 'ии': 'it',

  // Медицина
  'биология': 'медицина', 'химия': 'медицина', 'медицина': 'медицина',
  'здоровье': 'медицина', 'лечение': 'медицина', 'фармация': 'медицина',
  'анатомия': 'медицина', 'врач': 'медицина', 'медик': 'медицина',
  'пациент': 'медицина', 'клиника': 'медицина',

  // Математика
  'математика': 'математика', 'алгебра': 'математика',
  'геометрия': 'математика', 'физика': 'математика',
  'статистика': 'математика', 'моделирование': 'математика',

  // Дизайн / творчество
  'дизайн': 'творчество', 'творчество': 'творчество',
  'рисование': 'творчество', 'искусство': 'творчество',
  'архитектура': 'творчество', 'креативность': 'творчество',
  'графика': 'творчество', 'ux': 'творчество', 'ui': 'творчество',
  'иллюстрация': 'творчество', 'анимация': 'творчество',

  // Бизнес
  'экономика': 'бизнес', 'финансы': 'бизнес', 'бизнес': 'бизнес',
  'менеджмент': 'бизнес', 'маркетинг': 'бизнес', 'бухгалтерия': 'бизнес',
  'предпринимательство': 'бизнес', 'стартап': 'бизнес',
  'продажи': 'бизнес', 'торговля': 'бизнес', 'логистика': 'бизнес',

  // Право
  'право': 'юриспруденция', 'юриспруденция': 'юриспруденция',
  'закон': 'юриспруденция', 'юридический': 'юриспруденция',
  'юрист': 'юриспруденция', 'адвокат': 'юриспруденция',

  // Педагогика
  'педагогика': 'образование', 'учитель': 'образование',
  'преподавание': 'образование', 'обучение': 'образование',

  // Инженерия
  'инженерия': 'инженерия', 'строительство': 'инженерия',
  'механика': 'инженерия', 'электроника': 'инженерия',
  'автоматика': 'инженерия', 'производство': 'инженерия',
  'нефть': 'инженерия', 'геология': 'инженерия',

  // Soft skills
  'логика': 'аналитика', 'аналитика': 'аналитика',
  'исследование': 'аналитика', 'общение': 'коммуникация',
  'коммуникация': 'коммуникация', 'командная работа': 'коммуникация',
  'ответственность': 'коммуникация', 'лидерство': 'коммуникация',
};

// ─── CAREER GOAL CLASSIFIER ────────────────────────────────
// Вместо шумного split по словам — regexp-паттерны.
// "хочу создавать мобильные приложения" → ['it']
// "хочу управлять компанией и инвестировать" → ['бизнес']

const CAREER_PATTERNS = [
  { re: /разработ|программист|программирова|веб|мобильн|приложени|сайт|it.специалист|software|frontend|backend|full.?stack/i, cat: 'it' },
  { re: /данн|нейросет|машинн.{0,10}обуч|искусств.{0,10}интеллект|аналитик.{0,10}данн|data/i, cat: 'it' },
  { re: /врач|медик|лечить|пациент|хирург|стоматолог|фармацевт|клиник|медицин/i, cat: 'медицина' },
  { re: /менеджер|управля|предприниматель|стартап|директор|руководи/i, cat: 'бизнес' },
  { re: /финансист|банк|инвест|бухгалтер|экономист|аудитор/i, cat: 'бизнес' },
  { re: /дизайнер|рисова|творч|иллюстрат|анимат|архитектор/i, cat: 'творчество' },
  { re: /учитель|преподавател|педагог|обучать/i, cat: 'образование' },
  { re: /юрист|адвокат|прокурор|судья|право/i, cat: 'юриспруденция' },
  { re: /инженер|строитель|механик|электрик|автоматиз/i, cat: 'инженерия' },
];

function classifyCareerGoal(text) {
  if (!text) return [];
  const cats = [];
  for (const { re, cat } of CAREER_PATTERNS) {
    if (re.test(text) && !cats.includes(cat)) cats.push(cat);
  }
  return cats;
}

// ─── ВСПОМОГАТЕЛЬНЫЕ ───────────────────────────────────────

function applySynonyms(word) {
  return SYNONYMS[word] || word;
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => applySynonyms(String(item).toLowerCase().trim()))
    .filter(Boolean);
}

function cosineSimilarity(wordsA, wordsB) {
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const vocab = Array.from(new Set([...wordsA, ...wordsB]));
  let dot = 0, magA = 0, magB = 0;
  for (const word of vocab) {
    const a = wordsA.includes(word) ? 1 : 0;
    const b = wordsB.includes(word) ? 1 : 0;
    dot += a * b; magA += a * a; magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ─── НЕЛИНЕЙНЫЙ ШТРАФ ЕНТ ──────────────────────────────────

function calcEntPenalty(userScore, minScore) {
  if (!userScore || !minScore || userScore >= minScore) return 0;
  const gap = minScore - userScore;
  const p   = CONFIG.entPenalty;
  if (gap <= 5)  return p.smallGap;
  if (gap <= 15) return p.mediumGap;
  return p.largeGap;
}

// ─── ШТРАФ ЗА НЕЖЕЛАТЕЛЬНОЕ ────────────────────────────────
// Профиль может содержать поля:
//   dislike_subjects: ['химия', 'история']
//   dislike_fields:   ['медицина', 'право']

function calcDislikePenalty(profile, specialty) {
  let penalty = 0;

  const dislikeSubjects = normalizeArray(profile.dislike_subjects);
  if (dislikeSubjects.length > 0) {
    const required = normalizeArray(specialty.required_subjects);
    penalty += dislikeSubjects.filter(w => required.includes(w)).length
               * CONFIG.dislikePenalty;
  }

  const dislikeFields = normalizeArray(profile.dislike_fields);
  if (dislikeFields.length > 0) {
    const tags = normalizeArray(specialty.tags);
    penalty += dislikeFields.filter(w => tags.includes(w)).length
               * CONFIG.dislikePenalty;
  }

  return penalty;
}

// ─── calculateScore ────────────────────────────────────────

function calculateScore(profile, specialty, testTags = []) {
  const specialtyWords = [
    ...normalizeArray(specialty.tags),
    ...normalizeArray(specialty.required_subjects),
    ...normalizeArray(specialty.required_skills),
  ];

  const sources = {
    interests: normalizeArray(profile.interests),
    subjects:  normalizeArray(profile.subjects),
    skills:    normalizeArray(profile.skills),
    testTags:  normalizeArray(testTags),
    career:    classifyCareerGoal(profile.career_goals),
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, words] of Object.entries(sources)) {
    if (words.length === 0) continue;
    const weight = CONFIG.weights[key];
    const sim    = cosineSimilarity(words, specialtyWords);
    weightedSum += sim * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;

  let score = Math.round((weightedSum / totalWeight) * 100);

  // Бонусы
  score += CONFIG.demandBonus[(specialty.demand_level || '').toLowerCase().trim()] ?? 0;
  if (specialty.has_grant) score += CONFIG.grantBonus;

  // Штрафы
  score -= calcEntPenalty(Number(profile.ent_score || 0), Number(specialty.min_score || 0));
  score -= calcDislikePenalty(profile, specialty);

  return Math.max(0, Math.min(score, 100));
}

// ─── buildReason ───────────────────────────────────────────

function buildReason(profile, specialty, score, testTags = []) {
  const specialtyWords = [
    ...normalizeArray(specialty.tags),
    ...normalizeArray(specialty.required_subjects),
    ...normalizeArray(specialty.required_skills),
  ];

  const matchedInterests = normalizeArray(profile.interests).filter(w => specialtyWords.includes(w));
  const matchedSubjects  = normalizeArray(profile.subjects).filter(w => specialtyWords.includes(w));
  const matchedSkills    = normalizeArray(profile.skills).filter(w => specialtyWords.includes(w));
  const matchedTest      = normalizeArray(testTags).filter(w => specialtyWords.includes(w));
  const matchedCareer    = classifyCareerGoal(profile.career_goals).filter(w => specialtyWords.includes(w));

  const parts = [];
  if (matchedInterests.length > 0) parts.push(`интересы (${[...new Set(matchedInterests)].join(', ')})`);
  if (matchedSubjects.length  > 0) parts.push(`предметы (${[...new Set(matchedSubjects)].join(', ')})`);
  if (matchedSkills.length    > 0) parts.push(`навыки (${[...new Set(matchedSkills)].join(', ')})`);
  if (matchedTest.length      > 0) parts.push(`тест (${[...new Set(matchedTest)].join(', ')})`);
  if (matchedCareer.length    > 0) parts.push(`карьерная цель → ${[...new Set(matchedCareer)].join(', ')}`);

  const extras = [];
  const demand = (specialty.demand_level || '').toLowerCase().trim();
  if (demand === 'очень высокая' || demand === 'высокая')
    extras.push('специальность востребована на рынке труда');
  if (specialty.has_grant)
    extras.push('доступен государственный грант');

  const warnings = [];
  const entPenalty = calcEntPenalty(Number(profile.ent_score || 0), Number(specialty.min_score || 0));
  if (entPenalty > 0)
    warnings.push(`не хватает ${Number(specialty.min_score) - Number(profile.ent_score)} баллов ЕНТ`);
  if (calcDislikePenalty(profile, specialty) > 0)
    warnings.push('специальность включает нежелательные для вас предметы или сферы');

  let reason = '';
  if (parts.length   > 0) reason += `Совпадение по: ${parts.join('; ')}.`;
  if (extras.length  > 0) reason += (reason ? ' ' : '') + extras.join('. ') + '.';
  if (warnings.length > 0) reason += ` ⚠️ ${warnings.join(', ')}.`;

  return reason || 'Рекомендация основана на общей похожести профиля и специальности.';
}

export {
  calculateScore,
  buildReason,
  classifyCareerGoal,
  cosineSimilarity as _cosineSimilarity,
  normalizeArray as _normalizeArray,
  calcEntPenalty as _calcEntPenalty,
  calcDislikePenalty as _calcDislikePenalty
};