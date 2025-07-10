const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// @desc    Yeni kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // YENİ: req.body'den 'departmentId' alanını da alıyoruz.
        const { fullName, email, password, role, departmentId } = req.body;

        // Kontrol: Eğer rol 'EndUser' ise, birim ID'si göndermek zorunlu olsun.
        if (role === 'EndUser' && !departmentId) {
            return res.status(400).json({ success: false, message: "Normal kullanıcılar için birim (departmentId) seçimi zorunludur." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // YENİ: User.create içine 'departmentId' alanını da ekliyoruz.
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role,
            departmentId // Bu alan Admin veya ITAgent için boş olabilir.
        });
        
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId // Cevapta da gönderelim ki kontrol edebilelim.
        };

        res.status(201).json({ success: true, data: userResponse });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Sunucu tarafında bir hata oluştu.' });
    }
};

// ... login fonksiyonu aynı kalacak ...
exports.login = async (req, res) => {
    // ... BU FONKSİYONDA DEĞİŞİKLİK YOK ...
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'E-posta ve şifre alanları zorunludur.' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri.' });
        }

        const createToken = (id, role) => {
            return jwt.sign(
                { id, role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
        };

        const token = createToken(user._id, user.role);

        res.status(200).json({ success: true, token });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu tarafında bir hata oluştu.' });
    }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'E-posta ve şifre alanları zorunludur.' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri.' });
        }

        // --- HATA AYIKLAMA KODU BURADA ---
        console.log('Kullanıcı Giriş Yaptı:', user.email);
        console.log('Kullanılacak Gizli Anahtar:', process.env.JWT_SECRET);
        // --- --- --- --- --- --- --- --- ---

        // JWT Oluştur
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET, // Hata büyük ihtimalle bu satırdaki değerden kaynaklanıyor
            { expiresIn: '1d' }
        );

        res.status(200).json({ success: true, token });

    } catch (error) {
        // Hatanın detayını da konsola yazdıralım
        console.error("JWT SIGN HATASI:", error);
        res.status(500).json({ success: false, message: 'Sunucu tarafında bir hata oluştu.' });
    }
};