const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../Controllers/categoriesController');

// Yetkilendirme middleware'lerini import et
const { protect, authorize } = require('../middleware/auth');

// Zincirleme rota tanımı (aynı URL'e gelen farklı metodları birleştirir)
router.route('/')
    .get(protect, getCategories) // Kategori listelemek için sadece giriş yapmak yeterli
    .post(protect, authorize('Admin'), createCategory); // Kategori oluşturmak için Admin olmak GEREKLİ

router.route('/:id')
    .put(protect, authorize('Admin'), updateCategory) // Güncellemek için Admin olmak GEREKLİ
    .delete(protect, authorize('Admin'), deleteCategory); // Silmek için Admin olmak GEREKLİ

module.exports = router;