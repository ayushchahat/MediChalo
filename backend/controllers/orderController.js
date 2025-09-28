const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { generateInvoice } = require('../services/pdfService');

// @desc    Create a new order from a prescription
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res) => {
    // Note: In a real app, complex logic would find the best pharmacy.
    // Here we assume the frontend sends the pharmacyId.
    const { orderItems, pharmacyId, deliveryAddress, totalAmount } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const order = new Order({
            customer: req.user._id,
            pharmacy: pharmacyId,
            // In a real app, orderItems might come from a pharmacy's quote.
            // Here it's simplified.
            medicines: JSON.parse(orderItems), 
            deliveryAddress: JSON.parse(deliveryAddress),
            totalAmount,
            prescriptionImage: req.file ? req.file.path : null,
        });

        const createdOrder = await order.save();

        // Notify the specific pharmacy via WebSockets
        const io = req.app.get('io');
        io.to(pharmacyId.toString()).emit('new_order', createdOrder);

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get orders for the logged-in user (Customer or Delivery Partner)
// @route   GET /api/orders/my-orders
// @access  Private (Customer, DeliveryPartner)
const getMyOrders = async (req, res) => {
    try {
        const query = {};
        if (req.user.role === 'Customer') {
            query.customer = req.user._id;
        } else if (req.user.role === 'DeliveryPartner') {
            query.deliveryPartner = req.user._id;
        }

        const orders = await Order.find(query)
            .populate('pharmacy', 'name') // Show pharmacy name
            .populate('customer', 'name') // Show customer name
            .sort({ createdAt: -1 }); // Show newest first

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get incoming orders for a pharmacy, with status filtering
// @route   GET /api/orders/pharmacy-orders
// @access  Private (Pharmacy)
const getPharmacyOrders = async (req, res) => {
    try {
        const filter = { pharmacy: req.user._id };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const orders = await Order.find(filter)
            .populate('customer', 'name email address')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update an order's status
// @route   PUT /api/orders/:id/status
// @access  Private (Pharmacy, DeliveryPartner)
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const allowedPharmacyStatuses = ['Approved', 'Rejected', 'Ready for Delivery', 'Cancelled'];
        const allowedPartnerStatuses = ['Accepted by Partner', 'Out for Delivery'];

        // Logic for Pharmacy
        if (req.user.role === 'Pharmacy' && allowedPharmacyStatuses.includes(status)) {
            if (order.pharmacy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized for this order' });
            }
            if (status === 'Approved' && order.status === 'Pending') {
                for (const item of order.medicines) {
                    await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } });
                }
            }
            order.status = status;
        } 
        // Logic for Delivery Partner
        else if (req.user.role === 'DeliveryPartner' && allowedPartnerStatuses.includes(status)) {
            if (order.deliveryPartner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized for this order' });
            }
            order.status = status;
        } else {
            return res.status(403).json({ message: 'Status update not allowed for your role or this order state.' });
        }
        
        const updatedOrder = await order.save();
        
        // Notify customer of the status change in real-time
        const io = req.app.get('io');
        io.to(order.customer.toString()).emit('order_update', updatedOrder);

        res.json(updatedOrder);

    } catch (error) {
         console.error("ORDER STATUS UPDATE ERROR:", error);
         res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign a delivery partner to an order
// @route   PUT /api/orders/:id/assign
// @access  Private (Pharmacy)
const assignDeliveryPartner = async (req, res) => {
    const { partnerId } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.pharmacy.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Order not found or not authorized' });
        }

        order.deliveryPartner = partnerId;
        // Generate a 4-digit OTP for secure delivery confirmation
        order.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        
        const updatedOrder = await order.save();
        
        // Notify the specific delivery partner of the new assignment
        const io = req.app.get('io');
        io.to(partnerId.toString()).emit('new_assignment', updatedOrder);
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Confirm delivery with OTP
// @route   PUT /api/orders/:id/confirm-delivery
// @access  Private (DeliveryPartner)
const confirmDelivery = async (req, res) => {
    const { otp } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.deliveryPartner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this delivery' });
        }
        if (order.deliveryOtp !== otp) {
            return res.status(400).json({ message: 'Invalid delivery OTP' });
        }
        order.status = 'Delivered';
        order.paymentStatus = 'Completed'; // Assuming cash on delivery
        await order.save();
        
        const io = req.app.get('io');
        io.to(order.customer.toString()).emit('order_update', order);

        res.json({ message: 'Delivery confirmed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Download an invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Private (Customer)
const downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'name address');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.customer._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Set headers to tell the browser to download the file as a PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
        generateInvoice(order, res); // Call the PDF generation service
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getPharmacyOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    confirmDelivery,
    downloadInvoice
};

