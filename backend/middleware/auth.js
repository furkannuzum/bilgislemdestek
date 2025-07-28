const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Kullanıcı kimlik doğrulama middleware'i (cookie tabanlı JWT)
exports.protect = async (req, res, next) => {
    let token = null;

    // 1. Token'ı cookie'den al
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // 2. Token yoksa, yetkisiz!
    if (!token) {
        return res.status(401).json({ success: false, message: 'Yetkisiz: Token bulunamadı.' });
    }

    try {
        // 3. Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Kullanıcıyı bul, şifreyi dahil etme
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Yetkisiz: Kullanıcı bulunamadı.' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Yetkisiz: Token geçersiz.' });
    }
};

// Yetki (rol) kontrolü yapan middleware
exports.authorize = (...roles) => {
    // Birden fazla rolü parametre olarak alır
    return (req, res, next) => {
        // protect middleware'i req.user'ı eklemiş olmalı!
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Yetkisiz: Kullanıcı bilgisi yok.' });
        }

        // Kullanıcının rolü parametrelerde yoksa erişim engellenir
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Erişim reddedildi: '${req.user.role}' rolü yeterli değil.` 
            });
        }

        next();
    };
};
