const Booking = require('../models/booking');
const NotificationService = require('../services/notificationService');

exports.createBooking = async (req, res) => {
  try {
    console.log('Creating booking with data:', req.body);
    console.log('User from token:', req.user);
    
    const { listing, startDate, endDate, guests, totalPrice } = req.body;
    
    // Validate required fields
    if (!listing || !startDate || !endDate || !guests || !totalPrice) {
      return res.status(400).json({ 
        message: 'Missing required fields: listing, startDate, endDate, guests, totalPrice' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    // Get user ID from authenticated request
    const guest = req.user._id;
    
    // Get host ID from listing
    const Listing = require('../models/listing');
    const listingDoc = await Listing.findById(listing);
    console.log('Found listing:', listingDoc);
    if (!listingDoc) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const hosts = listingDoc.owner;
    console.log('Host ID:', hosts);

    // Check for date conflicts for this listing
    const conflict = await Booking.findOne({
      listing,
      status: { $nin: ['cancelled'] }, // Exclude cancelled bookings
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });
    
    if (conflict) {
      return res.status(400).json({ message: 'Selected dates are already booked.' });
    }

    // Get check-in and check-out times from listing
    const checkInTime = listingDoc.checkIn || "14:00";
    const checkOutTime = listingDoc.checkOut || "11:00";

    // Create booking object with all required fields
    const bookingData = {
      listing,
      guest,
      hosts,
      startDate: start,
      endDate: end,
      guests: parseInt(guests),
      totalPrice: parseFloat(totalPrice),
      status: 'pending', // Will be automatically updated to 'reserved' by pre-save middleware
      checkInTime,
      checkOutTime
    };
    console.log('Booking data to save:', bookingData);

    // Create and save booking
    const booking = new Booking(bookingData);
    await booking.save();

    // Increment bookingCount for the listing
    await Listing.findByIdAndUpdate(booking.listing, { $inc: { bookingCount: 1 } });

    // Create notifications using the notification service
    try {
      await NotificationService.createBookingNotification(booking._id, 'booking');
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the booking if notifications fail
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    // Update all booking statuses first
    await Booking.updateAllStatuses();
    
    // Only get bookings for the current authenticated user
    const query = { guest: req.user._id };
    
    const bookings = await Booking.find(query)
      .populate('listing', 'title images price city country rating checkIn checkOut')
      .populate('guest', 'firstName lastName email')
      .populate('hosts', 'firstName lastName email')
      .sort({ createdAt: -1 });
      
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
    if (booking.guest.toString() !== req.user.id && booking.hosts.toString() !== req.user.id) {
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
    await Booking.updateAllStatuses();
    res.json({ message: 'All booking statuses updated successfully' });
  } catch (err) {
    console.error('Update booking statuses error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 