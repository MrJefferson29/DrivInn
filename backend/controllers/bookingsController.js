const Booking = require('../models/booking');
const Payment = require('../models/payment');
const NotificationService = require('../services/notificationService');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Listing = require('../models/listing');
const HostApplication = require('../models/HostApplication');


// Helper function to check for date overlaps
const checkDateOverlap = async (listingId, startDate, endDate, excludeBookingId = null) => {
  // Ensure dates are valid
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.log('❌ Invalid dates provided:', { startDate, endDate });
    return false;
  }

  console.log('📋 Checking date overlap for listing:', listingId, 'from', start, 'to', end);

  const query = {
    home: listingId,
    status: { $in: ['pending', 'reserved'] }, // Only check pending and reserved bookings
    $or: [
      // Case 1: New booking starts during an existing booking
      {
        checkIn: { $lte: start },
        checkOut: { $gt: start }
      },
      // Case 2: New booking ends during an existing booking
      {
        checkIn: { $lt: end },
        checkOut: { $gte: end }
      },
      // Case 3: New booking completely contains an existing booking
      {
        checkIn: { $gte: start },
        checkOut: { $lte: end }
      },
      // Case 4: New booking is completely contained within an existing booking
      {
        checkIn: { $lte: start },
        checkOut: { $gte: end }
      }
    ]
  };

  // Exclude the current booking if we're updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await Booking.find(query);
  console.log('📋 Found overlapping bookings:', overlappingBookings.length);
  
  if (overlappingBookings.length > 0) {
    console.log('📋 Overlapping booking details:', overlappingBookings.map(b => ({
      id: b._id,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status
    })));
  }
  
  return overlappingBookings.length > 0;
};

