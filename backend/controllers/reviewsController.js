const Review = require('../models/review');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const User = require('../models/user');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, detailedRatings, title, content } = req.body;
    
    // Validate required fields
    if (!bookingId || !rating || !detailedRatings || !title || !content) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'MISSING_FIELDS',
        details: 'bookingId, rating, detailedRatings, title, and content are required'
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('home')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
        error: 'BOOKING_NOT_FOUND'
      });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to review this booking',
        error: 'UNAUTHORIZED'
      });
    }

    // Check if booking is completed and can be reviewed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        message: 'Can only review completed bookings',
        error: 'INVALID_BOOKING_STATUS',
        details: `Booking status is ${booking.status}, must be 'completed'`
      });
    }

    // Check if review already exists
    if (booking.hasReview) {
      return res.status(400).json({
        message: 'Review already exists for this booking',
        error: 'REVIEW_ALREADY_EXISTS'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        message: 'Rating must be a whole number between 1 and 5',
        error: 'INVALID_RATING'
      });
    }

    // Validate detailed ratings
    const requiredRatings = ['cleanliness', 'communication', 'checkIn', 'accuracy', 'location', 'value'];
    for (const ratingType of requiredRatings) {
      if (!detailedRatings[ratingType] || 
          detailedRatings[ratingType] < 1 || 
          detailedRatings[ratingType] > 5 || 
          !Number.isInteger(detailedRatings[ratingType])) {
        return res.status(400).json({
          message: `Invalid ${ratingType} rating`,
          error: 'INVALID_DETAILED_RATING',
          details: `${ratingType} must be a whole number between 1 and 5`
        });
      }
    }

    // Create the review
    const review = new Review({
      user: req.user._id,
      listing: booking.home._id,
      booking: bookingId,
      host: booking.home.owner,
      rating,
      detailedRatings,
      title: title.trim(),
      content: content.trim()
    });

    await review.save();

    // Update booking to mark review as created
    await Booking.findByIdAndUpdate(bookingId, {
      hasReview: true,
      reviewId: review._id
    });

    // Update listing's average rating
    await updateListingRating(booking.home._id);

    // Populate user info for response
    await review.populate('user', 'firstName lastName profileImage');

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review._id,
        rating: review.rating,
        detailedRatings: review.detailedRatings,
        title: review.title,
        content: review.content,
        user: {
          id: review.user._id,
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          profileImage: review.user.profileImage
        },
        createdAt: review.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      message: 'Failed to create review',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Get reviews for a listing
