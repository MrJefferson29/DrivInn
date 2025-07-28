const User = require('../models/user');
const Listing = require('../models/listing');
const NotificationService = require('../services/notificationService');

// Like a listing
exports.likeListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id;

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if user already liked this listing
        const user = await User.findById(userId);
        if (user.likedListings.includes(listingId)) {
            return res.status(400).json({ message: 'Listing already liked' });
        }

        // Add listing to user's liked listings
        await User.findByIdAndUpdate(userId, {
            $push: { likedListings: listingId }
        });

        // Increment listing's like count
        await Listing.findByIdAndUpdate(listingId, {
            $inc: { likeCount: 1 }
        });

        // Create notification for listing owner
        try {
            await NotificationService.createLikeNotification(listingId, userId);
        } catch (notificationError) {
            console.error('Error creating like notification:', notificationError);
            // Don't fail the like if notification fails
        }

        res.json({ message: 'Listing liked successfully' });
    } catch (error) {
        console.error('Error liking listing:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Unlike a listing
exports.unlikeListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id;

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if user has liked this listing
        const user = await User.findById(userId);
        if (!user.likedListings.includes(listingId)) {
            return res.status(400).json({ message: 'Listing not liked' });
        }

        // Remove listing from user's liked listings
        await User.findByIdAndUpdate(userId, {
            $pull: { likedListings: listingId }
        });

        // Decrement listing's like count
        await Listing.findByIdAndUpdate(listingId, {
            $inc: { likeCount: -1 }
        });

        res.json({ message: 'Listing unliked successfully' });
    } catch (error) {
        console.error('Error unliking listing:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's liked listings
exports.getLikedListings = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: 'likedListings',
            populate: {
                path: 'owner',
                select: 'firstName lastName email'
            }
        });

        res.json(user.likedListings);
    } catch (error) {
        console.error('Error getting liked listings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check if user has liked a specific listing
exports.checkIfLiked = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const isLiked = user.likedListings.includes(listingId);

        res.json({ isLiked });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 