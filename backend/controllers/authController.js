// --- IMPORTS ---
const User = require('../models/User');
console.log("In authController, the imported User model is of type:", typeof User);

const generateToken = require('../utils/jwtHelper');
const { validate, signupSchema } = require('../middleware/validationMiddleware');

// --- SIGNUP LOGIC ---
const signup = [
  // Validate the request body first
  validate(signupSchema),
  async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    try {
      // Check if a user with the same email or phone already exists
      const userExists = await User.findOne({ $or: [{ email }, { phone }] });

      if (userExists) {
        return res
          .status(400)
          .json({ message: 'User with this email or phone already exists' });
      }

      // Create a new user (password automatically hashed by pre-save hook)
      const user = await User.create({ name, email, phone, password, role });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
          message: 'Signup successful!',
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error('SIGNUP ERROR:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// --- LOGIN LOGIC ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Build response payload with extra fields (like locationCaptured)
      const responsePayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),

        // ✅ Include locationCaptured status in response
        locationCaptured: user.locationCaptured,
      };

      // 🔹 If you also want to include onboarding status for pharmacy or delivery partners,
      // you can compute and attach it here:
      //
      // if (user.role === 'Pharmacy') {
      //   responsePayload.pharmacyOnboardingCompleted = ...;
      // }
      //
      // if (user.role === 'DeliveryPartner') {
      //   responsePayload.deliveryOnboardingCompleted = ...;
      // }

      res.json(responsePayload);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- OTP VERIFICATION (Placeholder) ---
const verifyOtp = async (req, res) => {
  res
    .status(200)
    .json({ message: 'OTP verification placeholder successful' });
};

// --- EXPORT ---
module.exports = { signup, login, verifyOtp };
