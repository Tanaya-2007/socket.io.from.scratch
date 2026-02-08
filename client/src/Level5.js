import React, { useState, useEffect, useRef } from 'react';

function Level5({ socket, isConnected, onBack, isTransitioning }) {
  const [phase, setPhase] = useState('theory');
  const [actions, setActions] = useState([]);
  const [gold, setGold] = useState(100);
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);
  const actionsEndRef = useRef(null);

  const shopItems = [
    { id: 'sword', name: '🗡️ Iron Sword', price: 30 },
    { id: 'shield', name: '🛡️ Wooden Shield', price: 25 },
    { id: 'potion', name: '🧪 Health Potion', price: 15 },
    { id: 'helmet', name: '⛑️ Steel Helmet', price: 40 },
    { id: 'boots', name: '👢 Speed Boots', price: 35 },
    { id: 'ring', name: '💍 Magic Ring', price: 50 }
  ];

  const quiz = [
    {
      question: "What is an acknowledgement in Socket.IO?",
      options: [
        "A way to disconnect from server",
        "A callback function that confirms message was received",
        "A type of room",
        "An error handler"
      ],
      correct: 1
    },
    {
      question: "How do you send an event WITH acknowledgement?",
      options: [
        "socket.emit('event', data)",
        "socket.emit('event', data, callback)",
        "socket.ack('event', data)",
        "socket.confirm('event', data)"
      ],
      correct: 1
    },
    {
      question: "What can the server send back in acknowledgement?",
      options: [
        "Only true/false",
        "Only strings",
        "Any data: objects, arrays, strings, booleans",
        "Nothing, just confirms receipt"
      ],
      correct: 2
    },
    {
      question: "When should you use acknowledgements?",
      options: [
        "For every single event",
        "Never, they're too slow",
        "When you need confirmation of success/failure",
        "Only for errors"
      ],
      correct: 2
    },
    {
      question: "What's the main benefit of acknowledgements?",
      options: [
        "Faster message delivery",
        "Two-way confirmation and error handling",
        "Automatic reconnection",
        "Better security"
      ],
      correct: 1
    }
  ];

  useEffect(() => {
    actionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actions]);

  const addAction = (text, type = 'info') => {
    setActions(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      type, // success, error, info, pending
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleBuyItem = (item) => {
    setSelectedItem(item.id);
    addAction(`🔄 Attempting to buy ${item.name}...`, 'pending');

    // Send with acknowledgement callback
    socket.emit('buy-item', { itemId: item.id, itemName: item.name, price: item.price }, (response) => {
      if (response.success) {
        setGold(response.gold);
        setInventory(response.inventory);
        addAction(`✅ ${response.message}`, 'success');
        setHasCompletedDemo(true);
      } else {
        addAction(`❌ ${response.message}`, 'error');
      }
      setSelectedItem(null);
    });
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
        <div className="fixed inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full blur-[120px]"></div>
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
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-blue-500">LEVEL 5 QUIZ</h1>
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
                    
                    <h2 className="text-2xl md:text-4xl font-black text-blue-400 mb-3 md:mb-4">Quiz Complete!</h2>
                    <div className="text-4xl md:text-6xl font-black text-white mb-3 md:mb-4">
                      {calculateScore().correct} / {calculateScore().total}
                    </div>
                    <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
                      {(() => {
                        const { correct, total } = calculateScore();
                        const percentage = (correct / total) * 100;
                        if (percentage === 100) return 'Perfect! ACK Master! 🏆';
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
                      onClick={onBack}
                      className="px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm md:text-lg"
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
        <div className="fixed inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full blur-[120px]"></div>
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
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-blue-500">LEVEL 5</h1>
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
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-blue-400 flex items-center gap-2 md:gap-3">
                <span>🌍</span>
                <span>Real-World Examples</span>
              </h3>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-5xl mb-4">💬</div>
                  <h4 className="text-xl md:text-2xl font-black mb-3 text-blue-400">WhatsApp</h4>
                  <p className="text-sm md:text-base text-gray-300">Double checkmarks (✓✓) confirm message was delivered and read</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-5xl mb-4">💳</div>
                  <h4 className="text-xl md:text-2xl font-black mb-3 text-blue-400">Payments</h4>
                  <p className="text-sm md:text-base text-gray-300">"Payment successful!" confirmation after transaction</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-blue-400 hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-5xl mb-4">🎮</div>
                  <h4 className="text-xl md:text-2xl font-black mb-3 text-blue-400">Gaming</h4>
                  <p className="text-sm md:text-base text-gray-300">"Item purchased ✓" or "Not enough gold ✗" feedback</p>
                </div>
              </div>
            </div>

            {/* The Difference */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-blue-400 flex items-center gap-2 md:gap-3">
                <span>🔄</span>
                <span>Without vs With Acknowledgements</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">❌</div>
                    <h4 className="text-xl md:text-2xl font-black text-red-400">Without ACK</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <code className="text-red-400 text-xs md:text-sm">
                      socket.emit('buy-item', data);<br/>
                      // 🤷 Did it work?<br/>
                      // 🤷 Do I have enough gold?<br/>
                      // 🤷 No idea!
                    </code>
                  </div>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      <span className="text-gray-300">No confirmation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      <span className="text-gray-300">Can't handle errors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      <span className="text-gray-300">Poor user experience</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl md:text-4xl">✅</div>
                    <h4 className="text-xl md:text-2xl font-black text-green-400">With ACK</h4>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <code className="text-green-400 text-xs md:text-sm">
                      socket.emit('buy-item', data, (res) =&gt; {'{'}
                      <br/>&nbsp;&nbsp;if (res.success) {'{'}
                      <br/>&nbsp;&nbsp;&nbsp;&nbsp;show("✓ Purchased!");
                      <br/>&nbsp;&nbsp;{'}'} else {'{'}
                      <br/>&nbsp;&nbsp;&nbsp;&nbsp;show("✗ " + res.error);
                      <br/>&nbsp;&nbsp;{'}'}
                      <br/>{'}'});
                    </code>
                  </div>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">Error handling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">Great UX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div className="mb-12 md:mb-16 bg-black/60 border-2 border-blue-500/30 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-blue-500/30 bg-blue-500/5">
                <h3 className="text-2xl md:text-3xl font-black text-blue-400 flex items-center gap-2 md:gap-3">
                  <span>👨‍💻</span>
                  <span>The Code</span>
                </h3>
              </div>
              
              <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-blue-400 mb-3 text-base md:text-lg">Server:</h4>
                  <div className="bg-black rounded-xl border border-blue-500/30 overflow-hidden">
                    <div className="px-4 py-2 bg-black/80 border-b border-blue-500/30 flex gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-4 text-xs md:text-sm overflow-x-auto">
                      <code className="text-blue-400">{`socket.on('buy-item', (data, ack) => {
  if (gold >= data.price) {
    gold -= data.price;
    inventory.push(data.itemId);
    
    // Send success response
    ack({
      success: true,
      message: 'Purchased!',
      gold: gold,
      inventory: inventory
    });
  } else {
    // Send error response
    ack({
      success: false,
      message: 'Not enough gold!'
    });
  }
});`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-blue-400 mb-3 text-base md:text-lg">Client:</h4>
                  <div className="bg-black rounded-xl border border-blue-500/30 overflow-hidden">
                    <div className="px-4 py-2 bg-black/80 border-b border-blue-500/30 flex gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-4 text-xs md:text-sm overflow-x-auto">
                      <code className="text-blue-400">{`// Send with callback
socket.emit('buy-item', {
  itemId: 'sword',
  price: 30
}, (response) => {
  // This runs when server responds
  if (response.success) {
    console.log('✓', response.message);
    updateGold(response.gold);
    updateInventory(response.inventory);
  } else {
    console.log('✗', response.message);
  }
});`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            <div className="mb-12 md:mb-16">
              <h3 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-blue-400 flex items-center gap-2 md:gap-3">
                <span>🔑</span>
                <span>Key Concepts</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">🔄</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Two-Way Communication</h4>
                  <p className="text-sm md:text-base text-gray-300">Client sends → Server processes → Server confirms</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">⚡</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Instant Feedback</h4>
                  <p className="text-sm md:text-base text-gray-300">Know immediately if action succeeded or failed</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">🛡️</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Error Handling</h4>
                  <p className="text-sm md:text-base text-gray-300">Gracefully handle failures and show helpful messages</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">💎</div>
                  <h4 className="text-lg md:text-xl font-black mb-2 text-blue-300">Better UX</h4>
                  <p className="text-sm md:text-base text-gray-300">Users see what's happening in real-time</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setPhase('practice')}
                className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 md:gap-4 mx-auto shadow-2xl shadow-blue-500/50"
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

  // PRACTICE SCREEN - RPG SHOP
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="bg-black/90 backdrop-blur-xl border-b border-blue-500/30">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setPhase('theory')} className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base">
                <span>←</span> <span className="hidden sm:inline">Theory</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-2xl md:text-3xl">🏪</div>
                <h1 className="text-lg md:text-2xl font-black text-blue-400">RPG SHOP</h1>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                <span className="text-lg md:text-2xl">💰</span>
                <span className="font-black text-yellow-400 text-sm md:text-base">{gold}G</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Shop Items */}
              <div>
                <h2 className="text-xl md:text-2xl font-black mb-4 flex items-center gap-3">
                  <span className="text-2xl md:text-3xl">🏪</span>
                  <span>Available Items</span>
                </h2>

                <div className="grid gap-3 md:gap-4">
                  {shopItems.map(item => {
                    const owned = inventory.includes(item.id);
                    const canAfford = gold >= item.price;
                    const isPending = selectedItem === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => !owned && canAfford && !isPending && handleBuyItem(item)}
                        disabled={owned || !canAfford || isPending}
                        className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300 ${
                          owned
                            ? 'bg-green-500/10 border-green-500/50 cursor-not-allowed'
                            : canAfford
                            ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500 hover:scale-105 cursor-pointer'
                            : 'bg-black/50 border-gray-500/20 cursor-not-allowed opacity-50'
                        } ${isPending ? 'animate-pulse' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xl md:text-2xl font-black">{item.name}</div>
                          {owned && <div className="text-green-400 text-sm md:text-base">✓ Owned</div>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-yellow-400 font-bold text-sm md:text-base">💰 {item.price}G</div>
                          {!owned && canAfford && !isPending && (
                            <div className="text-blue-400 text-xs md:text-sm">Click to buy →</div>
                          )}
                          {isPending && (
                            <div className="text-yellow-400 text-xs md:text-sm">Processing...</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h2 className="text-xl md:text-2xl font-black mb-4 flex items-center gap-3">
                  <span className="text-2xl md:text-3xl">📜</span>
                  <span>Activity Log</span>
                </h2>

                <div className="bg-black/60 rounded-xl md:rounded-2xl border border-blue-500/30 h-96 md:h-[500px] overflow-y-auto p-4">
                  {actions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <div className="text-4xl md:text-5xl mb-3">🛒</div>
                      <p className="text-base md:text-lg font-bold">Start Shopping!</p>
                      <p className="text-xs md:text-sm text-gray-600 mt-2">Buy items to see acknowledgements</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {actions.map(action => (
                        <div
                          key={action.id}
                          className={`p-3 md:p-4 rounded-lg border ${
                            action.type === 'success'
                              ? 'bg-green-500/10 border-green-500/30 text-green-400'
                              : action.type === 'error'
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : action.type === 'pending'
                              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          }`}
                        >
                          <div className="text-xs opacity-80 mb-1">[{action.timestamp}]</div>
                          <div className="text-sm md:text-base font-medium">{action.text}</div>
                        </div>
                      ))}
                      <div ref={actionsEndRef} />
                    </div>
                  )}
                </div>

                {/* Inventory */}
                <div className="mt-4 bg-black/40 rounded-xl border border-blue-500/20 p-4">
                  <h3 className="text-base md:text-lg font-black mb-3 flex items-center gap-2">
                    <span>🎒</span>
                    <span>Your Inventory ({inventory.length})</span>
                  </h3>
                  {inventory.length === 0 ? (
                    <p className="text-xs md:text-sm text-gray-500">No items yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {inventory.map((itemId, index) => {
                        const item = shopItems.find(i => i.id === itemId);
                        return (
                          <div key={index} className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-xs md:text-sm">
                            {item?.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Take Test Button */}
        {hasCompletedDemo && !showQuiz && (
          <div className="border-t border-blue-500/30 bg-black/60 backdrop-blur-xl p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
             
              
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-lg md:text-2xl font-black rounded-2xl md:rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 md:gap-4"
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

export default Level5;