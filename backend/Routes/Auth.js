const express = require('express');
const router = express.Router();

// Controller fonksiyonlarını import et
const { register, login } = require('../Controllers/AuthController');

// Rotaları tanımla
router.post('/register', register);
router.post('/login', login);

module.exports = router;