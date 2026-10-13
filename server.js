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
// Old code at the bottom of your file
const PORT = process.env.PORT || 3000;

// Only call app.listen when running locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app so Vercel's serverless environment can use it
module.exports = app;