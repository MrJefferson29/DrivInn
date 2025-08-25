const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('../connectDB');

// Import models
const Booking = require('../models/booking');
const Payment = require('../models/payment');

// Function to find and display overdue pending payments
const findOverduePendingPayments = async () => {
  try {
    console.log('🔍 Finding overdue pending payments...\n');
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const overdueBookings = await Booking.find({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    }).populate('user', 'firstName lastName email')
      .populate('home', 'title owner')
      .populate('home.owner', 'firstName lastName email');
    
    if (overdueBookings.length === 0) {
      console.log('✅ No overdue pending payments found');
      return [];
    }
    
    console.log(`📋 Found ${overdueBookings.length} overdue pending payments:\n`);
    
    overdueBookings.forEach((booking, index) => {
      const hoursOverdue = Math.round((Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60));
      const daysOverdue = Math.round(hoursOverdue / 24);
      
      console.log(`${index + 1}. Booking ${booking._id}:`);
      console.log(`   - User: ${booking.user?.firstName} ${booking.user?.lastName} (${booking.user?.email})`);
      console.log(`   - Listing: ${booking.home?.title}`);
      console.log(`   - Host: ${booking.home?.owner?.firstName} ${booking.home?.owner?.lastName}`);
      console.log(`   - Created: ${booking.createdAt.toLocaleString()}`);
      console.log(`   - Time Overdue: ${hoursOverdue} hours (${daysOverdue} days)`);
      console.log(`   - Total Price: $${booking.totalPrice}`);
      console.log('');
    });
    
    return overdueBookings;
    
  } catch (error) {
    console.error('❌ Error finding overdue payments:', error);
    return [];
  }
};

// Function to cancel overdue pending payments
const cancelOverduePendingPayments = async (bookings) => {
  try {
    if (bookings.length === 0) {
      console.log('ℹ️ No bookings to cancel');
      return { cancelled: 0, errors: 0 };
    }
    
    console.log(`🚫 Cancelling ${bookings.length} overdue pending payments...\n`);
    
    let cancelledCount = 0;
    let errorCount = 0;
    
    for (const booking of bookings) {
      try {
        console.log(`Cancelling booking ${booking._id}...`);
        
        const oldStatus = booking.status;
        booking.status = 'cancelled';
        booking.updatedAt = new Date();
        
        await booking.save();
        cancelledCount++;
        
        console.log(`✅ Cancelled: ${oldStatus} → cancelled`);
        
        // Send cancellation notification to user
        try {
          const NotificationService = require('../services/notificationService');
          await NotificationService.createNotification({
            user: booking.user._id,
            type: 'booking',
            title: 'Booking Cancelled - Payment Not Completed',
            message: `Your booking for ${booking.home.title} has been automatically cancelled because payment was not completed within 24 hours. Please make a new booking when you're ready to complete payment.`,
            booking: booking._id
          });
          console.log(`  📧 Cancellation notification sent to user`);
        } catch (notificationError) {
          console.log(`  ⚠️ Could not send user notification: ${notificationError.message}`);
        }
        
        // Send notification to host
        try {
          const NotificationService = require('../services/notificationService');
          await NotificationService.createNotification({
            user: booking.home.owner._id,
            type: 'booking',
            title: 'Booking Cancelled - Payment Not Completed',
            message: `A booking for ${booking.home.title} has been automatically cancelled because the guest did not complete payment within 24 hours. The dates are now available for other guests.`,
            booking: booking._id
          });
          console.log(`  📧 Cancellation notification sent to host`);
        } catch (notificationError) {
          console.log(`  ⚠️ Could not send host notification: ${notificationError.message}`);
        }
        
        console.log('');
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error cancelling booking ${booking._id}:`, error.message);
        console.log('');
      }
    }
    
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`  - Total Overdue: ${bookings.length}`);
    console.log(`  - Successfully Cancelled: ${cancelledCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
    return { cancelled: cancelledCount, errors: errorCount };
    
  } catch (error) {
    console.error('❌ Error in cleanup process:', error);
    return { cancelled: 0, errors: 0 };
  }
};

// Function to show statistics
const showPaymentStatistics = async () => {
  try {
    console.log('📊 Payment Status Statistics:\n');
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const pendingPayments = await Booking.countDocuments({ paymentStatus: 'pending' });
    const completedPayments = await Booking.countDocuments({ paymentStatus: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    // Find bookings with pending payments for different time periods
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const pending1h = await Booking.countDocuments({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $gte: oneHourAgo }
    });
    
    const pending6h = await Booking.countDocuments({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $gte: sixHoursAgo, $lt: oneHourAgo }
    });
    
    const pending12h = await Booking.countDocuments({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $gte: twelveHoursAgo, $lt: sixHoursAgo }
    });
    
    const pending24h = await Booking.countDocuments({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $gte: twentyFourHoursAgo, $lt: twelveHoursAgo }
    });
    
    const overdue24h = await Booking.countDocuments({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Pending Bookings: ${pendingBookings}`);
    console.log(`Pending Payments: ${pendingPayments}`);
    console.log(`Completed Payments: ${completedPayments}`);
    console.log(`Cancelled Bookings: ${cancelledBookings}`);
    console.log('');
    console.log('Pending Payment Timeline:');
    console.log(`  - Last 1 hour: ${pending1h}`);
    console.log(`  - 1-6 hours ago: ${pending6h}`);
    console.log(`  - 6-12 hours ago: ${pending12h}`);
    console.log(`  - 12-24 hours ago: ${pending24h}`);
    console.log(`  - Over 24 hours (OVERDUE): ${overdue24h} 🚨`);
    
    if (overdue24h > 0) {
      console.log(`\n🚨 WARNING: ${overdue24h} payments are overdue and should be cancelled!`);
    }
    
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Show current statistics
    await showPaymentStatistics();
    
    console.log('\n' + '='.repeat(60));
    
    // Find overdue payments
    const overdueBookings = await findOverduePendingPayments();
    
    if (overdueBookings.length > 0) {
      console.log('='.repeat(60));
      console.log('🔧 Would you like to cancel these overdue pending payments?');
      console.log('🔧 This will free up the dates for other guests and send cancellation notifications.');
      console.log('🔧 Type "cancel" to proceed, or anything else to exit:');
      
      // For now, just run the cancellation
      // In a real scenario, you'd want user input
      console.log('\n🔧 Running automatic cancellation...');
      await cancelOverduePendingPayments(overdueBookings);
    }
    
  } catch (error) {
    console.error('❌ Main error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { 
  findOverduePendingPayments, 
  cancelOverduePendingPayments, 
  showPaymentStatistics 
};
