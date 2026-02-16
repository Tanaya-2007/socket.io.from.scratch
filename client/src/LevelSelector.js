import React from 'react';

function LevelSelector({ onLevelSelect, completedLevels, onResetProgress, isConnected, isTransitioning }) {
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

  const isLevelUnlocked = (levelNum) => {
    if (levelNum === 1) return true;
    return completedLevels.includes(levelNum - 1);
  };

  const isLevelCompleted = (levelNum) => {
    return completedLevels.includes(levelNum);
  };

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
          <div className="inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
              SOCKET.IO
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
                onClick={() => {
                  if (unlocked) {
                    onLevelSelect(level.num);
                  } else {
                    alert(`🔒 Please complete Level ${level.num - 1} first!`);
                  }
                }}
                disabled={!unlocked}
                className={`group relative bg-black/60 backdrop-blur-xl border-2 ${getColorClasses(level.color)} rounded-2xl md:rounded-3xl p-6 md:p-10 hover:scale-105 hover:shadow-2xl transition-all duration-500 text-left overflow-hidden ${
                  !unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {/* Completed Badge */}
                {completed && (
                  <div className="absolute top-3 right-3 z-20">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>✓</span> <span>DONE</span>
                    </div>
                  </div>
                )}

                {/* Locked Badge */}
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

                {/* Shine Effect */}
                {unlocked && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Reset Progress Button */}
        <div className="text-center">
          <button
            onClick={onResetProgress}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border-2 border-red-500/50 hover:border-red-500 text-red-400 font-bold rounded-xl transition-all duration-300"
          >
            🔓 Unlock All Levels (Reset Progress)
          </button>
          <p className="text-xs text-gray-600 mt-2">For testing purposes only</p>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Built with ❤️ using Socket.IO & React</p>
          <p className="mt-2">Complete all 12 levels to become a Socket.IO master! 🏆</p>
        </div>
      </div>
    </div>
  );
}

export default LevelSelector;