import Message from '../models/message.model.js';
import User from '../models/user.model.js';

const userSessions = new Map();
const messageRateLimits = new Map();

const MESSAGE_LIMIT = 10;
const TIME_WINDOW = 60 * 1000;

const checkMessageRateLimit = (userId) => {
  const now = Date.now();
  const userLimit = messageRateLimits.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    messageRateLimits.set(userId, {
      count: 1,
      resetTime: now + TIME_WINDOW
    });
    return true;
  };

  if (userLimit.count >= MESSAGE_LIMIT) return false;
  userLimit.count++;
  return true;
};

export default (io) => {
  io.on('connection', async (socket) => {
    const session = socket.request.session;

    let userId;
    let username;
    let isGuest = false;

    socket.showOnline = true;
    console.log(`A user connected. Socket ID: ${socket.id}`);

    socket.on('register username', (data) => {
      if (session?.passport?.user) {
        console.log('User already authenticated, ignoring "register username"');
        return;
      };

      if (typeof data === 'object' && data.userId && data.username) {
        if (!isValidUUID(data.userId)) {
          socket.emit('error', { message: 'Invalid user ID format' });
          socket.disconnect();
          return;
        };

        session.guestUserId = data.userId;
        session.guestUsername = data.username;
        session.save();

        userId = data.userId;
        username = data.username;
        isGuest = true;

        checkAndHandleDuplicateSession(io, userId, socket);
        console.log(`Guest user registered: ${username} (${userId})`);
      } else if (typeof data === 'string') {
        session.guestUsername = data;
        session.save();
        username = data;
        isGuest = true;
        console.log(`Guest user registered (legacy): ${username}`);
      };

    });

    if (session?.passport?.user) {
      try {
        const user = await User.findById(session.passport.user);
        if (user) {
          userId = user._id.toString();
          username = user.username;
          socket.userId = userId;
          socket.username = username;

          checkAndHandleDuplicateSession(io, userId, socket);
          console.log(`Authenticated user connected: ${username} (${userId})`);
        };
      } catch (error) {
        console.error('Error fetching authenticated user:', error);
      };
    } else if (session?.guestUserId) {
      userId = session.guestUserId;
      username = session.guestUsername;
      socket.userId = userId;
      socket.username = username;
      isGuest = true;

      checkAndHandleDuplicateSession(io, userId, socket);
      console.log(`Guest user reconnected: ${username} (${userId})`);
    };

    updateVisibleUsers(io);

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
      let messageUserId;
      let messageUsername;

      if (session?.passport?.user) {
        // Usuario autenticado OAuth
        try {
          const user = await User.findById(session.passport.user);
          if (!user) {
            console.error('Authenticated user not found in database');
            return;
          };
          messageUserId = user._id.toString();
          messageUsername = user.username;
        } catch (error) {
          console.error('Error fetching user for message:', error);
          return;
        };
      } else if (session?.guestUserId && session?.guestUsername) {
        // Usuario invitado
        messageUserId = session.guestUserId;
        messageUsername = session.guestUsername;
      } else {
        console.error('User not identified, dropping message');
        socket.emit('error', { message: 'Not authenticated' });
        return;
      };

      if (!checkMessageRateLimit(messageUserId)) {
        console.warn(`Rate limit exceeded for user: ${messageUsername} (${messageUserId})`);
        socket.emit('rate limit error', { 
          message: 'Message rate limit exceeded. Please wait a moment.',
          retryAfter: Math.ceil((messageRateLimits.get(messageUserId).resetTime - Date.now()) / 1000)
        });
        return;
      };

      if (msg.userId || msg.username) {
        console.warn(`⚠️ Client attempted to send userId/username (IGNORED):`, {
          attempted: { userId: msg.userId, username: msg.username },
          actual: { userId: messageUserId, username: messageUsername }
        });
      };

      console.log(`Message from ${messageUsername} (${messageUserId}): ${msg.message || '[audio]'}`);      
      
      try {
        const newMessage = new Message({
          userId: messageUserId,
          username: messageUsername,
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
        console.error('Error saving message:', error);
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

// Función para verificar y manejar sesiones duplicadas
const checkAndHandleDuplicateSession = (io, userId, newSocket) => {
  if (userSessions.has(userId)) {
    const oldSocketId = userSessions.get(userId);
    io.to(oldSocketId).emit('force disconnect', {
      reason: 'New session started in another tab/window'
    });

    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
      oldSocket.disconnect(true);
      console.log(`Force disconnected duplicate session for user: ${userId}`);
    };
  };
  userSessions.set(userId, newSocket.id);
  newSocket.userId = userId;
};

// Validar UUID v4
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const updateVisibleUsers = (io) => {
  const visibleCount = Array.from(io.sockets.sockets.values()).filter(s => s.showOnline).length;
  io.emit('user count', visibleCount);
};