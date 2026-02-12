import React, { useState, useEffect, useRef } from 'react';

function Level9({ socket, isConnected, onBack }) {
  const [level9Phase, setLevel9Phase] = useState('theory');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  // Demo state
  const [activeTab, setActiveTab] = useState('volatile'); 
  const [cursorPositions, setCursorPositions] = useState([]);
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0 });
  const [volatileLog, setVolatileLog] = useState([]);
  const [normalLog, setNormalLog] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [droppedCount, setDroppedCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  // Binary tab state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const demoAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const simulateTimerRef = useRef(null);

  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout = useRef(null);

  const quiz = [
    {
      question: "What does socket.volatile.emit() do?",
      options: [
        "Sends a message very slowly",
        "Sends a message that can be dropped if socket is disconnected",
        "Encrypts the message before sending",
        "Sends to all clients at once"
      ],
      correct: 1
    },
    {
      question: "When should you use volatile events?",
      options: [
        "For sending important payment data",
        "For chat messages that must be delivered",
        "For real-time cursor positions or live location",
        "For user authentication"
      ],
      correct: 2
    },
    {
      question: "What is binary data in Socket.IO?",
      options: [
        "Data with only 0s and 1s in text form",
        "Raw file data like images, videos, audio",
        "Encrypted messages",
        "Base64 encoded strings only"
      ],
      correct: 1
    },
    {
      question: "Why are volatile events useful for cursor tracking?",
      options: [
        "They are faster than normal events",
        "Missing one position update is okay - next update arrives soon",
        "They save bandwidth permanently",
        "They work without a server"
      ],
      correct: 1
    },
    {
      question: "What happens to a volatile event if the socket is busy?",
      options: [
        "It waits in a queue",
        "It crashes the server",
        "It gets dropped/discarded silently",
        "It gets stored and sent later"
      ],
      correct: 2
    }
  ];

  useEffect(() => {
    return () => {
      if (simulateTimerRef.current) clearInterval(simulateTimerRef.current);
    };
  }, []);

  const addVolatileLog = (msg, type = 'volatile') => {
    setVolatileLog(prev => [...prev.slice(-6), {
      id: Date.now() + Math.random(),
      msg,
      type,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const addNormalLog = (msg) => {
    setNormalLog(prev => [...prev.slice(-6), {
      id: Date.now() + Math.random(),
      msg,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const handleMouseMove = (e) => {
    if (!demoAreaRef.current || !isSimulating) return;
    
    const canvas = demoAreaRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Draw on canvas
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#3b82f6'; // Blue color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    if (myPosition.x !== 0 && myPosition.y !== 0) {
      ctx.beginPath();
      ctx.moveTo(myPosition.x, myPosition.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    setMyPosition({ x, y });
  
    // Volatile emit
    socket.volatile.emit('draw:move', { x, y });
    setSentCount(prev => prev + 1);
    addVolatileLog(`volatile.emit → draw:move {x:${x}, y:${y}}`, 'sent');
    
    // Simulate drops
    if (Math.random() < 0.25) {
      setDroppedCount(prev => prev + 1);
      addVolatileLog(`⚡ DROPPED — socket busy (drawing still smooth!)`, 'dropped');
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setDroppedCount(0);
    setSentCount(0);
    setVolatileLog([]);
    setNormalLog([]);
    addVolatileLog('🟢 Simulation started! Move mouse in the box', 'info');
    addNormalLog('🟢 Normal events: every move stored in queue');

    // Simulate fake other cursors
    simulateTimerRef.current = setInterval(() => {
      const fakeX = Math.floor(Math.random() * 400);
      const fakeY = Math.floor(Math.random() * 200);
      setCursorPositions([{ id: 'bot1', x: fakeX, y: fakeY, name: 'User2' }]);

      // Simulate drops randomly
      if (Math.random() < 0.3) {
        setDroppedCount(prev => prev + 1);
        addVolatileLog(`⚡ DROPPED — socket busy (that's okay!)`, 'dropped');
      }
    }, 800);

    setHasCompletedDemo(true);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulateTimerRef.current) clearInterval(simulateTimerRef.current);
    addVolatileLog('🔴 Simulation stopped', 'info');
  };

  // Binary file handling
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate chunked binary upload
    addVolatileLog(`📦 Sending binary: ${selectedFile.name}`, 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const totalSize = arrayBuffer.byteLength;
      const chunkSize = Math.floor(totalSize / 5);
      let sent = 0;

      const sendChunk = setInterval(() => {
        sent += chunkSize;
        const progress = Math.min(Math.round((sent / totalSize) * 100), 100);
        setUploadProgress(progress);

        // Emit binary chunk via socket
        const chunk = arrayBuffer.slice(sent - chunkSize, sent);
        socket.emit('file:chunk', {
          name: selectedFile.name,
          type: selectedFile.type,
          chunk: chunk,
          progress
        });
        addVolatileLog(`📡 Emitted file:chunk → ${progress}%`, 'sent');

        if (progress >= 100) {
          clearInterval(sendChunk);
          setIsUploading(false);

          // Show uploaded file
          const url = URL.createObjectURL(selectedFile);
          setUploadedFiles(prev => [...prev, {
            id: Date.now(),
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            url
          }]);
          setSelectedFile(null);
          setUploadProgress(0);
          setHasCompletedDemo(true);
          addVolatileLog(`✅ file:complete → ${selectedFile.name} sent!`, 'success');
          socket.emit('file:complete', { name: selectedFile.name, size: totalSize });
        }
      }, 400);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, i) => { if (quizAnswers[i] === q.correct) correct++; });
    return { correct, total: quiz.length };
  };

  const handleChatTyping = (e) => {
    setChatMessage(e.target.value);
    
    // Send volatile typing indicator
    socket.volatile.emit('user:typing');
    setSentCount(prev => prev + 1);
    addVolatileLog('volatile.emit → user:typing', 'sent');
    
    // Simulate random drops
    if (Math.random() < 0.2) {
      setDroppedCount(prev => prev + 1);
      addVolatileLog('⚡ DROPPED - typing indicator lost (OK!)', 'dropped');
    }
  };
  
  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: chatMessage,
      time: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    socket.emit('chat:message', { text: chatMessage }); // Normal emit (important!)
    setChatMessage('');
    setHasCompletedDemo(true);
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'Bot',
        text: `Echo: ${chatMessage}`,
        time: new Date().toLocaleTimeString()
      }]);
    }, 1000);
  };
  
  // Listen for typing indicators
  useEffect(() => {
    socket.on('user:typing', () => {
      setIsTyping(true);
      addVolatileLog('Received → user:typing (volatile)', 'sent');
      
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    });
    
    return () => {
      socket.off('user:typing');
    };
  }, [socket]);
  
    //Quiz Scree
  if (showQuiz) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <header className="bg-[#0d1529] border-b border-blue-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowQuiz(false)} className="px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-blue-500/20">
                  <span>←</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚡</div>
                  <h1 className="text-2xl sm:text-3xl font-black text-blue-400">LEVEL 9 QUIZ</h1>
                </div>
                <div className="w-16"></div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
            {!quizSubmitted ? (
              <div className="bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-3xl overflow-hidden">
                <div className="p-10 border-b border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">🧠</div>
                    <div>
                      <h2 className="text-4xl font-black text-blue-400 mb-2">Quiz Time</h2>
                      <p className="text-lg text-gray-300">Test Your Knowledge</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  {quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-black/50 p-6 rounded-2xl border border-blue-500/20">
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
                                  ? 'bg-blue-500/30 border-2 border-blue-500 text-white'
                                  : 'bg-black/70 border border-blue-500/20 text-gray-300 hover:border-blue-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-blue-500/30'
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

                <div className="p-10 border-t border-blue-500/30 bg-black/50">
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length !== quiz.length}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xl font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-3xl overflow-hidden">
                <div className="p-10 text-center">
                  <div className="text-7xl mb-6">
                    {(() => {
                      const { correct, total } = calculateScore();
                      const pct = (correct / total) * 100;
                      return pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
                    })()}
                  </div>
                  <h2 className="text-4xl font-black text-blue-400 mb-4">Quiz Complete!</h2>
                  <div className="text-6xl font-black text-white mb-4">
                    {calculateScore().correct} / {calculateScore().total}
                  </div>
                  <p className="text-xl text-gray-300 mb-8">
                    {(() => {
                      const { correct, total } = calculateScore();
                      const pct = (correct / total) * 100;
                      if (pct === 100) return 'Perfect Score! 🏆';
                      if (pct >= 80) return 'Excellent Work! 🎉';
                      if (pct >= 60) return 'Good Job! 👍';
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
                              {!isCorrect && <p className="text-sm text-green-400">Correct: {q.options[q.correct]}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-black rounded-2xl transition-all transform hover:scale-105"
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

  // ══════════════════════════════════════════════════════
  // THEORY SCREEN
  // ══════════════════════════════════════════════════════
  if (level9Phase === 'theory') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="bg-[#0d1529] border-b border-blue-500/30 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <button onClick={onBack} className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-blue-500/20 text-sm sm:text-base">
                  <span>←</span>
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">⚡</div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-blue-400">LEVEL 9</h1>
                </div>
                <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border ${
                  isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="hidden sm:inline">{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>

          </header>

          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">

            {/* Real World Examples */}
            <div className="mb-12 sm:mb-16 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-blue-400 flex items-center gap-2 sm:gap-3">
                <span>🌍</span><span>Real-World Examples</span>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🖱️</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-blue-400">Google Docs</h4>
                  <p className="text-sm sm:text-base text-gray-300">Live cursor positions of other users — volatile events!</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📍</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-blue-400">Uber / Maps</h4>
                  <p className="text-sm sm:text-base text-gray-300">Driver location updates every second — missing one is fine!</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-blue-400 hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📁</div>
                  <h4 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-blue-400">WhatsApp</h4>
                  <p className="text-sm sm:text-base text-gray-300">Sending images/videos as binary data over socket!</p>
                </div>
              </div>
            </div>

            {/* Part 1 - Volatile Events */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-blue-400 flex items-center gap-2 sm:gap-3">
                <span>⚡</span><span>Part 1 — Volatile Events</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">❌</span>
                    <h4 className="text-lg font-black text-red-400">Normal emit (queued)</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-red-400 text-xs sm:text-sm font-mono">{`// If socket is busy, this WAITS
// Queues up 100s of positions 😱
socket.emit('cursor:move', {x, y});`}</pre>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">✅</span>
                    <h4 className="text-lg font-black text-green-400">Volatile emit (drop ok)</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-green-400 text-xs sm:text-sm font-mono">{`// If socket is busy, just DROP it
// Next update arrives in 16ms anyway!
socket.volatile.emit('cursor:move', {x,y});`}</pre>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl p-4 hover:scale-105 transition-transform">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-black text-blue-300 mb-1">Use Case</h4>
                  <p className="text-sm text-gray-300">Cursor positions, live location, mouse tracking</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl p-4 hover:scale-105 transition-transform">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-black text-blue-300 mb-1">Why It's Fast</h4>
                  <p className="text-sm text-gray-300">No queue, no retry — fire and forget instantly</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl p-4 hover:scale-105 transition-transform">
                  <div className="text-2xl mb-2">🚫</div>
                  <h4 className="font-black text-blue-300 mb-1">Don't Use For</h4>
                  <p className="text-sm text-gray-300">Payments, messages, any critical data!</p>
                </div>
              </div>
            </div>

            {/* Part 2 - Binary Data */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-blue-400 flex items-center gap-2 sm:gap-3">
                <span>📁</span><span>Part 2 — Binary Data</span>
              </h3>

              <div className="space-y-4 sm:space-y-6 mb-6">
                <div className="flex gap-3 sm:gap-6 items-start">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">1️⃣</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-black mb-2 text-white">What is binary data?</h4>
                    <p className="text-sm sm:text-base text-gray-300 mb-3">Raw file bytes — images, videos, audio, PDFs. NOT text!</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-6 items-start">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">2️⃣</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-black mb-2 text-white">Socket.IO handles it natively</h4>
                    <p className="text-sm sm:text-base text-gray-300 mb-3">Just pass an ArrayBuffer or Blob — Socket.IO handles encoding!</p>
                    <div className="bg-black rounded-xl border border-blue-500/30 p-3 sm:p-4 overflow-x-auto">
                      <code className="text-blue-400 text-xs sm:text-sm font-mono whitespace-pre">{`// Send a file as binary
const fileBuffer = await file.arrayBuffer();
socket.emit('file:upload', {
  name: file.name,
  type: file.type,
  data: fileBuffer   // Raw binary!
});

// Server receives it
socket.on('file:upload', (data) => {
  // data.data is a Buffer in Node.js
  fs.writeFile(data.name, data.data);
});`}</code>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-6 items-start">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">3️⃣</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-black mb-2 text-white">Chunked uploads for large files</h4>
                    <p className="text-sm sm:text-base text-gray-300">Split big files into chunks → show progress bar → reassemble on server</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="mb-12 sm:mb-16 bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl sm:rounded-3xl overflow-hidden animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <div className="p-6 sm:p-8 border-b border-blue-500/30 bg-blue-500/5">
                <h3 className="text-2xl sm:text-3xl font-black text-blue-400 flex items-center gap-2 sm:gap-3">
                  <span>👨‍💻</span><span>The Code</span>
                </h3>
              </div>
              <div className="p-6 sm:p-8">
                <div className="bg-black rounded-xl sm:rounded-2xl border border-blue-500/30 overflow-hidden">
                  <div className="px-4 sm:px-6 py-2 sm:py-3 bg-black/80 border-b border-blue-500/30 flex gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm overflow-x-auto font-mono">
                    <code className="text-blue-400">{`// ⚡ VOLATILE EVENTS
// Client
socket.volatile.emit('cursor:move', { x: 100, y: 200 });

// Server  
socket.on('cursor:move', (data) => {
  // Broadcast to everyone else (also volatile!)
  socket.volatile.broadcast.emit('cursor:update', {
    id: socket.id,
    x: data.x,
    y: data.y
  });
});

// 📁 BINARY DATA
// Client — send file as ArrayBuffer
const buffer = await file.arrayBuffer();
socket.emit('file:upload', { name: file.name, data: buffer });

// Server — receive and save
socket.on('file:upload', ({ name, data }) => {
  const buffer = Buffer.from(data);
  fs.writeFileSync('./uploads/' + name, buffer);
  socket.emit('file:saved', { name, size: buffer.length });
});`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-center animate-slideUp" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={() => setLevel9Phase('practice')}
                className="w-full sm:w-auto px-6 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-base sm:text-xl lg:text-2xl font-black rounded-2xl sm:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 sm:gap-4 mx-auto"
              >
                <span>Got it! Let's Practice</span>
                <span className="text-xl sm:text-2xl lg:text-3xl">→</span>
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        `}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // PRACTICE SCREEN
  // ══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden animate-fadeIn">
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[#0d1529] border-b border-blue-500/30">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setLevel9Phase('theory')} className="px-3 sm:px-4 py-2 bg-[#1a1f35] hover:bg-[#232940] rounded-lg transition-all flex items-center gap-2 border border-blue-500/20 text-sm sm:text-base">
                <span>←</span>
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">⚡</div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-blue-400">LEVEL 9</h1>
              </div>
              <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border ${
                isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="hidden sm:inline">{isConnected ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-[#0d1529] border-b border-blue-500/20 px-4 sm:px-6">
          <div className="container mx-auto flex gap-2">
            <button
              onClick={() => setActiveTab('volatile')}
              className={`px-4 sm:px-6 py-3 font-black text-sm sm:text-base transition-all border-b-2 ${
                activeTab === 'volatile'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              ⚡ Volatile Events
            </button>
            <button
              onClick={() => setActiveTab('binary')}
              className={`px-4 sm:px-6 py-3 font-black text-sm sm:text-base transition-all border-b-2 ${
                activeTab === 'binary'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              📁 Binary Upload
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="container mx-auto max-w-5xl">

            {/* ── VOLATILE TAB ── */}
            {activeTab === 'volatile' && (
  <div>
    <h2 className="text-2xl sm:text-3xl font-black text-blue-400 mb-2 text-center">🎨 Live Drawing Canvas</h2>
    <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">Draw with your mouse - see volatile events fire and drop in real-time!</p>

    {/* Canvas Drawing Area */}
    <div className="bg-black/60 rounded-2xl border-2 border-blue-500/30 mb-4 overflow-hidden">
      <canvas
        ref={demoAreaRef}
        onMouseDown={() => setIsSimulating(true)}
        onMouseUp={() => setIsSimulating(false)}
        onMouseLeave={() => setIsSimulating(false)}
        onMouseMove={handleMouseMove}
        width={800}
        height={400}
        className="w-full h-64 sm:h-96 cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
    </div>

    {/* Controls */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <button
        onClick={() => {
          const canvas = demoAreaRef.current;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setVolatileLog([]);
          setSentCount(0);
          setDroppedCount(0);
        }}
        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all"
      >
        🗑️ Clear Canvas
      </button>
      <button
        onClick={() => setHasCompletedDemo(true)}
        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all"
      >
        ✅ Mark Complete
      </button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-black/60 border border-blue-500/30 rounded-xl p-4">
        <div className="text-2xl font-black text-blue-400">{sentCount}</div>
        <div className="text-xs text-gray-400">Position events sent</div>
      </div>
      <div className="bg-black/60 border border-red-500/30 rounded-xl p-4">
        <div className="text-2xl font-black text-red-400">{droppedCount}</div>
        <div className="text-xs text-gray-400">Events dropped</div>
      </div>
      <div className="bg-black/60 border border-green-500/30 rounded-xl p-4">
        <div className="text-2xl font-black text-green-400">{sentCount - droppedCount}</div>
        <div className="text-xs text-gray-400">Successfully sent</div>
      </div>
    </div>

    {/* Instructions */}
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">💡</div>
        <div>
          <h4 className="font-bold text-blue-400 mb-2">How it works:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <strong>Click & Drag</strong> to draw on the canvas</li>
            <li>• Each mouse move fires a <code className="bg-black/50 px-1 rounded">volatile.emit()</code></li>
            <li>• Some events get <span className="text-red-400">dropped</span> (that's OK! - smooth drawing still works)</li>
            <li>• Perfect demo of when volatile events are useful!</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Event Log */}
    <div className="rounded-2xl overflow-hidden border border-blue-500/30">
      <div className="bg-[#0d1829] px-4 py-2.5 border-b border-blue-500/20">
        <span className="text-xs font-black text-blue-400">📡 VOLATILE EVENTS LOG</span>
      </div>
      <div className="bg-[#040c16] h-32 overflow-y-auto p-3 space-y-1.5">
        {volatileLog.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-xs">
            Start drawing to see volatile events...
          </div>
        ) : volatileLog.slice(-10).map(log => (
          <div key={log.id} className={`px-3 py-1.5 rounded-lg text-xs font-mono border-l-2 ${
            log.type === 'dropped' ? 'border-red-500 text-red-400 bg-red-500/5' :
            'border-blue-500 text-blue-300 bg-blue-500/5'
          }`}>
            <span className="text-gray-600">{log.time}</span> | {log.msg}
          </div>
        ))}
      </div>
    </div>
  </div>
)}
            {/* ── BINARY TAB ── */}
            {activeTab === 'binary' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-blue-400 mb-2 text-center">📁 Binary File Upload</h2>
                <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">Upload any file — see it sent as binary chunks over Socket.IO!</p>

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all mb-4 ${
                    isDragging
                      ? 'border-blue-400 bg-blue-500/10 scale-105'
                      : selectedFile
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-blue-500/30 bg-black/40 hover:border-blue-500/60 hover:bg-blue-500/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  {selectedFile ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {selectedFile.type.startsWith('image/') ? '🖼️' :
                         selectedFile.type.startsWith('video/') ? '🎥' :
                         selectedFile.type.startsWith('audio/') ? '🎵' : '📄'}
                      </div>
                      <p className="font-black text-blue-400">{selectedFile.name}</p>
                      <p className="text-sm text-gray-400">{formatSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📂</div>
                      <p className="font-bold text-gray-400">Drop file here or click to browse</p>
                      <p className="text-xs text-gray-600 mt-1">Any file type supported</p>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="bg-black/60 border-2 border-blue-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-blue-400">Sending binary chunks...</span>
                      <span className="text-sm font-black text-white">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-lg font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 mb-6"
                >
                  {isUploading ? '📡 Sending Binary Data...' : '🚀 Upload via Socket.IO'}
                </button>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-blue-400 mb-3">✅ Uploaded Files</h3>
                    <div className="space-y-3">
                      {uploadedFiles.map(file => (
                        <div key={file.id} className="bg-black/60 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
                          <div className="text-3xl">
                            {file.type.startsWith('image/') ? '🖼️' :
                             file.type.startsWith('video/') ? '🎥' :
                             file.type.startsWith('audio/') ? '🎵' : '📄'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatSize(file.size)} • Sent as binary via socket!</p>
                          </div>
                          {file.type.startsWith('image/') && (
                            <img src={file.url} alt={file.name} className="w-12 h-12 object-cover rounded-lg border border-blue-500/30" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events Log for binary */}
                <div className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-lg">
                  <div className="bg-[#0d1829] px-4 py-2.5 border-b border-blue-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                      </div>
                        <span className="text-xs font-black text-blue-400 tracking-wider">📡 Binary Events Log</span>
                    </div>
                  </div>
                  <div
                    className="bg-[#040c16] h-36 overflow-y-auto p-3 space-y-1.5"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#059669 #0d1829' }}
                  >
                    {volatileLog.filter(l => l.type === 'sent' || l.type === 'success' || l.type === 'info').length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-600 text-xs">Upload a file to see binary events...</div>
                    ) : volatileLog.filter(l => l.type !== 'dropped').map(log => (
                      <div key={log.id} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-mono border-l-2 ${
                        log.type === 'success' ? 'border-green-500 text-green-400' : 'border-blue-500 text-bule-300'
                      }`}
                      style={{ background: 'rgba(16,185,129,0.06)' }}>
                        <span className="text-gray-600 shrink-0">{log.time}</span>
                        <span className="text-gray-500">|</span>
                        <span>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Take Quiz Button */}
        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-blue-500/30 bg-black/60 backdrop-blur-xl p-4 sm:p-6">
            <div className="max-w-4xl mx-auto text-center">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-lg sm:text-2xl font-black rounded-2xl sm:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 sm:gap-4 mx-auto"
              >
                <span>🧠</span>
                <span>Take the Test</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}

export default Level9;