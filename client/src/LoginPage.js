import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]             = useState({ username: '', email: '', password: '' });
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');

    // Frontend validation
    if (isRegister) {
      if (!form.username.trim()) return setError('Username is required');
      if (!form.email.trim())    return setError('Email is required');
      if (!form.password.trim()) return setError('Password is required');
    } else {
      if (!form.email.trim())    return setError('Email is required');
      if (!form.password.trim()) return setError('Password is required');
    }

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
      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        if (res.status === 404) {
          setTimeout(() => { setIsRegister(true); setError(''); }, 2000);
        }
        return;
      }

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
          <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full w-48 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">{isRegister ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {/* Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-2xl">

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <a
              href="http://localhost:4000/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </a>
            <a
              href="http://localhost:4000/api/auth/github"
              className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Toggle tabs */}
          <div className="flex mb-6 bg-black/40 rounded-2xl p-1">
            {['Login', 'Register'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsRegister(!!i); setError(''); setForm({ username: '', email: '', password: '' }); }}
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
                  placeholder="Your display name"
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
              {error.includes('register') && (
                <p className="text-cyan-400 text-xs mt-1">↩️ Switching to Register tab...</p>
              )}
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