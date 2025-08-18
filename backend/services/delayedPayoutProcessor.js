const cron = require('node-cron');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const HostApplication = require('../models/HostApplication');

const processDailyPayouts = async () => {
  try {
    console.log('🔄 Processing daily payouts at', new Date().toISOString());
    
    // Find all payments that are completed but not yet paid out
    const paymentsToProcess = await Payment.find({
      status: 'completed',
      payoutStatus: 'pending'
    }).populate('booking');
    
    console.log(`📋 Found ${paymentsToProcess.length} payments ready for payout`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const payment of paymentsToProcess) {
      try {
        // Get booking and host information
        const booking = payment.booking;
        if (!booking) {
          console.log(`⚠️ No booking found for payment ${payment._id}`);
          errorCount++;
          continue;
        }
        
        // Only process payouts for bookings that have been checked in
        if (booking.status !== 'checked_in') {
          console.log(`ℹ️ Skipping payment ${payment._id} for booking ${booking._id} - not checked in yet`);
          continue;
        }
        
        // Get listing and host application
        const Listing = require('../models/listing');
        const listing = await Listing.findById(booking.home).populate('owner');
        if (!listing) {
          console.log(`⚠️ No listing found for booking ${booking._id}`);
          errorCount++;
          continue;
        }
        
        const hostApplication = await HostApplication.findOne({
          user: listing.owner._id,
          status: 'approved'
        });
        
        if (!hostApplication || !hostApplication.stripeConnect?.accountId) {
          console.log(`⚠️ No approved host application with Stripe Connect account found for host ${listing.owner._id}`);
          errorCount++;
          continue;
        }
        
        // Calculate platform fee (10%)
        const platformFee = Math.round(payment.amount * 0.10 * 100); // In cents
        const hostAmount = Math.round(payment.amount * 0.90 * 100); // In cents
        
        // Create transfer to host with retry logic for timeouts
        console.log(`💳 Creating transfer for payment ${payment._id} to host ${hostApplication.stripeConnect.accountId}`);
        let transfer;
        let retries = 3;
        while (retries > 0) {
          try {
            transfer = await stripe.transfers.create({
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
            break; // Success, exit retry loop
          } catch (transferError) {
            retries--;
            if (retries === 0 || !transferError.message.includes('timeout')) {
              // If it's not a timeout error or we've exhausted retries, re-throw
              throw transferError;
            }
            console.log(`⚠️ Transfer timeout for payment ${payment._id}, retries left: ${retries}`);
            // Wait 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
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
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing payout for payment ${payment._id}:`, error.message);
        errorCount++;
        
        // Update payment with failure details
        payment.payoutStatus = 'failed';
        payment.transferStatus = 'failed'; // Also update transfer status
        payment.payoutFailureReason = error.message;
        payment.payoutFailureDetails = error.stack;
        await payment.save();
      }
    }
    
    console.log(`✅ Daily payout processing completed - Processed: ${processedCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('❌ Error in daily payout processing:', error);
  }
};

// Start the payout processor
const startDailyPayoutProcessor = () => {
  console.log('⏰ Starting daily payout processor...');
  
  // Run daily at 5 PM UTC (0 17 * * *)
  cron.schedule('0 17 * * *', async () => {
    console.log('🔄 Running daily payout processor (5 PM UTC)...');
    await processDailyPayouts();
  });
  
  // Run daily at 8 PM UTC (0 20 * * *)
  cron.schedule('0 20 * * *', async () => {
    console.log('🔄 Running daily payout processor (8 PM UTC)...');
    await processDailyPayouts();
  });
  
  // Run daily at 12 PM UTC (0 12 * * *)
  cron.schedule('0 12 * * *', async () => {
    console.log('🔄 Running daily payout processor (12 PM UTC)...');
    await processDailyPayouts();
  });
  
  // Log when processor starts
  console.log('✅ Daily payout processor cron jobs registered');
  
  console.log('✅ Daily payout processor started (runs daily at 5 PM UTC, 8 PM UTC, and 12 PM UTC)');
};

module.exports = {
  startDailyPayoutProcessor,
  processDailyPayouts
};