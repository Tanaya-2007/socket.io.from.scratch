// =====================================================
// LevelSelector.js - WITH PROGRESS INDICATORS
// =====================================================

import React from 'react';

function LevelSelector({ 
  onSelectLevel, 
  completedLevels = [], 
  currentLevel = 1,
  isLevelUnlocked,
  isTransitioning 
}) {
  
  const levels = [
    { num: 1, title: "Connection & Events", icon: "⚡", color: "blue" },
    { num: 2, title: "Rooms", icon: "🏠", color: "purple" },
    { num: 3, title: "Broadcasting", icon: "📡", color: "cyan" },
    { num: 4, title: "Namespaces", icon: "🌐", color: "orange" },
    { num: 5, title: "Acknowledgements", icon: "✅", color: "green" },
    { num: 6, title: "Error Handling", icon: "⚠️", color: "red" },
    { num: 7, title: "Middleware", icon: "🔐", color: "yellow" },
    { num: 8, title: "Typing Race", icon: "⌨️", color: "pink" },
    { num: 9, title: "Volatile/Binary", icon: "⚙️", color: "indigo" },
    { num: 10, title: "Database", icon: "🗄️", color: "teal" },
    { num: 11, title: "Scaling", icon: "📈", color: "violet" },
    { num: 12, title: "Redis", icon: "🔴", color: "rose" }
  ];

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="container mx-auto px-4 py-12">
        
        {/* Header with Progress */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">
            Socket.IO <span className="text-blue-500">Mastery</span>
          </h1>
          
          {/* Overall Progress */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-400">OVERALL PROGRESS</span>
              <span className="text-2xl font-black text-blue-500">
                {Math.round((completedLevels.length / 12) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500"
                style={{ width: `${(completedLevels.length / 12) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {completedLevels.length} of 12 levels completed
            </p>
          </div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {levels.map((level) => {
            const isCompleted = completedLevels.includes(level.num);
            const isUnlocked = isLevelUnlocked(level.num);
            const isCurrent = level.num === currentLevel;
            
            return (
              <button
                key={level.num}
                onClick={() => isUnlocked && onSelectLevel(level.num)}
                disabled={!isUnlocked}
                className={`
                  group relative bg-black/80 backdrop-blur-xl border-2 rounded-3xl p-8
                  transition-all duration-300 text-left
                  ${isUnlocked 
                    ? `border-${level.color}-500/30 hover:border-${level.color}-400 hover:scale-105 hover:shadow-2xl hover:shadow-${level.color}-500/30 cursor-pointer` 
                    : 'border-gray-700/30 opacity-50 cursor-not-allowed'
                  }
                  ${isCurrent && isUnlocked ? 'ring-4 ring-yellow-500/50' : ''}
                `}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isCompleted ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>✓</span> DONE
                    </div>
                  ) : isCurrent && isUnlocked ? (
                    <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>▶</span> CURRENT
                    </div>
                  ) : !isUnlocked ? (
                    <div className="bg-gray-500/20 border border-gray-500 text-gray-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>🔒</span> LOCKED
                    </div>
                  ) : null}
                </div>

                {/* Level Content */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`text-6xl ${isUnlocked ? 'group-hover:scale-110' : 'grayscale'} transition-transform`}>
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-500 mb-1">LEVEL {level.num}</div>
                    <h3 className={`text-2xl font-black bg-gradient-to-r ${
                      isUnlocked 
                        ? `from-${level.color}-400 to-${level.color}-600` 
                        : 'from-gray-500 to-gray-600'
                    } bg-clip-text text-transparent`}>
                      {level.title}
                    </h3>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between mt-6">
                  {!isUnlocked ? (
                    <p className="text-xs text-gray-500">
                      Complete Level {level.num - 1} first
                    </p>
                  ) : (
                    <div className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all
                      ${isUnlocked 
                        ? `bg-${level.color}-500/10 border-${level.color}-500/30 text-${level.color}-400 group-hover:bg-${level.color}-500 group-hover:text-white` 
                        : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                      }`}
                    >
                      {isCompleted ? 'Review →' : isCurrent ? 'Continue →' : 'Start →'}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset Button (for testing) */}
        {completedLevels.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                if (window.confirm('Reset ALL progress? This cannot be undone!')) {
                  // Call resetProgress from context
                  window.location.reload();
                }
              }}
              className="px-6 py-3 bg-red-500/20 border border-red-500 text-red-400 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
            >
              🔄 Reset Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LevelSelector;