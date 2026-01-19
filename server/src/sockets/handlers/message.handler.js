import Message from '../../models/message.model.js';
import sessionStore from '../store/session.store.js';
import { validateMessage, validateAudio } from '../../utils/validation.util.js';

export default (io, socket) => {
  const sendHistory = async () => {
    try {
      const lastMessages = (await Message.find().sort({ timestamp: -1 }).limit(100)).reverse();
      const historyPayload = lastMessages.map(msg => ({
        userId: msg.userId,
        username: msg.username,
        message: msg.message || null,
        audio: msg.audio ? msg.audio.toString('base64') : null,
        audioType: msg.audioType || null,
        timestamp: msg.timestamp
      }));
      socket.emit('chat history', historyPayload);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      socket.emit('error', { message: 'Failed to load chat history.' });
    };
  };

  const handleChatMessage = async (msg) => {
    const userId = socket.userId;
    const username = socket.username;

    if (!userId || !username) {
      console.error('User not identified, dropping message');
      socket.emit('error', { message: 'User not authenticated'});
      return;
    };

    const rateLimit = sessionStore.checkRateLimit(userId);

    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for user: ${username}`);
      socket.emit('rate limit error', {
        message: 'Message rate limit exceeded. Please wait a moment.',
        retryAfter: rateLimit.retryAfter
      });
      return;
    };
    
    let validatedMessage = null;
    let validatedAudio = null;
    let validatedAudioType = null;

    if (msg.message) {
      const messageValidation = validateMessage(msg.message);
      if (!messageValidation.valid) {
        socket.emit('validation error', { message: messageValidation.error });
        return;
      };
      validatedMessage = messageValidation.value;
    } else if (msg.audio && msg.audioType) {
      const audioValidation = validateAudio(msg.audio, msg.audioType);
      if (!audioValidation.valid) {
        socket.emit('validation error', { message: audioValidation.error });
        return;
      };
      validatedAudio = msg.audio;
      validatedAudioType = msg.audioType;
    } else {
      socket.emit('validation error', { message: 'Message must contain text or audio.' });
      return;
    };

    try {
      const newMessage = new Message({
        userId: userId,
        username: username,
        message: validatedMessage,
        audio: validatedAudio ? Buffer.from(validatedAudio, 'base64') : null,
        audioType: validatedAudioType || null
      });
      await newMessage.save();
      console.log(`Message from ${username}: ${validatedMessage ? 'Text' : 'Audio'}`);
      
      io.emit('chat message', {
        userId: newMessage.userId,
        username: newMessage.username,
        message: newMessage.message,
        audio: newMessage.audio ? newMessage.audio.toString('base64') : null,
        audioType: newMessage.audioType || null,
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message.' });
    };
  };

  socket.on('chat message', handleChatMessage);
  sendHistory();
};