const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
require('dotenv').config({ path: '../.env' });

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Test the time logic
const testTimeLogic = async () => {
  try {
    console.log('🧪 Testing time logic for check-in/check-out...\n');
    
    const now = new Date();
    console.log(`⏰ Current time: ${now.toISOString()}`);
    console.log(`⏰ Current time (local): ${now.toString()}`);
    
    // Find a confirmed booking
    const booking = await Booking.findOne({ status: 'confirmed' }).populate('home');
    
    if (!booking) {
      console.log('⚠️ No confirmed bookings found to test');
      return;
    }
    
    console.log(`\n📖 Test Booking Details:`);
    console.log(`  - Booking ID: ${booking._id}`);
    console.log(`  - Current Status: ${booking.status}`);
    console.log(`  - Check-in Date: ${booking.checkIn}`);
    console.log(`  - Check-out Date: ${booking.checkOut}`);
    console.log(`  - Already Checked In: ${booking.checkedIn}`);
    console.log(`  - Already Checked Out: ${booking.checkedOut}`);
    
    if (booking.home) {
      console.log(`  - Listing Check-in Time: ${booking.home.checkIn || 'Not set'}`);
      console.log(`  - Listing Check-out Time: ${booking.home.checkOut || 'Not set'}`);
    }
    
    // The booking now stores full datetime objects (user date + host time)
    // So we can use them directly
    const checkInDateTime = new Date(booking.checkIn);
    const checkOutDateTime = new Date(booking.checkOut);
    
    console.log(`\n🔍 Time Analysis:`);
    console.log(`  - Booking check-in datetime: ${checkInDateTime.toISOString()}`);
    console.log(`  - Booking check-out datetime: ${checkOutDateTime.toISOString()}`);
    console.log(`  - Host check-in time: ${booking.home?.checkIn || '14:00 (default)'}`);
    console.log(`  - Host check-out time: ${booking.home?.checkOut || '11:00 (default)'}`);
    
    console.log(`  - Check-in datetime: ${checkInDateTime.toISOString()}`);
    console.log(`  - Check-out datetime: ${checkOutDateTime.toISOString()}`);
    
    // Check windows
    const checkInWindowStart = new Date(checkInDateTime.getTime() - 60 * 60 * 1000);
    const checkInWindowEnd = new Date(checkInDateTime.getTime() + 60 * 60 * 1000);
    
    console.log(`  - Check-in window: ${checkInWindowStart.toISOString()} to ${checkInWindowEnd.toISOString()}`);
    
    // Check if current time is within check-in window
    const isCheckInTime = now >= checkInWindowStart && now <= checkInWindowEnd;
    console.log(`  - Is check-in time? ${isCheckInTime}`);
    
    if (isCheckInTime) {
      console.log(`  ✅ Should trigger check-in!`);
    } else {
      console.log(`  ❌ Not check-in time yet`);
      const timeUntilCheckIn = checkInWindowStart.getTime() - now.getTime();
      const hoursUntilCheckIn = Math.floor(timeUntilCheckIn / (1000 * 60 * 60));
      const minutesUntilCheckIn = Math.floor((timeUntilCheckIn % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`  ⏳ Time until check-in: ${hoursUntilCheckIn}h ${minutesUntilCheckIn}m`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testTimeLogic()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
