import React, { useState, useCallback, useEffect } from 'react';
import CharacterStorageManager from '../utils/CharacterStorageManager';
import CharacterPreview from './CharacterPreview';
import EquipmentSelector from './EquipmentSelector';
import PersonalityGenerator from './PersonalityGenerator';
import AvatarGenerator from './AvatarGenerator';
import AbilityScoreManager from './AbilityScoreManager';
import CharacterOptimizer from './CharacterOptimizer';
import DiceRollSimulator from './DiceRollSimulator';
import InteractiveGuide from './InteractiveGuide';
import './CharacterForm.css';

const characterOptions = {
  races: [
    { 
      name: 'Human', 
      description: 'Versatile and adaptable, humans excel in any class and are known for their ambition and potential.',
      abilityBonus: 'Flexible +1 to any two abilities'
    },
    { 
      name: 'Elf', 
      description: 'Graceful and magical, elves are naturally adept at magic and ranged combat.',
      abilityBonus: '+2 Dexterity, +1 Intelligence'
    },
    { 
      name: 'Dwarf', 
      description: 'Sturdy mountain-dwellers known for their craftsmanship and resilience.',
      abilityBonus: '+2 Constitution, +1 Strength'
    },
    { 
      name: 'Halfling', 
      description: 'Small but nimble, halflings are clever and lucky, excelling in stealth and agility.',
      abilityBonus: '+2 Dexterity, +1 Charisma'
    },
    { 
      name: 'Orc', 
      description: 'Powerful and fierce warriors with a strong tribal culture.',
      abilityBonus: '+2 Strength, +1 Constitution'
    },
    { 
      name: 'Tiefling', 
      description: 'Infernal descendants with innate magical abilities and a mysterious heritage.',
      abilityBonus: '+2 Charisma, +1 Intelligence'
    },
    { 
      name: 'Dragonborn', 
      description: 'Proud warrior race descended from dragons, with elemental breath weapons.',
      abilityBonus: '+2 Strength, +1 Charisma'
    },
    { 
      name: 'Gnome', 
      description: 'Small, inventive, and magical beings with a love for technology and illusions.',
      abilityBonus: '+2 Intelligence, +1 Dexterity'
    }
  ],
  classes: [
    { 
      name: 'Warrior', 
      description: 'Masters of martial combat, skilled with weapons and armor.',
      primaryAbilities: ['Strength', 'Constitution']
    },
    { 
      name: 'Mage', 
      description: 'Scholarly magic users who bend reality through arcane study.',
      primaryAbilities: ['Intelligence', 'Dexterity']
    },
    { 
      name: 'Rogue', 
      description: 'Stealthy and cunning experts in subterfuge and precision attacks.',
      primaryAbilities: ['Dexterity', 'Charisma']
    },
    { 
      name: 'Cleric', 
      description: 'Divine spellcasters who channel the power of their deity.',
      primaryAbilities: ['Wisdom', 'Constitution']
    },
    { 
      name: 'Ranger', 
      description: 'Nature-bonded warriors skilled in wilderness survival and archery.',
      primaryAbilities: ['Dexterity', 'Wisdom']
    },
    { 
      name: 'Paladin', 
      description: 'Holy warriors combining martial prowess with divine magic.',
      primaryAbilities: ['Strength', 'Charisma']
    },
    { 
      name: 'Barbarian', 
      description: 'Fierce warriors who channel raw rage and primal strength in battle.',
      primaryAbilities: ['Strength', 'Constitution']
    },
    { 
      name: 'Wizard', 
      description: 'Intellectual spellcasters who study and manipulate arcane energies.',
      primaryAbilities: ['Intelligence', 'Dexterity']
    }
  ]
};

