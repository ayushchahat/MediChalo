// --- IMPORTS ---
const crypto = require('crypto');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
const generateToken = require('../utils/jwtHelper');
const { validate, signupSchema } = require('../middleware/validationMiddleware');
const { sendPasswordResetEmail } = require('../services/emailService'); // Email service

// --- SIGNUP LOGIC ---
const signup = [
  validate(signupSchema),
  async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    try {
      const userExists = await User.findOne({ $or: [{ email }, { phone }] });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email or phone already exists' });
      }

      const user = await User.create({ name, email, phone, password, role });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
          message: 'Signup successful!',
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error('SIGNUP ERROR:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// --- LOGIN LOGIC ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const responsePayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        locationCaptured: user.locationCaptured,
      };

      if (user.role === 'Pharmacy') {
        const pharmacyProfile = await Pharmacy.findOne({ user: user._id });
        if (pharmacyProfile) responsePayload.pharmacyProfile = pharmacyProfile.toObject();
      } else if (user.role === 'DeliveryPartner') {
        const deliveryProfile = await DeliveryPartner.findOne({ user: user._id });
        if (deliveryProfile) responsePayload.deliveryProfile = deliveryProfile.toObject();
      }

      res.json(responsePayload);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- FORGOT PASSWORD ---
const forgotPassword = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    // Clear token fields if email sending failed
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }
    res.status(500).json({ message: 'Error sending password reset email.' });
  }
};

// --- RESET PASSWORD ---
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- OTP VERIFICATION (Placeholder) ---
const verifyOtp = async (req, res) => {
  res.status(200).json({ message: 'OTP verification placeholder successful' });
};

// --- EXPORT ---
module.exports = {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
