import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as profileController from '../controllers/profileController.js';
import validateBody from '../middleware/validateBody.js';
import { saveProfileSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', authMiddleware, profileController.getProfile);
router.post('/', authMiddleware, validateBody(saveProfileSchema), profileController.saveProfile);
router.put('/', authMiddleware, validateBody(saveProfileSchema), profileController.saveProfile);

export default router;