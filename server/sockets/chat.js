import Message from '../models/message.model.js';

const userSessions = new Map();

export default (io) => {
  io.on('connection', async (socket) => {
    socket.showOnline = true;
    console.log(`A user connected. Socket ID: ${socket.id}`);
    updateVisibleUsers(io);

    socket.on('register username', (data) => {
      if (typeof data === 'object' && data.userId) {
        socket.userId = data.userId;
        socket.username = data.username;

        if (userSessions.has(socket.userId)) {
          const oldSocketId = userSessions.get(socket.userId);
          io.to(oldSocketId).emit('force disconnect', {
            reason: 'New session started in another tab/window'
          });

          const oldSocket = io.sockets.sockets.get(oldSocketId);
          if (oldSocket) {
            oldSocket.disconnect(true);
            console.log(`Force disconnected duplicate session for user: ${socket.userId}`);
          };
        };
        userSessions.set(socket.userId, socket.id);
      } else {
        socket.username = data;
      };
      console.log(`User ${socket.id} registered. ID: ${socket.userId || 'N/A'}, Username: ${socket.username}`);
    });

    try {
      const lastMessages = (await Message.find().sort({ timestamp: -1 }).limit(100)).reverse();
      socket.emit('chat history', lastMessages.map(msg => ({
        userId: msg.userId,
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
      const clientUserId = msg.userId;
      const clientUsername = msg.username;
      if (!clientUserId || !clientUsername) {
        console.error('Received message without username, dropping message: ', msg);
        return;
      };

      console.log(`Message from ${clientUsername} (${clientUserId}): ` + msg.message);
      
      try {
        const newMessage = new Message({
          userId: clientUserId,
          username: clientUsername,
          message: msg.message || null,
          audio: msg.audio ? Buffer.from(msg.audio, 'base64') : null,
          audioType: msg.audioType || null,
        });
        await newMessage.save();
        console.log(newMessage.username);

        io.emit('chat message', {
          userId: newMessage.userId,
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
      if (socket.userId && userSessions.get(socket.userId) === socket.id) userSessions.delete(socket.userId);
      updateVisibleUsers(io);
    });
  });
};

const updateVisibleUsers = (io) => {
  const visibleCount = Array.from(io.sockets.sockets.values()).filter(s => s.showOnline).length;
  io.emit('user count', visibleCount);
};