const Ticket = require('../Models/Ticket');

// @desc    Tüm ticket'ları getir (filtreli ve yetkiye göre)
// @route   GET /api/tickets
exports.getTickets = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'Admin' || req.user.role === 'ITAgent') {
            query = Ticket.find();
        } else {
            query = Ticket.find({ openedBy: req.user.id });
        }
        
        const tickets = await query
            .populate('openedBy', 'fullName email')
            .populate('department', 'name')
            .populate('category', 'name')
            .populate('assignedTo', 'fullName')
            .sort({ createdAt: -1 }); // En yeni ticket'lar en üstte görünsün

        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası: ' + error.message });
    }
};
// @desc    Tek bir ticket'ın detayını getir
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => { // <-- EKSİK OLAN FONKSİYON BU
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('openedBy', 'fullName email')
            .populate('department', 'name')
            .populate('category', 'name')
            .populate('assignedTo', 'fullName')
            .populate('history.user', 'fullName');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket bulunamadı.' });
        }

        // Yetki kontrolü: Kullanıcı Admin/ITAgent değilse ve ticket'ı kendi açmamışsa, göremez.
        if (req.user.role === 'EndUser' && ticket.openedBy._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Bu ticket\'ı görüntüleme yetkiniz yok.' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};


// @desc    Yeni ticket oluştur
// @route   POST /api/tickets
exports.createTicket = async (req, res) => {
    try {
        req.body.openedBy = req.user.id;
        req.body.department = req.user.departmentId;

        req.body.history = [{
            user: req.user.id,
            action: `Ticket oluşturuldu.`
        }];

        const ticket = await Ticket.create(req.body);

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Ticket'ı güncelle (durum, atama, yorum ekleme vb.)
// @route   PUT /api/tickets/:id
exports.updateTicket = async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket bulunamadı.' });
        }

        const { status, assignedTo, comment } = req.body;
        let action = "Ticket güncellendi.";
        
        // Sadece durum değişirse...
        if (status && ticket.status !== status) {
            ticket.status = status;
            action = `Durum '${status}' olarak değiştirildi.`;
            ticket.history.push({ user: req.user.id, action });
            if (status === 'Resolved' && !ticket.resolvedAt) ticket.resolvedAt = Date.now();
            if (status === 'Closed' && !ticket.closedAt) ticket.closedAt = Date.now();
        }
        
        // Sadece atama değişirse...
        if (assignedTo && ticket.assignedTo?.toString() !== assignedTo) {
            ticket.assignedTo = assignedTo;
            // Not: assignedTo bir ID olduğu için, ismini almak için populate gerekir. Şimdilik ID'yi gösterelim.
            action = `Ticket ${assignedTo} ID'li kullanıcıya atandı.`;
            ticket.history.push({ user: req.user.id, action });
        }
        
        // Eğer bir yorum ekleniyorsa...
        if (comment) {
            action = `Yeni bir yorum ekledi.`;
            ticket.history.push({ user: req.user.id, action: action, comment: comment });
        }

        await ticket.save();

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// YENİ FONKSİYON
// @desc    Bir ticket'a dosya yükle
// @route   PUT /api/tickets/:id/upload
// @access  Private
exports.uploadAttachment = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket bulunamadı.' });
        }

        // Yüklenen dosya yoksa hata ver
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Lütfen bir dosya seçin.' });
        }

        // Dosyanın erişilebilir URL'ini oluştur (örn: /uploads/screenshot-12345.png)
        const filePath = `/uploads/${req.file.filename}`;

        // Dosya yolunu ticket'ın attachments dizisine ekle
        ticket.attachments.push(filePath);
        
        // History kaydı ekle
        ticket.history.push({
            user: req.user.id,
            action: `Bir dosya ekledi: ${req.file.originalname}`
        });

        await ticket.save();

        res.status(200).json({ success: true, data: ticket });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Dosya yüklenirken bir hata oluştu: ' + error.message });
    }
};