const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { recommend } = require('../services/recommender');
const prisma = new PrismaClient();

router.post('/generate', auth, async (req, res) => {
  try {
    const { test_result_id } = req.body;
    const userId = req.user.id;

    const [profile, achievements, testResult, professions, programs] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.achievement.findMany({ where: { userId } }),
      test_result_id ? prisma.testResult.findUnique({ where: { id: test_result_id } }) : null,
      prisma.profession.findMany({ include: { specialties: true } }),
      prisma.program.findMany({ include: { specialty: true, institution: true } }),
    ]);

    const userData = {
      educationLevel: profile?.educationLevel,
      entScore: achievements.find(a => a.type === 'ent_score')?.grade,
      interests: profile?.interests || [],
      favoriteSubjects: profile?.favoriteSubjects || [],
      achievements,
      city: profile?.city,
      institutionTypePref: profile?.institutionTypePref,
      personalityType: testResult?.personalityType,
    };

    const results = recommend(userData, professions, programs);

    // Сохранить рекомендации в БД
    const saved = [];
    for (const r of results) {
      for (const prog of r.programs.slice(0, 3)) {
        const rec = await prisma.recommendation.create({
          data: {
            userId,
            testResultId: test_result_id || null,
            professionId: r.profession.id,
            programId: prog.id,
            matchScore: r.matchScore,
            matchReason: `Совпадение по сфере ${r.profession.sphere}`,
          },
        });
        saved.push(rec);
      }
    }

    res.json({ professions: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const recs = await prisma.recommendation.findMany({
      where: { userId: req.user.id },
      include: { profession: true, program: { include: { specialty: true, institution: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(recs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const rec = await prisma.recommendation.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
      include: { profession: true, program: { include: { specialty: true, institution: true } } },
    });
    if (!rec) return res.status(404).json({ error: 'Не найдено' });
    res.json(rec);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
