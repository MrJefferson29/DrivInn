const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use app password for Gmail
    }
  });
};

// Generate password reset token
const generateResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'password-reset' },
    process.env.JWT_SECRET || 'yoursecretkey',
    { expiresIn: '1h' }
  );
};

// Verify password reset token
const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yoursecretkey');
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - DrivInn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF385C; margin: 0;">DrivInn</h1>
            <p style="color: #717171; margin: 10px 0;">Reset Your Password</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #222222; margin-bottom: 20px;">Hello!</h2>
            <p style="color: #717171; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your DrivInn account. 
              Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #FF385C, #E31C5F); 
                        color: white; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 12px; 
                        font-weight: 600; 
                        display: inline-block;
                        box-shadow: 0 4px 16px rgba(255, 56, 92, 0.3);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #717171; font-size: 14px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #FF385C; font-size: 12px; word-break: break-all;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="text-align: center; color: #717171; font-size: 12px;">
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>© 2024 DrivInn. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to DrivInn!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF385C; margin: 0;">Welcome to DrivInn!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px;">
            <h2 style="color: #222222; margin-bottom: 20px;">Hello ${firstName}!</h2>
            <p style="color: #717171; line-height: 1.6; margin-bottom: 20px;">
              Welcome to DrivInn! We're excited to have you join our community of travelers and hosts.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #222222; margin-bottom: 15px;">What you can do:</h3>
              <ul style="color: #717171; line-height: 1.6;">
                <li>Discover amazing places to stay</li>
                <li>Book unique experiences</li>
                <li>Rent cars for your adventures</li>
                <li>Become a host and share your space</li>
              </ul>
            </div>
            
            <p style="color: #717171; line-height: 1.6;">
              Start exploring and create unforgettable memories with DrivInn!
            </p>
          </div>
          
          <div style="text-align: center; color: #717171; font-size: 12px; margin-top: 20px;">
            <p>© 2024 DrivInn. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  generateResetToken,
  verifyResetToken
}; 