import * as recommendationsService from '../services/recommendationsService.js';

async function generateRecommendations(req, res, next) {
  try {
    const recommendations = await recommendationsService.generate(req.user.id);
    res.json({ message: 'Рекомендации сформированы', recommendations });
  } catch (error) {
    next(error);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const recommendations = await recommendationsService.getForUser(req.user.id);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
}

export { generateRecommendations, getRecommendations };
