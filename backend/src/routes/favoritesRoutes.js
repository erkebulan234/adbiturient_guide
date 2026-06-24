import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as favoritesController from '../controllers/favoritesController.js';

const router = Router();

router.get('/',           authMiddleware, favoritesController.getFavorites);
router.get('/ids',        authMiddleware, favoritesController.getFavoriteIds);
router.post('/:programId',   authMiddleware, favoritesController.addFavorite);
router.delete('/:programId', authMiddleware, favoritesController.removeFavorite);

export default router;
