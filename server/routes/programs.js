const router = require('express').Router();
const auth = require('../middleware/auth');

// TODO: реализовать маршруты для /programs
router.get('/', auth, (req, res) => res.json({ message: 'programs route' }));

module.exports = router;
