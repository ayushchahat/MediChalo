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
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    locationCaptured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
    // IMPORTANT: These options are required for virtual properties to be included in the response.
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- Pre-save hooks and methods ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- VIRTUAL PROPERTIES ---
// This creates a virtual link from a User document to its corresponding Pharmacy profile.
// This is ESSENTIAL for the query in your orderController.js to work.
userSchema.virtual('pharmacyProfile', {
  ref: 'Pharmacy',      // The model to link to
  localField: '_id',    // Find in Pharmacy where the 'user' field
  foreignField: 'user', // matches this document's '_id'
  justOne: true         // We only expect one profile per user
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
module.exports = User;

