const Ticket = require("../Models/Ticket");
const DeviceRequest = require("../Models/DeviceRequest");
const User = require("../Models/User"); // <-- BU SATIRIN EKLENDİĞİNDEN EMİN OL!

exports.getStats = async (req, res) => {
  try {
    const userFilter = {};
    const requestFilter = {};

    if (req.user.role === "EndUser") {
      userFilter.openedBy = req.user.id;
      requestFilter.requestedBy = req.user.id;
    }

    const [totalTickets, openTickets, pendingDeviceRequests] =
      await Promise.all([
        Ticket.countDocuments(userFilter),
        Ticket.countDocuments({
          ...userFilter,
          status: { $in: ["New", "InProgress"] },
        }),
        DeviceRequest.countDocuments({
          ...requestFilter,
          status: "PendingApproval",
        }),
      ]);

    const stats = {
      totalTickets,
      openTickets,
      pendingDeviceRequests,
    };

    // Admin ve ITAgent için ek istatistikler. Bu blok sadece bu roller için çalışacak.
    if (req.user.role !== "EndUser") {
      // Bu kısım artık hata vermemeli.
      // İleride daha fazla global istatistik ekleyebiliriz.
      // Şimdilik bu kısmı boş bırakarak bile test edebiliriz.
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("getStats Hatası:", error); // Hata olursa terminalde görmek için log ekleyelim.
    res
      .status(500)
      .json({ success: false, message: "Sunucu Hatası: " + error.message });
  }
};
