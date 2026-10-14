import express from 'express';
import { createApp } from './project-api.js';
import { db } from './database.js';

const app = express();

// Global process error handlers for uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

app.use(express.json());
app.use(express.static('public'));
app.use(createApp(db));

// Root route fallback
app.get('/', (req, res) => {
  res.send('Student Project Tracker is live!');
});

const PORT = process.env.PORT || 3000;

// Conditional app.listen for local development (skipped on Vercel serverless functions)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;