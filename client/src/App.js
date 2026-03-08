import { useState, useEffect } from 'react';
import io from 'socket.io-client';
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

function App() {
  const [screen, setScreen] = useState(() =>
    window.location.pathname === '/oauth-success' ? 'oauth-success' : 'landing'
  );
  const [auth, setAuth]                   = useState(null);
  const [currentLevel, setCurrentLevel]   = useState(null);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('completedLevels')) || [];
    } catch { return []; }
  });
  const [isConnected, setIsConnected]         = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCongrats, setShowCongrats]       = useState(false);

  useEffect(() => {
    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => { socket.off('connect'); socket.off('disconnect'); };
  }, []);

  // ── Auth ──────────────────────────────────────────────────
  const handleLogin = (authData) => {
    setAuth(authData);
    window.history.replaceState({}, '', '/'); // clean /oauth-success from URL
    transitionTo('levels');
  };

  const handleLogout = () => {
    setAuth(null);
    transitionTo('landing');
  };

  // ── Navigation ────────────────────────────────────────────
  const transitionTo = (target, level = null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen(target);
      setCurrentLevel(level);
      setIsTransitioning(false);
    }, 300);
  };

  const handleLevelSelect = (levelNum) => {
    if (!auth) { transitionTo('login'); return; }
    transitionTo('level', levelNum);
  };

  const handleBack = () => transitionTo('levels');

  const handleLevelComplete = (levelNum) => {
    const updated = completedLevels.includes(levelNum)
      ? completedLevels
      : [...completedLevels, levelNum];
    setCompletedLevels(updated);
    localStorage.setItem('completedLevels', JSON.stringify(updated));
    setTimeout(() => transitionTo('levels'), 400);
    if (levelNum === 12) setTimeout(() => setShowCongrats(true), 700);
  };

  const handleResetProgress = () => {
    setCompletedLevels([]);
    localStorage.removeItem('completedLevels');
  };

  // ── Level map ─────────────────────────────────────────────
  const levelComponents = {
    1: Level1,  2: Level2,  3: Level3,  4: Level4,
    5: Level5,  6: Level6,  7: Level7,  8: Level8,
    9: Level9,  10: Level10, 11: Level11, 12: Level12,
  };

  const levelProps = {
    socket, isConnected,
    onBack: handleBack,
    onComplete: handleLevelComplete,
    isTransitioning,
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
      ? <LevelComponent {...levelProps} currentLevel={currentLevel} />
      : <div>Level not found</div>;
  }

  return (
    <LevelSelector
      onLevelSelect={handleLevelSelect}
      completedLevels={completedLevels}
      onResetProgress={handleResetProgress}
      isConnected={isConnected}
      isTransitioning={isTransitioning}
      showCongrats={showCongrats}
      setShowCongrats={setShowCongrats}
      auth={auth}
      onLogout={handleLogout}
    />
  );
}

export default App;