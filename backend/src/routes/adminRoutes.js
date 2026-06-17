const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');
const validateBody = require('../middleware/validateBody');
const { institutionSchema, specialtySchema, programSchema } = require('../validators/schemas');

const isAdmin = [authMiddleware, roleMiddleware('admin')];

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

module.exports = router;