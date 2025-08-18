const mongoose = require('mongoose');
require('dotenv').config();

// Import the sync function
const { syncBookingPayoutStatuses } = require('../services/delayedPayoutProcessor');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting payout status synchronization script...');
    
    // Connect to database
    await connectDB();
    
    // Run the synchronization
    const result = await syncBookingPayoutStatuses();
    
    console.log('✅ Synchronization completed successfully!');
    console.log(`📊 Results: ${result.syncedCount} bookings synced, ${result.errorCount} errors`);
    
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
