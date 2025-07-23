const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// 1. Ortam değişkenlerini en başta yükle
dotenv.config();

// 2. Rota dosyalarını import et
const authRoutes = require('./Routes/Auth');
const departmentRoutes = require('./Routes/departments');
const categoryRoutes = require('./Routes/categories');
const ticketRoutes = require('./Routes/tickets');
const deviceRequestRoutes = require('./Routes/deviceRequests');
const analyticsRoutes = require('./Routes/analytics');
const usersRoutes = require('./Routes/users');

// 3. Express uygulamasını oluştur
const app = express();

// 4. Veritabanı bağlantısını kur
connectDB(); // Fonksiyonu aşağıda tanımlayacağız

// 5. Middleware'leri uygula (Sıralama Önemli!)
// Temel güvenlik için HTTP başlıklarını ayarla
app.use(helmet());

// CORS'u etkinleştir (YENİ VE DETAYLI AYARLAR)
const corsOptions = {
  // 1. Sadece senin frontend'inden gelen isteklere izin ver
  origin: 'http://mezitlibim.mezitli.bel.tr/proje/', // Nuxt projenin çalıştığı adres
  
  // 2. İzin verilen HTTP metodları
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

  // 3. EN ÖNEMLİ KISIM: Frontend'in gönderebileceği özel başlıklara izin ver
  allowedHeaders: "Content-Type,Authorization" 
};
app.use(cors(corsOptions));

// İstek Sınırlayıcı (Rate Limiter)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 dakika
    max: 150, // 10 dakikada 150 istek
    message: 'Çok fazla istekte bulundunuz, lütfen 10 dakika sonra tekrar deneyin.'
});
app.use('/api', limiter);

// Gelen JSON verilerini okuyabilmek için
app.use(express.json());

// Statik klasörü public yap (resimler, css vb. için)
app.use(express.static(path.join(__dirname, 'public')));

// Güvenlik için veri temizliği
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());


// 6. Rotaları tanımla
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/devicerequests', deviceRequestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);


// Ana Rota (Test için)
app.get('/', (req, res) => {
    res.send('Belediye BT Destek API Çalışıyor!');
});


// Veritabanı bağlantı fonksiyonu
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB bağlantısı başarılı...');
    } catch (err) {
        console.error('MongoDB bağlantı hatası:', err.message);
        process.exit(1);
    }
}

// 7. Sunucuyu dinle
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda başarıyla başlatıldı.`));