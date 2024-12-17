import React, { useState, useEffect } from 'react';
import './CharacterOptimizer.css';

const classOptimizationData = {
  Warrior: {
    primaryAbilities: ['strength', 'constitution'],
    secondaryAbilities: ['dexterity'],
    optimalDistribution: {
      strength: { min: 14, ideal: 16 },
      constitution: { min: 14, ideal: 15 },
      dexterity: { min: 12, ideal: 14 }
    },
    compatibleRaces: ['Human', 'Dwarf', 'Half-Orc'],
    warnings: [
      'High strength crucial for melee combat',
      'Constitution helps survivability'
    ]
  },
  Mage: {
    primaryAbilities: ['intelligence', 'dexterity'],
    secondaryAbilities: ['constitution'],
    optimalDistribution: {
      intelligence: { min: 15, ideal: 16 },
      dexterity: { min: 12, ideal: 14 },
      constitution: { min: 12, ideal: 13 }
    },
    compatibleRaces: ['Elf', 'Tiefling', 'Human'],
    warnings: [
      'Intelligence drives spell power',
      'Dexterity helps with spell casting and defense'
    ]
  },
  Rogue: {
    primaryAbilities: ['dexterity', 'charisma'],
    secondaryAbilities: ['intelligence'],
    optimalDistribution: {
      dexterity: { min: 15, ideal: 16 },
      charisma: { min: 13, ideal: 14 },
      intelligence: { min: 12, ideal: 13 }
    },
    compatibleRaces: ['Halfling', 'Elf', 'Human'],
    warnings: [
      'Dexterity is critical for stealth and precision',
      'Charisma helps with social interactions'
    ]
  },
  Cleric: {
    primaryAbilities: ['wisdom', 'constitution'],
    secondaryAbilities: ['strength'],
    optimalDistribution: {
      wisdom: { min: 14, ideal: 16 },
      constitution: { min: 14, ideal: 15 },
      strength: { min: 12, ideal: 13 }
    },
    compatibleRaces: ['Human', 'Dwarf', 'Half-Elf'],
    warnings: [
      'Wisdom powers divine magic',
      'Constitution helps with healing and survival'
    ]
  },
  Ranger: {
    primaryAbilities: ['dexterity', 'wisdom'],
    secondaryAbilities: ['constitution'],
    optimalDistribution: {
      dexterity: { min: 15, ideal: 16 },
      wisdom: { min: 14, ideal: 15 },
      constitution: { min: 12, ideal: 13 }
    },
    compatibleRaces: ['Elf', 'Human', 'Half-Elf'],
    warnings: [
      'Dexterity crucial for ranged and melee combat',
      'Wisdom enhances nature-based abilities'
    ]
  }
};

const CharacterOptimizer = ({ 
  race, 
  characterClass, 
  abilityScores, 
  onOptimizationUpdate 
}) => {
  const [optimizationResults, setOptimizationResults] = useState({
    compatibilityScore: 0,
    suggestions: [],
    warnings: [],
    raceClassSynergy: null
  });

  useEffect(() => {
    if (!race || !characterClass || !abilityScores) return;

    const classData = classOptimizationData[characterClass];
    if (!classData) return;

    const results = {
      compatibilityScore: 50, // Default to a neutral score
      suggestions: [],
      warnings: [...classData.warnings],
      raceClassSynergy: null
    };

    // Race and Class Compatibility Check
    if (classData.compatibleRaces.includes(race)) {
      results.raceClassSynergy = 'Excellent';
      results.compatibilityScore += 20;
    } else {
      results.raceClassSynergy = 'Moderate';
      results.compatibilityScore += 10;
    }

    // Ability Score Optimization
    classData.primaryAbilities.forEach(ability => {
      const score = abilityScores[ability];
      const { min, ideal } = classData.optimalDistribution[ability];

      if (score < min) {
        results.suggestions.push({
          type: 'suggestion',
          message: `${ability.charAt(0).toUpperCase() + ability.slice(1)} could be improved`,
          recommendedAction: `Consider increasing ${ability} to at least ${min}`
        });
        results.compatibilityScore -= 5;
      } else if (score < ideal) {
        results.suggestions.push({
          type: 'info',
          message: `${ability.charAt(0).toUpperCase() + ability.slice(1)} has room for improvement`,
          recommendedAction: `Aim to increase ${ability} to ${ideal} for optimal performance`
        });
        results.compatibilityScore += 5;
      } else {
        results.compatibilityScore += 10;
      }
    });

    // Secondary Abilities Check
    classData.secondaryAbilities.forEach(ability => {
      const score = abilityScores[ability];
      
      if (score < 10) {
        results.suggestions.push({
          type: 'info',
          message: `Low ${ability} might limit some ${characterClass} capabilities`,
          recommendedAction: `Consider balancing ${ability} if possible`
        });
      }
    });

    // Normalize Compatibility Score
    results.compatibilityScore = Math.min(Math.max(results.compatibilityScore, 0), 100);

    setOptimizationResults(results);
    onOptimizationUpdate(results);
  }, [race, characterClass, abilityScores, onOptimizationUpdate]);

  const getCompatibilityColor = (score) => {
    if (score < 40) return 'red';
    if (score < 70) return 'orange';
    return 'green';
  };

  if (!race || !characterClass || !abilityScores) return null;

  return (
    <div className="character-optimizer">
      <h3>Character Optimization Analysis</h3>

      {/* Compatibility Score */}
      <div className="compatibility-score">
        <h4>Race-Class Compatibility</h4>
        <div 
          className="compatibility-meter"
          style={{ 
            backgroundColor: getCompatibilityColor(optimizationResults.compatibilityScore) 
          }}
        >
          <span>{optimizationResults.compatibilityScore}%</span>
        </div>
        <p>Race-Class Synergy: {optimizationResults.raceClassSynergy}</p>
      </div>

      {/* Optimization Suggestions */}
      <div className="optimization-suggestions">
        <h4>Optimization Insights</h4>
        {optimizationResults.suggestions.length > 0 ? (
          <ul>
            {optimizationResults.suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                className={`suggestion-${suggestion.type}`}
              >
                <strong>{suggestion.message}</strong>
                <p>{suggestion.recommendedAction}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Your character looks well-optimized!</p>
        )}
      </div>

      {/* Class Warnings */}
      <div className="class-warnings">
        <h4>Class Considerations</h4>
        <ul>
          {optimizationResults.warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CharacterOptimizer;
