import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import validateBody from '../middleware/validateBody.js';
import {
  institutionSchema,
  specialtySchema,
  programSchema
} from '../validators/schemas.js';

const isAdmin = [authMiddleware, roleMiddleware('admin')];
const router = Router();

router.get('/stats', ...isAdmin, adminController.getStats);

router.post('/institutions', ...isAdmin, validateBody(institutionSchema), adminController.createInstitution);
router.put('/institutions/:id', ...isAdmin, validateBody(institutionSchema), adminController.updateInstitution);
router.delete('/institutions/:id', ...isAdmin, adminController.deleteInstitution);

router.post('/specialties', ...isAdmin, validateBody(specialtySchema), adminController.createSpecialty);
router.put('/specialties/:id', ...isAdmin, validateBody(specialtySchema), adminController.updateSpecialty);
router.delete('/specialties/:id', ...isAdmin, adminController.deleteSpecialty);

router.post('/programs', ...isAdmin, validateBody(programSchema), adminController.createProgram);
router.put('/programs/:id', ...isAdmin, validateBody(programSchema), adminController.updateProgram);
router.delete('/programs/:id', ...isAdmin, adminController.deleteProgram);

export default router;