const DeviceRequest = require('../Models/DeviceRequest');

// @desc    Tüm cihaz taleplerini getir (yetkiye göre)
// @route   GET /api/devicerequests
// @access  Private
exports.getDeviceRequests = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'Admin' || req.user.role === 'ITAgent') {
            query = DeviceRequest.find();
        } else {
            query = DeviceRequest.find({ requestedBy: req.user.id });
        }
        
        const requests = await query
            .populate('requestedBy', 'fullName email')
            .populate('department', 'name')
            .populate('productCategory', 'name');

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası: ' + error.message });
    }
};

// @desc    Yeni cihaz talebi oluştur
// @route   POST /api/devicerequests
// @access  Private
exports.createDeviceRequest = async (req, res) => {
    try {
        req.body.requestedBy = req.user.id;
        // Kullanıcının departmanını da doğrudan kullanıcı bilgisinden alalım
        req.body.department = req.user.departmentId; 

        if (!req.body.department) {
             return res.status(400).json({ success: false, message: 'Kullanıcının birim bilgisi bulunamadı. Lütfen profilinizi güncelleyin.' });
        }

        req.body.history = [{
            user: req.user.id,
            action: `Cihaz talebi oluşturuldu.`
        }];

        const request = await DeviceRequest.create(req.body);

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cihaz talebini güncelle (onay/red süreci)
// @route   PUT /api/devicerequests/:id
// @access  Private (Admin)
exports.updateDeviceRequest = async (req, res) => {
    try {
        let request = await DeviceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Cihaz talebi bulunamadı.' });
        }

        // Sadece Admin'ler onay/red yapabilir.
        const { status, rejectionReason } = req.body;
        let action = `Talep güncellendi.`;

        if (status) {
            request.status = status;
            action = `Talep durumu '${status}' olarak güncellendi.`;
            if (status === 'Rejected' && rejectionReason) {
                request.rejectionReason = rejectionReason;
                action += ` Sebep: ${rejectionReason}`;
            }
        }
        
        request.history.push({ user: req.user.id, action });
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Tek bir cihaz talebini getir
// @route   GET /api/devicerequests/:id
// @access  Private
exports.getDeviceRequestById = async (req, res) => {
    try {
        const request = await DeviceRequest.findById(req.params.id)
            .populate('requestedBy', 'fullName email')
            .populate('department', 'name')
            .populate('productCategory', 'name')
            .populate('history.user', 'fullName');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
        }

        // EndUser sadece kendi talebini görebilir
        if (req.user.role === 'EndUser' && request.requestedBy._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Bu talebi görme yetkiniz yok.' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Sunucu hatası: ' + err.message });
    }
};