const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

// Get all notifications for a user
router.get('/user/:id', verifyToken, notificationController.getUserNotifications);

// Mark a notification as read
router.put('/:notificationId/read', verifyToken, notificationController.markAsRead);

// Mark all notifications as read for a user
router.put('/user/:userId/read-all', verifyToken, notificationController.markAllAsRead);

// Get unread notification count for a user
router.get('/user/:userId/unread-count', verifyToken, notificationController.getUnreadCount);

// Delete a notification
router.delete('/:notificationId', verifyToken, notificationController.deleteNotification);

// Delete all notifications for a user
router.delete('/user/:userId/all', verifyToken, notificationController.deleteAllNotifications);

module.exports = router; 