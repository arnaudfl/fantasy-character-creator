import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import avatarRoutes from './routes/avatarRoutes';
import redisClient from './config/redisConfig';
import authRoutes from './routes/authRoutes';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());

// Serve static files from public directory
app.use('/character-avatars', express.static(path.join(__dirname, '../public/character-avatars')));

// Ensure character-avatars directory exists
const avatarDir = path.join(__dirname, '../public/character-avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Routes
app.use('/api', avatarRoutes);
app.use('/api/auth', authRoutes);

// Avatar Save Route
app.post('/api/save-avatar', (req, res) => {
  try {
    const { avatarData, characterName } = req.body;
    
    // Remove data URL prefix
    const base64Data = avatarData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create unique filename
    const filename = `${characterName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.png`;
    const filepath = path.join(avatarDir, filename);
    
    // Write file
    fs.writeFileSync(filepath, buffer);
    
    res.json({ 
      message: 'Avatar saved successfully', 
      path: `/character-avatars/${filename}` 
    });
  } catch (error) {
    console.error('Avatar save error:', error);
    res.status(500).json({ 
      error: 'Failed to save avatar', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Add Redis connection check
app.get('/api/redis-status', async (req, res) => {
  try {
    await redisClient.ping();
    res.status(200).json({ status: 'Redis is connected' });
  } catch (error: unknown) {
    res.status(500).json({ 
      status: 'Redis connection failed', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'An unexpected error occurred',
    error: err instanceof Error ? err.message : 'Unknown error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Optional: Test Redis connection on startup
  try {
    await redisClient.ping();
    console.log('Redis connected successfully');
  } catch (error: unknown) {
    console.error('Failed to connect to Redis', error instanceof Error ? error.message : error);
  }
});

export default app;
