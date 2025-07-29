const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/room', verifyToken, chatController.createOrGetRoom);
router.get('/room/:listingId', verifyToken, chatController.getRoomByListing);
router.get('/messages/:roomId', verifyToken, chatController.getMessages);
router.post('/message', verifyToken, upload.single('image'), chatController.sendMessage);
router.get('/rooms', verifyToken, chatController.getUserChatRooms);

module.exports = router; 