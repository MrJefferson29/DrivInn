const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// All bookings routes require authentication
router.get('/', verifyToken, bookingsController.getUserBookings);
router.post('/', verifyToken, bookingsController.createBooking);
router.delete('/:id', verifyToken, bookingsController.cancelBooking);

// Payment verification route
router.get('/verify-payment/:sessionId', verifyToken, bookingsController.verifyPayment);

// Admin route to update all booking statuses
router.put('/update-statuses', verifyToken, authorizeRole('admin'), bookingsController.updateAllBookingStatuses);

// Temporary route to update booking status (for testing)
router.put('/update-status', verifyToken, bookingsController.updateBookingStatus);

module.exports = router;