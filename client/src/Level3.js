import React, { useState, useEffect, useRef } from 'react';

function Level3({ socket, isConnected, onBack, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('all');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('broadcast-message', (data) => {
      addMessage(data.sender, data.text, data.timestamp);
    });

    return () => {
      socket.off('broadcast-message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text, timestamp = null) => {
    setMessages(prev => [...prev, { 
      sender, 
      text, 
      timestamp: timestamp || new Date().toLocaleTimeString(),
      id: Date.now() + Math.random(),
      type: 'message'
    }]);
  };

  const addNotification = (text) => {
    setMessages(prev => [...prev, {
      text,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random(),
      type: 'notification'
    }]);
  };

  const handleBroadcast = () => {
    if (inputMessage.trim()) {
      if (broadcastType === 'all') {
        socket.emit('broadcast-all', inputMessage);
        addMessage('You', inputMessage);
      } else {
        socket.emit('broadcast-others', inputMessage);
        addNotification(`Broadcasted to others: "${inputMessage}"`);
      }
      setInputMessage('');
    }
  };

  if (phase === 'theory') {
    return (
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-400">Level 3</h1>
                </div>
                
                <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                  isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
                }`}>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span>{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-6xl">
            
            
            {/* Real-World Examples */}
            <div className="mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>🎮</span> Real-World Examples
              </h3>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🎮</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Multiplayer Games</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    "Server maintenance in 5 minutes!" → All players see it
                  </p>
                  <div className="bg-cyan-500/10 rounded-lg p-2 text-xs">
                    <code className="text-cyan-400">io.emit()</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">💬</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Chat Apps</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    "Alex is typing..." → Others see it, Alex doesn't
                  </p>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                    <code className="text-blue-400">broadcast.emit()</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🏆</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Live Leaderboard</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    "Bob joined the game!" → Everyone else sees it
                  </p>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                    <code className="text-blue-400">broadcast.emit()</code>
                  </div>
                </div>
              </div>
            </div>

            {/* The Difference */}
            <div className="mb-8 md:mb-12 bg-black/60 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>🎯</span> The Key Difference
              </h3>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* io.emit */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">📢</div>
                    <h4 className="text-xl md:text-2xl font-black text-cyan-400">io.emit()</h4>
                  </div>
                  <p className="text-sm md:text-base text-gray-300 mb-4">
                    Sends to <strong className="text-cyan-400">EVERYONE</strong> including yourself
                  </p>
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <code className="text-cyan-400 text-xs md:text-sm">
                      io.emit('alert', 'Server update!');<br/>
                      // ALL users see this
                    </code>
                  </div>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">Server announcements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">Global chat messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">Game-wide events</span>
                    </div>
                  </div>
                </div>

                {/* socket.broadcast.emit */}
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">🔔</div>
                    <h4 className="text-xl md:text-2xl font-black text-blue-400">socket.broadcast.emit()</h4>
                  </div>
                  <p className="text-sm md:text-base text-gray-300 mb-4">
                    Sends to <strong className="text-blue-400">EVERYONE EXCEPT</strong> yourself
                  </p>
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <code className="text-blue-400 text-xs md:text-sm">
                      socket.broadcast.emit('joined');<br/>
                      // Others see, you don't
                    </code>
                  </div>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span>
                      <span className="text-gray-300">"Player joined" notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span>
                      <span className="text-gray-300">Typing indicators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span>
                      <span className="text-gray-300">Activity status updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-8 md:mb-12 bg-black/60 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="p-4 md:p-8 border-b border-cyan-500/30 bg-cyan-500/5">
                <h3 className="text-2xl md:text-3xl font-black text-cyan-400 flex items-center gap-2 md:gap-3">
                  <span>👨‍💻</span> The Code
                </h3>
              </div>
              
              <div className="p-4 md:p-8">
                <div className="bg-black rounded-xl border border-cyan-500/30 overflow-hidden">
                  <div className="px-4 py-2 bg-black/80 border-b border-cyan-500/30 flex gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 md:p-6 text-xs md:text-sm overflow-x-auto font-mono">
                    <code className="text-cyan-400">{`// Send to EVERYONE (including yourself)
io.emit('notification', {
  text: 'Server maintenance in 5 minutes!'
});

// Send to EVERYONE EXCEPT yourself
socket.broadcast.emit('user-joined', {
  name: 'Alex'
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPhase('practice')}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-cyan-500/50"
              >
                <span>Try It Live!</span>
                <span className="text-2xl md:text-3xl">→</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="bg-black/90 backdrop-blur-xl border-b border-cyan-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setPhase('theory')} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Theory</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">📡</div>
                <h1 className="text-lg md:text-2xl font-black text-cyan-400">BROADCAST</h1>
              </div>
              
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-green-500/20 border-green-500 text-green-400">
                LIVE
              </div>
            </div>
          </div>
        </header>

        <div className="bg-black/60 backdrop-blur-xl border-b border-cyan-500/20 p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex gap-3">
              <button
                onClick={() => setBroadcastType('all')}
                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                  broadcastType === 'all'
                    ? 'bg-cyan-600 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                    : 'bg-black/60 text-gray-400 border border-cyan-500/30'
                }`}
              >
                <div className="text-2xl mb-1">📢</div>
                <div className="text-xs md:text-sm">Everyone</div>
                <div className="text-xs text-cyan-300 mt-1">io.emit()</div>
              </button>

              <button
                onClick={() => setBroadcastType('others')}
                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                  broadcastType === 'others'
                    ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/50'
                    : 'bg-black/60 text-gray-400 border border-blue-500/30'
                }`}
              >
                <div className="text-2xl mb-1">🔔</div>
                <div className="text-xs md:text-sm">Others Only</div>
                <div className="text-xs text-blue-300 mt-1">broadcast.emit()</div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-5xl md:text-7xl mb-3 md:mb-4">📡</div>
                <p className="text-lg md:text-2xl font-bold">Ready to Broadcast!</p>
                <p className="text-sm md:text-base text-gray-600 mt-2">Choose a type and send a message</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.type === 'notification' ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 md:p-4 text-center">
                        <div className="text-xs text-yellow-400 mb-1">[{msg.timestamp}]</div>
                        <div className="text-sm md:text-base text-yellow-300">{msg.text}</div>
                      </div>
                    ) : (
                      <div className={`${msg.sender === 'You' ? 'text-right' : ''}`}>
                        <div className={`inline-block max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl ${
                          msg.sender === 'You'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                            : 'bg-black/80 border border-cyan-500/30 text-gray-200'
                        }`}>
                          <div className="text-xs opacity-80 mb-1">[{msg.timestamp}] {msg.sender}</div>
                          <div className="text-sm md:text-lg">{msg.text}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-cyan-500/30 bg-black/60 backdrop-blur-xl p-4">
          <div className="container mx-auto max-w-4xl">
            {/* Testing Tips */}
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1">
                  <h4 className="font-bold text-yellow-400 mb-2 text-sm md:text-base">How to Test:</h4>
                  <ul className="text-xs md:text-sm text-gray-300 space-y-1">
                    <li>• <strong>Open this page in 2 tabs</strong> with different names</li>
                    <li>• <strong>Select "Everyone"</strong> → Both tabs see the message</li>
                    <li>• <strong>Select "Others Only"</strong> → Only other tab sees it</li>
                    <li>• Watch the magic happen in real-time! ✨</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBroadcast()}
                placeholder={`Broadcast to ${broadcastType === 'all' ? 'everyone' : 'others only'}...`}
                className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-cyan-500/30 rounded-xl md:rounded-2xl focus:border-cyan-500 focus:outline-none text-white text-sm md:text-lg placeholder-gray-600"
              />
              <button
                onClick={handleBroadcast}
                disabled={!inputMessage.trim()}
                className={`px-6 md:px-8 py-3 md:py-4 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 text-sm md:text-base ${
                  broadcastType === 'all'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/50'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/50'
                }`}
              >
                Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Level3;