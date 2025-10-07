const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    medicines: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Rejected'],
          default: 'Pending',
        },
      },
    ],

    prescriptionImage: { type: String },

    // Allows prescription-only orders
    totalAmount: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, default: 5 },

    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
        'Ready for Delivery',
        'Accepted by Partner',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Payment Failed', // Added new status
      ],
      default: 'Pending',
    },

    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },

    // NEW: Payment method field
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Card', 'UPI', 'COD'], // Cash on Delivery
    },

    // Enhanced payment status
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      required: true,
      default: 'Pending',
    },

    deliveryOtp: String,
    eta: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
