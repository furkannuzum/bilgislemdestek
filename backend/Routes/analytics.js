const express = require('express');
const router = express.Router();
const { getStats } = require('../Controllers/analyticsController');

// Sadece protect'i bırakıyoruz
const { protect } = require('../middleware/auth');

// Rota artık sadece giriş yapmış olmayı (protect) gerektiriyor,
// belirli bir role sahip olmayı (authorize) değil.
router.get('/stats', protect, getStats); // <-- 'authorize(...)' buradan kaldırıldı!

module.exports = router;