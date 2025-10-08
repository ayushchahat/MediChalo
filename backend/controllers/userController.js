const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');

/* -----------------------------------
   DUMMY GEOCODING FUNCTION
----------------------------------- */
// In a real-world app, integrate Google Maps or Mapbox API for accurate geocoding
const geocodeAddress = (address) => {
  console.log("Simulating geocoding for address:", address);
  const baseLongitude = 76.9366; // Example longitude
  const baseLatitude = 8.5241;   // Example latitude
  const randomOffset = (Math.random() - 0.5) * 0.01;
  return [baseLongitude + randomOffset, baseLatitude + randomOffset];
};

/* -----------------------------------
   GET PROFILE (All Roles)
----------------------------------- */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profileData = { ...user.toObject() };

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

/* -----------------------------------
   UPDATE CUSTOMER PROFILE
----------------------------------- */
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

/* -----------------------------------
   UPDATE USER LOCATION
----------------------------------- */
const updateUserLocation = async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.location = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
    user.locationCaptured = true;

    await user.save();
    res.json({ message: 'Location updated successfully.' });
  } catch (error) {
    console.error("LOCATION UPDATE ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* -----------------------------------
   PHARMACY & DELIVERY PARTNER ONBOARDING
----------------------------------- */
const updateOnboarding = async (req, res) => {
  const user = req.user;

  try {
    /* ---- PHARMACY ONBOARDING ---- */
    if (user.role === 'Pharmacy') {
      const { shopName, start, end, offDays, address } = req.body;

      if (!req.files || !req.files.license || !req.files.gst) {
        return res.status(400).json({ message: 'License and GST documents are required.' });
      }

      const parsedAddress = address ? JSON.parse(address) : {};
      const coordinates = geocodeAddress(parsedAddress);

      const pharmacyProfile = await Pharmacy.findOneAndUpdate(
        { user: user._id },
        {
          shopName,
          workingHours: { start, end },
          offDays: JSON.parse(offDays || '[]'),
          address: parsedAddress,
          location: { type: 'Point', coordinates },
          licensePath: req.files.license[0].path,
          gstPath: req.files.gst[0].path,
          logoPath: req.files.logo ? req.files.logo[0].path : undefined,
          onboardingComplete: true,
        },
        { upsert: true, new: true, runValidators: true }
      );

      return res.status(200).json({
        message: 'Pharmacy profile updated successfully',
        data: pharmacyProfile,
      });
    }

    /* ---- DELIVERY PARTNER ONBOARDING ---- */
    else if (user.role === 'DeliveryPartner') {
      const { vehicleDetails } = req.body;

      if (!req.files || !req.files.drivingLicense || !req.files.vehicleRegistration) {
        return res.status(400).json({
          message: 'Driving license and vehicle registration are required.',
        });
      }

      const deliveryProfile = await DeliveryPartner.findOneAndUpdate(
        { user: user._id },
        {
          vehicleDetails,
          drivingLicensePath: req.files.drivingLicense[0].path,
          vehicleRegistrationPath: req.files.vehicleRegistration[0].path,
          onboardingComplete: true,
        },
        { upsert: true, new: true, runValidators: true }
      );

      return res.status(200).json({
        message: 'Delivery partner profile updated successfully',
        data: deliveryProfile,
      });
    }

    res.status(403).json({ message: 'Onboarding not applicable for this role.' });
  } catch (error) {
    console.error("ONBOARDING ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* -----------------------------------
   UPDATE DELIVERY PARTNER STATUS
----------------------------------- */
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

    res.json({
      message: `Status updated to ${isOnline ? 'Online' : 'Offline'}.`,
      isOnline: deliveryProfile.isOnline,
    });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* -----------------------------------
   UPDATE EXISTING PHARMACY PROFILE
----------------------------------- */
const updatePharmacyProfile = async (req, res) => {
  try {
    const pharmacyProfile = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacyProfile) {
      return res.status(404).json({ message: 'Pharmacy profile not found.' });
    }

    const { shopName, start, end, offDays, address } = req.body;

    if (shopName) pharmacyProfile.shopName = shopName;
    if (start && end) pharmacyProfile.workingHours = { start, end };
    if (offDays) pharmacyProfile.offDays = JSON.parse(offDays);

    if (address) {
      const parsedAddress = JSON.parse(address);
      pharmacyProfile.address = parsedAddress;
      // In a real app, you would re-geocode here if needed
    }

    if (req.files) {
      if (req.files.logo) pharmacyProfile.logoPath = req.files.logo[0].path;
      if (req.files.license) pharmacyProfile.licensePath = req.files.license[0].path;
      if (req.files.gst) pharmacyProfile.gstPath = req.files.gst[0].path;
    }

    const updatedProfile = await pharmacyProfile.save();
    res.json(updatedProfile);

  } catch (error) {
    console.error("PHARMACY PROFILE UPDATE ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* -----------------------------------
   EXPORTS
----------------------------------- */
module.exports = {
  getProfile,
  updateProfile,
  updateUserLocation,
  updateOnboarding,
  updateDeliveryStatus,
  updatePharmacyProfile,
};
