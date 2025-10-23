import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

export const initSocket = () => {
  return io();
};

export const onConnect = (socket, callback) => {
  socket.on('connect', () => {
    callback(socket.id);
  });
};

export const onChatHistory = (socket, callback) => {
  socket.on('chat history', (messages) => {
    callback(messages);
  });
};

export const onChatMessage = (socket, callback) => {
  socket.on('chat message', (msgObj) => {
    callback(msgObj);
  });
};

export const onUserCount = (socket, callback) => {
  socket.on('user count', (count) => {
    callback(count);
  });
};

export const registerUsername = (socket, username) => {
  socket.emit('register username', username);
};

export const sendTextMessage = (socket, username, message) => {
  socket.emit('chat message', {
    username,
    message,
    audio: null,
    audioType: null,
  });
};

export const sendAudioMessage = (socket, username, audio, audioType) => {
  socket.emit('chat message', {
    username,
    message: null,
    audio,
    audioType,
  });
};

export const toggleOnlineVisibility = (socket, showOnline) => {
  socket.emit("toggle online visibility", showOnline);
};