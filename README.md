# Pokédex Web Application

A comprehensive, modern React application for exploring all Pokémon across generations using the official PokeAPI.

Visit Hosted Domain Via this link: https://arashi-pokedex.netlify.app/

## 📋 Project Structure

```
Pokemon/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Header.jsx     # Navigation header with search
│   │   ├── Header.css
│   │   ├── PokemonCard.jsx        # Individual pokemon card
│   │   ├── PokemonCard.css
│   │   ├── PokemonModal.jsx       # Detail modal with full stats
│   │   ├── PokemonModal.css
│   │   ├── PokemonGrid.jsx        # Grid layout for pokemon
│   │   ├── PokemonGrid.css
│   │   ├── Landing.jsx   # Welcome screen
│   │   └── Landing.css
│   ├── services/
│   │   └── pokeApi.js    # API integration with axios
│   ├── styles/
│   │   └── index.css     # Global styles
│   ├── utils/
│   │   └── helpers.js    # Utility functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # React entry point
├── index.html            # HTML entry point
├── package.json          # Project dependencies
├── vite.config.js        # Vite configuration
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

Dependencies are already installed (`node_modules/`). If you need to reinstall:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## 📚 Components Overview

### **Landing Component**
- Animated welcome screen with Pokéball animation
- "Enter" button to navigate to main app
- Responsive design

### **Header Component**
- Sticky header with navigation
- Search bar with multiple filter options:
  - Search by name
  - Search by ID
  - Search by type
  - Search by ability
- Real-time pokemon count display

### **PokemonCard Component**
- Displays individual pokemon in grid
- Shows pokemon ID, sprite, name, and types
- Hover effects
- Click to view details

### **PokemonGrid Component**
- Grid layout for pokemon cards
- Optional grouping by generation
- Responsive auto-fill grid
- Loading skeleton states

### **PokemonModal Component**
- Detailed pokemon information
- Multiple sprite variants (front, back, shiny, female, etc.)
- Pokemon cry audio player
- Comprehensive stats display
- Base stats visualization
- Abilities with hidden ability indicators
- Moves list
- Generation, height, weight, base experience info
- Navigation buttons for next/previous pokemon
- Keyboard shortcuts:
  - Arrow Right: Next pokemon
  - Arrow Left: Previous pokemon
  - Escape: Close modal

## 🔌 API Integration

The application uses the **official PokeAPI** (https://pokeapi.co/api/v2)

### Available API Endpoints

```javascript
pokemonAPI.getAllPokemon()          // Get all pokemon
pokemonAPI.getPokemonByIdOrName()   // Get specific pokemon details
pokemonAPI.getPokemonByType()       // Filter by type
pokemonAPI.getAllTypes()            // Get all types
pokemonAPI.getAbilityByName()       // Get ability info
pokemonAPI.getAllAbilities()        // Get all abilities
pokemonAPI.getHabitatByName()       // Get habitat info
pokemonAPI.getAllHabitats()         // Get all habitats
pokemonAPI.getGenderByName()        // Get gender info
pokemonAPI.getAllGenders()          // Get all genders
pokemonAPI.getRegionByName()        // Get region info
pokemonAPI.getAllRegions()          // Get all regions
pokemonAPI.getGenerationByNum()     // Get generation info
pokemonAPI.getAllGenerations()      // Get all generations
```

## 🎨 Features

- ✨ **Infinite Scroll Loading** - Pokemon load progressively
- 🔍 **Advanced Search** - Search by name, ID, type, or ability
- 🎴 **Detailed Views** - Complete pokemon statistics and information
- 🔊 **Audio** - Listen to pokemon cries
- 🖼️ **Multiple Sprites** - View different variants and shiny versions
- ⌨️ **Keyboard Navigation** - Navigate modals with arrow keys
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎯 **Generation Grouping** - Organize pokemon by generation
- 🌙 **Dark Theme** - Eye-friendly dark interface

## 🎯 How to Use

1. **Click "Enter"** on the landing page
2. **Wait for pokemon to load** (shows progress in status bar)
3. **Search or browse pokemon:**
   - Type in search bar with different filters
   - Scroll through the grid
4. **Click any pokemon card** to view details
5. **Navigate in modal:**
   - Use Previous/Next buttons or arrow keys
   - Press Escape or click outside to close

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with custom properties
- **PokeAPI** - Pokemon data source

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 API Endpoint

**Base URL:** `https://pokeapi.co/api/v2`

All pokemon data is fetched from this official, free API. No authentication required.

## 🚦 Loading Status

The app displays a status bar during data loading showing what's currently being fetched. This provides visual feedback during the initial pokemon load.

## ⚡ Performance Optimizations

- Lazy loading of sprites
- Memoized components
- Efficient filtering
- Axios timeout configuration (10s)
- Sprite CDN caching

## 🔄 State Management

The app uses React's built-in `useState` and `useCallback` hooks for state management. This provides a clean, lightweight solution without external redux complexity.

## 🎨 Color Theme

The application uses a modern dark theme with accent colors:
- **Primary Red:** #e63946
- **Orange Accent:** #f4a261
- **Background:** #07070f
- **Surface:** #0d0d1c
- **Text:** #dde0f0

Each pokemon type has its own unique color for visual distinction.

## 📝 Notes

- First load will take time as all 1025 pokemon are fetched
- Subsequent searches and navigation are instant
- Mobile responsive design adjusts grid columns for smaller screens
- Audio might require user interaction on some browsers (autoplay restrictions)

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements!

## 📜 License

Open source - Pokemon intellectual property belongs to The Pokémon Company International

---

**Enjoy exploring the Pokédex!** 🎮✨