const CharacterForm = () => {
  const [character, setCharacter] = useState({
    id: null,
    name: '',
    race: '',
    class: '',
    background: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    baseAbilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    totalAbilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    raceAbilityModifiers: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    },
    specialAbility: '',
    equipment: null,
    personality: null,
    avatar: null,
    optimization: null
  });

  const [errors, setErrors] = useState({});
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [shareableURL, setShareableURL] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [abilityScoreMethod, setAbilityScoreMethod] = useState('manual');
  
  useEffect(() => {
    const characters = CharacterStorageManager.getAllCharacters();
    setSavedCharacters(characters);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCharacter = urlParams.get('character');
    
    if (sharedCharacter) {
      try {
        const decodedCharacter = CharacterStorageManager.decodeShareableURL(sharedCharacter);
        if (decodedCharacter) {
          setCharacter(prevCharacter => ({
            ...prevCharacter,
            ...decodedCharacter
          }));
        }
      } catch (error) {
        console.error('Error decoding shared character', error);
      }
    }
  }, []);

  const validateForm = (skipPersonality = false) => {
    const newErrors = {};

    // Clear previous errors first
    setErrors({});

    console.log('Validating form with character:', JSON.stringify(character, null, 2));

    if (!character.name?.trim()) {
      newErrors.name = 'Character name is required';
    }

    if (!character.race) {
      newErrors.race = 'Please select a race';
    }

    if (!character.class) {
      newErrors.class = 'Please select a class';
    }

    // Only check these in final validation
    if (!skipPersonality) {
      // Detailed equipment validation with comprehensive logging
      const hasWeapon = character.equipment?.weapon !== undefined && character.equipment.weapon !== null;
      const hasArmor = character.equipment?.armor !== undefined && character.equipment.armor !== null;
      const hasShield = character.equipment?.shield !== undefined && character.equipment.shield !== null;
      const hasAccessories = character.equipment?.accessories && character.equipment.accessories.length > 0;

      console.log('Equipment Validation Details:', {
        hasWeapon,
        hasArmor, 
        hasShield,
        hasAccessories,
        fullEquipment: character.equipment
      });

      const hasEquipment = hasWeapon || hasArmor || hasShield || hasAccessories;

      console.log('Equipment validation:', {
        hasEquipment,
        equipment: character.equipment
      });

      if (!hasEquipment) {
        newErrors.equipment = 'Please select some equipment';
      }

      console.log('Personality validation:', {
        personality: character.personality,
        traits: character.personality?.traits?.length,
        motivation: character.personality?.motivation,
        fear: character.personality?.fear,
        quirk: character.personality?.quirk,
        background: character.personality?.background
      });

      if (!character.personality || 
          (!character.personality.traits?.length && 
           !character.personality.motivation && 
           !character.personality.fear && 
           !character.personality.quirk && 
           !character.personality.background)) {
        newErrors.personality = 'Please generate or select a personality';
      }

      if (!character.avatar || !character.avatar.svgString) {
        newErrors.avatar = 'Please generate an avatar';
      }

      if (!character.baseAbilityScores) {
        newErrors.abilityScores = 'Please allocate ability scores';
      }
    }

    console.log('Validation errors:', newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateCharacter = (newCharacter) => {
    setCharacter(prevCharacter => ({
      ...prevCharacter,
      ...newCharacter
    }));
  };

  const handleAbilityScoreUpdate = useCallback((abilityScoreData) => {
    // Update character state with ability scores
    setCharacter(prevCharacter => ({
      ...prevCharacter,
      baseAbilityScores: abilityScoreData.baseScores,
      totalAbilityScores: abilityScoreData.totalScores,
      raceAbilityModifiers: abilityScoreData.raceModifiers,
      strength: abilityScoreData.totalScores.strength,
      dexterity: abilityScoreData.totalScores.dexterity,
      constitution: abilityScoreData.totalScores.constitution,
      intelligence: abilityScoreData.totalScores.intelligence,
      wisdom: abilityScoreData.totalScores.wisdom,
      charisma: abilityScoreData.totalScores.charisma
    }));

    // Clear any ability score errors
    setErrors(prevErrors => {
      const newErrors = {...prevErrors};
      delete newErrors.abilityScores;
      return newErrors;
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm(false)) {
      // Save the character
      const savedCharacterId = CharacterStorageManager.saveCharacter(character);
      
      if (savedCharacterId) {
        // Generate a shareable URL
        const shareableURL = CharacterStorageManager.generateShareableURL(character);
        setShareableURL(shareableURL);

        // Update saved characters list
        const updatedSavedCharacters = CharacterStorageManager.getAllCharacters();
        setSavedCharacters(updatedSavedCharacters);

        // Show success message
        alert('Character created successfully!');
        
        // Optional: Reset form or navigate
        // setCharacter(initialCharacterState);
      } else {
        alert('Failed to save character. Please check your data.');
      }
    } else {
      alert('Please complete all required fields.');
    }
  };

  const handleLoadCharacter = (characterId) => {
    const loadedCharacter = CharacterStorageManager.getCharacterById(characterId);
    if (loadedCharacter) {
      setCharacter(loadedCharacter);
    }
  };

  const handleDeleteCharacter = (characterId) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      CharacterStorageManager.deleteCharacter(characterId);
      // Optionally, refresh the list of saved characters
      setSavedCharacters(CharacterStorageManager.getAllCharacters());
    }
  };

  const handleExportCharacters = () => {
    CharacterStorageManager.exportCharacters();
  };

  const handleImportCharacters = (event) => {
    const file = event.target.files[0];
    if (file) {
      CharacterStorageManager.importCharacters(file)
        .then((importedCount) => {
          alert(`Successfully imported ${importedCount} characters`);
          // Refresh saved characters list
          setSavedCharacters(CharacterStorageManager.getAllCharacters());
        })
        .catch((error) => {
          alert('Failed to import characters');
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateCharacter({ [name]: value });
  };

  const handleEquipmentSelect = (equipment) => {
    updateCharacter({ equipment });
  };

  const handleAvatarGenerate = (avatar) => {
    updateCharacter({ avatar });
  };

  const handlePersonalityGenerate = (personality) => {
    updateCharacter({ personality });
  };

  const handleOptimizationUpdate = (optimization) => {
    updateCharacter({ optimization });
  };

  const toggleAbilityScoreMethod = () => {
    setAbilityScoreMethod(abilityScoreMethod === 'manual' ? 'diceRoll' : 'manual');
  };

  const handleDiceRollComplete = (rollResult) => {
    const baseScores = {
      strength: rollResult.total,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };

    const totalScores = {
      ...baseScores,
      ...character.raceAbilityModifiers
    };

    handleAbilityScoreUpdate({
      baseScores,
      totalScores,
      raceModifiers: character.raceAbilityModifiers
    });
  };

  const renderSavedCharacters = () => {
    return (
      <div className="saved-characters-section">
        <h3>Saved Characters</h3>
        {savedCharacters.length === 0 ? (
          <p>No saved characters yet.</p>
        ) : (
          <div className="saved-characters-list">
            {savedCharacters.map((savedChar) => (
              <div key={savedChar.id} className="saved-character-item">
                <span>{savedChar.name} ({savedChar.race} {savedChar.class})</span>
                <div className="saved-character-actions">
                  <button 
                    onClick={() => handleLoadCharacter(savedChar.id)}
                    title="Load Character"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => handleDeleteCharacter(savedChar.id)}
                    title="Delete Character"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="character-export-import">
          <button 
            onClick={handleExportCharacters}
            title="Export All Characters"
          >
            Export Characters
          </button>
          <label className="import-characters-label">
            Import Characters
            <input 
              type="file" 
              accept=".json"
              onChange={handleImportCharacters}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="character-creation">
      <div className="character-form">
        <div className="character-form-header">
          <h1>Create Your Fantasy Character</h1>
          
          {/* Restore Guide Launcher */}
          <div className="guide-launcher">
            <button 
              onClick={() => setIsGuideOpen(true)} 
              className="guide-btn"
            >
              <span className="guide-btn-icon">🧭</span>
              Character Creation Guide
            </button>
          </div>
        </div>

        <InteractiveGuide 
          isOpen={isGuideOpen} 
          onClose={() => setIsGuideOpen(false)} 
        />

        <form onSubmit={handleSubmit} className="character-form">
          {/* Name Input with Guide Target */}
          <div className="form-group" id="name-input">
            <label htmlFor="name">Character Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={character.name || ''}
              onChange={handleChange}
              placeholder="Enter character name"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Race Selection with Guide Target */}
          <div className="form-group" id="race-select">
            <label htmlFor="race">Race</label>
            <select
              id="race"
              name="race"
              value={character.race || ''}
              onChange={handleChange}
              className={errors.race ? 'input-error' : ''}
            >
              <option value="">Select Race</option>
              {characterOptions.races.map((race) => (
                <option key={race.name} value={race.name}>
                  {race.name}
                </option>
              ))}
            </select>
            {errors.race && <span className="error-message">{errors.race}</span>}
          </div>

          {/* Class Selection with Guide Target */}
          <div className="form-group" id="class-select">
            <label htmlFor="class">Class</label>
            <select
              id="class"
              name="class"
              value={character.class || ''}
              onChange={handleChange}
              className={errors.class ? 'input-error' : ''}
            >
              <option value="">Select Class</option>
              {characterOptions.classes.map((characterClass) => (
                <option key={characterClass.name} value={characterClass.name}>
                  {characterClass.name}
                </option>
              ))}
            </select>
            {errors.class && <span className="error-message">{errors.class}</span>}
          </div>

          {/* Ability Score Section with Guide Target */}
          <div className="form-group" id="ability-scores">
            <h3>Ability Scores</h3>
            
            {/* Ability Score Method Toggle */}
            <div className="ability-score-method-toggle">
              <button 
                type="button" 
                onClick={toggleAbilityScoreMethod}
                className="toggle-btn"
              >
                {abilityScoreMethod === 'manual' 
                  ? 'Switch to Dice Roll' 
                  : 'Switch to Manual'}
              </button>
            </div>

            {abilityScoreMethod === 'manual' ? (
              <AbilityScoreManager 
                race={character.race} 
                onAbilityScoreUpdate={handleAbilityScoreUpdate}
              />
            ) : (
              <DiceRollSimulator 
                onRollComplete={handleDiceRollComplete}
              />
            )}
          </div>

          {/* Equipment Selector with Guide Target */}
          <div id="equipment-selector">
            {character.class && (
              <EquipmentSelector 
                characterClass={character.class} 
                selectedEquipment={character.equipment}
                onEquipmentSelect={(newEquipment) => {
                  updateCharacter({ equipment: newEquipment });
                }}
              />
            )}
            {errors.equipment && <span className="error-message">{errors.equipment}</span>}
          </div>

          {/* Character Optimizer with Guide Target */}
          <div id="character-optimizer">
            {character.baseAbilityScores && (
              <CharacterOptimizer 
                baseAbilityScores={character.baseAbilityScores}
                race={character.race}
                characterClass={character.class}
                onOptimizationUpdate={handleOptimizationUpdate}
              />
            )}
          </div>

          {/* Avatar Generator with Guide Target */}
          <div id="avatar-generator">
            {character.race && (
              <AvatarGenerator 
                race={character.race.toLowerCase()} 
                onAvatarGenerate={handleAvatarGenerate}
              />
            )}
          </div>

          {/* Personality Generator with Guide Target */}
          <div id="personality-generator">
            {character.class && (
              <PersonalityGenerator 
                characterClass={character.class} 
                personality={character.personality}
                onPersonalityGenerate={(newPersonality) => {
                  updateCharacter({ personality: newPersonality });
                }}
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="form-group submit-section">
            <button type="submit" className="submit-btn">
              Create Character
            </button>
          </div>
        </form>
      </div>

      {/* Add CharacterPreview in a separate container */}
      <div className="character-preview-container">
        <CharacterPreview character={character} />
      </div>

      {/* Saved Characters Section */}
      {renderSavedCharacters()}
    </div>
  );
};

export default CharacterForm;
