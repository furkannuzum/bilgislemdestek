const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kategori adı zorunludur.'],
        trim: true
    },
    // Bu kategori bir 'Destek Talebi' için mi yoksa 'Cihaz Talebi' için mi?
    type: {
        type: String,
        required: true,
        enum: ['Ticket', 'Product']
    }
}, {
    timestamps: true,
    // Aynı türde (type) aynı isimde (name) kategori olmasın.
    unique: ['name', 'type']
});

module.exports = mongoose.model('Category', CategorySchema);