exports.getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found',
        error: 'LISTING_NOT_FOUND'
      });
    }

    // Build query
    const query = { listing: listingId, status: 'published' };
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'highest':
        sortOptions = { rating: -1 };
        break;
      case 'lowest':
        sortOptions = { rating: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Execute query with pagination
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName profileImage')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Review.countDocuments(query);

    // Get average rating for the listing
    const averageRating = await Review.getAverageRating(listingId);

    res.json({
      reviews: reviews.map(review => ({
        id: review._id,
        rating: review.rating,
        detailedRatings: review.detailedRatings,
        title: review.title,
        content: review.content,
        user: {
          id: review.user._id,
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          profileImage: review.user.profileImage
        },
        hostResponse: review.hostResponse.content ? {
          content: review.hostResponse.content,
          respondedAt: review.hostResponse.respondedAt
        } : null,
        helpfulCount: review.helpfulCount,
        createdAt: review.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      },
      summary: averageRating
    });

  } catch (error) {
    console.error('Error getting listing reviews:', error);
    res.status(500).json({
      message: 'Failed to get reviews',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.userId || req.user._id;

    const query = { user: userId, status: 'published' };
    
    const reviews = await Review.find(query)
      .populate('listing', 'title images type')
      .populate('host', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Review.countDocuments(query);

    res.json({
      reviews: reviews.map(review => ({
        id: review._id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        listing: {
          id: review.listing._id,
          title: review.listing.title,
          images: review.listing.images,
          type: review.listing.type
        },
        host: {
          id: review.host._id,
          firstName: review.host.firstName,
          lastName: review.host.lastName,
          profileImage: review.host.profileImage
        },
        createdAt: review.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      message: 'Failed to get user reviews',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, detailedRatings, title, content } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: 'REVIEW_NOT_FOUND'
      });
    }

    // Check if user can edit this review
    if (!review.canEdit(req.user._id)) {
      return res.status(403).json({
        message: 'Not authorized to edit this review',
        error: 'UNAUTHORIZED'
      });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
          message: 'Rating must be a whole number between 1 and 5',
          error: 'INVALID_RATING'
        });
      }
      review.rating = rating;
    }

    if (detailedRatings) {
      const requiredRatings = ['cleanliness', 'communication', 'checkIn', 'accuracy', 'location', 'value'];
      for (const ratingType of requiredRatings) {
        if (detailedRatings[ratingType] !== undefined) {
          if (detailedRatings[ratingType] < 1 || 
              detailedRatings[ratingType] > 5 || 
              !Number.isInteger(detailedRatings[ratingType])) {
            return res.status(400).json({
              message: `Invalid ${ratingType} rating`,
              error: 'INVALID_DETAILED_RATING'
            });
          }
          review.detailedRatings[ratingType] = detailedRatings[ratingType];
        }
      }
    }

    if (title !== undefined) {
      review.title = title.trim();
    }

    if (content !== undefined) {
      review.content = content.trim();
    }

    await review.save();

    // Update listing's average rating
    await updateListingRating(review.listing);

    res.json({
      message: 'Review updated successfully',
      review: {
        id: review._id,
        rating: review.rating,
        detailedRatings: review.detailedRatings,
        title: review.title,
        content: review.content,
        updatedAt: review.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      message: 'Failed to update review',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: 'REVIEW_NOT_FOUND'
      });
    }

    // Check if user can delete this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this review',
        error: 'UNAUTHORIZED'
      });
    }

    // Update booking to remove review reference
    await Booking.findByIdAndUpdate(review.booking, {
      hasReview: false,
      reviewId: null
    });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update listing's average rating
    await updateListingRating(review.listing);

    res.json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      message: 'Failed to delete review',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Host response to a review
exports.addHostResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: 'Response content is required',
        error: 'MISSING_CONTENT'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: 'REVIEW_NOT_FOUND'
      });
    }

    // Check if host can respond
    if (!review.canRespond(req.user._id)) {
      return res.status(403).json({
        message: 'Not authorized to respond to this review',
        error: 'UNAUTHORIZED'
      });
    }

    // Add host response
    review.hostResponse = {
      content: content.trim(),
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      message: 'Host response added successfully',
      hostResponse: {
        content: review.hostResponse.content,
        respondedAt: review.hostResponse.respondedAt
      }
    });

  } catch (error) {
    console.error('Error adding host response:', error);
    res.status(500).json({
      message: 'Failed to add host response',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Mark review as helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        error: 'REVIEW_NOT_FOUND'
      });
    }

    const userIndex = review.helpfulUsers.indexOf(userId);
    
    if (userIndex === -1) {
      // User hasn't marked as helpful yet
      review.helpfulUsers.push(userId);
      review.helpfulCount += 1;
    } else {
      // User is removing helpful mark
      review.helpfulUsers.splice(userIndex, 1);
      review.helpfulCount -= 1;
    }

    await review.save();

    res.json({
      message: 'Review helpful status updated',
      helpfulCount: review.helpfulCount,
      isHelpful: review.helpfulUsers.includes(userId)
    });

  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({
      message: 'Failed to update helpful status',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Helper function to update listing rating
async function updateListingRating(listingId) {
  try {
    const averageRating = await Review.getAverageRating(listingId);
    
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: averageRating.averageRating,
      totalReviews: averageRating.totalReviews,
      detailedRatings: {
        cleanliness: averageRating.averageCleanliness,
        communication: averageRating.averageCommunication,
        checkIn: averageRating.averageCheckIn,
        accuracy: averageRating.averageAccuracy,
        location: averageRating.averageLocation,
        value: averageRating.averageValue
      }
    });
  } catch (error) {
    console.error('Error updating listing rating:', error);
  }
}
