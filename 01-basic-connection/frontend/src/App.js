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
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      
      {/* Header */}
      <header className="relative z-50 bg-[#0d1529] border-b border-[#1a2744]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚡</div>
              <div>
                <h1 className="text-3xl font-bold">
                  <span className="text-white">SOCKET</span>
                  <span className="text-[#6495ed]">/</span>
                  <span className="text-[#6495ed]">MATRIX</span>
                </h1>
                <p className="text-sm text-gray-400">Interactive Socket.IO Tutorial</p>
              </div>
            </div>
            
            <div className={`px-5 py-2 rounded-lg text-sm font-bold border ${
              isConnected 
                ? 'bg-green-500/10 border-green-500 text-green-400' 
                : 'bg-red-500/10 border-red-500 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-[#0d1529] border-b border-[#1a2744]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-bold text-[#6495ed]">
              {Math.round((completedSteps.length / steps.length) * 100)}%
            </span>
          </div>
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className="flex-1"
              >
                <div className={`h-2 rounded-full transition-all ${
                  completedSteps.includes(index)
                    ? 'bg-green-500'
                    : index === currentStep
                    ? 'bg-[#6495ed]'
                    : 'bg-[#1a2744]'
                }`}></div>
                <div className="text-xs text-center mt-2 text-gray-500">
                  {completedSteps.includes(index) && '✓'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Step Card */}
          <div className="bg-[#0d1529] rounded-2xl border border-[#1a2744] overflow-hidden">
            
            {/* Step Header */}
            <div className="p-8 border-b border-[#1a2744]">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span>STEP {currentStep + 1} OF {steps.length}</span>
                {isStepCompleted && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-400 rounded-full text-xs font-bold">
                    COMPLETED ✓
                  </span>
                )}
              </div>
              <div className="flex items-center gap-5 mb-4">
                <div className="text-6xl">{currentStepData.icon}</div>
                <div>
                  <h2 className="text-4xl font-bold mb-2">{currentStepData.title}</h2>
                  <p className="text-lg text-gray-400">{currentStepData.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowCodeModal(true)}
                className="mt-4 px-6 py-3 bg-[#6495ed] text-white font-bold rounded-lg hover:bg-[#5580d8] transition-all flex items-center gap-2"
              >
                <span>👨‍💻</span>
                View Code
              </button>
            </div>

            {/* Interactive Demo */}
            {currentStepData.showDemo && (
              <div className="p-8 border-b border-[#1a2744]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>💻</span> Live Demo
                </h3>
                
                {/* Terminal */}
                <div className="bg-[#0a0f1e] rounded-xl border border-[#1a2744] overflow-hidden mb-4">
                  <div className="px-4 py-3 bg-[#0d1529] border-b border-[#1a2744] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-gray-400">terminal</span>
                    </div>
                    <span className="text-xs text-[#6495ed]">LIVE</span>
                  </div>

                  <div className="p-4 h-64 overflow-y-auto custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <div className="text-5xl mb-3">💬</div>
                        <p className="text-sm">Terminal ready. Type a message...</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => (
                          <div 
                            key={msg.id}
                            className={`mb-3 ${msg.sender === 'You' ? 'text-right' : ''}`}
                          >
                            <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                              msg.sender === 'You' 
                                ? 'bg-[#6495ed] text-white' 
                                : msg.sender === 'System'
                                ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                                : 'bg-[#0d1529] border border-[#1a2744] text-gray-300'
                            }`}>
                              <div className="text-xs opacity-70 mb-1">
                                [{msg.timestamp}] {msg.sender}
                              </div>
                              <div className="text-sm">{msg.text}</div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </div>

                {/* Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isConnected}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-[#0a0f1e] border border-[#1a2744] rounded-lg focus:border-[#6495ed] focus:outline-none disabled:opacity-50 text-white placeholder-gray-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!isConnected || !inputMessage.trim()}
                    className="px-8 py-3 bg-[#6495ed] text-white font-bold rounded-lg hover:bg-[#5580d8] disabled:opacity-50 transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Task */}
            <div className="p-8 bg-yellow-500/5">
              <div className="flex gap-4">
                <span className="text-4xl">🎯</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Your Task</h3>
                  <p className="text-gray-300 mb-3">{currentStepData.task}</p>
                  <p className="text-sm text-gray-400">💡 {currentStepData.hint}</p>
                  
                  {canCompleteCurrentStep && !isStepCompleted && (
                    <button
                      onClick={completeStep}
                      className="mt-4 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                    >
                      <span>✓</span>
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-6 bg-[#0a0f1e] flex justify-between">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-6 py-3 bg-[#1a2744] text-white font-bold rounded-lg hover:bg-[#242f4a] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <span>←</span>
                Previous
              </button>
              
              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1 || !isStepCompleted}
                className="px-6 py-3 bg-[#6495ed] text-white font-bold rounded-lg hover:bg-[#5580d8] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Next Step
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCodeModal(false)}
        >
          <div 
            className="bg-[#0d1529] rounded-2xl border border-[#1a2744] max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#1a2744] flex items-center justify-between sticky top-0 bg-[#0d1529] z-10">
              <h3 className="text-2xl font-bold">Code Reference</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Server Code */}
              <div>
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#6495ed]">
                  <span>🖥️</span> Server Side (backend/index.js)
                </h4>
                <div className="bg-[#0a0f1e] rounded-lg border border-[#1a2744] overflow-hidden">
                  <div className="px-4 py-2 bg-[#0d1529] border-b border-[#1a2744] flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-[#6495ed]">{currentStepData.serverCode}</code>
                  </pre>
                </div>
              </div>

              {/* Client Code */}
              <div>
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#7ba7ff]">
                  <span>💻</span> Client Side (src/App.js)
                </h4>
                <div className="bg-[#0a0f1e] rounded-lg border border-[#1a2744] overflow-hidden">
                  <div className="px-4 py-2 bg-[#0d1529] border-b border-[#1a2744] flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-[#7ba7ff]">{currentStepData.clientCode}</code>
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

export default App;