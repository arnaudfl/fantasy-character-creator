# Authentication Implementation Guide for Fantasy Character Creator

## 🚀 Comprehensive Authentication Solution Implementation

### Overview
This guide provides a detailed, step-by-step implementation of the authentication solution for the Fantasy Character Creator project, following the principles outlined in the Authentication Solution document.

## 📦 Project Setup and Initialization

### Step 1: Dependency Installation
```bash
# Install core dependencies
npm install express typescript prisma @prisma/client \
             jsonwebtoken bcryptjs class-validator \
             winston helmet express-rate-limit cors dotenv

# Install development dependencies
npm install -D @types/express @types/jsonwebtoken \
              @types/bcryptjs ts-node-dev \
              typescript eslint @types/cors
```

### Step 2: Project Structure
```
src/
├── config/
│   └── database.ts
├── middleware/
│   └── authMiddleware.ts
├── models/
│   └── user.ts
├── routes/
│   └── authRoutes.ts
├── services/
│   └── authService.ts
├── utils/
│   ├── passwordUtility.ts
│   ├── tokenUtility.ts
│   └── logger.ts
└── server.ts
```

## 🗄️ Database Configuration

### Step 3: Prisma Schema Setup
Create `prisma/schema.prisma`:
```typescript
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

enum AccountStatus {
  ACTIVE
  BLOCKED
  PENDING_VERIFICATION
}

model User {
  id               String         @id @default(uuid())
  email            String         @unique
  password         String
  role             UserRole       @default(USER)
  status           AccountStatus  @default(ACTIVE)
  
  refreshTokens    RefreshToken[]
  loginAttempts    Int            @default(0)
  lastLoginAt      DateTime?
  
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}

model RefreshToken {
  id          String   @id @default(uuid())
  token       String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  expiresAt   DateTime
  isRevoked   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### Step 4: Database Migration
```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init_auth_models

# Generate Prisma Client
npx prisma generate
```

## 🔒 Authentication Utilities

### Step 5: Password Utility Implementation
Create `src/utils/passwordUtility.ts`:
```typescript
import bcrypt from 'bcryptjs';

export class PasswordUtility {
  // Password hashing method
  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Password comparison method
  static async compare(
    plainPassword: string, 
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Password complexity validation
  static validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
  }
}
```

### Step 6: Token Utility Implementation
Create `src/utils/tokenUtility.ts`:
```typescript
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface TokenPayload {
  userId: string;
  role: string;
}

export class TokenUtility {
  // Generate access token
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { 
      expiresIn: '15m' 
    });
  }

  // Generate refresh token
  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      { ...payload, jti: uuidv4() }, 
      process.env.JWT_REFRESH_SECRET!, 
      { expiresIn: '7d' }
    );
  }

  // Verify access token
  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
  }
}
```

### Step 7: Logging Utility Implementation
Create `src/utils/logger.ts`:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
```

## 🔐 Authentication Service

### Step 8: Authentication Service Implementation
Create `src/services/authService.ts`:
```typescript
import { PrismaClient, UserRole, AccountStatus } from '@prisma/client';
import { PasswordUtility } from '../utils/passwordUtility';
import { TokenUtility } from '../utils/tokenUtility';

export class AuthService {
  private prisma = new PrismaClient();

  // User registration method
  async register(email: string, password: string) {
    // Validate password complexity
    if (!PasswordUtility.validatePassword(password)) {
      throw new Error('Password does not meet complexity requirements');
    }

    // Check for existing user
    const existingUser = await this.prisma.user.findUnique({ 
      where: { email } 
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await PasswordUtility.hash(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.USER,
        status: AccountStatus.PENDING_VERIFICATION
      }
    });

    // Generate tokens
    const accessToken = TokenUtility.generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = TokenUtility.generateRefreshToken({
      userId: user.id,
      role: user.role
    });

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { user, accessToken, refreshToken };
  }

  // User login method
  async login(email: string, password: string) {
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
        data: { loginAttempts: { increment: 1 } }
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
    const accessToken = TokenUtility.generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = TokenUtility.generateRefreshToken({
      userId: user.id,
      role: user.role
    });

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { user, accessToken, refreshToken };
  }

  // Token refresh method
  async refreshTokens(refreshToken: string) {
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

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newAccessToken = TokenUtility.generateAccessToken({
        userId: user.id,
        role: user.role
      });

      const newRefreshToken = TokenUtility.generateRefreshToken({
        userId: user.id,
        role: user.role
      });

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true }
      });

      // Store new refresh token
      await this.prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return { 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken 
      };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }
}
```

