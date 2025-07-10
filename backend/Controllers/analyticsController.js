const Ticket = require('../Models/Ticket');
const DeviceRequest = require('../Models/DeviceRequest');
const mongoose = require('mongoose');

// @desc    Genel dashboard istatistiklerini getir
// @route   GET /api/analytics/stats
// @access  Private (Admin ve ITAgent)
exports.getStats = async (req, res) => {
    try {
        // 1. Ticket Sayıları (Duruma Göre)
        const ticketStatusCounts = await Ticket.aggregate([
            // İlk aşama: Ticket'ları durumlarına göre grupla
            {
                $group: {
                    _id: '$status', // Gruplama anahtarı: status alanı
                    count: { $sum: 1 } // Her gruptaki belge sayısını say
                }
            }
        ]);

        // 2. Cihaz Talebi Sayıları (Duruma Göre)
        const requestStatusCounts = await DeviceRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // 3. Toplam Kullanıcı, Ticket ve Cihaz Talebi Sayıları
        // Bu sorgular paralel olarak çalışsın diye Promise.all kullanıyoruz. Bu daha performanslıdır.
        const [
            totalTickets,
            totalDeviceRequests,
            totalResolvedTickets
        ] = await Promise.all([
            Ticket.countDocuments(),
            DeviceRequest.countDocuments(),
            Ticket.countDocuments({ status: 'Resolved' })
        ]);

        // 4. Ortalama Çözüm Süresi (Average Resolution Time)
        // Bu en karmaşık olanı. Ticket'ın oluşturulma ve çözülme zamanı arasındaki farkı hesaplayacağız.
        const avgResolutionTime = await Ticket.aggregate([
            // Aşama 1: Sadece çözülmüş ('Resolved') ve çözülme tarihi olan ticketları al
            { 
                $match: { 
                    status: 'Resolved',
                    resolvedAt: { $ne: null } // resolvedAt alanı boş olmayanlar
                } 
            },
            // Aşama 2: Yeni bir alan ekle ('resolutionTimeInHours')
            {
                $addFields: {
                    resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] } // Milisaniye cinsinden fark
                }
            },
            // Aşama 3: Tüm ticket'lar için ortalama çözüm süresini hesapla
            {
                $group: {
                    _id: null, // Her şeyi tek bir grupta topla
                    avgTime: { $avg: '$resolutionTime' } // Ortalama al
                }
            }
        ]);
        
        // Sonuçları daha temiz bir formatta birleştirelim
        const stats = {
            totalTickets,
            totalDeviceRequests,
            totalResolvedTickets,
            ticketCountsByStatus: ticketStatusCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            requestCountsByStatus: requestStatusCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            // Ortalama süreyi milisaniyeden saate çevirelim. Eğer hiç çözülmüş ticket yoksa 0 dönsün.
            averageResolutionHours: avgResolutionTime.length > 0 ? (avgResolutionTime[0].avgTime / (1000 * 60 * 60)).toFixed(2) : 0
        };

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu Hatası: ' + error.message });
    }
};