const express = require('express');
const router = express.Router();
const {
    getDeviceRequests,
    createDeviceRequest,
    updateDeviceRequest
} = require('../Controllers/deviceRequestsController');

const { protect, authorize } = require('../middleware/auth');

// Tüm rotalar korumalı
router.use(protect);

router.route('/')
    .get(getDeviceRequests)
    .post(createDeviceRequest);

router.route('/:id')
    // Cihaz taleplerini sadece Admin'ler güncelleyebilir (onay/red için)
    .put(authorize('Admin'), updateDeviceRequest);

module.exports = router;