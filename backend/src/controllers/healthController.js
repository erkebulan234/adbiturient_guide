import * as healthService from '../services/healthService.js';

async function getHealth(req, res, next) {
  try {
    const health = await healthService.getHealth();

    res.json(health);
  } catch (error) {
    next(error);
  }
}

export {
  getHealth
};