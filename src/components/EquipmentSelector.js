import React, { useMemo } from 'react';
import './EquipmentSelector.css';

const equipmentData = {
  Warrior: {
    weapons: [
      { name: 'Longsword', damage: '1d8', type: 'Melee', weight: 3 },
      { name: 'Battleaxe', damage: '1d8', type: 'Melee', weight: 4 },
      { name: 'Greatsword', damage: '2d6', type: 'Melee', weight: 6 }
    ],
    armor: [
      { name: 'Chain Mail', ac: 16, weight: 55, stealthPenalty: true },
      { name: 'Plate Armor', ac: 18, weight: 65, stealthPenalty: true },
      { name: 'Leather Armor', ac: 11, weight: 10, stealthPenalty: false }
    ],
    shield: [
      { name: 'Wooden Shield', acBonus: 2, weight: 6 },
      { name: 'Steel Shield', acBonus: 2, weight: 8 }
    ],
    accessories: [
      { name: 'Adventurer\'s Pack', contents: ['Backpack', 'Bedroll', 'Rations'], weight: 5 },
      { name: 'Healing Potion', healing: '2d4+2', weight: 0.5 }
    ]
  },
  Mage: {
    weapons: [
      { name: 'Dagger', damage: '1d4', type: 'Melee', weight: 1 },
      { name: 'Staff', damage: '1d6', type: 'Melee', weight: 4 }
    ],
    armor: [
      { name: 'Mage Robes', ac: 10, weight: 4, stealthPenalty: false }
    ],
    accessories: [
      { name: 'Spellbook', weight: 3 },
      { name: 'Component Pouch', weight: 2 },
      { name: 'Arcane Focus', weight: 1 }
    ]
  },
  Rogue: {
    weapons: [
      { name: 'Shortsword', damage: '1d6', type: 'Melee', weight: 2 },
      { name: 'Dagger (x2)', damage: '1d4', type: 'Melee', weight: 1 },
      { name: 'Shortbow', damage: '1d6', type: 'Ranged', weight: 2 }
    ],
    armor: [
      { name: 'Leather Armor', ac: 11, weight: 10, stealthPenalty: false }
    ],
    accessories: [
      { name: 'Thieves\' Tools', weight: 1 },
      { name: 'Lockpick Set', weight: 0.5 },
      { name: 'Dark Cloak', weight: 1 }
    ]
  },
  Cleric: {
    weapons: [
      { name: 'Mace', damage: '1d6', type: 'Melee', weight: 4 },
      { name: 'Warhammer', damage: '1d8', type: 'Melee', weight: 5 }
    ],
    armor: [
      { name: 'Chain Mail', ac: 16, weight: 55, stealthPenalty: true },
      { name: 'Scale Mail', ac: 14, weight: 45, stealthPenalty: true }
    ],
    shield: [
      { name: 'Wooden Shield', acBonus: 2, weight: 6 }
    ],
    accessories: [
      { name: 'Holy Symbol', weight: 1 },
      { name: 'Healing Potion', healing: '2d4+2', weight: 0.5 }
    ]
  },
  Ranger: {
    weapons: [
      { name: 'Longbow', damage: '1d8', type: 'Ranged', weight: 2 },
      { name: 'Shortsword', damage: '1d6', type: 'Melee', weight: 2 }
    ],
    armor: [
      { name: 'Leather Armor', ac: 11, weight: 10, stealthPenalty: false }
    ],
    accessories: [
      { name: 'Quiver', contents: ['20 Arrows'], weight: 1 },
      { name: 'Survival Kit', weight: 2 }
    ]
  }
};

const EquipmentSelector = ({ 
  characterClass, 
  selectedEquipment, 
  onEquipmentSelect 
}) => {
  // Memoize class-specific equipment data
  const classEquipment = useMemo(() => {
    return equipmentData[characterClass] || {};
  }, [characterClass]);

  // Compute total weight
  const totalWeight = useMemo(() => {
    if (!selectedEquipment) return 0;
    return [
      selectedEquipment.weapon?.weight || 0,
      selectedEquipment.armor?.weight || 0,
      selectedEquipment.shield?.weight || 0,
      ...(selectedEquipment.accessories?.map(a => a.weight) || [])
    ].reduce((sum, w) => sum + w, 0);
  }, [selectedEquipment]);

  // Equipment selection handlers
  const handleEquipmentSelect = (type, item) => {
    const newEquipment = {
      ...selectedEquipment,
      [type]: item
    };

    onEquipmentSelect(newEquipment);
  };

  // Accessory toggle handler
  const handleAccessoryToggle = (accessory) => {
    const currentAccessories = selectedEquipment?.accessories || [];
    const isAlreadySelected = currentAccessories.some(a => a.name === accessory.name);
    
    const newAccessories = isAlreadySelected
      ? currentAccessories.filter(a => a.name !== accessory.name)
      : [...currentAccessories, accessory];
    
    const newEquipment = {
      ...selectedEquipment,
      accessories: newAccessories
    };

    onEquipmentSelect(newEquipment);
  };

  // If no equipment data for the class, return null
  if (!classEquipment.weapons) return null;

  // Ensure selectedEquipment has a default state
  const ensuredEquipment = selectedEquipment || {
    weapon: null,
    armor: null,
    shield: null,
    accessories: []
  };

  return (
    <div className="equipment-selector">
      <h3>Equipment for {characterClass}</h3>
      
      {/* Weapon Selection */}
      <div className="equipment-section">
        <h4>Weapon</h4>
        <div className="equipment-grid">
          {classEquipment.weapons.map((weapon) => (
            <div 
              key={weapon.name}
              className={`equipment-item ${ensuredEquipment.weapon?.name === weapon.name ? 'selected' : ''}`}
              onClick={() => handleEquipmentSelect('weapon', weapon)}
            >
              {weapon.name} (Damage: {weapon.damage})
            </div>
          ))}
        </div>
      </div>

      {/* Armor Selection */}
      <div className="equipment-section">
        <h4>Armor</h4>
        <div className="equipment-grid">
          {classEquipment.armor.map((armor) => (
            <div 
              key={armor.name}
              className={`equipment-item ${ensuredEquipment.armor?.name === armor.name ? 'selected' : ''}`}
              onClick={() => handleEquipmentSelect('armor', armor)}
            >
              {armor.name} (AC: {armor.ac})
            </div>
          ))}
        </div>
      </div>

      {/* Shield Selection (if available) */}
      {classEquipment.shield && (
        <div className="equipment-section">
          <h4>Shield</h4>
          <div className="equipment-grid">
            {classEquipment.shield.map((shield) => (
              <div 
                key={shield.name}
                className={`equipment-item ${ensuredEquipment.shield?.name === shield.name ? 'selected' : ''}`}
                onClick={() => handleEquipmentSelect('shield', shield)}
              >
                {shield.name} (AC Bonus: +{shield.acBonus})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accessories Selection */}
      <div className="equipment-section">
        <h4>Accessories</h4>
        <div className="equipment-grid">
          {classEquipment.accessories.map((accessory) => (
            <div 
              key={accessory.name}
              className={`equipment-item ${
                ensuredEquipment.accessories?.some(a => a.name === accessory.name) 
                  ? 'selected' : ''
              }`}
              onClick={() => handleAccessoryToggle(accessory)}
            >
              {accessory.name}
            </div>
          ))}
        </div>
      </div>

      {/* Total Weight Display */}
      <div className="equipment-summary">
        <p>Total Weight: {totalWeight.toFixed(1)} lbs</p>
      </div>
    </div>
  );
};

export default React.memo(EquipmentSelector);
