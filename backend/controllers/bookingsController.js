const Booking = require('../models/booking');
const Payment = require('../models/payment');
const NotificationService = require('../services/notificationService');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Listing = require('../models/listing');
const HostApplication = require('../models/HostApplication');

// Helper function to generate Stripe Connect dashboard URL
// Format: https://connect.stripe.com/express/acct_{ACCOUNT_ID}/bKsxnuQI7PAK
const generateStripeDashboardUrl = (accountId) => {
  return `https://connect.stripe.com/express/acct_${accountId}/bKsxnuQI7PAK`;
};

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
    let hasTransfersEnabled = false;
    
    try {
      // Set a shorter timeout for Stripe account retrieval
      const stripeOptions = {
        timeout: 30000, // 30 seconds instead of default 80 seconds
        retries: 1
      };
      
      hostAccount = await stripe.accounts.retrieve(
        hostApplication.stripeConnect.accountId,
        undefined,
        stripeOptions
      );
      hasTransfersEnabled = hostAccount.capabilities?.transfers === 'active';
      
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
            dashboardUrl: hostApplication.stripeConnect.dashboardUrl || generateStripeDashboardUrl(hostApplication.stripeConnect.accountId),
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
      
      // Handle specific Stripe error types
      if (accountError.type === 'StripeConnectionError' || accountError.code === 'ETIMEDOUT') {
        console.log('⚠️ Stripe connection timeout - proceeding with booking creation but logging warning');
        
        // For timeout errors, we'll proceed with the booking but log a warning
        // The host will need to complete their setup before payouts can be processed
        hasTransfersEnabled = false; // Assume transfers are not enabled until verified
        
        // Don't reject the booking, but warn that payouts may be delayed
        console.log('⚠️ Proceeding with booking creation despite Stripe validation timeout');
        console.log('⚠️ Host will need to complete Stripe setup before payouts can be processed');
      } else {
        // For other types of errors, reject the booking
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
      }
      // Note: No transfer_data - funds will be held in platform account and transferred later
    };
    
    console.log('💳 Creating Stripe Checkout session...');
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('✅ Stripe Checkout session created:', session.id);

    // 2️⃣ Create booking in DB with "pending" status AFTER payment session is created
    // Combine user's selected dates with host's set times
    const hostCheckInTime = listingDoc.checkIn || '14:00'; // Default to 2:00 PM if not set
    const hostCheckOutTime = listingDoc.checkOut || '11:00'; // Default to 11:00 AM if not set
    
    // Create full datetime objects by combining dates with times
    const checkInDateTime = new Date(`${startDate}T${hostCheckInTime}:00`);
    const checkOutDateTime = new Date(`${endDate}T${hostCheckOutTime}:00`);
    
    console.log('🕐 Creating booking with combined date and time:');
    console.log(`  - User selected check-in date: ${startDate}`);
    console.log(`  - User selected check-out date: ${endDate}`);
    console.log(`  - Host check-in time: ${hostCheckInTime}`);
    console.log(`  - Host check-out time: ${hostCheckOutTime}`);
    console.log(`  - Final check-in datetime: ${checkInDateTime.toISOString()}`);
    console.log(`  - Final check-out datetime: ${checkOutDateTime.toISOString()}`);
    
    console.log('📋 About to create booking with data:', {
      user: userId,
      home: listing,
      checkIn: checkInDateTime,
      checkOut: checkOutDateTime,
      guests,
      totalPrice,
      status: 'pending',
      paymentSessionId: session.id
    });
    
    const booking = await Booking.create({
      user: userId,
      home: listing, // Map listing to home
      checkIn: checkInDateTime, // Full datetime: user date + host time
      checkOut: checkOutDateTime, // Full datetime: user date + host time
      guests,
      totalPrice,
      status: 'pending', // Will be updated to 'reserved' when payment completes
      paymentSessionId: session.id // Link to Stripe session
    });

    console.log('✅ Booking created with pending status:', booking._id);

    // 3️⃣ Create payment record
    console.log('💳 About to create payment record with data:', {
      user: userId,
      booking: booking._id,
      amount: totalPrice,
      currency: 'usd',
      status: 'pending',
      paymentMethod: paymentMethod,
      stripeSessionId: session.id,
      metadata: {
        paymentMethod: paymentMethod,
        hasTransferData: false,
        stripePaymentIntentId: session.payment_intent,
        stripeValidationStatus: hasTransfersEnabled ? 'verified' : 'timeout_skipped',
        hostStripeAccountId: hostApplication.stripeConnect.accountId
      }
    });
    
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
        hasTransferData: false, // Not using transfer_data - funds will be held in platform account and transferred later
        stripePaymentIntentId: session.payment_intent, // Store payment intent ID for webhook handling
        stripeValidationStatus: hasTransfersEnabled ? 'verified' : 'timeout_skipped', // Track if Stripe validation was completed
        hostStripeAccountId: hostApplication.stripeConnect.accountId
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
      message: 'Payment session created successfully. Please complete payment to confirm your booking.',
      stripeValidation: {
        status: hasTransfersEnabled ? 'verified' : 'timeout_skipped',
        note: hasTransfersEnabled ? 'Host account verified for automatic payouts' : 'Host account validation skipped due to timeout - payouts may be delayed until setup is completed'
      }
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      type: error.type
    });
    
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
    
    // Handle database errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid booking data. Please check your information.',
        error: 'VALIDATION_ERROR',
        details: error.message
      });
    }
    
    if (error.name === 'MongoError' || error.code === 11000) {
      return res.status(400).json({ 
        message: 'Database error. Please try again.',
        error: 'DATABASE_ERROR',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create booking. Please try again.',
      error: 'INTERNAL_SERVER_ERROR',
      details: error.message
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
      .populate('home', 'title images price city country rating checkIn checkOut type location')
      .populate('user', 'firstName lastName email')
      .populate('reviewId', 'rating content title createdAt')
      .sort({ createdAt: -1 });
      
    // Get payment information for each booking
    const Payment = require('../models/payment');
    const bookingsWithPayments = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const payment = await Payment.findOne({ booking: booking._id })
            .select('status paymentMethod payoutStatus platformFee');
          
          if (payment) {
            // For guests, only show payment status, not payout status
            // Payout status is only relevant to hosts
            return {
              ...booking.toObject(),
              paymentStatus: payment.status,
              paymentMethod: payment.paymentMethod,
              // Don't include payoutStatus for guests - it's not relevant to them
              platformFee: payment.platformFee
            };
          }
          
          return booking.toObject();
        } catch (error) {
          console.error(`Error fetching payment for booking ${booking._id}:`, error);
          return booking.toObject();
        }
      })
    );
      
    console.log('✅ Found bookings:', bookingsWithPayments.length);
    console.log('📋 First booking sample:', bookingsWithPayments[0] ? {
      id: bookingsWithPayments[0]._id,
      status: bookingsWithPayments[0].status,
      paymentStatus: bookingsWithPayments[0].paymentStatus,
      checkIn: bookingsWithPayments[0].checkIn,
      checkOut: bookingsWithPayments[0].checkOut,
      home: bookingsWithPayments[0].home ? {
        title: bookingsWithPayments[0].home.title,
        city: bookingsWithPayments[0].home.city
      } : null
    } : 'No bookings');
      
    res.json(bookingsWithPayments);
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
      
    // Get payment information for each booking
    const Payment = require('../models/payment');
    const bookingsWithPayments = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const payment = await Payment.findOne({ booking: booking._id })
            .select('status paymentMethod payoutStatus platformFee amount');
          
          if (payment) {
            return {
              ...booking.toObject(),
              paymentStatus: payment.status,
              paymentMethod: payment.paymentMethod,
              payoutStatus: payment.payoutStatus,
              platformFee: payment.platformFee,
              paymentAmount: payment.amount
            };
          }
          
          return booking.toObject();
        } catch (error) {
          console.error(`Error fetching payment for host booking ${booking._id}:`, error);
          return booking.toObject();
        }
      })
    );
      
    console.log('✅ Found host bookings:', bookingsWithPayments.length);
    console.log('📋 First host booking sample:', bookingsWithPayments[0] ? {
      id: bookingsWithPayments[0]._id,
      status: bookingsWithPayments[0].status,
      paymentStatus: bookingsWithPayments[0].paymentStatus,
      payoutStatus: bookingsWithPayments[0].payoutStatus,
      checkIn: bookingsWithPayments[0].checkIn,
      checkOut: bookingsWithPayments[0].checkOut,
      home: bookingsWithPayments[0].home ? {
        title: bookingsWithPayments[0].home.title,
        city: bookingsWithPayments[0].home.city
      } : null,
      guest: bookingsWithPayments[0].user ? {
        firstName: bookingsWithPayments[0].user.firstName,
        lastName: bookingsWithPayments[0].user.lastName
      } : null
    } : 'No host bookings');
      
    res.json(bookingsWithPayments);
  } catch (err) {
    console.error('Get host bookings error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    // Handle case where req.body might be undefined (DELETE requests)
    const cancellationReason = req.body?.cancellationReason || 'Guest cancelled';
    
    console.log('🔄 Processing cancellation for booking:', id);
    console.log('📝 Request body:', req.body);
    console.log('📝 Cancellation reason:', cancellationReason);
    
    // Find booking with populated data
    const booking = await Booking.findById(id)
      .populate('home', 'title cancellationPolicy')
      .populate('user', 'firstName lastName email');
      
    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found',
        error: 'BOOKING_NOT_FOUND'
      });
    }

    // Check if user is authorized to cancel this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to cancel this booking',
        error: 'UNAUTHORIZED'
      });
    }

    // Check if booking can be cancelled
    if (['checked_in', 'checked_out', 'completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel a booking with status: ${booking.status}`,
        error: 'INVALID_STATUS'
      });
    }

    // Get associated payment record
    const Payment = require('../models/payment');
    const payment = await Payment.findOne({ booking: booking._id });
    
    if (!payment) {
      return res.status(400).json({ 
        message: 'No payment record found for this booking',
        error: 'PAYMENT_NOT_FOUND'
      });
    }

    // Check if payment was completed (only completed payments can be refunded)
    if (payment.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Cannot cancel booking with incomplete payment',
        error: 'PAYMENT_INCOMPLETE'
      });
    }

    // Calculate refund amount based on cancellation policy and timing
    const refundInfo = calculateRefundAmount(booking, payment);
    
    console.log('💰 Refund calculation:', {
      totalAmount: payment.amount,
      refundAmount: refundInfo.refundAmount,
      cancellationPolicy: booking.home.cancellationPolicy,
      daysUntilCheckIn: refundInfo.daysUntilCheckIn,
      refundPercentage: refundInfo.refundPercentage
    });

    // Process Stripe refund if refund amount > 0
    let stripeRefund = null;
    let refundStatus = 'pending';
    let refundError = null;
    
    if (refundInfo.refundAmount > 0 && payment.stripePaymentIntentId) {
      try {
        console.log('💳 Processing Stripe refund for payment intent:', payment.stripePaymentIntentId);
        
        // Set a shorter timeout for Stripe requests
        const stripeOptions = {
          timeout: 30000, // 30 seconds instead of 80
          retries: 2
        };
        
        stripeRefund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount: Math.round(refundInfo.refundAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            bookingId: booking._id.toString(),
            cancellationReason: cancellationReason || 'Guest cancelled',
            cancellationPolicy: booking.home.cancellationPolicy,
            refundPercentage: refundInfo.refundPercentage.toString(),
            daysUntilCheckIn: refundInfo.daysUntilCheckIn.toString()
          }
        }, stripeOptions);
        
        console.log('✅ Stripe refund created:', stripeRefund.id);
        refundStatus = 'completed';
        
      } catch (stripeError) {
        console.error('❌ Stripe refund error:', stripeError);
        refundError = stripeError.message;
        
        // Handle different types of Stripe errors
        if (stripeError.type === 'StripeConnectionError' || stripeError.code === 'ETIMEDOUT') {
          console.log('⚠️ Stripe connection timeout - marking refund as pending for manual processing');
          refundStatus = 'pending_manual';
        } else if (stripeError.type === 'StripeInvalidRequestError') {
          console.log('⚠️ Invalid Stripe request - marking refund as failed');
          refundStatus = 'failed';
        } else {
          console.log('⚠️ Other Stripe error - marking refund as pending for manual processing');
          refundStatus = 'pending_manual';
        }
        
        // Don't fail the entire cancellation - continue with booking cancellation
        // The refund can be processed manually later
      }
    }

    // Update payment record
    payment.status = refundStatus === 'completed' ? 'refunded' : 'refund_pending';
    payment.refundReason = cancellationReason || 'Guest cancelled';
    payment.refundedAt = new Date();
    payment.metadata = {
      ...payment.metadata,
      cancellationPolicy: booking.home.cancellationPolicy,
      refundAmount: refundInfo.refundAmount,
      refundPercentage: refundInfo.refundPercentage,
      daysUntilCheckIn: refundInfo.daysUntilCheckIn,
      stripeRefundId: stripeRefund?.id,
      refundStatus: refundStatus,
      refundError: refundError,
      refundProcessedAt: new Date().toISOString()
    };
    await payment.save();

    // Update booking record
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.updatedAt = new Date();
    await booking.save();

    // Create notifications for guest and host
    try {
      const NotificationService = require('../services/notificationService');
      await NotificationService.createBookingNotification(booking._id, 'cancellation');
      
      // If refund needs manual processing, create admin notification
      if (refundStatus === 'pending_manual') {
        try {
          await NotificationService.createAdminNotification({
            type: 'manual_refund_required',
            title: 'Manual Refund Required',
            message: `Booking ${booking._id} was cancelled but Stripe refund failed. Manual processing required.`,
            data: {
              bookingId: booking._id,
              paymentId: payment._id,
              refundAmount: refundInfo.refundAmount,
              error: refundError
            }
          });
        } catch (adminNotificationError) {
          console.error('⚠️ Error creating admin notification for manual refund:', adminNotificationError);
        }
      }
    } catch (notificationError) {
      console.error('⚠️ Error creating cancellation notifications:', notificationError);
    }

    // Prepare response
    const response = {
      message: refundStatus === 'completed' 
        ? 'Booking cancelled successfully with immediate refund' 
        : 'Booking cancelled successfully - refund will be processed manually',
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      },
      refund: {
        amount: refundInfo.refundAmount,
        percentage: refundInfo.refundPercentage,
        policy: booking.home.cancellationPolicy,
        daysUntilCheckIn: refundInfo.daysUntilCheckIn,
        stripeRefundId: stripeRefund?.id,
        status: refundStatus,
        error: refundError
      },
      cancellationReason: cancellationReason || 'Guest cancelled',
      refundStatus: refundStatus
    };

    console.log('✅ Booking cancellation completed:', response);
    res.json(response);

  } catch (err) {
    console.error('❌ Cancel booking error:', err);
    
    // Provide more specific error messages
    let errorMessage = 'Server error during cancellation';
    let statusCode = 500;
    
    if (err.name === 'ValidationError') {
      errorMessage = 'Invalid booking data';
      statusCode = 400;
    } else if (err.name === 'CastError') {
      errorMessage = 'Invalid booking ID';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to calculate refund amount based on cancellation policy
const calculateRefundAmount = (booking, payment) => {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));
  
  let refundPercentage = 0;
  const cancellationPolicy = booking.home.cancellationPolicy || 'Moderate';
  
  switch (cancellationPolicy) {
    case 'Flexible':
      // 87% refund if cancelled 1 day before check-in (capped at 87%)
      if (daysUntilCheckIn >= 1) {
        refundPercentage = 87;
      } else if (daysUntilCheckIn >= 0) {
        refundPercentage = 50;
      }
      break;
      
    case 'Moderate':
      // 87% refund if cancelled 5 days before check-in (capped at 87%)
      if (daysUntilCheckIn >= 5) {
        refundPercentage = 87;
      } else if (daysUntilCheckIn >= 1) {
        refundPercentage = 50;
      }
      break;
      
    case 'Strict':
      // 87% refund if cancelled 7 days before check-in (capped at 87%)
      if (daysUntilCheckIn >= 7) {
        refundPercentage = 87;
      } else if (daysUntilCheckIn >= 1) {
        refundPercentage = 50;
      }
      break;
      
    case 'Super Strict':
      // 87% refund if cancelled 14 days before check-in (capped at 87%)
      if (daysUntilCheckIn >= 14) {
        refundPercentage = 87;
      } else if (daysUntilCheckIn >= 7) {
        refundPercentage = 50;
      }
      break;
      
    default:
      // Default to Moderate policy (capped at 87%)
      if (daysUntilCheckIn >= 5) {
        refundPercentage = 87;
      } else if (daysUntilCheckIn >= 1) {
        refundPercentage = 50;
      }
  }
  
  const refundAmount = (payment.amount * refundPercentage) / 100;
  
  return {
    refundAmount: Math.round(refundAmount * 100) / 100, // Round to 2 decimal places
    refundPercentage,
    daysUntilCheckIn,
    cancellationPolicy
  };
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

// Verify payment and get booking details
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    console.log('🔍 Manually verifying payment for session:', sessionId);

    // Retrieve Stripe session to confirm payment state
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log('✅ Stripe session retrieved:', session.id);
      console.log('📋 Session status:', session.status);
      console.log('📋 Payment status:', session.payment_status);
    } catch (stripeErr) {
      console.error('❌ Stripe session retrieve error:', stripeErr.message);
      return res.status(400).json({ 
        message: 'Invalid session ID or Stripe error',
        error: stripeErr.message
      });
    }

    // Find booking by session ID
    const booking = await Booking.findOne({ paymentSessionId: sessionId })
      .populate('home', 'title images price city country rating checkIn checkOut')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    console.log('✅ Found booking:', booking._id);
    console.log('📋 Current booking status:', booking.status);
    console.log('📋 Current payment status:', booking.paymentStatus);

    // If Stripe confirms the payment is complete/paid, update booking status
    const isPaid = session && (session.payment_status === 'paid' || session.status === 'complete');
    
    if (isPaid) {
      console.log('✅ Payment confirmed as paid by Stripe');
      
      // Update booking status if not already updated
      if (booking.status !== 'reserved') {
        booking.status = 'reserved';
        booking.paymentStatus = 'completed';
        await booking.save();
        console.log('✅ Booking status updated to reserved');
      }
      
      // Update payment record if available
      try {
        let payment = await Payment.findOne({ stripeSessionId: sessionId });
        
        if (payment) {
          console.log('✅ Found payment record:', payment._id);
          console.log('📋 Current payment status:', payment.status);
          
          if (payment.status !== 'completed') {
            payment.status = 'completed';
            payment.transactionId = session.payment_intent || session.id;
            payment.stripePaymentIntentId = session.payment_intent;
            payment.payoutMethod = 'stripe_connect';
            payment.payoutStatus = 'pending'; // Keep as pending for delayed processing
            payment.completedAt = new Date();
            payment.metadata = {
              ...(payment.metadata || {}),
              stripeSessionId: session.id,
              paymentIntentId: session.payment_intent,
              manuallyVerified: true,
              verifiedAt: new Date()
            };
            await payment.save();
            console.log('✅ Payment status updated to completed');
          }
        } else {
          console.log('⚠️ No payment record found for session:', sessionId);
        }
      } catch (updatePaymentErr) {
        console.error('❌ Payment update error (verifyPayment):', updatePaymentErr.message);
      }
    } else {
      console.log('⚠️ Payment not yet completed according to Stripe');
      console.log('📋 Session status:', session.status);
      console.log('📋 Payment status:', session.payment_status);
    }

    res.json({
      booking,
      paymentStatus: booking.paymentStatus === 'completed' ? 'completed' : 'pending',
      stripeSession: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        paymentIntent: session.payment_intent
      }
    });

  } catch (err) {
    console.error('❌ Verify payment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Function to get all failed payments for admin review
exports.getPendingPayouts = async (req, res) => {
  try {
    const failedPayments = await Payment.find({
      status: 'failed'
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
    
    res.json(failedPayments);
  } catch (error) {
    console.error('Error fetching failed payments:', error);
    res.status(500).json({
      message: 'Error fetching failed payments',
      error: error.message
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
      paymentStatus: 'cancelled',
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