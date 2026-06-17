const specialtiesRepository = require('../repositories/specialtiesRepository');

async function getSpecialties(filters) {
  return specialtiesRepository.findAll(filters);
}

async function getSpecialtyById(id) {
  const specialty = await specialtiesRepository.findById(id);

  if (!specialty) {
    const error = new Error('Специальность не найдена');
    error.status = 404;
    throw error;
  }

  return specialty;
}

module.exports = { getSpecialties, getSpecialtyById };
