const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'İsim ve soyisim alanı zorunludur.']
    },
    email: {
        type: String,
        required: [true, 'E-posta alanı zorunludur.'],
        unique: true, // Her e-posta adresi sadece bir kez kayıt olabilir.
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Lütfen geçerli bir e-posta adresi giriniz.'
        ]
    },
    password: {
        type: String,
        required: [true, 'Şifre alanı zorunludur.'],
        minlength: 6 // Şifre en az 6 karakter olmalı.
    },
    role: {
        type: String,
        enum: ['EndUser', 'ITAgent', 'Admin'], // Kullanıcı sadece bu 3 rolden birine sahip olabilir.
        default: 'EndUser' // Yeni kayıt olan kullanıcı varsayılan olarak 'EndUser' olur.
    },
    departmentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department' // Bu alanın 'Department' modeline bir referans olduğunu belirtiriz. (Şimdilik boş kalabilir)
    }
}, {
    timestamps: true // Otomatik olarak `createdAt` ve `updatedAt` alanları ekler.
});

// Şifreyi hash'leme işlemini burada da yapabilirdik ama Controller'da yapmak daha anlaşılır.

module.exports = mongoose.model('User', UserSchema);