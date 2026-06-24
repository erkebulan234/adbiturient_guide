import { Router } from 'express';
import * as programsController from '../controllers/programsController.js';

const router = Router();

router.get('/', programsController.getPrograms);

export default router;