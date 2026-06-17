const institutionsService = require('../services/institutionsService');

async function getInstitutions(req, res, next) {
  try {
    const { type, city, search } = req.query;
    const institutions = await institutionsService.getInstitutions({ type, city, search });
    res.json(institutions);
  } catch (error) {
    next(error);
  }
}

module.exports = { getInstitutions };
