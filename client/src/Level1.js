import React, { useState, useEffect, useRef } from 'react';

function Level1({ socket, isConnected, onBack, onComplete, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  const quiz = [
    {
      question: "What does Socket.IO enable?",
      options: [
        "Only one-way communication from server to client",
        "Real-time, bidirectional communication",
        "Only HTTP requests",
        "File uploads only"
      ],
      correct: 1
    },
    {
      question: "What is the main advantage of WebSockets over HTTP?",
      options: [
        "Faster file downloads",
        "Better security",
        "Persistent connection for instant two-way communication",
        "Uses less bandwidth"
      ],
      correct: 2
    },
    {
      question: "What does socket.emit() do?",
      options: [
        "Closes the connection",
        "Sends a message/event to the server",
        "Downloads a file",
        "Refreshes the page"
      ],
      correct: 1
    },
    {
      question: "What does socket.on() do?",
      options: [
        "Sends a message",
        "Closes the connection",
        "Listens for messages/events from the server",
        "Opens a new tab"
      ],
      correct: 2
    },
    {
      question: "Which of these uses Socket.IO in real life?",
      options: [
        "Static HTML pages",
        "Email attachments",
        "Chat apps, live notifications, multiplayer games",
        "Image galleries"
      ],
      correct: 2
    }
  ];

  useEffect(() => {
    socket.on('chat-message', (data) => {
      addMessage(data.sender, data.text, data.timestamp);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct) correct++;
    });
    return { correct, total: quiz.length };
  };

  const addMessage = (sender, text, timestamp = null) => {
    setMessages(prev => [...prev, {
      sender,
      text,
      timestamp: timestamp || new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    }]);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit('send-message', inputMessage);
      addMessage('You', inputMessage);
      setInputMessage('');
      setHasCompletedDemo(true);
    }
  };

  // QUIZ SCREEN
  if (showQuiz) {
    return (
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowQuiz(false)} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-blue-400">LEVEL 1 QUIZ</h1>
                </div>
                <div className="w-16 md:w-24"></div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
            <div className="max-w-4xl mx-auto">
              {!quizSubmitted ? (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-blue-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 border-b border-blue-500/30 bg-blue-500/5">
                    <div className="flex items-center gap-3 md:gap-6">
                      <div className="text-4xl md:text-6xl">🧠</div>
                      <div>
                        <h2 className="text-2xl md:text-4xl font-black text-blue-400 mb-2">Test Your Knowledge!</h2>
                        <p className="text-sm md:text-lg text-gray-300">Answer all questions about WebSocket Basics</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-10 space-y-4 md:space-y-8">
                    {quiz.map((q, qIndex) => (
                      <div key={qIndex} className="bg-black/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-blue-500/20">
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
                                    ? 'bg-blue-500/30 border-2 border-blue-500 text-white'
                                    : 'bg-black/70 border border-blue-500/20 text-gray-300 hover:border-blue-500/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-blue-500/30'
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

                  <div className="p-4 md:p-10 border-t border-blue-500/30 bg-black/50">
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-blue-500/30 overflow-hidden">
                  <div className="p-6 md:p-10 text-center">
                    <div className="text-5xl md:text-7xl mb-4 md:mb-6">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        return percentage === 100 ? '🏆' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪';
                      })()}
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-blue-400 mb-3 md:mb-4">Quiz Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return 'Perfect! WebSocket Master! 🏆';
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
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-blue-400">LEVEL 1</h1>
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
            <div className="mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-black mb-6 text-blue-400 flex items-center gap-2 md:gap-3">
                <span>🌍</span> Real-World Examples
              </h3>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">💬</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Chat Apps</h4>
                  <p className="text-xs md:text-sm text-gray-300">
                    WhatsApp, Discord, Slack - instant messages with no page refresh
                  </p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-transparent border-2 border-cyan-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-cyan-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">🎮</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-cyan-300">Multiplayer Games</h4>
                  <p className="text-xs md:text-sm text-gray-300">
                    Real-time player movements, actions, and game state updates
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-3xl md:text-4xl mb-3">📊</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Live Dashboards</h4>
                  <p className="text-xs md:text-sm text-gray-300">
                    Stock prices, analytics, notifications updating instantly
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-8 md:mb-12 bg-black/60 border-2 border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-blue-400 flex items-center gap-2 md:gap-3">
                <span>⚡</span> How WebSockets Work
              </h3>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">📤</div>
                    <h4 className="text-xl md:text-2xl font-black text-blue-400">Client → Server</h4>
                  </div>
                  <p className="text-sm md:text-base text-gray-300 mb-4">
                    Send messages using <strong className="text-blue-400">socket.emit()</strong>
                  </p>
                  <div className="bg-black/50 rounded-lg p-4">
                    <code className="text-blue-400 text-xs md:text-sm">
                      socket.emit('message', 'Hello!');<br/>
                      // Sends data to server instantly
                    </code>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">📥</div>
                    <h4 className="text-xl md:text-2xl font-black text-cyan-400">Server → Client</h4>
                  </div>
                  <p className="text-sm md:text-base text-gray-300 mb-4">
                    Listen for messages using <strong className="text-cyan-400">socket.on()</strong>
                  </p>
                  <div className="bg-black/50 rounded-lg p-4">
                    <code className="text-cyan-400 text-xs md:text-sm">
                      socket.on('message', (data) =&gt; {'{'}
                      <br/>&nbsp;&nbsp;console.log(data);
                      <br/>{'}'});
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-8 md:mb-12 bg-black/60 border-2 border-blue-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="p-4 md:p-8 border-b border-blue-500/30 bg-blue-500/5">
                <h3 className="text-2xl md:text-3xl font-black text-blue-400 flex items-center gap-2 md:gap-3">
                  <span>👨‍💻</span> The Code
                </h3>
              </div>
              <div className="p-4 md:p-8">
                <div className="bg-black rounded-xl border border-blue-500/30 overflow-hidden">
                  <div className="px-4 py-2 bg-black/80 border-b border-blue-500/30 flex gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 md:p-6 text-xs md:text-sm overflow-x-auto font-mono">
                    <code className="text-blue-400">{`// CLIENT SIDE
const socket = io('http://localhost:4000');

// Send message to server
socket.emit('send-message', 'Hello Server!');

// Listen for messages from server
socket.on('chat-message', (data) => {
  console.log('Message:', data.text);
});

// SERVER SIDE
io.on('connection', (socket) => {
  socket.on('send-message', (msg) => {
    // Broadcast to all clients
    io.emit('chat-message', { text: msg });
  });
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPhase('practice')}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-blue-500/50"
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
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-cyan-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setPhase('theory')} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">💬</div>
                <h1 className="text-lg md:text-2xl font-black text-blue-400">LIVE CHAT</h1>
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 bg-green-500/20 border-green-500 text-green-400">
                LIVE
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-5xl md:text-7xl mb-3 md:mb-4">💬</div>
                <p className="text-lg md:text-2xl font-bold">Start Chatting!</p>
                <p className="text-sm md:text-base text-gray-600 mt-2">Send a message to test real-time communication</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.sender === 'You' ? 'text-right' : ''}>
                    <div className={`inline-block max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl ${
                      msg.sender === 'You'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-black/80 border border-blue-500/30 text-gray-200'
                    }`}>
                      <div className="text-xs opacity-80 mb-1">[{msg.timestamp}] {msg.sender}</div>
                      <div className="text-sm md:text-lg">{msg.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-blue-500/30 bg-black/60 backdrop-blur-xl p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1">
                  <h4 className="font-bold text-cyan-400 mb-2 text-sm md:text-base">How to Test:</h4>
                  <ul className="text-xs md:text-sm text-gray-300 space-y-1">
                    <li>• Open this page in 2 different browser tabs</li>
                    <li>• Send a message from one tab</li>
                    <li>• Watch it appear instantly in the other tab! ✨</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-black/90 border-2 border-blue-500/30 rounded-xl md:rounded-2xl focus:border-blue-500 focus:outline-none text-white text-sm md:text-lg placeholder-gray-600"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/50 text-sm md:text-base"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-blue-500/30 bg-black/60 backdrop-blur-xl p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-500 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 md:gap-4"
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

export default Level1;