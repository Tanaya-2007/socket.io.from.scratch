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
  const [currentLevel, setCurrentLevel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false); // ← LIFTED UP HERE!

  // Load saved progress on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem('currentLevel');
    const savedCompleted = localStorage.getItem('completedLevels');

    if (savedLevel) setCurrentLevel(parseInt(savedLevel));
    if (savedCompleted) setCompletedLevels(JSON.parse(savedCompleted));
  }, []);

  // Save current level
  useEffect(() => {
    if (currentLevel !== null) {
      localStorage.setItem('currentLevel', currentLevel.toString());
    }
  }, [currentLevel]);

  // Save completed levels
  useEffect(() => {
    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);

  // Socket connection
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

  const handleLevelSelect = (level) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(level);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToSelector = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(null);
      localStorage.removeItem('currentLevel');
      setIsTransitioning(false);
    }, 300);
  };

  const handleLevelComplete = (level) => {
    // Add to completed if not already there
    setCompletedLevels(prev => {
      if (prev.includes(level)) return prev;
      const updated = [...prev, level];

      // ✅ IF LEVEL 12 COMPLETED → SHOW CONGRATS POPUP!
      if (level === 12) {
        // Go back to selector first, then show popup
        setTimeout(() => {
          setCurrentLevel(null);
          localStorage.removeItem('currentLevel');
          setIsTransitioning(false);
          // Small delay so selector renders before popup
          setTimeout(() => setShowCongrats(true), 200);
        }, 400);
      }

      return updated;
    });
  };

  const handleResetProgress = () => {
    localStorage.removeItem('currentLevel');
    localStorage.removeItem('completedLevels');
    setCurrentLevel(null);
    setCompletedLevels([]);
    setShowCongrats(false);
  };

  const levelProps = {
    socket,
    isConnected,
    onBack: handleBackToSelector,
    onComplete: handleLevelComplete,
    isTransitioning
  };

  const renderLevel = () => {
    switch (currentLevel) {
      case 1:  return <Level1  {...levelProps} onComplete={() => handleLevelComplete(1)} />;
      case 2:  return <Level2  {...levelProps} onComplete={() => handleLevelComplete(2)} />;
      case 3:  return <Level3  {...levelProps} onComplete={() => handleLevelComplete(3)} />;
      case 4:  return <Level4  {...levelProps} onComplete={() => handleLevelComplete(4)} />;
      case 5:  return <Level5  {...levelProps} onComplete={() => handleLevelComplete(5)} />;
      case 6:  return <Level6  {...levelProps} onComplete={() => handleLevelComplete(6)} />;
      case 7:  return <Level7  {...levelProps} onComplete={() => handleLevelComplete(7)} />;
      case 8:  return <Level8  {...levelProps} onComplete={() => handleLevelComplete(8)} />;
      case 9:  return <Level9  {...levelProps} onComplete={() => handleLevelComplete(9)} />;
      case 10: return <Level10 {...levelProps} onComplete={() => handleLevelComplete(10)} />;
      case 11: return <Level11 {...levelProps} onComplete={() => handleLevelComplete(11)} />;
      case 12: return <Level12 {...levelProps} onComplete={() => handleLevelComplete(12)} />;
      default:
        return (
          <LevelSelector
            onLevelSelect={handleLevelSelect}
            completedLevels={completedLevels}
            onResetProgress={handleResetProgress}
            isConnected={isConnected}
            isTransitioning={isTransitioning}
            showCongrats={showCongrats}              // ← PASS DOWN
            setShowCongrats={setShowCongrats}        // ← PASS DOWN
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