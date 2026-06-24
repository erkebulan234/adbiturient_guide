// tests/recommender.test.js  v1.3

const {
  calculateScore,
  buildReason,
  classifyCareerGoal,
  _cosineSimilarity,
  _normalizeArray,
  _calcEntPenalty,
  _calcDislikePenalty,
} = require('../src/services/recommender');

// ─── classifyCareerGoal ──────────────────────────────────────
describe('classifyCareerGoal', () => {
  test('разработка → it', () => {
    expect(classifyCareerGoal('хочу создавать мобильные приложения')).toContain('it');
  });
  test('врач → медицина', () => {
    expect(classifyCareerGoal('мечтаю стать врачом')).toContain('медицина');
  });
  test('бизнес → бизнес', () => {
    expect(classifyCareerGoal('открыть собственный стартап')).toContain('бизнес');
  });
  test('несколько категорий', () => {
    const cats = classifyCareerGoal('хочу разрабатывать медицинские приложения');
    expect(cats).toContain('it');
    expect(cats).toContain('медицина');
  });
  test('пустая строка → []', () => {
    expect(classifyCareerGoal('')).toEqual([]);
    expect(classifyCareerGoal(null)).toEqual([]);
  });
});

// ─── calcEntPenalty ──────────────────────────────────────────
describe('_calcEntPenalty', () => {
  test('нет штрафа если балл достаточен', () => {
    expect(_calcEntPenalty(90, 85)).toBe(0);
    expect(_calcEntPenalty(85, 85)).toBe(0);
  });
  test('маленький штраф при gap 1–5', () => {
    expect(_calcEntPenalty(80, 83)).toBe(5);
  });
  test('средний штраф при gap 6–15', () => {
    expect(_calcEntPenalty(70, 80)).toBe(15);
  });
  test('большой штраф при gap 16+', () => {
    expect(_calcEntPenalty(50, 90)).toBe(30);
  });
  test('нет штрафа если userScore = 0 (не указан)', () => {
    expect(_calcEntPenalty(0, 90)).toBe(0);
  });
});

// ─── calcDislikePenalty ──────────────────────────────────────
describe('_calcDislikePenalty', () => {
  const specialty = {
    required_subjects: ['биология', 'химия'],
    tags: ['медицина', 'it'],
  };

  test('штраф за нежелательный предмет', () => {
    const profile = { dislike_subjects: ['химия'], dislike_fields: [] };
    expect(_calcDislikePenalty(profile, specialty)).toBe(20);
  });

  test('штраф за нежелательную сферу', () => {
    const profile = { dislike_subjects: [], dislike_fields: ['медицина'] };
    expect(_calcDislikePenalty(profile, specialty)).toBe(20);
  });

  test('двойной штраф при двух совпадениях', () => {
    const profile = { dislike_subjects: ['химия'], dislike_fields: ['медицина'] };
    expect(_calcDislikePenalty(profile, specialty)).toBe(40);
  });

  test('нет штрафа без совпадений', () => {
    const profile = { dislike_subjects: ['история'], dislike_fields: ['право'] };
    expect(_calcDislikePenalty(profile, specialty)).toBe(0);
  });

  test('нет штрафа при пустых полях', () => {
    const profile = { dislike_subjects: [], dislike_fields: [] };
    expect(_calcDislikePenalty(profile, specialty)).toBe(0);
  });
});

