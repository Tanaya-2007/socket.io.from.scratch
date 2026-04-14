import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ProgressProvider } from './contexts/ProgressContext';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import LevelSelector from './LevelSelector';
import OAuthSuccess from './OAuthSuccess';
import Level1 from './levels/Level1';
import Level2 from './levels/Level2';
import Level3 from './levels/Level3';
import Level4 from './levels/Level4';
import Level5 from './levels/Level5';
import Level6 from './levels/Level6';
import Level7 from './levels/Level7';
import Level8 from './levels/Level8';
import Level9 from './levels/Level9';
import Level10 from './levels/Level10';
import Level11 from './levels/Level11';
import Level12 from './levels/Level12';

const socket = io('http://localhost:4000');
const API = 'http://localhost:4000';

function App() {
  const [screen, setScreen] = useState(() => {
    if (window.location.pathname === '/oauth-success') return 'oauth-success';
    return sessionStorage.getItem('currentScreen') || 'landing';
  });
  const [currentLevel, setCurrentLevel] = useState(() =>
    parseInt(sessionStorage.getItem('currentLevel')) || null
  );
  const [auth, setAuth] = useState(() => {
    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const avatar   = localStorage.getItem('avatar');
    return token ? { token, username, avatar } : null;
  });
  const [completedLevels, setCompletedLevels] = useState([]);
  const [isConnected, setIsConnected]         = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCongrats, setShowCongrats]       = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  // ── Socket ────────────────────────────────────────────────
  useEffect(() => {
    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => { socket.off('connect'); socket.off('disconnect'); };
  }, []);

  // ── Skip landing if already logged in ─────────────────────
  useEffect(() => {
    if (auth && screen === 'landing') setScreen('levels');
  }, []);

  // ── Load progress from DB when auth changes ───────────────
  useEffect(() => {
    if (auth?.token) {
      loadProgressFromDB(auth.token);
    } else {
      // Not logged in — use localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('completedLevels')) || [];
        setCompletedLevels(saved);
      } catch { setCompletedLevels([]); }
    }
  }, [auth]);

  // ── API helpers ───────────────────────────────────────────
  const loadProgressFromDB = async (token) => {
    setProgressLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCompletedLevels(data.progress || []);
        console.log(`📊 Loaded progress for user: ${data.progress?.length || 0} levels`);
      }
    } catch (err) {
      console.error('❌ Failed to load progress:', err);
      // Fall back to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('completedLevels')) || [];
        setCompletedLevels(saved);
      } catch { setCompletedLevels([]); }
    } finally {
      setProgressLoading(false);
    }
  };

  const saveProgressToDB = async (token, levels) => {
    try {
      await fetch(`${API}/api/auth/progress`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completedLevels: levels })
      });
      console.log(`💾 Progress saved: ${levels.length} levels`);
    } catch (err) {
      console.error('❌ Failed to save progress:', err);
    }
  };

  // ── Auth ──────────────────────────────────────────────────
  const handleLogin = (authData) => {
    localStorage.setItem('token',    authData.token);
    localStorage.setItem('username', authData.username || '');
    localStorage.setItem('avatar',   authData.avatar   || '');
    setAuth(authData);
    window.history.replaceState({}, '', '/');
    transitionTo('levels');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    setAuth(null);
    setCompletedLevels([]);
    sessionStorage.removeItem('currentScreen');
    sessionStorage.removeItem('currentLevel');
    sessionStorage.removeItem('congratsShown');
    transitionTo('landing');
  };

  // ── Navigation ────────────────────────────────────────────
  const transitionTo = (target, level = null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen(target);
      setCurrentLevel(level);
      sessionStorage.setItem('currentScreen', target);
      if (level) sessionStorage.setItem('currentLevel', level);
      else sessionStorage.removeItem('currentLevel');
      setIsTransitioning(false);
    }, 300);
  };

  const handleLevelSelect = (levelNum) => {
    if (!auth) { transitionTo('login'); return; }
    transitionTo('level', levelNum);
  };

  const handleBack = () => transitionTo('levels');

  // ── Level Complete ────────────────────────────────────────
  const handleLevelComplete = (levelNum) => {
    const updated = completedLevels.includes(levelNum)
      ? completedLevels
      : [...completedLevels, levelNum];

    setCompletedLevels(updated);

    // Save to DB if logged in, else localStorage
    if (auth?.token) {
      saveProgressToDB(auth.token, updated);
    } else {
      localStorage.setItem('completedLevels', JSON.stringify(updated));
    }

    setTimeout(() => transitionTo('levels'), 400);
    if (updated.length === 12) setTimeout(() => setShowCongrats(true), 700);
  };

  const handleResetProgress = () => {
    setCompletedLevels([]);
    localStorage.removeItem('completedLevels');
    if (auth?.token) saveProgressToDB(auth.token, []);
  };

  const handleCompleteAll = () => {
    const all = [1,2,3,4,5,6,7,8,9,10,11,12];
    setCompletedLevels(all);
    if (auth?.token) saveProgressToDB(auth.token, all);
    else localStorage.setItem('completedLevels', JSON.stringify(all));
    setShowCongrats(true);
  };

  // ── Level map ─────────────────────────────────────────────
  const levelComponents = {
    1: Level1,  2: Level2,  3: Level3,  4: Level4,
    5: Level5,  6: Level6,  7: Level7,  8: Level8,
    9: Level9, 10: Level10, 11: Level11, 12: Level12,
  };

  const levelProps = {
    socket,
    isConnected,
    onBack: handleBack,
    isTransitioning,
    initialProgress: {},
    onProgressUpdate: () => {},
    onLevelComplete:  () => {},
    onComplete: () => handleLevelComplete(currentLevel)
  };

  // ── Screens ───────────────────────────────────────────────
  if (screen === 'oauth-success')
    return <OAuthSuccess onLogin={handleLogin} />;

  if (screen === 'landing')
    return (
      <LandingPage
        onStart={() => auth ? transitionTo('levels') : transitionTo('login')}
        onLogin={() => transitionTo('login')}
      />
    );

  if (screen === 'login')
    return <LoginPage onLogin={handleLogin} />;

  if (screen === 'level' && currentLevel) {
    const LevelComponent = levelComponents[currentLevel];
    return LevelComponent
      ? (
        <ProgressProvider>
          <LevelComponent {...levelProps} currentLevel={currentLevel} />
        </ProgressProvider>
      )
      : <div>Level not found</div>;
  }

  // Loading state while fetching progress
  if (progressLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚡</div>
          <p className="text-white text-xl font-bold">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <ProgressProvider>
      <LevelSelector
        onLevelSelect={handleLevelSelect}
        completedLevels={completedLevels}
        onResetProgress={handleResetProgress}
        isConnected={isConnected}
        isTransitioning={isTransitioning}
        showCongrats={showCongrats}
        setShowCongrats={setShowCongrats}
        onCompleteAll={handleCompleteAll}
        auth={auth}
        onLogout={handleLogout}
      />
    </ProgressProvider>
  );
}

export default App;