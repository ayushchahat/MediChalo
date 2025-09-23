const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    licensePath: { type: String, required: true },
    gstPath: { type: String, required: true },
    logoPath: { type: String },
    workingHours: {
        start: String,
        end: String,
    },
    offDays: [String], // e.g., ['Sunday', 'Monday']
    onboardingComplete: { type: Boolean, default: false }, // Crucial for dashboard access
}, { timestamps: true });

// Ensure a user can only have one pharmacy profile
pharmacySchema.index({ user: 1 }, { unique: true });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
module.exports = Pharmacy;
