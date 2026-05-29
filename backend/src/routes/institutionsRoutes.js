const router = require('express').Router();
const institutionsController = require('../controllers/institutionsController');

router.get('/', institutionsController.getInstitutions);

module.exports = router;