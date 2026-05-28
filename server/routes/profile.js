const router = require('express').Router();
const auth = require('../middleware/auth');

// TODO: реализовать маршруты для /profile
router.get('/', auth, (req, res) => res.json({ message: 'profile route' }));

module.exports = router;
