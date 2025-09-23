const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');

// @desc    Get user profile with role-specific details
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const profileData = { ...user.toObject() };

        // Attach role-specific data
        if (user.role === 'Pharmacy') {
            const pharmacyProfile = await Pharmacy.findOne({ user: user._id });
            if (pharmacyProfile) profileData.pharmacyProfile = pharmacyProfile.toObject();
        } else if (user.role === 'DeliveryPartner') {
            const deliveryProfile = await DeliveryPartner.findOne({ user: user._id });
            if (deliveryProfile) profileData.deliveryProfile = deliveryProfile.toObject();
        }

        res.json(profileData);
    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update customer profile (name, phone, address)
// @route   PUT /api/users/profile
// @access  Private (Customer)
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role !== 'Customer') {
            return res.status(403).json({ message: 'Not allowed for this role' });
        }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;

        if (req.body.address) {
            user.address = {
                street: req.body.address.street || user.address.street,
                city: req.body.address.city || user.address.city,
                state: req.body.address.state || user.address.state,
                zipCode: req.body.address.zipCode || user.address.zipCode,
            };
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
        });
    } catch (error) {
        console.error("PROFILE UPDATE ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Handle onboarding for Pharmacy or DeliveryPartner
// @route   PUT /api/users/onboarding
// @access  Private (Pharmacy, DeliveryPartner)
const updateOnboarding = async (req, res) => {
    const user = req.user;

    try {
        if (user.role === 'Pharmacy') {
            const { shopName, start, end, offDays } = req.body;
            if (!req.files || !req.files.license || !req.files.gst) {
                return res.status(400).json({ message: 'License and GST documents are required.' });
            }

            const pharmacyProfile = await Pharmacy.findOneAndUpdate(
                { user: user._id },
                {
                    shopName,
                    workingHours: { start, end },
                    offDays: JSON.parse(offDays || '[]'),
                    licensePath: req.files.license[0].path,
                    gstPath: req.files.gst[0].path,
                    logoPath: req.files.logo ? req.files.logo[0].path : undefined,
                    onboardingComplete: true,
                },
                { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
            );

            return res.status(200).json({ message: 'Pharmacy profile updated successfully', data: pharmacyProfile });

        } else if (user.role === 'DeliveryPartner') {
            const { vehicleDetails } = req.body;
            if (!req.files || !req.files.drivingLicense || !req.files.vehicleRegistration) {
                return res.status(400).json({ message: 'Driving license and vehicle registration are required.' });
            }

            const deliveryProfile = await DeliveryPartner.findOneAndUpdate(
                { user: user._id },
                {
                    vehicleDetails,
                    drivingLicensePath: req.files.drivingLicense[0].path,
                    vehicleRegistrationPath: req.files.vehicleRegistration[0].path,
                    onboardingComplete: true,
                },
                { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
            );

            return res.status(200).json({ message: 'Delivery partner profile updated successfully', data: deliveryProfile });
        }

        res.status(403).json({ message: 'Onboarding not applicable for this role.' });
    } catch (error) {
        console.error("ONBOARDING ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update delivery partner online/offline status
// @route   PUT /api/users/status
// @access  Private (DeliveryPartner)
const updateDeliveryStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        const deliveryProfile = await DeliveryPartner.findOneAndUpdate(
            { user: req.user._id },
            { isOnline },
            { new: true }
        );

        if (!deliveryProfile) {
            return res.status(404).json({ message: 'Delivery partner profile not found.' });
        }

        res.json({ message: `Status updated to ${isOnline ? 'Online' : 'Offline'}.`, isOnline: deliveryProfile.isOnline });
    } catch (error) {
        console.error("STATUS UPDATE ERROR:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateOnboarding,
    updateDeliveryStatus
};
