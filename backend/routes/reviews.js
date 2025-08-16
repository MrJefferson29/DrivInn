const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { verifyToken } = require('../middleware/auth');

// All review routes require authentication
router.use(verifyToken);

// Create a new review
router.post('/', reviewsController.createReview);

// Get reviews for a specific listing
router.get('/listing/:listingId', reviewsController.getListingReviews);

// Get reviews by a specific user
router.get('/user/:userId', reviewsController.getUserReviews);
router.get('/user', reviewsController.getUserReviews);

// Update a review (only by the author)
router.put('/:reviewId', reviewsController.updateReview);

// Delete a review (only by the author)
router.delete('/:reviewId', reviewsController.deleteReview);

// Add host response to a review
router.post('/:reviewId/response', reviewsController.addHostResponse);

// Mark review as helpful/unhelpful
router.post('/:reviewId/helpful', reviewsController.markReviewHelpful);

module.exports = router; 