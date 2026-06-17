const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const favoritesController = require('../controllers/favoritesController');

router.get('/',           authMiddleware, favoritesController.getFavorites);
router.get('/ids',        authMiddleware, favoritesController.getFavoriteIds);
router.post('/:programId',   authMiddleware, favoritesController.addFavorite);
router.delete('/:programId', authMiddleware, favoritesController.removeFavorite);

module.exports = router;
