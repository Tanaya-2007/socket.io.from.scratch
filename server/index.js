const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Store room data for Level 2
const rooms = {};

// Store broadcast users for Level 3
const broadcastUsers = [];

io.on('connection', (socket) => {
  console.log('🎉 User connected:', socket.id);

  // ═══════════════════════════════════════════════════════════
  // LEVEL 1: Basic Connection & Messages
  // ═══════════════════════════════════════════════════════════
  socket.on('message', (data) => {
    console.log('📩 Message received:', data);
    socket.emit('response', {
      text: 'Server received your message!',
      yourMessage: data,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // ═══════════════════════════════════════════════════════════
  // LEVEL 2: Rooms
  // ═══════════════════════════════════════════════════════════
  socket.on('join-room', ({ roomName, playerName }) => {
    socket.join(roomName);
    socket.roomName = roomName;
    socket.playerName = playerName;
    
    if (!rooms[roomName]) {
      rooms[roomName] = { players: [], messages: [] };
    }
    
    rooms[roomName].players.push({ id: socket.id, name: playerName });
    
    console.log(`👤 ${playerName} joined room: ${roomName}`);
    
    socket.emit('joined-room', {
      roomName,
      players: rooms[roomName].players,
      messages: rooms[roomName].messages
    });
    
    socket.to(roomName).emit('player-joined', {
      player: { id: socket.id, name: playerName },
      players: rooms[roomName].players
    });
  });

  socket.on('room-message', (data) => {
    const { roomName, message } = data;
    const messageData = {
      id: Date.now(),
      sender: socket.playerName,
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    if (rooms[roomName]) {
      rooms[roomName].messages.push(messageData);
    }
    
    io.to(roomName).emit('room-message', messageData);
    console.log(`💬 [${roomName}] ${socket.playerName}: ${message}`);
  });

  socket.on('leave-room', () => {
    if (socket.roomName && rooms[socket.roomName]) {
      const roomName = socket.roomName;
      rooms[roomName].players = rooms[roomName].players.filter(p => p.id !== socket.id);
      socket.leave(roomName);
      
      socket.to(roomName).emit('player-left', {
        playerId: socket.id,
        players: rooms[roomName].players
      });
      
      if (rooms[roomName].players.length === 0) {
        delete rooms[roomName];
      }
      
      socket.roomName = null;
      socket.playerName = null;
    }
  });

  // ═══════════════════════════════════════════════════════════
  // LEVEL 3: Broadcast
  // ═══════════════════════════════════════════════════════════
  socket.on('register-user', (data) => {
    socket.userName = data.userName;
    broadcastUsers.push(data.userName);
    
    console.log(`📡 ${data.userName} joined broadcast (Total: ${broadcastUsers.length})`);
    
    // Tell the user they're registered
    socket.emit('user-registered', {
      users: broadcastUsers
    });
    
    // BROADCAST to everyone else that someone joined
    socket.broadcast.emit('user-joined', {
      user: data.userName,
      users: broadcastUsers
    });
  });

  socket.on('broadcast', (data) => {
    if (socket.userName) {
      console.log(`📢 Broadcast from ${socket.userName}: ${data.text}`);
      
      // BROADCAST to everyone EXCEPT the sender
      socket.broadcast.emit('broadcast', {
        sender: socket.userName,
        text: data.text,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Note: The sender does NOT receive their own broadcast
      // That's the whole point of broadcast!
    }
  });

  socket.on('leave-broadcast', () => {
    if (socket.userName) {
      const index = broadcastUsers.indexOf(socket.userName);
      if (index > -1) {
        broadcastUsers.splice(index, 1);
      }
      
      console.log(`📡 ${socket.userName} left broadcast (Remaining: ${broadcastUsers.length})`);
      
      socket.broadcast.emit('user-left', {
        user: socket.userName,
        users: broadcastUsers
      });
      
      socket.userName = null;
    }
  });

  // ═══════════════════════════════════════════════════════════
  // Disconnect Handler
  // ═══════════════════════════════════════════════════════════
  socket.on('disconnect', () => {
    console.log('😢 User disconnected:', socket.id);
    
    // Handle room disconnect
    if (socket.roomName && rooms[socket.roomName]) {
      const roomName = socket.roomName;
      rooms[roomName].players = rooms[roomName].players.filter(p => p.id !== socket.id);
      socket.to(roomName).emit('player-left', {
        playerId: socket.id,
        players: rooms[roomName].players
      });
      if (rooms[roomName].players.length === 0) {
        delete rooms[roomName];
      }
    }
    
    // Handle broadcast disconnect
    if (socket.userName) {
      const index = broadcastUsers.indexOf(socket.userName);
      if (index > -1) {
        broadcastUsers.splice(index, 1);
      }
      socket.broadcast.emit('user-left', {
        user: socket.userName,
        users: broadcastUsers
      });
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on http://localhost:${PORT}`);
  console.log(`📘 Level 1: Connection & Events`);
  console.log(`🏠 Level 2: Rooms`);
  console.log(`📡 Level 3: Broadcast`);
});