const session = require('express-session');
const mongoose = require('mongoose');

const MongoSessionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  session: { type: Object, required: true },
  expires: { type: Date, index: { expires: 0 } } // MongoDB TTL index to auto-cleanup expired sessions
});

const MongoSession = mongoose.model('MongoSession', MongoSessionSchema);

class MongooseStore extends session.Store {
  constructor() {
    super();
  }

  // Get session from store
  async get(sid, callback) {
    try {
      const doc = await MongoSession.findById(sid);
      if (!doc) return callback(null, null);
      
      // Check if session has expired manually (safeguard)
      if (doc.expires && doc.expires < new Date()) {
        await MongoSession.deleteOne({ _id: sid });
        return callback(null, null);
      }
      
      callback(null, doc.session);
    } catch (err) {
      callback(err);
    }
  }

  // Save session to store
  async set(sid, sessionData, callback) {
    try {
      let expires = null;
      if (sessionData.cookie && sessionData.cookie.expires) {
        expires = new Date(sessionData.cookie.expires);
      } else {
        // Fallback: 14 days default session life if no cookie expiration is set
        expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      }
      
      await MongoSession.findByIdAndUpdate(
        sid, 
        { session: sessionData, expires }, 
        { upsert: true, new: true }
      );
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  // Destroy session
  async destroy(sid, callback) {
    try {
      await MongoSession.deleteOne({ _id: sid });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  // Update session expiration (touch)
  async touch(sid, sessionData, callback) {
    try {
      let expires = null;
      if (sessionData.cookie && sessionData.cookie.expires) {
        expires = new Date(sessionData.cookie.expires);
        await MongoSession.findByIdAndUpdate(sid, { expires });
      }
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = MongooseStore;
