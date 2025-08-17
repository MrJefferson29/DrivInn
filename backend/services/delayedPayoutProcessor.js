const cron = require('node-cron');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const HostApplication = require('../models/HostApplication');

const processDelayedPayouts = async () => {
  try {
    console.log('🔄 Processing delayed payouts...');
    
    // Find payments that are ready for payout (scheduled time has passed)
    const now = new Date();
    const paymentsToProcess = await Payment.find({
      payoutStatus: 'scheduled',
      scheduledPayoutAt: { $lte: now },
      status: 'completed'
    }).populate('booking');
    
    console.log(`📋 Found ${paymentsToProcess.length} payments ready for payout`);
    
    for (const payment of paymentsToProcess) {
      try {
        // Get booking and host information
        const booking = payment.booking;
        if (!booking) {
          console.log(`⚠️ No booking found for payment ${payment._id}`);
          continue;
        }
        
        // Get listing and host application
        const Listing = require('../models/listing');
        const listing = await Listing.findById(booking.home).populate('owner');
        if (!listing) {
          console.log(`⚠️ No listing found for booking ${booking._id}`);
          continue;
        }
        
        const hostApplication = await HostApplication.findOne({ 
          user: listing.owner._id, 
          status: 'approved' 
        });
        
        if (!hostApplication || !hostApplication.stripeConnect?.accountId) {
          console.log(`⚠️ No approved host application with Stripe Connect account found for host ${listing.owner._id}`);
          continue;
        }
        
        // Calculate platform fee (10%)
        const platformFee = Math.round(payment.amount * 0.10 * 100); // In cents
        const hostAmount = Math.round(payment.amount * 0.90 * 100); // In cents
        
        // Create transfer to host
        console.log(`💳 Creating transfer for payment ${payment._id} to host ${hostApplication.stripeConnect.accountId}`);
        const transfer = await stripe.transfers.create({
          amount: hostAmount,
          currency: payment.currency,
          destination: hostApplication.stripeConnect.accountId,
          description: `Payout for booking ${booking._id}`,
          metadata: {
            bookingId: booking._id.toString(),
            paymentId: payment._id.toString(),
            platformFee: platformFee
          }
        });
        
        // Update payment record
        payment.payoutStatus = 'completed';
        payment.payoutCompletedAt = new Date();
        payment.stripeTransferId = transfer.id;
        payment.transferStatus = 'completed';
        payment.transferCompletedAt = new Date();
        payment.platformFee = platformFee / 100; // Convert back to dollars
        payment.metadata = {
          ...(payment.metadata || {}),
          transferId: transfer.id,
          transferAmount: hostAmount,
          transferCurrency: transfer.currency
        };
        
        await payment.save();
        console.log(`✅ Payout completed for payment ${payment._id}, transfer ID: ${transfer.id}`);
        
      } catch (error) {
        console.error(`❌ Error processing payout for payment ${payment._id}:`, error.message);
        
        // Update payment with failure details
        payment.payoutStatus = 'failed';
        payment.payoutFailureReason = error.message;
        payment.payoutFailureDetails = error.stack;
        await payment.save();
      }
    }
    
    console.log('✅ Delayed payout processing completed');
  } catch (error) {
    console.error('❌ Error in delayed payout processing:', error);
  }
};

// Start the payout processor
const startDelayedPayoutProcessor = () => {
  console.log('⏰ Starting delayed payout processor...');
  
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Running delayed payout processor (every 5 minutes)...');
    await processDelayedPayouts();
  });
  
  console.log('✅ Delayed payout processor started (runs every 5 minutes)');
};

module.exports = {
  startDelayedPayoutProcessor,
  processDelayedPayouts
};