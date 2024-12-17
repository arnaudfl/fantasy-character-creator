import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import CharacterForm from './components/CharacterForm';
import ThemeToggle from './components/ThemeToggle';
import './App.css';
import './styles/global.css';
import './styles/globalVariables.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>Fantasy Character Creator</h1>
          <ThemeToggle />
        </header>
        <main className="app-main">
          <CharacterForm />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
