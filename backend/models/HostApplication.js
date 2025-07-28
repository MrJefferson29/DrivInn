const mongoose = require('mongoose');

const hostApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  // Personal Information (pre-filled from user profile)
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // Additional Personal Information
  phoneNumber: {
    type: String,
    required: true
  },
  postalAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  // Identity Verification Documents
  identityDocuments: {
    idType: {
      type: String,
      enum: ['passport', 'national_id', 'tax_id', 'driving_license'],
      required: true
    },
    idNumber: {
      type: String,
      required: true
    },
    idFrontImage: {
      type: String, // Cloudinary URL
      required: true
    },
    idBackImage: {
      type: String, // Cloudinary URL
      required: true
    },
    selfieImage: {
      type: String, // Cloudinary URL
      required: true
    }
  },
  // Payment Information
  paymentMethods: {
    stripeAccountId: {
      type: String,
      required: true
    },
    creditCard: {
      last4: { type: String, required: true },
      brand: { type: String, required: true },
      expiryMonth: { type: String, required: true },
      expiryYear: { type: String, required: true },
      isDefault: { type: Boolean, default: false }
    },
    paypalEmail: {
      type: String,
      required: true
    }
  },
  // Additional Information
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'car', 'other'],
    required: true
  },
  propertyDescription: {
    type: String,
    required: true
  },
  hostingExperience: {
    type: String
  },
  // Admin Review
  adminNote: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
hostApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('HostApplication', hostApplicationSchema); 