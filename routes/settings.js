const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    const { elderlyName, familyWhatsApp, familyContactName, familyContactPhone, checkinReminderTime } = req.body;
    if (elderlyName !== undefined) settings.elderlyName = elderlyName;
    if (familyWhatsApp !== undefined) settings.familyWhatsApp = familyWhatsApp;
    if (familyContactName !== undefined) settings.familyContactName = familyContactName;
    if (familyContactPhone !== undefined) settings.familyContactPhone = familyContactPhone;
    if (checkinReminderTime !== undefined) settings.checkinReminderTime = checkinReminderTime;
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
