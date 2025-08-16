const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Listing being reviewed
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  
  // Booking associated with this review
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // Host of the listing
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Overall rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number between 1 and 5'
    }
  },
  
  // Detailed ratings for different aspects
  detailedRatings: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    checkIn: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    location: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  
  // Review title
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Review content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Review status
  status: {
    type: String,
    enum: ['pending', 'published', 'hidden', 'flagged'],
    default: 'published'
  },
  
  // Review helpfulness tracking
  helpfulCount: {
    type: Number,
    default: 0
  },
  
  // Users who found this review helpful
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Host response to the review
  hostResponse: {
    content: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    respondedAt: {
      type: Date
    }
  },
  
  // Review moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String,
    trim: true
  },
  
  // Metadata
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ host: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

// Virtual for average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = Object.values(this.detailedRatings);
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Pre-save middleware to update updatedAt
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get average rating for a listing
reviewSchema.statics.getAverageRating = async function(listingId) {
  const result = await this.aggregate([
    { $match: { listing: listingId, status: 'published' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        averageCleanliness: { $avg: '$detailedRatings.cleanliness' },
        averageCommunication: { $avg: '$detailedRatings.communication' },
        averageCheckIn: { $avg: '$detailedRatings.checkIn' },
        averageAccuracy: { $avg: '$detailedRatings.accuracy' },
        averageLocation: { $avg: '$detailedRatings.location' },
        averageValue: { $avg: '$detailedRatings.value' }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      averageCleanliness: 0,
      averageCommunication: 0,
      averageCheckIn: 0,
      averageAccuracy: 0,
      averageLocation: 0,
      averageValue: 0
    };
  }
  
  return result[0];
};

// Static method to get average ratings for multiple listings efficiently
reviewSchema.statics.getAverageRatingsForListings = async function(listingIds) {
  const result = await this.aggregate([
    { $match: { listing: { $in: listingIds }, status: 'published' } },
    {
      $group: {
        _id: '$listing',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        averageCleanliness: { $avg: '$detailedRatings.cleanliness' },
        averageCommunication: { $avg: '$detailedRatings.communication' },
        averageCheckIn: { $avg: '$detailedRatings.checkIn' },
        averageAccuracy: { $avg: '$detailedRatings.accuracy' },
        averageLocation: { $avg: '$detailedRatings.location' },
        averageValue: { $avg: '$detailedRatings.value' }
      }
    }
  ]);
  
  // Create a map for easy lookup
  const ratingsMap = {};
  result.forEach(item => {
    ratingsMap[item._id.toString()] = {
      averageRating: item.averageRating,
      totalReviews: item.totalReviews,
      averageCleanliness: item.averageCleanliness,
      averageCommunication: item.averageCommunication,
      averageCheckIn: item.averageCheckIn,
      averageAccuracy: item.averageAccuracy,
      averageLocation: item.averageLocation,
      averageValue: item.averageValue
    };
  });
  
  // Return default values for listings without reviews
  return listingIds.map(id => {
    const idStr = id.toString();
    return ratingsMap[idStr] || {
      averageRating: 0,
      totalReviews: 0,
      averageCleanliness: 0,
      averageCommunication: 0,
      averageCheckIn: 0,
      averageAccuracy: 0,
      averageLocation: 0,
      averageValue: 0
    };
  });
};

// Instance method to check if user can edit review
reviewSchema.methods.canEdit = function(userId) {
  return this.user.toString() === userId.toString() && this.status === 'published';
};

// Instance method to check if user can respond (host only)
reviewSchema.methods.canRespond = function(userId) {
  return this.host.toString() === userId.toString() && !this.hostResponse.content;
};

module.exports = mongoose.model('Review', reviewSchema);