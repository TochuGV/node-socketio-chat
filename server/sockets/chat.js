import Message from '../models/message.js';

let connectedUsers = 0;

export default (io) => {
  io.on('connection', async (socket) => {
    socket.showOnline = true;
    console.log(`A user connected. Socket ID: ${socket.id}`);
    updateVisibleUsers(io);

    socket.on('register username', (username) => {
      socket.username = username;
      console.log(`User ${socket.id} registered as: ${username}`);
    })

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
      const clientUsername = msg.username;
      if (!clientUsername) {
        console.error('Received message without username, dropping message: ', msg);
        return;
      };

      console.log(`Message from ${clientUsername}: ` + msg.message);
      try {
        const newMessage = new Message({
          username: clientUsername,
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

    socket.on('toggle online visibility', (showOnline) => {
      socket.showOnline = !!showOnline;
      console.log(`User ${socket.username || socket.id} set showOnline = ${socket.showOnline}`);
      updateVisibleUsers(io);
    });

    socket.on('disconnect', () => {
      console.log(`A user disconnected. Socket ID: ${socket.id} (Username: ${socket.username || 'N/A'})`);
      updateVisibleUsers(io);
    });
  });
};

const updateVisibleUsers = (io) => {
  const visibleCount = Array.from(io.sockets.sockets.values()).filter(s => s.showOnline).length;
  io.emit('user count', visibleCount);
};