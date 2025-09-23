const Joi = require('joi');

// Schema for user signup
const signupSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Customer', 'Pharmacy', 'DeliveryPartner').required(),
});

// Schema for adding medicine
const medicineSchema = Joi.object({
    name: Joi.string().required(),
    batchNumber: Joi.string().required(),
    expiryDate: Joi.date().required(),
    quantity: Joi.number().integer().min(0).required(),
    price: Joi.number().min(0).required(),
    prescriptionRequired: Joi.boolean()
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validate,
    signupSchema,
    medicineSchema,
};