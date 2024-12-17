import React, { useCallback, useMemo } from 'react';
import './PersonalityGenerator.css';

const personalityData = {
  traits: [
    'Adventurous', 'Cautious', 'Impulsive', 'Methodical', 
    'Charismatic', 'Introverted', 'Loyal', 'Rebellious', 
    'Optimistic', 'Pessimistic', 'Compassionate', 'Ruthless'
  ],
  motivations: [
    'Revenge', 'Wealth', 'Power', 'Knowledge', 
    'Redemption', 'Family Honor', 'Personal Freedom', 
    'Protecting the Weak', 'Exploration', 'Spiritual Growth'
  ],
  fears: [
    'Failure', 'Betrayal', 'Darkness', 'Isolation', 
    'Loss of Control', 'Supernatural Entities', 
    'Abandonment', 'Public Humiliation'
  ],
  quirks: [
    'Talks to Inanimate Objects', 'Collects Unusual Items', 
    'Superstitious', 'Always Hums When Nervous', 
    'Obsessive About Cleanliness', 'Terrible Liar', 
    'Compulsive Storyteller', 'Afraid of Heights'
  ],
  backgrounds: {
    Warrior: [
      'Raised in a Military Family',
      'Orphaned During a War',
      'Former Mercenary',
      'Tribal Warrior',
      'Disgraced Knight Seeking Redemption'
    ],
    Mage: [
      'Apprentice of a Legendary Wizard',
      'Outcast from Magical Academy',
      'Self-Taught Mystic',
      'Inherited Magical Bloodline',
      'Seeking Forbidden Knowledge'
    ],
    Rogue: [
      'Street Urchin Turned Thief',
      'Exiled from Thieves\' Guild',
      'Spy with a Hidden Agenda',
      'Escaped Prisoner',
      'Robin Hood-like Vigilante'
    ],
    Cleric: [
      'Missionary in Foreign Lands',
      'Survivor of Religious Persecution',
      'Chosen by Divine Intervention',
      'Questioning Faith',
      'Protector of Sacred Relics'
    ],
    Ranger: [
      'Wilderness Survivor',
      'Last of a Destroyed Tribe',
      'Monster Hunter',
      'Nature Guardian',
      'Exiled from Civilization'
    ]
  }
};

