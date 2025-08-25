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
    } else {
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
    }
    
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const booking of bookingsToUpdate) {
      try {
        // CRITICAL SECURITY CHECK: Verify payment is completed before allowing check-in/check-out
        if (booking.paymentStatus !== 'completed') {
          console.log(`⚠️ Skipping booking ${booking._id} - payment status is ${booking.paymentStatus}, must be 'completed' for status updates`);
          skippedCount++;
          continue;
        }
        
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
    
    // CRITICAL: Auto-cancel bookings with pending payments for more than 24 hours
    console.log('🔍 Checking for pending payments that exceed 24 hours...');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const pendingPaymentsToCancel = await Booking.find({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    }).populate('user', 'firstName lastName email').populate('home', 'title owner').populate('home.owner');
    
    if (pendingPaymentsToCancel.length > 0) {
      console.log(`📋 Found ${pendingPaymentsToCancel.length} bookings with pending payments for more than 24 hours`);
      
      for (const booking of pendingPaymentsToCancel) {
        try {
          console.log(`🚫 Auto-cancelling booking ${booking._id}:`);
          console.log(`  - User: ${booking.user?.firstName} ${booking.user?.lastName} (${booking.user?.email})`);
          console.log(`  - Listing: ${booking.home?.title}`);
          console.log(`  - Created: ${booking.createdAt}`);
          console.log(`  - Hours Pending: ${Math.round((Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60))}`);
          
          const oldStatus = booking.status;
          booking.status = 'cancelled';
          booking.updatedAt = new Date();
          
          await booking.save();
          updatedCount++;
          
          console.log(`✅ Auto-cancelled booking ${booking._id}: ${oldStatus} → cancelled`);
          
          // Send cancellation notification to user
          try {
            await NotificationService.createNotification({
              user: booking.user._id,
              type: 'booking',
              title: 'Booking Cancelled - Payment Not Completed',
              message: `Your booking for ${booking.home.title} has been automatically cancelled because payment was not completed within 24 hours. Please make a new booking when you're ready to complete payment.`,
              booking: booking._id
            });
            console.log(`✅ Cancellation notification sent to user ${booking.user._id}`);
          } catch (notificationError) {
            console.error(`❌ Error sending cancellation notification:`, notificationError.message);
          }
          
          // Send notification to host about cancelled booking
          try {
            await NotificationService.createNotification({
              user: booking.home.owner._id,
              type: 'booking',
              title: 'Booking Cancelled - Payment Not Completed',
              message: `A booking for ${booking.home.title} has been automatically cancelled because the guest did not complete payment within 24 hours. The dates are now available for other guests.`,
              booking: booking._id
            });
            console.log(`✅ Cancellation notification sent to host ${booking.home.owner._id}`);
          } catch (notificationError) {
            console.error(`❌ Error sending host cancellation notification:`, notificationError.message);
          }
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Error auto-cancelling booking ${booking._id}:`, error.message);
        }
      }
    } else {
      console.log('✅ No pending payments exceed 24 hours');
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
          // CRITICAL SECURITY CHECK: Only mark as completed if payment was completed
          if (booking.paymentStatus !== 'completed') {
            console.log(`⚠️ Skipping completion for booking ${booking._id} - payment status is ${booking.paymentStatus}, must be 'completed'`);
            skippedCount++;
            continue;
          }
          
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
      checkIn: { $lte: now },
      checkedIn: false,
      paymentStatus: 'completed' // CRITICAL: Only include completed payments
    }).populate('home', 'checkIn checkOut').populate('user', 'firstName lastName email').populate('home.owner');
    
    if (bookingsToCheckIn.length > 0) {
      console.log(`📋 Found ${bookingsToCheckIn.length} reserved bookings that should be checked in`);
      
      for (const booking of bookingsToCheckIn) {
        try {
          // Double-check payment status for security
          if (booking.paymentStatus !== 'completed') {
            console.log(`⚠️ Skipping check-in for booking ${booking._id} - payment status is ${booking.paymentStatus}, must be 'completed'`);
            skippedCount++;
            continue;
          }
          
          const oldStatus = booking.status;
          booking.status = 'checked_in';
          booking.checkedIn = true;
          if (!booking.checkInDate) {
            booking.checkInDate = new Date(booking.checkIn);
          }
          
          await booking.save();
          updatedCount++;
          
          console.log(`✅ Marked booking ${booking._id} as checked in (was: ${oldStatus})`);
          
          // Send notification for check-in
          await sendStatusChangeNotifications(booking, oldStatus, 'checked_in');
          
          // Update payment status for payout processing
          await updatePaymentOnCheckIn(booking);
        } catch (error) {
          errorCount++;
          console.error(`❌ Error updating booking ${booking._id} to checked in:`, error.message);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Total Bookings Processed: ${bookingsToUpdate.length + pastBookings.length + bookingsToCheckIn.length}`);
    console.log(`  - Updated: ${updatedCount}`);
    console.log(`  - Skipped (Payment Not Completed): ${skippedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
    // Log auto-cancellation summary
    if (pendingPaymentsToCancel.length > 0) {
      console.log(`  - Auto-Cancelled (24h+ Pending): ${pendingPaymentsToCancel.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error in update booking statuses:', error);
  }
};

// Send notifications for status changes
const sendStatusChangeNotifications = async (booking, oldStatus, newStatus) => {
  try {
    if (newStatus === 'checked_in') {
      // Notify guest that they can now check in and leave reviews
      await NotificationService.createNotification({
        user: booking.user._id,
        type: 'booking',
        title: 'Check-in Time!',
        message: `Your booking is ready for check-in. You can now access your accommodation and start leaving reviews about your experience!`,
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
      // Notify guest that check-out is complete and they can still review
      await NotificationService.createNotification({
        user: booking.user._id,
        type: 'booking',
        title: 'Check-out Complete',
        message: `You have successfully checked out. Thank you for staying with us! You can still leave a review about your experience.`,
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

// Function to manually check and cancel overdue pending payments
const cancelOverduePendingPayments = async () => {
  try {
    console.log('🔍 Manually checking for overdue pending payments...');
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const overdueBookings = await Booking.find({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    }).populate('user', 'firstName lastName email').populate('home', 'title owner').populate('home.owner');
    
    if (overdueBookings.length === 0) {
      console.log('✅ No overdue pending payments found');
      return { cancelled: 0, errors: 0 };
    }
    
    console.log(`📋 Found ${overdueBookings.length} overdue pending payments to cancel`);
    
    let cancelledCount = 0;
    let errorCount = 0;
    
    for (const booking of overdueBookings) {
      try {
        console.log(`🚫 Cancelling overdue booking ${booking._id}:`);
        console.log(`  - User: ${booking.user?.firstName} ${booking.user?.lastName} (${booking.user?.email})`);
        console.log(`  - Listing: ${booking.home?.title}`);
        console.log(`  - Created: ${booking.createdAt}`);
        console.log(`  - Hours Overdue: ${Math.round((Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60))}`);
        
        const oldStatus = booking.status;
        booking.status = 'cancelled';
        booking.updatedAt = new Date();
        
        await booking.save();
        cancelledCount++;
        
        console.log(`✅ Cancelled overdue booking ${booking._id}: ${oldStatus} → cancelled`);
        
        // Send cancellation notification to user
        try {
          await NotificationService.createNotification({
            user: booking.user._id,
            type: 'booking',
            title: 'Booking Cancelled - Payment Not Completed',
            message: `Your booking for ${booking.home.title} has been automatically cancelled because payment was not completed within 24 hours. Please make a new booking when you're ready to complete payment.`,
            booking: booking._id
          });
          console.log(`✅ Cancellation notification sent to user ${booking.user._id}`);
        } catch (notificationError) {
          console.error(`❌ Error sending cancellation notification:`, notificationError.message);
        }
        
        // Send notification to host about cancelled booking
        try {
          await NotificationService.createNotification({
            user: booking.home.owner._id,
            type: 'booking',
            title: 'Booking Cancelled - Payment Not Completed',
            message: `A booking for ${booking.home.title} has been automatically cancelled because the guest did not complete payment within 24 hours. The dates are now available for other guests.`,
            booking: booking._id
          });
          console.log(`✅ Cancellation notification sent to host ${booking.home.owner._id}`);
        } catch (notificationError) {
          console.error(`❌ Error sending host cancellation notification:`, notificationError.message);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error cancelling overdue booking ${booking._id}:`, error.message);
      }
    }
    
    console.log(`\n📊 Overdue Payment Cleanup Summary:`);
    console.log(`  - Total Overdue: ${overdueBookings.length}`);
    console.log(`  - Cancelled: ${cancelledCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
    return { cancelled: cancelledCount, errors: errorCount };
    
  } catch (error) {
    console.error('❌ Error in overdue payment cleanup:', error);
    return { cancelled: 0, errors: 0 };
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
  updateBookingStatuses,
  cancelOverduePendingPayments
};
