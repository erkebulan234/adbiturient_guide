const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

router.get('/', authMiddleware, profileController.getProfile);
router.post('/', authMiddleware, profileController.saveProfile);
router.put('/', authMiddleware, profileController.saveProfile);

module.exports = router;