const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    // The index is defined on the 'user' field, ensuring efficient lookups.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopName: { type: String, required: true },
    licensePath: { type: String, required: true },
    gstPath: { type: String, required: true },
    logoPath: { type: String },
    workingHours: {
        start: String,
        end: String,
    },
    offDays: [String],
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    onboardingComplete: { type: Boolean, default: false },
}, { timestamps: true });

pharmacySchema.index({ location: '2dsphere' });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
module.exports = Pharmacy;

