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
    // Profile image
    profileImage: {
        type: String,
        default: '/uploads/default-avatar.png'
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },
    locationCaptured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// --- Pre-save hook to hash password ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Password comparison method ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- Virtual properties ---
userSchema.virtual('pharmacyProfile', {
    ref: 'Pharmacy',
    localField: '_id',
    foreignField: 'user',
    justOne: true,
});

userSchema.virtual('deliveryProfile', {
    ref: 'DeliveryPartner',
    localField: '_id',
    foreignField: 'user',
    justOne: true,
});

// --- Geo index for location ---
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
module.exports = User;
