const express = require('express');
const router = express.Router();
const {
    getDeviceRequests,
    getDeviceRequestById,
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
    .get(getDeviceRequestById)
    // Cihaz talebini güncelle (onay/red süreci)
    // Cihaz taleplerini sadece Admin'ler güncelleyebilir (onay/red için)
    .put(authorize('Admin'), updateDeviceRequest);

module.exports = router;