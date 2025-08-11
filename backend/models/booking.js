const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'reserved', 'cancelled'], default: 'pending' },
  paymentSessionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
