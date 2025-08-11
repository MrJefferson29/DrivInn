const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { verifyToken } = require('../middleware/auth');

router.post('/create-payment-intent', verifyToken, paymentsController.createPaymentIntent);
router.post('/capture-payment', verifyToken, paymentsController.capturePayment);
router.get('/status/:paymentId', verifyToken, paymentsController.getPaymentStatus);
router.get('/user-payments', verifyToken, paymentsController.getUserPayments);

module.exports = router;
