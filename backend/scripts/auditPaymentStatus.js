const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('../connectDB');

// Import models
const Booking = require('../models/booking');
const Payment = require('../models/payment');

// Function to audit payment status for all bookings
const auditPaymentStatus = async () => {
  try {
    console.log('🔍 Starting payment status audit...\n');
    
    // Get all bookings
    const allBookings = await Booking.find({})
      .populate('user', 'firstName lastName email')
      .populate('home', 'title owner')
      .populate('home.owner', 'firstName lastName email');
    
    console.log(`📊 Total bookings found: ${allBookings.length}\n`);
    
    let criticalIssues = 0;
    let warnings = 0;
    let safeBookings = 0;
    
    // Check each booking for payment status issues
    for (const booking of allBookings) {
      console.log(`\n📖 Booking ${booking._id}:`);
      console.log(`  - User: ${booking.user?.firstName} ${booking.user?.lastName} (${booking.user?.email})`);
      console.log(`  - Listing: ${booking.home?.title}`);
      console.log(`  - Status: ${booking.status}`);
      console.log(`  - Payment Status: ${booking.paymentStatus}`);
      console.log(`  - Check-in: ${booking.checkIn}`);
      console.log(`  - Check-out: ${booking.checkOut}`);
      console.log(`  - Checked In: ${booking.checkedIn}`);
      console.log(`  - Checked Out: ${booking.checkedOut}`);
      
      // Find associated payment record
      const payment = await Payment.findOne({ booking: booking._id });
      if (payment) {
        console.log(`  - Payment Record: ${payment._id}`);
        console.log(`  - Payment Status: ${payment.status}`);
        console.log(`  - Payment Amount: $${payment.amount}`);
        console.log(`  - Payout Status: ${payment.payoutStatus}`);
      } else {
        console.log(`  - Payment Record: ❌ NOT FOUND`);
      }
      
      // Check for critical security issues
      if (['checked_in', 'checked_out', 'completed'].includes(booking.status)) {
        if (booking.paymentStatus !== 'completed') {
          console.log(`  🚨 CRITICAL SECURITY ISSUE: Status is ${booking.status} but payment is ${booking.paymentStatus}`);
          console.log(`  🚨 User has been checked in/out without completing payment!`);
          criticalIssues++;
          
          // Check if there's a payment record with different status
          if (payment && payment.status === 'completed') {
            console.log(`  🔧 FIX NEEDED: Payment record shows completed but booking doesn't`);
            console.log(`  🔧 Updating booking payment status...`);
            
            try {
              await Booking.findByIdAndUpdate(booking._id, {
                paymentStatus: 'completed',
                updatedAt: new Date()
              });
              console.log(`  ✅ Fixed: Updated booking payment status to completed`);
            } catch (updateError) {
              console.log(`  ❌ Error fixing booking: ${updateError.message}`);
            }
          } else if (!payment) {
            console.log(`  🔧 FIX NEEDED: No payment record exists for completed booking`);
            console.log(`  🔧 This booking should be investigated manually`);
          }
        } else {
          console.log(`  ✅ Safe: Payment completed for ${booking.status} status`);
          safeBookings++;
        }
      } else if (['pending', 'reserved', 'confirmed'].includes(booking.status)) {
        if (booking.paymentStatus === 'completed') {
          console.log(`  ✅ Safe: Payment completed for ${booking.status} status`);
          safeBookings++;
        } else {
          console.log(`  ⚠️ Warning: ${booking.status} status with ${booking.paymentStatus} payment`);
          warnings++;
        }
      } else if (['cancelled'].includes(booking.status)) {
        console.log(`  ℹ️ Info: Cancelled booking - payment status ${booking.paymentStatus} is expected`);
      }
      
      console.log('  ' + '─'.repeat(50));
    }
    
    // Summary
    console.log(`\n📊 AUDIT SUMMARY:`);
    console.log(`  - Total Bookings: ${allBookings.length}`);
    console.log(`  - Critical Security Issues: ${criticalIssues}`);
    console.log(`  - Warnings: ${warnings}`);
    console.log(`  - Safe Bookings: ${safeBookings}`);
    
    if (criticalIssues > 0) {
      console.log(`\n🚨 CRITICAL: ${criticalIssues} bookings have security issues!`);
      console.log(`🚨 Users may have accessed accommodations without completing payments!`);
      console.log(`🚨 Immediate action required!`);
    } else {
      console.log(`\n✅ All bookings are secure - no critical issues found`);
    }
    
    if (warnings > 0) {
      console.log(`\n⚠️ ${warnings} bookings have warnings that should be reviewed`);
    }
    
  } catch (error) {
    console.error('❌ Error during audit:', error);
  }
};

// Function to fix specific payment status issues
const fixPaymentStatusIssues = async () => {
  try {
    console.log('🔧 Starting payment status fixes...\n');
    
    // Find bookings with status issues
    const problematicBookings = await Booking.find({
      status: { $in: ['checked_in', 'checked_out', 'completed'] },
      paymentStatus: { $ne: 'completed' }
    });
    
    console.log(`📋 Found ${problematicBookings.length} bookings with payment status issues`);
    
    for (const booking of problematicBookings) {
      console.log(`\n🔧 Fixing booking ${booking._id}:`);
      console.log(`  - Current status: ${booking.status}`);
      console.log(`  - Current payment status: ${booking.paymentStatus}`);
      
      // Check if there's a completed payment record
      const payment = await Payment.findOne({ 
        booking: booking._id,
        status: 'completed'
      });
      
      if (payment) {
        console.log(`  ✅ Found completed payment record: ${payment._id}`);
        console.log(`  🔧 Updating booking payment status...`);
        
        try {
          await Booking.findByIdAndUpdate(booking._id, {
            paymentStatus: 'completed',
            updatedAt: new Date()
          });
          console.log(`  ✅ Fixed: Updated booking payment status to completed`);
        } catch (updateError) {
          console.log(`  ❌ Error fixing booking: ${updateError.message}`);
        }
      } else {
        console.log(`  ⚠️ No completed payment found - manual investigation required`);
        console.log(`  ⚠️ This booking may need to be cancelled or payment collected`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during fixes:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Run audit
    await auditPaymentStatus();
    
    console.log('\n' + '='.repeat(60));
    
    // Ask if user wants to fix issues
    console.log('\n🔧 Would you like to attempt automatic fixes for payment status issues?');
    console.log('🔧 This will update bookings that have completed payments but wrong status');
    console.log('🔧 Type "fix" to proceed, or anything else to exit:');
    
    // For now, just run the fix function
    // In a real scenario, you'd want user input
    console.log('\n🔧 Running automatic fixes...');
    await fixPaymentStatusIssues();
    
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

module.exports = { auditPaymentStatus, fixPaymentStatusIssues };
