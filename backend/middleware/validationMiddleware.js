const Joi = require('joi');

// --- User Signup Validation Schema ---
const signupSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Customer', 'Pharmacy', 'DeliveryPartner').required(),
});

// --- Add Medicine Validation Schema ---
const medicineSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': `"Medicine Name" cannot be empty.`
    }),
    batchNumber: Joi.string().required().messages({
        'string.empty': `"Batch Number" cannot be empty.`
    }),
    expiryDate: Joi.date().required().messages({
        'date.base': `"Expiry Date" must be a valid date.`
    }),
    quantity: Joi.number().integer().min(0).required().messages({
        'number.base': `"Quantity" must be a number.`,
        'number.min': `"Quantity" cannot be less than 0.`
    }),
    price: Joi.number().min(0).required().messages({
        'number.base': `"Price" must be a number.`,
        'number.min': `"Price" cannot be less than 0.`
    }),
    prescriptionRequired: Joi.boolean()
});

// --- Main Validation Function ---
// This function takes a schema and returns a middleware.
const validate = (schema) => (req, res, next) => {
    // Validate the request body against the provided schema.
    const { error } = schema.validate(req.body);
    // If there's a validation error, send a 400 Bad Request response.
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // If validation succeeds, move on to the next function in the chain (the controller).
    next();
};

module.exports = {
    validate,
    signupSchema,
    medicineSchema
};

