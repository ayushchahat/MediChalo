const Order = require('../models/Order');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
const Medicine = require('../models/Medicine');
const { generateInvoice } = require('../services/pdfService');
const { calculateETA } = require('../utils/etaCalculator');

// ==========================
// Helper: Simulate Payment
// ==========================
const simulatePayment = (paymentMethod) => {
  if (paymentMethod === 'Card' || paymentMethod === 'UPI') {
    return Math.random() > 0.1; // 90% success
  }
  return true; // COD always succeeds
};

// ==========================
// Create Prescription Order
// ==========================
const createPrescriptionOrder = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: 'No prescription file uploaded.' });

  try {
    const pharmacyUser = await User.findOne({ role: 'Pharmacy' });
    if (!pharmacyUser)
      return res.status(404).json({ message: 'No pharmacies available.' });

    const order = new Order({
      customer: req.user._id,
      pharmacy: pharmacyUser._id,
      status: 'Pending',
      prescriptionImage: req.file.path,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
    });

    const createdOrder = await order.save();
    const io = req.app.get('io');
    io.to(pharmacyUser._id.toString()).emit('new_order', createdOrder);

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("PRESCRIPTION ORDER ERROR:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ==========================
// Update Prescription Order
// ==========================
const updatePrescriptionOrder = async (req, res) => {
  const { medicines } = req.body;

  if (!medicines || medicines.length === 0)
    return res.status(400).json({ message: 'At least one medicine is required.' });

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.pharmacy.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Not authorized for this order.' });
    if (order.status !== 'Pending')
      return res.status(400).json({ message: 'This order is no longer pending.' });

    const totalAmount = medicines.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    order.medicines = medicines;
    order.totalAmount = totalAmount;
    order.status = 'Approved';

    // Decrease stock
    for (const item of medicines) {
      await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } });
    }

    const updatedOrder = await order.save();
    const io = req.app.get('io');
    io.to(order.customer.toString()).emit('order_update', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    console.error("UPDATE PRESCRIPTION ERROR:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Create Regular Order
// ==========================
const createOrder = async (req, res) => {
  const { orderItems, pharmacyId, deliveryAddress, totalAmount, paymentMethod } = req.body;
  if (!orderItems || orderItems.length === 0)
    return res.status(400).json({ message: 'No order items provided' });
  if (!paymentMethod)
    return res.status(400).json({ message: 'Payment method is required.' });

  try {
    const isPaymentSuccessful = simulatePayment(paymentMethod);

    const order = new Order({
      customer: req.user._id,
      pharmacy: pharmacyId,
      medicines: JSON.parse(orderItems),
      deliveryAddress: JSON.parse(deliveryAddress),
      totalAmount,
      prescriptionImage: req.file ? req.file.path : null,
      paymentMethod,
      status: isPaymentSuccessful ? 'Approved' : 'Payment Failed',
      paymentStatus: isPaymentSuccessful
        ? (paymentMethod === 'COD' ? 'Pending' : 'Completed')
        : 'Failed',
    });

    const createdOrder = await order.save();
    const io = req.app.get('io');
    io.to(pharmacyId.toString()).emit('new_order', createdOrder);

    res.status(isPaymentSuccessful ? 201 : 402).json({
      message: isPaymentSuccessful
        ? 'Order placed successfully!'
        : 'Payment failed. Please try again.',
      order: createdOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Create Order from Cart
// ==========================
const createOrderFromCart = async (req, res) => {
  const { cartItems, deliveryAddress, paymentMethod } = req.body;
  if (!cartItems || cartItems.length === 0)
    return res.status(400).json({ message: 'Cart is empty' });
  if (!paymentMethod)
    return res.status(400).json({ message: 'Payment method is required.' });

  try {
    const isPaymentSuccessful = simulatePayment(paymentMethod);

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
        if (!medInDb || medInDb.quantity < item.quantity)
          throw new Error(`Insufficient stock for ${item.name}`);
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
        paymentMethod,
        status: isPaymentSuccessful ? 'Approved' : 'Payment Failed',
        paymentStatus: isPaymentSuccessful
          ? (paymentMethod === 'COD' ? 'Pending' : 'Completed')
          : 'Failed',
      });

      const createdOrder = await order.save();

      if (isPaymentSuccessful) {
        for (const item of orderMedicines) {
          await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } });
        }
      }

      createdOrders.push(createdOrder);
    }

    if (!isPaymentSuccessful)
      return res.status(402).json({ message: "Payment failed. Please try again.", orders: createdOrders });

    res.status(201).json({ message: "Order(s) placed successfully!", orders: createdOrders });

  } catch (error) {
    console.error("CART ORDER ERROR:", error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// ==========================
// Get Orders for Logged-in User
// ==========================
const getMyOrders = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'Customer') query.customer = req.user._id;
    else if (req.user.role === 'DeliveryPartner') query.deliveryPartner = req.user._id;

    const orders = await Order.find(query)
      .populate('pharmacy', 'shopName location address')
      .populate('customer', 'name location address')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Get Orders for Pharmacy
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
// Update Order Status
// ==========================
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const pharmacyStatuses = ['Approved', 'Rejected', 'Ready for Delivery', 'Cancelled'];
    const partnerStatuses = ['Accepted by Partner', 'Out for Delivery'];

    // --- Pharmacy Actions ---
    if (req.user.role === 'Pharmacy' && pharmacyStatuses.includes(status)) {
      if (order.pharmacy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

      if (status === 'Approved' && order.status === 'Pending') {
        for (const item of order.medicines)
          await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } });
      }

      order.status = status;

      if (status === 'Ready for Delivery') {
        const activeOrders = await Order.find({ status: { $in: ['Accepted by Partner', 'Out for Delivery'] } });
        const activePartnerIds = activeOrders.map(o => o.deliveryPartner);

        const availablePartners = await DeliveryPartner.find({ isOnline: true, user: { $nin: activePartnerIds } });
        if (availablePartners.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePartners.length);
          const selectedPartner = availablePartners[randomIndex];
          order.deliveryPartner = selectedPartner.user;

          const pharmacyProfile = await Pharmacy.findOne({ user: order.pharmacy });
          const customerProfile = await User.findById(order.customer);

          if (pharmacyProfile && customerProfile) {
            order.eta = calculateETA(pharmacyProfile.location.coordinates, customerProfile.location.coordinates);
          }

          order.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
          const updatedOrder = await order.save();

          const io = req.app.get('io');
          io.to(selectedPartner.user.toString()).emit('new_assignment', updatedOrder);
          return res.json(updatedOrder);
        } else {
          await order.save();
          return res.status(200).json({ ...order.toObject(), message: "Order is ready, but no free delivery partners are available." });
        }
      }
    }

    // --- Delivery Partner Actions ---
    if (req.user.role === 'DeliveryPartner' && partnerStatuses.includes(status)) {
      if (order.deliveryPartner?.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized for this order' });
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
// Assign Delivery Partner Manually
// ==========================
const assignDeliveryPartner = async (req, res) => {
  const { partnerId } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.pharmacy.toString() !== req.user._id.toString())
      return res.status(404).json({ message: 'Order not found or not authorized' });

    const pharmacyProfile = await Pharmacy.findOne({ user: order.pharmacy });
    const customerProfile = await User.findById(order.customer);

    if (pharmacyProfile?.location?.coordinates && customerProfile?.location?.coordinates) {
      order.eta = calculateETA(pharmacyProfile.location.coordinates, customerProfile.location.coordinates);
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
// Confirm Delivery via OTP
// ==========================
const confirmDelivery = async (req, res) => {
  const { otp } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.deliveryPartner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (order.deliveryOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

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
// Process Refund
// ==========================
const processRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.paymentStatus !== 'Completed')
      return res.status(400).json({ message: 'Only completed orders can be refunded.' });

    order.status = 'Cancelled';
    order.paymentStatus = 'Refunded';

    for (const item of order.medicines) {
      await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: item.quantity } });
    }

    await order.save();
    res.json({ message: 'Order refunded and stock restored successfully.' });
  } catch (error) {
    console.error("REFUND ERROR:", error);
    res.status(500).json({ message: 'Server error while processing refund.' });
  }
};

