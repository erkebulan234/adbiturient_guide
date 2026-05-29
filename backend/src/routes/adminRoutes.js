const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.getStats
);

router.post(
  '/institutions',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.createInstitution
);

router.post(
  '/specialties',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.createSpecialty
);

router.post(
  '/programs',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.createProgram
);

router.put(
  '/institutions/:id',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.updateInstitution
);

router.delete(
  '/institutions/:id',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.deleteInstitution
);

router.put(
  '/specialties/:id',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.updateSpecialty
);

router.delete(
  '/specialties/:id',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.deleteSpecialty
);

router.put(
  '/programs/:id',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.updateProgram
);

router.delete(
  '/programs/:id',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.deleteProgram
);

module.exports = router;