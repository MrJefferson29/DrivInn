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

// Capture payment route (called after successful checkout)
router.post('/capture-payment/:sessionId', verifyToken, bookingsController.capturePayment);

// Cancel payment route (called when user cancels checkout)
router.post('/cancel-payment/:sessionId', verifyToken, bookingsController.cancelPayment);

// Admin route to update all booking statuses
router.put('/update-statuses', verifyToken, authorizeRole('admin'), bookingsController.updateAllBookingStatuses);

// Temporary route to update booking status (for testing)
router.put('/update-status', verifyToken, bookingsController.updateBookingStatus);

// Payout routes
router.post('/:bookingId/process-payout', verifyToken, authorizeRole('admin'), bookingsController.processAutomaticPayout);
router.get('/pending-payouts', verifyToken, authorizeRole('admin'), bookingsController.getPendingPayouts);

module.exports = router;