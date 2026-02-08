import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function Level4({ isConnected, onBack, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [showJoinScreen, setShowJoinScreen] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState(null);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  const namespaces = [
    {
      id: 'chat',
      name: 'Chat',
      icon: '💬',
      color: 'purple',
      description: 'General discussion',
      path: '/chat'
    },
    {
      id: 'game',
      name: 'Game',
      icon: '🎮',
      color: 'pink',
      description: 'Gaming lobby',
      path: '/game'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: '👑',
      color: 'violet',
      description: 'Admin only',
      path: '/admin'
    }
  ];

  useEffect(() => {
    if (selectedNamespace && username) {
      const ns = namespaces.find(n => n.id === selectedNamespace);
      socketRef.current = io(`http://localhost:4000${ns.path}`);

      socketRef.current.emit('join-namespace', { username });

      socketRef.current.on('user-joined', (data) => {
        setOnlineUsers(data.users);
        addSystemMessage(`${data.username} joined the ${ns.name} namespace`);
      });

      socketRef.current.on('user-left', (data) => {
        setOnlineUsers(data.users);
        addSystemMessage(`A user left the ${ns.name} namespace`);
      });

      socketRef.current.on('namespace-message', (data) => {
        addMessage(data.sender, data.text, data.timestamp);
      });

      socketRef.current.on('initial-state', (data) => {
        setOnlineUsers(data.users);
        setMessages(data.messages || []);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [selectedNamespace, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quiz = [
    {
      question: "What is a Socket.IO namespace?",
      options: [
        "A room for private chat",
        "A separate endpoint/channel on same server",
        "A different server",
        "A user ID"
      ],
      correct: 1
    },
    {
      question: "How to create a namespace on server?",
      options: [
        "socket.namespace('/chat')",
        "io.namespace('/chat')",
        "io.of('/chat')",
        "socket.of('/chat')"
      ],
      correct: 2
    },
    {
      question: "How to connect to namespace on client?",
      options: [
        "io('http://localhost:4000/chat')",
        "socket.join('/chat')",
        "io.namespace('/chat')",
        "socket.connect('/chat')"
      ],
      correct: 0
    },
    {
      question: "Can one client connect to multiple namespaces?",
      options: [
        "No, only one",
        "Yes, unlimited",
        "Only 2 max",
        "Depends on server"
      ],
      correct: 1
    },
    {
      question: "What's the main benefit of namespaces?",
      options: [
        "Faster connection",
        "Complete isolation of features",
        "Better security",
        "Lower memory"
      ],
      correct: 1
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

  const addMessage = (sender, text, timestamp = null) => {
    setMessages(prev => [...prev, {
      sender,
      text,
      timestamp: timestamp || new Date().toLocaleTimeString(),
      id: Date.now() + Math.random(),
      type: 'message'
    }]);
  };

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      text,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random(),
      type: 'system'
    }]);
  };

  const handleJoinNamespace = (nsId) => {
    if (username.trim()) {
      setSelectedNamespace(nsId);
      setPhase('practice');
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && socketRef.current) {
      socketRef.current.emit('send-message', { text: inputMessage });
      addMessage('You', inputMessage);
      setInputMessage('');
      setHasCompletedDemo(true);
    }
  };

  const handleLeaveNamespace = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setSelectedNamespace(null);
    setMessages([]);
    setOnlineUsers([]);
    setUsername('');
    setShowJoinScreen(false);
    setPhase('theory');
  };

  const handleBackToTheory = () => {
    setShowJoinScreen(false);
    setPhase('theory');
  };

  const getNamespaceColor = (nsId) => {
    const ns = namespaces.find(n => n.id === nsId);
    const colors = {
      purple: {
        border: 'border-purple-500/30',
        hover: 'hover:border-purple-400',
        bg: 'bg-purple-500/5',
        text: 'text-purple-400',
        gradient: 'from-purple-500/10',
        shadow: 'shadow-purple-500/50'
      },
      pink: {
        border: 'border-pink-500/30',
        hover: 'hover:border-pink-400',
        bg: 'bg-pink-500/5',
        text: 'text-pink-400',
        gradient: 'from-pink-500/10',
        shadow: 'shadow-pink-500/50'
      },
      violet: {
        border: 'border-violet-500/30',
        hover: 'hover:border-violet-400',
        bg: 'bg-violet-500/5',
        text: 'text-violet-400',
        gradient: 'from-violet-500/10',
        shadow: 'shadow-violet-500/50'
      }
    };
    return colors[ns?.color] || colors.purple;
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
                <h1 className="text-2xl sm:text-3xl font-black text-purple-500">LEVEL 4 QUIZ</h1>
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

  // Theory Screen
 
  if (phase === 'theory') {
    return (
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-pink-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          {/* Navbar */}
          <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-400">LEVEL 4</h1>
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
            
            {/* Visual Concept */}
            <div className="mb-8 md:mb-12 bg-black/60 border-2 border-purple-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-purple-400 flex items-center gap-2 md:gap-3">
                <span>💡</span> The Concept
              </h3>

              <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6 md:p-8 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl md:text-4xl font-black text-white mb-4">One Server, Multiple Apps</div>
                  <p className="text-gray-400 text-sm md:text-base">Think of it like floors in a building - each floor is independent!</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 rounded-xl p-4 text-center hover:border-purple-400 hover:scale-105 transition-all duration-300">
                    <div className="text-3xl mb-2">💬</div>
                    <div className="font-bold text-purple-400 mb-1">/chat</div>
                    <div className="text-xs text-gray-400">Chat users only</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 rounded-xl p-4 text-center hover:border-purple-400 hover:scale-105 transition-all duration-300">
                    <div className="text-3xl mb-2">🎮</div>
                    <div className="font-bold text-purple-400 mb-1">/game</div>
                    <div className="text-xs text-gray-400">Gamers only</div>
                  </div>

                  <div className="bg-gradient-to-br from-violet-500/20 to-transparent border border-violet-500/30 rounded-xl p-4 text-center hover:border-violet-400 hover:scale-105 transition-all duration-300">
                    <div className="text-3xl mb-2">👑</div>
                    <div className="font-bold text-violet-400 mb-1">/admin</div>
                    <div className="text-xs text-gray-400">Admins only</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">❌</span>
                    <h4 className="font-bold text-red-400">Without Namespaces</h4>
                  </div>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>• All events mixed together</p>
                    <p>• Hard to organize large apps</p>
                    <p>• No separation of concerns</p>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">✅</span>
                    <h4 className="font-bold text-green-400">With Namespaces</h4>
                  </div>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>• Clean separation of features</p>
                    <p>• Easy to scale</p>
                    <p>• Complete isolation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-World Examples */}
            <div className="mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-purple-400 flex items-center gap-2 md:gap-3">
                <span>🎯</span> Real-World Examples
              </h3>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-transparent border-2 border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">💼</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Slack</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    Each workspace is a namespace → Complete isolation
                  </p>
                  <div className="bg-purple-500/10 rounded-lg p-2 text-xs">
                    <code className="text-purple-400">/workspace-abc</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-transparent border-2 border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🎮</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Gaming Platform</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    Lobby, games, spectate → Separate namespaces
                  </p>
                  <div className="bg-pink-500/10 rounded-lg p-2 text-xs">
                    <code className="text-purple-400">/lobby, /game-1</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-500/20 to-transparent border-2 border-violet-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-violet-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🏢</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-violet-300">SaaS App</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    Each customer gets their own namespace
                  </p>
                  <div className="bg-violet-500/10 rounded-lg p-2 text-xs">
                    <code className="text-violet-400">/tenant-123</code>
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
              
              <div className="p-4 md:p-8 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-purple-400 mb-3">Server:</h4>
                  <div className="bg-black rounded-xl border border-purple-500/30 overflow-hidden">
                    <div className="px-4 py-2 bg-black/80 border-b border-purple-500/30 flex gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-4 text-xs md:text-sm overflow-x-auto">
                      <code className="text-purple-400">{`// Chat namespace
const chat = io.of('/chat');
chat.on('connection', socket => {
  // Only chat users
});

// Game namespace
const game = io.of('/game');
game.on('connection', socket => {
  // Only gamers
});`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-purple-400 mb-3">Client:</h4>
                  <div className="bg-black rounded-xl border border-purple-500/30 overflow-hidden">
                    <div className="px-4 py-2 bg-black/80 border-b border-purple-500/30 flex gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-4 text-xs md:text-sm overflow-x-auto">
                      <code className="text-purple-400">{`// Connect to chat
const chatSocket = 
  io('localhost:4000/chat');

// Connect to game
const gameSocket = 
  io('localhost:4000/game');`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="text-center">
              <button
                onClick={() => {
                  setShowJoinScreen(true);
                  setPhase('join');
                }}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 hover:from-purple-500 hover:via-pink-500 hover:to-violet-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-purple-500/50"
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

 
  // Join Screen
 
  if (phase === 'join' && showJoinScreen && !selectedNamespace) {
    return (
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-pink-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
          <div className="max-w-3xl w-full">
            <button
              onClick={handleBackToTheory}
              className="mb-4 md:mb-6 px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base"
            >
              <span>←</span> Back to Theory
            </button>

            <div className="bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="p-6 md:p-10 border-b border-purple-500/30 bg-purple-500/5 text-center">
                <div className="text-5xl md:text-7xl mb-4 md:mb-6">🚀</div>
                <h2 className="text-3xl md:text-5xl font-black mb-2 md:mb-3 text-purple-400">Join a Namespace</h2>
                <p className="text-sm md:text-xl text-gray-300">Choose your namespace and start chatting</p>
              </div>

              <div className="p-6 md:p-10">
                <div className="mb-6">
                  <label className="block text-xs md:text-sm font-bold text-purple-300 mb-3">YOUR NAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={20}
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl md:rounded-2xl focus:border-purple-500 focus:outline-none text-white text-base md:text-xl placeholder-gray-600"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs md:text-sm font-bold text-purple-300 mb-3">SELECT NAMESPACE</label>
                  <div className="grid gap-3">
                    {namespaces.map(ns => (
                      <button
                        key={ns.id}
                        onClick={() => handleJoinNamespace(ns.id)}
                        disabled={!username.trim()}
                        className={`p-4 rounded-xl border-2 ${getNamespaceColor(ns.id).border} ${getNamespaceColor(ns.id).hover} bg-black/60 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{ns.icon}</div>
                          <div className="flex-1">
                            <div className={`text-lg md:text-xl font-black ${getNamespaceColor(ns.id).text}`}>{ns.name}</div>
                            <div className="text-xs md:text-sm text-gray-400">{ns.description}</div>
                          </div>
                          <div className="text-gray-600">→</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="text-2xl">💡</div>
                    <div className="text-xs md:text-sm text-gray-300">
                      <strong className="text-purple-300">Tip:</strong> Open in multiple tabs, join different namespaces, and see how they're completely isolated!
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

 
  // Practice Screen 
  
  const currentNs = namespaces.find(n => n.id === selectedNamespace);
  const colors = currentNs ? getNamespaceColor(selectedNamespace) : { text: 'text-purple-400', border: 'border-purple-500/30' };

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-pink-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Navbar */}
        <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button onClick={handleLeaveNamespace} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Leave</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">{currentNs?.icon}</div>
                <div>
                  <h1 className={`text-lg md:text-2xl font-black ${colors.text}`}>{currentNs?.name.toUpperCase()}</h1>
                  <p className="text-xs text-gray-400">{onlineUsers.length} online</p>
                </div>
              </div>
              
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-green-500/20 border-green-500 text-green-400">
                LIVE
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-5xl md:text-7xl mb-3 md:mb-4">{currentNs?.icon}</div>
                <p className="text-lg md:text-2xl font-bold">Namespace Ready!</p>
                <p className="text-sm md:text-base text-gray-600 mt-2">Start chatting in {currentNs?.name}</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.type === 'system' ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                        <div className="text-xs text-yellow-400 mb-1">[{msg.timestamp}]</div>
                        <div className="text-sm text-yellow-300">{msg.text}</div>
                      </div>
                    ) : (
                      <div className={`${msg.sender === 'You' ? 'text-right' : ''}`}>
                        <div className={`inline-block max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl ${
                          msg.sender === 'You'
                            ? `bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg ${colors.shadow}`
                            : `bg-black/80 border ${colors.border} text-gray-200`
                        }`}>
                          <div className="text-xs opacity-80 mb-1">[{msg.timestamp}] {msg.sender}</div>
                          <div className="text-sm md:text-lg">{msg.text}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-4">
          <div className="container mx-auto max-w-4xl flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message in ${currentNs?.name}...`}
              className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl md:rounded-2xl focus:border-purple-500 focus:outline-none text-white text-sm md:text-lg placeholder-gray-600"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/50 text-sm md:text-base"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      {/* Take Test Button */}
      {hasCompletedDemo && !showQuiz && (
        <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-4">
          <div className="container mx-auto max-w-4xl text-center">
            <button
              onClick={() => setShowQuiz(true)}
              className="px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 hover:from-purple-500 hover:via-pink-500 hover:to-violet-500 text-white text-2xl font-black rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-4 mx-auto"
            >
              <span>🧠</span>
              <span>Take the Test</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Level4;