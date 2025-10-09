const multer = require('multer');
const path = require('path');

// --- Storage Engine ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// --- File Type Validator ---
const fileFilter = (allowedTypes) => (req, file, cb) => {
    if (!file || !file.originalname) {
        return cb(new Error('No file received or file is malformed.'));
    }

    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        return cb(new Error('Invalid file type! Only images (jpeg, jpg, png) or PDF files are allowed.'));
    }
};

// Allowed file types
const imagePdfTypes = /jpeg|jpg|png|pdf/;

// --- Upload Middlewares ---
const uploadPrescription = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter(imagePdfTypes),
}).single('prescription');

const uploadDocs = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter(imagePdfTypes),
}).fields([
    { name: 'license', maxCount: 1 },
    { name: 'gst', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleRegistration', maxCount: 1 },
]);

const uploadCsv = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('csvFile');

const uploadMedicineImage = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter(imagePdfTypes),
}).single('image');

const uploadProfileImage = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter(imagePdfTypes),
}).single('profileImage');

const uploadDeliveryFiles = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: fileFilter(imagePdfTypes),
}).fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleRegistration', maxCount: 1 },
]);

module.exports = {
    uploadPrescription,
    uploadDocs,
    uploadCsv,
    uploadMedicineImage,
    uploadProfileImage,
    uploadDeliveryFiles,
};
