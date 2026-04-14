require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

const { router: authRouter } = require('./auth');
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRouter);

const session = require('express-session');
const { setupOAuthRoutes, passport } = require('./oauth');

app.use(session({ secret: 'session_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
setupOAuthRoutes(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// MONGODB CONNECTION
mongoose.connect('mongodb://localhost:27017/socketio-course')
.then(() => console.log('✅ MongoDB Connected!'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// MESSAGE SCHEMA
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
  seenAt: { type: Date }
});

const Message = mongoose.model('Message', messageSchema);

// GLOBAL DATA STORES
const rooms = {};
const globalUsers = [];
const userGameData = {};

// Redis Adapter Setup
const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log('✅ Redis connected successfully!');
    io.adapter(createAdapter(pubClient, subClient));
    console.log('🌐 Redis Adapter enabled!');
  })
  .catch((err) => {
    console.error('❌ Redis connection failed:', err);
  });

pubClient.on('error', (err) => console.error('❌ Redis Pub Error:', err));
subClient.on('error', (err) => console.error('❌ Redis Sub Error:', err));

io.on('connection', (socket) => {
  console.log('🎉 User connected:', socket.id);

  userGameData[socket.id] = { gold: 100, inventory: [] };

  // LEVEL 1: Basic Connection & Messages
  socket.on('message', (data) => {
    console.log('📩 Message received:', data);
    socket.emit('response', {
      text: 'Server received your message!',
      yourMessage: data,
      timestamp: new Date().toLocaleTimeString()
    });
  });

    socket.on('send-message', (message) => {
    const now = Date.now();

    // Rate limiting (Level 11)
    if (!rateLimits.has(socket.id)) rateLimits.set(socket.id, []);
    const requests = rateLimits.get(socket.id);
    const recent = requests.filter(time => now - time < 10000);

    if (recent.length >= 5) {
      socket.emit('rate-limit-exceeded', { retryAfter: 10000 });
      return;
    }
    recent.push(now);
    rateLimits.set(socket.id, recent);
    if (recent.length >= 4) {
      socket.emit('rate-limit-warning', { remaining: 5 - recent.length });
    }

    // Broadcast to ALL connected clients except the sender
    socket.broadcast.emit('chat-message', {
      sender: 'You',
      text: message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Level 2: Rooms
  socket.on('join-room', ({ roomName, playerName }) => {
    socket.join(roomName);
    socket.roomName = roomName;
    socket.playerName = playerName;
    if (!rooms[roomName]) rooms[roomName] = { players: [], messages: [] };
    rooms[roomName].players.push({ id: socket.id, name: playerName });
    console.log(`👤 ${playerName} joined room: ${roomName}`);
    socket.emit('joined-room', { roomName, players: rooms[roomName].players, messages: rooms[roomName].messages });
    socket.to(roomName).emit('player-joined', { player: { id: socket.id, name: playerName }, players: rooms[roomName].players });
  });

  socket.on('room-message', (data) => {
    const { roomName, message } = data;
    const messageData = { id: Date.now(), sender: socket.playerName, text: message, timestamp: new Date().toLocaleTimeString() };
    if (rooms[roomName]) rooms[roomName].messages.push(messageData);
    io.to(roomName).emit('room-message', messageData);
    console.log(`💬 [${roomName}] ${socket.playerName}: ${message}`);
  });

  socket.on('leave-room', () => {
    if (socket.roomName && rooms[socket.roomName]) {
      const roomName = socket.roomName;
      rooms[roomName].players = rooms[roomName].players.filter(p => p.id !== socket.id);
      socket.leave(roomName);
      socket.to(roomName).emit('player-left', { playerId: socket.id, players: rooms[roomName].players });
      if (rooms[roomName].players.length === 0) delete rooms[roomName];
      socket.roomName = null;
      socket.playerName = null;
    }
  });

  // Level 3: Global Server Chat
  socket.on('register-user', (data) => {
    socket.userName = data.userName;
    globalUsers.push(data.userName);
    console.log(`🌐 ${data.userName} joined global chat (Total: ${globalUsers.length})`);
    socket.emit('user-registered', { users: globalUsers });
    io.emit('user-joined', { user: data.userName, users: globalUsers });
  });

  socket.on('global-message', (data) => {
    if (socket.userName) {
      console.log(`💬 Global from ${socket.userName}: ${data.text}`);
      io.emit('global-message', { sender: socket.userName, text: data.text, timestamp: new Date().toLocaleTimeString() });
    }
  });

  socket.on('leave-global', () => {
    if (socket.userName) {
      const index = globalUsers.indexOf(socket.userName);
      if (index > -1) globalUsers.splice(index, 1);
      console.log(`🌐 ${socket.userName} left global chat (Remaining: ${globalUsers.length})`);
      io.emit('user-left', { user: socket.userName, users: globalUsers });
      socket.userName = null;
    }
  });

  // Level 5: ACKNOWLEDGEMENTS
  socket.on('buy-item', (data, acknowledgement) => {
    const userData = userGameData[socket.id];
    console.log(`🛒 ${socket.id} attempting to buy ${data.itemName} for ${data.price}G`);
    if (userData.gold >= data.price) {
      userData.gold -= data.price;
      userData.inventory.push(data.itemId);
      console.log(`✅ Purchase successful! New gold: ${userData.gold}G`);
      acknowledgement({ success: true, message: `${data.itemName} purchased!`, gold: userData.gold, inventory: userData.inventory });
    } else {
      console.log(`❌ Not enough gold! Needed: ${data.price}G, Have: ${userData.gold}G`);
      acknowledgement({ success: false, message: `Not enough gold! Need ${data.price}G, you have ${userData.gold}G`, gold: userData.gold, inventory: userData.inventory });
    }
  });

  // Level 7: Middleware
  socket.on('authenticate', (data) => {
    const { username, password } = data;
    console.log(`🔐 Auth attempt: ${username}`);
    if (username === 'admin' && password === 'secret123') {
      socket.username = username;
      socket.emit('auth-success', { username });
      console.log(`✅ Auth success: ${username}`);
    } else {
      socket.emit('auth-failed', { reason: 'Invalid credentials' });
      console.log(`❌ Auth failed: ${username}`);
    }
  });

  socket.on('secure-message', (data) => {
    if (socket.username) {
      console.log(`💬 Secure message from ${socket.username}: ${data.text}`);
      socket.emit('secure-message', { sender: 'Server', text: `Echo: ${data.text}`, timestamp: new Date().toLocaleTimeString() });
    }
  });

  // Level 8: Custom Events
  const typingTexts = [
    "The quick brown fox jumps over the lazy dog",
    "Socket.IO makes real-time communication easy and fun",
    "Custom events help organize your code beautifully",
    "Practice makes perfect when learning to type fast"
  ];

  socket.on('race:join', (data) => {
    socket.playerName = data.playerName;
    console.log(`⌨️ ${data.playerName} joined typing race`);
  });

  socket.on('race:start', () => {
    const randomText = typingTexts[Math.floor(Math.random() * typingTexts.length)];
    socket.startTime = Date.now();
    console.log(`🏁 ${socket.playerName} starts race`);
    socket.emit('race:started', { text: randomText, duration: 60 });
    let timeLeft = 60;
    const timer = setInterval(() => {
      timeLeft--;
      socket.emit('race:tick', { timeLeft });
      if (timeLeft <= 0) {
        clearInterval(timer);
        socket.emit('race:finished', { wpm: 0, accuracy: 0 });
      }
    }, 1000);
    socket.raceTimer = timer;
  });

  socket.on('race:typing', (data) => {
    const { typed, target } = data;
    const timeElapsed = (Date.now() - socket.startTime) / 1000 / 60;
    const wordsTyped = typed.trim().split(' ').length;
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) { if (typed[i] === target[i]) correct++; }
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    socket.emit('race:update', { wpm, accuracy });
  });

  socket.on('race:complete', (data) => {
    if (socket.raceTimer) clearInterval(socket.raceTimer);
    const { typed, target } = data;
    const timeElapsed = (Date.now() - socket.startTime) / 1000 / 60;
    const wordsTyped = typed.trim().split(' ').length;
    const wpm = Math.round(wordsTyped / timeElapsed);
    let correct = 0;
    for (let i = 0; i < typed.length; i++) { if (typed[i] === target[i]) correct++; }
    const accuracy = Math.round((correct / typed.length) * 100);
    console.log(`🏆 ${socket.playerName} finished! WPM: ${wpm} | Accuracy: ${accuracy}%`);
    socket.emit('race:finished', { wpm, accuracy });
  });

  // Level 10: DATABASE INTEGRATION
  socket.on('chat:join', async (data) => {
    try {
      socket.chatUsername = data.username;
      console.log(`💾 ${data.username} joined persistent chat - loading history...`);
      const history = await Message.find().sort({ timestamp: -1 }).limit(50).lean();
      socket.emit('chat:history', history.reverse().map(msg => ({
        id: msg._id.toString(),
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
        seen: msg.seen,
        seenAt: msg.seenAt ? msg.seenAt.toISOString() : null
      })));
      console.log(`📂 Sent ${history.length} messages from DB to ${data.username}`);
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      socket.emit('chat:error', { message: 'Failed to load chat history' });
    }
  });

  socket.on('chat:send', async (message) => {
    try {
      console.log(`💬 ${message.sender}: "${message.text}" (saving to DB...)`);
      const newMessage = new Message({ sender: message.sender, text: message.text, timestamp: new Date(message.timestamp), seen: false });
      await newMessage.save();
      console.log(`✅ Message saved to DB with ID: ${newMessage._id}`);
      socket.broadcast.emit('chat:message', {
        id: newMessage._id.toString(),
        sender: newMessage.sender,
        text: newMessage.text,
        timestamp: newMessage.timestamp.toISOString(),
        seen: false
      });
    } catch (error) {
      console.error('❌ Error saving message:', error);
      socket.emit('chat:error', { message: 'Failed to save message' });
    }
  });

  socket.on('message:markSeen', async (data) => {
    try {
      const messageId = data.messageId;
      console.log(`✓✓ Marking message ${messageId} as seen...`);
      const updatedMessage = await Message.findByIdAndUpdate(messageId, { seen: true, seenAt: new Date() }, { new: true });
      if (updatedMessage) {
        console.log(`✅ Message ${messageId} marked as seen`);
        io.emit('message:seen', { messageId, seenAt: updatedMessage.seenAt.toISOString() });
      }
    } catch (error) {
      console.error('❌ Error marking message as seen:', error);
    }
  });

  // Level 11: Rate Limiting & Security
  const rateLimits = new Map();

  // Level 12: REDIS ADAPTER
  const onlineUsers = new Set();

  socket.on('redis:join', (data) => {
    socket.username = data.username;
    onlineUsers.add(data.username);
    console.log(`💬 ${data.username} joined chat (via ${process.env.SERVER_ID || 'Server-1'})`);
    socket.emit('server:info', { serverId: process.env.SERVER_ID || 'Server-1', totalServers: 1 });
    io.emit('user:joined', { username: data.username, onlineUsers: onlineUsers.size });
  });

  socket.on('redis:send', (data) => {
    console.log(`📨 [${process.env.SERVER_ID || 'Server-1'}] ${data.username}: ${data.text}`);
    socket.broadcast.emit('chat:message', data);
  });

  // Level 6: Disconnect & cleanup
  socket.on('disconnect', () => {
    console.log('😢 User disconnected:', socket.id);

    // Clean up Level 2
    if (socket.roomName && rooms[socket.roomName]) {
      const roomName = socket.roomName;
      rooms[roomName].players = rooms[roomName].players.filter(p => p.id !== socket.id);
      socket.to(roomName).emit('player-left', { playerId: socket.id, players: rooms[roomName].players });
      if (rooms[roomName].players.length === 0) delete rooms[roomName];
    }

    // Clean up Level 3
    if (socket.userName) {
      const index = globalUsers.indexOf(socket.userName);
      if (index > -1) globalUsers.splice(index, 1);
      io.emit('user-left', { user: socket.userName, users: globalUsers });
    }

    // Clean up Level 5
    if (userGameData[socket.id]) {
      delete userGameData[socket.id];
      console.log(`🗑️ Cleaned up game data for ${socket.id}`);
    }

    // Clean up Level 11
    rateLimits.delete(socket.id);

    // Clean up Level 12
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit('user:left', { username: socket.username, onlineUsers: onlineUsers.size });
      console.log(`👋 ${socket.username} left (from ${process.env.SERVER_ID || 'Server-1'})`);
    }
  });
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await pubClient.quit();
  await subClient.quit();
  await mongoose.connection.close();
  server.close(() => { console.log('✅ Server closed'); process.exit(0); });
});

const PORT = process.env.PORT || 4000;
const SERVER_ID = process.env.SERVER_ID || 'Server-1';

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║        🚀 SOCKET.IO SERVER RUNNING                   ║
╠═══════════════════════════════════════════════════════╣
║  📡 Server ID: ${SERVER_ID.padEnd(37)}║
║  📍 Port:      ${String(PORT).padEnd(37)}║
║  🌐 URL:       http://localhost:${PORT.toString().padEnd(24)}║
║  ${mongoose.connection.readyState === 1 ? '✅ MongoDB:   CONNECTED                          ' : '❌ MongoDB:   DISCONNECTED                       '}║
║  ${pubClient.isReady ? '✅ Redis:     CONNECTED                          ' : '❌ Redis:     DISCONNECTED                       '}║
╚═══════════════════════════════════════════════════════╝

💡 TIP: To run multiple servers for Redis Adapter testing:
   Terminal 1: npm start
   Terminal 2: PORT=4001 SERVER_ID="Server-2" node index.js
   Terminal 3: PORT=4002 SERVER_ID="Server-3" node index.js
  `);
});