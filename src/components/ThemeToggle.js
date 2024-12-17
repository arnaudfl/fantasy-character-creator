import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleMode } = useTheme();

  return (
    <div className="theme-toggle-container">
      <button 
        className="theme-toggle" 
        onClick={toggleMode}
        aria-label={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme.mode === 'light' ? (
          <FaMoon className="theme-toggle-icon" />
        ) : (
          <FaSun className="theme-toggle-icon" />
        )}
        <span className="theme-toggle-label">
          {theme.mode === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;
