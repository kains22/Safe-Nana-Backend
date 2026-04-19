const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Settings = require('../models/Settings');

// GET all events (for dashboard activity feed)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 }).limit(50);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all suspicious message alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Event.find({ type: 'suspicious_message' }).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST check-in (elderly user pressed "I'm Okay")
router.post('/checkin', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const name = settings ? settings.elderlyName : 'Nana';
    const event = new Event({
      type: 'checkin',
      elderlyName: name,
      details: `${name} confirmed they are okay today.`
    });
    await event.save();
    res.status(201).json({ message: `Great! Your family has been notified.`, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST suspicious message report
router.post('/suspicious', async (req, res) => {
  try {
    const { senderType } = req.body;
    const settings = await Settings.findOne();
    const name = settings ? settings.elderlyName : 'Nana';

    const senderMap = {
      unknown_number: 'an unknown number',
      whatsapp_forward: 'a WhatsApp forward',
      someone_i_know: 'someone they know'
    };

    const event = new Event({
      type: 'suspicious_message',
      elderlyName: name,
      senderType,
      details: `${name} received a suspicious message from ${senderMap[senderType] || 'unknown source'}.`
    });
    await event.save();
    res.status(201).json({ message: 'Your family has been alerted. Do not share any personal information.', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST help request
router.post('/help', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const name = settings ? settings.elderlyName : 'Nana';
    const event = new Event({
      type: 'help_request',
      elderlyName: name,
      details: `${name} requested help.`
    });
    await event.save();
    res.status(201).json({ message: 'Help is on the way!', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST send message to elderly user
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    const settings = await Settings.findOne();
    const name = settings ? settings.elderlyName : 'Nana';
    const event = new Event({
      type: 'message_sent',
      elderlyName: name,
      details: `Family sent a message to ${name}: "${message}"`
    });
    await event.save();
    res.status(201).json({ message: 'Message sent successfully!', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
