import registerActivityHandler from './handlers/activity.handler.js';
import registerUserHandler from './handlers/user.handler.js';
import registerMessageHandler from './handlers/message.handler.js';

export default (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.showOnline = true;

    const activityServices = registerActivityHandler(io, socket);
    registerUserHandler(io, socket, activityServices);
    registerMessageHandler(io, socket);

    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.id}:`, error);
    });
  });
};