const HostApplication = require('../models/HostApplication');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const NotificationService = require('../services/notificationService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Helper function to upload file to Stripe and get file ID
const uploadFileToStripe = async (fileUrl, purpose = 'identity_document') => {
  try {
    console.log(`Uploading file to Stripe: ${fileUrl}`);
    
    // Download the file from Cloudinary URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from ${fileUrl}: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    // Upload to Stripe
    const file = await stripe.files.create({
      file: {
        data: Buffer.from(buffer),
        name: 'document.jpg',
        type: 'image/jpeg'
      },
      purpose: purpose
    });
    
    console.log(`File uploaded to Stripe successfully: ${file.id}`);
    return file.id;
  } catch (error) {
    console.error('Error uploading file to Stripe:', error);
    throw error;
  }
};

// Submit host application
exports.submitApplication = async (req, res) => {
  try {
    console.log('Submit application request:', {
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'No files',
      user: req.user._id
    });

    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    console.log('User authenticated:', req.user._id);

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: 'Request body is empty'
      });
    }

    console.log('Request body validation passed');

    // Check if user already has a pending or approved application
    const existingApplication = await HostApplication.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You already have a pending or approved application' 
      });
    }

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth',
      'idType', 'idNumber', 'street', 'city', 'state', 'postalCode', 'country',
      'propertyType', 'propertyDescription'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate date of birth
    const dateOfBirth = new Date(req.body.dateOfBirth);
    if (isNaN(dateOfBirth.getTime())) {
      return res.status(400).json({
        message: 'Invalid date of birth format'
      });
    }

    // Check if date is in the future
    if (dateOfBirth > new Date()) {
      return res.status(400).json({
        message: 'Date of birth cannot be in the future'
      });
    }

    // Check if user is at least 18 years old
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return res.status(400).json({
        message: 'You must be at least 18 years old to become a host'
      });
    }
    
    if (age > 120) {
      return res.status(400).json({
        message: 'Invalid date of birth: age seems unrealistic'
      });
    }

    console.log('User age validated:', age);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Validate email domain
    const emailDomain = req.body.email.split('@')[1];
    if (emailDomain && emailDomain.length < 3) {
      return res.status(400).json({
        message: 'Invalid email domain'
      });
    }

    console.log('Email format validation passed');

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = req.body.phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        message: 'Invalid phone number format. Please include country code if international.'
      });
    }

    // Validate phone number length
    if (req.body.phoneNumber && req.body.phoneNumber.length > 20) {
      return res.status(400).json({
        message: 'Phone number must be less than 20 characters'
      });
    }

    if (req.body.businessPhone && req.body.businessPhone.length > 20) {
      return res.status(400).json({
        message: 'Business phone number must be less than 20 characters'
      });
    }

    if (req.body.supportPhone && req.body.supportPhone.length > 20) {
      return res.status(400).json({
        message: 'Support phone number must be less than 20 characters'
      });
    }

    // Validate phone numbers are not just whitespace
    if (req.body.phoneNumber && req.body.phoneNumber.trim().length === 0) {
      return res.status(400).json({
        message: 'Phone number cannot be just whitespace'
      });
    }

    if (req.body.businessPhone && req.body.businessPhone.trim().length === 0) {
      return res.status(400).json({
        message: 'Business phone number cannot be just whitespace'
      });
    }

    if (req.body.supportPhone && req.body.supportPhone.trim().length === 0) {
      return res.status(400).json({
        message: 'Support phone number cannot be just whitespace'
      });
    }

    console.log('Phone number format validation passed');

    // Validate property description length
    if (req.body.propertyDescription.length < 20) {
      return res.status(400).json({
        message: 'Property description must be at least 20 characters long'
      });
    }

    if (req.body.propertyDescription.length > 1000) {
      return res.status(400).json({
        message: 'Property description must be less than 1000 characters'
      });
    }

    // Validate property description is not just whitespace
    if (req.body.propertyDescription.trim().length < 20) {
      return res.status(400).json({
        message: 'Property description must contain meaningful content (not just spaces)'
      });
    }

    console.log('Property description validation passed');

    // Validate property type enum values
    const validPropertyTypes = ['apartment', 'house', 'car', 'other'];
    if (!validPropertyTypes.includes(req.body.propertyType)) {
      return res.status(400).json({
        message: `Invalid property type. Must be one of: ${validPropertyTypes.join(', ')}`
      });
    }

    // Validate ID type enum values
    const validIdTypes = ['passport', 'national_id', 'tax_id', 'driving_license'];
    if (!validIdTypes.includes(req.body.idType)) {
      return res.status(400).json({
        message: `Invalid ID type. Must be one of: ${validIdTypes.join(', ')}`
      });
    }

    console.log('Property validation passed');

    console.log('All validations passed successfully');
    console.log('Form data summary:', {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        businessStructure: req.body.businessStructure,
        propertyType: req.body.propertyType,
      hasBusinessInfo: !!(req.body.businessName || req.body.businessTaxId),
      hasFinancialInfo: !!(req.body.ssn || req.body.bankAccountNumber)
    });

    // Validate required files
    if (!req.files || !req.files.idFrontImage || !req.files.idBackImage || !req.files.selfieImage) {
      return res.status(400).json({
        message: 'All identity verification documents are required: ID front image, ID back image, and selfie image'
      });
    }

    // Validate file structure
    const requiredFileFields = ['idFrontImage', 'idBackImage', 'selfieImage'];
    for (const field of requiredFileFields) {
      if (!Array.isArray(req.files[field]) || req.files[field].length === 0) {
        return res.status(400).json({
          message: `Invalid file structure for ${field}`
        });
      }
    }

    console.log('File validation passed');

    // Validate business structure if business information is provided
    if (req.body.businessName || req.body.businessTaxId) {
      if (!req.body.businessStructure || req.body.businessStructure === 'individual') {
        return res.status(400).json({
          message: 'Business structure must be specified when providing business information'
        });
      }
    }

    // Validate business structure enum values
    const validBusinessStructures = [
      'individual',
      'single_member_llc',
      'multi_member_llc', 
      'private_partnership',
      'private_corporation',
      'public_corporation',
      'incorporated_non_profit',
      'unincorporated_non_profit'
    ];

    if (req.body.businessStructure && !validBusinessStructures.includes(req.body.businessStructure)) {
      return res.status(400).json({
        message: `Invalid business structure. Must be one of: ${validBusinessStructures.join(', ')}`
      });
    }

    console.log('Business structure validation passed');

    // Validate SSN format if provided
    if (req.body.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(req.body.ssn)) {
      return res.status(400).json({
        message: 'SSN must be in format XXX-XX-XXXX'
      });
    }

    // Validate SSN last 4 digits
    if (req.body.ssnLast4 && !/^\d{4}$/.test(req.body.ssnLast4)) {
      return res.status(400).json({
        message: 'SSN last 4 digits must be exactly 4 digits'
      });
    }

    // Validate SSN consistency if both are provided
    if (req.body.ssn && req.body.ssnLast4) {
      const ssnLast4FromFull = req.body.ssn.split('-')[2];
      if (ssnLast4FromFull !== req.body.ssnLast4) {
        return res.status(400).json({
          message: 'SSN last 4 digits do not match the full SSN provided'
        });
      }
    }

    console.log('SSN validation passed');

    // Validate bank account information if provided
    if (req.body.bankAccountNumber || req.body.bankRoutingNumber) {
      if (!req.body.bankAccountNumber || !req.body.bankRoutingNumber || !req.body.bankAccountType) {
        return res.status(400).json({
          message: 'Complete bank account information is required: account number, routing number, and account type'
        });
      }
      
      if (!/^\d{9}$/.test(req.body.bankRoutingNumber)) {
        return res.status(400).json({
          message: 'Bank routing number must be exactly 9 digits'
        });
      }
      
      if (!/^\d+$/.test(req.body.bankAccountNumber)) {
        return res.status(400).json({
          message: 'Bank account number must contain only numbers'
        });
      }

      // Validate bank account type enum values
      const validBankAccountTypes = ['checking', 'savings'];
      if (!validBankAccountTypes.includes(req.body.bankAccountType)) {
        return res.status(400).json({
          message: `Invalid bank account type. Must be one of: ${validBankAccountTypes.join(', ')}`
        });
      }
    }

    // Validate country
    const validCountries = [
      'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy',
      'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
      'Ireland', 'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia',
      'Croatia', 'Romania', 'Bulgaria', 'Estonia', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Cyprus'
    ];

    if (!validCountries.includes(req.body.country)) {
      return res.status(400).json({
        message: `Invalid country. Must be one of: ${validCountries.join(', ')}`
      });
    }

    if (req.body.businessCountry && !validCountries.includes(req.body.businessCountry)) {
      return res.status(400).json({
        message: `Invalid business country. Must be one of: ${validCountries.join(', ')}`
      });
    }

    console.log('Country validation passed');

    // Validate postal code format based on country
    const postalCodeValidation = {
      'United States': /^\d{5}(-\d{4})?$/,
      'Canada': /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
      'United Kingdom': /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      'Australia': /^\d{4}$/,
      'Germany': /^\d{5}$/,
      'France': /^\d{5}$/,
      'Spain': /^\d{5}$/,
      'Italy': /^\d{5}$/
    };

    if (postalCodeValidation[req.body.country]) {
      const regex = postalCodeValidation[req.body.country];
      if (!regex.test(req.body.postalCode)) {
        return res.status(400).json({
          message: `Invalid postal code format for ${req.body.country}`
        });
      }
    }

    if (req.body.businessPostalCode && postalCodeValidation[req.body.businessCountry]) {
      const regex = postalCodeValidation[req.body.businessCountry];
      if (!regex.test(req.body.businessPostalCode)) {
        return res.status(400).json({
          message: `Invalid business postal code format for ${req.body.businessCountry}`
        });
      }
    }

    console.log('Postal code validation passed');

    // Validate state format based on country
    const stateValidation = {
      'United States': /^[A-Z]{2}$/,
      'Canada': /^[A-Z]{2}$/,
      'Australia': /^[A-Z]{2,3}$/
    };

    if (stateValidation[req.body.country]) {
      const regex = stateValidation[req.body.country];
      if (!regex.test(req.body.state)) {
        return res.status(400).json({
          message: `Invalid state format for ${req.body.country}. Use standard abbreviations (e.g., NY, CA, TX)`
        });
      }
    }

    if (req.body.businessState && stateValidation[req.body.businessCountry]) {
      const regex = stateValidation[req.body.businessCountry];
      if (!regex.test(req.body.businessState)) {
        return res.status(400).json({
          message: `Invalid business state format for ${req.body.businessCountry}. Use standard abbreviations (e.g., NY, CA, TX)`
        });
      }
    }

    console.log('State validation passed');

    // Validate phone number format based on country
    const phoneValidation = {
      'United States': /^\+?1[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/,
      'Canada': /^\+?1[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/,
      'United Kingdom': /^\+?44[\s\-]?[0-9]{4}[\s\-]?[0-9]{6}$/,
      'Australia': /^\+?61[\s\-]?[0-9]{1}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}$/
    };

    if (phoneValidation[req.body.country]) {
      const regex = phoneValidation[req.body.country];
      if (!regex.test(req.body.phoneNumber)) {
        return res.status(400).json({
          message: `Invalid phone number format for ${req.body.country}. Please include country code.`
        });
      }
    }

    if (req.body.businessPhone && phoneValidation[req.body.businessCountry]) {
      const regex = phoneValidation[req.body.businessCountry];
      if (!regex.test(req.body.businessPhone)) {
        return res.status(400).json({
          message: `Invalid business phone number format for ${req.body.businessCountry}. Please include country code.`
            });
          }
        }
        
    console.log('Phone number validation passed');

    // Validate postal code length
    if (req.body.postalCode && req.body.postalCode.length > 10) {
      return res.status(400).json({
        message: 'Postal code must be less than 10 characters'
      });
    }

    if (req.body.businessPostalCode && req.body.businessPostalCode.length > 10) {
      return res.status(400).json({
        message: 'Business postal code must be less than 10 characters'
      });
    }

    // Validate postal codes are not just whitespace
    if (req.body.postalCode && req.body.postalCode.trim().length === 0) {
      return res.status(400).json({
        message: 'Postal code cannot be just whitespace'
      });
    }

    if (req.body.businessPostalCode && req.body.businessPostalCode.trim().length === 0) {
      return res.status(400).json({
        message: 'Business postal code cannot be just whitespace'
      });
    }

    console.log('Postal code length validation passed');

    // Validate SSN length
    if (req.body.ssn && req.body.ssn.length > 11) {
      return res.status(400).json({
        message: 'SSN must be less than 11 characters'
      });
    }

    if (req.body.ssnLast4 && req.body.ssnLast4.length > 4) {
      return res.status(400).json({
        message: 'SSN last 4 digits must be exactly 4 characters'
      });
    }

    // Validate SSN is not just whitespace
    if (req.body.ssn && req.body.ssn.trim().length === 0) {
      return res.status(400).json({
        message: 'SSN cannot be just whitespace'
      });
    }

    if (req.body.ssnLast4 && req.body.ssnLast4.trim().length === 0) {
      return res.status(400).json({
        message: 'SSN last 4 digits cannot be just whitespace'
      });
    }

    console.log('SSN length validation passed');

    // Validate bank account number length
    if (req.body.bankAccountNumber && req.body.bankAccountNumber.length > 17) {
      return res.status(400).json({
        message: 'Bank account number must be less than 17 characters'
      });
    }

    if (req.body.bankRoutingNumber && req.body.bankRoutingNumber.length > 9) {
      return res.status(400).json({
        message: 'Bank routing number must be exactly 9 characters'
      });
    }

    // Validate bank account numbers are not just whitespace
    if (req.body.bankAccountNumber && req.body.bankAccountNumber.trim().length === 0) {
      return res.status(400).json({
        message: 'Bank account number cannot be just whitespace'
      });
    }

    if (req.body.bankRoutingNumber && req.body.bankRoutingNumber.trim().length === 0) {
      return res.status(400).json({
        message: 'Bank routing number cannot be just whitespace'
      });
    }

    console.log('Bank account number length validation passed');

    // Validate business tax ID length
    if (req.body.businessTaxId && req.body.businessTaxId.length > 20) {
      return res.status(400).json({
        message: 'Business tax ID must be less than 20 characters'
      });
    }

    // Validate business tax ID is not just whitespace
    if (req.body.businessTaxId && req.body.businessTaxId.trim().length === 0) {
      return res.status(400).json({
        message: 'Business tax ID cannot be just whitespace'
      });
    }

    console.log('Business tax ID length validation passed');

    // Validate business structure length
    if (req.body.businessStructure && req.body.businessStructure.length > 30) {
      return res.status(400).json({
        message: 'Business structure must be less than 30 characters'
      });
    }

    // Validate business structure is not just whitespace
    if (req.body.businessStructure && req.body.businessStructure.trim().length === 0) {
      return res.status(400).json({
        message: 'Business structure cannot be just whitespace'
      });
    }

    console.log('Business structure length validation passed');

    // Validate property type length
    if (req.body.propertyType && req.body.propertyType.length > 20) {
      return res.status(400).json({
        message: 'Property type must be less than 20 characters'
      });
    }

    // Validate property type is not just whitespace
    if (req.body.propertyType && req.body.propertyType.trim().length === 0) {
      return res.status(400).json({
        message: 'Property type cannot be just whitespace'
      });
    }

    console.log('Property type length validation passed');

    // Validate ID type length
    if (req.body.idType && req.body.idType.length > 20) {
      return res.status(400).json({
        message: 'ID type must be less than 20 characters'
      });
    }

    // Validate ID type is not just whitespace
    if (req.body.idType && req.body.idType.trim().length === 0) {
      return res.status(400).json({
        message: 'ID type cannot be just whitespace'
      });
    }

    console.log('ID type length validation passed');

    // Validate bank account type length
    if (req.body.bankAccountType && req.body.bankAccountType.length > 20) {
      return res.status(400).json({
        message: 'Bank account type must be less than 20 characters'
      });
    }

    // Validate bank account type is not just whitespace
    if (req.body.bankAccountType && req.body.bankAccountType.trim().length === 0) {
      return res.status(400).json({
        message: 'Bank account type cannot be just whitespace'
      });
    }

    console.log('Bank account type length validation passed');

    // Validate country length
    if (req.body.country && req.body.country.length > 50) {
      return res.status(400).json({
        message: 'Country must be less than 50 characters'
      });
    }

    if (req.body.businessCountry && req.body.businessCountry.length > 50) {
      return res.status(400).json({
        message: 'Business country must be less than 50 characters'
      });
    }

    // Validate country is not just whitespace
    if (req.body.country && req.body.country.trim().length === 0) {
      return res.status(400).json({
        message: 'Country cannot be just whitespace'
      });
    }

    if (req.body.businessCountry && req.body.businessCountry.trim().length === 0) {
      return res.status(400).json({
        message: 'Business country cannot be just whitespace'
      });
    }

    console.log('Country length validation passed');

    // Validate state length
    if (req.body.state && req.body.state.length > 50) {
      return res.status(400).json({
        message: 'State must be less than 50 characters'
      });
    }

    if (req.body.businessState && req.body.businessState.length > 50) {
      return res.status(400).json({
        message: 'Business state must be less than 50 characters'
      });
    }

    // Validate state is not just whitespace
    if (req.body.state && req.body.state.trim().length === 0) {
      return res.status(400).json({
        message: 'State cannot be just whitespace'
      });
    }

    if (req.body.businessState && req.body.businessState.trim().length === 0) {
      return res.status(400).json({
        message: 'Business state cannot be just whitespace'
      });
    }

    console.log('State length validation passed');

    // Validate city length
    if (req.body.city && req.body.city.length > 50) {
      return res.status(400).json({
        message: 'City must be less than 50 characters'
      });
    }

    if (req.body.businessCity && req.body.businessCity.length > 50) {
      return res.status(400).json({
        message: 'Business city must be less than 50 characters'
      });
    }

    // Validate city is not just whitespace
    if (req.body.city && req.body.city.trim().length === 0) {
      return res.status(400).json({
        message: 'City cannot be just whitespace'
      });
    }

    if (req.body.businessCity && req.body.businessCity.trim().length === 0) {
      return res.status(400).json({
        message: 'Business city cannot be just whitespace'
      });
    }

    console.log('City length validation passed');

    // Validate street address length
    if (req.body.street && req.body.street.length > 100) {
      return res.status(400).json({
        message: 'Street address must be less than 100 characters'
      });
    }

    if (req.body.businessStreet && req.body.businessStreet.length > 100) {
      return res.status(400).json({
        message: 'Business street address must be less than 100 characters'
      });
    }

    // Validate street address is not just whitespace
    if (req.body.street && req.body.street.trim().length === 0) {
      return res.status(400).json({
        message: 'Street address cannot be just whitespace'
      });
    }

    if (req.body.businessStreet && req.body.businessStreet.trim().length === 0) {
      return res.status(400).json({
        message: 'Business street address cannot be just whitespace'
      });
    }

    console.log('Street address length validation passed');

    // Validate business tax ID format based on country
    if (req.body.businessTaxId) {
      const taxIdValidation = {
        'United States': /^\d{2}-\d{7}$/,
        'Canada': /^\d{9}[A-Z]{2}$/,
        'United Kingdom': /^\d{10}$/
      };

      if (taxIdValidation[req.body.businessCountry]) {
        const regex = taxIdValidation[req.body.businessCountry];
        if (!regex.test(req.body.businessTaxId)) {
          return res.status(400).json({
            message: `Invalid business tax ID format for ${req.body.businessCountry}`
          });
        }
      }
    }

    console.log('Business tax ID validation passed');

    // Validate hosting experience length if provided
    if (req.body.hostingExperience && req.body.hostingExperience.length > 500) {
      return res.status(400).json({
        message: 'Hosting experience description must be less than 500 characters'
      });
    }

    // Validate hosting experience is not just whitespace if provided
    if (req.body.hostingExperience && req.body.hostingExperience.trim().length === 0) {
      return res.status(400).json({
        message: 'Hosting experience cannot be just whitespace'
      });
    }

    console.log('Hosting experience validation passed');

    // Validate business name length if provided
    if (req.body.businessName && req.body.businessName.length > 100) {
      return res.status(400).json({
        message: 'Business name must be less than 100 characters'
      });
    }

    // Validate business name is not just whitespace if provided
    if (req.body.businessName && req.body.businessName.trim().length === 0) {
      return res.status(400).json({
        message: 'Business name cannot be just whitespace'
      });
    }

    console.log('Business name validation passed');

    // Validate address field lengths
    const addressFields = ['street', 'city', 'state'];
    for (const field of addressFields) {
      if (req.body[field] && req.body[field].length > 100) {
        return res.status(400).json({
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than 100 characters`
        });
      }
    }

    // Validate address fields are not just whitespace
    for (const field of addressFields) {
      if (req.body[field] && req.body[field].trim().length === 0) {
        return res.status(400).json({
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} cannot be just whitespace`
        });
      }
    }

    if (req.body.businessStreet && req.body.businessStreet.length > 100) {
      return res.status(400).json({
        message: 'Business street address must be less than 100 characters'
      });
    }

    if (req.body.businessCity && req.body.businessCity.length > 100) {
      return res.status(400).json({
        message: 'Business city must be less than 100 characters'
      });
    }

    if (req.body.businessState && req.body.businessState.length > 100) {
      return res.status(400).json({
        message: 'Business state must be less than 100 characters'
      });
    }

    // Validate business address fields are not just whitespace if provided
    if (req.body.businessStreet && req.body.businessStreet.trim().length === 0) {
      return res.status(400).json({
        message: 'Business street address cannot be just whitespace'
      });
    }

    if (req.body.businessCity && req.body.businessCity.trim().length === 0) {
      return res.status(400).json({
        message: 'Business city cannot be just whitespace'
      });
    }

    if (req.body.businessState && req.body.businessState.trim().length === 0) {
      return res.status(400).json({
        message: 'Business state cannot be just whitespace'
      });
    }

    console.log('Address field validation passed');

    // Validate ID number length
    if (req.body.idNumber && req.body.idNumber.length > 50) {
      return res.status(400).json({
        message: 'ID number must be less than 50 characters'
      });
    }

    // Validate ID number is not just whitespace
    if (req.body.idNumber && req.body.idNumber.trim().length === 0) {
      return res.status(400).json({
        message: 'ID number cannot be just whitespace'
      });
    }

    console.log('ID number validation passed');

    // Validate name field lengths
    if (req.body.firstName && req.body.firstName.length > 50) {
      return res.status(400).json({
        message: 'First name must be less than 50 characters'
      });
    }

    if (req.body.lastName && req.body.lastName.length > 50) {
      return res.status(400).json({
        message: 'Last name must be less than 50 characters'
      });
    }

    // Validate name fields are not just whitespace
    if (req.body.firstName && req.body.firstName.trim().length === 0) {
      return res.status(400).json({
        message: 'First name cannot be just whitespace'
      });
    }

    if (req.body.lastName && req.body.lastName.trim().length === 0) {
      return res.status(400).json({
        message: 'Last name cannot be just whitespace'
      });
    }

    console.log('Name field validation passed');

    // Validate email length
    if (req.body.email && req.body.email.length > 100) {
      return res.status(400).json({
        message: 'Email must be less than 100 characters'
      });
    }

    // Validate email is not just whitespace
    if (req.body.email && req.body.email.trim().length === 0) {
      return res.status(400).json({
        message: 'Email cannot be just whitespace'
      });
    }

    console.log('Email length validation passed');

    // Validate phone number length
    if (req.body.phoneNumber && req.body.phoneNumber.length > 20) {
      return res.status(400).json({
        message: 'Phone number must be less than 20 characters'
      });
    }

    if (req.body.businessPhone && req.body.businessPhone.length > 20) {
      return res.status(400).json({
        message: 'Business phone number must be less than 20 characters'
      });
    }

    if (req.body.supportPhone && req.body.supportPhone.length > 20) {
      return res.status(400).json({
        message: 'Support phone number must be less than 20 characters'
      });
    }

    console.log('Phone number length validation passed');

    // Prepare application data
      const applicationData = {
        user: req.user._id,
      // Personal Information
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        postalAddress: {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          postalCode: req.body.postalCode,
          country: req.body.country
        },
        dateOfBirth: req.body.dateOfBirth,
        identityDocuments: {
          idType: req.body.idType,
          idNumber: req.body.idNumber,
          idFrontImage: null,
          idBackImage: null,
          selfieImage: null
        },
      // Business Information
      businessName: req.body.businessName || null,
      businessTaxId: req.body.businessTaxId || null,
      businessAddress: req.body.businessStreet ? {
          street: req.body.businessStreet,
          city: req.body.businessCity,
          state: req.body.businessState,
          postalCode: req.body.businessPostalCode,
          country: req.body.businessCountry
      } : null,
      businessPhone: req.body.businessPhone || null,
      businessStructure: req.body.businessStructure || 'individual',
      // Financial Information
      ssn: req.body.ssn || null,
      ssnLast4: req.body.ssnLast4 || null,
      supportPhone: req.body.supportPhone || null,
      bankAccount: req.body.bankAccountNumber ? {
          accountNumber: req.body.bankAccountNumber,
          routingNumber: req.body.bankRoutingNumber,
          accountType: req.body.bankAccountType
      } : null,
      // Payment Methods
      paymentMethods: {
        stripeAccountId: req.body.stripeAccountId || undefined,
        creditCard: req.body.creditCardLast4 ? { last4: req.body.creditCardLast4 } : undefined
        },
        propertyType: req.body.propertyType,
        propertyDescription: req.body.propertyDescription,
        hostingExperience: req.body.hostingExperience,
        status: 'pending',
        submittedAt: new Date()
      };

    console.log('Prepared application data:', JSON.stringify(applicationData, null, 2));

      // Handle file uploads
      if (req.files && Object.keys(req.files).length > 0) {
        console.log('Files received:', Object.keys(req.files));
      
      // Validate file types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        // Handle idFrontImage
        if (req.files.idFrontImage && req.files.idFrontImage[0]) {
          try {
            const file = req.files.idFrontImage[0];
          
          // Validate file type
          if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
              message: `Invalid file type for ID front image. Allowed types: ${allowedTypes.join(', ')}`
            });
          }
          
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
              message: 'ID front image file size must be less than 5MB'
            });
          }
          
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${req.user._id}_idFront_${Date.now()}`
            });
            applicationData.identityDocuments.idFrontImage = result.secure_url;
          console.log('ID front image uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for idFrontImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload ID front image: ${uploadError.message}` 
            });
          }
        }
        
        // Handle idBackImage
        if (req.files.idBackImage && req.files.idBackImage[0]) {
          try {
            const file = req.files.idBackImage[0];
          
          // Validate file type
          if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
              message: `Invalid file type for ID back image. Allowed types: ${allowedTypes.join(', ')}`
            });
          }
          
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
              message: 'ID back image file size must be less than 5MB'
            });
          }
          
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${req.user._id}_idBack_${Date.now()}`
            });
            applicationData.identityDocuments.idBackImage = result.secure_url;
          console.log('ID back image uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for idBackImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload ID back image: ${uploadError.message}` 
            });
          }
        }
        
        // Handle selfieImage
        if (req.files.selfieImage && req.files.selfieImage[0]) {
          try {
            const file = req.files.selfieImage[0];
          
          // Validate file type
          if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
              message: `Invalid file type for selfie image. Allowed types: ${allowedTypes.join(', ')}`
            });
          }
          
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
              message: 'Selfie image file size must be less than 5MB'
            });
          }
          
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${req.user._id}_selfie_${Date.now()}`
            });
            applicationData.identityDocuments.selfieImage = result.secure_url;
          console.log('Selfie image uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for selfieImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload selfie image: ${uploadError.message}` 
            });
          }
        }
    }

    // Verify all required files were uploaded successfully
    if (!applicationData.identityDocuments.idFrontImage || 
        !applicationData.identityDocuments.idBackImage || 
        !applicationData.identityDocuments.selfieImage) {
      return res.status(500).json({
        message: 'Failed to upload one or more required identity documents. Please try again.'
      });
    }

    console.log('All files uploaded successfully');

    // Create the host application
      const application = new HostApplication(applicationData);
    
    try {
      await application.save();
      console.log('Host application created successfully:', application._id);
    } catch (saveError) {
      console.error('Error saving host application:', saveError);
      return res.status(500).json({
        message: 'Failed to save host application. Please try again.',
        error: saveError.message
      });
    }

    // Now create Stripe Connect Express account
    try {
      console.log('Creating Stripe Connect Express account for host:', req.user._id);
      console.log('Business structure:', req.body.businessStructure);
      console.log('Country:', req.body.businessCountry || req.body.country);

      // Helper function to convert country name to ISO code
      const getCountryCode = (countryName) => {
        if (!countryName) return 'US';
        const countryMap = {
          'United States': 'US',
          'Canada': 'CA',
          'United Kingdom': 'GB',
          'Australia': 'AU',
          'Germany': 'DE',
          'France': 'FR',
          'Spain': 'ES',
          'Italy': 'IT',
          'Netherlands': 'NL',
          'Belgium': 'BE',
          'Switzerland': 'CH',
          'Austria': 'AT',
          'Sweden': 'SE',
          'Norway': 'NO',
          'Denmark': 'DK',
          'Finland': 'FI',
          'Ireland': 'IE',
          'Portugal': 'PT',
          'Greece': 'GR',
          'Poland': 'PL',
          'Czech Republic': 'CZ',
          'Hungary': 'HU',
          'Slovakia': 'SK',
          'Slovenia': 'SI',
          'Croatia': 'HR',
          'Romania': 'RO',
          'Bulgaria': 'BG',
          'Estonia': 'EE',
          'Latvia': 'LV',
          'Lithuania': 'LT',
          'Luxembourg': 'LU',
          'Malta': 'MT',
          'Cyprus': 'CY'
        };
        const code = countryMap[countryName] || countryName;
        console.log(`Country mapping: "${countryName}" -> "${code}"`);
        return code;
      };

      const countryCode = getCountryCode(req.body.businessCountry || req.body.country);
      console.log('Using country code:', countryCode);

      // Prepare Stripe account creation parameters
      const stripeAccountParams = {
        type: 'express',
        country: countryCode,
        email: req.body.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          tax_reporting_us_1099_k: { requested: true },
        },
        business_type: req.body.businessStructure === 'individual' ? 'individual' : 'company',
        business_profile: {
          support_phone: req.body.supportPhone || req.body.phoneNumber,
          url: null,
          mcc: '7399', // Computer Software Stores
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual', // Payouts are triggered manually by our scheduler
            },
          },
        },
        metadata: {
          business_category: 'rental_services',
          platform: 'DrivInn',
          account_type: 'host',
          user_id: req.user._id.toString(),
        },
      };

      // Add company or individual details based on business structure
      if (req.body.businessStructure !== 'individual') {
        stripeAccountParams.company = {
          name: req.body.businessName || `${req.body.firstName} ${req.body.lastName} Hosting Services`,
          tax_id: req.body.businessTaxId || null,
          phone: req.body.supportPhone || req.body.phoneNumber,
          address: {
            line1: req.body.businessStreet || req.body.street,
            city: req.body.businessCity || req.body.city,
            state: req.body.businessState || req.body.state,
            postal_code: req.body.businessPostalCode || req.body.postalCode,
            country: countryCode,
          },
          structure: req.body.businessStructure || 'individual',
        };
      } else {
        stripeAccountParams.individual = {
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          email: req.body.email,
          phone: req.body.supportPhone || req.body.phoneNumber,
          dob: {
            day: new Date(req.body.dateOfBirth).getDate(),
            month: new Date(req.body.dateOfBirth).getMonth() + 1,
            year: new Date(req.body.dateOfBirth).getFullYear(),
          },
          ssn_last_4: req.body.ssnLast4 || null,
          id_number: req.body.ssn ? req.body.ssn.replace(/[^0-9]/g, '') : null,
          address: {
            line1: req.body.street,
            city: req.body.city,
            state: req.body.state,
            postal_code: req.body.postalCode,
            country: countryCode,
          },
        };
      }

      console.log('Stripe account creation parameters:', JSON.stringify(stripeAccountParams, null, 2));

      // Validate Stripe account parameters
      if (!stripeAccountParams.country || !stripeAccountParams.email) {
        throw new Error('Missing required Stripe account parameters: country and email are required');
      }

      if (stripeAccountParams.business_type === 'company' && !stripeAccountParams.company) {
        throw new Error('Company information is required when business_type is company');
      }

      if (stripeAccountParams.business_type === 'individual' && !stripeAccountParams.individual) {
        throw new Error('Individual information is required when business_type is individual');
      }

      console.log('Stripe account parameters validated successfully');

      // Create Stripe Connect Express account
      const account = await stripe.accounts.create(stripeAccountParams);

      console.log('Stripe Connect Express account created:', account.id);
      console.log('Account details:', {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements
      });

      // Update application with Stripe Connect account info
      application.stripeConnect = {
        accountId: account.id,
        accountStatus: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
        onboardingCompleted: account.charges_enabled
      };

      // Store any pending requirements for better guidance
      if (account.requirements && Object.keys(account.requirements).length > 0) {
        application.stripeConnect.pendingRequirements = account.requirements;
        console.log('Pending requirements:', account.requirements);
      }

      // Create account link for onboarding
      console.log('Creating account link for onboarding...');
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      console.log('Using frontend URL for redirects:', frontendUrl);
      
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${frontendUrl}/host-application-status`,
        return_url: `${frontendUrl}/host-application-status`,
        type: 'account_onboarding',
      });

      if (!accountLink || !accountLink.url) {
        throw new Error('Failed to create account link: No URL returned from Stripe');
      }

      console.log('Account link created successfully:', accountLink.url);

      // Save the updated application
      try {
        await application.save();
        console.log('Application saved with Stripe Connect info');
      } catch (updateError) {
        console.error('Error updating application with Stripe info:', updateError);
        // Don't fail the entire process, but log the error
        // The application was already saved earlier, so this is just an update
      }

      // Create notification for the user
      try {
        if (typeof NotificationService !== 'undefined' && NotificationService.createNotification) {
          await NotificationService.createNotification(
            req.user._id,
            'Host Application Submitted',
            `Your host application has been submitted successfully. Please complete your Stripe account setup to continue.`,
            `/host-application-status`,
            'info'
          );
          console.log('Notification created successfully');
        } else {
          console.log('NotificationService not available, skipping notification');
        }
      } catch (notificationError) {
        console.error('Error creating submission notification:', notificationError);
        // Don't fail the entire process if notification fails
      }

      res.status(201).json({
        message: 'Host application submitted successfully',
        application: application,
        stripeAccount: {
          id: account.id,
          status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
          onboardingUrl: accountLink.url,
          dashboardUrl: `https://dashboard.stripe.com/express/${account.id}`
        }
      });

      console.log('Response sent successfully to client');

    } catch (stripeError) {
      console.error('Error creating Stripe Connect account:', stripeError);
      console.error('Stripe error details:', {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        decline_code: stripeError.decline_code,
        param: stripeError.param
      });
      
      // Save the application without Stripe info for now
      try {
        await application.save();
        console.log('Application saved without Stripe info due to error');
      } catch (saveError) {
        console.error('Error saving application after Stripe failure:', saveError);
        return res.status(500).json({
          message: 'Failed to save application. Please try again.',
          error: saveError.message
        });
      }
      
      return res.status(500).json({
        message: 'Application submitted but failed to create payment account. Please contact support.',
        application: application,
        error: stripeError.message,
        stripeErrorType: stripeError.type,
        stripeErrorCode: stripeError.code
      });
    }

  } catch (err) {
    console.error('Error in submitApplication:', err);
    
    // Ensure we don't send multiple responses
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error submitting application', 
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// User gets their own application
exports.getMyApplication = async (req, res) => {
  try {
    const application = await HostApplication.findOne({ user: req.user._id });
    if (!application) return res.status(404).json({ message: 'No application found' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: list all applications (optionally filter by status)
exports.listApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const applications = await HostApplication.find(query).populate('user', 'firstName lastName email role');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: approve application
exports.approveApplication = async (req, res) => {
  try {
    const { adminNote, stripeRemediationLink } = req.body;
    
    if (!adminNote || !adminNote.trim()) {
      return res.status(400).json({ message: 'Admin note is required for approval' });
    }
    
    if (!stripeRemediationLink || !stripeRemediationLink.trim()) {
      return res.status(400).json({ message: 'Stripe remediation link is required for approval' });
    }
    
    const application = await HostApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status === 'approved') return res.status(400).json({ message: 'Already approved' });
    
    // Create Stripe Connect Express account for the host
    try {
      console.log('Creating Stripe Connect Express account for host:', application.user);
      
      // Validate that all required information is present
      const requiredFields = [
        'firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth',
        'postalAddress.street', 'postalAddress.city', 'postalAddress.state', 
        'postalAddress.postalCode', 'postalAddress.country'
      ];
      
      const missingFields = requiredFields.filter(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], application);
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: 'Missing required fields for Stripe Connect account creation',
          error: 'MISSING_REQUIRED_FIELDS',
          missingFields: missingFields
        });
      }
      
      // Upload ID front image to Stripe if available
      let stripeFileId = null;
      if (application.identityDocuments?.idFrontImage) {
        try {
          console.log('Uploading ID front image to Stripe...');
          stripeFileId = await uploadFileToStripe(application.identityDocuments.idFrontImage);
          console.log('ID front image uploaded to Stripe:', stripeFileId);
        } catch (uploadError) {
          console.error('Failed to upload ID front image to Stripe:', uploadError);
          // Continue without the document for now
        }
      }
      
      // Helper function to convert country name to ISO code
      const getCountryCode = (countryName) => {
        if (!countryName) return 'US';
        const countryMap = {
          'United States': 'US',
          'Canada': 'CA',
          'United Kingdom': 'GB',
          'Australia': 'AU',
          'Germany': 'DE',
          'France': 'FR',
          'Spain': 'ES',
          'Italy': 'IT',
          'Netherlands': 'NL',
          'Belgium': 'BE',
          'Switzerland': 'CH',
          'Austria': 'AT',
          'Sweden': 'SE',
          'Norway': 'NO',
          'Denmark': 'DK',
          'Finland': 'FI',
          'Ireland': 'IE',
          'Portugal': 'PT',
          'Greece': 'GR',
          'Poland': 'PL',
          'Czech Republic': 'CZ',
          'Hungary': 'HU',
          'Slovakia': 'SK',
          'Slovenia': 'SI',
          'Croatia': 'HR',
          'Romania': 'RO',
          'Bulgaria': 'BG',
          'Estonia': 'EE',
          'Latvia': 'LV',
          'Lithuania': 'LT',
          'Luxembourg': 'LU',
          'Malta': 'MT',
          'Cyprus': 'CY'
        };
        return countryMap[countryName] || countryName;
      };

      // Create Stripe account with available information
      const account = await stripe.accounts.create({
        type: 'express',
        country: getCountryCode(application.postalAddress?.country),
        email: application.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          tax_reporting_us_1099_k: { requested: true },
        },
        business_type: application.businessStructure === 'individual' ? 'individual' : 'company',
        company: application.businessStructure !== 'individual' ? {
          name: application.businessName || `${application.firstName} ${application.lastName} Hosting Services`,
          tax_id: application.businessTaxId || null,
          phone: application.supportPhone || application.phoneNumber,
          address: {
            line1: application.businessAddress?.street || application.postalAddress?.street,
            city: application.businessAddress?.city || application.postalAddress?.city,
            state: application.businessAddress?.state || application.postalAddress?.state,
            postal_code: application.businessAddress?.postalCode || application.postalAddress?.postalCode,
            country: getCountryCode(application.businessAddress?.country || application.postalAddress?.country),
          },
          structure: application.businessStructure || 'individual',
        } : undefined,
        individual: application.businessStructure === 'individual' ? {
          first_name: application.firstName,
          last_name: application.lastName,
          email: application.email,
          phone: application.supportPhone || application.phoneNumber,
          dob: {
            day: application.dateOfBirth.getDate(),
            month: application.dateOfBirth.getMonth() + 1,
            year: application.dateOfBirth.getFullYear(),
          },
          ssn_last_4: application.ssnLast4 || null,
          id_number: application.ssn ? application.ssn.replace(/[^0-9]/g, '') : null,
          address: {
            line1: application.postalAddress.street,
            city: application.postalAddress.city,
            state: application.postalAddress.state,
            postal_code: application.postalAddress.postalCode,
            country: getCountryCode(application.postalAddress.country),
          },
        } : undefined,
        business_profile: {
          support_phone: application.supportPhone || application.phoneNumber,
          url: null,
          mcc: '7399', // Computer Software Stores
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual', // Payouts are triggered manually by our scheduler
            },
          },
        },
        metadata: {
          business_category: 'rental_services',
          platform: 'DrivInn',
          account_type: 'host',
        },
      });

      console.log('Stripe Connect Express account created:', account.id);
      
      // Update application with Stripe Connect account info
      application.stripeConnect = {
        accountId: account.id,
        accountStatus: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
        onboardingCompleted: account.charges_enabled
      };
      
      // Store any pending requirements for better guidance
      if (account.requirements && Object.keys(account.requirements).length > 0) {
        application.stripeConnect.pendingRequirements = account.requirements;
      }
      
    } catch (stripeError) {
      console.error('Error creating Stripe Connect account:', stripeError);
      return res.status(500).json({ 
        message: 'Failed to create payment account. Please try again.',
        error: stripeError.message 
      });
    }
    
    console.log('Updating application status to approved');
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.adminNote = adminNote;
    application.stripeRemediationLink = stripeRemediationLink;
    await application.save();
    
    console.log('Updating user profile with host application data');
    
    // Update user profile with host application information
    const userUpdateData = {
      role: 'host',
      hostProfile: {
        businessName: application.businessName,
        businessTaxId: application.businessTaxId,
        businessAddress: application.businessAddress,
        businessPhone: application.businessPhone,
        ssnLast4: application.ssnLast4,
        bankAccount: application.bankAccount,
        stripeConnectAccountId: application.stripeConnect.accountId,
        stripeConnectStatus: application.stripeConnect.accountStatus,
        propertyType: application.propertyType,
        propertyDescription: application.propertyDescription,
        hostingExperience: application.hostingExperience,
        applicationApprovedAt: new Date(),
        applicationApprovedBy: req.user._id
      }
    };
    
    await User.findByIdAndUpdate(application.user, userUpdateData);
    
    // Create notification for the applicant
    try {
      await NotificationService.createHostApplicationNotification(application._id, 'host_application_approved');
    } catch (notificationError) {
      console.error('Error creating approval notification:', notificationError);
    }
    
    res.json({ 
      message: 'Application approved', 
      application,
      stripeAccount: {
        id: application.stripeConnect.accountId,
        status: application.stripeConnect.accountStatus,
        dashboardUrl: `https://dashboard.stripe.com/express/${application.stripeConnect.accountId}`
      }
    });
  } catch (err) {
    console.error('Error in approveApplication:', err);
    res.status(500).json({ message: 'Error approving application', error: err.message });
  }
};

