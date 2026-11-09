const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  elderlyName: {
    type: String,
    default: 'Your loved one',
    trim: true,
    maxlength: 100
  },
  familyWhatsApp: {
    type: String,
    default: '',
    trim: true,
    maxlength: 30
  },
  familyContactName: {
    type: String,
    default: '',
    trim: true,
    maxlength: 100
  },
  familyContactPhone: {
    type: String,
    default: '',
    trim: true,
    maxlength: 30
  },
  checkinReminderTime: {
    type: String,
    default: '09:00',
    match: /^([01]\d|2[0-3]):[0-5]\d$/   // must look like 09:00
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);