const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Medicines within an order
    medicines: [
      {
        // Optional: allows custom meds from prescriptions not in pharmacy DB
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        name: { type: String, required: true },
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

    // Billing details
    totalAmount: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, default: 5 },

    // Order lifecycle status
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
        'Payment Failed',
      ],
      default: 'Pending',
    },

    // Address details
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },

    // Payment details
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Card', 'UPI', 'COD'], // Cash on Delivery
    },
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

// Optional: Automatically calculate total before saving
orderSchema.pre('save', function (next) {
  this.totalAmount = this.medicines.reduce((sum, item) => sum + item.price * item.quantity, 0) + (this.deliveryFee || 0);
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
