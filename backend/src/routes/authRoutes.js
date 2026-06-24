import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateBody from '../middleware/validateBody.js';
import { registerSchema, loginSchema, googleLoginSchema } from '../validators/schemas.js';

const router = Router();

router.post('/register',   validateBody(registerSchema), authController.register);
router.post('/login',      validateBody(loginSchema),    authController.login);
router.post('/google',     validateBody(googleLoginSchema), authController.googleLogin);
router.post('/refresh',    authController.refresh);
router.post('/logout',     authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);

export default router;