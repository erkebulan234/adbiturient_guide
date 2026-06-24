// routes/eventsRoutes.js
// POST /api/recommendations/:id/event
// Фиксирует view / save / apply / dismiss для будущего CF

import { Router } from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const ALLOWED_EVENTS = ['view', 'save', 'apply', 'dismiss'];

const router = Router();

router.post('/:id/event', authMiddleware, async (req, res) => {
  try {
    const { event } = req.body;
    const recommendationId = Number(req.params.id);

    if (!ALLOWED_EVENTS.includes(event)) {
      return res.status(400).json({ message: `Неизвестное событие: ${event}` });
    }

    // Берём program_id и specialty_id из рекомендации
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
    console.error('eventsRoute error:', err);
    res.status(500).json({ message: 'Ошибка записи события' });
  }
});

export default router;