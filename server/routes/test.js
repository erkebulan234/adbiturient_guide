const router = require('express').Router();
const auth = require('../middleware/auth');

// TODO: реализовать маршруты для /test
router.get('/', auth, (req, res) => res.json({ message: 'test route' }));

module.exports = router;
