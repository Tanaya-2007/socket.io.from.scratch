import React, { useState, useEffect, useRef } from 'react';

const RACE_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the river bank",
  "Socket IO makes real time communication simple and fast for developers",
  "Custom events help organize your code and make it easy to understand",
  "JavaScript is a powerful language used for both frontend and backend",
  "Practice makes perfect when it comes to typing speed and accuracy"
];

function Level8({ socket, isConnected, onBack }) {
  const [phase, setPhase] = useState('theory');
  const [playerName, setPlayerName] = useState('');
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
  const [startTime, setStartTime] = useState(null);
  
  const timerRef = useRef(null);
  const inputRef = useRef(null);
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

  // ── Cleanup timer on unmount ──
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameLog]);

  // ── Game Logic (fully local, no server needed) ──

  const addLog = (text, type = 'info') => {
    setGameLog(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const calculateWpm = (typed, start) => {
    const elapsed = (Date.now() - start) / 1000 / 60; // minutes
    const words = typed.trim().split(' ').length;
    return elapsed > 0 ? Math.round(words / elapsed) : 0;
  };

  const calculateAccuracy = (typed, target) => {
    if (typed.length === 0) return 100;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++;
    }
    return Math.round((correct / typed.length) * 100);
  };

  const handleJoinRace = () => {
    if (!playerName.trim()) return;

    // Pick a random sentence
    const text = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
    setTargetText(text);
    setIsInGame(true);
    setTypedText('');
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(60);
    setFinalScore(null);
    setGameLog([]);

    // 🔴 Emit custom event so it shows in log (real socket.io!)
    socket.emit('race:join', { playerName: playerName.trim() });
    addLog(`✅ ${playerName} joined the race!`, 'success');
    addLog(`📡 Emitted: race:join`, 'info');
  };

  const handleStartRace = () => {
    const text = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
    setTargetText(text);
    setTypedText('');
    setTimeLeft(60);
    setWpm(0);
    setAccuracy(100);
    setIsRacing(true);
    setStartTime(Date.now());

    // 🔴 Emit custom event
    socket.emit('race:start', { playerName });
    addLog('🏁 Race started! Emitted: race:start', 'success');
    addLog('📡 Emitted: race:start', 'info');

    // Start countdown timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleTimeUp = () => {
    setIsRacing(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setTypedText(prev => {
      setTargetText(target => {
        const finalWpm = calculateWpm(prev, startTime || Date.now());
        const finalAcc = calculateAccuracy(prev, target);
        const score = { wpm: finalWpm, accuracy: finalAcc };

        socket.emit('race:timeout', score);
        addLog(`⏰ Time up! WPM: ${finalWpm} | Accuracy: ${finalAcc}%`, 'success');
        addLog('📡 Emitted: race:timeout', 'info');

        setFinalScore(score);
        setHasCompletedDemo(true);
        return target;
      });
      return prev;
    });
  };

  const handleTyping = (e) => {
    if (!isRacing) return;
    const typed = e.target.value;
    setTypedText(typed);

    // Calculate live stats
    const currentWpm = calculateWpm(typed, startTime || Date.now());
    const currentAcc = calculateAccuracy(typed, targetText);
    setWpm(currentWpm);
    setAccuracy(currentAcc);

    // 🔴 Emit custom event for typing update
    socket.emit('race:typing', { typed, wpm: currentWpm, accuracy: currentAcc });

    // Check if completed
    if (typed === targetText) {
      clearInterval(timerRef.current);
      setIsRacing(false);
      const score = { wpm: currentWpm, accuracy: currentAcc };
      setFinalScore(score);
      setHasCompletedDemo(true);

      socket.emit('race:complete', score);
      addLog(`🏆 Finished! WPM: ${currentWpm} | Accuracy: ${currentAcc}%`, 'success');
      addLog('📡 Emitted: race:complete', 'info');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct) correct++;
    });
    return { correct, total: quiz.length };
  };

  const submitQuiz = () => setQuizSubmitted(true);

  // ══════════════════════════════════════════════════════════════
  // QUIZ SCREEN
  // ══════════════════════════════════════════════════════════════
  if (showQuiz) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-[#0d1529] border-b border-cyan-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowQuiz(false)} className="px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-cyan-500/20">
                  <span>←</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚡</div>
                  <h1 className="text-2xl sm:text-3xl font-black text-cyan-400">LEVEL 8 QUIZ</h1>
                </div>
                <div className="w-16"></div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
            {!quizSubmitted ? (
              <div className="bg-black/60 backdrop-blur-xl border-2 border-cyan-500/30 rounded-3xl overflow-hidden">
                <div className="p-10 border-b border-cyan-500/30 bg-cyan-500/5">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">🧠</div>
                    <div>
                      <h2 className="text-4xl font-black text-cyan-400 mb-2">Quiz Time</h2>
                      <p className="text-lg text-gray-300">Test Your Knowledge</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  {quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-black/50 p-6 rounded-2xl border border-cyan-500/20">
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
                                  ? 'bg-cyan-500/30 border-2 border-cyan-500 text-white'
                                  : 'bg-black/70 border border-cyan-500/20 text-gray-300 hover:border-cyan-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-cyan-500/30'
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

                <div className="p-10 border-t border-cyan-500/30 bg-black/50">
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== quiz.length}
                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xl font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-xl border-2 border-cyan-500/30 rounded-3xl overflow-hidden">
                <div className="p-10 text-center">
                  <div className="text-7xl mb-6">
                    {(() => {
                      const { correct, total } = calculateScore();
                      const pct = (correct / total) * 100;
                      return pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
                    })()}
                  </div>
                  <h2 className="text-4xl font-black text-cyan-400 mb-4">Quiz Complete!</h2>
                  <div className="text-6xl font-black text-white mb-4">
                    {calculateScore().correct} / {calculateScore().total}
                  </div>
                  <p className="text-xl text-gray-300 mb-8">
                    {(() => {
                      const { correct, total } = calculateScore();
                      const pct = (correct / total) * 100;
                      if (pct === 100) return 'Perfect Score! 🏆';
                      if (pct >= 80) return 'Excellent Work! 🎉';
                      if (pct >= 60) return 'Good Job! 👍';
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
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xl font-black rounded-2xl transition-all transform hover:scale-105"
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

  // ══════════════════════════════════════════════════════════════
  // THEORY SCREEN
  // ══════════════════════════════════════════════════════════════
  if (phase === 'theory') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-[#0d1529] border-b border-cyan-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-cyan-500/20">
                  <span>←</span>
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">⚡</div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-400">LEVEL 8</h1>
                </div>
                <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border ${
                  isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="hidden sm:inline">{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">

            {/* Real World Examples */}
            <div className="mb-12 sm:mb-16 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-cyan-400 flex items-center gap-2 sm:gap-3">
                <span>🌍</span><span>Real-World Examples</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">⌨️</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-cyan-300">Typing Games</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">
                    race:start, race:typing, race:complete
                  </p>
                  <div className="bg-cyan-500/10 rounded-lg p-2 text-xs">
                    <code className="text-cyan-400">Custom events!</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">💬</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-cyan-300">Chat Apps</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">
                    user:typing, user:online, msg:sent
                  </p>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                    <code className="text-blue-400">Organized!</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🎮</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-cyan-300">Gaming</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-2">
                    player:move, player:attack, game:over
                  </p>
                  <div className="bg-blue-500/10 rounded-lg p-2 text-xs">
                    <code className="text-blue-400">Clean code!</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Custom Events */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-cyan-400 flex items-center gap-2 sm:gap-3">
                <span>💡</span><span>Why Custom Events?</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl sm:text-3xl">❌</div>
                    <h4 className="text-lg sm:text-xl font-black text-red-400">Without Custom Events</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 sm:p-4 overflow-x-auto">
                    <pre className="text-red-400 text-xs sm:text-sm font-mono">{`socket.emit('message', {
  type: 'typing',
  text: 'hello'
});
// Everything is 'message'
// Hard to organize 😵`}</pre>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl sm:text-3xl">✅</div>
                    <h4 className="text-lg sm:text-xl font-black text-green-400">With Custom Events</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 sm:p-4 overflow-x-auto">
                    <pre className="text-green-400 text-xs sm:text-sm font-mono">{`socket.emit('race:typing', {
  text: 'hello'
});
// Clear & organized!
// Easy to understand 🎯`}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl sm:rounded-3xl overflow-hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="p-6 sm:p-8 border-b border-cyan-500/30 bg-cyan-500/5">
                <h3 className="text-2xl sm:text-3xl font-black text-cyan-400 flex items-center gap-2 sm:gap-3">
                  <span>👨‍💻</span><span>The Code</span>
                </h3>
              </div>
              <div className="p-6 sm:p-8">
                <div className="bg-black rounded-xl sm:rounded-2xl border border-cyan-500/30 overflow-hidden">
                  <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b border-cyan-500/30 flex gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm overflow-x-auto font-mono">
                    <code className="text-cyan-400">{`// CLIENT - Emit custom events
socket.emit('race:join', { playerName: 'Alice' });
socket.emit('race:start');
socket.emit('race:typing', { typed: 'hello', wpm: 45 });
socket.emit('race:complete', { wpm: 60, accuracy: 98 });

// SERVER - Listen for custom events
socket.on('race:join', (data) => {
  console.log(data.playerName, 'joined!');
  socket.emit('race:joined', { text: 'Type this!' });
});

socket.on('race:typing', (data) => {
  // Broadcast progress to others
  socket.broadcast.emit('player:progress', data);
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-center animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setPhase('practice')}
                className="w-full sm:w-auto px-6 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-base sm:text-xl lg:text-2xl font-black rounded-2xl sm:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center gap-3 sm:gap-4 mx-auto"
              >
                <span>Got it! Let's Practice</span>
                <span className="text-xl sm:text-2xl lg:text-3xl">→</span>
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        `}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // PRACTICE SCREEN - TYPING RACE
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="bg-[#0d1529] border-b border-cyan-500/30">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setPhase('theory')} className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-cyan-500/20">
                <span>←</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">⌨️</div>
                <h1 className="text-xl sm:text-2xl font-black text-cyan-400">TYPING RACE</h1>
              </div>

              {isRacing ? (
                <div className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border-2 bg-yellow-500/20 border-yellow-500 text-yellow-400">
                  <div className="flex items-center gap-2">
                    <span>⏱️</span>
                    <span className="text-lg sm:text-xl font-black">{timeLeft}s</span>
                  </div>
                </div>
              ) : (
                <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border ${
                  isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span>{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="container mx-auto max-w-4xl">

            {/* ── JOIN SCREEN ── */}
            {!isInGame && (
              <div className="max-w-md mx-auto mt-8">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 p-8 text-center">
                  <div className="text-6xl mb-4">⌨️</div>
                  <h2 className="text-3xl font-black text-cyan-400 mb-2">Join Typing Race</h2>
                  <p className="text-gray-400 mb-6">Test your typing speed with custom events!</p>

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
                      • Enter name → emits <code className="bg-black/40 px-1 rounded">race:join</code><br/>
                      • Press Start → emits <code className="bg-black/40 px-1 rounded">race:start</code><br/>
                      • While typing → emits <code className="bg-black/40 px-1 rounded">race:typing</code><br/>
                      • Finish → emits <code className="bg-black/40 px-1 rounded">race:complete</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── FINAL SCORE SCREEN ── */}
            {isInGame && finalScore && (
              <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 p-8 text-center">
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

                  <div className="text-xl text-gray-300 mb-6">
                    {finalScore.wpm >= 60 ? '🔥 Lightning fast!' : finalScore.wpm >= 40 ? '💪 Great speed!' : '👍 Keep practicing!'}
                  </div>

                  <button
                    onClick={() => {
                      setFinalScore(null);
                      setIsInGame(false);
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

            {/* ── RACING SCREEN ── */}
            {isInGame && !finalScore && (
              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-cyan-500/20 to-transparent border-2 border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">⚡</div>
                      <div>
                        <div className="text-xs text-gray-400">SPEED</div>
                        <div className="text-2xl font-black text-cyan-400">{wpm} WPM</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🎯</div>
                      <div>
                        <div className="text-xs text-gray-400">ACCURACY</div>
                        <div className="text-2xl font-black text-blue-400">{accuracy}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Text */}
                <div className="bg-black/60 rounded-2xl border-2 border-cyan-500/30 p-6 mb-4">
                  <div className="text-sm text-gray-400 mb-3 text-center font-bold">TYPE THIS:</div>
                  <div className="text-lg md:text-xl font-mono leading-relaxed text-center">
                    {targetText.split('').map((char, i) => {
                      const typedChar = typedText[i];
                      const isTyped = i < typedText.length;
                      const isCorrect = typedChar === char;
                      return (
                        <span key={i} className={
                          !isTyped ? 'text-gray-400' :
                          isCorrect ? 'text-green-400' : 'text-red-400 bg-red-400/20'
                        }>
                          {char}
                        </span>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  {isRacing && (
                    <div className="mt-4">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                          style={{ width: `${Math.min((typedText.length / targetText.length) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {typedText.length}/{targetText.length} characters
                      </div>
                    </div>
                  )}
                </div>

                {/* Input / Start button */}
                {!isRacing ? (
                  <button
                    onClick={handleStartRace}
                    className="w-full px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-2xl font-black rounded-xl transition-all transform hover:scale-105 mb-4"
                  >
                    🏁 START RACE!
                  </button>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedText}
                    onChange={handleTyping}
                    placeholder="Start typing..."
                    className="w-full px-6 py-4 bg-black/90 border-2 border-cyan-500 rounded-xl focus:outline-none text-white text-xl font-mono mb-4"
                    autoFocus
                  />
                )}

                {/* Events Log */}
                <div className="rounded-2xl overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  {/* Terminal Header */}
                  <div className="bg-[#0d1829] px-4 py-2.5 border-b border-cyan-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Traffic lights */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-cyan-400 tracking-wider"> Custom Events Log</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-500/60 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      {gameLog.length} events
                    </span>
                  </div>

                  {/* Log Body */}
                  <div
                    className="bg-[#040c16] h-40 overflow-y-auto p-3 space-y-1.5"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#0e7490 #0d1829' }}
                  >
                    {gameLog.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-600">
                        <span className="text-2xl">📋</span>
                        <p className="text-xs">Events appear here as you play...</p>
                      </div>
                    ) : (
                      <>
                        {gameLog.map(log => (
                          <div
                            key={log.id}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-mono border-l-2 ${
                              log.type === 'success'
                                ? 'bg-green-500/8 border-green-500 text-green-400'
                                : 'bg-cyan-500/8 border-cyan-500 text-cyan-300'
                            }`}
                            style={{ background: log.type === 'success' ? 'rgba(34,197,94,0.06)' : 'rgba(6,182,212,0.06)' }}
                          >
                            <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                            <span className="text-gray-500">|</span>
                            <span>{log.text}</span>
                          </div>
                        ))}
                        <div ref={logEndRef} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Take Quiz Button */}
        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-cyan-500/30 bg-black/60 backdrop-blur-xl p-4 sm:p-6">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:via-teal-500 hover:to-blue-500 text-white text-lg sm:text-2xl font-black rounded-2xl sm:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center gap-3 sm:gap-4"
              >
                <span className="text-2xl sm:text-3xl">🧠</span>
                <span>Take the Test</span>
                <span className="text-2xl sm:text-3xl">→</span>
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
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }

        .custom-scrollbar-cyan::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-cyan::-webkit-scrollbar-track { background: #000000; }
        .custom-scrollbar-cyan::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 10px;
          box-shadow: 0 0 10px #06b6d4;
        }
        .custom-scrollbar-cyan::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
          box-shadow: 0 0 15px #06b6d4;
        }
      `}</style>
    </div>
  );
}

export default Level8;