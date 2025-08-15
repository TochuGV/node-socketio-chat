import express from 'express';
import logger from 'morgan';
import path from 'path';

const app = express();

app.use(logger('dev'));

app.use(express.static(path.join(process.cwd(), 'client'),{
  etag: false,
  lastModified: false,
  maxAge: 0,
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client', 'index.html'));
});

export default app;