const mongoose = require('mongoose');

// Define the schema for the Medicine collection
const medicineSchema = new mongoose.Schema({
    // A required reference to the User who is a Pharmacy and owns this medicine stock.
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This links to the 'User' model
        required: true
    },
    // The name of the medicine. It's a required field.
    name: {
        type: String,
        required: true,
        trim: true // Removes any whitespace from the beginning and end
    },
    // The batch number for the medicine stock.
    batchNumber: {
        type: String,
        required: true
    },
    // The expiry date of the medicine.
    expiryDate: {
        type: Date,
        required: true
    },
    // The quantity of the medicine in stock. Must be a non-negative number.
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    // The price per unit of the medicine. Must be a non-negative number.
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // A boolean flag to indicate if a prescription is required to purchase this medicine.
    prescriptionRequired: {
        type: Boolean,
        default: false // Defaults to false if not provided
    },
}, {
    // Mongoose option to automatically add `createdAt` and `updatedAt` timestamps
    timestamps: true
});

// Create a text index on the 'name' field to allow for efficient text-based searches.
// This is used by the customer-facing search feature.
medicineSchema.index({ name: 'text' });

// Create the Mongoose model from the schema.
// Mongoose will create a collection named 'medicines' in the database.
const Medicine = mongoose.model('Medicine', medicineSchema);

// Export the model so it can be used in other parts of the application (e.g., controllers).
module.exports = Medicine;

