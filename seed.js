require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Settings = require('./models/Settings');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const NAME = process.env.DEMO_ELDER_NAME || 'Margaret';
const FAMILY_NAME = 'Sarah (Daughter)';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Time at a given hour of day, N days ago (never in the future)
const at = (daysAgo, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d > new Date() ? new Date(Date.now() - HOUR) : d;
};

const buildEvents = () => {
  const checkin = (daysAgo, hour, minute) => ({
    type: 'checkin',
    elderlyName: NAME,
    details: `${NAME} confirmed they are okay today.`,
    timestamp: at(daysAgo, hour, minute)
  });
  const suspicious = (daysAgo, hour, senderType, label) => ({
    type: 'suspicious_message',
    elderlyName: NAME,
    senderType,
    details: `${NAME} reported a suspicious message from ${label}.`,
    timestamp: at(daysAgo, hour, 20)
  });

  return [
    checkin(0, 8, 42),                         // today
    checkin(1, 9, 5),
    suspicious(1, 14, 'unknown_number', 'an unknown number'),
    checkin(2, 8, 55),
    {
      type: 'help_request',
      elderlyName: NAME,
      details: `${NAME} requested help.`,
      timestamp: at(2, 16, 10)
    },
    {
      type: 'message_sent',
      elderlyName: NAME,
      details: `Family sent a message to ${NAME}: "Hi ${NAME}! Hope you're having a lovely day. Call us anytime! ❤️"`,
      timestamp: at(2, 16, 25)
    },
    checkin(3, 9, 30),
    suspicious(3, 11, 'whatsapp_forward', 'a WhatsApp forward'),
    // day 4: deliberately no check-in, to show a missed day
    checkin(5, 8, 48),
    checkin(6, 9, 12)
  ];
};

const run = async () => {
  if (!MONGO_URI) throw new Error('Set MONGO_URI in your environment.');

  await mongoose.connect(MONGO_URI);
  const dbName = mongoose.connection.name;

  // Safety guard: never wipe a real database
  if (!/demo/i.test(dbName) && !process.argv.includes('--force')) {
    throw new Error(
      `Refusing to wipe "${dbName}". Demo database names must contain "demo". ` +
      `Use --force only if you are sure.`
    );
  }

  await Event.deleteMany({});
  await Settings.deleteMany({});

  await Settings.create({
    elderlyName: NAME,
    familyWhatsApp: '+44 7700 900123',   // UK drama/test number range
    familyContactName: FAMILY_NAME,
    familyContactPhone: '+44 7700 900123',
    checkinReminderTime: '09:00'
  });

  const events = buildEvents();
  await Event.insertMany(events);
  console.log(`✅ Demo data reset in "${dbName}": ${events.length} events for ${NAME}.`);

  await mongoose.disconnect();
};

run().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});