// Admin: decline application
exports.declineApplication = async (req, res) => {
  try {
    console.log('Decline application request:', {
      id: req.params.id,
      body: req.body,
      user: req.user._id
    });
    
    const application = await HostApplication.findById(req.params.id);
    if (!application) {
      console.log('Application not found');
      return res.status(404).json({ message: 'Application not found' });
    }
    
    if (application.status === 'declined') {
      console.log('Application already declined');
      return res.status(400).json({ message: 'Already declined' });
    }
    
    console.log('Updating application status to declined');
    application.status = 'declined';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.adminNote = req.body.adminNote?.adminNote || req.body.adminNote || '';
    
    console.log('Saving application');
    await application.save();
    
    console.log('Application declined successfully');
    
    // Create notification for the applicant
    try {
      console.log('Creating notification');
      await NotificationService.createHostApplicationNotification(application._id, 'host_application_declined');
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Error creating decline notification:', notificationError);
    }
    
    res.json({ message: 'Application declined', application });
  } catch (err) {
    console.error('Error in declineApplication:', err);
    res.status(400).json({ message: 'Error declining application', error: err.message });
  }
};

// Refresh Stripe account status for existing hosts
exports.refreshStripeAccountStatus = async (req, res) => {
  try {
    const application = await HostApplication.findOne({ 
      user: req.user._id, 
      status: 'approved' 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'No approved application found' });
    }
    
    if (!application.stripeConnect?.accountId) {
      return res.status(404).json({ message: 'No Stripe account found' });
    }
    
    // Get current account status from Stripe
    const account = await stripe.accounts.retrieve(application.stripeConnect.accountId);
    
    // Update application status
    application.stripeConnect.accountStatus = account.charges_enabled && account.payouts_enabled ? 'active' : 'pending';
    application.stripeConnect.onboardingCompleted = account.charges_enabled;
    application.stripeConnect.pendingRequirements = account.requirements;
    await application.save();
    
    res.json({ 
      message: 'Stripe account status refreshed',
      accountId: application.stripeConnect.accountId,
      accountStatus: application.stripeConnect.accountStatus,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements
    });
  } catch (err) {
    console.error('Error refreshing Stripe account status:', err);
    res.status(500).json({ message: 'Error refreshing account status', error: err.message });
  }
};

