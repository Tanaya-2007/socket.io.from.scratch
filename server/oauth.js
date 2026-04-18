const passport      = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt            = require('jsonwebtoken');
const mongoose       = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// ── Reuse User model from auth.js (don't redefine!) ──────────
// Lazy load to avoid model recompilation error
const getUserModel = () => {
  if (mongoose.models.User) return mongoose.models.User;
  const userSchema = new mongoose.Schema({
    username:   { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, default: null },   // null for OAuth users ✅
    avatar:     { type: String, default: null },
    provider:   { type: String, default: 'local' },
    providerId: { type: String, default: null },
    progress:   { type: [Number], default: [] },
    createdAt:  { type: Date, default: Date.now }
  });
  return mongoose.model('User', userSchema);
};
const User = getUserModel();

// ── Google Strategy ───────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID     || 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL:  'http://localhost:4000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { providerId: profile.id, provider: 'google' },
        { email: profile.emails[0].value }
      ]
    });

    if (!user) {
      // Create new user from Google profile
      user = await User.create({
        username:   profile.displayName,
        email:      profile.emails[0].value,
        avatar:     profile.photos[0]?.value,
        provider:   'google',
        providerId: profile.id,
        progress:   []
      });
      console.log(`✅ New Google user created: ${user.email}`);
    } else {
      // Update avatar if changed
      user.avatar     = profile.photos[0]?.value;
      user.providerId = profile.id;
      user.provider   = 'google';
      await user.save();
      console.log(`✅ Google user logged in: ${user.email}`);
    }

    return done(null, user);
  } catch (err) {
    console.error('❌ Google OAuth error:', err);
    return done(err, null);
  }
}));

// ── GitHub Strategy ───────────────────────────────────────────
passport.use(new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID     || 'YOUR_GITHUB_CLIENT_ID',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
  callbackURL:  'http://localhost:4000/api/auth/github/callback',
  scope:        ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

    let user = await User.findOne({
      $or: [
        { providerId: profile.id.toString(), provider: 'github' },
        { email }
      ]
    });

    if (!user) {
      user = await User.create({
        username:   profile.displayName || profile.username,
        email,
        avatar:     profile.photos[0]?.value,
        provider:   'github',
        providerId: profile.id.toString(),
        progress:   []
      });
      console.log(`✅ New GitHub user created: ${user.email}`);
    } else {
      user.avatar     = profile.photos[0]?.value;
      user.providerId = profile.id.toString();
      user.provider   = 'github';
      await user.save();
      console.log(`✅ GitHub user logged in: ${user.email}`);
    }

    return done(null, user);
  } catch (err) {
    console.error('❌ GitHub OAuth error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done)   => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) { done(err, null); }
});

// ── OAuth Routes ──────────────────────────────────────────────
const setupOAuthRoutes = (app) => {

  // Google
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=google_failed' }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user._id, username: req.user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/oauth-success?token=${token}&username=${encodeURIComponent(req.user.username)}&avatar=${encodeURIComponent(req.user.avatar || '')}`);
    }
  );

  // GitHub
  app.get('/api/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login?error=github_failed' }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user._id, username: req.user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.redirect(`http://localhost:3000/oauth-success?token=${token}&username=${encodeURIComponent(req.user.username)}&avatar=${encodeURIComponent(req.user.avatar || '')}`);
    }
  );

  // Get user progress
  app.get('/api/auth/progress', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer '))
        return res.status(401).json({ message: 'No token' });

      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      res.json({ progress: user.progress || [] });
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  // Save user progress
  app.post('/api/auth/progress', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer '))
        return res.status(401).json({ message: 'No token' });

      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      const { completedLevels } = req.body;

      await User.findByIdAndUpdate(decoded.id, { progress: completedLevels });
      res.json({ success: true });
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  });
};

module.exports = { setupOAuthRoutes, passport };