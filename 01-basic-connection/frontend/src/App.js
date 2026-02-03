import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';


const socket = io('http://localhost:4000');

function App() {
 
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('demo');
  const [showConcept, setShowConcept] = useState(null); 
  const messagesEndRef = useRef(null);


  useEffect(() => {
    // When connected to server
    socket.on('connect', () => {
      console.log('✅ Connected!', socket.id);
      setIsConnected(true);
      addSystemMessage('Connected to server! 🎉');
    });

    // When disconnected from server
    socket.on('disconnect', () => {
      console.log('❌ Disconnected');
      setIsConnected(false);
      addSystemMessage('Disconnected 😢');
    });

    // When server sends response
    socket.on('response', (data) => {
      console.log('📨 Response:', data);
      addMessage('Server', data.text, data.timestamp);
    });
     
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('response');
    };
  }, []);

  // Auto-scroll to latest message
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };


  const codeSnippets = {
    connection: {
      title: "📡 Connection",
      server: `io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});`,
      client: `socket.on('connect', () => {
  console.log('Connected to server!');
});`,
      explanation: "When client connects, both server and client know about it instantly!"
    },
    emit: {
      title: "📤 Emitting Events",
      server: `socket.emit('response', { 
  text: 'Hello!' 
});`,
      client: `socket.emit('message', 'Hello Server!');`,
      explanation: "emit() sends events. Server → Client or Client → Server!"
    },
    listen: {
      title: "📥 Listening to Events",
      server: `socket.on('message', (data) => {
  console.log('Received:', data);
});`,
      client: `socket.on('response', (data) => {
  console.log('Server said:', data);
});`,
      explanation: "on() listens for events. Like a subscriber waiting for messages!"
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse-slow"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        
  
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            <span className="inline-block animate-bounce-slow">🔌</span>
            {' '}Socket.IO Connection
          </h1>
          <p className="text-white/80 text-lg font-semibold">
            Learn real-time communication from scratch!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
        
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border-4 border-white/50">
            
            {/* Connection Status */}
            <div className="mb-6">
              <div className={`
                flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg
                ${isConnected 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                  : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                }
                transform transition-all duration-300 hover:scale-105
              `}>
                <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-white' : 'bg-white/70'} animate-ping`}></div>
                <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-white' : 'bg-white/70'} absolute`}></div>
                {isConnected ? '✅ Connected' : '❌ Disconnected'}
              </div>
            </div>

            {/* Messages Container */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 h-96 overflow-y-auto mb-4 border-2 border-gray-200 shadow-inner custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`
                    mb-3 p-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-102
                    ${msg.sender === 'You' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white ml-auto max-w-[80%]' 
                      : msg.sender === 'System'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 mx-auto max-w-[90%] text-center'
                      : 'bg-white border-2 border-indigo-200 text-gray-800 max-w-[80%]'
                    }
                    animate-slide-in
                  `}
                >
                  <div className="font-bold text-sm mb-1 opacity-80">{msg.sender}</div>
                  <div className="text-base">{msg.text}</div>
                  <div className="text-xs mt-1 opacity-60">{msg.timestamp}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                placeholder="Type a message..."
                className="
                  flex-1 px-6 py-4 rounded-2xl border-2 border-gray-300 
                  focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 
                  outline-none transition-all duration-300
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  text-lg font-medium
                "
              />
              <button
                onClick={handleSend}
                disabled={!isConnected || !inputMessage.trim()}
                className="
                  px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 
                  text-white font-bold rounded-2xl shadow-lg
                  hover:shadow-xl hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                "
              >
                Send 🚀
              </button>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="font-bold text-blue-900 mb-2">💡 Try This:</div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Open this in 2 browser tabs</li>
                <li>• Send messages and see instant updates!</li>
                <li>• Check the browser console (F12) for logs</li>
              </ul>
            </div>
          </div>

        
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border-4 border-white/50">
            
            <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-4xl">📚</span>
              Learn The Code
            </h2>

            {/* Concept Cards */}
            <div className="space-y-4">
              {Object.entries(codeSnippets).map(([key, concept]) => (
                <div 
                  key={key}
                  className="
                    border-2 border-gray-200 rounded-2xl overflow-hidden
                    hover:border-indigo-400 hover:shadow-xl
                    transition-all duration-300 cursor-pointer
                    transform hover:scale-102
                  "
                  onClick={() => setShowConcept(showConcept === key ? null : key)}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 font-bold text-lg flex items-center justify-between">
                    {concept.title}
                    <span className="text-2xl">{showConcept === key ? '🔽' : '▶️'}</span>
                  </div>

                  {/* Expanded Content */}
                  {showConcept === key && (
                    <div className="p-4 bg-gray-50 animate-slide-down">
                      
                      {/* Explanation */}
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-3 mb-4 rounded">
                        <p className="text-blue-900 font-semibold">{concept.explanation}</p>
                      </div>

                      {/* Server Code */}
                      <div className="mb-4">
                        <div className="text-xs font-bold text-gray-600 mb-2">🖥️ SERVER (backend/index.js)</div>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono">
                          {concept.server}
                        </pre>
                      </div>

                      {/* Client Code */}
                      <div>
                        <div className="text-xs font-bold text-gray-600 mb-2">💻 CLIENT (src/App.js)</div>
                        <pre className="bg-gray-900 text-blue-400 p-4 rounded-xl overflow-x-auto text-sm font-mono">
                          {concept.client}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-purple-900">Level 1 Progress</span>
                <span className="text-purple-700 font-bold">33%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full w-1/3 animate-pulse-slow"></div>
              </div>
              <p className="text-sm text-purple-700 mt-2">
                ✅ Connection · ⏳ Rooms · ⏳ Broadcast
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;