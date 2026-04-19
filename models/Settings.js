const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  elderlyName: {
    type: String,
    default: 'Nana'
  },
  familyWhatsApp: {
    type: String,
    default: '+44 7700 900123'
  },
  familyContactName: {
    type: String,
    default: 'Sarah (Daughter)'
  },
  familyContactPhone: {
    type: String,
    default: '+44 7700 900123'
  },
  checkinReminderTime: {
    type: String,
    default: '09:00'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
