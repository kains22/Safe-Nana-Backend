const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

const FIELDS = [
  'elderlyName',
  'familyWhatsApp',
  'familyContactName',
  'familyContactPhone',
  'checkinReminderTime'
];

const fail = (res, err) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};

// GET settings (creates defaults if none exist yet)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (err) { fail(res, err); }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    // Only accept plain text values
    for (const field of FIELDS) {
      const value = req.body[field];
      if (value !== undefined && typeof value !== 'string') {
        return res.status(400).json({ message: `${field} must be text.` });
      }
    }

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    for (const field of FIELDS) {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'One of the values is not valid. Check the name length and the reminder time (like 09:00).' });
    }
    fail(res, err);
  }
});

module.exports = router;