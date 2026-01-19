import mongoose from 'mongoose';
import sanitizeInput from "../utils/security.util.js";

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true},
  username: { type: String, required: true, set: sanitizeInput },
  message: { type: String, trim: true, set: sanitizeInput },
  audio: { type: Buffer },
  audioType: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;