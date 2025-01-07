import { Request, Response, NextFunction } from 'express';
import { TokenUtility } from '../utils/tokenUtility';
import { UserRole } from '@prisma/client';
import logger from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export class AuthMiddleware {
  // Authenticate JWT token
  static authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = TokenUtility.verifyAccessToken(token);
      
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Authentication failed:', error);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };

  // Role-based access control
  static requireRole = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt by user: ${req.user?.userId}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      next();
    };
  };

  // Rate limiting for login attempts
  static loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiting for registration
  static registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour
    message: { message: 'Too many registration attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Simplified validate request method
  static validateRequest = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dtoInstance = plainToInstance(dtoClass, req.body, { 
          excludeExtraneousValues: true 
        });
        
        const errors = await validate(dtoInstance);
        
        if (errors.length > 0) {
          return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.map(error => ({
              property: error.property,
              constraints: error.constraints
            }))
          });
        }
        
        req.body = dtoInstance;
        next();
      } catch (error) {
        logger.error('Validation error:', error);
        res.status(500).json({ message: 'Internal server error during validation' });
      }
    };
  };
} 