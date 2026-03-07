import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]             = useState({ username: '', email: '', password: '' });
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const url  = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { username: form.username, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res  = await fetch(`http://localhost:4000${url}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Something went wrong');

      // Store token in memory (passed up to App)
      onLogin({ token: data.token, username: data.username });
    } catch {
      setError('Cannot connect to server. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center relative overflow-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text tracking-widest mb-2">
            SOCKET.IO
          </h1>
          <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full w-48 mx-auto animate-pulse mb-4" />
          <p className="text-gray-400 text-sm">{isRegister ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {/* Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-2xl">

          {/* Toggle tabs */}
          <div className="flex mb-8 bg-black/40 rounded-2xl p-1">
            {['Login', 'Register'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsRegister(!!i); setError(''); }}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                  isRegister === !!i
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="cooluser123"
                  className="w-full bg-black/50 border border-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-black/50 border border-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-black/50 border border-blue-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/20"
          >
            {loading ? '⏳ Please wait...' : isRegister ? '🚀 Create Account' : '🔑 Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;