import React, { useState, useEffect } from 'react';

function Level12({ socket, isConnected, onBack, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  // Demo state
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [serverInfo, setServerInfo] = useState({ serverId: 'Server 1', totalServers: 1 });
  const [logs, setLogs] = useState([]);
  const [simulatedServerMessages, setSimulatedServerMessages] = useState(0);

  const quiz = [
    {
      question: "What is a Redis Adapter in Socket.IO?",
      options: [
        "A database for storing messages",
        "Allows Socket.IO to work across multiple servers/processes",
        "A faster version of Socket.IO",
        "A security feature"
      ],
      correct: 1
    },
    {
      question: "Why do you need Redis Adapter?",
      options: [
        "To make Socket.IO faster",
        "It's required for all apps",
        "To scale horizontally - run multiple server instances",
        "To save money on hosting"
      ],
      correct: 2
    },
    {
      question: "What happens WITHOUT Redis Adapter?",
      options: [
        "Users on Server 1 can't talk to users on Server 2",
        "The app doesn't work at all",
        "Everything works fine",
        "Redis is always required"
      ],
      correct: 0
    },
    {
      question: "How does Redis Adapter work?",
      options: [
        "Stores all messages in Redis",
        "Acts as a pub/sub message broker between servers",
        "Replaces Socket.IO completely",
        "Only works with Redis databases"
      ],
      correct: 1
    },
    {
      question: "When should you use Redis Adapter?",
      options: [
        "Always, from day 1",
        "Never, it's too complex",
        "When scaling to multiple servers (production)",
        "Only for chat apps"
      ],
      correct: 2
    }
  ];

  useEffect(() => {
    // Listen for messages
    socket.on('chat:message', (data) => {
      setMessages(prev => [...prev, data]);
      addLog(`📨 Message from ${data.username}: "${data.text}"`, 'info');
    });

    socket.on('user:joined', (data) => {
      setOnlineUsers(data.onlineUsers);
      addLog(`✅ ${data.username} joined! (${data.onlineUsers} online)`, 'success');
    });

    socket.on('user:left', (data) => {
      setOnlineUsers(data.onlineUsers);
      addLog(`👋 ${data.username} left (${data.onlineUsers} online)`, 'warning');
    });

    socket.on('server:info', (data) => {
      setServerInfo(data);
      addLog(`🖥️ Connected to ${data.serverId} (${data.totalServers} servers running)`, 'info');
    });

    return () => {
      socket.off('chat:message');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('server:info');
    };
  }, [socket]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev.slice(-9), {
      id: Date.now() + Math.random(),
      msg,
      type,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const handleJoin = () => {
    if (!username.trim()) return;

    socket.emit('chat:join', { username: username.trim() });
    setIsJoined(true);
    setHasCompletedDemo(true);
    addLog(`✅ Joined as ${username.trim()}`, 'success');
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const msg = {
      username,
      text: message.trim(),
      timestamp: new Date().toISOString()
    };

    socket.emit('chat:send', msg);
    setMessages(prev => [...prev, { ...msg, own: true }]);
    addLog(`📤 Sent: "${message.trim()}"`, 'success');
    setMessage('');
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct) correct++;
    });
    return { correct, total: quiz.length };
  };

  // QUIZ SCREEN
  if (showQuiz) {
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
                <button onClick={() => setShowQuiz(false)} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-500">LEVEL 12 QUIZ</h1>
                </div>
                
                <div className="w-16 md:w-24"></div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
            <div className="max-w-4xl mx-auto">
              
              {!quizSubmitted ? (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-cyan-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 border-b border-cyan-500/30 bg-cyan-500/5">
                    <div className="flex items-center gap-3 md:gap-6">
                      <div className="text-4xl md:text-6xl">🧠</div>
                      <div>
                        <h2 className="text-2xl md:text-4xl font-black text-cyan-400 mb-2">Final Quiz!</h2>
                        <p className="text-sm md:text-lg text-gray-300">Test your knowledge</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-10 space-y-4 md:space-y-8">
                    {quiz.map((q, qIndex) => (
                      <div key={qIndex} className="bg-black/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-cyan-500/20">
                        <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4">
                          Q{qIndex + 1}: {q.question}
                        </h3>
                        <div className="space-y-2 md:space-y-3">
                          {q.options.map((option, oIndex) => {
                            const isSelected = quizAnswers[qIndex] === oIndex;
                            return (
                              <button
                                key={oIndex}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                                className={`w-full text-left px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-cyan-500/30 border-2 border-cyan-500 text-white'
                                    : 'bg-black/70 border border-cyan-500/20 text-gray-300 hover:border-cyan-500/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-cyan-500/30'
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 md:w-3 md:h-3 bg-white rounded-full"></div>}
                                  </div>
                                  <span className="text-xs md:text-base">{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 md:p-10 border-t border-cyan-500/30 bg-black/50">
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
                    >
                      Submit Final Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-cyan-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 text-center">
                    <div className="text-5xl md:text-7xl mb-4 md:mb-6">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        return percentage === 100 ? '🏆' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
                      })()}
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-black text-cyan-400 mb-3 md:mb-4">Course Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return '🏆 Perfect! You\'re a Socket.IO Master!';
                        if (percentage >= 80) return '🎉 Excellent! Production-ready!';
                        if (percentage >= 60) return '👍 Great job! Keep practicing!';
                        return '💪 Good start! Review the concepts!';
                      })()}
                    </p>

                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-left">
                      {quiz.map((q, qIndex) => {
                        const userAnswer = quizAnswers[qIndex];
                        const isCorrect = userAnswer === q.correct;
                        
                        return (
                          <div key={qIndex} className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 ${
                            isCorrect ? 'bg-green-500/10 border-green-500/50' : 'bg-cyan-500/10 border-cyan-500/50'
                          }`}>
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="text-xl md:text-2xl">{isCorrect ? '✓' : '✗'}</div>
                              <div className="flex-1">
                                <p className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Q{qIndex + 1}</p>
                                <p className="text-xs md:text-sm text-gray-300 mb-1 md:mb-2">Your answer: {q.options[userAnswer]}</p>
                                {!isCorrect && (
                                  <p className="text-xs md:text-sm text-green-400">Correct: {q.options[q.correct]}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-xl p-6 mb-8">
                      <div className="text-5xl mb-3">🎓</div>
                      <h3 className="text-2xl font-black text-cyan-400 mb-2">Congratulations!</h3>
                      <p className="text-gray-300">You've completed all 12 levels of Socket.IO mastery!</p>
                    </div>

                    <button
                      onClick={onBack}
                      className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
                    >
                      Back to Levels
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // THEORY SCREEN
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
                  <div className="text-2xl md:text-3xl">🌐</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-500">Level 12</h1>
                </div>
                
                <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                  isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                }`}>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-cyan-500'}`}></div>
                    <span>{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-6xl">
            
            {/* The Problem */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>🤔</span> The Problem
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">❌</div>
                  <h4 className="text-xl font-black mb-2 text-red-300">Without Redis Adapter:</h4>
                  <div className="bg-black/50 rounded-lg p-4 mb-3">
                    <pre className="text-xs text-gray-300">{`Server 1 ─ User A
Server 2 ─ User B

User A sends message
→ Only Server 1 knows!
→ User B never gets it! 💔`}</pre>
                  </div>
                  <p className="text-sm text-gray-300">Each server is isolated - messages don't cross servers!</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">✅</div>
                  <h4 className="text-xl font-black mb-2 text-green-300">With Redis Adapter:</h4>
                  <div className="bg-black/50 rounded-lg p-4 mb-3">
                    <pre className="text-xs text-gray-300">{`Server 1 ─ User A
   ↓ (Redis pub/sub)
Server 2 ─ User B

User A sends message
→ Redis broadcasts to all!
→ User B gets it! ✅`}</pre>
                  </div>
                  <p className="text-sm text-gray-300">Redis connects all servers - everyone stays in sync!</p>
                </div>
              </div>
            </div>

            {/* Real-World Use Case */}
            <div className="mb-12 md:mb-16">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>🌍</span> Real-World Example
              </h3>

              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border-2 border-cyan-500/30 rounded-2xl p-6 md:p-8">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-2xl font-black mb-4 text-cyan-300">Slack / Discord / WhatsApp</h4>
                
                <div className="space-y-4 text-gray-300">
                  <p className="flex items-start gap-3">
                    <span className="text-cyan-400 text-xl">1.</span>
                    <span><strong className="text-white">Millions of users online</strong> - can't fit on 1 server!</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-cyan-400 text-xl">2.</span>
                    <span><strong className="text-white">Need 10+ server instances</strong> - load balancer distributes traffic</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-cyan-400 text-xl">3.</span>
                    <span><strong className="text-white">Redis Adapter</strong> ensures all servers share events</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-cyan-400 text-xl">4.</span>
                    <span><strong className="text-white">Result:</strong> Users on different servers can talk seamlessly!</span>
                  </p>
                </div>

                <div className="mt-6 bg-black/50 rounded-lg p-4">
                  <p className="text-sm text-cyan-300">
                    <strong>💡 Fun Fact:</strong> Without Redis, you'd need sticky sessions (users locked to one server) - terrible for scaling!
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>⚙️</span> How Redis Adapter Works
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">1️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-white">Pub/Sub Pattern</h4>
                    <p className="text-gray-300 mb-3">Redis acts as a message broker - publishes events to all subscribers</p>
                    <div className="bg-black rounded-lg border border-cyan-500/30 p-3">
                      <code className="text-cyan-400 text-sm">Server 1 → Redis → Server 2, Server 3, Server 4...</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">2️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-yellow-400">Broadcasting</h4>
                    <p className="text-gray-300 mb-3">When you call io.emit(), Redis sends to ALL servers</p>
                    <div className="bg-black rounded-lg border border-yellow-500/30 p-3">
                      <code className="text-yellow-400 text-sm">io.emit('message') → Redis → All servers get it!</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">3️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-green-400">Rooms Sync</h4>
                    <p className="text-gray-300 mb-3">Even rooms/namespaces work across servers!</p>
                    <div className="bg-black rounded-lg border border-green-500/30 p-3">
                      <code className="text-green-400 text-sm">io.to('room1').emit() → Redis syncs across all servers ⭐</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
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
                    <code className="text-cyan-400">{`// 1. Install Redis Adapter
npm install @socket.io/redis-adapter redis

// 2. Setup in server.js
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const io = new Server(server);

// Create Redis clients
const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

// Connect Redis
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  // Attach adapter
  io.adapter(createAdapter(pubClient, subClient));
  console.log('✅ Redis Adapter connected!');
});

// Now you can run MULTIPLE servers!
// All will stay in sync via Redis

// Example: Run 4 server instances
// PORT=3001 node server.js
// PORT=3002 node server.js  
// PORT=3003 node server.js
// PORT=3004 node server.js

// Add load balancer (nginx/AWS ALB)
// Users connect to any server - Redis syncs everything!`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* When to Use */}
            <div className="mb-12 md:mb-16">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>📊</span> When to Use Redis Adapter
              </h3>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-xl p-5 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl mb-3">🏠</div>
                  <h4 className="text-lg font-black mb-2 text-red-300">Small Apps</h4>
                  <p className="text-sm text-gray-300">1 server? Don't need it yet!</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-xl p-5 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl mb-3">📈</div>
                  <h4 className="text-lg font-black mb-2 text-yellow-300">Growing Apps</h4>
                  <p className="text-sm text-gray-300">2-3 servers? Consider adding it</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-xl p-5 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl mb-3">🚀</div>
                  <h4 className="text-lg font-black mb-2 text-green-300">Production</h4>
                  <p className="text-sm text-gray-300">5+ servers? MUST HAVE! ⭐</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setPhase('practice')}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-cyan-500/50"
              >
                <span>See It In Action!</span>
                <span className="text-2xl md:text-3xl">→</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // PRACTICE SCREEN
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
                <div className="text-2xl md:text-3xl">💬</div>
                <h1 className="text-lg md:text-2xl font-black text-cyan-400">MULTI-SERVER CHAT</h1>
              </div>
              
              <div className="flex items-center gap-2">
              <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
              }`}>
                {isConnected ? '✅ ONLINE' : '❌ OFFLINE'}
              </div>
              
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-cyan-500/20 border-cyan-500 text-cyan-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span>REDIS</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">

            {/* Server Info */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-black text-cyan-400">{serverInfo.serverId}</div>
            <div className="text-xs text-gray-400">Connected Server</div>
          </div>
          
          <div className="bg-black/60 border border-blue-500/30 rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-black text-blue-400">{onlineUsers}</div>
            <div className="text-xs text-gray-400">Users Online</div>
          </div>
          
          <div className="bg-black/60 border border-green-500/30 rounded-xl p-4">
            <div className="text-2xl md:text-3xl font-black text-green-400 flex items-center justify-center">
              <span className="animate-pulse">✓</span>
            </div>
            <div className="text-xs text-gray-400">Redis Active</div>
          </div>
        </div>

            {/* Info Banner */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm text-gray-300">
                  <strong className="text-cyan-400">Simulated Multi-Server Demo:</strong>
                  <p className="mt-2">In production, you'd run multiple server instances with Redis. This demo simulates the concept - messages work across "virtual" servers!</p>
                </div>
              </div>
            </div>

            {/* Redis Sync Visualization */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-2 border-cyan-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-cyan-400 flex items-center gap-2">
                  <span className="text-lg">🌐</span> Redis Pub/Sub Active
                </h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-400 font-bold">SYNCING</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/50 rounded-lg p-2 border border-cyan-500/30">
                <div className="text-xs text-gray-400">Your Server</div>
                <div className="text-cyan-400 text-lg font-black animate-pulse">●</div>
                <div className="text-xs text-cyan-400 font-bold mt-1">Server-1</div>
              </div>
              <div className="bg-black/50 rounded-lg p-2 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-cyan-400 animate-pulse text-sm">⟷</div>
                  <div className="text-xs text-cyan-400 font-bold">Redis</div>
                  <div className="text-cyan-400 animate-pulse text-sm">⟷</div>
                </div>
              </div>
              <div className="bg-black/50 rounded-lg p-2 border border-purple-500/30">
                <div className="text-xs text-gray-400">Other Servers</div>
                <div className="text-purple-400 text-lg font-black">●</div>
                <div className="text-xs text-purple-400 font-bold mt-1">Server-2+</div>
              </div>
            </div>
              
              <p className="text-xs text-gray-400 mt-2 text-center">
                All messages sync across servers in real-time via Redis
              </p>
            </div>

            {/* Simulate Multi-Server Button */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border-2 border-cyan-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-black text-cyan-400 flex items-center gap-2">
                  <span className="text-lg">🎮</span> Test Multi-Server
                </h4>
                <p className="text-xs text-gray-400 mt-1">Simulate a message from Server 2 via Redis</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                // Simulate a message from "Server 2"
                const simulatedMsg = {
                  username: 'User_Server2',
                  text: `Hello from Server 2! (via Redis) #${simulatedServerMessages + 1}`,
                  timestamp: new Date().toISOString(),
                  fromServer: 'Server-2'
                };
                
                setMessages(prev => [...prev, simulatedMsg]);
                setSimulatedServerMessages(prev => prev + 1);
                addLog(`🌐 Redis synced message from Server-2!`, 'info');
                
                // Visual feedback
                setTimeout(() => {
                  addLog(`✅ Message delivered across servers via Redis pub/sub`, 'success');
                }, 300);
              }}
              disabled={!isJoined}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-600 hover:from-cyan-500 hover:to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-100 flex items-center justify-center gap-2"
            >
              <span>🌐</span>
              <span>Simulate Server 2 Message</span>
            </button>
            
            <div className="mt-3 text-xs text-center text-gray-400">
              Messages simulated: <span className="text-purple-400 font-bold">{simulatedServerMessages}</span>
            </div>
          </div>

            {/* Join or Chat */}
            {!isJoined ? (
              <div className="max-w-md mx-auto mt-8">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 p-8 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-3xl font-black text-cyan-400 mb-2">Join Multi-Server Chat</h2>
                  <p className="text-gray-400 mb-6">Experience Redis Adapter in action!</p>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && username.trim() && handleJoin()}
                    placeholder="Enter your username..."
                    className="w-full px-4 py-3 mb-4 bg-black/90 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-center text-lg placeholder-gray-600"
                  />

                  <button
                    onClick={handleJoin}
                    disabled={!username.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    💬 Join Chat
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="bg-black/60 border-2 border-cyan-500/30 rounded-xl overflow-hidden mb-4">
                  <div className="px-4 py-3 bg-cyan-500/10 border-b border-cyan-500/30">
                    <h3 className="font-black text-cyan-400">💬 Chat Messages</h3>
                  </div>
                  
            <div className="p-4 h-64 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div>
                    <div className="text-4xl mb-2 text-center">💬</div>
                    <p className="text-sm">No messages yet...</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg ${
                    msg.own ? 'bg-cyan-500/20 border-l-4 border-cyan-500' : 
                    msg.fromServer === 'Server-2' ? 'bg-purple-500/10 border-l-4 border-purple-500' :
                    'bg-gray-500/10 border-l-4 border-gray-500'
                  } ${!msg.own ? 'animate-fadeIn' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400">{msg.username}</span>
                        {msg.fromServer === 'Server-2' && (
                          <span className="text-xs bg-purple-500/20 border border-purple-500/50 text-purple-400 px-2 py-0.5 rounded-full">
                            Server-2
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-white">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
                </div>

                {/* Input */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-black/90 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-500 focus:outline-none text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Send
                  </button>
                </div>

                {/* Event Log */}
                <div className="bg-black/60 border-2 border-cyan-500/30 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-cyan-500/10 border-b border-cyan-500/30">
                    <h3 className="font-black text-cyan-400">📊 Event Log</h3>
                  </div>
                  
                  <div className="p-4 h-48 overflow-y-auto space-y-2">
                    {logs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div>
                          <div className="text-4xl mb-2 text-center">📋</div>
                          <p className="text-sm">Events appear here...</p>
                        </div>
                      </div>
                    ) : (
                      logs.slice().reverse().map(log => (
                        <div key={log.id} className={`px-3 py-2 rounded-lg border-l-4 ${
                          log.type === 'error' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' :
                          log.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' :
                          log.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' :
                          'bg-blue-500/10 border-blue-500 text-blue-300'
                        }`}>
                          <span className="text-xs text-gray-500">[{log.time}]</span> {log.msg}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Take Quiz Button */}
        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-cyan-500/30 bg-black/60 backdrop-blur-xl p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center gap-3 md:gap-4"
              >
                <span className="text-2xl md:text-3xl">🏆</span>
                <span>Take Final Quiz</span>
                <span className="text-2xl md:text-3xl">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    `}</style>
    </div>
  );
}

export default Level12;