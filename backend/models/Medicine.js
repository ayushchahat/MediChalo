const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    prescriptionRequired: { type: Boolean, default: false },
}, { timestamps: true });

// Index for faster searching
medicineSchema.index({ name: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;