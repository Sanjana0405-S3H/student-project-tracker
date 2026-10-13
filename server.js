// Put this at the very top of server.js to catch hidden startup crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
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
app.use(express.json());
app.use(express.static('public'));

// Your routes here...
app.get('/', (req, res) => {
  res.send('Student Project Tracker is live!');
});
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; // (or module.exports = app if using require)