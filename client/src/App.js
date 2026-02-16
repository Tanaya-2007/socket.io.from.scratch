import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import LevelSelector from './LevelSelector';
import Level1 from './Level1';
import Level2 from './Level2';
import Level3 from './Level3';
import Level4 from './Level4';
import Level5 from './Level5';
import Level6 from './Level6';
import Level7 from './Level7';
import Level8 from './Level8';
import Level9 from './Level9';
import Level10 from './Level10';
import Level11 from './Level11';
import Level12 from './Level12';

const socket = io('http://localhost:4000');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]);

  // Load saved progress on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem('currentLevel');
    const savedCompleted = localStorage.getItem('completedLevels');
    
    if (savedLevel) {
      setCurrentLevel(parseInt(savedLevel));
    }
    
    if (savedCompleted) {
      setCompletedLevels(JSON.parse(savedCompleted));
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (currentLevel !== null) {
      localStorage.setItem('currentLevel', currentLevel.toString());
    }
  }, [currentLevel]);

  useEffect(() => {
    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const smoothTransition = (callback) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const goToLevel = (level) => {
    smoothTransition(() => setCurrentLevel(level));
  };

  const goHome = () => {
    smoothTransition(() => setCurrentLevel(null));
  };

  const handleLevelComplete = (level) => {
    if (!completedLevels.includes(level)) {
      setCompletedLevels([...completedLevels, level]);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('⚠️ Reset all progress? This will unlock all levels and clear your progress.')) {
      localStorage.removeItem('currentLevel');
      localStorage.removeItem('completedLevels');
      setCurrentLevel(null);
      setCompletedLevels([]);
    }
  };

  const renderLevel = () => {
    const levelProps = {
      socket,
      isConnected,
      onBack: goHome,
      onComplete: () => handleLevelComplete(currentLevel),
      isTransitioning
    };

    switch (currentLevel) {
      case 1:
        return <Level1 {...levelProps} />;
      case 2:
        return <Level2 {...levelProps} />;
      case 3:
        return <Level3 {...levelProps} />;
      case 4:
        return <Level4 {...levelProps} />;
      case 5:
        return <Level5 {...levelProps} />;
      case 6:
        return <Level6 {...levelProps} />;
      case 7:
        return <Level7 {...levelProps} />;
      case 8:
        return <Level8 {...levelProps} />;
      case 9:
        return <Level9 {...levelProps} />;
      case 10:
        return <Level10 {...levelProps} />;
      case 11:
        return <Level11 {...levelProps} />;
      case 12:
        return <Level12 {...levelProps} />;
      default:
        return (
          <LevelSelector
            onLevelSelect={goToLevel}
            completedLevels={completedLevels}
            onResetProgress={handleResetProgress}
            isConnected={isConnected}
            isTransitioning={isTransitioning}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderLevel()}
    </div>
  );
}

export default App;