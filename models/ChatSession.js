const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  personality: { type: String, required: true },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema); 