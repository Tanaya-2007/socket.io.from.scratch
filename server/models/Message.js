const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
  seenAt: { type: Date }
});

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
