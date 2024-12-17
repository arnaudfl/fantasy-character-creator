class CharacterStorageManager {
  static STORAGE_KEY = 'savedCharacters';

  // Save a new character
  static saveCharacter(character) {
    // Validate character before saving
    if (!this.validateCharacter(character)) {
      console.error('Invalid character cannot be saved');
      return false;
    }

    // Add timestamp and unique ID
    const characterToSave = {
      ...character,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // Retrieve existing characters
    const savedCharacters = this.getAllCharacters();

    // Add new character
    savedCharacters.push(characterToSave);

    // Save updated list
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedCharacters));
      return characterToSave.id;
    } catch (error) {
      console.error('Error saving character:', error);
      return false;
    }
  }

  // Get all saved characters
  static getAllCharacters() {
    try {
      const characters = localStorage.getItem(this.STORAGE_KEY);
      return characters ? JSON.parse(characters) : [];
    } catch (error) {
      console.error('Error retrieving characters:', error);
      return [];
    }
  }

  // Get a specific character by ID
  static getCharacterById(id) {
    const characters = this.getAllCharacters();
    return characters.find(char => char.id === id);
  }

  // Update an existing character
  static updateCharacter(id, updatedCharacter) {
    const characters = this.getAllCharacters();
    const index = characters.findIndex(char => char.id === id);

    if (index !== -1) {
      characters[index] = {
        ...characters[index],
        ...updatedCharacter,
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(characters));
        return true;
      } catch (error) {
        console.error('Error updating character:', error);
        return false;
      }
    }

    return false;
  }

  // Delete a character
  static deleteCharacter(id) {
    const characters = this.getAllCharacters();
    const filteredCharacters = characters.filter(char => char.id !== id);

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCharacters));
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      return false;
    }
  }

  // Validate character before saving
  static validateCharacter(character) {
    // Basic validation checks
    return !!(
      character.name &&
      character.race &&
      character.class &&
      character.baseAbilityScores &&
      character.equipment &&
      character.personality
    );
  }

  // Generate a shareable URL for a character
  static generateShareableURL(character) {
    try {
      // Remove sensitive or unnecessary data
      const shareableData = {
        name: character.name,
        race: character.race,
        class: character.class,
        background: character.background,
        strength: character.strength,
        dexterity: character.dexterity,
        constitution: character.constitution,
        intelligence: character.intelligence,
        wisdom: character.wisdom,
        charisma: character.charisma,
        baseAbilityScores: character.baseAbilityScores,
        totalAbilityScores: character.totalAbilityScores,
        raceAbilityModifiers: character.raceAbilityModifiers,
        specialAbility: character.specialAbility,
        equipment: character.equipment,
        personality: character.personality,
        avatar: character.avatar
      };

      const encodedData = btoa(JSON.stringify(shareableData));
      return encodedData;
    } catch (error) {
      console.error('Error generating shareable URL:', error);
      return null;
    }
  }

  // Decode a shareable URL back into character data
  static decodeShareableURL(encodedData) {
    try {
      const decodedData = JSON.parse(atob(encodedData));
      return decodedData;
    } catch (error) {
      console.error('Error decoding shareable URL:', error);
      return null;
    }
  }

  // Export characters to JSON
  static exportCharacters() {
    const characters = this.getAllCharacters();
    const blob = new Blob([JSON.stringify(characters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `characters_export_${new Date().toISOString().replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import characters from JSON
  static importCharacters(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedCharacters = JSON.parse(event.target.result);
          
          // Validate imported characters
          const validCharacters = importedCharacters.filter(this.validateCharacter);
          
          // Merge with existing characters
          const existingCharacters = this.getAllCharacters();
          const mergedCharacters = [...existingCharacters, ...validCharacters];
          
          // Save merged characters
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedCharacters));
          
          resolve(validCharacters.length);
        } catch (error) {
          console.error('Error importing characters:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

export default CharacterStorageManager;
