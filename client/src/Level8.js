import React, { useState, useEffect, useRef } from 'react';

function Level8({ socket, isConnected, onBack, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [playerName, setPlayerName] = useState('');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerScore, setPlayerScore] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  const [isInGame, setIsInGame] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  const logEndRef = useRef(null);

  const quiz = [
    {
      question: "What is a custom event in Socket.IO?",
      options: [
        "A built-in Socket.IO event",
        "An event YOU create with any name",
        "Only 'message' events",
        "Events that cost money"
      ],
      correct: 1
    },
    {
      question: "Can you send data with custom events?",
      options: [
        "No, only event names",
        "Only strings",
        "Yes! Objects, arrays, strings, numbers, etc.",
        "Only numbers"
      ],
      correct: 2
    },
    {
      question: "What's the syntax to emit a custom event?",
      options: [
        "socket.send('eventName', data)",
        "socket.emit('eventName', data)",
        "socket.custom('eventName', data)",
        "socket.trigger('eventName', data)"
      ],
      correct: 1
    },
    {
      question: "What's the syntax to listen for a custom event?",
      options: [
        "socket.listen('eventName', callback)",
        "socket.receive('eventName', callback)",
        "socket.on('eventName', callback)",
        "socket.watch('eventName', callback)"
      ],
      correct: 2
    },
    {
      question: "Why use custom events instead of just 'message'?",
      options: [
        "They're faster",
        "Clear, organized code - different events for different actions",
        "They use less bandwidth",
        "Required by Socket.IO"
      ],
      correct: 1
    }
  ];

  useEffect(() => {
    socket.on('game:joined', (data) => {
      setIsInGame(true);
      setPlayerHealth(data.health);
      setPlayerScore(data.score);
      addLog(`✅ Joined game as ${data.playerName}!`, 'success');
    });

    socket.on('game:attack', (data) => {
      setPlayerHealth(prev => Math.max(0, prev - data.damage));
      addLog(`⚔️ Attacked! -${data.damage} HP`, 'damage');
      setHasCompletedDemo(true);
    });

    socket.on('game:heal', (data) => {
      setPlayerHealth(prev => Math.min(100, prev + data.amount));
      addLog(`💚 Healed! +${data.amount} HP`, 'heal');
    });

    socket.on('game:score', (data) => {
      setPlayerScore(data.score);
      addLog(`⭐ Score updated: ${data.score} points!`, 'info');
    });

    return () => {
      socket.off('game:joined');
      socket.off('game:attack');
      socket.off('game:heal');
      socket.off('game:score');
    };
  }, [socket]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameLog]);

  const addLog = (text, type = 'info') => {
    setGameLog(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleJoinGame = () => {
    if (playerName.trim()) {
      socket.emit('game:join', { playerName: playerName.trim() });
    }
  };

  const handleAttack = () => {
    socket.emit('game:attack');
    addLog('🗡️ You attack!', 'action');
  };

  const handleHeal = () => {
    socket.emit('game:heal');
    addLog('🧪 You use a health potion!', 'action');
  };

  const handleCollectStar = () => {
    socket.emit('game:collectStar');
    addLog('⭐ Collecting star...', 'action');
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
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-400">LEVEL 8 </h1>
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
                        <h2 className="text-2xl md:text-4xl font-black text-cyan-400 mb-2">Quiz Time</h2>
                        <p className="text-sm md:text-lg text-gray-300">Test Your Knowledge!</p>
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
                        if (percentage === 100) return 'Perfect! Custom Events Master! 🏆';
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
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-400">LEVEL 8</h1>
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
                  <div className="text-3xl md:text-4xl mb-3">🎮</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Gaming</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">
                    player:move, player:attack, player:heal
                  </p>
                  <div className="bg-cyan-500/10 rounded-lg p-2 text-xs">
                    <code className="text-cyan-400">Custom events!</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">💬</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Chat Apps</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">
                    user:typing, user:online, msg:sent
                  </p>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                    <code className="text-blue-400">Organized!</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">📊</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Dashboards</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">
                    data:update, chart:refresh, alert:new
                  </p>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                    <code className="text-blue-400">Clean code!</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Custom Events */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-cyan-400 flex items-center gap-2 md:gap-3">
                <span>💡</span> Why Custom Events?
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">❌</div>
                    <h4 className="text-xl font-black text-red-400">Without Custom Events</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <code className="text-red-400 text-sm">{`socket.emit('message', {
  type: 'attack',
  damage: 20
});

// Everything is 'message'!
// Hard to organize 😵`}</code>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">✅</div>
                    <h4 className="text-xl font-black text-green-400">With Custom Events</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <code className="text-green-400 text-sm">{`socket.emit('game:attack', {
  damage: 20
});

// Clear & organized!
// Easy to understand 🎯`}</code>
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
                <div className="bg-black rounded-xl border border-cyan-500/30 overflow-hidden mb-6">
                  <div className="px-4 py-2 bg-black/80 border-b border-cyan-500/30 flex gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 md:p-6 text-xs md:text-sm overflow-x-auto font-mono">
                    <code className="text-cyan-400">{`// CLIENT - Send custom events
socket.emit('game:attack', { damage: 20 });
socket.emit('game:heal', { amount: 50 });
socket.emit('player:move', { x: 10, y: 20 });

// SERVER - Listen for custom events
socket.on('game:attack', (data) => {
  console.log('Attack with', data.damage, 'damage!');
  socket.emit('game:attackResult', { success: true });
});

socket.on('game:heal', (data) => {
  console.log('Heal for', data.amount, 'HP!');
});`}</code>
                  </pre>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-cyan-300 mb-2">💡 Best Practices:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✓ Use descriptive names: <code className="bg-black/50 px-2 py-1 rounded">game:attack</code> not <code className="bg-black/50 px-2 py-1 rounded">attack1</code></li>
                    <li>✓ Use colons for namespacing: <code className="bg-black/50 px-2 py-1 rounded">user:login</code>, <code className="bg-black/50 px-2 py-1 rounded">chat:message</code></li>
                    <li>✓ Send objects with data: <code className="bg-black/50 px-2 py-1 rounded">{`{damage: 20}`}</code></li>
                  </ul>
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

  // PRACTICE SCREEN - GAME SIMULATOR
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
                <div className="text-2xl md:text-3xl">🎮</div>
                <h1 className="text-lg md:text-2xl font-black text-cyan-400">GAME DEMO</h1>
              </div>
              
              <div className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-green-500/20 border-green-500 text-green-400">
                LIVE
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            
            {!isInGame ? (
              <div className="max-w-md mx-auto">
                <div className="bg-black/60 rounded-2xl border-2 border-cyan-500/30 p-8 text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-3xl font-black text-cyan-400 mb-2">Join Game</h2>
                  <p className="text-gray-400 mb-6">Enter your player name</p>

                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full px-4 py-3 mb-4 bg-black/90 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-center"
                  />

                  <button
                    onClick={handleJoinGame}
                    disabled={!playerName.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all"
                  >
                    🎮 Start Game
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Player Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-red-500/20 to-transparent border-2 border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">❤️</div>
                      <div>
                        <div className="text-xs text-gray-400">HEALTH</div>
                        <div className="text-2xl font-black text-red-400">{playerHealth} HP</div>
                      </div>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${playerHealth}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/20 to-transparent border-2 border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">⭐</div>
                      <div>
                        <div className="text-xs text-gray-400">SCORE</div>
                        <div className="text-2xl font-black text-yellow-400">{playerScore}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={handleAttack}
                    className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                  >
                    <div className="text-3xl mb-1">⚔️</div>
                    <div className="text-sm">Attack</div>
                    <div className="text-xs opacity-75">-20 HP</div>
                  </button>

                  <button
                    onClick={handleHeal}
                    className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                  >
                    <div className="text-3xl mb-1">💚</div>
                    <div className="text-sm">Heal</div>
                    <div className="text-xs opacity-75">+30 HP</div>
                  </button>

                  <button
                    onClick={handleCollectStar}
                    className="px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                  >
                    <div className="text-3xl mb-1">⭐</div>
                    <div className="text-sm">Star</div>
                    <div className="text-xs opacity-75">+10 pts</div>
                  </button>
                </div>

                {/* Game Log */}
                <div className="bg-black/60 rounded-xl border border-cyan-500/30 p-4 h-64 overflow-y-auto">
                  <h3 className="text-sm font-bold text-cyan-400 mb-3">📜 Game Log</h3>
                  {gameLog.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">No actions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {gameLog.map(log => (
                        <div key={log.id} className={`text-xs p-2 rounded border-l-2 ${
                          log.type === 'success' ? 'bg-green-500/10 border-green-500' :
                          log.type === 'damage' ? 'bg-red-500/10 border-red-500' :
                          log.type === 'heal' ? 'bg-green-500/10 border-green-500' :
                          log.type === 'action' ? 'bg-blue-500/10 border-blue-500' :
                          'bg-cyan-500/10 border-cyan-500'
                        }`}>
                          <span className="text-gray-400">[{log.timestamp}]</span> {log.text}
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <p className="text-xs text-cyan-300">
                    <strong>💡 Tip:</strong> Each button triggers a different custom event! Check console to see: <code className="bg-black/50 px-2 py-1 rounded">game:attack</code>, <code className="bg-black/50 px-2 py-1 rounded">game:heal</code>, <code className="bg-black/50 px-2 py-1 rounded">game:collectStar</code>
                  </p>
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

export default Level8;