const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to check if the user is accessing their own profile or is an admin
const isSelfOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.params.id === req.user._id.toString()) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. You can only manage your own profile.' });
};

// Routes
router.get('/', verifyToken, requireAdmin, userController.getAllUsers);
router.get('/me', verifyToken, userController.getMyProfile);
router.get('/:id', verifyToken, requireAdmin, userController.getUserById);
router.put('/:id', verifyToken, isSelfOrAdmin, userController.updateUser);
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);
router.put('/:id/role', verifyToken, requireAdmin, userController.changeUserRole);
router.put('/:id/permissions', verifyToken, requireAdmin, userController.updateUserPermissions);
router.put('/:id/profile-image', verifyToken, isSelfOrAdmin, upload.single('image'), userController.uploadProfileImage);
router.get('/:id/notifications', verifyToken, isSelfOrAdmin, userController.getUserNotifications);

// Host profile routes
router.get('/host/profile', verifyToken, userController.getHostProfile);
router.put('/host/profile', verifyToken, userController.updateHostProfile);

// User statistics route
router.get('/stats', verifyToken, userController.getUserStats);

module.exports = router; 