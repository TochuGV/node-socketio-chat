import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

class SocketService {
  constructor() {
    this.socket = null;
  };

  init() {
    this.socket = io();
    return this.socket;
  };

  on(eventName, callback) {
    if (!this.socket) return;
    this.socket.on(eventName, callback);
  };

  emit(eventName, data) {
    if (!this.socket) return;
    this.socket.emit(eventName, data);
  };

  listeners = {
    onConnect: (callback) => this.on('connect', () => callback(this.socket.id)),
    onChatHistory: (callback) => this.on('chat history', callback),
    onChatMessage: (callback) => this.on('chat message', callback),
    onUserCount: (callback) => this.on('user count', callback),
    onForceDisconnect: (callback) => this.on('force disconnect', callback),
    onRateLimitError: (callback) => this.on('rate limit error', callback),
    onValidationError: (callback) => this.on('validation error', callback),
    onError: (callback) => this.on('error', callback),
    onUserTyping: (callback) => this.on('typing', callback),
    onUserStoppedTyping: (callback) => this.on('stop typing', callback)
  };

  emitters = {
    registerUsername: (userId, username) => this.emit('register username', { userId, username }),
    sendTextMessage: (message) => this.emit('chat message', {
      message,
      audio: null,
      audioType: null,
    }),
    sendAudioMessage: (audio, audioType) => this.emit('chat message', {
      message: null,
      audio,
      audioType,
    }),
    toggleOnlineVisibility: (showOnline) => this.emit("toggle online visibility", showOnline),
    sendTyping: () => this.emit('typing'),
    sendStopTyping: () => this.emit('stop typing'),
  };
};

const socketService = new SocketService();
export default socketService;