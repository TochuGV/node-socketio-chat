import express from 'express';
import logger from 'morgan';
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import { MONGODB_URI, SESSION_SECRET } from './config/env.js';

const app = express();

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: SESSION_SECRET, // Frase secreta para firmar la cookie de sesión
  resave: false, // No volver a guardar la sesión si no ha habido cambios
  saveUninitialized: false, // No guardar sesiones no inicializadas
  store: MongoStore.create({ mongoUrl: MONGODB_URI }), // Almacenar sesiones en MongoDB
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // La sesión dura un día
    httpOnly: true, // La cookie no es accesible desde JavaScript del lado del cliente
    secure: false // Cambiar a 'true' si se usa HTTPS
  }
}));

app.use(passport.initialize());
app.use(passport.session()); // Soporte para sesiones persistentes

app.use(express.static(path.join(process.cwd(), 'client'),{
  etag: false,
  lastModified: false,
  maxAge: 0,
}));

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

export default app;