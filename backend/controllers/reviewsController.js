const Review = require('../models/review');

exports.addReview = async (req, res) => {
  try {
    const review = new Review({ ...req.body, listing: req.params.listingId });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Error adding review', error: err.message });
  }
};

exports.getReviewsForListing = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 