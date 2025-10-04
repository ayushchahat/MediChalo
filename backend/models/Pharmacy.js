const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    licensePath: { type: String, required: true },
    gstPath: { type: String, required: true },
    logoPath: { type: String },
    workingHours: { start: String, end: String },
    offDays: [String],
    onboardingComplete: { type: Boolean, default: false },

    // Location for mapping
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },

}, { timestamps: true });

// Unique index for user
pharmacySchema.index({ user: 1 }, { unique: true });
// 2dsphere index for geospatial queries
pharmacySchema.index({ location: '2dsphere' });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
module.exports = Pharmacy;
