const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Define the schema (the blueprint) for user data.
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password']
    },
    role: {
        type: String,
        enum: ['Customer', 'Pharmacy', 'DeliveryPartner'],
        required: true,
    }
}, {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true
});

// 2. Hash password automatically before saving a new user.
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 3. Add a method to the schema for comparing passwords during login.
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 4. Create the Mongoose model from the schema. This model is a special function.
const User = mongoose.model('User', userSchema);

// 5. (CRITICAL) Export the model directly. This is the definitive fix.
// This ensures that when other files 'require' this file, they get the User model function.
module.exports = User;

