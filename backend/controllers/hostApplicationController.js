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

// Helper function to generate Stripe Connect Express dashboard URL
// Format: https://connect.stripe.com/express/acct_{ACCOUNT_ID}/bKsxnuQI7PAK
const generateStripeDashboardUrl = (accountId) => {
  return `https://connect.stripe.com/express/acct_${accountId}/bKsxnuQI7PAK`;
};

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
// NOTE: This function creates the Stripe Connect account during submission.
// The admin approval process only stores the remediation link and does NOT create duplicate accounts.
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
    let age = today.getFullYear() - dateOfBirth.getFullYear();
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
      'Italy': /^\d{5}$/,
      'Netherlands': /^\d{4} ?[A-Z]{2}$/i,
      'Belgium': /^\d{4}$/,
      'Switzerland': /^\d{4}$/,
      'Austria': /^\d{4}$/,
      'Sweden': /^\d{3} ?\d{2}$/,
      'Norway': /^\d{4}$/,
      'Denmark': /^\d{4}$/,
      'Finland': /^\d{5}$/,
      'Ireland': /^[A-Z]\d{2} ?[A-Z0-9]{4}$/i,
      'Portugal': /^\d{4}-\d{3}$/,
      'Greece': /^\d{5}$/,
      'Poland': /^\d{2}-\d{3}$/,
      'Czech Republic': /^\d{3} ?\d{2}$/,
      'Hungary': /^\d{4}$/,
      'Slovakia': /^\d{3} ?\d{2}$/,
      'Slovenia': /^\d{4}$/,
      'Croatia': /^\d{5}$/,
      'Romania': /^\d{6}$/,
      'Bulgaria': /^\d{4}$/,
      'Estonia': /^\d{5}$/,
      'Latvia': /^\d{4}$/,
      'Lithuania': /^\d{5}$/,
      'Luxembourg': /^\d{4}$/,
      'Malta': /^[A-Z]{3} ?\d{4}$/i,
      'Cyprus': /^\d{4}$/
    };

    if (req.body.postalCode && postalCodeValidation[req.body.country]) {
      const regex = postalCodeValidation[req.body.country];
      if (!regex.test(req.body.postalCode)) {
        return res.status(400).json({
          message: `Invalid postal code format for ${req.body.country}`
        });
      }
    }

    console.log('Postal code validation passed');

    // Validate state format based on country
    const stateValidation = {
      'United States': /^[A-Z]{2}$/,
      'Canada': /^[A-Z]{2}$/,
      'Australia': /^[A-Z]{2,3}$/,
      'Germany': /^[A-Z]{2}$/,
      'India': /^[A-Z]{2}$/
    };

    if (req.body.state && stateValidation[req.body.country]) {
      const regex = stateValidation[req.body.country];
      if (!regex.test(req.body.state)) {
        return res.status(400).json({
          message: `Invalid state format for ${req.body.country}. Use standard abbreviations (e.g., NY, CA, TX)`
        });
      }
    }

    console.log('State validation passed');

    // Validate phone number format based on country
    const phoneValidation = {
      'United States': /^\+1\s?\(?\d{3}\)?\s?\d{3}-?\d{4}$/,
      'Canada': /^\+1\s?\(?\d{3}\)?\s?\d{3}-?\d{4}$/,
      'United Kingdom': /^\+44\s?\d{4}\s?\d{6}$/,
      'Australia': /^\+61\s?\d{1}\s?\d{4}\s?\d{4}$/,
      'Germany': /^\+49\s?\d{2,4}\s?\d{3,8}$/,
      'France': /^\+33\s?\d{1}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
      'Spain': /^\+34\s?\d{3}\s?\d{3}\s?\d{3}$/,
      'Italy': /^\+39\s?\d{3}\s?\d{3}\s?\d{3}$/,
      'Netherlands': /^\+31\s?\d{1,2}\s?\d{3,4}\s?\d{4}$/,
      'Belgium': /^\+32\s?\d{1,2}\s?\d{2,3}\s?\d{2,3}\s?\d{2}$/,
      'Switzerland': /^\+41\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/,
      'Austria': /^\+43\s?\d{1,4}\s?\d{3,8}$/,
      'Sweden': /^\+46\s?\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/,
      'Norway': /^\+47\s?\d{3}\s?\d{2}\s?\d{3}$/,
      'Denmark': /^\+45\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
      'Finland': /^\+358\s?\d{2}\s?\d{3}\s?\d{4}$/,
      'Ireland': /^\+353\s?\d{1,2}\s?\d{3}\s?\d{4}$/,
      'Portugal': /^\+351\s?\d{2}\s?\d{3}\s?\d{3}$/,
      'Greece': /^\+30\s?\d{2,4}\s?\d{3,8}$/,
      'Poland': /^\+48\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/,
      'Czech Republic': /^\+420\s?\d{3}\s?\d{3}\s?\d{3}$/,
      'Hungary': /^\+36\s?\d{1,2}\s?\d{3}\s?\d{4}$/,
      'Slovakia': /^\+421\s?\d{2}\s?\d{3}\s?\d{3}$/,
      'Slovenia': /^\+386\s?\d{1,2}\s?\d{3}\s?\d{3}$/,
      'Croatia': /^\+385\s?\d{1,2}\s?\d{3}\s?\d{3}$/,
      'Romania': /^\+40\s?\d{2,3}\s?\d{3}\s?\d{3}$/,
      'Bulgaria': /^\+359\s?\d{2}\s?\d{3}\s?\d{3}$/,
      'Estonia': /^\+372\s?\d{3,4}\s?\d{3,4}$/,
      'Latvia': /^\+371\s?\d{2}\s?\d{3}\s?\d{3}$/,
      'Lithuania': /^\+370\s?\d{2,3}\s?\d{3}\s?\d{3}$/,
      'Luxembourg': /^\+352\s?\d{2,3}\s?\d{2,3}\s?\d{2,3}$/,
      'Malta': /^\+356\s?\d{4}\s?\d{4}$/,
      'Cyprus': /^\+357\s?\d{2}\s?\d{6}$/
    };

    if (req.body.phoneNumber && phoneValidation[req.body.country]) {
      const regex = phoneValidation[req.body.country];
      if (!regex.test(req.body.phoneNumber)) {
        return res.status(400).json({
          message: `Invalid phone number format for ${req.body.country}. Please include country code.`
        });
      }
    }

    console.log('Phone number format validation passed');

    // Validate field lengths
    if (req.body.street && req.body.street.length > 100) {
      return res.status(400).json({
        message: 'Street address must be less than 100 characters'
      });
    }

    if (req.body.city && req.body.city.length > 50) {
      return res.status(400).json({
        message: 'City must be less than 50 characters'
      });
    }

    if (req.body.state && req.body.state.length > 50) {
      return res.status(400).json({
        message: 'State must be less than 50 characters'
      });
    }

    if (req.body.postalCode && req.body.postalCode.length > 10) {
      return res.status(400).json({
        message: 'Postal code must be less than 10 characters'
      });
    }

    // Validate fields are not just whitespace
    if (req.body.street && req.body.street.trim().length === 0) {
      return res.status(400).json({
        message: 'Street address cannot be just whitespace'
      });
    }

    if (req.body.city && req.body.city.trim().length === 0) {
      return res.status(400).json({
        message: 'City cannot be just whitespace'
      });
    }

    if (req.body.state && req.body.state.trim().length === 0) {
      return res.status(400).json({
        message: 'State cannot be just whitespace'
      });
    }

    if (req.body.postalCode && req.body.postalCode.trim().length === 0) {
      return res.status(400).json({
        message: 'Postal code cannot be just whitespace'
      });
    }

    console.log('Field length validation passed');

    // Validate SSN length
    if (req.body.ssn && req.body.ssn.length > 11) {
      return res.status(400).json({
        message: 'SSN must be less than 11 characters'
      });
    }

    // Validate SSN last 4 digits length
    if (req.body.ssnLast4 && req.body.ssnLast4.length > 4) {
      return res.status(400).json({
        message: 'SSN last 4 digits must be less than 4 characters'
      });
    }

    // Validate support phone length
    if (req.body.supportPhone && req.body.supportPhone.length > 20) {
      return res.status(400).json({
        message: 'Support phone number must be less than 20 characters'
      });
    }

    // Validate bank account number length
    if (req.body.bankAccountNumber && req.body.bankAccountNumber.length > 17) {
      return res.status(400).json({
        message: 'Bank account number must be less than 17 characters'
      });
    }

    // Validate bank routing number length
    if (req.body.bankRoutingNumber && req.body.bankRoutingNumber.length > 9) {
      return res.status(400).json({
        message: 'Bank routing number must be less than 9 characters'
      });
    }

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

    // Validate hosting experience length
    if (req.body.hostingExperience && req.body.hostingExperience.length > 500) {
      return res.status(400).json({
        message: 'Hosting experience must be less than 500 characters'
      });
    }

    console.log('Field length validation passed');

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

    // Validate country is not just whitespace
    if (req.body.country && req.body.country.trim().length === 0) {
      return res.status(400).json({
        message: 'Country cannot be just whitespace'
      });
    }

    console.log('Country length validation passed');

    // Validate state length
    if (req.body.state && req.body.state.length > 50) {
      return res.status(400).json({
        message: 'State must be less than 50 characters'
      });
    }

    // Validate state is not just whitespace
    if (req.body.state && req.body.state.trim().length === 0) {
      return res.status(400).json({
        message: 'State cannot be just whitespace'
      });
    }

    console.log('State length validation passed');

    // Validate city length
    if (req.body.city && req.body.city.length > 50) {
      return res.status(400).json({
        message: 'City must be less than 50 characters'
      });
    }

    // Validate city is not just whitespace
    if (req.body.city && req.body.city.trim().length === 0) {
      return res.status(400).json({
        message: 'City cannot be just whitespace'
      });
    }

    console.log('City length validation passed');

    // Validate street address length
    if (req.body.street && req.body.street.length > 100) {
      return res.status(400).json({
        message: 'Street address must be less than 100 characters'
      });
    }

    // Validate street address is not just whitespace
    if (req.body.street && req.body.street.trim().length === 0) {
      return res.status(400).json({
        message: 'Street address cannot be just whitespace'
      });
    }

    console.log('Street address length validation passed');

    // Validate hosting experience is not just whitespace if provided
    if (req.body.hostingExperience && req.body.hostingExperience.trim().length === 0) {
      return res.status(400).json({
        message: 'Hosting experience cannot be just whitespace'
      });
    }

    console.log('Hosting experience validation passed');

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

    if (req.body.supportPhone && req.body.supportPhone.length > 20) {
      return res.status(400).json({
        message: 'Support phone number must be less than 20 characters'
      });
    }

    console.log('Phone number length validation passed');

    // Create the host application
      const application = new HostApplication({
        user: req.user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        dateOfBirth: req.body.dateOfBirth,
        postalAddress: {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          postalCode: req.body.postalCode,
          country: req.body.country
        },
        identityDocuments: {
          idType: req.body.idType,
          idNumber: req.body.idNumber,
          idFrontImage: null,
          idBackImage: null,
          selfieImage: null
        },
        businessStructure: 'individual', // Hardcoded - all users have individual accounts
        ssn: req.body.ssn,
        ssnLast4: req.body.ssnLast4,
        supportPhone: req.body.supportPhone,
        bankAccount: {
          accountNumber: req.body.bankAccountNumber,
          routingNumber: req.body.bankRoutingNumber,
          accountType: req.body.bankAccountType
        },
        propertyType: req.body.propertyType,
        propertyDescription: req.body.propertyDescription,
        hostingExperience: req.body.hostingExperience,
        status: 'pending',
        submittedAt: new Date()
      });

      // Update the application with uploaded file URLs
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
            application.identityDocuments.idFrontImage = result.secure_url;
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
            application.identityDocuments.idBackImage = result.secure_url;
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
            application.identityDocuments.selfieImage = result.secure_url;
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
      if (!application.identityDocuments.idFrontImage || 
          !application.identityDocuments.idBackImage || 
          !application.identityDocuments.selfieImage) {
        return res.status(500).json({
          message: 'Failed to upload one or more required identity documents. Please try again.'
        });
      }

      console.log('All files uploaded successfully');

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
      console.log('Country:', req.body.country);

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

      const countryCode = getCountryCode(req.body.country);
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
        business_type: 'individual', // All users will have individual accounts
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

      // All users will have individual accounts - business information is optional
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
      
      console.log('Stripe account creation parameters:', JSON.stringify(stripeAccountParams, null, 2));

      // Validate Stripe account parameters
      if (!stripeAccountParams.country || !stripeAccountParams.email) {
        throw new Error('Missing required Stripe account parameters: country and email are required');
      }

      if (stripeAccountParams.business_type === 'individual' && !stripeAccountParams.individual) {
        throw new Error('Individual information is required for individual account type');
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
        onboardingCompleted: account.charges_enabled,
        dashboardUrl: actualDashboardUrl
      };

      // Store any pending requirements for better guidance
      if (account.requirements && Object.keys(account.requirements).length > 0) {
        application.stripeConnect.pendingRequirements = account.requirements;
        console.log('Pending requirements:', account.requirements);
      }

      // Create account link for onboarding
      console.log('Creating account link for onboarding...');
      
      const frontendUrl = process.env.FRONTEND_URL || 'https://driv-inn.vercel.app';
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

      // Get the actual dashboard URL from Stripe by creating a login link
      console.log('Getting actual dashboard URL from Stripe...');
      let actualDashboardUrl;
      try {
        const loginLink = await stripe.accounts.createLoginLink(account.id);
        if (loginLink && loginLink.url) {
          // Extract the dashboard URL from the login link
          // The login link format is: https://connect.stripe.com/express/acct_{ACCOUNT_ID}/{UNIQUE_CODE}
          actualDashboardUrl = loginLink.url;
          console.log('Actual dashboard URL captured:', actualDashboardUrl);
        } else {
          console.log('Could not get actual dashboard URL, using fallback');
          actualDashboardUrl = generateStripeDashboardUrl(account.id);
        }
      } catch (loginLinkError) {
        console.log('Error getting login link, using fallback dashboard URL:', loginLinkError.message);
        actualDashboardUrl = generateStripeDashboardUrl(account.id);
      }

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
          dashboardUrl: actualDashboardUrl,
          loginUrl: accountLink.url
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
// NOTE: This function only approves applications and stores the remediation link.
// Stripe Connect accounts are created during the initial application submission,
// not during approval. This prevents duplicate account creation.
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
    
    // Verify that Stripe Connect account already exists (created during submission)
    if (!application.stripeConnect || !application.stripeConnect.accountId) {
      console.error('No Stripe Connect account found for application:', application._id);
      return res.status(400).json({ 
        message: 'Stripe Connect account not found. The application may not have been properly submitted.',
        error: 'STRIPE_ACCOUNT_MISSING'
      });
    }
    
    console.log('Stripe Connect account already exists:', application.stripeConnect.accountId);
    console.log('Account status:', application.stripeConnect.accountStatus);
    
    // Update application status to approved
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
      phoneNumber: application.phoneNumber, // Set main user phone number
      hostProfile: {
        businessStructure: 'individual', // Hardcoded - all users have individual accounts
        phoneNumber: application.phoneNumber, // Add phone number from application
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
      message: 'Application approved successfully', 
      application,
      stripeAccount: {
        id: application.stripeConnect.accountId,
        status: application.stripeConnect.accountStatus,
        dashboardUrl: application.stripeConnect.dashboardUrl || generateStripeDashboardUrl(application.stripeConnect.accountId),
        onboardingUrl: await (async () => {
          try {
            const accountLink = await stripe.accountLinks.create({
              account: application.stripeConnect.accountId,
                      refresh_url: `${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/host-application-status`,
        return_url: `${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/host-application-status`,
              type: 'account_onboarding',
            });
            return accountLink.url;
          } catch (error) {
            console.error('Error creating onboarding link:', error);
            return null;
          }
        })()
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
    
    // Get current account status from Stripe using Connect API
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
    
    // Get current account status from Stripe using Connect API
    const account = await stripe.accounts.retrieve(application.stripeConnect.accountId);
    
    // For existing hosts, we need to create a fresh onboarding link
    let onboardingUrl = null;
    try {
      const accountLink = await stripe.accountLinks.create({
        account: application.stripeConnect.accountId,
        refresh_url: `${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/host-application-status`,
        return_url: `${process.env.FRONTEND_URL || 'https://driv-inn.vercel.app'}/host-application-status`,
        type: 'account_onboarding',
      });
      onboardingUrl = accountLink.url;
    } catch (onboardingError) {
      console.error('Error creating onboarding link:', onboardingError);
      
      // Check if it's a permission error and handle gracefully
      if (onboardingError.code === 'oauth_not_supported') {
        console.log('OAuth not supported for this account, using dashboard URL instead');
        onboardingUrl = generateStripeDashboardUrl(application.stripeConnect.accountId);
      } else {
        // For other errors, try to use the dashboard URL as fallback
        console.log('Using dashboard URL as fallback due to onboarding error');
        onboardingUrl = generateStripeDashboardUrl(application.stripeConnect.accountId);
      }
    }
    
    res.json({ 
      message: 'Stripe account setup status retrieved',
      accountId: application.stripeConnect.accountId,
      accountStatus: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      dashboardUrl: application.stripeConnect.dashboardUrl || generateStripeDashboardUrl(application.stripeConnect.accountId),
      onboardingUrl: onboardingUrl
    });
    
  } catch (err) {
    console.error('Error getting Stripe setup status:', err);
    
    // If we can't retrieve the account, try to provide basic info
    try {
      const application = await HostApplication.findOne({ 
        user: req.user._id, 
        status: 'approved' 
      });
      
      if (application?.stripeConnect?.accountId) {
        res.json({ 
          message: 'Stripe account setup status retrieved (limited)',
          accountId: application.stripeConnect.accountId,
          accountStatus: 'unknown',
          chargesEnabled: false,
          payoutsEnabled: false,
          requirements: null,
          dashboardUrl: application.stripeConnect.dashboardUrl || generateStripeDashboardUrl(application.stripeConnect.accountId),
          onboardingUrl: application.stripeConnect.dashboardUrl || generateStripeDashboardUrl(application.stripeConnect.accountId)
        });
        return;
      }
    } catch (fallbackError) {
      console.error('Fallback error handling failed:', fallbackError);
    }
    
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
    
    // Create a login link to the host's Stripe dashboard using Connect API
    const loginLink = await stripe.accounts.createLoginLink(application.stripeConnect.accountId);
    
    // Update the stored dashboard URL with the fresh login link
    if (loginLink && loginLink.url) {
      application.stripeConnect.dashboardUrl = loginLink.url;
      await application.save();
      console.log('Updated stored dashboard URL with fresh login link');
    }
    
    res.json({ 
      message: 'Stripe dashboard login link created',
      loginUrl: loginLink.url,
      expiresAt: loginLink.expires_at,
      accountId: application.stripeConnect.accountId,
      dashboardUrl: application.stripeConnect.dashboardUrl
    });
    
  } catch (err) {
    console.error('Error creating Stripe login link:', err);
    res.status(500).json({ message: 'Error creating login link', error: err.message });
  }
};

// Refresh dashboard URL for existing applications
exports.refreshDashboardUrl = async (req, res) => {
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
    
    // Create a fresh login link to get the current dashboard URL
    const loginLink = await stripe.accounts.createLoginLink(application.stripeConnect.accountId);
    
    if (loginLink && loginLink.url) {
      // Update the stored dashboard URL
      application.stripeConnect.dashboardUrl = loginLink.url;
      await application.save();
      
      console.log('Dashboard URL refreshed successfully');
      
      res.json({ 
        message: 'Dashboard URL refreshed successfully',
        dashboardUrl: loginLink.url,
        accountId: application.stripeConnect.accountId
      });
    } else {
      throw new Error('Failed to create login link');
    }
    
  } catch (err) {
    console.error('Error refreshing dashboard URL:', err);
    res.status(500).json({ message: 'Error refreshing dashboard URL', error: err.message });
  }
}; 