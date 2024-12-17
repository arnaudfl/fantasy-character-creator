import React, { createContext, useState, useContext, useCallback } from 'react';

const defaultTheme = {
  mode: 'light',
  colors: {
    primary: '#4a90e2',
    secondary: '#f5a623',
    accent: '#7ed321',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#2c3e50',
    border: '#e0e0e0'
  },
  transitions: {
    duration: '0.3s',
    timing: 'ease-in-out'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px'
  }
};

const darkTheme = {
  ...defaultTheme,
  mode: 'dark',
  colors: {
    primary: '#64b5f6',
    secondary: '#ffb74d',
    accent: '#81c784',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    border: '#333333'
  }
};

const ThemeContext = createContext({
  theme: defaultTheme,
  setTheme: () => {},
  toggleMode: () => {},
  customizeTheme: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  const toggleMode = useCallback(() => {
    setTheme(prevTheme => 
      prevTheme.mode === 'light' ? darkTheme : defaultTheme
    );
  }, []);

  const customizeTheme = useCallback((customizations) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      colors: {
        ...prevTheme.colors,
        ...customizations.colors
      },
      transitions: {
        ...prevTheme.transitions,
        ...customizations.transitions
      }
    }));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleMode, customizeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
