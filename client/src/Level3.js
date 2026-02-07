import React, { useState, useEffect, useRef } from 'react';

function Level3({ socket, isConnected, onBack }) {
  const [level3Phase, setLevel3Phase] = useState('theory'); // 'theory' or 'practice'
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [users, setUsers] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastInput, setBroadcastInput] = useState('');
  const messagesEndRef = useRef(null);

  // Socket.IO event listeners for Level 3
  useEffect(() => {
    socket.on('user-registered', (data) => {
      setIsRegistered(true);
      setUsers(data.users);
    });

    socket.on('user-joined', (data) => {
      setUsers(data.users);
      addSystemBroadcast(`${data.user} joined the server!`);
    });

    socket.on('user-left', (data) => {
      setUsers(data.users);
      addSystemBroadcast(`${data.user} left the server`);
    });

    socket.on('broadcast', (data) => {
      setBroadcasts(prev => [...prev, {
        id: Date.now() + Math.random(),
        sender: data.sender,
        text: data.text,
        timestamp: data.timestamp || new Date().toLocaleTimeString(),
        type: 'broadcast'
      }]);
    });

    return () => {
      socket.off('user-registered');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('broadcast');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [broadcasts]);

  const addSystemBroadcast = (text) => {
    setBroadcasts(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender: 'System',
      text,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system'
    }]);
  };

  const handleRegister = () => {
    if (userName.trim()) {
      socket.emit('register-user', { userName: userName.trim() });
    }
  };

  const handleSendBroadcast = () => {
    if (broadcastInput.trim() && isRegistered) {
      socket.emit('broadcast', { text: broadcastInput });
      setBroadcastInput('');
    }
  };

  const handleLeave = () => {
    socket.emit('leave-broadcast');
    setIsRegistered(false);
    setUserName('');
    setBroadcasts([]);
    setUsers([]);
  };

  const handleBack = () => {
    if (isRegistered) {
      handleLeave();
    }
    setLevel3Phase('theory');
    onBack();
  };

  // ═══════════════════════════════════════════════════════════
  // THEORY PHASE
  // ═══════════════════════════════════════════════════════════
  if (level3Phase === 'theory') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        {/* Orange/Red Glow Background */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          {/* Header - Level 1 Style */}
          <header className="bg-[#0d1529] border-b border-orange-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-orange-500/20"
                >
                  <span>←</span>
                </button>

                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚡</div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    <span className="text-orange-500">LEVEL 3</span>
                  </h1>
                </div>

                {/* Status Badge */}
                <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                  isConnected 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-red-500/20 border-red-500 text-red-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="hidden sm:inline">{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="border-t border-orange-500/20 bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-3">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 tracking-wide">PROGRESS</span>
                  <span className="text-xl font-black text-orange-400">0%</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 rounded-full bg-white/10"></div>
                  <div className="flex-1 h-2 rounded-full bg-white/10"></div>
                  <div className="flex-1 h-2 rounded-full bg-white/10"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>📡</span>
                  <span>💬</span>
                  <span>📊</span>
                </div>
              </div>
            </div>
          </header>

          {/* Theory Content */}
          <div className="container mx-auto px-6 py-12 max-w-6xl">
            
            
        {/* Real-World Examples */}
            <div className="mb-16 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-3xl font-black mb-8 text-orange-400 flex items-center gap-3">
                <span>🌍</span>
                <span>Real-World Examples</span>
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Twitter/X */}
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30 rounded-3xl p-8 hover:border-orange-400 hover:scale-105 transition-all duration-300">
                  <div className="text-5xl mb-4">🐦</div>
                  <h4 className="text-2xl font-black mb-3 text-orange-400">Twitter/X</h4>
                  <p className="text-gray-300">You post a tweet → Everyone sees it in their feed → You don't see your own tweet appear</p>
                </div>

                {/* Online Games */}
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30 rounded-3xl p-8 hover:border-orange-400 hover:scale-105 transition-all duration-300">
                  <div className="text-5xl mb-4">🎮</div>
                  <h4 className="text-2xl font-black mb-3 text-orange-400">Online Games</h4>
                  <p className="text-gray-300">You move your character → Server tells everyone else → You already know your position</p>
                </div>

                {/* Live Notifications */}
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30 rounded-3xl p-8 hover:border-orange-400 hover:scale-105 transition-all duration-300">
                  <div className="text-5xl mb-4">🔔</div>
                  <h4 className="text-2xl font-black mb-3 text-orange-400">Notifications</h4>
                  <p className="text-gray-300">User joins → Notify everyone else → The joiner doesn't need a notification about themselves</p>
                </div>
              </div>
            </div>

            {/* How Broadcast Works */}
            <div className="mb-16 bg-black/60 backdrop-blur-xl border-2 border-orange-500/30 rounded-3xl p-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-3xl font-black mb-8 text-orange-400 flex items-center gap-3">
                <span>⚙️</span>
                <span>How Broadcast Works</span>
              </h3>

              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="text-4xl">1️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-white">Send to Everyone Else</h4>
                    <p className="text-gray-300 text-lg">socket.broadcast.emit() sends to ALL connected clients EXCEPT the sender</p>
                    <div className="mt-3 bg-black rounded-xl border border-orange-500/30 p-4">
                      <code className="text-orange-400 text-sm font-mono">
                        socket.broadcast.emit('message', 'Hello everyone!');
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-4xl">2️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-white">Compare to Other Methods</h4>
                    <p className="text-gray-300 text-lg">Understanding the difference between emit types</p>
                    <div className="mt-3 space-y-2">
                      <div className="bg-black rounded-xl border border-blue-500/30 p-4">
                        <div className="text-xs text-blue-400 font-bold mb-1">socket.emit()</div>
                        <code className="text-blue-400 text-sm font-mono">// Sends to THIS client only</code>
                      </div>
                      <div className="bg-black rounded-xl border border-green-500/30 p-4">
                        <div className="text-xs text-green-400 font-bold mb-1">io.emit()</div>
                        <code className="text-green-400 text-sm font-mono">// Sends to ALL clients (including sender)</code>
                      </div>
                      <div className="bg-black rounded-xl border border-orange-500/30 p-4">
                        <div className="text-xs text-orange-400 font-bold mb-1">socket.broadcast.emit()</div>
                        <code className="text-orange-400 text-sm font-mono">// Sends to ALL clients EXCEPT sender</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="text-4xl">3️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-white">Perfect Use Cases</h4>
                    <p className="text-gray-300 text-lg">When the sender already knows what they did, tell everyone else</p>
                    <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                      <ul className="text-sm text-gray-300 space-y-2">
                        <li>• Player movement in games (you already moved, tell others)</li>
                        <li>• User joins/leaves announcements (no need to tell yourself)</li>
                        <li>• Live typing indicators (you know you're typing)</li>
                        <li>• Status updates (your status changed, notify others)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-16 bg-black/60 backdrop-blur-xl border-2 border-orange-500/30 rounded-3xl overflow-hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="p-8 border-b border-orange-500/30 bg-orange-500/5">
                <h3 className="text-3xl font-black text-orange-400 flex items-center gap-3">
                  <span>👨‍💻</span>
                  <span>The Code</span>
                </h3>
              </div>
              
              <div className="p-8">
                <h4 className="text-xl font-black mb-4 text-orange-300">Server Side</h4>
                <div className="bg-black rounded-2xl border border-orange-500/30 overflow-hidden mb-8">
                  <div className="px-6 py-3 bg-black/80 border-b border-orange-500/30 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-6 text-sm overflow-x-auto font-mono">
                    <code className="text-orange-400">{`// When a user sends a message
socket.on('broadcast', (data) => {
  // Send to everyone EXCEPT the sender
  socket.broadcast.emit('broadcast', {
    sender: socket.userName,
    text: data.text,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // The sender already knows they sent it!
  // No need to send it back to them
});

// When someone joins
socket.on('register-user', (data) => {
  socket.userName = data.userName;
  
  // Tell everyone else someone joined
  socket.broadcast.emit('user-joined', {
    user: data.userName
  });
});`}</code>
                  </pre>
                </div>

                <h4 className="text-xl font-black mb-4 text-orange-300">Client Side</h4>
                <div className="bg-black rounded-2xl border border-orange-500/30 overflow-hidden">
                  <div className="px-6 py-3 bg-black/80 border-b border-orange-500/30 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-6 text-sm overflow-x-auto font-mono">
                    <code className="text-orange-400">{`// Send a broadcast message
socket.emit('broadcast', {
  text: 'Hello everyone!'
});

// Listen for broadcasts from others
socket.on('broadcast', (data) => {
  console.log(data.sender + ': ' + data.text);
  // This only receives messages from OTHER users
});

// Listen for join notifications
socket.on('user-joined', (data) => {
  console.log(data.user + ' joined!');
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            <div className="mb-16 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-3xl font-black mb-8 text-orange-400 flex items-center gap-3">
                <span>🔑</span>
                <span>Key Concepts</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl mb-3">🚫</div>
                  <h4 className="text-xl font-black mb-2 text-orange-300">Excludes Sender</h4>
                  <p className="text-gray-300">The client who sends the broadcast does NOT receive it back</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl mb-3">🌐</div>
                  <h4 className="text-xl font-black mb-2 text-orange-300">Global Reach</h4>
                  <p className="text-gray-300">Reaches ALL other connected clients on the server</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl mb-3">⚡</div>
                  <h4 className="text-xl font-black mb-2 text-orange-300">Instant Updates</h4>
                  <p className="text-gray-300">Perfect for real-time notifications and status updates</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl mb-3">💡</div>
                  <h4 className="text-xl font-black mb-2 text-orange-300">Efficient</h4>
                  <p className="text-gray-300">Avoids redundant messages - sender already knows their action</p>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="mb-16 bg-black/60 backdrop-blur-xl border-2 border-orange-500/30 rounded-3xl overflow-hidden animate-slideUp" style={{ animationDelay: '0.5s' }}>
              <div className="p-8 border-b border-orange-500/30 bg-orange-500/5">
                <h3 className="text-3xl font-black text-orange-400 flex items-center gap-3">
                  <span>📊</span>
                  <span>Emit Methods Comparison</span>
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/50">
                    <tr>
                      <th className="p-4 text-orange-400 font-bold">Method</th>
                      <th className="p-4 text-orange-400 font-bold">Who Receives?</th>
                      <th className="p-4 text-orange-400 font-bold">Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-orange-500/10">
                      <td className="p-4 font-mono text-blue-400">socket.emit()</td>
                      <td className="p-4 text-gray-300">Only the sender</td>
                      <td className="p-4 text-gray-300">Personal responses, confirmations</td>
                    </tr>
                    <tr className="border-t border-orange-500/10">
                      <td className="p-4 font-mono text-green-400">io.emit()</td>
                      <td className="p-4 text-gray-300">Everyone including sender</td>
                      <td className="p-4 text-gray-300">Server announcements, game state</td>
                    </tr>
                    <tr className="border-t border-orange-500/10">
                      <td className="p-4 font-mono text-orange-400">socket.broadcast.emit()</td>
                      <td className="p-4 text-gray-300">Everyone EXCEPT sender</td>
                      <td className="p-4 text-gray-300">User actions, notifications</td>
                    </tr>
                    <tr className="border-t border-orange-500/10">
                      <td className="p-4 font-mono text-purple-400">socket.to(room).emit()</td>
                      <td className="p-4 text-gray-300">Room members except sender</td>
                      <td className="p-4 text-gray-300">Room-specific broadcasts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center animate-slideUp" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={() => setLevel3Phase('practice')}
                className="px-12 py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-2xl font-black rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 flex items-center gap-4 mx-auto"
              >
                <span>Got it! Let's Practice</span>
                <span className="text-3xl">→</span>
              </button>
            </div>

          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slideUp {
            animation: slideUp 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PRACTICE PHASE - REGISTER
  // ═══════════════════════════════════════════════════════════
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        {/* Orange/Red Glow Background */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between max-w-2xl mx-auto w-full">
            <button
              onClick={() => setLevel3Phase('theory')}
              className="px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-orange-500/20"
            >
              <span>←</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <h1 className="text-2xl font-black text-orange-500">LEVEL 3</h1>
            </div>

            <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
              isConnected 
                ? 'bg-green-500/20 border-green-500 text-green-400' 
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="hidden sm:inline">{isConnected ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl w-full mx-auto animate-scaleIn">

            {/* Register Form */}
            <div className="bg-black/60 backdrop-blur-xl border-2 border-orange-500/30 rounded-3xl overflow-hidden">
              <div className="p-10 border-b border-orange-500/30 bg-orange-500/5 text-center">
                <div className="text-7xl mb-6">📡</div>
                <h2 className="text-5xl font-black mb-3 text-orange-400">Join Broadcast</h2>
                <p className="text-xl text-gray-300">Enter your name to start broadcasting</p>
              </div>

              <div className="p-10">
                <div className="space-y-6">
                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-bold text-orange-300 mb-3">YOUR NAME</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your username"
                      maxLength={20}
                      className="w-full px-6 py-4 bg-black/90 border-2 border-orange-500/30 rounded-2xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white text-2xl font-bold text-center placeholder-gray-600 transition-all duration-300"
                    />
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={handleRegister}
                    disabled={!userName.trim() || !isConnected}
                    className="w-full px-8 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xl font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 flex items-center justify-center gap-3"
                  >
                    <span>Join Broadcast</span>
                    <span className="text-2xl">→</span>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                  <div className="flex gap-4">
                    <div className="text-3xl">💡</div>
                    <div>
                      <h4 className="font-bold text-orange-300 mb-2">How it works:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Your messages will be seen by everyone else</li>
                        <li>• You won't see your own messages (you already sent them!)</li>
                        <li>• Open multiple tabs to see the broadcast in action</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PRACTICE PHASE - BROADCAST FEED
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
      {/* Orange/Red Glow Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header - Level 1 Style */}
        <header className="bg-[#0d1529] border-b border-orange-500/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-3xl">📡</div>
                <div>
                  <div className="text-xs text-gray-400">Broadcasting</div>
                  <div className="text-xl font-black text-orange-400">{userName}</div>
                </div>
              </div>

              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚡</div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  <span className="text-orange-500">LEVEL 3</span>
                </h1>
              </div>

              {/* Leave Button */}
              <button
                onClick={handleLeave}
                className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-lg transition-all duration-300 text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Broadcast Feed */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-orange">
              {broadcasts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="text-7xl mb-4">📻</div>
                  <p className="text-2xl font-bold">Broadcast Feed Active</p>
                  <p className="text-lg text-gray-600 mt-2">Send a message to broadcast!</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {broadcasts.map((msg) => (
                    <div 
                      key={msg.id}
                      className="opacity-0 animate-fadeInUp"
                    >
                      <div className={`p-4 rounded-2xl shadow-lg ${
                        msg.type === 'system'
                          ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-center'
                          : 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-gray-200'
                      }`}>
                        {msg.type !== 'system' && (
                          <div className="text-xs font-bold opacity-80 mb-2">
                            <span className="px-2 py-1 bg-black/30 rounded">
                              [{msg.timestamp}] {msg.sender}
                            </span>
                          </div>
                        )}
                        <div className="text-lg font-medium break-words">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-orange-500/30 bg-black/60 backdrop-blur-xl p-6">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input
                  type="text"
                  value={broadcastInput}
                  onChange={(e) => setBroadcastInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendBroadcast()}
                  placeholder="Type your broadcast message..."
                  className="flex-1 px-6 py-4 bg-black/90 border-2 border-orange-500/30 rounded-2xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white text-lg placeholder-gray-600 transition-all duration-300"
                />
                <button
                  onClick={handleSendBroadcast}
                  disabled={!broadcastInput.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50"
                >
                  Broadcast
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">
                💡 Your messages won't appear here - open another tab to see them!
              </p>
            </div>
          </div>

          {/* Sidebar - Online Users */}
          <div className="w-80 border-l border-orange-500/30 bg-black/40 backdrop-blur-xl p-6 animate-slideInRight">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-orange-400">
              <span>👥</span>
              <span>Online ({users.length})</span>
            </h3>

            <div className="space-y-3">
              {users.map((user, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    user === userName
                      ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/30'
                      : 'bg-black/60 border-orange-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {user === userName ? '👤' : '🙋'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">
                        {user}
                        {user === userName && (
                          <span className="ml-2 text-xs text-orange-400">(You)</span>
                        )}
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="text-xs text-gray-400">
                <p className="mb-2">💡 <strong>Remember:</strong> Your broadcasts go to everyone else, but you won't see them here!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        /* Custom scrollbar with ORANGE GLOW */
        .custom-scrollbar-orange::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar-orange::-webkit-scrollbar-track {
          background: #000000;
        }

        .custom-scrollbar-orange::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 10px;
          box-shadow: 0 0 10px #f97316;
        }

        .custom-scrollbar-orange::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
          box-shadow: 0 0 15px #f97316;
        }
      `}</style>
    </div>
  );
}

export default Level3;