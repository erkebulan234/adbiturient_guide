import * as institutionsService from '../services/institutionsService.js';

async function getInstitutions(req, res, next) {
  try {
    const { type, city, search } = req.query;
    const institutions = await institutionsService.getInstitutions({ type, city, search });
    res.json(institutions);
  } catch (error) {
    next(error);
  }
}

export { getInstitutions };
