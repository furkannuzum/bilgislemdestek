const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'E-posta ve şifre alanları zorunludur.' });
        }

        // Şifreyi de çekmek için .select('+password') eklemek, modelde select:false kullanıldığında gereklidir.
        // Bizim modelimizde şifre seçilebilir olduğu için şimdilik gerek yok.
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri.' });
        }

        // JWT Oluştur
        const token = jwt.sign(
            // Token içine kullanıcı hakkında temel bilgileri de ekleyelim
            { id: user._id, role: user.role, fullName: user.fullName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ success: true, token });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu tarafında bir hata oluştu: ' + error.message });
    }
};

// --- YENİ EKLENEN FONKSİYONLAR ---

// @desc    Giriş yapmış kullanıcının profil bilgilerini güncelle
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;

        // req.user, bizim 'protect' middleware'imizden geliyor.
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;

        await user.save();

        // Şifre olmadan kullanıcı verisini geri dön
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId
        };

        res.status(200).json({ success: true, data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası: ' + error.message });
    }
};

// @desc    Giriş yapmış kullanıcının şifresini güncelle
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Şifreyi de çekebilmek için findById sorgusunu bu şekilde kullanmak daha garantidir
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        // Mevcut şifre doğru mu kontrol et
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mevcut şifreniz yanlış.' });
        }
        
        // Yeni şifre en az 6 karakter olmalı (modeldeki kuralı burada da uygulamak iyi bir pratiktir)
        if(newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter olmalıdır.' });
        }

        // Yeni şifreyi hash'le
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        res.status(200).json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
    } catch (error) {
         res.status(500).json({ success: false, message: 'Sunucu Hatası: ' + error.message });
    }
};