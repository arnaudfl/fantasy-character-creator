import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { validatePassword, validateEmail } from '../../utils/validation';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      const { errors } = validateEmail(email);
      setEmailErrors(errors);
    } else {
      setEmailErrors([]);
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      const { errors } = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (emailErrors.length > 0) {
      setError('Please fix email validation errors');
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Please fix password validation errors');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, password);
      navigate('/create-character');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailErrors.length > 0 ? 'input-error' : ''}
            />
            {emailErrors.length > 0 && (
              <ul className="validation-errors">
                {emailErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordErrors.length > 0 ? 'input-error' : ''}
            />
            {passwordErrors.length > 0 && (
              <ul className="validation-errors">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || emailErrors.length > 0 || passwordErrors.length > 0}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                <span style={{ marginLeft: '8px' }}>Creating account...</span>
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}; 