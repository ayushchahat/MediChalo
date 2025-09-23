const Order = require('../models/Order');

// @desc    Get delivery history for a partner
// @route   GET /api/delivery/history
// @access  Private (DeliveryPartner)
const getDeliveryHistory = async (req, res) => {
    try {
        const deliveries = await Order.find({
            deliveryPartner: req.user._id,
            status: 'Delivered'
        }).sort({ updatedAt: -1 }).populate('pharmacy', 'shopName').populate('customer', 'name');

        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get earnings overview for a partner
// @route   GET /api/delivery/earnings
// @access  Private (DeliveryPartner)
const getEarnings = async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $match: { deliveryPartner: new mongoose.Types.ObjectId(req.user.id), status: 'Delivered' } },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$deliveryFee' },
                    totalDeliveries: { $sum: 1 }
                }
            }
        ]);

        const earnings = result.length > 0 ? result[0] : { totalEarnings: 0, totalDeliveries: 0 };
        res.json(earnings);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDeliveryHistory, getEarnings };
