const PaymentService = require('../services/paymentService');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const NotificationService = require('../services/notificationService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent for booking
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('listing')
      .populate('hosts');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if listing accepts this payment method
    const listing = booking.listing;
    const acceptedMethods = listing.paymentPreferences?.acceptedMethods || ['credit_card', 'paypal'];
    
    if (!acceptedMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        message: `Payment method ${paymentMethod} not accepted for this listing` 
      });
    }

    let paymentResult;

    switch (paymentMethod) {
      case 'credit_card':
        paymentResult = await PaymentService.createStripePaymentIntent(booking, paymentMethod);
        break;
      case 'paypal':
        paymentResult = await PaymentService.createPayPalOrder(booking);
        break;
      case 'cash_app':
        paymentResult = await PaymentService.processCashAppPayment(booking, req.body.cashAppId);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported payment method' });
    }

    // Update booking with payment information
    booking.payment = {
      method: paymentMethod,
      status: 'pending',
      amount: paymentResult.amount,
      processingFee: paymentResult.processingFee,
      platformFee: paymentResult.platformFee,
      hostAmount: paymentResult.hostAmount,
      ...(paymentResult.paymentIntentId && { stripePaymentIntentId: paymentResult.paymentIntentId }),
      ...(paymentResult.paypalOrderId && { paypalOrderId: paymentResult.paypalOrderId }),
      ...(paymentResult.cashAppPaymentId && { cashAppPaymentId: paymentResult.cashAppPaymentId })
    };

    await booking.save();

    res.json({
      success: true,
      paymentIntent: paymentResult,
      booking: booking
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      message: 'Error creating payment intent', 
      error: error.message 
    });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    let paymentResult;

    if (booking.payment.method === 'credit_card') {
      paymentResult = await PaymentService.confirmStripePayment(paymentIntentId);
    } else {
      // For other payment methods, we'll simulate success
      paymentResult = { success: true, amount: booking.payment.amount };
    }

    if (paymentResult.success) {
      // Update booking status
      booking.payment.status = 'in_escrow';
      booking.payment.paidAt = new Date();
      booking.status = 'reserved';
      await booking.save();

      // Create notifications
      try {
        await NotificationService.createBookingNotification(booking._id, 'booking_confirmed');
        await NotificationService.createSystemNotification(
          booking.hosts,
          'Payment Received',
          `Payment of $${booking.payment.amount} has been received and is held in escrow.`,
          'payment_received'
        );
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      res.json({
        success: true,
        message: 'Payment confirmed and booking reserved',
        booking: booking
      });
    } else {
      res.status(400).json({ 
        message: 'Payment confirmation failed', 
        error: paymentResult.error 
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      message: 'Error confirming payment', 
      error: error.message 
    });
  }
};

// Release payment to host (called when guest checks in)
exports.releasePaymentToHost = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const result = await PaymentService.releasePaymentToHost(bookingId);
    
    // Create notification for host
    try {
      const payoutMethodNames = {
        'stripe': 'Stripe Account',
        'paypal': 'PayPal',
        'cash_app': 'Cash App',
        'bank_transfer': 'Bank Transfer'
      };
      
      const payoutMethodName = payoutMethodNames[result.payoutMethod] || result.payoutMethod;
      
      await NotificationService.createSystemNotification(
        result.hostId,
        'Payment Released',
        `Payment of $${result.amount} has been released to your ${payoutMethodName} account.`,
        'payment_released'
      );
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.json({
      success: true,
      message: `Payment released to host via ${result.payoutMethod}`,
      result: result
    });
  } catch (error) {
    console.error('Payment release error:', error);
    res.status(500).json({ 
      message: 'Error releasing payment', 
      error: error.message 
    });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const result = await PaymentService.refundPayment(bookingId, reason);
    
    res.json({
      success: true,
      message: 'Payment refunded successfully',
      result: result
    });
  } catch (error) {
    console.error('Payment refund error:', error);
    res.status(500).json({ 
      message: 'Error refunding payment', 
      error: error.message 
    });
  }
};

// Get payment methods for a listing
exports.getPaymentMethods = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const paymentMethods = PaymentService.getPaymentMethodsForListing(listing);
    
    res.json(paymentMethods);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ 
      message: 'Error getting payment methods', 
      error: error.message 
    });
  }
};

// Stripe webhook handler
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Find booking by payment intent ID
        const booking = await Booking.findOne({
          'payment.stripePaymentIntentId': paymentIntent.id
        });
        
        if (booking) {
          booking.payment.status = 'in_escrow';
          booking.payment.paidAt = new Date();
          booking.status = 'reserved';
          await booking.save();
          
          // Create notifications
          await NotificationService.createBookingNotification(booking._id, 'booking_confirmed');
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Find booking and update status
        const failedBooking = await Booking.findOne({
          'payment.stripePaymentIntentId': failedPayment.id
        });
        
        if (failedBooking) {
          failedBooking.payment.status = 'pending';
          await failedBooking.save();
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}; 