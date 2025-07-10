const multer = require('multer');
const path = require('path');

// Dosya depolama ayarları
const storage = multer.diskStorage({
    // Dosyanın nereye kaydedileceğini belirtir
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    // Dosyanın adının ne olacağını belirtir
    filename: function (req, file, cb) {
        // Dosya adının benzersiz olmasını sağlamak için tarih ve rastgele bir sayı ekliyoruz.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Orijinal dosya adının uzantısını koruyoruz (örn: .png, .jpg)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Dosya filtresi (sadece belirli dosya türlerine izin vermek için)
const fileFilter = (req, file, cb) => {
    // Sadece resim dosyalarına izin ver
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true); // Dosyayı kabul et
    } else {
        cb(new Error('Sadece .jpeg, .png veya .gif formatındaki resim dosyaları yüklenebilir.'), false); // Dosyayı reddet
    }
};

// Multer yapılandırması
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB dosya boyutu limiti
    },
    fileFilter: fileFilter
});

module.exports = upload;