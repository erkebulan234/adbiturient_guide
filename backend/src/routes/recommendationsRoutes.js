const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const recommendationsController = require('../controllers/recommendationsController');

router.post('/generate', authMiddleware, recommendationsController.generateRecommendations);
router.get('/', authMiddleware, recommendationsController.getRecommendations);

module.exports = router;