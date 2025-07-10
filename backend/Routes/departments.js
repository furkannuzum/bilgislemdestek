const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    createDepartment, 
    deleteDepartment 
} = require('../Controllers/departmentsController');

// Middleware'leri import et
const { protect, authorize } = require('../middleware/auth');

// Rotaları ve yetkilerini tanımla
router.route('/')
    .get(protect, getDepartments) // Tüm birimleri listelemek için sadece giriş yapmak yeterli
    .post(protect, authorize('Admin'), createDepartment); // Yeni birim oluşturmak için hem giriş yapmak hem de 'Admin' olmak GEREKLİ

router.route('/:id')
    .delete(protect, authorize('Admin'), deleteDepartment); // Birim silmek için 'Admin' olmak GEREKLİ

module.exports = router;