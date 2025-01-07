import express, { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { RegisterDTO, LoginDTO, RefreshTokenDTO } from '../validators/authValidator';
import logger from '../utils/logger';
import { AuthController } from '../controllers/authController';

const router = express.Router();
const authService = new AuthService();

// Register new user
router.post(
  '/register',
  AuthMiddleware.registerLimiter,
  AuthMiddleware.validateRequest(RegisterDTO),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.status(201).json(result);
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Login user
router.post(
  '/login',
  AuthMiddleware.loginLimiter,
  AuthMiddleware.validateRequest(LoginDTO),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({ message: error.message });
    }
  }
);

// Refresh token
router.post(
  '/refresh-token',
  AuthMiddleware.validateRequest(RefreshTokenDTO),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      res.status(401).json({ message: error.message });
    }
  }
);

// Get user profile (protected route example)
router.get(
  '/profile',
  AuthMiddleware.authenticate,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      res.status(200).json({ user: req.user });
    } catch (error: any) {
      logger.error('Profile retrieval error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Logout (revoke refresh token)
router.post(
  '/logout',
  AuthMiddleware.authenticate,
  AuthController.logout
);

export default router; 