const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
require('dotenv').config({ path: '../.env' });

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Function to check and update all booking statuses
const checkAndUpdateAllBookings = async () => {
  try {
    console.log('🔍 Checking all booking statuses...\n');
    
    // Get all bookings
    const allBookings = await Booking.find({}).populate('home');
    
    if (allBookings.length === 0) {
      console.log('⚠️ No bookings found');
      return;
    }
    
    console.log(`📋 Found ${allBookings.length} total bookings\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const booking of allBookings) {
      try {
        console.log(`\n📖 Booking ${booking._id}:`);
        console.log(`  - Current Status: ${booking.status}`);
        console.log(`  - Check-in Date: ${booking.checkIn}`);
        console.log(`  - Check-out Date: ${booking.checkOut}`);
        console.log(`  - Already Checked In: ${booking.checkedIn}`);
        console.log(`  - Already Checked Out: ${booking.checkedOut}`);
        
        if (booking.home) {
          console.log(`  - Listing Check-in Time: ${booking.home.checkIn}`);
          console.log(`  - Listing Check-out Time: ${booking.home.checkOut}`);
        }
        
        // Check if this booking should be completed
        const now = new Date();
        const checkOutDate = new Date(booking.checkOut);
        
        // If check-out date has passed and status is not completed, mark it as completed
        if (now > checkOutDate && booking.status !== 'completed' && booking.status !== 'cancelled') {
          console.log(`  ⚠️ Check-out date has passed, should be marked as completed`);
          
          const oldStatus = booking.status;
          booking.status = 'completed';
          booking.checkedOut = true;
          booking.checkOutDate = checkOutDate;
          
          await booking.save();
          updatedCount++;
          
          console.log(`  ✅ Updated status: ${oldStatus} → completed`);
        } else if (now > checkOutDate && booking.status === 'completed') {
          console.log(`  ✅ Already marked as completed`);
        } else if (now <= checkOutDate) {
          console.log(`  ⏳ Check-out date hasn't passed yet`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error processing booking ${booking._id}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Total Bookings: ${allBookings.length}`);
    console.log(`  - Updated: ${updatedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Error in check and update process:', error);
  }
};

// Function to manually trigger status updates for specific bookings
const manuallyUpdateBookingStatuses = async () => {
  try {
    console.log('🔄 Manually triggering booking status updates...\n');
    
    const { updateBookingStatuses } = require('../services/bookingStatusScheduler');
    await updateBookingStatuses();
    
    console.log('✅ Manual status update completed');
    
  } catch (error) {
    console.error('❌ Error in manual status update:', error);
  }
};

// Run the checks
const runChecks = async () => {
  try {
    console.log('🚀 Starting booking status checks...\n');
    
    // First, manually update any statuses that should be updated
    await manuallyUpdateBookingStatuses();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Then check all bookings and update any that should be completed
    await checkAndUpdateAllBookings();
    
  } catch (error) {
    console.error('❌ Error running checks:', error);
  } finally {
    console.log('\n✅ All checks completed');
    process.exit(0);
  }
};

// Run the script
runChecks();
