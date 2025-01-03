import React from 'react';
import './CharacterPreview.css';

const CharacterPreview = ({ character, onUpdateAvatar }) => {
  // Early return if no character data
  if (!character || !character.race || !character.class) {
    return (
      <div className="character-preview-placeholder">
        <p>Create your character details to see a preview</p>
      </div>
    );
  }

  // Icon selection
  const getCharacterIcon = () => {
    const raceIcons = {
      'Human': '👤', 'Elf': '🧝', 'Dwarf': '⛏️', 
      'Halfling': '🍃', 'Orc': '🗡️', 'Tiefling': '😈', 
      'Dragonborn': '🐉', 'Gnome': '🧙‍♂️'
    };

    const classIcons = {
      'Warrior': '⚔️', 'Mage': '🔮', 'Rogue': '🗝️', 
      'Cleric': '✝️', 'Ranger': '🏹', 'Paladin': '🛡️', 
      'Barbarian': '💪', 'Wizard': '📜'
    };

    return raceIcons[character.race] || classIcons[character.class] || '🌟';
  };

  // Ability modifier calculation
  const calculateModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  // Ability scores
  const abilityScores = [
    { 
      name: 'Strength', 
      value: character.totalAbilityScores?.strength || 
             character.baseAbilityScores?.strength || 
             character.strength || 10 
    },
    { 
      name: 'Dexterity', 
      value: character.totalAbilityScores?.dexterity || 
             character.baseAbilityScores?.dexterity || 
             character.dexterity || 10 
    },
    { 
      name: 'Constitution', 
      value: character.totalAbilityScores?.constitution || 
             character.baseAbilityScores?.constitution || 
             character.constitution || 10 
    },
    { 
      name: 'Intelligence', 
      value: character.totalAbilityScores?.intelligence || 
             character.baseAbilityScores?.intelligence || 
             character.intelligence || 10 
    },
    { 
      name: 'Wisdom', 
      value: character.totalAbilityScores?.wisdom || 
             character.baseAbilityScores?.wisdom || 
             character.wisdom || 10 
    },
    { 
      name: 'Charisma', 
      value: character.totalAbilityScores?.charisma || 
             character.baseAbilityScores?.charisma || 
             character.charisma || 10 
    }
  ];

  const renderAvatar = () => {
    if (!character.avatar) {
      return <div className="no-avatar">No Avatar</div>;
    }
    
    // Directly use the avatar path as the image source with a smaller size
    return (
      <div className="character-avatar-container">
        <img 
          src={character.avatar} 
          alt={`${character.name}'s Avatar`} 
          className="character-avatar-small" 
        />
      </div>
    );
  };

  return (
    <div className="character-preview">
      {/* Header */}
      <div className="preview-header">
        <h2>{character.name || 'Unnamed Character'}</h2>
        <div className="preview-header-details">
          <span>{character.race}</span>
          <span>{character.class}</span>
        </div>
        
        {/* Avatar Preview */}
        {renderAvatar()}
      </div>

      {/* Ability Scores */}
      <div className="preview-abilities">
        <h3>Ability Scores</h3>
        <div className="ability-grid">
          {abilityScores.map((ability) => (
            <div key={ability.name} className="ability-item">
              <span className="ability-name">{ability.name}</span>
              <span className="character-preview-ability-score">
                {ability.value}
                <span className="ability-modifier">
                  ({calculateModifier(ability.value) >= 0 ? '+' : ''}{calculateModifier(ability.value)})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Preview */}
      {character.equipment && (
        <div className="preview-equipment">
          <h3>Equipment</h3>
          <div className="equipment-grid">
            {Object.entries(character.equipment).map(([type, items]) => {
              // Handle array of items or single item
              const itemsToRender = Array.isArray(items) ? items : [items];
              
              return itemsToRender.map((item, index) => {
                // Format complex item display
                const displayValue = item && typeof item === 'object'
                  ? (
                      item.name 
                      + (item.contents 
                        ? ` (${item.contents.join(', ')})` 
                        : '')
                      + (item.weight 
                        ? ` [${item.weight} lbs]` 
                        : '')
                    )
                  : item;
                
                return displayValue ? (
                  <div 
                    key={`${type}-${index}`} 
                    className="equipment-elt"
                  >
                    <span className="equipment-name">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <span className="equipment-value">
                      {displayValue}
                    </span>
                  </div>
                ) : null;
              });
            })}
          </div>
        </div>
      )}

      {/* Personality Preview */}
      {character.personality && (
        <div className="preview-personality">
          <h3>Personality</h3>
          <div className="personality-grid">
            {Object.entries(character.personality).map(([key, value]) => {
              // Handle different types of values
              const displayValue = Array.isArray(value) 
                ? value.join(', ') 
                : (value && typeof value === 'object' 
                  ? JSON.stringify(value) 
                  : value);
              
              return (value && displayValue) ? (
                <div key={key} className="personality-item">
                  <div className="personality-item-details">
                    <div className="personality-item-name">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div className="personality-item-description">
                      {displayValue}
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Background */}
      {character.background && (
        <div className="preview-background">
          <h3>Background</h3>
          <p>{character.background}</p>
        </div>
      )}

      {/* Background Story Preview */}
      {character.backgroundStory && (
        <div className="preview-background-story">
          <h3>Background Story</h3>
          <div className="background-story-details">
            <div className="background-story-item">
              <span className="background-story-label">Genre:</span>
              <span className="background-story-value">{character.backgroundStory.genre}</span>
            </div>
            <div className="background-story-item">
              <span className="background-story-label">Origin:</span>
              <span className="background-story-value">{character.backgroundStory.origin}</span>
            </div>
            <div className="background-story-item">
              <span className="background-story-label">Conflict:</span>
              <span className="background-story-value">{character.backgroundStory.conflict}</span>
            </div>
            <div className="background-story-item">
              <span className="background-story-label">Goal:</span>
              <span className="background-story-value">{character.backgroundStory.goal}</span>
            </div>
            <div className="background-story-narrative">
              <p>{character.backgroundStory.narrative}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CharacterPreview);
