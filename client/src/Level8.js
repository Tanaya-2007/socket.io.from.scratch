import React, { useState, useEffect } from 'react';

function Level11({ socket, isConnected, onBack, onComplete, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  // Demo state
  const [message, setMessage] = useState('');
  const [sendCount, setSendCount] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [logs, setLogs] = useState([]);
  const [requestsInWindow, setRequestsInWindow] = useState(0);
  const [maxRequests] = useState(5); // 5 messages per 10 seconds

  const quiz = [
    {
      question: "What is rate limiting?",
      options: [
        "Making your app slower",
        "Limiting how many requests a user can make in a time window",
        "Limiting server bandwidth",
        "Blocking all users"
      ],
      correct: 1
    },
    {
      question: "Why is rate limiting important?",
      options: [
        "It makes the app look professional",
        "Prevents spam, abuse, and DDoS attacks",
        "It's required by law",
        "It saves money on hosting"
      ],
      correct: 1
    },
    {
      question: "What's a common rate limit strategy?",
      options: [
        "Block everyone permanently",
        "Token bucket or sliding window (e.g., 10 requests per minute)",
        "No limit - trust everyone",
        "Only allow one request per day"
      ],
      correct: 1
    },
    {
      question: "What should happen when rate limit is exceeded?",
      options: [
        "Delete user's account",
        "Crash the server",
        "Return error (429 Too Many Requests) and temporary block",
        "Ignore it silently"
      ],
      correct: 2
    },
    {
      question: "What else is important for Socket.IO security?",
      options: [
        "Validate ALL client input, sanitize data, use authentication",
        "Trust all client data - it's faster",
        "Allow anyone to emit any event",
        "Don't use HTTPS"
      ],
      correct: 0
    }
  ];

  useEffect(() => {
    // Listen for rate limit responses
    socket.on('rate-limit-warning', (data) => {
      addLog(`⚠️ Warning: ${data.remaining} requests remaining`, 'warning');
    });

    socket.on('rate-limit-exceeded', (data) => {
      setIsBlocked(true);
      setBlockedUntil(Date.now() + data.retryAfter);
      addLog(`🚫 BLOCKED! Too many requests. Try again in ${data.retryAfter / 1000}s`, 'error');
      
      // Auto unblock after timeout
      setTimeout(() => {
        setIsBlocked(false);
        setBlockedUntil(null);
        setSendCount(0);
        setRequestsInWindow(0);
        addLog('✅ Block lifted - you can send messages again', 'success');
      }, data.retryAfter);
    });

    socket.on('message-sent', (data) => {
      addLog(`✓ Message sent: "${data.message}"`, 'success');
      setHasCompletedDemo(true);
    });

    return () => {
      socket.off('rate-limit-warning');
      socket.off('rate-limit-exceeded');
      socket.off('message-sent');
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

  const handleSendMessage = () => {
    if (!message.trim() || isBlocked) return;

    // Client-side rate limit check
    if (requestsInWindow >= maxRequests) {
      addLog('🚫 Client blocked: Too many requests!', 'error');
      setIsBlocked(true);
      setBlockedUntil(Date.now() + 10000);
      
      setTimeout(() => {
        setIsBlocked(false);
        setBlockedUntil(null);
        setSendCount(0);
        setRequestsInWindow(0);
        addLog('✅ Block lifted - counter reset!', 'success');
      }, 10000);
      return;
    }

    // Send message
    socket.emit('send-message', { message: message.trim() });
    setSendCount(prev => prev + 1);
    setRequestsInWindow(prev => prev + 1);
    addLog(`📤 Sent #${requestsInWindow + 1}: "${message.trim()}"`, 'info');
    setMessage('');
    
    // Enable quiz button after first message
    setHasCompletedDemo(true);
    
    // Auto-reset counter after 10 seconds
    setTimeout(() => {
      setRequestsInWindow(prev => Math.max(0, prev - 1));
    }, 10000);
  };

  const handleSpamTest = () => {
    addLog('💥 SPAM TEST: Sending 10 rapid messages...', 'warning');
    setHasCompletedDemo(true); // Enable quiz button
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        if (!isBlocked) {
          socket.emit('send-message', { message: `Spam message ${i + 1}` });
          setSendCount(prev => prev + 1);
          setRequestsInWindow(prev => prev + 1);
        }
      }, i * 100);
    }
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
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-red-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-orange-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-red-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowQuiz(false)} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">🔒</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-red-500">LEVEL 11 QUIZ</h1>
                </div>
                
                <div className="w-16 md:w-24"></div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
            <div className="max-w-4xl mx-auto">
              
              {!quizSubmitted ? (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-red-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 border-b border-red-500/30 bg-red-500/5">
                    <div className="flex items-center gap-3 md:gap-6">
                      <div className="text-4xl md:text-6xl">🧠</div>
                      <div>
                        <h2 className="text-2xl md:text-4xl font-black text-red-400 mb-2">Security Quiz!</h2>
                        <p className="text-sm md:text-lg text-gray-300">Test your knowledge</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-10 space-y-4 md:space-y-8">
                    {quiz.map((q, qIndex) => (
                      <div key={qIndex} className="bg-black/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-red-500/20">
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
                                    ? 'bg-red-500/30 border-2 border-red-500 text-white'
                                    : 'bg-black/70 border border-red-500/20 text-gray-300 hover:border-red-500/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-red-500 bg-red-500' : 'border-red-500/30'
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

                  <div className="p-4 md:p-10 border-t border-red-500/30 bg-black/50">
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-red-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 text-center">
                    <div className="text-5xl md:text-7xl mb-4 md:mb-6">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        return percentage === 100 ? '🏆' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
                      })()}
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-black text-red-400 mb-3 md:mb-4">Quiz Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return 'Perfect! Security Expert! 🏆';
                        if (percentage >= 80) return 'Excellent! Well secured! 🎉';
                        if (percentage >= 60) return 'Good job! 👍';
                        return 'Keep learning security! 💪';
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

                    <button
                  onClick={() => {
                    onComplete(); 
                    setTimeout(() => {
                      onBack();
                    }, 500);
                  }}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
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
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-red-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-orange-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-red-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">🔒</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-red-500">Level 11</h1>
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
            
            {/* Hero */}
            <div className="text-center mb-12 md:mb-16">
              <div className="text-6xl md:text-8xl mb-6">🛡️</div>
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  RATE LIMITING & SECURITY
                </span>
              </h2>
              <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Prevent spam, abuse, and DDoS attacks - think like a professional developer!
              </p>
            </div>

            {/* Why It Matters */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-red-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-red-400 flex items-center gap-2 md:gap-3">
                <span>⚠️</span> Why Rate Limiting Matters
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">💥</div>
                  <h4 className="text-xl font-black mb-2 text-red-300">Without Rate Limiting:</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Users can spam 1000s of messages/second</li>
                    <li>• DDoS attacks crash your server</li>
                    <li>• Malicious bots abuse your API</li>
                    <li>• Server costs skyrocket 💸</li>
                    <li>• App becomes unusable for real users</li>
                  </ul>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">✅</div>
                  <h4 className="text-xl font-black mb-2 text-green-300">With Rate Limiting:</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Controlled traffic - predictable load</li>
                    <li>• Prevent abuse and spam</li>
                    <li>• Fair resource allocation</li>
                    <li>• Lower server costs</li>
                    <li>• Better user experience for everyone</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Real-World Examples */}
            <div className="mb-12 md:mb-16">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-red-400 flex items-center gap-2 md:gap-3">
                <span>🌍</span> Real-World Examples
              </h3>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-red-500/20 to-transparent border-2 border-red-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-red-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🐦</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-red-300">Twitter API</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    300 requests per 15 minutes per user
                  </p>
                  <div className="bg-red-500/10 rounded-lg p-2 text-xs">
                    <code className="text-red-400">Prevents bot spam</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500/20 to-transparent border-2 border-red-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-red-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">📱</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-red-300">WhatsApp</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    ~65 messages per minute limit
                  </p>
                  <div className="bg-red-500/10 rounded-lg p-2 text-xs">
                    <code className="text-red-400">Stops spammers</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500/20 to-transparent border-2 border-red-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-red-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🎮</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-red-300">Discord</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    5 messages per 5 seconds in chat
                  </p>
                  <div className="bg-red-500/10 rounded-lg p-2 text-xs">
                    <code className="text-red-400">Prevents flooding</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Rate Limiting Strategies */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-red-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-red-400 flex items-center gap-2 md:gap-3">
                <span>⚙️</span> Common Strategies
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">1️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-white">Fixed Window</h4>
                    <p className="text-gray-300 mb-3">Allow X requests per time window (e.g., 10 requests per minute)</p>
                    <div className="bg-black rounded-lg border border-red-500/30 p-3">
                      <code className="text-red-400 text-sm">Simple but has "burst" problem at window edges</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">2️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-yellow-400">Sliding Window</h4>
                    <p className="text-gray-300 mb-3">Track requests in rolling time window</p>
                    <div className="bg-black rounded-lg border border-yellow-500/30 p-3">
                      <code className="text-yellow-400 text-sm">More fair - prevents burst attacks ✅</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">3️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-green-400">Token Bucket</h4>
                    <p className="text-gray-300 mb-3">Users get tokens that refill over time</p>
                    <div className="bg-black rounded-lg border border-green-500/30 p-3">
                      <code className="text-green-400 text-sm">Industry standard - used by AWS, Google ⭐</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-red-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="p-4 md:p-8 border-b border-red-500/30 bg-red-500/5">
                <h3 className="text-2xl md:text-3xl font-black text-red-400 flex items-center gap-2 md:gap-3">
                  <span>👨‍💻</span> The Code
                </h3>
              </div>
              
              <div className="p-4 md:p-8">
                <div className="bg-black rounded-xl border border-red-500/30 overflow-hidden">
                  <div className="px-4 py-2 bg-black/80 border-b border-red-500/30 flex gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 md:p-6 text-xs md:text-sm overflow-x-auto font-mono">
                    <code className="text-red-400">{`// SERVER - Simple Rate Limiter (Sliding Window)
      const rateLimiters = new Map(); // Store per user

      const MAX_REQUESTS = 5;        // 5 requests
      const WINDOW_MS = 10000;       // per 10 seconds

      socket.on('send-message', (data) => {
        const userId = socket.id;
        const now = Date.now();
        
        // Get user's request history
        if (!rateLimiters.has(userId)) {
          rateLimiters.set(userId, []);
        }
        
        const requests = rateLimiters.get(userId);
        
        // Remove old requests outside window
        const validRequests = requests.filter(
          time => now - time < WINDOW_MS
        );
        
        // Check if limit exceeded
        if (validRequests.length >= MAX_REQUESTS) {
          socket.emit('rate-limit-exceeded', {
            message: 'Too many requests!',
            retryAfter: 10000
          });
          return;
        }
        
        // Add current request
        validRequests.push(now);
        rateLimiters.set(userId, validRequests);
        
        // Process message
        socket.emit('message-sent', data);
        
        // Warn if approaching limit
        if (validRequests.length >= MAX_REQUESTS - 1) {
          socket.emit('rate-limit-warning', {
            remaining: MAX_REQUESTS - validRequests.length
          });
        }
      });`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Other Security Tips */}
            <div className="mb-12 md:mb-16">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-red-400 flex items-center gap-2 md:gap-3">
                <span>🔐</span> Other Security Best Practices
              </h3>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">✅</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-red-300">Input Validation</h4>
                  <p className="text-sm md:text-base text-gray-300">Always validate & sanitize client data</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">🔑</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-red-300">Authentication</h4>
                  <p className="text-sm md:text-base text-gray-300">Use JWT tokens or session auth</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">🔒</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-red-300">Use HTTPS/WSS</h4>
                  <p className="text-sm md:text-base text-gray-300">Encrypt all Socket.IO traffic</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">🚫</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-red-300">CORS Configuration</h4>
                  <p className="text-sm md:text-base text-gray-300">Whitelist allowed origins only</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setPhase('practice')}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-red-500/50"
              >
                <span>Try Breaking It!</span>
                <span className="text-2xl md:text-3xl">→</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Practice Screen
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-red-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-orange-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="bg-black/90 backdrop-blur-xl border-b border-red-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setPhase('theory')} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Theory</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">🛡️</div>
                <h1 className="text-lg md:text-2xl font-black text-red-400">RATE LIMIT DEMO</h1>
              </div>
              
              <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                isBlocked ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-green-500/20 border-green-500 text-green-400'
              }`}>
                {isBlocked ? '🚫 BLOCKED' : '✅ ACTIVE'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            
            {/* Rate Limit Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-black/60 border border-blue-500/30 rounded-xl p-4">
                <div className="text-2xl md:text-3xl font-black text-blue-400">{requestsInWindow}</div>
                <div className="text-xs text-gray-400">Requests in Window</div>
              </div>
              
              <div className="bg-black/60 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-2xl md:text-3xl font-black text-yellow-400">{maxRequests}</div>
                <div className="text-xs text-gray-400">Max Allowed</div>
              </div>
              
              <div className="bg-black/60 border border-green-500/30 rounded-xl p-4">
                <div className="text-2xl md:text-3xl font-black text-green-400">{Math.max(0, maxRequests - requestsInWindow)}</div>
                <div className="text-xs text-gray-400">Remaining</div>
              </div>
              
              <div className="bg-black/60 border border-red-500/30 rounded-xl p-4">
                <div className="text-2xl md:text-3xl font-black text-red-400">{sendCount}</div>
                <div className="text-xs text-gray-400">Total Sent</div>
              </div>
            </div>

            {/* Blocked Banner */}
            {isBlocked && blockedUntil && (
              <div className="bg-cyan-500/20 border-2 border-cyan-500 rounded-xl p-4 mb-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🚫</div>
                  <div>
                    <h3 className="font-black text-cyan-400 text-lg">RATE LIMIT EXCEEDED!</h3>
                    <p className="text-sm text-gray-300">
                      Blocked for {Math.ceil((blockedUntil - Date.now()) / 1000)} seconds
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-black/60 border-2 border-cyan-500/30 rounded-xl p-4 md:p-6 mb-6">
              <h3 className="text-xl font-black text-cyan-400 mb-4">Send a Message</h3>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={isBlocked}
                  className="flex-1 px-4 py-3 bg-black/90 border-2 border-red-500/30 rounded-xl focus:border-red-500 focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isBlocked}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Send
                </button>
              </div>

              <button
                onClick={handleSpamTest}
                disabled={isBlocked}
                className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                💥 SPAM TEST (Send 10 Rapid Messages)
              </button>
            </div>

            {/* How It Works */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm text-gray-300">
                  <strong className="text-red-400">How it works:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Limit: <strong>{maxRequests} messages per 10 seconds</strong></li>
                    <li>• Exceed limit → <strong className="text-red-400">10 second block</strong></li>
                    <li>• Counter resets after 10 seconds</li>
                    <li>• Try the "Spam Test" to trigger it!</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Event Log */}
            <div className="bg-black/60 border-2 border-red-500/30 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
                <h3 className="font-black text-red-400">📊 Event Log</h3>
              </div>
              
              <div className="p-4 h-64 overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div>
                      <div className="text-4xl mb-2 text-center">📋</div>
                      <p className="text-sm">Send messages to see logs...</p>
                    </div>
                  </div>
                ) : (
                  logs.slice().reverse().map(log => (
                    <div key={log.id} className={`px-3 py-2 rounded-lg border-l-4 ${
                      log.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-400' :
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

          </div>
        </div>

        {/* Take Quiz Button */}
        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-red-500/30 bg-black/60 backdrop-blur-xl p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-500 hover:via-orange-500 hover:to-red-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 flex items-center justify-center gap-3 md:gap-4"
              >
                <span className="text-2xl md:text-3xl">🧠</span>
                <span>Take the Security Quiz</span>
                <span className="text-2xl md:text-3xl">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Level11;