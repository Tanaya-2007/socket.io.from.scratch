import { useEffect } from 'react';

// This page handles the redirect from Google/GitHub OAuth
// URL will be: /oauth-success?token=xxx&username=yyy&avatar=zzz

function OAuthSuccess({ onLogin }) {
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const token    = params.get('token');
    const username = params.get('username');
    const avatar   = params.get('avatar');

    if (token && username) {
      // Pass auth data up to App
      onLogin({ token, username, avatar });
      // Clean URL
      window.history.replaceState({}, '', '/');
    } else {
      // No token — something went wrong
      window.location.href = '/';
    }
  }, [onLogin]);

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