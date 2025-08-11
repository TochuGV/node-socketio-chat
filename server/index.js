import express from 'express';
import logger from 'morgan';

import { Server } from 'socket.io';
import { createServer } from 'http';
import { connectDatabase } from './database/connection.js';
import Message from './models/message.js';

const port = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

connectDatabase();

io.on('connection', async (socket) => {
  console.log('A user connected');

  try {
    const lastMessages = await Message.find().sort({ timestamp: 1}).limit(50);
    socket.emit('chat history', lastMessages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
  };

  socket.on('chat message', async (msg) => {
    console.log('Message: ' + msg)

    try {
      const newMessage = new Message({
        username: socket.id,
        message: msg,
      });
      await newMessage.save();
      console.log(newMessage.username);

      io.emit('chat message', {
        username: newMessage.username,
        message: newMessage.message,
        timestamp: newMessage.timestamp,
      });

    } catch (error) {
      console.error('There was an error saving message: ', error);
    };

    //socket.broadcast.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.use(logger('dev'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});