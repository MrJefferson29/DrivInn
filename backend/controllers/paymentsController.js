const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Set this in your .env

// Admin: get all payments with related parties (guest, host, booking, listing)
exports.getAllPaymentsAdmin = async (req, res) => {
  try {
    const Payment = require('../models/payment');

    const payments = await Payment.find({})
      .populate('user', 'firstName lastName email role')
      .populate({
        path: 'booking',
        select: 'checkIn checkOut totalPrice status user home',
        populate: [
          { path: 'user', select: 'firstName lastName email' },
          {
            path: 'home',
            select: 'title owner type',
            populate: { path: 'owner', select: 'firstName lastName email role' }
          }
        ]
      })
      .sort({ createdAt: -1 });

    // Normalize shape to include explicit host and listing fields
    const result = payments.map((p) => {
      const listing = p.booking && p.booking.home ? p.booking.home : null;
      const host = listing && listing.owner ? listing.owner : null;
      const guest = p.user || (p.booking && p.booking.user) || null;

      return {
        _id: p._id,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        transactionId: p.transactionId,
        stripePaymentIntentId: p.stripePaymentIntentId,
        stripeSessionId: p.stripeSessionId,
        payoutStatus: p.payoutStatus,
        payoutMethod: p.payoutMethod,
        payoutDate: p.payoutDate,
        platformFee: p.platformFee,
        guest: guest
          ? { _id: guest._id, firstName: guest.firstName, lastName: guest.lastName, email: guest.email }
          : null,
        host: host
          ? { _id: host._id, firstName: host.firstName, lastName: host.lastName, email: host.email }
          : null,
        listing: listing
          ? { _id: listing._id, title: listing.title, type: listing.type }
          : null,
        booking: p.booking
          ? { _id: p.booking._id, checkIn: p.booking.checkIn, checkOut: p.booking.checkOut, status: p.booking.status }
          : null,
      };
    });

    res.json({ payments: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency,
      capture_method: 'automatic', // automatic capture
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
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

// Admin: Sync booking payout statuses with payment payout statuses
exports.syncBookingPayoutStatuses = async (req, res) => {
  try {
    const { syncBookingPayoutStatuses } = require('../services/delayedPayoutProcessor');
    
    console.log('🔄 Admin requested manual payout status synchronization...');
    
    const result = await syncBookingPayoutStatuses();
    
    res.json({
      message: 'Payout status synchronization completed',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error in admin payout status sync:', err);
    res.status(500).json({ error: err.message });
  }
};
