const express = require('express');
const router = express.Router();
const { getDeliveryHistory, getEarnings } = require('../controllers/deliveryController');
const { protect, hasRole } = require('../middleware/authMiddleware');

router.get('/history', protect, hasRole(['DeliveryPartner']), getDeliveryHistory);
router.get('/earnings', protect, hasRole(['DeliveryPartner']), getEarnings);

module.exports = router;
