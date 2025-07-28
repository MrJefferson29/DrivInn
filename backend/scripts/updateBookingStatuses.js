const mongoose = require('mongoose');
const Booking = require('../models/booking');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateBookingStatuses() {
  try {
    console.log('Starting booking status update...');
    
    // Update all booking statuses
    await Booking.updateAllStatuses();
    
    console.log('Booking statuses updated successfully');
    
    // Get some stats
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Current booking status distribution:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('Error updating booking statuses:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the update
updateBookingStatuses(); 