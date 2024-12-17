import React, { useState } from 'react';
import './AbilityTooltip.css';

const abilityDescriptions = {
  strength: {
    title: 'Strength',
    description: 'Measures physical power, athletic ability, and the capacity to inflict physical damage. High strength is crucial for warriors and melee fighters.',
    examples: [
      'Determines melee attack and damage bonuses',
      'Affects carrying capacity',
      'Important for physical skills like climbing and swimming'
    ]
  },
  dexterity: {
    title: 'Dexterity',
    description: 'Represents agility, reflexes, balance, and overall physical coordination. Critical for rogues, rangers, and avoiding attacks.',
    examples: [
      'Influences ranged attack accuracy',
      'Determines initiative in combat',
      'Affects armor class and dodge abilities'
    ]
  },
  constitution: {
    title: 'Constitution',
    description: 'Represents endurance, stamina, and vital force. Determines health points and resistance to physical challenges.',
    examples: [
      'Increases total hit points',
      'Provides resistance to disease and poison',
      'Affects sustained physical performance'
    ]
  },
  intelligence: {
    title: 'Intelligence',
    description: 'Measures mental acuity, information recall, and analytical skill. Crucial for magic users and problem-solving.',
    examples: [
      'Determines spell casting ability for some classes',
      'Influences knowledge-based skills',
      'Affects learning and reasoning capabilities'
    ]
  },
  wisdom: {
    title: 'Wisdom',
    description: 'Represents awareness, intuition, and insight. Important for clerics and perception-based skills.',
    examples: [
      'Influences spiritual and magical perception',
      'Determines divine spellcasting ability',
      'Affects skills like healing and survival'
    ]
  },
  charisma: {
    title: 'Charisma',
    description: 'Measures force of personality, persuasiveness, and leadership potential. Critical for social interactions.',
    examples: [
      'Affects diplomatic and social skills',
      'Influences leadership and negotiation',
      'Important for certain magical abilities'
    ]
  }
};

const AbilityTooltip = ({ ability }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const abilityInfo = abilityDescriptions[ability];

  return (
    <div 
      className="ability-tooltip-container"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      <span className="ability-tooltip-trigger">ℹ️</span>
      {isTooltipVisible && (
        <div className="ability-tooltip">
          <h4>{abilityInfo.title}</h4>
          <p>{abilityInfo.description}</p>
          <ul>
            {abilityInfo.examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AbilityTooltip;
