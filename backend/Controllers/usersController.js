const User = require('../Models/User');
const bcrypt = require('bcryptjs');

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private (Admin, ITAgent)
exports.getUsers = async (req, res) => {
    try {
        // URL'den role query'sini al: ?role=Admin,ITAgent
        const roles = req.query.role?.split(',') || [];

        let query = {};
        if (roles.length > 0) {
            query.role = { $in: roles };
        }

        const users = await User.find(query)
            .select('-password')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası: ' + error.message });
    }
};


// @desc    Yeni bir kullanıcı oluştur (Admin/ITAgent tarafından)
// @route   POST /api/users
// @access  Private (Admin, ITAgent)
exports.createUser = async (req, res) => {
    try {
        const { fullName, email, password, role, departmentId } = req.body;

        // Gerekli alan kontrolü
        if (!fullName || !email || !password || !role || !departmentId) {
            return res.status(400).json({ success: false, message: 'Lütfen tüm alanları doldurun: fullName, email, password, role, departmentId.' });
        }

        // E-posta daha önce kullanılmış mı diye kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' });
        }

        // Şifreyi hash'le
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcıyı veritabanına kaydet
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role,
            departmentId
        });
        
        // Cevapta şifreyi asla geri gönderme!
        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        res.status(201).json({ success: true, data: userResponse });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
    
};
// ... getUsers ve createUser fonksiyonları aynı ...

// @desc    Bir kullanıcıyı güncelle (Admin tarafından)
// @route   PUT /api/users/:id
// @access  Private (Admin, ITAgent)
exports.updateUser = async (req, res) => {
    try {
        // Şifre hariç diğer bilgileri güncelle
        const { fullName, email, role, departmentId } = req.body;
        const userToUpdate = { fullName, email, role, departmentId };

        const user = await User.findByIdAndUpdate(req.params.id, userToUpdate, {
            new: true, // Güncellenmiş belgeyi geri döndür
            runValidators: true // Modeldeki kuralları çalıştır
        }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        res.status(200).json({ success: true, data: user });
    } catch(error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
 
// @desc    Bir kullanıcıyı sil (Admin tarafından)
// @route   DELETE /api/users/:id
// @access  Private (Admin, ITAgent)
exports.deleteUser = async (req, res) => {
    try {
         const user = await User.findById(req.params.id);
         if (!user) {
             return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
         }

         // TODO: Bu kullanıcının ticket'larını ve taleplerini ne yapacağımıza karar vermeliyiz.
         // Şimdilik direkt siliyoruz.
         await user.deleteOne(); // Mongoose 5+ için .remove() yerine .deleteOne()

         res.status(200).json({ success: true, data: {} });
    } catch(error) {
         res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};
// TODO: İleride updateUser ve deleteUser fonksiyonlarını da buraya ekleyebiliriz.
// @desc    Tek bir kullanıcıyı getir
// @route   GET /api/users/:id
// @access  Private (Admin, ITAgent)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('departmentId', 'name');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};