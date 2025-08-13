import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  message: { type: String },
  audio: { type: Buffer },
  audioType: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;