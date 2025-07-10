const Category = require('../Models/Category');

// @desc    Tüm kategorileri getir (türe göre filtrelenebilir)
// @route   GET /api/categories?type=Ticket
// @access  Private (Giriş yapmış herkes görebilir)
exports.getCategories = async (req, res) => {
    try {
        let query = {};
        // Eğer URL'de bir 'type' parametresi varsa (örn: ?type=Ticket), sadece o türdeki kategorileri getir.
        if (req.query.type) {
            query.type = req.query.type;
        }

        const categories = await Category.find(query);
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};

// @desc    Yeni kategori oluştur
// @route   POST /api/categories
// @access  Private (Sadece Admin)
exports.createCategory = async (req, res) => {
    try {
        // req.body'den 'name' ve 'type' alanlarını alıyoruz.
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        // Mongoose 'unique' hatası veya 'validation' hatası gelirse yakalar.
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Kategoriyi güncelle
// @route   PUT /api/categories/:id
// @access  Private (Sadece Admin)
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Güncellenmiş veriyi geri döndürür.
            runValidators: true // Güncelleme sırasında modeldeki kuralları (örn: required) çalıştırır.
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Kategori bulunamadı.' });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Kategoriyi sil
// @route   DELETE /api/categories/:id
// @access  Private (Sadece Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Kategori bulunamadı.' });
        }
        
        res.status(200).json({ success: true, data: {} }); // Başarılı silme işleminde boş obje dönebiliriz.
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};