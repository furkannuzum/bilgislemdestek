const mongoose = require('mongoose');

// Ticket geçmişindeki her bir değişikliği (yorum, durum değişikliği vb.) tutmak için küçük bir şema
const HistorySchema = new mongoose.Schema({
    user: { // İşlemi yapan kullanıcı
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    action: { // Yapılan işlem (örn: "Durumu 'InProgress' olarak değiştirdi.")
        type: String,
        required: true
    },
    comment: { // Eğer işlem bir yorum ise, yorum metni
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const TicketSchema = new mongoose.Schema({
    ticketId: { // Kullanıcının göreceği daha okunaklı bir ID (örn: TCK-2023-001)
        type: String,
        unique: true,
        // required: true satırını, hatayı önlemek için siliyoruz.
    },
    title: {
        type: String,
        required: [true, 'Lütfen bir başlık girin.'],
        trim: true,
        maxlength: [100, 'Başlık 100 karakterden fazla olamaz.']
    },
    description: {
        type: String,
        required: [true, 'Lütfen bir açıklama girin.']
    },
    // İlişkisel Alanlar
    department: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department',
        required: true
    },
    category: { // Bu kategori, type'ı 'Ticket' olan bir kategoridir.
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    openedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: { // Bu talebe hangi BT personeli bakıyor?
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    // Durum ve Öncelik
    status: {
        type: String,
        enum: ['New', 'InProgress', 'Resolved', 'Closed', 'Cancelled'],
        default: 'New'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    // YENİ ALAN: Yüklenen dosyaların yollarını bir dizi olarak saklayalım

     attachments: [{
        type: String 
    }],
    // Ticket'a ait tüm geçmiş olaylar ve yorumlar
    history: [HistorySchema],

    // Tarihler
    resolvedAt: { // Sorunun çözüldüğü tarih
        type: Date
    },
    closedAt: { // Ticket'ın tamamen kapatıldığı tarih
        type: Date
    }
}, {
    timestamps: true // `createdAt` ve `updatedAt` alanlarını otomatik ekler.
});

// Kaydetmeden önce otomatik olarak okunaklı bir Ticket ID oluşturan hook.
TicketSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastTicket = await this.constructor.findOne({}, {}, { sort: { 'createdAt' : -1 } });
        let newIdNumber = 1;
        if (lastTicket && lastTicket.ticketId) {
            const lastIdNumber = parseInt(lastTicket.ticketId.split('-')[2]);
            newIdNumber = lastIdNumber + 1;
        }
        const year = new Date().getFullYear();
        this.ticketId = `TCK-${year}-${String(newIdNumber).padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Ticket', TicketSchema);