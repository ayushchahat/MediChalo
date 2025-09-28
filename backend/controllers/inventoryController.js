// controllers/inventoryController.js
const Medicine = require('../models/Medicine');
const { validate, medicineSchema } = require('../middleware/validationMiddleware');
const csv = require('csv-parser');
const fs = require('fs');

/**
 * @desc Add a new medicine to inventory (with image upload support)
 * @route POST /api/inventory
 * @access Private (Pharmacy)
 */
const addMedicine = [
  async (req, res) => {
    try {
      const { name, batchNumber, expiryDate, quantity, price, prescriptionRequired } = req.body;

      const newMedicine = new Medicine({
        pharmacy: req.user._id,
        name,
        batchNumber,
        expiryDate,
        quantity,
        price,
        prescriptionRequired:
          typeof prescriptionRequired === 'string'
            ? prescriptionRequired.toLowerCase() === 'true'
            : Boolean(prescriptionRequired),
        image: req.file ? req.file.path : undefined, // image path from Multer
      });

      const createdMedicine = await newMedicine.save();
      res.status(201).json(createdMedicine);
    } catch (error) {
      console.error('ADD MEDICINE ERROR:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
];

/**
 * @desc Get all medicines for the logged-in pharmacy’s inventory page
 * @route GET /api/inventory
 * @access Private (Pharmacy)
 */
const getInventory = async (req, res) => {
  try {
    const medicines = await Medicine.find({ pharmacy: req.user._id }).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    console.error('GET INVENTORY ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Get all available medicines for customers (stock > 0)
 * @route GET /api/inventory/available
 * @access Private (Customer)
 */
const getAvailableMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ quantity: { $gt: 0 } }).populate({
      path: 'pharmacy',
      select: 'pharmacyProfile', // only nested pharmacyProfile
      populate: {
        path: 'pharmacyProfile',
        select: 'shopName', // specifically get shopName
      },
    });
    res.json(medicines);
  } catch (error) {
    console.error('GET AVAILABLE MEDICINES ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Update a specific medicine’s details
 * @route PUT /api/inventory/:id
 * @access Private (Pharmacy)
 */
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine && medicine.pharmacy.toString() === req.user._id.toString()) {
      Object.assign(medicine, req.body);
      const updatedMedicine = await medicine.save();
      res.json(updatedMedicine);
    } else {
      res.status(404).json({ message: 'Medicine not found or not authorized' });
    }
  } catch (error) {
    console.error('UPDATE MEDICINE ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Delete a medicine from inventory
 * @route DELETE /api/inventory/:id
 * @access Private (Pharmacy)
 */
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine && medicine.pharmacy.toString() === req.user._id.toString()) {
      await medicine.deleteOne();
      res.json({ message: 'Medicine removed successfully' });
    } else {
      res.status(404).json({ message: 'Medicine not found or not authorized' });
    }
  } catch (error) {
    console.error('DELETE MEDICINE ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Search medicines by name (customers)
 * @route GET /api/inventory/search?keyword=...
 * @access Private (Customer)
 */
const searchMedicines = async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  try {
    const medicines = await Medicine.find({ ...keyword, quantity: { $gt: 0 } }).populate({
      path: 'pharmacy',
      select: 'pharmacyProfile',
      populate: {
        path: 'pharmacyProfile',
        select: 'shopName',
      },
    });
    res.json(medicines);
  } catch (error) {
    console.error('SEARCH MEDICINES ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Handle bulk upload of medicines from a CSV file
 * @route POST /api/inventory/bulk-upload
 * @access Private (Pharmacy)
 */
const bulkUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded.' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const medicinesToInsert = results.map((item) => ({
          ...item,
          pharmacy: req.user._id,
          prescriptionRequired:
            typeof item.prescriptionRequired === 'string'
              ? item.prescriptionRequired.toLowerCase() === 'true'
              : Boolean(item.prescriptionRequired),
        }));

        await Medicine.insertMany(medicinesToInsert);

        try {
          fs.unlinkSync(req.file.path); // clean up
        } catch (err) {
          console.error('File cleanup error:', err);
        }

        res.status(201).json({ message: `${results.length} medicines added successfully.` });
      } catch (error) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('File cleanup error:', err);
        }
        console.error('BULK UPLOAD ERROR:', error);
        res.status(500).json({ message: 'Error processing CSV file.' });
      }
    });
};

module.exports = {
  addMedicine,
  getInventory,
  getAvailableMedicines,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  bulkUpload,
};
