import { useState } from 'react';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import LevelSelector from './LevelSelector';

function App() {
  const [screen, setScreen] = useState('landing'); // 'landing' | 'login' | 'levels'
  const [auth, setAuth]     = useState(null); // { token, username }

  const handleLogin = (authData) => {
    setAuth(authData);
    setScreen('levels');
  };

  if (screen === 'landing') return (
    <LandingPage
      onStart={() => setScreen('levels')}
      onLogin={() => setScreen('login')}   
    />
  );
  if (screen === 'login') return <LoginPage onLogin={handleLogin} />;
  return <LevelSelector auth={auth} />;
}

export default App;