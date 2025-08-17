const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
require('dotenv').config({ path: '../.env' });

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Test function to demonstrate automatic status updates
const testBookingStatusUpdate = async () => {
  try {
    console.log('🧪 Testing automatic booking status updates...\n');
    
    // Find a confirmed booking
    const booking = await Booking.findOne({ status: 'confirmed' }).populate('home');
    
    if (!booking) {
      console.log('⚠️ No confirmed bookings found to test');
      return;
    }
    
    console.log('📋 Test Booking Details:');
    console.log(`  - Booking ID: ${booking._id}`);
    console.log(`  - Current Status: ${booking.status}`);
    console.log(`  - Check-in Date: ${booking.checkIn}`);
    console.log(`  - Check-out Date: ${booking.checkOut}`);
    console.log(`  - Listing Check-in Time: ${booking.home.checkIn}`);
    console.log(`  - Listing Check-out Time: ${booking.home.checkOut}`);
    console.log(`  - Already Checked In: ${booking.checkedIn}`);
    console.log(`  - Already Checked Out: ${booking.checkedOut}\n`);
    
    // Test the status update method
    console.log('🔄 Testing status update method...');
    const oldStatus = booking.status;
    const newStatus = await booking.updateStatusBasedOnTime();
    
    console.log(`  - Old Status: ${oldStatus}`);
    console.log(`  - New Status: ${newStatus}`);
    console.log(`  - Status Changed: ${oldStatus !== newStatus ? 'Yes' : 'No'}`);
    
    if (oldStatus !== newStatus) {
      console.log('  - Saving updated booking...');
      await booking.save();
      console.log('  ✅ Booking saved with new status');
    }
    
    console.log('\n📊 Current Time Analysis:');
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    
    // Parse listing times
    const [checkInHour, checkInMinute] = booking.home.checkIn.split(':').map(Number);
    const [checkOutHour, checkOutMinute] = booking.home.checkOut.split(':').map(Number);
    
    const checkInDateTime = new Date(checkInDate);
    const checkOutDateTime = new Date(checkOutDate);
    
    checkInDateTime.setHours(checkInHour, checkInMinute, 0, 0);
    checkOutDateTime.setHours(checkOutHour, checkOutMinute, 0, 0);
    
    console.log(`  - Current Time: ${now.toISOString()}`);
    console.log(`  - Check-in DateTime: ${checkInDateTime.toISOString()}`);
    console.log(`  - Check-out DateTime: ${checkOutDateTime.toISOString()}`);
    
    const timeToCheckIn = checkInDateTime.getTime() - now.getTime();
    const timeToCheckOut = checkOutDateTime.getTime() - now.getTime();
    
    if (timeToCheckIn > 0) {
      const hours = Math.floor(timeToCheckIn / (1000 * 60 * 60));
      const minutes = Math.floor((timeToCheckIn % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`  - Time until Check-in: ${hours}h ${minutes}m`);
    } else {
      const hours = Math.floor(Math.abs(timeToCheckIn) / (1000 * 60 * 60));
      const minutes = Math.floor((Math.abs(timeToCheckIn) % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`  - Check-in was ${hours}h ${minutes}m ago`);
    }
    
    if (timeToCheckOut > 0) {
      const hours = Math.floor(timeToCheckOut / (1000 * 60 * 60));
      const minutes = Math.floor((timeToCheckOut % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`  - Time until Check-out: ${hours}h ${minutes}m`);
    } else {
      const hours = Math.floor(Math.abs(timeToCheckOut) / (1000 * 60 * 60));
      const minutes = Math.floor((Math.abs(timeToCheckOut) % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`  - Check-out was ${hours}h ${minutes}m ago`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testBookingStatusUpdate()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
