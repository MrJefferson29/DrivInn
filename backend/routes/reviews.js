const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// Public endpoint
router.get('/:listingId', reviewsController.getReviewsForListing);
// Protected endpoint
router.post('/:listingId', verifyToken, authorizeRole('guest', 'host', 'admin'), reviewsController.addReview);

module.exports = router; 