// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateUserAddress,      // ✅ new controller for updating address
  updateUserLocation,
  updateOnboarding,
  updateDeliveryStatus,
  updatePharmacyProfile,
} = require('../controllers/userController');

const { protect, hasRole } = require('../middleware/authMiddleware');
const { uploadDocs } = require('../middleware/uploadMiddleware');

// -------------------------
// USER PROFILE ROUTES
// -------------------------

// @route   GET /api/users/profile
// @desc    Get the profile of the logged-in user, including role-specific details.
// @access  Private (All roles)
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Update profile (Customer only)
// @access  Private (Customer)
router.put('/profile', protect, hasRole(['Customer']), updateProfile);

// @route   PUT /api/users/address
// @desc    Update address manually (Customer only)
// @access  Private (Customer)
router.put('/address', protect, hasRole(['Customer']), updateUserAddress);

// @route   PUT /api/users/location
// @desc    Update the logged-in user's location
// @access  Private (All roles)
router.put('/location', protect, updateUserLocation);

// -------------------------
// ONBOARDING ROUTES
// -------------------------

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

// -------------------------
// PHARMACY PROFILE ROUTE
// -------------------------

// @route   PUT /api/users/pharmacy-profile
// @desc    Update an existing pharmacy profile
// @access  Private (Pharmacy)
router.put(
  '/pharmacy-profile',
  protect,
  hasRole(['Pharmacy']),
  uploadDocs,
  updatePharmacyProfile
);

module.exports = router;
