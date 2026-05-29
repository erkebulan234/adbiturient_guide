const router = require('express').Router();
const specialtiesController = require('../controllers/specialtiesController');

router.get('/', specialtiesController.getSpecialties);
router.get('/:id', specialtiesController.getSpecialtyById);

module.exports = router;