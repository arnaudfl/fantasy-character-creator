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
    { name: 'Strength', value: character.strength || 10 },
    { name: 'Dexterity', value: character.dexterity || 10 },
    { name: 'Constitution', value: character.constitution || 10 },
    { name: 'Intelligence', value: character.intelligence || 10 },
    { name: 'Wisdom', value: character.wisdom || 10 },
    { name: 'Charisma', value: character.charisma || 10 }
  ];

  return (
    <div className="character-preview">
      {/* Header */}
      <div className="preview-header">
        <div className="preview-icon">{getCharacterIcon()}</div>
        <div className="preview-title">
          <h2>{character.name || 'Unnamed Character'}</h2>
          <p className="preview-subheader">
            {character.race} {character.class}
          </p>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="preview-abilities">
        <h3>Ability Scores</h3>
        <div className="ability-grid">
          {abilityScores.map((ability) => (
            <div key={ability.name} className="ability-item">
              <span className="ability-name">{ability.name}</span>
              <span className="ability-score">
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
    </div>
  );
};

export default React.memo(CharacterPreview);
