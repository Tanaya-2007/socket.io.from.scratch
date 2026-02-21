import React, { useState, useEffect, useRef } from 'react';

function Level2({ socket, isConnected, onBack, isTransitioning }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
   const [isPhaseTransitioning, setIsPhaseTransitioning] = useState(false);
  
  // Room state
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomInput, setRoomInput] = useState('');
  const [messagesSent, setMessagesSent] = useState(0);
  const messagesEndRef = useRef(null);

  // ✨ SMOOTH TRANSITION FUNCTION
  const smoothTransition = (callback) => {
    setIsPhaseTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsPhaseTransitioning(false), 50);
    }, 300);
  };

  const steps = [
    {
      id: 0,
      title: "Understanding Rooms",
      icon: "🏠",
      description: "Learn what rooms are and how they work",
      example: "Like Kahoot - enter a code, only people in that game see questions",
      task: "Read the concept and click 'Got it!'",
      canComplete: () => true,
      showDemo: false
    },
    {
      id: 1,
      title: "Join a Room",
      icon: "🚪",
      description: "Connect to a specific room using a code",
      example: "Like joining a Zoom meeting - need meeting ID to enter",
      task: "Join any room (try ALPHA1 or BETA22)",
      canComplete: () => currentRoom !== null,
      showDemo: true
    },
    {
      id: 2,
      title: "Room Communication",
      icon: "💬",
      description: "Send messages only to people in your room",
      example: "Like Discord channels - messages stay in that channel only",
      task: "Send 3 messages in the room",
      canComplete: () => messagesSent >= 3,
      showDemo: true
    }
  ];

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
  };

  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      smoothTransition(() => setCurrentStep(prev => prev + 1));
    } else {
      smoothTransition(() => setShowQuiz(true));
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      smoothTransition(() => setCurrentStep(prev => prev - 1));
    }
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct) correct++;
    });
    return { correct, total: quiz.length };
  };

  const currentStepData = steps[currentStep];
  const canCompleteCurrentStep = currentStepData.canComplete();
  const isStepCompleted = completedSteps.includes(currentStep);

  // QUIZ SCREEN
  if (showQuiz) {
    return (
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning || isPhaseTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => smoothTransition(() => setShowQuiz(false))} 
                  className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base"
                >
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-500">QUIZ</h1>
                </div>
                <div className="w-16 md:w-24"></div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
            <div className="max-w-4xl mx-auto">
              {!quizSubmitted ? (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-purple-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 border-b border-purple-500/30 bg-purple-500/5">
                    <div className="flex items-center gap-3 md:gap-6">
                      <div className="text-4xl md:text-6xl">🧠</div>
                      <div>
                        <h2 className="text-2xl md:text-4xl font-black text-purple-400 mb-2">Rooms Quiz!</h2>
                        <p className="text-sm md:text-lg text-gray-300">Test your knowledge</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-10 space-y-4 md:space-y-8">
                    {quiz.map((q, qIndex) => (
                      <div key={qIndex} className="bg-black/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-purple-500/20">
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
                                    ? 'bg-purple-500/30 border-2 border-purple-500 text-white'
                                    : 'bg-black/70 border border-purple-500/20 text-gray-300 hover:border-purple-500/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-purple-500/30'
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

                  <div className="p-4 md:p-10 border-t border-purple-500/30 bg-black/50">
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-purple-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 text-center">
                    <div className="text-5xl md:text-7xl mb-4 md:mb-6">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        return percentage === 100 ? '🏆' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
                      })()}
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-black text-purple-400 mb-3 md:mb-4">Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return 'Perfect! Rooms Master! 🏆';
                        if (percentage >= 80) return 'Excellent work! 🎉';
                        if (percentage >= 60) return 'Good job! 👍';
                        return 'Keep learning! 💪';
                      })()}
                    </p>

                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-left max-h-96 overflow-y-auto">
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
                                <p className="text-xs md:text-sm text-gray-300 mb-1 md:mb-2">Your: {q.options[userAnswer]}</p>
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
                      onClick={() => smoothTransition(onBack)}
                      className="px-6 md:px-8 py-3 md:py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
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

  // MAIN SCREEN - Continuing in next part due to size...
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning || isPhaseTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => smoothTransition(onBack)} 
                className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base"
              >
                <span>←</span> <span className="hidden sm:inline">Back</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">⚡</div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-500">LEVEL 2</h1>
              </div>
              
              <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
              }`}>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="hidden sm:inline">{isConnected ? 'ON' : 'OFF'}</span>
                  <span className="sm:hidden">{isConnected ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-black/60 backdrop-blur-xl border-b border-purple-500/20">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-xs md:text-sm font-bold text-gray-400">PROGRESS</span>
              <div className="text-lg md:text-2xl font-black text-purple-400">
                {Math.round((completedSteps.length / steps.length) * 100)}%
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1">
                  <div className={`h-2 md:h-3 rounded-full transition-all duration-500 ${
                    completedSteps.includes(index) ? 'bg-green-500' :
                    index === currentStep ? 'bg-purple-500' : 'bg-white/10'
                  }`} />
                  <div className="text-center mt-1.5 md:mt-2 text-sm md:text-base">
                    {completedSteps.includes(index) ? '✓' : step.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-4 md:py-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-purple-500/30 overflow-hidden">
              
              <div className="p-4 md:p-10 border-b border-purple-500/30 bg-purple-500/5">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm mb-3 md:mb-5">
                  <span className="px-2 md:px-4 py-1 md:py-2 bg-purple-500/20 rounded-full font-bold border border-purple-500/50 text-purple-400">
                    STEP {currentStep + 1}/{steps.length}
                  </span>
                  {isStepCompleted && (
                    <span className="px-2 md:px-4 py-1 md:py-2 bg-green-500/20 border border-green-500 text-green-400 rounded-full font-bold">✓</span>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-6 mb-4 md:mb-6">
                  <div className="text-4xl md:text-7xl">{currentStepData.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-5xl font-black mb-2 md:mb-3 text-purple-400">
                      {currentStepData.title}
                    </h2>
                    <p className="text-sm md:text-xl text-gray-300">{currentStepData.description}</p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <span className="text-2xl md:text-3xl">💡</span>
                    <div>
                      <h4 className="font-bold text-yellow-400 mb-2 text-sm md:text-base">Real-World Example:</h4>
                      <p className="text-gray-200 text-sm md:text-base">{currentStepData.example}</p>
                    </div>
                  </div>
                </div>
              </div>

              {currentStep === 1 && !currentRoom && (
                <div className="p-4 md:p-10 border-b border-purple-500/20">
                  <h3 className="text-lg md:text-2xl font-black mb-3 md:mb-6 flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-3xl">🚪</span>
                    <span>Join Room</span>
                  </h3>
                  
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-bold text-purple-300 mb-2">ROOM CODE</label>
                      <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="ALPHA1"
                        maxLength={6}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none text-white text-lg md:text-xl font-bold text-center tracking-widest placeholder-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-bold text-purple-300 mb-2">YOUR NAME</label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={20}
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none text-white text-base md:text-lg placeholder-gray-600"
                      />
                    </div>

                    <button
                      onClick={handleJoinRoom}
                      disabled={!roomCode.trim() || !playerName.trim() || !isConnected}
                      className="w-full px-6 md:px-8 py-4 md:py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg md:text-xl font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                      Join Room →
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && currentRoom && (
                <div className="p-4 md:p-10 border-b border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-2xl font-black flex items-center gap-2 md:gap-3">
                      <span className="text-xl md:text-3xl">💬</span>
                      <span>Room: {currentRoom}</span>
                    </h3>
                    <button
                      onClick={handleLeaveRoom}
                      className="px-3 md:px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-lg text-xs md:text-sm"
                    >
                      Leave
                    </button>
                  </div>
                  
                  <div className="bg-black rounded-xl border border-purple-500/30 overflow-hidden mb-4">
                    <div className="p-4 md:p-6 h-48 md:h-64 overflow-y-auto">
                      {roomMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                          <div className="text-4xl md:text-6xl mb-3">💬</div>
                          <p className="text-base md:text-lg font-bold">Room ready!</p>
                        </div>
                      ) : (
                        <>
                          {roomMessages.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`mb-3 ${msg.sender === playerName ? 'text-right' : ''}`}
                            >
                              <div className={`inline-block max-w-[85%] p-3 md:p-4 rounded-xl ${
                                msg.sender === playerName
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-black border border-purple-500/30 text-gray-200'
                              }`}>
                                <div className="text-xs opacity-80 mb-1">[{msg.timestamp}] {msg.sender}</div>
                                <div className="text-sm md:text-base">{msg.text}</div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 md:gap-4">
                    <input
                      type="text"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type message..."
                      className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none text-white text-sm md:text-lg placeholder-gray-600"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!roomInput.trim()}
                      className="px-6 md:px-8 py-3 md:py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all text-sm md:text-base"
                    >
                      Send
                    </button>
                  </div>

                  <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 md:p-4">
                    <div className="flex gap-2 md:gap-3">
                      <div className="text-xl md:text-2xl">👥</div>
                      <div className="text-xs md:text-sm text-gray-300">
                        <strong className="text-purple-300">{roomPlayers.length} players online</strong>
                        <p className="mt-1">Open another tab to test!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 md:p-10 bg-yellow-500/5 border-b border-yellow-500/20">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-6">
                  <span className="text-3xl md:text-5xl">🎯</span>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-2xl font-black text-yellow-400 mb-2 md:mb-3">
                      Task {canCompleteCurrentStep && <span className="text-xs md:text-sm text-green-400">(Done!)</span>}
                    </h3>
                    <p className="text-sm md:text-lg text-gray-200 mb-2 md:mb-4">{currentStepData.task}</p>
                    
                    {canCompleteCurrentStep && !isStepCompleted && (
                      <button
                        onClick={completeStep}
                        className="mt-3 md:mt-6 px-4 md:px-8 py-2 md:py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg md:rounded-2xl transition-all flex items-center gap-2 md:gap-3 text-sm md:text-lg"
                      >
                        <span className="text-base md:text-2xl">✓</span>
                        <span>Complete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-8 bg-black/80 flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
                <button
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className="w-full sm:w-auto px-4 md:px-8 py-2 md:py-4 bg-black/90 border border-white/20 text-white font-bold rounded-lg md:rounded-2xl disabled:opacity-30 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg order-2 sm:order-1"
                >
                  <span>←</span> Prev
                </button>
                
                <div className="text-center order-1 sm:order-2">
                  <div className="text-xs md:text-sm text-gray-500">Step</div>
                  <div className="text-xl md:text-3xl font-black">{currentStep + 1}/{steps.length}</div>
                </div>
                
                <button
                  onClick={nextStep}
                  disabled={!isStepCompleted}
                  className="w-full sm:w-auto px-4 md:px-8 py-2 md:py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg md:rounded-2xl disabled:opacity-30 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg order-3"
                >
                  {currentStep === steps.length - 1 ? 'Quiz' : 'Next'} <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Level2;