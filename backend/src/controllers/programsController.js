const programsService = require('../services/programsService');

async function getPrograms(req, res, next) {
  try {
    const { educationLevel, institutionType, city, page, limit } = req.query;
    const result = await programsService.getPrograms({
      educationLevel, institutionType, city, page, limit
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getPrograms };