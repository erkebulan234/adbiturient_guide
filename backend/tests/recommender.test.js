const { calculateScore, buildReason } = require('../src/services/recommender');

const profile = {
  interests: ['IT', 'технологии'],
  subjects: ['информатика', 'математика'],
  skills: ['логика', 'анализ'],
  career_goals: 'хочу стать программистом'
};

const specialty = {
  tags: ['IT', 'технологии', 'информатика'],
  required_subjects: ['информатика', 'математика'],
  required_skills: ['логика', 'программирование']
};

describe('calculateScore', () => {
  test('возвращает число от 0 до 100', () => {
    const score = calculateScore(profile, specialty);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('высокий score при совпадении интересов', () => {
    const score = calculateScore(profile, specialty);
    expect(score).toBeGreaterThan(50);
  });

  test('0 если профиль пустой', () => {
    const emptyProfile = { interests: [], subjects: [], skills: [], career_goals: '' };
    const score = calculateScore(emptyProfile, specialty);
    expect(score).toBe(0);
  });
});

describe('buildReason', () => {
  test('возвращает строку', () => {
    const reason = buildReason(profile, specialty, 80);
    expect(typeof reason).toBe('string');
    expect(reason.length).toBeGreaterThan(0);
  });

  test('упоминает интересы если они совпадают', () => {
    const reason = buildReason(profile, specialty, 80);
    expect(reason).toContain('интересы');
  });

  test('возвращает дефолтную причину если нет совпадений', () => {
    const emptyProfile = { interests: [], subjects: [], skills: [], career_goals: '' };
    const reason = buildReason(emptyProfile, specialty, 0);
    expect(reason).toContain('общей похожести');
  });
});