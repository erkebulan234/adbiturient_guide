import * as adminRepository from '../repositories/adminRepository.js';

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function duplicate(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function handlePgError(error, duplicateMessage) {
  if (error.code === '23505') throw duplicate(duplicateMessage);
  throw error;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

async function getStats() {
  return adminRepository.getStats();
}

// ── Institutions ──────────────────────────────────────────────────────────────

async function createInstitution(data) {
  try {
    return await adminRepository.createInstitution(data);
  } catch (error) {
    handlePgError(error, 'Такое учебное заведение уже существует');
  }
}

async function updateInstitution(id, data) {
  try {
    const institution = await adminRepository.updateInstitution(id, data);
    if (!institution) throw notFound('Учебное заведение не найдено');
    return institution;
  } catch (error) {
    handlePgError(error, 'Такое учебное заведение уже существует');
  }
}

async function deleteInstitution(id) {
  const deleted = await adminRepository.deleteInstitution(id);
  if (!deleted) throw notFound('Учебное заведение не найдено');
}

// ── Specialties ───────────────────────────────────────────────────────────────

async function createSpecialty(data) {
  try {
    return await adminRepository.createSpecialty(data);
  } catch (error) {
    handlePgError(error, 'Такая специальность уже существует');
  }
}

async function updateSpecialty(id, data) {
  try {
    const specialty = await adminRepository.updateSpecialty(id, data);
    if (!specialty) throw notFound('Специальность не найдена');
    return specialty;
  } catch (error) {
    handlePgError(error, 'Такая специальность уже существует');
  }
}

async function deleteSpecialty(id) {
  const deleted = await adminRepository.deleteSpecialty(id);
  if (!deleted) throw notFound('Специальность не найдена');
}

// ── Programs ──────────────────────────────────────────────────────────────────

async function createProgram(data) {
  try {
    return await adminRepository.createProgram(data);
  } catch (error) {
    handlePgError(error, 'Такая программа уже существует');
  }
}

async function updateProgram(id, data) {
  try {
    const program = await adminRepository.updateProgram(id, data);
    if (!program) throw notFound('Программа не найдена');
    return program;
  } catch (error) {
    handlePgError(error, 'Такая программа уже существует');
  }
}

async function deleteProgram(id) {
  const deleted = await adminRepository.deleteProgram(id);
  if (!deleted) throw notFound('Программа не найдена');
}

export {
  getStats,
  createInstitution, updateInstitution, deleteInstitution,
  createSpecialty,   updateSpecialty,   deleteSpecialty,
  createProgram,     updateProgram,     deleteProgram
};
