# Fantasy Character Creator 🎲🧙‍♀️

## 🌟 Project Vision

An advanced, AI-powered platform for creating and managing fantasy characters, blending cutting-edge technology with creative storytelling.

## 🚀 Key Features

### 🎭 Character Management

- Complete Character Creation System
- Ability Score Management
- Equipment & Inventory System
- Character Background Generation
- Personality Trait System
- Character Avatar Integration

### 🤖 AI-Powered Capabilities

- Dynamic Avatar Generation
- Procedural Background Story Creation
- Intelligent Character Trait Recommendations
- Advanced Character Visualization

### 🔐 Authentication & Security

- Secure JWT Token Management
- HTTP-Only Cookie Authentication
- Role-Based Access Control
- Protected Character Routes

## 🏗️ Technical Architecture

### Core Technology Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with HTTP-Only Cookies
- **Frontend:** React, TypeScript
- **AI Integration:** Hugging Face Stable Diffusion
- **State Management:** Redux/Zustand
- **Testing:** Jest, React Testing Library

### Data Models

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  role          UserRole      @default(USER)
  refreshTokens RefreshToken[]
  characters    Character[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Character {
  id                  String   @id @default(uuid())
  name                String
  race                String
  class               String
  background          String?
  strength            Int      @default(10)
  dexterity          Int      @default(10)
  constitution       Int      @default(10)
  intelligence       Int      @default(10)
  wisdom             Int      @default(10)
  charisma           Int      @default(10)
  baseAbilityScores  Json
  totalAbilityScores Json
  raceAbilityModifiers Json
  specialAbility     String?
  equipment          Json?
  personality        Json?
  avatar             String?
  optimization       Json?
  backgroundStory    String?
  userId             String
  user               User     @relation(fields: [userId], references: [id])
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

## 🔧 Environment Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis (optional)
- Docker (optional)
- Hugging Face API Token (optional)

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/fantasy-character-creator.git

# Navigate to project directory
cd fantasy-character-creator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Start development servers (both frontend and backend)
npm run start:all
npm run start
```

### Environment Variables

```env
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret"
COOKIE_SECRET="your-cookie-secret"
REACT_APP_API_BASE_URL="http://localhost:5000"
```

## 🛡️ Security Features

- HTTP-Only Cookies for Token Storage
- CORS Protection
- Input Validation
- Rate Limiting
- Secure Password Hashing
- Protected Character Routes
- Error Handling Middleware

## 🔄 API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout

### Characters

- GET /api/characters
- POST /api/characters
- GET /api/characters/:id
- PUT /api/characters/:id
- DELETE /api/characters/:id

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- character

# Run with coverage
npm test -- --coverage
```

## 📊 Performance Features

- Database Query Optimization
- JSON Field Handling
- Caching Strategies
- Protected Routes
- Error Boundary Implementation

## 🌐 Deployment

```bash
# Build frontend
npm run build

# Production start
npm start

# Using Docker
docker-compose up --build
```

## 🎯 Roadmap

### Current Phase

- [x] User Authentication System
- [x] Basic Character Creation
- [x] Character-User Relationships
- [x] Ability Score System

### Upcoming Features

- [ ] Character Sharing
- [ ] Advanced Search
- [ ] Character Templates
- [ ] Real-time Collaboration

## 🤝 Contributing

1. Fork the Repository
2. Create Feature Branch
3. Commit Changes
4. Push to Branch
5. Open Pull Request

### Development Guidelines

- Follow TypeScript Best Practices
- Write Unit Tests
- Document New Features
- Follow ESLint Rules

## 📜 License

[MIT License]

## 📞 Support

- Issues: GitHub Issues Page
- Email: [Your Email]
- Documentation: [Link to Docs]

---

**Built with ❤️ for Fantasy RPG Enthusiasts**
