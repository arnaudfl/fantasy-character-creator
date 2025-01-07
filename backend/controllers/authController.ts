import { Request, Response } from 'express';
import { prisma } from '../db';
import { TokenUtility } from '../utils/tokenUtility';
import { PasswordUtility } from '../utils/passwordUtility';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare password
      const isValidPassword = await PasswordUtility.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const accessToken = TokenUtility.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      const refreshToken = TokenUtility.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      });

      // Set HTTP-only cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Send user data without tokens
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Error during login' });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: {
          userId: userId
        }
      });

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Error during logout' });
    }
  }
}