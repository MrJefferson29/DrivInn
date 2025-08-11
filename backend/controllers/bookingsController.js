const Booking = require('../models/booking');
const Payment = require('../models/payment');
const NotificationService = require('../services/notificationService');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


exports.createBooking = async (req, res) => {
  try {
    const { listing, startDate, endDate, guests, totalPrice } = req.body;
    const userId = req.user._id; // Get userId from authenticated user

    console.log('📋 Creating booking with data:', {
      listing,
      startDate,
      endDate,
      guests,
      totalPrice,
      userId
    });

    // 1️⃣ Create booking in DB with "pending" status
    const booking = await Booking.create({
      user: userId,
      home: listing, // Map listing to home
      checkIn: startDate, // Map startDate to checkIn
      checkOut: endDate, // Map endDate to checkOut
      guests,
      totalPrice,
      status: 'pending'
    });

    console.log('✅ Booking created:', booking._id);

    // 2️⃣ Create payment record
    const payment = await Payment.create({
      user: userId,
      booking: booking._id,
      amount: totalPrice,
      currency: 'usd',
      status: 'pending',
      paymentMethod: 'card',
      stripeSessionId: null // Will be updated after Stripe session creation
    });

    // 3️⃣ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking-cancel?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking for ${listing}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        paymentId: payment._id.toString(),
      },
    });

    // 4️⃣ Update booking and payment with Stripe session ID
    booking.paymentSessionId = session.id;
    await booking.save();

    payment.stripeSessionId = session.id;
    await payment.save();

    res.status(201).json({
      booking,
      payment: {
        id: payment._id,
        status: payment.status
      },
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
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

    res.json({ 
      booking,
      paymentStatus: booking.status === 'reserved' ? 'completed' : 'pending'
    });

  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 