const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleDetails: {
        type: String, // e.g., 'Bike - KL 01 AB 1234'
        required: true,
    },
    drivingLicensePath: { type: String, required: true },
    vehicleRegistrationPath: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },
}, { timestamps: true });

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
module.exports = DeliveryPartner;