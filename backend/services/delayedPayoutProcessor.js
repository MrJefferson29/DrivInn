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
    
    // Log the breakdown of payments by booking status
    const statusBreakdown = {};
    paymentsToProcess.forEach(payment => {
      if (payment.booking) {
        const status = payment.booking.status;
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      }
    });
    
    console.log('📊 Payment Status Breakdown:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      const eligible = (status === 'checked_in' || status === 'completed') ? '✅' : '❌';
      console.log(`  - ${status}: ${count} payments ${eligible}`);
    });
    console.log('');
    
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
        
        // Process payouts for bookings that have been checked in OR completed
        // This ensures hosts get paid for their services regardless of the exact status
        if (booking.status !== 'checked_in' && booking.status !== 'completed') {
          console.log(`ℹ️ Skipping payment ${payment._id} for booking ${booking._id} - status is ${booking.status}, must be 'checked_in' or 'completed'`);
          continue;
        }
        
        // Log which status we're processing for payout
        console.log(`✅ Processing payout for booking ${booking._id} with status: ${booking.status}`);
        
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
        
        // Update booking record payout status to keep in sync
        try {
          const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
            payoutStatus: 'completed',
            updatedAt: new Date()
          }, { new: true });
          
          if (updatedBooking) {
            console.log(`✅ Booking ${booking._id} payout status updated to completed`);
          }
        } catch (bookingUpdateError) {
          console.error(`⚠️ Error updating booking payout status for ${booking._id}:`, bookingUpdateError.message);
          // Don't fail the entire payout process if booking update fails
        }
        
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
        
        // Update booking record payout status to keep in sync
        try {
          const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
            payoutStatus: 'failed',
            updatedAt: new Date()
          }, { new: true });
          
          if (updatedBooking) {
            console.log(`✅ Booking ${booking._id} payout status updated to failed`);
          }
        } catch (bookingUpdateError) {
          console.error(`⚠️ Error updating booking payout status for ${booking._id}:`, bookingUpdateError.message);
          // Don't fail the entire error handling if booking update fails
        }
      }
    }
    
    console.log(`\n📊 Daily Payout Processing Summary:`);
    console.log(`  - Total Payments Found: ${paymentsToProcess.length}`);
    console.log(`  - Successfully Processed: ${processedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`  - Skipped (wrong status): ${paymentsToProcess.length - processedCount - errorCount}`);
    console.log(`✅ Daily payout processing completed`);
  } catch (error) {
    console.error('❌ Error in daily payout processing:', error);
  }
};

// Utility function to sync existing bookings with their payment payout statuses
// This can be used to fix existing data inconsistencies
const syncBookingPayoutStatuses = async () => {
  try {
    console.log('🔄 Starting booking payout status synchronization...');
    
    // Find all payments that are completed but have pending payout status in bookings
    const paymentsToSync = await Payment.find({
      status: 'completed',
      payoutStatus: 'completed'
    }).populate('booking');
    
    console.log(`📋 Found ${paymentsToSync.length} completed payments to sync with bookings`);
    
    let syncedCount = 0;
    let errorCount = 0;
    
    for (const payment of paymentsToSync) {
      try {
        if (!payment.booking) {
          console.log(`⚠️ No booking found for payment ${payment._id}`);
          continue;
        }
        
        // Check if booking payout status needs updating
        if (payment.booking.payoutStatus !== 'completed') {
          const updatedBooking = await Booking.findByIdAndUpdate(payment.booking._id, {
            payoutStatus: 'completed',
            updatedAt: new Date()
          }, { new: true });
          
          if (updatedBooking) {
            console.log(`✅ Synced booking ${payment.booking._id} payout status to completed`);
            syncedCount++;
          }
        } else {
          console.log(`ℹ️ Booking ${payment.booking._id} already has correct payout status`);
        }
        
      } catch (error) {
        console.error(`❌ Error syncing booking ${payment.booking?._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Booking payout status synchronization completed - Synced: ${syncedCount}, Errors: ${errorCount}`);
    return { syncedCount, errorCount };
    
  } catch (error) {
    console.error('❌ Error in booking payout status synchronization:', error);
    throw error;
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
  processDailyPayouts,
  syncBookingPayoutStatuses
};