## 🛡️ Authentication Middleware

### Step 9: Authentication Middleware Implementation
Create `src/middleware/authMiddleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { TokenUtility } from '../utils/tokenUtility';

export class AuthMiddleware {
  // Token authentication middleware
  static authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = TokenUtility.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ 
        message: 'Invalid or expired token' 
      });
    }
  }

  // Role-based access control middleware
  static requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions' 
        });
      }
      next();
    };
  }
}
```

## 🌐 Authentication Routes

### Step 10: Authentication Routes Implementation
Create `src/routes/authRoutes.ts`:
```typescript
import express from 'express';
import { AuthService } from '../services/authService';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
const authService = new AuthService();

// User registration route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ 
      message: error.message 
    });
  }
});

// User login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ 
      message: error.message 
    });
  }
});

// Token refresh route
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ 
      message: error.message 
    });
  }
});

// User profile route (protected)
router.get('/profile', 
  AuthMiddleware.authenticate,
  async (req, res) => {
    try {
      // Retrieve user profile logic
      res.status(200).json({ 
        user: req.user 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to retrieve profile' 
      });
    }
  }
);

export default router;
```

## 🚀 Server Configuration

### Step 11: Server Setup
Create `src/server.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import logger from './utils/logger';

const app = express();

// Security Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
}));
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parsing
app.use(express.json({ 
  limit: process.env.MAX_REQUEST_PAYLOAD || '10kb' 
}));

// Routes
app.use('/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { app };
```

## 📝 Environment Configuration

### Step 12: Create .env File
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fantasy_db"

# Authentication Secrets
JWT_ACCESS_SECRET=your_very_long_and_secure_random_string
JWT_REFRESH_SECRET=another_very_long_and_secure_random_string

# Token Configuration
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
MAX_REQUEST_PAYLOAD=10kb
LOG_LEVEL=info

# Environment
NODE_ENV=development
```

## 🐳 Docker Configuration

### Step 13: Docker Compose Setup
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  # PostgreSQL Database Service
  postgres:
    image: postgres:15-alpine
    container_name: fantasy-character-db
    environment:
      POSTGRES_DB: fantasy_character_db
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_HOST_AUTH_METHOD: scram-sha-256
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - fantasy-network

  # PgAdmin Database Management Tool
  pgadmin:
    image: dpage/pgadmin4
    container_name: fantasy-character-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - fantasy-network

  # Authentication Service
  auth-service:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: fantasy-character-auth
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/fantasy_character_db
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - fantasy-network

networks:
  fantasy-network:
    driver: bridge

volumes:
  postgres_data:
```

### Step 14: Dockerfile for Authentication Service
Create `Dockerfile`:
```dockerfile
# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port for the application
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
```

### Step 15: Docker Management Commands
```bash
# Build and start services
docker-compose up --build -d

# View running containers
docker-compose ps

# View logs for a specific service
docker-compose logs auth-service

# Stop and remove containers
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

### Step 16: Docker Environment Configuration
Create `.env` file for Docker:
```bash
# Database Configuration
POSTGRES_USER=fantasy_user
POSTGRES_PASSWORD=secure_fantasy_password
POSTGRES_DB=fantasy_character_db

# PgAdmin Configuration
PGADMIN_EMAIL=admin@fantasycharacter.com
PGADMIN_PASSWORD=secure_pgadmin_password

# Authentication Secrets
JWT_ACCESS_SECRET=your_very_long_and_secure_random_access_secret
JWT_REFRESH_SECRET=your_very_long_and_secure_random_refresh_secret

# Application Configuration
PORT=3000
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}
```

### Docker Security Best Practices
- Use `.dockerignore` to exclude sensitive files
- Never commit `.env` files to version control
- Use multi-stage builds
- Run containers with minimal privileges
- Regularly update base images
- Scan images for vulnerabilities

### Continuous Integration Considerations
- Integrate Docker builds in CI/CD pipeline
- Automated vulnerability scanning
- Performance and security testing

## 🧪 Testing and Verification

### Step 17: Authentication Workflow Testing
1. Register a new user
2. Login with the registered credentials
3. Retrieve user profile
4. Refresh access token
5. Test role-based access control

## 🚀 Deployment Considerations
- Use environment-specific configurations
- Implement secure secret management
- Set up continuous integration and deployment (CI/CD)
- Perform thorough security audits

---

**Version**: 1.0.0
**Last Updated**: 2024-01-01
**Maintainer**: Fantasy Character Creator Team
