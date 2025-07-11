const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    createDepartment, 
    deleteDepartment 
} = require('../Controllers/departmentsController');

const { protect, authorize } = require('../middleware/auth');

// Rotaları ve yetkilerini tanımla
router.route('/')
    .get(getDepartments) // <-- 'protect' buradan kaldırıldı! Artık herkes erişebilir.
    .post(protect, authorize('Admin'), createDepartment); // Yeni birim oluşturmak hala korumalı.

router.route('/:id')
    .delete(protect, authorize('Admin'), deleteDepartment); // Silmek de korumalı.

module.exports = router;