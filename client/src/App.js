import React from 'react';
import { ProgressProvider } from './contexts/ProgressContext';
import MainApp from './components/MainApp';

function App() {
  return (
    <ProgressProvider>
      <MainApp />
    </ProgressProvider>
  );
}

export default App;