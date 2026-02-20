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
  const [showCongrats, setShowCongrats] = useState(false);

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
    } else {
      localStorage.removeItem('currentLevel');
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

  // ═══════════════════════════════════════════════════════
  // 🎯 CENTRALIZED NAVIGATION FUNCTIONS (CONSISTENT EVERYWHERE)
  // ═══════════════════════════════════════════════════════

  /**
   * Navigate to a specific level with smooth transition
   */
  const navigateToLevel = (levelNum) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(levelNum);
      setIsTransitioning(false);
    }, 300);
  };

  /**
   * Go back to level selector with smooth transition
   */
  const navigateToSelector = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(null);
      setIsTransitioning(false);
    }, 300);
  };

  /**
   * Complete a level and handle post-completion logic
   */
  const handleLevelComplete = (levelNum) => {
    // Add to completed if not already there
    setCompletedLevels(prev => {
      if (prev.includes(levelNum)) return prev;
      const updated = [...prev, levelNum];

      // Special handling for Level 12 completion
      if (levelNum === 12) {
        // Transition back to selector, then show congrats
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentLevel(null);
          setIsTransitioning(false);
          // Show congrats popup after selector loads
          setTimeout(() => setShowCongrats(true), 300);
        }, 400);
      } else {
        // For other levels, just go back to selector
        navigateToSelector();
      }

      return updated;
    });
  };

  /**
   * Reset all progress (for testing)
   */
  const handleResetProgress = () => {
    localStorage.removeItem('currentLevel');
    localStorage.removeItem('completedLevels');
    setCurrentLevel(null);
    setCompletedLevels([]);
    setShowCongrats(false);
  };

  /**
   * Complete all levels instantly (for testing)
   */
  const handleCompleteAll = () => {
    const allLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    setCompletedLevels(allLevels);
    setCurrentLevel(null);
    setTimeout(() => setShowCongrats(true), 500);
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 PROPS PASSED TO ALL LEVELS (CONSISTENT INTERFACE)
  // ═══════════════════════════════════════════════════════

  const levelProps = {
    socket,
    isConnected,
    onBack: navigateToSelector,        // ← Consistent across all levels
    isTransitioning                     // ← For fade animations
  };

  // ═══════════════════════════════════════════════════════
  // 🧭 RENDER CURRENT VIEW
  // ═══════════════════════════════════════════════════════

  const renderCurrentView = () => {
    // Show level selector
    if (currentLevel === null) {
      return (
        <LevelSelector
          onLevelSelect={navigateToLevel}
          completedLevels={completedLevels}
          onResetProgress={handleResetProgress}
          isConnected={isConnected}
          isTransitioning={isTransitioning}
          showCongrats={showCongrats}
          setShowCongrats={setShowCongrats}
          onCompleteAll={handleCompleteAll}
        />
      );
    }

    // Show specific level
    switch (currentLevel) {
      case 1:
        return <Level1  {...levelProps} onComplete={() => handleLevelComplete(1)} />;
      case 2:
        return <Level2  {...levelProps} onComplete={() => handleLevelComplete(2)} />;
      case 3:
        return <Level3  {...levelProps} onComplete={() => handleLevelComplete(3)} />;
      case 4:
        return <Level4  {...levelProps} onComplete={() => handleLevelComplete(4)} />;
      case 5:
        return <Level5  {...levelProps} onComplete={() => handleLevelComplete(5)} />;
      case 6:
        return <Level6  {...levelProps} onComplete={() => handleLevelComplete(6)} />;
      case 7:
        return <Level7  {...levelProps} onComplete={() => handleLevelComplete(7)} />;
      case 8:
        return <Level8  {...levelProps} onComplete={() => handleLevelComplete(8)} />;
      case 9:
        return <Level9  {...levelProps} onComplete={() => handleLevelComplete(9)} />;
      case 10:
        return <Level10 {...levelProps} onComplete={() => handleLevelComplete(10)} />;
      case 11:
        return <Level11 {...levelProps} onComplete={() => handleLevelComplete(11)} />;
      case 12:
        return <Level12 {...levelProps} onComplete={() => handleLevelComplete(12)} />;
      default:
        return (
          <LevelSelector
            onLevelSelect={navigateToLevel}
            completedLevels={completedLevels}
            onResetProgress={handleResetProgress}
            isConnected={isConnected}
            isTransitioning={isTransitioning}
            showCongrats={showCongrats}
            setShowCongrats={setShowCongrats}
            onCompleteAll={handleCompleteAll}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;