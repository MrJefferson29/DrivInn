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
    
    // Parse check-in and check-out times from listing
    const checkInTime = listing.checkIn; // e.g., '14:00'
    const checkOutTime = listing.checkOut; // e.g., '11:00'
    
    // Use default times if not set in listing
    const defaultCheckInTime = '14:00'; // 2:00 PM
    const defaultCheckOutTime = '11:00'; // 11:00 AM
    
    const finalCheckInTime = checkInTime || defaultCheckInTime;
    const finalCheckOutTime = checkOutTime || defaultCheckOutTime;
    
    console.log(`📋 Listing times for ${listing._id}:`);
    console.log(`  - Original check-in time: ${checkInTime || 'Not set'}`);
    console.log(`  - Original check-out time: ${checkOutTime || 'Not set'}`);
    console.log(`  - Using check-in time: ${finalCheckInTime}`);
    console.log(`  - Using check-out time: ${finalCheckOutTime}`);
    
    // Create full datetime objects for check-in and check-out
    // The booking dates are stored in Cameroon timezone (GMT+1)
    // We need to convert them to UTC for proper comparison
    
    // Get the original booking dates
    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);
    
    // Get the timezone offset for Cameroon (GMT+1)
    const cameroonOffset = 1 * 60; // 1 hour in minutes
    
    // Parse the time strings and set them to the check-in/check-out dates
    const [checkInHour, checkInMinute] = finalCheckInTime.split(':').map(Number);
    const [checkOutHour, checkOutMinute] = finalCheckOutTime.split(':').map(Number);
    
    // Create datetime objects in Cameroon timezone, then convert to UTC
    const checkInDateTime = new Date(
      checkInDate.getFullYear(),
      checkInDate.getMonth(),
      checkInDate.getDate(),
      checkInHour,
      checkInMinute,
      0,
      0
    );
    
    // Adjust for timezone: subtract Cameroon offset to get UTC
    checkInDateTime.setMinutes(checkInDateTime.getMinutes() - cameroonOffset);
    
    const checkOutDateTime = new Date(
      checkOutDate.getFullYear(),
      checkOutDate.getMonth(),
      checkOutDate.getDate(),
      checkOutHour,
      checkOutMinute,
      0,
      0
    );
    
    // Adjust for timezone: subtract Cameroon offset to get UTC
    checkOutDateTime.setMinutes(checkOutDateTime.getMinutes() - cameroonOffset);
    
    console.log(`🔍 Time check for booking ${this._id}:`);
    console.log(`  - Current time: ${now.toISOString()}`);
    console.log(`  - Check-in datetime: ${checkInDateTime.toISOString()}`);
    console.log(`  - Check-out datetime: ${checkOutDateTime.toISOString()}`);
    console.log(`  - Check-in time: ${finalCheckInTime}`);
    console.log(`  - Check-out time: ${finalCheckOutTime}`);
    console.log(`  - Cameroon offset: +${cameroonOffset/60} hours`);
    console.log(`  - Original check-in date: ${checkInDate.toString()}`);
    console.log(`  - Original check-out date: ${checkOutDate.toString()}`);
    console.log(`  - Current booking status: ${this.status}`);
    console.log(`  - Already checked in: ${this.checkedIn}`);
    console.log(`  - Already checked out: ${this.checkedOut}`);
    
    // Check if it's check-in time (within 1 hour of the actual check-in datetime)
    const checkInWindowStart = new Date(checkInDateTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const checkInWindowEnd = new Date(checkInDateTime.getTime() + 60 * 60 * 1000); // 1 hour after
    
    // Check if it's check-out time (within 1 hour of the actual check-out datetime)
    const checkOutWindowStart = new Date(checkOutDateTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const checkOutWindowEnd = new Date(checkOutDateTime.getTime() + 60 * 60 * 1000); // 1 hour after
    
    console.log(`  - Check-in window: ${checkInWindowStart.toISOString()} to ${checkInWindowEnd.toISOString()}`);
    console.log(`  - Check-out window: ${checkOutWindowStart.toISOString()} to ${checkOutWindowEnd.toISOString()}`);
    
    // If check-out date has completely passed, mark as completed regardless of current status
    if (now > checkOutWindowEnd) {
      if (this.status !== 'completed') {
        this.status = 'completed';
        this.checkedOut = true;
        this.checkOutDate = checkOutDateTime;
        console.log(`✅ Marking past booking ${this._id} as completed at ${now.toISOString()}`);
        return 'completed';
      }
      return this.status;
    }
    
    // Only proceed with check-in/check-out logic for confirmed or reserved bookings
    // AND only if payment has been completed
    if ((this.status === 'confirmed' || this.status === 'reserved') && this.paymentStatus === 'completed') {
      if (now >= checkInWindowStart && now <= checkInWindowEnd && !this.checkedIn) {
        // It's check-in time - automatically change status
        this.status = 'checked_in';
        this.checkedIn = true;
        this.checkInDate = now;
        this.canReview = true; // Enable review after check-in
        console.log(`✅ Automatic check-in for booking ${this._id} at ${now.toISOString()}`);
        return 'checked_in';
        
      } else if (now >= checkOutWindowStart && now <= checkOutWindowEnd && !this.checkedOut) {
        // It's check-out time - automatically change status
        this.status = 'checked_out';
        this.checkedOut = true;
        this.checkOutDate = now;
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
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  
  return this.find({
    status: { $nin: ['cancelled', 'completed'] }, // Include all statuses except cancelled and completed
    $or: [
      // Check-in date is today and within check-in time window
      {
        checkIn: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        },
        checkedIn: false
      },
      // Check-out date is today and within check-out time window
      {
        checkOut: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        },
        checkedOut: false
      },
      // Past check-out date but still not marked as completed
      {
        checkOut: { $lt: now },
        status: { $nin: ['completed', 'cancelled'] }
      }
    ]
  }).populate('home', 'checkIn checkOut');
};

module.exports = mongoose.model('Booking', bookingSchema);
