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
    enum: ['pending', 'reserved', 'confirmed', 'cancelled', 'completed'], 
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
  
  // Check-in/out tracking
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
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
