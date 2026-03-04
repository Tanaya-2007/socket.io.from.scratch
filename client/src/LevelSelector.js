import React, { useState, useEffect } from 'react';

function LevelSelector({ onLevelSelect, completedLevels, onResetProgress, isConnected, isTransitioning, showCongrats, setShowCongrats, onCompleteAll }) {
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);

  const levels = [
    { num: 1, title: 'Connection', icon: '🔌', color: 'blue', description: 'WebSockets, emit events, real-time responses' },
    { num: 2, title: 'Rooms', icon: '🚪', color: 'purple', description: 'Private groups like Kahoot, Discord, Zoom' },
    { num: 3, title: 'Broadcasting', icon: '📡', color: 'cyan', description: 'Send to everyone or everyone except yourself' },
    { num: 4, title: 'Private Messages', icon: '💌', color: 'cyan', description: 'Separate apps on one server - complete isolation' },
    { num: 5, title: 'Acknowledgements', icon: '✅', color: 'blue', description: 'Get confirmation that messages were received' },
    { num: 6, title: 'Error Handling', icon: '⚠️', color: 'purple', description: 'Handle disconnections & auto-reconnect gracefully' },
    { num: 7, title: 'Middleware', icon: '🔐', color: 'cyan', description: 'Guard your connections! Run code BEFORE accepting or rejecting.' },
    { num: 8, title: 'Custom Events', icon: '⚡', color: 'cyan', description: 'Create YOUR own events with any name! Not limited to message anymore.' },
    { num: 9, title: 'Volatile Events', icon: '✨', color: 'blue', description: 'Send events that skip if user is offline - perfect for games!' },
    { num: 10, title: 'Database', icon: '💾', color: 'purple', description: 'Persist messages, load chat history, track receipts - like WhatsApp!' },
    { num: 11, title: 'Security', icon: '🛡️', color: 'cyan', description: 'Prevent spam, abuse, and DDoS attacks - think like a pro!' },
    { num: 12, title: 'Redis Adapter', icon: '🌐', color: 'cyan', description: 'Scale across multiple servers - production ready!' }
  ];

  // Only show congrats popup when all 12 levels are genuinely completed by the user
  useEffect(() => {
    if (completedLevels.length === 12) {
      const hasShownPopup = sessionStorage.getItem('congratsShown');
      if (!hasShownPopup) {
        setTimeout(() => {
          setShowCongratsPopup(true);
          sessionStorage.setItem('congratsShown', 'true');
        }, 500);
      }
    }
  }, [completedLevels]);

  const isLevelUnlocked = (levelNum) => {
    if (levelNum === 1) return true;
    return completedLevels.includes(levelNum - 1);
  };

  const isLevelCompleted = (levelNum) => completedLevels.includes(levelNum);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/30',
      purple: 'border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/30',
      cyan: 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/30'
    };
    return colors[color] || colors.cyan;
  };

  const getGradientClasses = (color) => {
    const gradients = {
      blue: 'from-blue-500/10',
      purple: 'from-purple-500/10',
      cyan: 'from-cyan-500/10'
    };
    return gradients[color] || gradients.cyan;
  };

  const getTextColor = (color) => {
    const textColors = {
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      cyan: 'text-cyan-400'
    };
    return textColors[color] || textColors.cyan;
  };

  const handleCompleteAllClick = () => {
    const allLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    localStorage.setItem('completedLevels', JSON.stringify(allLevels));
    onCompleteAll();
    sessionStorage.setItem('congratsShown', 'true');
    setTimeout(() => setShowCongratsPopup(true), 300);
  };

  const handleResetConfirm = () => {
    localStorage.removeItem('completedLevels');
    localStorage.removeItem('currentLevel');
    sessionStorage.removeItem('congratsShown');
    setShowResetPopup(false);
    setShowCongratsPopup(false);
    onResetProgress();
  };

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-16">
          {/* Back button */}
          <div className="flex justify-start mb-6">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white text-sm font-bold rounded-xl transition-all duration-300"
            >
              ← Back to Home
            </button>
          </div>

          <div className="inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              SOCKET.IO MASTERY
            </h1>
            <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"></div>
          </div>
          <p className="text-xl md:text-2xl text-gray-400 mt-6 font-bold">
            Master Real-Time Communication in 12 Levels
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Complete each level to unlock the next!
          </p>

          {/* Server Status */}
          <div className="mt-6">
            <div className={`inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border-2 ${
              isConnected
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm md:text-base font-bold">{isConnected ? 'SERVER ONLINE' : 'SERVER OFFLINE'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-400">Your Progress</span>
            <span className="text-sm font-bold text-cyan-400">{completedLevels.length} / 12 Completed</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-4 border border-cyan-500/30">
            <div
              className="bg-gradient-to-r from-cyan-600 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedLevels.length / 12) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-8">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.num);
            const completed = isLevelCompleted(level.num);

            return (
              <button
                key={level.num}
                onClick={() => unlocked && onLevelSelect(level.num)}
                disabled={!unlocked}
                className={`group relative bg-black/60 backdrop-blur-xl border-2 ${getColorClasses(level.color)} rounded-2xl md:rounded-3xl p-6 md:p-10 hover:scale-105 hover:shadow-2xl transition-all duration-500 text-left overflow-hidden ${
                  !unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {completed && (
                  <div className="absolute top-3 right-3 z-20">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>✓</span> <span>DONE</span>
                    </div>
                  </div>
                )}

                {!unlocked && (
                  <div className="absolute top-3 right-3 z-20">
                    <div className="bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>🔒</span> <span>LOCKED</span>
                    </div>
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClasses(level.color)} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">{level.icon}</div>
                  <div className="mb-4 md:mb-6">
                    <div className={`text-xs md:text-sm font-bold ${getTextColor(level.color)} mb-1 md:mb-2`}>LEVEL {level.num}</div>
                    <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">{level.title}</h3>
                    <p className="text-sm md:text-lg text-gray-400">{level.description}</p>
                  </div>
                  <div className={`flex items-center gap-2 md:gap-3 ${getTextColor(level.color)} font-bold text-sm md:text-base`}>
                    <span>{completed ? '✓ Completed' : unlocked ? 'Start Learning' : `🔒 Complete Level ${level.num - 1}`}</span>
                    {unlocked && <span className="group-hover:translate-x-2 transition-transform">→</span>}
                  </div>
                </div>

                {unlocked && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Built with ❤️ using Socket.IO & React</p>
          <p className="mt-2">Complete all 12 levels to become a Socket.IO master! 🏆</p>
        </div>

        {/* Testing Buttons */}
        <div className="text-center mt-8 space-y-3">
          <button
            onClick={handleCompleteAllClick}
            className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 border-2 border-green-500/50 hover:border-green-500 text-green-400 font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            ✅ Complete All Levels (Testing)
          </button>

          <div>
            <button
              onClick={() => setShowResetPopup(true)}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border-2 border-red-500/50 hover:border-red-500 text-red-400 font-bold rounded-xl transition-all duration-300"
            >
              🔄 Reset Progress
            </button>
            <p className="text-xs text-gray-600 mt-2">For testing purposes only</p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Popup */}
      {showResetPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowResetPopup(false)} />
          <div className="relative bg-[#0d1425] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/10 z-50"
            style={{ animation: 'popIn 0.4s ease-out' }}>
            <div className="text-center">
              {/* Icon with soft glow */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <span className="text-3xl">🔄</span>
              </div>
              <h2 className="text-xl font-black text-white mb-2">Reset your progress?</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                All your completed levels will be cleared.<br/>This can't be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetPopup(false)}
                  className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm font-bold rounded-2xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 px-5 py-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-400 text-sm font-bold rounded-2xl transition-all duration-300"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Congratulations Popup */}
      {showCongratsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowCongratsPopup(false)} />
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-cyan-400/30 z-50"
            style={{ animation: 'popIn 0.4s ease-out' }}>
            <div className="text-center">
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-5">
                CONGRATULATIONS!
              </h2>
              <div className="relative inline-block mb-5">
                <div className="relative w-36 h-44 mx-auto">
                  <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full drop-shadow-2xl">
                    <defs>
                      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <path d="M50 5 L90 20 L90 60 Q90 90 50 115 Q10 90 10 60 L10 20 Z"
                          fill="url(#shieldGrad)" stroke="#fbbf24" strokeWidth="3"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl mb-1">⚡</div>
                    <div className="text-white font-black text-lg text-center">SOCKET.IO</div>
                    <div className="text-yellow-300 font-black text-xl text-center mt-0.5">EXPERT</div>
                    <div className="flex gap-1 mt-2">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-yellow-400 text-xs">⭐</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-lg text-white font-bold mb-4">You've completed all 12 levels!</p>
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-cyan-500/20">
                <p className="text-cyan-300 font-bold mb-3 text-xs uppercase tracking-wide text-center">Mastered Skills</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs max-w-xs mx-auto">
                  <div className="flex items-center justify-start gap-1.5"><span className="text-green-400">✓</span><span className="text-gray-200">Real-time comms</span></div>
                  <div className="flex items-center justify-start gap-1.5"><span className="text-green-400">✓</span><span className="text-gray-200">Broadcasting</span></div>
                  <div className="flex items-center justify-start gap-1.5"><span className="text-green-400">✓</span><span className="text-gray-200">Security</span></div>
                  <div className="flex items-center justify-start gap-1.5"><span className="text-green-400">✓</span><span className="text-gray-200">Redis scaling</span></div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-5 py-2 mb-5">
                <span className="text-sm">🚀</span>
                <span className="text-green-300 font-bold text-sm">Ready for production!</span>
              </div>
              <button
                onClick={() => setShowCongratsPopup(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white text-lg font-black rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
                AWESOME! 🎊
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default LevelSelector;