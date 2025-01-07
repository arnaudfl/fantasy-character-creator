import { PrismaClient, UserRole, AccountStatus } from '@prisma/client';
import { PasswordUtility } from '../utils/passwordUtility';
import { TokenUtility } from '../utils/tokenUtility';
import logger from '../utils/logger';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async register(email: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({ 
        where: { email } 
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Validate password
      if (!PasswordUtility.validatePassword(password)) {
        throw new Error('Password does not meet security requirements');
      }

      // Hash password
      const hashedPassword = await PasswordUtility.hash(password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          status: AccountStatus.PENDING_VERIFICATION
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user);

      logger.info(`User registered successfully: ${email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({ 
        where: { email } 
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check account status
      if (user.status !== AccountStatus.ACTIVE) {
        throw new Error('Account is not active');
      }

      // Verify password
      const isPasswordValid = await PasswordUtility.compare(
        password, 
        user.password
      );

      if (!isPasswordValid) {
        // Increment login attempts
        await this.prisma.user.update({
          where: { id: user.id },
          data: { 
            loginAttempts: { increment: 1 } 
          }
        });

        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          loginAttempts: 0,
          lastLoginAt: new Date()
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user);

      logger.info(`User logged in successfully: ${email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = TokenUtility.verifyRefreshToken(refreshToken);

      // Check if refresh token exists and is not revoked
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: { 
          token: refreshToken,
          isRevoked: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!storedToken) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true }
      });

      logger.info(`Tokens refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  private async generateTokens(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = TokenUtility.generateAccessToken(payload);
    const refreshToken = TokenUtility.generateRefreshToken(payload);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return { accessToken, refreshToken };
  }
} 