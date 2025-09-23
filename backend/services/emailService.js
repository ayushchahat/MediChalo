const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const message = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(message);
};

const sendOtpEmail = async (email, otp) => {
    const message = `Your One-Time Password (OTP) for MediChalo is: ${otp}. It is valid for 10 minutes.`;
    try {
        await sendEmail({
            email: email,
            subject: 'Your MediChalo OTP',
            message: message,
        });
        console.log('OTP email sent successfully.');
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
}

module.exports = { sendOtpEmail };