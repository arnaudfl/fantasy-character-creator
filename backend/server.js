const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Serve static files from public directory
app.use('/character-avatars', express.static(path.join(__dirname, '../public/character-avatars')));

// Ensure character-avatars directory exists
const avatarDir = path.join(__dirname, '../public/character-avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

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
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
