import React, { useState, useCallback } from 'react';
import './DiceRollSimulator.css';

const DiceRollSimulator = ({ 
  onRollComplete, 
  method = 'standard', 
  rerollsAllowed = 1 
}) => {
  const [rolls, setRolls] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [remainingRerolls, setRemainingRerolls] = useState(rerollsAllowed);
  const [isRolling, setIsRolling] = useState(false);

  // Simulate dice roll with animation
  const simulateDiceRoll = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);

    // Simulate rolling 4 six-sided dice
    const diceRolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    
    // Sort rolls to drop the lowest
    const sortedRolls = diceRolls.sort((a, b) => a - b);
    const droppedRoll = sortedRolls[0];
    const keptRolls = sortedRolls.slice(1);
    
    const total = keptRolls.reduce((sum, roll) => sum + roll, 0);

    // Animate dice roll
    setTimeout(() => {
      setRolls(diceRolls);
      setTotalScore(total);
      setIsRolling(false);

      // Callback to parent component with the roll result
      onRollComplete({
        rolls: diceRolls,
        droppedRoll,
        keptRolls,
        total
      });
    }, 1000);
  }, [isRolling, onRollComplete]);

  // Reroll functionality
  const handleReroll = () => {
    if (remainingRerolls > 0) {
      simulateDiceRoll();
      setRemainingRerolls(prev => prev - 1);
    }
  };

  return (
    <div className="dice-roll-simulator">
      <div className="dice-roll-header">
        <h3>Ability Score Generation</h3>
        <p>Method: 4d6 Drop Lowest</p>
      </div>

      <div className={`dice-container ${isRolling ? 'rolling' : ''}`}>
        {rolls.map((roll, index) => (
          <div 
            key={index} 
            className={`die ${
              rolls.sort((a, b) => a - b)[0] === roll ? 'dropped' : 'kept'
            }`}
          >
            {roll}
          </div>
        ))}
      </div>

      <div className="roll-details">
        <p>Total Score: {totalScore}</p>
        <p>Rerolls Remaining: {remainingRerolls}</p>
      </div>

      <div className="roll-actions">
        <button 
          onClick={simulateDiceRoll} 
          disabled={isRolling}
          className="roll-btn"
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>

        {remainingRerolls > 0 && (
          <button 
            onClick={handleReroll} 
            disabled={isRolling || remainingRerolls === 0}
            className="reroll-btn"
          >
            Reroll
          </button>
        )}
      </div>
    </div>
  );
};

export default DiceRollSimulator;
