import { Router } from 'express';
import * as institutionsController from '../controllers/institutionsController.js';

const router = Router();

router.get('/', institutionsController.getInstitutions);

export default router;