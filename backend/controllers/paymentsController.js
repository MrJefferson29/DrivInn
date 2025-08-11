const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Set this in your .env

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency,
      capture_method: 'manual', // this is the hold/escrow
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.capturePayment = async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    res.json(paymentIntent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  try {
    const Payment = require('../models/payment');
    const payment = await Payment.findById(paymentId)
      .populate('booking', 'checkIn checkOut totalPrice status')
      .populate('user', 'firstName lastName email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is authorized to view this payment
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's payment history
exports.getUserPayments = async (req, res) => {
  try {
    const Payment = require('../models/payment');
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking', 'checkIn checkOut totalPrice status')
      .sort({ createdAt: -1 });
    
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
