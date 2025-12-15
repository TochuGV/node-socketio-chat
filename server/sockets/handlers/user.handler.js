import User from '../../models/user.model.js';
import sessionStore from '../store/session.store.js';
import { validateUsername } from '../../utils/validation.util.js';

export default (io, socket, services) => {
  const session = socket.request.session;
  const { broadcastUserCount } = services;

  const handleDuplicateSession = (userId) => {
    if (sessionStore.hasSession(userId)) {
      const oldSocketId = sessionStore.getSession(userId);

      io.to(oldSocketId).emit('force disconnect', {
        reason: 'New session started in another tab/window.'
      });

      /*
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect(true);
        console.log(`Force disconnected duplicate session for user: ${userId}`);
      };
      */
    };

    sessionStore.saveSession(userId, socket.id);
    socket.userId = userId;
  };

  const handleRegisterUsername = (data) => {
    if (session?.passport?.user) return; // Si ya tiene sesión de Passport, se ignora el registro manual.

    let proposedUsername = '';
    let proposedUserId = null;

    if (typeof data === 'object' && data !== null) {
      proposedUserId = data.userId;
      proposedUsername = data.username;
    } else {
      proposedUsername = data;
    };

    const validation = validateUsername(proposedUsername);
    if (!validation.valid) {
      socket.emit('validation error', { message: validation.error });
      return;
    };

    const username = validation.value;
    const userId = proposedUserId || socket.id;

    session.guestUsername = username;
    if (proposedUserId) session.guestUserId = userId;
    session.save();

    socket.username = username;
    socket.userId = userId;

    handleDuplicateSession(userId);
    broadcastUserCount();
  };

  const handleDisconnect = () => {
    if (socket.userId) {
      if (sessionStore.getSession(socket.userId) === socket.id) sessionStore.removeSession(socket.userId);
    };

    broadcastUserCount();
  };

  const initializeSession = async () => {
    let userId;
    let username;

    if (session?.passport?.user) {
      try {
        const user = await User.findById(session.passport.user);
        if (user) {
          userId = user._id.toString();
          username = user.username;
          socket.userId = userId;
          socket.username = username;
          handleDuplicateSession(userId);
        };
      } catch (error) {
        console.error('Error fetching user:', error);
      };
    } else if (session?.guestUserId) {
      userId = session.guestUserId;
      username = session.guestUsername;
      socket.userId = userId;
      socket.username = username;
      handleDuplicateSession(userId);
    };

    broadcastUserCount();
  };

  initializeSession();

  socket.on('register username', handleRegisterUsername);
  socket.on('disconnect', handleDisconnect);
};