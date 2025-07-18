const express = require('express');
const router = express.Router();

// 1. Controller'dan gerekli tüm fonksiyonları import et
const {
    createUser,
    getUsers,
    updateUser,
    deleteUser
} = require('../Controllers/usersController');

// 2. Yetkilendirme middleware'lerini import et
const { protect, authorize } = require('../middleware/auth');


// --- ROTA TANIMLAMALARI ---

// 3. Bu dosyadaki tüm rotaların korunmasını ve sadece yetkili rollerin erişmesini sağla
// Bu, her rotaya tek tek 'protect' ve 'authorize' eklemekten daha temiz bir yoldur.
router.use(protect);
router.use(authorize('Admin', 'ITAgent'));


// 4. Zincirleme metot ile aynı URL'e gelen farklı isteklere cevap ver
// 'GET /api/users' isteği gelirse getUsers çalışsın.
// 'POST /api/users' isteği gelirse createUser çalışsın.
router.route('/')
    .get(getUsers)
    .post(createUser);


// 5. İleride ID'ye göre işlem yapacak rotaları da buraya ekleyeceğiz
router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);
    
module.exports = router;