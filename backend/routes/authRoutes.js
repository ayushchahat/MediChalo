const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// --- AUTH ROUTES ---
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

// --- PASSWORD RESET ROUTES ---
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
