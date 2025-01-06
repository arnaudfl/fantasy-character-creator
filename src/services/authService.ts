import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, credentials);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Refresh token
export const refreshToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, { 
      refreshToken: token 
    });
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    // Get the access token
    const accessToken = localStorage.getItem('accessToken');
    
    await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}; 