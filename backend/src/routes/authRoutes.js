const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validateBody');
const { registerSchema, loginSchema } = require('../validators/schemas');

router.post('/register',   validateBody(registerSchema), authController.register);
router.post('/login',      validateBody(loginSchema),    authController.login);
router.post('/google',     authController.googleLogin);
router.post('/refresh',    authController.refresh);
router.post('/logout',     authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);

module.exports = router;