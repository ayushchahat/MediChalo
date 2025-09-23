// This is a simplified helper. In a real application, consider using
// libraries like 'crypto' for more secure random number generation.

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

module.exports = { generateOtp };