const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const testController = require('../controllers/testController');

router.get('/', authMiddleware, testController.getTests);
router.get('/results', authMiddleware, testController.getMyResults);
router.get('/:id', authMiddleware, testController.getTestById);
router.post('/:id/submit', authMiddleware, testController.submitTest);

module.exports = router;