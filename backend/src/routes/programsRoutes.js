const router = require('express').Router();
const programsController = require('../controllers/programsController');

router.get('/', programsController.getPrograms);

module.exports = router;