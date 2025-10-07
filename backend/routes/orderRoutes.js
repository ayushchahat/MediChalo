const express = require('express');
const router = express.Router();

const {
    createPrescriptionOrder,
    createOrder,
    createOrderFromCart,
    getMyOrders,
    getPharmacyOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    confirmDelivery,
    downloadInvoice,
    getOrderTrackingDetails,
    processRefund // Added new controller for refund
} = require('../controllers/orderController');

const { protect, hasRole } = require('../middleware/authMiddleware');
const { uploadPrescription } = require('../middleware/uploadMiddleware');

// ==========================
// Customer Routes
// ==========================

// Create a new order from a prescription upload
router.post(
    '/prescription',
    protect,
    hasRole(['Customer']),
    uploadPrescription,
    createPrescriptionOrder
);

// Create a new order from the customer frontend form
router.post(
    '/',
    protect,
    hasRole(['Customer']),
    uploadPrescription,
    createOrder
);

// Create a new order from the customer's shopping cart
router.post(
    '/cart',
    protect,
    hasRole(['Customer']),
    createOrderFromCart
);

// Get all orders for the currently logged-in user (Customer or Delivery Partner)
router.get(
    '/my-orders',
    protect,
    hasRole(['Customer', 'DeliveryPartner']),
    getMyOrders
);

// Get real-time tracking details of an order (Customer or Delivery Partner)
router.get(
    '/:id/track',
    protect,
    hasRole(['Customer', 'DeliveryPartner']),
    getOrderTrackingDetails
);

// Download a PDF invoice for a specific order
router.get(
    '/:id/invoice',
    protect,
    hasRole(['Customer', 'Pharmacy']),
    downloadInvoice
);

// ==========================
// Pharmacy Routes
// ==========================

// Get all incoming orders for the currently logged-in pharmacy
router.get(
    '/pharmacy-orders',
    protect,
    hasRole(['Pharmacy']),
    getPharmacyOrders
);

// Assign a delivery partner to a ready order
router.put(
    '/:id/assign',
    protect,
    hasRole(['Pharmacy']),
    assignDeliveryPartner
);

// Process refund for an order (Pharmacy-only access)
router.put(
    '/:id/refund',
    protect,
    hasRole(['Pharmacy']),
    processRefund
);

// ==========================
// Status & Delivery Routes
// ==========================

// Update the status of an order (Pharmacy or Delivery Partner)
router.put(
    '/:id/status',
    protect,
    hasRole(['Pharmacy', 'DeliveryPartner']),
    updateOrderStatus
);

// Confirm a successful delivery using an OTP (Delivery Partner)
router.put(
    '/:id/confirm-delivery',
    protect,
    hasRole(['DeliveryPartner']),
    confirmDelivery
);

module.exports = router;
