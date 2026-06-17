const specialtiesService = require('../services/specialtiesService');

async function getSpecialties(req, res, next) {
  try {
    const { educationLevel, search } = req.query;
    const specialties = await specialtiesService.getSpecialties({ educationLevel, search });
    res.json(specialties);
  } catch (error) {
    next(error);
  }
}

async function getSpecialtyById(req, res, next) {
  try {
    const specialty = await specialtiesService.getSpecialtyById(req.params.id);
    res.json(specialty);
  } catch (error) {
    next(error);
  }
}

module.exports = { getSpecialties, getSpecialtyById };
