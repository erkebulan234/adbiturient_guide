const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');
const validateBody = require('../middleware/validateBody');
const { saveProfileSchema } = require('../validators/schemas');

router.get('/', authMiddleware, profileController.getProfile);
router.post('/', authMiddleware, validateBody(saveProfileSchema), profileController.saveProfile);
router.put('/', authMiddleware, validateBody(saveProfileSchema), profileController.saveProfile);

module.exports = router;