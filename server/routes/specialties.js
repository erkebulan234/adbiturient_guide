const router = require('express').Router();
const auth = require('../middleware/auth');

// TODO: реализовать маршруты для /specialties
router.get('/', auth, (req, res) => res.json({ message: 'specialties route' }));

module.exports = router;
