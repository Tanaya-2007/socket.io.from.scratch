import React, { useState } from 'react';
import io from 'socket.io-client';
import LandingPage from './LandingPage';
import LevelSelector from './LevelSelector';
import Level1 from '../Level1';
import Level2 from '../Level2';
import Level3 from '../Level3';
import Level4 from '../Level4';
import Level5 from '../Level5';
import Level6 from '../Level6';
import Level7 from '../Level7';
import Level8 from '../Level8';
import Level9 from '../Level9';
import Level10 from '../Level10';
import Level11 from '../Level11';
import Level12 from '../Level12';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000');

function MainApp() {
 
  const [showLanding, setShowLanding] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
 
  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = localStorage.getItem('completedLevels');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showCongrats, setShowCongrats] = useState(false);

  
  React.useEffect(() => {
    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);

  
  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLanding(false);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  // Handle level selection
  const handleLevelSelect = (levelNum) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(levelNum);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  // Handle back to level selector
  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(null);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  // Complete all levels 
  const handleCompleteAll = () => {
    setCompletedLevels([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    setShowCongrats(true);
  };

  // Reset progress
  const handleResetProgress = () => {
    setCompletedLevels([]);
    setShowCongrats(false);
    localStorage.removeItem('completedLevels');
  };

  // Socket connection
  React.useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  
  if (showLanding) {
    return <LandingPage onStart={handleStart} />;
  }

  // Show level selector
  if (!currentLevel) {
    return (
      <LevelSelector
        onLevelSelect={handleLevelSelect}
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

  // Show current level
  const levelProps = {
    socket,
    isConnected,
    onBack: handleBack,
    isTransitioning,
    onComplete: () => {
      if (!completedLevels.includes(currentLevel)) {
        const newCompleted = [...completedLevels, currentLevel];
        setCompletedLevels(newCompleted);
        
        // Show congrats if all levels completed
        if (newCompleted.length === 12) {
          setShowCongrats(true);
        }
      }
      handleBack();
    }
  };

  
  switch(currentLevel) {
    case 1: return <Level1 {...levelProps} />;
    case 2: return <Level2 {...levelProps} />;
    case 3: return <Level3 {...levelProps} />;
    case 4: return <Level4 {...levelProps} />;
    case 5: return <Level5 {...levelProps} />;
    case 6: return <Level6 {...levelProps} />;
    case 7: return <Level7 {...levelProps} />;
    case 8: return <Level8 {...levelProps} />;
    case 9: return <Level9 {...levelProps} />;
    case 10: return <Level10 {...levelProps} />;
    case 11: return <Level11 {...levelProps} />;
    case 12: return <Level12 {...levelProps} />;
    default: return <LevelSelector onLevelSelect={handleLevelSelect} />;
  }
}

export default MainApp;