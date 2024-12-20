# Fantasy Character Creator: Authentication & Back Office Solution

## Project Authentication Implementation Strategy

### 1. Dependency Installation

#### Authentication Dependencies
```bash
npm install passport passport-jwt jsonwebtoken bcrypt
npm install -D @types/passport @types/passport-jwt @types/jsonwebtoken @types/bcrypt
```

### 2. Project Structure Preparation

#### Recommended Backend Structure
```
backend/
├── config/
│   └── passport.ts          # Passport configuration
├── middleware/
│   └── authMiddleware.ts    # Authentication middleware
├── models/
│   └── User.ts              # User model definition
├── routes/
│   ├── authRoutes.ts        # Authentication routes
│   └── adminRoutes.ts       # Admin-specific routes
├── services/
│   ├── authService.ts       # Authentication business logic
│   └── tokenService.ts      # Token management
└── types/
    └── express.d.ts         # TypeScript type augmentation
```

### 3. User Model Definition

#### Prisma Schema Enhancement
```typescript
// prisma/schema.prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  role      UserRole  @default(USER)
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  firstName String?
  lastName  String?
  user      User     @relation(fields: [userId], references: [id])
}
```

### 4. Authentication Configuration

#### Passport JWT Strategy
```typescript
// backend/config/passport.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback_secret'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));
```

### 5. Authentication Middleware

#### Role-Based Access Control
```typescript
// backend/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserRole } from '@prisma/client';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    req.user = user;
    next();
  })(req, res, next);
};

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  };
};
```

### 6. Authentication Routes

#### Login and Registration
```typescript
// backend/routes/authRoutes.ts
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role = UserRole.USER } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      }
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
```

### 7. Admin Routes Protection

#### Secure Admin Endpoints
```typescript
// backend/routes/adminRoutes.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated, checkRole } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/users', 
  isAuthenticated, 
  checkRole(['ADMIN', 'SUPER_ADMIN']), 
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: { 
          id: true, 
          email: true, 
          role: true 
        }
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve users' });
    }
});

export default router;
```

### 8. Environment Configuration

#### .env File
```env
# Authentication
JWT_SECRET=your_very_long_and_secure_random_string
JWT_EXPIRATION=1h

# Optional: Additional security settings
PASSWORD_SALT_ROUNDS=10
```

### 9. Server Integration

#### Express Server Setup
```typescript
// backend/server.ts
import express from 'express';
import passport from 'passport';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import './config/passport';  // Import passport configuration

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 10. Testing Strategy

#### Authentication Test Scenarios
- User registration
- Login with valid/invalid credentials
- Token generation
- Role-based access control
- Admin route protection

### 11. Security Considerations
- Use strong, randomly generated JWT secret
- Implement password complexity rules
- Add rate limiting to authentication endpoints
- Log authentication attempts
- Implement token refresh mechanism

### 12. Future Enhancements
- Multi-factor authentication
- OAuth integration
- Advanced anomaly detection
- Comprehensive audit logging

## Conclusion
This implementation provides a robust, secure authentication system tailored to the Fantasy Character Creator project, offering flexible role-based access control and comprehensive security features.
