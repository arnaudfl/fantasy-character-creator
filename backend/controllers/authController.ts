import { Request, Response } from 'express';
import { prisma } from '../db';

export class AuthController {
  static async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: {
          userId: userId
        }
      });

      // Clear cookies if you're using them
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Error during logout' });
    }
  }
}