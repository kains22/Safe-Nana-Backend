require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Settings = require('./models/Settings');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/safenana';

const seedData = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear existing data
  await Event.deleteMany({});
  await Settings.deleteMany({});

  // Create default settings
  const settings = new Settings({
    elderlyName: 'Nana',
    familyWhatsApp: '+44 7700 900123',
    familyContactName: 'Sarah (Daughter)',
    familyContactPhone: '+44 7700 900123',
    checkinReminderTime: '09:00'
  });
  await settings.save();

  // Create realistic mock events spanning the last 7 days
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const events = [
    // Today
    {
      type: 'checkin',
      elderlyName: 'Nana',
      details: 'Nana confirmed they are okay today.',
      timestamp: new Date(now - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    // Yesterday
    {
      type: 'suspicious_message',
      elderlyName: 'Nana',
      senderType: 'unknown_number',
      details: 'Nana received a suspicious message from an unknown number.',
      timestamp: new Date(now - dayMs - 3 * 60 * 60 * 1000)
    },
    {
      type: 'checkin',
      elderlyName: 'Nana',
      details: 'Nana confirmed they are okay today.',
      timestamp: new Date(now - dayMs - 5 * 60 * 60 * 1000)
    },
    // 2 days ago
    {
      type: 'help_request',
      elderlyName: 'Nana',
      details: 'Nana requested help.',
      timestamp: new Date(now - 2 * dayMs - 1 * 60 * 60 * 1000)
    },
    {
      type: 'message_sent',
      elderlyName: 'Nana',
      details: 'Family sent a message to Nana: "Hi Mum! Hope you\'re having a lovely day. Call us anytime! ❤️"',
      timestamp: new Date(now - 2 * dayMs - 0.5 * 60 * 60 * 1000)
    },
    {
      type: 'checkin',
      elderlyName: 'Nana',
      details: 'Nana confirmed they are okay today.',
      timestamp: new Date(now - 2 * dayMs - 6 * 60 * 60 * 1000)
    },
    // 3 days ago
    {
      type: 'suspicious_message',
      elderlyName: 'Nana',
      senderType: 'whatsapp_forward',
      details: 'Nana received a suspicious message from a WhatsApp forward.',
      timestamp: new Date(now - 3 * dayMs - 4 * 60 * 60 * 1000)
    },
    {
      type: 'checkin',
      elderlyName: 'Nana',
      details: 'Nana confirmed they are okay today.',
      timestamp: new Date(now - 3 * dayMs - 7 * 60 * 60 * 1000)
    },
    // 4 days ago - no checkin
    {
      type: 'suspicious_message',
      elderlyName: 'Nana',
      senderType: 'someone_i_know',
      details: 'Nana received a suspicious message from someone they know.',
      timestamp: new Date(now - 4 * dayMs - 2 * 60 * 60 * 1000)
    },
    // 5 days ago
    {
      type: 'checkin',
      elderlyName: 'Nana',
      details: 'Nana confirmed they are okay today.',
      timestamp: new Date(now - 5 * dayMs - 8 * 60 * 60 * 1000)
    },
    // 6 days ago
    {
      type: 'checkin',
      elderlyName: 'Nana',
      details: 'Nana confirmed they are okay today.',
      timestamp: new Date(now - 6 * dayMs - 9 * 60 * 60 * 1000)
    }
  ];

  await Event.insertMany(events);
  console.log(`✅ Seeded ${events.length} events and 1 settings document.`);
  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
