const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Kullanıcının giriş yapıp yapmadığını kontrol eden middleware
exports.protect = async (req, res, next) => {
    let token;

    // Token, header'da "Bearer <token>" formatında gönderilir.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Header'dan token'ı al ("Bearer " kısmını atarak)
            token = req.headers.authorization.split(' ')[1];

            // 2. Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Token içindeki id ile kullanıcıyı bul ve şifre olmadan req objesine ekle
            // Bu sayede, bu middleware'den sonraki tüm controller'lar req.user'a erişebilir.
            req.user = await User.findById(decoded.id).select('-password');
            
            // 4. Bir sonraki adıma geç
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Yetkiniz yok, token geçersiz.' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Yetkiniz yok, token bulunamadı.' });
    }
};

// Kullanıcının belirli rollere sahip olup olmadığını kontrol eden middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // `protect` middleware'i `req.user`'ı eklemiş olmalı.
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Bu işlemi yapmak için '${req.user.role}' rolü yetersizdir.` 
            });
        }
        next();
    };
};