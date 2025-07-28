const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: [
      'booking', 
      'booking_cancelled', 
      'booking_confirmed',
      'listing', 
      'listing_created',
      'listing_updated',
      'listing_deleted',
      'host_application', 
      'host_application_approved',
      'host_application_declined',
      'like',
      'review',
      'review_received',
      'payment',
      'payment_successful',
      'payment_failed',
      'system',
      'welcome',
      'reminder'
    ], 
    required: true 
  },
  message: { type: String, required: true },
  title: { type: String, required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  hostApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'HostApplication' },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema); 