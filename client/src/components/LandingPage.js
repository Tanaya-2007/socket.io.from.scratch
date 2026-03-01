import React, { useState } from 'react';

function LandingPage({ onStart }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onStart();
    }, 300);
  };

  const features = [
    {
      icon: '🎮',
      title: '12 Epic Levels',
      description: 'Unlock progressively challenging Socket.IO missions',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⚔️',
      title: 'Battle-Tested Skills',
      description: 'Build real apps, not just follow tutorials',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏆',
      title: 'Earn Achievements',
      description: 'Complete quizzes and unlock expert badges',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: '⚡',
      title: 'Boss Level Ready',
      description: 'Master scaling with Redis & production secrets',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const skills = [
    { icon: '🔌', text: 'WebSocket Power-Ups', color: 'text-blue-400', level: 'LVL 1-3' },
    { icon: '🏰', text: 'Room Conquest', color: 'text-purple-400', level: 'LVL 4-6' },
    { icon: '📡', text: 'Broadcasting Mastery', color: 'text-cyan-400', level: 'LVL 7-8' },
    { icon: '🛡️', text: 'Security Shield', color: 'text-green-400', level: 'LVL 9-10' },
    { icon: '💾', text: 'Database Dungeon', color: 'text-yellow-400', level: 'LVL 11' },
    { icon: '⚡', text: 'Redis Final Boss', color: 'text-red-400', level: 'LVL 12' }
  ];

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Gaming Background with Grid */}
      <div className="fixed inset-0 z-0">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(#00f2ff 1px, transparent 1px), linear-gradient(90deg, #00f2ff 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
        
        {/* Glowing orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating energy particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: '0 0 10px 2px rgba(34, 211, 238, 0.5)'
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Gaming Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-full mb-8 shadow-lg shadow-cyan-500/30 animate-bounce">
              <span className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></span>
              <span className="text-sm font-black text-cyan-400 tracking-wider">⚡ LEVEL UP YOUR SKILLS</span>
            </div>

            {/* Epic Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="inline-block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse" style={{ textShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}>
                SOCKET.IO
              </span>
              <br />
              <span className="inline-block text-white mt-4" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}>
                MASTERY QUEST
              </span>
            </h1>

            {/* Subtitle with gaming vibe */}
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              <span className="text-cyan-400 font-black">CONQUER 12 LEVELS</span> of real-time development.
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Build chat systems • Multiplayer games • Production apps
            </p>

            {/* Gaming CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleStart}
                className="group relative px-10 py-5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white text-xl font-black rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-cyan-500/50 min-w-[250px] border-2 border-cyan-400/50"
                style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  🎮 START QUEST
                  <span className="text-2xl group-hover:translate-x-2 transition-transform">▶</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              </button>

              <button
                onClick={handleStart}
                className="px-10 py-5 bg-black/60 hover:bg-black/80 border-2 border-cyan-500/50 hover:border-cyan-400 text-white text-xl font-black rounded-2xl transition-all duration-300 min-w-[250px] shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
              >
                🔑 LOGIN
              </button>
            </div>

            {/* Gaming Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 rounded-2xl p-6 shadow-lg shadow-blue-500/30">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black border-2 border-blue-300 shadow-lg">
                  LEVELS
                </div>
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">12</div>
                <div className="text-sm text-gray-300 font-bold uppercase tracking-wider">Missions</div>
              </div>
              <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-2xl p-6 shadow-lg shadow-purple-500/30">
                <div className="absolute -top-3 -right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-black border-2 border-purple-300 shadow-lg">
                  TASKS
                </div>
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">36+</div>
                <div className="text-sm text-gray-300 font-bold uppercase tracking-wider">Challenges</div>
              </div>
              <div className="relative bg-gradient-to-br from-cyan-500/20 to-green-500/20 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-lg shadow-cyan-500/30">
                <div className="absolute -top-3 -right-3 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-black border-2 border-cyan-300 shadow-lg">
                  QUIZZES
                </div>
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">60+</div>
                <div className="text-sm text-gray-300 font-bold uppercase tracking-wider">Boss Fights</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Tree Section */}
        <div className="container mx-auto px-6 py-20 border-t-2 border-cyan-500/30">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                YOUR <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">SKILL TREE</span>
              </h2>
              <p className="text-lg text-gray-400">Unlock abilities as you progress through levels</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border-2 border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40"
                >
                  {/* Level badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-black border-2 border-cyan-300 shadow-lg">
                    {skill.level}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-5xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">{skill.icon}</div>
                    <div>
                      <p className={`text-base font-black ${skill.color} group-hover:text-white transition-colors uppercase tracking-wide`}>
                        {skill.text}
                      </p>
                    </div>
                  </div>

                  {/* XP bar effect */}
                  <div className="mt-4 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover:w-full w-0 transition-all duration-1000" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Power-Ups Section */}
        <div className="container mx-auto px-6 py-20 border-t-2 border-purple-500/30">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                LEVEL <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">POWER-UPS</span>
              </h2>
              <p className="text-lg text-gray-400">Epic features that make you a Socket.IO champion</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl border-2 border-white/20 hover:border-cyan-400 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 overflow-hidden"
                >
                  {/* Animated background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="text-7xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-wide">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Scan line effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent animate-scan" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Boss CTA */}
        <div className="container mx-auto px-6 py-20 border-t-2 border-green-500/30">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Epic glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl -z-10" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase">
              READY TO <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">LEVEL UP?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-bold">
              🔥 Join the elite ranks of Socket.IO masters
            </p>
            
            <button
              onClick={handleStart}
              className="group relative px-12 py-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white text-2xl font-black rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-cyan-500/50 border-4 border-cyan-400/50"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-wider">
                ⚡ BEGIN QUEST ⚡
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            </button>

            <p className="text-sm text-gray-400 mt-6 font-bold">
              ✨ FREE • NO SIGNUP • INSTANT ACCESS
            </p>
          </div>
        </div>

        {/* Gaming Footer */}
        <div className="container mx-auto px-6 py-8 border-t-2 border-cyan-500/20">
          <div className="text-center text-gray-400 text-sm">
            <p className="font-bold">⚡ CRAFTED WITH ❤️ BY SOCKET.IO WARRIORS</p>
            <p className="mt-2">© 2026 Socket.IO Mastery Quest • ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;