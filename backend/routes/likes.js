const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    likeListing,
    unlikeListing,
    getLikedListings,
    checkIfLiked
} = require('../controllers/likesController');

// Like a listing
router.post('/:listingId', verifyToken, likeListing);

// Unlike a listing
router.delete('/:listingId', verifyToken, unlikeListing);

// Get user's liked listings
router.get('/user', verifyToken, getLikedListings);

// Check if user has liked a specific listing
router.get('/:listingId/check', verifyToken, checkIfLiked);

module.exports = router; 