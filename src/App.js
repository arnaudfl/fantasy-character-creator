import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import CharacterForm from './components/CharacterForm';
import './App.css';
import './styles/global.css';
import './styles/globalVariables.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <Header />
        <main className="app-main">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected routes */}
            <Route
              path="/create-character"
              element={
                <ProtectedRoute>
                  <CharacterForm />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect root to create-character or login */}
            <Route
              path="/"
              element={<Navigate to="/create-character" replace />}
            />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
