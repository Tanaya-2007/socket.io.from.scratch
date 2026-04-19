const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// ── User Schema ──────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, trim: true },  // ✅ removed unique!
  email:      { type: String, required: true, unique: true, trim: true },
  password:   { type: String, default: null },
  avatar:     { type: String, default: null },
  provider:   { type: String, default: 'local' },
  providerId: { type: String, default: null },
  progress:   { type: [Number], default: [] },
  createdAt:  { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ── REGISTER ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    // Only check email uniqueness (not username anymore)
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'Email already registered! Please login.' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      username,
      email,
      password: hashed,
      provider: 'local'
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, username: user.username });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGIN ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'No account found with this email. Please register first!' });

    // Block OAuth users from logging in with password
    if (user.provider !== 'local' || !user.password)
      return res.status(401).json({ message: `This email is registered via ${user.provider}. Please use that login method!` });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── VERIFY TOKEN (middleware) ────────────────────────────────
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ── PROTECTED: Get current user ──────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Progress Routes ───────────────────────────────────────────
router.get('/progress', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress');
    res.json({ progress: user?.progress || [] });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/progress', verifyToken, async (req, res) => {
  try {
    const { completedLevels } = req.body;
    await User.findByIdAndUpdate(req.user.id, { progress: completedLevels });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, verifyToken };