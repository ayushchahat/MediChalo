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
const { uploadCsv } = require('../middleware/uploadMiddleware'); // Assuming you add a csv uploader

// Pharmacy routes
router.post('/', protect, hasRole(['Pharmacy']), addMedicine);
router.get('/', protect, hasRole(['Pharmacy']), getInventory);
router.put('/:id', protect, hasRole(['Pharmacy']), updateMedicine);
router.delete('/:id', protect, hasRole(['Pharmacy']), deleteMedicine);

// Pharmacy bulk upload
router.post('/bulk-upload', protect, hasRole(['Pharmacy']), uploadCsv, bulkUploadInventory);

// Customer route
router.get('/search', protect, hasRole(['Customer']), searchMedicines);

module.exports = router;
