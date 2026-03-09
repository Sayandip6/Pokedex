# Quick Reference Guide

## 📂 File Structure Explained

### Root Files
- `package.json` - Project metadata and dependencies
- `vite.config.js` - Vite build configuration
- `index.html` - HTML entry point for the app
- `.gitignore` - Git ignore rules

### `/src` Directory

#### **App.jsx**
Main component that orchestrates:
- Landing vs App phase management
- Pokemon list loading
- Search and filter logic
- Modal state management
- Keyboard navigation

#### **main.jsx**
React app initialization and DOM mounting point

#### `/components` - Reusable UI Components

| Component | Purpose |
|-----------|---------|
| **Header.jsx** | Top navigation, search, filters, count |
| **PokemonCard.jsx** | Individual pokemon display box |
| **PokemonGrid.jsx** | Grid layout container for cards |
| **PokemonModal.jsx** | Full detail view modal |
| **Landing.jsx** | Welcome/intro screen |

Each component has a corresponding `.css` file with scoped styles.

#### `/services` - API Layer

**pokeApi.js** - Centralized API calls using axios
- All PokeAPI endpoints
- Base URL configuration
- Error handling
- Response parsing

#### `/utils` - Helper Functions

**helpers.js** - Utility functions including:
- `padId()` - Format pokemon IDs
- `getSpriteUrl()` - Get sprite image URLs
- `getCryUrl()` - Get cry audio URLs
- `getTypeColor()` - Color mapping for types
- `getGenerationById()` - Generation lookup
- Generation ranges constants
- Data formatting functions

#### `/styles` - Global Styles

**index.css** - Application-wide styling:
- CSS variables (colors, sizes)
- Responsive design
- Typography
- Animations
- Scrollbar customization

### `/public` Directory
Static assets folder (currently empty, but available for images, fonts, etc.)

## 🔄 Data Flow

```
App.jsx (State Management)
    ↓
Header (User Input)
    ↓
pokeApi.js (API Service)
    ↓
PokeAPI (External API)
    ↓
[Filtered List] → PokemonGrid & PokemonCard
                ↓
            [Click] → PokemonModal
```

## 🎯 Key Functions

### `loadAllPokemon()`
- Fetches all 1025 pokemon from API
- Displays loading status
- Stores in state

### Filter Logic
```javascript
if (filterType === 'name') // Filter by pokemon name
if (filterType === 'id') // Filter by pokemon ID
if (filterType === 'type') // Filter by pokemon type
if (filterType === 'ability') // Filter by pokemon ability
```

### Navigation in Modal
- Next/Previous buttons
- Arrow key support
- Disabled states when at boundary

## 🎨 CSS Architecture

Each component has its own CSS file following BEM-like naming:
- `.pokemon-card` - Card container
- `.card-image` - Image element
- `.card-types` - Types container
- etc.

Global variables in `:root`:
```css
--bg: #07070f;
--surf: #0d0d1c;
--red: #e63946;
--text: #dde0f0;
```

## 🚀 Common Tasks

### Add a New Component
1. Create `ComponentName.jsx` in `/src/components`
2. Create `ComponentName.css` in same folder
3. Import and use in parent component

### Add a New API Endpoint
1. Add method to `src/services/pokeApi.js`
2. Use in components via `pokemonAPI.methodName()`

### Modify Styling
- Global: Edit `src/styles/index.css`
- Component-specific: Edit corresponding `.css` file

### Add New Utility Function
1. Add to `src/utils/helpers.js`
2. Import where needed: `import { functionName } from '../utils/helpers'`

## 📊 API Endpoints Used

Main endpoints in use:
- `/pokemon` - List of all pokemon with pagination
- `/pokemon/{id}` - Specific pokemon details
- Data includes: stats, abilities, moves, sprites, types

## 🔍 Search Implementation

The search feature supports 4 types of queries:
1. **Name** - Case-insensitive substring match
2. **ID** - Numeric ID search
3. **Type** - Pokemon type filtering
4. **Ability** - Pokemon ability filtering

Results update in real-time as you type.

## 📱 Responsive Breakpoints

- Desktop: Full grid layout
- Tablet (768px): Adjusted spacing
- Mobile (480px): Stacked layout, smaller grid

## ⚙️ Configuration

### Vite Config (vite.config.js)
```javascript
- Port: 3000
- Auto-open on dev start
- React plugin enabled
```

### Package.json Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Debugging Tips

1. **Check browser console** for API errors
2. **Network tab** to see API requests
3. **React DevTools** to inspect component state
4. Status bar shows loading progress

## 📌 Important Notes

- All 1025 pokemon load on first app launch
- Search filters happen client-side (no additional API calls)
- Sprites load from GitHub CDN (always available)
- Audio files load from official PokeAPI CDN
- Generation grouping uses hardcoded ranges (see `helpers.js`)

---

Happy coding! 🚀
