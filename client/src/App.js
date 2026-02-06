import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  // Global state
  const [isConnected, setIsConnected] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null); // null, 1, or 2
  
  // Level 1 state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [messagesSent, setMessagesSent] = useState(0);
  const [showPracticeTest, setShowPracticeTest] = useState(false);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  
  // Level 2 state
  const [level2Phase, setLevel2Phase] = useState('theory'); // 'theory' or 'practice'
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomInput, setRoomInput] = useState('');
  
  const messagesEndRef = useRef(null);

  const steps = [
    {
      id: 0,
      title: "Establish Connection",
      icon: "🔌",
      description: "When a client connects to the server, both sides know about it instantly. This creates a persistent two-way communication channel.",
      serverCode: `// Server listens for new connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // socket.id = unique identifier
});`,
      clientCode: `// Client connects automatically
socket.on('connect', () => {
  console.log('Connected!', socket.id);
});`,
      task: "Open your browser console (F12) and find your unique socket.id",
      hint: "Look for the green 'ONLINE' badge above",
      canComplete: () => isConnected,
      showDemo: false
    },
    {
      id: 1,
      title: "Emit Events",
      icon: "📤",
      description: "Use emit() to send custom events from client to server. Think of it like sending a message in a specific channel.",
      serverCode: `// Server receives the event
socket.on('message', (data) => {
  console.log('Received:', data);
  // data = whatever client sent
});`,
      clientCode: `// Client sends the event
socket.emit('message', 'Hello Server!');
// First param = event name
// Second param = data to send`,
      task: "Send at least 3 messages using the terminal above",
      hint: "Type in the input box and hit Send",
      canComplete: () => messagesSent >= 3,
      showDemo: true
    },
    {
      id: 2,
      title: "Server Response",
      icon: "📥",
      description: "Server can send messages back! This creates real-time two-way communication - the foundation of chat apps, live updates, and multiplayer games.",
      serverCode: `// Server sends response
socket.emit('response', {
  text: 'Got your message!',
  timestamp: Date.now()
});`,
      clientCode: `// Client receives response
socket.on('response', (data) => {
  console.log('Server says:', data.text);
  // Instant feedback!
});`,
      task: "Send a message and watch the server respond instantly",
      hint: "Notice how fast the response is - that's WebSocket magic!",
      canComplete: () => messages.some(m => m.sender === 'Server'),
      showDemo: true
    }
  ];

  const practiceTest = [
    {
      question: "What is the correct way to emit an event from client to server?",
      code: `// Option A
socket.send('message', data);

// Option B
socket.emit('message', data);

// Option C
io.emit('message', data);

// Option D
socket.on('message', data);`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 1
    },
    {
      question: "How does the server listen for a specific event?",
      code: `// Option A
io.on('connection', (socket) => {
  socket.listen('message', (data) => {});
});

// Option B
io.on('connection', (socket) => {
  socket.on('message', (data) => {});
});

// Option C
socket.receive('message', (data) => {});

// Option D
io.receive('message', (data) => {});`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 1
    },
    {
      question: "What happens when a client connects to the server?",
      code: `io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
});`,
      options: [
        "The 'connection' event fires only on the client",
        "The 'connection' event fires on the server with a unique socket",
        "Nothing happens automatically",
        "The server sends a message to all clients"
      ],
      correct: 1
    },
    {
      question: "How do you send data back to a specific client?",
      code: `io.on('connection', (socket) => {
  socket.on('message', (data) => {
    // Send response back
    ???
  });
});`,
      options: [
        "io.emit('response', data)",
        "socket.emit('response', data)",
        "socket.broadcast.emit('response', data)",
        "socket.send('response', data)"
      ],
      correct: 1
    },
    {
      question: "What is the difference between socket.emit() and io.emit()?",
      code: `// In server
socket.emit('event', data);  // Does what?
io.emit('event', data);      // Does what?`,
      options: [
        "Both send to all clients",
        "socket.emit sends to one client, io.emit sends to all clients",
        "Both send to one client",
        "socket.emit sends to all, io.emit sends to one"
      ],
      correct: 1
    }
  ];

  // Socket.IO event listeners
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      addSystemMessage('Connected to Socket.IO Server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addSystemMessage('Disconnected from Server');
    });

    // Level 1 events
    socket.on('response', (data) => {
      addMessage('Server', data.text, data.timestamp);
    });

    // Level 2 events
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
      socket.off('connect');
      socket.off('disconnect');
      socket.off('response');
      socket.off('joined-room');
      socket.off('player-joined');
      socket.off('room-message');
      socket.off('player-left');
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, roomMessages]);

  // Helper functions
  const addMessage = (sender, text, timestamp = null) => {
    setMessages(prev => [...prev, { 
      sender, 
      text, 
      timestamp: timestamp || new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    }]);
  };

  const addSystemMessage = (text) => {
    addMessage('System', text);
  };

  const handleSend = () => {
    if (inputMessage.trim()) {
      socket.emit('message', inputMessage);
      addMessage('You', inputMessage);
      setInputMessage('');
      setMessagesSent(prev => prev + 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setMessages([]);
      setMessagesSent(0);
    } else {
      setShowPracticeTest(true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleTestAnswer = (questionIndex, answerIndex) => {
    setTestAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitTest = () => {
    setTestSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    practiceTest.forEach((q, index) => {
      if (testAnswers[index] === q.correct) correct++;
    });
    return { correct, total: practiceTest.length };
  };

  // Level 2 functions
  const handleJoinRoom = () => {
    if (roomCode.trim() && playerName.trim()) {
      socket.emit('join-room', { 
        roomName: roomCode.trim().toUpperCase(), 
        playerName: playerName.trim() 
      });
    }
  };

  const handleSendRoomMessage = () => {
    if (roomInput.trim() && currentRoom) {
      socket.emit('room-message', { roomName: currentRoom, message: roomInput });
      setRoomInput('');
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

  const resetToHome = () => {
    setCurrentLevel(null);
    setCurrentStep(0);
    setCompletedSteps([]);
    setMessages([]);
    setMessagesSent(0);
    setShowPracticeTest(false);
    setTestAnswers({});
    setTestSubmitted(false);
    setLevel2Phase('theory');
    if (currentRoom) {
      handleLeaveRoom();
    }
  };

  // ═══════════════════════════════════════════════════════════
  // LEVEL SELECTOR SCREEN
  // ═══════════════════════════════════════════════════════════
  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-6xl w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-8xl mb-6 animate-bounce-slow">⚡</div>
              <h1 className="text-7xl font-black mb-4">
                <span className="text-white">SOCKET</span>
                <span className="text-blue-500">/</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">MATRIX</span>
              </h1>
              <p className="text-2xl text-gray-400 mb-6">Master Real-Time Communication</p>
              
              {/* Connection Status */}
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${
                isConnected 
                  ? 'bg-green-500/20 border-green-500 text-green-400' 
                  : 'bg-red-500/20 border-red-500 text-red-400'
              }`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="font-bold">{isConnected ? 'SERVER ONLINE' : 'SERVER OFFLINE'}</span>
              </div>
            </div>

            {/* Level Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Level 1 Card */}
              <button
                onClick={() => setCurrentLevel(1)}
                className="group relative bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-3xl p-10 hover:border-blue-400 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🔌</div>
                  <div className="mb-6">
                    <div className="text-sm font-bold text-blue-400 mb-2">LEVEL 1</div>
                    <h3 className="text-4xl font-black mb-3 text-white">Connection & Events</h3>
                    <p className="text-lg text-gray-400">Learn how WebSockets connect, emit events, and respond in real-time</p>
                  </div>
                  <div className="flex items-center gap-3 text-blue-400 font-bold">
                    <span>Start Learning</span>
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>

              {/* Level 2 Card */}
              <button
                onClick={() => setCurrentLevel(2)}
                className="group relative bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-10 hover:border-purple-400 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🏠</div>
                  <div className="mb-6">
                    <div className="text-sm font-bold text-purple-400 mb-2">LEVEL 2</div>
                    <h3 className="text-4xl font-black mb-3 text-white">Rooms</h3>
                    <p className="text-lg text-gray-400">Create private rooms like Kahoot, Discord, or Zoom meetings</p>
                  </div>
                  <div className="flex items-center gap-3 text-purple-400 font-bold">
                    <span>Start Learning</span>
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LEVEL 1: Connection & Events
  // ═══════════════════════════════════════════════════════════
  if (currentLevel === 1) {
    const currentStepData = steps[currentStep];
    const canCompleteCurrentStep = currentStepData.canComplete();
    const isStepCompleted = completedSteps.includes(currentStep);

    if (showPracticeTest) {
      return (
        <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
          
          {/* Blue Glow Background */}
          <div className="fixed inset-0 z-0 opacity-40">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px]"></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30 sticky top-0 z-40">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={resetToHome}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
                  >
                    <span>←</span> Back to Levels
                  </button>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl">⚡</div>
                    <div className="text-center">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                        <span className="text-white">SOCKET</span>
                        <span className="text-blue-500">/</span>
                        <span className="text-blue-500">MATRIX</span>
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-400 font-medium">Practice Test 🎯</p>
                    </div>
                  </div>
                  <div className="w-24"></div>
                </div>
              </div>
            </header>

            {/* Practice Test Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
              <div className="max-w-4xl mx-auto">
                
                {!testSubmitted ? (
                  <div className="bg-black/90 backdrop-blur-xl rounded-3xl border border-blue-500/30 overflow-hidden">
                    <div className="p-6 sm:p-10 border-b border-blue-500/30 bg-blue-500/5">
                      <div className="flex items-center gap-4 sm:gap-6 mb-4">
                        <div className="text-5xl sm:text-6xl">🧠</div>
                        <div>
                          <h2 className="text-3xl sm:text-4xl font-black text-blue-400 mb-2">
                            Code Practice Test
                          </h2>
                          <p className="text-base sm:text-lg text-gray-300">
                            Test your Socket.IO knowledge with real code examples
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                      {practiceTest.map((q, qIndex) => (
                        <div key={qIndex} className="bg-black/50 p-4 sm:p-6 rounded-2xl border border-blue-500/20">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                            Question {qIndex + 1}: {q.question}
                          </h3>
                          
                          {/* Code Block */}
                          <div className="bg-black rounded-xl border border-blue-500/30 overflow-hidden mb-4">
                            <div className="px-4 py-2 bg-black/80 border-b border-blue-500/30 flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto">
                              <code className="text-blue-400">{q.code}</code>
                            </pre>
                          </div>

                          {/* Options */}
                          <div className="space-y-2 sm:space-y-3">
                            {q.options.map((option, oIndex) => {
                              const isSelected = testAnswers[qIndex] === oIndex;
                              
                              return (
                                <button
                                  key={oIndex}
                                  onClick={() => handleTestAnswer(qIndex, oIndex)}
                                  className={`w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 ${
                                    isSelected
                                      ? 'bg-blue-500/30 border-2 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                      : 'bg-black/70 border border-blue-500/20 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-blue-500/30'
                                    }`}>
                                      {isSelected && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="text-sm sm:text-base">{option}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 sm:p-10 border-t border-blue-500/30 bg-black/50">
                      <button
                        onClick={submitTest}
                        disabled={Object.keys(testAnswers).length !== practiceTest.length}
                        className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 text-base sm:text-lg"
                      >
                        Submit Test
                      </button>
                    </div>
                  </div>
                ) : (
                  // Results Screen
                  <div className="bg-black/90 backdrop-blur-xl rounded-3xl border border-blue-500/30 overflow-hidden">
                    <div className="p-6 sm:p-10 text-center">
                      <div className="text-6xl sm:text-7xl mb-6">
                        {(() => {
                          const { correct, total } = calculateScore();
                          const percentage = (correct / total) * 100;
                          return percentage === 100 ? '🏆' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
                        })()}
                      </div>
                      
                      <h2 className="text-3xl sm:text-4xl font-black text-blue-400 mb-4">
                        Test Complete!
                      </h2>
                      
                      <div className="text-5xl sm:text-6xl font-black text-white mb-4">
                        {calculateScore().correct} / {calculateScore().total}
                      </div>
                      
                      <p className="text-lg sm:text-xl text-gray-300 mb-8">
                        {(() => {
                          const { correct, total } = calculateScore();
                          const percentage = (correct / total) * 100;
                          if (percentage === 100) return 'Perfect Score! You\'re a Socket.IO Master! 🏆';
                          if (percentage >= 80) return 'Excellent! You understand Socket.IO well! 🎉';
                          if (percentage >= 60) return 'Good job! Keep practicing! 👍';
                          return 'Keep learning! Review the steps again! 💪';
                        })()}
                      </p>

                      {/* Show Answers */}
                      <div className="space-y-4 mb-8 text-left">
                        {practiceTest.map((q, qIndex) => {
                          const userAnswer = testAnswers[qIndex];
                          const isCorrect = userAnswer === q.correct;
                          
                          return (
                            <div key={qIndex} className={`p-4 rounded-xl border-2 ${
                              isCorrect 
                                ? 'bg-green-500/10 border-green-500/50' 
                                : 'bg-red-500/10 border-red-500/50'
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">{isCorrect ? '✓' : '✗'}</div>
                                <div className="flex-1">
                                  <p className="font-bold text-white mb-2">Question {qIndex + 1}</p>
                                  <p className="text-sm text-gray-300 mb-2">Your answer: {q.options[userAnswer]}</p>
                                  {!isCorrect && (
                                    <p className="text-sm text-green-400">Correct answer: {q.options[q.correct]}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={resetToHome}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 text-base sm:text-lg"
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

    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
        
        {/* Blue Glow Background */}
        <div className="fixed inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <button
                  onClick={resetToHome}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
                >
                  <span>←</span> Back to Levels
                </button>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl">⚡</div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                      <span className="text-white">SOCKET</span>
                      <span className="text-blue-500">/</span>
                      <span className="text-blue-500">MATRIX</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Interactive Socket.IO Tutorial 🎮</p>
                  </div>
                </div>
                
                <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all duration-300 ${
                  isConnected 
                    ? 'bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/30' 
                    : 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full relative ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
                      {isConnected && <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>}
                    </div>
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Progress Bar */}
          <div className="bg-black/60 backdrop-blur-xl border-b border-blue-500/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs sm:text-sm font-semibold text-gray-400 tracking-wide">PROGRESS</span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-xl sm:text-2xl font-black text-blue-400">
                    {Math.round((completedSteps.length / steps.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    {completedSteps.length}/{steps.length}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                {steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className="flex-1"
                    onClick={() => completedSteps.includes(index) && setCurrentStep(index)}
                  >
                    <div className="relative">
                      <div 
                        className={`h-2 sm:h-3 rounded-full transition-all duration-500 cursor-pointer ${
                          completedSteps.includes(index)
                            ? 'bg-green-500 shadow-lg shadow-green-500/50'
                            : index === currentStep
                            ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                            : 'bg-white/10'
                        }`}
                      />
                      <div className="text-xs sm:text-sm text-center mt-2 sm:mt-3 font-bold">
                        {completedSteps.includes(index) ? (
                          <span className="text-green-400">✓</span>
                        ) : index === currentStep ? (
                          <span className="text-blue-400">{step.icon}</span>
                        ) : (
                          <span className="text-gray-600">{step.icon}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="max-w-5xl mx-auto">
              
              {/* Step Card */}
              <div className="bg-black/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-blue-500/30 overflow-hidden">
                
                {/* Step Header */}
                <div className="p-6 sm:p-8 lg:p-10 border-b border-blue-500/30 bg-blue-500/5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 mb-4 sm:mb-5">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 rounded-full font-bold border border-blue-500/50 text-blue-400">
                      STEP {currentStep + 1} OF {steps.length}
                    </span>
                    {isStepCompleted && (
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 border border-green-500 text-green-400 rounded-full text-xs font-bold">
                        COMPLETED ✓
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="text-5xl sm:text-6xl lg:text-7xl">{currentStepData.icon}</div>
                    <div className="flex-1">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 text-blue-400">
                        {currentStepData.title}
                      </h2>
                      <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed font-medium">
                        {currentStepData.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowCodeModal(true)}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <span className="text-lg sm:text-2xl">👨‍💻</span>
                    <span>View Code</span>
                  </button>
                </div>

                {/* Interactive Demo */}
                {currentStepData.showDemo && (
                  <div className="p-6 sm:p-8 lg:p-10 border-b border-blue-500/20 bg-black/50">
                    <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-100">
                      <span className="text-2xl sm:text-3xl">💻</span>
                      <span>Live Demo</span>
                    </h3>
                    
                    {/* Terminal */}
                    <div className="bg-black rounded-xl sm:rounded-2xl border border-blue-500/30 overflow-hidden mb-4 sm:mb-6 shadow-lg shadow-blue-500/20">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-black/90 border-b border-blue-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex gap-1.5 sm:gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-400 font-mono font-bold hidden sm:inline">terminal@socket-matrix</span>
                        </div>
                        <span className="px-2 sm:px-3 py-1 border border-blue-500/50 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">
                          LIVE
                        </span>
                      </div>

                      <div className="p-4 sm:p-6 h-64 sm:h-80 overflow-y-auto custom-scrollbar">
                        {messages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">💬</div>
                            <p className="text-sm sm:text-base lg:text-lg font-semibold">Terminal ready</p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-2">Start typing...</p>
                          </div>
                        ) : (
                          <>
                            {messages.map((msg) => (
                              <div 
                                key={msg.id}
                                className={`mb-3 sm:mb-4 opacity-0 animate-fadeInUp ${msg.sender === 'You' ? 'text-right' : ''}`}
                              >
                                <div className={`inline-block max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 ${
                                  msg.sender === 'You' 
                                    ? 'bg-blue-600 text-white font-semibold shadow-blue-500/30' 
                                    : msg.sender === 'System'
                                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                                    : 'bg-black border border-blue-500/30 text-gray-200'
                                }`}>
                                  <div className="text-xs font-bold opacity-80 mb-2">
                                    <span className="px-2 py-1 bg-black/30 rounded">
                                      [{msg.timestamp}] {msg.sender}
                                    </span>
                                  </div>
                                  <div className="text-sm sm:text-base font-medium break-words">{msg.text}</div>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 sm:gap-3 lg:gap-4">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={!isConnected}
                        placeholder="Type your message..."
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-black/90 backdrop-blur-xl border border-blue-500/30 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:shadow-lg focus:shadow-blue-500/30 disabled:opacity-50 text-white placeholder-gray-500 font-medium text-sm sm:text-base lg:text-lg transition-all duration-300"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!isConnected || !inputMessage.trim()}
                        className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 text-sm sm:text-base lg:text-lg whitespace-nowrap"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {/* Task */}
                <div className="p-6 sm:p-8 lg:p-10 bg-yellow-500/5 border-b border-yellow-500/20">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <span className="text-4xl sm:text-5xl">🎯</span>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mb-2 sm:mb-3 flex items-center gap-2">
                        Your Mission
                        {canCompleteCurrentStep && <span className="text-xs sm:text-sm text-green-400">(Ready!)</span>}
                      </h3>
                      <p className="text-gray-200 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
                        {currentStepData.task}
                      </p>
                      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-500/10 border-l-4 border-blue-500 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-300 font-semibold">💡 Pro Tip: {currentStepData.hint}</p>
                      </div>
                      
                      {canCompleteCurrentStep && !isStepCompleted && (
                        <button
                          onClick={completeStep}
                          className="mt-4 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg"
                        >
                          <span className="text-lg sm:text-2xl">✓</span>
                          <span>Complete This Step</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-4 sm:p-6 lg:p-8 bg-black/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-black/90 border border-white/20 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-black hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg order-2 sm:order-1"
                  >
                    <span className="text-lg sm:text-xl">←</span>
                    <span>Previous</span>
                  </button>
                  
                  <div className="text-center order-1 sm:order-2">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Step Progress</div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {currentStep + 1} / {steps.length}
                    </div>
                  </div>
                  
                  <button
                    onClick={nextStep}
                    disabled={!isStepCompleted}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl sm:rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg order-3"
                  >
                    <span>{currentStep === steps.length - 1 ? 'Take Test' : 'Next Step'}</span>
                    <span className="text-lg sm:text-xl">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Modal */}
        {showCodeModal && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            onClick={() => setShowCodeModal(false)}
          >
            <div 
              className="bg-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-blue-500/30 max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl shadow-blue-500/20 animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 lg:p-8 border-b border-blue-500/30 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-xl z-10">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-400">
                  Code Reference
                </h3>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="text-gray-400 hover:text-white text-2xl sm:text-3xl hover:rotate-90 transition-all duration-300 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full hover:bg-red-500/20"
                >
                  ×
                </button>
              </div>

              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Server Code */}
                <div>
                  <h4 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-blue-400">
                    <span className="text-xl sm:text-2xl">🖥️</span>
                    <span>Server Side (backend/index.js)</span>
                  </h4>
                  <div className="bg-black rounded-xl sm:rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg shadow-blue-500/10">
                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b border-blue-500/30 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-4 sm:p-6 text-xs sm:text-sm lg:text-base overflow-x-auto font-mono">
                      <code className="text-blue-400">{currentStepData.serverCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Client Code */}
                <div>
                  <h4 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-blue-400">
                    <span className="text-xl sm:text-2xl">💻</span>
                    <span>Client Side (src/App.js)</span>
                  </h4>
                  <div className="bg-black rounded-xl sm:rounded-2xl border border-blue-500/30 overflow-hidden shadow-lg shadow-blue-500/10">
                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b border-blue-500/30 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-4 sm:p-6 text-xs sm:text-sm lg:text-base overflow-x-auto font-mono">
                      <code className="text-blue-400">{currentStepData.clientCode}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.4s ease-out forwards;
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }

          /* Custom scrollbar with BLUE GLOW */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #000000;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 10px;
            box-shadow: 0 0 10px #3b82f6;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #2563eb;
            box-shadow: 0 0 15px #3b82f6;
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LEVEL 2: ROOMS
  // ═══════════════════════════════════════════════════════════
  if (currentLevel === 2) {
    if (level2Phase === 'theory') {
      return (
        <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
          {/* Purple Glow Background */}
          <div className="fixed inset-0 z-0 opacity-30">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
              <div className="container mx-auto px-6 py-5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={resetToHome}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
                  >
                    <span>←</span> Back to Levels
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="text-4xl">⚡</div>
                    <div>
                      <h1 className="text-4xl font-black tracking-tight">
                        <span className="text-white">SOCKET</span>
                        <span className="text-purple-500">/</span>
                        <span className="text-purple-500">MATRIX</span>
                      </h1>
                      <p className="text-sm text-gray-400 font-medium">Level 2: Rooms 🏠</p>
                    </div>
                  </div>

                  <div className={`px-6 py-3 rounded-xl text-sm font-bold border-2 ${
                    isConnected 
                      ? 'bg-green-500/20 border-green-500 text-green-400' 
                      : 'bg-red-500/20 border-red-500 text-red-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      {isConnected ? 'ONLINE' : 'OFFLINE'}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Theory Content */}
            <div className="container mx-auto px-6 py-12 max-w-6xl">
              
              {/* Hero Section */}
              <div className="text-center mb-16">
                <div className="text-8xl mb-6 animate-bounce-slow">🏠</div>
                <h2 className="text-6xl font-black mb-4">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    ROOMS
                  </span>
                </h2>
                <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                  Create private communication channels - just like Kahoot quiz codes, Discord servers, or Zoom meetings!
                </p>
              </div>

              {/* Real-World Examples */}
              <div className="mb-16">
                <h3 className="text-3xl font-black mb-8 text-purple-400 flex items-center gap-3">
                  <span>🌍</span>
                  <span>Real-World Examples</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Kahoot */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-3xl p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                    <div className="text-5xl mb-4">🎯</div>
                    <h4 className="text-2xl font-black mb-3 text-purple-400">Kahoot</h4>
                    <p className="text-gray-300">Enter a 6-digit code → Join the quiz room → Play with everyone in that room</p>
                  </div>

                  {/* Discord */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-3xl p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                    <div className="text-5xl mb-4">💬</div>
                    <h4 className="text-2xl font-black mb-3 text-purple-400">Discord</h4>
                    <p className="text-gray-300">Join a server → Enter specific channels → Only see messages in that channel</p>
                  </div>

                  {/* Zoom */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/30 rounded-3xl p-8 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                    <div className="text-5xl mb-4">📹</div>
                    <h4 className="text-2xl font-black mb-3 text-purple-400">Zoom</h4>
                    <p className="text-gray-300">Meeting ID + Password → Join the meeting room → See everyone in that meeting</p>
                  </div>
                </div>
              </div>

              {/* How Rooms Work */}
              <div className="mb-16 bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-10">
                <h3 className="text-3xl font-black mb-8 text-purple-400 flex items-center gap-3">
                  <span>⚙️</span>
                  <span>How Rooms Work</span>
                </h3>

                <div className="space-y-6">
                  <div className="flex gap-6 items-start">
                    <div className="text-4xl">1️⃣</div>
                    <div>
                      <h4 className="text-xl font-black mb-2 text-white">Create or Join a Room</h4>
                      <p className="text-gray-300 text-lg">Users join a specific "room" using a unique room name (like "GAME123")</p>
                      <div className="mt-3 bg-black rounded-xl border border-purple-500/30 p-4">
                        <code className="text-purple-400 text-sm font-mono">
                          socket.join('GAME123');
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="text-4xl">2️⃣</div>
                    <div>
                      <h4 className="text-xl font-black mb-2 text-white">Send Messages to Room</h4>
                      <p className="text-gray-300 text-lg">When you emit to a room, ONLY users in that room receive the message</p>
                      <div className="mt-3 bg-black rounded-xl border border-purple-500/30 p-4">
                        <code className="text-purple-400 text-sm font-mono">
                          io.to('GAME123').emit('message', 'Hello room!');
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="text-4xl">3️⃣</div>
                    <div>
                      <h4 className="text-xl font-black mb-2 text-white">Leave the Room</h4>
                      <p className="text-gray-300 text-lg">Users can leave rooms when done, just like exiting a Discord channel</p>
                      <div className="mt-3 bg-black rounded-xl border border-purple-500/30 p-4">
                        <code className="text-purple-400 text-sm font-mono">
                          socket.leave('GAME123');
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="mb-16 bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl overflow-hidden">
                <div className="p-8 border-b border-purple-500/30 bg-purple-500/5">
                  <h3 className="text-3xl font-black text-purple-400 flex items-center gap-3">
                    <span>👨‍💻</span>
                    <span>The Code</span>
                  </h3>
                </div>
                
                <div className="p-8">
                  <h4 className="text-xl font-black mb-4 text-purple-300">Server Side</h4>
                  <div className="bg-black rounded-2xl border border-purple-500/30 overflow-hidden mb-8">
                    <div className="px-6 py-3 bg-black/80 border-b border-purple-500/30 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-6 text-sm overflow-x-auto font-mono">
                      <code className="text-purple-400">{`// Join a room
socket.on('join-room', ({ roomName, playerName }) => {
  socket.join(roomName);  // Add this socket to room
  socket.roomName = roomName;  // Store room name
  socket.playerName = playerName;  // Store player name
  
  // Tell everyone in room
  io.to(roomName).emit('player-joined', {
    player: playerName
  });
});

// Send message to room
socket.on('room-message', ({ roomName, message }) => {
  io.to(roomName).emit('room-message', {
    sender: socket.playerName,
    text: message
  });
});

// Leave room
socket.on('leave-room', () => {
  socket.leave(socket.roomName);
});`}</code>
                    </pre>
                  </div>

                  <h4 className="text-xl font-black mb-4 text-purple-300">Client Side</h4>
                  <div className="bg-black rounded-2xl border border-purple-500/30 overflow-hidden">
                    <div className="px-6 py-3 bg-black/80 border-b border-purple-500/30 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-6 text-sm overflow-x-auto font-mono">
                      <code className="text-purple-400">{`// Join a room
socket.emit('join-room', {
  roomName: 'GAME123',
  playerName: 'Alice'
});

// Listen for messages
socket.on('room-message', (data) => {
  console.log(data.sender + ': ' + data.text);
});

// Leave room
socket.emit('leave-room');`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Key Concepts */}
              <div className="mb-16">
                <h3 className="text-3xl font-black mb-8 text-purple-400 flex items-center gap-3">
                  <span>🔑</span>
                  <span>Key Concepts</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6">
                    <div className="text-3xl mb-3">🔒</div>
                    <h4 className="text-xl font-black mb-2 text-purple-300">Privacy</h4>
                    <p className="text-gray-300">Messages in Room A are NEVER seen by Room B. Each room is isolated!</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6">
                    <div className="text-3xl mb-3">👥</div>
                    <h4 className="text-xl font-black mb-2 text-purple-300">Multiple Rooms</h4>
                    <p className="text-gray-300">A single socket can be in multiple rooms at once (like being in multiple Discord channels)</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6">
                    <div className="text-3xl mb-3">⚡</div>
                    <h4 className="text-xl font-black mb-2 text-purple-300">Real-Time</h4>
                    <p className="text-gray-300">All room members get updates instantly - perfect for multiplayer games!</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-6">
                    <div className="text-3xl mb-3">🎯</div>
                    <h4 className="text-xl font-black mb-2 text-purple-300">Targeted Broadcasting</h4>
                    <p className="text-gray-300">Send to specific groups instead of everyone connected to your server</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={() => setLevel2Phase('practice')}
                  className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-2xl font-black rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-4 mx-auto"
                >
                  <span>Got it! Let's Practice</span>
                  <span className="text-3xl">→</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      );
    }

    // Practice Phase
    if (!currentRoom) {
      // Join Room Screen
      return (
        <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
          {/* Purple Glow Background */}
          <div className="fixed inset-0 z-0 opacity-30">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
              
              {/* Back Button */}
              <button
                onClick={() => setLevel2Phase('theory')}
                className="mb-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
              >
                <span>←</span> Back to Theory
              </button>

              {/* Join Form */}
              <div className="bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl overflow-hidden">
                <div className="p-10 border-b border-purple-500/30 bg-purple-500/5 text-center">
                  <div className="text-7xl mb-6">🚪</div>
                  <h2 className="text-5xl font-black mb-3 text-purple-400">Join a Room</h2>
                  <p className="text-xl text-gray-300">Enter a room code to start chatting (like Kahoot!)</p>
                </div>

                <div className="p-10">
                  <div className="space-y-6">
                    {/* Room Code Input */}
                    <div>
                      <label className="block text-sm font-bold text-purple-300 mb-3">ROOM CODE</label>
                      <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character code (e.g., GAME01)"
                        maxLength={6}
                        className="w-full px-6 py-4 bg-black/90 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-2xl font-bold text-center tracking-widest placeholder-gray-600 transition-all duration-300"
                      />
                      <p className="mt-2 text-xs text-gray-500">Tip: Try ALPHA1, BETA22, or create your own!</p>
                    </div>

                    {/* Player Name Input */}
                    <div>
                      <label className="block text-sm font-bold text-purple-300 mb-3">YOUR NAME</label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={20}
                        className="w-full px-6 py-4 bg-black/90 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-xl placeholder-gray-600 transition-all duration-300"
                      />
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={handleJoinRoom}
                      disabled={!roomCode.trim() || !playerName.trim() || !isConnected}
                      className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xl font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-3"
                    >
                      <span>Join Room</span>
                      <span className="text-2xl">→</span>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex gap-4">
                      <div className="text-3xl">💡</div>
                      <div>
                        <h4 className="font-bold text-purple-300 mb-2">How it works:</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Enter the same room code as your friends to chat together</li>
                          <li>• Different room codes = different private chat rooms</li>
                          <li>• Open multiple tabs to test with yourself!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // In Room - Chat Interface
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden">
        {/* Purple Glow Background */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 h-screen flex flex-col">
          {/* Header */}
          <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🏠</div>
                  <div>
                    <div className="text-sm text-gray-400">Room Code</div>
                    <div className="text-2xl font-black text-purple-400 tracking-wider">{currentRoom}</div>
                  </div>
                </div>

                <button
                  onClick={handleLeaveRoom}
                  className="px-6 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all duration-300"
                >
                  Leave Room
                </button>
              </div>
            </div>
          </header>

          {/* Main Content - Chat */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-purple">
                {roomMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="text-7xl mb-4">💬</div>
                    <p className="text-2xl font-bold">Room is ready!</p>
                    <p className="text-lg text-gray-600 mt-2">Start the conversation...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {roomMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`opacity-0 animate-fadeInUp ${
                          msg.sender === playerName ? 'text-right' : ''
                        }`}
                      >
                        <div className={`inline-block max-w-[85%] p-4 rounded-2xl shadow-lg ${
                          msg.sender === playerName
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-black/80 border border-purple-500/30 text-gray-200'
                        }`}>
                          <div className="text-xs font-bold opacity-80 mb-2">
                            <span className="px-2 py-1 bg-black/30 rounded">
                              [{msg.timestamp}] {msg.sender}
                            </span>
                          </div>
                          <div className="text-lg font-medium break-words">{msg.text}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-6">
                <div className="max-w-4xl mx-auto flex gap-4">
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendRoomMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-6 py-4 bg-black/90 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-lg placeholder-gray-600 transition-all duration-300"
                  />
                  <button
                    onClick={handleSendRoomMessage}
                    disabled={!roomInput.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Players List */}
            <div className="w-80 border-l border-purple-500/30 bg-black/40 backdrop-blur-xl p-6">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-purple-400">
                <span>👥</span>
                <span>Players ({roomPlayers.length})</span>
              </h3>

              <div className="space-y-3">
                {roomPlayers.map((player) => (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      player.name === playerName
                        ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/30'
                        : 'bg-black/60 border-purple-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {player.name === playerName ? '👤' : '🙋'}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">
                          {player.name}
                          {player.name === playerName && (
                            <span className="ml-2 text-xs text-purple-400">(You)</span>
                          )}
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="text-xs text-gray-400">
                  <p className="mb-2">💡 <strong>Tip:</strong> Open this in another tab with a different name to test room chat!</p>
                </div>
              </div>
            </div>
          </div>
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

          .animate-fadeInUp {
            animation: fadeInUp 0.4s ease-out forwards;
          }

          /* Custom scrollbar with PURPLE GLOW */
          .custom-scrollbar-purple::-webkit-scrollbar {
            width: 8px;
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

  return null;
}

export default App;