const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, trim: true },
  password:   { type: String, default: null },
  avatar:     { type: String, default: null },
  provider:   { type: String, default: 'local' },
  providerId: { type: String, default: null },
  progress:   { type: [Number], default: [] },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
