const nodemailer = require('nodemailer');

// --- Generic Email Sender ---
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html || undefined,
    text: options.text || undefined,
  };

  await transporter.sendMail(mailOptions);
};

// --- Send OTP Email ---
const sendOtpEmail = async (email, otp) => {
  const text = `Your One-Time Password (OTP) for MediChalo is: ${otp}. It is valid for 10 minutes.`;
  try {
    await sendEmail({
      email,
      subject: 'Your MediChalo OTP',
      text,
    });
    console.log('OTP email sent successfully.');
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

// --- Send Password Reset Email ---
const sendPasswordResetEmail = async (userEmail, resetUrl) => {
  const subject = 'Your Password Reset Link for MediChalo';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset Request</h2>
      <p>You are receiving this email because a password reset request was made for your MediChalo account.</p>
      <p>Please click the button below to set a new password. This link is valid for 10 minutes.</p>
      <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Your Password
      </a>
      <p>If you did not request a password reset, please ignore this email.</p>
      <hr/>
      <p>Thank you,</p>
      <p>The MediChalo Team</p>
    </div>
  `;

  try {
    await sendEmail({
      email: userEmail,
      subject,
      html,
    });
    console.log('Password reset email sent successfully.');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

module.exports = { sendEmail, sendOtpEmail, sendPasswordResetEmail };
