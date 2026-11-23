const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['checkin', 'suspicious_message', 'help_request', 'message_sent'],
    required: true
  },
  elderlyName: {
    type: String,
    default: 'Your loved one',
    trim: true,
    maxlength: 100
  },
  details: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000
  },
  senderType: {
    type: String,
    enum: ['unknown_number', 'whatsapp_forward', 'someone_i_know', 'not_sure', null],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Event', eventSchema);