const NotificationService = require('../services/notificationService');
const Notification = require('../models/notification');

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.id })
      .populate('booking', 'startDate endDate totalPrice')
      .populate('listing', 'title images')
      .populate('hostApplication', 'status adminNote')
      .populate('relatedUser', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await NotificationService.markAsRead(notificationId);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await NotificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get unread notification count for a user
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await NotificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure user can only delete their own notifications
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    await Notification.findByIdAndDelete(notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete all notifications for a user
exports.deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only delete their own notifications
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete these notifications' });
    }
    
    await Notification.deleteMany({ user: userId });
    res.json({ message: 'All notifications deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 