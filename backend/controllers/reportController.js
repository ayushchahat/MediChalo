const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const mongoose = require('mongoose');

// @desc    Get key statistics for the pharmacy dashboard
// @route   GET /api/reports/dashboard-stats
// @access  Private (Pharmacy)
const getDashboardStats = async (req, res) => {
    try {
        const pharmacyId = new mongoose.Types.ObjectId(req.user._id);

        // 1. Today's Sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const salesResult = await Order.aggregate([
            { $match: { pharmacy: pharmacyId, status: 'Delivered', updatedAt: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const todaysSales = salesResult.length > 0 ? salesResult[0].total : 0;

        // 2. Pending Orders
        const pendingOrders = await Order.countDocuments({ pharmacy: pharmacyId, status: 'Pending' });

        // 3. Total Stock & Low Stock Items
        const stockResult = await Medicine.aggregate([
            { $match: { pharmacy: pharmacyId } },
            { 
                $group: { 
                    _id: null, 
                    totalStock: { $sum: '$quantity' },
                    lowStockItems: { $sum: { $cond: [{ $lte: ['$quantity', 10] }, 1, 0] } } // Assuming low stock is <= 10
                } 
            }
        ]);
        const { totalStock = 0, lowStockItems = 0 } = stockResult.length > 0 ? stockResult[0] : {};

        // 4. Sales Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const salesTrend = await Order.aggregate([
            { $match: { pharmacy: pharmacyId, status: 'Delivered', updatedAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    dailySales: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Recent Orders
        const recentOrders = await Order.find({ pharmacy: pharmacyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name');

        res.json({
            todaysSales,
            pendingOrders,
            totalStock,
            lowStockItems,
            salesTrend,
            recentOrders
        });

    } catch (error) {
        console.error("DASHBOARD STATS ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getDashboardStats
};

