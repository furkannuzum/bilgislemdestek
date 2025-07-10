const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Birim adı zorunludur.'],
        unique: true,
        trim: true // Baştaki ve sondaki boşlukları temizler
    },
    // Birimler arasında hiyerarşi kurmak için (örn: Fen İşleri -> Park ve Bahçeler)
    // Bu özellik şimdilik opsiyonel, daha sonra eklenebilir.
    parentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', DepartmentSchema);