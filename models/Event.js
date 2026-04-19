const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['checkin', 'suspicious_message', 'help_request', 'message_sent'],
    required: true
  },
  elderlyName: {
    type: String,
    default: 'Nana'
  },
  details: {
    type: String,
    default: ''
  },
  senderType: {
    type: String,
    enum: ['unknown_number', 'whatsapp_forward', 'someone_i_know', null],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
