const express = require('express');
const router = express.Router();

// 1. Controller'dan 'uploadAttachment' fonksiyonunu da import et.
const {
    getTickets,
    getTicketById, // Bunu da ekleyelim, lazım olabilir.
    createTicket,
    updateTicket,
    uploadAttachment // <-- EKSİK OLAN KISIM BUYDU!
} = require('../Controllers/ticketsController');

const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Tüm ticket rotaları önce giriş yapmayı (protect) gerektirir.
router.use(protect);

router.route('/')
    .get(getTickets)
    .post(createTicket);

// getTicketById için de bir rota ekleyelim.
router.route('/:id')
    .get(getTicketById) 
    .put(updateTicket);

// 2. Dosya yükleme rotasını doğru fonksiyonla çağır.
router.route('/:id/upload')
    .put(upload.single('attachment'), uploadAttachment); // <-- 'exports.' kısmını sildik.

module.exports = router;