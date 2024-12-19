import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

interface AvatarCacheEntry {
  id: string;
  url: string;
  generatedAt: number;
  metadata: {
    characterClass?: string;
    race?: string;
    traits?: string[];
  };
}

class AvatarCacheService {
  private static CACHE_DIR = path.join(process.cwd(), 'public', 'avatar-cache');
  private static CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static MAX_CACHE_SIZE = 100; // Max number of cached avatars

  // Ensure cache directory exists
  static async initializeCache() {
    await fs.ensureDir(this.CACHE_DIR);
  }

  // Generate a unique filename for the avatar
  private static generateUniqueFilename(extension: string = 'png'): string {
    return `${uuidv4()}.${extension}`;
  }

  // Check if avatar is already cached
  static async findCachedAvatar(metadata: AvatarCacheEntry['metadata']): Promise<string | null> {
    try {
      const cacheEntries = await this.readCacheIndex();
      const matchedEntry = cacheEntries.find(entry => 
        entry.metadata.characterClass === metadata.characterClass &&
        entry.metadata.race === metadata.race &&
        // Optional: Add more granular matching
        JSON.stringify(entry.metadata.traits) === JSON.stringify(metadata.traits)
      );

      if (matchedEntry) {
        const filePath = path.join(this.CACHE_DIR, path.basename(matchedEntry.url));
        const exists = await fs.pathExists(filePath);
        return exists ? filePath : null;
      }
      return null;
    } catch (error) {
      console.error('Error finding cached avatar:', error);
      return null;
    }
  }

  // Download and cache avatar
  static async cacheAvatar(
    imageUrl: string, 
    metadata: AvatarCacheEntry['metadata']
  ): Promise<string> {
    // Manage cache size before adding new entry
    await this.manageCacheSize();

    const filename = this.generateUniqueFilename();
    const localPath = path.join(this.CACHE_DIR, filename);

    try {
      // Download image
      const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream'
      });

      // Save to local cache
      await fs.writeFile(localPath, response.data);

      // Update cache index
      const cacheEntry: AvatarCacheEntry = {
        id: uuidv4(),
        url: `/avatar-cache/${filename}`,
        generatedAt: Date.now(),
        metadata
      };

      await this.updateCacheIndex(cacheEntry);

      return cacheEntry.url;
    } catch (error) {
      console.error('Error caching avatar:', error);
      throw error;
    }
  }

  // Manage cache size by removing old entries
  private static async manageCacheSize() {
    const cacheEntries = await this.readCacheIndex();
    
    // Sort entries by age (oldest first)
    const sortedEntries = cacheEntries.sort((a, b) => a.generatedAt - b.generatedAt);

    // Remove entries older than expiry or excess entries
    const now = Date.now();
    const entriesToRemove = sortedEntries.filter(
      entry => now - entry.generatedAt > this.CACHE_EXPIRY_MS || 
               sortedEntries.length > this.MAX_CACHE_SIZE
    );

    for (const entry of entriesToRemove) {
      const filePath = path.join(this.CACHE_DIR, path.basename(entry.url));
      await fs.remove(filePath);
    }

    // Update cache index
    const updatedEntries = sortedEntries.filter(
      entry => !entriesToRemove.includes(entry)
    );
    await this.writeCacheIndex(updatedEntries);
  }

  // Read cache index file
  private static async readCacheIndex(): Promise<AvatarCacheEntry[]> {
    const indexPath = path.join(this.CACHE_DIR, 'cache-index.json');
    try {
      return await fs.readJSON(indexPath, { throws: false }) || [];
    } catch {
      return [];
    }
  }

  // Write cache index file
  private static async writeCacheIndex(entries: AvatarCacheEntry[]) {
    const indexPath = path.join(this.CACHE_DIR, 'cache-index.json');
    await fs.writeJSON(indexPath, entries);
  }

  // Update cache index with new entry
  private static async updateCacheIndex(newEntry: AvatarCacheEntry) {
    const cacheEntries = await this.readCacheIndex();
    cacheEntries.push(newEntry);
    await this.writeCacheIndex(cacheEntries);
  }

  // Fallback avatar generation
  static async generateFallbackAvatar(metadata: AvatarCacheEntry['metadata']): Promise<string> {
    // Implement a simple fallback avatar generation method
    // Could be a default avatar or a procedurally generated placeholder
    const fallbackPath = path.join(process.cwd(), 'public', 'fallback-avatar.png');
    return fallbackPath;
  }
}

export default AvatarCacheService;
