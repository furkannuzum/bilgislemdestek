const express = require("express");
const router = express.Router();

// 1. Yeni controller fonksiyonlarını import listesine ekliyoruz.
const {
  login,
  updateProfile,
  updatePassword,
} = require("../Controllers/AuthController");

// 2. Rotaları korumak için 'protect' middleware'ini de import ediyoruz.
const { protect } = require("../middleware/auth");

// --- HERKESE AÇIK (PUBLIC) ROTALAR ---
router.post("/login", login);

// --- KORUMALI (PRIVATE) ROTALAR ---
// Bu rotalara erişmek için kullanıcının giriş yapmış ve geçerli bir
// token göndermiş olması gerekir. `protect` middleware'i bu kontrolü yapar.

// Profil güncelleme rotası
router.put("/updateprofile", protect, updateProfile);

// Şifre güncelleme rotası
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
