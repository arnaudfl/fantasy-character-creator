# Linking Characters to Users Guide

## Overview

This guide explains how to implement character-user relationships and handle complex character data in the Fantasy Character Creator application.

## Database Schema

### User-Character Relationship

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  role          UserRole      @default(USER)
  refreshTokens RefreshToken[]
  characters    Character[]    // One-to-many relation with characters
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

## Implementation Steps

### 1. Database Migration

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_character_user_relation
```

### 2. Backend Implementation

#### Character Types (backend/types/character.ts)

```typescript
export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Equipment {
  weapons: string[];
  armor: string[];
  items: string[];
}

export interface Personality {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

export interface Optimization {
  combatRole: string;
  preferredWeapons: string[];
  suggestedFeats: string[];
}

export interface CharacterInput {
  name: string;
  race: string;
  class: string;
  background?: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  baseAbilityScores: AbilityScores;
  totalAbilityScores: AbilityScores;
  raceAbilityModifiers: AbilityScores;
  specialAbility?: string;
  equipment?: Equipment;
  personality?: Personality;
  avatar?: string;
  optimization?: Optimization;
  backgroundStory?: string;
}

export interface Character extends CharacterInput {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Character Validation (backend/utils/characterValidation.ts)

```typescript
import { z } from 'zod';

const AbilityScoresSchema = z.object({
  strength: z.number().min(3).max(20),
  dexterity: z.number().min(3).max(20),
  constitution: z.number().min(3).max(20),
  intelligence: z.number().min(3).max(20),
  wisdom: z.number().min(3).max(20),
  charisma: z.number().min(3).max(20),
});

const EquipmentSchema = z.object({
  weapons: z.array(z.string()),
  armor: z.array(z.string()),
  items: z.array(z.string()),
}).optional();

const PersonalitySchema = z.object({
  traits: z.array(z.string()),
  ideals: z.array(z.string()),
  bonds: z.array(z.string()),
  flaws: z.array(z.string()),
}).optional();

export const CharacterValidationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  race: z.string()
    .min(2, 'Race must be at least 2 characters')
    .max(30, 'Race cannot exceed 30 characters'),
  class: z.string()
    .min(2, 'Class must be at least 2 characters')
    .max(30, 'Class cannot exceed 30 characters'),
  background: z.string().optional(),
  strength: z.number().min(3).max(20),
  dexterity: z.number().min(3).max(20),
  constitution: z.number().min(3).max(20),
  intelligence: z.number().min(3).max(20),
  wisdom: z.number().min(3).max(20),
  charisma: z.number().min(3).max(20),
  baseAbilityScores: AbilityScoresSchema,
  totalAbilityScores: AbilityScoresSchema,
  raceAbilityModifiers: AbilityScoresSchema,
  specialAbility: z.string().optional(),
  equipment: EquipmentSchema,
  personality: PersonalitySchema,
  avatar: z.string().url().optional(),
  backgroundStory: z.string().max(2000).optional(),
});
```

#### Character Controller (backend/controllers/characterController.ts)

```typescript
import { Request, Response } from 'express';
import { prisma } from '../db';
import { CharacterValidationSchema } from '../utils/characterValidation';
import { CharacterInput } from '../types/character';

export class CharacterController {
  static async createCharacter(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const characterData: CharacterInput = req.body;

      // Validate character data
      const validationResult = CharacterValidationSchema.safeParse(characterData);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid character data',
          errors: validationResult.error.errors
        });
      }

      // Create character with JSON fields
      const character = await prisma.character.create({
        data: {
          ...characterData,
          baseAbilityScores: characterData.baseAbilityScores,
          totalAbilityScores: characterData.totalAbilityScores,
          raceAbilityModifiers: characterData.raceAbilityModifiers,
          equipment: characterData.equipment || null,
          personality: characterData.personality || null,
          optimization: characterData.optimization || null,
          userId
        }
      });

      res.status(201).json(character);
    } catch (error) {
      console.error('Character creation error:', error);
      res.status(500).json({ message: 'Error creating character' });
    }
  }

  static async getUserCharacters(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      const characters = await prisma.character.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.json(characters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      res.status(500).json({ message: 'Error fetching characters' });
    }
  }

  static async getCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const character = await prisma.character.findFirst({
        where: {
          id,
          userId // Ensure user can only access their own characters
        }
      });

      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }

      res.json(character);
    } catch (error) {
      console.error('Error fetching character:', error);
      res.status(500).json({ message: 'Error fetching character' });
    }
  }

  static async updateCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const characterData: CharacterInput = req.body;

      // Validate character data
      const validationResult = CharacterValidationSchema.safeParse(characterData);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid character data',
          errors: validationResult.error.errors
        });
      }

      const character = await prisma.character.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }

      const updatedCharacter = await prisma.character.update({
        where: { id },
        data: {
          ...characterData,
          baseAbilityScores: characterData.baseAbilityScores,
          totalAbilityScores: characterData.totalAbilityScores,
          raceAbilityModifiers: characterData.raceAbilityModifiers,
          equipment: characterData.equipment || null,
          personality: characterData.personality || null,
          optimization: characterData.optimization || null,
        }
      });

      res.json(updatedCharacter);
    } catch (error) {
      console.error('Error updating character:', error);
      res.status(500).json({ message: 'Error updating character' });
    }
  }

  static async deleteCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const character = await prisma.character.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }

      await prisma.character.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting character:', error);
      res.status(500).json({ message: 'Error deleting character' });
    }
  }
}
```

#### Character Routes (backend/routes/characterRoutes.ts)

```typescript
import express from 'express';
import { CharacterController } from '../controllers/characterController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', AuthMiddleware.authenticate, CharacterController.createCharacter);
router.get('/', AuthMiddleware.authenticate, CharacterController.getUserCharacters);
router.get('/:id', AuthMiddleware.authenticate, CharacterController.getCharacter);
router.put('/:id', AuthMiddleware.authenticate, CharacterController.updateCharacter);
router.delete('/:id', AuthMiddleware.authenticate, CharacterController.deleteCharacter);

export default router;
```

### 3. Frontend Implementation

#### Character Service (src/services/characterService.ts)

```typescript
import axios from 'axios';
import { Character, CharacterInput } from '../types/character';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const createCharacter = async (characterData: CharacterInput): Promise<Character> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/characters`,
      characterData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Character creation failed:', error);
    throw error;
  }
};

