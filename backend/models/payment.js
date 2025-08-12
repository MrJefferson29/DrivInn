const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'usd' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'cashapp'], 
    required: true 
  },
  stripePaymentIntentId: { 
    type: String 
  },
  stripeSessionId: { 
    type: String 
  },
  transactionId: { 
    type: String 
  },
  failureReason: { 
    type: String 
  },
  refundReason: { 
    type: String 
  },
  refundedAt: { 
    type: Date 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeSessionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
