const mongoose = require('mongoose');

const DeviceRequestSchema = new mongoose.Schema({
    requestId: { // Cihaz talepleri için okunaklı ID (örn: REQ-2023-001)
        type: String,
        unique: true,
        // required: true
    },
    requestedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department',
        required: true
    },
    // Not: Buradaki kategori, type'ı 'Product' olan bir kategoridir.
    productCategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    // Kullanıcının talep ettiği cihaza dair ek notlar veya özellikler
    specs: {
        type: String,
        required: [true, 'Lütfen talep ettiğiniz cihaza dair bir açıklama veya özellik belirtin.'],
        maxlength: [500, 'Açıklama 500 karakterden fazla olamaz.']
    },
    // Cihaz taleplerinin durumu, Ticket'lardan biraz daha farklı olabilir.
    status: {
        type: String,
        enum: ['PendingApproval', 'Approved', 'Rejected', 'Ordered', 'Delivered', 'Cancelled'],
        default: 'PendingApproval'
    },
    // Onay/Reddetme ile ilgili notlar
    rejectionReason: {
        type: String
    },
    // Ticket'larda olduğu gibi, her değişikliği takip etmek için.
    history: [{
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        action: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Ticket modelindeki gibi, otomatik olarak okunaklı bir Request ID oluşturalım.
DeviceRequestSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastRequest = await this.constructor.findOne({}, {}, { sort: { 'createdAt' : -1 } });
        let newIdNumber = 1;
        if (lastRequest && lastRequest.requestId) {
            const lastIdNumber = parseInt(lastRequest.requestId.split('-')[2]);
            newIdNumber = lastIdNumber + 1;
        }
        const year = new Date().getFullYear();
        this.requestId = `REQ-${year}-${String(newIdNumber).padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('DeviceRequest', DeviceRequestSchema);