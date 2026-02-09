import React, { useState, useEffect, useRef } from 'react';

function Level6({ socket, isConnected, onBack, isTransitioning }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [errorLog, setErrorLog] = useState([]);
  const [forcedDisconnect, setForcedDisconnect] = useState(false);
  const [connectionEvents, setConnectionEvents] = useState([]);

  const steps = [
    {
      id: 0,
      title: "Understanding Errors",
      icon: "⚠️",
      description: "Learn about connection failures and how to handle them",
      example: "Like losing WiFi - your phone shows 'No Internet' and tries to reconnect",
      task: "Read the concept and click 'Got it!'",
      canComplete: () => true,
      showDemo: false
    },
    {
      id: 1,
      title: "Detect Disconnections",
      icon: "🔌",
      description: "Listen for disconnect events and notify users",
      example: "WhatsApp shows 'Connecting...' when internet is lost",
      task: "Force disconnect and see the error message",
      canComplete: () => errorLog.length > 0,
      showDemo: true
    },
    {
      id: 2,
      title: "Auto-Reconnection",
      icon: "🔄",
      description: "Automatically reconnect when connection is restored",
      example: "Your phone auto-reconnects to WiFi after signal returns",
      task: "Disconnect, wait, then reconnect successfully",
      canComplete: () => connectionEvents.filter(e => e.type === 'reconnect').length > 0,
      showDemo: true
    }
  ];

  const quiz = [
    {
      question: "What event fires when Socket.IO loses connection?",
      options: [
        "socket.on('error')",
        "socket.on('disconnect')",
        "socket.on('offline')",
        "socket.on('lost')"
      ],
      correct: 1
    },
    {
      question: "What should you do when a user disconnects?",
      options: [
        "Crash the app",
        "Do nothing",
        "Show 'Reconnecting...' message",
        "Delete all their data"
      ],
      correct: 2
    },
    {
      question: "What event fires when reconnection succeeds?",
      options: [
        "socket.on('reconnect')",
        "socket.on('online')",
        "socket.on('back')",
        "socket.on('restored')"
      ],
      correct: 0
    },
    {
      question: "Why is error handling important?",
      options: [
        "It makes code look professional",
        "It prevents user confusion when network fails",
        "It's required by law",
        "It makes apps slower"
      ],
      correct: 1
    },
    {
      question: "What's the best user experience during reconnection?",
      options: [
        "Show nothing, let them wonder",
        "Show 'Error!' and close app",
        "Show 'Reconnecting...' with loading indicator",
        "Redirect to homepage"
      ],
      correct: 2
    }
  ];

  useEffect(() => {
    // Listen for disconnect
    socket.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      addErrorLog('Disconnected: ' + reason);
      addConnectionEvent('disconnect', reason);
    });

    // Listen for reconnect attempt
    socket.io.on('reconnect_attempt', (attemptNumber) => {
      setReconnectAttempts(attemptNumber);
      setConnectionStatus('reconnecting');
      addConnectionEvent('reconnect_attempt', `Attempt ${attemptNumber}`);
    });

    // Listen for reconnect success
    socket.io.on('reconnect', (attemptNumber) => {
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      addErrorLog('Reconnected successfully!');
      addConnectionEvent('reconnect', `After ${attemptNumber} attempts`);
    });

    // Listen for reconnect error
    socket.io.on('reconnect_error', (error) => {
      addErrorLog('Reconnect failed: ' + error.message);
      addConnectionEvent('reconnect_error', error.message);
    });

    // Listen for connect error
    socket.on('connect_error', (error) => {
      addErrorLog('Connection error: ' + error.message);
      addConnectionEvent('connect_error', error.message);
    });

    return () => {
      socket.off('disconnect');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect');
      socket.io.off('reconnect_error');
      socket.off('connect_error');
    };
  }, [socket]);

  const addErrorLog = (message) => {
    setErrorLog(prev => [...prev, {
      message,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    }]);
  };

  const addConnectionEvent = (type, details) => {
    setConnectionEvents(prev => [...prev, {
      type,
      details,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    }]);
  };

  const handleForceDisconnect = () => {
    socket.disconnect();
    setForcedDisconnect(true);
    addErrorLog('Manually disconnected');
  };

  const handleForceReconnect = () => {
    socket.connect();
    setForcedDisconnect(false);
    addErrorLog('Manually reconnected');
  };

  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
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
                        <h2 className="text-2xl md:text-4xl font-black text-purple-400 mb-2">Error Handling Quiz!</h2>
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
                        if (percentage === 100) return 'Perfect! Error Handling Master! 🏆';
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
                            isCorrect ? 'bg-green-500/10 border-green-500/50' : 'bg-purple-500/10 border-purple-500/50'
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
                      onClick={onBack}
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

  // MAIN SCREEN
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full blur-[120px]"></div>
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
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-purple-500">LEVEL 6</h1>
              </div>
              
              <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold border-2 ${
                connectionStatus === 'connected' ? 'bg-green-500/20 border-green-500 text-green-400' :
                connectionStatus === 'reconnecting' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                'bg-purple-500/20 border-purple-500 text-purple-400'
              }`}>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                    connectionStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse' :
                    'bg-purple-500'
                  }`}></div>
                  <span className="hidden sm:inline">
                    {connectionStatus === 'connected' ? 'CONNECTED' :
                     connectionStatus === 'reconnecting' ? `RECONNECTING (${reconnectAttempts})` :
                     'DISCONNECTED'}
                  </span>
                  <span className="sm:hidden">
                    {connectionStatus === 'connected' ? 'ON' :
                     connectionStatus === 'reconnecting' ? `..${reconnectAttempts}` :
                     'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress */}
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

        {/* Content */}
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

              {/* Demo */}
              {currentStepData.showDemo && (
                <div className="p-4 md:p-10 border-b border-purple-500/20">
                  <h3 className="text-lg md:text-2xl font-black mb-3 md:mb-6 flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-3xl">🧪</span>
                    <span>Live Demo</span>
                  </h3>

                  {/* Control Buttons */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={handleForceDisconnect}
                      disabled={!isConnected || forcedDisconnect}
                      className="flex-1 px-4 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white border-2 border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <div className="text-2xl mb-1">🔌</div>
                      <div className="text-xs md:text-sm">Force Disconnect</div>
                    </button>
                    <button
                      onClick={handleForceReconnect}
                      disabled={isConnected && !forcedDisconnect}
                      className="flex-1 px-4 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <div className="text-2xl mb-1">🔄</div>
                      <div className="text-xs md:text-sm">Force Reconnect</div>
                    </button>
                  </div>
                  
                  {/* Error Log */}
                  <div className="bg-black rounded-xl border border-purple-500/30 overflow-hidden mb-4">
                    <div className="px-4 py-3 bg-black/90 border-b border-purple-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">Error Console</span>
                      </div>
                      <span className="px-2 py-1 border border-purple-500/50 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400">
                        {errorLog.length} events
                      </span>
                    </div>
                    <div className="p-4 md:p-6 h-48 md:h-64 overflow-y-auto font-mono text-xs md:text-sm">
                      {errorLog.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                          <div className="text-4xl md:text-6xl mb-3">📋</div>
                          <p className="text-base md:text-lg font-bold">No errors yet</p>
                          <p className="text-xs md:text-sm text-gray-600 mt-2">Try disconnecting!</p>
                        </div>
                      ) : (
                        <>
                          {errorLog.map((log) => (
                            <div key={log.id} className="mb-2 p-2 bg-purple-500/10 border-l-4 border-purple-500 rounded">
                              <div className="text-purple-400">
                                [{log.timestamp}] {log.message}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Connection Events */}
                  <div className="bg-black rounded-xl border border-purple-500/30 overflow-hidden">
                    <div className="px-4 py-3 bg-black/90 border-b border-purple-500/30">
                      <span className="text-xs text-gray-400 font-mono">Connection Events</span>
                    </div>
                    <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                      {connectionEvents.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No events yet
                        </div>
                      ) : (
                        connectionEvents.slice(-5).reverse().map((event) => (
                          <div key={event.id} className={`p-2 rounded border-l-4 text-xs ${
                            event.type === 'disconnect' ? 'bg-purple-500/10 border-purple-500' :
                            event.type === 'reconnect' ? 'bg-green-500/10 border-green-500' :
                            event.type === 'reconnect_attempt' ? 'bg-yellow-500/10 border-yellow-500' :
                            'bg-orange-500/10 border-orange-500'
                          }`}>
                            <div className="font-bold">
                              {event.type === 'disconnect' ? '❌ Disconnected' :
                               event.type === 'reconnect' ? '✅ Reconnected' :
                               event.type === 'reconnect_attempt' ? '🔄 Reconnecting' :
                               '⚠️ Error'}
                            </div>
                            <div className="text-gray-400">{event.details}</div>
                            <div className="text-gray-600">{event.timestamp}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 md:p-4">
                    <div className="flex gap-2 md:gap-3">
                      <div className="text-xl md:text-2xl">💡</div>
                      <div className="text-xs md:text-sm text-gray-300">
                        <strong className="text-purple-300">Tip:</strong> Watch the status badge change! Disconnect → Reconnecting (1, 2, 3...) → Connected
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

export default Level6;