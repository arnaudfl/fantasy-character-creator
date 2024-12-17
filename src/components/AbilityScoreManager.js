import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AbilityScoreManager.css';

// Racial Ability Score Modifiers
const raceAbilityModifiers = {
  Human: { 
    strength: 1, 
    dexterity: 1, 
    constitution: 1, 
    intelligence: 1, 
    wisdom: 1, 
    charisma: 1 
  },
  Elf: { 
    dexterity: 2, 
    intelligence: 1 
  },
  Dwarf: { 
    constitution: 2, 
    strength: 1 
  },
  Halfling: { 
    dexterity: 2 
  },
  Tiefling: { 
    intelligence: 1, 
    charisma: 2 
  },
  Dragonborn: { 
    strength: 2, 
    charisma: 1 
  }
};

// Point Buy Configuration
const POINT_BUY_CONFIG = {
  totalPoints: 27,
  minScore: 8,
  maxScore: 15,
  costTable: {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9
  }
};

const initialBaseScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
};

const AbilityScoreManager = ({ 
  race, 
  onAbilityScoreUpdate 
}) => {
  const [baseScores, setBaseScores] = useState(initialBaseScores);
  const [pointsRemaining, setPointsRemaining] = useState(POINT_BUY_CONFIG.totalPoints);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const previousRace = useRef(race);

  // Memoize race modifiers calculation
  const raceModifiers = React.useMemo(() => 
    raceAbilityModifiers[race] || {},
    [race]
  );

  // Memoize total scores calculation
  const totalScores = React.useMemo(() => {
    const scores = {};
    Object.keys(baseScores).forEach(ability => {
      scores[ability] = baseScores[ability] + (raceModifiers[ability] || 0);
    });
    return scores;
  }, [baseScores, raceModifiers]);

  // Reset scores when race changes
  useEffect(() => {
    if (previousRace.current !== race) {
      setBaseScores(initialBaseScores);
      setPointsRemaining(POINT_BUY_CONFIG.totalPoints);
      previousRace.current = race;
    }
  }, [race]);

  // Notify parent of updates, but only when scores actually change
  useEffect(() => {
    const abilityScoreData = {
      baseScores,
      totalScores,
      raceModifiers
    };
    onAbilityScoreUpdate(abilityScoreData, isAdjusting);
  }, [baseScores, totalScores, raceModifiers, onAbilityScoreUpdate, isAdjusting]);

  const calculatePointCost = (currentScore, newScore) => {
    const costTable = POINT_BUY_CONFIG.costTable;
    let totalCost = 0;

    if (newScore > currentScore) {
      for (let score = currentScore; score < newScore; score++) {
        totalCost += costTable[score + 1] - costTable[score];
      }
    } else {
      for (let score = currentScore; score > newScore; score--) {
        totalCost -= costTable[score] - costTable[score - 1];
      }
    }

    return totalCost;
  };

  const updateAbilityScore = (ability, change) => {
    setIsAdjusting(true);

    const currentScore = baseScores[ability];
    const newScore = currentScore + change;

    // Check score bounds
    if (newScore < POINT_BUY_CONFIG.minScore || newScore > POINT_BUY_CONFIG.maxScore) {
      return;
    }

    // Calculate point cost
    const pointCost = calculatePointCost(currentScore, newScore);

    // Check if we have enough points
    if (pointsRemaining - pointCost < 0) {
      return;
    }

    // Update scores and remaining points
    setBaseScores(prev => ({
      ...prev,
      [ability]: newScore
    }));
    setPointsRemaining(prev => prev - pointCost);
  };

  return (
    <div className="ability-score-manager">
      <h3>Ability Scores for {race || 'Character'}</h3>

      {/* Points Remaining */}
      <div className="points-remaining">
        <span>Points Remaining: {pointsRemaining}</span>
      </div>

      {/* Ability Score Grid */}
      <div className="ability-score-grid">
        {Object.entries(baseScores).map(([ability, score]) => (
          <div key={ability} className="ability-score-item">
            <div className="ability-name">{ability.charAt(0).toUpperCase() + ability.slice(1)}</div>
            
            {/* Racial Modifier Display */}
            <div className="ability-modifier">
              {raceModifiers[ability] ? `+${raceModifiers[ability]}` : '+0'}
            </div>
            
            {/* Score Controls */}
            <div className="score-controls">
              <button 
                type="button"
                onClick={() => updateAbilityScore(ability, -1)}
                disabled={score <= POINT_BUY_CONFIG.minScore}
              >
                -
              </button>
              <div className="score-display">
                <span className="base-score">{score}</span>
                <span className="total-score">
                  ({score + (raceModifiers[ability] || 0)})
                </span>
              </div>
              <button 
                type="button"
                onClick={() => updateAbilityScore(ability, 1)}
                disabled={score >= POINT_BUY_CONFIG.maxScore}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbilityScoreManager;
