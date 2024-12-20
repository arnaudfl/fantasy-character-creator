import axios from 'axios';
import AvatarCacheService from './avatarCacheService';

interface AvatarGenerationOptions {
  characterClass: string;
  race: string;
  traits?: string[];
}

class AvatarGenerationService {
  private static API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  // Initialize cache on service startup
  static async initialize() {
    await AvatarCacheService.initializeCache();
  }

  // Main avatar generation method with caching
  static async generateAvatar(options: AvatarGenerationOptions): Promise<string> {
    try {
      // First, check cache
      const cachedAvatar = await AvatarCacheService.findCachedAvatar({
        characterClass: options.characterClass,
        race: options.race,
        traits: options.traits
      });

      if (cachedAvatar) {
        return cachedAvatar;
      }

      // If not in cache, call backend to generate avatar
      const response = await axios.post(`${this.API_BASE_URL}/avatars/generate-avatar`, options);
      const avatarUrl = response.data.avatarUrl;

      // Cache the generated avatar
      const cachedAvatarUrl = await AvatarCacheService.cacheAvatar(avatarUrl, {
        characterClass: options.characterClass,
        race: options.race,
        traits: options.traits
      });

      return cachedAvatarUrl;
    } catch (error) {
      console.error('Avatar generation error:', error);
      
      // Fallback mechanism
      return AvatarCacheService.generateFallbackAvatar({
        characterClass: options.characterClass,
        race: options.race,
        traits: options.traits
      });
    }
  }
}

export default AvatarGenerationService;
