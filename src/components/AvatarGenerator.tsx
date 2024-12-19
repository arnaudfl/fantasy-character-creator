import React, { useState, useCallback, useMemo } from 'react';
import { generateAvatar, generateFallbackAvatar } from '../services/avatarService';
import './AvatarGenerator.css';

// Extend Window interface to include File System Access API
interface ExtendedWindow extends Window {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

// Type definitions for File System Access API
interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
}

interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
}

interface CharacterDetails {
  name: string;
  race: string;
  class: string;
  background?: string;
  alignment?: string;
  level?: number;
  avatarPath?: string; 
  stats?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  traits?: string[];
  equipment?: string[];
}

interface AvatarGeneratorProps {
  characterDetails: CharacterDetails;
  onAvatarGenerated?: (avatar: { avatarPath: string; filename: string } | null) => void;
}

const DEFAULT_AVATARS: { [key: string]: string } = {
  'Barbarian': 'https://example.com/barbarian-default.svg',
  'Bard': 'https://example.com/bard-default.svg',
  'Cleric': 'https://example.com/cleric-default.svg',
  'Druid': 'https://example.com/druid-default.svg',
  'Fighter': 'https://example.com/fighter-default.svg',
  'Monk': 'https://example.com/monk-default.svg',
  'Paladin': 'https://example.com/paladin-default.svg',
  'Ranger': 'https://example.com/ranger-default.svg',
  'Rogue': 'https://example.com/rogue-default.svg',
  'Sorcerer': 'https://example.com/sorcerer-default.svg',
  'Warlock': 'https://example.com/warlock-default.svg',
  'Wizard': 'https://example.com/wizard-default.svg'
};

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ 
  characterDetails, 
  onAvatarGenerated 
}) => {
  const [avatar, setAvatar] = useState<string | null>(characterDetails.avatarPath || null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Comprehensive check for character details completeness
  const isFormComplete = useMemo(() => {
    // Check basic required fields
    const hasBasicDetails = !!(
      characterDetails.name && 
      characterDetails.race && 
      characterDetails.class
    );

    return hasBasicDetails;
  }, [characterDetails]);

  const saveAvatarLocally = useCallback(async (blob: Blob) => {
    try {
      // Check if File System Access API is available
      const extendedWindow = window as ExtendedWindow;
      
      if (extendedWindow.showSaveFilePicker) {
        const filename = `${characterDetails.name.toLowerCase().replace(/\s+/g, '_')}_avatar.png`;
        
        const fileHandle = await extendedWindow.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Character Avatar',
            accept: {'image/png': ['.png']}
          }],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        // Create a local file URL to use for display and storage
        const avatarPath = URL.createObjectURL(blob);
        return avatarPath;
      } else {
        // Fallback for browsers without File System Access API
        const avatarPath = URL.createObjectURL(blob);
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = avatarPath;
        downloadLink.download = `${characterDetails.name.toLowerCase().replace(/\s+/g, '_')}_avatar.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        return avatarPath;
      }
    } catch (error) {
      console.error('Error saving avatar:', error);
      
      // Fallback download method
      const avatarPath = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = avatarPath;
      downloadLink.download = `${characterDetails.name.toLowerCase().replace(/\s+/g, '_')}_avatar.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      return avatarPath;
    }
  }, [characterDetails.name]);

  const generateDefaultAvatar = useCallback(() => {
    const defaultAvatarUrl = DEFAULT_AVATARS[characterDetails.class] || 
      'https://example.com/default-character.svg';
    
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350">
      <image href="${defaultAvatarUrl}" width="250" height="350"/>
    </svg>`;
    
    return { 
      svgString, 
      url: defaultAvatarUrl 
    };
  }, [characterDetails.class]);

  const generateDetailedPrompt = () => {
    let prompt = `Detailed fantasy character portrait of a ${characterDetails.race} ${characterDetails.class}, named ${characterDetails.name}`;

    if (characterDetails.background) {
      prompt += `, with a ${characterDetails.background} background`;
    }
    if (characterDetails.alignment) {
      prompt += `, ${characterDetails.alignment} alignment`;
    }

    if (characterDetails.level) {
      prompt += `, level ${characterDetails.level}`;
    }

    const primaryStats = Object.entries(characterDetails.stats || {})
      .filter(([_, value]) => value && value > 14)
      .map(([stat, value]) => `high ${stat}`);
    
    if (primaryStats.length > 0) {
      prompt += `, with ${primaryStats.join(' and ')}`;
    }

    if (characterDetails.traits && characterDetails.traits.length > 0) {
      prompt += `, notable traits: ${characterDetails.traits.join(', ')}`;
    }

    if (characterDetails.equipment && characterDetails.equipment.length > 0) {
      prompt += `, equipped with ${characterDetails.equipment.join(', ')}`;
    }

    prompt += `, professional illustration, high fantasy style, intricate details, dynamic pose, vibrant colors, epic fantasy artwork`;

    return prompt;
  };

  const generateCharacterAvatar = async () => {
    if (!isFormComplete) {
      setError('Please complete the character form first.');
      onAvatarGenerated?.(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Simulate initial progress
    setProgress(10);

    try {
      console.log('Sending Avatar Generation Request:', {
        characterClass: characterDetails.class,
        race: characterDetails.race,
        traits: characterDetails.traits,
        background: characterDetails.background,
        personality: characterDetails.alignment || 'Courageous adventurer'
      });

      // Simulate progress increments
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress < 70) {
            return prevProgress + Math.floor(Math.random() * 10);
          }
          clearInterval(progressInterval);
          return prevProgress;
        });
      }, 1000);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/generate-avatar`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            characterClass: characterDetails.class,
            race: characterDetails.race,
            traits: characterDetails.traits,
            background: characterDetails.background,
            personality: characterDetails.alignment || 'Courageous adventurer'
          })
        }
      );

      // Clear the interval when the request completes
      clearInterval(progressInterval);

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Avatar generation failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received Avatar Data:', data);

      if (data.avatarUrl) {
        setAvatar(data.avatarUrl);
        setProgress(100);
        onAvatarGenerated?.({ 
          avatarPath: data.avatarUrl, 
          filename: `${characterDetails.name.toLowerCase().replace(/\s+/g, '_')}_avatar.png` 
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Avatar generation failed:', error);
      setIsLoading(false);
      setProgress(0);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const clearAvatar = () => {
    if (avatar) {
      URL.revokeObjectURL(avatar);
    }
    setAvatar(null);
    onAvatarGenerated?.(null);
  };

  return (
    <div className="avatar-generator-container">
      <div className="avatar-generation-controls">
        <button 
          onClick={generateCharacterAvatar}
          disabled={!isFormComplete || isLoading}
          className="generate-avatar-btn"
        >
          {isLoading ? 'Generating...' : 'Generate AI Avatar (Optional)'}
        </button>
        
        {avatar && (
          <button 
            onClick={clearAvatar}
            className="clear-avatar-btn"
          >
            Clear Avatar
          </button>
        )}
      </div>
      
      {!isFormComplete && (
        <div className="character-incomplete-warning">
          Please complete all required character details to generate an avatar.
        </div>
      )}
      
      {error && (
        <div className="avatar-error-message">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}
      
      {avatar && (
        <div className="avatar-preview-container">
          <h3 className="avatar-preview-title">Character Avatar</h3>
          <img 
            src={avatar} 
            alt={`Avatar for ${characterDetails.name}`} 
            className="avatar-preview-image"
          />
        </div>
      )}
    </div>
  );
};

export default AvatarGenerator;
