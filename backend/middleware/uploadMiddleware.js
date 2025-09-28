const multer = require('multer');
const path = require('path');

// Configure the storage engine for Multer. This tells Multer where to save the files.
const storage = multer.diskStorage({
    // The destination folder for all uploads.
    destination: './uploads/',
    // A function to create a unique filename to prevent files with the same name from overwriting each other.
    filename: function(req, file, cb) {
        // Filename format: original_fieldname-timestamp.extension (e.g., image-1678886400000.png)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// A function to validate the uploaded file type.
// It ensures that only specified file extensions and MIME types are accepted.
function checkFileType(file, cb) {
    // Define the allowed file extensions (e.g., jpeg, jpg, png, pdf).
    const allowedFiletypes = /jpeg|jpg|png|pdf/;
    // Check if the file's extension matches the allowed types.
    const extname = allowedFiletypes.test(path.extname(file.originalname).toLowerCase());
    // Check if the file's MIME type matches the allowed types.
    const mimetype = allowedFiletypes.test(file.mimetype);

    if (mimetype && extname) {
        // If the file is valid, pass `true` to the callback.
        return cb(null, true);
    } else {
        // If the file is invalid, pass an error to the callback.
        cb(new Error('Error: You can only upload images (jpeg, jpg, png) or PDF files!'));
    }
}

// --- Define and configure separate Multer instances for different upload needs ---

// Middleware for a single prescription upload. Expects a field named 'prescription'.
const uploadPrescription = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB file size limit
    fileFilter: (req, file, cb) => checkFileType(file, cb)
}).single('prescription');

// Middleware for multiple documents during onboarding (e.g., license, GST, logo).
const uploadDocs = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: (req, file, cb) => checkFileType(file, cb)
}).fields([
    { name: 'license', maxCount: 1 },
    { name: 'gst', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleRegistration', maxCount: 1 },
]);

// Middleware for a single CSV file for bulk inventory uploads. Expects a field named 'csvFile'.
const uploadCsv = multer({
    storage: storage,
    limits: { fileSize: 5000000 } // 5MB file size limit
}).single('csvFile');

// NEW: Middleware for a single medicine image upload. Expects a field named 'image'.
const uploadMedicineImage = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: (req, file, cb) => checkFileType(file, cb)
}).single('image');


// Export all the configured middleware handlers to be used in the route files.
module.exports = {
    uploadPrescription,
    uploadDocs,
    uploadCsv,
    uploadMedicineImage
};