// ==========================
// Download Invoice
// ==========================
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name address');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.customer._id.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Not authorized to access this invoice' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    generateInvoice(order, res);
  } catch (error) {
    console.error("INVOICE DOWNLOAD ERROR:", error);
    res.status(500).json({ message: 'Server error while generating invoice' });
  }
};

// ==========================
// Real-Time Order Tracking
// ==========================
const getOrderTrackingDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({ path: 'customer', select: 'name location address' })
      .populate({ path: 'pharmacy', select: 'shopName location address' })
      .populate('deliveryPartner', 'name location');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isCustomer = order.customer?._id.toString() === req.user.id.toString();
    const isAssignedPartner = order.deliveryPartner?._id.toString() === req.user.id.toString();
    if (!isCustomer && !isAssignedPartner)
      return res.status(403).json({ message: 'Not authorized' });

    const trackingData = {
      status: order.status,
      eta: order.eta || 'Calculating...',
      pharmacyLocation: order.pharmacy?.location || null,
      deliveryPartnerLocation: order.deliveryPartner?.location || null,
      customerLocation: order.customer?.location || null,
    };

    res.json(trackingData);
  } catch (error) {
    console.error('TRACK ORDER ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================
// Module Exports
// ==========================
module.exports = {
  createPrescriptionOrder,
  updatePrescriptionOrder,
  createOrder,
  createOrderFromCart,
  getMyOrders,
  getPharmacyOrders,
  updateOrderStatus,
  assignDeliveryPartner,
  confirmDelivery,
  downloadInvoice,
  getOrderTrackingDetails,
  processRefund,
};