exports.createBooking = async (req, res) => {
  try {
    const { listing, startDate, endDate, guests, totalPrice, paymentMethod = 'card' } = req.body;
    const userId = req.user._id; // Get userId from authenticated user

    console.log('📋 Creating booking with data:', {
      listing,
      startDate,
      endDate,
      guests,
      totalPrice,
      paymentMethod,
      userId
    });

    // Check if listing is active
    const listingDoc = await Listing.findById(listing).populate('owner'); // Populated owner
    
    if (!listingDoc) {
      return res.status(404).json({ 
        message: 'Listing not found',
        error: 'LISTING_NOT_FOUND'
      });
    }
    
    if (!listingDoc.isActive || listingDoc.deactivationInfo.isDeactivated) {
      return res.status(400).json({ 
        message: 'This listing is currently not available for bookings.',
        error: 'LISTING_INACTIVE'
      });
    }

    // Check for date overlaps BEFORE creating any booking
    const hasOverlap = await checkDateOverlap(listing, startDate, endDate);
    if (hasOverlap) {
      console.log('❌ Date overlap detected for listing:', listing);
      return res.status(400).json({ 
        message: 'The selected dates are not available. Please choose different dates.',
        error: 'DATE_OVERLAP'
      });
    }

    // Host must have approved Stripe Connect account
    const hostApplication = await HostApplication.findOne({ 
      user: listingDoc.owner._id, 
      status: 'approved' 
    });
    
    const hasStripeConnect = hostApplication?.stripeConnect?.accountId && 
                            (hostApplication.stripeConnect.accountStatus === 'active' || 
                             hostApplication.stripeConnect.accountStatus === 'pending');
    
    if (!hasStripeConnect) {
      return res.status(400).json({ 
        message: 'Host is not enabled for payouts. Please contact support.',
        error: 'HOST_STRIPE_NOT_ENABLED'
      });
    }
    
    // If account is pending, provide more specific guidance
    if (hostApplication.stripeConnect.accountStatus === 'pending') {
      console.log('⚠️ Host Stripe account is pending activation:', hostApplication.stripeConnect.accountId);
      // Still allow the payment to proceed, but log the warning
    }

    // Check if host account has transfers enabled
    let hostAccount;
    try {
      hostAccount = await stripe.accounts.retrieve(hostApplication.stripeConnect.accountId);
      const hasTransfersEnabled = hostAccount.capabilities?.transfers === 'active';
      
      if (!hasTransfersEnabled) {
        // Reject booking if host account doesn't support automatic payouts
        return res.status(400).json({ 
          message: 'Host account is not fully configured for automatic payouts. Please contact support.',
          error: 'HOST_ACCOUNT_INSUFFICIENT_CAPABILITIES',
          details: 'The host needs to complete their Stripe account setup to enable automatic payouts. Manual payouts are not supported.',
          nextSteps: [
            'Complete identity verification in your Stripe dashboard',
            'Add bank account information for payouts',
            'Enable transfers capability',
            'Contact support if issues persist'
          ],
          hostGuidance: {
            message: 'Your Stripe account needs additional verification to enable automatic payouts',
            action: 'Visit your Stripe dashboard to complete verification',
            dashboardUrl: `https://dashboard.stripe.com/express/${hostApplication.stripeConnect.accountId}`,
            commonIssues: [
              'Identity documents not yet verified',
              'Bank account information not provided',
              'Business verification incomplete (for business accounts)',
              'Address verification pending'
            ]
          }
        });
      }
      
      console.log('💳 Using automatic payout via transfer_data (host account supports transfers)');
      
    } catch (accountError) {
      console.error('❌ Error checking host Stripe account capabilities:', accountError);
      
      // Reject booking if we can't verify host account capabilities
      return res.status(400).json({
        message: 'Unable to verify host payment account capabilities. Please try again or contact support.',
        error: 'HOST_ACCOUNT_VERIFICATION_FAILED',
        details: 'We could not verify that the host account supports automatic payouts. This is required for all bookings.',
        nextSteps: [
          'Try again in a few minutes',
          'Contact support if the issue persists',
          'Ensure host has completed their Stripe account setup'
        ]
      });
    }

    // 1️⃣ Create Stripe Checkout session FIRST (before creating booking)
    let paymentMethodTypes;
    
    // MVP: Only support credit cards for now (most reliable)
    switch (paymentMethod) {
      case 'card':
        paymentMethodTypes = ['card'];
        break;
      case 'cashapp':
        paymentMethodTypes = ['cashapp'];
        break;
      case 'samsung_pay':
        paymentMethodTypes = ['card', 'samsung_pay'];
        break;
      case 'bank_transfer':
        // MVP: Disable ACH payments for now
        return res.status(400).json({ 
          message: 'Bank transfers are not currently supported. Please use a credit card.',
          error: 'BANK_TRANSFER_NOT_SUPPORTED',
          details: 'For MVP, we only support credit card payments to ensure reliable escrow and payouts.'
        });
      default:
        paymentMethodTypes = ['card'];
    }
    
    console.log(`💳 Payment method: ${paymentMethod}, Payment types: ${paymentMethodTypes.join(', ')}`);

    // Create Stripe Checkout session
    const sessionConfig = {
      payment_method_types: paymentMethodTypes,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking-cancel?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking for ${listingDoc.title}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentMethod: paymentMethod,
        listingId: listing,
        hostId: listingDoc.owner._id.toString(),
        checkInDate: startDate,
        payoutMethod: 'stripe_connect'
      },
      // FIXED: Remove application_fee_amount when using transfer_data
      // Use transfer_data for automatic payouts to hosts
      payment_intent_data: {
        capture_method: 'manual', // Capture manually after confirmation
        transfer_data: {
          destination: hostApplication.stripeConnect.accountId,
          amount: Math.round(totalPrice * 100),
        },
        // NOTE: Platform fee is handled via transfer_data, not application_fee_amount
        // The difference between totalPrice and transfer amount goes to the platform
      }
    };
    
    console.log('💳 Creating Stripe Checkout session with transfer_data...');
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('✅ Stripe Checkout session created:', session.id);

    // 2️⃣ Create booking in DB with "pending" status AFTER payment session is created
    const booking = await Booking.create({
      user: userId,
      home: listing, // Map listing to home
      checkIn: startDate, // Map startDate to checkIn
      checkOut: endDate, // Map endDate to checkOut
      guests,
      totalPrice,
      status: 'pending', // Will be updated to 'reserved' when payment completes
      paymentSessionId: session.id // Link to Stripe session
    });

    console.log('✅ Booking created with pending status:', booking._id);

    // 3️⃣ Create payment record
    const payment = await Payment.create({
      user: userId,
      booking: booking._id,
      amount: totalPrice,
      currency: 'usd',
      status: 'pending',
      paymentMethod: paymentMethod,
      stripeSessionId: session.id,
      metadata: {
        paymentMethod: paymentMethod,
        hasTransferData: true, // Using transfer_data for automatic payouts
        stripePaymentIntentId: session.payment_intent // Store payment intent ID for webhook handling
      }
    });

    console.log('✅ Payment record created:', payment._id);

    res.status(201).json({
      booking: {
        id: booking._id,
        status: booking.status,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalPrice
      },
      payment: {
        id: payment._id,
        status: payment.status,
        method: paymentMethod
      },
      checkoutUrl: session.url,
      message: 'Payment session created successfully. Please complete payment to confirm your booking.'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'insufficient_capabilities_for_transfer') {
        return res.status(400).json({ 
          message: 'Host account is not fully configured for automatic payouts. Please contact support.',
          error: 'HOST_ACCOUNT_INSUFFICIENT_CAPABILITIES',
          details: 'The host needs to complete their Stripe account setup to enable automatic payouts.'
        });
      }
      
      return res.status(400).json({ 
        message: 'Payment configuration error. Please try a different payment method.',
        error: 'STRIPE_CONFIGURATION_ERROR',
        details: error.message
      });
    }
    
    // Handle other specific errors
    if (error.message.includes('Stripe')) {
      return res.status(400).json({ 
        message: 'Payment service error. Please try again or contact support.',
        error: 'PAYMENT_SERVICE_ERROR',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create booking. Please try again.',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Check date availability for a listing
exports.checkDateAvailability = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.params;
    
    console.log('📋 Checking date availability for listing:', listingId, 'from', startDate, 'to', endDate);
    
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Listing ID, start date, and end date are required',
        error: 'MISSING_PARAMETERS'
      });
    }

    const hasOverlap = await checkDateOverlap(listingId, startDate, endDate);
    
    console.log('✅ Date availability check result:', { available: !hasOverlap });
    
    res.json({ 
      available: !hasOverlap,
      message: hasOverlap ? 'Dates are not available' : 'Dates are available'
    });
  } catch (err) {
    console.error('Check date availability error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    // Only get bookings for the current authenticated user
    const query = { user: req.user._id };
    
    console.log('📋 Fetching bookings for user:', req.user._id);
    
    const bookings = await Booking.find(query)
      .populate('home', 'title images price city country rating checkIn checkOut')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
      
    console.log('✅ Found bookings:', bookings.length);
    console.log('📋 First booking sample:', bookings[0] ? {
      id: bookings[0]._id,
      status: bookings[0].status,
      checkIn: bookings[0].checkIn,
      checkOut: bookings[0].checkOut,
      home: bookings[0].home ? {
        title: bookings[0].home.title,
        city: bookings[0].home.city
      } : null
    } : 'No bookings');
      
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get bookings for listings owned by the authenticated user (host view)
exports.getHostBookings = async (req, res) => {
  try {
    console.log('📋 Fetching host bookings for user:', req.user._id);
    
    // First, get all listings owned by this user
    const Listing = require('../models/listing');
    const userListings = await Listing.find({ owner: req.user._id }).select('_id');
    const listingIds = userListings.map(listing => listing._id);
    
    console.log('📋 Found listings owned by user:', listingIds.length);
    
    if (listingIds.length === 0) {
      return res.json([]);
    }
    
    // Get all bookings for these listings
    const bookings = await Booking.find({ home: { $in: listingIds } })
      .populate('home', 'title images price city country rating checkIn checkOut')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
      
    console.log('✅ Found host bookings:', bookings.length);
    console.log('📋 First host booking sample:', bookings[0] ? {
      id: bookings[0]._id,
      status: bookings[0].status,
      checkIn: bookings[0].checkIn,
      checkOut: bookings[0].checkOut,
      home: bookings[0].home ? {
        title: bookings[0].home.title,
        city: bookings[0].home.city
      } : null,
      guest: bookings[0].user ? {
        firstName: bookings[0].user.firstName,
        lastName: bookings[0].user.lastName
      } : null
    } : 'No host bookings');
      
    res.json(bookings);
  } catch (err) {
    console.error('Get host bookings error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled (not checked-in or checked-out)
    if (booking.status === 'checked-in' || booking.status === 'checked-out') {
      return res.status(400).json({ message: 'Cannot cancel a booking that has already been checked in or checked out' });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Create notifications for guest and host
    try {
      await NotificationService.createBookingNotification(booking._id, 'booking');
    } catch (notificationError) {
      console.error('Error creating cancellation notifications:', notificationError);
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Function to update all booking statuses (can be called by a cron job)
exports.updateAllBookingStatuses = async (req, res) => {
  try {
    // TODO: Implement booking status updates based on dates
    res.json({ message: 'Booking status update functionality not yet implemented' });
  } catch (err) {
    console.error('Update booking statuses error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Temporary endpoint to manually update booking status (for testing)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    
    if (!bookingId || !status) {
      return res.status(400).json({ message: 'Booking ID and status are required' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate('home', 'title images price city country');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log(`✅ Booking ${bookingId} status updated to ${status}`);
    res.json({ message: 'Booking status updated successfully', booking });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify payment and get booking details
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Retrieve Stripe session to confirm payment state
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeErr) {
      console.error('Stripe session retrieve error:', stripeErr.message);
    }

    // Find booking by session ID
    const booking = await Booking.findOne({ paymentSessionId: sessionId })
      .populate('home', 'title images price city country')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    // If Stripe confirms the payment is complete/paid, update booking and payment
    const isPaid = session && (session.payment_status === 'paid' || session.status === 'complete');
    if (isPaid && booking.status !== 'reserved') {
      booking.status = 'reserved';
      await booking.save();

      // Update payment record if available
      try {
        let payment;
        if (session && session.metadata && session.metadata.paymentId) {
          payment = await Payment.findById(session.metadata.paymentId);
        }
        if (!payment) {
          payment = await Payment.findOne({ stripeSessionId: sessionId });
        }
        if (payment) {
          payment.status = 'completed';
          payment.transactionId = session.payment_intent || session.id;
          payment.stripePaymentIntentId = session.payment_intent;
          payment.payoutMethod = 'stripe_connect';
          payment.metadata = {
            ...(payment.metadata || {}),
            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent,
          };
          await payment.save();
        }
      } catch (updatePaymentErr) {
        console.error('Payment update error (verifyPayment):', updatePaymentErr.message);
      }
    }

    res.json({ 
      booking,
      paymentStatus: booking.status === 'reserved' ? 'completed' : 'pending'
    });

  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Function to process automatic payouts when check-in date is reached
exports.processAutomaticPayout = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log('🔄 Processing automatic payout for booking:', bookingId);
    
    const booking = await Booking.findById(bookingId)
      .populate('home')
      .populate('user');
    
    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found',
        error: 'BOOKING_NOT_FOUND'
      });
    }
    
    // Check if it's time for payout (check-in date has arrived)
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const timeUntilCheckIn = checkInDate.getTime() - now.getTime();
    
    if (timeUntilCheckIn > 0) {
      return res.status(400).json({
        message: 'Check-in date has not been reached yet',
        error: 'CHECKIN_NOT_REACHED',
        timeUntilCheckIn: Math.ceil(timeUntilCheckIn / (1000 * 60 * 60 * 24))
      });
    }
    
    // Get the payment record
    const payment = await Payment.findOne({ booking: bookingId });
    if (!payment) {
      return res.status(404).json({
        message: 'Payment record not found',
        error: 'PAYMENT_NOT_FOUND'
      });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({
        message: 'Payment is not completed yet',
        error: 'PAYMENT_NOT_COMPLETED'
      });
    }
    
    // Check if payout has already been processed
    if (payment.payoutStatus === 'completed') {
      return res.status(400).json({
        message: 'Payout has already been processed',
        error: 'PAYOUT_ALREADY_PROCESSED'
      });
    }
    
    // Get the listing and host application to check Stripe Connect status
    const listing = await Listing.findById(booking.home);
    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found',
        error: 'LISTING_NOT_FOUND'
      });
    }
    
    const hostApplication = await HostApplication.findOne({ 
      user: listing.owner, 
      status: 'approved' 
    });
    
    // Process payout based on host's Stripe Connect status
    let payoutResult;
    
    if (hostApplication?.stripeConnect?.accountId && 
        hostApplication.stripeConnect.accountStatus === 'active') {
      
      // Automatic payout via Stripe Connect
      console.log('💳 Processing Stripe Connect payout for host:', listing.owner);
      
      try {
        // Capture the payment intent (this releases the funds to the host)
        const paymentIntent = await stripe.paymentIntents.capture(
          payment.stripePaymentIntentId,
          {
            transfer_data: {
              destination: hostApplication.stripeConnect.accountId,
            },
            application_fee_amount: Math.round(booking.totalPrice * 0.10 * 100), // 10% platform fee
          }
        );
        
        console.log('✅ Stripe Connect payout successful:', paymentIntent.id);
        
        // Update payment record
        payment.payoutStatus = 'completed';
        payment.payoutDate = new Date();
        payment.payoutMethod = 'stripe_connect';
        payment.payoutTransactionId = paymentIntent.id;
        payment.platformFee = Math.round(booking.totalPrice * 0.10 * 100) / 100;
        await payment.save();
        
        // Update booking status
        booking.payoutStatus = 'completed';
        await booking.save();
        
        payoutResult = {
          method: 'stripe_connect',
          status: 'completed',
          transactionId: paymentIntent.id,
          amount: booking.totalPrice,
          platformFee: Math.round(booking.totalPrice * 0.10 * 100) / 100
        };
        
      } catch (stripeError) {
        console.error('❌ Stripe Connect payout failed:', stripeError);
        
        // Fallback to manual payout
        payment.payoutStatus = 'failed';
        payment.payoutFailureReason = stripeError.message;
        await payment.save();
        booking.payoutStatus = 'failed';
        await booking.save();
        
        return res.status(500).json({
          message: 'Automatic payout failed, will process manually',
          error: 'STRIPE_PAYOUT_FAILED',
          fallback: 'manual'
        });
      }
      
    } else {
      // With new policy, hosts must have Stripe Connect; treat as error
      return res.status(400).json({
        message: 'Host is not enabled for Stripe Connect payouts',
        error: 'HOST_STRIPE_NOT_ENABLED'
      });
    }
    
    console.log('✅ Payout processing completed for booking:', bookingId);
    
    res.json({
      message: 'Payout processed successfully',
      payout: payoutResult,
      booking: {
        id: booking._id,
        status: booking.status,
        payoutStatus: booking.payoutStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing automatic payout:', error);
    res.status(500).json({
      message: 'Error processing payout',
      error: error.message
    });
  }
};

// Function to get all pending payouts for admin review
exports.getPendingPayouts = async (req, res) => {
  try {
    const pendingPayouts = await Payment.find({
      status: 'completed',
      payoutStatus: { $in: ['failed'] }
    })
    .populate('booking')
    .populate('user')
    .populate({
      path: 'booking',
      populate: {
        path: 'home',
        populate: 'owner'
      }
    })
    .sort({ createdAt: -1 });
    
    res.json(pendingPayouts);
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({
      message: 'Error fetching pending payouts',
      error: error.message
    });
  }
}; 

// Capture payment after successful checkout
exports.capturePayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        message: 'Session ID is required',
        error: 'MISSING_SESSION_ID'
      });
    }

    console.log('💳 Capturing payment for session:', sessionId);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({
        message: 'Checkout session not found',
        error: 'SESSION_NOT_FOUND'
      });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        message: 'Payment has not been completed',
        error: 'PAYMENT_NOT_COMPLETED',
        paymentStatus: session.payment_status
      });
    }

    // Get the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    
    if (paymentIntent.status === 'requires_capture') {
      // Capture the payment
      const capturedPayment = await stripe.paymentIntents.capture(session.payment_intent);
      console.log('✅ Payment captured successfully:', capturedPayment.id);
      
      // Find and update the booking
      const booking = await Booking.findOne({ paymentSessionId: sessionId });
      if (booking) {
        await Booking.findByIdAndUpdate(booking._id, {
          status: 'reserved',
          updatedAt: new Date()
        });
        console.log('✅ Booking status updated to reserved:', booking._id);
      }

      // Update payment record
      const payment = await Payment.findOne({ stripeSessionId: sessionId });
      if (payment) {
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'completed',
          transactionId: capturedPayment.id,
          stripePaymentIntentId: capturedPayment.id,
          completedAt: new Date(),
          metadata: {
            ...payment.metadata,
            paymentCaptured: true,
            captureTimestamp: new Date()
          }
        });
        console.log('✅ Payment record updated:', payment._id);
      }

      res.json({
        message: 'Payment captured successfully',
        paymentIntent: capturedPayment.id,
        status: 'reserved'
      });
    } else {
      console.log('⚠️ Payment intent status:', paymentIntent.status);
      res.json({
        message: 'Payment already processed',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Error capturing payment:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        message: 'Payment capture failed',
        error: 'PAYMENT_CAPTURE_FAILED',
        details: error.message
      });
    }
    
    res.status(500).json({
      message: 'Failed to capture payment',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}; 

// Handle payment cancellation
exports.cancelPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        message: 'Session ID is required',
        error: 'MISSING_SESSION_ID'
      });
    }

    console.log('❌ Cancelling payment for session:', sessionId);

    // Find the booking by session ID
    const booking = await Booking.findOne({ paymentSessionId: sessionId });
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found for this session',
        error: 'BOOKING_NOT_FOUND'
      });
    }

    // Update booking status to cancelled
    await Booking.findByIdAndUpdate(booking._id, {
      status: 'cancelled',
      updatedAt: new Date()
    });

    // Update payment status to cancelled
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    if (payment) {
      await Payment.findByIdAndUpdate(payment._id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        metadata: {
          ...payment.metadata,
          cancelledBy: 'user',
          cancellationTimestamp: new Date()
        }
      });
    }

    console.log('✅ Payment and booking cancelled successfully');

    res.json({
      message: 'Payment cancelled successfully',
      bookingId: booking._id,
      status: 'cancelled'
    });

  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({
      message: 'Failed to cancel payment',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}; 