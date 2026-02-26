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
      icon: '⚡',
      title: '12 Interactive Levels',
      description: 'Progress from basics to advanced topics step-by-step',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🎯',
      title: 'Hands-On Learning',
      description: 'Build real Socket.IO apps, not just theory',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏆',
      title: 'Track Your Progress',
      description: 'Complete quizzes and unlock achievements',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: '🚀',
      title: 'Production Ready',
      description: 'Learn scaling, security, and best practices',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const skills = [
    { icon: '🔌', text: 'Real-time WebSocket connections', color: 'text-blue-400' },
    { icon: '🏠', text: 'Room-based communication', color: 'text-purple-400' },
    { icon: '📡', text: 'Broadcasting & namespaces', color: 'text-cyan-400' },
    { icon: '🛡️', text: 'Authentication & middleware', color: 'text-green-400' },
    { icon: '🗄️', text: 'Database integration', color: 'text-yellow-400' },
    { icon: '⚡', text: 'Redis scaling for millions', color: 'text-red-400' }
  ];

  return (
    <div className={`min-h-screen bg-[#0a0f1e] text-white relative overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
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

      <div className="relative z-10">
        
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full mb-8 animate-bounce">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold text-blue-400">Interactive Learning Platform</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Master Socket.IO
              </span>
              <br />
              <span className="text-white">From Zero to Hero</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Learn real-time web development through <span className="text-cyan-400 font-bold">12 interactive levels</span>.
              Build chat apps, multiplayer games, and production-ready applications.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleStart}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg font-black rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/30 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🚀 Start Learning
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={handleStart}
                className="px-8 py-4 bg-black/40 hover:bg-black/60 border-2 border-white/20 hover:border-white/40 text-white text-lg font-bold rounded-2xl transition-all duration-300 min-w-[200px]"
              >
                🔑 Login
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">12</div>
                <div className="text-sm text-gray-400 font-bold">Levels</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">36+</div>
                <div className="text-sm text-gray-400 font-bold">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">60+</div>
                <div className="text-sm text-gray-400 font-bold">Quizzes</div>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Learn Section */}
        <div className="container mx-auto px-6 py-20 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                What You'll <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Master</span>
              </h2>
              <p className="text-lg text-gray-400">Build production-ready real-time applications</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="group bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">{skill.icon}</div>
                    <div>
                      <p className={`text-base font-bold ${skill.color} group-hover:text-white transition-colors`}>
                        {skill.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-20 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">This Course?</span>
              </h2>
              <p className="text-lg text-gray-400">Everything you need to become a Socket.IO expert</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-black/60 backdrop-blur-xl border-2 border-white/10 hover:border-white/20 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="container mx-auto px-6 py-20 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Start Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Journey?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of developers mastering real-time web development
            </p>
            
            <button
              onClick={handleStart}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xl font-black rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/30"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                🎮 Begin Your Quest
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </button>

            <p className="text-sm text-gray-500 mt-6">
              ✨ Free • No credit card required • Start immediately
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="container mx-auto px-6 py-8 border-t border-white/10">
          <div className="text-center text-gray-500 text-sm">
            <p>Built with ❤️ using Socket.IO & React</p>
            <p className="mt-2">© 2026 Socket.IO Mastery. All rights reserved.</p>
          </div>
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