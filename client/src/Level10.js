import React, { useState, useEffect, useRef } from 'react';

function Level10({ socket, isConnected, onBack, onComplete, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const quiz = [
    {
      question: "Why integrate a database with Socket.IO?",
      options: [
        "To make the app slower",
        "To persist messages and load chat history",
        "Databases are required by law",
        "Just for fun"
      ],
      correct: 1
    },
    {
      question: "What happens when a user reconnects?",
      options: [
        "They see an empty chat",
        "They lose all messages",
        "Chat history loads from database",
        "App crashes"
      ],
      correct: 2
    },
    {
      question: "What are 'message seen' receipts?",
      options: [
        "Payment confirmations",
        "Indicators showing message was read (like WhatsApp ✓✓)",
        "Error messages",
        "Spam filters"
      ],
      correct: 1
    },
    {
      question: "Where should you store chat messages?",
      options: [
        "In memory (lost on restart)",
        "In a database (MongoDB, MySQL, PostgreSQL)",
        "In text files",
        "On the client only"
      ],
      correct: 1
    },
    {
      question: "What's the flow for sending a message with DB?",
      options: [
        "Send → Save to DB → Broadcast to others",
        "Broadcast → Never save",
        "Save to DB only, don't send",
        "Send only, don't save"
      ],
      correct: 0
    }
  ];

  useEffect(() => {
    // Listen for chat history
    socket.on('chat:history', (history) => {
      setMessages(history);
      setIsLoadingHistory(false);
    });

    // Listen for new messages
    socket.on('chat:message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for message seen updates
    socket.on('message:seen', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, seen: true, seenAt: data.seenAt } : msg
      ));
    });

    return () => {
      socket.off('chat:history');
      socket.off('chat:message');
      socket.off('message:seen');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinChat = () => {
    if (username.trim()) {
      setIsLoadingHistory(true);
      socket.emit('chat:join', { username: username.trim() });
      setIsJoined(true);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && isJoined) {
      const message = {
        id: Date.now(),
        sender: username,
        text: inputMessage,
        timestamp: new Date().toISOString(),
        seen: false
      };

      socket.emit('chat:send', message);
      setMessages(prev => [...prev, message]);
      setInputMessage('');
      setHasCompletedDemo(true);
    }
  };

  const handleMarkSeen = (messageId) => {
    socket.emit('message:markSeen', { messageId });
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
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowQuiz(false)} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-500">LEVEL 10</h1>
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
                        <h2 className="text-2xl md:text-4xl font-black text-purple-400 mb-2">Quiz Time!</h2>
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
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
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
                    
                    <h2 className="text-2xl md:text-4xl font-black text-purple-400 mb-3 md:mb-4">Quiz Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return 'Perfect! Database Master! 🏆';
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
                  onClick={() => {
                    onComplete(); 
                    setTimeout(() => {
                      onBack();
                    }, 500);
                  }}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
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
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-500">Level 10</h1>
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
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-purple-400 flex items-center gap-2 md:gap-3">
                <span>🌍</span> Real-World Examples
              </h3>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-transparent border-2 border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">💬</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">WhatsApp</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    Message history persists - see old chats when you log back in!
                  </p>
                  <div className="bg-purple-500/10 rounded-lg p-2 text-xs">
                    <code className="text-purple-400">MongoDB</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-transparent border-2 border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">✓✓</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Message Seen</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    Blue checkmarks when message is read - stored in DB!
                  </p>
                  <div className="bg-purple-500/10 rounded-lg p-2 text-xs">
                    <code className="text-purple-400">Receipts DB</code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-transparent border-2 border-purple-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">📂</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Discord</h4>
                  <p className="text-xs md:text-sm text-gray-300 mb-3">
                    Scroll up to see old messages - loaded from database
                  </p>
                  <div className="bg-purple-500/10 rounded-lg p-2 text-xs">
                    <code className="text-purple-400">PostgreSQL</code>
                  </div>
                </div>
              </div>
            </div>

            {/* The Flow */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-purple-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-purple-400 flex items-center gap-2 md:gap-3">
                <span>🔄</span> The Flow
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">1️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-white">User Sends Message</h4>
                    <p className="text-gray-300 mb-3">Client emits message via Socket.IO</p>
                    <div className="bg-black rounded-lg border border-purple-500/30 p-3">
                      <code className="text-purple-400 text-sm">socket.emit('chat:send', message);</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">2️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-yellow-400">Server Saves to Database</h4>
                    <p className="text-gray-300 mb-3">Message persisted in MongoDB/MySQL</p>
                    <div className="bg-black rounded-lg border border-yellow-500/30 p-3">
                      <code className="text-yellow-400 text-sm">await db.messages.insert(message);</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">3️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-green-400">Broadcast to All Users</h4>
                    <p className="text-gray-300 mb-3">Everyone sees the message in real-time</p>
                    <div className="bg-black rounded-lg border border-green-500/30 p-3">
                      <code className="text-green-400 text-sm">io.emit('chat:message', message);</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">4️⃣</div>
                  <div>
                    <h4 className="text-xl font-black mb-2 text-blue-400">User Reconnects → Load History</h4>
                    <p className="text-gray-300 mb-3">Old messages loaded from DB</p>
                    <div className="bg-black rounded-lg border border-blue-500/30 p-3">
                      <code className="text-blue-400 text-sm">const history = await db.messages.find();</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-purple-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
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
                    <code className="text-purple-400">{`// SERVER - Save message to DB
socket.on('chat:send', async (message) => {
  // 1. Save to database
  await db.collection('messages').insertOne({
    sender: message.sender,
    text: message.text,
    timestamp: new Date(),
    seen: false
  });
  
  // 2. Broadcast to everyone
  io.emit('chat:message', message);
});

// Load history on connect
socket.on('chat:join', async (data) => {
  // Fetch last 50 messages from DB
  const history = await db.collection('messages')
    .find()
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();
  
  socket.emit('chat:history', history.reverse());
});

// Mark message as seen
socket.on('message:markSeen', async (data) => {
  await db.collection('messages').updateOne(
    { _id: data.messageId },
    { $set: { seen: true, seenAt: new Date() } }
  );
  
  io.emit('message:seen', data);
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-12 md:mb-16">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-purple-400 flex items-center gap-2 md:gap-3">
                <span>🔑</span> Key Features
              </h3>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">💾</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Persist Messages</h4>
                  <p className="text-sm md:text-base text-gray-300">Messages saved forever - never lost!</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">📜</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Load History</h4>
                  <p className="text-sm md:text-base text-gray-300">See old messages when reconnecting</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">✓✓</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Message Receipts</h4>
                  <p className="text-sm md:text-base text-gray-300">Track when messages are seen</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">🚀</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-purple-300">Real-Time + DB</h4>
                  <p className="text-sm md:text-base text-gray-300">Best of both worlds!</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setPhase('practice')}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-purple-500/50"
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
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="bg-black/90 backdrop-blur-xl border-b border-purple-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setPhase('theory')} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Theory</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">💾</div>
                <h1 className="text-lg md:text-2xl font-black text-purple-400">PERSISTENT CHAT</h1>
              </div>
              
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-green-500/20 border-green-500 text-green-400">
                DB LIVE
              </div>
            </div>
          </div>
        </header>

        {!isJoined ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-black/60 rounded-2xl border-2 border-purple-500/30 p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-3xl font-black text-purple-400 mb-2">Join Chat</h2>
                <p className="text-gray-400">Enter your name to start chatting</p>
              </div>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinChat()}
                placeholder="Your name..."
                className="w-full px-4 py-3 mb-4 bg-black/90 border-2 border-purple-500/30 rounded-xl focus:border-purple-500 focus:outline-none text-white text-center"
              />

              <button
                onClick={handleJoinChat}
                disabled={!username.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all"
              >
                💾 Join & Load History
              </button>

              <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-xs text-gray-300">
                <strong className="text-purple-400">💡 How it works:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Chat history loaded from database</li>
                  <li>• Messages persist forever</li>
                  <li>• ✓✓ receipts when messages seen</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="container mx-auto max-w-4xl">
                {isLoadingHistory ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="text-5xl mb-3 animate-pulse">📂</div>
                    <p className="text-lg font-bold">Loading chat history from database...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="text-5xl mb-3">💬</div>
                    <p className="text-lg font-bold">No messages yet</p>
                    <p className="text-sm text-gray-600 mt-2">Be the first to send a message!</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {messages.map((msg) => {
                      const isMyMessage = msg.sender === username;
                      return (
                        <div key={msg.id} className={isMyMessage ? 'text-right' : ''}>
                          <div className={`inline-block max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl ${
                            isMyMessage
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                              : 'bg-black/80 border border-purple-500/30 text-gray-200'
                          }`}>
                            <div className="text-xs opacity-80 mb-1 flex items-center gap-2">
                              <span>{msg.sender}</span>
                              {isMyMessage && msg.seen && (
                                <span className="text-blue-300" title="Seen">✓✓</span>
                              )}
                              {isMyMessage && !msg.seen && (
                                <span className="text-gray-400" title="Sent">✓</span>
                              )}
                            </div>
                            <div className="text-sm md:text-lg">{msg.text}</div>
                            <div className="text-xs opacity-60 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          {!isMyMessage && !msg.seen && (
                            <button
                              onClick={() => handleMarkSeen(msg.id)}
                              className="text-xs text-purple-400 hover:text-purple-300 mt-1"
                            >
                              Mark as seen ✓
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-4">
              <div className="container mx-auto max-w-4xl">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-3 text-xs text-gray-300">
                  💡 <strong>Tip:</strong> Messages are saved to database! Reload page to see history persist.
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-purple-500/30 rounded-xl md:rounded-2xl focus:border-purple-500 focus:outline-none text-white text-sm md:text-lg placeholder-gray-600"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 text-sm md:text-base shadow-lg shadow-purple-500/50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-purple-500/30 bg-black/60 backdrop-blur-xl p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-3 md:gap-4"
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

export default Level10;