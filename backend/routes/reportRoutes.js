const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/reportController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// @route   GET /api/reports/dashboard-stats
// @desc    Get key statistics for the pharmacy dashboard.
// @access  Private (Pharmacy)
router.get('/dashboard-stats', protect, hasRole(['Pharmacy']), getDashboardStats);

module.exports = router;

