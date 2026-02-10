import React, { useState, useEffect, useRef } from 'react';

function Level2({ socket, isConnected, onBack }) {
  const [level2Phase, setLevel2Phase] = useState('theory'); 
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomInput, setRoomInput] = useState('');
  const messagesEndRef = useRef(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  // Socket.IO event listeners for Level 2
  useEffect(() => {
    socket.on('joined-room', (data) => {
      setCurrentRoom(data.roomName);
      setRoomPlayers(data.players);
      setRoomMessages(data.messages || []);
    });

    socket.on('player-joined', (data) => {
      setRoomPlayers(data.players);
    });

    socket.on('room-message', (data) => {
      setRoomMessages(prev => [...prev, data]);
    });

    socket.on('player-left', (data) => {
      setRoomPlayers(data.players);
    });

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

  const handleJoinRoom = () => {
    if (roomCode.trim() && playerName.trim()) {
      socket.emit('join-room', { 
        roomName: roomCode.trim().toUpperCase(), 
        playerName: playerName.trim() 
      });
    }
  };
  const quiz = [
    {
      question: "What does socket.join() do?",
      options: [
        "Connects to server",
        "Joins a specific room",
        "Sends a message",
        "Disconnects from server"
      ],
      correct: 1
    },
    {
      question: "How to send a message to everyone in a room?",
      options: [
        "socket.emit()",
        "io.emit()",
        "io.to(roomName).emit()",
        "socket.send()"
      ],
      correct: 2
    },
    {
      question: "What happens when you leave a room?",
      options: [
        "Server crashes",
        "You stop receiving room messages",
        "Everyone disconnects",
        "Room gets deleted"
      ],
      correct: 1
    },
    {
      question: "Can you join multiple rooms at once?",
      options: [
        "No, only one room",
        "Yes, unlimited rooms",
        "Only 2 rooms max",
        "Depends on server"
      ],
      correct: 1
    },
    {
      question: "What's the main benefit of rooms?",
      options: [
        "Faster connection",
        "Better security",
        "Targeted/private messaging",
        "Lower latency"
      ],
      correct: 2
    }
  ];
  
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

  const handleSendRoomMessage = () => {
    if (roomInput.trim() && currentRoom) {
      socket.emit('room-message', { roomName: currentRoom, message: roomInput });
      setRoomInput('');
      setHasCompletedDemo(true);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leave-room');
    setCurrentRoom(null);
    setRoomPlayers([]);
    setRoomMessages([]);
    setRoomCode('');
    setPlayerName('');
  };

  const handleBack = () => {
    if (currentRoom) {
      handleLeaveRoom();
    }
    setLevel2Phase('theory');
    onBack();
  };

// QUIZ SCREEN
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
                <h1 className="text-2xl sm:text-3xl font-black text-purple-500">LEVEL 2 QUIZ</h1>
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
  // Theory
  
  if (level2Phase === 'theory') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        {/* Purple Glow Background */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          {/* Header - Responsive */}
          <header className="bg-[#0d1529] border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-purple-500/20 text-sm sm:text-base"
                >
                  <span>←</span>
                </button>

                {/* Title */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">⚡</div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                    <span className="text-purple-500">LEVEL 2</span>
                  </h1>
                </div>

                {/* Status Badge */}
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

          </header>

          {/* Theory Content - Responsive */}
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
            
            {/* Real-World Examples - RESPONSIVE */}
            <div className="mb-12 sm:mb-16 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-purple-400 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🌍</span>
                <span>Real-World Examples</span>
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Kahoot */}
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎯</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-purple-400">Kahoot</h4>
                  <p className="text-sm sm:text-base text-gray-300">Enter code → Join quiz → Play together</p>
                </div>

                {/* Discord */}
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">💬</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-purple-400">Discord</h4>
                  <p className="text-sm sm:text-base text-gray-300">Join server → Enter channels → Chat privately</p>
                </div>

                {/* Zoom */}
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📹</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-purple-400">Zoom</h4>
                  <p className="text-sm sm:text-base text-gray-300">Meeting ID → Join room → See everyone</p>
                </div>
              </div>
            </div>

            {/* How Rooms Work - FIXED OVERFLOW */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-purple-400 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">⚙️</span>
                <span>How Rooms Work</span>
              </h3>

              <div className="space-y-4 sm:space-y-6">
                {/* Step 1 */}
                <div className="flex gap-3 sm:gap-6 items-start">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">1️⃣</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-black mb-2 text-white">Join a Room</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-3">Users join using a unique room name</p>
                    <div className="bg-black rounded-xl border border-purple-500/30 p-3 sm:p-4 overflow-x-auto">
                      <code className="text-purple-400 text-xs sm:text-sm font-mono whitespace-nowrap">
                        socket.join('GAME123');
                      </code>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 sm:gap-6 items-start">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">2️⃣</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-black mb-2 text-white">Send to Room</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-3">Only room members receive messages</p>
                    <div className="bg-black rounded-xl border border-purple-500/30 p-3 sm:p-4 overflow-x-auto">
                      <code className="text-purple-400 text-xs sm:text-sm font-mono whitespace-nowrap">
                        io.to('GAME123').emit('msg', 'Hi!');
                      </code>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 sm:gap-6 items-start">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">3️⃣</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-black mb-2 text-white">Leave Room</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-3">Exit when done</p>
                    <div className="bg-black rounded-xl border border-purple-500/30 p-3 sm:p-4 overflow-x-auto">
                      <code className="text-purple-400 text-xs sm:text-sm font-mono whitespace-nowrap">
                        socket.leave('GAME123');
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example - SHORTENED & RESPONSIVE */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl overflow-hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="p-6 sm:p-8 border-b border-purple-500/30 bg-purple-500/5">
                <h3 className="text-2xl sm:text-3xl font-black text-purple-400 flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">👨‍💻</span>
                  <span>Essential Code</span>
                </h3>
              </div>
              
              <div className="p-6 sm:p-8">
                <h4 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 text-purple-300">Server Side</h4>
                <div className="bg-black rounded-xl sm:rounded-2xl border border-purple-500/30 overflow-hidden mb-6 sm:mb-8">
                  <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b border-purple-500/30 flex gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm overflow-x-auto font-mono">
                    <code className="text-purple-400">{`// Join room
socket.on('join-room', ({ roomName, playerName }) => {
  socket.join(roomName);
  io.to(roomName).emit('player-joined', { player: playerName });
});

// Send to room
socket.on('room-message', ({ roomName, message }) => {
  io.to(roomName).emit('room-message', {
    sender: socket.playerName,
    text: message
  });
});`}</code>
                  </pre>
                </div>

                <h4 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 text-purple-300">Client Side</h4>
                <div className="bg-black rounded-xl sm:rounded-2xl border border-purple-500/30 overflow-hidden">
                  <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b border-purple-500/30 flex gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm overflow-x-auto font-mono">
                    <code className="text-purple-400">{`// Join room
socket.emit('join-room', {
  roomName: 'GAME123',
  playerName: 'Alice'
});

// Listen for messages
socket.on('room-message', (data) => {
  console.log(data.sender + ': ' + data.text);
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Key Concepts  */}
            <div className="mb-12 sm:mb-16 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-purple-400 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🔑</span>
                <span>Key Concepts</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔒</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">Privacy</h4>
                  <p className="text-sm sm:text-base text-gray-300">Room A messages never seen by Room B</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">👥</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">Multiple Rooms</h4>
                  <p className="text-sm sm:text-base text-gray-300">Join multiple rooms at once</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">⚡</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">Real-Time</h4>
                  <p className="text-sm sm:text-base text-gray-300">Instant updates for all members</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎯</div>
                  <h4 className="text-lg sm:text-xl font-black mb-2 text-purple-300">Targeted Messages</h4>
                  <p className="text-sm sm:text-base text-gray-300">Send to specific groups only</p>
                </div>
              </div>
            </div>

           
            <div className="text-center animate-slideUp" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={() => setLevel2Phase('practice')}
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

  // PRACTICE PHASE - JOIN ROOM - 

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
       
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between max-w-2xl mx-auto w-full">
            <button
              onClick={() => setLevel2Phase('theory')}
              className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-purple-500/20 text-sm sm:text-base"
            >
              <span>←</span>
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-2xl sm:text-3xl">⚡</div>
              <h1 className="text-xl sm:text-2xl font-black text-purple-500">LEVEL 2</h1>
            </div>

            <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border ${
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

          <div className="max-w-2xl w-full mx-auto animate-scaleIn flex-1 flex items-center">

            {/* Join Form */}
            <div className="bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl overflow-hidden w-full">
              <div className="p-6 sm:p-10 border-b border-purple-500/30 bg-purple-500/5 text-center">
                <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">🚪</div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 text-purple-400">Join a Room</h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300">Enter a room code to start chatting</p>
              </div>

              <div className="p-6 sm:p-10">
                <div className="space-y-4 sm:space-y-6">
                  {/* Room Code Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-purple-300 mb-2 sm:mb-3">ROOM CODE</label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="GAME01"
                      maxLength={6}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-xl sm:text-2xl font-bold text-center tracking-widest placeholder-gray-600 transition-all duration-300"
                    />
                    <p className="mt-2 text-xs text-gray-500">Try ALPHA1, BETA22, or create your own!</p>
                  </div>

                  {/* Player Name Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-purple-300 mb-2 sm:mb-3">YOUR NAME</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={20}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-lg sm:text-xl placeholder-gray-600 transition-all duration-300"
                    />
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={handleJoinRoom}
                    disabled={!roomCode.trim() || !playerName.trim() || !isConnected}
                    className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg sm:text-xl font-black rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-3"
                  >
                    <span>Join Room</span>
                    <span className="text-xl sm:text-2xl">→</span>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-6 sm:mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="text-2xl sm:text-3xl">💡</div>
                    <div>
                      <h4 className="font-bold text-purple-300 mb-2 text-sm sm:text-base">How it works:</h4>
                      <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                        <li>• Same code = same chat room</li>
                        <li>• Different codes = different rooms</li>
                        <li>• Open multiple tabs to test!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
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

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out;
          }

          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // PRACTICE PHASE - IN ROOM CHAT - 
 
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
      {/* Purple Glow Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header  */}
        <header className="bg-[#0d1529] border-b border-purple-500/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Room Info */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">🏠</div>
                <div>
                  <div className="text-xs text-gray-400">Room</div>
                  <div className="text-base sm:text-xl font-black text-purple-400 tracking-wider">{currentRoom}</div>
                </div>
              </div>

              {/* Title */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-3xl">⚡</div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  <span className="text-purple-500">LEVEL 2</span>
                </h1>
              </div>

              {/* Leave Button */}
              <button
                onClick={handleLeaveRoom}
                className="px-3 sm:px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Chat -  */}
        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar-purple">
              {roomMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="text-5xl sm:text-6xl lg:text-7xl mb-4">💬</div>
                  <p className="text-xl sm:text-2xl font-bold">Room is ready!</p>
                  <p className="text-base sm:text-lg text-gray-600 mt-2">Start chatting...</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
                  {roomMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`opacity-0 animate-fadeInUp ${
                        msg.sender === playerName ? 'text-right' : ''
                      }`}
                    >
                      <div className={`inline-block max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg ${
                        msg.sender === playerName
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-black/80 border border-purple-500/30 text-gray-200'
                      }`}>
                        <div className="text-xs font-bold opacity-80 mb-1 sm:mb-2">
                          <span className="px-2 py-1 bg-black/30 rounded">
                            [{msg.timestamp}] {msg.sender}
                          </span>
                        </div>
                        <div className="text-sm sm:text-base lg:text-lg font-medium break-words">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-4 sm:p-6">
              <div className="max-w-4xl mx-auto flex gap-2 sm:gap-4">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendRoomMessage()}
                  placeholder="Type message..."
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-sm sm:text-base lg:text-lg placeholder-gray-600 transition-all duration-300"
                />
                <button
                  onClick={handleSendRoomMessage}
                  disabled={!roomInput.trim()}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 text-sm sm:text-base"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Players List - Responsive */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-purple-500/30 bg-black/40 backdrop-blur-xl p-4 sm:p-6 animate-slideInRight max-h-64 lg:max-h-none overflow-y-auto custom-scrollbar-purple">
            <h3 className="text-base sm:text-lg lg:text-xl font-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-purple-400">
              <span>👥</span>
              <span>Players ({roomPlayers.length})</span>
            </h3>

            <div className="space-y-2 sm:space-y-3">
              {roomPlayers.map((player) => (
                <div 
                  key={player.id}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    player.name === playerName
                      ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-black/60 border-purple-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-xl sm:text-2xl">
                      {player.name === playerName ? '👤' : '🙋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm sm:text-base truncate">
                        {player.name}
                        {player.name === playerName && (
                          <span className="ml-2 text-xs text-purple-400">(You)</span>
                        )}
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-6 sm:mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 sm:p-4">
              <div className="text-xs text-gray-400">
                <p>💡 Open another tab to test!</p>
              </div>
            </div>
          </div>
        </div>
        {/* Take Test */}
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

        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        /* Custom scrollbar with PURPLE GLOW */
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

export default Level2;