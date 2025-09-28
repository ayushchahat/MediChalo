const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    medicines: [
        {
            medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
            name: String,
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            status: { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' }
        }
    ],
    prescriptionImage: { type: String },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: [
            'Pending',
            'Approved',
            'Rejected',
            'Ready for Delivery', // <-- New status added
            'Accepted by Partner',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ],
        default: 'Pending',
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
    deliveryOtp: String,
    deliveryFee: { type: Number, default: 5 },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