// Get Stripe setup status for hosts
exports.getStripeSetupStatus = async (req, res) => {
  try {
    const application = await HostApplication.findOne({ 
      user: req.user._id, 
      status: 'approved' 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'No approved application found' });
    }
    
    if (!application.stripeConnect?.accountId) {
      return res.status(404).json({ message: 'No Stripe account found' });
    }
    
    // Get current account status from Stripe
    const account = await stripe.accounts.retrieve(application.stripeConnect.accountId);
    
    res.json({ 
      message: 'Stripe account setup status retrieved',
      accountId: application.stripeConnect.accountId,
      accountStatus: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      dashboardUrl: `https://dashboard.stripe.com/express/${application.stripeConnect.accountId}`
    });
    
  } catch (err) {
    console.error('Error getting Stripe setup status:', err);
    res.status(500).json({ message: 'Error getting setup status', error: err.message });
  }
};

// Create Stripe dashboard login link for hosts
exports.createStripeLoginLink = async (req, res) => {
  try {
    const application = await HostApplication.findOne({ 
      user: req.user._id, 
      status: 'approved' 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'No approved application found' });
    }
    
    if (!application.stripeConnect?.accountId) {
      return res.status(404).json({ message: 'No Stripe account found' });
    }
    
    // Create a login link to the host's Stripe dashboard
    const loginLink = await stripe.accounts.createLoginLink(application.stripeConnect.accountId);
    
    res.json({ 
      message: 'Stripe dashboard login link created',
      loginUrl: loginLink.url,
      expiresAt: loginLink.expires_at,
      accountId: application.stripeConnect.accountId
    });
    
  } catch (err) {
    console.error('Error creating Stripe login link:', err);
    res.status(500).json({ message: 'Error creating login link', error: err.message });
  }
}; 