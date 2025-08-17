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
  payoutFailureDetails: { type: String }, // Detailed failure information
  payoutCompletedAt: { type: Date }, // When payout was completed
  stripeTransferId: { type: String }, // Stripe transfer ID for tracking
  transferStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }, // Transfer status
  transferCompletedAt: { type: Date }, // When transfer was completed
  platformFee: { type: Number, default: 0 }, // Platform fee amount
  scheduledPayoutAt: { type: Date }, // When payout is scheduled for
  payoutScheduled: { type: Boolean, default: false }, // Whether payout is scheduled
  
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeSessionId: 1 });
paymentSchema.index({ payoutStatus: 1 }); // Index for payout queries
paymentSchema.index({ payoutDate: 1 }); // Index for payout date queries
paymentSchema.index({ stripeTransferId: 1 }); // Index for transfer queries
paymentSchema.index({ transferStatus: 1 }); // Index for transfer status queries
paymentSchema.index({ scheduledPayoutAt: 1, payoutStatus: 1 }); // Index for scheduled payouts

module.exports = mongoose.model('Payment', paymentSchema);
