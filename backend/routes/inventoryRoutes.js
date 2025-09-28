const express = require('express');
const router = express.Router();
const {
    addMedicine,
    getInventory,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    bulkUpload,
    getAvailableMedicines
} = require('../controllers/inventoryController');
const { protect, hasRole } = require('../middleware/authMiddleware');
const { uploadCsv, uploadMedicineImage } = require('../middleware/uploadMiddleware');

// @route   GET /api/inventory
// @desc    Get all medicines for the logged-in pharmacy.
// @access  Private (Pharmacy)
router.get('/', protect, hasRole(['Pharmacy']), getInventory);

// @route   POST /api/inventory
// @desc    Add a new medicine to the inventory, with image upload.
// @access  Private (Pharmacy)
router.post('/', protect, hasRole(['Pharmacy']), uploadMedicineImage, addMedicine);

// @route   POST /api/inventory/bulk-upload
// @desc    Upload a CSV file to add multiple medicines at once.
// @access  Private (Pharmacy)
router.post('/bulk-upload', protect, hasRole(['Pharmacy']), uploadCsv, bulkUpload);

// @route   GET /api/inventory/available
// @desc    Get all medicines currently in stock for the customer storefront.
// @access  Private (Customer)
router.get('/available', protect, hasRole(['Customer']), getAvailableMedicines);

// @route   GET /api/inventory/search
// @desc    Search for available medicines by keyword.
// @access  Private (Customer)
router.get('/search', protect, hasRole(['Customer']), searchMedicines);

// @route   PUT /api/inventory/:id
// @desc    Update a specific medicine's details.
// @access  Private (Pharmacy)
router.put('/:id', protect, hasRole(['Pharmacy']), updateMedicine);

// @route   DELETE /api/inventory/:id
// @desc    Delete a specific medicine from the inventory.
// @access  Private (Pharmacy)
router.delete('/:id', protect, hasRole(['Pharmacy']), deleteMedicine);

module.exports = router;

