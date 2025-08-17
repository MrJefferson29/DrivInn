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

// Manual payment status check and update (backup to webhooks)
exports.manualPaymentStatusCheck = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    console.log('🔍 Manually checking payment status for:', paymentId);

    const Payment = require('../models/payment');
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (!payment.stripeSessionId) {
      return res.status(400).json({ message: 'Payment has no Stripe session ID' });
    }

    // Check Stripe session status
    try {
      const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
      console.log('✅ Stripe session retrieved:', session.id);
      console.log('📋 Session status:', session.status);
      console.log('📋 Payment status:', session.payment_status);

      const isPaid = session && (session.payment_status === 'paid' || session.status === 'complete');
      
      if (isPaid && payment.status !== 'completed') {
        console.log('✅ Payment confirmed as paid, updating status');
        
        // Update payment status
        payment.status = 'completed';
        payment.transactionId = session.payment_intent || session.id;
        payment.stripePaymentIntentId = session.payment_intent;
        payment.payoutMethod = 'stripe_connect';
        payment.payoutStatus = 'completed';
        payment.payoutCompletedAt = new Date();
        payment.completedAt = new Date();
        payment.metadata = {
          ...(payment.metadata || {}),
          manuallyVerified: true,
          verifiedAt: new Date(),
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent
        };
        
        await payment.save();
        console.log('✅ Payment status updated to completed');

        // Update booking status if available
        if (payment.booking) {
          const Booking = require('../models/booking');
          const booking = await Booking.findById(payment.booking);
          
          if (booking && booking.status !== 'reserved') {
            booking.status = 'reserved';
            booking.paymentStatus = 'completed';
            await booking.save();
            console.log('✅ Booking status updated to reserved');
          }
        }

        res.json({
          message: 'Payment status updated successfully',
          payment: {
            id: payment._id,
            status: payment.status,
            stripeSession: {
              id: session.id,
              status: session.status,
              paymentStatus: session.payment_status
            }
          }
        });
      } else if (payment.status === 'completed') {
        res.json({
          message: 'Payment already completed',
          payment: {
            id: payment._id,
            status: payment.status,
            stripeSession: {
              id: session.id,
              status: session.status,
              paymentStatus: session.payment_status
            }
          }
        });
      } else {
        res.json({
          message: 'Payment not yet completed',
          payment: {
            id: payment._id,
            status: payment.status,
            stripeSession: {
              id: session.id,
              status: session.status,
              paymentStatus: session.payment_status
            }
          }
        });
      }

    } catch (stripeErr) {
      console.error('❌ Stripe session retrieve error:', stripeErr.message);
      res.status(400).json({ 
        message: 'Error retrieving Stripe session',
        error: stripeErr.message
      });
    }

  } catch (err) {
    console.error('❌ Manual payment status check error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
