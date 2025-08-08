const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: ''
    },
    // Optional profile fields
    phoneNumber: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: null
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        zipCode: { type: String, default: '' }
    },
    bio: {
        type: String,
        default: ''
    },

    socialLinks: {
        website: { type: String, default: '' },
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    role: {
        type: String,
        enum: ['guest', 'host', 'admin'],
        default: 'guest'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Social login fields
    googleId: {
        type: String,
        default: null
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    likedListings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    }],
    permissions: [{
        type: String,
        enum: [
            'create_listing',
            'edit_listing',
            'delete_listing',
            'create_booking',
            'cancel_booking',
            'create_review',
            'edit_review',
            'delete_review',
            'manage_users',
            'manage_listings',
            'manage_bookings',
            'manage_reviews',
            'view_admin_panel'
        ]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);