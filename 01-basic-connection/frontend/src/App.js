import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [messagesSent, setMessagesSent] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
      task: "Send at least 3 messages using the terminal below",
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

  // DARK NEON Color Scheme - Purple/Pink Gaming Theme
  const PRIMARY_COLOR = '#a855f7'; // Purple
  const ACCENT_COLOR = '#ec4899'; // Pink
  const SUCCESS_COLOR = '#10b981'; // Green
  const WARNING_COLOR = '#f59e0b'; // Orange

  // Mouse tracking for glow effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      addSystemMessage('Connected to Socket.IO Server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addSystemMessage('Disconnected from Server');
    });

    socket.on('response', (data) => {
      addMessage('Server', data.text, data.timestamp);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('response');
    };
    // eslint-disable-next-line
  }, []);

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
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const canCompleteCurrentStep = currentStepData.canComplete();
  const isStepCompleted = completedSteps.includes(currentStep);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      
      {/* Animated Neon Glow Background */}
      <div className="fixed inset-0 z-0">
        {/* Purple Glow */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, #a855f7, transparent)',
            top: '10%',
            left: '20%',
          }}
        />
        {/* Pink Glow */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, #ec4899, transparent)',
            bottom: '10%',
            right: '20%',
            animationDelay: '1s'
          }}
        />
        {/* Mouse Follow Glow */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-300"
          style={{
            background: 'radial-gradient(circle, #a855f7, #ec4899, transparent)',
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-xl border-b-2 border-purple-500/30 sticky top-0 z-40 shadow-lg shadow-purple-500/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl animate-pulse-slow">⚡</div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                    <span className="text-white">SOCKET</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">/</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">MATRIX</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">Interactive Socket.IO Tutorial 🎮</p>
                </div>
              </div>
              
              <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all duration-300 ${
                isConnected 
                  ? 'bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/50' 
                  : 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/50'
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
        <div className="bg-black/60 backdrop-blur-xl border-b-2 border-purple-500/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-semibold text-gray-400 tracking-wide">PROGRESS</span>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
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
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                          : 'bg-white/10'
                      }`}
                    />
                    <div className="text-xs sm:text-sm text-center mt-2 sm:mt-3 font-bold">
                      {completedSteps.includes(index) ? (
                        <span className="text-green-400">✓</span>
                      ) : index === currentStep ? (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">{step.icon}</span>
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
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 border-purple-500/40 overflow-hidden shadow-2xl shadow-purple-500/20">
              
              {/* Step Header */}
              <div 
                className="p-6 sm:p-8 lg:p-10 border-b-2 border-purple-500/30 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                }}
              >
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 mb-4 sm:mb-5">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/20 rounded-full font-bold border-2 border-purple-500/50 text-purple-400 shadow-lg shadow-purple-500/30">
                      STEP {currentStep + 1} OF {steps.length}
                    </span>
                    {isStepCompleted && (
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 border-2 border-green-500 text-green-400 rounded-full text-xs font-bold shadow-lg shadow-green-500/30">
                        COMPLETED ✓
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="text-5xl sm:text-6xl lg:text-7xl">{currentStepData.icon}</div>
                    <div className="flex-1">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {currentStepData.title}
                      </h2>
                      <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed font-medium">
                        {currentStepData.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowCodeModal(true)}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <span className="text-lg sm:text-2xl">👨‍💻</span>
                    <span>View Code</span>
                  </button>
                </div>
              </div>

              {/* Interactive Demo */}
              {currentStepData.showDemo && (
                <div className="p-6 sm:p-8 lg:p-10 border-b-2 border-purple-500/20 bg-gradient-to-br from-black/50 to-purple-900/10">
                  <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-100">
                    <span className="text-2xl sm:text-3xl">💻</span>
                    <span>Live Demo</span>
                  </h3>
                  
                  {/* Terminal */}
                  <div className="bg-black/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-purple-500/50 overflow-hidden mb-4 sm:mb-6 shadow-2xl shadow-purple-500/30">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-black/90 border-b-2 border-purple-500/50 flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400 font-mono font-bold hidden sm:inline">terminal@socket-matrix</span>
                      </div>
                      <span 
                        className="px-2 sm:px-3 py-1 border-2 border-purple-500/50 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/30"
                      >
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
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-purple-500/50' 
                                  : msg.sender === 'System'
                                  ? 'bg-yellow-500/10 border-2 border-yellow-500/50 text-yellow-400'
                                  : 'bg-black/80 border-2 border-purple-500/50 text-gray-200 shadow-purple-500/30'
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
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:shadow-lg focus:shadow-purple-500/30 disabled:opacity-50 text-white placeholder-gray-500 font-medium text-sm sm:text-base lg:text-lg transition-all duration-300"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!isConnected || !inputMessage.trim()}
                      className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 text-sm sm:text-base lg:text-lg whitespace-nowrap"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Task */}
              <div className="p-6 sm:p-8 lg:p-10 bg-yellow-500/5 border-b-2 border-yellow-500/30">
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
                        className="mt-4 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 bg-green-500 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg"
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
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-black/90 border-2 border-white/20 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-black hover:border-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg order-2 sm:order-1"
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
                  disabled={currentStep === steps.length - 1 || !isStepCompleted}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl sm:rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg order-3"
                >
                  <span>Next Step</span>
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
            className="bg-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 border-purple-500/50 max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl shadow-purple-500/30 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 lg:p-8 border-b-2 border-purple-500/50 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-xl z-10">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
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
                <h4 
                  className="text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                >
                  <span className="text-xl sm:text-2xl">🖥️</span>
                  <span>Server Side (backend/index.js)</span>
                </h4>
                <div className="bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-purple-500/50 overflow-hidden shadow-xl shadow-purple-500/20">
                  <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b-2 border-purple-500/50 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm lg:text-base overflow-x-auto font-mono">
                    <code className="text-purple-400">{currentStepData.serverCode}</code>
                  </pre>
                </div>
              </div>

              {/* Client Code */}
              <div>
                <h4 
                  className="text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                >
                  <span className="text-xl sm:text-2xl">💻</span>
                  <span>Client Side (src/App.js)</span>
                </h4>
                <div className="bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-purple-500/50 overflow-hidden shadow-xl shadow-purple-500/20">
                  <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b-2 border-purple-500/50 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm lg:text-base overflow-x-auto font-mono">
                    <code className="text-pink-400">{currentStepData.clientCode}</code>
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

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
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

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        /* Custom scrollbar with NEON GLOW */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000000;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
          box-shadow: 0 0 10px #a855f7;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
          box-shadow: 0 0 15px #a855f7;
        }
      `}</style>
    </div>
  );
}

export default App;