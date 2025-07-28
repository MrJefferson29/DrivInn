const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotificationService = require('../services/notificationService');
const { sendPasswordResetEmail, generateResetToken, verifyResetToken } = require('../services/emailService');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create user
        user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });
        await user.save();
        
        // Create welcome notification for new user
        try {
            await NotificationService.createWelcomeNotification(user._id);
        } catch (notificationError) {
            console.error('Error creating welcome notification:', notificationError);
            // Don't fail registration if notification fails
        }
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'yoursecretkey',
            { expiresIn: '5h' }
        );
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = generateResetToken(user._id);
        
        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, resetToken);
            res.json({ message: 'Password reset link has been sent to your email address.' });
        } catch (emailError) {
            // Clear the reset token if email fails
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            
            console.error('Error sending password reset email:', emailError);
            res.status(500).json({ message: 'Error sending password reset email. Please try again.' });
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        // Verify token
        let decoded;
        try {
            decoded = verifyResetToken(token);
        } catch (tokenError) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if token matches and is not expired
        if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Verify token
        let decoded;
        try {
            decoded = verifyResetToken(token);
        } catch (tokenError) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if token matches and is not expired
        if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        res.json({ message: 'Token is valid', userId: user._id });
    } catch (err) {
        console.error('Verify reset token error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}; 