import React, { useState, useEffect } from 'react';
import './InteractiveGuide.css';

const GUIDE_STEPS = [
  {
    target: 'name-input',
    title: 'Character Name',
    content: 'Choose a unique name for your character. This is how you\'ll identify them in your adventures!',
    tip: 'Try a name that reflects your character\'s background or personality.'
  },
  {
    target: 'race-select',
    title: 'Choose Your Race',
    content: 'Select a race that defines your character\'s physical and cultural background. Each race has unique abilities and traits.',
    tip: 'Some races are better suited to certain classes. Consider how your race complements your character concept.'
  },
  {
    target: 'class-select',
    title: 'Select Your Class',
    content: 'Your character\'s class determines their primary skills, abilities, and role in an adventure.',
    tip: 'Think about the type of hero you want to play. Warrior? Mage? Rogue? Each class offers a unique playstyle.'
  },
  {
    target: 'ability-scores',
    title: 'Ability Scores',
    content: 'Ability scores represent your character\'s fundamental attributes. Use the dice roll to generate scores, or manually allocate points.',
    tip: 'Different classes benefit from different ability scores. Check the optimizer for recommendations!'
  },
  {
    target: 'avatar-generator',
    title: 'Create Your Avatar',
    content: 'Bring your character to life with a unique visual representation. Customize facial features, hair, and colors.',
    tip: 'Your avatar can reflect your character\'s race, personality, and background.'
  },
  {
    target: 'personality-generator',
    title: 'Develop Personality',
    content: 'Add depth to your character by generating personality traits, motivations, and quirks.',
    tip: 'A well-developed personality makes roleplaying more engaging and fun!'
  }
];

const InteractiveGuide = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleNextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleCloseGuide();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCloseGuide = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const step = GUIDE_STEPS[currentStep];

  return (
    <div className="interactive-guide-overlay">
      <div className="interactive-guide-container">
        <div className="guide-header">
          <h2>{step.title}</h2>
          <button 
            className="guide-close-btn" 
            onClick={handleCloseGuide}
          >
            ✕
          </button>
        </div>

        <div className="guide-content">
          <p>{step.content}</p>
          <div className="guide-tip">
            <span>💡 Pro Tip:</span> {step.tip}
          </div>
        </div>

        <div className="guide-navigation">
          <button 
            onClick={handlePreviousStep} 
            disabled={currentStep === 0}
            className="nav-btn prev-btn"
          >
            Previous
          </button>
          <div className="step-indicator">
            Step {currentStep + 1} of {GUIDE_STEPS.length}
          </div>
          <button 
            onClick={handleNextStep} 
            className="nav-btn next-btn"
          >
            {currentStep === GUIDE_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveGuide;
