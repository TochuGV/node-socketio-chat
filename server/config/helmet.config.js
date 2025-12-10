import helmet from 'helmet';

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.socket.io", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://placehold.co", "https://cdnjs.cloudflare.com"],
      mediaSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "https://node-socketio-chat-aaw8.onrender.com", "wss://node-socketio-chat-aaw8.onrender.com", "https://cdn.socket.io"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export default helmetConfig;