const HostApplication = require('../models/HostApplication');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const NotificationService = require('../services/notificationService');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Submit host application
exports.submitApplication = async (req, res) => {
  try {
    console.log('Host application submission received');
    
    // Check if user already has an application
    const existingApplication = await HostApplication.findOne({ user: req.user._id });
    
    if (existingApplication) {
      // Payment methods: only stripeAccountId and creditCardLast4
      const stripeAccountId = req.body.stripeAccountId;
      const creditCardLast4 = req.body.creditCardLast4;
      if (!stripeAccountId && !creditCardLast4) {
        return res.status(400).json({ message: 'At least one payment method (Stripe Account or Credit/Debit Card) is required.' });
      }
      // Update existing application with new data
      const applicationData = {
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
          idFrontImage: existingApplication.identityDocuments?.idFrontImage || null,
          idBackImage: existingApplication.identityDocuments?.idBackImage || null,
          selfieImage: existingApplication.identityDocuments?.selfieImage || null
        },
        paymentMethods: {
          stripeAccountId: stripeAccountId || undefined,
          creditCard: creditCardLast4 ? { last4: creditCardLast4 } : undefined
        },
        propertyType: req.body.propertyType,
        propertyDescription: req.body.propertyDescription,
        hostingExperience: req.body.hostingExperience,
        status: 'pending', // Reset to pending for resubmission
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        adminNote: ''
      };

      // Handle file uploads if provided
      if (req.files && Object.keys(req.files).length > 0) {
        console.log('Files received:', Object.keys(req.files));
        console.log('Body keys:', Object.keys(req.body));
        console.log('Detailed files info:', JSON.stringify(req.files, null, 2));
        
        // Handle idFrontImage
        if (req.files.idFrontImage && req.files.idFrontImage[0]) {
          console.log('Processing idFrontImage');
          console.log('File details:', {
            fieldname: req.files.idFrontImage[0].fieldname,
            originalname: req.files.idFrontImage[0].originalname,
            mimetype: req.files.idFrontImage[0].mimetype,
            size: req.files.idFrontImage[0].size,
            buffer: req.files.idFrontImage[0].buffer ? 'Buffer exists' : 'No buffer'
          });
          try {
            const file = req.files.idFrontImage[0];
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${existingApplication._id}_idFront_${Date.now()}`
            });
            applicationData.identityDocuments.idFrontImage = result.secure_url;
            console.log('idFrontImage uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for idFrontImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload ID front image: ${uploadError.message}` 
            });
          }
        } else {
          console.log('No idFrontImage found or invalid structure');
        }
        
        // Handle idBackImage
        if (req.files.idBackImage && req.files.idBackImage[0]) {
          console.log('Processing idBackImage');
          try {
            const file = req.files.idBackImage[0];
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${existingApplication._id}_idBack_${Date.now()}`
            });
            applicationData.identityDocuments.idBackImage = result.secure_url;
            console.log('idBackImage uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for idBackImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload ID back image: ${uploadError.message}` 
            });
          }
        }
        
        // Handle selfieImage
        if (req.files.selfieImage && req.files.selfieImage[0]) {
          console.log('Processing selfieImage');
          try {
            const file = req.files.selfieImage[0];
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${existingApplication._id}_selfie_${Date.now()}`
            });
            applicationData.identityDocuments.selfieImage = result.secure_url;
            console.log('selfieImage uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for selfieImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload selfie image: ${uploadError.message}` 
            });
          }
        }
      } else {
        console.log('No files provided for update, preserving existing images');
      }

      // Update existing application
      const updatedApplication = await HostApplication.findByIdAndUpdate(
        existingApplication._id,
        applicationData,
        { new: true }
      );

      console.log('Application updated successfully');
      res.json(updatedApplication);
    } else {
      // Payment methods: only stripeAccountId and creditCardLast4
      const stripeAccountId = req.body.stripeAccountId;
      const creditCardLast4 = req.body.creditCardLast4;
      if (!stripeAccountId && !creditCardLast4) {
        return res.status(400).json({ message: 'At least one payment method (Stripe Account or Credit/Debit Card) is required.' });
      }
      // Create new application (existing logic)
      const applicationData = {
        user: req.user._id,
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
        paymentMethods: {
          stripeAccountId: stripeAccountId || undefined,
          creditCard: creditCardLast4 ? { last4: creditCardLast4 } : undefined
        },
        propertyType: req.body.propertyType,
        propertyDescription: req.body.propertyDescription,
        hostingExperience: req.body.hostingExperience,
        status: 'pending',
        submittedAt: new Date()
      };

      // Handle file uploads
      if (req.files && Object.keys(req.files).length > 0) {
        console.log('Files received:', Object.keys(req.files));
        console.log('Body keys:', Object.keys(req.body));
        console.log('Detailed files info:', JSON.stringify(req.files, null, 2));
        
        // Handle idFrontImage
        if (req.files.idFrontImage && req.files.idFrontImage[0]) {
          console.log('Processing idFrontImage');
          console.log('File details:', {
            fieldname: req.files.idFrontImage[0].fieldname,
            originalname: req.files.idFrontImage[0].originalname,
            mimetype: req.files.idFrontImage[0].mimetype,
            size: req.files.idFrontImage[0].size,
            buffer: req.files.idFrontImage[0].buffer ? 'Buffer exists' : 'No buffer'
          });
          try {
            const file = req.files.idFrontImage[0];
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${req.user._id}_idFront_${Date.now()}`
            });
            applicationData.identityDocuments.idFrontImage = result.secure_url;
            console.log('idFrontImage uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for idFrontImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload ID front image: ${uploadError.message}` 
            });
          }
        } else {
          console.log('No idFrontImage found or invalid structure');
        }
        
        // Handle idBackImage
        if (req.files.idBackImage && req.files.idBackImage[0]) {
          console.log('Processing idBackImage');
          try {
            const file = req.files.idBackImage[0];
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${req.user._id}_idBack_${Date.now()}`
            });
            applicationData.identityDocuments.idBackImage = result.secure_url;
            console.log('idBackImage uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for idBackImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload ID back image: ${uploadError.message}` 
            });
          }
        }
        
        // Handle selfieImage
        if (req.files.selfieImage && req.files.selfieImage[0]) {
          console.log('Processing selfieImage');
          try {
            const file = req.files.selfieImage[0];
            const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            
            const result = await cloudinary.uploader.upload(base64String, {
              folder: 'host-applications',
              resource_type: 'auto',
              public_id: `${req.user._id}_selfie_${Date.now()}`
            });
            applicationData.identityDocuments.selfieImage = result.secure_url;
            console.log('selfieImage uploaded successfully:', result.secure_url);
          } catch (uploadError) {
            console.error('Cloudinary upload error for selfieImage:', uploadError);
            return res.status(500).json({ 
              message: `Failed to upload selfie image: ${uploadError.message}` 
            });
          }
        }
      } else {
        console.log('No files provided for new application');
        // For new applications, files are required
        return res.status(400).json({ 
          message: 'Identity verification documents are required for new applications. Please upload your ID front, ID back, and selfie images.' 
        });
      }

      const application = new HostApplication(applicationData);
      await application.save();
      console.log('Application created successfully');
      res.status(201).json(application);
    }
  } catch (err) {
    console.error('Host application submission error:', err);
    res.status(400).json({ message: 'Error submitting application', error: err.message });
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
    const application = await HostApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status === 'approved') return res.status(400).json({ message: 'Already approved' });
    
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    await application.save();
    
    // Update user role to host
    await User.findByIdAndUpdate(application.user, { role: 'host' });
    
    // Create notification for the applicant
    try {
      await NotificationService.createHostApplicationNotification(application._id, 'host_application_approved');
    } catch (notificationError) {
      console.error('Error creating approval notification:', notificationError);
    }
    
    res.json({ message: 'Application approved', application });
  } catch (err) {
    res.status(400).json({ message: 'Error approving application', error: err.message });
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
    application.adminNote = req.body.adminNote || '';
    
    console.log('Saving application');
    await application.save();
    
    console.log('Application declined successfully');
    
    // Create notification for the applicant (don't let this break the main operation)
    try {
      console.log('Creating notification');
      await NotificationService.createHostApplicationNotification(application._id, 'host_application_declined');
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Error creating decline notification:', notificationError);
      // Don't fail the decline operation if notification fails
    }
    
    res.json({ message: 'Application declined', application });
  } catch (err) {
    console.error('Error in declineApplication:', err);
    res.status(400).json({ message: 'Error declining application', error: err.message });
  }
}; 