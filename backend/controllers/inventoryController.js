const Medicine = require('../models/Medicine');
const { validate, medicineSchema } = require('../middleware/validationMiddleware');
const fs = require('fs');
const csv = require('csv-parser');

// @desc    Add a new medicine to inventory
// @route   POST /api/inventory
// @access  Private (Pharmacy)
const addMedicine = [
    // 1. Use the validation middleware to check the request body first.
    validate(medicineSchema),
    async (req, res) => {
        try {
            // 2. If validation passes, create a new medicine document in the database.
            // The pharmacy's ID is automatically added from the logged-in user's token.
            const createdMedicine = await Medicine.create({
                ...req.body,
                pharmacy: req.user._id
            });
            // 3. Send back the newly created medicine data with a 201 Created status.
            res.status(201).json(createdMedicine);
        } catch (error) {
            // If anything goes wrong, log the error and send a 500 server error response.
            console.error("ADD MEDICINE ERROR:", error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
];

// @desc    Get all medicines for the logged-in pharmacy
// @route   GET /api/inventory
// @access  Private (Pharmacy)
const getInventory = async (req, res) => {
    try {
        const medicines = await Medicine.find({ pharmacy: req.user._id });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a medicine
// @route   PUT /api/inventory/:id
// @access  Private (Pharmacy)
const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (medicine && medicine.pharmacy.toString() === req.user._id.toString()) {
            // Now using findByIdAndUpdate for cleaner updates
            const updatedMedicine = await Medicine.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            res.json(updatedMedicine);
        } else {
            res.status(404).json({ message: 'Medicine not found or not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a medicine
// @route   DELETE /api/inventory/:id
// @access  Private (Pharmacy)
const deleteMedicine = async (req, res) => {
     try {
        const medicine = await Medicine.findById(req.params.id);

        if (medicine && medicine.pharmacy.toString() === req.user._id.toString()) {
            await medicine.deleteOne();
            res.json({ message: 'Medicine removed' });
        } else {
            res.status(404).json({ message: 'Medicine not found or not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Search for available medicines across all pharmacies
// @route   GET /api/inventory/search
// @access  Private (Customer)
const searchMedicines = async (req, res) => {
    const keyword = req.query.keyword ? {
        name: {
            $regex: req.query.keyword,
            $options: 'i' // case-insensitive
        }
    } : {};

    try {
        // Simpler populate of pharmacy name only (new code’s behavior)
        const medicines = await Medicine.find({ ...keyword, quantity: { $gt: 0 } })
            .populate('pharmacy', 'name');

        if (medicines.length > 0) {
            res.json(medicines);
        } else {
            res.status(404).json({ message: 'No medicine found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Bulk upload medicines via CSV
// @route   POST /api/inventory/bulk-upload
// @access  Private (Pharmacy)
const bulkUploadInventory = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded.' });
    }

    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            // Attach pharmacy to each row directly here
            results.push({ ...data, pharmacy: req.user._id });
        })
        .on('end', async () => {
            try {
                await Medicine.insertMany(results);
                fs.unlinkSync(req.file.path); // Clean up uploaded file
                res.status(201).json({
                    message: 'Bulk upload successful!',
                    count: results.length
                });
            } catch (error) {
                res.status(500).json({
                    message: 'Error processing CSV file.',
                    error: error.message
                });
            }
        });
};

module.exports = { 
    addMedicine, 
    getInventory, 
    updateMedicine, 
    deleteMedicine, 
    searchMedicines, 
    bulkUploadInventory 
};
