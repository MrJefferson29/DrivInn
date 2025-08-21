const express = require('express');
const router = express.Router();
const hostAppController = require('../controllers/hostApplicationController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// User submits application
router.post('/', verifyToken, upload.fields([
  { name: 'idFrontImage', maxCount: 1 },
  { name: 'idBackImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 }
]), hostAppController.submitApplication);

// User gets their own application
router.get('/me', verifyToken, hostAppController.getMyApplication);

// Admin: list all applications
router.get('/', verifyToken, requireAdmin, hostAppController.listApplications);

// Admin: approve application
router.put('/:id/approve', verifyToken, requireAdmin, hostAppController.approveApplication);

// Admin: decline application
router.put('/:id/decline', verifyToken, requireAdmin, hostAppController.declineApplication);

// Stripe-related routes
router.post('/refresh-stripe-status', verifyToken, hostAppController.refreshStripeAccountStatus);
router.post('/create-stripe-login-link', verifyToken, hostAppController.createStripeLoginLink);
router.get('/stripe-setup-status', verifyToken, hostAppController.getStripeSetupStatus);
router.post('/refresh-dashboard-url', verifyToken, hostAppController.refreshDashboardUrl);

module.exports = router; 