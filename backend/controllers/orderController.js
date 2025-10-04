const Order = require('../models/Order');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
const Medicine = require('../models/Medicine');
const { generateInvoice } = require('../services/pdfService');
const { calculateETA } = require('../utils/etaCalculator');

// ==========================
// Create a new order from prescription upload
// ==========================
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

    // Notify pharmacy via WebSocket
    const io = req.app.get('io');
    io.to(pharmacyId.toString()).emit('new_order', createdOrder);

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Create a new order from shopping cart
// ==========================
const createOrderFromCart = async (req, res) => {
  const { cartItems, deliveryAddress } = req.body;
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  try {
    const pharmacyGroups = cartItems.reduce((acc, item) => {
      const pharmacyId = item.pharmacy._id.toString();
      if (!acc[pharmacyId]) acc[pharmacyId] = [];
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
        status: 'Approved',
      });

      const createdOrder = await order.save();

      // Deduct stock
      for (const item of orderMedicines) {
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

// ==========================
// Get orders for logged-in user
// ==========================
const getMyOrders = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Customer') query.customer = req.user._id;
    else if (req.user.role === 'DeliveryPartner') query.deliveryPartner = req.user._id;

    const orders = await Order.find(query)
      .populate('pharmacy', 'name')
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Get incoming orders for a pharmacy
// ==========================
const getPharmacyOrders = async (req, res) => {
  try {
    const filter = { pharmacy: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate('customer', 'name email address')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Update an order's status (Pharmacy & Delivery Partner)
// ==========================
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // PHARMACY LOGIC
    const pharmacyStatuses = ['Approved', 'Rejected', 'Ready for Delivery', 'Cancelled'];
    if (req.user.role === 'Pharmacy' && pharmacyStatuses.includes(status)) {
      if (order.pharmacy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized for this order' });
      }

      if (status === 'Approved' && order.status === 'Pending') {
        for (const item of order.medicines) {
          await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } });
        }
      }

      order.status = status;

      // Auto-assign delivery partner
      if (status === 'Ready for Delivery') {
        const availablePartner = await DeliveryPartner.findOne({ isOnline: true });
        if (availablePartner) {
          order.deliveryPartner = availablePartner.user;

          const pharmacyProfile = await Pharmacy.findOne({ user: order.pharmacy });
          const customerProfile = await User.findById(order.customer);

          if (pharmacyProfile && customerProfile) {
            order.eta = calculateETA(
              pharmacyProfile.location.coordinates,
              customerProfile.location.coordinates
            );
          }

          order.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
          const updatedOrder = await order.save();

          const io = req.app.get('io');
          io.to(availablePartner.user.toString()).emit('new_assignment', updatedOrder);

          return res.json(updatedOrder);
        }
      }
    }

    // DELIVERY PARTNER LOGIC
    const partnerStatuses = ['Accepted by Partner', 'Out for Delivery'];
    if (req.user.role === 'DeliveryPartner' && partnerStatuses.includes(status)) {
      if (order.deliveryPartner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      order.status = status;
    }

    const updatedOrder = await order.save();
    const io = req.app.get('io');
    io.to(order.customer.toString()).emit('order_update', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    console.error("ORDER STATUS UPDATE ERROR:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Assign delivery partner manually
// ==========================
const assignDeliveryPartner = async (req, res) => {
  const { partnerId } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.pharmacy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    const pharmacyProfile = await Pharmacy.findOne({ user: order.pharmacy });
    const customerProfile = await User.findById(order.customer);

    if (pharmacyProfile?.location?.coordinates && customerProfile?.location?.coordinates) {
      order.eta = calculateETA(
        pharmacyProfile.location.coordinates,
        customerProfile.location.coordinates
      );
    }

    order.deliveryPartner = partnerId;
    order.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const updatedOrder = await order.save();
    const io = req.app.get('io');
    io.to(partnerId.toString()).emit('new_assignment', updatedOrder);
    io.to(order.customer.toString()).emit('order_update', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    console.error("ASSIGN PARTNER ERROR:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ==========================
// Confirm delivery with OTP
// ==========================
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

// ==========================
// Download PDF invoice
// ==========================
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name address');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    generateInvoice(order, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================
// Get real-time order tracking details
// ==========================
const getOrderTrackingDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name location address')
      .populate({
        path: 'pharmacy',
        select: 'name pharmacyProfile',
        populate: { path: 'pharmacyProfile', select: 'shopName location address' }
      })
      .populate('deliveryPartner', 'name location');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isCustomer = order.customer?._id.toString() === req.user.id.toString();
    const isAssignedPartner = order.deliveryPartner?._id.toString() === req.user.id.toString();
    if (!isCustomer && !isAssignedPartner) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    const trackingData = {
      status: order.status,
      eta: order.eta || 'Calculating...',
      pharmacyLocation: order.pharmacy?.pharmacyProfile?.location || null,
      deliveryPartnerLocation: order.deliveryPartner?.location || null,
      customerLocation: order.customer?.location || null
    };

    res.json(trackingData);
  } catch (error) {
    console.error('TRACK ORDER ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
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
  downloadInvoice,
  getOrderTrackingDetails
};
