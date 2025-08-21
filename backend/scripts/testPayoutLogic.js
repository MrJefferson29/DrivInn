const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const Payment = require('../models/payment');
const Booking = require('../models/booking');

// Test function to verify payout logic
const testPayoutLogic = async () => {
  try {
    console.log('🧪 Testing payout logic for different booking statuses...\n');
    
    // Find all payments that are completed but not yet paid out
    const paymentsToProcess = await Payment.find({
      status: 'completed',
      payoutStatus: 'pending'
    }).populate('booking');
    
    if (paymentsToProcess.length === 0) {
      console.log('⚠️ No payments found for testing');
      return;
    }
    
    console.log(`📋 Found ${paymentsToProcess.length} payments ready for payout testing:\n`);
    
    let eligibleCount = 0;
    let ineligibleCount = 0;
    
    for (const payment of paymentsToProcess) {
      const booking = payment.booking;
      if (!booking) {
        console.log(`⚠️ No booking found for payment ${payment._id}`);
        continue;
      }
      
      console.log(`📖 Payment ${payment._id}:`);
      console.log(`  - Booking ID: ${booking._id}`);
      console.log(`  - Booking Status: ${booking.status}`);
      console.log(`  - Payment Status: ${payment.status}`);
      console.log(`  - Payout Status: ${payment.payoutStatus}`);
      console.log(`  - Amount: $${payment.amount}`);
      
      // Test the payout eligibility logic
      if (booking.status === 'checked_in' || booking.status === 'completed') {
        console.log(`  ✅ ELIGIBLE for payout - status is ${booking.status}`);
        eligibleCount++;
      } else {
        console.log(`  ❌ NOT ELIGIBLE for payout - status is ${booking.status}`);
        console.log(`     Must be 'checked_in' or 'completed'`);
        ineligibleCount++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('📊 Summary:');
    console.log(`  - Total Payments: ${paymentsToProcess.length}`);
    console.log(`  - Eligible for Payout: ${eligibleCount}`);
    console.log(`  - Not Eligible: ${ineligibleCount}`);
    
    if (eligibleCount > 0) {
      console.log(`\n🎉 ${eligibleCount} payments are ready for payout processing!`);
    }
    
    // Show breakdown by status
    const statusBreakdown = {};
    paymentsToProcess.forEach(payment => {
      if (payment.booking) {
        const status = payment.booking.status;
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      }
    });
    
    console.log('\n📈 Status Breakdown:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      const eligible = (status === 'checked_in' || status === 'completed') ? '✅' : '❌';
      console.log(`  - ${status}: ${count} payments ${eligible}`);
    });
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
};

// Run the test
const runTest = async () => {
  try {
    console.log('🚀 Starting payout logic test...\n');
    await testPayoutLogic();
  } catch (error) {
    console.error('❌ Error running test:', error);
  } finally {
    console.log('\n✅ Test completed');
    process.exit(0);
  }
};

runTest();
