const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Customer', 'Pharmacy', 'DeliveryPartner'],
        required: true,
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: { lat: Number, lng: Number }
    },
    isVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
    // IMPORTANT: Ensure virtual fields are included when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// NEW: Virtual property to link a User to their Pharmacy profile
// This allows us to easily populate the pharmacy details from the User model.
userSchema.virtual('pharmacyProfile', {
  ref: 'Pharmacy',      // The model to use
  localField: '_id',    // Find in Pharmacy where 'user'
  foreignField: 'user', // is equal to this user's '_id'
  justOne: true         // We only expect one pharmacy profile per user
});

const User = mongoose.model('User', userSchema);
module.exports = User;