export const getUserCharacters = async (): Promise<Character[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/characters`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch characters:', error);
    throw error;
  }
};

export const getCharacter = async (id: string): Promise<Character> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/characters/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch character:', error);
    throw error;
  }
};

export const updateCharacter = async (id: string, characterData: CharacterInput): Promise<Character> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/characters/${id}`,
      characterData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update character:', error);
    throw error;
  }
};

export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/api/characters/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    console.error('Failed to delete character:', error);
    throw error;
  }
};
```

#### Character Form Integration (src/components/CharacterForm.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCharacter } from '../services/characterService';
import { CharacterInput, AbilityScores } from '../types/character';

const initialAbilityScores: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
};

const initialCharacterState: CharacterInput = {
  name: '',
  race: '',
  class: '',
  background: '',
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  baseAbilityScores: initialAbilityScores,
  totalAbilityScores: initialAbilityScores,
  raceAbilityModifiers: initialAbilityScores,
  specialAbility: '',
  equipment: {
    weapons: [],
    armor: [],
    items: []
  },
  personality: {
    traits: [],
    ideals: [],
    bonds: [],
    flaws: []
  },
  avatar: '',
  optimization: {
    combatRole: '',
    preferredWeapons: [],
    suggestedFeats: []
  },
  backgroundStory: ''
};

export const CharacterForm: React.FC = () => {
  const [character, setCharacter] = useState<CharacterInput>(initialCharacterState);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCharacter = await createCharacter(character);
      navigate(`/characters/${newCharacter.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create character');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAbilityScoreChange = (ability: keyof AbilityScores, value: number) => {
    setCharacter(prev => ({
      ...prev,
      [ability]: value,
      baseAbilityScores: {
        ...prev.baseAbilityScores,
        [ability]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="character-form">
      {error && <div className="error-message">{error}</div>}
      
      {/* Basic Information */}
      <div className="form-section">
        <h3>Basic Information</h3>
        <input
          type="text"
          name="name"
          value={character.name}
          onChange={handleChange}
          placeholder="Character Name"
          required
        />
        <select name="race" value={character.race} onChange={handleChange} required>
          <option value="">Select Race</option>
          {/* Add race options */}
        </select>
        <select name="class" value={character.class} onChange={handleChange} required>
          <option value="">Select Class</option>
          {/* Add class options */}
        </select>
      </div>

      {/* Ability Scores */}
      <div className="form-section">
        <h3>Ability Scores</h3>
        {Object.keys(initialAbilityScores).map((ability) => (
          <div key={ability} className="ability-score-input">
            <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
            <input
              type="number"
              value={character[ability as keyof AbilityScores]}
              onChange={(e) => handleAbilityScoreChange(ability as keyof AbilityScores, parseInt(e.target.value))}
              min="3"
              max="20"
            />
          </div>
        ))}
      </div>

      {/* Additional sections for equipment, personality, etc. */}
      
      <button type="submit" className="submit-button">
        Create Character
      </button>
    </form>
  );
};
```

### 4. JSON Field Handling

#### JSON Field Utilities (backend/utils/jsonFieldHandling.ts)

```typescript
import { AbilityScores, Equipment, Personality, Optimization } from '../types/character';

export class JsonFieldHandler {
  static validateAbilityScores(scores: any): AbilityScores {
    const validScores: AbilityScores = {
      strength: Math.min(Math.max(Number(scores.strength) || 10, 3), 20),
      dexterity: Math.min(Math.max(Number(scores.dexterity) || 10, 3), 20),
      constitution: Math.min(Math.max(Number(scores.constitution) || 10, 3), 20),
      intelligence: Math.min(Math.max(Number(scores.intelligence) || 10, 3), 20),
      wisdom: Math.min(Math.max(Number(scores.wisdom) || 10, 3), 20),
      charisma: Math.min(Math.max(Number(scores.charisma) || 10, 3), 20)
    };
    return validScores;
  }

  static sanitizeEquipment(equipment: any): Equipment {
    return {
      weapons: Array.isArray(equipment?.weapons) ? equipment.weapons : [],
      armor: Array.isArray(equipment?.armor) ? equipment.armor : [],
      items: Array.isArray(equipment?.items) ? equipment.items : []
    };
  }

  static sanitizePersonality(personality: any): Personality {
    return {
      traits: Array.isArray(personality?.traits) ? personality.traits : [],
      ideals: Array.isArray(personality?.ideals) ? personality.ideals : [],
      bonds: Array.isArray(personality?.bonds) ? personality.bonds : [],
      flaws: Array.isArray(personality?.flaws) ? personality.flaws : []
    };
  }

  static sanitizeOptimization(optimization: any): Optimization {
    return {
      combatRole: String(optimization?.combatRole || ''),
      preferredWeapons: Array.isArray(optimization?.preferredWeapons) ? optimization.preferredWeapons : [],
      suggestedFeats: Array.isArray(optimization?.suggestedFeats) ? optimization.suggestedFeats : []
    };
  }
}
```

### 5. Testing

#### Character Controller Tests (backend/tests/characterController.test.ts)

```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';
import { createTestUser, generateTestToken } from './testUtils';

describe('Character Controller', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    testUser = await createTestUser();
    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    await prisma.character.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  const testCharacter = {
    name: 'Test Character',
    race: 'Human',
    class: 'Fighter',
    background: 'Soldier',
    strength: 15,
    dexterity: 12,
    constitution: 14,
    intelligence: 10,
    wisdom: 11,
    charisma: 13,
    baseAbilityScores: {
      strength: 15,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 11,
      charisma: 13
    },
    totalAbilityScores: {
      strength: 15,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 11,
      charisma: 13
    },
    raceAbilityModifiers: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    }
  };

  describe('POST /api/characters', () => {
    it('should create a character for authenticated user', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCharacter);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testCharacter.name);
      expect(response.body.userId).toBe(testUser.id);
    });

    it('should reject invalid character data', async () => {
      const invalidCharacter = { ...testCharacter, strength: 25 };
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCharacter);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/characters', () => {
    it('should return user characters', async () => {
      const response = await request(app)
        .get('/api/characters')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
```

#### Frontend Integration Tests (src/tests/CharacterForm.test.tsx)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CharacterForm } from '../components/CharacterForm';
import { createCharacter } from '../services/characterService';
import { useNavigate } from 'react-router-dom';

jest.mock('../services/characterService');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('CharacterForm', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (createCharacter as jest.Mock).mockResolvedValue({ id: 'test-id' });
  });

  it('should submit character data successfully', async () => {
    render(<CharacterForm />);

    fireEvent.change(screen.getByPlaceholderText('Character Name'), {
      target: { value: 'Test Character' }
    });

    fireEvent.change(screen.getByRole('combobox', { name: /race/i }), {
      target: { value: 'Human' }
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(createCharacter).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/characters/test-id');
    });
  });

  it('should display validation errors', async () => {
    render(<CharacterForm />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
```

### 6. Error Handling and Logging

#### Error Types (backend/types/errors.ts)

```typescript
export class CharacterError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'CharacterError';
  }
}

export class ValidationError extends CharacterError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}
```

#### Error Handler Middleware (backend/middleware/errorHandler.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { CharacterError } from '../types/errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  if (error instanceof CharacterError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  return res.status(500).json({
    message: 'Internal server error'
  });
};
```

### 7. Additional Frontend Components

#### Character List Component (src/components/CharacterList.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserCharacters } from '../services/characterService';
import { Character } from '../types/character';

export const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await getUserCharacters();
        setCharacters(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch characters');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (loading) return <div>Loading characters...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="character-list">
      <h2>Your Characters</h2>
      {characters.length === 0 ? (
        <p>No characters found. Create your first character!</p>
      ) : (
        <div className="character-grid">
          {characters.map(character => (
            <div key={character.id} className="character-card">
              <h3>{character.name}</h3>
              <p>{character.race} {character.class}</p>
              {character.avatar && (
                <img src={character.avatar} alt={character.name} />
              )}
              <Link to={`/characters/${character.id}`}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
      <Link to="/characters/new" className="create-button">
        Create New Character
      </Link>
    </div>
  );
};
```

### 8. Deployment Considerations

1. **Environment Variables**

```env
# .env.example
REACT_APP_API_BASE_URL=http://localhost:5000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret"
COOKIE_SECRET="your-cookie-secret"
```

2. **Database Migrations**

```bash
# Production migration
npx prisma migrate deploy

# Verify database connection
npx prisma db seed
```

3. **Security Checklist**

- [ ] Enable CORS with appropriate origins
- [ ] Set secure cookie options
- [ ] Configure rate limiting
- [ ] Enable HTTPS
- [ ] Implement request validation
- [ ] Set up logging and monitoring

4. **Performance Optimization**

- [ ] Implement caching for character data
- [ ] Optimize database queries
- [ ] Add pagination for character lists
- [ ] Implement lazy loading for images
- [ ] Set up CDN for static assets

### 9. Next Steps

1. **Feature Enhancements**
   - Character sharing functionality
   - Advanced character search
   - Character templates
   - Batch operations

2. **Technical Improvements**
   - Real-time updates using WebSocket
   - Offline support with service workers
   - Advanced caching strategies
   - Performance monitoring

3. **Documentation**
   - API documentation with Swagger/OpenAPI
   - Component documentation with Storybook
   - User guide and tutorials
   - Contribution guidelines

4. **Testing**
   - End-to-end tests with Cypress
   - Performance testing
   - Load testing
   - Security testing
