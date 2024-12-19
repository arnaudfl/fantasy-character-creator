import axios from 'axios';
import { HUGGINGFACE_CONFIG } from '../config/huggingface';

// Define a type for the fallback avatars to ensure type safety
type FallbackAvatarKey = 
  | 'Human Warrior'
  | 'Elf Mage'
  | 'Dwarf Cleric'
  | 'Halfling Rogue'
  | 'Tiefling Warlock'
  | 'default';

// Predefined fallback avatars for different races and classes
const FALLBACK_AVATARS: Record<FallbackAvatarKey, string> = {
  'Human Warrior': '/avatars/human_warrior.svg',
  'Elf Mage': '/avatars/elf_mage.svg',
  'Dwarf Cleric': '/avatars/dwarf_cleric.svg',
  'Halfling Rogue': '/avatars/halfling_rogue.svg',
  'Tiefling Warlock': '/avatars/tiefling_warlock.svg',
  'default': '/avatars/default_character.svg'
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Save generated avatar to backend
export const saveAvatar = async (avatarData: string, characterName: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/save-avatar`, {
      avatarData,
      characterName
    });
    
    return response.data.path;
  } catch (error) {
    console.error('Avatar save failed:', error);
    throw error;
  }
};

export async function generateAvatar(prompt: string, characterName: string): Promise<string | null> {
  console.log('Attempting to generate avatar with config:', HUGGINGFACE_CONFIG);

  // Check if API token is set
  if (!HUGGINGFACE_CONFIG.API_TOKEN) {
    console.error(' Hugging Face API token is MISSING. Please set REACT_APP_HUGGINGFACE_API_TOKEN in .env');
    return null;
  }

  try {
    console.log(' Sending avatar generation request with prompt:', prompt);

    const response = await axios.post(
      HUGGINGFACE_CONFIG.API_URL,
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_CONFIG.API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log(' Avatar generation successful');
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(response.data);
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });

    // Save avatar and return the saved path
    const savedAvatarPath = await saveAvatar(base64, characterName);
    return savedAvatarPath;
  } catch (error: any) {
    console.error(' Avatar generation FAILED', error);

    // Detailed error logging
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', error.response.data);
    }

    // Handle specific error scenarios
    if (error.response && error.response.status === 429) {
      console.warn(' Rate limit exceeded. Using fallback avatar.');
      return generateFallbackAvatar({ race: 'Human', class: 'Warrior' });
    }

    // For other errors, return null or fallback
    console.warn(' Unexpected error. Using fallback avatar.');
    return null;
  }
}

// Function to generate a unique fallback avatar based on character details
export function generateFallbackAvatar(characterDetails: any): string {
  const { race, class: characterClass } = characterDetails;
  const fallbackKey = `${race} ${characterClass}` as FallbackAvatarKey;
  
  return FALLBACK_AVATARS[fallbackKey] || FALLBACK_AVATARS.default;
}
