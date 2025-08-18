const cron = require('node-cron');
const Booking = require('../models/booking');
const NotificationService = require('./notificationService');

// Update booking statuses based on check-in/check-out times
const updateBookingStatuses = async () => {
  try {
    console.log('🔄 Starting automatic booking status updates at', new Date().toISOString());
    
    // Get all bookings that need status updates
    const bookingsToUpdate = await Booking.getBookingsNeedingStatusUpdate();
    
    if (bookingsToUpdate.length === 0) {
      console.log('✅ No bookings need status updates at this time');
      return;
    }
    
    console.log(`📋 Found ${bookingsToUpdate.length} bookings that need status updates`);
    
    // Log details about each booking found
    for (const booking of bookingsToUpdate) {
      console.log(`  📖 Booking ${booking._id}:`);
      console.log(`    - Current Status: ${booking.status}`);
      console.log(`    - Check-in: ${booking.checkIn}`);
      console.log(`    - Check-out: ${booking.checkOut}`);
      console.log(`    - Checked In: ${booking.checkedIn}`);
      console.log(`    - Checked Out: ${booking.checkedOut}`);
      console.log(`    - Payment Status: ${booking.paymentStatus}`);
    }
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const booking of bookingsToUpdate) {
      try {
        const oldStatus = booking.status;
        const newStatus = await booking.updateStatusBasedOnTime();
        
        if (newStatus !== oldStatus) {
          await booking.save();
          updatedCount++;
          
          console.log(`✅ Updated booking ${booking._id} status: ${oldStatus} → ${newStatus}`);
          
          // Send notifications based on status change
          await sendStatusChangeNotifications(booking, oldStatus, newStatus);
          
          // Update payment status if check-in occurred
          if (newStatus === 'checked_in' && oldStatus === 'reserved') {
            await updatePaymentOnCheckIn(booking);
          }
        } else {
          console.log(`ℹ️ Booking ${booking._id} status unchanged: ${oldStatus}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating booking ${booking._id}:`, error.message);
      }
    }
    
    // Also check for past bookings that should be marked as completed
    console.log('🔍 Checking for past bookings that should be completed...');
    const pastBookings = await Booking.find({
      status: { $nin: ['completed', 'cancelled'] },
      checkOut: { $lt: new Date() }
    }).populate('user', 'firstName lastName email').populate('home', 'title owner').populate('home.owner');
    
    if (pastBookings.length > 0) {
      console.log(`📋 Found ${pastBookings.length} past bookings that should be completed`);
      
      for (const booking of pastBookings) {
        try {
          if (booking.status !== 'completed') {
            const oldStatus = booking.status;
            booking.status = 'completed';
            booking.checkedOut = true;
            if (!booking.checkOutDate) {
              booking.checkOutDate = new Date(booking.checkOut);
            }
            
            await booking.save();
            updatedCount++;
            
            console.log(`✅ Marked past booking ${booking._id} as completed (was: ${oldStatus})`);
            
            // Send notification for completion
            await sendStatusChangeNotifications(booking, oldStatus, 'completed');
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error updating past booking ${booking._id}:`, error.message);
        }
      }
    }
    
    // Check for bookings that should be checked in (past check-in time but still reserved)
    console.log('🔍 Checking for bookings that should be checked in...');
    const now = new Date();
    const bookingsToCheckIn = await Booking.find({
      status: 'reserved',
      paymentStatus: 'completed',
      checkedIn: false,
      checkIn: { $lte: now }
    }).populate('user', 'firstName lastName email').populate('home', 'title owner').populate('home.owner');
    
    if (bookingsToCheckIn.length > 0) {
      console.log(`📋 Found ${bookingsToCheckIn.length} bookings that should be checked in`);
      
      for (const booking of bookingsToCheckIn) {
        try {
          const oldStatus = booking.status;
          booking.status = 'checked_in';
          booking.checkedIn = true;
          booking.checkInDate = now;
          booking.canReview = true;
          
          await booking.save();
          updatedCount++;
          
          console.log(`✅ Marked booking ${booking._id} as checked in (was: ${oldStatus})`);
          
          // Update payment status since check-in occurred
          try {
            await updatePaymentOnCheckIn(booking);
            console.log(`✅ Payment status update initiated for booking ${booking._id}`);
          } catch (paymentError) {
            console.error(`❌ Error updating payment status for booking ${booking._id}:`, paymentError.message);
          }
          
          // Send check-in notification
          await sendStatusChangeNotifications(booking, oldStatus, 'checked_in');
          
          // Update payment status since check-in occurred
          await updatePaymentOnCheckIn(booking);
        } catch (error) {
          errorCount++;
          console.error(`❌ Error updating check-in for booking ${booking._id}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Booking status update completed:`);
    console.log(`  - Updated: ${updatedCount} bookings`);
    console.log(`  - Errors: ${errorCount} bookings`);
    
  } catch (error) {
    console.error('❌ Error in automatic booking status update:', error);
    console.error('  - Error details:', error.message);
    console.error('  - Stack trace:', error.stack);
  }
};

// Send notifications for status changes
const sendStatusChangeNotifications = async (booking, oldStatus, newStatus) => {
  try {
    if (newStatus === 'checked_in') {
      // Notify guest that they can now check in
      await NotificationService.createNotification({
        user: booking.user._id,
        type: 'booking',
        title: 'Check-in Time!',
        message: `Your booking is ready for check-in. You can now access your accommodation.`,
        booking: booking._id
      });
      
      // Notify host that guest is checking in
      await NotificationService.createNotification({
        user: booking.home.owner._id,
        type: 'booking',
        title: 'Guest Checking In',
        message: `A guest is checking in to your property.`,
        booking: booking._id
      });
      
    } else if (newStatus === 'checked_out') {
      // Notify guest that check-out is complete
      await NotificationService.createNotification({
        user: booking.user._id,
        type: 'booking',
        title: 'Check-out Complete',
        message: `You have successfully checked out. Thank you for staying with us!`,
        booking: booking._id
      });
      
      // Notify host that guest has checked out
      await NotificationService.createNotification({
        user: booking.home.owner._id,
        type: 'booking',
        title: 'Guest Checked Out',
        message: `A guest has checked out of your property.`,
        booking: booking._id
      });
      
    } else if (newStatus === 'completed') {
      // Notify guest that they can now leave a review
      await NotificationService.createNotification({
        user: booking.user._id,
        type: 'review',
        title: 'Leave a Review',
        message: `Your stay is complete! Please leave a review to help other travelers.`,
        booking: booking._id
      });
    }
  } catch (error) {
    console.error('❌ Error sending status change notifications:', error);
  }
};

// Update payment status when check-in occurs
// Payments will be processed daily at 5 PM UTC by the daily payout processor
const updatePaymentOnCheckIn = async (booking) => {
  try {
    console.log(`🔍 Updating payment status for booking ${booking._id} after check-in`);
    
    // Find the payment record for this booking
    const Payment = require('../models/payment');
    const payment = await Payment.findOne({
      booking: booking._id,
      status: 'completed'
    });
    
    console.log(`🔍 Payment lookup result for booking ${booking._id}:`, payment ? 'Found' : 'Not found');
    
    if (payment) {
      console.log(`🔍 Payment details for booking ${booking._id}:`, {
        id: payment._id,
        status: payment.status,
        payoutStatus: payment.payoutStatus
      });
      
      // Ensure payment payout status is pending for daily processing
      if (payment.payoutStatus !== 'pending') {
        payment.payoutStatus = 'pending';
        await payment.save();
        console.log(`✅ Payment payout status updated to pending for daily processing`);
      } else {
        console.log(`ℹ️ Payment already has pending payout status`);
      }
    } else {
      console.log(`⚠️ No payment found for booking ${booking._id}`);
    }
  } catch (error) {
    console.error(`❌ Error updating payment status for booking ${booking._id}:`, error);
    throw error; // Re-throw to be caught by caller
  }
};

// Start the booking status scheduler
const startBookingStatusScheduler = () => {
  console.log('⏰ Starting booking status scheduler...');
  
  // Run every minute for immediate status updates
  cron.schedule('* * * * *', async () => {
    console.log('🔄 Running scheduled booking status update (every minute)...');
    await updateBookingStatuses();
  });
  
  // Log when scheduler starts
  console.log('✅ Booking status scheduler cron jobs registered');
  
  // Also run every 5 minutes for more comprehensive updates
  cron.schedule('*/5 * * * *', async () => {
    console.log('🕐 5-minute comprehensive booking status check...');
    await updateBookingStatuses();
  });
  
  // Also run every 15 minutes to catch any missed updates
  cron.schedule('*/15 * * * *', async () => {
    console.log('🕐 15-minute booking status check...');
    await updateBookingStatuses();
  });
  
  // Also run every hour to catch any missed updates
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Hourly booking status check...');
    await updateBookingStatuses();
  });
  
  console.log('✅ Booking status scheduler started (runs every minute + 5 minutes + 15 minutes + hourly)');
};

// Run initial status check when server starts
const runInitialStatusCheck = async () => {
  console.log('🚀 Running initial booking status check...');
  await updateBookingStatuses();
};

module.exports = {
  startBookingStatusScheduler,
  runInitialStatusCheck,
  updateBookingStatuses
};
