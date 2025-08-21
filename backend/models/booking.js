const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'reserved', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  paymentSessionId: { type: String },
  payoutStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  
  // Review-related fields
  canReview: {
    type: Boolean,
    default: false
  },
  hasReview: {
    type: Boolean,
    default: false
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  
  // Check-in/out tracking (automatic, not manual)
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedOut: {
    type: Boolean,
    default: false
  },
  checkInDate: {
    type: Date
  },
  checkOutDate: {
    type: Date
  },
  
  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to automatically update booking status based on check-in/check-out dates and times
bookingSchema.methods.updateStatusBasedOnTime = async function() {
  const now = new Date();
  
  // Only update status for relevant bookings (not cancelled or already completed)
  if (this.status === 'cancelled' || this.status === 'completed') {
    return this.status;
  }
  
  try {
    // Get the listing to access check-in/check-out times
    const Listing = require('./listing');
    const listing = await Listing.findById(this.home);
    
    if (!listing) {
      console.error('Listing not found for booking:', this._id);
      return this.status;
    }
    
    // The booking now stores full datetime objects (user date + host time)
    // So we can use them directly instead of trying to combine dates with times
    const checkInDateTime = new Date(this.checkIn);
    const checkOutDateTime = new Date(this.checkOut);
    
    console.log(`📋 Booking datetime for ${this._id}:`);
    console.log(`  - Check-in datetime (stored): ${this.checkIn}`);
    console.log(`  - Check-out datetime (stored): ${this.checkOut}`);
    console.log(`  - Parsed check-in datetime: ${checkInDateTime.toISOString()}`);
    console.log(`  - Parsed check-out datetime: ${checkOutDateTime.toISOString()}`);
    
    console.log(`🔍 Time check for booking ${this._id}:`);
    console.log(`  - Current time: ${now.toISOString()}`);
    console.log(`  - Check-in datetime: ${checkInDateTime.toISOString()}`);
    console.log(`  - Check-out datetime: ${checkOutDateTime.toISOString()}`);
    console.log(`  - Current booking status: ${this.status}`);
    console.log(`  - Already checked in: ${this.checkedIn}`);
    console.log(`  - Already checked out: ${this.checkedOut}`);
    
    // Check if it's check-in time (within 2 hours of the actual check-in datetime for more flexibility)
    const checkInWindowStart = new Date(checkInDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    const checkInWindowEnd = new Date(checkInDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after
    
    // Check if it's check-out time (within 2 hours of the actual check-out datetime)
    const checkOutWindowStart = new Date(checkOutDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    const checkOutWindowEnd = new Date(checkOutDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after
    
    console.log(`  - Check-in window: ${checkInWindowStart.toISOString()} to ${checkInWindowEnd.toISOString()}`);
    console.log(`  - Check-out window: ${checkOutWindowStart.toISOString()} to ${checkOutWindowEnd.toISOString()}`);
    
    // If check-out date has completely passed, mark as completed regardless of current status
    if (now > checkOutWindowEnd) {
      if (this.status !== 'completed') {
        this.status = 'completed';
        this.checkedOut = true;
        this.checkOutDate = checkOutDateTime;
        this.canReview = true; // Enable review after completion
        console.log(`✅ Marking past booking ${this._id} as completed at ${now.toISOString()}`);
        return 'completed';
      }
      return this.status;
    }
    
    // Only proceed with check-in/check-out logic for confirmed or reserved bookings
    // AND only if payment has been completed
    if ((this.status === 'confirmed' || this.status === 'reserved') && this.paymentStatus === 'completed') {
      // Check if we're past check-in time and should mark as checked in
      if (now >= checkInWindowStart && !this.checkedIn) {
        // It's check-in time - automatically change status
        this.status = 'checked_in';
        this.checkedIn = true;
        this.checkInDate = now;
        this.canReview = true; // Enable review after check-in
        console.log(`✅ Automatic check-in for booking ${this._id} at ${now.toISOString()}`);
        return 'checked_in';
        
      } else if (now >= checkOutWindowStart && !this.checkedOut) {
        // It's check-out time - automatically change status
        this.status = 'checked_out';
        this.checkedOut = true;
        this.checkOutDate = now;
        this.canReview = true; // Enable review after check-out
        console.log(`✅ Automatic check-out for booking ${this._id} at ${now.toISOString()}`);
        return 'checked_out';
      }
    }
    
    return this.status;
    
  } catch (error) {
    console.error('Error updating booking status based on time:', error);
    return this.status;
  }
};

// Static method to get all bookings that need status updates
bookingSchema.statics.getBookingsNeedingStatusUpdate = function() {
  const now = new Date();
  
  return this.find({
    status: { $nin: ['cancelled', 'completed'] }, // Include all statuses except cancelled and completed
    $or: [
      // Check-in date is today or in the past and not yet checked in
      {
        checkIn: { $lte: now },
        checkedIn: false,
        paymentStatus: 'completed'
      },
      // Check-out date is today or in the past and not yet checked out
      {
        checkOut: { $lte: now },
        checkedOut: false,
        paymentStatus: 'completed'
      },
      // Past check-out date but still not marked as completed
      {
        checkOut: { $lt: now },
        status: { $nin: ['completed', 'cancelled'] }
      },
      // Reserved bookings that should be checked in (past check-in time)
      {
        status: 'reserved',
        checkIn: { $lte: now },
        checkedIn: false,
        paymentStatus: 'completed'
      },
      // Confirmed bookings that should be checked in (past check-in time)
      {
        status: 'confirmed',
        checkIn: { $lte: now },
        checkedIn: false,
        paymentStatus: 'completed'
      }
    ]
  }).populate('home', 'checkIn checkOut').populate('user', 'firstName lastName email').populate('home.owner');
};

module.exports = mongoose.model('Booking', bookingSchema);
