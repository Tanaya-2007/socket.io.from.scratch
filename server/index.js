const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

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

//Redis Adapter Setup
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

    //Level 8: Custom Events 
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
        
        socket.emit('race:started', {
          text: randomText,
          duration: 60
        });

        // Timer countdown
        let timeLeft = 60;
        const timer = setInterval(() => {
          timeLeft--;
          socket.emit('race:tick', { timeLeft });
          
          if (timeLeft <= 0) {
            clearInterval(timer);
            socket.emit('race:finished', {
              wpm: 0,
              accuracy: 0
            });
          }
        }, 1000);

        socket.raceTimer = timer;
      });

      socket.on('race:typing', (data) => {
        const { typed, target } = data;
        
        // Calculate WPM (words per minute)
        const timeElapsed = (Date.now() - socket.startTime) / 1000 / 60; // in minutes
        const wordsTyped = typed.trim().split(' ').length;
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        
        // Calculate accuracy
        let correct = 0;
        for (let i = 0; i < typed.length; i++) {
          if (typed[i] === target[i]) correct++;
        }
        const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
        
        socket.emit('race:update', { wpm, accuracy });
      });

      socket.on('race:complete', (data) => {
        if (socket.raceTimer) {
          clearInterval(socket.raceTimer);
        }

        const { typed, target } = data;
        const timeElapsed = (Date.now() - socket.startTime) / 1000 / 60;
        const wordsTyped = typed.trim().split(' ').length;
        const wpm = Math.round(wordsTyped / timeElapsed);
        
        let correct = 0;
        for (let i = 0; i < typed.length; i++) {
          if (typed[i] === target[i]) correct++;
        }
        const accuracy = Math.round((correct / typed.length) * 100);

        console.log(`🏆 ${socket.playerName} finished! WPM: ${wpm} | Accuracy: ${accuracy}%`);

        socket.emit('race:finished', { wpm, accuracy });
      });

      //Level 11
      const rateLimits = new Map();

  socket.on('send-message', (data) => {
  const now = Date.now();
  
  if (!rateLimits.has(socket.id)) {
    rateLimits.set(socket.id, []);
  }
  
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
  
  socket.emit('message-sent', { message: data.message });
});

socket.on('disconnect', () => rateLimits.delete(socket.id));

  // LEVEL 12: REDIS ADAPTER ← ADD THIS HERE!
  // ═══════════════════════════════════════════════════════════

  const onlineUsers = new Set();

  socket.on('chat:join', (data) => {
    socket.username = data.username;
    onlineUsers.add(data.username);
    
    console.log(`💬 ${data.username} joined chat`);
    
    socket.emit('server:info', {
      serverId: process.env.SERVER_ID || 'Server-1',
      totalServers: 1
    });
    
    io.emit('user:joined', {
      username: data.username,
      onlineUsers: onlineUsers.size
    });
  });

  socket.on('chat:send', (data) => {
    console.log(`📨 ${data.username}: ${data.text}`);
    socket.broadcast.emit('chat:message', data);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      
      io.emit('user:left', {
        username: socket.username,
        onlineUsers: onlineUsers.size
      });
      
      console.log(`👋 ${socket.username} left`);
    }
  });
});

//Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await pubClient.quit();
  await subClient.quit();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 4000;
const SERVER_ID = process.env.SERVER_ID || 'Server-1';

server.listen(PORT, () => {
  console.log(`
  🚀 Socket.IO Server Running!                 
  📡 Server ID: ${SERVER_ID.padEnd(30)} 
  📍 Port: ${String(PORT).padEnd(35)} 
  🌐 http://localhost:${PORT.toString().padEnd(25)} 
  ${pubClient.isReady ? '✅ Redis: CONNECTED' : '❌ Redis: DISCONNECTED'.padEnd(43)}
  `);
});