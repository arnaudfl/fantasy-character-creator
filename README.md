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
  - AI-powered avatar creation using Hugging Face API
  - Automatic saving of avatars in project directory
  - Unique, URL-friendly avatar filenames
  - Circular avatar preview in character details

### Additional Features

- Dark/Light theme toggle
- Character saving and sharing
- Responsive design
- Guided character creation process

## Avatar Generation Performance Optimization

### Caching Mechanism
- Intelligent local avatar caching system
- Stores generated avatars with metadata
- Automatic cache management
  - Limit of 100 cached avatars
  - 7-day expiry for cached images
- Reduces redundant API calls
- Fallback avatar generation

### API Optimization
- Retry mechanism for API calls
- 30-second timeout for avatar generation
- Detailed error handling
- Fallback to default avatar on generation failure

### Performance Features
- Unique filename generation
- Metadata-based avatar retrieval
- Efficient storage and retrieval of generated avatars

## Technologies Used

- React
- React Hooks
- Context API
- CSS Modules
- SVG Generation
- LocalStorage for character persistence

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Git

### Environment Setup

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/fantasy-character-creator.git
   cd fantasy-character-creator
   ```

2. Create a `.env` file in the project root

   ```bash
   touch .env
   ```

3. Add the following environment variables to `.env`

   ```bash
   REACT_APP_API_BASE_URL=http://localhost:5000
   HUGGING_FACE_API_KEY=your_hugging_face_api_key
   HUGGING_FACE_API_TOKEN=your_hugging_face_api_token
   ```

4. Install dependencies

   ```bash
   npm install
   ```

### Running the Application

#### Development Mode

Start both frontend and backend concurrently:

```bash
npm run dev
```

#### Frontend Only

```bash
npm start
```

#### Backend Only

```bash
npm run start-backend
```

### Building for Production

```bash
npm run build
```

This command will:

- Compile the React frontend
- Transpile the backend TypeScript files
- Prepare the character avatars directory
- Generate production-ready build artifacts

### Additional Configuration

- Modify `src/config/` files to customize character creation options
- Update environment variables in `.env` for API integrations

### Troubleshooting

- Ensure all dependencies are installed correctly
- Check console for any error messages
- Verify API keys and environment configurations

### API Dependencies

- Hugging Face API (for avatar generation)
- Local Express backend
- Axios for HTTP requests

## Customization

- Modify `src/data/` JSON files to add more races, classes, equipment, and personality traits
- Adjust theme variables in `src/styles/globalVariables.css`

## License

This project is open-source and available under the MIT License.