const PersonalityGenerator = ({ 
  characterClass, 
  personality, 
  onPersonalityGenerate 
}) => {
  // Memoize available background options for the class
  const backgroundOptions = useMemo(() => {
    return personalityData.backgrounds[characterClass] || [];
  }, [characterClass]);

  // Generate random personality
  const generateRandomPersonality = useCallback(() => {
    // Only validate class selection
    if (!characterClass) return null;

    // Ensure at least 2 traits are selected
    const numTraits = Math.floor(Math.random() * 2) + 2;
    const randomTraits = [];
    const availableTraits = [...personalityData.traits];
    
    while (randomTraits.length < numTraits && availableTraits.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTraits.length);
      randomTraits.push(availableTraits.splice(randomIndex, 1)[0]);
    }

    // Fallback if no traits selected
    if (randomTraits.length === 0) {
      randomTraits.push(personalityData.traits[0]);
    }

    // Ensure a motivation is always selected
    const motivation = personalityData.motivations[
      Math.floor(Math.random() * personalityData.motivations.length)
    ] || 'Unknown Motivation';

    // Ensure a fear is always selected
    const fear = personalityData.fears[
      Math.floor(Math.random() * personalityData.fears.length)
    ] || 'No Specific Fear';

    // Ensure a quirk is always selected
    const quirk = personalityData.quirks[
      Math.floor(Math.random() * personalityData.quirks.length)
    ] || 'Unique Personality Trait';

    // Ensure a background is always selected
    const background = backgroundOptions[
      Math.floor(Math.random() * backgroundOptions.length)
    ] || 'Mysterious Past';

    return {
      traits: randomTraits,
      motivation,
      fear,
      quirk,
      background
    };
  }, [characterClass, backgroundOptions]);

  // Handle random generation button
  const handleRandomGenerate = useCallback(() => {
    const randomPersonality = generateRandomPersonality();
    if (randomPersonality) {
      onPersonalityGenerate(randomPersonality);
    } else {
      // Fallback personality generation
      const fallbackPersonality = {
        traits: [personalityData.traits[0]],
        motivation: personalityData.motivations[0],
        fear: personalityData.fears[0],
        quirk: personalityData.quirks[0],
        background: backgroundOptions[0] || 'Mysterious Past'
      };
      onPersonalityGenerate(fallbackPersonality);
    }
  }, [generateRandomPersonality, onPersonalityGenerate, backgroundOptions]);

  // Toggle trait selection
  const handleTraitToggle = useCallback((trait) => {
    const currentTraits = personality?.traits || [];
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait].slice(0, 3);

    onPersonalityGenerate({ 
      ...personality, 
      traits: newTraits 
    });
  }, [personality, onPersonalityGenerate]);

  // Manual selection for other personality aspects
  const handleManualSelect = useCallback((type, value) => {
    onPersonalityGenerate({ 
      ...personality, 
      [type]: value 
    });
  }, [personality, onPersonalityGenerate]);

  // If no personality data for the class, return null
  if (!backgroundOptions.length) return null;

  return (
    <div className="personality-generator">
      <h3>Personality for {characterClass}</h3>

      {/* Traits Selection */}
      <div className="personality-section">
        <div className="section-header">
          <h4>Traits</h4>
          <button 
            type="button"
            className="randomize-traits-btn" 
            onClick={() => {
              const randomTraits = generateRandomPersonality()?.traits || [];
              const randomMotivation = generateRandomPersonality()?.motivation || '';
              const randomFear = generateRandomPersonality()?.fear || '';
              const randomQuirk = generateRandomPersonality()?.quirk || '';
              const randomBackground = generateRandomPersonality()?.background || '';
              onPersonalityGenerate({ 
                ...personality, 
                traits: randomTraits,
                motivation: randomMotivation,
                fear: randomFear,
                quirk: randomQuirk,
                background: randomBackground
              });
            }}
          >
            Randomize Traits
          </button>
        </div>
        <div className="trait-grid">
          {personalityData.traits.map((trait) => (
            <div 
              key={trait}
              className={`trait-item ${
                personality?.traits?.includes(trait) ? 'selected' : ''
              }`}
              onClick={() => handleTraitToggle(trait)}
            >
              {trait}
            </div>
          ))}
        </div>
      </div>

      {/* Motivation Selection */}
      <div className="personality-section">
        <div className="section-header">
          <h4>Motivation</h4>
        </div>
        <select 
          value={personality?.motivation || ''}
          onChange={(e) => handleManualSelect('motivation', e.target.value)}
        >
          <option value="">Select Motivation</option>
          {personalityData.motivations.map((motivation) => (
            <option key={motivation} value={motivation}>
              {motivation}
            </option>
          ))}
        </select>
      </div>

      {/* Fear Selection */}
      <div className="personality-section">
        <div className="section-header">
          <h4>Fear</h4>
        </div>
        <select 
          value={personality?.fear || ''}
          onChange={(e) => handleManualSelect('fear', e.target.value)}
        >
          <option value="">Select Fear</option>
          {personalityData.fears.map((fear) => (
            <option key={fear} value={fear}>
              {fear}
            </option>
          ))}
        </select>
      </div>

      {/* Quirk Selection */}
      <div className="personality-section">
        <div className="section-header">
          <h4>Quirk</h4>
        </div>
        <select 
          value={personality?.quirk || ''}
          onChange={(e) => handleManualSelect('quirk', e.target.value)}
        >
          <option value="">Select Quirk</option>
          {personalityData.quirks.map((quirk) => (
            <option key={quirk} value={quirk}>
              {quirk}
            </option>
          ))}
        </select>
      </div>

      {/* Background Selection */}
      <div className="personality-section">
        <div className="section-header">
          <h4>Background</h4>
        </div>
        <select 
          value={personality?.background || ''}
          onChange={(e) => handleManualSelect('background', e.target.value)}
        >
          <option value="">Select Background</option>
          {backgroundOptions.map((background) => (
            <option key={background} value={background}>
              {background}
            </option>
          ))}
        </select>
      </div>

      {/* Random Generation Button */}
      <div className="personality-section">
        <button onClick={handleRandomGenerate}>
          Generate Random Personality
        </button>
      </div>
    </div>
  );
};

export default React.memo(PersonalityGenerator);
