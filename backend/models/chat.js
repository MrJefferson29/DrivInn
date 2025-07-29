const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'location'], default: 'text' },
  text: { type: String },
  imageUrl: { type: String },
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const chatRoomSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // guest and host
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  ChatRoom: mongoose.model('ChatRoom', chatRoomSchema),
  Message: mongoose.model('Message', messageSchema)
}; 