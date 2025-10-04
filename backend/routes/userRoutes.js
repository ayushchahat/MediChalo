// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateUserLocation,  // ✅ add import here
  updateOnboarding,
  updateDeliveryStatus
} = require('../controllers/userController');

const { protect, hasRole } = require('../middleware/authMiddleware');
const { uploadDocs } = require('../middleware/uploadMiddleware');

// @route   GET /api/users/profile
// @desc    Get the profile of the logged-in user, including role-specific details.
// @access  Private (All roles)
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Update profile (Customer only)
// @access  Private (Customer)
router.put('/profile', protect, hasRole(['Customer']), updateProfile);

// ✅ NEW: Route for updating user location
// @route   PUT /api/users/location
// @desc    Update the logged-in user's location
// @access  Private (All roles)
router.put('/location', protect, updateUserLocation);

// @route   PUT /api/users/onboarding
// @desc    Handle the onboarding form submission for Pharmacy and Delivery Partners.
// @access  Private (Pharmacy, DeliveryPartner)
router.put(
  '/onboarding',
  protect,
  hasRole(['Pharmacy', 'DeliveryPartner']),
  uploadDocs,
  updateOnboarding
);

// @route   PUT /api/users/status
// @desc    Toggle the online/offline status for a Delivery Partner.
// @access  Private (DeliveryPartner)
router.put(
  '/status',
  protect,
  hasRole(['DeliveryPartner']),
  updateDeliveryStatus
);

module.exports = router;
