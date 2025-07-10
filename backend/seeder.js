const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config();

// Modelleri import et
const Department = require('./Models/Department');

// Veritabanına bağlan
mongoose.connect(process.env.MONGO_URI);

// Eklenecek veriler
const departments = [
    { name: 'Afet İşleri Müdürlüğü' },
    { name: 'Kadın ve Aile Hizmetleri Müdürlüğü' },
    { name: 'Basın Yayın ve Halkla İlişkiler Müdürlüğü' },
    { name: 'Kültür ve Sosyal İşler Müdürlüğü' },
    { name: 'Bilgi İşlem Müdürlüğü' },
    { name: 'Mali Hizmetler Müdürlüğü' },
    { name: 'Destek Hizmetleri Müdürlüğü' },
    { name: 'Muhtarlık İşleri Müdürlüğü' },
    { name: 'Emlak ve İstimlak Müdürlüğü' },
    { name: 'Özel Kalem Müdürlüğü' },
    { name: 'Evlendirme Memurluğu' },
    { name: 'Park ve Bahçeler Müdürlüğü' },
    { name: 'Fen İşleri Müdürlüğü' },
    { name: 'Plan ve Proje Müdürlüğü' },
    { name: 'Gençlik ve Spor Hizmetleri Müdürlüğü' },
    { name: 'Ruhsat ve Denetim Müdürlüğü' },
    { name: 'Hukuk İşleri Müdürlüğü' },
    { name: 'Strateji Geliştirme Müdürlüğü' },
    { name: 'İklim Değişikliği ve Sıfır Atık Müdürlüğü' },
    { name: 'Temizlik İşleri Müdürlüğü' },
    { name: 'İmar ve Şehircilik Müdürlüğü' },
    { name: 'Veteriner İşleri Müdürlüğü' },
    { name: 'İnsan Kaynakları ve Eğitim Müdürlüğü' },
    { name: 'Yapı Kontrol Müdürlüğü' },
    { name: 'İşletme ve İştirakler Müdürlüğü' },
    { name: 'Yazı İşleri Müdürlüğü' },
    { name: 'Zabıta Müdürlüğü' }
];

// Veriyi import eden fonksiyon
const importData = async () => {
    try {
        // Önce mevcut tüm birimleri silerek temiz bir başlangıç yapalım
        await Department.deleteMany();
        console.log('Mevcut birimler silindi...');

        // Yeni verileri ekle
        await Department.insertMany(departments);
        console.log('27 adet birim başarıyla eklendi!');
        process.exit(); // İşlem bitince programdan çık
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1); // Hata durumunda programdan çık
    }
};

// Veriyi silen fonksiyon
const deleteData = async () => {
    try {
        await Department.deleteMany();
        console.log('Tüm birimler silindi.');
        process.exit();
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
};

// Komut satırından gelen argümanı kontrol et
if (process.argv[2] === '-d') {
    deleteData(); // Eğer komut "node seeder -d" ise veriyi sil
} else {
    importData(); // Diğer tüm durumlarda veriyi import et
}