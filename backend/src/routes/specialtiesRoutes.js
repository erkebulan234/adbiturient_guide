import { Router } from 'express';
import * as specialtiesController from '../controllers/specialtiesController.js';

const router = Router();

router.get('/', specialtiesController.getSpecialties);
router.get('/:id', specialtiesController.getSpecialtyById);

export default router;