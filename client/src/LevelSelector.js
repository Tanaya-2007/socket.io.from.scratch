import React, { useState } from 'react';

const levels = [
  { id: 1,  title: 'Basic Connection',         desc: 'First Socket.IO connection & lifecycle',       icon: '🔌' },
  { id: 2,  title: 'Rooms',                    desc: 'Join, leave and emit to specific rooms',       icon: '🚪' },
  { id: 3,  title: 'Broadcasting',             desc: 'Send messages to all or specific clients',     icon: '📡' },
  { id: 4,  title: 'Namespaces',               desc: 'Isolated communication channels',              icon: '🗂️' },
  { id: 5,  title: 'Acknowledgements',         desc: 'Confirm delivery with callbacks & timers',     icon: '✅' },
  { id: 6,  title: 'Error Handling',           desc: 'Disconnections & auto-reconnect strategies',   icon: '🛡️' },
  { id: 7,  title: 'Middleware',               desc: 'Auth checks before accepting connections',     icon: '🔒' },
  { id: 8,  title: 'Custom Events',            desc: 'Build your own event-driven architecture',     icon: '⚙️' },
  { id: 9,  title: 'Volatile & Binary Data',   desc: 'Fire-and-forget messages & binary payloads',  icon: '💾' },
  { id: 10, title: 'Database Integration',     desc: 'Persist real-time events to MongoDB',         icon: '🗄️' },
  { id: 11, title: 'Rate Limiting & Security', desc: 'Prevent spam, abuse and DDoS attacks',        icon: '🔐' },
  { id: 12, title: 'Redis Adapter & Scaling',  desc: 'Scale across multiple servers with Redis',    icon: '🚀' },
];

function LevelSelector({
  onLevelSelect,
  completedLevels = [],
  onResetProgress,
  isConnected,
  isTransitioning,
  showCongrats,
  setShowCongrats,
  onCompleteAll,
}) {
  const [hoveredLevel, setHoveredLevel] = useState(null);

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

      {/* Background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text tracking-widest"
            style={{ fontFamily: 'Arial Black, sans-serif' }}>
            SOCKET.IO
          </h1>
          <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full w-64 mx-auto animate-pulse mb-4" />
          <p className="text-gray-400 text-lg">Choose a level to start learning</p>

          {/* Connection status */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-500">{isConnected ? 'Server Connected' : 'Server Disconnected'}</span>
          </div>
        </div>

        {/* Congrats Banner */}
        {showCongrats && (
          <div className="mb-8 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-purple-500/40 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-black text-white mb-1">You completed all 12 levels!</h2>
            <p className="text-gray-400 text-sm mb-4">You're now a Socket.IO pro!</p>
            <button
              onClick={() => setShowCongrats(false)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{completedLevels.length} / 12 completed</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedLevels.length / 12) * 100}%` }}
            />
          </div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {levels.map((level) => {
            const isCompleted = completedLevels.includes(level.id);
            const isHovered = hoveredLevel === level.id;

            return (
              <div
                key={level.id}
                onClick={() => onLevelSelect(level.id)}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`
                  relative cursor-pointer rounded-2xl p-5 border transition-all duration-300
                  ${isCompleted
                    ? 'bg-green-900/20 border-green-500/40 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                    : 'bg-black/40 border-blue-500/20 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20'}
                  ${isHovered ? 'scale-105' : 'scale-100'}
                  backdrop-blur-xl
                `}
              >
                {/* Completed badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3 text-green-400 text-lg">✓</div>
                )}

                {/* Level number */}
                <div className="text-xs text-gray-600 font-bold mb-1">LEVEL {level.id}</div>

                {/* Icon */}
                <div className="text-3xl mb-3">{level.icon}</div>

                {/* Title */}
                <h3 className={`font-black text-sm mb-1 ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                  {level.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-xs leading-relaxed">{level.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {completedLevels.length < 12 && (
            <button
              onClick={onCompleteAll}
              className="px-6 py-3 bg-black/40 border border-purple-500/30 hover:border-purple-400 text-gray-400 hover:text-white text-sm font-bold rounded-xl transition-all duration-300"
            >
              ⚡ Mark All Complete
            </button>
          )}
          {completedLevels.length > 0 && (
            <button
              onClick={onResetProgress}
              className="px-6 py-3 bg-black/40 border border-red-500/30 hover:border-red-400 text-gray-400 hover:text-red-400 text-sm font-bold rounded-xl transition-all duration-300"
            >
              🔄 Reset Progress
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default LevelSelector;