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
  onAvatarGenerated?: (avatar: { svgString: string } | null) => void;
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

    try {
      const prompt = generateDetailedPrompt();
      console.log('Generated Prompt:', prompt);

      const imageResult = await generateAvatar(prompt);
      
      if (imageResult instanceof Blob) {
        const savedAvatarPath = await saveAvatarLocally(imageResult);
        
        if (savedAvatarPath) {
          setAvatar(savedAvatarPath);
          // Convert image URL to SVG-like object to match form validation
          const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350">
            <image href="${savedAvatarPath}" width="250" height="350"/>
          </svg>`;
          onAvatarGenerated?.({ svgString });
        } else {
          // Fallback to default avatar if generation fails
          const defaultAvatar = generateDefaultAvatar();
          setAvatar(defaultAvatar.url);
          onAvatarGenerated?.({ svgString: defaultAvatar.svgString });
        }
      } else if (typeof imageResult === 'string') {
        setAvatar(imageResult);
        // Convert image URL to SVG-like object to match form validation
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350">
          <image href="${imageResult}" width="250" height="350"/>
        </svg>`;
        onAvatarGenerated?.({ svgString });
      } else {
        // Generate default avatar if no image is created
        const defaultAvatar = generateDefaultAvatar();
        setAvatar(defaultAvatar.url);
        onAvatarGenerated?.({ svgString: defaultAvatar.svgString });
      }
    } catch (err) {
      // Generate default avatar on error
      const defaultAvatar = generateDefaultAvatar();
      setAvatar(defaultAvatar.url);
      onAvatarGenerated?.({ svgString: defaultAvatar.svgString });
      
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
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
