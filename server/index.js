import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDatabase from './database/connection.js';
import { PORT } from './config/env.config.js';
import chatHandler from './sockets/chat.js';
import sessionConfig from './config/session.config.js';
import corsOptions from './config/cors.config.js';

const startServer = async () => {
  await connectDatabase();

  const server = createServer(app);
  const io = new Server(server, {
    cors: corsOptions
  });

  io.engine.use(sessionConfig);

  chatHandler(io);

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();