// ─── calculateScore ──────────────────────────────────────────
describe('calculateScore', () => {
  const itSpecialty = {
    tags: ['it', 'технологии'], required_subjects: ['it', 'математика'],
    required_skills: ['it', 'аналитика'], demand_level: 'высокая',
    has_grant: true, min_score: 0,
  };
  const medSpecialty = {
    tags: ['медицина'], required_subjects: ['медицина', 'медицина'],
    required_skills: ['коммуникация'], demand_level: 'высокая',
    has_grant: false, min_score: 0,
  };

  test('IT-профиль → высокий score для IT', () => {
    const profile = {
      interests: ['IT'], subjects: ['информатика', 'математика'],
      skills: ['логика'], career_goals: 'хочу стать разработчиком',
      ent_score: 0, dislike_subjects: [], dislike_fields: [],
    };
    expect(calculateScore(profile, itSpecialty, ['it'])).toBeGreaterThan(50);
  });

  test('IT-профиль → низкий score для медицины', () => {
    const profile = {
      interests: ['IT'], subjects: ['информатика'],
      skills: ['логика'], career_goals: null,
      ent_score: 0, dislike_subjects: [], dislike_fields: [],
    };
    expect(calculateScore(profile, medSpecialty, [])).toBeLessThan(25);
  });

  test('карьерная цель влияет через classifier', () => {
    const profileWithCareer = {
      interests: [], subjects: [], skills: [],
      career_goals: 'хочу разрабатывать приложения',
      ent_score: 0, dislike_subjects: [], dislike_fields: [],
    };
    const profileWithout = { ...profileWithCareer, career_goals: null };
    expect(calculateScore(profileWithCareer, itSpecialty, []))
      .toBeGreaterThan(calculateScore(profileWithout, itSpecialty, []));
  });

  test('нелинейный штраф: большой gap снижает больше', () => {
    const profile = {
      interests: ['it'], subjects: [], skills: [],
      career_goals: null, dislike_subjects: [], dislike_fields: [],
    };
    const smallGap = calculateScore({ ...profile, ent_score: 80 }, { ...itSpecialty, min_score: 83, has_grant: false, demand_level: null }, []);
    const bigGap   = calculateScore({ ...profile, ent_score: 50 }, { ...itSpecialty, min_score: 90, has_grant: false, demand_level: null }, []);
    expect(bigGap).toBeLessThan(smallGap);
  });

  test('dislike_subjects снижает score', () => {
    const base = {
      interests: ['it'], subjects: [], skills: [],
      career_goals: null, ent_score: 0, dislike_fields: [],
    };
    const without = calculateScore({ ...base, dislike_subjects: [] }, itSpecialty, []);
    const with_   = calculateScore({ ...base, dislike_subjects: ['математика'] }, itSpecialty, []);
    expect(with_).toBeLessThan(without);
  });

  test('score в диапазоне 0–100', () => {
    const profile = {
      interests: ['it', 'it', 'it'], subjects: ['it', 'математика'],
      skills: ['it', 'аналитика'], career_goals: 'разработчик приложений',
      ent_score: 0, dislike_subjects: [], dislike_fields: [],
    };
    const s = calculateScore(profile, itSpecialty, ['it', 'технологии']);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });

  test('пустой профиль → 0', () => {
    const empty = { interests: [], subjects: [], skills: [], career_goals: null,
                    ent_score: 0, dislike_subjects: [], dislike_fields: [] };
    expect(calculateScore(empty, itSpecialty, [])).toBe(0);
  });
});

// ─── buildReason ─────────────────────────────────────────────
describe('buildReason', () => {
  const spec = {
    tags: ['it'], required_subjects: ['математика'],
    required_skills: ['аналитика'], demand_level: 'очень высокая',
    has_grant: true, min_score: 90,
  };

  test('упоминает совпавшие предметы', () => {
    const p = { interests: ['it'], subjects: ['математика'], skills: [],
                career_goals: null, ent_score: 95, dislike_subjects: [], dislike_fields: [] };
    expect(buildReason(p, spec, 70, [])).toMatch(/предметы/i);
  });

  test('упоминает грант', () => {
    const p = { interests: ['it'], subjects: [], skills: [],
                career_goals: null, ent_score: 95, dislike_subjects: [], dislike_fields: [] };
    expect(buildReason(p, spec, 60, [])).toMatch(/грант/i);
  });

  test('предупреждение о нехватке баллов', () => {
    const p = { interests: ['it'], subjects: [], skills: [],
                career_goals: null, ent_score: 70, dislike_subjects: [], dislike_fields: [] };
    expect(buildReason(p, spec, 40, [])).toMatch(/баллов ЕНТ/i);
  });

  test('предупреждение о нежелательном', () => {
    const p = { interests: [], subjects: [], skills: [],
                career_goals: null, ent_score: 0,
                dislike_subjects: ['математика'], dislike_fields: [] };
    expect(buildReason(p, spec, 20, [])).toMatch(/нежелательн/i);
  });
});