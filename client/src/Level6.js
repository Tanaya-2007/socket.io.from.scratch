import React, { useState, useEffect } from 'react';

function Level6({ socket, isConnected, onBack }) {
  const [level6Phase, setLevel6Phase] = useState('theory');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [errorLog, setErrorLog] = useState([]);
  const [connectionEvents, setConnectionEvents] = useState([]);

  const quiz = [
    {
      question: "What event fires when Socket.IO loses connection?",
      options: [
        "socket.on('error')",
        "socket.on('disconnect')",
        "socket.on('offline')",
        "socket.on('lost')"
      ],
      correct: 1
    },
    {
      question: "What should you do when a user disconnects?",
      options: [
        "Crash the app",
        "Do nothing",
        "Show 'Reconnecting...' message",
        "Delete all their data"
      ],
      correct: 2
    },
    {
      question: "What event fires when reconnection succeeds?",
      options: [
        "socket.on('reconnect')",
        "socket.on('online')",
        "socket.on('back')",
        "socket.on('restored')"
      ],
      correct: 0
    },
    {
      question: "Why is error handling important?",
      options: [
        "It makes code look professional",
        "It prevents user confusion when network fails",
        "It's required by law",
        "It makes apps slower"
      ],
      correct: 1
    },
    {
      question: "What's the best user experience during reconnection?",
      options: [
        "Show nothing, let them wonder",
        "Show 'Error!' and close app",
        "Show 'Reconnecting...' with loading indicator",
        "Redirect to homepage"
      ],
      correct: 2
    }
  ];

  useEffect(() => {
    // Listen for disconnect
    socket.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      addErrorLog('Disconnected: ' + reason);
      addConnectionEvent('disconnect', reason);
    });

    // Listen for reconnect attempt
    socket.io.on('reconnect_attempt', (attemptNumber) => {
      setReconnectAttempts(attemptNumber);
      setConnectionStatus('reconnecting');
      addConnectionEvent('reconnect_attempt', `Attempt ${attemptNumber}`);
    });

    // Listen for reconnect success
    socket.io.on('reconnect', (attemptNumber) => {
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      addErrorLog('Reconnected successfully!');
      addConnectionEvent('reconnect', `After ${attemptNumber} attempts`);
      setHasCompletedDemo(true); // Mark demo as complete when reconnected
    });

    // Listen for reconnect error
    socket.io.on('reconnect_error', (error) => {
      addErrorLog('Reconnect failed: ' + error.message);
      addConnectionEvent('reconnect_error', error.message);
    });

    // Listen for connect error
    socket.on('connect_error', (error) => {
      addErrorLog('Connection error: ' + error.message);
      addConnectionEvent('connect_error', error.message);
    });

    return () => {
      socket.off('disconnect');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect');
      socket.io.off('reconnect_error');
      socket.off('connect_error');
    };
  }, [socket]);

  const addErrorLog = (message) => {
    setErrorLog(prev => [...prev, {
      message,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    }]);
  };

  const addConnectionEvent = (type, details) => {
    setConnectionEvents(prev => [...prev, {
      type,
      details,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    }]);
  };

  const handleForceDisconnect = () => {
    socket.disconnect();
    addErrorLog('Manually disconnected');
    addConnectionEvent('disconnect', 'io client disconnect');
  };

  const handleForceReconnect = () => {
    addErrorLog('Starting reconnection...');
    setConnectionStatus('reconnecting');
    
    // Attempt 1
    setReconnectAttempts(1);
    addConnectionEvent('reconnect_attempt', 'Attempt 1');
    addErrorLog('Reconnection attempt #1...');
    
    setTimeout(() => {
      //Attempt 2
      setReconnectAttempts(2);
      addConnectionEvent('reconnect_attempt', 'Attempt 2');
      addErrorLog('Reconnection attempt #2...');
    }, 1000);
    
    setTimeout(() => {
      // Attempt 3
      setReconnectAttempts(3);
      addConnectionEvent('reconnect_attempt', 'Attempt 3');
      addErrorLog('Reconnection attempt #3...');
    }, 2000);
    
    setTimeout(() => {
      // RECONNECT HERE!
      socket.connect();
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      addErrorLog('Reconnect successful!');
      addConnectionEvent('reconnect', 'After 3 attempts');
      addErrorLog('Reconnected successfully!');
      setHasCompletedDemo(true); 
    }, 3000); 
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

  const handleBack = () => {
    setLevel6Phase('theory');
    onBack();
  };

  // ═══════════════════════════════════════════════════════════
  // QUIZ SCREEN
  // ═══════════════════════════════════════════════════════════
  if (showQuiz) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-[#0d1529] border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowQuiz(false)} className="px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-purple-500/20">
                  <span>←</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚡</div>
                  <h1 className="text-2xl sm:text-3xl font-black text-purple-500">LEVEL 6 QUIZ</h1>
                </div>
                <div className="w-16"></div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
            {!quizSubmitted ? (
              <div className="bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl overflow-hidden">
                <div className="p-10 border-b border-purple-500/30 bg-purple-500/5">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">🧠</div>
                    <div>
                      <h2 className="text-4xl font-black text-purple-400 mb-2">Quiz Time</h2>
                      <p className="text-lg text-gray-300">Test Your Knowledge</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  {quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-black/50 p-6 rounded-2xl border border-purple-500/20">
                      <h3 className="text-xl font-bold text-white mb-4">Q{qIndex + 1}: {q.question}</h3>
                      <div className="space-y-3">
                        {q.options.map((option, oIndex) => {
                          const isSelected = quizAnswers[qIndex] === oIndex;
                          return (
                            <button
                              key={oIndex}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                              className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all ${
                                isSelected
                                  ? 'bg-purple-500/30 border-2 border-purple-500 text-white'
                                  : 'bg-black/70 border border-purple-500/20 text-gray-300 hover:border-purple-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'
                                }`}>
                                  {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                </div>
                                <span>{option}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-10 border-t border-purple-500/30 bg-black/50">
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== quiz.length}
                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xl font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl overflow-hidden">
                <div className="p-10 text-center">
                  <div className="text-7xl mb-6">
                    {(() => {
                      const { correct, total } = calculateScore();
                      const percentage = (correct / total) * 100;
                      return percentage === 100 ? '🏆' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
                    })()}
                  </div>
                  
                  <h2 className="text-4xl font-black text-purple-400 mb-4">Quiz Complete!</h2>
                  <div className="text-6xl font-black text-white mb-4">
                    {calculateScore().correct} / {calculateScore().total}
                  </div>
                  <p className="text-xl text-gray-300 mb-8">
                    {(() => {
                      const { correct, total } = calculateScore();
                      const percentage = (correct / total) * 100;
                      if (percentage === 100) return 'Perfect Score! 🏆';
                      if (percentage >= 80) return 'Excellent Work! 🎉';
                      if (percentage >= 60) return 'Good Job! 👍';
                      return 'Keep Learning! 💪';
                    })()}
                  </p>

                  <div className="space-y-4 mb-8 text-left">
                    {quiz.map((q, qIndex) => {
                      const userAnswer = quizAnswers[qIndex];
                      const isCorrect = userAnswer === q.correct;
                      
                      return (
                        <div key={qIndex} className={`p-4 rounded-xl border-2 ${
                          isCorrect ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{isCorrect ? '✓' : '✗'}</div>
                            <div className="flex-1">
                              <p className="font-bold text-white mb-2">Q{qIndex + 1}</p>
                              <p className="text-sm text-gray-300 mb-2">Your answer: {q.options[userAnswer]}</p>
                              {!isCorrect && (
                                <p className="text-sm text-green-400">Correct: {q.options[q.correct]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-black rounded-2xl transition-all transform hover:scale-105"
                  >
                    Back to Levels
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // THEORY SCREEN
  // ═══════════════════════════════════════════════════════════
  if (level6Phase === 'theory') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-[#0d1529] border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-purple-500/20 text-sm sm:text-base"
                >
                  <span>←</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">⚡</div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                    <span className="text-purple-500">LEVEL 6</span>
                  </h1>
                </div>

                <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border ${
                  isConnected 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-red-500/20 border-red-500 text-red-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="hidden sm:inline">{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="border-t border-purple-500/20 bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 tracking-wide">PROGRESS</span>
                  <span className="text-lg sm:text-xl font-black text-purple-400">0%</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 rounded-full bg-white/10"></div>
                  <div className="flex-1 h-2 rounded-full bg-white/10"></div>
                  <div className="flex-1 h-2 rounded-full bg-white/10"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>⚠️</span>
                  <span>🔌</span>
                  <span>📊</span>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
            
            {/* Real-World Examples */}
            <div className="mb-12 sm:mb-16 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-purple-400 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🌍</span>
                <span>Real-World Examples</span>
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">💬</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-purple-400">WhatsApp</h4>
                  <p className="text-sm sm:text-base text-gray-300">Shows "Connecting..." when WiFi drops</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎮</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-purple-400">Gaming</h4>
                  <p className="text-sm sm:text-base text-gray-300">Reconnects automatically after lag spike</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📱</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-purple-400">Mobile Apps</h4>
                  <p className="text-sm sm:text-base text-gray-300">Handle network changes gracefully</p>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-purple-400 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🔑</span>
                <span>Key Concepts</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">⚠️</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">Detect Errors</h4>
                  <p className="text-sm sm:text-base text-gray-300">Listen for disconnect events</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔄</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">Auto-Reconnect</h4>
                  <p className="text-sm sm:text-base text-gray-300">Socket.IO reconnects automatically</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">👤</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">User Feedback</h4>
                  <p className="text-sm sm:text-base text-gray-300">Show "Reconnecting..." messages</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">✅</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">Success Handler</h4>
                  <p className="text-sm sm:text-base text-gray-300">Update UI when reconnected</p>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl overflow-hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="p-6 sm:p-8 border-b border-purple-500/30 bg-purple-500/5">
                <h3 className="text-2xl sm:text-3xl font-black text-purple-400 flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">👨‍💻</span>
                  <span>The Code</span>
                </h3>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="bg-black rounded-xl sm:rounded-2xl border border-purple-500/30 overflow-hidden">
                  <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b border-purple-500/30 flex gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm overflow-x-auto font-mono">
                    <code className="text-purple-400">{`// Listen for disconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  showMessage('Connection lost. Reconnecting...');
});

// Listen for reconnection
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  showMessage('Connected! ✓');
});

// Listen for reconnection attempt
socket.io.on('reconnect_attempt', () => {
  console.log('Trying to reconnect...');
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-center animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setLevel6Phase('practice')}
                className="w-full sm:w-auto px-6 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-base sm:text-xl lg:text-2xl font-black rounded-2xl sm:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-3 sm:gap-4 mx-auto"
              >
                <span>Got it! Let's Practice</span>
                <span className="text-xl sm:text-2xl lg:text-3xl">→</span>
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

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PRACTICE SCREEN - ERROR HANDLING DEMO
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="bg-[#0d1529] border-b border-purple-500/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setLevel6Phase('theory')}
                className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-purple-500/20 text-sm sm:text-base"
              >
                <span>←</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">⚡</div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                  <span className="text-purple-500">LEVEL 6</span>
                </h1>
              </div>

              <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border ${
                connectionStatus === 'connected' ? 'bg-green-500/20 border-green-500 text-green-400' :
                connectionStatus === 'reconnecting' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                'bg-red-500/20 border-red-500 text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                    connectionStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`}></div>
                 <span className="uppercase">
                  {connectionStatus === 'connected' ? 'CONNECTED' :
                  connectionStatus === 'reconnecting' ? `RETRY #${reconnectAttempts}` :
                  'DISCONNECTED'}
                </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl sm:text-4xl font-black text-purple-400 mb-6 sm:mb-8 text-center">
              Error Handling Live Demo
            </h2>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleForceDisconnect}
                disabled={connectionStatus === 'disconnected' || connectionStatus === 'reconnecting'}
                className="px-6 py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="text-3xl mb-2">🔌</div>
                <div>Force Disconnect</div>
              </button>
              <button
                onClick={handleForceReconnect}
                disabled={connectionStatus === 'connected' || connectionStatus === 'reconnecting'}
                className="px-6 py-4 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="text-3xl mb-2">🔄</div>
                <div>Force Reconnect</div>
              </button>
            </div>

            {/* Error Log */}
            <div className="bg-black rounded-2xl border-2 border-purple-500/30 overflow-hidden mb-6">
              <div className="px-6 py-4 bg-black/90 border-b border-purple-500/30 flex items-center justify-between">
                <span className="text-sm text-gray-400 font-mono">Error Console</span>
                <span className="px-3 py-1 border border-purple-500/50 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400">
                  {errorLog.length} events
                </span>
              </div>
              <div className="p-6 h-64 overflow-y-auto font-mono text-sm custom-scrollbar-purple">
                {errorLog.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-lg font-bold">No errors yet</p>
                    <p className="text-sm text-gray-600 mt-2">Try disconnecting!</p>
                  </div>
                ) : (
                  <>
                    {errorLog.map((log) => (
                      <div key={log.id} className="mb-2 p-3 bg-purple-500/10 border-l-4 border-purple-500 rounded">
                        <div className="text-purple-400">
                          [{log.timestamp}] {log.message}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Connection Events */}
            <div className="bg-black rounded-2xl border-2 border-purple-500/30 overflow-hidden">
              <div className="px-6 py-4 bg-black/90 border-b border-purple-500/30">
                <span className="text-sm text-gray-400 font-mono">Connection Events</span>
              </div>
              <div className="p-6 space-y-3 max-h-64 overflow-y-auto custom-scrollbar-purple">
                {connectionEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No events yet
                  </div>
                ) : (
                  connectionEvents.slice(-5).reverse().map((event) => (
                    <div key={event.id} className={`p-3 rounded border-l-4 ${
                      event.type === 'disconnect' ? 'bg-red-500/10 border-red-500' :
                      event.type === 'reconnect' ? 'bg-green-500/10 border-green-500' :
                      event.type === 'reconnect_attempt' ? 'bg-yellow-500/10 border-yellow-500' :
                      'bg-orange-500/10 border-orange-500'
                    }`}>
                      <div className="font-bold text-sm">
                        {event.type === 'disconnect' ? '❌ Disconnected' :
                         event.type === 'reconnect' ? '✅ Reconnected' :
                         event.type === 'reconnect_attempt' ? '🔄 Reconnecting' :
                         '⚠️ Error'}
                      </div>
                      <div className="text-gray-400 text-sm">{event.details}</div>
                      <div className="text-gray-600 text-xs">{event.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm text-gray-300">
                  <strong className="text-purple-300">How to Test:</strong>
                  <ol className="mt-2 space-y-1 list-decimal list-inside">
                    <li>Click "Force Disconnect" → Status changes to DISCONNECTED (red)</li>
                    <li>Click "Force Reconnect" → Watch status change to RECONNECTING (yellow) with counter</li>
                    <li>After reconnect → Status becomes CONNECTED (green) → "Take the Test" button appears!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Take Quiz Button */}
        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-4 sm:p-6">
            <div className="max-w-4xl mx-auto text-center">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg sm:text-2xl font-black rounded-2xl sm:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-3 sm:gap-4 mx-auto"
              >
                <span>🧠</span>
                <span>Take the Test</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .custom-scrollbar-purple::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar-purple::-webkit-scrollbar-track {
          background: #000000;
        }

        .custom-scrollbar-purple::-webkit-scrollbar-thumb {
          background: #a855f7;
          border-radius: 10px;
          box-shadow: 0 0 10px #a855f7;
        }

        .custom-scrollbar-purple::-webkit-scrollbar-thumb:hover {
          background: #9333ea;
          box-shadow: 0 0 15px #a855f7;
        }
      `}</style>
    </div>
  );
}

export default Level6;