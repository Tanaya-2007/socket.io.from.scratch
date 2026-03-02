import React, { useState, useEffect, useRef } from 'react';

function Level7({ socket, isConnected, onBack, onComplete, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authStatus, setAuthStatus] = useState('disconnected');
  const [authLogs, setAuthLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  const logsEndRef = useRef(null);
  const messagesEndRef = useRef(null);

  const quiz = [
    {
      question: "What is middleware in Socket.IO?",
      options: [
        "A type of room",
        "Code that runs BEFORE connection is established",
        "A way to send messages",
        "A database connector"
      ],
      correct: 1
    },
    {
      question: "When is middleware executed?",
      options: [
        "After every message",
        "Before connection is accepted/rejected",
        "Only on disconnect",
        "During reconnection only"
      ],
      correct: 1
    },
    {
      question: "What can middleware be used for?",
      options: [
        "Only logging",
        "Only authentication",
        "Authentication, logging, rate limiting, validation",
        "Only sending messages"
      ],
      correct: 2
    },
    {
      question: "How do you accept a connection in middleware?",
      options: [
        "return true",
        "socket.accept()",
        "next() with no error",
        "connection.allow()"
      ],
      correct: 2
    },
    {
      question: "How do you reject a connection in middleware?",
      options: [
        "return false",
        "socket.reject()",
        "next(new Error('reason'))",
        "connection.deny()"
      ],
      correct: 2
    }
  ];

  useEffect(() => {
    socket.on('auth-success', (data) => {
      setAuthStatus('authenticated');
      addLog(`✅ Authentication successful! Welcome ${data.username}`, 'success');
      setHasCompletedDemo(true);
    });

    socket.on('auth-failed', (data) => {
      setAuthStatus('rejected');
      addLog(`❌ Authentication failed: ${data.reason}`, 'error');
    });

    socket.on('secure-message', (data) => {
      addMessage(data.sender, data.text, data.timestamp);
    });

    return () => {
      socket.off('auth-success');
      socket.off('auth-failed');
      socket.off('secure-message');
    };
  }, [socket]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [authLogs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addLog = (text, type = 'info') => {
    setAuthLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const addMessage = (sender, text, timestamp = null) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: timestamp || new Date().toLocaleTimeString()
    }]);
  };

  const handleAuthenticate = () => {
    if (username.trim() && password.trim()) {
      setAuthStatus('authenticating');
      addLog(`🔄 Attempting to authenticate as "${username}"...`, 'info');
      
      socket.emit('authenticate', { username, password });
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && authStatus === 'authenticated') {
      socket.emit('secure-message', { text: inputMessage });
      addMessage('You', inputMessage);
      setInputMessage('');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct) correct++;
    });
    return { correct, total: quiz.length };
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
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
                  <span>← Back</span> <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-400">LEVEL 7 QUIZ</h1>
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
                        <h2 className="text-2xl md:text-4xl font-black text-cyan-400 mb-2">Test Your Knowledge!</h2>
                        <p className="text-sm md:text-lg text-gray-300">Answer all questions about Middleware</p>
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
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
                    >
                      Submit Quiz
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
                    
                    <h2 className="text-2xl md:text-4xl font-black text-cyan-400 mb-3 md:mb-4">Quiz Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return 'Perfect! Middleware Master! 🏆';
                        if (percentage >= 80) return 'Excellent work! 🎉';
                        if (percentage >= 60) return 'Good job! 👍';
                        return 'Keep learning! 💪';
                      })()}
                    </p>

                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-left">
                      {quiz.map((q, qIndex) => {
                        const userAnswer = quizAnswers[qIndex];
                        const isCorrect = userAnswer === q.correct;
                        
                        return (
                          <div key={qIndex} className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 ${
                            isCorrect ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'
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

                    <button onClick={onComplete}>
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
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-400">LEVEL 7</h1>
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
            <div className="mb-12 md:mb-16">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>🌍</span> Real-World Examples
              </h3>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🔐</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Authentication</h4>
                  <p className="text-xs md:text-sm text-gray-300">Only allow users with valid tokens to connect</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">⏱️</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Rate Limiting</h4>
                  <p className="text-xs md:text-sm text-gray-300">Block users making too many connections</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">📝</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Logging</h4>
                  <p className="text-xs md:text-sm text-gray-300">Track who connects, when, and from where</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>⚙️</span> How Middleware Works
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">1️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-white">Client Tries to Connect</h4>
                    <p className="text-gray-300 mb-3">User attempts connection with credentials</p>
                    <div className="bg-black rounded-lg border border-cyan-500/30 p-3">
                      <code className="text-cyan-400 text-sm">socket = io('localhost:4000', {'{'}auth: {'{'}token{'}'}{'}'});</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">2️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-yellow-400">Middleware Runs FIRST</h4>
                    <p className="text-gray-300 mb-3">Server checks credentials before allowing connection</p>
                    <div className="bg-black rounded-lg border border-yellow-500/30 p-3">
                      <code className="text-yellow-400 text-sm">io.use((socket, next) = {'{'}verify(); next();{'}'});</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">3️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-green-400">Accept or Reject</h4>
                    <p className="text-gray-300 mb-3">Valid = connect ✅ | Invalid = reject ❌</p>
                    <div className="bg-black rounded-lg border border-green-500/30 p-3">
                      <code className="text-green-400 text-sm">next() or next(new Error('Denied'));</code>
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
                    <code className="text-cyan-400">{`// Server-side middleware
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const password = socket.handshake.auth.password;
  
  // Validate credentials
  if (username === 'admin' && password === 'secret') {
    socket.username = username; // Store for later use
    next(); // ✅ Allow connection
  } else {
    next(new Error('Invalid credentials')); // ❌ Reject
  }
});

io.on('connection', (socket) => {
  console.log('Authenticated user:', socket.username);
  // This only runs if middleware passed!
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* CTA */}
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

  // PRACTICE SCREEN
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="bg-black/90 backdrop-blur-xl border-b border-cyan-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setPhase('theory')} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Theory</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">🔐</div>
                <h1 className="text-lg md:text-2xl font-black text-cyan-400">AUTH GATE</h1>
              </div>
              
              <div className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                authStatus === 'authenticated' ? 'bg-green-500/20 border-green-500 text-green-400' :
                authStatus === 'authenticating' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                authStatus === 'rejected' ? 'bg-red-500/20 border-red-500 text-red-400' :
                'bg-gray-500/20 border-gray-500 text-gray-400'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    authStatus === 'authenticated' ? 'bg-green-500 animate-pulse' :
                    authStatus === 'authenticating' ? 'bg-yellow-500 animate-pulse' :
                    authStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="uppercase">{authStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            
            {authStatus === 'disconnected' || authStatus === 'authenticating' || authStatus === 'rejected' ? (
              <div className="max-w-md mx-auto">
                <div className="bg-black/60 rounded-2xl border-2 border-cyan-500/30 p-8">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className="text-3xl font-black text-cyan-400 mb-2">Authentication Required</h2>
                    <p className="text-gray-400">Enter credentials to connect</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-cyan-300 mb-2">USERNAME</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Try: admin"
                        className="w-full px-4 py-3 bg-black/90 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-500 focus:outline-none text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-cyan-300 mb-2">PASSWORD</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Try: secret123"
                        className="w-full px-4 py-3 bg-black/90 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-500 focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAuthenticate}
                    disabled={!username.trim() || !password.trim() || authStatus === 'authenticating'}
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all"
                  >
                    {authStatus === 'authenticating' ? '🔄 Authenticating...' : '🔐 Authenticate'}
                  </button>

                  <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <p className="text-xs text-cyan-300">
                      <strong>💡 Hint:</strong> Username: <code className="bg-black/50 px-2 py-1 rounded">admin</code> | Password: <code className="bg-black/50 px-2 py-1 rounded">secret123</code>
                    </p>
                  </div>
                </div>

                {/* Auth Log */}
                <div className="mt-6 bg-black/60 rounded-xl border border-cyan-500/30 p-4 max-h-48 overflow-y-auto">
                  <h3 className="text-sm font-bold text-cyan-400 mb-3">📜 Auth Log</h3>
                  {authLogs.length === 0 ? (
                    <p className="text-xs text-gray-500">No events yet</p>
                  ) : (
                    <div className="space-y-2">
                      {authLogs.map(log => (
                        <div key={log.id} className={`text-xs p-2 rounded border-l-2 ${
                          log.type === 'success' ? 'bg-green-500/10 border-green-500' :
                          log.type === 'error' ? 'bg-red-500/10 border-red-500' :
                          'bg-cyan-500/10 border-cyan-500'
                        }`}>
                          <span className="text-gray-400">[{log.timestamp}]</span> {log.text}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-3xl font-black text-green-400 mb-2">Access Granted!</h2>
                  <p className="text-gray-400">You're now connected to the secure chat</p>
                </div>

                {/* Secure Chat */}
                <div className="bg-black/60 rounded-2xl border border-cyan-500/30 h-96 overflow-y-auto p-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div>
                        <div className="text-5xl mb-3 text-center">💬</div>
                        <p className="text-lg font-bold">Secure Chat Ready</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map(msg => (
                        <div key={msg.id} className={msg.sender === 'You' ? 'text-right' : ''}>
                          <div className={`inline-block p-3 rounded-xl ${
                            msg.sender === 'You'
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                              : 'bg-black/80 border border-cyan-500/30'
                          }`}>
                            <div className="text-xs opacity-80 mb-1">[{msg.timestamp}] {msg.sender}</div>
                            <div>{msg.text}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Send secure message..."
                    className="flex-1 px-4 py-3 bg-black/90 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-500 focus:outline-none text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-cyan-500/30 bg-black/60 backdrop-blur-xl p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:via-teal-500 hover:to-blue-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center gap-3 md:gap-4"
              >
                <span className="text-2xl md:text-3xl">🧠</span>
                <span>Take the Test</span>
                <span className="text-2xl md:text-3xl">→</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Level7;