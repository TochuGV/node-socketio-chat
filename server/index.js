import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDatabase from './database/connection.js';
import { PORT } from './config/env.js';
import chatHandler from './sockets/chat.js';

connectDatabase();

const server = createServer(app);
const io = new Server(server);

chatHandler(io);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});