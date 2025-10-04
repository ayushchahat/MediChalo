// --- IMPORTS ---
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
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
      // Build base response payload
      const responsePayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        locationCaptured: user.locationCaptured, // ✅ Include locationCaptured
      };

      // 🔹 Fetch and attach role-specific profiles
      if (user.role === 'Pharmacy') {
        const pharmacyProfile = await Pharmacy.findOne({ user: user._id });
        if (pharmacyProfile) {
          responsePayload.pharmacyProfile = pharmacyProfile.toObject();
        }
      } else if (user.role === 'DeliveryPartner') {
        const deliveryProfile = await DeliveryPartner.findOne({ user: user._id });
        if (deliveryProfile) {
          responsePayload.deliveryProfile = deliveryProfile.toObject();
        }
      }

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
  // TODO: Implement OTP verification logic
  res.status(200).json({ message: 'OTP verification placeholder successful' });
};

// --- EXPORT ---
module.exports = { signup, login, verifyOtp };
