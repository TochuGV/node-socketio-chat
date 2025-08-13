import express from 'express';
import logger from 'morgan';
import path from 'path';

import { Server } from 'socket.io';
import { createServer } from 'http';
import { connectDatabase } from './database/connection.js';
import Message from './models/message.js';

const port = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

connectDatabase();

let connectedUsers = 0;

io.on('connection', async (socket) => {
  connectedUsers++;
  console.log(`A user connected. Total connected: ${connectedUsers}`);

  io.emit('userCount', connectedUsers);

  try {
    const lastMessages = await Message.find().sort({ timestamp: 1 }).limit(50);
    const messagesToSend = lastMessages.map(msg => ({
      username: msg.username,
      message: msg.message || null,
      audio: msg.audio ? msg.audio.toString('base64') : null,
      audioType: msg.audioType || null,
      timestamp: msg.timestamp
    }));
    socket.emit('chat history', lastMessages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
  };

  socket.on('chat message', async (msg) => {
    console.log('Message: ' + msg)

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

    //socket.broadcast.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    connectedUsers--;
    console.log(`A user disconnected. Total connected: ${connectedUsers}`);
    io.emit('userCount', connectedUsers);
  });
});

app.use(logger('dev'));

app.use(express.static(path.join(process.cwd(), 'client'),{
  etag: false,
  lastModified: false,
  maxAge: 0,
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});