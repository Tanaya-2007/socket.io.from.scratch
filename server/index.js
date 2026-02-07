const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Data storage
const rooms = {};

// LEVEL 4: NAMESPACES
const namespaces = {
  chat: { users: [], messages: [] },
  game: { users: [], messages: [] },
  admin: { users: [], messages: [] }
};

// Chat Namespace
const chatNS = io.of('/chat');
chatNS.on('connection', (socket) => {
  console.log('User connected to /chat:', socket.id);

  socket.on('join-namespace', ({ username }) => {
    socket.username = username;
    namespaces.chat.users.push({ id: socket.id, username });
    
    socket.emit('initial-state', {
      users: namespaces.chat.users,
      messages: namespaces.chat.messages
    });

    chatNS.emit('user-joined', {
      username,
      users: namespaces.chat.users
    });
  });

  socket.on('send-message', ({ text }) => {
    const message = {
      id: Date.now(),
      sender: socket.username,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    namespaces.chat.messages.push(message);
    chatNS.emit('namespace-message', message);
  });

  socket.on('disconnect', () => {
    namespaces.chat.users = namespaces.chat.users.filter(u => u.id !== socket.id);
    chatNS.emit('user-left', { users: namespaces.chat.users });
  });
});

// Game Namespace
const gameNS = io.of('/game');
gameNS.on('connection', (socket) => {
  console.log('User connected to /game:', socket.id);

  socket.on('join-namespace', ({ username }) => {
    socket.username = username;
    namespaces.game.users.push({ id: socket.id, username });
    
    socket.emit('initial-state', {
      users: namespaces.game.users,
      messages: namespaces.game.messages
    });

    gameNS.emit('user-joined', {
      username,
      users: namespaces.game.users
    });
  });

  socket.on('send-message', ({ text }) => {
    const message = {
      id: Date.now(),
      sender: socket.username,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    namespaces.game.messages.push(message);
    gameNS.emit('namespace-message', message);
  });

  socket.on('disconnect', () => {
    namespaces.game.users = namespaces.game.users.filter(u => u.id !== socket.id);
    gameNS.emit('user-left', { users: namespaces.game.users });
  });
});

// Admin Namespace
const adminNS = io.of('/admin');
adminNS.on('connection', (socket) => {
  console.log('User connected to /admin:', socket.id);

  socket.on('join-namespace', ({ username }) => {
    socket.username = username;
    namespaces.admin.users.push({ id: socket.id, username });
    
    socket.emit('initial-state', {
      users: namespaces.admin.users,
      messages: namespaces.admin.messages
    });

    adminNS.emit('user-joined', {
      username,
      users: namespaces.admin.users
    });
  });

  socket.on('send-message', ({ text }) => {
    const message = {
      id: Date.now(),
      sender: socket.username,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    namespaces.admin.messages.push(message);
    adminNS.emit('namespace-message', message);
  });

  socket.on('disconnect', () => {
    namespaces.admin.users = namespaces.admin.users.filter(u => u.id !== socket.id);
    adminNS.emit('user-left', { users: namespaces.admin.users });
  });
});

// Main namespace (for Level 1, 2, 3)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // LEVEL 1: Basic events
  socket.on('message', (data) => {
    console.log('Received message:', data);
    socket.emit('response', {
      text: `Server received: "${data}"`,
      yourMessage: data,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // LEVEL 2: Rooms
  socket.on('join-room', ({ roomName, playerName }) => {
    socket.join(roomName);
    socket.roomName = roomName;
    socket.playerName = playerName;

    if (!rooms[roomName]) {
      rooms[roomName] = { players: [], messages: [] };
    }

    rooms[roomName].players.push({ id: socket.id, name: playerName });

    socket.emit('joined-room', {
      roomName,
      players: rooms[roomName].players,
      messages: rooms[roomName].messages
    });

    socket.to(roomName).emit('player-joined', {
      player: playerName,
      players: rooms[roomName].players
    });
  });

  socket.on('room-message', ({ roomName, message }) => {
    const msg = {
      id: Date.now(),
      sender: socket.playerName,
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };

    if (rooms[roomName]) {
      rooms[roomName].messages.push(msg);
    }

    io.to(roomName).emit('room-message', msg);
  });

  socket.on('leave-room', () => {
    const roomName = socket.roomName;
    if (roomName && rooms[roomName]) {
      rooms[roomName].players = rooms[roomName].players.filter(p => p.id !== socket.id);

      socket.to(roomName).emit('player-left', {
        players: rooms[roomName].players
      });

      if (rooms[roomName].players.length === 0) {
        delete rooms[roomName];
      }

      socket.leave(roomName);
    }
  });

  // LEVEL 3: Broadcast
  socket.on('broadcast-all', (message) => {
    io.emit('broadcast-message', {
      sender: 'User',
      text: message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  socket.on('broadcast-others', (message) => {
    socket.broadcast.emit('broadcast-message', {
      sender: 'User',
      text: message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Clean up room if user was in one
    const roomName = socket.roomName;
    if (roomName && rooms[roomName]) {
      rooms[roomName].players = rooms[roomName].players.filter(p => p.id !== socket.id);

      socket.to(roomName).emit('player-left', {
        players: rooms[roomName].players
      });

      if (rooms[roomName].players.length === 0) {
        delete rooms[roomName];
      }
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Namespaces: /chat, /game, /admin`);
});