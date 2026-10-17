
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const eventsRouter = require('./routes/events');
const settingsRouter = require('./routes/settings');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/safenana';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://safe-nana-frontend.vercel.app'
  ]
}));
app.use(express.json());

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
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive WhatsApp webhook events
app.post('/webhook/whatsapp', (req, res) => {
  if (req.body.object === 'whatsapp_business_account') {
    for (const entry of req.body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};

        for (const message of value.messages || []) {
          console.log('WhatsApp incoming message:', {
            from: message.from,
            type: message.type,
            id: message.id
          });
        }

        for (const status of value.statuses || []) {
          console.log('WhatsApp status:', {
            id: status.id,
            status: status.status,
            recipient: status.recipient_id
          });
        }
      }
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(404);
});

// Protected WhatsApp test endpoint
app.post('/api/whatsapp/test', async (req, res) => {
  try {
    const suppliedSecret = req.get('x-test-secret');

    if (
      !process.env.WHATSAPP_TEST_SECRET ||
      suppliedSecret !== process.env.WHATSAPP_TEST_SECRET
    ) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const settings = await Settings.findOne();
    const to = (
      settings?.familyContactPhone ||
      settings?.familyWhatsApp ||
      ''
    ).replace(/\D/g, '');

    if (!to) {
      return res.status(400).json({
        error: 'Set the family contact phone number in SafeNana settings first.'
      });
    }

    if (
      !process.env.WHATSAPP_ACCESS_TOKEN ||
      !process.env.WHATSAPP_PHONE_NUMBER_ID
    ) {
      return res.status(500).json({
        error: 'WhatsApp API environment variables are missing.'
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/v26.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: 'hello_world',
            language: { code: 'en_US' }
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      return res.status(response.status).json({
        error: 'WhatsApp API request failed.',
        details: result
      });
    }

    return res.json({
      success: true,
      message: 'WhatsApp API accepted the test message.',
      result
    });
  } catch (err) {
    console.error('WhatsApp test error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SafeNana API is running 🌿'
  });
});

// Start server after attempting database connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`SafeNana API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    app.listen(PORT, () => {
      console.log(`SafeNana API running on port ${PORT} (no DB)`);
    });
  });
