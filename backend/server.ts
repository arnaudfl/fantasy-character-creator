import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import avatarRoutes from './routes/avatarRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
app.use('/api/avatars', avatarRoutes);

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
