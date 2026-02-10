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


// GLOBAL DATA STORES 

// Store room data for Level 2
const rooms = {};

// Store global users for Level 3
const globalUsers = [];

// Store user game data for Level 5 (gold and inventory per socket)
const userGameData = {};


// Level 1 :Connection

io.on('connection', (socket) => {
  console.log('🎉 User connected:', socket.id);

  // Initialize game data for this user (Level 5)
  userGameData[socket.id] = {
    gold: 100,
    inventory: []
  };

  // LEVEL 1: Basic Connection & Messages
  socket.on('message', (data) => {
    console.log('📩 Message received:', data);
    socket.emit('response', {
      text: 'Server received your message!',
      yourMessage: data,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Level 2: Rooms
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


  // Level 3: Global Server Chat
  
  socket.on('register-user', (data) => {
    socket.userName = data.userName;
    globalUsers.push(data.userName);
    
    console.log(`🌐 ${data.userName} joined global chat (Total: ${globalUsers.length})`);
    
    socket.emit('user-registered', {
      users: globalUsers
    });
    
    io.emit('user-joined', {
      user: data.userName,
      users: globalUsers
    });
  });

  socket.on('global-message', (data) => {
    if (socket.userName) {
      console.log(`💬 Global from ${socket.userName}: ${data.text}`);
      
      io.emit('global-message', {
        sender: socket.userName,
        text: data.text,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });

  socket.on('leave-global', () => {
    if (socket.userName) {
      const index = globalUsers.indexOf(socket.userName);
      if (index > -1) {
        globalUsers.splice(index, 1);
      }
      
      console.log(`🌐 ${socket.userName} left global chat (Remaining: ${globalUsers.length})`);
      
      io.emit('user-left', {
        user: socket.userName,
        users: globalUsers
      });
      
      socket.userName = null;
    }
  });

 
  // Level 5: ACKNOWLEDGEMENTS

  socket.on('buy-item', (data, acknowledgement) => {
    const userData = userGameData[socket.id];
    
    console.log(`🛒 ${socket.id} attempting to buy ${data.itemName} for ${data.price}G`);
    console.log(`   Current gold: ${userData.gold}G`);

    // Check if user has enough gold
    if (userData.gold >= data.price) {
      // Deduct gold and add item
      userData.gold -= data.price;
      userData.inventory.push(data.itemId);

      console.log(`✅ Purchase successful! New gold: ${userData.gold}G`);

      // Send SUCCESS acknowledgement back to client
      acknowledgement({
        success: true,
        message: `${data.itemName} purchased!`,
        gold: userData.gold,
        inventory: userData.inventory
      });
    } else {
      console.log(`❌ Not enough gold! Needed: ${data.price}G, Have: ${userData.gold}G`);

      // Send FAILURE acknowledgement back to client
      acknowledgement({
        success: false,
        message: `Not enough gold! Need ${data.price}G, you have ${userData.gold}G`,
        gold: userData.gold,
        inventory: userData.inventory
      });
    }
  });

  
  //Level 6: Error handling
 
  socket.on('disconnect', () => {
    console.log('😢 User disconnected:', socket.id);
    
    // Clean up Level 2 (rooms)
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
    
    // Clean up Level 3 (global users)
    if (socket.userName) {
      const index = globalUsers.indexOf(socket.userName);
      if (index > -1) {
        globalUsers.splice(index, 1);
      }
      io.emit('user-left', {
        user: socket.userName,
        users: globalUsers
      });
    }

    // Clean up Level 5 (game data) 
    if (userGameData[socket.id]) {
      delete userGameData[socket.id];
      console.log(`🗑️ Cleaned up game data for ${socket.id}`);
    }
  });

    // Level 7: Middleware (Authentication happens in middleware!)

    socket.on('authenticate', (data) => {
      const { username, password } = data;
      
      console.log(`🔐 Auth attempt: ${username}`);
      
      // Simple auth check
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
        socket.emit('secure-message', {
          sender: 'Server',
          text: `Echo: ${data.text}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });
});





const PORT = 4000;
server.listen(PORT, () => {
  console.log(`
 🚀 Socket.IO Server Running!                             
  📍 http://localhost:${PORT}                                

  `);
});