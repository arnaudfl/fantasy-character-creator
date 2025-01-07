import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-title">
          Fantasy Character Creator
        </Link>
        
        <div className="header-controls">
          <ThemeToggle />
          
          {user ? (
            <div className="user-controls">
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-controls">
              <Link to="/login" className="auth-link-button">Login</Link>
              <Link to="/register" className="auth-link-button">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 