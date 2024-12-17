import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AvatarGenerator.css';

// SVG Path Components for Avatar Creation
const svgComponents = {
  faces: {
    human: [
      'M256 256c52.4 0 96-43.6 96-96s-43.6-96-96-96-96 43.6-96 96 43.6 96 96 96z',
      'M256 64c-52.8 0-96 43.2-96 96s43.2 96 96 96 96-43.2 96-96-43.2-96-96-96z'
    ],
    elf: [
      'M256 64c-70.4 0-128 57.6-128 128s57.6 128 128 128 128-57.6 128-128S326.4 64 256 64z M256 288c-52.8 0-96-43.2-96-96s43.2-96 96-96 96 43.2 96 96-43.2 96-96 96z',
      'M256 96c-52.8 0-96 43.2-96 96s43.2 96 96 96 96-43.2 96-96-43.2-96-96-96z'
    ],
    dwarf: [
      'M256 96c-35.2 0-64 28.8-64 64s28.8 64 64 64 64-28.8 64-64-28.8-64-64-64z',
      'M256 160c-35.2 0-64-28.8-64-64s28.8-64 64-64 64 28.8 64 64-28.8 64-64 64z'
    ]
  },
  hairStyles: {
    human: [
      'M160 96l96 96 96-96c0-53-43-96-96-96s-96 43-96 96z',
      'M128 128l128 128 128-128c0-70.4-57.6-128-128-128S128 57.6 128 128z'
    ],
    elf: [
      'M192 64l64 64 64-64c0-35.2-28.8-64-64-64s-64 28.8-64 64z',
      'M160 96l96 96 96-96c0-52.8-43.2-96-96-96s-96 43.2-96 96z'
    ],
    dwarf: [
      'M224 96l32 32 32-32c0-17.6-14.4-32-32-32s-32 14.4-32 32z',
      'M192 128l64 64 64-64c0-35.2-28.8-64-64-64s-64 28.8-64 64z'
    ]
  },
  eyeStyles: {
    human: [
      'M256 192c-35.2 0-64-28.8-64-64s28.8-64 64-64 64 28.8 64 64-28.8 64-64 64z',
      'M256 160c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z'
    ],
    elf: [
      'M256 160c-35.2 0-64-28.8-64-64s28.8-64 64-64 64 28.8 64 64-28.8 64-64 64z',
      'M256 128c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z'
    ],
    dwarf: [
      'M256 192c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32z',
      'M256 160c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z'
    ]
  }
};

const colorPalettes = {
  skinTones: [
    '#F5D5A0',  // Light
    '#E3B771',  // Medium
    '#B47B4E',  // Dark
    '#8B4513'   // Deep
  ],
  hairColors: [
    '#000000',  // Black
    '#8B4513',  // Brown
    '#D2691E',  // Auburn
    '#808080',  // Gray
    '#FFD700'   // Blonde
  ],
  eyeColors: [
    '#8B4513',  // Brown
    '#0000FF',  // Blue
    '#008000',  // Green
    '#A52A2A'   // Hazel
  ]
};

const getInitialConfig = (race) => {
  // Ensure race is valid, default to 'human' if not
  const validRace = svgComponents.faces[race] ? race : 'human';
  
  return {
    face: svgComponents.faces[validRace][0] || svgComponents.faces.human[0],
    hair: svgComponents.hairStyles[validRace][0] || svgComponents.hairStyles.human[0],
    eyes: svgComponents.eyeStyles[validRace][0] || svgComponents.eyeStyles.human[0],
    skinTone: colorPalettes.skinTones[0] || '#F5D5A0',
    hairColor: colorPalettes.hairColors[0] || '#000000',
    eyeColor: colorPalettes.eyeColors[0] || '#8B4513'
  };
};

const AvatarGenerator = ({ race = 'human', onAvatarGenerate }) => {
  const [avatarConfig, setAvatarConfig] = useState(() => getInitialConfig(race));
  const svgRef = useRef(null);
  const previousRace = useRef(race);
  const avatarUpdateRef = useRef(null);

  // Update avatar when race changes
  useEffect(() => {
    if (previousRace.current !== race) {
      const newConfig = getInitialConfig(race);
      setAvatarConfig(newConfig);
      previousRace.current = race;
      
      // Queue avatar generation
      avatarUpdateRef.current = newConfig;
    }

    // Process queued avatar update
    if (avatarUpdateRef.current) {
      const svgString = svgRef.current 
        ? new XMLSerializer().serializeToString(svgRef.current) 
        : null;
      
      onAvatarGenerate({
        svgString,
        ...avatarUpdateRef.current
      });
      
      avatarUpdateRef.current = null;
    }
  }, [race, onAvatarGenerate]);

  // Randomize avatar configuration
  const randomizeAvatar = useCallback(() => {
    const newConfig = {
      face: svgComponents.faces[race][Math.floor(Math.random() * svgComponents.faces[race].length)],
      hair: svgComponents.hairStyles[race][Math.floor(Math.random() * svgComponents.hairStyles[race].length)],
      eyes: svgComponents.eyeStyles[race][Math.floor(Math.random() * svgComponents.eyeStyles[race].length)],
      skinTone: colorPalettes.skinTones[Math.floor(Math.random() * colorPalettes.skinTones.length)],
      hairColor: colorPalettes.hairColors[Math.floor(Math.random() * colorPalettes.hairColors.length)],
      eyeColor: colorPalettes.eyeColors[Math.floor(Math.random() * colorPalettes.eyeColors.length)]
    };

    setAvatarConfig(newConfig);
    avatarUpdateRef.current = newConfig;

    // Explicitly generate SVG and call onAvatarGenerate
    const svgString = svgRef.current 
      ? new XMLSerializer().serializeToString(svgRef.current) 
      : null;
    
    onAvatarGenerate({
      svgString,
      ...newConfig
    });
  }, [race, onAvatarGenerate]);

  // Render avatar SVG
  const renderAvatar = () => {
    return (
      <svg 
        ref={svgRef} 
        viewBox="0 0 512 512" 
        xmlns="http://www.w3.org/2000/svg"
        width="200" 
        height="200"
      >
        {/* Face */}
        <path 
          d={avatarConfig.face} 
          fill={avatarConfig.skinTone} 
        />
        
        {/* Eyes */}
        <path 
          d={avatarConfig.eyes} 
          fill={avatarConfig.eyeColor} 
        />
        
        {/* Hair */}
        <path 
          d={avatarConfig.hair} 
          fill={avatarConfig.hairColor} 
        />
      </svg>
    );
  };

  return (
    <div className="avatar-generator">
      <h3>Avatar Generator</h3>
      <div className="avatar-preview">
        {renderAvatar()}
      </div>
      <div className="avatar-controls">
        <button 
          type="button" 
          onClick={randomizeAvatar}
          className="randomize-btn"
        >
          Randomize Avatar
        </button>
      </div>
    </div>
  );
};

export default React.memo(AvatarGenerator);
