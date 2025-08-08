const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// Payment routes
router.post('/create-intent', verifyToken, paymentController.createPaymentIntent);
router.post('/confirm', verifyToken, paymentController.confirmPayment);
router.get('/methods/:listingId', paymentController.getPaymentMethods);

// Admin/Host routes
router.put('/release/:bookingId', verifyToken, authorizeRole('host', 'admin'), paymentController.releasePaymentToHost);
router.post('/refund/:bookingId', verifyToken, paymentController.refundPayment);

// Webhook route (no auth required)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

module.exports = router;
