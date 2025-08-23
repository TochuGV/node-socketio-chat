import Message from '../models/message.js';

let connectedUsers = 0;

export default (io) => {
  io.on('connection', async (socket) => {
    connectedUsers++;
    console.log(`A user connected. Total connected: ${connectedUsers}`);
    io.emit('user count', connectedUsers);

    try {
      const lastMessages = await Message.find().sort({ timestamp: 1 }).limit(50);
      socket.emit('chat history', lastMessages.map(msg => ({
        username: msg.username,
        message: msg.message || null,
        audio: msg.audio ? msg.audio.toString('base64') : null,
        audioType: msg.audioType || null,
        timestamp: msg.timestamp
      })));
    } catch (error) {
      console.error('Error fetching chat history:', error);
    };

    socket.on('chat message', async (msg) => {
      console.log('Message: ' + msg.message);
      try {
        const newMessage = new Message({
          username: socket.id,
          message: msg.message || null,
          audio: msg.audio ? Buffer.from(msg.audio, 'base64') : null,
          audioType: msg.audioType || null,
        });
        await newMessage.save();
        console.log(newMessage.username);

        io.emit('chat message', {
          username: newMessage.username,
          message: newMessage.message,
          audio: newMessage.audio ? newMessage.audio.toString('base64') : null,
          audioType: newMessage.audioType,
          timestamp: newMessage.timestamp,
        });
      } catch (error) {
        console.error('Error saving message: ', error);
      };
    });

    socket.on('disconnect', () => {
      connectedUsers--;
      console.log(`A user disconnected. Total connected: ${connectedUsers}`);
      io.emit('user count', connectedUsers);
    });
  });
};