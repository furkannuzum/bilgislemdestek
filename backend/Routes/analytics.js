const express = require('express');
const router = express.Router();
const { getStats } = require('../Controllers/analyticsController');

const { protect, authorize } = require('../middleware/auth');

// Bu rotaya sadece Admin ve IT Ajanları erişebilmeli
router.get('/stats', protect, authorize('Admin', 'ITAgent'), getStats);

module.exports = router;