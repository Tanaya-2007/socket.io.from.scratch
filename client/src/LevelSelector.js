import React from 'react';

function LevelSelector({ isConnected, onSelectLevel, isTransitioning }) {
  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-8 md:mb-12">
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">⚡</div>
            <h1 className="text-4xl md:text-7xl font-black mb-3 md:mb-4">
              <span className="text-white">SOCKET</span>
              <span className="text-blue-500">/</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">MATRIX</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 mb-4 md:mb-6">Master Real-Time Communication</p>
            
            <div className={`inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border-2 ${
              isConnected 
                ? 'bg-green-500/20 border-green-500 text-green-400' 
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm md:text-base font-bold">{isConnected ? 'SERVER ONLINE' : 'SERVER OFFLINE'}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            {/* Level 1 */}
            <button
              onClick={() => onSelectLevel(1)}
              className="group relative bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-blue-400 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">🔌</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-blue-400 mb-1 md:mb-2">LEVEL 1</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Connection</h3>
                  <p className="text-sm md:text-lg text-gray-400">WebSockets, emit events, real-time responses</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-blue-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

            {/* Level 2 */}
            <button
              onClick={() => onSelectLevel(2)}
              className="group relative bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-purple-400 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">🏠</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-purple-400 mb-1 md:mb-2">LEVEL 2</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Rooms</h3>
                  <p className="text-sm md:text-lg text-gray-400">Private groups like Kahoot, Discord, Zoom</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-purple-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

             {/* Level 3 */}
            <button
              onClick={() => onSelectLevel(3)}
              className="group relative bg-black/60 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-cyan-400 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">📡</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-cyan-400 mb-1 md:mb-2">LEVEL 3</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Broadcast</h3>
                  <p className="text-sm md:text-lg text-gray-400">Send to everyone or everyone except yourself</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-cyan-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

            {/* Level 4 */}
          <button
            onClick={() => onSelectLevel(4)}
            className="group relative bg-black/60 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-cyan-400 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 text-left overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">🌐</div>
              <div className="mb-4 md:mb-6">
                <div className="text-xs md:text-sm font-bold text-cyan-400 mb-1 md:mb-2">LEVEL 4</div>
                <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Namespaces</h3>
                <p className="text-sm md:text-lg text-gray-400">Separate apps on one server - complete isolation</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-cyan-400 font-bold text-sm md:text-base">
                <span>Start Learning</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </button>

          {/* Level 5 */}

          <button
              onClick={() => onSelectLevel(5)}
              className="group relative bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-blue-400 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">🔌</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-blue-400 mb-1 md:mb-2">LEVEL 5</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Acknowledgements & Callbacks</h3>
                  <p className="text-sm md:text-lg text-gray-400">WebSockets, emit events, real-time responses</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-blue-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

              {/* LEVEL 6 */}
              <button
              onClick={() => onSelectLevel(6)}
              className="group relative bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-purple-400 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">⚠️</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-purple-400 mb-1 md:mb-2">LEVEL 6</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Error Handling</h3>
                  <p className="text-sm md:text-lg text-gray-400">Handle disconnections & auto-reconnect gracefully</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-purple-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

            {/* Level 7 */}
            <button
              onClick={() => onSelectLevel(7)}
              className="group relative bg-black/60 backdrop-aqua-xl border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-cyan-400 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">🛡️</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-cyan-400 mb-1 md:mb-2">LEVEL 7</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Middleware</h3>
                  <p className="text-sm md:text-lg text-gray-400">Guard your connections! Run code BEFORE accepting or rejecting connections.</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-cyan-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>
          
          {/* Level 8 */}
          <button
              onClick={() => onSelectLevel(8)}
              className="group relative bg-black/60 backdrop-aqua-xl border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-cyan-400 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">🎮</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-cyan-400 mb-1 md:mb-2">LEVEL 8</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Custom Events</h3>
                  <p className="text-sm md:text-lg text-gray-400">Create YOUR own events with any name! Not limited to 'message' anymore.</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-cyan-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

            {/* Level 8 */}
          <button
              onClick={() => onSelectLevel(9)}
              className="group relative bg-black/60 backdrop-aqua-xl border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10 hover:border-cyan-400 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-5xl md:text-6xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">🎮</div>
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-bold text-cyan-400 mb-1 md:mb-2">LEVEL 9</div>
                  <h3 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 text-white">Custom Events</h3>
                  <p className="text-sm md:text-lg text-gray-400">Create YOUR own events with any name! Not limited to 'message' anymore.</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-cyan-400 font-bold text-sm md:text-base">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelSelector;