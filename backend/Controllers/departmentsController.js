const Department = require('../Models/Department');

// @desc    Tüm birimleri getir
// @route   GET /api/departments
// @access  Private (Giriş yapmış herkes görebilir)
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json({ success: true, count: departments.length, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};

// @desc    Yeni birim oluştur
// @route   POST /api/departments
// @access  Private (Sadece Admin)
exports.createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Birimi sil
// @route   DELETE /api/departments/:id
// @access  Private (Sadece Admin)
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Birim bulunamadı.' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};