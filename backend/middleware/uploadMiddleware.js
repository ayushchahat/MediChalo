const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type for images and PDFs
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images and PDFs Only!');
    }
}

// Init upload for single prescription
const uploadPrescription = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('prescription'); // 'prescription' is the field name in the form

// Init upload for multiple pharmacy/delivery docs
const uploadDocs = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
}).fields([
    { name: 'license', maxCount: 1 },
    { name: 'gst', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleRegistration', maxCount: 1 },
]);

// Init upload for CSV files
const uploadCsv = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function(req, file, cb) {
        const filetypes = /csv/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: Please upload a CSV file.");
    }
}).single('csvfile'); // 'csvfile' is the field name

module.exports = { 
    uploadPrescription, 
    uploadDocs,
    uploadCsv // Export the new CSV uploader
};
