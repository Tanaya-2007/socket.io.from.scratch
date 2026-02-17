import React, { useState, useEffect, useRef } from 'react';

function Level1({ socket, isConnected, onBack, onComplete, isTransitioning }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [messagesSent, setMessagesSent] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const messagesEndRef = useRef(null);

  const steps = [
    {
      id: 0,
      title: "Connection",
      icon: "🔌",
      description: "Client and server establish a persistent WebSocket connection",
      example: "Like calling someone - both phones connect and stay connected the whole time",
      serverCode: `io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});`,
      clientCode: `socket.on('connect', () => {
  console.log('Connected!', socket.id);
});`,
      task: "Check the green 'ONLINE' badge above",
      hint: "Open console (F12) to see your socket.id",
      canComplete: () => isConnected,
      showDemo: false
    },
    {
      id: 1,
      title: "Emit Events",
      icon: "📤",
      description: "Send custom events from client to server",
      example: "Like sending a WhatsApp message - you type and hit send, server receives instantly",
      serverCode: `socket.on('message', (data) => {
  console.log('Received:', data);
});`,
      clientCode: `socket.emit('message', 'Hello!');
// First param = event name
// Second param = data`,
      task: "Send 3 messages in the terminal below",
      hint: "Type and press Send button",
      canComplete: () => messagesSent >= 3,
      showDemo: true
    },
    {
      id: 2,
      title: "Response",
      icon: "📥",
      description: "Server sends messages back to client",
      example: "Like getting a 'Message Delivered ✓✓' confirmation in WhatsApp",
      serverCode: `socket.emit('response', {
  text: 'Got it!',
  timestamp: Date.now()
});`,
      clientCode: `socket.on('response', (data) => {
  console.log('Server says:', data.text);
});`,
      task: "Send a message and see instant server response",
      hint: "Watch how fast the server replies!",
      canComplete: () => messages.some(m => m.sender === 'Server'),
      showDemo: true
    }
  ];

  const quiz = [
    {
      question: "What is the correct way to emit an event from client to server?",
      options: ["socket.send()", "socket.emit()", "io.emit()", "socket.on()"],
      correct: 1
    },
    {
      question: "How does the server listen for events?",
      options: ["socket.listen()", "socket.on()", "socket.receive()", "io.on()"],
      correct: 1
    },
    {
      question: "What makes Socket.IO faster than HTTP?",
      options: [
        "It uses AJAX",
        "It keeps the connection open (WebSocket)",
        "It compresses data",
        "It uses faster servers"
      ],
      correct: 1
    },
    {
      question: "How to send data back to ONE specific client?",
      options: ["io.emit()", "socket.emit()", "socket.broadcast.emit()", "socket.send()"],
      correct: 1
    },
    {
      question: "Difference: socket.emit() vs io.emit()?",
      options: [
        "Both send to all clients",
        "socket.emit = one client, io.emit = all clients",
        "Both send to one client",
        "socket.emit = all, io.emit = one"
      ],
      correct: 1
    }
  ];

  useEffect(() => {
    socket.on('response', (data) => {
      addMessage('Server', data.text, data.timestamp);
    });

    return () => {
      socket.off('response');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text, timestamp = null) => {
    setMessages(prev => [...prev, { 
      sender, 
      text, 
      timestamp: timestamp || new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    }]);
  };

  const handleSend = () => {
    if (inputMessage.trim()) {
      socket.emit('message', inputMessage);
      addMessage('You', inputMessage);
      setInputMessage('');
      setMessagesSent(prev => prev + 1);
    }
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
      setShowQuiz(true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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
      <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          {/* Navbar */}
          <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                  <span>←</span> <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-2xl md:text-3xl">⚡</div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-blue-500">Level 1 Quiz</h1>
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
                        <h2 className="text-2xl md:text-4xl font-black text-blue-400 mb-2">Quiz Time!</h2>
                        <p className="text-sm md:text-lg text-gray-300">Test your knowledge</p>
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
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl md:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
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
                    
                    <h2 className="text-2xl md:text-4xl font-black text-blue-400 mb-3 md:mb-4">Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return 'Perfect! Socket.IO Master! 🏆';
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
                  onClick={() => {
                    onComplete(); 
                    setTimeout(() => {
                      onBack();
                    }, 500);
                  }}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
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

  // MAIN LEVEL 1 SCREEN
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30 sticky top-0 z-40">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              
              <button
                onClick={onBack}
                className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base"
              >
                <span>←</span> <span className="hidden sm:inline">Back</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">⚡</div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-blue-500">
                  LEVEL 1
                </h1>
              </div>
              
              <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                isConnected 
                  ? 'bg-green-500/20 border-green-500 text-green-400' 
                  : 'bg-red-500/20 border-red-500 text-red-400'
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

        {/* Progress */}
        <div className="bg-black/60 backdrop-blur-xl border-b border-blue-500/20">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-xs md:text-sm font-bold text-gray-400">PROGRESS</span>
              <div className="text-lg md:text-2xl font-black text-blue-400">
                {Math.round((completedSteps.length / steps.length) * 100)}%
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1">
                  <div className={`h-2 md:h-3 rounded-full transition-all duration-500 ${
                    completedSteps.includes(index) ? 'bg-green-500' :
                    index === currentStep ? 'bg-blue-500' : 'bg-white/10'
                  }`} />
                  <div className="text-center mt-1.5 md:mt-2 text-sm md:text-base">
                    {completedSteps.includes(index) ? '✓' : step.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-12">
          <div className="max-w-5xl mx-auto">
            
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-blue-500/30 overflow-hidden">
              
              <div className="p-4 md:p-10 border-b border-blue-500/30 bg-blue-500/5">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm mb-3 md:mb-5">
                  <span className="px-2 md:px-4 py-1 md:py-2 bg-blue-500/20 rounded-full font-bold border border-blue-500/50 text-blue-400">
                    STEP {currentStep + 1}/{steps.length}
                  </span>
                  {isStepCompleted && (
                    <span className="px-2 md:px-4 py-1 md:py-2 bg-green-500/20 border border-green-500 text-green-400 rounded-full font-bold">✓</span>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-6 mb-4 md:mb-6">
                  <div className="text-4xl md:text-7xl">{currentStepData.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-5xl font-black mb-2 md:mb-3 text-blue-400">
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
                
                <button
                  onClick={() => setShowCodeModal(true)}
                  className="px-4 md:px-8 py-2 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg md:rounded-2xl transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base"
                >
                  <span className="text-base md:text-2xl">👨‍💻</span>
                  <span>View Code</span>
                </button>
              </div>

              {currentStepData.showDemo && (
                <div className="p-4 md:p-10 border-b border-blue-500/20">
                  <h3 className="text-lg md:text-2xl font-black mb-3 md:mb-6 flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-3xl">💻</span>
                    <span>Live Demo</span>
                  </h3>
                  
                  <div className="bg-black rounded-xl md:rounded-2xl border border-blue-500/30 overflow-hidden mb-3 md:mb-6">
                    <div className="px-3 md:px-6 py-2 md:py-4 bg-black/90 border-b border-blue-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex gap-1 md:gap-2">
                          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-xs md:text-sm text-gray-400 font-mono hidden sm:inline">terminal</span>
                      </div>
                      <span className="px-2 md:px-3 py-0.5 md:py-1 border border-blue-500/50 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">LIVE</span>
                    </div>

                    <div className="p-3 md:p-6 h-48 md:h-80 overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                          <div className="text-3xl md:text-6xl mb-2 md:mb-4">💬</div>
                          <p className="text-sm md:text-lg font-semibold">Ready</p>
                        </div>
                      ) : (
                        <>
                          {messages.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`mb-2 md:mb-4 ${msg.sender === 'You' ? 'text-right' : ''}`}
                            >
                              <div className={`inline-block max-w-[90%] p-2 md:p-4 rounded-lg md:rounded-2xl ${
                                msg.sender === 'You' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-black border border-blue-500/30 text-gray-200'
                              }`}>
                                <div className="text-xs opacity-80 mb-1">[{msg.timestamp}] {msg.sender}</div>
                                <div className="text-xs md:text-base">{msg.text}</div>
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
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      disabled={!isConnected}
                      placeholder="Type message..."
                      className="flex-1 px-3 md:px-6 py-2 md:py-4 bg-black/90 border border-blue-500/30 rounded-lg md:rounded-2xl focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 text-sm md:text-lg"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!isConnected || !inputMessage.trim()}
                      className="px-4 md:px-10 py-2 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg md:rounded-2xl disabled:opacity-50 transition-all text-sm md:text-lg"
                    >
                      Send
                    </button>
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
                    <div className="px-2 md:px-4 py-2 md:py-3 bg-blue-500/10 border-l-4 border-blue-500 rounded text-xs md:text-sm text-blue-300">
                      💡 {currentStepData.hint}
                    </div>
                    
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
                  className="w-full sm:w-auto px-4 md:px-8 py-2 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg md:rounded-2xl disabled:opacity-30 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg order-3"
                >
                  {currentStep === steps.length - 1 ? 'Quiz' : 'Next'} <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-3 md:p-6"
          onClick={() => setShowCodeModal(false)}
        >
          <div 
            className="bg-black/95 rounded-2xl md:rounded-3xl border border-blue-500/30 max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-8 border-b border-blue-500/30 flex items-center justify-between sticky top-0 bg-black/95 z-10">
              <h3 className="text-lg md:text-3xl font-black text-blue-400">Code</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-gray-400 hover:text-white text-2xl md:text-3xl w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-red-500/20"
              >
                ×
              </button>
            </div>

            <div className="p-4 md:p-8 space-y-4 md:space-y-8">
              <div>
                <h4 className="text-base md:text-xl font-black mb-2 md:mb-4 text-blue-400 flex items-center gap-2">
                  <span className="text-lg md:text-2xl">🖥️</span> Server Code
                </h4>
                <div className="bg-black rounded-xl border border-blue-500/30 overflow-hidden">
                  <div className="px-4 py-2 bg-black/80 border-b border-blue-500/30 flex gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-3 md:p-6 text-xs md:text-sm overflow-x-auto">
                    <code className="text-blue-400">{currentStepData.serverCode}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-base md:text-xl font-black mb-2 md:mb-4 text-blue-400 flex items-center gap-2">
                  <span className="text-lg md:text-2xl">💻</span> Client Code
                </h4>
                <div className="bg-black rounded-xl border border-blue-500/30 overflow-hidden">
                  <div className="px-4 py-2 bg-black/80 border-b border-blue-500/30 flex gap-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-3 md:p-6 text-xs md:text-sm overflow-x-auto">
                    <code className="text-blue-400">{currentStepData.clientCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Level1;