import React from 'react';
import { useProgress } from '../contexts/ProgressContext';

function LevelSelector({ onSelectLevel, isTransitioning }) {
  const { 
    progress, 
    isLevelUnlocked, 
    resetProgress 
  } = useProgress();
  
  const completedLevels = progress?.completedLevels || [];
  const currentLevel = progress?.currentLevel || 1;

  const levels = [
    {
      num: 1,
      title: "Connection & Events",
      description: "Learn socket basics & real-time communication",
      icon: "⚡",
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
      border: "border-blue-500/30 hover:border-blue-400",
      shadow: "hover:shadow-blue-500/30",
      bg: "bg-blue-500/10 group-hover:bg-blue-500",
      tags: ["Basics", "Events", "Connection"]
    },
    {
      num: 2,
      title: "Rooms",
      description: "Group users into isolated spaces",
      icon: "🏠",
      gradient: "from-purple-500 via-pink-500 to-purple-600",
      border: "border-purple-500/30 hover:border-purple-400",
      shadow: "hover:shadow-purple-500/30",
      bg: "bg-purple-500/10 group-hover:bg-purple-500",
      tags: ["Rooms", "Groups", "Isolation"]
    },
    {
      num: 3,
      title: "Broadcasting",
      description: "Send messages to multiple users at once",
      icon: "📡",
      gradient: "from-cyan-500 via-blue-500 to-cyan-600",
      border: "border-cyan-500/30 hover:border-cyan-400",
      shadow: "hover:shadow-cyan-500/30",
      bg: "bg-cyan-500/10 group-hover:bg-cyan-500",
      tags: ["Broadcast", "io.emit", "Everyone"]
    },
    {
      num: 4,
      title: "Namespaces",
      description: "Multiple apps on one server with isolated namespaces",
      icon: "🌐",
      gradient: "from-orange-500 via-amber-500 to-orange-600",
      border: "border-orange-500/30 hover:border-orange-400",
      shadow: "hover:shadow-orange-500/30",
      bg: "bg-orange-500/10 group-hover:bg-orange-500",
      tags: ["Namespaces", "io.of()", "Multi-app"]
    },
    {
      num: 5,
      title: "Acknowledgements",
      description: "Get confirmation messages were received",
      icon: "✅",
      gradient: "from-green-500 via-emerald-500 to-green-600",
      border: "border-green-500/30 hover:border-green-400",
      shadow: "hover:shadow-green-500/30",
      bg: "bg-green-500/10 group-hover:bg-green-500",
      tags: ["Callbacks", "Confirmation", "ACK"]
    },
    {
      num: 6,
      title: "Error Handling",
      description: "Handle disconnections & reconnection gracefully",
      icon: "⚠️",
      gradient: "from-red-500 via-orange-500 to-red-600",
      border: "border-red-500/30 hover:border-red-400",
      shadow: "hover:shadow-red-500/30",
      bg: "bg-red-500/10 group-hover:bg-red-500",
      tags: ["Errors", "Reconnect", "Resilience"]
    },
    {
      num: 7,
      title: "Middleware",
      description: "Add authentication & authorization to sockets",
      icon: "🔐",
      gradient: "from-yellow-500 via-amber-500 to-yellow-600",
      border: "border-yellow-500/30 hover:border-yellow-400",
      shadow: "hover:shadow-yellow-500/30",
      bg: "bg-yellow-500/10 group-hover:bg-yellow-500",
      tags: ["Auth", "JWT", "Security"]
    },
    {
      num: 8,
      title: "Typing Race Game",
      description: "Build a real-time multiplayer typing race",
      icon: "⌨️",
      gradient: "from-pink-500 via-rose-500 to-pink-600",
      border: "border-pink-500/30 hover:border-pink-400",
      shadow: "hover:shadow-pink-500/30",
      bg: "bg-pink-500/10 group-hover:bg-pink-500",
      tags: ["Game", "Multiplayer", "Real-time"]
    },
    {
      num: 9,
      title: "Volatile & Binary",
      description: "Send data without persistence & binary payloads",
      icon: "⚙️",
      gradient: "from-indigo-500 via-purple-500 to-indigo-600",
      border: "border-indigo-500/30 hover:border-indigo-400",
      shadow: "hover:shadow-indigo-500/30",
      bg: "bg-indigo-500/10 group-hover:bg-indigo-500",
      tags: ["Volatile", "Binary", "Performance"]
    },
    {
      num: 10,
      title: "Database Integration",
      description: "Persist messages & data with MongoDB",
      icon: "🗄️",
      gradient: "from-teal-500 via-cyan-500 to-teal-600",
      border: "border-teal-500/30 hover:border-teal-400",
      shadow: "hover:shadow-teal-500/30",
      bg: "bg-teal-500/10 group-hover:bg-teal-500",
      tags: ["MongoDB", "Database", "Persistence"]
    },
    {
      num: 11,
      title: "Scaling",
      description: "Scale Socket.IO across multiple servers",
      icon: "📈",
      gradient: "from-violet-500 via-purple-500 to-violet-600",
      border: "border-violet-500/30 hover:border-violet-400",
      shadow: "hover:shadow-violet-500/30",
      bg: "bg-violet-500/10 group-hover:bg-violet-500",
      tags: ["Scaling", "Load Balance", "Production"]
    },
    {
      num: 12,
      title: "Redis Adapter",
      description: "Use Redis for horizontal scaling",
      icon: "🔴",
      gradient: "from-rose-500 via-red-500 to-rose-600",
      border: "border-rose-500/30 hover:border-rose-400",
      shadow: "hover:shadow-rose-500/30",
      bg: "bg-rose-500/10 group-hover:bg-rose-500",
      tags: ["Redis", "Adapter", "Multi-server"]
    }
  ];

  // Handle complete all levels (for testing)
  const handleCompleteAll = () => {
    if (window.confirm('Mark all levels as complete? (For testing only)')) {
      // This would need to be implemented in ProgressContext
      alert('Feature coming soon! Use individual levels for now.');
    }
  };

  // Handle reset progress
  const handleReset = () => {
    if (window.confirm('⚠️ Reset ALL progress? This cannot be undone!')) {
      resetProgress();
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-4">
            Socket.IO <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent">Mastery</span>
          </h1>
          <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8">
            Master real-time web development step by step 🚀
          </p>

          {/* Overall Progress Bar */}
          <div className="max-w-3xl mx-auto mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs md:text-sm font-bold text-gray-400">OVERALL PROGRESS</span>
              <span className="text-xl md:text-3xl font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {Math.round((completedLevels.length / 12) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 md:h-4 overflow-hidden border border-white/20">
              <div 
                className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 h-full transition-all duration-1000 ease-out"
                style={{ width: `${(completedLevels.length / 12) * 100}%` }}
              >
                <div className="w-full h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-2">
              🏆 {completedLevels.length} of 12 levels completed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            <button
              onClick={handleCompleteAll}
              className="px-4 md:px-6 py-2 md:py-3 bg-green-500/20 border-2 border-green-500 text-green-400 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all text-sm md:text-base"
            >
              ✓ Complete All Levels
            </button>
            <button
              onClick={handleReset}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-500/20 border-2 border-red-500 text-red-400 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all text-sm md:text-base"
            >
              🔄 Reset Progress
            </button>
          </div>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
          {levels.map((level) => {
            const isCompleted = completedLevels.includes(level.num);
            const isUnlocked = isLevelUnlocked(level.num);
            const isCurrent = level.num === currentLevel && !isCompleted;

            return (
              <button
                key={level.num}
                onClick={() => isUnlocked && onSelectLevel(level.num)}
                disabled={!isUnlocked}
                className={`
                  group relative bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-xl 
                  border-2 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 
                  transition-all duration-300 text-left
                  ${isUnlocked 
                    ? `${level.border} hover:scale-105 hover:shadow-2xl ${level.shadow} cursor-pointer` 
                    : 'border-gray-700/30 opacity-50 cursor-not-allowed grayscale'
                  }
                  ${isCurrent ? 'ring-4 ring-yellow-500/50 animate-pulse' : ''}
                  ${isCompleted ? 'ring-2 ring-green-500/50' : ''}
                `}
              >
                {/* Status Badge - Top Right */}
                <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10">
                  {isCompleted ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>✓</span> DONE
                    </div>
                  ) : isCurrent ? (
                    <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                      <span>▶</span> CURRENT
                    </div>
                  ) : !isUnlocked ? (
                    <div className="bg-gray-500/20 border border-gray-500 text-gray-400 px-2 md:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span>🔒</span> LOCKED
                    </div>
                  ) : null}
                </div>

                {/* Level Content */}
                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className={`text-4xl md:text-5xl lg:text-6xl ${isUnlocked ? 'group-hover:scale-110' : ''} transition-transform`}>
                    {level.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-500 mb-1">LEVEL {level.num}</div>
                    <h3 className={`text-lg md:text-xl lg:text-2xl font-black mb-1 md:mb-2 bg-gradient-to-r ${level.gradient} bg-clip-text text-transparent`}>
                      {level.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-tight">
                      {level.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                  {level.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 md:px-3 md:py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {!isUnlocked && `Complete Level ${level.num - 1} first`}
                    {isUnlocked && !isCompleted && '🎯 3 Tasks • 📝 Quiz'}
                    {isCompleted && '✓ Completed'}
                  </div>
                  {isUnlocked && (
                    <div className={`px-3 md:px-4 py-1.5 md:py-2 border rounded-xl text-xs md:text-sm font-bold transition-all ${level.bg} border-white/20 text-white`}>
                      {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'} →
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="text-center mt-8 md:mt-12 text-xs md:text-sm text-gray-500">
          <p>💾 Progress saves automatically • 🔒 Levels unlock sequentially</p>
        </div>
      </div>
    </div>
  );
}

export default LevelSelector;