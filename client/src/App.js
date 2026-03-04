import React from 'react';
import { ProgressProvider } from './contexts/ProgressContext';
import MainApp from './MainApp';

function App() {
  return (
    <ProgressProvider>
      <MainApp />
    </ProgressProvider>
  );
}

export default App;