import express from 'express';
import logger from 'morgan';
import path from 'path';
import passport from './config/passport.config.js';
import authRoutes from './routes/auth.route.js';
import sessionConfig from './config/session.config.js';
import { generalLimiter, authLimiter } from './middlewares/rate-limit.middleware.js';

const app = express();

app.set('trust proxy', 1);

app.use(logger('dev'));

app.use(generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(sessionConfig)

app.use(passport.initialize());
app.use(passport.session()); // Soporte para sesiones persistentes

app.use(express.static(path.join(process.cwd(), 'client'),{
  etag: false,
  lastModified: false,
  maxAge: 0,
}));

app.use('/auth', authLimiter, authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

export default app;