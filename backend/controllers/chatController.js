const { ChatRoom, Message } = require('../models/chat');
const User = require('../models/user');
const Listing = require('../models/listing');
const cloudinary = require('cloudinary').v2;

exports.createOrGetRoom = async (req, res) => {
  const { listingId, otherUserId } = req.body;
  const userId = req.user._id || req.user.id;
  let room = await ChatRoom.findOne({ listing: listingId, users: { $all: [userId, otherUserId] } });
  if (!room) {
    room = await ChatRoom.create({ listing: listingId, users: [userId, otherUserId] });
  }
  res.json(room);
};

exports.getRoomByListing = async (req, res) => {
  const { listingId } = req.params;
  const userId = req.user._id || req.user.id;
  const room = await ChatRoom.findOne({ listing: listingId, users: userId });
  res.json(room);
};

exports.getMessages = async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ chatRoom: roomId }).sort('createdAt');
  res.json(messages);
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatRoomId, type, text, lat, lng } = req.body;
    let imageUrl = null;
    if (req.file) {
      // Use buffer from memoryStorage
      const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64String);
      imageUrl = result.secure_url;
    }
    
    const messageData = {
      chatRoom: chatRoomId,
      sender: req.user._id || req.user.id,
      type,
      text,
      imageUrl
    };
    
    // Handle location messages
    if (type === 'location' && lat && lng) {
      messageData.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    
    const message = await Message.create(messageData);
    req.app.get('io').to(chatRoomId).emit('receiveMessage', message);
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

exports.getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const rooms = await ChatRoom.find({ users: userId })
      .populate('listing', 'title images')
      .populate({
        path: 'users',
        select: 'firstName lastName email profileImage',
      })
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chat rooms', error: err.message });
  }
}; 