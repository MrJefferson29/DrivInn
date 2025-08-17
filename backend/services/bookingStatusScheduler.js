const cron = require('node-cron');
const Booking = require('../models/booking');
const NotificationService = require('./notificationService');

// Update booking statuses based on check-in/check-out times
const updateBookingStatuses = async () => {
  try {
    console.log('🔄 Starting automatic booking status updates...');
    
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
          
          // Update payout status if check-in occurred
          if (newStatus === 'checked_in' && oldStatus === 'confirmed') {
            await updatePayoutStatus(booking);
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
    });
    
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
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error updating past booking ${booking._id}:`, error.message);
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
        user: booking.user,
        type: 'booking_checkin_ready',
        title: 'Check-in Time!',
        message: `Your booking is ready for check-in. You can now access your accommodation.`,
        relatedId: booking._id,
        relatedType: 'booking'
      });
      
      // Notify host that guest is checking in
      await NotificationService.createNotification({
        user: booking.home.owner,
        type: 'guest_checking_in',
        title: 'Guest Checking In',
        message: `A guest is checking in to your property.`,
        relatedId: booking._id,
        relatedType: 'booking'
      });
      
    } else if (newStatus === 'checked_out') {
      // Notify guest that check-out is complete
      await NotificationService.createNotification({
        user: booking.user,
        type: 'booking_checkout_complete',
        title: 'Check-out Complete',
        message: `You have successfully checked out. Thank you for staying with us!`,
        relatedId: booking._id,
        relatedType: 'booking'
      });
      
      // Notify host that guest has checked out
      await NotificationService.createNotification({
        user: booking.home.owner,
        type: 'guest_checked_out',
        title: 'Guest Checked Out',
        message: `A guest has checked out of your property.`,
        relatedId: booking._id,
        relatedType: 'booking'
      });
      
    } else if (newStatus === 'completed') {
      // Notify guest that they can now leave a review
      await NotificationService.createNotification({
        user: booking.user,
        type: 'review_reminder',
        title: 'Leave a Review',
        message: `Your stay is complete! Please leave a review to help other travelers.`,
        relatedId: booking._id,
        relatedType: 'booking'
      });
    }
  } catch (error) {
    console.error('❌ Error sending status change notifications:', error);
  }
};

// Update payout status when check-in occurs
const updatePayoutStatus = async (booking) => {
  try {
    // Find the payment record for this booking
    const Payment = require('../models/payment');
    const payment = await Payment.findOne({ 
      booking: booking._id,
      status: 'completed'
    });
    
    if (payment && payment.payoutStatus === 'pending') {
      // Update payout status to processing since guest has checked in
      payment.payoutStatus = 'processing';
      payment.payoutProcessingAt = new Date();
      await payment.save();
      
      console.log(`💳 Updated payout status to processing for booking ${booking._id}`);
    }
  } catch (error) {
    console.error('❌ Error updating payout status:', error);
  }
};

// Start the booking status scheduler
const startBookingStatusScheduler = () => {
  console.log('⏰ Starting booking status scheduler...');
  
  // Run every 5 minutes for more accurate check-in/check-out timing
  cron.schedule('*/5 * * * *', async () => {
    await updateBookingStatuses();
  });
  
  // Also run every hour to catch any missed updates
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Hourly booking status check...');
    await updateBookingStatuses();
  });
  
  console.log('✅ Booking status scheduler started (runs every 5 minutes + hourly)');
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
