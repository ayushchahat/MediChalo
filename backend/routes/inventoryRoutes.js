const express = require('express');
const router = express.Router();
const { 
    addMedicine, 
    getInventory, 
    updateMedicine, 
    deleteMedicine, 
    searchMedicines,
    bulkUploadInventory 
} = require('../controllers/inventoryController');
const { protect, hasRole } = require('../middleware/authMiddleware');
const { uploadCsv } = require('../middleware/uploadMiddleware');

// @route   /api/inventory
// @desc    Routes for getting the full inventory and adding a single new medicine.
// @access  Private (Pharmacy)
router.route('/')
    .get(protect, hasRole(['Pharmacy']), getInventory)
    .post(protect, hasRole(['Pharmacy']), addMedicine);

// @route   POST /api/inventory/bulk-upload
// @desc    Route for uploading a CSV file of medicines.
// @access  Private (Pharmacy)
router.post('/bulk-upload', protect, hasRole(['Pharmacy']), uploadCsv, bulkUploadInventory);

// @route   GET /api/inventory/search
// @desc    Route for customers to search for available medicines.
// @access  Private (Customer)
router.get('/search', protect, hasRole(['Customer']), searchMedicines);

// @route   /api/inventory/:id
// @desc    Routes for updating or deleting a specific medicine by its ID.
// @access  Private (Pharmacy)
router.route('/:id')
    .put(protect, hasRole(['Pharmacy']), updateMedicine)
    .delete(protect, hasRole(['Pharmacy']), deleteMedicine);

module.exports = router;
