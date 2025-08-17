const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.post('/create-payment-intent', verifyToken, paymentsController.createPaymentIntent);
router.get('/status/:paymentId', verifyToken, paymentsController.getPaymentStatus);
router.get('/user-payments', verifyToken, paymentsController.getUserPayments);
router.get('/admin/all', verifyToken, authorizeRole('admin'), paymentsController.getAllPaymentsAdmin);

module.exports = router;
