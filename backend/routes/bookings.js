const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// All bookings routes require authentication
router.get('/', verifyToken, bookingsController.getUserBookings);
router.get('/host', verifyToken, bookingsController.getHostBookings);
router.post('/', verifyToken, bookingsController.createBooking);
router.delete('/:id', verifyToken, bookingsController.cancelBooking);

// Date availability check route
router.get('/check-availability/:listingId/:startDate/:endDate', verifyToken, bookingsController.checkDateAvailability);

// Payment verification route
router.get('/verify-payment/:sessionId', verifyToken, bookingsController.verifyPayment);

// Cancel payment route (called when user cancels checkout)
router.post('/cancel-payment/:sessionId', verifyToken, bookingsController.cancelPayment);

// Admin route to update all booking statuses
router.put('/update-statuses', verifyToken, authorizeRole('admin'), bookingsController.updateAllBookingStatuses);

// Manual trigger for booking status updates (for testing)
router.post('/update-statuses', verifyToken, async (req, res) => {
  try {
    const { updateBookingStatuses } = require('../services/bookingStatusScheduler');
    await updateBookingStatuses();
    
    res.json({ 
      message: 'Booking status update triggered successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error triggering booking status update:', error);
    res.status(500).json({ 
      message: 'Error triggering status update', 
      error: error.message 
    });
  }
});

// Check current booking statuses (for debugging)
router.get('/check-statuses', verifyToken, async (req, res) => {
  try {
    const Booking = require('../models/booking');
    const now = new Date();
    
    // Get all bookings with their current statuses
    const allBookings = await Booking.find({}).populate('home', 'checkIn checkOut');
    
    const statusSummary = {
      total: allBookings.length,
      byStatus: {},
      pastBookings: [],
      currentBookings: [],
      futureBookings: []
    };
    
    allBookings.forEach(booking => {
      // Count by status
      statusSummary.byStatus[booking.status] = (statusSummary.byStatus[booking.status] || 0) + 1;
      
      const checkOutDate = new Date(booking.checkOut);
      
      if (checkOutDate < now) {
        statusSummary.pastBookings.push({
          id: booking._id,
          status: booking.status,
          checkOut: booking.checkOut,
          shouldBeCompleted: booking.status !== 'completed' && booking.status !== 'cancelled'
        });
      } else if (new Date(booking.checkIn) > now) {
        statusSummary.futureBookings.push({
          id: booking._id,
          status: booking.status,
          checkIn: booking.checkIn
        });
      } else {
        statusSummary.currentBookings.push({
          id: booking._id,
          status: booking.status,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        });
      }
    });
    
    res.json({
      message: 'Current booking statuses retrieved',
      summary: statusSummary,
      timestamp: now
    });
    
  } catch (error) {
    console.error('Error checking booking statuses:', error);
    res.status(500).json({ 
      message: 'Error checking statuses', 
      error: error.message 
    });
  }
});

// Debug endpoint to check booking statuses without authentication
router.get('/debug-statuses', async (req, res) => {
  try {
    const Booking = require('../models/booking');
    const now = new Date();
    
    // Get all bookings with their current statuses
    const allBookings = await Booking.find({}).populate('home', 'checkIn checkOut');
    
    const statusSummary = {
      total: allBookings.length,
      byStatus: {},
      pastBookings: [],
      currentBookings: [],
      futureBookings: []
    };
    
    allBookings.forEach(booking => {
      // Count by status
      statusSummary.byStatus[booking.status] = (statusSummary.byStatus[booking.status] || 0) + 1;
      
      const checkOutDate = new Date(booking.checkOut);
      
      if (checkOutDate < now) {
        statusSummary.pastBookings.push({
          id: booking._id,
          status: booking.status,
          checkOut: booking.checkOut,
          shouldBeCompleted: booking.status !== 'completed' && booking.status !== 'cancelled'
        });
      } else if (new Date(booking.checkIn) > now) {
        statusSummary.futureBookings.push({
          id: booking._id,
          status: booking.status,
          checkIn: booking.checkIn
        });
      } else {
        statusSummary.currentBookings.push({
          id: booking._id,
          status: booking.status,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        });
      }
    });
    
    res.json({
      message: 'Current booking statuses retrieved (debug mode)',
      summary: statusSummary,
      timestamp: now
    });
    
  } catch (error) {
    console.error('Error checking booking statuses:', error);
    res.status(500).json({ 
      message: 'Error checking statuses', 
      error: error.message 
    });
  }
});

// Payout routes
router.get('/pending-payouts', verifyToken, authorizeRole('admin'), bookingsController.getPendingPayouts);

module.exports = router;