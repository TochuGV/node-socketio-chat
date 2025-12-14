import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { validateMessage, validateUsername, validateAudio } from '../utils/validation.util.js';

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

      let proposedUserId = null;
      let proposedUsername = '';

      if (typeof data === 'object' && data !== null) {
        proposedUserId = data.userId;
        proposedUsername = data.username;
      } else if (typeof data === 'string') {
        proposedUsername = data;
      };

      const usernameValidation = validateUsername(proposedUsername);
      if (!usernameValidation.valid) {
        console.log(`Intento de registro inválido: ${proposedUsername}`);
        socket.emit('validation error', { message: usernameValidation.error });
        socket.disconnect(); // Desconectamos por seguridad
        return;
      };

      if (proposedUserId && !isValidUUID(data.userId)) {
        socket.emit('error', { message: 'Invalid user ID format' });
        socket.disconnect();
        return;
      };

      session.guestUsername = usernameValidation.value;
      if (proposedUserId) session.guestUserId = proposedUserId;
      session.save();

      username = usernameValidation.value;
      userId = proposedUserId || userId;
      isGuest = true;

      socket.username = username;
      socket.userId = userId;

      if (userId) {
        checkAndHandleDuplicateSession(io, userId, socket);
        console.log(`Guest user registered: ${username} (${userId})`);
      } else {
        console.log(`Guest user registered (no ID): ${username}`);
      };

      updateVisibleUsers(io);
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
      console.log('📥 Received chat message event'); // ← AGREGAR ESTE LOG
      console.log('📦 Message has audio:', !!msg.audio); // ← AGREGAR ESTE LOG
      console.log('📏 Audio length:', msg.audio?.length); // ← AGREGAR ESTE LOG
      
      let messageUserId;
      let messageUsername;

      if (session?.passport?.user) {
        // Usuario autenticado OAuth
        try {
          const user = await User.findById(session.passport.user);
          if (!user) {
            console.error('Authenticated user not found in database');
            socket.emit('error', { message: 'User not found' });
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
        socket.emit('validation error', { message: 'Message must contain either text or audio' });
        return;
      };

      console.log(`Message from ${messageUsername} (${messageUserId}): ${msg.message || '[audio]'}`);      
      
      try {
        const newMessage = new Message({
          userId: messageUserId,
          username: messageUsername,
          message: validatedMessage,
          audio: validatedAudio ? Buffer.from(validatedAudio, 'base64') : null,
          audioType: validatedAudioType,
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

    socket.on('typing', () => {
      // Broadcast: Avisar a todos menos al que escribe
      console.log('DEBUG TYPING:', { 
          id: socket.id, 
          username: socket.username, 
          userId: socket.userId 
      });
      socket.broadcast.emit('typing', {
        userId: socket.userId || socket.id,
        username: socket.username
      });
    });

    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        userId: socket.userId || socket.id,
      });
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