const User = require('../models/user');
const cloudinary = require('cloudinary').v2;
const Notification = require('../models/notification');

// Fetch all users (with pagination and search)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a particular user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a user (admin or self)
exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Never allow password update here
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get current user's profile (self)
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // If user is a host and has host profile, include it in the response
    const response = user.toObject();
    if (user.role === 'host' && user.hostProfile) {
      response.hostProfile = user.hostProfile;
    }
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Change user role (admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['guest', 'host', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error changing user role', error: err.message });
  }
};

// Add or remove permissions (admin only)
exports.updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { permissions }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error updating permissions', error: err.message });
  }
};

// Upload or update user profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    // Convert buffer to base64 for Cloudinary upload
    const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'airbnb-users',
      resource_type: 'auto',
      public_id: `user_${req.params.id}`,
      overwrite: true
    });
    // Update user profileImage
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ profileImage: user.profileImage, user });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading profile image', error: err.message });
  }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get host profile information (for hosts only)
exports.getHostProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'host') {
      return res.status(403).json({ message: 'Only hosts can access host profile information' });
    }
    
    if (!user.hostProfile) {
      return res.status(404).json({ message: 'Host profile not found. Please ensure your application has been approved.' });
    }
    
    res.json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      },
      hostProfile: user.hostProfile
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user statistics (for all users)
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let stats = {
      totalBookings: 0,
      totalListings: 0,
      totalRevenue: 0,
      totalSpent: 0,
      totalReviews: 0,
      averageRating: 0
    };
    
    try {
      // Import models dynamically to avoid circular dependencies
      const Booking = require('../models/booking');
      const Listing = require('../models/listing');
      const Review = require('../models/review');
      
      if (user.role === 'host') {
        // Get host statistics
        const [bookings, listings] = await Promise.all([
          Booking.find({ host: user._id }),
          Listing.find({ owner: user._id })
        ]);
        
        stats.totalBookings = bookings.length;
        stats.totalListings = listings.length;
        stats.totalRevenue = bookings.reduce((sum, booking) => 
          sum + (booking.totalPrice || 0), 0
        );
        
        // Get average rating from listings
        if (listings.length > 0) {
          const totalRating = listings.reduce((sum, listing) => 
            sum + (listing.averageRating || 0), 0
          );
          stats.averageRating = totalRating / listings.length;
        }
      } else if (user.role === 'guest') {
        // Get guest statistics
        const [bookings, reviews] = await Promise.all([
          Booking.find({ user: user._id }),
          Review.find({ user: user._id, status: 'published' })
        ]);
        
        stats.totalBookings = bookings.length;
        stats.totalReviews = reviews.length;
        stats.totalSpent = bookings.reduce((sum, booking) => 
          sum + (booking.totalPrice || 0), 0
        );
      }
    } catch (modelError) {
      console.error('Error loading models:', modelError);
      console.error('Model error details:', modelError.stack);
      // If models fail to load, return basic stats without the problematic data
      if (user.role === 'host') {
        stats.totalBookings = 0;
        stats.totalListings = 0;
        stats.totalRevenue = 0;
        stats.averageRating = 0;
      } else if (user.role === 'guest') {
        stats.totalBookings = 0;
        stats.totalReviews = 0;
        stats.totalSpent = 0;
      }
    }
    
    res.json(stats);
  } catch (err) {
    console.error('Error in getUserStats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update host profile information (for hosts only)
exports.updateHostProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'host') {
      return res.status(403).json({ message: 'Only hosts can update host profile information' });
    }
    
    // Only allow updating certain fields (not sensitive ones like Stripe account info)
    const allowedUpdates = {
      'hostProfile.businessName': req.body.businessName,
      'hostProfile.businessPhone': req.body.businessPhone,
      'hostProfile.propertyDescription': req.body.propertyDescription,
      'hostProfile.hostingExperience': req.body.hostingExperience
    };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      message: 'Host profile updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage
      },
      hostProfile: updatedUser.hostProfile
    });
  } catch (err) {
    res.status(400).json({ message: 'Error updating host profile', error: err.message });
  }
}; 