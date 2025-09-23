const Order = require('../models/Order');
const User = require('../models/User');
const { generateInvoice } = require('../services/pdfService');

// @desc    Create a new order from a prescription
// @route   POST /api/orders/upload
// @access  Private (Customer)
const createPrescriptionOrder = async (req, res) => {
    try {
        const { pharmacyId } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Prescription image is required.' });
        if (!pharmacyId) return res.status(400).json({ message: 'A pharmacy must be selected.' });

        const order = new Order({
            customer: req.user._id,
            pharmacy: pharmacyId,
            medicines: [], // Placeholder
            totalAmount: 0, // Will be updated by pharmacy
            prescriptionImage: req.file.path,
            status: 'Pending',
            deliveryAddress: req.user.address
        });

        const createdOrder = await order.save();

        // Notify pharmacy via WebSockets
        const io = req.app.get('io');
        io.to(pharmacyId.toString()).emit('new_order', createdOrder);

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("PRESCRIPTION UPLOAD ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get orders for the logged-in user
// @route   GET /api/orders/my-orders
// @access  Private (Customer, DeliveryPartner)
const getMyOrders = async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'Customer') {
            orders = await Order.find({ customer: req.user._id }).populate('pharmacy', 'name shopName').sort({ createdAt: -1 });
        } else if (req.user.role === 'DeliveryPartner') {
            orders = await Order.find({ deliveryPartner: req.user._id }).populate('customer', 'name address').populate('pharmacy', 'name shopName').sort({ createdAt: -1 });
        }
        res.json(orders);
    } catch (error) {
        console.error("GET ORDERS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get incoming orders for a pharmacy
// @route   GET /api/orders/pharmacy-orders
// @access  Private (Pharmacy)
const getPharmacyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ pharmacy: req.user._id }).populate('customer', 'name email address').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("GET PHARMACY ORDERS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Pharmacy, DeliveryPartner)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const io = req.app.get('io');
        let authorized = false;

        // Pharmacy actions
        if (req.user.role === 'Pharmacy' && order.pharmacy.toString() === req.user._id.toString()) {
            if (['Approved', 'Rejected', 'Assigned'].includes(status)) {
                order.status = status;
                authorized = true;
            }
        }
        // DeliveryPartner actions
        else if (req.user.role === 'DeliveryPartner' && order.deliveryPartner?.toString() === req.user._id.toString()) {
            if (['Accepted by Partner', 'Out for Delivery'].includes(status)) {
                order.status = status;
                authorized = true;
            }
        }

        if (!authorized) return res.status(403).json({ message: 'Not authorized to update this order' });

        const updatedOrder = await order.save();

        // Notify customer and delivery partner
        io.to(order.customer.toString()).emit('order_update', updatedOrder);
        if (order.deliveryPartner) io.to(order.deliveryPartner.toString()).emit('order_update', updatedOrder);

        res.json(updatedOrder);
    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign a delivery partner to an order
// @route   PUT /api/orders/:id/assign
// @access  Private (Pharmacy)
const assignDeliveryPartner = async (req, res) => {
    try {
        const { deliveryPartnerId } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role !== 'Pharmacy' || order.pharmacy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to assign delivery partner' });
        }

        order.deliveryPartner = deliveryPartnerId;
        order.status = 'Assigned';
        const updatedOrder = await order.save();

        const io = req.app.get('io');
        io.to(deliveryPartnerId.toString()).emit('new_assignment', updatedOrder);
        io.to(order.customer.toString()).emit('order_update', updatedOrder);

        res.json(updatedOrder);
    } catch (error) {
        console.error("ASSIGN DELIVERY PARTNER ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Download an invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Private (Customer)
const downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'name address');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.customer._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized to view this invoice' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
        generateInvoice(order, res);
    } catch (error) {
        console.error("INVOICE ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createPrescriptionOrder,
    getMyOrders,
    getPharmacyOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    downloadInvoice
};
