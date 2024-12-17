# Fantasy Character Creator

## Overview
Fantasy Character Creator is an interactive web application that allows users to create detailed and unique characters for tabletop role-playing games, such as Dungeons & Dragons. The app provides a comprehensive character creation experience with features like ability score generation, equipment selection, personality trait generation, and avatar creation.

## Features

### Character Creation Workflow
- **Ability Score Generation**
  - Manual point-buy system
  - 4d6 drop lowest dice roll method
  - Automatic racial ability score modifiers

- **Character Attributes**
  - Name selection
  - Race selection
  - Class selection
  - Ability scores (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma)

- **Equipment Selection**
  - Weapon selection
  - Armor selection
  - Shield and accessory options

- **Personality Generation**
  - Randomized trait generation
  - Motivation selection
  - Fear and quirk customization
  - Background creation

- **Avatar Generation**
  - Custom SVG avatar creation
  - Unique character visual representation

### Additional Features
- Dark/Light theme toggle
- Character saving and sharing
- Responsive design
- Guided character creation process

## Technologies Used
- React
- React Hooks
- Context API
- CSS Modules
- SVG Generation
- LocalStorage for character persistence

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/fantasy-character-creator.git
   ```

2. Navigate to the project directory
   ```bash
   cd fantasy-character-creator
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Start the development server
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser

## Customization
- Modify `src/data/` JSON files to add more races, classes, equipment, and personality traits
- Adjust theme variables in `src/styles/globalVariables.css`

## License
This project is open-source and available under the MIT License.
