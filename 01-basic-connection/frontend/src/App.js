import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const messagesEndRef = useRef(null);

  // Lessons data
  const lessons = [
    {
      id: 0,
      title: "Connection",
      description: "When a client connects, both server and client know instantly!",
      serverCode: `io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});`,
      clientCode: `socket.on('connect', () => {
  console.log('Connected!');
});`,
      challenge: "Open browser console and see your connection ID!"
    },
    {
      id: 1,
      title: "Emitting Events",
      description: "Send custom events from client to server!",
      serverCode: `socket.on('message', (data) => {
  console.log('Received:', data);
});`,
      clientCode: `socket.emit('message', 'Hello!');`,
      challenge: "Send a message and watch it appear!"
    },
    {
      id: 2,
      title: "Receiving Responses",
      description: "Server can reply back to the client!",
      serverCode: `socket.emit('response', {
  text: 'Hello Client!'
});`,
      clientCode: `socket.on('response', (data) => {
  console.log(data.text);
});`,
      challenge: "Type a message and get a server response!"
    }
  ];

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      addSystemMessage('🎮 Connected to Socket.IO Academy!');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addSystemMessage('⚠️ Disconnected from server');
    });

    socket.on('response', (data) => {
      addMessage('Server', data.text, data.timestamp);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('response');
    };
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const currentLessonData = lessons[currentLesson];

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      
      {/* Header */}
      <header className="bg-[#1a1f3a] border-b-2 border-[#2dd4bf] shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl animate-pulse">🔌</div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  SOCKET.IO <span className="text-[#2dd4bf]">ACADEMY</span>
                </h1>
                <p className="text-sm text-gray-400">Learn Real-Time Communication</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-bold border-2 ${
                isConnected 
                  ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-[#2dd4bf]' 
                  : 'bg-red-500/20 border-red-500 text-red-500'
              }`}>
                <span className="inline-block w-2 h-2 rounded-full mr-2 animate-pulse" 
                  style={{ backgroundColor: isConnected ? '#2dd4bf' : '#ef4444' }}></span>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          
          {/* Left Sidebar - Lessons */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1f3a] rounded-2xl border-2 border-[#2a3150] p-4">
              <h2 className="text-xl font-bold mb-4 text-[#2dd4bf]">📚 Lessons</h2>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                      currentLesson === index
                        ? 'bg-[#2dd4bf] text-[#0a0e27]'
                        : 'bg-[#2a3150] text-gray-300 hover:bg-[#323b5c]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentLesson === index ? 'bg-[#0a0e27] text-[#2dd4bf]' : 'bg-[#1a1f3a]'
                      }`}>
                        {index + 1}
                      </span>
                      <span>{lesson.title}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-[#2a3150]">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-[#2dd4bf] font-bold">33%</span>
                </div>
                <div className="w-full bg-[#2a3150] rounded-full h-2">
                  <div className="bg-[#2dd4bf] h-2 rounded-full w-1/3"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Interactive Demo */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1f3a] rounded-2xl border-2 border-[#2a3150] overflow-hidden">
              
              {/* Lesson Header */}
              <div className="bg-gradient-to-r from-[#2dd4bf]/20 to-transparent p-6 border-b border-[#2a3150]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📡</span>
                  <h2 className="text-2xl font-black">{currentLessonData.title}</h2>
                </div>
                <p className="text-gray-400">{currentLessonData.description}</p>
              </div>

              {/* Robot Character */}
              <div className="p-6 text-center border-b border-[#2a3150]">
                <div className="inline-block relative">
                  <div className="text-8xl animate-bounce-slow">🤖</div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#2dd4bf] text-[#0a0e27] px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    Socket Bot
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6">
                <div className="bg-[#0a0e27] rounded-xl border-2 border-[#2a3150] p-4 h-64 overflow-y-auto custom-scrollbar mb-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                      No messages yet. Try sending one! 👇
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`mb-3 p-3 rounded-lg ${
                            msg.sender === 'You' 
                              ? 'bg-[#2dd4bf] text-[#0a0e27] ml-auto max-w-[80%]' 
                              : msg.sender === 'System'
                              ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-center text-sm'
                              : 'bg-[#2a3150] max-w-[80%]'
                          }`}
                        >
                          <div className="font-bold text-xs mb-1 opacity-80">{msg.sender}</div>
                          <div>{msg.text}</div>
                          <div className="text-xs mt-1 opacity-60">{msg.timestamp}</div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isConnected}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-[#2a3150] border-2 border-[#2a3150] rounded-lg focus:border-[#2dd4bf] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!isConnected || !inputMessage.trim()}
                    className="px-6 py-3 bg-[#2dd4bf] text-[#0a0e27] font-bold rounded-lg hover:bg-[#25b9a5] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Challenge */}
              <div className="p-6 bg-[#2dd4bf]/10 border-t border-[#2a3150]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-bold text-[#2dd4bf] mb-1">Challenge:</h3>
                    <p className="text-sm text-gray-300">{currentLessonData.challenge}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Code Panel */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1f3a] rounded-2xl border-2 border-[#2a3150] overflow-hidden">
              
              <div className="bg-[#2a3150] p-4 border-b border-[#323b5c] flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>💻</span> Code Editor
                </h2>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="px-4 py-2 bg-[#2dd4bf] text-[#0a0e27] rounded-lg font-bold text-sm hover:bg-[#25b9a5] transition-all"
                >
                  {showCode ? 'Hide Code' : 'Show Code'}
                </button>
              </div>

              {showCode && (
                <div className="p-6 space-y-6">
                  
                  {/* Server Code */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🖥️</span>
                      <h3 className="font-bold text-[#2dd4bf]">SERVER (backend/index.js)</h3>
                    </div>
                    <div className="bg-[#0a0e27] rounded-lg border border-[#2a3150] overflow-hidden">
                      <div className="bg-[#1a1f3a] px-4 py-2 border-b border-[#2a3150] flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm">
                        <code className="text-[#2dd4bf]">{currentLessonData.serverCode}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Client Code */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">💻</span>
                      <h3 className="font-bold text-blue-400">CLIENT (src/App.js)</h3>
                    </div>
                    <div className="bg-[#0a0e27] rounded-lg border border-[#2a3150] overflow-hidden">
                      <div className="bg-[#1a1f3a] px-4 py-2 border-b border-[#2a3150] flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm">
                        <code className="text-blue-400">{currentLessonData.clientCode}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h4 className="font-bold text-blue-400 mb-2">💡 How it works:</h4>
                    <p className="text-sm text-gray-300">{currentLessonData.description}</p>
                  </div>

                </div>
              )}

              {!showCode && (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">👨‍💻</div>
                  <p>Click "Show Code" to see the magic! ✨</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;