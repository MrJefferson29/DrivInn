const cron = require('node-cron');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const HostApplication = require('../models/HostApplication');

// Function to process automatic payouts for bookings where check-in date has arrived
const processDuePayouts = async () => {
  try {
    console.log('🔄 Running automatic payout scheduler...');
    
    const now = new Date();
    
    // Find all completed payments where check-in date has arrived and payout is pending
    const duePayouts = await Payment.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'bookingData'
        }
      },
      {
        $unwind: '$bookingData'
      },
      {
        $match: {
          'status': 'completed',
          'payoutStatus': 'pending',
          'bookingData.checkIn': { $lte: now }
        }
      }
    ]);
    
    console.log(`📋 Found ${duePayouts.length} due payouts to process`);
    
    for (const paymentData of duePayouts) {
      try {
        const payment = await Payment.findById(paymentData._id);
        const booking = await Booking.findById(paymentData.bookingData._id);
        const listing = await Listing.findById(booking.home).populate('owner');
        const hostApplication = await HostApplication.findOne({ 
          user: listing.owner._id, 
          status: 'approved' 
        });

        if (!payment || !booking || !listing || !hostApplication) {
          console.log('❌ Missing data for payment:', paymentData._id);
          continue;
        }

        console.log(`💳 Processing payout for booking ${booking._id} (check-in: ${booking.checkIn})`);
        
        // Process payout based on host's Stripe Connect status
        if (hostApplication.stripeConnect?.accountId && 
            hostApplication.stripeConnect.accountStatus === 'active') {
          
          // Check if this payment was set up with automatic payout (transfer_data)
          const hasAutomaticPayout = payment.metadata?.hasTransferData === true;
          
          if (!hasAutomaticPayout) {
            // Reject payments that don't support automatic payouts
            console.error('❌ Payment does not support automatic payout - rejecting');
            payment.payoutStatus = 'failed';
            payment.payoutFailureReason = 'Payment not configured for automatic payout. Host account may not be fully configured.';
            payment.payoutFailureDetails = 'This payment was created without transfer_data, which is required for automatic payouts. The host must complete their Stripe Connect account setup.';
            await payment.save();
            
            // Update booking status
            booking.status = 'payment_failed';
            booking.paymentFailureReason = 'Automatic payout not supported';
            await booking.save();
            
            console.log('❌ Payment rejected - automatic payout not supported for booking:', booking._id);
            continue;
          }
          
          // All payments MUST use automatic payout via transfer_data
          console.log('💳 Processing automatic payout via transfer_data...');
          
          try {
            // Capture the payment intent (this releases the funds to the host automatically)
            const paymentIntent = await stripe.paymentIntents.capture(
              payment.stripePaymentIntentId,
              {
                transfer_data: {
                  destination: hostApplication.stripeConnect.accountId,
                },
                application_fee_amount: Math.round(booking.totalPrice * 0.10 * 100), // 10% platform fee
              }
            );
            
            console.log('✅ Payment captured and transferred automatically to host:', paymentIntent.id);
            
            // Update payment status
            payment.payoutStatus = 'completed';
            payment.payoutCompletedAt = new Date();
            payment.stripeTransferId = paymentIntent.latest_charge?.transfer;
            await payment.save();
            
            // Update booking status
            booking.status = 'confirmed';
            booking.paymentStatus = 'completed';
            await booking.save();
            
            console.log('✅ Automatic payout completed successfully for booking:', booking._id);
            
          } catch (stripeError) {
            console.error('❌ Error processing automatic payout:', stripeError);
            
            // Update payment status
            payment.payoutStatus = 'failed';
            payment.payoutFailureReason = 'Stripe error during automatic payout';
            payment.payoutFailureDetails = stripeError.message;
            await payment.save();
            
            // Update booking status
            booking.status = 'payment_failed';
            booking.paymentFailureReason = 'Automatic payout failed';
            await booking.save();
            
            console.error('❌ Automatic payout failed for booking:', booking._id, 'Error:', stripeError.message);
          }
          
        } else {
          // Host account not fully configured - reject all payments
          console.error('❌ Host account not fully configured for Stripe Connect, rejecting payment for booking:', booking._id);
          
          payment.payoutStatus = 'failed';
          payment.payoutFailureReason = 'Host account not fully configured';
          payment.payoutFailureDetails = 'The host must complete their Stripe Connect account setup to receive automatic payouts.';
          await payment.save();
          
          booking.status = 'payment_failed';
          booking.paymentFailureReason = 'Host account incomplete';
          await booking.save();
          
          console.log('❌ Payment rejected - host account incomplete for booking:', booking._id);
        }
        
      } catch (error) {
        console.error(`❌ Error processing payout for payment ${paymentData._id}:`, error);
        continue;
      }
    }
    
    console.log('✅ Automatic payout scheduler completed');
    
  } catch (error) {
    console.error('❌ Error in automatic payout scheduler:', error);
  }
};

// Run payout scheduler every hour
const startPayoutScheduler = () => {
  console.log('⏰ Starting payout scheduler (runs every hour)');
  
  cron.schedule('0 * * * *', async () => {
    await processDuePayouts();
  });
};

// Run initial payout check when server starts
const runInitialPayoutCheck = async () => {
  console.log('🚀 Running initial payout check...');
  await processDuePayouts();
};

module.exports = {
  startPayoutScheduler,
  runInitialPayoutCheck,
  processDuePayouts
};
