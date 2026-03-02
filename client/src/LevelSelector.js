import React, { useState } from 'react';

function LandingPage({ onStart }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onStart();
    }, 300);
  };

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden flex items-center justify-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Same background as LevelSelector */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-500 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          
          {/* Logo/Title - Same style as LevelSelector */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text tracking-widest" 
                style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '0.15em' }}>
              SOCKET.IO
            </h1>
            <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full w-64 mx-auto animate-pulse" />
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-bold">
            Master Real-Time Web Development
          </p>
          <p className="text-base md:text-lg text-gray-500 mb-12">
            Learn Socket.IO through <span className="text-cyan-400 font-bold">12 interactive levels</span>.
            Build chat apps, multiplayer games, and production-ready applications.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-xl font-black text-blue-400 mb-1">12</div>
              <div className="text-sm text-gray-400">Levels</div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-xl font-black text-purple-400 mb-1">Hands-On</div>
              <div className="text-sm text-gray-400">Learning</div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-xl font-black text-cyan-400 mb-1">Track</div>
              <div className="text-sm text-gray-400">Progress</div>
            </div>
          </div>

          {/* Buttons - Same style as LevelSelector */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleStart}
              className="group px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg md:text-xl font-black rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/30 min-w-[200px]"
            >
              <span className="flex items-center justify-center gap-2">
                🚀 Start Learning
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>

            <button
              onClick={handleStart}
              className="px-8 md:px-12 py-4 md:py-5 bg-black/40 hover:bg-black/60 border-2 border-cyan-500/30 hover:border-cyan-500 text-white text-lg md:text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 min-w-[200px]"
            >
              🔑 Login
            </button>
          </div>

          {/* Footer note */}
          <p className="text-sm text-gray-600 mt-12">
            ✨ Free • Interactive • No signup required
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;