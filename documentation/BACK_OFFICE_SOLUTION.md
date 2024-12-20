# Fantasy Character Creator: Back Office Authentication Solution

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Authentication Flow](#authentication-flow)
4. [User Model](#user-model)
5. [Token Management](#token-management)
6. [Security Considerations](#security-considerations)
7. [Logging Strategy](#logging-strategy)
8. [Environment Configuration](#environment-configuration)
9. [Future Enhancements](#future-enhancements)

## Project Overview
The Back Office Authentication Solution provides a robust, secure, and scalable authentication system for the Fantasy Character Creator project, focusing on role-based access control, secure token management, and comprehensive security measures.

## Project Structure
```
backend/
├── config/
│   ├── passport.ts          # Passport configuration
│   ├── logger.ts            # Logging configuration
│   └── securityMiddleware.ts # Security middleware configuration
├── middleware/
│   ├── authMiddleware.ts    # Authentication middleware
│   └── securityMiddleware.ts # Security middleware
├── models/
│   ├── User.ts              # User model definition
│   ├── AuditLog.ts          # Audit log model definition
│   └── RefreshToken.ts      # Refresh token model
├── routes/
│   ├── authRoutes.ts        # Authentication routes
│   └── adminRoutes.ts       # Admin-specific routes
├── services/
│   └── tokenService.ts      # Token management service
└── utils/
    └── validation.ts        # Input validation utilities
```

## Authentication Flow
1. User Registration
   - Validate input (email, password)
   - Check for existing user
   - Hash password
   - Create user
   - Generate token pair
   - Store refresh token

2. User Login
   - Validate credentials
   - Generate token pair
   - Store refresh token
   - Return access and refresh tokens

3. Token Refresh
   - Validate refresh token
   - Check token in database
   - Generate new token pair
   - Invalidate old refresh token

## User Model
```prisma
enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      UserRole @default(USER)
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  details   Json?
  ipAddress String?
  timestamp DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])
}
```

## Token Management
### Token Service
```typescript
class TokenService {
  static generateAccessToken(user: User): string
  static generateRefreshToken(user: User): string
  static createTokenPair(user: User): TokenPair
  static storeRefreshToken(userId: string, refreshToken: string): Promise<void>
  static refreshTokens(refreshToken: string): Promise<TokenPair | null>
}
```

### Token Configuration
- Access Token: 15 minutes expiration
- Refresh Token: 7 days expiration
- Separate secrets for JWT and Passport
- Token rotation mechanism

## Security Considerations
1. Input Validation
   - Email format validation
   - Strong password requirements
   - Sanitize and normalize inputs

2. Rate Limiting
   - 100 requests per 15 minutes
   - Prevent brute-force attacks
   - Configurable limits

3. CORS Protection
   - Restrict allowed origins
   - Define allowed methods
   - Prevent unauthorized requests

4. Security Headers
   - Helmet middleware
   - Content Security Policy
   - Prevent web vulnerabilities

5. Request Size Limiting
   - 10KB payload limit
   - Prevent DoS attacks

6. Error Handling
   - Global error handler
   - Contextual logging
   - Production-safe responses

## Logging Strategy
### Logging Configuration
- Winston logging library
- Daily log rotation
- Console and file transports
- Configurable log levels

### Logged Events
- Authentication attempts
- Token generation/refresh
- Security-related activities
- Error tracking

## Environment Configuration
```env
# Authentication Secrets
JWT_SECRET=your_very_long_and_secure_random_string_for_jwt
PASSPORT_JWT_SECRET=another_equally_long_and_secure_random_string_for_passport
REFRESH_TOKEN_SECRET=secure_refresh_token_secret

# Token Configuration
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fantasy_character_db"

# Logging Configuration
LOG_LEVEL=info
LOG_MAX_FILES=14
LOG_MAX_SIZE=20m

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
MAX_REQUEST_PAYLOAD=10kb
```

## Future Enhancements
1. Multi-factor Authentication
2. Social Login Integration
3. Advanced Anomaly Detection
4. Comprehensive Audit Logging
5. Enhanced Role-Based Access Control

## Conclusion
This authentication solution provides a secure, flexible, and scalable approach to managing user access in the Fantasy Character Creator project, with a strong emphasis on security, performance, and maintainability.
