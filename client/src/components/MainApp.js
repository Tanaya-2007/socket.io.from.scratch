
import React, { useState } from 'react';
import io from 'socket.io-client';
import LevelSelector from './LevelSelector';
import { useProgress } from '../contexts/ProgressContext';
import Level1 from './Level1';
import Level2 from './Level2';
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
  const [currentLevel, setCurrentLevel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { 
    progress, 
    loading, 
    isLevelUnlocked, 
    getLevelProgress,
    saveLevelProgress,
    completeLevel 
  } = useProgress();

  // Handle level selection
  const handleLevelSelect = (levelNum) => {
    if (!isLevelUnlocked(levelNum)) {
      alert(`Complete Level ${levelNum - 1} first!`);
      return;
    }
    
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

  // Socket connection
  React.useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-white text-2xl font-bold">
          Loading your progress... 🚀
        </div>
      </div>
    );
  }

  // Show level selector
  if (!currentLevel) {
    return (
      <LevelSelector
        onSelectLevel={handleLevelSelect}
        completedLevels={progress.completedLevels}
        currentLevel={progress.currentLevel}
        isLevelUnlocked={isLevelUnlocked}
        isTransitioning={isTransitioning}
      />
    );
  }

  // Show current level
  const levelProps = {
    socket,
    isConnected,
    onBack: handleBack,
    isTransitioning,
    // Progress tracking props
    initialProgress: getLevelProgress(currentLevel),
    onProgressUpdate: (progressData) => saveLevelProgress(currentLevel, progressData),
    onLevelComplete: (quizScore) => completeLevel(currentLevel, quizScore)
  };

  // Render appropriate level
  switch(currentLevel) {
    case 1: return <Level1 {...levelProps} />;
    case 2: return <Level2 {...levelProps} />;
    case 3: return <Level3 {...levelProps} />;
    case 4: return <Level4{...levelProps} />;
    case 5: return <Level5 {...levelProps} />;
    case 6: return <Level6 {...levelProps} />;
    case 7: return <Level7 {...levelProps} />;
    case 8: return <Level8 {...levelProps} />;
    case 9: return <Level9 {...levelProps} />;
    case 10: return <Level10 {...levelProps} />;
    case 11: return <Level11 {...levelProps} />;
    case 12: return <Level12 {...levelProps} />;
    default: return <LevelSelector onSelectLevel={handleLevelSelect} />;
  }
}

export default MainApp;