const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['card', 'cashapp', 'bank_transfer', 'samsung_pay'], required: true },
  stripePaymentIntentId: { type: String },
  stripeSessionId: { type: String },
  transactionId: { type: String },
  failureReason: { type: String },
  refundReason: { type: String },
  refundedAt: { type: Date },
  
  // Payout-related fields
  payoutStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  payoutMethod: { type: String, enum: ['stripe_connect'], default: 'stripe_connect' },
  payoutDate: { type: Date },
  payoutTransactionId: { type: String },
  payoutFailureReason: { type: String },
  platformFee: { type: Number, default: 0 }, // Platform fee amount
  
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeSessionId: 1 });
paymentSchema.index({ payoutStatus: 1 }); // Index for payout queries
paymentSchema.index({ payoutDate: 1 }); // Index for payout date queries

module.exports = mongoose.model('Payment', paymentSchema);
