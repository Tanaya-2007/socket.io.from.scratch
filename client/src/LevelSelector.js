import React, { useState } from 'react';

function LevelSelector({ onLevelSelect, completedLevels, onResetProgress, isConnected, isTransitioning, showCongrats, setShowCongrats, onCompleteAll }) {
  const [lockedPopup, setLockedPopup] = useState(null);
  const [resetPopup, setResetPopup] = useState(false);

  const levels = [
    { num: 1,  title: 'Connection',       icon: '🔌', color: 'blue',   description: 'WebSockets, emit events, real-time responses' },
    { num: 2,  title: 'Rooms',            icon: '🏠', color: 'purple', description: 'Private groups like Kahoot, Discord, Zoom' },
    { num: 3,  title: 'Broadcasting',     icon: '📢', color: 'cyan',   description: 'Send to everyone or everyone except yourself' },
    { num: 4,  title: 'Private Messages', icon: '🔏', color: 'cyan',   description: 'Separate apps on one server - complete isolation' },
    { num: 5,  title: 'Acknowledgements', icon: '🤝', color: 'blue',   description: 'Get confirmation that messages were received' },
    { num: 6,  title: 'Error Handling',   icon: '🛠️', color: 'purple', description: 'Handle disconnections & auto-reconnect gracefully' },
    { num: 7,  title: 'Middleware',       icon: '🚦', color: 'cyan',   description: 'Guard your connections! Run code BEFORE accepting.' },
    { num: 8,  title: 'Custom Events',    icon: '🎯', color: 'cyan',   description: 'Create YOUR own events with any name!' },
    { num: 9,  title: 'Volatile Events',  icon: '💨', color: 'blue',   description: 'Send events that skip if user is offline!' },
    { num: 10, title: 'Database',         icon: '🗄️', color: 'purple', description: 'Persist messages, load chat history - like WhatsApp!' },
    { num: 11, title: 'Security',         icon: '🛡️', color: 'cyan',   description: 'Prevent spam, abuse, and DDoS attacks!' },
    { num: 12, title: 'Redis Adapter',    icon: '⚡', color: 'cyan',   description: 'Scale across multiple servers - production ready!' }
  ];

  // ✅ Check if there's any progress to reset
  const hasProgress = completedLevels.length > 0;

  const isLevelUnlocked = (n) => n === 1 || completedLevels.includes(n - 1);
  const isLevelCompleted = (n) => completedLevels.includes(n);

  const getColorClasses = (color) => ({
    blue:   'border-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/30',
    purple: 'border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/30',
    cyan:   'border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/30'
  }[color]);

  const getGradient = (color) => ({
    blue:   'from-blue-500/10',
    purple: 'from-purple-500/10',
    cyan:   'from-cyan-500/10'
  }[color]);

  const getTextColor = (color) => ({
    blue:   'text-blue-400',
    purple: 'text-purple-400',
    cyan:   'text-cyan-400'
  }[color]);

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

      {/* LOCKED POPUP */}
      {lockedPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setLockedPopup(null)} />
          <div className="relative bg-[#0d1525] border-2 border-blue-500/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-blue-500/20"
            style={{ animation: 'popIn 0.25s ease-out' }}>
            <div className="absolute inset-0 bg-blue-500/5 rounded-3xl" />
            <div className="relative text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-black text-blue-400 mb-2">Level Locked!</h2>
              <p className="text-gray-400 text-sm mb-4">Complete this level first:</p>
              <div className="bg-blue-500/15 border border-blue-500/40 rounded-xl px-4 py-3 mb-5">
                <span className="text-blue-300 font-black text-base">
                  {levels[lockedPopup.levelNum - 2]?.icon} Level {lockedPopup.levelNum - 1}: {levels[lockedPopup.levelNum - 2]?.title}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setLockedPopup(null)}
                  className="flex-1 px-4 py-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all text-sm">
                  Cancel
                </button>
                <button onClick={() => { setLockedPopup(null); onLevelSelect(lockedPopup.levelNum - 1); }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 text-sm">
                  Go There →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESET POPUP */}
      {resetPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setResetPopup(false)} />
          <div className="relative bg-[#0d1525] border-2 border-red-500/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-red-500/20"
            style={{ animation: 'popIn 0.25s ease-out' }}>
            <div className="absolute inset-0 bg-red-500/5 rounded-3xl" />
            <div className="relative text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-black text-red-400 mb-2">Reset All Progress?</h2>
              <p className="text-gray-400 text-sm mb-4">⚠️ This will erase everything:</p>
              <div className="bg-black/60 border border-red-500/20 rounded-xl p-4 mb-4 text-left space-y-2">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <span>❌</span> Clear all {completedLevels.length} completed level{completedLevels.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <span>🔒</span> Lock Levels 2-12 (only Level 1 stays unlocked)
                </p>
                <p className="text-sm text-yellow-400 flex items-center gap-2">
                  <span>⚡</span> You'll have to complete all levels again
                </p>
              </div>
              <p className="text-gray-600 text-xs mb-5">⚠️ This action cannot be undone!</p>
              <div className="flex gap-3">
                <button onClick={() => setResetPopup(false)}
                  className="flex-1 px-4 py-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all text-sm">
                  Cancel
                </button>
                <button onClick={() => { setResetPopup(false); onResetProgress(); }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 text-sm">
                  Yes, Reset All!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONGRATULATIONS POPUP */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
          <div
            className="relative bg-[#0d1525] border-2 border-cyan-500/60 rounded-3xl w-full max-w-md overflow-y-auto shadow-2xl shadow-cyan-500/30 z-50"
            style={{ animation: 'popIn 0.3s ease-out', maxHeight: '90vh' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10 rounded-3xl pointer-events-none" />
            <div className="relative p-6 text-center">
              <div className="text-6xl mb-3 animate-bounce inline-block">🏆</div>
              <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text leading-tight">
                CONGRATULATIONS!
              </h2>
              <p className="text-base font-black text-cyan-400 mb-1">You're a Socket.IO Master! 🎓</p>
              <p className="text-gray-400 text-sm mb-5">You've completed all 12 levels!</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-3">
                  <div className="text-xl font-black text-cyan-400">12</div>
                  <div className="text-xs text-gray-500">Levels</div>
                </div>
                <div className="bg-black/60 border border-blue-500/30 rounded-xl p-3">
                  <div className="text-xl font-black text-blue-400">100%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
                <div className="bg-black/60 border border-purple-500/30 rounded-xl p-3">
                  <div className="text-xl font-black text-purple-400">PRO</div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
              </div>
              <div className="bg-black/50 border border-cyan-500/20 rounded-xl p-4 mb-5 text-left">
                <h3 className="text-xs font-black text-cyan-400 mb-3 flex items-center gap-2">
                  <span>🎯</span> Skills You Mastered:
                </h3>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                  {[
                    'WebSocket Connections', 'Rooms & Namespaces',
                    'Broadcasting',          'Acknowledgements',
                    'Middleware & Auth',      'Custom Events',
                    'Database Integration',  'Rate Limiting',
                    'Redis Adapter',          'Production Scaling'
                  ].map((skill, i) => (
                    <span key={i} className="text-xs text-gray-300 flex items-center gap-1">
                      <span className="text-green-400">✅</span> {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowCongrats(false)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-black rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30">
                  🎉 Awesome! Close
                </button>
                <button
                  onClick={() => { setShowCongrats(false); onResetProgress(); }}
                  className="w-full px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-gray-400 font-bold rounded-2xl transition-all text-sm">
                  🔄 Start Over
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
              SOCKET.IO
            </h1>
            <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full" />
          </div>
          <p className="text-xl md:text-2xl text-gray-400 mt-6 font-bold">Master Real-Time Communication in 12 Levels</p>
          <p className="text-sm text-gray-500 mt-2">Complete each level to unlock the next!</p>
          <div className="mt-6">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 ${
              isConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-bold text-sm">{isConnected ? 'SERVER ONLINE' : 'SERVER OFFLINE'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-400">Your Progress</span>
            <span className="text-sm font-bold text-cyan-400">{completedLevels.length} / 12 Completed</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-4 border border-cyan-500/30">
            <div
              className="bg-gradient-to-r from-cyan-600 to-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${(completedLevels.length / 12) * 100}%` }}
            />
          </div>
          {completedLevels.length === 12 && (
            <div className="text-center mt-3">
              <button onClick={() => setShowCongrats(true)}
                className="text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors animate-pulse">
                🏆 View Your Achievement!
              </button>
            </div>
          )}
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-8">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.num);
            const completed = isLevelCompleted(level.num);
            return (
              <button
                key={level.num}
                onClick={() => unlocked ? onLevelSelect(level.num) : setLockedPopup({ levelNum: level.num })}
                className={`group relative bg-black/60 backdrop-blur-xl border-2 ${getColorClasses(level.color)} rounded-2xl md:rounded-3xl p-6 md:p-10 transition-all duration-500 text-left overflow-hidden ${
                  unlocked ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : 'opacity-50 cursor-pointer'
                }`}
              >
                {completed && (
                  <div className="absolute top-3 right-3 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span>✓</span><span>DONE</span>
                  </div>
                )}
                {!unlocked && (
                  <div className="absolute top-3 right-3 z-20 bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span>🔒</span><span>LOCKED</span>
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(level.color)} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{level.icon}</div>
                  <div className="mb-4">
                    <div className={`text-xs font-bold ${getTextColor(level.color)} mb-1`}>LEVEL {level.num}</div>
                    <h3 className="text-2xl md:text-4xl font-black mb-2 text-white">{level.title}</h3>
                    <p className="text-sm md:text-base text-gray-400">{level.description}</p>
                  </div>
                  <div className={`flex items-center gap-2 ${getTextColor(level.color)} font-bold text-sm`}>
                    <span>{completed ? '✓ Completed' : unlocked ? 'Start Learning' : `🔒 Complete Level ${level.num - 1}`}</span>
                    {unlocked && <span className="group-hover:translate-x-2 transition-transform">→</span>}
                  </div>
                </div>
                {unlocked && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Testing Buttons */}
        <div className="text-center space-y-3">
          {/* Complete All Button */}
          <button
            onClick={onCompleteAll}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-2 border-green-500/50 hover:border-green-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30">
            ✅ Complete All Levels (Testing)
          </button>

          {/* Reset Button - DISABLED if no progress */}
          <div>
            <button
              onClick={() => hasProgress && setResetPopup(true)}
              disabled={!hasProgress}
              className={`px-6 py-3 border-2 font-bold rounded-xl transition-all ${
                hasProgress
                  ? 'bg-red-600/20 hover:bg-red-600/30 border-red-500/50 hover:border-red-500 text-red-400 cursor-pointer'
                  : 'bg-gray-800/30 border-gray-700/50 text-gray-600 cursor-not-allowed opacity-50'
              }`}>
              🔄 Reset All Progress {!hasProgress && '(No Progress)'}
            </button>
            <p className="text-xs text-gray-600 mt-2">
              {hasProgress
                ? '⚠️ Clears all completed levels - for testing only'
                : '💡 Complete some levels first to enable reset'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Built with ❤️ using Socket.IO & React</p>
          <p className="mt-2">Complete all 12 levels to become a Socket.IO master! 🏆</p>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default LevelSelector;