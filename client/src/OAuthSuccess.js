import { useEffect, useState } from 'react';

function OAuthSuccess({ onLogin }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const token    = params.get('token');
    const username = decodeURIComponent(params.get('username') || '');
    const avatar   = decodeURIComponent(params.get('avatar')   || '');

    // ✅ Only process if token actually exists in URL
    if (token && username) {
      setStatus('success');
      // Small delay so user sees success message
      setTimeout(() => {
        onLogin({ token, username, avatar });
        window.history.replaceState({}, '', '/');
      }, 500);
    } else {
      // ✅ No token in URL → just redirect to home silently
      setStatus('error');
      window.history.replaceState({}, '', '/');
      window.location.href = '/';
    }
  }, []);

  if (status === 'error') return null; // ✅ show nothing while redirecting

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">⚡</div>
        <p className="text-white text-xl font-bold">Logging you in...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait</p>
      </div>
    </div>
  );
}

export default OAuthSuccess;