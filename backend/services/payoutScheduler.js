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
    console.log('⏰ Current time:', new Date().toISOString());
    
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
    
    if (duePayouts.length === 0) {
      console.log('✅ No due payouts found, scheduler completed');
      return;
    }
    
    for (const paymentData of duePayouts) {
      try {
        console.log(`\n💳 Processing payout for payment: ${paymentData._id}`);
        
        const payment = await Payment.findById(paymentData._id);
        const booking = await Booking.findById(paymentData.bookingData._id);
        const listing = await Listing.findById(booking.home).populate('owner');
        const hostApplication = await HostApplication.findOne({ 
          user: listing.owner._id, 
          status: 'approved' 
        });

        if (!payment || !booking || !listing || !hostApplication) {
          console.log('❌ Missing data for payment:', paymentData._id);
          console.log('  - Payment exists:', !!payment);
          console.log('  - Booking exists:', !!booking);
          console.log('  - Listing exists:', !!listing);
          console.log('  - Host application exists:', !!hostApplication);
          continue;
        }

        console.log(`💳 Processing payout for booking ${booking._id} (check-in: ${booking.checkIn})`);
        console.log(`  - Payment status: ${payment.status}`);
        console.log(`  - Payout status: ${payment.payoutStatus}`);
        console.log(`  - Transfer status: ${payment.transferStatus || 'N/A'}`);
        console.log(`  - Host: ${listing.owner.firstName} ${listing.owner.lastName}`);
        console.log(`  - Stripe Connect account: ${hostApplication.stripeConnect?.accountId || 'N/A'}`);
        
        // Check if payment was already processed by webhook
        if (payment.status === 'completed' && payment.payoutStatus === 'completed') {
          console.log('✅ Payment already processed by webhook, skipping payout scheduler for booking:', booking._id);
          continue;
        }

        // Check if payment was processed by webhook but payout status needs updating
        if (payment.status === 'completed' && payment.payoutStatus === 'pending') {
          console.log('💳 Payment completed by webhook, updating payout status for booking:', booking._id);
          
          // Update payment status to reflect webhook processing
          payment.payoutStatus = 'completed';
          payment.payoutCompletedAt = new Date();
          payment.transferStatus = 'completed';
          payment.transferCompletedAt = new Date();
          await payment.save();
          
          // Update booking status
          booking.status = 'confirmed';
          booking.paymentStatus = 'completed';
          await booking.save();
          
          console.log('✅ Payout status updated successfully for booking:', booking._id);
          continue;
        }

        // Check if payment failed during webhook processing
        if (payment.status === 'failed' || payment.payoutStatus === 'failed') {
          console.log('❌ Payment failed during webhook processing for booking:', booking._id);
          console.log('  - Failure reason:', payment.payoutFailureReason || 'Unknown');
          continue;
        }

        // If payment is still pending, it means webhook hasn't processed it yet
        if (payment.status === 'pending') {
          console.log('⏳ Payment still pending, waiting for webhook processing for booking:', booking._id);
          console.log('  - This is normal - webhook will process when payment completes');
          continue;
        }

        // Handle any other payment statuses
        console.log('⚠️ Unexpected payment status for booking:', booking._id);
        console.log('  - Payment status:', payment.status);
        console.log('  - Payout status:', payment.payoutStatus);
        console.log('  - Transfer status:', payment.transferStatus);
        
      } catch (error) {
        console.error(`❌ Error processing payout for payment ${paymentData._id}:`, error);
        console.error('  - Error details:', error.message);
        console.error('  - Stack trace:', error.stack);
        continue;
      }
    }
    
    console.log('\n✅ Automatic payout scheduler completed');
    console.log('⏰ Next run in 1 hour');
    
  } catch (error) {
    console.error('❌ Error in automatic payout scheduler:', error);
    console.error('  - Error details:', error.message);
    console.error('  - Stack trace:', error.stack);
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
