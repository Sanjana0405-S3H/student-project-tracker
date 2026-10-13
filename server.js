// Make sure this is near the top of your server.js (before your routes)
app.use(express.static('public'));
import express from 'express';
import { createApp } from './project-api.js';
import { db } from './database.js';
const app = express();
app.use(createApp(db));
export default app;
app.get('/', (req, res) => {
  res.send('Student Project Tracker is live!');
});
