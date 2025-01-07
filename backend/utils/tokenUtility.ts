import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class TokenUtility {
  static generateAccessToken(payload: TokenPayload): string {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { 
      expiresIn: '15m' 
    });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
      expiresIn: '7d' 
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as TokenPayload;
  }
} 