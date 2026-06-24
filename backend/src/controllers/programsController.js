import * as programsService from '../services/programsService.js';

async function getPrograms(req, res, next) {
  try {
    const { educationLevel, institutionType, city, search, page, limit } = req.query;
    const result = await programsService.getPrograms({
      educationLevel, institutionType, city, search, page, limit
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export { getPrograms };