const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const { generateInvoice } = require('../services/pdfService');

// @desc    Create a new order from a prescription upload
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res) => {
    const { orderItems, pharmacyId, deliveryAddress, totalAmount } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items provided' });
    }

    try {
        const order = new Order({
            customer: req.user._id,
            pharmacy: pharmacyId,
            medicines: JSON.parse(orderItems),
            deliveryAddress: JSON.parse(deliveryAddress),
            totalAmount,
            prescriptionImage: req.file ? req.file.path : null,
        });

        const createdOrder = await order.save();
        const io = req.app.get('io');
        io.to(pharmacyId.toString()).emit('new_order', createdOrder);

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("PRESCRIPTION ORDER ERROR:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new order from a shopping cart
// @route   POST /api/orders/cart
// @access  Private (Customer)
const createOrderFromCart = async (req, res) => {
    const { cartItems, deliveryAddress } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    try {
        // Group items by pharmacy to create separate orders if necessary
        const pharmacyGroups = cartItems.reduce((acc, item) => {
            const pharmacyId = item.pharmacy._id.toString();
            if (!acc[pharmacyId]) {
                acc[pharmacyId] = [];
            }
            acc[pharmacyId].push(item);
            return acc;
        }, {});

        const createdOrders = [];

        for (const pharmacyId in pharmacyGroups) {
            const items = pharmacyGroups[pharmacyId];
            const medicineIds = items.map(item => item._id);
            const medicinesInDb = await Medicine.find({ '_id': { $in: medicineIds } });

            let totalAmount = 0;
            const orderMedicines = items.map(item => {
                const medInDb = medicinesInDb.find(m => m._id.toString() === item._id);
                if (!medInDb || medInDb.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.name}`);
                }
                totalAmount += medInDb.price * item.quantity;
                return {
                    medicineId: medInDb._id,
                    name: medInDb.name,
                    quantity: item.quantity,
                    price: medInDb.price,
                };
            });

            const order = new Order({
                customer: req.user._id,
                pharmacy: pharmacyId,
                medicines: orderMedicines,
                deliveryAddress,
                totalAmount,
                status: 'Approved' // Orders from cart are auto-approved
            });
            const createdOrder = await order.save();
            
            // Deduct stock for each item in the order
            for(const item of orderMedicines) {
                await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } });
            }

            createdOrders.push(createdOrder);
        }
        
        res.status(201).json({ message: "Order(s) placed successfully!", orders: createdOrders });

    } catch (error) {
        console.error("CART ORDER ERROR:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
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
        const orders = await Order.find(query).populate('pharmacy', 'name').populate('customer', 'name').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an order's status
// @route   PUT /api/orders/:id/status
// @access  Private (Pharmacy, DeliveryPartner)
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // Authorization logic here...
        
        order.status = status;
        const updatedOrder = await order.save();
        
        const io = req.app.get('io');
        io.to(order.customer.toString()).emit('order_update', updatedOrder);
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
        order.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        await order.save();
        
        const io = req.app.get('io');
        io.to(partnerId.toString()).emit('new_assignment', order);
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (order.deliveryOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        order.status = 'Delivered';
        order.paymentStatus = 'Completed';
        await order.save();
        
        const io = req.app.get('io');
        io.to(order.customer.toString()).emit('order_update', order);
        
        res.json({ message: 'Delivery confirmed!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Download a PDF invoice
// @route   GET /api/orders/:id/invoice
// @access  Private (Customer, Pharmacy)
const downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'name address');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        // Authorization check...
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
        generateInvoice(order, res);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrder,
    createOrderFromCart,
    getMyOrders,
    getPharmacyOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    confirmDelivery,
    downloadInvoice
};

