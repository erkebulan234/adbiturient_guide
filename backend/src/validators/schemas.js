const { z } = require('zod');

// ─── Auth ────────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Имя обязательно').max(120).optional(),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль минимум 6 символов').max(128)
});

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен')
});

// ─── Profile ─────────────────────────────────────────────────────────────────

const saveProfileSchema = z.object({
  educationLevel: z.enum(['grade_9', 'grade_11'], {
    errorMap: () => ({ message: 'Уровень образования: grade_9 или grade_11' })
  }),
  city: z.string().trim().max(120).optional().nullable(),
  interests: z.array(z.string().trim()).max(30).optional().default([]),
  subjects: z.array(z.string().trim()).max(30).optional().default([]),
  skills: z.array(z.string().trim()).max(30).optional().default([]),
  careerGoals: z.string().trim().max(1000).optional().nullable(),
  entScore: z.number().int().min(0).max(140).optional().nullable(),
  dislikeSubjects: z.array(z.string().trim()).max(30).optional().default([]),
  dislikeFields: z.array(z.string().trim()).max(30).optional().default([])
});

// ─── Test ────────────────────────────────────────────────────────────────────

const submitTestSchema = z.object({
  answers: z
    .array(z.number().int().positive('ID ответа должен быть положительным числом'))
    .min(1, 'Ответы обязательны')
});

// ─── Admin — Institution ─────────────────────────────────────────────────────

const institutionSchema = z.object({
  name: z.string().trim().min(1, 'Название обязательно').max(255),
  type: z.enum(['college', 'university'], {
    errorMap: () => ({ message: 'Тип: college или university' })
  }),
  city: z.string().trim().min(1, 'Город обязателен').max(120),
  address: z.string().trim().max(500).optional().nullable(),
  website: z.string().url('Некорректный URL сайта').max(500).optional().nullable().or(z.literal('')),
  description: z.string().trim().max(2000).optional().nullable()
});

// ─── Admin — Specialty ───────────────────────────────────────────────────────

const specialtySchema = z.object({
  title: z.string().trim().min(1, 'Название обязательно').max(255),
  code: z.string().trim().max(50).optional().nullable(),
  educationLevel: z.enum(['grade_9', 'grade_11'], {
    errorMap: () => ({ message: 'Уровень: grade_9 или grade_11' })
  }),
  profession: z.string().trim().max(255).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  requiredSubjects: z.array(z.string().trim()).max(20).optional().default([]),
  requiredSkills: z.array(z.string().trim()).max(20).optional().default([]),
  averageSalary: z.string().trim().max(120).optional().nullable(),
  demandLevel: z.string().trim().max(120).optional().nullable(),
  tags: z.array(z.string().trim()).max(30).optional().default([])
});

// ─── Admin — Program ─────────────────────────────────────────────────────────

const programSchema = z.object({
  institutionId: z.number().int().positive('Укажите учебное заведение'),
  specialtyId: z.number().int().positive('Укажите специальность'),
  tuitionFee: z.number().int().min(0).optional().nullable(),
  durationYears: z.number().int().min(1).max(10).optional().nullable(),
  studyLanguage: z.string().trim().max(80).optional().nullable(),
  studyForm: z.string().trim().max(80).optional().nullable(),
  requiredDocuments: z.array(z.string().trim()).max(20).optional().default([]),
  minScore: z.number().int().min(0).max(140).optional().default(0),
  hasGrant: z.boolean().optional().default(false)
});

module.exports = {
  registerSchema,
  loginSchema,
  saveProfileSchema,
  submitTestSchema,
  institutionSchema,
  specialtySchema,
  programSchema
};
