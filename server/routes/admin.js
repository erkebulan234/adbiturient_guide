const router = require('express').Router();
const auth = require('../middleware/auth');

// TODO: реализовать маршруты для /admin
router.get('/', auth, (req, res) => res.json({ message: 'admin route' }));

module.exports = router;
