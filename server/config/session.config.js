import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MONGODB_URI, SESSION_SECRET } from './env.config.js';

const sessionConfig = session({
  secret: SESSION_SECRET, // Frase secreta para firmar la cookie de sesión
  resave: false, // No volver a guardar la sesión si no ha habido cambios
  saveUninitialized: false, // No guardar sesiones no inicializadas
  store: MongoStore.create({ mongoUrl: MONGODB_URI }), // Almacenar sesiones en MongoDB
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // La sesión dura un día
    httpOnly: true, // La cookie no es accesible desde JavaScript del lado del cliente
    secure: false // Cambiar a 'true' si se usa HTTPS
  }
});

export default sessionConfig;