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

export async function generateAvatar(prompt: string): Promise<Blob | string | null> {
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
    return response.data;
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
      return FALLBACK_AVATARS.default;
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
