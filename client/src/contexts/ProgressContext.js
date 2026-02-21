// =====================================================
// CLIENT: contexts/ProgressContext.js
// React Context for Progress Tracking
// =====================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState({
    completedLevels: [],
    currentLevel: 1,
    totalLevelsCompleted: 0,
    levelProgress: {},
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  // Initialize user (get or create userId)
  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    
    if (!storedUserId) {
      // Generate unique userId
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', storedUserId);
    }
    
    setUserId(storedUserId);
  }, []);

  // Load progress when userId is available
  useEffect(() => {
    if (userId) {
      loadProgress();
    }
  }, [userId]);

  // Load progress from server
  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/progress/${userId}`);
      
      if (response.data.success) {
        setProgress(response.data.progress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save level progress (during level)
  const saveLevelProgress = async (levelNum, progressData) => {
    if (!userId) return;
    
    try {
      await axios.post(
        `${API_URL}/api/progress/${userId}/level/${levelNum}`,
        progressData
      );
      
      // Update local state
      setProgress(prev => ({
        ...prev,
        levelProgress: {
          ...prev.levelProgress,
          [levelNum]: progressData
        }
      }));
    } catch (error) {
      console.error('Error saving level progress:', error);
    }
  };

  // Complete a level
  const completeLevel = async (levelNum, quizScore) => {
    if (!userId) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/api/progress/${userId}/complete/${levelNum}`,
        { quizScore }
      );
      
      if (response.data.success) {
        // Reload progress to get updated data
        await loadProgress();
        return response.data.nextLevel;
      }
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  // Check if level is unlocked
  const isLevelUnlocked = (levelNum) => {
    // Level 1 is always unlocked
    if (levelNum === 1) return true;
    
    // Check if previous level is completed
    return progress.completedLevels.includes(levelNum - 1);
  };

  // Get level progress
  const getLevelProgress = (levelNum) => {
    return progress.levelProgress[levelNum] || {
      completedSteps: [],
      currentStep: 0,
      quizCompleted: false,
      quizScore: { correct: 0, total: 0 }
    };
  };

  // Reset progress (for testing)
  const resetProgress = async () => {
    if (!userId) return;
    
    try {
      await axios.post(`${API_URL}/api/progress/${userId}/reset`);
      await loadProgress();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  const value = {
    userId,
    progress,
    loading,
    saveLevelProgress,
    completeLevel,
    isLevelUnlocked,
    getLevelProgress,
    resetProgress,
    refreshProgress: loadProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};