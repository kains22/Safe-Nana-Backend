
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const eventsRouter = require('./routes/events');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/safenana';

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://safe-nana-frontend.vercel.app'
    ]
  })
);

app.use(express.json());

// Existing API routes
app.use('/api/events', eventsRouter);
app.use('/api/settings', settingsRouter);

// WhatsApp webhook verification
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (
    mode === 'subscribe' &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    console.log('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SafeNana API is running 🌿'
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 SafeNana API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Starting server without database (using in-memory mock data)...');

    app.listen(PORT, () => {
      console.log(`🚀 SafeNana API running on port ${PORT} (no DB)`);
    });
  });
