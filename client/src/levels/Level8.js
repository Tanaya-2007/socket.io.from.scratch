import React, { useState, useEffect, useRef } from 'react';

function Level8({ socket, isConnected, onBack, onComplete, isTransitioning }){
  const [phase, setPhase] = useState('theory');
  const [playerName, setPlayerName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [targetText, setTargetText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRacing, setIsRacing] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
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
    socket.on('race:started', (data) => {
      setIsInGame(true);
      setTargetText(data.text);
      setTimeLeft(data.duration);
      setIsRacing(true);
      setTypedText('');
      setWpm(0);
      setAccuracy(100);
      setFinalScore(null);
      addLog('🏁 Race started! Type the text as fast as you can!', 'success');
    });

    socket.on('race:update', (data) => {
      setWpm(data.wpm);
      setAccuracy(data.accuracy);
    });

    socket.on('race:finished', (data) => {
      setIsRacing(false);
      setFinalScore(data);
      addLog(`🏆 Race finished! WPM: ${data.wpm} | Accuracy: ${data.accuracy}%`, 'success');
      setHasCompletedDemo(true);
    });

    socket.on('race:tick', (data) => {
      setTimeLeft(data.timeLeft);
      if (data.timeLeft === 0) {
        setIsRacing(false);
      }
    });

    return () => {
      socket.off('race:started');
      socket.off('race:update');
      socket.off('race:finished');
      socket.off('race:tick');
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

  const handleJoinRace = () => {
    if (!playerName.trim()) return;
    socket.emit('race:join', { playerName: playerName.trim() });
    setHasJoined(true); // ✅ THIS IS THE FIX - show the race screen!
    addLog(`✅ Joined as ${playerName.trim()}!`, 'info');
  };

  const handleStartRace = () => {
    socket.emit('race:start');
    addLog('🏁 Starting race...', 'info');
  };

  const handleTyping = (e) => {
    const typed = e.target.value;
    setTypedText(typed);
    
    if (isRacing) {
      socket.emit('race:typing', { 
        typed: typed,
        target: targetText 
      });
    }

    if (typed === targetText && targetText.length > 0) {
      socket.emit('race:complete', { 
        typed: typed,
        target: targetText 
      });
      setIsRacing(false);
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
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-cyan-400">LEVEL 8 QUIZ</h1>
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
                        <p className="text-sm md:text-lg text-gray-300">Answer all questions about Custom Events</p>
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
                  <div className="text-3xl md:text-4xl mb-3">⌨️</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Typing Games</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">race:start, race:typing, race:complete</p>
                  <div className="bg-cyan-500/10 rounded-lg p-2 text-xs">
                    <code className="text-cyan-400">Custom events!</code>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">💬</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Chat Apps</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">user:typing, user:online, msg:sent</p>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                    <code className="text-blue-400">Organized!</code>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🎮</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Gaming</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">player:move, player:attack, game:over</p>
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
                  <div className="bg-black/50 rounded-lg p-4">
                    <code className="text-red-400 text-sm">{`socket.emit('message', {
  type: 'typing',
  text: 'hello'
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
                  <div className="bg-black/50 rounded-lg p-4">
                    <code className="text-green-400 text-sm">{`socket.emit('race:typing', {
  text: 'hello'
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
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 md:p-6 text-xs md:text-sm overflow-x-auto font-mono">
                    <code className="text-cyan-400">{`// CLIENT - Send custom events
socket.emit('race:start');
socket.emit('race:typing', { text: 'hello' });
socket.emit('race:complete', { wpm: 45 });

// SERVER - Listen for custom events
socket.on('race:start', () => {
  socket.emit('race:started', { text: 'Type this!' });
});

socket.on('race:typing', (data) => {
  socket.emit('race:update', { wpm: 45, accuracy: 98 });
});`}</code>
                  </pre>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-cyan-300 mb-2">💡 Best Practices:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✓ Use descriptive names: <code className="bg-black/50 px-2 py-1 rounded">race:typing</code></li>
                    <li>✓ Use colons for namespacing: <code className="bg-black/50 px-2 py-1 rounded">user:login</code></li>
                    <li>✓ Send objects with data: <code className="bg-black/50 px-2 py-1 rounded">{`{wpm: 45}`}</code></li>
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
                <div className="text-2xl md:text-3xl">⌨️</div>
                <h1 className="text-lg md:text-2xl font-black text-cyan-400">TYPING RACE</h1>
              </div>
              {isRacing ? (
                <div className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-yellow-500/20 border-yellow-500 text-yellow-400">
                  ⏱️ {timeLeft}s
                </div>
              ) : (
                <div className="w-16 md:w-24"></div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="container mx-auto max-w-4xl w-full">

            {/* STEP 1: JOIN SCREEN */}
            {!hasJoined && (
              <div className="max-w-md mx-auto">
                <div className="bg-black/60 rounded-2xl border-2 border-cyan-500/30 p-8 text-center">
                  <div className="text-6xl mb-4">⌨️</div>
                  <h2 className="text-3xl font-black text-cyan-400 mb-2">Join Typing Race</h2>
                  <p className="text-gray-400 mb-8">Test your typing speed with custom events!</p>

                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && playerName.trim() && handleJoinRace()}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-3 mb-4 bg-black/90 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-center text-lg placeholder-gray-600"
                  />

                  <button
                    onClick={handleJoinRace}
                    disabled={!playerName.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 mb-4"
                  >
                    ⌨️ Join Race
                  </button>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-left">
                    <p className="text-xs text-cyan-300">
                      <strong>💡 How it works:</strong><br/>
                      • Type the sentence shown as fast as you can<br/>
                      • Custom events track your progress in real-time<br/>
                      • See your WPM and accuracy live!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: RACE SCREEN (after joining) */}
            {hasJoined && !finalScore && (
              <div className="w-full">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/60 border-2 border-cyan-500/30 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1">PLAYER</div>
                    <div className="text-lg font-black text-cyan-400 truncate">{playerName}</div>
                  </div>
                  <div className="bg-black/60 border-2 border-cyan-500/30 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1">SPEED</div>
                    <div className="text-2xl font-black text-yellow-400">{wpm} WPM</div>
                  </div>
                  <div className="bg-black/60 border-2 border-cyan-500/30 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-400 mb-1">ACCURACY</div>
                    <div className="text-2xl font-black text-green-400">{accuracy}%</div>
                  </div>
                </div>

                {!isInGame ? (
                  // START BUTTON
                  <div className="text-center">
                    <div className="bg-black/60 border-2 border-cyan-500/30 rounded-2xl p-8 mb-6">
                      <div className="text-5xl mb-4">🏁</div>
                      <h3 className="text-2xl font-black text-cyan-400 mb-2">Ready to race, {playerName}?</h3>
                      <p className="text-gray-400">Click Start Race to begin!</p>
                    </div>
                    <button
                      onClick={handleStartRace}
                      className="w-full px-8 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-2xl font-black rounded-2xl transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50"
                    >
                      🏁 START RACE!
                    </button>
                  </div>
                ) : (
                  // RACING
                  <div>
                    {/* Target Text */}
                    <div className="bg-black/60 rounded-2xl border-2 border-cyan-500/30 p-6 mb-4">
                      <div className="text-sm text-gray-400 mb-3 text-center">📝 TYPE THIS:</div>
                      <div className="text-xl md:text-2xl font-mono leading-relaxed text-center">
                        {targetText.split('').map((char, i) => {
                          const typedChar = typedText[i];
                          const isTyped = i < typedText.length;
                          const isCorrect = typedChar === char;
                          return (
                            <span key={i} className={`${
                              !isTyped ? 'text-gray-400' :
                              isCorrect ? 'text-green-400' : 'text-red-400 bg-red-500/20'
                            }`}>
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Typing Input */}
                    <input
                      type="text"
                      value={typedText}
                      onChange={handleTyping}
                      placeholder="Start typing here..."
                      className="w-full px-6 py-4 bg-black/90 border-2 border-cyan-500/30 focus:border-cyan-500 rounded-xl focus:outline-none text-white text-xl font-mono mb-4"
                      autoFocus
                    />
                  </div>
                )}

                {/* Event Log */}
                <div className="bg-black/60 rounded-xl border border-cyan-500/30 p-4 h-28 overflow-y-auto mt-4">
                  <h3 className="text-xs font-bold text-cyan-400 mb-2">📡 Live Events</h3>
                  {gameLog.length === 0 ? (
                    <p className="text-xs text-gray-500">Events will appear here...</p>
                  ) : (
                    gameLog.slice(-5).map(log => (
                      <div key={log.id} className={`text-xs p-1 rounded ${
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'info' ? 'text-cyan-400' : 'text-gray-400'
                      }`}>
                        [{log.timestamp}] {log.text}
                      </div>
                    ))
                  )}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}

            {/* STEP 3: RESULTS SCREEN */}
            {hasJoined && finalScore && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-black/60 rounded-2xl border-2 border-cyan-500/30 p-8 text-center">
                  <div className="text-7xl mb-6">
                    {finalScore.wpm >= 60 ? '🏆' : finalScore.wpm >= 40 ? '🎉' : '👍'}
                  </div>
                  <h2 className="text-4xl font-black text-cyan-400 mb-6">Race Complete!</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-cyan-500/20 to-transparent border-2 border-cyan-500/30 rounded-xl p-6">
                      <div className="text-sm text-gray-400 mb-2">Speed</div>
                      <div className="text-4xl font-black text-cyan-400">{finalScore.wpm}</div>
                      <div className="text-xs text-gray-500 mt-1">words per minute</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl p-6">
                      <div className="text-sm text-gray-400 mb-2">Accuracy</div>
                      <div className="text-4xl font-black text-blue-400">{finalScore.accuracy}%</div>
                      <div className="text-xs text-gray-500 mt-1">correct characters</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFinalScore(null);
                      setIsInGame(false);
                      setHasJoined(false);
                      setPlayerName('');
                      setTypedText('');
                      setGameLog([]);
                      setTimeLeft(60);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                  >
                    🔄 Race Again
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Take Quiz Button */}
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