import React, { useState, useEffect, useRef } from 'react';

function Level2({ socket, isConnected, onBack, onComplete, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [isPhaseTransitioning, setIsPhaseTransitioning] = useState(false);

  // Room state
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomInput, setRoomInput] = useState('');
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  const [messagesSent, setMessagesSent] = useState(0);
  const messagesEndRef = useRef(null);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const smoothTransition = (newPhase) => {
    setIsPhaseTransitioning(true);
    setTimeout(() => {
      setPhase(newPhase);
      setTimeout(() => setIsPhaseTransitioning(false), 50);
    }, 300);
  };

  const quiz = [
    {
      question: "What is a Socket.IO room?",
      options: [
        "A physical server location",
        "A group where messages are sent only to members",
        "A type of database",
        "A CSS styling method"
      ],
      correct: 1
    },
    {
      question: "How do you join a room on the server?",
      options: [
        "socket.join('roomName')",
        "socket.enter('roomName')",
        "io.join('roomName')",
        "socket.connect('roomName')"
      ],
      correct: 0
    },
    {
      question: "To send a message to everyone in a room, you use:",
      options: [
        "socket.emit('event', data)",
        "io.to('roomName').emit('event', data)",
        "socket.broadcast('event', data)",
        "io.send('roomName', data)"
      ],
      correct: 1
    },
    {
      question: "If you're in room 'ALPHA1', can you see messages from room 'BETA22'?",
      options: [
        "Yes, all rooms share messages",
        "No, rooms are completely isolated",
        "Only if you enable sharing",
        "Yes, but only admin messages"
      ],
      correct: 1
    },
    {
      question: "Real-world example of Socket.IO rooms:",
      options: [
        "Email inbox",
        "Kahoot game with quiz code",
        "Google search",
        "YouTube videos"
      ],
      correct: 1
    }
  ];

  useEffect(() => {
    socket.on('joined-room', (data) => {
      setCurrentRoom(data.roomName);
      setRoomPlayers(data.players);
      setRoomMessages(data.messages || []);
    });
    socket.on('player-joined', (data) => setRoomPlayers(data.players));
    socket.on('room-message', (data) => setRoomMessages(prev => [...prev, data]));
    socket.on('player-left', (data) => setRoomPlayers(data.players));

    return () => {
      socket.off('joined-room');
      socket.off('player-joined');
      socket.off('room-message');
      socket.off('player-left');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  // Mark demo complete after joining + sending 1 message
  useEffect(() => {
    if (currentRoom && messagesSent >= 1) setHasCompletedDemo(true);
  }, [currentRoom, messagesSent]);

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, i) => { if (quizAnswers[i] === q.correct) correct++; });
    return { correct, total: quiz.length };
  };

  const handleJoinRoom = () => {
    if (roomCode.trim() && playerName.trim()) {
      socket.emit('join-room', {
        roomName: roomCode.trim().toUpperCase(),
        playerName: playerName.trim()
      });
    }
  };

  const handleSendMessage = () => {
    if (roomInput.trim() && currentRoom) {
      socket.emit('room-message', { roomName: currentRoom, message: roomInput });
      setRoomInput('');
      setMessagesSent(prev => prev + 1);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leave-room');
    setCurrentRoom(null);
    setRoomPlayers([]);
    setRoomMessages([]);
    setMessagesSent(0);
    setHasCompletedDemo(false);
  };

  // ─── QUIZ SCREEN ───────────────────────────────────────────────
  if (showQuiz) {
    return (
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning || isPhaseTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <button onClick={() => { setIsPhaseTransitioning(true); setTimeout(() => { setShowQuiz(false); setTimeout(() => setIsPhaseTransitioning(false), 50); }, 300); }}
                className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">⚡</div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-400">LEVEL 2 QUIZ</h1>
              </div>
              <div className="w-16 md:w-24"></div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
            <div className="max-w-4xl mx-auto">
              {!quizSubmitted ? (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-purple-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 border-b border-purple-500/30 bg-purple-500/5 flex items-center gap-3 md:gap-6">
                    <div className="text-4xl md:text-6xl">🧠</div>
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black text-purple-400 mb-2">Test Your Knowledge!</h2>
                      <p className="text-sm md:text-lg text-gray-300">Answer all questions about Rooms</p>
                    </div>
                  </div>

                  <div className="p-4 md:p-10 space-y-4 md:space-y-8">
                    {quiz.map((q, qIndex) => (
                      <div key={qIndex} className="bg-black/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-purple-500/20">
                        <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4">Q{qIndex + 1}: {q.question}</h3>
                        <div className="space-y-2 md:space-y-3">
                          {q.options.map((option, oIndex) => {
                            const isSelected = quizAnswers[qIndex] === oIndex;
                            return (
                              <button key={oIndex}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                                className={`w-full text-left px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 ${
                                  isSelected ? 'bg-purple-500/30 border-2 border-purple-500 text-white' : 'bg-black/70 border border-purple-500/20 text-gray-300 hover:border-purple-500/50'
                                }`}>
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'}`}>
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

                  <div className="p-4 md:p-10 border-t border-purple-500/30 bg-black/50">
                    <button onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg">
                      Submit Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-purple-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 text-center">
                    <div className="text-5xl md:text-7xl mb-4 md:mb-6">
                      {(() => { const { correct, total } = calculateScore(); const p = (correct/total)*100; return p===100?'🏆':p>=80?'🎉':p>=60?'👍':'💪'; })()}
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-purple-400 mb-3 md:mb-4">Quiz Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => { const { correct, total } = calculateScore(); const p = (correct/total)*100; return p===100?'Perfect! Rooms Master! 🏆':p>=80?'Excellent work! 🎉':p>=60?'Good job! 👍':'Keep learning! 💪'; })()}
                    </p>

                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-left">
                      {quiz.map((q, qIndex) => {
                        const userAnswer = quizAnswers[qIndex];
                        const isCorrect = userAnswer === q.correct;
                        return (
                          <div key={qIndex} className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 ${isCorrect ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="text-xl md:text-2xl">{isCorrect ? '✓' : '✗'}</div>
                              <div className="flex-1">
                                <p className="font-bold text-white mb-1 md:mb-2 text-sm md:text-base">Q{qIndex + 1}</p>
                                <p className="text-xs md:text-sm text-gray-300 mb-1 md:mb-2">Your answer: {q.options[userAnswer]}</p>
                                {!isCorrect && <p className="text-xs md:text-sm text-green-400">Correct: {q.options[q.correct]}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button onClick={() => { onComplete(); setTimeout(() => onBack(), 500); }}
                      className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm md:text-lg">
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

  // ─── THEORY SCREEN ─────────────────────────────────────────────
  if (phase === 'theory') {
    return (
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning || isPhaseTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <button onClick={onBack} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">⚡</div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-400">LEVEL 2</h1>
              </div>
              <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span>{isConnected ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-6xl">

            {/* Real-World Examples */}
            <div className="mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-purple-400 flex items-center gap-2 md:gap-3">
                <span>🌍</span> Real-World Examples
              </h3>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {[
                  { icon: '🎮', title: 'Kahoot', color: 'purple', desc: 'Enter a game code — only players in that game see the questions' },
                  { icon: '💬', title: 'Discord Channels', color: 'purple', desc: 'Messages stay inside their channel, not visible to other channels' },
                  { icon: '📹', title: 'Zoom Meetings', color: 'purple', desc: 'Join with a meeting ID — conversations are private to participants' },
                ].map((item) => (
                  <div key={item.title} className="bg-gradient-to-br from-purple-500/20 to-transparent border-2 border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                    <div className="text-3xl md:text-4xl mb-3">{item.icon}</div>
                    <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">{item.title}</h4>
                    <p className="text-xs md:text-sm text-gray-300">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How Rooms Work */}
            <div className="mb-8 md:mb-12 bg-black/60 border-2 border-purple-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-purple-400 flex items-center gap-2 md:gap-3">
                <span>⚡</span> How Rooms Work
              </h3>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">🚪</div>
                    <h4 className="text-xl md:text-2xl font-black text-purple-400">Joining a Room</h4>
                  </div>
                  <p className="text-sm md:text-base text-gray-300 mb-4">Join a room on the server using <strong className="text-purple-400">socket.join()</strong></p>
                  <div className="bg-black/50 rounded-lg p-4">
                    <code className="text-purple-400 text-xs md:text-sm">
                      {'// SERVER\n'}
                      {"socket.join('ALPHA1');\n"}
                      {'// Now in room ALPHA1!'}
                    </code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">📨</div>
                    <h4 className="text-xl md:text-2xl font-black text-pink-400">Messaging a Room</h4>
                  </div>
                  <p className="text-sm md:text-base text-gray-300 mb-4">Send to only room members using <strong className="text-pink-400">io.to()</strong></p>
                  <div className="bg-black/50 rounded-lg p-4">
                    <code className="text-pink-400 text-xs md:text-sm">
                      {"io.to('ALPHA1')\n"}
                      {"  .emit('msg', data);\n"}
                      {'// Only ALPHA1 sees it!'}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-8 md:mb-12 bg-black/60 border-2 border-purple-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="p-4 md:p-8 border-b border-purple-500/30 bg-purple-500/5">
                <h3 className="text-2xl md:text-3xl font-black text-purple-400 flex items-center gap-2 md:gap-3">
                  <span>👨‍💻</span> The Code
                </h3>
              </div>
              <div className="p-4 md:p-8">
                <div className="bg-black rounded-xl border border-purple-500/30 overflow-hidden">
                  <div className="px-4 py-2 bg-black/80 border-b border-purple-500/30 flex gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 md:p-6 text-xs md:text-sm overflow-x-auto font-mono">
                    <code className="text-purple-400">{`// CLIENT — join a room
socket.emit('join-room', { roomName: 'ALPHA1' });

// SERVER — handle join
socket.on('join-room', ({ roomName }) => {
  socket.join(roomName);
  io.to(roomName).emit('player-joined', {
    players: getRoomPlayers(roomName)
  });
});

// SERVER — send message to room only
socket.on('room-message', ({ roomName, message }) => {
  io.to(roomName).emit('room-message', { text: message });
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => smoothTransition('practice')}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-purple-500/50">
                <span>Try It Live!</span>
                <span className="text-2xl md:text-3xl">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PRACTICE SCREEN ───────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning || isPhaseTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <button onClick={() => smoothTransition('theory')} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
              <span>←</span> <span className="hidden sm:inline">Theory</span>
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-2xl md:text-3xl">⚡</div>
              <h1 className="text-lg md:text-2xl font-black text-purple-400">LIVE ROOMS</h1>
            </div>
            <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-green-500/20 border-green-500 text-green-400">
              LIVE
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">

            {/* Join Room Form */}
            {!currentRoom ? (
              <div className="bg-black/60 border-2 border-purple-500/30 rounded-2xl p-6 md:p-10 max-w-lg mx-auto mt-8">
                <h3 className="text-xl md:text-2xl font-black text-purple-400 mb-6 text-center">Join a Room</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-purple-300 mb-2">ROOM CODE</label>
                    <input type="text" value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ALPHA1"
                      maxLength={6}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none text-white text-lg md:text-xl font-bold text-center tracking-widest placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-purple-300 mb-2">YOUR NAME</label>
                    <input type="text" value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={20}
                      className="w-full px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none text-white text-base md:text-lg placeholder-gray-600"
                    />
                  </div>
                  <button onClick={handleJoinRoom}
                    disabled={!roomCode.trim() || !playerName.trim() || !isConnected}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                    Join Room →
                  </button>
                </div>

                <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">💡</div>
                    <div className="text-xs md:text-sm text-gray-300">
                      <strong className="text-purple-300">How to test:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Open this page in 2 browser tabs</li>
                        <li>• Join the same room code in both tabs</li>
                        <li>• Chat — messages only appear in that room! ✨</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat inside room */
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-center justify-between bg-black/60 border border-purple-500/30 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🚪</div>
                    <div>
                      <div className="font-black text-purple-400">{currentRoom}</div>
                      <div className="text-xs text-gray-500">👥 {roomPlayers.length} player{roomPlayers.length !== 1 ? 's' : ''} online</div>
                    </div>
                  </div>
                  <button onClick={handleLeaveRoom}
                    className="px-3 py-2 bg-red-500/20 border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 font-bold rounded-lg text-xs md:text-sm transition-all">
                    Leave Room
                  </button>
                </div>

                <div className="flex-1 bg-black/40 border border-purple-500/20 rounded-xl p-4 min-h-64 max-h-96 overflow-y-auto">
                  {roomMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <div className="text-5xl mb-3">💬</div>
                      <p className="text-lg font-bold">Room is empty!</p>
                      <p className="text-sm text-gray-600 mt-1">Send the first message</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {roomMessages.map((msg, i) => (
                        <div key={i} className={msg.sender === playerName ? 'text-right' : ''}>
                          <div className={`inline-block max-w-[85%] p-3 md:p-4 rounded-xl ${
                            msg.sender === playerName
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-black/80 border border-purple-500/30 text-gray-200'
                          }`}>
                            <div className="text-xs opacity-70 mb-1">[{msg.timestamp}] {msg.sender}</div>
                            <div className="text-sm md:text-base">{msg.text}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <input type="text" value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl md:rounded-2xl focus:border-purple-500 focus:outline-none text-white text-sm md:text-lg placeholder-gray-600"
                  />
                  <button onClick={handleSendMessage} disabled={!roomInput.trim()}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 text-sm md:text-base">
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Take the Test button — appears after joining + sending 1 message */}
        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => { setIsPhaseTransitioning(true); setTimeout(() => { setShowQuiz(true); setTimeout(() => setIsPhaseTransitioning(false), 50); }, 300); }}
                className="w-full px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-3 md:gap-4">
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

export default Level2;