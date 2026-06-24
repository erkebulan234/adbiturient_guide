import { Router } from 'express';

import authMiddleware from '../middleware/authMiddleware.js';
import * as recommendationsController from '../controllers/recommendationsController.js';
import pool from '../config/db.js';

const router = Router();

router.post('/generate', authMiddleware, recommendationsController.generateRecommendations);
router.get('/', authMiddleware, recommendationsController.getRecommendations);

// POST /api/recommendations/:id/event
// Фиксирует view / save / apply / dismiss для Collaborative Filtering
const ALLOWED_EVENTS = ['view', 'save', 'apply', 'dismiss'];

router.post('/:id/event', authMiddleware, async (req, res, next) => {
  try {
    const { event } = req.body;
    const recommendationId = Number(req.params.id);

    if (!Number.isInteger(recommendationId) || recommendationId <= 0) {
      return res.status(400).json({ message: 'Некорректный id рекомендации' });
    }

    if (!ALLOWED_EVENTS.includes(event)) {
      return res.status(400).json({ message: `Неизвестное событие: ${event}. Допустимые: ${ALLOWED_EVENTS.join(', ')}` });
    }

    const rec = await pool.query(
      'SELECT program_id, specialty_id FROM recommendations WHERE id = $1 AND user_id = $2',
      [recommendationId, req.user.id]
    );

    if (rec.rows.length === 0) {
      return res.status(404).json({ message: 'Рекомендация не найдена' });
    }

    const { program_id, specialty_id } = rec.rows[0];

    await pool.query(
      `INSERT INTO recommendation_events
         (user_id, recommendation_id, program_id, specialty_id, event)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, recommendationId, program_id, specialty_id, event]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;