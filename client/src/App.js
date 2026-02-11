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

const socket = io('http://localhost:4000');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

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

  return (
    <>
      {!currentLevel && (
        <LevelSelector 
          isConnected={isConnected}
          onSelectLevel={goToLevel}
          isTransitioning={isTransitioning}
        />
      )}
      
      {currentLevel === 1 && (
        <Level1 
          socket={socket}
          isConnected={isConnected}
          onBack={goHome}
          isTransitioning={isTransitioning}
        />
      )}
      
      {currentLevel === 2 && (
        <Level2 
          socket={socket}
          isConnected={isConnected}
          onBack={goHome}
          isTransitioning={isTransitioning}
        />
      )}

      {currentLevel === 3 && (
        <Level3 
          socket={socket}
          isConnected={isConnected}
          onBack={goHome}
          isTransitioning={isTransitioning}
        />
      )}

      {currentLevel === 4 && (
        <Level4 
          isConnected={isConnected}
          onBack={goHome}
          isTransitioning={isTransitioning}
        />
      )}

      {currentLevel === 5 && (
        <Level5 
          socket={socket} 
          isConnected={isConnected} 
          onBack={() => setCurrentLevel(null)}
          isTransitioning={false}
        />
      )}

      {currentLevel === 6 && (
              <Level6 
                socket={socket} 
                isConnected={isConnected} 
                onBack={() => setCurrentLevel(null)}
                isTransitioning={false}
              />
        )}

      {currentLevel === 7 && (
                      <Level7 
                        socket={socket} 
                        isConnected={isConnected} 
                        onBack={() => setCurrentLevel(null)}
                        isTransitioning={false}
                      />
        )}

      {currentLevel === 8 && (
                            <Level8 
                              socket={socket} 
                              isConnected={isConnected} 
                              onBack={() => setCurrentLevel(null)}
                              isTransitioning={false}
                            />
        )}

      {currentLevel === 9 && (
                            <Level9
                              socket={socket} 
                              isConnected={isConnected} 
                              onBack={() => setCurrentLevel(null)}
                              isTransitioning={false}
                            />
        )}
    </>
  );
}

export default App;