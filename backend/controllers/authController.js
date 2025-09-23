// 1. Import the User model. Because `User.js` is now correct, this import will work.
const User = require('../models/User');

// This is a debugging log to confirm the import is successful.
// When your server starts, you should see "function" in the terminal.
console.log("In authController, the imported User model is of type:", typeof User);

const generateToken = require('../utils/jwtHelper');
const { validate, signupSchema } = require('../middleware/validationMiddleware');

// --- SIGNUP LOGIC ---
const signup = [
    // This middleware will validate the request body against the schema first.
    validate(signupSchema),
    async (req, res) => {
        const { name, email, phone, password, role } = req.body;

        try {
            // 2. Check if a user with the same email or phone already exists in the database.
            const userExists = await User.findOne({ $or: [{ email }, { phone }] });

            if (userExists) {
                // If the user exists, send a 400 Bad Request error.
                return res.status(400).json({ message: 'User with this email or phone already exists' });
            }

            // 3. If the user doesn't exist, create a new user entry in the database.
            // The password will be automatically hashed by the 'pre-save' hook in the User model.
            const user = await User.create({ name, email, phone, password, role });

            if (user) {
                // 4. If user creation is successful, send back the user data and a JWT.
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role),
                    message: "Signup successful!"
                });
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        } catch (error) {
            // 5. (CRITICAL) If any part of the 'try' block fails, this will catch the error.
            // This log will print the full error details to your backend terminal.
            console.error("SIGNUP ERROR:", error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
];


// --- LOGIN LOGIC ---
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Find a user by their email address.
        const user = await User.findOne({ email });

        // 2. If the user exists AND the password matches, send back the user data and a token.
        // The `matchPassword` method is defined in your User model.
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            // If user not found or password doesn't match, send an unauthorized error.
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// --- OTP VERIFICATION (Placeholder) ---
const verifyOtp = async (req, res) => {
    // This is a placeholder for a future full OTP implementation.
    res.status(200).json({ message: 'OTP verification placeholder successful' });
};


// Export all the controller functions so they can be used in your routes.
module.exports = { signup, login, verifyOtp };

