const express = require('express');
const router = express.Router();
const { 
    createPrescriptionOrder, 
    getMyOrders, 
    getPharmacyOrders, 
    updateOrderStatus, 
    assignDeliveryPartner,
    downloadInvoice
} = require('../controllers/orderController');
const { protect, hasRole } = require('../middleware/authMiddleware');
const { uploadPrescription } = require('../middleware/uploadMiddleware');

// ------------------ Customer Routes ------------------
// Customer uploads a prescription to create a new order
router.post('/upload', protect, hasRole(['Customer']), uploadPrescription, createPrescriptionOrder);

// Customer or Delivery Partner fetches their orders
router.get('/my-orders', protect, hasRole(['Customer', 'DeliveryPartner']), getMyOrders);

// Customer downloads invoice for a completed order
router.get('/:id/invoice', protect, hasRole(['Customer']), downloadInvoice);

// ------------------ Pharmacy Routes ------------------
// Pharmacy fetches incoming orders
router.get('/pharmacy-orders', protect, hasRole(['Pharmacy']), getPharmacyOrders);

// Pharmacy and Delivery Partner update order status
router.put('/:id/status', protect, hasRole(['Pharmacy', 'DeliveryPartner']), updateOrderStatus);

// Pharmacy assigns a delivery partner to an order
router.put('/:id/assign', protect, hasRole(['Pharmacy']), assignDeliveryPartner);

module.exports = router;
