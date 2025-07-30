// controllers/analyticsController.js

const Ticket = require("../Models/Ticket");
const DeviceRequest = require("../Models/DeviceRequest");
const Department = require("../Models/Department");
const User = require("../Models/User");

// controllers/analyticsController.js

exports.getStats = async (req, res) => {
  try {
    // 1. Frontend'den gelen zaman aralığı parametresini al (varsayılan: monthly)
    const trendPeriod = req.query.period || 'monthly';
    
    let trendGrouping, trendSort, trendMatch;
    const now = new Date();

    // 2. Zaman aralığına göre MongoDB sorgusunu dinamik olarak ayarla
    // Zaman aralığına göre MongoDB sorgusunu dinamik olarak ayarla
    switch (trendPeriod) {
      case 'daily': // Son 30 gün, günlük
        trendMatch = { createdAt: { $gte: new Date(new Date().setDate(now.getDate() - 30)) } };
        trendGrouping = { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } }, count: { $sum: 1 } };
        trendSort = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
        break;
      case 'weekly': // Son 26 hafta, haftalık
        trendMatch = { createdAt: { $gte: new Date(new Date().setDate(now.getDate() - (26 * 7))) } };
        trendGrouping = { _id: { year: { $year: "$createdAt" }, week: { $isoWeek: "$createdAt" } }, count: { $sum: 1 } };
        trendSort = { "_id.year": 1, "_id.week": 1 };
        break;
      default: // 'monthly', son 12 ay, aylık (varsayılan)
        trendMatch = { createdAt: { $gte: new Date(new Date().setMonth(now.getMonth() - 12)) } };
        trendGrouping = { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } };
        trendSort = { "_id.year": 1, "_id.month": 1 };
    }

    // Geri kalan sorgular aynı
    const [
      generalStats,
      departmentDistribution,
      ticketsByDepartment,
      monthlyTrend, // Bu artık dinamik olacak
      agentPerformance
    ] = await Promise.all([
      // Genel istatistikleri tek bir sorguda toplayalım
      Promise.all([
        Ticket.countDocuments({}),
        Ticket.countDocuments({ status: { $in: ["New", "InProgress"] } }),
        DeviceRequest.countDocuments({}),
        DeviceRequest.countDocuments({ status: "PendingApproval" }),
      ]).then(([totalTickets, openTickets, totalDeviceRequests, pendingDeviceRequests]) => ({
        totalTickets, openTickets, totalDeviceRequests, pendingDeviceRequests
      })),
      
      Ticket.aggregate([
        { $lookup: { from: "departments", localField: "department", foreignField: "_id", as: "departmentInfo" } },
        { $unwind: "$departmentInfo" },
        { $group: { _id: "$departmentInfo.name", count: { $sum: 1 } } },
        { $project: { departmentName: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),

      Ticket.find({}).populate("openedBy", "fullName").populate("department", "name").sort({ createdAt: -1 }),

      // Dinamik Trend Sorgusu
      Ticket.aggregate([
        { $match: trendMatch },
        { $group: trendGrouping },
        { $sort: trendSort },
        { $project: { date: "$_id", count: 1, _id: 0 } }
      ]),

      Ticket.aggregate([
        { $match: { status: { $in: ["Resolved", "Closed"] }, assignedTo: { $exists: true } } },
        { $lookup: { from: "users", localField: "assignedTo", foreignField: "_id", as: "agentInfo" } },
        { $unwind: "$agentInfo" },
        { $group: { _id: "$agentInfo.fullName", resolvedTickets: { $sum: 1 } } },
        { $project: { agentName: "$_id", resolvedTickets: 1, _id: 0 } },
        { $sort: { resolvedTickets: -1 } }
      ])
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        generalStats,
        departmentDistribution,
        ticketsByDepartment,
        monthlyTrend,
        agentPerformance
      } 
    });

  } catch (error) {
    console.error("getStats Hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu Hatası: " + error.message });
  }
};