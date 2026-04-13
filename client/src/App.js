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

function App() {
  const [screen, setScreen] = useState(() =>
    window.location.pathname === '/oauth-success' ? 'oauth-success' : 'landing'
  );
  const [auth, setAuth] = useState(() => {
    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const avatar   = localStorage.getItem('avatar');
    return token ? { token, username, avatar } : null;
  });
  const [currentLevel, setCurrentLevel]       = useState(null);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedLevels')) || []; }
    catch { return []; }
  });
  const [isConnected, setIsConnected]         = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCongrats, setShowCongrats]       = useState(false);

  useEffect(() => {
    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => { socket.off('connect'); socket.off('disconnect'); };
  }, []);

  // If already logged in, skip landing
  useEffect(() => {
    if (auth && screen === 'landing') setScreen('levels');
  }, []);

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
    if (updated.length === 12) setTimeout(() => setShowCongrats(true), 700);
  };

  const handleResetProgress = () => {
    setCompletedLevels([]);
    localStorage.removeItem('completedLevels');
  };

  const handleCompleteAll = () => {
    const all = [1,2,3,4,5,6,7,8,9,10,11,12];
    setCompletedLevels(all);
    localStorage.setItem('completedLevels', JSON.stringify(all));
    setShowCongrats(true);
  };

  // ── Level map ─────────────────────────────────────────────
  const levelComponents = {
    1: Level1,  2: Level2,  3: Level3,  4: Level4,
    5: Level5,  6: Level6,  7: Level7,  8: Level8,
    9: Level9,  10: Level10, 11: Level11, 12: Level12,
  };

  const levelProps = {
    socket,
    isConnected,
    onBack: handleBack,
    isTransitioning,
    initialProgress: {},
    onProgressUpdate: () => {},
    onLevelComplete:  () => {},
    onComplete: () => {
      handleLevelComplete(currentLevel);
    }
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