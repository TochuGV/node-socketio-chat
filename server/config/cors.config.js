import { NODE_ENV } from './env.config.js';

const allowedOrigins = NODE_ENV === 'production'
  ? [
    'https://node-socketio-chat-aaw8.onrender.com/'
  ] : [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    };
  },
  credentials: true,
  optionsSuccessStatus: 200
};

export default corsOptions;