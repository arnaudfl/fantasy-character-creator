import express from 'express';
import { EventEmitter } from 'events';
import axios from 'axios';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const avatarGenerationEmitter = new EventEmitter();
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379
});

// Utility function to generate cache key
function generateCacheKey(options: { characterClass: string, race: string, traits?: string[], background?: string, personality?: string }): string {
  const keyParts = [
    options.characterClass, 
    options.race, 
    ...(options.traits || []).sort(),
    options.background || '',
    options.personality || ''
  ];
  return `avatar:${keyParts.join(':')}`;
}

// Prompt construction function
function constructPrompt(options: { 
  characterClass: string, 
  race: string, 
  traits?: string[], 
  background?: string, 
  personality?: string 
}): string {
  const { 
    characterClass, 
    race, 
    traits = [], 
    background = 'Adventurer seeking glory', 
    personality = 'Courageous and determined' 
  } = options;
  
  const equipmentMap: { [key: string]: string[] } = {
    'Warrior': ['full plate armor', 'longsword', 'kite shield', 'battle-worn gauntlets'],
    'Mage': ['elegant robes', 'staff of arcane power', 'spell component pouch', 'intricate magical amulet'],
    'Rogue': ['leather armor', 'daggers', 'hooded cloak', 'thieves\' tools'],
    'Cleric': ['chainmail', 'holy symbol', 'mace', 'healing potion'],
    'Ranger': ['studded leather armor', 'longbow', 'quiver of arrows', 'woodland cloak'],
    'Paladin': ['shining plate armor', 'holy avenger sword', 'sacred shield', 'emblazoned tabard'],
    'Barbarian': ['fur armor', 'massive two-handed axe', 'tribal war paint', 'bear fur cloak'],
    'Wizard': ['scholarly robes', 'spellbook', 'crystal focus', 'intricate magical rings']
  };

  const selectedEquipment = equipmentMap[characterClass] || [];
  const equipmentDesc = selectedEquipment.slice(0, 2).join(' and ');
  const additionalTraits = traits.join(', ');

  // Create a rich, detailed prompt with multiple descriptive elements
  const prompt = `Highly detailed fantasy character portrait of a ${race} ${characterClass}:
    - Wearing ${equipmentDesc}
    - Personality: ${personality}
    - Background: ${background}
    ${additionalTraits ? `- Unique Traits: ${additionalTraits}` : ''}
    
    Artistic Style:
    - High fantasy art style
    - Professional illustration
    - Intricate, realistic details
    - Dramatic, heroic pose
    - Epic lighting and composition
    - Vibrant, rich color palette
    - Sharp, clear focus on character
    - Cinematic quality rendering`;

  console.log('Constructed Detailed Prompt:', prompt);
  return prompt;
}

// Avatar generation function
async function generateAvatarFromHuggingFace(
  prompt: string, 
  onProgress?: (progress: number) => void,
  retries = 2
): Promise<string> {
  const HUGGING_FACE_MODELS = [
    'stabilityai/stable-diffusion-xl-base-1.0',
    'runwayml/stable-diffusion-v1-5',
    'CompVis/stable-diffusion-v1-4'
  ];

  const updateProgress = (loaded: number, total: number) => {
    if (onProgress) {
      const percentCompleted = Math.round((loaded / total) * 100);
      console.log(`Progress: ${percentCompleted}%`);
      onProgress(percentCompleted);
    }
  };

  try {
    const huggingFaceToken = process.env.HUGGINGFACE_API_TOKEN;

    if (!huggingFaceToken) {
      console.error('Hugging Face API Token is missing');
      throw new Error('Hugging Face API Token (HUGGINGFACE_API_TOKEN) is not configured');
    }

    console.log('Sending request to Hugging Face API');
    console.log('Prompt:', prompt);
    console.log('API Token:', huggingFaceToken ? 'Token present' : 'Token missing');

    // Try multiple models if one fails
    for (const model of HUGGING_FACE_MODELS) {
      try {
        const response = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`, 
          { inputs: prompt },
          {
            headers: {
              'Authorization': `Bearer ${huggingFaceToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000,
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              if (total) {
                updateProgress(loaded, total);
              }
            }
          }
        );

        // Simulate additional progress steps
        onProgress?.(80);
        await new Promise(resolve => setTimeout(resolve, 500));
        onProgress?.(90);
        await new Promise(resolve => setTimeout(resolve, 500));
        onProgress?.(100);

        return `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Model ${model} failed:`, errorMessage);
        
        // If it's the last model, rethrow the error
        if (model === HUGGING_FACE_MODELS[HUGGING_FACE_MODELS.length - 1]) {
          throw error;
        }
      }
    }

    throw new Error('All Hugging Face models failed');
  } catch (error: unknown) {
    console.error('=== HUGGING FACE API ERROR ===');
    
    if (axios.isAxiosError(error)) {
      console.error('Axios Error Details:', {
        response: error.response?.data ? Buffer.from(error.response.data).toString('utf-8') : 'No response data',
        status: error.response?.status,
        headers: error.response?.headers,
        message: error.message,
        config: error.config
      });
    } else {
      console.error('Non-Axios Error:', error instanceof Error ? error.message : String(error));
    }

    throw error;
  }
}

router.post('/generate-avatar', async (req, res) => {
  console.log('=== FULL REQUEST DETAILS ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);

  const { characterClass, race, traits, background, personality } = req.body;

  try {
    // Validate input with detailed logging
    if (!characterClass) {
      console.error('Missing characterClass');
      return res.status(400).json({ 
        error: 'Validation Error', 
        details: 'Character class is required',
        receivedBody: req.body
      });
    }

    if (!race) {
      console.error('Missing race');
      return res.status(400).json({ 
        error: 'Validation Error', 
        details: 'Race is required',
        receivedBody: req.body
      });
    }

    // Detailed logging of input parameters
    console.log('Input Parameters:', {
      characterClass,
      race,
      traits: traits || 'No traits provided',
      background: background || 'No background provided',
      personality: personality || 'No personality provided'
    });

    // Generate cache key
    const cacheKey = generateCacheKey({ characterClass, race, traits, background, personality });

    // Check cache
    const cachedAvatar = await redis.get(cacheKey);
    if (cachedAvatar) {
      console.log('Returning cached avatar');
      return res.json({ avatarUrl: cachedAvatar });
    }

    // Construct prompt
    const prompt = constructPrompt({ characterClass, race, traits, background, personality });
    console.log('Generated Prompt:', prompt);

    // Progress tracking function
    const progressCallback = (progress: number) => {
      console.log(`Progress update: ${progress}%`);
      // You could use a WebSocket or Server-Sent Events here for real-time updates
      // For now, we'll just log
    };

    // Generate avatar
    const avatarUrl = await generateAvatarFromHuggingFace(
      prompt, 
      progressCallback
    );

    // Cache the avatar
    await redis.set(cacheKey, avatarUrl, 'EX', 60 * 60 * 24); // 24-hour expiration

    // Send response
    res.json({ avatarUrl });
  } catch (error) {
    console.error('=== FULL ERROR DETAILS ===');
    console.error('Error Object:', error);
    
    // Determine the most appropriate error response
    if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    }

    res.status(500).json({ 
      error: 'Avatar Generation Failed', 
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      fullError: error
    });
  }
});

export default router;
