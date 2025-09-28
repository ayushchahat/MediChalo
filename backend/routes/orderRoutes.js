const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getPharmacyOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    confirmDelivery,
    downloadInvoice,
    createOrderFromCart
} = require('../controllers/orderController');
const { protect, hasRole } = require('../middleware/authMiddleware');
const { uploadPrescription } = require('../middleware/uploadMiddleware');

// @route   POST /api/orders
// @desc    Create a new order from a prescription upload.
// @access  Private (Customer)
router.post('/', protect, hasRole(['Customer']), uploadPrescription, createOrder);

// @route   POST /api/orders/cart
// @desc    Create a new order from the customer's shopping cart.
// @access  Private (Customer)
router.post('/cart', protect, hasRole(['Customer']), createOrderFromCart);

// @route   GET /api/orders/my-orders
// @desc    Get all orders for the currently logged-in user (Customer or Delivery Partner).
// @access  Private (Customer, DeliveryPartner)
router.get('/my-orders', protect, hasRole(['Customer', 'DeliveryPartner']), getMyOrders);

// @route   GET /api/orders/pharmacy-orders
// @desc    Get all incoming orders for the currently logged-in pharmacy.
// @access  Private (Pharmacy)
router.get('/pharmacy-orders', protect, hasRole(['Pharmacy']), getPharmacyOrders);

// @route   GET /api/orders/:id/invoice
// @desc    Download a PDF invoice for a specific order.
// @access  Private (Customer, Pharmacy)
router.get('/:id/invoice', protect, hasRole(['Customer', 'Pharmacy']), downloadInvoice);

// @route   PUT /api/orders/:id/status
// @desc    Update the status of an order.
// @access  Private (Pharmacy, DeliveryPartner)
router.put('/:id/status', protect, hasRole(['Pharmacy', 'DeliveryPartner']), updateOrderStatus);

// @route   PUT /api/orders/:id/assign
// @desc    Assign a delivery partner to a ready order.
// @access  Private (Pharmacy)
router.put('/:id/assign', protect, hasRole(['Pharmacy']), assignDeliveryPartner);

// @route   PUT /api/orders/:id/confirm-delivery
// @desc    Confirm a successful delivery using an OTP.
// @access  Private (DeliveryPartner)
router.put('/:id/confirm-delivery', protect, hasRole(['DeliveryPartner']), confirmDelivery);

module.exports = router;

