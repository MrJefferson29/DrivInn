const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// All bookings routes require authentication
router.get('/', verifyToken, bookingsController.getUserBookings);
router.post('/', verifyToken, bookingsController.createBooking);
router.delete('/:id', verifyToken, bookingsController.cancelBooking);

// Admin route to update all booking statuses
router.put('/update-statuses', verifyToken, authorizeRole('admin'), bookingsController.updateAllBookingStatuses);

module.exports = router;