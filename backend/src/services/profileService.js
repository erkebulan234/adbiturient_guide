import * as profileRepository from '../repositories/profileRepository.js';

function normalizeText(value, maxLength = 500) {
  if (value === null || value === undefined) return null;
  return String(value).trim().slice(0, maxLength) || null;
}

function normalizeTextArray(value, fieldName) {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value)) {
    const error = new Error(`${fieldName} должен быть массивом`);
    error.status = 400;
    throw error;
  }

  return value
    .map(item => String(item).trim())
    .filter(Boolean)
    .slice(0, 30);
}

function normalizeEntScore(value) {
  if (value === null || value === undefined || value === '') return null;

  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 140) {
    const error = new Error('Балл ЕНТ должен быть числом от 0 до 140');
    error.status = 400;
    throw error;
  }

  return Math.round(score);
}

function normalizeEducationLevel(value) {
  const allowed = ['grade_9', 'grade_11'];
  if (!allowed.includes(value)) {
    const error = new Error('Некорректный уровень образования');
    error.status = 400;
    throw error;
  }
  return value;
}

async function getProfile(userId) {
  return profileRepository.findByUserId(userId);
}

async function saveProfile(userId, body) {
  const normalized = {
    educationLevel:  normalizeEducationLevel(body.educationLevel),
    city:            normalizeText(body.city, 120),
    interests:       normalizeTextArray(body.interests,       'interests'),
    subjects:        normalizeTextArray(body.subjects,        'subjects'),
    skills:          normalizeTextArray(body.skills,          'skills'),
    careerGoals:     normalizeText(body.careerGoals, 1000),
    entScore:        normalizeEntScore(body.entScore),
    dislikeSubjects: normalizeTextArray(body.dislikeSubjects, 'dislikeSubjects'),
    dislikeFields:   normalizeTextArray(body.dislikeFields,   'dislikeFields')
  };

  return profileRepository.upsert(userId, normalized);
}

export { getProfile, saveProfile };
