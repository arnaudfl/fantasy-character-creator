import { v4 as uuidv4 } from 'uuid';

class CharacterStorageManager {
  static STORAGE_KEY = 'fantasy-characters';
  static SHARED_CHARACTERS_KEY = 'shared-characters';

  // Save character to local storage
  static saveCharacter(character) {
    // Ensure the character has a unique ID
    const characterToSave = {
      ...character,
      id: character.id || uuidv4(),
      createdAt: new Date().toISOString()
    };

    // Retrieve existing characters
    const characters = this.getAllCharacters();
    
    // Find index of existing character or add new
    const existingIndex = characters.findIndex(c => c.id === characterToSave.id);
    if (existingIndex !== -1) {
      characters[existingIndex] = characterToSave;
    } else {
      characters.push(characterToSave);
    }

    // Save back to local storage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(characters));
    
    return characterToSave;
  }

  // Get all saved characters
  static getAllCharacters() {
    const characters = localStorage.getItem(this.STORAGE_KEY);
    return characters ? JSON.parse(characters) : [];
  }

  // Get a specific character by ID
  static getCharacterById(id) {
    const characters = this.getAllCharacters();
    return characters.find(character => character.id === id);
  }

  // Delete a character
  static deleteCharacter(id) {
    const characters = this.getAllCharacters();
    const updatedCharacters = characters.filter(character => character.id !== id);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCharacters));
  }

  // Export characters to JSON
  static exportCharactersToJSON() {
    const characters = this.getAllCharacters();
    const blob = new Blob([JSON.stringify(characters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fantasy-characters-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Import characters from JSON
  static importCharactersFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedCharacters = JSON.parse(event.target.result);
          
          // Validate imported characters
          const validCharacters = importedCharacters.filter(this.validateCharacter);
          
          // Merge with existing characters
          const existingCharacters = this.getAllCharacters();
          const mergedCharacters = [
            ...existingCharacters,
            ...validCharacters.map(c => ({
              ...c,
              id: c.id || uuidv4(),
              importedAt: new Date().toISOString()
            }))
          ];

          // Save merged characters
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedCharacters));
          
          resolve(validCharacters.length);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Generate shareable character URL
  static generateShareableURL(character) {
    // Create a compressed representation of the character
    const compressedCharacter = {
      n: character.name,
      r: character.race,
      c: character.class,
      s: {
        str: character.strength,
        dex: character.dexterity,
        con: character.constitution,
        int: character.intelligence,
        wis: character.wisdom,
        cha: character.charisma
      },
      eq: character.equipment?.name,
      sp: character.specialAbility
    };

    // Convert to base64 to create a shareable link
    const encodedCharacter = btoa(JSON.stringify(compressedCharacter));
    return `${window.location.origin}/character/${encodedCharacter}`;
  }

  // Decode shareable URL
  static decodeShareableURL(encodedCharacter) {
    try {
      const decodedCharacter = JSON.parse(atob(encodedCharacter));
      return {
        name: decodedCharacter.n,
        race: decodedCharacter.r,
        class: decodedCharacter.c,
        strength: decodedCharacter.s.str,
        dexterity: decodedCharacter.s.dex,
        constitution: decodedCharacter.s.con,
        intelligence: decodedCharacter.s.int,
        wisdom: decodedCharacter.s.wis,
        charisma: decodedCharacter.s.cha,
        equipment: { name: decodedCharacter.eq },
        specialAbility: decodedCharacter.sp
      };
    } catch (error) {
      return null;
    }
  }

  // Export character to PDF (simplified version)
  static exportCharacterToPDF(character) {
    // Check if html2pdf is available
    if (typeof window !== 'undefined' && window.html2pdf) {
      const pdfContent = this.generatePDFContent(character);
      
      const opt = {
        margin: 1,
        filename: `${character.name}-character-sheet.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(pdfContent).save();
    } else {
      // Fallback method: generate downloadable text file
      this.exportCharacterToTextFile(character);
    }
  }

  // Generate PDF content
  static generatePDFContent(character) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>${character.name}</h1>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p><strong>Race:</strong> ${character.race}</p>
            <p><strong>Class:</strong> ${character.class}</p>
          </div>
          <div>
            <h3>Ability Scores</h3>
            <p>Strength: ${character.strength}</p>
            <p>Dexterity: ${character.dexterity}</p>
            <p>Constitution: ${character.constitution}</p>
            <p>Intelligence: ${character.intelligence}</p>
            <p>Wisdom: ${character.wisdom}</p>
            <p>Charisma: ${character.charisma}</p>
          </div>
        </div>
        
        ${character.equipment ? `
          <div>
            <h3>Equipment</h3>
            <p>${character.equipment.name}</p>
          </div>
        ` : ''}
        
        ${character.personality ? `
          <div>
            <h3>Personality</h3>
            <p><strong>Traits:</strong> ${character.personality.traits.join(', ')}</p>
            <p><strong>Motivation:</strong> ${character.personality.motivation}</p>
            <p><strong>Fear:</strong> ${character.personality.fear}</p>
          </div>
        ` : ''}
        
        ${character.specialAbility ? `
          <div>
            <h3>Special Ability</h3>
            <p>${character.specialAbility}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Fallback method: export to text file
  static exportCharacterToTextFile(character) {
    const characterText = `
Character Sheet: ${character.name}

Race: ${character.race}
Class: ${character.class}

Ability Scores:
- Strength: ${character.strength}
- Dexterity: ${character.dexterity}
- Constitution: ${character.constitution}
- Intelligence: ${character.intelligence}
- Wisdom: ${character.wisdom}
- Charisma: ${character.charisma}

${character.equipment ? `Equipment: ${character.equipment.name}` : ''}

${character.personality ? `
Personality:
- Traits: ${character.personality.traits.join(', ')}
- Motivation: ${character.personality.motivation}
- Fear: ${character.personality.fear}
` : ''}

${character.specialAbility ? `Special Ability: ${character.specialAbility}` : ''}
    `;

    const blob = new Blob([characterText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name}-character-sheet.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Validate character object
  static validateCharacter(character) {
    // Basic validation checks
    return !!(
      character.name && 
      character.race && 
      character.class && 
      character.strength && 
      character.dexterity && 
      character.constitution && 
      character.intelligence && 
      character.wisdom && 
      character.charisma
    );
  }

  // Share character (mock implementation, could be expanded to actual sharing mechanism)
  static shareCharacter(character) {
    // Store in shared characters
    const sharedCharacters = JSON.parse(
      localStorage.getItem(this.SHARED_CHARACTERS_KEY) || '[]'
    );
    
    const sharedCharacter = {
      ...character,
      sharedAt: new Date().toISOString(),
      shareId: uuidv4()
    };

    sharedCharacters.push(sharedCharacter);
    localStorage.setItem(this.SHARED_CHARACTERS_KEY, JSON.stringify(sharedCharacters));

    // Generate and return shareable URL
    return this.generateShareableURL(character);
  }
}

export default CharacterStorageManager;
