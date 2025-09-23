const Medicine = require('../models/Medicine');
const { validate, medicineSchema } = require('../middleware/validationMiddleware');
const fs = require('fs');
const csv = require('csv-parser');

// @desc    Add a new medicine to inventory
// @route   POST /api/inventory
// @access  Private (Pharmacy)
const addMedicine = [
    validate(medicineSchema),
    async (req, res) => {
        try {
            const { name, batchNumber, expiryDate, quantity, price, prescriptionRequired } = req.body;

            const medicine = new Medicine({
                pharmacy: req.user._id,
                name,
                batchNumber,
                expiryDate,
                quantity,
                price,
                prescriptionRequired,
            });

            const createdMedicine = await medicine.save();
            res.status(201).json(createdMedicine);
        } catch (error) {
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
            medicine.name = req.body.name || medicine.name;
            medicine.batchNumber = req.body.batchNumber || medicine.batchNumber;
            medicine.expiryDate = req.body.expiryDate || medicine.expiryDate;
            medicine.quantity = req.body.quantity !== undefined ? req.body.quantity : medicine.quantity;
            medicine.price = req.body.price !== undefined ? req.body.price : medicine.price;
            medicine.prescriptionRequired = req.body.prescriptionRequired !== undefined ? req.body.prescriptionRequired : medicine.prescriptionRequired;

            const updatedMedicine = await medicine.save();
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
        // Find medicines and populate pharmacy details
        const medicines = await Medicine.find({ ...keyword, quantity: { $gt: 0 } })
            .populate({
                path: 'pharmacy',
                select: 'name address',
                populate: {
                    path: 'pharmacyProfile',
                    select: 'shopName'
                }
            });

        if (medicines.length > 0) {
            res.json(medicines);
        } else {
            res.status(404).json({ message: 'No medicine found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Bulk upload medicines from a CSV file
// @route   POST /api/inventory/bulk-upload
// @access  Private (Pharmacy)
const bulkUploadInventory = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No CSV file uploaded.' });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const medicinesToInsert = results.map(med => ({
                    ...med,
                    pharmacy: req.user._id,
                    quantity: parseInt(med.quantity, 10),
                    price: parseFloat(med.price),
                    prescriptionRequired: med.prescriptionRequired?.toLowerCase() === 'true'
                }));

                await Medicine.insertMany(medicinesToInsert);
                fs.unlinkSync(filePath);
                res.status(201).json({ message: `${medicinesToInsert.length} medicines added successfully.` });
            } catch (error) {
                console.error("BULK UPLOAD ERROR:", error);
                fs.unlinkSync(filePath);
                res.status(500).json({ message: 'Error processing CSV file.', error: error.message });
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
