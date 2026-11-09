const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Settings = require('../models/Settings');

const DEFAULT_NAME = 'Your loved one';
const SENDER_TYPES = {
  unknown_number: 'an unknown number',
  whatsapp_forward: 'a WhatsApp forward',
  someone_i_know: 'someone they know'
};

const getName = async () => {
  const settings = await Settings.findOne();
  return settings && settings.elderlyName ? settings.elderlyName : DEFAULT_NAME;
};

const fail = (res, err) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};

// GET recent events (dashboard activity feed)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 }).limit(50);
    res.json(events);
  } catch (err) { fail(res, err); }
});

// GET weekly summary
router.get('/weekly-summary', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const events = await Event.find({ timestamp: { $gte: sevenDaysAgo } });
    const checkins = events.filter(e => e.type === 'checkin').length;
    const suspicious = events.filter(e => e.type === 'suspicious_message').length;
    const helpRequests = events.filter(e => e.type === 'help_request').length;

    res.json({ checkins, suspicious, helpRequests, total: events.length });
  } catch (err) { fail(res, err); }
});

// GET suspicious message alerts (latest 100)
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Event.find({ type: 'suspicious_message' })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(alerts);
  } catch (err) { fail(res, err); }
});

// POST check-in
router.post('/checkin', async (req, res) => {
  try {
    const name = await getName();
    const event = await Event.create({
      type: 'checkin',
      elderlyName: name,
      details: `${name} confirmed they are okay today.`
    });
    res.status(201).json({ message: 'Thank you! Your check-in has been recorded.', event });
  } catch (err) { fail(res, err); }
});

// POST suspicious message report
router.post('/suspicious', async (req, res) => {
  try {
    const { senderType } = req.body;
    if (!SENDER_TYPES[senderType]) {
      return res.status(400).json({ message: 'Please choose where the message came from.' });
    }
    const name = await getName();
    const event = await Event.create({
      type: 'suspicious_message',
      elderlyName: name,
      senderType,
      details: `${name} reported a suspicious message from ${SENDER_TYPES[senderType]}.`
    });
    res.status(201).json({
      message: 'Your report has been recorded. Do not click any links, send money, or share personal details. Check with someone you trust.',
      event
    });
  } catch (err) { fail(res, err); }
});

// POST help request
router.post('/help', async (req, res) => {
  try {
    const name = await getName();
    const event = await Event.create({
      type: 'help_request',
      elderlyName: name,
      details: `${name} requested help.`
    });
    // NOTE: only say "recorded" until real notifications exist.
    // Change this wording once SMS/push alerts are working.
    res.status(201).json({
      message: 'Your help request has been recorded. If this is an emergency, call your local emergency number now.',
      event
    });
  } catch (err) { fail(res, err); }
});

// POST send message to elderly user
router.post('/message', async (req, res) => {
  try {
    const text = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!text || text.length > 200) {
      return res.status(400).json({ message: 'Message must be 1 to 200 characters.' });
    }
    const name = await getName();
    const event = await Event.create({
      type: 'message_sent',
      elderlyName: name,
      details: `Family sent a message to ${name}: "${text}"`
    });
    res.status(201).json({ message: 'Message sent.', event });
  } catch (err) { fail(res, err); }
});

module.exports = router;