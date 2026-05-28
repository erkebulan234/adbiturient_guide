const router = require('express').Router();
const auth = require('../middleware/auth');

// TODO: реализовать маршруты для /institutions
router.get('/', auth, (req, res) => res.json({ message: 'institutions route' }));

module.exports = router;
