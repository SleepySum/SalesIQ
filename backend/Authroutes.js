const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register  (Consider restricting this in production)
router.post('/register', register);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;