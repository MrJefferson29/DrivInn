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
  // Personal Information
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
      required: false
    },
    idBackImage: {
      type: String, // Cloudinary URL
      required: false
    },
    selfieImage: {
      type: String, // Cloudinary URL
      required: false
    }
  },
  // Business Information
  businessName: {
    type: String,
    required: false
  },
  businessTaxId: {
    type: String,
    required: false
  },
  businessAddress: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    postalCode: { type: String, required: false },
    country: { type: String, required: false }
  },
  businessPhone: {
    type: String,
    required: false
  },
  businessStructure: {
    type: String,
    required: false,
    enum: [
      'individual',
      'single_member_llc',
      'multi_member_llc', 
      'private_partnership',
      'private_corporation',
      'public_corporation',
      'incorporated_non_profit',
      'unincorporated_non_profit'
    ]
  },
  // Financial Information
  ssn: {
    type: String,
    required: false,
    minlength: 9,
    maxlength: 11
  },
  ssnLast4: {
    type: String,
    required: false,
    minlength: 4,
    maxlength: 4,
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v);
      },
      message: 'SSN last 4 digits must be exactly 4 digits'
    }
  },
  supportPhone: {
    type: String,
    required: false,
    minlength: 10
  },
  bankAccount: {
    accountNumber: { type: String, required: false },
    routingNumber: { type: String, required: false },
    accountType: { type: String, enum: ['checking', 'savings'], required: false }
  },
  // Payment Methods
  paymentMethods: {
    stripeAccountId: {
      type: String,
      required: false
    },
    creditCard: {
      last4: {
        type: String,
        required: false
      }
    }
  },
  // Stripe Connect Express Account
  stripeConnect: {
    accountId: {
      type: String,
      required: false
    },
    accountStatus: {
      type: String,
      enum: ['pending', 'active', 'restricted', 'disabled'],
      default: 'pending'
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    pendingRequirements: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    }
  },
  // Property Information
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
  stripeRemediationLink: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: {
    type: Date,
    default: Date.now
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