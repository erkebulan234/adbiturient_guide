import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as testController from '../controllers/testController.js';
import validateBody from '../middleware/validateBody.js';
import { submitTestSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', authMiddleware, testController.getTests);
router.get('/results', authMiddleware, testController.getMyResults);
router.get('/:id', authMiddleware, testController.getTestById);
router.post('/:id/submit', authMiddleware, validateBody(submitTestSchema), testController.submitTest);

export default router;