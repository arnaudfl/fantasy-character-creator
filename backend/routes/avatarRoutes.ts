import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

interface AvatarGenerationRequest {
  characterClass: string;
  race: string;
  traits?: string[];
}

router.post('/generate-avatar', async (req, res) => {
  try {
    const { characterClass, race, traits } = req.body as AvatarGenerationRequest;

    // Construct detailed prompt
    const prompt = constructPrompt({ characterClass, race, traits });

    // Call Hugging Face API
    const avatarResponse = await callHuggingFaceAPI(prompt);

    res.json({ 
      avatarUrl: avatarResponse,
      prompt: prompt // Optional: return the prompt for debugging
    });
  } catch (error) {
    console.error('Avatar generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate avatar', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Reuse the prompt construction logic from frontend
function constructPrompt(options: AvatarGenerationRequest): string {
  const { characterClass, race, traits } = options;
  
  // Equipment mapping based on character class
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

  // Personality trait descriptors
  const personalityTraits: { [key: string]: string[] } = {
    'Warrior': ['stoic', 'battle-hardened', 'honorable', 'determined'],
    'Mage': ['mysterious', 'intellectual', 'analytical', 'arcane-focused'],
    'Rogue': ['cunning', 'street-smart', 'shadowy', 'quick-witted'],
    'Cleric': ['compassionate', 'devout', 'healing', 'righteous'],
    'Ranger': ['nature-connected', 'observant', 'wilderness-skilled', 'solitary'],
    'Paladin': ['noble', 'righteous', 'protective', 'zealous'],
    'Barbarian': ['fierce', 'primal', 'passionate', 'untamed'],
    'Wizard': ['scholarly', 'enigmatic', 'knowledge-seeking', 'contemplative']
  };

  // Backstory elements
  const backstoryElements: { [key: string]: string[] } = {
    'Warrior': ['raised in a military academy', 'seeking redemption', 'defending homeland', 'legendary battle survivor'],
    'Mage': ['arcane university graduate', 'searching for ancient knowledge', 'mysterious magical lineage', 'elemental prodigy'],
    'Rogue': ['street orphan', 'master of disguise', 'revenge-driven', 'guild-trained infiltrator'],
    'Cleric': ['divine mission', 'temple-raised', 'healing the wounded', 'fighting unholy forces'],
    'Ranger': ['forest guardian', 'last of a woodland clan', 'tracking ancient evil', 'nature\'s protector'],
    'Paladin': ['sworn to a holy order', 'righteous crusader', 'divine champion', 'fighting corruption'],
    'Barbarian': ['tribal warrior', 'wilderness survivor', 'seeking clan\'s honor', 'primal force of nature'],
    'Wizard': ['forbidden magic researcher', 'dimensional traveler', 'magical experiment survivor', 'arcane secrets seeker']
  };

  // Randomly select equipment, traits, and backstory
  const selectedEquipment = equipmentMap[characterClass] || [];
  const selectedTraits = personalityTraits[characterClass] || [];
  const selectedBackstory = backstoryElements[characterClass] || [];

  // Construct detailed prompt
  const basePrompt = `Fantasy RPG character, ${race} ${characterClass}, `;
  const equipmentDesc = selectedEquipment.slice(0, 2).join(' and ');
  const personalityDesc = selectedTraits.slice(0, 2).join(' and ');
  const backstoryDesc = selectedBackstory[Math.floor(Math.random() * selectedBackstory.length)];

  const additionalTraits = traits?.join(', ') || '';

  return `${basePrompt} equipped with ${equipmentDesc}, ${personalityDesc} personality, ${backstoryDesc} backstory, ${additionalTraits}, detailed illustration, high fantasy art style, dramatic lighting, epic composition`;
}

// API call to Hugging Face with retry mechanism
async function callHuggingFaceAPI(prompt: string, retries = 2): Promise<string> {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stable-diffusion-v1-5', 
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30 seconds timeout
        responseType: 'arraybuffer'
      }
    );

    // Convert response to data URL
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    if (retries > 0) {
      console.warn(`API call failed. Retrying... (${retries} attempts left)`);
      return callHuggingFaceAPI(prompt, retries - 1);
    }
    throw error;
  }
}

export default router;
