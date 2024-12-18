import React, { useCallback, useMemo } from 'react';
import './BackgroundStoryGenerator.css';

const backgroundStoryData = {
  genres: [
    'Medieval Fantasy',
    'Dark Fantasy',
    'High Fantasy',
    'Steampunk Fantasy',
    'Mythological'
  ],
  origins: {
    Warrior: [
      'Born into a noble military family',
      'Survived a devastating village raid',
      'Trained from childhood in martial arts',
      'Seeking revenge for a personal loss',
      'Wandering mercenary with a mysterious past'
    ],
    Mage: [
      'Discovered magical talents in childhood',
      'Apprentice of a reclusive wizard',
      'Survivor of a magical catastrophe',
      'Outcast from a prestigious magical academy',
      'Inherited ancient magical bloodline'
    ],
    Rogue: [
      'Street urchin turned master thief',
      'Exiled from a secretive thieves\' guild',
      'Spy with multiple hidden identities',
      'Survivor of urban underworld conflicts',
      'Seeking redemption from a criminal past'
    ],
    Cleric: [
      'Devoted follower of a forgotten deity',
      'Survivor of religious persecution',
      'Chosen by divine intervention',
      'Missionary in hostile territories',
      'Protector of sacred ancient knowledge'
    ],
    Ranger: [
      'Last survivor of a destroyed wilderness tribe',
      'Guardian of sacred natural territories',
      'Exiled from civilization by choice',
      'Tracker and monster hunter',
      'Raised by wilderness creatures'
    ]
  },
  conflicts: [
    'Family betrayal',
    'Lost inheritance',
    'Ancient prophecy',
    'Unresolved childhood trauma',
    'Mysterious magical curse',
    'Political conspiracy',
    'Forbidden love',
    'Quest for personal redemption'
  ],
  goals: [
    'Restore family honor',
    'Uncover hidden truth',
    'Protect the innocent',
    'Seek ultimate power',
    'Find personal freedom',
    'Revenge against oppressors',
    'Discover ancient artifacts',
    'Become a legendary hero'
  ]
};

const BackgroundStoryGenerator = ({ 
  characterClass, 
  backgroundStory, 
  onBackgroundStoryGenerate 
}) => {
  // Memoize available origin options for the class
  const originOptions = useMemo(() => {
    return backgroundStoryData.origins[characterClass] || [];
  }, [characterClass]);

  // Generate random background story
  const generateRandomBackgroundStory = useCallback(() => {
    if (!characterClass) return null;

    const genre = backgroundStoryData.genres[
      Math.floor(Math.random() * backgroundStoryData.genres.length)
    ];

    const origin = originOptions[
      Math.floor(Math.random() * originOptions.length)
    ] || 'Mysterious Background';

    const conflict = backgroundStoryData.conflicts[
      Math.floor(Math.random() * backgroundStoryData.conflicts.length)
    ];

    const goal = backgroundStoryData.goals[
      Math.floor(Math.random() * backgroundStoryData.goals.length)
    ];

    return {
      genre,
      origin,
      conflict,
      goal,
      narrative: `In the realm of ${genre}, a ${characterClass.toLowerCase()} ${origin.toLowerCase()}. Haunted by ${conflict.toLowerCase()}, their ultimate goal is to ${goal.toLowerCase()}.`
    };
  }, [characterClass, originOptions]);

  // Handle random generation
  const handleRandomGenerate = useCallback(() => {
    const randomBackgroundStory = generateRandomBackgroundStory();
    if (randomBackgroundStory) {
      onBackgroundStoryGenerate(randomBackgroundStory);
    }
  }, [generateRandomBackgroundStory, onBackgroundStoryGenerate]);

  // Manual selection handler
  const handleManualSelect = useCallback((type, value) => {
    onBackgroundStoryGenerate({ 
      ...backgroundStory, 
      [type]: value 
    });
  }, [backgroundStory, onBackgroundStoryGenerate]);

  // If no background options for the class, return null
  if (!originOptions.length) return null;

  return (
    <div className="background-story-generator">
      <h3>Background Story for {characterClass}</h3>
      <button 
        type="button"
        className="generate-story-btn" 
        onClick={handleRandomGenerate}
      >
        Generate Background Story
      </button>
      {backgroundStory && (
        <div className="background-story-details">
          <p><strong>Genre:</strong> {backgroundStory.genre}</p>
          <p><strong>Origin:</strong> {backgroundStory.origin}</p>
          <p><strong>Conflict:</strong> {backgroundStory.conflict}</p>
          <p><strong>Goal:</strong> {backgroundStory.goal}</p>
          <p><strong>Narrative:</strong> {backgroundStory.narrative}</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(BackgroundStoryGenerator);
